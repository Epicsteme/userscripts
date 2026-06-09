// ==UserScript==
// @name 			Reddit AntiDuplicate Content
// @namespace 		https://github.com/BD9Max
// @version 		2.7.3
// @description 	Removes duplicate Reddit posts from feeds and pages by hashing images and comparing URLs. Uses fast Haar Wavelet image hashes compared in BK-Trees. For Reddit/Shreddit.
// @icon 			https://i.postimg.cc/KzpDZqFY/Reddit-Anti-Dup-Icon-64.png
// @author 			krbd9max
// @match 			*://redlib.catsarch.com/*
// @grant 			none
// @run-at 			document-end
// @license 		MIT
// @downloadURL https://update.greasyfork.org/scripts/581301/Reddit%20AntiDuplicate%20Content.user.js
// @updateURL https://update.greasyfork.org/scripts/581301/Reddit%20AntiDuplicate%20Content.meta.js
// ==/UserScript==

(function() {
    'use strict';

    // Configuration
    const HAMMING_THRESHOLD = 3; // Bit difference tolerance for image similarities

    // --- BK-TREE DATA STRUCTURE FOR FAST HAMMING DISTANCE LOOKUPS ---
    class BKNode {
        constructor(hash, postId) {
            this.hash = hash;
            this.postIds = [postId];
            this.children = {}; // distance -> BKNode
        }
    }

    class BKTree {
        constructor() {
            this.root = null;
        }

        // Compute Hamming Distance between two 64-bit BigInt hashes
        static hammingDistance(h1, h2) {
            let xor = h1 ^ h2;
            let count = 0;
            while (xor > 0n) {
                if (xor & 1n) count++;
                xor >>= 1n;
            }
            return count;
        }

        add(hash, postId) {
            if (!this.root) {
                this.root = new BKNode(hash, postId);
                return null;
            }

            let curr = this.root;
            while (true) {
                const dist = BKTree.hammingDistance(curr.hash, hash);
                if (dist === 0) {
                    curr.postIds.push(postId);
                    return curr.postIds[0];
                }

                if (curr.children[dist]) {
                    curr = curr.children[dist];
                } else {
                    curr.children[dist] = new BKNode(hash, postId);
                    return null;
                }
            }
        }

        search(hash, maxDist, node = this.root, results = []) {
            if (!node) return results;
            const dist = BKTree.hammingDistance(node.hash, hash);

            if (dist <= maxDist) {
                results.push({ node, dist });
            }

            const minDist = dist - maxDist;
            const highDist = dist + maxDist;

            for (let d in node.children) {
                const numericD = parseInt(d, 10);
                if (numericD >= minDist && numericD <= highDist) {
                    this.search(hash, maxDist, node.children[numericD], results);
                }
            }
            return results;
        }
    }

    // --- 2D HAAR WAVELET IMAGE HASH (32x32 -> 8x8 DWT) WITH CORS BYPASS ---
    function computeWaveletHash(imgSrc) {
        return new Promise((resolve) => {
            const img = new Image();
            // Crucial fix: Reddit media endpoints support CORS, but canvas requires explicit anonymous flagging
            img.crossOrigin = 'anonymous';
            img.src = imgSrc;

            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = 32;
                canvas.height = 32;

                ctx.drawImage(img, 0, 0, 32, 32);
                let imgData;
                try {
                    imgData = ctx.getImageData(0, 0, 32, 32).data;
                } catch (e) {
                    resolve(null); // Bypass structural taint exceptions safely
                    return;
                }

                const data = new Float32Array(32 * 32);
                for (let i = 0; i < 1024; i++) {
                    const r = imgData[i * 4];
                    const g = imgData[i * 4 + 1];
                    const b = imgData[i * 4 + 2];
                    data[i] = 0.299 * r + 0.587 * g + 0.114 * b; // Luminance
                }

                // 1D Haar transform helper
                function haar1D(rowOrCol) {
                    const temp = new Float32Array(32);
                    const h = rowOrCol.length / 2;
                    for (let i = 0; i < h; i++) {
                        temp[i] = (rowOrCol[2 * i] + rowOrCol[2 * i + 1]) / Math.SQRT2;
                        temp[h + i] = (rowOrCol[2 * i] - rowOrCol[2 * i + 1]) / Math.SQRT2;
                    }
                    rowOrCol.set(temp);
                }

                // 2D Discrete Wavelet Transform
                for (let y = 0; y < 32; y++) {
                    const row = data.subarray(y * 32, (y + 1) * 32);
                    haar1D(row);
                }
                for (let x = 0; x < 32; x++) {
                    const col = new Float32Array(32);
                    for (let y = 0; y < 32; y++) col[y] = data[y * 32 + x];
                    haar1D(col);
                    for (let y = 0; y < 32; y++) data[y * 32 + x] = col[y];
                }

                // Extract top-left 8x8 coefficients excluding DC component
                const coefficients = [];
                for (let y = 0; y < 8; y++) {
                    for (let x = 0; x < 8; x++) {
                        if (y === 0 && x === 0) continue;
                        coefficients.push(data[y * 32 + x]);
                    }
                }

                const sorted = [...coefficients].sort((a, b) => a - b);
                const median = sorted[Math.floor(sorted.length / 2)];

                let hash = 0n;
                for (let i = 0; i < 63; i++) {
                    if (coefficients[i] > median) {
                        hash |= (1n << BigInt(i));
                    }
                }
                resolve(hash);
            };
            img.onerror = () => resolve(null);
        });
    }

    // --- TRACKING & ANTIDUPLICATION DATA LABELS ---
    const seenUrls = new Map();
    const imageTree = new BKTree();
    const processedPostIds = new Set();
    const antidupCounts = new Map(); // tracks running totals for targeted elements

    function cleanUrl(urlStr) {
        try {
            const url = new URL(urlStr, window.location.origin);
            return url.origin + url.pathname.replace(/\/$/, "");
        } catch (e) {
            return urlStr;
        }
    }

    // Comprehensive extraction mapped directly to Shreddit web component specifications
    function getPostDetails(post) {
        const id = post.getAttribute('id') || post.getAttribute('post-id') || post.getAttribute('permalink') || post.id;

        // Target Title Text and Title Container Dom Object
        let titleText = post.getAttribute('post-title');
        let titleEl = post.querySelector('a[id^="post-title-"]') || post.querySelector('[data-adclicklocation="title"]') || post.querySelector('h3');
        if (!titleText && titleEl) titleText = titleEl.innerText;

        // Target Action/Content URL Link
        let url = post.getAttribute('content-href') || post.getAttribute('permalink');
        if (!url && titleEl) url = titleEl.href;

        // Isolate primary image asset inside content sections while stripping user avatars
        let imgEl = null;
        const imgs = post.querySelectorAll('img');
        for (let img of imgs) {
            const src = img.src || '';
            if (src.includes('/avatar/') || src.includes('user_icon') || img.closest('faceplate-tracker[source="post_credit_bar"]')) {
                continue;
            }
            if (src.includes('preview.redd.it') || src.includes('i.redd.it') || src.includes('external-preview') || img.getAttribute('slot') === 'thumbnail' || img.width > 100) {
                imgEl = img;
                break;
            }
        }

        return { id, titleText, titleEl, url, imgEl };
    }

    function addNotice(titleEl, count) {
        let notice = titleEl.parentElement.querySelector('.antidup-notice');
        if (!notice) {
            notice = document.createElement('span');
            notice.className = 'antidup-notice';
            notice.style.cssText = `
                margin-left: 8px;
                padding: 2px 5px;
                background-color: #305050;
                color: #ffffff;
                border-radius: 3px;
                font-size: 10px;
                font-weight: bold;
                display: inline-block;
                vertical-align: middle;
            `;
            titleEl.after(notice);
        }
        notice.innerText = `[AntiDuplicated: ${count} item(s)]`;
    }

    function incrementDuplicateCount(originalPostId) {
        const total = (antidupCounts.get(originalPostId) || 0) + 1;
        antidupCounts.set(originalPostId, total);

        // Find parent instance to display count increments dynamically
        const targets = document.querySelectorAll('shreddit-post, article, [data-testid="post-container"], .Post');
        const originalPost = Array.from(targets).find(p => getPostDetails(p).id === originalPostId);
        if (originalPost) {
            const details = getPostDetails(originalPost);
            if (details.titleEl) {
                addNotice(details.titleEl, total);
            }
        }
    }

    function processPosts() {
        // Intercepts all modern Reddit components down feeds, subreddits, and user profiles
        const posts = document.querySelectorAll('shreddit-post, article, [data-testid="post-container"], .Post');

        posts.forEach(post => {
            const details = getPostDetails(post);
            if (!details.id || processedPostIds.has(details.id)) return;

            let isDuplicate = false;

            // 1. Exact Outbound or Thread URL Antiduplication
            if (details.url) {
                const cleanedUrl = cleanUrl(details.url);
                if (seenUrls.has(cleanedUrl)) {
                    const originalPostId = seenUrls.get(cleanedUrl);
                    incrementDuplicateCount(originalPostId);
                    post.style.setProperty('display', 'none', 'important');
                    isDuplicate = true;
                } else {
                    seenUrls.set(cleanedUrl, details.id);
                }
            }

            // 2. Wavelet Image Hashing (Evaluates when URLs vary but media matches)
            if (!isDuplicate && details.imgEl && details.imgEl.src) {
                processedPostIds.add(details.id); // Flag to halt concurrent async checks

                computeWaveletHash(details.imgEl.src).then(hash => {
                    if (hash === null) return;

                    const matches = imageTree.search(hash, HAMMING_THRESHOLD);
                    if (matches.length > 0) {
                        const originalPostId = matches[0].node.postIds[0];
                        incrementDuplicateCount(originalPostId);
                        post.style.setProperty('display', 'none', 'important');
                    } else {
                        imageTree.add(hash, details.id);
                    }
                });
                return;
            }

            processedPostIds.add(details.id);
        });
    }

    // Dynamic Mutation Observer updates automatically on scrolling loads
    const observer = new MutationObserver(() => {
        processPosts();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // Initial load execution
    processPosts();
})();
    // ==UserScript==
// @name         Libreddit Subreddit Hider
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Hide posts from specific subreddits on multiple Libreddit/Redlib instances (exact match domains only)
// @author       ChatMonkey
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // ===== CONFIGURATION =====
    const libredditInstances = [
        'redlib.perennialte.ch',
        'libreddit.perennialte.ch',
        'rl.bloat.cat',
        'l.opnxng.com',
	'redlib.catsarch.com'
        // Add more instance domains here (exact hostnames)
    ];

    const blockedSubreddits = [
        'meirl',
        'mildlyinfuriating',
        'guysbeingdudes',
        'tiktokcringe',
        'cringetiktoks',
        'sipstea',
        'tattooadvice',
        'stupidfood',
        'antimeme',
        'whenthe',
        'whatcouldgowrong',
        'losercity'
        // Add more subreddits here, lowercase
    ];

   // Only run on configured domains
    const currentDomain = window.location.hostname;
    if (!libredditInstances.includes(currentDomain)) {
        console.log("[SubHider] Not running on:", currentDomain);
        return;
    }

    function hideBlockedPosts() {
        const posts = document.querySelectorAll(".post");
        posts.forEach(post => {
            const subredditLink = post.querySelector('a[href^="/r/"]');
            if (subredditLink) {
                const subName = subredditLink.href.split("/r/")[1].split("/")[0].toLowerCase();
                if (blockedSubreddits.includes(subName)) {
                    // Hide the post
                    post.style.display = "none";
                    console.log(`[SubHider] Hiding post from r/${subName}`);
                }
            }
        });
    }

    // Observe for new posts being added (scrolling, SPA navigation)
    const observer = new MutationObserver(hideBlockedPosts);
    observer.observe(document.body, { childList: true, subtree: true });

    // Initial run
    hideBlockedPosts();
})();
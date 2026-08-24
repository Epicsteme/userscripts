// ==UserScript==
// @name         Force Libreddit Video Width to 300px
// @namespace    Violentmonkey Scripts
// @version      1.0
// @description  Makes all post videos 800px wide.
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    function resizeVideos() {
        document.querySelectorAll('.post_media_content video').forEach(video => {
            video.width = 300;
            video.removeAttribute('height');

            video.style.width = '300px';
            video.style.maxWidth = '300px';
            video.style.height = 'auto';
        });
    }

    // Initial run
    resizeVideos();

    // Watch for dynamically added posts
    const observer = new MutationObserver(() => {
        resizeVideos();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
})();
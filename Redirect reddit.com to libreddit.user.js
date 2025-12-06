// ==UserScript==
// @name         Redirect reddit.com to libreddit
// @namespace    Violentmonkey Scripts
// @version      1.0
// @description  Redirect reddit.com to libreddit while keeping path and query intact
// @author       ChatMonkey
// @match        https://www.reddit.com/*
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    // Replace domain only, keep everything else (path, query, hash)
    const newUrl = location.href.replace(/^https:\/\/www\.reddit\.com/, "https://redlib.catsarch.com");

    if (location.href !== newUrl) {
        location.replace(newUrl);
    }
})();

// ==UserScript==
// @name         Redirect old.reddit.com to rl.bloat.cat
// @namespace    Violentmonkey Scripts
// @version      1.0
// @description  Redirect old.reddit.com to rl.bloat.cat while keeping path and query intact
// @author       ChatMonkey
// @match        https://old.reddit.com/*
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    // Replace domain only, keep everything else (path, query, hash)
    const newUrl = location.href.replace(/^https:\/\/old\.reddit\.com/, "https://redlib.perennialte.ch");

    if (location.href !== newUrl) {
        location.replace(newUrl);
    }
})();

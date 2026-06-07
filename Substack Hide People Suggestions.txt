// ==UserScript==
// @name         Substack Hide People Suggestions
// @namespace    http://tampermonkey.net/
// @version      1.0
// @author       Chatviro
// @match        https://substack.com/*
// @match        https://*.substack.com/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    function removeSuggestions() {
        document.querySelectorAll('[role="article"]').forEach(article => {
            if (
                article.textContent.includes('Suggestions') &&
                article.textContent.includes('Follow')
            ) {
                article.remove();
            }
        });
    }

    removeSuggestions();

    new MutationObserver(removeSuggestions).observe(document.body, {
        childList: true,
        subtree: true
    });
})();
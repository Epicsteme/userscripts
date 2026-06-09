// ==UserScript==
// @name         Substack Hide New Bestsellers
// @author       Chatviro
// @match        https://substack.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function hideSection() {
        document.querySelectorAll('div').forEach(el => {

            if (el.textContent.trim() === 'New Bestsellers') {

                const card = el.closest(
                    'div[class*="bg-primary"]'
                );

                if (card) {
                    card.style.display = 'none';
                }
            }
        });
    }

    hideSection();

    new MutationObserver(hideSection)
        .observe(document.body, {
            childList: true,
            subtree: true
        });
})();
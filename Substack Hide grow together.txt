// ==UserScript==
// @name         Substack Hide "grow together"
// @namespace    substack
// @version      1.0
// @author       Chatviro
// @match        https://substack.com/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    function processNotes() {

        document
            .querySelectorAll('.FeedProseMirror')
            .forEach(noteText => {

                if (noteText.dataset.growTogetherProcessed) {
                    return;
                }

                noteText.dataset.growTogetherProcessed = '1';

                const text =
                    noteText.innerText.toLowerCase();

                if (!text.includes('grow together')) {
                    return;
                }

                const note =
                    noteText.closest('[class*="feedUnit"]');

                if (note) {
                    note.style.display = 'none';
                }
            });
    }

    processNotes();

    new MutationObserver(processNotes)
        .observe(document.body, {
            childList: true,
            subtree: true
        });

})();
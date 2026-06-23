// ==UserScript==
// @name         Substack Hide Notes By Keywords
// @namespace    substack
// @version      1.1
// @author       Chatviro
// @match        https://substack.com/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const BLOCKED_WORDS = [
        'connect',
        'grow together'
    ];

    function processNotes() {
        document
            .querySelectorAll('.FeedProseMirror')
            .forEach(noteText => {

                if (noteText.dataset.keywordProcessed) {
                    return;
                }

                noteText.dataset.keywordProcessed = '1';

                const text = noteText.innerText.toLowerCase();

                const containsBlockedWord =
                    BLOCKED_WORDS.some(word =>
                        text.includes(word.toLowerCase())
                    );

                if (!containsBlockedWord) {
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
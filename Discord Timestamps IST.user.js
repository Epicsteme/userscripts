// ==UserScript==
// @name         Discord Timestamps IST
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Converts Discord timestamps to IST and allows font size adjustment
// @author       ChatMonkey
// @match        https://discord.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // ===== CONFIGURATION =====
    const TIMESTAMP_FONT_SIZE = '14px'; // Change this to adjust font size

    // Convert UTC timestamp to IST string
    function convertToIST(utcDateStr) {
        const utcDate = new Date(utcDateStr);
        const istOffset = 5.5 * 60; // IST offset in minutes
        const istDate = new Date(utcDate.getTime() + istOffset * 60 * 1000);

        const day = String(istDate.getDate()).padStart(2, '0');
        const month = String(istDate.getMonth() + 1).padStart(2, '0');
        const year = istDate.getFullYear();
        const hours = String(istDate.getHours()).padStart(2, '0');
        const minutes = String(istDate.getMinutes()).padStart(2, '0');
        const seconds = String(istDate.getSeconds()).padStart(2, '0');

        return `${hours}:${minutes}:${seconds} IST ${day}-${month}-${year}`;
    }

    function updateTimestamps() {
        const timeElements = document.querySelectorAll('time');
        timeElements.forEach(timeEl => {
            const utcStr = timeEl.getAttribute('datetime');
            if (utcStr && !timeEl.dataset.istUpdated) {
                timeEl.textContent = convertToIST(utcStr);
                timeEl.dataset.istUpdated = 'true';
                timeEl.style.fontSize = TIMESTAMP_FONT_SIZE; // Apply font size
            }
        });
    }

    // Observe dynamic changes because Discord is SPA
    const observer = new MutationObserver(updateTimestamps);
    observer.observe(document.body, { childList: true, subtree: true });

    // Initial update
    updateTimestamps();
})();

// ==UserScript==
// @name         ChatGPT Add Timestamps IST
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Adds IST date+time timestamps to user messages and keeps them persistent across refresh
// @author       ChatMonkey
// @match        https://chatgpt.com/*
// @grant        none
// ==/UserScript==

(function () {
    "use strict";

    function getISTTimestamp() {
        const now = new Date();
        const utc = now.getTime() + now.getTimezoneOffset() * 60000;
        const istTime = new Date(utc + 5.5 * 60 * 60 * 1000);

        const day = istTime.getDate();
        const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
        const month = monthNames[istTime.getMonth()];
        const year = istTime.getFullYear();
        const hours = istTime.getHours().toString().padStart(2, "0");
        const minutes = istTime.getMinutes().toString().padStart(2, "0");

        return `[${day}-${month}-${year} ${hours}:${minutes}]`;
    }

    function addTimestamp(node) {
    if (!node || node.dataset.timestamped) return;

    const msgId = node.getAttribute("data-message-id") || node.innerText.slice(0,50);
    if (!msgId) return;

    // Load from storage
    let ts = localStorage.getItem("chat_timestamp_" + msgId);

    // If not stored, create and store
    if (!ts) {
        ts = getISTTimestamp();
        localStorage.setItem("chat_timestamp_" + msgId, ts);
    }

    node.dataset.timestamped = "true";

    const textEl = node.querySelector("p, div");
    if (textEl && textEl.textContent.trim().length > 0 && !textEl.textContent.startsWith("[")) {
        // Wrap timestamp in a grey span
        const timestampSpan = document.createElement("span");
        timestampSpan.textContent = ts + " ";
        timestampSpan.style.color = "grey"; // grey color
        textEl.prepend(timestampSpan);
    }
}

    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (!(node instanceof HTMLElement)) return;

                if (node.matches?.('div[data-message-author-role="user"]')) {
                    addTimestamp(node);
                }

                node.querySelectorAll?.('div[data-message-author-role="user"]').forEach(addTimestamp);
            });
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
    });
})();

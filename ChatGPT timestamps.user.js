// ==UserScript==
// @name         ChatGPT Add Local Timestamps
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Adds local date+time timestamps to user messages and keeps them persistent across refresh
// @author       ChatMonkey
// @match        https://chatgpt.com/*
// @grant        none
// ==/UserScript==

(function () {
    "use strict";

    function getLocalTimestamp() {
        const now = new Date();

        const day = now.getDate();
        const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
        const month = monthNames[now.getMonth()];
        const year = now.getFullYear();
        const hours = now.getHours().toString().padStart(2, "0");
        const minutes = now.getMinutes().toString().padStart(2, "0");

        return `[${day}-${month}-${year} ${hours}:${minutes}]`;
    }

    function addTimestamp(node) {
        if (!node || node.dataset.timestamped) return;

        const msgId = node.getAttribute("data-message-id") || node.innerText.slice(0, 50);
        if (!msgId) return;

        // Load existing timestamp
        let ts = localStorage.getItem("chat_timestamp_" + msgId);

        // Create and store if missing
        if (!ts) {
            ts = getLocalTimestamp();
            localStorage.setItem("chat_timestamp_" + msgId, ts);
        }

        node.dataset.timestamped = "true";

        const textEl = node.querySelector("p, div");
        if (textEl && textEl.textContent.trim().length > 0 && !textEl.textContent.startsWith("[")) {
            const timestampSpan = document.createElement("span");
            timestampSpan.textContent = ts + " ";
            timestampSpan.style.color = "grey";
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

// ==UserScript==
// @name         YouTube Download Button
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Adds a floating download button on YouTube video pages
// @author       ChatMonkey
// @match        https://www.youtube.com/watch*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function addDownloadButton() {
        if (document.getElementById('custom-download-btn')) return;

        const btn = document.createElement('a');
        btn.id = 'custom-download-btn';
        btn.innerText = 'Download Video';
        btn.style.position = 'fixed'; // fixed to viewport
        btn.style.bottom = '20px';
        btn.style.right = '20px';
        btn.style.padding = '10px 15px';
        btn.style.backgroundColor = '#ff0000';
        btn.style.color = '#fff';
        btn.style.fontWeight = 'bold';
        btn.style.borderRadius = '4px';
        btn.style.zIndex = 10000;
        btn.style.textDecoration = 'none';
        btn.style.fontSize = '14px'
        btn.style.opacity = '1';
        //btn.style.opacity = '0.2';
        //btn.style.transition = 'opacity 0.3s';

        // Hover effect
        //btn.addEventListener('mouseenter', () => btn.style.opacity = '1');
        //btn.addEventListener('mouseleave', () => btn.style.opacity = '0.2');

        // Link to third-party downloader
        const videoId = new URLSearchParams(window.location.search).get('v');
        if (videoId) {
            btn.href = `https://www.y2mate.com/youtube/${videoId}`;
            btn.target = '_blank';
        }

        document.body.appendChild(btn);
    }

    // Detect navigation in YouTube SPA
    window.addEventListener('yt-navigate-finish', addDownloadButton);
    addDownloadButton();
})();

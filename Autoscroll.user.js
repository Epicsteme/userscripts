// ==UserScript==
// @name         AutoScroll Controller
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Automatically scroll up and down with speed control
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    let scrollSpeed = 1; // pixels per frame
    let direction = 1;   // 1 = down, -1 = up
    let scrolling = false;

    // UI for manual control
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.top = '10px';
    container.style.right = '10px';
    container.style.background = 'rgba(0,0,0,0.6)';
    container.style.color = '#fff';
    container.style.padding = '10px';
    container.style.zIndex = '9999';
    container.style.fontFamily = 'sans-serif';
    container.style.borderRadius = '5px';
    container.innerHTML = `
        <button id="toggleScroll">Start</button><br><br>
        Speed: <input type="range" id="speedControl" min="1" max="20" value="${scrollSpeed}"><br>
        Direction: 
        <select id="directionControl">
            <option value="1">Down</option>
            <option value="-1">Up</option>
        </select>
    `;
    document.body.appendChild(container);

    const toggleBtn = document.getElementById('toggleScroll');
    const speedInput = document.getElementById('speedControl');
    const directionInput = document.getElementById('directionControl');

    toggleBtn.addEventListener('click', () => {
        scrolling = !scrolling;
        toggleBtn.textContent = scrolling ? 'Stop' : 'Start';
    });

    speedInput.addEventListener('input', () => {
        scrollSpeed = parseInt(speedInput.value);
    });

    directionInput.addEventListener('change', () => {
        direction = parseInt(directionInput.value);
    });

    function scrollStep() {
        if (scrolling) {
            window.scrollBy(0, scrollSpeed * direction);
        }
        requestAnimationFrame(scrollStep);
    }

    scrollStep();
})();
// ==UserScript==
// @name         AutoScroll Controller (Time-Based)
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  Smooth autoscroll with precise speed control (px/sec)
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    let speedPxPerSecond = 30; // can go very low (e.g. 1, 0.5)
    let direction = 1; // 1 = down, -1 = up
    let scrolling = false;

    let lastTime = performance.now();

    // ===== UI =====
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.top = '10px';
    container.style.right = '10px';
    container.style.background = 'rgba(0,0,0,0.6)';
    container.style.color = '#fff';
    container.style.padding = '10px';
    container.style.zIndex = '9999';
    container.style.fontFamily = 'sans-serif';
    container.style.borderRadius = '6px';
    container.style.fontSize = '14px';

    container.innerHTML = `
        <button id="toggleScroll">Start</button><br><br>

        Speed (px/sec):<br>
        <input type="range" id="speedControl" min="1" max="200" step="1" value="${speedPxPerSecond}">
        <span id="speedValue">${speedPxPerSecond}</span><br><br>

        Direction:<br>
        <select id="directionControl">
            <option value="1">Down</option>
            <option value="-1">Up</option>
        </select>
    `;

    document.body.appendChild(container);

    const toggleBtn = document.getElementById('toggleScroll');
    const speedInput = document.getElementById('speedControl');
    const speedValue = document.getElementById('speedValue');
    const directionInput = document.getElementById('directionControl');

    // ===== Controls =====
    toggleBtn.addEventListener('click', () => {
        scrolling = !scrolling;
        toggleBtn.textContent = scrolling ? 'Stop' : 'Start';
    });

    speedInput.addEventListener('input', () => {
        speedPxPerSecond = parseFloat(speedInput.value);
        speedValue.textContent = speedPxPerSecond;
    });

    directionInput.addEventListener('change', () => {
        direction = parseInt(directionInput.value);
    });

    // ===== Scrolling Loop (time-based) =====
    function scrollStep(now) {
        const deltaTime = (now - lastTime) / 1000; // seconds

        if (scrolling) {
            const distance = speedPxPerSecond * deltaTime * direction;
            window.scrollBy(0, distance);
        }

        lastTime = now;
        requestAnimationFrame(scrollStep);
    }

    requestAnimationFrame(scrollStep);

})();
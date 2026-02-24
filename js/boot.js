/* ============================================================
   BOOT SEQUENCE
   Terminal-style initialization animation
   ============================================================ */

(function () {
    'use strict';

    const lines = [
        { text: '> Initializing Adaptive Threat Environment...', delay: 0 },
        { text: '> Scanning interaction capabilities... <span class="safe">OK</span>', delay: 400 },
        { text: '> Loading operator profile... <span class="accent">Hrisheekesh PV</span>', delay: 700 },
        { text: '> Threat assessment: <span class="safe">NOMINAL</span>', delay: 1000 },
        { text: '> Environment ready. <span class="accent">Observing.</span>', delay: 1400 },
    ];

    function init() {
        const screen = document.getElementById('boot-screen');
        if (!screen) return;

        // Check if user has visited recently (skip boot for returning visitors)
        const lastVisit = sessionStorage.getItem('ate_visited');
        if (lastVisit) {
            screen.classList.add('dismissed');
            return;
        }

        const terminal = screen.querySelector('.boot__terminal');
        if (!terminal) return;

        // Create line elements
        const lineEls = lines.map((line, i) => {
            const el = document.createElement('div');
            el.className = 'boot__line';
            el.innerHTML = line.text;
            if (i === lines.length - 1) {
                el.innerHTML += ' <span class="boot__cursor"></span>';
            }
            terminal.appendChild(el);
            return { el, delay: line.delay };
        });

        // Animate lines
        lineEls.forEach(({ el, delay }) => {
            setTimeout(() => {
                el.classList.add('boot__line--visible');
            }, delay);
        });

        // Dismiss after sequence
        const totalTime = lines[lines.length - 1].delay + 1000;
        setTimeout(() => {
            screen.classList.add('dismissed');
            sessionStorage.setItem('ate_visited', Date.now().toString());

            // Trigger reveal animations
            setTimeout(() => {
                document.querySelectorAll('.reveal').forEach((el, i) => {
                    setTimeout(() => el.classList.add('visible'), i * 80);
                });
            }, 300);
        }, totalTime);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

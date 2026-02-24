/* ============================================================
   ADAPTIVE UI CONTROLLER
   Reads profiler state, toggles layer visibility, handles
   "View Internals" clicks and scroll-reveal animations
   ============================================================ */

(function () {
    'use strict';

    // --- View Internals toggle ---
    function initInternalsButtons() {
        document.querySelectorAll('.btn-internals').forEach(btn => {
            btn.addEventListener('click', () => {
                const project = btn.closest('.project');
                if (!project) return;
                const depth = project.querySelector('.project__depth');
                if (!depth) return;

                const isRevealed = depth.classList.toggle('revealed');
                btn.classList.toggle('btn-internals--active', isRevealed);
                btn.textContent = isRevealed ? '[ Close Internals ]' : '[ View Internals ]';

                // Bump interaction count for profiler
                if (window.THREAT_ENV?.profiler) {
                    const state = window.THREAT_ENV.profiler.getState();
                    if (state) state.interactionCount += 3;
                }
            });
        });
    }

    // --- Scroll Reveal (IntersectionObserver) ---
    function initRevealObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -40px 0px'
        });

        // Observe after boot dismissal
        setTimeout(() => {
            document.querySelectorAll('.reveal').forEach(el => {
                if (!el.classList.contains('visible')) {
                    observer.observe(el);
                }
            });
        }, 500);
    }

    // --- HUD Active Section Tracking ---
    function initActiveNav() {
        const links = document.querySelectorAll('.hud__link[href^="#"]');
        const sections = document.querySelectorAll('.section[id]');

        if (!links.length || !sections.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.id;
                    links.forEach(link => {
                        link.classList.toggle('hud__link--active',
                            link.getAttribute('href') === `#${id}`);
                    });
                }
            });
        }, {
            threshold: 0.3,
            rootMargin: '-80px 0px -40% 0px'
        });

        sections.forEach(s => observer.observe(s));
    }

    // --- HUD Mobile Toggle ---
    function initMobileNav() {
        const toggle = document.querySelector('.hud__toggle');
        const nav = document.querySelector('.hud__nav');
        if (!toggle || !nav) return;

        toggle.addEventListener('click', () => {
            nav.classList.toggle('open');
            toggle.textContent = nav.classList.contains('open') ? '[ Close ]' : '[ Menu ]';
        });

        // Close on link click
        nav.querySelectorAll('.hud__link').forEach(link => {
            link.addEventListener('click', () => {
                nav.classList.remove('open');
                toggle.textContent = '[ Menu ]';
            });
        });
    }

    // --- Profile Change Handler ---
    function initProfileListener() {
        document.addEventListener('profileChange', (e) => {
            const profile = e.detail.profile;

            // Auto-reveal depth for readers
            if (profile === 'reader') {
                document.querySelectorAll('.project__depth').forEach(depth => {
                    depth.classList.add('revealed');
                });
                document.querySelectorAll('.btn-internals').forEach(btn => {
                    btn.classList.add('btn-internals--active');
                    btn.textContent = '[ Close Internals ]';
                });
            }
        });
    }

    // --- Uptime Counter ---
    function initUptime() {
        const el = document.getElementById('uptime');
        if (!el) return;
        const start = Date.now();

        setInterval(() => {
            const s = Math.floor((Date.now() - start) / 1000);
            const m = Math.floor(s / 60);
            const sec = s % 60;
            el.textContent = `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
        }, 1000);
    }

    // --- Smooth scroll for anchor links ---
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', (e) => {
                const target = document.querySelector(link.getAttribute('href'));
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
    }

    // --- Init All ---
    function init() {
        initInternalsButtons();
        initRevealObserver();
        initActiveNav();
        initMobileNav();
        initProfileListener();
        initUptime();
        initSmoothScroll();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

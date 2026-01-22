// js/observer.js — Intersection Observer for panel animations
'use strict';

const PanelObserver = (() => {
  const init = () => {
    const panels = document.querySelectorAll('.panel');

    if (!panels.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    panels.forEach((panel) => observer.observe(panel));
  };

  return { init };
})();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', PanelObserver.init);
} else {
  PanelObserver.init();
}

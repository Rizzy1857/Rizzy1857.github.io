// js/state.js — System mode management
'use strict';

const State = (() => {
  const IDLE_TIMEOUT = 3000; // Return to idle after 3s of inactivity
  let idleTimer = null;
  let currentMode = 'idle';

  const setMode = (mode) => {
    if (currentMode === mode) return;
    currentMode = mode;
    document.documentElement.dataset.mode = mode;
  };

  const resetIdleTimer = () => {
    clearTimeout(idleTimer);
    if (currentMode !== 'active') {
      setMode('active');
    }
    idleTimer = setTimeout(() => setMode('idle'), IDLE_TIMEOUT);
  };

  // Debounce rapid events
  let ticking = false;
  const handleActivity = () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        resetIdleTimer();
        ticking = false;
      });
      ticking = true;
    }
  };

  // Initialize
  const init = () => {
    window.addEventListener('mousemove', handleActivity, { passive: true });
    window.addEventListener('scroll', handleActivity, { passive: true });
    window.addEventListener('keydown', handleActivity, { passive: true });
    window.addEventListener('touchstart', handleActivity, { passive: true });
  };

  return { init, setMode };
})();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', State.init);
} else {
  State.init();
}

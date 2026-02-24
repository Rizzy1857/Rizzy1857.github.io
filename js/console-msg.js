/* ============================================================
   CONSOLE MESSAGES — DevTools Easter Eggs
   ============================================================ */

(function () {
    'use strict';

    const style = 'color: #3b82f6; font-family: monospace; font-size: 13px;';
    const styleDim = 'color: #64748b; font-family: monospace; font-size: 11px;';
    const styleAccent = 'color: #22c55e; font-family: monospace; font-size: 12px; font-weight: bold;';

    console.log('%c┌─────────────────────────────────────────┐', style);
    console.log('%c│  Adaptive Threat Environment v1.0       │', style);
    console.log('%c│  Operator: Hrisheekesh PV               │', style);
    console.log('%c│  Status: ACTIVE                         │', style);
    console.log('%c└─────────────────────────────────────────┘', style);
    console.log('%cCurious. Good.', styleAccent);
    console.log('%cThis site tracks interaction patterns client-side to adapt the UI.', styleDim);
    console.log('%cNo data leaves this browser. No cookies. No analytics.', styleDim);
    console.log('%cType THREAT_ENV.profiler.getState() to inspect the behavioral model.', styleDim);
    console.log('%c', styleDim);
    console.log('%cIf you\'re here because you\'re recruiting — hello.', styleDim);
    console.log('%cIf you\'re here because you\'re inspecting — respect.', styleDim);

    // DevTools open detection
    let devToolsMessageShown = false;
    function checkDevTools() {
        const threshold = 160;
        const isOpen = window.outerWidth - window.innerWidth > threshold ||
            window.outerHeight - window.innerHeight > threshold;

        if (isOpen && !devToolsMessageShown) {
            devToolsMessageShown = true;
            console.log('%c[SYSTEM] DevTools detected. Profile updated: inspector', styleAccent);
        }
    }

    window.addEventListener('resize', checkDevTools);
    setTimeout(checkDevTools, 1000);
})();

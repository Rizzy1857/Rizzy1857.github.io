/* ============================================================
   INTERACTION PROFILING ENGINE
   Client-side behavioral model — no tracking, no cookies
   ============================================================ */

const THREAT_ENV = window.THREAT_ENV || {};

(function() {
  'use strict';

  const state = {
    scrollSpeeds: [],
    clickCount: 0,
    hoverDurations: [],
    interactionCount: 0,
    timeOnPage: 0,
    sectionTimes: {},
    devToolsOpen: false,
    profile: 'neutral', // skimmer | reader | explorer | neutral
    lastScrollY: 0,
    lastScrollTime: Date.now(),
    startTime: Date.now(),
    currentSection: null,
    sectionEntryTime: null,
  };

  // --- Scroll Speed Tracking ---
  let scrollTimeout;
  function onScroll() {
    const now = Date.now();
    const dt = now - state.lastScrollTime;
    if (dt > 0 && dt < 1000) {
      const dy = Math.abs(window.scrollY - state.lastScrollY);
      const speed = dy / dt; // px/ms
      state.scrollSpeeds.push(speed);
      if (state.scrollSpeeds.length > 50) state.scrollSpeeds.shift();
    }
    state.lastScrollY = window.scrollY;
    state.lastScrollTime = now;

    // Track which section is visible
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(trackVisibleSection, 100);
  }

  // --- Click Tracking ---
  function onClick(e) {
    state.clickCount++;
    state.interactionCount++;

    // Check if clicking interactive elements
    const target = e.target;
    if (target.closest('.btn-internals') ||
        target.closest('.project') ||
        target.closest('.arch-graph') ||
        target.closest('[data-interactive]')) {
      state.interactionCount += 2; // Weight interactive clicks higher
    }
  }

  // --- Hover Duration ---
  let hoverStart = 0;
  function onMouseEnter(e) {
    if (e.target.closest('.project, .status-panel, .sec-card, .timeline__item')) {
      hoverStart = Date.now();
    }
  }

  function onMouseLeave(e) {
    if (hoverStart && e.target.closest('.project, .status-panel, .sec-card, .timeline__item')) {
      const dur = Date.now() - hoverStart;
      state.hoverDurations.push(dur);
      if (state.hoverDurations.length > 30) state.hoverDurations.shift();
      hoverStart = 0;
    }
  }

  // --- Section Time Tracking ---
  function trackVisibleSection() {
    const sections = document.querySelectorAll('.section[id]');
    const viewportMid = window.innerHeight / 2;

    for (const section of sections) {
      const rect = section.getBoundingClientRect();
      if (rect.top < viewportMid && rect.bottom > viewportMid) {
        const id = section.id;
        if (id !== state.currentSection) {
          // Save time for previous section
          if (state.currentSection && state.sectionEntryTime) {
            const elapsed = Date.now() - state.sectionEntryTime;
            state.sectionTimes[state.currentSection] =
              (state.sectionTimes[state.currentSection] || 0) + elapsed;
          }
          state.currentSection = id;
          state.sectionEntryTime = Date.now();
        }
        break;
      }
    }
  }

  // --- DevTools Detection (simple heuristic) ---
  function checkDevTools() {
    const threshold = 160;
    const widthDiff = window.outerWidth - window.innerWidth > threshold;
    const heightDiff = window.outerHeight - window.innerHeight > threshold;
    state.devToolsOpen = widthDiff || heightDiff;
  }

  // --- Profile Classification ---
  function classify() {
    const elapsed = (Date.now() - state.startTime) / 1000; // seconds
    if (elapsed < 3) return 'neutral'; // Too early to judge

    const avgScrollSpeed = state.scrollSpeeds.length > 3
      ? state.scrollSpeeds.reduce((a, b) => a + b, 0) / state.scrollSpeeds.length
      : 0;

    const avgHoverDuration = state.hoverDurations.length > 2
      ? state.hoverDurations.reduce((a, b) => a + b, 0) / state.hoverDurations.length
      : 0;

    // Explorer: high interaction with interactive elements
    if (state.interactionCount > 5 && elapsed > 10) return 'explorer';

    // Skimmer: fast scroll, low hover, few clicks
    if (avgScrollSpeed > 1.5 && state.clickCount < 3 && elapsed > 5) return 'skimmer';

    // Reader: slow scroll, long hovers, moderate time
    if ((avgScrollSpeed < 0.8 || avgScrollSpeed === 0) && elapsed > 15) return 'reader';
    if (avgHoverDuration > 1500 && elapsed > 10) return 'reader';

    // Check time on project sections
    const projectTime = state.sectionTimes['projects'] || 0;
    if (projectTime > 20000) return 'reader'; // 20s on projects

    return 'neutral';
  }

  // --- Apply Profile ---
  let currentApplied = 'neutral';
  function applyProfile() {
    const profile = classify();
    state.profile = profile;

    if (profile !== currentApplied) {
      document.body.setAttribute('data-profile', profile);
      currentApplied = profile;

      // Notify adaptive UI
      const event = new CustomEvent('profileChange', { detail: { profile } });
      document.dispatchEvent(event);

      // Update HUD indicator
      const indicator = document.querySelector('.adaptive-indicator');
      if (indicator) {
        indicator.textContent = profile === 'neutral' ? '' : `mode: ${profile}`;
        indicator.classList.toggle('active', profile !== 'neutral');
      }
    }
  }

  // --- Init ---
  function init() {
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('click', onClick, true);
    document.addEventListener('mouseenter', onMouseEnter, true);
    document.addEventListener('mouseleave', onMouseLeave, true);
    window.addEventListener('resize', checkDevTools);

    // Classify every 3 seconds
    setInterval(applyProfile, 3000);

    // Track time on page
    setInterval(() => {
      state.timeOnPage = (Date.now() - state.startTime) / 1000;
    }, 1000);

    // Initial DevTools check
    checkDevTools();
  }

  // Expose
  THREAT_ENV.profiler = {
    getState: () => ({ ...state }),
    getProfile: () => state.profile,
    init
  };
  window.THREAT_ENV = THREAT_ENV;

  // Auto-init when DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

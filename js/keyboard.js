/* ============================================================
   KEYBOARD NAVIGATION — Command Palette & Shortcuts
   ============================================================ */

(function () {
    'use strict';

    const SECTIONS = [
        { key: '1', id: 'hero', label: 'Home' },
        { key: '2', id: 'projects', label: 'Projects' },
        { key: '3', id: 'experience', label: 'Experience' },
        { key: '4', id: 'status', label: 'Status' },
        { key: '5', id: 'security', label: 'Security' },
        { key: '6', id: 'contact', label: 'Contact' },
    ];

    let paletteOpen = false;
    let paletteEl = null;

    function createPalette() {
        const overlay = document.createElement('div');
        overlay.id = 'cmd-palette';
        overlay.innerHTML = `
      <div class="cmd-palette__backdrop"></div>
      <div class="cmd-palette__panel">
        <div class="cmd-palette__header">
          <span class="cmd-palette__title">Command Palette</span>
          <span class="cmd-palette__hint">Press key or ESC to close</span>
        </div>
        <div class="cmd-palette__list">
          ${SECTIONS.map(s => `
            <div class="cmd-palette__item" data-key="${s.key}" data-section="${s.id}">
              <span class="cmd-palette__key">${s.key}</span>
              <span class="cmd-palette__label">${s.label}</span>
            </div>
          `).join('')}
          <div class="cmd-palette__divider"></div>
          <div class="cmd-palette__item" data-key="t">
            <span class="cmd-palette__key">T</span>
            <span class="cmd-palette__label">Toggle all internals</span>
          </div>
          <div class="cmd-palette__item" data-key="d">
            <span class="cmd-palette__key">D</span>
            <span class="cmd-palette__label">Download CV</span>
          </div>
          <div class="cmd-palette__item" data-key="g">
            <span class="cmd-palette__key">G</span>
            <span class="cmd-palette__label">Open GitHub</span>
          </div>
        </div>
      </div>
    `;
        document.body.appendChild(overlay);
        paletteEl = overlay;

        // Click backdrop to close
        overlay.querySelector('.cmd-palette__backdrop').addEventListener('click', closePalette);

        // Click items
        overlay.querySelectorAll('.cmd-palette__item').forEach(item => {
            item.addEventListener('click', () => {
                const key = item.dataset.key;
                executeCommand(key);
            });
        });

        // Inject styles
        const style = document.createElement('style');
        style.textContent = `
      #cmd-palette {
        position: fixed;
        inset: 0;
        z-index: 10000;
        display: none;
        align-items: flex-start;
        justify-content: center;
        padding-top: 15vh;
      }
      #cmd-palette.open { display: flex; }

      .cmd-palette__backdrop {
        position: fixed;
        inset: 0;
        background: rgba(5,8,16,0.8);
        backdrop-filter: blur(8px);
      }

      .cmd-palette__panel {
        position: relative;
        width: 90%;
        max-width: 420px;
        border-radius: 12px;
        border: 1px solid rgba(59,130,246,0.3);
        background: #0f1420;
        box-shadow: 0 20px 60px rgba(0,0,0,0.6), 0 0 30px rgba(59,130,246,0.1);
        overflow: hidden;
        animation: cmdSlideIn 0.2s ease-out;
      }

      @keyframes cmdSlideIn {
        from { opacity: 0; transform: translateY(-10px) scale(0.98); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }

      .cmd-palette__header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 16px;
        border-bottom: 1px solid rgba(255,255,255,0.06);
      }

      .cmd-palette__title {
        font-family: 'JetBrains Mono', monospace;
        font-size: 12px;
        color: #3b82f6;
        text-transform: uppercase;
        letter-spacing: 0.1em;
      }

      .cmd-palette__hint {
        font-family: 'JetBrains Mono', monospace;
        font-size: 10px;
        color: #475569;
      }

      .cmd-palette__list { padding: 8px; }

      .cmd-palette__item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 12px;
        border-radius: 8px;
        cursor: pointer;
        transition: background 0.15s;
      }

      .cmd-palette__item:hover {
        background: rgba(59,130,246,0.1);
      }

      .cmd-palette__key {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        border-radius: 4px;
        border: 1px solid rgba(255,255,255,0.1);
        background: rgba(255,255,255,0.04);
        font-family: 'JetBrains Mono', monospace;
        font-size: 11px;
        font-weight: 600;
        color: #e2e8f0;
      }

      .cmd-palette__label {
        font-family: 'Inter', sans-serif;
        font-size: 13px;
        color: #94a3b8;
      }

      .cmd-palette__divider {
        height: 1px;
        background: rgba(255,255,255,0.06);
        margin: 8px 12px;
      }
    `;
        document.head.appendChild(style);
    }

    function openPalette() {
        if (!paletteEl) createPalette();
        paletteEl.classList.add('open');
        paletteOpen = true;
    }

    function closePalette() {
        if (paletteEl) paletteEl.classList.remove('open');
        paletteOpen = false;
    }

    function togglePalette() {
        paletteOpen ? closePalette() : openPalette();
    }

    function executeCommand(key) {
        closePalette();

        // Section navigation
        const section = SECTIONS.find(s => s.key === key);
        if (section) {
            const el = document.getElementById(section.id);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            return;
        }

        // Toggle all internals
        if (key === 't') {
            const buttons = document.querySelectorAll('.btn-internals');
            const anyOpen = document.querySelector('.project__depth.revealed');
            buttons.forEach(btn => {
                const project = btn.closest('.project');
                const depth = project?.querySelector('.project__depth');
                if (depth) {
                    if (anyOpen) {
                        depth.classList.remove('revealed');
                        btn.classList.remove('btn-internals--active');
                        btn.textContent = '[ View Internals ]';
                    } else {
                        depth.classList.add('revealed');
                        btn.classList.add('btn-internals--active');
                        btn.textContent = '[ Close Internals ]';
                    }
                }
            });
            return;
        }

        // Download CV
        if (key === 'd') {
            const a = document.createElement('a');
            a.href = 'Hrisheekesh_CV.pdf';
            a.download = '';
            a.click();
            return;
        }

        // Open GitHub
        if (key === 'g') {
            window.open('https://github.com/Rizzy1857', '_blank');
            return;
        }
    }

    function onKeyDown(e) {
        // Don't trigger in inputs
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        // ? or / opens palette
        if ((e.key === '?' || e.key === '/') && !e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            togglePalette();
            return;
        }

        // ESC closes palette
        if (e.key === 'Escape' && paletteOpen) {
            closePalette();
            return;
        }

        // Direct key commands (only when palette is open or as shortcuts)
        const key = e.key.toLowerCase();
        if (['1', '2', '3', '4', '5', '6', 't', 'd', 'g'].includes(key) && !e.ctrlKey && !e.metaKey && !e.altKey) {
            // Allow direct shortcuts without palette
            if (paletteOpen || SECTIONS.find(s => s.key === key)) {
                executeCommand(key);
            }
        }
    }

    function init() {
        document.addEventListener('keydown', onKeyDown);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

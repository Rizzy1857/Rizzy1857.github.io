// js/canvas-bg.js — Animated particle network background
'use strict';

const CanvasBackground = (() => {
  const CONFIG = {
    particleCount: 100,
    connectionDistance: 100,
    particleSpeed: 0.25,
    lineColor: 'rgba(120, 242, 255, 0.08)',
    bgColor: '#0a0b0e',
    gridCellSize: 100 // For spatial hashing
  };

  let canvas, ctx;
  let width, height;
  let particles = [];
  let grid = new Map();
  let animationId = null;

  // Spatial grid helpers for O(n) neighbor lookup instead of O(n²)
  const getCellKey = (x, y) => {
    const cellX = Math.floor(x / CONFIG.gridCellSize);
    const cellY = Math.floor(y / CONFIG.gridCellSize);
    return `${cellX},${cellY}`;
  };

  const buildGrid = () => {
    grid.clear();
    for (const p of particles) {
      const key = getCellKey(p.x, p.y);
      if (!grid.has(key)) grid.set(key, []);
      grid.get(key).push(p);
    }
  };

  const getNeighbors = (p) => {
    const neighbors = [];
    const cellX = Math.floor(p.x / CONFIG.gridCellSize);
    const cellY = Math.floor(p.y / CONFIG.gridCellSize);

    // Check 3x3 grid around current cell
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const key = `${cellX + dx},${cellY + dy}`;
        if (grid.has(key)) {
          neighbors.push(...grid.get(key));
        }
      }
    }
    return neighbors;
  };

  const createParticles = () => {
    particles = Array.from({ length: CONFIG.particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * CONFIG.particleSpeed * 2,
      vy: (Math.random() - 0.5) * CONFIG.particleSpeed * 2
    }));
  };

  const updateParticles = () => {
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;

      // Bounce off edges
      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;

      // Clamp to bounds
      p.x = Math.max(0, Math.min(width, p.x));
      p.y = Math.max(0, Math.min(height, p.y));
    }
  };

  const draw = () => {
    ctx.fillStyle = CONFIG.bgColor;
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = CONFIG.lineColor;
    ctx.lineWidth = 1;

    buildGrid();

    // Draw connections (only once per pair)
    const drawn = new Set();

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      const neighbors = getNeighbors(p);

      for (const q of neighbors) {
        if (p === q) continue;

        // Ensure each pair is only drawn once
        const pairKey = i < particles.indexOf(q)
          ? `${i}-${particles.indexOf(q)}`
          : `${particles.indexOf(q)}-${i}`;

        if (drawn.has(pairKey)) continue;

        const dx = p.x - q.x;
        const dy = p.y - q.y;
        const distSq = dx * dx + dy * dy;

        if (distSq < CONFIG.connectionDistance * CONFIG.connectionDistance) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.stroke();
          drawn.add(pairKey);
        }
      }
    }

    updateParticles();
    animationId = requestAnimationFrame(draw);
  };

  // Debounced resize handler
  let resizeTimeout;
  const handleResize = () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      createParticles();
    }, 150);
  };

  const init = () => {
    canvas = document.getElementById('bg');
    if (!canvas) return;

    ctx = canvas.getContext('2d');
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;

    createParticles();

    window.addEventListener('resize', handleResize, { passive: true });

    // Start animation
    draw();
  };

  const destroy = () => {
    if (animationId) {
      cancelAnimationFrame(animationId);
    }
    window.removeEventListener('resize', handleResize);
  };

  return { init, destroy };
})();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', CanvasBackground.init);
} else {
  CanvasBackground.init();
}

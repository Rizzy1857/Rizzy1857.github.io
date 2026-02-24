# Adaptive Threat Environment

A behavioral portfolio system that profiles visitor interaction patterns and adapts the interface in real-time.

**Not a portfolio. A system.**

## What This Is

When someone enters, the site runs a lightweight client-side behavioral model. It classifies visitors based on scroll velocity, click patterns, hover durations, and section dwell time — then adapts the UI accordingly:

- **Skimmers** get compressed summaries and emphasized metrics
- **Readers** get expanded architecture diagrams and design trade-offs
- **Explorers** who interact with internal elements get full depth revealed

No cookies. No analytics. No data leaves the browser. The profiler exists only in runtime memory.

## Architecture

```
index.html              // Single-page app
css/
  design.css            // Design tokens, palette, typography
  main.css              // Layout, components, responsive
  adaptive.css          // Behavioral layer switching
js/
  profiler.js           // Interaction profiling engine
  boot.js               // Terminal boot sequence
  adaptive-ui.js        // UI layer controller
  graph.js              // SVG architecture renderer
  status.js             // GitHub API live feed
  console-msg.js        // DevTools Easter eggs
  keyboard.js           // Command palette & shortcuts
```

## Stack

- **Zero frameworks.** Vanilla HTML, CSS, JavaScript.
- **Zero build tools.** No webpack, no bundler, no transpiler.
- **Zero tracking.** No cookies, no analytics, no data collection.
- **External requests:** Google Fonts (typography) + GitHub API (activity feed). Both optional — site degrades gracefully without them.

## Features

- **Behavioral Profiling Engine** — classifies visitors and adapts UI
- **Interactive Architecture Maps** — pure SVG node-graphs with hover/click interaction
- **Multi-Layer Project Cards** — surface metrics → analytical diagrams → design trade-offs
- **Live GitHub Feed** — real activity data, auto-refreshing
- **Security Transparency** — "Inspect the Perimeter" section documenting the site's own security posture
- **Keyboard Navigation** — press `?` for command palette, `1-6` for section jumps
- **DevTools Easter Eggs** — open console and see

## Run Locally

```bash
python3 -m http.server 8000 --bind 127.0.0.1
# → http://localhost:8000
```

## License

See [LICENSE](LICENSE) for details.

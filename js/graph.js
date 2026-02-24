/* ============================================================
   SVG ARCHITECTURE GRAPH RENDERER
   Pure SVG + JS — no external libraries
   ============================================================ */

(function () {
    'use strict';

    const COLORS = {
        node: '#3b82f6',
        nodeHover: '#60a5fa',
        edge: 'rgba(59,130,246,0.25)',
        edgeHighlight: 'rgba(59,130,246,0.7)',
        boundary: 'rgba(239,68,68,0.2)',
        boundaryStroke: 'rgba(239,68,68,0.4)',
        text: '#e2e8f0',
        textDim: '#64748b',
        bg: '#0a0e17',
    };

    function createSVG(container, data) {
        const width = container.clientWidth || 600;
        const height = Math.max(280, data.nodes.length * 40);

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
        svg.setAttribute('width', '100%');
        svg.setAttribute('height', height);
        svg.style.display = 'block';

        // --- Draw boundary zones ---
        if (data.boundaries) {
            data.boundaries.forEach(b => {
                const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                rect.setAttribute('x', b.x);
                rect.setAttribute('y', b.y);
                rect.setAttribute('width', b.w);
                rect.setAttribute('height', b.h);
                rect.setAttribute('rx', 8);
                rect.setAttribute('fill', COLORS.boundary);
                rect.setAttribute('stroke', COLORS.boundaryStroke);
                rect.setAttribute('stroke-width', 1);
                rect.setAttribute('stroke-dasharray', '4 4');
                svg.appendChild(rect);

                // Boundary label
                const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                label.setAttribute('x', b.x + 10);
                label.setAttribute('y', b.y + 18);
                label.setAttribute('fill', COLORS.boundaryStroke);
                label.setAttribute('font-size', '10');
                label.setAttribute('font-family', 'JetBrains Mono, monospace');
                label.setAttribute('letter-spacing', '0.08em');
                label.textContent = b.label.toUpperCase();
                svg.appendChild(label);
            });
        }

        // --- Draw edges ---
        const edgeEls = [];
        data.edges.forEach(edge => {
            const from = data.nodes.find(n => n.id === edge.from);
            const to = data.nodes.find(n => n.id === edge.to);
            if (!from || !to) return;

            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', from.x);
            line.setAttribute('y1', from.y);
            line.setAttribute('x2', to.x);
            line.setAttribute('y2', to.y);
            line.setAttribute('stroke', COLORS.edge);
            line.setAttribute('stroke-width', 1.5);
            line.dataset.from = edge.from;
            line.dataset.to = edge.to;
            svg.appendChild(line);
            edgeEls.push(line);
        });

        // --- Draw nodes ---
        data.nodes.forEach(node => {
            const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            g.setAttribute('transform', `translate(${node.x}, ${node.y})`);
            g.style.cursor = 'pointer';

            // Node circle
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('r', node.size || 18);
            circle.setAttribute('fill', COLORS.bg);
            circle.setAttribute('stroke', COLORS.node);
            circle.setAttribute('stroke-width', 2);

            // Node label
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('y', (node.size || 18) + 16);
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('fill', COLORS.textDim);
            text.setAttribute('font-size', '11');
            text.setAttribute('font-family', 'JetBrains Mono, monospace');
            text.textContent = node.label;

            // Node icon (abbreviated)
            const icon = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            icon.setAttribute('text-anchor', 'middle');
            icon.setAttribute('dominant-baseline', 'central');
            icon.setAttribute('fill', COLORS.node);
            icon.setAttribute('font-size', '12');
            icon.setAttribute('font-family', 'JetBrains Mono, monospace');
            icon.setAttribute('font-weight', '700');
            icon.textContent = node.icon || node.label.charAt(0);

            g.appendChild(circle);
            g.appendChild(text);
            g.appendChild(icon);

            // Hover effects
            g.addEventListener('mouseenter', () => {
                circle.setAttribute('stroke', COLORS.nodeHover);
                circle.setAttribute('stroke-width', 3);
                text.setAttribute('fill', COLORS.text);

                // Highlight connected edges
                edgeEls.forEach(line => {
                    if (line.dataset.from === node.id || line.dataset.to === node.id) {
                        line.setAttribute('stroke', COLORS.edgeHighlight);
                        line.setAttribute('stroke-width', 2.5);
                    }
                });
            });

            g.addEventListener('mouseleave', () => {
                circle.setAttribute('stroke', COLORS.node);
                circle.setAttribute('stroke-width', 2);
                text.setAttribute('fill', COLORS.textDim);

                edgeEls.forEach(line => {
                    line.setAttribute('stroke', COLORS.edge);
                    line.setAttribute('stroke-width', 1.5);
                });
            });

            // Click to show detail
            g.addEventListener('click', () => {
                const detailEl = container.closest('.project')?.querySelector('.node-detail');
                if (detailEl && node.detail) {
                    detailEl.innerHTML = `<strong>${node.label}</strong>: ${node.detail}`;
                    detailEl.style.opacity = '1';
                }
            });

            svg.appendChild(g);
        });

        container.innerHTML = '';
        container.appendChild(svg);
    }

    // --- Project Architecture Data ---
    const architectures = {
        mirage: {
            nodes: [
                { id: 'core', label: 'Core Engine', x: 300, y: 50, size: 22, icon: '⚙', detail: 'Rust orchestrator managing honeypot lifecycle, persona rotation, and telemetry aggregation.' },
                { id: 'ai', label: 'AI Layer', x: 150, y: 130, size: 18, icon: 'AI', detail: 'Python ML pipeline using behavioral clustering to classify attacker intent in real-time.' },
                { id: 'honeypot', label: 'Honeypots', x: 450, y: 130, size: 18, icon: 'HP', detail: 'Dynamically generated service emulators (SSH, HTTP, IoT) with adaptive persona shaping.' },
                { id: 'telemetry', label: 'Telemetry', x: 150, y: 230, size: 16, icon: 'T', detail: 'Structured logging pipeline: session capture, TTP mapping, and IOC extraction.' },
                { id: 'persona', label: 'Persona Engine', x: 450, y: 230, size: 16, icon: 'P', detail: 'Generates believable system personalities to maximize attacker engagement time.' },
                { id: 'api', label: 'REST API', x: 300, y: 170, size: 14, icon: '/', detail: 'FastAPI endpoints for dashboard, configuration, and real-time threat feed.' },
            ],
            edges: [
                { from: 'core', to: 'ai' },
                { from: 'core', to: 'honeypot' },
                { from: 'core', to: 'api' },
                { from: 'ai', to: 'telemetry' },
                { from: 'honeypot', to: 'persona' },
                { from: 'honeypot', to: 'telemetry' },
                { from: 'api', to: 'ai' },
                { from: 'persona', to: 'ai' },
            ],
            boundaries: [
                { x: 100, y: 210, w: 140, h: 60, label: 'Data Layer' },
                { x: 390, y: 210, w: 140, h: 60, label: 'Deception' },
            ]
        },

        packetprobe: {
            nodes: [
                { id: 'capture', label: 'Packet Capture', x: 120, y: 60, size: 20, icon: '◎', detail: 'Raw socket listener capturing live network traffic with configurable BPF filters.' },
                { id: 'parser', label: 'Protocol Parser', x: 300, y: 60, size: 18, icon: 'PP', detail: 'Multi-layer parser: Ethernet → IP → TCP/UDP → Application protocol dissection.' },
                { id: 'analyzer', label: 'Analyzer', x: 480, y: 60, size: 18, icon: '⚡', detail: 'Statistical analysis engine: flow tracking, anomaly detection, bandwidth profiling.' },
                { id: 'viz', label: 'Visualizer', x: 300, y: 170, size: 20, icon: '◈', detail: 'Real-time visualization dashboard showing packet flows, protocol distribution, and traffic patterns.' },
                { id: 'export', label: 'Export', x: 480, y: 170, size: 14, icon: '↗', detail: 'PCAP export, JSON report generation, and alerting integration.' },
            ],
            edges: [
                { from: 'capture', to: 'parser' },
                { from: 'parser', to: 'analyzer' },
                { from: 'analyzer', to: 'viz' },
                { from: 'analyzer', to: 'export' },
                { from: 'parser', to: 'viz' },
            ],
            boundaries: [
                { x: 70, y: 30, w: 460, h: 80, label: 'Capture Pipeline' },
            ]
        },

        artefact: {
            nodes: [
                { id: 'ingest', label: 'File Ingestion', x: 120, y: 60, size: 18, icon: '◉', detail: 'File intake module supporting bulk uploads with hash verification and type detection.' },
                { id: 'meta', label: 'Metadata Engine', x: 300, y: 60, size: 20, icon: 'ME', detail: 'Extracts EXIF, PE headers, PDF metadata, and embedded objects from suspect files.' },
                { id: 'packet', label: 'Packet Parser', x: 480, y: 60, size: 16, icon: '⊞', detail: 'PCAP parsing module for network forensics — extracts conversations and protocol artifacts.' },
                { id: 'hash', label: 'Hash Engine', x: 120, y: 170, size: 16, icon: '#', detail: 'Multi-algorithm hashing (MD5, SHA-256, ssdeep) for file identification and similarity matching.' },
                { id: 'report', label: 'Report Gen', x: 300, y: 170, size: 18, icon: '◧', detail: 'Structured forensic reports with timeline reconstruction and evidence chain documentation.' },
                { id: 'ioc', label: 'IOC Extractor', x: 480, y: 170, size: 16, icon: '⚑', detail: 'Automated Indicator of Compromise extraction: IPs, domains, hashes, YARA signature matching.' },
            ],
            edges: [
                { from: 'ingest', to: 'meta' },
                { from: 'ingest', to: 'hash' },
                { from: 'meta', to: 'report' },
                { from: 'meta', to: 'ioc' },
                { from: 'packet', to: 'report' },
                { from: 'hash', to: 'report' },
                { from: 'ioc', to: 'report' },
            ],
            boundaries: [
                { x: 70, y: 140, w: 460, h: 80, label: 'Analysis Layer' },
            ]
        }
    };

    function initGraphs() {
        document.querySelectorAll('.arch-graph[data-project]').forEach(container => {
            const projectId = container.dataset.project;
            const data = architectures[projectId];
            if (data) {
                // Responsive: scale node positions
                const containerWidth = container.clientWidth;
                if (containerWidth && containerWidth < 500) {
                    // Scale down for mobile
                    const scale = containerWidth / 600;
                    const scaled = JSON.parse(JSON.stringify(data));
                    scaled.nodes.forEach(n => {
                        n.x = n.x * scale;
                        n.y = n.y * scale;
                        n.size = (n.size || 18) * Math.max(scale, 0.7);
                    });
                    if (scaled.boundaries) {
                        scaled.boundaries.forEach(b => {
                            b.x *= scale;
                            b.y *= scale;
                            b.w *= scale;
                            b.h *= scale;
                        });
                    }
                    createSVG(container, scaled);
                } else {
                    createSVG(container, data);
                }
            }
        });
    }

    // Observe for when graphs become visible (lazy rendering)
    function init() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const container = entry.target;
                    if (!container.dataset.rendered) {
                        container.dataset.rendered = 'true';
                        const projectId = container.dataset.project;
                        const data = architectures[projectId];
                        if (data) createSVG(container, data);
                    }
                    observer.unobserve(container);
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.arch-graph[data-project]').forEach(el => {
            observer.observe(el);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    window.THREAT_ENV = window.THREAT_ENV || {};
    window.THREAT_ENV.graphData = architectures;
})();

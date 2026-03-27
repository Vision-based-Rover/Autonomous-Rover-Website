document.addEventListener("DOMContentLoaded", () => {

  /* ============ CUSTOM CURSOR ============ */
  const dot  = document.createElement('div'); dot.className  = 'cursor-dot';
  const ring = document.createElement('div'); ring.className = 'cursor-ring';
  document.body.append(dot, ring);

  let mx = 0, my = 0, rx = 0, ry = 0;
  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

  (function animCursor() {
    dot.style.left  = mx + 'px'; dot.style.top  = my + 'px';
    rx += (mx - rx) * 0.14;    ry += (my - ry) * 0.14;
    ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
    requestAnimationFrame(animCursor);
  })();

  document.querySelectorAll('a, button').forEach(el => {
    el.addEventListener('mouseenter', () => { ring.style.width = '48px'; ring.style.height = '48px'; ring.style.opacity = '0.9'; ring.style.borderColor = 'var(--accent)'; });
    el.addEventListener('mouseleave', () => { ring.style.width = '32px'; ring.style.height = '32px'; ring.style.opacity = '0.5'; ring.style.borderColor = 'var(--accent)'; });
  });

  /* ============ PARTICLE CANVAS ============ */
  const canvas = document.getElementById('particle-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let W, H, particles = [];

    function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
    resize(); window.addEventListener('resize', resize);

    const NUM = Math.min(80, Math.floor(window.innerWidth / 18));
    for (let i = 0; i < NUM; i++) {
      particles.push({
        x: Math.random() * 2000, y: Math.random() * 1200,
        r: Math.random() * 1.5 + 0.3,
        vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
        alpha: Math.random() * 0.5 + 0.1
      });
    }

    function drawParticles() {
      ctx.clearRect(0, 0, W, H);
      particles.forEach((p, i) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 229, 255, ${p.alpha})`;
        ctx.fill();

        // Draw connections
        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const dist = Math.hypot(p.x - q.x, p.y - q.y);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `rgba(0, 229, 255, ${0.06 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      });
      requestAnimationFrame(drawParticles);
    }
    drawParticles();
  }

  /* ============ TERMINAL TYPING ============ */
  const terminalLines = [
    { text: "anas@awr-node:~$ systemctl status awr-navigation", cls: "cmd" },
    { text: "● awr-navigation.service — AWR Neural Navigation", cls: "ok" },
    { text: "   Loaded: loaded (/etc/systemd/system/awr.service; enabled)", cls: "info" },
    { text: "   Active: <span style='color:var(--green)'>active (running)</span> since boot", cls: "info" },
    { text: "", cls: "" },
    { text: "[INFO]  Initializing ROS2 Humble Hawksbill...", cls: "info" },
    { text: "[OK]    IMU MPU-6050 detected @ /dev/i2c-1", cls: "ok" },
    { text: "[OK]    ToF VL53L0X sensors (4/4) online", cls: "ok" },
    { text: "[OK]    Wheel encoders calibrated (0.00% drift)", cls: "ok" },
    { text: "[WARN]  Camera module warm-up: 340ms", cls: "warn" },
    { text: "[OK]    Loading v6.2 weights — Accuracy: <span style='color:var(--accent)'>92.0%</span>", cls: "ok" },
    { text: "[OK]    Safety Guard Node: ACTIVE", cls: "ok" },
    { text: "", cls: "" },
    { text: "anas@awr-node:~$ █ Starting inference loop...", cls: "success" },
  ];

  function typeTerminal() {
    const body = document.querySelector('.terminal-body');
    if (!body || body.dataset.typed) return;
    body.dataset.typed = '1';
    body.innerHTML = '';

    let i = 0;
    function nextLine() {
      if (i >= terminalLines.length) {
        const cur = document.createElement('span');
        cur.className = 'cursor-blink'; body.appendChild(cur);
        return;
      }
      const { text, cls } = terminalLines[i++];
      const el = document.createElement('code');
      el.style.display = 'block';
      if (cls) el.classList.add(cls);
      el.innerHTML = text;
      body.appendChild(el);
      body.scrollTop = body.scrollHeight;
      setTimeout(nextLine, text === '' ? 80 : 280);
    }
    nextLine();
  }

  /* ============ SCROLL OBSERVER ============ */
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('show');
        if (entry.target.classList.contains('terminal-window')) typeTerminal();
        // Animate progress bars inside
        entry.target.querySelectorAll && entry.target.querySelectorAll('.progress-fill').forEach(el => {
          el.style.width = el.dataset.width || '0%';
        });
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.card, .video-container, .terminal-window, .section-header, .callout, .meta-box, .team-table-container, .stats-grid').forEach(el => {
    el.classList.add('hidden');
    observer.observe(el);
  });

  /* ============ CLOCK ============ */
  const clocks = document.querySelectorAll('.clock');
  setInterval(() => {
    const t = new Date().toLocaleTimeString([], { hour12: false });
    clocks.forEach(c => c.textContent = t);
  }, 1000);
  // set immediately
  const t0 = new Date().toLocaleTimeString([], { hour12: false });
  clocks.forEach(c => c.textContent = t0);

  /* ============ SCANLINES OVERLAY ============ */
  const sl = document.createElement('div'); sl.className = 'scanlines';
  document.body.appendChild(sl);

  /* ============ STAGGER CARD ANIMATIONS ============ */
  document.querySelectorAll('.grid').forEach(grid => {
    grid.querySelectorAll('.card').forEach((card, i) => {
      card.style.transitionDelay = (i * 80) + 'ms';
    });
  });
});
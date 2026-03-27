document.addEventListener("DOMContentLoaded", () => {

  /* ── CUSTOM CURSOR ── */
  const dot  = document.createElement('div'); dot.className  = 'cursor-dot';
  const ring = document.createElement('div'); ring.className = 'cursor-ring';
  document.body.append(dot, ring);
  let mx=0, my=0, rx=0, ry=0;
  document.addEventListener('mousemove', e => { mx=e.clientX; my=e.clientY; });
  (function tick() {
    dot.style.left = mx+'px'; dot.style.top = my+'px';
    rx += (mx-rx)*0.14; ry += (my-ry)*0.14;
    ring.style.left = rx+'px'; ring.style.top = ry+'px';
    requestAnimationFrame(tick);
  })();
  document.querySelectorAll('a,button').forEach(el => {
    el.addEventListener('mouseenter', () => { ring.style.width='44px'; ring.style.height='44px'; ring.style.opacity='0.9'; });
    el.addEventListener('mouseleave', () => { ring.style.width='26px'; ring.style.height='26px'; ring.style.opacity='0.55'; });
  });

  /* ── PARTICLE CANVAS ── */
  const canvas = document.getElementById('particle-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let W, H, pts = [];
    function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
    resize(); window.addEventListener('resize', resize);
    const N = Math.min(50, Math.floor(window.innerWidth/22));
    for (let i=0; i<N; i++) pts.push({
      x: Math.random()*W, y: Math.random()*H,
      vx: (Math.random()-.5)*.25, vy: (Math.random()-.5)*.25,
      a: Math.random()*.35+.05
    });
    function draw() {
      ctx.clearRect(0,0,W,H);
      pts.forEach((p,i) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x<0)p.x=W; if (p.x>W)p.x=0;
        if (p.y<0)p.y=H; if (p.y>H)p.y=0;
        // draw as small diamonds to match industrial theme
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(Math.PI/4);
        ctx.fillStyle = `rgba(232,160,32,${p.a})`;
        ctx.fillRect(-2,-2,4,4);
        ctx.restore();
        for (let j=i+1; j<pts.length; j++) {
          const q=pts[j], d=Math.hypot(p.x-q.x,p.y-q.y);
          if (d<110) {
            ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(q.x,q.y);
            ctx.strokeStyle=`rgba(232,160,32,${0.05*(1-d/110)})`;
            ctx.lineWidth=.5; ctx.stroke();
          }
        }
      });
      requestAnimationFrame(draw);
    }
    draw();
  }

  /* ── TERMINAL TYPING ── */
  const lines = [
    { t:"anas@awr-node:~$ systemctl status awr-navigation", c:"cmd" },
    { t:"● awr-navigation.service — AWR Embedded Navigation", c:"ok" },
    { t:"   Active: active (running) — uptime 00:04:12", c:"ok" },
    { t:"", c:"" },
    { t:"[INFO]  ROS 2 Humble initialised", c:"info" },
    { t:"[OK]    MPU-6050 IMU @ /dev/i2c-1 → yaw drift ±0.1°", c:"ok" },
    { t:"[OK]    VL53L0X ToF ×4 → all channels nominal", c:"ok" },
    { t:"[OK]    L298N motor driver PWM ready", c:"ok" },
    { t:"[WARN]  Camera warm-up: 312ms", c:"warn" },
    { t:"[OK]    PPO v6.2 weights loaded — accuracy: 92.0 %", c:"ok" },
    { t:"[OK]    Safety Guard Node active — braking override: ON", c:"ok" },
    { t:"", c:"" },
    { t:"anas@awr-node:~$ █ Inference loop running @ 15 Hz", c:"success" },
  ];
  function typeTerminal() {
    const body = document.querySelector('.terminal-body');
    if (!body || body.dataset.typed) return;
    body.dataset.typed='1'; body.innerHTML='';
    let i=0;
    function next() {
      if (i>=lines.length) { const cur=document.createElement('span'); cur.className='cursor-blink'; body.appendChild(cur); return; }
      const {t,c}=lines[i++];
      const el=document.createElement('code'); el.style.display='block';
      if(c) el.classList.add(c); el.textContent=t; body.appendChild(el);
      body.scrollTop=body.scrollHeight;
      setTimeout(next, t===''?60:250);
    }
    next();
  }

  /* ── SCANLINES ── */
  const sl=document.createElement('div'); sl.className='scanlines'; document.body.appendChild(sl);

  /* ── INTERSECTION OBSERVER ── */
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('show');
      if (e.target.classList.contains('terminal-window')) typeTerminal();
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.card,.card-solo,.video-container,.terminal-window,.section-header,.callout,.meta-box,.team-table-container,.spec-strip,.pipeline').forEach(el => {
    el.classList.add('hidden'); obs.observe(el);
  });

  /* ── CLOCK ── */
  function tick() {
    const t = new Date().toLocaleTimeString([],{hour12:false});
    document.querySelectorAll('.clock').forEach(c=>c.textContent=t);
  }
  tick(); setInterval(tick,1000);
});
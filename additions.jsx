// additions.jsx — comportamento extra: countdown, scroll-reveal, header shrink, confete sutil
(function () {
  const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 1) COUNTDOWN para 11/06/2026 (abertura da Copa)
  const target = new Date('2026-06-11T17:00:00-03:00').getTime();
  function tick() {
    const now = Date.now();
    let diff = Math.max(0, target - now);
    const d = Math.floor(diff / 86400000); diff -= d * 86400000;
    const h = Math.floor(diff / 3600000); diff -= h * 3600000;
    const m = Math.floor(diff / 60000); diff -= m * 60000;
    const s = Math.floor(diff / 1000);
    document.querySelectorAll('[data-cd="d"]').forEach((el) => (el.textContent = String(d).padStart(3, '0')));
    document.querySelectorAll('[data-cd="h"]').forEach((el) => (el.textContent = String(h).padStart(2, '0')));
    document.querySelectorAll('[data-cd="m"]').forEach((el) => (el.textContent = String(m).padStart(2, '0')));
    document.querySelectorAll('[data-cd="s"]').forEach((el) => (el.textContent = String(s).padStart(2, '0')));
  }
  setInterval(tick, 1000);
  tick();

  // 2) SCROLL REVEAL — fade+slide ao entrar na viewport
  if ('IntersectionObserver' in window && !reduced) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    function tagAndObserve() {
      const sels = ['.sect', '.duo__card', '.cat', '.card', '.manifesto__grid', '.quote__inner', '.bnf__item'];
      sels.forEach((sel) => {
        document.querySelectorAll(sel + ':not(.reveal)').forEach((el, i) => {
          el.classList.add('reveal');
          if (i % 3 === 1) el.classList.add('reveal--delay-1');
          if (i % 3 === 2) el.classList.add('reveal--delay-2');
          io.observe(el);
        });
      });
    }
    const startObserver = () => {
      tagAndObserve();
      new MutationObserver(tagAndObserve).observe(document.body, { childList: true, subtree: true });
    };
    if (document.body) startObserver();
    else document.addEventListener('DOMContentLoaded', startObserver);
  }

  // 3) HEADER SHRINK ao rolar
  let lastY = 0;
  function onScroll() {
    const y = window.scrollY || 0;
    if ((y > 40) !== (lastY > 40)) {
      document.body.classList.toggle('is-scrolled', y > 40);
    }
    lastY = y;
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  // 4) CONFETE sutil no hero (canvas, só uma vez na entrada)
  function spawnConfetti() {
    if (reduced) return;
    const hero = document.querySelector('.hero');
    if (!hero || hero.dataset.confetti) return;
    hero.dataset.confetti = '1';
    const cv = document.createElement('canvas');
    cv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:1';
    hero.appendChild(cv);
    const ctx = cv.getContext('2d');
    function resize() { cv.width = hero.offsetWidth; cv.height = hero.offsetHeight; }
    resize(); window.addEventListener('resize', resize);
    const colors = ['#FFD400', '#FF8A1E', '#00B14F', '#0046C7', '#FFFFFF'];
    const N = 60;
    const parts = Array.from({ length: N }).map(() => ({
      x: Math.random() * cv.width,
      y: -Math.random() * cv.height,
      vy: 0.6 + Math.random() * 1.6,
      vx: -0.5 + Math.random(),
      size: 6 + Math.random() * 8,
      color: colors[(Math.random() * colors.length) | 0],
      rot: Math.random() * Math.PI,
      vr: -0.05 + Math.random() * 0.1,
      shape: Math.random() < 0.4 ? 'c' : 'r',
    }));
    let raf;
    function frame() {
      ctx.clearRect(0, 0, cv.width, cv.height);
      parts.forEach((p) => {
        p.y += p.vy; p.x += p.vx; p.rot += p.vr;
        if (p.y > cv.height + 20) { p.y = -20; p.x = Math.random() * cv.width; }
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = .85;
        if (p.shape === 'c') { ctx.beginPath(); ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2); ctx.fill(); }
        else { ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2); }
        ctx.restore();
      });
      raf = requestAnimationFrame(frame);
    }
    frame();
    // pausa quando hero sai da tela (economiza CPU)
    if ('IntersectionObserver' in window) {
      new IntersectionObserver((es) => {
        es.forEach((e) => {
          if (e.isIntersecting && !raf) frame();
          else if (!e.isIntersecting && raf) { cancelAnimationFrame(raf); raf = 0; }
        });
      }, { threshold: 0 }).observe(hero);
    }
  }
  const heroSpawnLoop = setInterval(() => {
    if (document.querySelector('.hero')) {
      spawnConfetti();
      clearInterval(heroSpawnLoop);
    }
  }, 200);
  setTimeout(() => clearInterval(heroSpawnLoop), 8000);
})();

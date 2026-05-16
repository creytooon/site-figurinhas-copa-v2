// ════════════════════════════════════════════════════════════════
// VIDEO BACKGROUND · loader inteligente
//
// Recursos:
//  • Desktop (≥769px): carrega versão 1920×1080 (mp4/webm)
//  • Mobile  (≤768px): carrega versão 1280×720 _mobile.mp4
//  • Conexão lenta / data-saver: mostra apenas o poster
//  • prefers-reduced-motion: pausa vídeo e mostra poster
//  • Sem loop perfeito? Aplica crossfade de 0.5s no fim da
//    duração para disfarçar o "salto" do loop
//  • Lazy-load: vídeos secundários só carregam quando entram
//    em viewport
//  • Fallback: enquanto o vídeo carrega (ou falha de rede),
//    o filho passado em `fallback` renderiza por baixo
// ════════════════════════════════════════════════════════════════

function useReducedMotion() {
  const [reduced, setReduced] = React.useState(
    () => typeof window !== "undefined" &&
          window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  );
  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const fn = (e) => setReduced(e.matches);
    mq.addEventListener?.("change", fn);
    return () => mq.removeEventListener?.("change", fn);
  }, []);
  return reduced;
}

function useSlowConnection() {
  // Network Information API (Chrome/Edge/Opera)
  const [slow, setSlow] = React.useState(() => {
    const c = navigator.connection;
    if (!c) return false;
    if (c.saveData) return true;
    if (c.effectiveType && /^(slow-)?2g$/i.test(c.effectiveType)) return true;
    return false;
  });
  React.useEffect(() => {
    const c = navigator.connection;
    if (!c?.addEventListener) return;
    const fn = () => setSlow(c.saveData || /^(slow-)?2g$/i.test(c.effectiveType || ""));
    c.addEventListener("change", fn);
    return () => c.removeEventListener("change", fn);
  }, []);
  return slow;
}

function useInViewport(ref, rootMargin = "200px") {
  const [seen, setSeen] = React.useState(false);
  React.useEffect(() => {
    if (!ref.current || seen) return;
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) { setSeen(true); io.disconnect(); }
    }, { rootMargin });
    io.observe(ref.current);
    return () => io.disconnect();
  }, [seen]);
  return seen;
}

// VideoBackground:
//   src          base name sem extensão, e.g. "videos/hero-bg"
//                expande para .mp4 / .webm / _mobile.mp4
//   poster       caminho do JPG estático (obrigatório)
//   loopFadeMs   ms de crossfade no fim do loop (default 500)
//   eager        true = carrega imediato; false = espera entrar em viewport
//   overlay      número 0-1 para escurecer o vídeo (default 0.55)
//   fallback     conteúdo renderizado por baixo enquanto vídeo carrega/falha
//   className    classe extra no container
const VideoBackground = ({
  src,
  poster,
  loopFadeMs = 500,
  eager = false,
  overlay = 0.55,
  fallback = null,
  className = "",
  style = {}
}) => {
  const wrapRef = React.useRef(null);
  const videoARef = React.useRef(null);
  const videoBRef = React.useRef(null);
  const reduced = useReducedMotion();
  const slow = useSlowConnection();
  const inView = useInViewport(wrapRef);

  const [isMobile, setIsMobile] = React.useState(
    () => typeof window !== "undefined" &&
          (window.innerWidth <= 768 || /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent))
  );
  React.useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth <= 768 || /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent));
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);

  // Em mobile NUNCA carrega vídeo — só mostra o poster.jpg (economia massiva de banda).
  const shouldLoad = (eager || inView) && !reduced && !slow && !isMobile;

  // Pra crossfade no loop: usamos dois <video> A/B, um começa quando
  // o outro está nos últimos `loopFadeMs` da duração e faz fade-in.
  const [activeIdx, setActiveIdx] = React.useState(0);
  const [loaded, setLoaded] = React.useState(false);

  // Sincroniza B com A no fim do loop (apenas se loopFadeMs > 0)
  React.useEffect(() => {
    if (!shouldLoad || loopFadeMs <= 0) return;
    const a = videoARef.current, b = videoBRef.current;
    if (!a || !b) return;

    let raf;
    const tick = () => {
      const cur = activeIdx === 0 ? a : b;
      const next = activeIdx === 0 ? b : a;
      if (cur.duration && !isNaN(cur.duration)) {
        const remaining = (cur.duration - cur.currentTime) * 1000;
        if (remaining <= loopFadeMs && next.paused) {
          next.currentTime = 0;
          next.play().catch(() => {});
          // Toggle ativo — CSS controla a opacidade via data-active
          setActiveIdx((i) => 1 - i);
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [shouldLoad, loopFadeMs, activeIdx]);

  const renderVideo = (ref, key) => (
    <video
      ref={ref}
      key={key}
      autoPlay
      muted
      loop={loopFadeMs <= 0}    // se vamos cross-fade, não usar loop nativo
      playsInline
      preload={eager ? "auto" : "metadata"}
      poster={poster}
      aria-hidden="true"
      onLoadedData={() => setLoaded(true)}
      onError={() => setLoaded(false)}
    >
      {/* Em desktop sempre serve arquivos full. Em mobile não chega aqui. */}
      <source src={`${src}.webm`} type="video/webm" />
      <source src={`${src}.mp4`}  type="video/mp4" />
    </video>
  );

  return (
    <div ref={wrapRef} className={`video-bg ${className}`}
         data-loaded={loaded ? "true" : "false"}
         style={style}>
      {/* Camada de fallback (animação SVG, gradient, etc.) por trás */}
      {fallback && <div className="video-bg-fallback">{fallback}</div>}

      {/* Poster — sempre visível, fica embaixo do vídeo */}
      {poster && <img className="video-bg-poster" src={poster} alt="" aria-hidden="true" />}

      {/* Vídeo(s) — só carrega quando deve */}
      {shouldLoad && (
        <>
          <div className={`video-bg-layer ${activeIdx === 0 ? "active" : ""}`}>
            {renderVideo(videoARef, "a")}
          </div>
          {loopFadeMs > 0 && (
            <div className={`video-bg-layer ${activeIdx === 1 ? "active" : ""}`}>
              {renderVideo(videoBRef, "b")}
            </div>
          )}
        </>
      )}

      {/* Overlay escuro pra legibilidade */}
      <div className="video-bg-overlay"
           style={{ background: `rgba(0,0,0,${isMobile ? Math.max(overlay, 0.65) : overlay})` }}>
      </div>
    </div>
  );
};

Object.assign(window, { VideoBackground, useReducedMotion, useSlowConnection });

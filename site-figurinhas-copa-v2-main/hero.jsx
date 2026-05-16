// ════════════════════════════════════════════════════════════════
// HERO · full-screen video background + countdown
// ════════════════════════════════════════════════════════════════

// Countdown hook — atualiza a cada segundo
function useCountdown(target) {
  const calc = () => {
    const ms = target.getTime() - Date.now();
    if (ms <= 0) return { d: 0, h: 0, m: 0, s: 0, done: true };
    const d = Math.floor(ms / 86400000);
    const h = Math.floor((ms % 86400000) / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return { d, h, m, s, done: false };
  };
  const [t, setT] = React.useState(calc);
  React.useEffect(() => {
    const id = setInterval(() => setT(calc()), 1000);
    return () => clearInterval(id);
  }, []);
  return t;
}

const pad = (n) => String(n).padStart(2, "0");

const Countdown = () => {
  const { d, h, m, s } = useCountdown(KICKOFF_DATE);
  return (
    <div className="countdown-wrap">
      <div className="countdown-head">
        <span>Contagem regressiva</span>
        <span className="live-dot">11.06.2026 · Pontapé inicial</span>
      </div>
      <div className="countdown">
        <div className="cd-cell"><div className="cd-num">{pad(d)}</div><div className="cd-lbl">Dias</div></div>
        <div className="cd-cell"><div className="cd-num">{pad(h)}</div><div className="cd-lbl">Horas</div></div>
        <div className="cd-cell"><div className="cd-num">{pad(m)}</div><div className="cd-lbl">Min</div></div>
        <div className="cd-cell"><div className="cd-num">{pad(s)}</div><div className="cd-lbl">Seg</div></div>
      </div>
    </div>
  );
};

const HeroNav = ({ brand }) => (
  <header className="hero-nav">
    <a href="#top" className="brand-mark">
      <span className="brand-badge">26</span>
      <span>{brand}</span>
    </a>
    <nav className="hero-navlinks">
      <a href="#pacotes">Pacotes</a>
      <a href="#monte">Monte seu pacote</a>
      <a href="#visto">Visto</a>
      <a href="#sedes">Sedes</a>
      <a href="#contato">Contato</a>
    </nav>
    <a href={waLink("Olá! Quero saber mais sobre os pacotes da Copa 2026.")} target="_blank" rel="noopener" className="nav-cta">
      <span style={{width:6,height:6,borderRadius:"50%",background:"var(--gold)",boxShadow:"0 0 8px var(--gold)"}}></span>
      Atendimento ao vivo
    </a>
  </header>
);

const Hero = ({ brand, headline2, subline, installments, heroVariant = "main" }) => {
  // Vídeo principal × alternativo (estádio vazio simétrico)
  const videoSrc = heroVariant === "alt" ? "hero-bg-alt" : "hero-bg";
  return (
    <section className="hero" id="top">
      <div className="hero-media">
        {/*
          ────────────────────────────────────────────────
          MÍDIA DO HERO — sistema em camadas:
          1. Vídeo MP4/WebM (carrega em desktop e mobile com versões
             próprias). Cai pra fallback se: data-saver, conexão lenta,
             prefers-reduced-motion, ou erro de rede.
          2. Animação SVG cinematográfica como fallback automático.
          3. Imagem solta no slot do painel "Mídia" sobrepõe tudo.

          Arquivos esperados em videos/:
            - hero-bg.mp4         (1920×1080, ~5MB)
            - hero-bg.webm        (mesma versão, codec VP9 ~30% menor)
            - hero-bg_mobile.mp4  (1280×720,  <2MB)
            - hero-bg_mobile.webm
            - hero-bg-poster.jpg  (frame estático ~150KB)
            (mesmas variantes para hero-bg-alt)
          ────────────────────────────────────────────────
        */}
        <VideoBackground
          src={videoSrc}
          poster={`${videoSrc}-poster.jpg`}
          loopFadeMs={500}
          eager={true}
          overlay={0.55}
          fallback={<HeroBackground />}
          className="hero-video-bg"
        />
        <MediaSlot
          id="hero-bg"
          label="Imagem de fundo do hero"
          group="Hero"
          anchor="top"
          placeholder="Arraste uma imagem de fundo (estádio, torcida, fogos…)"
          className="hero-slot"
        />
      </div>
      <div className="hero-overlay"></div>
      <div className="hero-vignette"></div>

      <HeroNav brand={brand} />

      <div className="hero-body">
        <Reveal>
          <span className="hero-eyebrow">
            <span className="pill-flags">
              <FlagSVG country="USA" size={14} />
              <FlagSVG country="CAN" size={14} />
              <FlagSVG country="MEX" size={14} />
            </span>
            EUA · Canadá · México &nbsp;·&nbsp; 11 jun → 19 jul · 2026
          </span>
        </Reveal>

        <Reveal delay={120}>
          <h1 className="hero-title">
            <span className="line1">É hora de</span>
            <span className="line2">{headline2}</span>
          </h1>
        </Reveal>

        <Reveal delay={240}>
          <p className="hero-sub">{subline}</p>
        </Reveal>

        <Reveal delay={320}>
          <div className="hero-stats">
            <div className="hs">
              <div className="hs-num">12</div>
              <div className="hs-lbl">Pacotes</div>
            </div>
            <div className="hs">
              <div className="hs-num">16</div>
              <div className="hs-lbl">Sedes</div>
            </div>
            <div className="hs hs-gold">
              <div className="hs-num">{installments}×</div>
              <div className="hs-lbl">Sem juros</div>
            </div>
            <div className="hs">
              <div className="hs-num">24/7</div>
              <div className="hs-lbl">WhatsApp</div>
            </div>
          </div>
        </Reveal>

        <Reveal delay={400}>
          <div className="hero-ctas">
            <a href="#pacotes" className="btn btn-gold">
              Ver pacotes
              <Icon name="arrow-right" size={18} />
            </a>
            <a href={waLink("Olá! Quero falar com um especialista sobre a Copa 2026.")} target="_blank" rel="noopener" className="btn btn-outline">
              <Icon name="whatsapp" size={18} />
              Falar no WhatsApp
            </a>
          </div>
        </Reveal>

        <Reveal delay={520}>
          <Countdown />
        </Reveal>
      </div>

      <a href="#diferenciais" className="scroll-ind" aria-label="Rolar para a próxima seção">
        Role para descobrir
        <span className="line"></span>
      </a>
    </section>
  );
};

Object.assign(window, { Hero, Countdown, useCountdown });

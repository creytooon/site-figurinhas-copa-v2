// ════════════════════════════════════════════════════════════════
// SEÇÕES · diferenciais, pacotes, sedes, CTA, footer, FAB
// ════════════════════════════════════════════════════════════════

// ─── DIFERENCIAIS ────────────────────────────────────────────────
const Diferenciais = () => {
  const items = [
    { num: "01 / Premium",   icon: "trophy",   title: "Experiência premium do começo ao fim",
      body: "Hotéis 5★, transfers privativos, ingressos categoria 1 e 2 e acesso a hospitalidades exclusivas em todas as cidades-sede." },
    { num: "02 / Especialistas", icon: "shield", title: "Equipe especializada em grandes eventos",
      body: "Mais de 12 anos montando pacotes para Copas, Olimpíadas e Champions. Falamos português, inglês e espanhol — e conhecemos cada estádio." },
    { num: "03 / Suporte 24/7",  icon: "headphones", title: "Concierge no seu bolso, 24h por dia",
      body: "Um WhatsApp dedicado durante toda a viagem. Voo atrasado, mudança de jogo, qualquer emergência — alguém atende em segundos." }
  ];
  return (
    <section id="diferenciais">
      <div className="wrap">
        <Reveal as="div" className="section-head">
          <span className="eyebrow"><span className="dot"></span>Por que viajar conosco</span>
          <h2>O jogo<br/><span className="gold-grad">começa antes</span></h2>
          <p className="lede">A diferença entre estar lá e viver a Copa está nos detalhes que ninguém vê — e que a gente trata um por um.</p>
        </Reveal>
        <div className="diff-grid">
          {items.map((it, i) => (
            <Reveal key={it.num} delay={i * 120} className="diff-card">
              <div className="num">{it.num}</div>
              <div className="icon"><Icon name={it.icon} size={26} /></div>
              <h3>{it.title}</h3>
              <p>{it.body}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

// ─── PACOTES ────────────────────────────────────────────────────
// Ilustração de estádio — vista 3/4 estilizada (placeholder bonito).
// Cada cidade ganha uma variação determinística (ângulo do skyline, posição
// dos refletores) para os 12 cards não ficarem idênticos.
const StadiumArt = ({ country, seed = 0, label }) => {
  const palette = {
    USA: { sky: "#1E40AF", stand: "#0B1A3E", standTop: "#1E40AF", glow: "rgba(96,140,255,0.45)" },
    CAN: { sky: "#DC2626", stand: "#2A0A0E", standTop: "#7B1A1F", glow: "rgba(255,90,90,0.40)" },
    MEX: { sky: "#15803D", stand: "#08231A", standTop: "#1F6A45", glow: "rgba(90,220,140,0.40)" }
  };
  const c = palette[country] || palette.USA;
  // Pseudo-aleatório determinístico a partir do seed (ID do pacote)
  const rng = (n) => {
    const x = Math.sin(seed * 9301 + n * 49297) * 233280;
    return x - Math.floor(x);
  };
  // Skyline: alturas dos prédios
  const buildings = Array.from({ length: 18 }, (_, i) => ({
    x: 10 + i * 22,
    w: 16 + rng(i) * 6,
    h: 22 + rng(i + 1) * 46,
    win: rng(i + 2) > 0.5
  }));
  // Estrelas/luzes no céu
  const stars = Array.from({ length: 26 }, (_, i) => ({
    x: 10 + rng(i + 10) * 380,
    y: 8 + rng(i + 20) * 90,
    r: 0.5 + rng(i + 30) * 1.2,
    o: 0.3 + rng(i + 40) * 0.6
  }));

  const gid = `g${country}${seed}`;

  return (
    <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice"
         xmlns="http://www.w3.org/2000/svg" className="stadium-art">
      <defs>
        <radialGradient id={`${gid}-sky`} cx="50%" cy="80%" r="65%">
          <stop offset="0%"  stopColor={c.glow} />
          <stop offset="50%" stopColor="rgba(0,0,0,0)" />
        </radialGradient>
        <linearGradient id={`${gid}-bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#06060c" />
          <stop offset="100%" stopColor="#0A0A0F" />
        </linearGradient>
        <linearGradient id={`${gid}-pitch`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#138a4a" />
          <stop offset="100%" stopColor="#0a4a26" />
        </linearGradient>
        <linearGradient id={`${gid}-stand`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={c.standTop} />
          <stop offset="100%" stopColor={c.stand} />
        </linearGradient>
      </defs>

      {/* Sky background */}
      <rect width="400" height="300" fill={`url(#${gid}-bg)`} />
      <rect width="400" height="300" fill={`url(#${gid}-sky)`} />

      {/* Stars / city lights up high */}
      {stars.map((s, i) => (
        <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#fff" opacity={s.o} />
      ))}

      {/* City skyline silhouette */}
      <g opacity="0.85">
        {buildings.map((b, i) => (
          <g key={i}>
            <rect x={b.x} y={150 - b.h} width={b.w} height={b.h} fill="#06060c" />
            {b.win && (
              <>
                <rect x={b.x + 3} y={150 - b.h + 6}  width="2" height="2" fill={c.glow} opacity="0.6"/>
                <rect x={b.x + 7} y={150 - b.h + 12} width="2" height="2" fill={c.glow} opacity="0.5"/>
                <rect x={b.x + 3} y={150 - b.h + 18} width="2" height="2" fill={c.glow} opacity="0.6"/>
                <rect x={b.x + 8} y={150 - b.h + 24} width="2" height="2" fill="#fff" opacity="0.35"/>
              </>
            )}
          </g>
        ))}
      </g>

      {/* Light cones from floodlights */}
      <g opacity="0.18">
        <polygon points="40,80  200,210  60,80"   fill="#fff" />
        <polygon points="140,55 200,210 160,55"   fill="#fff" />
        <polygon points="240,55 200,210 260,55"   fill="#fff" />
        <polygon points="340,80 200,210 360,80"   fill="#fff" />
      </g>

      {/* Floodlight poles */}
      <g stroke="#1a1a22" strokeWidth="1.5">
        <line x1="50"  y1="78"  x2="50"  y2="155" />
        <line x1="150" y1="55"  x2="150" y2="150" />
        <line x1="250" y1="55"  x2="250" y2="150" />
        <line x1="350" y1="78"  x2="350" y2="155" />
      </g>
      <g fill={c.glow}>
        <circle cx="50"  cy="78" r="3" />
        <circle cx="150" cy="55" r="3" />
        <circle cx="250" cy="55" r="3" />
        <circle cx="350" cy="78" r="3" />
      </g>

      {/* Stadium outer rim (back arc) */}
      <ellipse cx="200" cy="200" rx="195" ry="58" fill={`url(#${gid}-stand)`} />
      {/* Roof highlight */}
      <path d="M 5,200 a 195,58 0 0 1 390,0" fill="none"
            stroke={c.standTop} strokeWidth="1.5" opacity="0.6" />

      {/* Inner stands ring (darker) */}
      <ellipse cx="200" cy="206" rx="170" ry="46" fill="#050507" />

      {/* Pitch */}
      <ellipse cx="200" cy="208" rx="148" ry="36" fill={`url(#${gid}-pitch)`} />

      {/* Pitch grass stripes */}
      <g clipPath={`url(#${gid}-pitchClip)`}>
        <defs>
          <clipPath id={`${gid}-pitchClip`}>
            <ellipse cx="200" cy="208" rx="148" ry="36" />
          </clipPath>
        </defs>
        <ellipse cx="200" cy="208" rx="148" ry="36" fill="rgba(255,255,255,0.025)" />
        <ellipse cx="200" cy="208" rx="115" ry="28" fill="rgba(255,255,255,0.020)" />
        <ellipse cx="200" cy="208" rx="80"  ry="20" fill="rgba(255,255,255,0.015)" />
      </g>

      {/* Pitch markings */}
      <g stroke="#fff" strokeWidth="0.7" fill="none" opacity="0.55">
        <ellipse cx="200" cy="208" rx="145" ry="33" />
        <line x1="200" y1="175" x2="200" y2="241" />
        <ellipse cx="200" cy="208" rx="20" ry="6" />
        <rect x="62"  y="198" width="22" height="20" />
        <rect x="316" y="198" width="22" height="20" />
        <circle cx="200" cy="208" r="0.6" fill="#fff" />
      </g>

      {/* Crowd shimmer on the front edge */}
      <ellipse cx="200" cy="248" rx="155" ry="6" fill={c.glow} opacity="0.35" />
    </svg>
  );
};

const PkgPlaceholder = ({ country, city, seedKey, slotId, slotLabel }) => {
  // Hash do id pra ângulo/posição únicos
  const seed = (seedKey || "").split("").reduce((a, ch) => a + ch.charCodeAt(0), 0);
  return (
    <div className={`pkg-placeholder country-${country}`} aria-hidden="true">
      <StadiumArt country={country} seed={seed} label={city} />
      <MediaSlot
        id={slotId}
        label={slotLabel}
        group="Pacotes"
        anchor={slotId}
        placeholder={`Foto · ${city}`}
        className="pkg-slot"
      />
    </div>
  );
};

const includeIcon = (text) => {
  const t = text.toLowerCase();
  if (t.includes("voo")) return "plane";
  if (t.includes("hotel") || t.includes("hosped")) return "hotel";
  if (t.includes("ingresso")) return "ticket";
  if (t.includes("dia") || t.includes("noite")) return "calendar";
  if (t.includes("tour") || t.includes("city")) return "map-pin";
  if (t.includes("concierge")) return "sparkles";
  return "check";
};

const flagFor = (pais) => pais === "USA" ? "usa" : pais === "CAN" ? "can" : "mex";

const PacoteCard = ({ p, delay, installments }) => {
  const country = flagFor(p.pais);
  const tagClass = p.tag ? `t-${p.tag}` : "";

  // Calcula desconto se tiver precoCheio
  const hasDiscount = p.precoCheio && p.precoCheio > p.preco;
  const discountPct = hasDiscount ? Math.round((1 - p.preco / p.precoCheio) * 100) : 0;

  // Click → modal de confirmação → envio com detalhes pro WhatsApp
  const onSolicitar = () => {
    // Pede passageiros via modal antes de mandar
    if (typeof window.openPacoteModal === "function") {
      window.openPacoteModal(p);
    } else {
      window.sendToWhatsApp({ pacote: p });
    }
  };

  return (
    <Reveal delay={delay} className="pkg-card">
      <div className="pkg-media">
        <div className="img">
          {p.image ? (
            <img
              src={p.image}
              alt={p.titulo}
              loading="lazy"
              className="pkg-img-real"
              onError={(ev) => { ev.target.style.display = "none"; }}
            />
          ) : (
            <PkgPlaceholder
              country={p.pais}
              city={p.cidadeSede}
              seedKey={p.id}
              slotId={`pkg-${p.id}`}
              slotLabel={p.titulo}
            />
          )}
        </div>
        <div className="pkg-media-overlay"></div>
        {p.tag && (
          <span className={`pkg-tag ${tagClass}`}>
            <span className="tag-dot"></span>
            {p.tagText}
          </span>
        )}
        {hasDiscount && (
          <span className="pkg-discount-badge">−{discountPct}%</span>
        )}
        <span className={`pkg-flag ${country}`} aria-label={`Bandeira ${p.pais}`}></span>
        <div className="pkg-headline">
          <div className="pkg-stage">{p.fase}</div>
          <div className="pkg-name">{p.titulo}</div>
          <div className="pkg-city">{p.cidadeSede} · {p.dataInicio} – {p.dataFim}</div>
          {p.matchHighlight && (
            <div className="pkg-match-hl">
              <Icon name="map-pin" size={11} strokeWidth={2.2} /> {p.matchHighlight}
            </div>
          )}
        </div>
      </div>
      <div className="pkg-body">
        <ul className="pkg-includes">
          {p.inclusos.map((it, i) => (
            <li key={i}>
              <span className="ic"><Icon name={includeIcon(it)} size={13} strokeWidth={2} /></span>
              {it}
            </li>
          ))}
        </ul>
        {p.vagas && p.vagas <= 30 && (
          <div className="pkg-vagas">
            <span className="vagas-dot"></span>
            <b>Últimas {p.vagas} vagas</b> neste preço
          </div>
        )}
        <div className="pkg-foot">
          <div className="pkg-price">
            <span className="from">A partir de</span>
            {hasDiscount && (
              <div className="price-old">{fmtBRL(p.precoCheio)}</div>
            )}
            <div className="value">{fmtBRL(p.preco)}</div>
            <div className="install">
              ou <b>{installments}× de {fmtBRL(Math.round(p.preco / installments))}</b> sem juros
            </div>
          </div>
          <button className="btn-wa-pkg" onClick={onSolicitar} type="button">
            <Icon name="whatsapp" size={14} />
            Solicitar pacote
          </button>
        </div>
      </div>
    </Reveal>
  );
};

const Pacotes = ({ installments = 18 }) => {
  useDataVersion();
  const [filter, setFilter] = React.useState("all");
  const filters = [
    { id: "all", label: "Todos" },
    { id: "USA", label: "Estados Unidos" },
    { id: "MEX", label: "México" },
    { id: "CAN", label: "Canadá" },
    { id: "final", label: "Mata-mata" }
  ];
  const counts = {
    all: PACOTES.length,
    USA: PACOTES.filter(p => p.pais === "USA").length,
    MEX: PACOTES.filter(p => p.pais === "MEX").length,
    CAN: PACOTES.filter(p => p.pais === "CAN").length,
    final: PACOTES.filter(p => /final|oitavas|quartas|semi/i.test(p.fase)).length
  };
  const visible = filter === "all"
    ? PACOTES
    : filter === "final"
      ? PACOTES.filter(p => /final|oitavas|quartas|semi/i.test(p.fase))
      : PACOTES.filter(p => p.pais === filter);

  return (
    <section id="pacotes" className="pacotes-section">
      <div className="wrap">
        <Reveal as="div" className="section-head">
          <span className="eyebrow"><span className="dot"></span>Pacotes 2026 · 6 roteiros · Preços promocionais</span>
          <h2>Escolha o seu<br/><span className="gold-grad">pacote</span></h2>
          <p className="lede">
            <b style={{color:"var(--ink)"}}>Vamos buscar o Hexa!</b> 🇧🇷 Seis pacotes principais selecionados pela nossa equipe, dos grupos à grande final — todos por <b style={{color:"var(--gold)"}}>preço promocional de lançamento</b>. Personalize com a gente pelo WhatsApp.
          </p>
        </Reveal>

        <Reveal as="div" className="pay-banner" delay={80}>
          <div className="pb-icon"><Icon name="sparkles" size={20} /></div>
          <div className="pb-text">
            <div className="pb-headline">
              Parcele em até <em>{installments}× sem juros</em>
            </div>
            <div className="pb-sub">Todos os cartões · Pix com 5% de desconto · transferência internacional sob consulta</div>
          </div>
          <div className="pb-chips">
            <span>Visa</span><span>Master</span><span>Amex</span><span>Pix</span>
          </div>
        </Reveal>

        <Reveal as="div" className="pacotes-toolbar" delay={160}>
          {filters.map((f) => (
            <button key={f.id}
              className={`chip ${filter === f.id ? "active" : ""}`}
              onClick={() => setFilter(f.id)}>
              {f.label}<span className="count">{counts[f.id]}</span>
            </button>
          ))}
        </Reveal>

        <div className="pkg-grid">
          {visible.map((p, i) => (
            <PacoteCard key={p.id} p={p} delay={(i % 3) * 100} installments={installments} />
          ))}
        </div>
      </div>
    </section>
  );
};

// ─── GALERIA SEDES ──────────────────────────────────────────────
const Sedes = () => {
  // Lê overrides de imagens do admin (vnc:sede-images)
  const [imgOverrides, setImgOverrides] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem("vnc:sede-images") || "{}"); }
    catch { return {}; }
  });
  React.useEffect(() => {
    const fn = (e) => setImgOverrides(e.detail || {});
    window.addEventListener("sede-images-change", fn);
    return () => window.removeEventListener("sede-images-change", fn);
  }, []);

  return (
    <section id="sedes" className="sedes-section">
      <VideoBackground
        src="hero-bg-alt"
        poster="hero-bg-alt-poster.jpg"
        loopFadeMs={500}
        eager={false}
        overlay={0.82}
        className="sedes-video-bg"
      />
      <div className="wrap">
        <Reveal as="div" className="section-head">
          <span className="eyebrow"><span className="dot"></span>16 cidades-sede</span>
          <h2>Três países,<br/><span className="gold-grad">um campeonato</span></h2>
          <p className="lede">A maior edição da história. Da Costa Leste americana ao Pacífico, passando pelo coração do México e atravessando as Rochosas canadenses.</p>
        </Reveal>

        <div className="sedes-grid">
          {SEDES.map((s, i) => {
            const sid = `sede-${i}`;
            const spanClass =
              s.span === "xl" ? "span-xl" :
              s.span === "w"  ? "span-w"  :
              s.span === "h"  ? "span-h"  : "";
            // Prioridade: override do admin > URL no data > nada (fallback)
            const finalImage = imgOverrides[sid] || s.image;
            return (
              <Reveal key={s.city} delay={(i % 4) * 80}
                className={`sede ${spanClass}`}>
                {/* Foto icônica da cidade (fundo).
                    Ordem: override admin → URL data.jsx → fallback */}
                <div className={`sede-img ${s.country}`}>
                  {finalImage && (
                    <img
                      src={finalImage}
                      alt={`${s.city} · ${s.stadium}`}
                      loading="lazy"
                      onError={(ev) => {
                        // Esconde a img — o fallback CSS aparece
                        ev.target.style.display = "none";
                        ev.target.parentElement.classList.add("img-failed");
                      }}
                    />
                  )}
                  {/* Fallback visual (gradiente colorido + nome da cidade gigante) */}
                  <div className="sede-img-fallback" aria-hidden="true">
                    <div className="fallback-label">{s.city}</div>
                  </div>
                </div>
                {/* Slot do admin (sobrescreve a foto se cliente subir uma) */}
                <MediaSlot
                  id={sid}
                  label={s.city}
                  group="Sedes"
                  anchor={sid}
                  placeholder={s.city}
                  className="sede-slot"
                />
                {/* Gradiente escuro pra legibilidade do texto */}
                <div className="sede-overlay"></div>
                {/* Tag colorida no canto (USA/MEX/CAN) */}
                <span className={`sede-flagdot ${s.country}`}></span>
                {/* Conteúdo (nome cidade + estádio + nota) */}
                <div className="sede-content">
                  <div className="sede-city">{s.city}</div>
                  <div className="sede-stadium">{s.stadium}</div>
                  {s.note && (s.span === "xl" || s.span === "w") && (
                    <div className="sede-note">{s.note}</div>
                  )}
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
};

// ─── CTA strip WhatsApp ─────────────────────────────────────────
const CTAStrip = ({ brand, installments = 18 }) => {
  const msg = "Olá! Quero montar um roteiro personalizado para a Copa 2026.";
  return (
    <section className="cta-strip" id="contato">
      <VideoBackground
        src="fans-loop"
        poster="fans-loop-poster.jpg"
        loopFadeMs={500}
        eager={false}
        overlay={0.72}
        className="cta-video-bg"
      />
      <div className="wrap cta-inner">
        <Reveal>
          <span className="eyebrow"><span className="dot"></span>Roteiro sob medida</span>
          <h2 style={{marginTop: 14}}>Não encontrou<br/>o pacote <em>ideal</em>?</h2>
          <p className="lede">Montamos roteiros 100% personalizados — combinando jogos, cidades, hotéis e experiências exatamente como você imaginou. Em até 48 horas você recebe sua proposta, com pagamento em até <b style={{color:"var(--gold)"}}>{installments}× sem juros</b>.</p>
          <div style={{marginTop: 28, display:"flex", gap: 12, flexWrap:"wrap"}}>
            <a href={waLink(msg)} target="_blank" rel="noopener" className="btn btn-wa">
              <Icon name="whatsapp" size={20}/> Falar com um especialista
            </a>
            <a href="#pacotes" className="btn btn-outline">Voltar aos pacotes</a>
          </div>
        </Reveal>

        <Reveal delay={160}>
          <div className="cta-card">
            <div className="row">
              <div className="av">M</div>
              <div>
                <div className="who">Mariana · {brand}</div>
                <div className="role">Especialista em Copa do Mundo</div>
                <div className="who-online">Online agora · responde em ~3 min</div>
              </div>
            </div>
            <div className="qr">
              <div className="qr-box" aria-hidden="true"></div>
              <div className="qr-hint">
                Aponte a câmera ou <b>toque no botão</b> para abrir uma conversa direta com nosso time. Sem formulário, sem espera.
              </div>
            </div>
            <a href={waLink(msg)} target="_blank" rel="noopener" className="btn btn-wa">
              <Icon name="whatsapp" size={18}/> Abrir WhatsApp
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

// ─── Seção dedicada de assessoria de VISTO (landing page) ────────
const VisaSection = () => {
  const msg = "Olá! Quero saber mais sobre a assessoria de visto pra Copa 2026.";
  return (
    <section className="visa-section" id="visto">
      {/* Vídeo de fundo (ambiente, partículas douradas) */}
      <div className="visa-ambient-video" aria-hidden="true">
        <VideoBackground
          src="uploads/visa-bg-loop"
          poster="uploads/visa-bg-loop-poster.jpg"
          className="visa-bg-video"
          eager={false}
        />
        <div className="visa-ambient-overlay"></div>
      </div>
      <div className="visa-bg-glow" aria-hidden="true"></div>
      <div className="wrap">
        <div className="visa-wrap">
          {/* Coluna esquerda — vídeo cinemato do passaporte */}
          <Reveal as="div" className="visa-passport">
            <div className="visa-video-wrap">
              <VideoBackground
                src="uploads/visto-loop"
                poster="uploads/visto-loop-poster.jpg"
                className="visa-video"
                eager={false}
              />
              <div className="visa-video-overlay" aria-hidden="true"></div>
              <div className="visa-video-glow" aria-hidden="true"></div>
            </div>
          </Reveal>

          {/* Coluna direita — conteúdo */}
          <div className="visa-content">
            <Reveal>
              <span className="eyebrow"><span className="dot"></span>Diferencial exclusivo</span>
              <h2 className="visa-h2">
                <span className="visa-tag-emoji">🛂</span>
                Precisa de visto?<br/>
                <span className="gold-grad">A gente resolve!</span>
              </h2>
            </Reveal>

            <Reveal delay={120}>
              <p className="visa-lede">
                Pra entrar nos <b>EUA</b> <FlagSVG country="USA" size={13} className="flag-inline"/> ou <b>Canadá</b> <FlagSVG country="CAN" size={13} className="flag-inline"/> você precisa de visto válido. Mas isso <b>não é problema seu</b> — nosso time cuida de todo o processo, do zero ao deferimento.
              </p>
            </Reveal>

            <Reveal delay={200}>
              <div className="visa-guarantee">
                <span className="vg-icon">🏆</span>
                <div>
                  <div className="vg-title">Garantimos aprovação</div>
                  <div className="vg-sub">Se seu visto for negado por culpa nossa, devolvemos 100% da taxa de assessoria.</div>
                </div>
              </div>
            </Reveal>

            <ul className="visa-checklist">
              {[
                "Agendamento da entrevista no consulado mais próximo",
                "Preenchimento dos formulários DS-160 (EUA) e eTA (Canadá)",
                "Orientação completa pré-entrevista — perguntas e documentos",
                "Acompanhamento até o deferimento do visto",
                "Renovação de passaporte e fotos no padrão exigido"
              ].map((t, i) => (
                <Reveal key={i} delay={260 + i * 80} as="li">
                  <span className="vc-tick">✓</span>
                  <span>{t}</span>
                </Reveal>
              ))}
            </ul>

            <Reveal delay={680} className="visa-actions">
              <a href={waLink(msg)} target="_blank" rel="noopener" className="btn btn-wa visa-section-cta">
                <Icon name="whatsapp" size={20}/>
                Falar com especialista no WhatsApp
              </a>
              <div className="visa-actions-note">
                México? <b>Brasileiro não precisa de visto</b> <FlagSVG country="MEX" size={13} className="flag-inline"/> ✅
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
};
// ─── FOOTER · usa dados do admin ────────────────────────────────
const Footer = ({ brand }) => {
  const [cfg, setCfg] = React.useState(() => getSiteConfig());
  React.useEffect(() => {
    const fn = (e) => setCfg(e.detail || getSiteConfig());
    window.addEventListener("site-config-change", fn);
    return () => window.removeEventListener("site-config-change", fn);
  }, []);
  const e = cfg.empresa || {};
  const phone = e.telefone || "+55 11 99999-9999";
  const email = e.email || "contato@vocenacopa.com.br";
  const insta = e.instagram || "@vocenacopa";
  const instaUrl = e.instagramUrl || "https://instagram.com";

  return (
  <footer>
    <div className="wrap">
      <div className="foot-grid">
        <div className="foot-brand">
          <div className="h-display gold-grad" style={{fontSize: 56}}>{brand}</div>
          <p>Vitrine de pacotes premium para a Copa do Mundo 2026. Atendimento humano, curadoria honesta e suporte 24/7 durante toda a sua viagem.</p>
          <div className="foot-seals">
            {e.cadastur && <span className="seal-pill">CADASTUR {e.cadastur}</span>}
            {cfg.selos?.abavMembro && <span className="seal-pill">Membro ABAV</span>}
            {cfg.selos?.iata && <span className="seal-pill">IATA</span>}
          </div>
        </div>
        <div className="foot-col">
          <h4>Navegue</h4>
          <ul>
            <li><a href="#pacotes">Pacotes</a></li>
            <li><a href="#sedes">Cidades-sede</a></li>
            <li><a href="#depoimentos">Depoimentos</a></li>
            <li><a href="#faq">FAQ</a></li>
            <li><a href="#contato">Roteiro sob medida</a></li>
          </ul>
        </div>
        <div className="foot-col">
          <h4>Contato</h4>
          <ul>
            <li><a href={waLink()} target="_blank" rel="noopener" className="with-ic"><Icon name="whatsapp" size={14}/> {phone}</a></li>
            <li><a href={`mailto:${email}`} className="with-ic"><Icon name="mail" size={14}/> {email}</a></li>
            <li><a href={instaUrl} target="_blank" rel="noopener" className="with-ic"><Icon name="instagram" size={14}/> {insta}</a></li>
          </ul>
        </div>
        <div className="foot-col">
          <h4>Institucional</h4>
          <ul>
            {e.cnpj && <li>CNPJ {e.cnpj}</li>}
            {e.cadastur && <li>CADASTUR {e.cadastur}</li>}
            <li><a href="#privacidade" onClick={(ev)=>{ev.preventDefault(); window.openLegalModal?.("privacidade");}}>Política de privacidade</a></li>
            <li><a href="#termos" onClick={(ev)=>{ev.preventDefault(); window.openLegalModal?.("termos");}}>Termos &amp; condições</a></li>
            <li><a href="#faq">FAQ</a></li>
          </ul>
        </div>
      </div>

      <div className="foot-disclaimer">
        <b>Aviso importante:</b> Não somos revendedores oficiais nem temos qualquer vínculo com a FIFA. Nossos pacotes incluem hospedagem, voos, transfers e experiências locais; os ingressos são adquiridos por meio de parceiros credenciados e revendedores autorizados. Disponibilidade, preços e itinerários estão sujeitos a alteração até o fechamento do contrato.
      </div>

      <div className="foot-bottom">
        <span>© 2026 {brand} · Todos os direitos reservados</span>
        <span>Feito com paixão pelo futebol</span>
      </div>
    </div>
  </footer>
  );
};

// ─── DEPOIMENTOS · prova social ─────────────────────────────────
const Depoimentos = () => {
  const [cfg, setCfg] = React.useState(() => getSiteConfig());
  React.useEffect(() => {
    const fn = (e) => setCfg(e.detail || getSiteConfig());
    window.addEventListener("site-config-change", fn);
    return () => window.removeEventListener("site-config-change", fn);
  }, []);
  const depos = cfg.depoimentos || [];
  if (!depos.length) return null;

  return (
    <section id="depoimentos" className="depo-section">
      <div className="wrap">
        <Reveal as="div" className="section-head">
          <span className="eyebrow"><span className="dot"></span>Quem viajou conosco</span>
          <h2>O que dizem<br/><span className="gold-grad">nossos viajantes</span></h2>
          <p className="lede">Histórias reais de quem confiou em nós para Copas anteriores. <b style={{color:"var(--gold)"}}>+ de 1.200 clientes atendidos</b> em Rússia 2018 e Catar 2022.</p>
        </Reveal>
        <div className="depo-grid">
          {depos.map((d, i) => (
            <Reveal key={i} delay={(i % 3) * 100} className="depo-card">
              <div className="depo-stars">★★★★★</div>
              <p className="depo-text">"{d.texto}"</p>
              <div className="depo-author">
                <div className="depo-avatar" aria-hidden="true">
                  {d.avatar
                    ? <img src={d.avatar} alt={d.nome} />
                    : <span>{d.nome.split(" ").map(n => n[0]).slice(0,2).join("")}</span>}
                </div>
                <div>
                  <div className="depo-nome">{d.nome}</div>
                  <div className="depo-local">{d.local} · <em>{d.viagem}</em></div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

// ─── FAQ · perguntas frequentes ────────────────────────────────
const FAQ = () => {
  const [cfg, setCfg] = React.useState(() => getSiteConfig());
  const [open, setOpen] = React.useState(null);
  React.useEffect(() => {
    const fn = (e) => setCfg(e.detail || getSiteConfig());
    window.addEventListener("site-config-change", fn);
    return () => window.removeEventListener("site-config-change", fn);
  }, []);
  const faq = cfg.faq || [];
  if (!faq.length) return null;

  return (
    <section id="faq" className="faq-section">
      <div className="wrap">
        <Reveal as="div" className="section-head">
          <span className="eyebrow"><span className="dot"></span>Perguntas frequentes</span>
          <h2>Tira suas<br/><span className="gold-grad">dúvidas</span></h2>
        </Reveal>
        <div className="faq-list">
          {faq.map((f, i) => (
            <Reveal key={i} delay={(i % 3) * 80} className={`faq-item ${open === i ? "open" : ""}`}>
              <button
                className="faq-q"
                onClick={() => setOpen(open === i ? null : i)}
                aria-expanded={open === i}
              >
                <span>{f.q}</span>
                <span className="faq-chevron">{open === i ? "−" : "+"}</span>
              </button>
              {open === i && <div className="faq-r">{f.r}</div>}
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

// ─── FORMULÁRIO ALTERNATIVO · "Me liga em até 24h" ─────────────
const ContactForm = () => {
  const [form, setForm] = React.useState({
    nome: "", telefone: "", melhorHorario: "manha", mensagem: ""
  });
  const [sent, setSent] = React.useState(false);

  const submit = (ev) => {
    ev.preventDefault();
    if (!form.nome || !form.telefone) return;
    // Envia via WhatsApp formatado
    const msg = `📞 *SOLICITAÇÃO DE LIGAÇÃO · COPA 2026*\n\n` +
      `*Nome:* ${form.nome}\n` +
      `*Telefone:* ${form.telefone}\n` +
      `*Melhor horário:* ${ {manha:"Manhã (8h-12h)", tarde:"Tarde (12h-18h)", noite:"Noite (18h-21h)"}[form.melhorHorario] }\n` +
      (form.mensagem ? `*Mensagem:* ${form.mensagem}\n` : "") +
      `\n_Aguardo retorno em até 24h._`;
    window.open(waLink(msg), "_blank", "noopener");
    setSent(true);
    if (typeof gtag === "function") gtag("event", "lead_form_submit");
  };

  if (sent) return (
    <div className="contact-form-success">
      <div className="cf-check">✓</div>
      <h3>Recebemos seu pedido!</h3>
      <p>Vamos te ligar em até 24h no horário que escolheu. Pode preparar a fantasia! 🇧🇷</p>
    </div>
  );

  return (
    <form className="contact-form" onSubmit={submit}>
      <h3>Prefere que a gente te ligue?</h3>
      <p className="cf-sub">Deixe seus dados — retornamos em até 24h.</p>

      <div className="cf-field">
        <label>Nome completo *</label>
        <input type="text" required value={form.nome}
          onChange={(e) => setForm({...form, nome: e.target.value})} />
      </div>

      <div className="cf-field">
        <label>Telefone com DDD *</label>
        <input type="tel" required placeholder="(11) 99999-9999" value={form.telefone}
          onChange={(e) => setForm({...form, telefone: e.target.value})} />
      </div>

      <div className="cf-field">
        <label>Melhor horário pra ligar</label>
        <select value={form.melhorHorario}
          onChange={(e) => setForm({...form, melhorHorario: e.target.value})}>
          <option value="manha">Manhã (8h–12h)</option>
          <option value="tarde">Tarde (12h–18h)</option>
          <option value="noite">Noite (18h–21h)</option>
        </select>
      </div>

      <div className="cf-field">
        <label>Mensagem (opcional)</label>
        <textarea rows="3" placeholder="Conte um pouco do que você procura..."
          value={form.mensagem}
          onChange={(e) => setForm({...form, mensagem: e.target.value})} />
      </div>

      <button type="submit" className="btn btn-gold">
        Solicitar contato
      </button>
    </form>
  );
};

// ─── MODAL · Confirmação de pacote com passageiros ──────────────
const PacoteModal = () => {
  const [pacote, setPacote] = React.useState(null);
  const [pax, setPax] = React.useState({ adults: 2, children: 0, babies: 0 });

  React.useEffect(() => {
    window.openPacoteModal = (p) => { setPacote(p); setPax({adults:2,children:0,babies:0}); };
    return () => { delete window.openPacoteModal; };
  }, []);

  if (!pacote) return null;

  const close = () => setPacote(null);

  const sendNow = () => {
    sendToWhatsApp({ pacote, passengers: pax });
    if (typeof gtag === "function") gtag("event", "select_package", { package_id: pacote.id });
    close();
  };

  const adjust = (key, delta) => {
    const cur = pax[key];
    const next = Math.max(0, Math.min(9, cur + delta));
    if (key === "adults" && next < 1) return;
    const total = (key === "adults" ? next : pax.adults) +
                  (key === "children" ? next : pax.children) +
                  (key === "babies" ? next : pax.babies);
    if (total > 9) return;
    setPax({...pax, [key]: next});
  };

  return (
    <div className="modal-backdrop" onClick={close}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={close} aria-label="Fechar">×</button>
        <div className="modal-eyebrow">Confirme os detalhes</div>
        <h3 className="modal-title">{pacote.titulo}</h3>
        <div className="modal-info">
          <div className="mi-row"><span>📍 Destino</span><b>{pacote.cidadeSede}</b></div>
          <div className="mi-row"><span>📅 Período</span><b>{pacote.dataInicio} – {pacote.dataFim}</b></div>
          <div className="mi-row"><span>💰 Valor base</span><b>{fmtBRL(pacote.preco)}</b></div>
        </div>

        <div className="modal-pax">
          <h4>Quantos passageiros?</h4>
          {[
            { k: "adults",   label: "Adultos",         sub: "18+ anos" },
            { k: "children", label: "Crianças",        sub: "2 a 17 anos · 75% do valor" },
            { k: "babies",   label: "Bebês de colo",   sub: "0 a 23 meses · 10% do valor" }
          ].map(({k, label, sub}) => (
            <div className="pax-row" key={k}>
              <div>
                <div className="pax-label">{label}</div>
                <div className="pax-sub">{sub}</div>
              </div>
              <div className="pax-ctrl">
                <button type="button" onClick={() => adjust(k, -1)} disabled={pax[k] === 0 || (k === "adults" && pax[k] === 1)}>−</button>
                <span>{pax[k]}</span>
                <button type="button" onClick={() => adjust(k, +1)}>+</button>
              </div>
            </div>
          ))}
          <div className="pax-total">
            Total: <b>{pax.adults + pax.children + pax.babies} passageiro(s)</b>
          </div>
        </div>

        <button className="btn btn-wa modal-cta" onClick={sendNow}>
          <Icon name="whatsapp" size={18} /> Enviar pelo WhatsApp
        </button>
        <p className="modal-disclaimer">
          Ao enviar, abriremos o WhatsApp com todos os dados pré-preenchidos. Nossa equipe responde em até 3 minutos.
        </p>
      </div>
    </div>
  );
};

// ─── MODAL · Páginas legais (Privacidade / Termos) ──────────────
const LegalModal = () => {
  const [which, setWhich] = React.useState(null);
  React.useEffect(() => {
    window.openLegalModal = (key) => setWhich(key);
    return () => { delete window.openLegalModal; };
  }, []);
  if (!which) return null;
  const cfg = getSiteConfig();
  const title = which === "privacidade" ? "Política de Privacidade" : "Termos & Condições";
  const text = which === "privacidade"
    ? cfg.paginas?.politicaPrivacidade
    : cfg.paginas?.termosCondicoes;
  return (
    <div className="modal-backdrop" onClick={() => setWhich(null)}>
      <div className="modal-card legal-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={() => setWhich(null)}>×</button>
        <h3 className="modal-title">{title}</h3>
        <div className="legal-text" style={{whiteSpace:"pre-wrap"}}>{text}</div>
      </div>
    </div>
  );
};

// ─── FAB WhatsApp ───────────────────────────────────────────────
const FabWhatsApp = () => (
  <a className="fab-wa"
     href={waLink("Olá! Quero saber mais sobre os pacotes da Copa 2026.")}
     target="_blank" rel="noopener"
     aria-label="Falar conosco no WhatsApp"
     onClick={() => { if (typeof gtag === "function") gtag("event", "click_whatsapp_fab"); }}>
    <Icon name="whatsapp" size={30} />
    <span className="fab-tooltip">Fale conosco</span>
  </a>
);

Object.assign(window, { Diferenciais, Pacotes, Sedes, CTAStrip, VisaSection, Footer, FabWhatsApp, Depoimentos, FAQ, ContactForm, PacoteModal, LegalModal });

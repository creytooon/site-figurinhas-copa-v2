// ════════════════════════════════════════════════════════════════
// HERO BACKGROUND · ambiente de estádio à noite animado
//
// Pura CSS+SVG (sem arquivo de vídeo). Multi-camadas:
//  1. Atmosfera com glows tricolor (EUA · CAN · MEX) shiftando
//  2. Refletores de estádio varrendo o céu
//  3. Skyline de cidade em parallax
//  4. Estádio em silhueta na frente
//  5. Fogos de artifício pulsando em sequência
//  6. Faíscas/partículas subindo
// Sobre tudo passa um overlay escuro (no styles.css) p/ legibilidade.
// ════════════════════════════════════════════════════════════════

const HeroBackground = () => {
  // Gera partículas com posições/timings determinísticos pra não causar
  // re-render desnecessário. Random fixo via Math.sin(seed).
  const sparks = React.useMemo(() => {
    const rng = (n) => {
      const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453;
      return x - Math.floor(x);
    };
    return Array.from({ length: 40 }, (_, i) => ({
      x: rng(i) * 1920,
      delay: rng(i + 100) * 8,
      dur: 6 + rng(i + 200) * 5,
      r: 0.8 + rng(i + 300) * 1.6,
      drift: (rng(i + 400) - 0.5) * 120,
      color: rng(i + 500) > 0.7 ? "gold" : "white"
    }));
  }, []);

  // 5 fogos disparam em momentos diferentes
  const fireworks = [
    { cx: 380,  cy: 220, delay: "0s",   color: "#FFD66B" },
    { cx: 980,  cy: 160, delay: "1.4s", color: "#FFB4B4" },
    { cx: 1560, cy: 240, delay: "2.8s", color: "#A6F0B0" },
    { cx: 640,  cy: 320, delay: "4.2s", color: "#9EC9FF" },
    { cx: 1320, cy: 180, delay: "5.6s", color: "#FFE9B0" }
  ];

  // Skyline — silhuetas de prédios
  const buildings = React.useMemo(() => {
    const rng = (n) => {
      const x = Math.sin(n * 7.13 + 23.5) * 1000;
      return x - Math.floor(x);
    };
    return Array.from({ length: 38 }, (_, i) => ({
      x: i * 52 + rng(i) * 8,
      w: 40 + rng(i + 1) * 18,
      h: 60 + rng(i + 2) * 140,
      lights: Math.floor(rng(i + 3) * 6) + 1
    }));
  }, []);

  return (
    <div className="hero-bg" aria-hidden="true">
      <svg className="hero-bg-svg"
           viewBox="0 0 1920 1080"
           preserveAspectRatio="xMidYMid slice">
        <defs>
          <radialGradient id="hb-blue" cx="50%" cy="50%" r="50%">
            <stop offset="0%"  stopColor="#3B6FE8" stopOpacity="0.55"/>
            <stop offset="60%" stopColor="#3B6FE8" stopOpacity="0"/>
          </radialGradient>
          <radialGradient id="hb-red" cx="50%" cy="50%" r="50%">
            <stop offset="0%"  stopColor="#E84A52" stopOpacity="0.45"/>
            <stop offset="60%" stopColor="#E84A52" stopOpacity="0"/>
          </radialGradient>
          <radialGradient id="hb-green" cx="50%" cy="50%" r="50%">
            <stop offset="0%"  stopColor="#4FCC78" stopOpacity="0.35"/>
            <stop offset="60%" stopColor="#4FCC78" stopOpacity="0"/>
          </radialGradient>
          <radialGradient id="hb-gold" cx="50%" cy="50%" r="50%">
            <stop offset="0%"  stopColor="#F4D77A" stopOpacity="0.40"/>
            <stop offset="60%" stopColor="#F4D77A" stopOpacity="0"/>
          </radialGradient>

          <linearGradient id="hb-beam" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%"   stopColor="#ffffff" stopOpacity="0"/>
            <stop offset="35%"  stopColor="#ffffff" stopOpacity="0.10"/>
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.25"/>
          </linearGradient>

          <linearGradient id="hb-pitch" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#0e6b3a"/>
            <stop offset="100%" stopColor="#073b1f"/>
          </linearGradient>

          <linearGradient id="hb-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#06080F"/>
            <stop offset="60%"  stopColor="#0A0A14"/>
            <stop offset="100%" stopColor="#0A0A0F"/>
          </linearGradient>

          {/* Reusable firework "explosion" */}
          <symbol id="hb-fw" viewBox="-50 -50 100 100">
            {Array.from({ length: 16 }, (_, i) => {
              const a = (i / 16) * Math.PI * 2;
              const r = 42;
              return (
                <g key={i} transform={`rotate(${(i * 360) / 16})`}>
                  <line x1="0" y1="-6" x2="0" y2={`-${r}`}
                        stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                  <circle cx="0" cy={`-${r}`} r="1.5" fill="currentColor"/>
                </g>
              );
            })}
            <circle cx="0" cy="0" r="3" fill="currentColor"/>
          </symbol>
        </defs>

        {/* 1 · Sky base */}
        <rect width="1920" height="1080" fill="url(#hb-sky)"/>

        {/* 2 · Atmosphere glows (shift, blend) */}
        <g style={{ mixBlendMode: "screen" }}>
          <circle className="hb-glow g1" cx="380"  cy="280" r="520" fill="url(#hb-blue)"/>
          <circle className="hb-glow g2" cx="1560" cy="320" r="520" fill="url(#hb-red)"/>
          <circle className="hb-glow g3" cx="960"  cy="220" r="600" fill="url(#hb-gold)"/>
          <circle className="hb-glow g4" cx="1100" cy="540" r="500" fill="url(#hb-green)"/>
          <circle className="hb-glow g5" cx="780"  cy="500" r="450" fill="url(#hb-blue)"/>
        </g>

        {/* 3 · Static stars / city lights up high */}
        <g className="hb-stars">
          {Array.from({ length: 80 }, (_, i) => {
            const seed = i * 0.83 + 0.1;
            const x = (Math.sin(seed * 50) * 0.5 + 0.5) * 1920;
            const y = (Math.cos(seed * 70) * 0.5 + 0.5) * 480;
            const r = 0.4 + ((seed * 9) % 1) * 1.0;
            const o = 0.3 + ((seed * 13) % 1) * 0.5;
            return <circle key={i} cx={x} cy={y} r={r} fill="#fff" opacity={o}
                            className="hb-star" style={{ animationDelay: `${(i * 0.1) % 4}s` }}/>;
          })}
        </g>

        {/* 4 · Spotlight beams (4 beams swinging from stadium) */}
        <g className="hb-beams">
          <g style={{ transformOrigin: "420px 880px" }} className="hb-beam beam-a">
            <polygon points="420,880 360,40 480,40" fill="url(#hb-beam)"/>
          </g>
          <g style={{ transformOrigin: "780px 880px" }} className="hb-beam beam-b">
            <polygon points="780,880 740,40 860,40" fill="url(#hb-beam)"/>
          </g>
          <g style={{ transformOrigin: "1140px 880px" }} className="hb-beam beam-c">
            <polygon points="1140,880 1060,40 1180,40" fill="url(#hb-beam)"/>
          </g>
          <g style={{ transformOrigin: "1500px 880px" }} className="hb-beam beam-d">
            <polygon points="1500,880 1440,40 1560,40" fill="url(#hb-beam)"/>
          </g>
        </g>

        {/* 5 · Fireworks bursting */}
        <g className="hb-fireworks">
          {fireworks.map((f, i) => (
            <g key={i} transform={`translate(${f.cx} ${f.cy})`}
               style={{ color: f.color, animationDelay: f.delay }}
               className="hb-fw">
              <use href="#hb-fw" width="120" height="120" x="-60" y="-60"/>
            </g>
          ))}
        </g>

        {/* 6 · Sparks / floating particles */}
        <g className="hb-sparks">
          {sparks.map((s, i) => (
            <circle key={i}
                    cx={s.x} cy={1080}
                    r={s.r}
                    fill={s.color === "gold" ? "#F4D77A" : "#fff"}
                    className="hb-spark"
                    style={{
                      animationDelay: `${s.delay}s`,
                      animationDuration: `${s.dur}s`,
                      "--drift": `${s.drift}px`
                    }}/>
          ))}
        </g>

        {/* 7 · City skyline silhouette (parallax) */}
        <g className="hb-skyline">
          {buildings.map((b, i) => (
            <g key={i}>
              <rect x={b.x} y={760 - b.h} width={b.w} height={b.h} fill="#020206"/>
              {Array.from({ length: b.lights }, (_, j) => (
                <rect key={j}
                      x={b.x + 4 + (j % 3) * 10}
                      y={760 - b.h + 12 + Math.floor(j / 3) * 14}
                      width="3" height="3"
                      fill="#FFB85C" opacity={0.55 + ((i + j) % 5) / 12}
                      className="hb-window"
                      style={{ animationDelay: `${((i + j) % 7) * 0.7}s` }}/>
              ))}
            </g>
          ))}
        </g>

        {/* 8 · Stadium (foreground silhouette + pitch glow) */}
        <g className="hb-stadium">
          {/* Outer bowl (back of stadium) */}
          <ellipse cx="960" cy="900" rx="980" ry="170" fill="#000"/>
          <ellipse cx="960" cy="900" rx="980" ry="170" fill="none"
                   stroke="#1a1a22" strokeWidth="2"/>
          {/* Roof rim with light glow */}
          <path d="M -20,900 a 980,170 0 0 1 1960,0" fill="none"
                stroke="#D4AF37" strokeWidth="1.5" opacity="0.45"/>
          {/* Inner pit */}
          <ellipse cx="960" cy="930" rx="860" ry="120" fill="#040408"/>
          {/* Pitch glow */}
          <ellipse cx="960" cy="940" rx="720" ry="80" fill="url(#hb-pitch)" opacity="0.95"/>
          {/* Pitch markings */}
          <g stroke="#fff" fill="none" strokeWidth="1.2" opacity="0.55">
            <ellipse cx="960" cy="940" rx="700" ry="70"/>
            <line x1="960" y1="870" x2="960" y2="1010"/>
            <ellipse cx="960" cy="940" rx="48" ry="14"/>
          </g>
          {/* Light ring on rim */}
          <g className="hb-rim-lights">
            {Array.from({ length: 24 }, (_, i) => {
              const a = (i / 24) * Math.PI;
              const x = 960 + Math.cos(Math.PI + a) * 970;
              const y = 900 + Math.sin(Math.PI + a) * 165;
              return <circle key={i} cx={x} cy={y} r="2.5"
                             fill="#fff" opacity="0.7"
                             className="hb-rim-light"
                             style={{ animationDelay: `${(i * 0.12) % 2}s` }}/>;
            })}
          </g>
        </g>

        {/* 9 · Confetti dropping from sky (golden flecks) */}
        <g className="hb-confetti">
          {Array.from({ length: 24 }, (_, i) => {
            const seed = i * 1.37;
            const x = (Math.sin(seed * 30) * 0.5 + 0.5) * 1920;
            const delay = ((seed * 17) % 5);
            const dur = 7 + ((seed * 11) % 4);
            const tilt = ((seed * 23) % 90) - 45;
            return (
              <rect key={i} x={x} y={-20}
                    width="6" height="10"
                    fill={i % 3 === 0 ? "#D4AF37" : (i % 3 === 1 ? "#fff" : "#E8C660")}
                    transform={`rotate(${tilt} ${x} 0)`}
                    className="hb-conf"
                    style={{ animationDelay: `${delay}s`, animationDuration: `${dur}s` }}/>
            );
          })}
        </g>
      </svg>

      {/* CSS variável: ken-burns slow zoom em todo o SVG */}
      <div className="hero-bg-pan"></div>
    </div>
  );
};

Object.assign(window, { HeroBackground });

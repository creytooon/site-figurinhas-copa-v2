// ════════════════════════════════════════════════════════════════
// PRIMITIVOS · ícones SVG inline + animação ao entrar na viewport
// (sem dependências externas — Lucide reimplementado inline para
//  manter o arquivo auto-contido)
// ════════════════════════════════════════════════════════════════

// Bandeiras SVG inline — não dependem de emoji do sistema operacional
// (Windows não renderiza emoji de bandeira; cai pra letras "US CA MX").
const FlagSVG = ({ country, size = 16, className = "" }) => {
  const w = size * 1.5, h = size; // proporção 3:2
  const common = { width: w, height: h, viewBox: "0 0 30 20",
                   xmlns: "http://www.w3.org/2000/svg",
                   className: `flag-svg ${className}`,
                   style: { borderRadius: 2, display: "inline-block", verticalAlign: "middle" } };
  if (country === "USA" || country === "us") {
    // Bandeira proporção 19:10 (oficial), simplificada. Fundo branco + 7 listras vermelhas.
    return (
      <svg {...common} viewBox="0 0 38 20" aria-label="Estados Unidos">
        <rect width="38" height="20" fill="#fff"/>
        {/* 7 listras vermelhas em y=0,2,4,...,12 (cada altura 20/13 ≈ 1.54) */}
        {[0,1,2,3,4,5,6].map((i) => (
          <rect key={i} x="0" y={i * 2 * (20/13)} width="38" height={20/13} fill="#B22234"/>
        ))}
        {/* Canton azul (50% largura, 7 listras de altura = 7×20/13) */}
        <rect x="0" y="0" width="15.2" height={7 * 20/13} fill="#3C3B6E"/>
        {/* Estrelas: 9 fileiras alternadas (6+5+6+5+6+5+6+5+6 = 50) — simplificado pra 5×5 + 4×4 = 41 */}
        {(() => {
          const stars = [];
          const cantonH = 7 * 20/13;
          const cantonW = 15.2;
          for (let row = 0; row < 9; row++) {
            const isOdd = row % 2 === 1;
            const cols = isOdd ? 5 : 6;
            const stepY = cantonH / 9;
            const y = stepY * 0.5 + row * stepY;
            const stepX = cantonW / 12;
            const xOff = isOdd ? stepX * 2 : stepX;
            for (let c = 0; c < cols; c++) {
              const x = xOff + c * stepX * 2;
              stars.push(<circle key={`${row}-${c}`} cx={x} cy={y} r="0.42" fill="#fff"/>);
            }
          }
          return stars;
        })()}
      </svg>
    );
  }
  if (country === "CAN" || country === "ca") {
    return (
      <svg {...common} aria-label="Canadá">
        <rect x="0"  y="0" width="7.5" height="20" fill="#D52B1E" />
        <rect x="7.5" y="0" width="15"  height="20" fill="#fff" />
        <rect x="22.5" y="0" width="7.5" height="20" fill="#D52B1E" />
        {/* Folha de bordo estilizada */}
        <path d="M15 4
                 L16.3 7 L19 6.5 L17.5 9 L20 10.5 L17 11
                 L17.2 13 L15.8 12 L15 14 L14.2 12 L12.8 13
                 L13 11 L10 10.5 L12.5 9 L11 6.5 L13.7 7 Z"
              fill="#D52B1E"/>
      </svg>
    );
  }
  if (country === "MEX" || country === "mx") {
    return (
      <svg {...common} aria-label="México">
        <rect x="0" y="0" width="10" height="20" fill="#006847" />
        <rect x="10" y="0" width="10" height="20" fill="#fff" />
        <rect x="20" y="0" width="10" height="20" fill="#CE1126" />
        {/* Águia/serpente simplificada — círculo central marrom */}
        <ellipse cx="15" cy="10" rx="2.4" ry="2" fill="#7a4a1a" />
        <ellipse cx="15" cy="10" rx="1.4" ry="1.2" fill="#9a5a25" />
      </svg>
    );
  }
  if (country === "BRA" || country === "BR" || country === "br") {
    return (
      <svg {...common} aria-label="Brasil">
        <rect width="30" height="20" fill="#009C3B"/>
        <polygon points="15,3 27,10 15,17 3,10" fill="#FFDF00"/>
        <circle cx="15" cy="10" r="3.5" fill="#002776"/>
        <path d="M11.7 9.6 Q15 8.4 18.3 9.6" stroke="#fff" strokeWidth="0.4" fill="none"/>
      </svg>
    );
  }
  return null;
};

const Icon = ({ name, size = 20, strokeWidth = 1.8, ...rest }) => {
  const p = { width: size, height: size, viewBox: "0 0 24 24", fill: "none",
              stroke: "currentColor", strokeWidth, strokeLinecap: "round",
              strokeLinejoin: "round", ...rest };
  switch (name) {
    case "trophy":
      return <svg {...p}><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>;
    case "shield":
      return <svg {...p}><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg>;
    case "sparkles":
      return <svg {...p}><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/><path d="M4 17v2"/><path d="M5 18H3"/></svg>;
    case "plane":
      return <svg {...p}><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/></svg>;
    case "hotel":
      return <svg {...p}><path d="M10 22v-6.57"/><path d="M12 11h.01"/><path d="M12 7h.01"/><path d="M14 15.43V22"/><path d="M15 16a5 5 0 0 0-6 0"/><path d="M16 11h.01"/><path d="M16 7h.01"/><path d="M8 11h.01"/><path d="M8 7h.01"/><rect x="4" y="2" width="16" height="20" rx="2"/></svg>;
    case "ticket":
      return <svg {...p}><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/></svg>;
    case "calendar":
      return <svg {...p}><path d="M8 2v4"/><path d="M16 2v4"/><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M3 10h18"/></svg>;
    case "map-pin":
      return <svg {...p}><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>;
    case "arrow-right":
      return <svg {...p}><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>;
    case "arrow-down":
      return <svg {...p}><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>;
    case "whatsapp":
      return <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413"/></svg>;
    case "instagram":
      return <svg {...p}><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><path d="M17.5 6.5h.01"/></svg>;
    case "mail":
      return <svg {...p}><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>;
    case "star":
      return <svg {...p}><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/></svg>;
    case "headphones":
      return <svg {...p}><path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H4a1 1 0 0 1-1-1zm15 7h-2a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3v6a1 1 0 0 1-1 1zM3 14a9 9 0 0 1 18 0"/></svg>;
    case "globe":
      return <svg {...p}><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>;
    case "check":
      return <svg {...p}><path d="M20 6 9 17l-5-5"/></svg>;
    case "x":
      return <svg {...p}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>;
    case "menu":
      return <svg {...p}><path d="M4 12h16"/><path d="M4 6h16"/><path d="M4 18h16"/></svg>;
    default:
      return null;
  }
};

// Reveal-on-scroll usando IntersectionObserver
function useReveal(opts = {}) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          el.classList.add("in");
          io.unobserve(el);
        }
      });
    }, { threshold: 0.15, ...opts });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}

// Componente "Reveal" — wrapper com transição de entrada
const Reveal = ({ children, delay = 0, as: As = "div", className = "", ...rest }) => {
  const ref = useReveal();
  return (
    <As ref={ref} className={`reveal ${className}`} style={{ transitionDelay: `${delay}ms`, ...(rest.style || {}) }} {...rest}>
      {children}
    </As>
  );
};

Object.assign(window, { Icon, FlagSVG, useReveal, Reveal });

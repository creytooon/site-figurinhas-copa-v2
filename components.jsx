// components.jsx — Componentes compartilhados (Header, Footer, ProductCard, ícones, etc)

// ─── Logo ────────────────────────────────────────────────────────
// Logo SVG inline — desenhada pra combinar com a estética do site:
// faixa Brasil (verde/amarelo/azul), tipografia Anton, "carimbo" 26 e bola.
// Variantes: "light" (fundo claro), "dark" (fundo escuro), "icon" (só selo).
function Logo({ size = 48, variant, dark = false, eager: _eager = false, className = '' }) {
  const v = variant || (dark ? 'dark' : 'light');
  const wordColor = v === 'dark' ? '#FFFDF6' : '#1B2240';
  const subColor = v === 'dark' ? 'rgba(255,253,246,.7)' : 'rgba(27,34,64,.65)';
  const stripeShadow = v === 'dark' ? 'rgba(0,0,0,.35)' : 'rgba(27,34,64,.18)';

  // Selo: bola estilizada com gomos pintados nas cores do Brasil + carimbo "26"
  const seal = (
    <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden="true" style={{ display: 'block', flex: '0 0 auto' }}>
      <defs>
        <clipPath id="lc-ball-clip"><circle cx="32" cy="32" r="26" /></clipPath>
      </defs>
      {/* sombra dura */}
      <circle cx="34" cy="34" r="26" fill="#1B2240" />
      {/* corpo */}
      <circle cx="32" cy="32" r="26" fill="#FFFDF6" stroke="#1B2240" strokeWidth="3" />
      {/* gomos coloridos (faixas Brasil) */}
      <g clipPath="url(#lc-ball-clip)">
        <path d="M6 18 L58 8 L58 24 L6 34 Z" fill="#00B14F" />
        <path d="M6 34 L58 24 L58 40 L6 50 Z" fill="#FFD400" />
        <path d="M6 50 L58 40 L58 60 L6 60 Z" fill="#0046C7" />
        {/* costuras hexagonais */}
        <polygon points="32,18 38,22 38,30 32,34 26,30 26,22" fill="none" stroke="#1B2240" strokeWidth="2" strokeLinejoin="round" />
      </g>
      {/* contorno final */}
      <circle cx="32" cy="32" r="26" fill="none" stroke="#1B2240" strokeWidth="3" />
      {/* carimbo 26 */}
      <g transform="translate(44 12) rotate(12)">
        <circle r="11" fill="#FFD400" stroke="#1B2240" strokeWidth="2.5" />
        <text x="0" y="4.5" textAnchor="middle" fontFamily="Anton, Bebas Neue, Impact, sans-serif" fontSize="14" fill="#1B2240" letterSpacing="-0.5">26</text>
      </g>
    </svg>
  );

  const wordmark = (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', lineHeight: 1, gap: 3 }}>
      {/* faixa Brasil acima do nome — eco do header */}
      <div
        aria-hidden="true"
        style={{
          height: 4,
          width: Math.round(size * 1.9),
          maxWidth: '100%',
          borderRadius: 2,
          background: 'linear-gradient(90deg,#00B14F 0 33%,#FFD400 33% 66%,#0046C7 66% 100%)',
          boxShadow: '0 1px 0 ' + stripeShadow,
        }}
      />
      <div
        style={{
          fontFamily: '"Anton","Bebas Neue",Impact,sans-serif',
          fontSize: Math.round(size * 0.62),
          letterSpacing: '0.01em',
          color: wordColor,
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
        }}
      >
        Álbum<span style={{ color: '#00B14F', marginLeft: '0.18em' }}>Copa</span>
      </div>
      <div
        style={{
          fontFamily: '"JetBrains Mono",ui-monospace,monospace',
          fontSize: Math.max(8, Math.round(size * 0.18)),
          letterSpacing: '0.32em',
          color: subColor,
          textTransform: 'uppercase',
          fontWeight: 700,
        }}
      >
        Edição 2026
      </div>
    </div>
  );

  if (v === 'icon') {
    return (
      <div className={'logo logo--icon' + (className ? ' ' + className : '')} aria-label="Álbum Copa 2026">
        {seal}
      </div>
    );
  }

  return (
    <div
      className={'logo logo--' + v + (className ? ' ' + className : '')}
      role="img"
      aria-label="Álbum Copa - Edição 2026"
      style={{ display: 'inline-flex', alignItems: 'center', gap: Math.max(8, Math.round(size * 0.22)) }}
    >
      {seal}
      {wordmark}
    </div>
  );
}

// ─── Ícones genéricos ────────────────────────────────────────────
function Icon({ name, size = 18, color = 'currentColor', strokeWidth = 1.8 }) {
  const props = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (name) {
    case 'search':
      return (<svg {...props}><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>);
    case 'cart':
      return (<svg {...props}><path d="M3 4h2l2.4 11.5a2 2 0 0 0 2 1.5h7.4a2 2 0 0 0 2-1.5L21 7H6" /><circle cx="9" cy="21" r="1.5" /><circle cx="18" cy="21" r="1.5" /></svg>);
    case 'user':
      return (<svg {...props}><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" /></svg>);
    case 'heart':
      return (<svg {...props}><path d="M12 21s-7-4.5-9.5-9C.8 8.5 3 4 7 4c2 0 3.5 1 5 3 1.5-2 3-3 5-3 4 0 6.2 4.5 4.5 8-2.5 4.5-9.5 9-9.5 9Z" /></svg>);
    case 'menu':
      return (<svg {...props}><path d="M3 6h18M3 12h18M3 18h18" /></svg>);
    case 'check':
      return (<svg {...props}><path d="m4 12 5 5L20 6" /></svg>);
    case 'whatsapp':
      return (<svg width={size} height={size} viewBox="0 0 24 24" fill={color}><path d="M.057 24l1.687-6.163A11.867 11.867 0 0 1 .26 11.876C.262 5.343 5.59.014 12.123.014a11.82 11.82 0 0 1 8.413 3.488 11.82 11.82 0 0 1 3.48 8.42c-.003 6.532-5.332 11.86-11.864 11.86a11.86 11.86 0 0 1-5.674-1.444L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 0 0 1.51 5.26l-.999 3.648 3.978-1.607zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.494.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.71.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z" /></svg>);
    case 'chevron-down':
      return (<svg {...props}><path d="m6 9 6 6 6-6" /></svg>);
    case 'chevron-right':
      return (<svg {...props}><path d="m9 6 6 6-6 6" /></svg>);
    case 'chevron-left':
      return (<svg {...props}><path d="m15 6-6 6 6 6" /></svg>);
    case 'plus':
      return (<svg {...props}><path d="M12 5v14M5 12h14" /></svg>);
    case 'minus':
      return (<svg {...props}><path d="M5 12h14" /></svg>);
    case 'close':
      return (<svg {...props}><path d="M6 6l12 12M18 6 6 18" /></svg>);
    case 'truck':
      return (<svg {...props}><path d="M3 7h11v9H3zM14 11h4l3 3v2h-7" /><circle cx="7" cy="18" r="2" /><circle cx="17" cy="18" r="2" /></svg>);
    case 'shield':
      return (<svg {...props}><path d="M12 3 4 6v6c0 5 3.5 8.5 8 9 4.5-.5 8-4 8-9V6l-8-3z" /><path d="m9 12 2 2 4-4" /></svg>);
    case 'lock':
      return (<svg {...props}><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>);
    case 'star':
      return (<svg width={size} height={size} viewBox="0 0 24 24" fill={color}><path d="M12 17.3 5.8 21l1.6-7L2 9.2l7.1-.6L12 2l2.9 6.6 7.1.6-5.4 4.8L18.2 21z" /></svg>);
    case 'filter':
      return (<svg {...props}><path d="M3 5h18M6 12h12M10 19h4" /></svg>);
    case 'grid':
      return (<svg {...props}><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>);
    case 'list':
      return (<svg {...props}><path d="M8 6h13M8 12h13M8 18h13" /><circle cx="3.5" cy="6" r="1" /><circle cx="3.5" cy="12" r="1" /><circle cx="3.5" cy="18" r="1" /></svg>);
    case 'pix':
      return (<svg {...props}><path d="m4 12 4-4 4 4-4 4z" /><path d="m12 4 4 4 4-4M12 20l4-4 4 4" /></svg>);
    case 'card':
      return (<svg {...props}><rect x="3" y="6" width="18" height="13" rx="2" /><path d="M3 11h18" /></svg>);
    case 'barcode':
      return (<svg {...props}><path d="M4 6v12M7 6v12M10 6v12M14 6v12M17 6v12M20 6v12" /></svg>);
    case 'arrow-right':
      return (<svg {...props}><path d="M5 12h14M13 5l7 7-7 7" /></svg>);
    case 'package':
      return (<svg {...props}><path d="M3 7 12 3l9 4v10l-9 4-9-4z" /><path d="m3 7 9 4 9-4M12 11v10" /></svg>);
    case 'tag':
      return (<svg {...props}><path d="M20 12 12 20l-8-8V4h8z" /><circle cx="8" cy="8" r="1" /></svg>);
    case 'edit':
      return (<svg {...props}><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4z" /></svg>);
    default:
      return null;
  }
}

// ─── Imagem do produto ───────────────────────────────────────────
// Se o admin enviou foto (product.photo), exibe a foto real.
// Caso contrário, renderiza o SVG placeholder estilizado de fallback.
// Aceita também uma foto específica via prop `photoIndex` (galeria).
function ProductImage({ product, ratio = 1, decor = true, photoIndex = null }) {
  // Prioridade: foto enviada pelo admin > placeholder SVG
  let photoSrc = null;
  if (photoIndex !== null && Array.isArray(product.photos) && product.photos[photoIndex]) {
    photoSrc = product.photos[photoIndex];
  } else if (product.photo) {
    photoSrc = product.photo;
  }

  if (photoSrc) {
    return (
      <img
        src={photoSrc}
        alt={product.name}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
        loading="lazy"
      />
    );
  }

  const [c1, c2, c3] = product.palette || ['#009C3B', '#FFDF00', '#f7f3ea'];
  const id = 'prod-' + product.id;
  const w = 600;
  const h = 600 / ratio;
  const ico = product.icon;
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="xMidYMid slice"
      style={{ display: 'block', width: '100%', height: '100%' }}
      role="img"
      aria-label={product.name}
    >
      <defs>
        <linearGradient id={id + '-bg'} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor={c1} />
          <stop offset="1" stopColor={c2} />
        </linearGradient>
        <pattern id={id + '-stripes'} width="40" height="40" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
          <rect width="40" height="40" fill="transparent" />
          <rect width="20" height="40" fill="rgba(255,255,255,0.04)" />
        </pattern>
      </defs>
      <rect width={w} height={h} fill={`url(#${id}-bg)`} />
      {decor && <rect width={w} height={h} fill={`url(#${id}-stripes)`} />}
      {decor && (
        <g opacity="0.35">
          <circle cx={w * 0.85} cy={h * 0.18} r="80" fill="none" stroke={c3} strokeWidth="1.5" />
          <circle cx={w * 0.85} cy={h * 0.18} r="40" fill="none" stroke={c3} strokeWidth="1" />
          <line x1={w * 0.85 - 80} y1={h * 0.18} x2={w * 0.85 + 80} y2={h * 0.18} stroke={c3} strokeWidth="0.8" />
        </g>
      )}
      <ProductIcon name={ico} cx={w / 2} cy={h / 2} c1={c1} c2={c2} c3={c3} />
      {decor && (
        <g
          fontFamily="JetBrains Mono, monospace"
          fontSize="11"
          letterSpacing="0.3em"
          fill={c3}
          opacity="0.7"
        >
          <text x="24" y={h - 20}>CC26 / {product.id.toUpperCase()}</text>
          <text x={w - 24} y="32" textAnchor="end">FIFA · BRASIL · 2026</text>
        </g>
      )}
    </svg>
  );
}

// SVG por tipo de produto — placeholder estilizado, não foto-realista
function ProductIcon({ name, cx, cy, c1, c2, c3 }) {
  const t = `translate(${cx} ${cy})`;
  switch (name) {
    case 'album':
    case 'album-hard':
      return (
        <g transform={t}>
          <rect x="-130" y="-160" width="260" height="320" fill={c3} rx="6" />
          <rect x="-130" y="-160" width="260" height="320" fill="none" stroke={c1} strokeWidth="3" rx="6" />
          {name === 'album-hard' && <rect x="-122" y="-152" width="244" height="304" fill="none" stroke={c2} strokeWidth="1.5" rx="3" />}
          <text x="0" y="-90" textAnchor="middle" fontFamily="Anton, sans-serif" fontSize="34" fill={c1} letterSpacing="2">COPA</text>
          <text x="0" y="-50" textAnchor="middle" fontFamily="Anton, sans-serif" fontSize="64" fill={c2}>2026</text>
          <circle cx="0" cy="40" r="44" fill={c1} />
          <path d="M0 -4 L12 14 L36 14 L18 28 L26 50 L0 38 L-26 50 L-18 28 L-36 14 L-12 14 Z" fill={c2} />
          <text x="0" y="120" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="12" fill={c1} letterSpacing="2">ÁLBUM OFICIAL</text>
        </g>
      );
    case 'envelope':
      return (
        <g transform={t}>
          <rect x="-120" y="-80" width="240" height="160" fill={c3} rx="4" />
          <path d="M-120 -80 L0 0 L120 -80" fill="none" stroke={c1} strokeWidth="2" />
          <rect x="-120" y="-80" width="240" height="160" fill="none" stroke={c1} strokeWidth="2" rx="4" />
          <circle cx="0" cy="20" r="22" fill={c2} />
          <text x="0" y="26" textAnchor="middle" fontFamily="Anton, sans-serif" fontSize="22" fill={c1}>5</text>
          <text x="0" y="60" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="9" fill={c1} letterSpacing="2">FIGURINHAS</text>
        </g>
      );
    case 'envelope-pack':
      return (
        <g transform={t}>
          {[-14, 0, 14].map((dx, i) => (
            <g key={i} transform={`translate(${dx * 6} ${dx * 2}) rotate(${dx * 0.5})`}>
              <rect x="-110" y="-72" width="220" height="144" fill={c3} rx="4" />
              <rect x="-110" y="-72" width="220" height="144" fill="none" stroke={c1} strokeWidth="2" rx="4" />
            </g>
          ))}
          <text x="0" y="6" textAnchor="middle" fontFamily="Anton, sans-serif" fontSize="64" fill={c1}>12x</text>
        </g>
      );
    case 'kit':
      return (
        <g transform={t}>
          <rect x="-150" y="-110" width="300" height="220" fill={c3} rx="6" />
          <rect x="-150" y="-110" width="300" height="220" fill="none" stroke={c1} strokeWidth="3" rx="6" />
          <rect x="-130" y="-90" width="120" height="180" fill={c1} rx="3" />
          <text x="-70" y="0" textAnchor="middle" fontFamily="Anton, sans-serif" fontSize="22" fill={c2}>COPA</text>
          <text x="-70" y="22" textAnchor="middle" fontFamily="Anton, sans-serif" fontSize="34" fill={c2}>26</text>
          <g transform="translate(60 -50)">
            {[0, 1, 2].map((i) => (
              <rect key={i} x={i * 18 - 30} y={i * 8} width="80" height="48" fill={c1} stroke={c2} strokeWidth="1.5" rx="2" />
            ))}
          </g>
          <text x="60" y="80" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="10" fill={c1} letterSpacing="2">+ ENVELOPES</text>
        </g>
      );
    case 'box':
    case 'megabox':
      return (
        <g transform={t}>
          <path d="M-160 -90 L0 -130 L160 -90 L160 90 L0 130 L-160 90 Z" fill={c3} />
          <path d="M-160 -90 L0 -130 L160 -90 L0 -50 Z" fill={c2} opacity="0.5" />
          <path d="M-160 -90 L-160 90 L0 130 L0 -50 Z" fill={c1} opacity="0.6" />
          <text x="0" y="-10" textAnchor="middle" fontFamily="Anton, sans-serif" fontSize="42" fill={c2}>{name === 'megabox' ? 'MEGA' : 'BOX'}</text>
          <text x="0" y="40" textAnchor="middle" fontFamily="Anton, sans-serif" fontSize="56" fill={c3}>2026</text>
        </g>
      );
    case 'cards':
      return (
        <g transform={t}>
          {[-30, -10, 10, 30].map((dx, i) => (
            <g key={i} transform={`translate(${dx * 3} ${Math.abs(dx) * 0.5}) rotate(${dx * 0.4})`}>
              <rect x="-60" y="-90" width="120" height="180" fill={i % 2 ? c3 : c1} stroke={c2} strokeWidth="2" rx="6" />
              <rect x="-50" y="-80" width="100" height="100" fill={c2} opacity="0.8" rx="3" />
            </g>
          ))}
          <text x="0" y="120" textAnchor="middle" fontFamily="Anton, sans-serif" fontSize="20" fill={c2}>CARDS</text>
        </g>
      );
    case 'lata':
      return (
        <g transform={t}>
          <ellipse cx="0" cy="-110" rx="120" ry="22" fill={c2} />
          <rect x="-120" y="-110" width="240" height="220" fill={c1} />
          <ellipse cx="0" cy="110" rx="120" ry="22" fill={c1} />
          <ellipse cx="0" cy="-110" rx="120" ry="22" fill="none" stroke={c3} strokeWidth="2" />
          <text x="0" y="-10" textAnchor="middle" fontFamily="Anton, sans-serif" fontSize="42" fill={c2}>LATA</text>
          <text x="0" y="40" textAnchor="middle" fontFamily="Anton, sans-serif" fontSize="36" fill={c3}>2026</text>
        </g>
      );
    case 'combo':
      return (
        <g transform={t}>
          <rect x="-160" y="-100" width="100" height="200" fill={c2} rx="4" />
          <rect x="-50" y="-120" width="100" height="240" fill={c3} rx="4" />
          <rect x="60" y="-90" width="100" height="180" fill={c1} rx="4" stroke={c2} strokeWidth="2" />
          <text x="0" y="0" textAnchor="middle" fontFamily="Anton, sans-serif" fontSize="44" fill={c1}>COMBO</text>
          <text x="0" y="40" textAnchor="middle" fontFamily="Anton, sans-serif" fontSize="32" fill={c2}>TORCEDOR</text>
        </g>
      );
    case 'display':
      return (
        <g transform={t}>
          <rect x="-160" y="-100" width="320" height="200" fill={c1} rx="4" />
          <rect x="-150" y="-90" width="300" height="180" fill={c3} rx="2" />
          {Array.from({ length: 10 }).map((_, i) => (
            <rect key={i} x={-145 + i * 30} y="-85" width="26" height="170" fill={c1} stroke={c2} strokeWidth="1" rx="2" />
          ))}
          <text x="0" y="120" textAnchor="middle" fontFamily="Anton, sans-serif" fontSize="22" fill={c2}>DISPLAY × 50</text>
        </g>
      );
    default:
      return null;
  }
}

// ─── Card de produto ─────────────────────────────────────────────
function ProductCard({ product, onOpen, compact = false }) {
  const cart = React.useContext(CartContext);
  const isWish = cart.wishlist.includes(product.id);
  const badge = product.badge;
  const badgeText = {
    'mais-vendido': 'Mais vendido',
    oferta: 'Oferta',
    novidade: 'Novidade',
    premium: 'Premium',
  };
  return (
    <article className={'card' + (compact ? ' card--compact' : '')}>
      <div className="card__media" onClick={() => onOpen(product.id)} role="button" tabIndex={0}>
        <ProductImage product={product} />
        <div className="card__badges">
          {badge && <span className={'pill pill--' + badge}>{badgeText[badge]}</span>}
          {product.oldPrice && (
            <span className="pill pill--off">
              -{Math.round((1 - product.price / product.oldPrice) * 100)}%
            </span>
          )}
        </div>
        <button
          className={'card__wish' + (isWish ? ' is-on' : '')}
          onClick={(e) => {
            e.stopPropagation();
            cart.toggleWish(product.id);
          }}
          aria-label="Favoritar"
        >
          <Icon name="heart" size={18} color={isWish ? '#C8102E' : 'currentColor'} />
        </button>
      </div>
      <div className="card__body">
        <div className="card__type">{product.type}</div>
        <h3 className="card__name" onClick={() => onOpen(product.id)}>{product.name}</h3>
        {product.reviews > 0 && (
          <div className="card__rating">
            <Icon name="star" size={12} color="#FFDF00" />
            <span>{product.rating.toFixed(1)}</span>
            <span className="muted">({product.reviews})</span>
          </div>
        )}
        <div className="card__price">
          {product.oldPrice && <span className="card__old">{BRL(product.oldPrice)}</span>}
          <span className="card__cur">{BRL(product.price)}</span>
        </div>
        <div className="card__inst">{installments(product.price)}</div>
        <div className="card__cta">
          <button className="btn btn--primary btn--sm" onClick={() => { cart.add(product.id); }}>
            Adicionar
          </button>
          <button className="btn btn--ghost btn--sm" onClick={() => onOpen(product.id)}>
            Ver
          </button>
        </div>
      </div>
    </article>
  );
}

// ─── Header (simples: logo + carrinho + WhatsApp) ─────────────────
function Header({ route, navigate, query, setQuery }) {
  const cart = React.useContext(CartContext);
  const store = (typeof window !== 'undefined' && window.STORE) || {};
  const waNumber = store.whatsapp || '';
  const waText = encodeURIComponent('Olá! Tenho uma dúvida sobre os produtos da loja.');
  const _shipCfg = (typeof window !== 'undefined' && window.SHIPPING_CONFIG) || { freeShipMin: 49.99, freeShipEnabled: true };

  // Carrega config da tarja do admin (com fallback para o padrão dinâmico de frete grátis)
  const buildDefaultTopbar = React.useCallback(() => {
    const msgs = [];
    if (_shipCfg.freeShipEnabled && _shipCfg.freeShipMin > 0) {
      msgs.push({ icon: '🚚', text: `FRETE GRÁTIS acima de R$ ${_shipCfg.freeShipMin.toFixed(2).replace('.', ',')}`, enabled: true });
    } else {
      msgs.push({ icon: '🚚', text: 'Despacho rápido para todo Brasil', enabled: true });
    }
    msgs.push({ icon: '📦', text: 'Compre até 14h e enviamos hoje', enabled: true });
    msgs.push({ icon: '🔒', text: 'Pagamento 100% seguro', enabled: true });
    return { enabled: true, messages: msgs };
  }, [_shipCfg.freeShipEnabled, _shipCfg.freeShipMin]);

  const [topbar, setTopbar] = React.useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('cc26.adm.topbar') || 'null');
      if (stored && Array.isArray(stored.messages)) return stored;
    } catch (e) { /* ignore */ }
    return buildDefaultTopbar();
  });

  React.useEffect(() => {
    const onUpdate = (e) => {
      const detail = (e && e.detail) || null;
      if (detail && Array.isArray(detail.messages)) setTopbar(detail);
      else {
        try {
          const stored = JSON.parse(localStorage.getItem('cc26.adm.topbar') || 'null');
          setTopbar(stored && Array.isArray(stored.messages) ? stored : buildDefaultTopbar());
        } catch (err) { setTopbar(buildDefaultTopbar()); }
      }
    };
    window.addEventListener('cc26:topbar', onUpdate);
    window.addEventListener('storage', onUpdate);
    return () => {
      window.removeEventListener('cc26:topbar', onUpdate);
      window.removeEventListener('storage', onUpdate);
    };
  }, [buildDefaultTopbar]);

  const visibleMessages = (topbar.enabled !== false)
    ? (topbar.messages || []).filter((m) => m.enabled !== false && (m.text || m.icon))
    : [];

  return (
    <header className="hd">
      {/* Tarja superior — editável em Painel → Conteúdo */}
      {visibleMessages.length > 0 && (
        <div className="hd__top">
          <div className="hd__container">
            <div className="hd__top-row">
              {visibleMessages.map((m, i) => (
                <span key={i}>{m.icon ? m.icon + ' ' : ''}{m.text}</span>
              ))}
            </div>
          </div>
        </div>
      )}
      <div className="hd__main">
        <div className="hd__container hd__main-row hd__main-row--simple">
          <a className="hd__brand" onClick={() => navigate('home')} aria-label="Álbum Copa - início">
            <Logo variant="light" size={48} eager />
          </a>
          <div className="hd__actions hd__actions--simple">
            {waNumber && (
              <a
                className="hd__act hd__act--wa"
                href={`https://wa.me/${waNumber}?text=${waText}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Falar no WhatsApp"
              >
                <Icon name="whatsapp" size={20} color="#25D366" />
                <span>WhatsApp</span>
              </a>
            )}
            <button className="hd__act hd__act--cart" onClick={() => navigate('cart')} aria-label="Carrinho">
              <Icon name="cart" size={20} />
              <span>Carrinho</span>
              {cart.totalCount > 0 && <span className="hd__badge hd__badge--gold">{cart.totalCount}</span>}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

// ─── Footer ──────────────────────────────────────────────────────
function Footer({ navigate }) {
  return (
    <footer className="ft">
      <div className="ft__top">
        <div className="hd__container ft__grid">
          <div>
            <Logo variant="dark" size={56} />
            <p className="ft__about">
              Loja especializada em colecionáveis da Copa do Mundo 2026.
              Produtos lacrados, originais e nota fiscal em todos os pedidos.
            </p>
            <div className="ft__pay">
              <span>Pix</span><span>Visa</span><span>Master</span><span>Elo</span><span>WhatsApp</span>
            </div>
          </div>
          <div>
            <h4>Comprar</h4>
            <a onClick={() => navigate('category', { type: 'Álbum' })}>Álbuns</a>
            <a onClick={() => navigate('category', { type: 'Envelopes' })}>Envelopes</a>
            <a onClick={() => navigate('category', { type: 'Kit' })}>Kits</a>
            <a onClick={() => navigate('category', { type: 'Box' })}>Boxes</a>
            <a onClick={() => navigate('category', { sale: true })}>Ofertas</a>
          </div>
          <div>
            <h4>Conta</h4>
            <a onClick={() => navigate('account')}>Entrar / Cadastrar</a>
            <a onClick={() => navigate('account', { tab: 'orders' })}>Meus pedidos</a>
          </div>
          <div>
            <h4>Ajuda</h4>
            <a onClick={() => navigate('contact')}>Contato</a>
            <a onClick={() => navigate('faq')}>Perguntas frequentes</a>
            <a onClick={() => navigate('policy')}>Trocas e devoluções</a>
          </div>
          <div>
            <h4>Newsletter</h4>
            <p className="ft__news">Receba pré-vendas e cupons exclusivos da Coleção 2026.</p>
            <div className="ft__newsbox">
              <input type="email" placeholder="seu@email.com" />
              <button className="btn btn--primary btn--sm">Quero receber</button>
            </div>
          </div>
        </div>
      </div>
      {/* Faixa de selos de confiança */}
      <div className="ft__trust">
        <div className="hd__container ft__trustrow">
          <div className="ft__trust-item">
            <Icon name="lock" size={20} color="var(--brand)" />
            <div>
              <strong>Site protegido</strong>
              <span>SSL · dados criptografados</span>
            </div>
          </div>
          <div className="ft__trust-item">
            <Icon name="shield" size={20} color="var(--brand)" />
            <div>
              <strong>Compra segura</strong>
              <span>Nota fiscal em todo pedido</span>
            </div>
          </div>
          <div className="ft__trust-item">
            <Icon name="truck" size={20} color="var(--brand)" />
            <div>
              <strong>Entrega rápida</strong>
              <span>Despacho em 24h úteis</span>
            </div>
          </div>
          <div className="ft__trust-item">
            <Icon name="whatsapp" size={20} color="#25D366" />
            <div>
              <strong>Atendimento humano</strong>
              <span>Resposta em minutos</span>
            </div>
          </div>
        </div>
      </div>
      <div className="ft__bot">
        <div className="hd__container ft__botrow">
          <span>© 2026 · Coleção Mundial 2026 · CNPJ 00.000.000/0001-00</span>
          <span>Loja independente · Não somos representantes oficiais FIFA ou Panini</span>
        </div>
      </div>
    </footer>
  );
}

// ─── WhatsApp flutuante ──────────────────────────────────────────
function WhatsappFab() {
  const open = (e) => {
    e.preventDefault();
    openWhatsApp('Olá! Tenho uma dúvida sobre a Coleção Copa 2026.');
  };
  const phone = (typeof window !== 'undefined' && window.STORE && window.STORE.whatsapp) || STORE.whatsapp;
  return (
    <a className="wabtn" href={`https://wa.me/${phone}`} onClick={open} aria-label="WhatsApp">
      <Icon name="whatsapp" size={28} color="#fff" />
    </a>
  );
}

// ─── Faixa de benefícios ─────────────────────────────────────────
function Benefits() {
  const items = [
    { icon: 'truck', t: 'Envio em até 24h', d: 'Pedidos confirmados até 14h' },
    { icon: 'lock', t: 'Pagamento seguro', d: 'Pix instantâneo no site' },
    { icon: 'whatsapp', t: 'Suporte humano', d: 'Atendimento via WhatsApp' },
    { icon: 'shield', t: 'Compra protegida', d: 'Reembolso garantido' },
  ];
  return (
    <section className="bnf">
      <div className="hd__container bnf__grid">
        {items.map((it) => (
          <div key={it.t} className="bnf__item">
            <div className="bnf__ico"><Icon name={it.icon} size={22} /></div>
            <div>
              <div className="bnf__t">{it.t}</div>
              <div className="bnf__d">{it.d}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Pix QR Code — usa qrcode-generator (carregado no index.html). ────────
// Gera um QR Code 100% válido pelo padrão BR Code, lido por qualquer
// aplicativo de banco. Sem dependência de API externa.
function PixQR({ text, size = 220 }) {
  const cells = React.useMemo(() => {
    if (typeof window.qrcode !== 'function') return null;
    // typeNumber=0 = auto detectar tamanho. Nível L = mais densidade (Pix tem payload grande).
    const qr = window.qrcode(0, 'L');
    qr.addData(text);
    qr.make();
    const N = qr.getModuleCount();
    const grid = [];
    for (let y = 0; y < N; y++) {
      const row = [];
      for (let x = 0; x < N; x++) row.push(qr.isDark(y, x) ? 1 : 0);
      grid.push(row);
    }
    return grid;
  }, [text]);

  if (!cells) {
    // Fallback enquanto a lib não carregou — mostra o copia-e-cola como aviso
    return (
      <div className="pixqr" style={{ background: '#fff', padding: 16, borderRadius: 8, textAlign: 'center', fontSize: 12, color: '#666' }}>
        Carregando QR Code…
      </div>
    );
  }

  const N = cells.length;
  const cell = size / N;
  return (
    <div className="pixqr">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} shapeRendering="crispEdges">
        <rect width={size} height={size} fill="#fff" />
        {cells.flatMap((row, y) => row.map((v, x) => (
          v ? <rect key={`${x}-${y}`} x={x * cell} y={y * cell} width={cell} height={cell} fill="#000" /> : null
        )))}
      </svg>
    </div>
  );
}

Object.assign(window, {
  Logo, Icon, ProductImage, ProductCard, Header, Footer, WhatsappFab, Benefits, PixQR,
});

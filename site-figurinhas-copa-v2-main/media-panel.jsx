// ════════════════════════════════════════════════════════════════
// MEDIA PANEL · gerenciamento centralizado de imagens/banners
//
// • Registry global de todos os slots (id + label + grupo + âncora)
// • <MediaSlot> componente React que renderiza <image-slot> e
//   registra-se no registry
// • <MediaManagerSection> componente que mostra todos os slots num
//   painel dentro do Tweaks, com status e link "Ir" pra cada um
// • Toggle "Destacar slots" que adiciona outline pulsante a todos
// ════════════════════════════════════════════════════════════════

// ─── Registry ──────────────────────────────────────────────────
const MEDIA_REGISTRY = [];  // { id, label, group, anchor }
const _registrySubs = new Set();
const _mediaSlotsState = {}; // id -> filled? (boolean)

function registerMediaSlot(entry) {
  if (!MEDIA_REGISTRY.find((e) => e.id === entry.id)) {
    MEDIA_REGISTRY.push(entry);
    _registrySubs.forEach((fn) => fn());
  }
}
function noteMediaFilled(id, filled) {
  _mediaSlotsState[id] = !!filled;
  _registrySubs.forEach((fn) => fn());
}

// ─── <MediaSlot> · wrapper React para <image-slot> ────────────
// Funciona empilhado sobre conteúdo (ex: ilustração SVG do estádio).
// Quando vazio: fica transparente, deixando passar o conteúdo de baixo.
// Quando preenchido: mostra a imagem dropada cobrindo tudo.
function MediaSlot({ id, label, group, anchor, shape = "rect", placeholder, style, className = "" }) {
  const ref = React.useRef(null);

  React.useEffect(() => {
    registerMediaSlot({ id, label, group, anchor: anchor || id });

    // Observa o atributo data-filled do custom element pra alimentar o painel
    const el = ref.current;
    if (!el) return;
    const update = () => noteMediaFilled(id, el.hasAttribute("data-filled"));
    update();
    const mo = new MutationObserver(update);
    mo.observe(el, { attributes: true, attributeFilter: ["data-filled"] });
    return () => mo.disconnect();
  }, [id, label, group, anchor]);

  return (
    <image-slot
      ref={ref}
      id={id}
      shape={shape}
      placeholder={placeholder || label}
      class={`media-slot ${className}`}
      style={style}
    ></image-slot>
  );
}

// ─── Painel "Mídia" dentro do Tweaks ────────────────────────────
function MediaManagerSection({ highlight, onHighlightChange }) {
  // re-render sempre que algum slot muda de estado
  const [, force] = React.useState(0);
  React.useEffect(() => {
    const fn = () => force((n) => n + 1);
    _registrySubs.add(fn);
    return () => _registrySubs.delete(fn);
  }, []);

  // Agrupa por section
  const groups = {};
  for (const e of MEDIA_REGISTRY) {
    (groups[e.group] = groups[e.group] || []).push(e);
  }
  const filledCount = Object.values(_mediaSlotsState).filter(Boolean).length;
  const total = MEDIA_REGISTRY.length;

  return (
    <>
      <TweakSection label="Mídia" />
      <div className="twk-media-summary">
        <div className="twk-media-bar">
          <div className="twk-media-bar-fill" style={{ width: total ? `${(filledCount / total) * 100}%` : 0 }}></div>
        </div>
        <div className="twk-media-counts">
          <b>{filledCount}</b> de {total} imagens carregadas
        </div>
      </div>
      <TweakToggle label="Destacar áreas no site"
        value={highlight} onChange={onHighlightChange} />

      {Object.entries(groups).map(([group, items]) => (
        <details key={group} className="twk-media-group" open={group === "Hero"}>
          <summary>
            <span>{group}</span>
            <span className="twk-media-grp-count">
              {items.filter((it) => _mediaSlotsState[it.id]).length}/{items.length}
            </span>
          </summary>
          <ul className="twk-media-list">
            {items.map((it) => (
              <li key={it.id} className={_mediaSlotsState[it.id] ? "filled" : ""}>
                <span className="dot" aria-hidden="true"></span>
                <span className="lbl">{it.label}</span>
                <a className="go" href={`#${it.anchor}`}
                   onClick={() => {
                     // Pequeno highlight pulsante ao clicar
                     setTimeout(() => {
                       const el = document.getElementById(it.id);
                       if (el) {
                         el.classList.add("just-targeted");
                         setTimeout(() => el.classList.remove("just-targeted"), 1800);
                       }
                     }, 300);
                   }}>
                  ir →
                </a>
              </li>
            ))}
          </ul>
        </details>
      ))}

      <button className="twk-media-action"
              onClick={() => {
                if (!confirm("Limpar TODAS as imagens carregadas? Esta ação não pode ser desfeita.")) return;
                MEDIA_REGISTRY.forEach((e) => {
                  const el = document.getElementById(e.id);
                  if (el && el.shadowRoot) {
                    // Aciona o "clear" do image-slot via interno
                    const btn = el.shadowRoot.querySelector('[data-act="clear"]');
                    if (btn) btn.click();
                  }
                });
              }}>
        Limpar todas as imagens
      </button>
    </>
  );
}

Object.assign(window, { MediaSlot, MediaManagerSection, MEDIA_REGISTRY, _registrySubs, _mediaSlotsState });

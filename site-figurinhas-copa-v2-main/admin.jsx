// ════════════════════════════════════════════════════════════════
// ADMIN PANEL · edição completa do conteúdo do site
//
// Pacotes (prontos): título, cidade, país, fase, datas, preço, tag, inclusos
// Jogos:             data, hora, fase, seleções, cidade-sede, flags
// Imagens:           gerencia todos os slots (usa MediaManagerSection)
// Marca:             nome, cor, parcelamento, headline
//
// Tudo é persistido em localStorage (via store.jsx) — sai pelo
// Exportar JSON pra você commitar no data.jsx depois.
// ════════════════════════════════════════════════════════════════

// ─── Helpers de formulário ─────────────────────────────────────
const Field = ({ label, children, hint }) => (
  <label className="adm-field">
    <span className="adm-field-lbl">{label}</span>
    {children}
    {hint && <span className="adm-field-hint">{hint}</span>}
  </label>
);

const FieldGroup = ({ children, columns = 2 }) => (
  <div className="adm-field-group" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
    {children}
  </div>
);

const TextIn = ({ value, onChange, placeholder }) => (
  <input className="adm-input" type="text" value={value ?? ""}
         placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
);
const NumIn = ({ value, onChange, min = 0, step = 1 }) => (
  <input className="adm-input" type="number" value={value ?? 0} min={min} step={step}
         onChange={(e) => onChange(Number(e.target.value))} />
);
const DateIn = ({ value, onChange }) => (
  <input className="adm-input" type="date" value={value} onChange={(e) => onChange(e.target.value)} />
);
const TimeIn = ({ value, onChange }) => (
  <input className="adm-input" type="time" value={value} onChange={(e) => onChange(e.target.value)} />
);
const SelectIn = ({ value, onChange, options }) => (
  <select className="adm-input" value={value ?? ""} onChange={(e) => onChange(e.target.value)}>
    {options.map((o) => (
      <option key={o.value ?? "__none__"} value={o.value ?? ""}>{o.label}</option>
    ))}
  </select>
);
const ToggleIn = ({ value, onChange, label }) => (
  <button type="button" className={`adm-toggle ${value ? "on" : ""}`}
          onClick={() => onChange(!value)}>
    <span className="adm-toggle-track"><span className="adm-toggle-thumb"></span></span>
    <span>{label}</span>
  </button>
);

const flagForPais = (p) => p === "USA" ? "🇺🇸" : p === "MEX" ? "🇲🇽" : p === "CAN" ? "🇨🇦" : "🏳️";

// ─── Tab: Pacotes ─────────────────────────────────────────────
function AdminPacotes() {
  useDataVersion();
  const [expanded, setExpanded] = React.useState(null);
  const [query, setQuery] = React.useState("");

  const filtered = PACOTES.filter((p) =>
    !query || (p.titulo + " " + p.cidadeSede).toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="adm-tab">
      <div className="adm-toolbar">
        <input className="adm-search" type="search"
               placeholder="Buscar por título ou cidade…"
               value={query} onChange={(e) => setQuery(e.target.value)} />
        <span className="adm-count">{filtered.length} de {PACOTES.length} pacotes</span>
      </div>

      <div className="adm-pkg-list">
        {filtered.map((p) => (
          <PkgEditor key={p.id} p={p}
                     expanded={expanded === p.id}
                     onToggle={() => setExpanded(expanded === p.id ? null : p.id)} />
        ))}
      </div>
    </div>
  );
}

function PkgEditor({ p, expanded, onToggle }) {
  const set = (patch) => updatePackage(p.id, patch);
  const setIncluido = (idx, value) => {
    const next = [...p.inclusos];
    next[idx] = value;
    set({ inclusos: next });
  };
  return (
    <div className={`adm-row ${expanded ? "expanded" : ""}`}>
      <button className="adm-row-head" onClick={onToggle}>
        <span className="adm-flag">{flagForPais(p.pais)}</span>
        <div className="adm-row-info">
          <div className="adm-row-t">{p.titulo}</div>
          <div className="adm-row-sub">{p.cidadeSede} · {p.fase} · {fmtBRL(p.preco)}</div>
        </div>
        {p.tag && <span className={`adm-tag t-${p.tag}`}>{p.tagText}</span>}
        <span className="adm-chev">{expanded ? "▾" : "▸"}</span>
      </button>
      {expanded && (
        <div className="adm-form">
          <FieldGroup columns={1}>
            <Field label="Título do pacote">
              <TextIn value={p.titulo} onChange={(v) => set({ titulo: v })} />
            </Field>
          </FieldGroup>
          <FieldGroup columns={2}>
            <Field label="Cidade-sede"><TextIn value={p.cidadeSede} onChange={(v) => set({ cidadeSede: v })} /></Field>
            <Field label="País">
              <SelectIn value={p.pais} onChange={(v) => set({ pais: v })}
                options={[
                  { value: "USA", label: "🇺🇸 Estados Unidos" },
                  { value: "MEX", label: "🇲🇽 México" },
                  { value: "CAN", label: "🇨🇦 Canadá" }
                ]} />
            </Field>
          </FieldGroup>
          <FieldGroup columns={3}>
            <Field label="Fase">
              <SelectIn value={p.fase} onChange={(v) => set({ fase: v })}
                options={[
                  { value: "Jogo de Abertura",    label: "Jogo de Abertura" },
                  { value: "Fase de Grupos",      label: "Fase de Grupos" },
                  { value: "16-avos de Final",    label: "16-avos de Final" },
                  { value: "Oitavas de Final",    label: "Oitavas de Final" },
                  { value: "Quartas de Final",    label: "Quartas de Final" },
                  { value: "Semifinal",           label: "Semifinal" },
                  { value: "Disputa de 3º lugar", label: "Disputa de 3º lugar" },
                  { value: "Grande Final",        label: "Grande Final" },
                  { value: "Roteiro de 3 países", label: "Roteiro multi-país" }
                ]} />
            </Field>
            <Field label="Data início (texto)"><TextIn value={p.dataInicio} onChange={(v) => set({ dataInicio: v })} /></Field>
            <Field label="Data fim (texto)"><TextIn value={p.dataFim} onChange={(v) => set({ dataFim: v })} /></Field>
          </FieldGroup>
          <FieldGroup columns={3}>
            <Field label="Dias"><NumIn value={p.dias} onChange={(v) => set({ dias: v })} min={1} /></Field>
            <Field label="Preço (R$)"><NumIn value={p.preco} onChange={(v) => set({ preco: v })} min={0} step={100} /></Field>
            <Field label="Selo (tag)">
              <SelectIn value={p.tag || ""} onChange={(v) => set({ tag: v || null })}
                options={[
                  { value: "",        label: "— Nenhum —" },
                  { value: "best",    label: "🔥 Mais vendido" },
                  { value: "premium", label: "✨ Premium" },
                  { value: "last",    label: "⚡ Últimas vagas" },
                  { value: "new",     label: "🆕 Novo" }
                ]} />
            </Field>
          </FieldGroup>
          {p.tag && (
            <FieldGroup columns={1}>
              <Field label="Texto do selo"><TextIn value={p.tagText} onChange={(v) => set({ tagText: v })} /></Field>
            </FieldGroup>
          )}
          <FieldGroup columns={2}>
            {[0,1,2,3].map((i) => (
              <Field key={i} label={`Incluso #${i+1}`}>
                <TextIn value={p.inclusos[i] || ""} onChange={(v) => setIncluido(i, v)}
                        placeholder="ex: Voo executivo / Hotel 5★ / Ingresso cat. 1" />
              </Field>
            ))}
          </FieldGroup>
        </div>
      )}
    </div>
  );
}

// ─── Tab: Jogos ───────────────────────────────────────────────
function AdminJogos() {
  useDataVersion();
  const [expanded, setExpanded] = React.useState(null);
  const [query, setQuery] = React.useState("");
  const [stage, setStage] = React.useState("all");
  const [country, setCountry] = React.useState("all");

  const stages = ["all", "Grupos", "16-avos", "Oitavas", "Quartas", "Semifinal", "3º lugar", "Final"];

  const filtered = MATCHES.filter((m) => {
    if (stage !== "all" && m.stage !== stage) return false;
    if (country !== "all" && m.country !== country) return false;
    if (query) {
      const q = query.toLowerCase();
      if (!`${m.teamADisplay} ${m.teamBDisplay} ${m.city.city} ${m.stageLabel}`.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  return (
    <div className="adm-tab">
      <div className="adm-toolbar adm-toolbar-multi">
        <input className="adm-search" type="search"
               placeholder="Buscar por seleção, cidade ou fase…"
               value={query} onChange={(e) => setQuery(e.target.value)} />
        <select className="adm-input adm-mini" value={stage} onChange={(e) => setStage(e.target.value)}>
          {stages.map((s) => (
            <option key={s} value={s}>{s === "all" ? "Todas as fases" : s}</option>
          ))}
        </select>
        <select className="adm-input adm-mini" value={country} onChange={(e) => setCountry(e.target.value)}>
          <option value="all">Todos os países</option>
          <option value="USA">🇺🇸 EUA</option>
          <option value="MEX">🇲🇽 México</option>
          <option value="CAN">🇨🇦 Canadá</option>
        </select>
        <span className="adm-count">{filtered.length} de {MATCHES.length}</span>
      </div>

      <div className="adm-match-list">
        {filtered.map((m) => (
          <MatchEditor key={m.id} m={m}
                       expanded={expanded === m.id}
                       onToggle={() => setExpanded(expanded === m.id ? null : m.id)} />
        ))}
        {filtered.length === 0 && (
          <div className="adm-empty">Nenhum jogo corresponde aos filtros.</div>
        )}
      </div>
    </div>
  );
}

function MatchEditor({ m, expanded, onToggle }) {
  const set = (patch) => updateMatch(m.id, patch);
  const dateStr = m.date.toISOString().slice(0, 10);
  return (
    <div className={`adm-row adm-match-row ${expanded ? "expanded" : ""}`}>
      <button className="adm-row-head" onClick={onToggle}>
        <span className="adm-flag">{flagForPais(m.country)}</span>
        <span className="adm-match-date">
          {String(m.date.getDate()).padStart(2,"0")}/{_meses[m.date.getMonth()]}
        </span>
        <div className="adm-row-info">
          <div className="adm-row-t">
            <span className="adm-stage-chip">{m.stageLabel}</span>
            <span>{m.teamADisplay} <em>vs</em> {m.teamBDisplay}</span>
          </div>
          <div className="adm-row-sub">{m.time} · {m.city.city} · {m.city.stadium}</div>
        </div>
        <div className="adm-flags">
          {m.isFeatured && <span className="adm-flag-pin gold">⭐</span>}
          {m.isBrazil   && <span className="adm-flag-pin br">🇧🇷</span>}
        </div>
        <span className="adm-chev">{expanded ? "▾" : "▸"}</span>
      </button>
      {expanded && (
        <div className="adm-form">
          <FieldGroup columns={3}>
            <Field label="Data"><DateIn value={dateStr} onChange={(v) => set({ date: v })} /></Field>
            <Field label="Hora"><TimeIn value={m.time} onChange={(v) => set({ time: v })} /></Field>
            <Field label="Fase">
              <SelectIn value={m.stage} onChange={(v) => set({ stage: v })}
                options={["Grupos","16-avos","Oitavas","Quartas","Semifinal","3º lugar","Final"].map((s) => ({ value: s, label: s }))} />
            </Field>
          </FieldGroup>
          <FieldGroup columns={1}>
            <Field label="Rótulo da fase (mostrado no card)">
              <TextIn value={m.stageLabel} onChange={(v) => set({ stageLabel: v })}
                      placeholder="ex: Grupo A · Rodada 1 / Quartas · Jogo 3" />
            </Field>
          </FieldGroup>
          <FieldGroup columns={2}>
            <Field label="Seleção A (texto exibido)">
              <TextIn value={m.teamADisplay} onChange={(v) => set({ teamADisplay: v })} placeholder="ex: Brasil 🇧🇷" />
            </Field>
            <Field label="Seleção B (texto exibido)">
              <TextIn value={m.teamBDisplay} onChange={(v) => set({ teamBDisplay: v })} placeholder="ex: Argentina 🇦🇷" />
            </Field>
          </FieldGroup>
          <FieldGroup columns={1}>
            <Field label="Cidade-sede">
              <SelectIn value={m.city.id} onChange={(v) => set({ city: v })}
                options={HOST_CITIES.map((c) => ({
                  value: c.id,
                  label: `${flagForPais(c.country)} ${c.city} — ${c.stadium}`
                }))} />
            </Field>
          </FieldGroup>
          <FieldGroup columns={2}>
            <Field label="Marcar como principal">
              <ToggleIn value={m.isFeatured} onChange={(v) => set({ isFeatured: v })}
                        label={m.isFeatured ? "É principal" : "Não é principal"} />
            </Field>
            <Field label="Jogo do Brasil">
              <ToggleIn value={m.isBrazil} onChange={(v) => set({ isBrazil: v })}
                        label={m.isBrazil ? "É jogo do Brasil" : "Não é"} />
            </Field>
          </FieldGroup>
        </div>
      )}
    </div>
  );
}

// ─── Tab: Hotéis ───────────────────────────────────────────────
function AdminHoteis() {
  useDataVersion();
  const [expanded, setExpanded] = React.useState(null);
  const [tier, setTier] = React.useState(5);
  const [query, setQuery] = React.useState("");

  const cities = HOST_CITIES.filter((c) =>
    !query || (c.city + " " + c.stadium).toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="adm-tab">
      <div className="adm-toolbar adm-toolbar-multi">
        <input className="adm-search" type="search"
               placeholder="Buscar cidade…"
               value={query} onChange={(e) => setQuery(e.target.value)} />
        <div className="adm-tier-chips">
          {[3,4,5].map((n) => (
            <button key={n}
              className={`adm-tier-chip ${tier === n ? "active" : ""}`}
              onClick={() => setTier(n)}>
              {"★".repeat(n)} {n}★
            </button>
          ))}
        </div>
        <span className="adm-count">{cities.length} de {HOST_CITIES.length} cidades</span>
      </div>

      <div className="adm-hotel-help">
        Em cada cidade, o hotel marcado com <span className="adm-best">⭐ Pré-selecionado</span> é o que aparece marcado por padrão no carrinho do site. Clique em <b>Tornar padrão</b> em qualquer outro pra trocá-lo.
      </div>

      <div className="adm-pkg-list">
        {cities.map((c) => {
          const hotels = HOTELS[c.id]?.[tier] || [];
          const isExp = expanded === c.id;
          return (
            <div key={c.id} className={`adm-row ${isExp ? "expanded" : ""}`}>
              <button className="adm-row-head" onClick={() => setExpanded(isExp ? null : c.id)}>
                <span className="adm-flag">{flagForPais(c.country)}</span>
                <div className="adm-row-info">
                  <div className="adm-row-t">{c.city}</div>
                  <div className="adm-row-sub">
                    {c.stadium} · {hotels.length} hotéis {tier}★
                    {hotels[0] && <> · padrão: <em style={{color:"var(--gold)",fontStyle:"normal"}}>{hotels[0].name}</em></>}
                  </div>
                </div>
                <span className="adm-chev">{isExp ? "▾" : "▸"}</span>
              </button>
              {isExp && (
                <div className="adm-form adm-hotel-form">
                  {hotels.map((h, i) => (
                    <div key={i} className={`adm-hotel-card ${i === 0 ? "is-best" : ""}`}>
                      <div className="adm-hotel-card-h">
                        <span className="adm-hotel-num">{i + 1}</span>
                        {i === 0
                          ? <span className="adm-best">⭐ Pré-selecionado</span>
                          : <button className="adm-link"
                                    onClick={() => setHotelAsBest(c.id, tier, i)}>
                              Tornar padrão
                            </button>}
                        <div className="adm-hotel-card-actions">
                          {i > 0 && (
                            <button className="adm-icon-btn" title="Mover pra cima"
                                    onClick={() => reorderHotel(c.id, tier, i, i - 1)}>↑</button>
                          )}
                          {i < hotels.length - 1 && (
                            <button className="adm-icon-btn" title="Mover pra baixo"
                                    onClick={() => reorderHotel(c.id, tier, i, i + 1)}>↓</button>
                          )}
                        </div>
                      </div>
                      <FieldGroup columns={2}>
                        <Field label="Nome do hotel">
                          <TextIn value={h.name}
                                  onChange={(v) => updateHotel(c.id, tier, i, { name: v })} />
                        </Field>
                        <Field label="Bairro / região">
                          <TextIn value={h.area}
                                  onChange={(v) => updateHotel(c.id, tier, i, { area: v })} />
                        </Field>
                      </FieldGroup>
                      <FieldGroup columns={1}>
                        <Field label="Observação (mostrada no carrinho)">
                          <TextIn value={h.note}
                                  onChange={(v) => updateHotel(c.id, tier, i, { note: v })}
                                  placeholder="ex: Vista privilegiada, café incluso, spa…" />
                        </Field>
                      </FieldGroup>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
function AdminImagens() {
  // re-render quando slots mudam
  const [, force] = React.useState(0);
  React.useEffect(() => {
    const fn = () => force((n) => n + 1);
    _registrySubs.add(fn);
    return () => _registrySubs.delete(fn);
  }, []);

  const groups = {};
  for (const e of MEDIA_REGISTRY) (groups[e.group] = groups[e.group] || []).push(e);
  const filled = Object.values(_mediaSlotsState).filter(Boolean).length;
  const total  = MEDIA_REGISTRY.length;

  const clearAll = () => {
    if (!confirm("Limpar TODAS as imagens carregadas? Esta ação não pode ser desfeita.")) return;
    MEDIA_REGISTRY.forEach((e) => {
      const el = document.getElementById(e.id);
      if (el && el.shadowRoot) {
        const btn = el.shadowRoot.querySelector('[data-act="clear"]');
        if (btn) btn.click();
      }
    });
  };

  return (
    <div className="adm-tab">
      <div className="adm-img-summary">
        <div className="adm-img-headline">
          <b>{filled}</b> <span>de {total} imagens carregadas</span>
        </div>
        <div className="adm-img-bar">
          <div className="adm-img-bar-fill" style={{ width: total ? `${(filled/total)*100}%` : 0 }}></div>
        </div>
        <p className="adm-help">
          Arraste e solte uma imagem em qualquer área marcada no site, ou
          clique no botão <b>ir →</b> abaixo pra ir direto até cada uma.
          Formatos: PNG · JPG · WebP.
        </p>
      </div>

      {Object.entries(groups).map(([group, items]) => (
        <details key={group} className="adm-img-group" open>
          <summary>
            <span>{group}</span>
            <span className="adm-count">
              {items.filter((it) => _mediaSlotsState[it.id]).length}/{items.length}
            </span>
          </summary>
          <ul className="adm-img-list">
            {items.map((it) => (
              <li key={it.id} className={_mediaSlotsState[it.id] ? "filled" : ""}>
                <span className="adm-img-status" aria-hidden="true"></span>
                <span className="adm-img-name">{it.label}</span>
                <a className="adm-img-go" href={`#${it.anchor}`}
                   onClick={() => {
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

      <button className="adm-btn danger" onClick={clearAll}>Limpar todas as imagens</button>
    </div>
  );
}

// ─── Tab: Marca & Visual ──────────────────────────────────────
function AdminMarca({ tweaks, setTweak }) {
  return (
    <div className="adm-tab">
      <div className="adm-section-h">Identidade da marca</div>
      <FieldGroup columns={1}>
        <Field label="Nome da agência" hint="Aparece no header, footer e mensagens do WhatsApp.">
          <TextIn value={tweaks.brand} onChange={(v) => setTweak("brand", v)} />
        </Field>
      </FieldGroup>

      <div className="adm-section-h">Visual</div>
      <FieldGroup columns={1}>
        <Field label="Cor de acento (dourado)">
          <div className="adm-color-swatches">
            {["#D4AF37","#E8501C","#22C55E","#3B82F6","#F4F1E8","#FACC15","#E11D48"].map((c) => (
              <button key={c} type="button"
                className={`adm-swatch ${tweaks.accent === c ? "active" : ""}`}
                style={{ background: c }}
                onClick={() => setTweak("accent", c)} title={c} />
            ))}
          </div>
        </Field>
      </FieldGroup>

      <div className="adm-section-h">Hero</div>
      <FieldGroup columns={2}>
        <Field label="Frase de impacto">
          <SelectIn value={tweaks.headline2Variant} onChange={(v) => setTweak("headline2Variant", v)}
            options={[
              { value: "campo",  label: "Entrar em campo" },
              { value: "lá",     label: "Estar lá" },
              { value: "viver",  label: "Viver a Copa" },
              { value: "vestir", label: "Vestir a camisa" }
            ]} />
        </Field>
        <Field label="Vídeo do hero">
          <SelectIn value={tweaks.heroVariant} onChange={(v) => setTweak("heroVariant", v)}
            options={[
              { value: "main", label: "Drone aéreo + fogos" },
              { value: "alt",  label: "Estádio simétrico" }
            ]} />
        </Field>
      </FieldGroup>
      <FieldGroup columns={1}>
        <Field label="Contagem regressiva">
          <ToggleIn value={tweaks.showCountdown} onChange={(v) => setTweak("showCountdown", v)}
                    label={tweaks.showCountdown ? "Ativada" : "Desativada"} />
        </Field>
      </FieldGroup>

      <div className="adm-section-h">Comercial</div>
      <FieldGroup columns={2}>
        <Field label="Parcelamento sem juros (até)">
          <NumIn value={tweaks.installments} onChange={(v) => setTweak("installments", v)} min={1} step={1} />
        </Field>
        <Field label="Filtros por país nos pacotes">
          <ToggleIn value={tweaks.showHostFilters} onChange={(v) => setTweak("showHostFilters", v)}
                    label={tweaks.showHostFilters ? "Mostrando" : "Escondidos"} />
        </Field>
      </FieldGroup>
    </div>
  );
}

// ─── Painel Admin (overlay fullscreen) ────────────────────────
// ════════════════════════════════════════════════════════════════
// ABAS NOVAS (config do site via getSiteConfig/saveSiteConfig)
// ════════════════════════════════════════════════════════════════

function useSiteConfig() {
  const [cfg, setCfg] = React.useState(() => getSiteConfig());
  const update = (path, value) => {
    // path = "empresa.cnpj" → updates nested
    const next = JSON.parse(JSON.stringify(cfg));
    const keys = path.split(".");
    let obj = next;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!obj[keys[i]]) obj[keys[i]] = {};
      obj = obj[keys[i]];
    }
    obj[keys[keys.length - 1]] = value;
    setCfg(next);
    saveSiteConfig(next);
  };
  return [cfg, update];
}

// ─── Aba EMPRESA ────────────────────────────────────────────────
function AdminEmpresa() {
  const [cfg, update] = useSiteConfig();
  const e = cfg.empresa || {};
  return (
    <div className="adm-content">
      <div className="adm-section-h">Dados da Empresa</div>
      <p className="adm-section-sub">Todos os campos aparecem no rodapé e em documentos.</p>
      <FieldGroup columns={2}>
        <Field label="Nome fantasia">
          <TextIn value={e.nomeFantasia || ""} onChange={(v) => update("empresa.nomeFantasia", v)} />
        </Field>
        <Field label="Razão social">
          <TextIn value={e.razaoSocial || ""} onChange={(v) => update("empresa.razaoSocial", v)} />
        </Field>
        <Field label="CNPJ" hint="Ex: 12.345.678/0001-90">
          <TextIn value={e.cnpj || ""} onChange={(v) => update("empresa.cnpj", v)} />
        </Field>
        <Field label="CADASTUR" hint="Obrigatório pra operar como agência">
          <TextIn value={e.cadastur || ""} onChange={(v) => update("empresa.cadastur", v)} />
        </Field>
        <Field label="Telefone público">
          <TextIn value={e.telefone || ""} onChange={(v) => update("empresa.telefone", v)} />
        </Field>
        <Field label="WhatsApp" hint="Só números, formato internacional. Ex: 5511999999999">
          <TextIn value={e.whatsapp || ""} onChange={(v) => update("empresa.whatsapp", v.replace(/\D/g,""))} />
        </Field>
        <Field label="E-mail">
          <TextIn value={e.email || ""} onChange={(v) => update("empresa.email", v)} />
        </Field>
        <Field label="Instagram (@)">
          <TextIn value={e.instagram || ""} onChange={(v) => update("empresa.instagram", v)} />
        </Field>
        <Field label="URL Instagram">
          <TextIn value={e.instagramUrl || ""} onChange={(v) => update("empresa.instagramUrl", v)} />
        </Field>
        <Field label="Endereço">
          <TextIn value={e.endereco || ""} onChange={(v) => update("empresa.endereco", v)} />
        </Field>
      </FieldGroup>

      <div className="adm-section-h" style={{marginTop: 32}}>Selos &amp; Credenciais</div>
      <FieldGroup columns={2}>
        <ToggleIn value={cfg.selos?.abavMembro || false}
                  onChange={(v) => update("selos.abavMembro", v)}
                  label="Sou membro ABAV" />
        <ToggleIn value={cfg.selos?.iata || false}
                  onChange={(v) => update("selos.iata", v)}
                  label="Tenho credencial IATA" />
      </FieldGroup>

      <div className="adm-section-h" style={{marginTop: 32}}>Páginas Legais (LGPD)</div>
      <p className="adm-section-sub">Esses textos aparecem nos links de Privacidade e Termos. Use textos preparados por advogado.</p>
      <Field label="Política de privacidade">
        <textarea className="adm-textarea" rows={8}
          value={cfg.paginas?.politicaPrivacidade || ""}
          onChange={(ev) => update("paginas.politicaPrivacidade", ev.target.value)} />
      </Field>
      <Field label="Termos &amp; condições">
        <textarea className="adm-textarea" rows={8}
          value={cfg.paginas?.termosCondicoes || ""}
          onChange={(ev) => update("paginas.termosCondicoes", ev.target.value)} />
      </Field>
    </div>
  );
}

// ─── Aba SEO & ANALYTICS ────────────────────────────────────────
function AdminSEO() {
  const [cfg, update] = useSiteConfig();
  return (
    <div className="adm-content">
      <div className="adm-section-h">SEO · Como o site aparece no Google</div>
      <Field label="Title (aba do navegador)" hint="Ideal entre 50-60 caracteres">
        <TextIn value={cfg.seo?.title || ""} onChange={(v) => update("seo.title", v)} />
      </Field>
      <Field label="Meta description" hint="Ideal entre 140-160 caracteres">
        <textarea className="adm-textarea" rows={3}
          value={cfg.seo?.description || ""}
          onChange={(ev) => update("seo.description", ev.target.value)} />
      </Field>
      <Field label="Keywords (separadas por vírgula)">
        <TextIn value={cfg.seo?.keywords || ""} onChange={(v) => update("seo.keywords", v)} />
      </Field>
      <Field label="OG Image · URL pública" hint="Imagem que aparece no WhatsApp/Facebook quando compartilha o link. 1200×630px ideal.">
        <TextIn value={cfg.seo?.ogImage || ""} onChange={(v) => update("seo.ogImage", v)} />
      </Field>

      <div className="adm-section-h" style={{marginTop: 32}}>Analytics &amp; Pixels</div>
      <p className="adm-section-sub">Cole os IDs aqui — os scripts são carregados automaticamente. Se vazios, nada é carregado.</p>
      <FieldGroup columns={2}>
        <Field label="Google Analytics 4 (GA4)" hint="Formato: G-XXXXXXXXXX">
          <TextIn value={cfg.analytics?.ga4Id || ""} onChange={(v) => update("analytics.ga4Id", v)} />
        </Field>
        <Field label="Meta (Facebook) Pixel ID" hint="Só números">
          <TextIn value={cfg.analytics?.metaPixelId || ""} onChange={(v) => update("analytics.metaPixelId", v.replace(/\D/g,""))} />
        </Field>
        <Field label="Google Tag Manager (GTM)" hint="Formato: GTM-XXXXXX">
          <TextIn value={cfg.analytics?.gtmId || ""} onChange={(v) => update("analytics.gtmId", v)} />
        </Field>
      </FieldGroup>
      <div className="adm-info-box">
        <b>📊 Eventos disparados automaticamente:</b>
        <ul style={{margin:"8px 0 0 18px"}}>
          <li><code>page_view</code> — em toda página</li>
          <li><code>select_package</code> — ao confirmar um pacote pré-definido</li>
          <li><code>complete_builder</code> — ao enviar pacote customizado</li>
          <li><code>click_whatsapp_fab</code> — ao clicar no botão WhatsApp flutuante</li>
          <li><code>lead_form_submit</code> — ao enviar formulário "me liga em 24h"</li>
        </ul>
      </div>
    </div>
  );
}

// ─── Aba CONTEÚDO (FAQ + Depoimentos) ──────────────────────────
function AdminConteudo() {
  const [cfg, update] = useSiteConfig();
  const faq   = cfg.faq || [];
  const depos = cfg.depoimentos || [];

  const updateFAQItem = (i, key, val) => {
    const next = [...faq];
    next[i] = { ...next[i], [key]: val };
    update("faq", next);
  };
  const addFAQ = () => update("faq", [...faq, { q: "Nova pergunta", r: "Resposta aqui" }]);
  const delFAQ = (i) => update("faq", faq.filter((_, idx) => idx !== i));

  const updateDepoItem = (i, key, val) => {
    const next = [...depos];
    next[i] = { ...next[i], [key]: val };
    update("depoimentos", next);
  };
  const addDepo = () => update("depoimentos", [...depos, { nome: "Cliente", local: "Cidade · UF", viagem: "Copa Anterior", texto: "Depoimento...", avatar: "" }]);
  const delDepo = (i) => update("depoimentos", depos.filter((_, idx) => idx !== i));

  return (
    <div className="adm-content">
      <div className="adm-section-h">FAQ · Perguntas frequentes</div>
      <p className="adm-section-sub">Aparece na seção FAQ do site público. Use perguntas que clientes realmente fazem.</p>
      {faq.map((f, i) => (
        <div key={i} className="adm-item-card">
          <div style={{display:"flex", justifyContent:"space-between", marginBottom: 8}}>
            <b style={{color:"var(--gold)"}}>Pergunta {i+1}</b>
            <button className="adm-btn danger sm" onClick={() => delFAQ(i)}>Remover</button>
          </div>
          <Field label="Pergunta">
            <TextIn value={f.q} onChange={(v) => updateFAQItem(i, "q", v)} />
          </Field>
          <Field label="Resposta">
            <textarea className="adm-textarea" rows={3} value={f.r}
              onChange={(ev) => updateFAQItem(i, "r", ev.target.value)} />
          </Field>
        </div>
      ))}
      <button className="adm-btn" onClick={addFAQ}>+ Adicionar pergunta</button>

      <div className="adm-section-h" style={{marginTop: 40}}>Depoimentos</div>
      <p className="adm-section-sub">Prova social. Use depoimentos reais de clientes anteriores (Catar 2022, Rússia 2018).</p>
      {depos.map((d, i) => (
        <div key={i} className="adm-item-card">
          <div style={{display:"flex", justifyContent:"space-between", marginBottom: 8}}>
            <b style={{color:"var(--gold)"}}>Depoimento {i+1}</b>
            <button className="adm-btn danger sm" onClick={() => delDepo(i)}>Remover</button>
          </div>
          <FieldGroup columns={2}>
            <Field label="Nome">
              <TextIn value={d.nome} onChange={(v) => updateDepoItem(i, "nome", v)} />
            </Field>
            <Field label="Local (cidade · UF)">
              <TextIn value={d.local} onChange={(v) => updateDepoItem(i, "local", v)} />
            </Field>
            <Field label="Viagem que fez">
              <TextIn value={d.viagem} onChange={(v) => updateDepoItem(i, "viagem", v)} />
            </Field>
            <Field label="URL do avatar (opcional)">
              <TextIn value={d.avatar || ""} onChange={(v) => updateDepoItem(i, "avatar", v)} />
            </Field>
          </FieldGroup>
          <Field label="Depoimento">
            <textarea className="adm-textarea" rows={3} value={d.texto}
              onChange={(ev) => updateDepoItem(i, "texto", ev.target.value)} />
          </Field>
        </div>
      ))}
      <button className="adm-btn" onClick={addDepo}>+ Adicionar depoimento</button>
    </div>
  );
}

// ─── Aba ESTIMATIVA (preços) ────────────────────────────────────
function AdminEstimativa() {
  const [cfg, update] = useSiteConfig();
  const e = cfg.estimativa || {};
  return (
    <div className="adm-content">
      <div className="adm-section-h">Estimativa Inteligente de Preços</div>
      <p className="adm-section-sub">
        Esses valores alimentam a calculadora automática do builder. Ajuste conforme realidade de mercado.
      </p>

      <Field label="Cotação USD → BRL" hint="Ex: 5.30 = 1 dólar vale R$ 5,30">
        <NumIn value={e.cotacaoUSD || 5.30} onChange={(v) => update("estimativa.cotacaoUSD", v)} step={0.05} />
      </Field>

      <div className="adm-section-h" style={{marginTop: 24}}>Voo base (USD) por região</div>
      <FieldGroup columns={3}>
        <Field label="México">
          <NumIn value={e.vooBase?.mex || 900} onChange={(v) => update("estimativa.vooBase.mex", v)} step={50} />
        </Field>
        <Field label="USA Costa Leste">
          <NumIn value={e.vooBase?.usa_east || 1100} onChange={(v) => update("estimativa.vooBase.usa_east", v)} step={50} />
        </Field>
        <Field label="USA Central">
          <NumIn value={e.vooBase?.usa_central || 1200} onChange={(v) => update("estimativa.vooBase.usa_central", v)} step={50} />
        </Field>
        <Field label="USA Costa Oeste">
          <NumIn value={e.vooBase?.usa_west || 1500} onChange={(v) => update("estimativa.vooBase.usa_west", v)} step={50} />
        </Field>
        <Field label="Canadá">
          <NumIn value={e.vooBase?.can || 1300} onChange={(v) => update("estimativa.vooBase.can", v)} step={50} />
        </Field>
      </FieldGroup>

      <div className="adm-section-h" style={{marginTop: 24}}>Multiplicador classe</div>
      <FieldGroup columns={4}>
        <Field label="Econômica">
          <NumIn value={e.classeMult?.eco || 1} onChange={(v) => update("estimativa.classeMult.eco", v)} step={0.1} />
        </Field>
        <Field label="Premium Eco">
          <NumIn value={e.classeMult?.premium || 1.8} onChange={(v) => update("estimativa.classeMult.premium", v)} step={0.1} />
        </Field>
        <Field label="Executiva">
          <NumIn value={e.classeMult?.exec || 3.5} onChange={(v) => update("estimativa.classeMult.exec", v)} step={0.1} />
        </Field>
        <Field label="Primeira">
          <NumIn value={e.classeMult?.first || 6} onChange={(v) => update("estimativa.classeMult.first", v)} step={0.1} />
        </Field>
      </FieldGroup>

      <div className="adm-section-h" style={{marginTop: 24}}>Multiplicador Copa &amp; Margem</div>
      <FieldGroup columns={3}>
        <Field label="Multiplicador Copa" hint="Alta temporada (ex: 1.6 = +60%)">
          <NumIn value={e.copaMultiplier || 1.6} onChange={(v) => update("estimativa.copaMultiplier", v)} step={0.05} />
        </Field>
        <Field label="Margem mínima" hint="Ex: 0.85 = mostra -15%">
          <NumIn value={e.margemMin || 0.85} onChange={(v) => update("estimativa.margemMin", v)} step={0.05} />
        </Field>
        <Field label="Margem máxima" hint="Ex: 1.15 = mostra +15%">
          <NumIn value={e.margemMax || 1.15} onChange={(v) => update("estimativa.margemMax", v)} step={0.05} />
        </Field>
      </FieldGroup>

      <div className="adm-info-box" style={{marginTop: 24}}>
        💡 <b>Hotéis por cidade:</b> os preços-base por estrela e cidade ficam no arquivo
        <code> data.jsx</code> (objeto <code>estimativa.hotelBase</code>). Edite lá pra ajustes finos.
      </div>
    </div>
  );
}

// ─── Aba FOTOS DAS CIDADES ──────────────────────────────────────
// Permite trocar a URL ou fazer upload de cada foto de cidade.
function AdminCidadesImg() {
  // Salvamos overrides em localStorage separado dos sites_config
  const [overrides, setOverrides] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem("vnc:sede-images") || "{}"); }
    catch { return {}; }
  });

  const update = (cityKey, url) => {
    const next = { ...overrides, [cityKey]: url };
    setOverrides(next);
    try {
      localStorage.setItem("vnc:sede-images", JSON.stringify(next));
      window.dispatchEvent(new CustomEvent("sede-images-change", { detail: next }));
    } catch {}
  };

  const remove = (cityKey) => {
    const next = { ...overrides };
    delete next[cityKey];
    setOverrides(next);
    try {
      localStorage.setItem("vnc:sede-images", JSON.stringify(next));
      window.dispatchEvent(new CustomEvent("sede-images-change", { detail: next }));
    } catch {}
  };

  // Upload de arquivo local → vira base64
  const onUpload = (cityKey) => (ev) => {
    const file = ev.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("Arquivo muito grande. Máximo 2 MB. Comprima em tinyjpg.com");
      return;
    }
    const r = new FileReader();
    r.onload = () => update(cityKey, r.result);
    r.readAsDataURL(file);
    ev.target.value = "";
  };

  return (
    <div className="adm-content">
      <div className="adm-section-h">Fotos das 16 Cidades-Sede</div>
      <p className="adm-section-sub">
        Configure foto pra cada cidade. Pode colar URL externa OU fazer upload de arquivo do seu computador.
        Cidades sem foto configurada usam o fallback elegante (gradiente com o nome).
      </p>

      <div className="adm-info-box" style={{marginTop:12}}>
        💡 <b>Dica</b>: pra cidades sem foto, baixe fotos no Unsplash/Pexels (uso comercial livre) e faça upload aqui.
        Sugestão de buscas: "Atlanta skyline", "Monterrey Cerro de la Silla", "Kansas City Missouri", "Houston Texas skyline", "Guadalajara cathedral".
      </div>

      <div className="adm-cidades-grid">
        {SEDES.map((s, i) => {
          const cityKey = `sede-${i}`;
          const currentUrl = overrides[cityKey] || s.image || "";
          const isCustom = !!overrides[cityKey];
          return (
            <div key={cityKey} className="adm-cidade-card">
              <div className="adm-cidade-preview">
                {currentUrl
                  ? <img src={currentUrl} alt={s.city}
                         onError={(e) => { e.target.style.display = "none"; }} />
                  : <div className="adm-cidade-empty">(sem foto · usa fallback)</div>}
                <div className={`adm-cidade-flag ${s.country}`}></div>
              </div>
              <div className="adm-cidade-info">
                <h4>{s.city}</h4>
                <p>{s.stadium}</p>
                {isCustom && <span className="adm-pill-custom">Customizada</span>}
              </div>
              <div className="adm-cidade-actions">
                <Field label="URL da imagem">
                  <TextIn
                    value={(overrides[cityKey] && !overrides[cityKey].startsWith("data:")) ? overrides[cityKey] : (s.image || "")}
                    onChange={(v) => v ? update(cityKey, v) : remove(cityKey)}
                    placeholder="https://..."
                  />
                </Field>
                <div style={{display:"flex", gap:8, marginTop:8, flexWrap:"wrap"}}>
                  <label className="adm-btn ghost" style={{cursor:"pointer", margin:0}}>
                    📤 Upload
                    <input type="file" accept="image/*" style={{display:"none"}}
                           onChange={onUpload(cityKey)} />
                  </label>
                  {isCustom && (
                    <button className="adm-btn danger sm" onClick={() => remove(cityKey)}>
                      ↺ Restaurar padrão
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Aba SEGURANÇA (login & senha) ─────────────────────────────
function AdminSeguranca({ onLogout }) {
  const [cfg, update] = useSiteConfig();
  const [newUsername, setNewUsername] = React.useState(cfg.auth?.username || "admin");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [msg, setMsg] = React.useState({ type: "", text: "" });
  const [showPwd, setShowPwd] = React.useState(false);

  const save = async () => {
    setMsg({ type: "", text: "" });
    if (!newUsername.trim()) {
      setMsg({ type: "error", text: "Usuário não pode ficar vazio." });
      return;
    }
    if (newPassword && newPassword.length < 6) {
      setMsg({ type: "error", text: "Senha precisa de pelo menos 6 caracteres." });
      return;
    }
    if (newPassword && newPassword !== confirmPassword) {
      setMsg({ type: "error", text: "Confirmação de senha não bate." });
      return;
    }
    try {
      await updateAuth({
        username: newUsername.trim(),
        newPassword: newPassword || undefined
      });
      setMsg({ type: "success", text: "Credenciais atualizadas! Próximo login usa os novos dados." });
      setNewPassword("");
      setConfirmPassword("");
    } catch (e) {
      setMsg({ type: "error", text: "Erro ao salvar. Tente de novo." });
    }
  };

  const doLogout = () => {
    if (confirm("Sair do painel admin?")) {
      logoutSession();
      // recarrega pra voltar pra tela de login
      window.location.reload();
    }
  };

  return (
    <div className="adm-content">
      <div className="adm-section-h">🔐 Login &amp; Senha do Admin</div>
      <p className="adm-section-sub">
        Esses dados protegem o acesso ao painel. <b>Recomendado trocar a senha padrão imediatamente.</b>
      </p>

      <div className="adm-info-box" style={{background:"rgba(234,179,8,0.08)", borderColor:"rgba(234,179,8,0.3)"}}>
        ⚠️ <b>Aviso de segurança:</b> esse login funciona via JavaScript no navegador.
        É uma "trava de porta" — afasta o curioso, mas <b>não é proteção militar</b>.
        Pra segurança real em produção, ative <b>Vercel Password Protection</b> (Settings → Deployment Protection → Password Protection)
        ou <b>Cloudflare Access</b>. Combinado com o login daqui, fica robusto.
      </div>

      <Field label="Usuário">
        <TextIn value={newUsername} onChange={setNewUsername} placeholder="admin" />
      </Field>

      <Field label="Nova senha" hint="Deixe em branco pra manter a atual. Mínimo 6 caracteres.">
        <div style={{position:"relative"}}>
          <input
            type={showPwd ? "text" : "password"}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="adm-input"
            placeholder="••••••••"
            autoComplete="new-password"
          />
          <button type="button"
            onClick={() => setShowPwd(s => !s)}
            style={{
              position:"absolute", right:8, top:"50%", transform:"translateY(-50%)",
              background:"none", border:"none", color:"#888", cursor:"pointer", fontSize:18
            }}>
            {showPwd ? "🙈" : "👁"}
          </button>
        </div>
      </Field>

      {newPassword && (
        <Field label="Confirmar nova senha">
          <input
            type={showPwd ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="adm-input"
            placeholder="••••••••"
          />
        </Field>
      )}

      {msg.text && (
        <div className={`adm-msg ${msg.type === "success" ? "ok" : "err"}`}>
          {msg.text}
        </div>
      )}

      <div style={{display:"flex", gap:10, marginTop:20, flexWrap:"wrap"}}>
        <button className="adm-btn primary" onClick={save}>
          Salvar credenciais
        </button>
        <button className="adm-btn danger" onClick={doLogout}>
          🚪 Sair do painel
        </button>
      </div>

      <div className="adm-section-h" style={{marginTop:32}}>Duração da Sessão</div>
      <Field label="Horas até expirar o login automaticamente" hint="Sessão expira quando o navegador fecha OU quando esse tempo passa, o que vier primeiro.">
        <NumIn
          value={cfg.auth?.sessionDurationHours || 8}
          onChange={(v) => update("auth.sessionDurationHours", v)}
          min={1} step={1}
        />
      </Field>
    </div>
  );
}

// ─── Aba DEPLOY (publicar mudanças) ────────────────────────────
function AdminDeploy() {
  const [cfg, update] = useSiteConfig();
  const [hook, setHook] = React.useState(cfg.deploy?.vercelDeployHook || "");
  const [deploying, setDeploying] = React.useState(false);
  const [msg, setMsg] = React.useState({ type: "", text: "" });

  const saveHook = () => {
    update("deploy.vercelDeployHook", hook.trim());
    setMsg({ type: "success", text: "Deploy Hook salvo!" });
    setTimeout(() => setMsg({ type: "", text: "" }), 3000);
  };

  const deploy = async () => {
    if (!hook.trim()) {
      setMsg({ type: "error", text: "Configure a URL do Deploy Hook primeiro." });
      return;
    }
    setDeploying(true);
    setMsg({ type: "", text: "" });
    try {
      await triggerVercelDeploy();
      setMsg({ type: "success", text: "✅ Deploy disparado! Aguarde ~2min e atualize o site público." });
    } catch (e) {
      setMsg({ type: "error", text: "❌ Erro: " + e.message });
    } finally {
      setDeploying(false);
    }
  };

  const onImport = (ev) => {
    const f = ev.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      if (importSiteData(r.result)) {
        setMsg({ type: "success", text: "Configurações importadas! Recarregue a página." });
      } else {
        setMsg({ type: "error", text: "Erro ao importar. Arquivo inválido." });
      }
    };
    r.readAsText(f);
    ev.target.value = "";
  };

  return (
    <div className="adm-content">
      <div className="adm-section-h">💾 Backup &amp; Exportação</div>
      <p className="adm-section-sub">
        Salve TODAS as suas configurações em um arquivo JSON. Use pra backup ou pra transferir entre máquinas.
      </p>
      <div style={{display:"flex", gap:10, flexWrap:"wrap", marginTop:14}}>
        <button className="adm-btn primary" onClick={exportSiteData}>
          📥 Exportar configurações (JSON)
        </button>
        <label className="adm-btn ghost" style={{cursor:"pointer", margin:0}}>
          📤 Importar JSON
          <input type="file" accept="application/json" style={{display:"none"}} onChange={onImport} />
        </label>
      </div>

      <div className="adm-section-h" style={{marginTop:40}}>🚀 Publicar na Vercel</div>
      <p className="adm-section-sub">
        Dispara um redeploy automático do seu site na Vercel via <b>Deploy Hook</b>.
      </p>

      <div className="adm-info-box" style={{marginTop:12}}>
        <b>Como obter o Deploy Hook URL:</b>
        <ol style={{margin:"8px 0 0 18px", paddingLeft:0}}>
          <li>Acesse seu projeto na <a href="https://vercel.com" target="_blank" rel="noopener" style={{color:"var(--gold)"}}>vercel.com</a></li>
          <li>Vá em <code>Settings → Git → Deploy Hooks</code></li>
          <li>Crie um hook (nome: "Admin Panel", branch: "main")</li>
          <li>Copie a URL gerada (começa com <code>https://api.vercel.com/...</code>)</li>
          <li>Cole abaixo</li>
        </ol>
      </div>

      <Field label="URL do Vercel Deploy Hook" hint="Mantenha esta URL secreta — qualquer um com ela dispara deploys.">
        <TextIn value={hook} onChange={setHook} placeholder="https://api.vercel.com/v1/integrations/deploy/..." />
      </Field>

      <div style={{display:"flex", gap:10, marginTop:12, flexWrap:"wrap"}}>
        <button className="adm-btn" onClick={saveHook}>Salvar URL</button>
        <button className="adm-btn primary" onClick={deploy} disabled={deploying || !hook.trim()}>
          {deploying ? "⏳ Publicando..." : "🚀 Publicar mudanças agora"}
        </button>
      </div>

      {cfg.deploy?.lastDeployAt && (
        <p style={{marginTop:14, fontSize:12, color:"var(--ink-dim)"}}>
          Último deploy: {new Date(cfg.deploy.lastDeployAt).toLocaleString("pt-BR")}
        </p>
      )}

      {msg.text && (
        <div className={`adm-msg ${msg.type === "success" ? "ok" : "err"}`} style={{marginTop:16}}>
          {msg.text}
        </div>
      )}

      <div className="adm-info-box" style={{marginTop:32, background:"rgba(234,179,8,0.08)", borderColor:"rgba(234,179,8,0.3)"}}>
        ⚠️ <b>Importante:</b> o Deploy Hook só rebuilda o site com os arquivos que estão no Git.
        <b>As edições que você faz no admin (texto, fotos, preços) ficam só no SEU navegador</b> (localStorage).
        Pra elas aparecerem pro mundo, você precisa:
        <ol style={{margin:"8px 0 0 18px"}}>
          <li>Exportar JSON acima</li>
          <li>Subir o arquivo no seu repositório (Git)</li>
          <li>Configurar o site pra ler dele</li>
        </ol>
        Por enquanto, as edições funcionam só pra você ver no seu navegador.
      </div>
    </div>
  );
}

function AdminPanel({ onClose, tweaks, setTweak }) {
  const [tab, setTab] = React.useState("pacotes");
  // Re-render quando registry de mídia muda (pra atualizar contador da aba Imagens)
  const [, forceMedia] = React.useState(0);
  React.useEffect(() => {
    const fn = () => forceMedia((n) => n + 1);
    _registrySubs.add(fn);
    return () => _registrySubs.delete(fn);
  }, []);

  // ESC fecha
  React.useEffect(() => {
    const fn = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose]);

  // Quando o painel está aberto, body não rola
  React.useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  const tabs = [
    { id: "pacotes",    label: "Pacotes prontos", icon: "ticket",   count: PACOTES.length },
    { id: "jogos",      label: "Jogos",           icon: "calendar", count: MATCHES.length },
    { id: "hoteis",     label: "Hotéis",          icon: "hotel",    count: Object.keys(HOTELS).length * 9 },
    { id: "imagens",    label: "Imagens",         icon: "sparkles", count: MEDIA_REGISTRY.length },
    { id: "cidades",    label: "Fotos cidades",   icon: "map-pin",  count: SEDES.length },
    { id: "empresa",    label: "Empresa",         icon: "shield" },
    { id: "seo",        label: "SEO & Analytics", icon: "map-pin" },
    { id: "conteudo",   label: "FAQ & Depoimentos", icon: "mail" },
    { id: "estimativa", label: "Preços",          icon: "sparkles" },
    { id: "seguranca",  label: "🔐 Segurança",     icon: "shield" },
    { id: "deploy",     label: "🚀 Deploy",        icon: "sparkles" },
    { id: "marca",      label: "Marca & visual",  icon: "shield" }
  ];

  return (
    <div className="adm-overlay" onClick={(e) => { if (e.target.classList.contains("adm-overlay")) onClose(); }}>
      <div className="adm-shell" role="dialog" aria-modal="true">
        <header className="adm-head">
          <div className="adm-title">
            <span className="adm-title-icon">⚙</span>
            <div>
              <div className="adm-title-t">Painel Admin</div>
              <div className="adm-title-sub">{tweaks.brand} · alterações salvam automaticamente</div>
            </div>
          </div>
          <button className="adm-close" onClick={onClose} aria-label="Fechar painel">
            <Icon name="x" size={20} />
          </button>
        </header>

        <nav className="adm-tabs">
          {tabs.map((t) => (
            <button key={t.id}
              className={`adm-tab-btn ${tab === t.id ? "active" : ""}`}
              onClick={() => setTab(t.id)}>
              <Icon name={t.icon} size={16} />
              <span>{t.label}</span>
              {t.count != null && <span className="adm-tab-count">{t.count}</span>}
            </button>
          ))}
          <div className="adm-tabs-spacer"></div>
          <button className="adm-btn ghost" onClick={exportAdminData}>Exportar JSON</button>
          <label className="adm-btn ghost">
            Importar JSON
            <input type="file" accept="application/json" style={{ display: "none" }}
                   onChange={(e) => {
                     const f = e.target.files?.[0]; if (!f) return;
                     const r = new FileReader();
                     r.onload = () => { if (importAdminData(r.result)) alert("Dados importados!"); else alert("Erro ao importar."); };
                     r.readAsText(f);
                     e.target.value = "";
                   }} />
          </label>
          <button className="adm-btn danger" onClick={() => {
            if (confirm("Resetar TUDO para os valores originais? Suas edições serão perdidas.")) resetAllAdminData();
          }}>Resetar tudo</button>
        </nav>

        <main className="adm-body">
          {tab === "pacotes"    && <AdminPacotes />}
          {tab === "jogos"      && <AdminJogos />}
          {tab === "hoteis"     && <AdminHoteis />}
          {tab === "imagens"    && <AdminImagens />}
          {tab === "cidades"    && <AdminCidadesImg />}
          {tab === "empresa"    && <AdminEmpresa />}
          {tab === "seo"        && <AdminSEO />}
          {tab === "conteudo"   && <AdminConteudo />}
          {tab === "estimativa" && <AdminEstimativa />}
          {tab === "seguranca"  && <AdminSeguranca onLogout={onClose} />}
          {tab === "deploy"     && <AdminDeploy />}
          {tab === "marca"      && <AdminMarca tweaks={tweaks} setTweak={setTweak} />}
        </main>
      </div>
    </div>
  );
}

// ─── Botão flutuante para abrir o painel ──────────────────────
function AdminButton({ onClick }) {
  return (
    <button className="adm-fab" onClick={onClick} aria-label="Abrir painel admin">
      <span className="adm-fab-icon">⚙</span>
      <span className="adm-fab-text">Admin</span>
    </button>
  );
}

Object.assign(window, { AdminPanel, AdminButton });

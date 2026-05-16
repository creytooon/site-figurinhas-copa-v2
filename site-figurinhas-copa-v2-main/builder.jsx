// ════════════════════════════════════════════════════════════════
// BUILDER · "Monte seu pacote" — usuário escolhe jogos + hotel
// Envia tudo pelo WhatsApp.
// ════════════════════════════════════════════════════════════════

const _STAGE_FILTERS = [
  { id: "all",      label: "Todas as fases", match: () => true },
  { id: "grupos",   label: "Grupos",         match: (m) => m.stage === "Grupos" },
  { id: "32avos",   label: "32-avos",        match: (m) => m.stage === "32-avos" },
  { id: "oitavas",  label: "Oitavas",        match: (m) => m.stage === "Oitavas" },
  { id: "quartas",  label: "Quartas",        match: (m) => m.stage === "Quartas" },
  { id: "semi",     label: "Semifinal",      match: (m) => m.stage === "Semifinal" },
  { id: "terceiro", label: "3º lugar",       match: (m) => m.stage === "3º lugar" },
  { id: "final",    label: "Final",          match: (m) => m.stage === "Final" }
];

const _COUNTRY_FILTERS = [
  { id: "all", label: "Todos os países", flag: null },
  { id: "USA", label: "Estados Unidos",  flag: "USA" },
  { id: "MEX", label: "México",          flag: "MEX" },
  { id: "CAN", label: "Canadá",          flag: "CAN" }
];

const _SHOW_FILTERS = [
  { id: "all",     label: "Todos os jogos", match: () => true },
  { id: "feat",    label: "Principais jogos", match: (m) => m.isFeatured },
  { id: "brazil",  label: "Jogos do Brasil",  match: (m) => m.isBrazil }
];

const LS_KEY = "vnc:cart:v1";

function useCart() {
  const [ids, setIds] = React.useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem(LS_KEY) || "[]")); }
    catch { return new Set(); }
  });
  React.useEffect(() => {
    try { localStorage.setItem(LS_KEY, JSON.stringify([...ids])); } catch {}
  }, [ids]);
  const toggle = (id) => setIds((prev) => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });
  const clear = () => setIds(new Set());
  const has = (id) => ids.has(id);
  const selected = React.useMemo(
    () => MATCHES.filter((m) => ids.has(m.id)).sort((a,b) => a.date - b.date),
    [ids]
  );
  return { ids, selected, has, toggle, clear, count: ids.size };
}

// ─── Linha de jogo ─────────────────────────────────────────────
const MatchRow = ({ m, picked, onToggle }) => {
  return (
    <button type="button"
      className={`match-row ${picked ? "picked" : ""}`}
      onClick={() => onToggle(m.id)}>
      <div className="mr-date">
        <div className="mr-dow">{_diasSemana?.[m.date.getDay()] || ""}</div>
        <div className="mr-dom">{String(m.date.getDate()).padStart(2,"0")}</div>
        <div className="mr-mon">{_meses?.[m.date.getMonth()] || ""}</div>
      </div>
      <div className="mr-main">
        <div className="mr-stage">
          <span className={`stage-chip s-${m.stage.toLowerCase().replace(/[^a-z]/g,'')}`}>
            {m.stageLabel}
          </span>
          <span className="mr-time">{m.time}</span>
        </div>
        <div className="mr-teams">
          <span>{m.teamADisplay}</span>
          <em className="vs">vs</em>
          <span>{m.teamBDisplay}</span>
        </div>
        <div className="mr-venue">
          <FlagSVG country={m.country} size={12} className="flag-inline" />
          {m.city.city} · <span className="dim">{m.city.stadium}</span>
        </div>
      </div>
      <div className="mr-action">
        {picked
          ? <span className="mr-pill picked"><Icon name="check" size={14} strokeWidth={2.5}/> Adicionado</span>
          : <span className="mr-pill">+ Adicionar</span>}
      </div>
    </button>
  );
};

// ─── Drawer do "Seu pacote" (fica fixo no rodapé / lateral) ─────
const CartDrawer = ({ cart, hotel, setHotel, hotelChoices, setHotelChoices,
                     tripOption, setTripOption, flightClass, setFlightClass,
                     brand }) => {
  const [open, setOpen] = React.useState(false);
  // Passageiros (com persistência local)
  const [pax, setPax] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem("vnc:pax") || "{\"adults\":2,\"children\":0,\"babies\":0}"); }
    catch { return { adults: 2, children: 0, babies: 0 }; }
  });
  React.useEffect(() => {
    try { localStorage.setItem("vnc:pax", JSON.stringify(pax)); } catch {}
  }, [pax]);
  const empty = cart.count === 0;

  const adjustPax = (k, delta) => {
    const cur = pax[k];
    const next = Math.max(0, Math.min(9, cur + delta));
    if (k === "adults" && next < 1) return;
    const total = (k === "adults" ? next : pax.adults) +
                  (k === "children" ? next : pax.children) +
                  (k === "babies" ? next : pax.babies);
    if (total > 9) return;
    setPax({ ...pax, [k]: next });
  };
  const paxTotal = pax.adults + pax.children + pax.babies;

  // Cidades únicas pela ordem cronológica
  const uniqueCities = React.useMemo(() => {
    const seen = new Set();
    const list = [];
    cart.selected.forEach((m) => {
      if (!seen.has(m.city.id)) { seen.add(m.city.id); list.push(m.city); }
    });
    return list;
  }, [cart.selected]);

  // Default hotel pick = índice 0 (o "melhor" da admin)
  React.useEffect(() => {
    const next = { ...hotelChoices };
    let changed = false;
    uniqueCities.forEach((c) => {
      const k = `${c.id}-${hotel}`;
      if (next[k] == null) { next[k] = 0; changed = true; }
    });
    if (changed) setHotelChoices(next);
  }, [uniqueCities, hotel]);

  // Calcula plano da viagem
  const plan = React.useMemo(() =>
    empty ? null : computeTripPlan({
      matches: cart.selected,
      option: tripOption,
      flightClass,
      hotelTier: hotel
    }),
    [cart.selected, tripOption, flightClass, hotel, empty]
  );

  const tripDays = plan ? Math.round((plan.returnFlight - plan.depart) / 86400000) + 1 : 0;

  // Constrói mensagem do WhatsApp com TODO o resumo
  const buildMessage = () => {
    if (empty) return `Olá! Quero montar um pacote para a Copa 2026.`;
    const tier = HOTEL_TIERS.find((h) => h.id === hotel) || HOTEL_TIERS[1];
    const lines = [];
    lines.push(`Olá, ${brand}! Montei um pacote pra Copa 2026 e quero fechar. Segue o resumo:`);
    lines.push("");
    lines.push(`📍 *Destino${plan.cities.length > 1 ? "s" : ""}*: ${plan.cities.map((c) => c.city).join(" → ")}`);
    lines.push("");
    lines.push(`⚽ *Jogo${plan.matches.length > 1 ? "s" : ""} (${plan.matches.length})*:`);
    plan.matches.forEach((m, i) => {
      lines.push(`${i+1}. ${fmtDateMedium(m.date)} · ${m.stageLabel} · ${m.city.city} (${m.city.stadium}) · ${m.time}`);
    });
    lines.push("");
    lines.push(`🎒 *Opção de pacote*: ${plan.option.label} (${plan.option.days})`);
    lines.push(`✈️ *Classe do voo*: ${plan.flightClass.label}`);
    lines.push("");
    lines.push(`🛫 Ida Brasil → ${plan.cities[0].city}: ${fmtDateMedium(plan.depart)}`);
    lines.push(`🛬 Volta ${plan.cities[plan.cities.length - 1].city} → Brasil: ${fmtDateMedium(plan.returnFlight)} (chegada ${fmtDateMedium(plan.returnArrival)})`);
    lines.push(`🏨 Hospedagem: ${fmtDateMedium(plan.checkin)} → ${fmtDateMedium(plan.checkout)} (${plan.nights} ${plan.nights === 1 ? "noite" : "noites"})`);
    lines.push("");
    lines.push(`🛏️ *Hotel ${tier.stars} ${tier.label}*:`);
    plan.cities.forEach((c) => {
      const opts = HOTELS[c.id]?.[hotel] || [];
      const idx = hotelChoices[`${c.id}-${hotel}`] ?? 0;
      const pick = opts[idx];
      if (pick) lines.push(`• ${c.city}: ${pick.name} (${pick.area})`);
      else      lines.push(`• ${c.city}: hotel a definir com a equipe`);
    });
    lines.push("");
    lines.push(`💰 *Valor estimado*:`);
    lines.push(`• Aéreo: a partir de ${fmtBRL(plan.prices.air)}`);
    lines.push(`• Hotel (${plan.nights}n): a partir de ${fmtBRL(plan.prices.hotel)}`);
    lines.push(`• Ingressos: a partir de ${fmtBRL(plan.prices.tickets)}`);
    lines.push(`• *Total estimado*: a partir de ${fmtBRL(plan.prices.total)}`);
    lines.push(`Parcelado em até 18× sem juros.`);
    lines.push("");
    // Passageiros
    lines.push(`👥 *Passageiros*:`);
    if (pax.adults)   lines.push(`• ${pax.adults} adulto${pax.adults > 1 ? "s" : ""}`);
    if (pax.children) lines.push(`• ${pax.children} criança${pax.children > 1 ? "s" : ""} (2–17 anos)`);
    if (pax.babies)   lines.push(`• ${pax.babies} bebê${pax.babies > 1 ? "s" : ""} de colo (0–23 meses)`);
    lines.push("");
    if (plan.needsVisa) {
      lines.push(`🛂 *Assessoria de visto*: tenho interesse (destinos: ${plan.visaCountries.map((c) => c === "USA" ? "EUA" : "Canadá").join(" + ")}).`);
    } else {
      lines.push(`🛂 *Visto*: não preciso (destino apenas no México 🇲🇽).`);
    }
    lines.push("");
    lines.push(`Pode me ajudar a finalizar?`);
    return lines.join("\n");
  };

  const wa = waLink(buildMessage());

  return (
    <div className={`cart-drawer ${open ? "open" : ""} ${empty ? "empty" : ""}`}>
      <button className="cart-tab" onClick={() => setOpen((o) => !o)}>
        <span className="ct-icon"><Icon name="ticket" size={18}/></span>
        <span className="ct-text">
          <b>{cart.count}</b> {cart.count === 1 ? "jogo selecionado" : "jogos selecionados"}
          {!empty && <span className="ct-sub">{tripDays} {tripDays === 1 ? "dia" : "dias"} · {uniqueCities.length} {uniqueCities.length === 1 ? "cidade" : "cidades"}</span>}
        </span>
        <span className="ct-toggle"><Icon name={open ? "x" : "arrow-down"} size={16}/></span>
      </button>

      <div className="cart-body">
        {/* ── 1 · Jogos ─────────────────────────────────────── */}
        <div className="cart-section">
          <div className="cart-section-h">
            <span><b className="cs-step">1</b> Jogos selecionados</span>
            {!empty && <button className="cart-clear" onClick={cart.clear}>Limpar tudo</button>}
          </div>
          {empty
            ? <div className="cart-empty">Toque em <b>+ Adicionar</b> em qualquer jogo da lista pra começar.</div>
            : <ul className="cart-list">
                {cart.selected.map((m) => (
                  <li key={m.id}>
                    <div className="cl-main">
                      <div className="cl-stage">{m.stageLabel}</div>
                      <div className="cl-venue">
                        <FlagSVG country={m.country} size={11} className="flag-inline" />
                        {m.city.city} · {fmtDateMedium(m.date)} · {m.time}
                      </div>
                    </div>
                    <button className="cl-rm" onClick={() => cart.toggle(m.id)} aria-label="Remover">
                      <Icon name="x" size={14} strokeWidth={2}/>
                    </button>
                  </li>
                ))}
              </ul>
          }
        </div>

        {!empty && (
          <>
            {/* ── 2 · Opção de pacote (datas) ──────────────── */}
            <div className="cart-section">
              <div className="cart-section-h"><span><b className="cs-step">2</b> Duração da viagem</span></div>
              <div className="trip-options">
                {TRIP_OPTIONS.map((o) => (
                  <button key={o.id}
                    className={`trip-opt ${tripOption === o.id ? "active" : ""} ${o.recommended ? "recommended" : ""}`}
                    onClick={() => setTripOption(o.id)}>
                    {o.recommended && <span className="trip-badge">Recomendado</span>}
                    <span className="trip-label">{o.label}</span>
                    <span className="trip-days">{o.days}</span>
                    <span className="trip-note">{o.note}</span>
                  </button>
                ))}
              </div>

              {plan && (
                <div className="trip-itinerary">
                  <div className="ti-row">
                    <Icon name="plane" size={13}/>
                    <span><b>Ida</b> Brasil → {plan.cities[0].city}</span>
                    <span className="ti-date">{fmtDateMedium(plan.depart)}</span>
                  </div>
                  <div className="ti-row">
                    <Icon name="map-pin" size={13}/>
                    <span><b>Chegada</b> em {plan.cities[0].city}</span>
                    <span className="ti-date">{fmtDateMedium(plan.arrival)}</span>
                  </div>
                  {plan.crossCity && plan.cities.slice(1).map((c, i) => (
                    <div key={c.id} className="ti-row">
                      <Icon name="plane" size={13}/>
                      <span><b>Trecho doméstico</b> → {c.city}</span>
                      <span className="ti-date">entre jogos</span>
                    </div>
                  ))}
                  <div className="ti-row">
                    <Icon name="plane" size={13} style={{transform:"scaleX(-1)"}}/>
                    <span><b>Volta</b> {plan.cities[plan.cities.length-1].city} → Brasil</span>
                    <span className="ti-date">{fmtDateMedium(plan.returnFlight)}</span>
                  </div>
                  <div className="ti-row">
                    <Icon name="map-pin" size={13}/>
                    <span><b>Chegada</b> ao Brasil</span>
                    <span className="ti-date">{fmtDateMedium(plan.returnArrival)}</span>
                  </div>
                  <div className="ti-row ti-hotel">
                    <Icon name="hotel" size={13}/>
                    <span><b>Hospedagem</b> {fmtDateMedium(plan.checkin)} → {fmtDateMedium(plan.checkout)}</span>
                    <span className="ti-date">{plan.nights} {plan.nights === 1 ? "noite" : "noites"}</span>
                  </div>
                </div>
              )}
            </div>

            {/* ── 3 · Classe do voo ───────────────────────── */}
            <div className="cart-section">
              <div className="cart-section-h"><span><b className="cs-step">3</b> Classe do voo</span></div>
              <div className="flight-classes">
                {FLIGHT_CLASSES.map((f) => (
                  <button key={f.id}
                    className={`flight-opt ${flightClass === f.id ? "active" : ""}`}
                    onClick={() => setFlightClass(f.id)}>
                    <span className="fl-label">{f.label}</span>
                    <span className="fl-note">{f.note}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* ── 4 · Hotel ───────────────────────────────── */}
            <div className="cart-section">
              <div className="cart-section-h"><span><b className="cs-step">4</b> Categoria de hotel</span></div>
              <div className="hotel-picker">
                {HOTEL_TIERS.map((h) => (
                  <button key={h.id}
                    className={`hotel-opt ${hotel === h.id ? "active" : ""}`}
                    onClick={() => setHotel(h.id)}>
                    <span className="ho-stars">{h.stars}</span>
                    <span className="ho-label">{h.label}</span>
                    <span className="ho-note">{h.note}</span>
                  </button>
                ))}
              </div>

              {uniqueCities.length > 0 && (
                <div className="city-hotels">
                  <div className="city-hotels-h">
                    Hotel preferido em cada cidade — clique pra trocar
                  </div>
                  {uniqueCities.map((c) => {
                    const opts = HOTELS[c.id]?.[hotel] || [];
                    const key = `${c.id}-${hotel}`;
                    const idx = hotelChoices[key] ?? 0;
                    // Calcula preço por noite pra cada hotel desta cidade
                    const cfg = (typeof getSiteConfig === "function") ? getSiteConfig() : null;
                    const est = cfg?.estimativa;
                    const tierStars = HOTEL_TIERS.find(h => h.id === hotel)?.stars || 4;
                    const baseUSD = est?.hotelBase?.[c.id]?.[tierStars] ?? 200;
                    const cotacao = est?.cotacaoUSD ?? 5.30;
                    const copaMul = est?.copaMultiplier ?? 1.6;
                    // Preço base por noite em BRL, considerando alta temporada Copa
                    const basePriceBRL = Math.round(baseUSD * copaMul * cotacao);
                    return (
                      <div key={c.id} className="city-hotel">
                        <div className="ch-city">
                          <FlagSVG country={c.country} size={12} className="flag-inline" />
                          {c.city}
                        </div>
                        <div className="ch-options">
                          {opts.map((opt, i) => {
                            // Cada hotel pode ter um pequeno ajuste de preço (i=0 base, i=1 +10%, i=2 -8%)
                            const adjust = [1.0, 1.12, 0.92][i] ?? 1.0;
                            const priceNight = Math.round(basePriceBRL * adjust / 50) * 50;
                            return (
                              <button key={i}
                                className={`ch-opt ${i === idx ? "picked" : ""}`}
                                onClick={() => setHotelChoices({ ...hotelChoices, [key]: i })}>
                                <span className="ch-radio"></span>
                                <div className="ch-info">
                                  <div className="ch-name">{opt.name}</div>
                                  <div className="ch-area">{opt.area} · <span className="ch-note">{opt.note}</span></div>
                                  <div className="ch-price">
                                    A partir de <b>{fmtBRL(priceNight)}</b> / noite
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ── 5 · Banner de assessoria de visto ───────── */}
            {plan && plan.needsVisa && (
              <VisaBanner countries={plan.visaCountries} />
            )}
            {plan && !plan.needsVisa && (
              <div className="visa-note">
                ✅ <b>Boa notícia!</b> Você não precisa de visto para o México 🇲🇽
              </div>
            )}

            {/* ── Passageiros ──────────────────────────────── */}
            {plan && (
              <div className="cart-section pax-section">
                <div className="cart-section-h"><span><b className="cs-step">5</b> Passageiros</span></div>
                {[
                  { k: "adults",   label: "Adultos",       sub: "18+ anos" },
                  { k: "children", label: "Crianças",      sub: "2 a 17 anos" },
                  { k: "babies",   label: "Bebês de colo", sub: "0 a 23 meses" }
                ].map(({k, label, sub}) => (
                  <div className="pax-row" key={k}>
                    <div>
                      <div className="pax-label">{label}</div>
                      <div className="pax-sub">{sub}</div>
                    </div>
                    <div className="pax-ctrl">
                      <button type="button" onClick={() => adjustPax(k, -1)}
                              disabled={pax[k] === 0 || (k === "adults" && pax[k] === 1)}>−</button>
                      <span>{pax[k]}</span>
                      <button type="button" onClick={() => adjustPax(k, +1)}>+</button>
                    </div>
                  </div>
                ))}
                <div className="pax-total-line">
                  <b>{paxTotal}</b> {paxTotal === 1 ? "passageiro" : "passageiros"}
                  {(pax.children > 0 || pax.babies > 0) && (
                    <span className="pax-warn">⚠️ Crianças requerem documentação especial</span>
                  )}
                </div>
              </div>
            )}

            {/* ── 6 · Resumo + valores ───────────────────── */}
            {plan && (
              <div className="cart-section price-summary">
                <div className="cart-section-h"><span><b className="cs-step">6</b> Valor estimado</span></div>
                <div className="price-row"><span>Aéreo ({plan.flightClass.label.toLowerCase()})</span> <span>{fmtBRL(plan.prices.air)}</span></div>
                <div className="price-row"><span>Hotel · {plan.nights}n {HOTEL_TIERS.find((h) => h.id === hotel)?.stars}</span> <span>{fmtBRL(plan.prices.hotel)}</span></div>
                <div className="price-row"><span>Ingressos ({plan.matches.length})</span> <span>{fmtBRL(plan.prices.tickets)}</span></div>
                <div className="price-row total"><span>Total estimado</span> <span>{fmtBRL(plan.prices.total)}</span></div>
                <div className="price-install">ou <b>18× de {fmtBRL(Math.round(plan.prices.total / 18))}</b> sem juros</div>
                <div className="price-disclaimer">
                  Valores referenciais. O fechamento real é feito pelo atendente.
                </div>
              </div>
            )}
          </>
        )}

        {/* ── CTA final ─────────────────────────────────────── */}
        <div className="cart-section">
          <a href={wa} target="_blank" rel="noopener"
             className={`btn btn-wa cart-send ${empty ? "disabled" : ""}`}>
            <Icon name="whatsapp" size={20}/>
            {empty ? "Selecione ao menos 1 jogo" : "Fechar pacote no WhatsApp"}
          </a>
          {!empty && (
            <a href={waLink(`Olá! Estou montando um pacote para ${uniqueCities[0]?.city} e tenho uma dúvida.`)}
               target="_blank" rel="noopener"
               className="cart-secondary">
              Tirar dúvidas no WhatsApp
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Banner de assessoria de visto ──────────────────────────────
const VisaBanner = ({ countries }) => {
  const list = countries.map((c) => c === "USA" ? "EUA" : "Canadá").join(" e ");
  const msg = `Olá! Estou montando um pacote para a Copa 2026 (destinos: ${list}) e gostaria de saber mais sobre a assessoria de visto.`;
  return (
    <div className="visa-banner">
      <div className="visa-banner-glow" aria-hidden="true"></div>
      <div className="visa-banner-head">
        <div className="visa-icon" aria-hidden="true">
          <span className="vi-doc">🛂</span>
          <span className="vi-check">✓</span>
        </div>
        <div>
          <div className="visa-title">Precisa de visto? <em>Relaxa!</em></div>
          <div className="visa-sub">
            Cuidamos de todo o processo do visto {list.includes("e") ? "americano e canadense" : list === "EUA" ? "americano" : "canadense"} — do agendamento ao deferimento. Você só se preocupa em torcer pelo Brasil! 🇧🇷
          </div>
        </div>
      </div>
      <ul className="visa-list">
        <li><span className="visa-tick">✅</span> <b>Garantimos aprovação</b></li>
        <li><span className="visa-tick">✅</span> Agendamento da entrevista</li>
        <li><span className="visa-tick">✅</span> Preenchimento de formulários (DS-160 / eTA)</li>
        <li><span className="visa-tick">✅</span> Orientação completa pré-entrevista</li>
        <li><span className="visa-tick">✅</span> Acompanhamento até o deferimento</li>
      </ul>
      <a href={waLink(msg)} target="_blank" rel="noopener" className="visa-cta">
        <Icon name="whatsapp" size={18}/>
        Falar com especialista no WhatsApp
      </a>
    </div>
  );
};

// ─── Seção principal "Monte seu pacote" ────────────────────────
const Builder = ({ brand }) => {
  useDataVersion();
  const cart = useCart();
  const [country, setCountry] = React.useState("all");
  const [stage, setStage]     = React.useState("all");
  const [show, setShow]       = React.useState("brazil");  // Inicia em "Jogos do Brasil" (3 jogos)
  const [hotel, setHotel]     = React.useState(4);
  const [tripOption, setTripOption] = React.useState(() => {
    try { return localStorage.getItem("vnc:trip-opt") || "segura"; } catch { return "segura"; }
  });
  React.useEffect(() => { try { localStorage.setItem("vnc:trip-opt", tripOption); } catch {} }, [tripOption]);
  const [flightClass, setFlightClass] = React.useState(() => {
    try { return localStorage.getItem("vnc:flight-class") || "econ"; } catch { return "econ"; }
  });
  React.useEffect(() => { try { localStorage.setItem("vnc:flight-class", flightClass); } catch {} }, [flightClass]);
  const [hotelChoices, setHotelChoices] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem("vnc:hotel-choices") || "{}"); }
    catch { return {}; }
  });
  React.useEffect(() => {
    try { localStorage.setItem("vnc:hotel-choices", JSON.stringify(hotelChoices)); } catch {}
  }, [hotelChoices]);
  const [maxVisible, setMaxVisible] = React.useState(20);

  const filtered = React.useMemo(() => {
    return MATCHES.filter((m) => {
      if (country !== "all" && m.country !== country) return false;
      const sf = _STAGE_FILTERS.find((s) => s.id === stage);
      if (sf && !sf.match(m)) return false;
      const sh = _SHOW_FILTERS.find((s) => s.id === show);
      if (sh && !sh.match(m)) return false;
      return true;
    });
  }, [country, stage, show]);

  React.useEffect(() => { setMaxVisible(20); }, [country, stage, show]);

  // Agrupa por data
  const grouped = React.useMemo(() => {
    const out = [];
    let lastKey = null;
    filtered.slice(0, maxVisible).forEach((m) => {
      const key = m.date.toDateString();
      if (key !== lastKey) {
        out.push({ kind: "header", date: m.date, key });
        lastKey = key;
      }
      out.push({ kind: "match", m });
    });
    return out;
  }, [filtered, maxVisible]);

  return (
    <section className="builder-section" id="monte">
      <div className="wrap">
        <Reveal as="div" className="section-head">
          <span className="eyebrow"><span className="dot"></span>Monte o seu pacote · 104 jogos</span>
          <h2>Você escolhe<br/><span className="gold-grad">os jogos</span></h2>
          <p className="lede">Selecione um ou mais jogos, escolha a categoria de hotel e a gente envia tudo certinho pelo WhatsApp — voos, hospedagem, ingressos e traslados.</p>
        </Reveal>

        <div className="builder-grid">
          {/* Coluna esquerda: filtros + lista de jogos */}
          <div className="builder-list-col">
            <div className="builder-filters">
              <div className="bf-row">
                <span className="bf-lbl">Mostrar</span>
                <div className="bf-chips">
                  {_SHOW_FILTERS.map((s) => (
                    <button key={s.id}
                      className={`chip ${show === s.id ? "active" : ""} ${s.id === "brazil" ? "chip-br" : ""}`}
                      onClick={() => setShow(s.id)}>
                      {s.id === "brazil" && <FlagSVG country="BRA" size={12} className="cf-flag" />}
                      {s.id === "feat"   && <span className="cf-flag">⭐</span>}
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="bf-row">
                <span className="bf-lbl">País</span>
                <div className="bf-chips">
                  {_COUNTRY_FILTERS.map((c) => (
                    <button key={c.id}
                      className={`chip ${country === c.id ? "active" : ""}`}
                      onClick={() => setCountry(c.id)}>
                      {c.flag
                        ? <FlagSVG country={c.flag} size={12} className="cf-flag" />
                        : <span className="cf-flag">🌎</span>}
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="bf-row">
                <span className="bf-lbl">Fase</span>
                <div className="bf-chips">
                  {_STAGE_FILTERS.map((s) => (
                    <button key={s.id}
                      className={`chip ${stage === s.id ? "active" : ""}`}
                      onClick={() => setStage(s.id)}>
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="bf-summary">
                <b>{filtered.length}</b> {filtered.length === 1 ? "jogo encontrado" : "jogos encontrados"}
                {filtered.length > maxVisible && <> · mostrando os {maxVisible} primeiros</>}
                {(country !== "all" || stage !== "all" || show !== "all") &&
                  <button className="bf-clear"
                          onClick={() => { setCountry("all"); setStage("all"); setShow("all"); }}>
                    limpar filtros
                  </button>}
              </div>
            </div>

            <div className="builder-list">
              {grouped.length === 0 && (
                <div className="builder-empty">
                  Nenhum jogo com esses filtros. Tente ampliar a seleção.
                </div>
              )}
              {grouped.map((g, idx) =>
                g.kind === "header"
                  ? <div key={g.key} className="day-header">
                      <span className="dh-day">{_diasSemana[g.date.getDay()]}</span>
                      <span className="dh-date">{fmtDateMedium(g.date)}</span>
                      <span className="dh-line"></span>
                    </div>
                  : <MatchRow key={g.m.id} m={g.m} picked={cart.has(g.m.id)} onToggle={cart.toggle} />
              )}

              {/* Dica: mostra quantos jogos extras estão disponíveis e atalho rápido */}
              {(show === "brazil" || show === "feat") && filtered.length < MATCHES.length && (
                <div className="show-more-hint">
                  <div className="smh-text">
                    Mostrando <b>{filtered.length}</b> {show === "brazil" ? "jogos do Brasil" : "principais jogos"}.
                    <br/>
                    <span className="smh-sub">
                      Existem <b>{MATCHES.length - filtered.length}</b> outros jogos disponíveis (oitavas, quartas, semis, abertura, final…).
                    </span>
                  </div>
                  <div className="smh-actions">
                    {show !== "feat" && (
                      <button className="smh-btn"
                              onClick={() => setShow("feat")}>
                        ⭐ Ver principais ({MATCHES.filter(m => m.isFeatured).length})
                      </button>
                    )}
                    <button className="smh-btn smh-btn-primary"
                            onClick={() => setShow("all")}>
                      Ver todos os {MATCHES.length} jogos →
                    </button>
                  </div>
                </div>
              )}

              {filtered.length > maxVisible && (
                <button className="load-more"
                  onClick={() => setMaxVisible((n) => n + 30)}>
                  Carregar mais {Math.min(30, filtered.length - maxVisible)} jogos
                </button>
              )}
            </div>
          </div>

          {/* Coluna direita: drawer/sidebar */}
          <CartDrawer cart={cart}
                      hotel={hotel} setHotel={setHotel}
                      hotelChoices={hotelChoices} setHotelChoices={setHotelChoices}
                      tripOption={tripOption} setTripOption={setTripOption}
                      flightClass={flightClass} setFlightClass={setFlightClass}
                      brand={brand} />
        </div>
      </div>
    </section>
  );
};

Object.assign(window, { Builder });

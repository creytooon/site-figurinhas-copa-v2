// pages-shop.jsx — Home, Categoria, Produto

// ─── HOME ────────────────────────────────────────────────────────
function HomePage({ navigate, tweaks }) {
  const featured = PRODUCTS.filter((p) => p.badge === 'mais-vendido' || p.badge === 'oferta').slice(0, 8);
  const categories = [
    { type: 'Álbum', label: 'Álbuns', desc: 'Capa cartão e capa dura' },
    { type: 'Envelopes', label: 'Envelopes', desc: 'Avulsos, packs e displays' },
    { type: 'Kit', label: 'Kits', desc: 'Álbum + envelopes' },
    { type: 'Box', label: 'Boxes', desc: 'A coleção em uma só caixa' },
  ];
  return (
    <main className="pg">
      {/* HERO */}
      <section className="hero">
        <div className="hd__container hero__inner">
          <div className="hero__copy">
            <div className="hero__kicker">
              <span className="hero__dot" /> #VEMPRACOPA · Edição 2026
            </div>
            <h1 className="hero__title">
              <span>É FESTA,</span>
              <span className="hero__title-accent">É BRASIL,</span>
              <span>É COPA!</span>
            </h1>
            <p className="hero__lead">
              {tweaks.headline ||
                'Álbuns, envelopes e kits da Copa do Mundo 2026 — embalados com carinho, despachados em 24h, com nota fiscal.'}
            </p>
            <div className="hero__cta">
              <button className="btn btn--gold btn--lg" onClick={() => navigate('category')}>
                Bora colecionar <Icon name="arrow-right" size={18} />
              </button>
              <button className="btn btn--ghost-light btn--lg" onClick={() => navigate('category', { type: 'Álbum' })}>
                Ver álbuns
              </button>
            </div>
            <div className="countdown" aria-live="polite">
              <div className="countdown__label">Faltam pra Copa começar</div>
              <div className="countdown__row" data-countdown>
                <div className="countdown__cell"><strong data-cd="d">--</strong><span>Dias</span></div>
                <div className="countdown__cell"><strong data-cd="h">--</strong><span>Horas</span></div>
                <div className="countdown__cell"><strong data-cd="m">--</strong><span>Min</span></div>
                <div className="countdown__cell"><strong data-cd="s">--</strong><span>Seg</span></div>
              </div>
            </div>
            <div className="hero__strip" style={{ marginTop: 24 }}>
              <div><strong>+12.400</strong><span>colecionadores</span></div>
              <div><strong>4,9★</strong><span>na avaliação</span></div>
              <div><strong>24h</strong><span>despacho</span></div>
            </div>
          </div>
          <div className="hero__art">
            <div className="hero__numbers" aria-hidden>2026</div>
            <div className="hero__product">
              <ProductImage product={PRODUCTS[1]} />
            </div>
            <div className="hero__seal">
              <span>EDIÇÃO</span>
              <strong>LIMITADA</strong>
              <span>2026 · OFICIAL</span>
            </div>
          </div>
        </div>
      </section>

      <Benefits />

      {/* CATEGORIAS */}
      <section className="sect">
        <div className="hd__container">
          <div className="sect__head">
            <div>
              <div className="sect__kicker">EXPLORE A COLEÇÃO</div>
              <h2 className="sect__title">Comece sua coleção</h2>
            </div>
            <a className="sect__link" onClick={() => navigate('category')}>Ver tudo <Icon name="chevron-right" size={14} /></a>
          </div>
          <div className="cats">
            {categories.map((c, i) => {
              const sample = PRODUCTS.find((p) => p.type === c.type);
              return (
                <a key={c.type} className="cat" onClick={() => navigate('category', { type: c.type })} style={{ ['--i']: i }}>
                  <div className="cat__media"><ProductImage product={sample} /></div>
                  <div className="cat__body">
                    <div className="cat__num">0{i + 1}</div>
                    <div>
                      <h3>{c.label}</h3>
                      <p>{c.desc}</p>
                    </div>
                    <Icon name="arrow-right" size={18} />
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* MAIS VENDIDOS */}
      <section className="sect sect--alt">
        <div className="hd__container">
          <div className="sect__head">
            <div>
              <div className="sect__kicker">VITRINE</div>
              <h2 className="sect__title">Mais vendidos da semana</h2>
            </div>
            <a className="sect__link" onClick={() => navigate('category', { sort: 'best' })}>Ver mais <Icon name="chevron-right" size={14} /></a>
          </div>
          <div className={'grid grid--' + (tweaks.cols || 4)}>
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} onOpen={(id) => navigate('product', { id })} />
            ))}
          </div>
        </div>
      </section>

      {/* DESTAQUES — produtos com cardTemplate hero-green/hero-gold */}
      <HeroDestaques navigate={navigate} />


      {/* OFERTAS */}
      <section className="sect sect--alt">
        <div className="hd__container">
          <div className="sect__head">
            <div>
              <div className="sect__kicker">OFERTAS</div>
              <h2 className="sect__title">Ofertas e combos</h2>
            </div>
            <a className="sect__link" onClick={() => navigate('category', { sale: true })}>Todas as ofertas <Icon name="chevron-right" size={14} /></a>
          </div>
          <div className={'grid grid--' + (tweaks.cols || 4)}>
            {PRODUCTS.filter((p) => p.oldPrice).slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} onOpen={(id) => navigate('product', { id })} />
            ))}
          </div>
        </div>
      </section>

      {/* SPECS — Sobre o álbum oficial (v4) */}
      <section className="specs">
        <div className="hd__container">
          <div className="sect__head specs__head">
            <div>
              <div className="sect__kicker">FICHA TÉCNICA</div>
              <h2 className="sect__title">Sobre o álbum oficial</h2>
              <p className="specs__lead">O melhor álbum da história da Copa do Mundo</p>
            </div>
          </div>
          <div className="specs__grid">
            <article className="specs__card specs__card--green-l">
              <div className="specs__num">112</div>
              <div className="specs__label">Páginas</div>
              <div className="specs__desc">O maior álbum da Panini</div>
            </article>
            <article className="specs__card specs__card--yellow-l">
              <div className="specs__num specs__num--blue">980</div>
              <div className="specs__label">Figurinhas</div>
              <div className="specs__desc">Figurinhas especiais incluídas</div>
            </article>
            <article className="specs__card specs__card--blue-l">
              <div className="specs__num">7</div>
              <div className="specs__label">Figurinhas por pacote</div>
              <div className="specs__desc">Mais figurinhas por pacote</div>
            </article>
            <article className="specs__card specs__card--paper">
              <div className="specs__num specs__num--blue">48</div>
              <div className="specs__label">Seleções</div>
              <div className="specs__desc">Todas as seleções classificadas</div>
            </article>
            <article className="specs__card specs__card--hero">
              <span className="pill pill--premium specs__pill">RAREZA</span>
              <div className="specs__hero-grid">
                <div className="specs__num specs__num--xl specs__num--yellow">3<sup>ª</sup></div>
                <div>
                  <div className="specs__label specs__label--light">Edição histórica</div>
                  <div className="specs__desc specs__desc--light">Edição Copa 26 Americana com 48 seleções.</div>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* MANIFESTO */}
      <section className="manifesto">
        <div className="hd__container manifesto__grid">
          <div>
            <span className="manifesto__rule">Nossa história</span>
            <h2>Colecionar é <em>matar a saudade</em> de um futuro que ainda nem chegou.</h2>
          </div>
          <div className="manifesto__body">
            <p>Tem coisa que só quem grudou figurinha na sala de aula entende. O cheiro do envelope. A mão suando antes de abrir. O grito quando saiu a brilhante. A negociação no recreio. A página que faltava — e o dia em que ela enfim chegou.</p>
            <p>A Álbum Copa 2026 nasceu pra entregar isso lacrado, com nota, no prazo. A gente cuida da parte chata pra você cuidar da parte boa: completar a coleção <strong>antes do apito inicial</strong>.</p>
            <div className="manifesto__sig">— A galera da Central</div>
          </div>
        </div>
      </section>

      {/* TESTEMUNHO/COLECIONADOR */}
      <section className="sect quote">
        <div className="hd__container quote__inner">
          <div className="quote__mark">"</div>
          <p>
            Recebi o kit em três dias, tudo lacrado e com nota. A apresentação da box é absurda —
            já é colecionável por si só. <strong>Voltei pra comprar mais.</strong>
          </p>
          <div className="quote__by">— Henrique R., colecionador desde 1998</div>
        </div>
      </section>
    </main>
  );
}

// ─── CATEGORY ────────────────────────────────────────────────────
function CategoryPage({ navigate, params, query, setQuery }) {
  const [filterType, setFilterType] = React.useState(params.type || '');
  const [maxPrice, setMaxPrice] = React.useState(500);
  const [onlyAvail, setOnlyAvail] = React.useState(false);
  const [onlySale, setOnlySale] = React.useState(!!params.sale);
  const [sort, setSort] = React.useState(params.sort || 'best');
  const [view, setView] = React.useState('grid');
  const [perPage, setPerPage] = React.useState(12);

  React.useEffect(() => { setFilterType(params.type || ''); setOnlySale(!!params.sale); }, [params.type, params.sale]);

  const filtered = PRODUCTS.filter((p) => {
    if (filterType && p.type !== filterType) return false;
    if (p.price > maxPrice) return false;
    if (onlyAvail && p.stock < 1) return false;
    if (onlySale && !p.oldPrice) return false;
    if (query && !p.name.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });
  const sorted = [...filtered].sort((a, b) => {
    if (sort === 'asc') return a.price - b.price;
    if (sort === 'desc') return b.price - a.price;
    if (sort === 'new') return (b.badge === 'novidade' ? 1 : 0) - (a.badge === 'novidade' ? 1 : 0);
    return b.reviews - a.reviews;
  }).slice(0, perPage);

  return (
    <main className="pg">
      <div className="pgcrumb">
        <div className="hd__container">
          <a onClick={() => navigate('home')}>Início</a>
          <Icon name="chevron-right" size={12} />
          <span>Coleção Copa do Mundo 2026</span>
          {filterType && (<><Icon name="chevron-right" size={12} /><span>{filterType}</span></>)}
        </div>
      </div>
      <div className="hd__container catlayout">
        {/* Sidebar */}
        <aside className="cat-side">
          <h3>Filtros</h3>
          <div className="cat-side__group">
            <h4>Tipo de produto</h4>
            <label className="rad"><input type="radio" name="t" checked={!filterType} onChange={() => setFilterType('')} /><span>Todos</span><span className="muted">{PRODUCTS.length}</span></label>
            {TYPES.map((t) => (
              <label key={t} className="rad">
                <input type="radio" name="t" checked={filterType === t} onChange={() => setFilterType(t)} />
                <span>{t}</span>
                <span className="muted">{PRODUCTS.filter((p) => p.type === t).length}</span>
              </label>
            ))}
          </div>
          <div className="cat-side__group">
            <h4>Preço máximo</h4>
            <input type="range" min="10" max="500" step="10" value={maxPrice} onChange={(e) => setMaxPrice(+e.target.value)} />
            <div className="rangenum">até <strong>{BRL(maxPrice)}</strong></div>
          </div>
          <div className="cat-side__group">
            <h4>Disponibilidade</h4>
            <label className="chk"><input type="checkbox" checked={onlyAvail} onChange={(e) => setOnlyAvail(e.target.checked)} /><span>Em estoque</span></label>
            <label className="chk"><input type="checkbox" checked={onlySale} onChange={(e) => setOnlySale(e.target.checked)} /><span>Em oferta</span></label>
          </div>
          <div className="cat-side__group">
            <h4>Selo</h4>
            {['mais-vendido', 'oferta', 'novidade', 'premium'].map((b) => (
              <label key={b} className="chk"><input type="checkbox" /><span>{b}</span></label>
            ))}
          </div>
          <button className="btn btn--ghost btn--sm" onClick={() => { setFilterType(''); setMaxPrice(500); setOnlyAvail(false); setOnlySale(false); }}>
            Limpar filtros
          </button>
        </aside>

        {/* Listing */}
        <section className="cat-main">
          <div className="cat-main__head">
            <h1>{filterType ? filterType + 's' : 'Coleção Copa do Mundo 2026'}</h1>
            <p>{filtered.length} produtos · todos lacrados, com nota fiscal e despacho em 24h.</p>
          </div>
          <div className="cat-toolbar">
            <div className="cat-toolbar__left">
              <span className="muted">Ordenar:</span>
              <select value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="best">Mais vendidos</option>
                <option value="asc">Menor preço</option>
                <option value="desc">Maior preço</option>
                <option value="new">Novidades</option>
              </select>
              <span className="muted">Por página:</span>
              <select value={perPage} onChange={(e) => setPerPage(+e.target.value)}>
                <option>8</option><option>12</option><option>24</option>
              </select>
            </div>
            <div className="cat-toolbar__right">
              <button className={'iconbtn' + (view === 'grid' ? ' is-on' : '')} onClick={() => setView('grid')}><Icon name="grid" size={16} /></button>
              <button className={'iconbtn' + (view === 'list' ? ' is-on' : '')} onClick={() => setView('list')}><Icon name="list" size={16} /></button>
            </div>
          </div>
          {view === 'grid' ? (
            <div className="grid grid--3">
              {sorted.map((p) => (<ProductCard key={p.id} product={p} onOpen={(id) => navigate('product', { id })} />))}
            </div>
          ) : (
            <div className="listview">
              {sorted.map((p) => <ListRow key={p.id} product={p} onOpen={(id) => navigate('product', { id })} />)}
            </div>
          )}
          <div className="pager">
            <button className="iconbtn"><Icon name="chevron-left" /></button>
            {[1, 2, 3].map((n) => (<button key={n} className={'pager__n' + (n === 1 ? ' is-on' : '')}>{n}</button>))}
            <button className="iconbtn"><Icon name="chevron-right" /></button>
          </div>
        </section>
      </div>
    </main>
  );
}

function ListRow({ product, onOpen }) {
  const cart = React.useContext(CartContext);
  return (
    <div className="lrow">
      <div className="lrow__media" onClick={() => onOpen(product.id)}><ProductImage product={product} /></div>
      <div className="lrow__body">
        <div className="card__type">{product.type}</div>
        <h3 onClick={() => onOpen(product.id)}>{product.name}</h3>
        <p className="muted">{product.description}</p>
        {product.reviews > 0 && (
          <div className="card__rating"><Icon name="star" size={12} color="#FFDF00" /><span>{product.rating}</span><span className="muted">({product.reviews} avaliações)</span></div>
        )}
      </div>
      <div className="lrow__buy">
        {product.oldPrice && <div className="card__old">{BRL(product.oldPrice)}</div>}
        <div className="card__cur" style={{ fontSize: 24 }}>{BRL(product.price)}</div>
        <div className="card__inst">{installments(product.price)}</div>
        <button className="btn btn--primary" onClick={() => cart.add(product.id)}>Adicionar ao carrinho</button>
        <button className="btn btn--gold" onClick={() => onOpen(product.id)}>Comprar agora</button>
      </div>
    </div>
  );
}

// ─── PRODUCT ─────────────────────────────────────────────────────
function ProductPage({ navigate, params }) {
  const cart = React.useContext(CartContext);
  const product = PRODUCTS.find((p) => p.id === params.id) || PRODUCTS[0];

  // Tracking: ViewContent (Google Ads / Meta / TikTok)
  React.useEffect(() => {
    if (product && window.MKT) {
      try { window.MKT.trackViewContent(product); } catch (e) { /* noop */ }
    }
  }, [product && product.id]);

  const [qty, setQty] = React.useState(1);
  const [thumb, setThumb] = React.useState(0);
  const [cep, setCep] = React.useState('');
  const [shipping, setShipping] = React.useState(null);
  const [openFAQ, setOpenFAQ] = React.useState(0);
  // Cross-sell inteligente: prioriza complementares, depois mesma categoria, depois ofertas.
  // Ex.: quem comprou Álbum vê Envelopes; quem comprou Envelopes vê Kits; etc.
  const related = (() => {
    const others = PRODUCTS.filter((p) => p.id !== product.id);
    // Mapeia complementaridade: se comprou X, oferece Y
    const complementMap = {
      'Álbum': 'Envelopes',
      'Envelopes': 'Kit',
      'Kit': 'Box',
      'Box': 'Envelopes',
    };
    const complementType = complementMap[product.type];
    const complements = complementType ? others.filter((p) => p.type === complementType) : [];
    const sameCategory = others.filter((p) => p.type === product.type);
    const onSale = others.filter((p) => p.oldPrice && p.type !== product.type);
    // Combina sem duplicar, mantendo ordem de prioridade
    const seen = new Set();
    const combined = [];
    for (const arr of [complements, sameCategory, onSale, others]) {
      for (const p of arr) {
        if (!seen.has(p.id)) { seen.add(p.id); combined.push(p); }
        if (combined.length >= 4) break;
      }
      if (combined.length >= 4) break;
    }
    return combined.slice(0, 4);
  })();
  const calcShip = () => {
    if (!cep || cep.length < 8) return;
    setShipping([
      { ...SHIPPING_RATES.pac },
      { ...SHIPPING_RATES.sedex },
      { ...SHIPPING_RATES.expressa },
    ]);
  };

  return (
    <main className="pg">
      <div className="pgcrumb">
        <div className="hd__container">
          <a onClick={() => navigate('home')}>Início</a>
          <Icon name="chevron-right" size={12} />
          <a onClick={() => navigate('category')}>Coleção 2026</a>
          <Icon name="chevron-right" size={12} />
          <a onClick={() => navigate('category', { type: product.type })}>{product.type}</a>
          <Icon name="chevron-right" size={12} />
          <span>{product.short}</span>
        </div>
      </div>
      <div className="hd__container prdlayout">
        <div className="prd__gallery">
          <div className="prd__main">
            {thumb === 0
              ? <ProductImage product={product} />
              : <ProductImage product={product} photoIndex={thumb - 1} />}
          </div>
          <div className="prd__thumbs">
            {(() => {
              // monta a lista: foto principal (se houver) + extras (photos[]).
              // Se não houver nada, mantém 4 placeholders para não quebrar layout.
              const extras = Array.isArray(product.photos) ? product.photos : [];
              const total = Math.max(1 + extras.length, 4);
              return Array.from({ length: total }).map((_, i) => (
                <button
                  key={i}
                  className={'prd__thumb' + (thumb === i ? ' is-on' : '')}
                  onClick={() => setThumb(i)}
                  aria-label={`Foto ${i + 1}`}
                >
                  {i === 0
                    ? <ProductImage product={product} />
                    : <ProductImage product={product} photoIndex={i - 1} />}
                </button>
              ));
            })()}
          </div>
        </div>
        <div className="prd__info">
          <div className="prd__type">{product.type}</div>
          <h1 className="prd__name">{product.name}</h1>
          <div className="prd__rating">
            {product.reviews > 0 && (
              <>
                <Icon name="star" size={16} color="#FFDF00" />
                <strong>{product.rating.toFixed(1)}</strong>
                <span className="muted">· {product.reviews} avaliações</span>
              </>
            )}
            <span className="prd__stock">● {product.stock > 30 ? 'Em estoque' : 'Últimas unidades'}</span>
          </div>
          <div className="prd__pricebox">
            {product.oldPrice && (
              <div className="prd__old">
                <span>{BRL(product.oldPrice)}</span>
                <span className="pill pill--off">-{Math.round((1 - product.price / product.oldPrice) * 100)}%</span>
              </div>
            )}
            <div className="prd__cur">{BRL(product.price)}</div>
            <div className="prd__inst">ou {installments(product.price)}</div>
            <div className="prd__pix">com Pix · <strong>{BRL(product.price * 0.95)}</strong> (5% off)</div>
          </div>
          <div className="prd__qtyrow">
            <div className="qtybtn">
              <button onClick={() => setQty(Math.max(1, qty - 1))}><Icon name="minus" size={14} /></button>
              <span>{qty}</span>
              <button onClick={() => setQty(qty + 1)}><Icon name="plus" size={14} /></button>
            </div>
            <button className="btn btn--primary btn--lg" onClick={() => cart.add(product.id, qty)}>
              <Icon name="cart" size={18} /> Adicionar ao carrinho
            </button>
          </div>
          <button className="btn btn--gold btn--lg btn--block" onClick={() => { cart.add(product.id, qty); navigate('checkout'); }}>
            Comprar agora <Icon name="arrow-right" size={18} />
          </button>
          <div className="prd__cep">
            <h4><Icon name="truck" size={16} /> Calcular frete e prazo</h4>
            <div className="prd__cep-row">
              <input value={cep} onChange={(e) => setCep(e.target.value.replace(/\D/g, '').slice(0, 8))} placeholder="00000-000" />
              <button className="btn btn--ghost btn--sm" onClick={calcShip}>Calcular</button>
            </div>
            {shipping && (
              <div className="prd__cep-results">
                {shipping.map((s) => (
                  <div key={s.name} className="prd__ship">
                    <div><strong>{s.name}</strong><span className="muted"> · {s.days}</span></div>
                    <div>{BRL(s.price)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="prd__perks">
            <div><Icon name="lock" size={16} /> Pagamento seguro</div>
            <div><Icon name="shield" size={16} /> Compra protegida</div>
            <div><Icon name="package" size={16} /> Despacho em 24h</div>
          </div>
        </div>
      </div>

      {/* DESCRIÇÃO + ITENS + FAQ */}
      <div className="hd__container prddetail">
        <div className="prddetail__col">
          <h3>Descrição</h3>
          <p>{product.description}</p>
          <h3>Informações do produto</h3>
          <table className="spectbl">
            <tbody>
              <tr><th>Tipo</th><td>{product.type}</td></tr>
              <tr><th>Edição</th><td>Copa do Mundo 2026</td></tr>
              <tr><th>Idioma</th><td>Português</td></tr>
              <tr><th>SKU</th><td>{product.id.toUpperCase()}</td></tr>
              <tr><th>Origem</th><td>Importado · Lacrado</td></tr>
            </tbody>
          </table>
        </div>
        <div className="prddetail__col">
          <h3>Itens inclusos</h3>
          <ul className="prdlist">
            {product.items.map((it) => (
              <li key={it}><Icon name="check" size={14} /> {it}</li>
            ))}
          </ul>
          <h3>Perguntas frequentes</h3>
          <div className="faq">
            {FAQ.map((f, i) => (
              <div key={i} className={'faq__item' + (openFAQ === i ? ' is-on' : '')}>
                <button onClick={() => setOpenFAQ(openFAQ === i ? -1 : i)}>
                  <span>{f.q}</span><Icon name="chevron-down" size={16} />
                </button>
                {openFAQ === i && <p>{f.a}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RELACIONADOS */}
      <section className="sect sect--alt">
        <div className="hd__container">
          <div className="sect__head">
            <div>
              <div className="sect__kicker">COMBINA PERFEITO COM ESTE</div>
              <h2 className="sect__title">Complete sua compra</h2>
            </div>
          </div>
          <div className="grid grid--4">
            {related.map((p) => (<ProductCard key={p.id} product={p} onOpen={(id) => navigate('product', { id })} />))}
          </div>
        </div>
      </section>
    </main>
  );
}

// ─── HeroDestaques — renderiza produtos com cardTemplate hero-green/hero-gold em formato duo ──
// Lê PRODUCTS dinamicamente (window.PRODUCTS) pra refletir mudanças do painel sem reload.
// Se nenhum produto tiver template hero-*, o componente NÃO renderiza nada (não força destaques).
function HeroDestaques({ navigate }) {
  const [tick, setTick] = React.useState(0);
  React.useEffect(() => {
    const onUpdate = () => setTick((t) => t + 1);
    window.addEventListener('cc26:data-changed', onUpdate);
    window.addEventListener('cc26:data', onUpdate);
    return () => {
      window.removeEventListener('cc26:data-changed', onUpdate);
      window.removeEventListener('cc26:data', onUpdate);
    };
  }, []);

  const list = (typeof window !== 'undefined' && window.PRODUCTS) || PRODUCTS;
  const destaques = list.filter((p) => p.cardTemplate === 'hero-green' || p.cardTemplate === 'hero-gold').slice(0, 2);
  if (destaques.length === 0) return null;

  // Garante variedade visual: se só tem um, ele aparece sozinho ocupando o duo todo
  return (
    <section className="sect">
      <div className="hd__container">
        <div className="duo" data-count={destaques.length}>
          {destaques.map((p) => {
            const isGreen = p.cardTemplate === 'hero-green';
            const kicker = (p.heroKicker && p.heroKicker.trim()) || (isGreen ? 'PRÉ-VENDA' : 'DISPLAY');
            const cta = (p.heroCta && p.heroCta.trim()) || (isGreen ? 'Garantir o meu' : 'Quero a caixa');
            const desc = (p.heroDesc && p.heroDesc.trim()) || p.short || p.description || '';
            return (
              <div key={p.id} className={'duo__card ' + (isGreen ? 'duo__card--green' : 'duo__card--gold')}>
                <div className="duo__copy">
                  <div className="sect__kicker" style={isGreen ? { color: '#FFDF00' } : undefined}>{kicker}</div>
                  <h3>{p.short || p.name}</h3>
                  <p>{desc}</p>
                  <button
                    className={'btn ' + (isGreen ? 'btn--gold' : 'btn--dark')}
                    onClick={() => navigate('product', { id: p.id })}
                  >
                    {cta} <Icon name="arrow-right" size={16} />
                  </button>
                </div>
                <div className="duo__art"><ProductImage product={p} /></div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { HomePage, CategoryPage, ProductPage, HeroDestaques });

// pages-marketing.jsx — Landing page dedicada para anúncios pagos
// Acessada via /oferta (rewrite) ou #oferta (hash).
// Otimizada para conversão: hero forte, prova social, CTA múltiplo,
// FAQ, gatilho de urgência. Captura UTMs e dispara ViewContent + Lead.

function OfertaPage({ navigate }) {
  const cart = React.useContext(CartContext);

  // Produto destaque: Mega Box (ou o primeiro disponível)
  const heroProduct = React.useMemo(() => {
    const all = window.PRODUCTS || [];
    return all.find((p) => p.id === 'mega-100')
      || all.find((p) => p.badge === 'mais-vendido')
      || all[0];
  }, []);

  // UTMs capturados (para mostrar ao usuário/admin em debug)
  const utms = React.useMemo(() => (window.MKT ? window.MKT.getUTMs() : null), []);

  // Dispara ViewContent no produto destaque ao carregar a landing
  React.useEffect(() => {
    if (heroProduct && window.MKT) {
      try { window.MKT.trackViewContent(heroProduct); } catch (e) { /* noop */ }
    }
  }, [heroProduct && heroProduct.id]);

  // Countdown de oferta (24h fixos)
  const [timeLeft, setTimeLeft] = React.useState(() => {
    const stored = localStorage.getItem('cc26.oferta.deadline');
    let deadline;
    if (stored && Number(stored) > Date.now()) {
      deadline = Number(stored);
    } else {
      deadline = Date.now() + 24 * 60 * 60 * 1000;
      localStorage.setItem('cc26.oferta.deadline', String(deadline));
    }
    return Math.max(0, deadline - Date.now());
  });
  React.useEffect(() => {
    const id = setInterval(() => {
      const stored = Number(localStorage.getItem('cc26.oferta.deadline') || 0);
      setTimeLeft(Math.max(0, stored - Date.now()));
    }, 1000);
    return () => clearInterval(id);
  }, []);
  const fmt = (ms) => {
    const s = Math.floor(ms / 1000);
    const h = String(Math.floor(s / 3600)).padStart(2, '0');
    const m = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
    const sec = String(s % 60).padStart(2, '0');
    return { h, m, s: sec };
  };
  const tl = fmt(timeLeft);

  const goShop = () => {
    if (heroProduct) navigate('product', { id: heroProduct.id });
    else navigate('category');
  };

  const addAndCheckout = () => {
    if (!heroProduct) return navigate('category');
    cart.add(heroProduct.id, 1);
    navigate('checkout');
  };

  // Lead: clique em "Quero saber mais" rola pro CTA + dispara evento
  const onLeadClick = () => {
    if (window.MKT) {
      try { window.MKT.trackLead({ source: 'oferta_page' }); } catch (e) {}
    }
    document.getElementById('oferta-cta-final')?.scrollIntoView({ behavior: 'smooth' });
  };

  const benefits = [
    { icon: 'truck',  title: 'Despacho em 24h',      desc: 'Pedidos confirmados antes das 16h saem no mesmo dia útil.' },
    { icon: 'shield', title: 'Compra 100% segura',   desc: 'Pagamento por Pix com QR Code oficial Banco Central.' },
    { icon: 'check',  title: 'Lacrado e original',   desc: 'Produtos oficiais Panini, com nota fiscal e selo Anatel.' },
    { icon: 'tag',    title: 'Parcelamento sem juros', desc: 'Em até 12x no cartão pelo WhatsApp ou Pix com 10% off.' },
  ];

  const testimonials = [
    { name: 'Carlos M.', city: 'São Paulo/SP',    text: 'Pedi quarta, chegou sexta. Lacrados. Comprarei mais!', stars: 5 },
    { name: 'Juliana R.', city: 'Rio de Janeiro/RJ', text: 'Cinco envelopes a mais de cortesia. Atendimento nota mil.', stars: 5 },
    { name: 'Pedro H.', city: 'Curitiba/PR',     text: 'Já completei 80% do álbum só com a Mega Box. Vale cada centavo.', stars: 5 },
  ];

  const faqs = [
    { q: 'Os produtos são oficiais Panini?', a: 'Sim, 100% originais. Acompanha nota fiscal e selo de autenticidade.' },
    { q: 'Em quanto tempo recebo?', a: 'Despacho em até 24h úteis. Entrega entre 3 e 7 dias úteis a depender da região.' },
    { q: 'Posso parcelar?', a: 'Sim, em até 12x sem juros no cartão. Compras finalizadas via WhatsApp ou Pix.' },
    { q: 'Tem garantia?', a: 'Sim. Se chegar errado ou danificado, trocamos sem custo. Você tem 7 dias para devolver, conforme o CDC.' },
    { q: 'O Pix dá desconto?', a: 'Sim, pagamentos por Pix recebem 10% off automaticamente no checkout.' },
  ];

  return (
    <main className="oferta">
      {/* ── HERO ─────────────────────────────────────── */}
      <section className="oferta__hero">
        <div className="hd__container oferta__hero-inner">
          <div className="oferta__hero-copy">
            <div className="oferta__badge">
              <span className="oferta__badge-dot" /> OFERTA POR TEMPO LIMITADO
            </div>
            <h1 className="oferta__title">
              Garanta sua <span>coleção</span> oficial da Copa 2026 com até <span>40% off</span>
            </h1>
            <p className="oferta__lead">
              Álbuns, envelopes e kits da Panini direto na sua casa. Lacrados, com nota fiscal,
              despacho em 24h. Pix com 10% off ou cartão em até 12x sem juros.
            </p>

            <div className="oferta__countdown" aria-live="polite">
              <span className="oferta__cd-label">⏰ A oferta termina em</span>
              <div className="oferta__cd-row">
                <div className="oferta__cd-cell"><strong>{tl.h}</strong><span>horas</span></div>
                <div className="oferta__cd-cell"><strong>{tl.m}</strong><span>min</span></div>
                <div className="oferta__cd-cell"><strong>{tl.s}</strong><span>seg</span></div>
              </div>
            </div>

            <div className="oferta__cta-row">
              <button className="btn btn--gold btn--lg" onClick={goShop}>
                QUERO MINHA COLEÇÃO <Icon name="arrow-right" size={18} />
              </button>
              <button className="btn btn--ghost-light btn--lg" onClick={onLeadClick}>
                Saber mais
              </button>
            </div>

            <div className="oferta__trust">
              <div><strong>+12.400</strong><span>pedidos entregues</span></div>
              <div><strong>4,9★</strong><span>1.890 avaliações</span></div>
              <div><strong>24h</strong><span>de despacho</span></div>
            </div>
          </div>

          {heroProduct && (
            <div className="oferta__hero-art">
              <div className="oferta__hero-product">
                <ProductImage product={heroProduct} />
              </div>
              {heroProduct.oldPrice && (
                <div className="oferta__price-tag">
                  <span className="oferta__price-old">{BRL(heroProduct.oldPrice)}</span>
                  <strong className="oferta__price-new">{BRL(heroProduct.price)}</strong>
                  <span className="oferta__price-off">
                    -{Math.round((1 - heroProduct.price / heroProduct.oldPrice) * 100)}%
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ── BENEFÍCIOS ───────────────────────────────── */}
      <section className="oferta__benefits">
        <div className="hd__container">
          <div className="oferta__benefits-grid">
            {benefits.map((b) => (
              <div key={b.title} className="oferta__benefit">
                <div className="oferta__benefit-icon"><Icon name={b.icon} size={28} /></div>
                <h3>{b.title}</h3>
                <p>{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROVA SOCIAL ─────────────────────────────── */}
      <section className="oferta__social">
        <div className="hd__container">
          <h2 className="oferta__h2">
            O que dizem nossos <span>colecionadores</span>
          </h2>
          <div className="oferta__reviews">
            {testimonials.map((t) => (
              <div key={t.name} className="oferta__review">
                <div className="oferta__stars">{'★'.repeat(t.stars)}</div>
                <p>"{t.text}"</p>
                <div className="oferta__review-author">
                  <strong>{t.name}</strong>
                  <span>{t.city}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRODUTO DESTAQUE ─────────────────────────── */}
      {heroProduct && (
        <section className="oferta__product">
          <div className="hd__container oferta__product-inner">
            <div className="oferta__product-art">
              <ProductImage product={heroProduct} />
            </div>
            <div className="oferta__product-info">
              <div className="oferta__product-kicker">MAIS PEDIDO</div>
              <h2 className="oferta__h2 oferta__h2--left">{heroProduct.short || heroProduct.name}</h2>
              {heroProduct.desc && <p className="oferta__product-desc">{heroProduct.desc}</p>}
              <ul className="oferta__product-list">
                <li><Icon name="check" size={16} /> 100% lacrado e oficial Panini</li>
                <li><Icon name="check" size={16} /> Nota fiscal e selo de autenticidade</li>
                <li><Icon name="check" size={16} /> Envio em até 24h úteis</li>
                <li><Icon name="check" size={16} /> Garantia de troca em 7 dias</li>
              </ul>
              <div className="oferta__product-price">
                {heroProduct.oldPrice && <span className="oferta__price-old">{BRL(heroProduct.oldPrice)}</span>}
                <strong>{BRL(heroProduct.price)}</strong>
                <span className="oferta__product-installments">
                  ou 12x de {BRL(heroProduct.price / 12)} sem juros
                </span>
              </div>
              <button className="btn btn--gold btn--lg" onClick={addAndCheckout}>
                ADICIONAR AO CARRINHO <Icon name="arrow-right" size={18} />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ── FAQ ──────────────────────────────────────── */}
      <section className="oferta__faq">
        <div className="hd__container">
          <h2 className="oferta__h2">Dúvidas frequentes</h2>
          <div className="oferta__faq-list">
            {faqs.map((f, idx) => (
              <details key={idx} className="oferta__faq-item">
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ────────────────────────────────── */}
      <section id="oferta-cta-final" className="oferta__cta-final">
        <div className="hd__container">
          <h2>
            A Copa começa em <span>{new Date(2026, 5, 11).toLocaleDateString('pt-BR')}</span>
          </h2>
          <p>
            Não fique de fora. Garanta agora os álbuns, envelopes e kits oficiais.
            Frete grátis acima de R$ 199 para todo o Brasil.
          </p>
          <button className="btn btn--gold btn--lg" onClick={goShop}>
            COMEÇAR MINHA COLEÇÃO AGORA <Icon name="arrow-right" size={18} />
          </button>
          <div className="oferta__cta-final-strip">
            <span><Icon name="shield" size={14} /> Compra segura</span>
            <span><Icon name="truck" size={14} /> Despacho em 24h</span>
            <span><Icon name="check" size={14} /> Originais Panini</span>
          </div>
          {utms && Object.keys(utms).length > 1 && (
            <small className="oferta__utm-debug">
              UTM rastreado: {utms.utm_source || '—'} / {utms.utm_campaign || '—'}
            </small>
          )}
        </div>
      </section>
    </main>
  );
}

window.OfertaPage = OfertaPage;

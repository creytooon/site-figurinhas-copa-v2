// pages-flow.jsx — Cart, Checkout, Confirmation

// ─── CART ────────────────────────────────────────────────────────
function CartPage({ navigate }) {
  const cart = React.useContext(CartContext);
  const [couponInput, setCouponInput] = React.useState(cart.coupon || '');
  const items = cart.items.map((i) => ({ ...i, product: PRODUCTS.find((p) => p.id === i.id) })).filter((i) => i.product);
  const couponData = cart.coupon && COUPONS[cart.coupon.toUpperCase()];
  // Lê threshold do painel admin (fallback no default)
  const _shipCfg = (typeof window !== 'undefined' && window.SHIPPING_CONFIG) || { freeShipMin: 49.99, freeShipEnabled: true };
  const _autoFree = _shipCfg.freeShipEnabled && cart.subtotal >= _shipCfg.freeShipMin;
  const shipPrice = (cart.freeShip || _autoFree) ? 0 : 24.9;
  const total = Math.max(0, cart.subtotal - cart.discount + shipPrice);

  if (items.length === 0) {
    return (
      <main className="pg empty">
        <div className="hd__container empty__inner">
          <div className="empty__art">
            <ProductImage product={PRODUCTS[6]} />
          </div>
          <h1>Seu carrinho está vazio</h1>
          <p>Comece sua coleção agora — álbuns, envelopes, kits e boxes prontos para despachar.</p>
          <div className="empty__cta">
            <button className="btn btn--gold btn--lg" onClick={() => navigate('category')}>Ver coleção 2026</button>
            <button className="btn btn--ghost btn--lg" onClick={() => navigate('home')}>Voltar ao início</button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="pg">
      <div className="pgcrumb">
        <div className="hd__container">
          <a onClick={() => navigate('home')}>Início</a><Icon name="chevron-right" size={12} /><span>Carrinho</span>
        </div>
      </div>
      <div className="hd__container cartlayout">
        <section className="cartmain">
          <div className="cartmain__head">
            <h1>Seu carrinho</h1>
            <span className="muted">{cart.totalCount} {cart.totalCount === 1 ? 'item' : 'itens'}</span>
          </div>
          <div className="cartlist">
            {items.map((i) => (
              <div key={i.id} className="cartrow">
                <div className="cartrow__media"><ProductImage product={i.product} /></div>
                <div className="cartrow__body">
                  <div className="card__type">{i.product.type}</div>
                  <h3 onClick={() => navigate('product', { id: i.id })}>{i.product.name}</h3>
                  <div className="muted">SKU {i.id.toUpperCase()} · Lacrado · Em estoque</div>
                  <div className="cartrow__rmv">
                    <button onClick={() => cart.remove(i.id)}>Remover</button>
                    <button onClick={() => cart.toggleWish(i.id)}>Salvar para depois</button>
                  </div>
                </div>
                <div className="cartrow__qty">
                  <div className="qtybtn">
                    <button onClick={() => cart.setQty(i.id, i.qty - 1)}><Icon name="minus" size={14} /></button>
                    <span>{i.qty}</span>
                    <button onClick={() => cart.setQty(i.id, i.qty + 1)}><Icon name="plus" size={14} /></button>
                  </div>
                </div>
                <div className="cartrow__price">
                  <div className="card__cur" style={{ fontSize: 20 }}>{BRL(i.product.price * i.qty)}</div>
                  <div className="muted" style={{ fontSize: 12 }}>{BRL(i.product.price)} cada</div>
                </div>
              </div>
            ))}
          </div>
          <div className="cartmain__foot">
            <button className="btn btn--ghost" onClick={() => navigate('category')}><Icon name="chevron-left" size={14} /> Continuar comprando</button>
            <button className="btn btn--ghost" onClick={() => cart.clear()}>Esvaziar carrinho</button>
          </div>
        </section>
        <aside className="cartside">
          <h3>Resumo do pedido</h3>
          <div className="cartside__row"><span>Subtotal</span><span>{BRL(cart.subtotal)}</span></div>
          {cart.discount > 0 && <div className="cartside__row cartside__row--off"><span>Desconto ({cart.coupon})</span><span>-{BRL(cart.discount)}</span></div>}
          <div className="cartside__row"><span>Frete</span><span>{shipPrice === 0 ? 'GRÁTIS' : BRL(shipPrice)}</span></div>
          {/* Incentivo de frete grátis: mostra quanto falta pro cliente atingir o threshold */}
          {!_autoFree && _shipCfg.freeShipEnabled && _shipCfg.freeShipMin > 0 && (
            <div className="cartside__freehint">
              {(() => {
                const falta = _shipCfg.freeShipMin - cart.subtotal;
                if (falta <= 0) return null;
                return (
                  <>
                    🚚 Faltam <strong>{BRL(falta)}</strong> para você ganhar <strong>frete grátis</strong>!
                  </>
                );
              })()}
            </div>
          )}
          {_autoFree && (
            <div className="cartside__freehint cartside__freehint--ok">
              🎉 Você ganhou <strong>frete grátis</strong>!
            </div>
          )}
          <div className="cartside__cpn">
            <h4>Cupom de desconto</h4>
            <div className="cartside__cpn-row">
              <input placeholder="Digite seu cupom" value={couponInput} onChange={(e) => setCouponInput(e.target.value.toUpperCase())} />
              <button className="btn btn--ghost btn--sm" onClick={() => cart.setCoupon(couponInput)}>Aplicar</button>
            </div>
            {couponData && <div className="cartside__cpn-ok"><Icon name="check" size={14} /> {couponData.label}</div>}
            {cart.coupon && !couponData && <div className="cartside__cpn-err">Cupom inválido</div>}
            <div className="cartside__cpn-hints">
              Experimente: <button onClick={() => { cart.setCoupon('COPA10'); setCouponInput('COPA10'); }}>COPA10</button> ·
              <button onClick={() => { cart.setCoupon('FRETEGRATIS'); setCouponInput('FRETEGRATIS'); }}>FRETEGRATIS</button> ·
              <button onClick={() => { cart.setCoupon('TORCIDA20'); setCouponInput('TORCIDA20'); }}>TORCIDA20</button>
            </div>
          </div>
          <div className="cartside__total">
            <span>Total</span>
            <strong>{BRL(total)}</strong>
          </div>
          <div className="cartside__inst">em até {installments(total)}</div>
          <button className="btn btn--gold btn--lg btn--block" onClick={() => navigate('checkout')}>
            Finalizar compra <Icon name="arrow-right" size={18} />
          </button>
          <div className="cartside__perks">
            <div><Icon name="lock" size={14} /> Pagamento 100% seguro</div>
            <div><Icon name="truck" size={14} /> Despachamos em 24h</div>
            <div><Icon name="shield" size={14} /> Compra protegida</div>
          </div>
        </aside>
      </div>
    </main>
  );
}

// ─── CHECKOUT ────────────────────────────────────────────────────
function CheckoutPage({ navigate }) {
  const cart = React.useContext(CartContext);
  const [step, setStep] = React.useState(1);

  // Tracking: InitiateCheckout (Google Ads / Meta / TikTok) — só uma vez por visita
  React.useEffect(() => {
    if (window.MKT && cart && cart.items && cart.items.length > 0) {
      try { window.MKT.trackInitiateCheckout(cart); } catch (e) { /* noop */ }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [data, setData] = React.useState({
    name: cart.user?.name || '', email: cart.user?.email || '', cpf: '', phone: '',
    cep: '', street: '', number: '', complement: '', district: '', city: '', state: '',
    shipping: 'sedex', payment: 'pix',
  });
  const [pixData, setPixData] = React.useState(null); // { code, txid, amount, orderId } depois de gerado
  const [pixCopied, setPixCopied] = React.useState(false);
  const [pixCountdown, setPixCountdown] = React.useState(15 * 60);
  const [pixStatus, setPixStatus] = React.useState('aguardando'); // aguardando | confirmado
  const [pixError, setPixError] = React.useState(null);
  const [generatingPix, setGeneratingPix] = React.useState(false);
  const [stepError, setStepError] = React.useState(null);
  // CEP automático via ViaCEP
  const [cepLoading, setCepLoading] = React.useState(false);
  const [cepError, setCepError] = React.useState(null);
  // Modal de agradecimento que aparece após "Já paguei o Pix"
  const [showThankYou, setShowThankYou] = React.useState(false);

  // ─── ViaCEP — preenche automaticamente os campos de endereço ────
  // Quando o usuário digita um CEP válido (8 dígitos), buscamos no
  // ViaCEP e populamos rua, bairro, cidade e estado. Se falhar, o
  // usuário ainda pode preencher manualmente.
  const lookupCep = async (rawCep) => {
    const digits = (rawCep || '').replace(/\D/g, '');
    if (digits.length !== 8) return;
    setCepLoading(true);
    setCepError(null);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const json = await res.json();
      if (json.erro) {
        setCepError('CEP não encontrado. Preencha manualmente.');
      } else {
        // Preenche todos os campos retornados, sem sobrescrever número/complemento
        setData((d) => ({
          ...d,
          street: json.logradouro || d.street,
          district: json.bairro || d.district,
          city: json.localidade || d.city,
          state: json.uf || d.state,
        }));
      }
    } catch (e) {
      setCepError('Não foi possível consultar o CEP agora. Preencha manualmente.');
    } finally {
      setCepLoading(false);
    }
  };

  // Formata o CEP (00000-000) e dispara a busca quando atinge 8 dígitos
  const onCepChange = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 8);
    const formatted = digits.length > 5
      ? digits.slice(0, 5) + '-' + digits.slice(5)
      : digits;
    setField('cep', formatted);
    if (digits.length === 8) lookupCep(digits);
  };

  React.useEffect(() => {
    if (!pixData || pixStatus === 'confirmado') return;
    const t = setInterval(() => setPixCountdown((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [pixData, pixStatus]);

  // ─── Validações obrigatórias ─────────────────────────────────
  const onlyDigits = (s) => (s || '').replace(/\D/g, '');
  const validateStep1 = () => {
    if (!data.name.trim() || data.name.trim().split(' ').length < 2) return 'Informe seu nome completo (nome e sobrenome).';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(data.email.trim())) return 'Informe um e-mail válido.';
    if (onlyDigits(data.cpf).length !== 11) return 'CPF deve conter 11 dígitos.';
    if (onlyDigits(data.phone).length < 10) return 'Informe um WhatsApp válido com DDD.';
    return null;
  };
  const validateStep2 = () => {
    if (onlyDigits(data.cep).length !== 8) return 'CEP deve conter 8 dígitos.';
    if (!data.street.trim()) return 'Informe a rua.';
    if (!data.number.trim()) return 'Informe o número.';
    if (!data.district.trim()) return 'Informe o bairro.';
    if (!data.city.trim()) return 'Informe a cidade.';
    if (!data.state) return 'Selecione o estado.';
    return null;
  };
  const goStep = (target, validator) => {
    if (validator) {
      const err = validator();
      if (err) { setStepError(err); return; }
    }
    setStepError(null);
    setStep(target);
  };
  const setField = (k, v) => setData((d) => ({ ...d, [k]: v }));

  // Snapshot: quando o pedido é finalizado, cart.items é esvaziado, mas o
  // resumo lateral precisa continuar mostrando os produtos. Guardamos o
  // último estado válido em um ref para usar enquanto estivermos no PIX.
  const lastItemsRef = React.useRef(null);

  const liveItems = cart.items.map((i) => ({ ...i, product: PRODUCTS.find((p) => p.id === i.id) })).filter((i) => i.product);
  const _liveRates = (typeof window !== 'undefined' && window.SHIPPING_RATES) || SHIPPING_RATES;
  const ship = _liveRates[data.shipping] || _liveRates.sedex || Object.values(_liveRates)[0];
  const _liveShipCfg = (typeof window !== 'undefined' && window.SHIPPING_CONFIG) || { freeShipMin: 49.99, freeShipEnabled: true };
  const _autoFreeChk = _liveShipCfg.freeShipEnabled && cart.subtotal >= _liveShipCfg.freeShipMin;
  const shipPrice = (cart.freeShip || _autoFreeChk) ? 0 : (ship ? ship.price : 24.9);
  const total = Math.max(0, cart.subtotal - cart.discount + shipPrice);
  const pixTotal = total * 0.95;

  // Atualiza o snapshot enquanto o carrinho ainda tem itens.
  if (liveItems.length > 0) lastItemsRef.current = liveItems;
  // Items efetivos: se o carrinho ficou vazio mas estamos no fluxo do PIX,
  // usa o snapshot; caso contrário usa o ao vivo.
  const items = liveItems.length > 0 ? liveItems : (lastItemsRef.current || []);

  // IMPORTANTE: a verificação "carrinho vazio" abaixo NÃO se aplica quando
  // o usuário já está na tela de PIX (step 6) ou já tem dados do PIX gerados,
  // porque cart.placeOrder() esvazia o carrinho de propósito ao finalizar
  // o pedido — e a tela do PIX precisa permanecer visível pra ele pagar.
  if (items.length === 0 && step !== 6 && !pixData) {
    return (
      <main className="pg"><div className="hd__container" style={{ padding: '60px 0', textAlign: 'center' }}>
        <h2>Carrinho vazio</h2>
        <button className="btn btn--gold btn--lg" onClick={() => navigate('category')}>Ver coleção</button>
      </div></main>
    );
  }

  const finishOrder = async () => {
    // CRÍTICO: muda para step 6 ANTES de chamar placeOrder.
    // O placeOrder esvazia o carrinho, e se o step ainda for outro, o React
    // renderiza "Carrinho vazio" no próximo ciclo — perdendo a tela do PIX.
    if (data.payment === 'pix') setStep(6);

    const order = cart.placeOrder({
      shipping: ship.name,
      shipPrice,
      payment: data.payment,
      total: data.payment === 'pix' ? pixTotal : total,
      address: { ...data },
      customer: { name: data.name, email: data.email, cpf: data.cpf, phone: data.phone },
    });
    if (data.payment === 'card') {
      // ── SALVAR NO SERVIDOR ──
      try {
        const orderToSave = {
          id: order.id,
          total: order.total,
          items: order.items,
          address: order.address,
          payment: 'card',
          status: 'Aguardando confirmação',
          status_code: 'awaiting_confirmation',
          date: order.date || Date.now(),
          shipping: order.shipping,
        };
        fetch('/api/save-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order: orderToSave }),
          keepalive: true,
        }).catch((e) => console.warn('[order] falha ao salvar:', e));
      } catch (e) { /* ignore */ }

      // TRACKING: pedido criado (não pago)
      try {
        if (window.MKT && window.MKT.trackPixGenerated) {
          window.MKT.trackPixGenerated({ ...order, status: 'awaiting_pix' });
        }
      } catch (e) { console.warn('[mkt] trackPixGenerated falhou:', e); }
      const msg = buildWhatsAppCardMessage(order);
      openWhatsApp(msg);
      navigate('confirmation', { orderId: order.id });
      return;
    }
    // ─── PIX gerado localmente (API própria — sem dependência de gateway) ───
    setGeneratingPix(true);
    setPixError(null);
    try {
      // txid: alfanumérico, máx 25 chars, padrão BR Code
      const txid = (order.id + Date.now().toString(36)).replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 25);
      const code = buildPixCode(pixTotal, txid);
      setPixData({
        code,
        qrImage: null, // será renderizado pelo componente <PixQR>
        txid,
        amount: pixTotal,
        orderId: order.id,
      });
      setPixCountdown(15 * 60);
      // Marca o pedido como Aguardando Pix em localStorage (admin enxerga)
      try {
        const orders = JSON.parse(localStorage.getItem('cc26.orders') || '[]');
        const updated = orders.map((o) => o.id === order.id ? {
          ...o, status: 'Aguardando Pix', payment: 'pix',
          gateway: 'PIX-LOCAL', transactionId: txid,
        } : o);
        localStorage.setItem('cc26.orders', JSON.stringify(updated));
      } catch (e) { /* ignore */ }

      // ── SALVAR NO SERVIDOR (para que o admin veja em qualquer dispositivo) ──
      // Endpoint público: /api/save-order. Falha silenciosamente se não
      // estiver disponível (não bloqueia o cliente de ver o PIX).
      try {
        const orderToSave = {
          id: order.id,
          total: pixTotal,
          items: order.items,
          address: order.address,
          payment: 'pix',
          status: 'Aguardando Pix',
          status_code: 'awaiting_pix',
          gateway: 'PIX-LOCAL',
          transactionId: txid,
          date: order.date || Date.now(),
          shipping: order.shipping,
        };
        // Não espera resposta — dispara em background
        fetch('/api/save-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order: orderToSave }),
          keepalive: true,
        }).then((r) => r.json()).then((j) => {
          console.log('[order] salvo no servidor:', j);
        }).catch((e) => console.warn('[order] falha ao salvar no servidor:', e));
      } catch (e) { console.warn('[order] erro ao chamar save-order:', e); }

      // TRACKING — ETAPA 1: PIX gerado (silenciado no modo minimalista)
      try {
        if (window.MKT && window.MKT.trackPixGenerated) {
          window.MKT.trackPixGenerated({
            ...order,
            total: pixTotal,
            status: 'awaiting_pix',
          });
        }
      } catch (e) { console.warn('[mkt] trackPixGenerated falhou:', e); }
    } catch (e) {
      setPixError(e.message || 'Não foi possível gerar o PIX.');
    } finally {
      setGeneratingPix(false);
    }
  };

  // Cliente confirma manualmente que pagou (sem gateway, não tem como detectar
  // automático). Auto-abre WhatsApp do vendedor com mensagem pronta.
  const markAsPaid = () => {
    setPixStatus('confirmado');
    try {
      const orders = JSON.parse(localStorage.getItem('cc26.orders') || '[]');
      const updated = orders.map((o) => o.id === pixData.orderId
        ? { ...o, status: 'Pago (aguardando conferência)', paidAt: new Date().toISOString() }
        : o);
      localStorage.setItem('cc26.orders', JSON.stringify(updated));
    } catch (e) { /* ignore */ }

    // ── ATUALIZAR STATUS NO SERVIDOR ──
    try {
      const ordersLs = JSON.parse(localStorage.getItem('cc26.orders') || '[]');
      const fullOrder = ordersLs.find((o) => o.id === pixData.orderId);
      if (fullOrder) {
        fetch('/api/save-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            order: {
              ...fullOrder,
              status: 'Pago (aguardando conferência)',
              status_code: 'payment_claimed',
              paidAt: new Date().toISOString(),
            },
          }),
          keepalive: true,
        }).catch((e) => console.warn('[order] falha ao atualizar:', e));
      }
    } catch (e) { /* ignore */ }

    // TRACKING — ETAPA 2: Click de "enviar comprovante no WhatsApp"
    // É só intenção do cliente, NÃO é compra paga ainda. Compra paga só
    // dispara depois que o admin marcar como pago no painel.
    try {
      if (window.MKT && window.MKT.trackWhatsAppClick && pixData) {
        window.MKT.trackWhatsAppClick({
          id: pixData.orderId,
          total: pixData.amount,
          items: items.map((i) => ({ id: i.id, product: i.product, qty: i.qty })),
        });
      }
    } catch (e) { console.warn('[mkt] trackWhatsAppClick falhou:', e); }

    // Auto-abre WhatsApp do vendedor com mensagem rica
    setTimeout(() => sendWhatsAppPaymentAlert(), 400);
    // Mostra o modal de obrigado com timer urgência
    setShowThankYou(true);
  };

  // Monta mensagem rica e abre WhatsApp do vendedor
  const sendWhatsAppPaymentAlert = () => {
    try {
      const STORE = (typeof window !== 'undefined' && window.STORE) || {};
      const phone = STORE.whatsapp || '';
      if (!phone || !pixData) return;
      const itemsText = items.map((i) => `• ${i.qty}x ${i.product.short} — ${BRL(i.product.price * i.qty)}`).join('\n');
      const shipName = (() => {
        try {
          const rates = (typeof window !== 'undefined' && window.SHIPPING_RATES) || {};
          return rates[data.shipping]?.name || data.shipping;
        } catch { return data.shipping; }
      })();
      const msg = [
        '🟢 *AVISO DE PAGAMENTO PIX*',
        '',
        `Pedido: *${pixData.orderId}*`,
        `Cliente: *${data.name}*`,
        `WhatsApp: *${data.phone}*`,
        `CPF: ${data.cpf}`,
        '',
        '*Itens:*',
        itemsText,
        '',
        `Frete: ${shipName}`,
        `Endereço: ${data.street}, ${data.number}${data.complement ? ' - ' + data.complement : ''} - ${data.district}, ${data.city}/${data.state} - CEP ${data.cep}`,
        '',
        `*Total pago no PIX: ${BRL(pixData.amount)}*`,
        '',
        'Acabei de pagar via PIX. Por favor confirme o recebimento e envie meu pedido. Obrigado!',
      ].join('\n');
      const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (e) { console.error('[wa-alert]', e); }
  };

  const fmtCountdown = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const stepNames = ['Identificação', 'Endereço', 'Entrega', 'Pagamento', 'Revisão'];

  return (
    <main className="pg checkout">
      <div className="hd__container">
        <div className="checkout__head">
          <a onClick={() => navigate('cart')} className="checkout__back"><Icon name="chevron-left" size={14} /> Voltar ao carrinho</a>
          <Logo />
          <div className="checkout__safe"><Icon name="lock" size={14} /> Ambiente seguro</div>
        </div>
        <div className="checkout__steps">
          {stepNames.map((n, i) => (
            <div key={n} className={'cstep' + (step > i + 1 ? ' is-done' : '') + (step === i + 1 ? ' is-on' : '')}>
              <span className="cstep__n">{step > i + 1 ? <Icon name="check" size={12} /> : i + 1}</span>
              <span className="cstep__l">{n}</span>
            </div>
          ))}
        </div>
        <div className="checkout__layout">
          <section className="checkout__main">
            {step === 1 && (
              <div className="cbox">
                <h3>1. Dados pessoais</h3>
                <div className="frm">
                  <Field label="Nome completo"><input value={data.name} onChange={(e) => setField('name', e.target.value)} placeholder="Como aparece no documento" /></Field>
                  <Field label="E-mail"><input type="email" value={data.email} onChange={(e) => setField('email', e.target.value)} placeholder="seu@email.com" /></Field>
                  <Field label="CPF"><input value={data.cpf} onChange={(e) => setField('cpf', e.target.value)} placeholder="000.000.000-00" /></Field>
                  <Field label="WhatsApp ⚠️ (obrigatório — usado pra confirmar pedido)"><input value={data.phone} onChange={(e) => setField('phone', e.target.value)} placeholder="(11) 98765-4321" /></Field>
                </div>
                {stepError && <div className="frm__err">{stepError}</div>}
                <button className="btn btn--gold btn--lg" onClick={() => goStep(2, validateStep1)}>Continuar <Icon name="arrow-right" size={16} /></button>
              </div>
            )}
            {step === 2 && (
              <div className="cbox">
                <h3>2. Endereço de entrega</h3>
                <div className="frm">
                  <Field label="CEP" col="2">
                    <div style={{ position: 'relative' }}>
                      <input
                        value={data.cep}
                        onChange={(e) => onCepChange(e.target.value)}
                        onBlur={(e) => onCepChange(e.target.value)}
                        placeholder="00000-000"
                        maxLength={9}
                        inputMode="numeric"
                      />
                      {cepLoading && (
                        <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: '#009C3B' }}>
                          buscando…
                        </span>
                      )}
                    </div>
                    {cepError && (
                      <small style={{ color: '#C8102E', fontSize: 11, marginTop: 4, display: 'block' }}>{cepError}</small>
                    )}
                  </Field>
                  <Field label="Rua" col="4"><input value={data.street} onChange={(e) => setField('street', e.target.value)} /></Field>
                  <Field label="Número" col="2"><input value={data.number} onChange={(e) => setField('number', e.target.value)} /></Field>
                  <Field label="Complemento" col="4"><input value={data.complement} onChange={(e) => setField('complement', e.target.value)} placeholder="Apto, bloco…" /></Field>
                  <Field label="Bairro" col="3"><input value={data.district} onChange={(e) => setField('district', e.target.value)} /></Field>
                  <Field label="Cidade" col="3"><input value={data.city} onChange={(e) => setField('city', e.target.value)} /></Field>
                  <Field label="Estado" col="2">
                    <select value={data.state} onChange={(e) => setField('state', e.target.value)}>
                      <option value="">--</option>
                      {['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'].map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </Field>
                </div>
                {stepError && <div className="frm__err">{stepError}</div>}
                <div className="cbox__nav">
                  <button className="btn btn--ghost" onClick={() => { setStepError(null); setStep(1); }}>Voltar</button>
                  <button className="btn btn--gold btn--lg" onClick={() => goStep(3, validateStep2)}>Continuar <Icon name="arrow-right" size={16} /></button>
                </div>
              </div>
            )}
            {step === 3 && (() => {
              // Filtra opções de frete: respeita "enabled" e restrições por estado.
              // Motoboy aparece apenas se cliente é de SP.
              // Lê do window pra refletir alterações do painel admin sem reload.
              const _rates = (typeof window !== 'undefined' && window.SHIPPING_RATES) || SHIPPING_RATES;
              const validRates = Object.entries(_rates).filter(([k, s]) => {
                if (s.enabled === false) return false;
                if (s.restrictTo && s.restrictTo.state && s.restrictTo.state !== data.state) return false;
                return true;
              });
              // Garante que a opção selecionada ainda é válida (se não, escolhe a primeira)
              const validKeys = validRates.map(([k]) => k);
              if (!validKeys.includes(data.shipping) && validKeys.length > 0) {
                // ajuste assíncrono pra não trigger durante render
                setTimeout(() => setField('shipping', validKeys[0]), 0);
              }
              // Avalia se vai ter frete grátis automático
              const _shipCfg = (typeof window !== 'undefined' && window.SHIPPING_CONFIG) || { freeShipMin: 49.99, freeShipEnabled: true };
              const _autoFree = _shipCfg.freeShipEnabled && cart.subtotal >= _shipCfg.freeShipMin;
              return (
                <div className="cbox">
                  <h3>3. Forma de entrega</h3>
                  {_autoFree && (
                    <div className="adm__alert" style={{ marginBottom: 12, background: '#e8f5ec', borderColor: '#009C3B' }}>
                      <div>
                        <strong>🎉 Você ganhou frete grátis!</strong>
                        <p className="muted" style={{ fontSize: 13, marginTop: 4 }}>
                          Compras acima de {BRL(_shipCfg.freeShipMin)} têm frete grátis em qualquer modalidade.
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="shipopts">
                    {validRates.map(([k, s]) => (
                      <label key={k} className={'shipopt' + (data.shipping === k ? ' is-on' : '')}>
                        <input type="radio" checked={data.shipping === k} onChange={() => setField('shipping', k)} />
                        <div className="shipopt__icon"><Icon name="truck" size={20} /></div>
                        <div className="shipopt__body">
                          <strong>{s.name}</strong>
                          <span className="muted">{s.days}</span>
                        </div>
                        <div className="shipopt__price">
                          {(_autoFree || s.price === 0) ? 'GRÁTIS' : BRL(s.price)}
                        </div>
                      </label>
                    ))}
                  </div>
                  {data.state === 'SP' && _rates.motoboy && _rates.motoboy.enabled !== false && (
                    <small className="muted" style={{ fontSize: 11, marginTop: 8, display: 'block' }}>
                      🛵 Motoboy disponível para Grande SP. Confirmaremos a cobertura no WhatsApp.
                    </small>
                  )}
                  <div className="cbox__nav">
                    <button className="btn btn--ghost" onClick={() => setStep(2)}>Voltar</button>
                    <button className="btn btn--gold btn--lg" onClick={() => setStep(4)}>Continuar <Icon name="arrow-right" size={16} /></button>
                  </div>
                </div>
              );
            })()}
            {step === 4 && (
              <div className="cbox">
                <h3>4. Forma de pagamento</h3>
                <div className="paytabs paytabs--2">
                  <button className={'paytab' + (data.payment === 'pix' ? ' is-on' : '')} onClick={() => setField('payment', 'pix')}>
                    <Icon name="pix" size={22} />
                    <div>
                      <strong>Pix</strong>
                      <span className="paytab__sub">Confirmação imediata · 5% off · Aqui no site</span>
                    </div>
                    <span className="paytab__pill">RECOMENDADO</span>
                  </button>
                  <button className={'paytab' + (data.payment === 'card' ? ' is-on' : '')} onClick={() => setField('payment', 'card')}>
                    <Icon name="whatsapp" size={22} color="#25D366" />
                    <div>
                      <strong>Cartão de crédito</strong>
                      <span className="paytab__sub">Atendimento humano via WhatsApp · até 6x sem juros</span>
                    </div>
                  </button>
                </div>
                {data.payment === 'pix' && (
                  <div className="paypanel paypanel--pix">
                    <div>
                      <h4>Pagamento via Pix — direto no site</h4>
                      <p>Ao revisar e finalizar, geraremos o QR Code e o copia-e-cola na próxima tela. Você paga sem sair daqui.</p>
                      <ul>
                        <li><Icon name="check" size={14} /> Confirmação imediata após o pagamento</li>
                        <li><Icon name="check" size={14} /> 5% de desconto sobre o total</li>
                        <li><Icon name="check" size={14} /> Despacho no mesmo dia útil</li>
                        <li><Icon name="check" size={14} /> Chave Pix: {STORE.pixKey}</li>
                      </ul>
                    </div>
                    <div className="paypanel__total">
                      <span>Total no Pix</span>
                      <strong>{BRL(pixTotal)}</strong>
                      <span className="paypanel__off">Você economiza {BRL(total - pixTotal)}</span>
                    </div>
                  </div>
                )}
                {data.payment === 'card' && (
                  <div className="paypanel paypanel--wa">
                    <div>
                      <h4>Cartão de crédito é via WhatsApp</h4>
                      <p>
                        Para garantir o parcelamento e a segurança da sua compra,
                        finalizamos o cartão por uma maquineta virtual conduzida pelo nosso atendimento.
                        É rápido, seguro e você fala com uma pessoa de verdade.
                      </p>
                      <ul>
                        <li><Icon name="check" size={14} /> Em até 6x sem juros · Visa, Master, Elo, Hiper</li>
                        <li><Icon name="check" size={14} /> Resposta humana em minutos · seg a sex 9h–19h</li>
                        <li><Icon name="check" size={14} /> Levamos seu pedido pré-montado para o WhatsApp</li>
                      </ul>
                    </div>
                    <div className="paypanel__wa">
                      <Icon name="whatsapp" size={40} color="#25D366" />
                      <span>{STORE.whatsappDisplay}</span>
                      <small>Você revisa e confirma na próxima tela</small>
                    </div>
                  </div>
                )}
                <div className="cbox__nav">
                  <button className="btn btn--ghost" onClick={() => setStep(3)}>Voltar</button>
                  <button className="btn btn--gold btn--lg" onClick={() => setStep(5)}>Revisar pedido <Icon name="arrow-right" size={16} /></button>
                </div>
              </div>
            )}
            {step === 5 && (
              <div className="cbox">
                <h3>5. Revisão final</h3>
                <div className="rev">
                  <div className="rev__sec">
                    <h4>Identificação</h4>
                    <p>{data.name || '—'}<br />{data.email || '—'} · {data.phone || '—'}</p>
                  </div>
                  <div className="rev__sec">
                    <h4>Endereço</h4>
                    <p>{data.street || '—'}, {data.number} {data.complement && '· ' + data.complement}<br />
                      {data.district} · {data.city}/{data.state} · CEP {data.cep || '—'}</p>
                  </div>
                  <div className="rev__sec">
                    <h4>Entrega</h4>
                    <p><strong>{ship.name}</strong> · {ship.days}</p>
                  </div>
                  <div className="rev__sec">
                    <h4>Pagamento</h4>
                    <p>{data.payment === 'pix' ? <><strong>Pix</strong> · 5% off · {BRL(pixTotal)}</> : <><strong>Cartão de crédito</strong> · finalizamos via WhatsApp <Icon name="whatsapp" size={14} color="#25D366" /></>}</p>
                  </div>
                </div>
                <div className="cbox__nav">
                  <button className="btn btn--ghost" onClick={() => setStep(4)}>Voltar</button>
                  <button className="btn btn--gold btn--lg" onClick={finishOrder}>
                    {data.payment === 'pix' ? <>Gerar Pix <Icon name="pix" size={16} /></> : <>Finalizar via WhatsApp <Icon name="whatsapp" size={16} /></>}
                  </button>
                </div>
              </div>
            )}
            {step === 6 && (
              <div className="cbox pixbox">
                {generatingPix && (
                  <div className="pixbox__status" style={{ padding: 40, justifyContent: 'center' }}>
                    <div className="pixbox__spin" /> Gerando código PIX…
                  </div>
                )}
                {!generatingPix && pixError && (
                  <div style={{ padding: 32, textAlign: 'center' }}>
                    <h3>Não foi possível gerar o PIX</h3>
                    <p className="muted" style={{ marginBottom: 16 }}>{pixError}</p>
                    <button className="btn btn--ghost" onClick={() => { setStep(5); setPixError(null); }}>Voltar</button>
                  </div>
                )}
                {!generatingPix && !pixError && pixData && pixStatus === 'confirmado' && (
                  <div className="pixbox__ok">
                    <div className="pixbox__ok-seal"><Icon name="check" size={36} color="#009C3B" /></div>
                    <h3>Pagamento confirmado!</h3>
                    <p>Recebemos seu Pix. Já estamos separando seu pedido para o despacho.</p>
                    <button className="btn btn--gold btn--lg" onClick={() => navigate('confirmation', { orderId: pixData.orderId })}>
                      Ver detalhes do pedido <Icon name="arrow-right" size={16} />
                    </button>
                  </div>
                )}
                {!generatingPix && !pixError && pixData && pixStatus !== 'confirmado' && (
                  <>
                    <div className="pixbox__head">
                      <div>
                        <div className="hero__kicker"><span className="hero__dot" /> AGUARDANDO PAGAMENTO</div>
                        <h3>Pague o Pix para confirmar seu pedido</h3>
                        <p className="muted">Pedido <strong>{pixData.orderId}</strong> · Expira em <strong style={{ color: '#C8102E' }}>{fmtCountdown(pixCountdown)}</strong></p>
                      </div>
                      <div className="pixbox__amt">
                        <span>Valor a pagar</span>
                        <strong>{BRL(pixData.amount)}</strong>
                      </div>
                    </div>
                    <div className="pixbox__grid">
                      <div className="pixbox__qr">
                        {pixData.qrImage
                          ? <img src={pixData.qrImage.startsWith('data:') ? pixData.qrImage : `data:image/png;base64,${pixData.qrImage}`} alt="QR Code Pix" style={{ width: '100%', maxWidth: 220, display: 'block', margin: '0 auto' }} />
                          : <PixQR text={pixData.code} />}
                        <div className="muted" style={{ textAlign: 'center', fontSize: 12 }}>Aponte a câmera do banco</div>
                      </div>
                      <div className="pixbox__copy">
                        <h4>1. Pix copia-e-cola</h4>
                        <textarea readOnly value={pixData.code} onClick={(e) => e.target.select()} />
                        <button className="btn btn--gold btn--block" onClick={() => {
                          navigator.clipboard?.writeText(pixData.code);
                          setPixCopied(true);
                          setTimeout(() => setPixCopied(false), 2000);
                        }}>
                          {pixCopied ? <><Icon name="check" size={14} /> Copiado!</> : 'Copiar código Pix'}
                        </button>
                        <h4 style={{ marginTop: 14 }}>2. Abra o app do seu banco</h4>
                        <p className="muted" style={{ fontSize: 13 }}>Cole o código na opção <strong>Pix Copia e Cola</strong>, ou escaneie o QR. A confirmação chega em segundos.</p>
                      </div>
                    </div>
                    <div className="pixbox__status">
                      <Icon name="info" size={14} /> Após pagar, clique em <strong>"Já paguei o Pix"</strong> para nos avisar.
                    </div>
                    <div className="cbox__nav" style={{ marginTop: 16 }}>
                      <button className="btn btn--ghost" onClick={() => navigate('account', { tab: 'orders' })}>Pagar mais tarde</button>
                      <button className="btn btn--gold btn--lg" onClick={markAsPaid}>
                        <Icon name="check" size={16} /> Já paguei o Pix
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </section>
          <aside className="checkout__side">
            <h3>Resumo</h3>
            <div className="checkout__items">
              {items.map((i) => (
                <div key={i.id} className="checkout__item">
                  <div className="checkout__item-art"><ProductImage product={i.product} /></div>
                  <div className="checkout__item-body">
                    <div className="checkout__item-name">{i.product.short}</div>
                    <div className="muted" style={{ fontSize: 12 }}>{i.qty} × {BRL(i.product.price)}</div>
                  </div>
                  <div className="checkout__item-price">{BRL(i.product.price * i.qty)}</div>
                </div>
              ))}
            </div>
            <div className="cartside__row"><span>Subtotal</span><span>{BRL(cart.subtotal)}</span></div>
            {cart.discount > 0 && <div className="cartside__row cartside__row--off"><span>Cupom {cart.coupon}</span><span>-{BRL(cart.discount)}</span></div>}
            <div className="cartside__row"><span>Frete</span><span>{shipPrice === 0 ? 'GRÁTIS' : BRL(shipPrice)}</span></div>
            <div className="cartside__total"><span>Total</span><strong>{BRL(total)}</strong></div>
            {data.payment === 'pix' && <div className="muted" style={{ fontSize: 12, textAlign: 'right' }}>No Pix: <strong style={{ color: '#009C3B' }}>{BRL(pixTotal)}</strong></div>}
          </aside>
        </div>
      </div>

      {/* ─── Modal de agradecimento (após "Já paguei o Pix") ─── */}
      {showThankYou && (
        <div className="thxmodal" onClick={(e) => e.stopPropagation()}>
          <div className="thxmodal__inner" onClick={(e) => e.stopPropagation()}>
            <div className="thxmodal__seal">
              <Icon name="check" size={48} color="#FFD400" />
            </div>
            <h2 className="thxmodal__title">PIX recebido!</h2>
            <div className="thxmodal__order">
              Pedido <strong>{pixData?.orderId}</strong>
            </div>
            <div style={{
              background: '#FFF3CD', border: '2px solid #1B2240', borderRadius: 10,
              padding: '14px 16px', margin: '4px 0 16px', textAlign: 'left'
            }}>
              <p style={{ margin: 0, fontWeight: 700, color: '#1B2240', fontSize: 15, marginBottom: 6 }}>
                ⚠️ Atenção, falta 1 passo!
              </p>
              <p style={{ margin: 0, fontSize: 14, color: '#1B2240', lineHeight: 1.5 }}>
                Pra confirmar seu pagamento e despachar o pedido,
                <strong> você precisa avisar a gente no WhatsApp</strong>.
                Sem essa confirmação, o pedido pode atrasar.
              </p>
            </div>
            <button
              className="btn btn--green btn--lg btn--block"
              onClick={sendWhatsAppPaymentAlert}
              style={{
                fontSize: 17, padding: '16px 20px', marginBottom: 12,
                animation: 'thxPulse 1.4s ease-in-out infinite',
                boxShadow: '4px 4px 0 #1B2240'
              }}
            >
              📱 AVISAR AGORA NO WHATSAPP
            </button>
            <p style={{ fontSize: 12, color: '#666', margin: '4px 0 16px', textAlign: 'center' }}>
              O WhatsApp já abriu automaticamente. Se não abriu, clique no botão acima.<br/>
              <strong>Só clique em "Enviar" pra confirmar seu pedido.</strong>
            </p>
            <div className="thxmodal__steps">
              <div>
                <Icon name="check" size={16} color="#00B14F" />
                <div>Após receber sua confirmação no WhatsApp, conferimos o PIX e enviamos o código de rastreio.</div>
              </div>
              <div>
                <Icon name="check" size={16} color="#00B14F" />
                <div>Despachamos no próximo dia útil após a confirmação.</div>
              </div>
            </div>
            <div className="thxmodal__cta">
              <button className="btn btn--ghost" onClick={() => setShowThankYou(false)}>
                Voltar para a loja
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function Field({ label, children, col }) {
  return (
    <label className="fld" style={col ? { gridColumn: 'span ' + col } : null}>
      <span>{label}</span>
      {children}
    </label>
  );
}

// ─── CONFIRMATION ────────────────────────────────────────────────
function ConfirmationPage({ navigate, params }) {
  const cart = React.useContext(CartContext);
  const order = cart.orders.find((o) => o.id === params.orderId) || cart.orders[0];

  // NOTA SOBRE TRACKING:
  // A ConfirmationPage NÃO dispara Purchase/CompletePayment.
  // Os eventos do funil são disparados nos pontos certos:
  //   - PIX gerado (pedido criado)        → no CheckoutPage.finishOrder
  //   - WhatsApp click (intenção pagar)   → no CheckoutPage.markAsPaid
  //   - PURCHASE PAGA (conversão real)    → SÓ na página /pedido-confirmado,
  //     acessada após o admin marcar o pedido como pago no painel.
  // Aqui mostramos apenas o resumo do pedido pendente.

  if (!order) {
    return (
      <main className="pg"><div className="hd__container" style={{ padding: '80px 0', textAlign: 'center' }}>
        <h2>Pedido não encontrado.</h2>
        <button className="btn btn--gold" onClick={() => navigate('home')}>Voltar ao início</button>
      </div></main>
    );
  }

  return (
    <main className="pg conf">
      <div className="hd__container conf__inner">
        <div className="conf__seal">
          <Icon name="check" size={42} color="#009C3B" />
        </div>
        <div className="conf__kicker">PEDIDO CONFIRMADO</div>
        <h1>Você acaba de garantir <span>sua coleção</span></h1>
        <p className="conf__lead">
          Recebemos seu pedido. Enviamos um e-mail com o resumo e o status atualizado.
          Acompanhe a entrega na sua área do cliente.
        </p>
        <div className="conf__num">
          <span>Número do pedido</span>
          <strong>{order.id}</strong>
        </div>
        <div className="conf__grid">
          <div className="conf__card">
            <h3>Itens do pedido</h3>
            {order.items.map((i) => (
              <div key={i.id} className="conf__item">
                <div className="conf__item-art"><ProductImage product={i.product} /></div>
                <div>
                  <div className="conf__item-name">{i.product.short}</div>
                  <div className="muted">Qtd {i.qty} · {BRL(i.product.price * i.qty)}</div>
                </div>
              </div>
            ))}
            <div className="conf__total"><span>Total</span><strong>{BRL(order.total)}</strong></div>
          </div>
          <div className="conf__card">
            <h3>Entrega</h3>
            <p><strong>{order.shipping}</strong><br />
              {order.address.street}, {order.address.number} · {order.address.city}/{order.address.state} · CEP {order.address.cep}
            </p>
            <h3 style={{ marginTop: 18 }}>Pagamento</h3>
            <p>{order.payment === 'pix' && 'Pix · pago direto no site'}{order.payment === 'card' && 'Cartão de crédito · finalização via WhatsApp'}</p>
            <h3 style={{ marginTop: 18 }}>Status</h3>
            <ol className="conf__timeline">
              <li className="is-on"><span /> Pedido recebido</li>
              <li><span /> Pagamento confirmado</li>
              <li><span /> Em separação</li>
              <li><span /> Despachado</li>
              <li><span /> Entregue</li>
            </ol>
          </div>
        </div>
        <div className="conf__cta">
          <button className="btn btn--gold btn--lg" onClick={() => navigate('account', { tab: 'orders' })}>Ver meus pedidos</button>
          <button className="btn btn--ghost btn--lg" onClick={() => navigate('home')}>Voltar à loja</button>
        </div>
      </div>
    </main>
  );
}

Object.assign(window, { CartPage, CheckoutPage, ConfirmationPage, Field });

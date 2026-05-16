// pages-paid.jsx — Página de "Pedido Confirmado de Verdade"
// Acessada pelo cliente APÓS o admin marcar o pedido como pago.
// URL: /pedido-confirmado?order_id=XXXX
// Esta é a ÚNICA página que dispara Purchase/CompletePayment.

function PedidoConfirmadoPage({ navigate, params }) {
  // pega order_id da query string (params do hash router) OU da URL real
  const orderId = (params && (params.order_id || params.orderId))
    || (() => {
      try {
        const sp = new URLSearchParams(window.location.search);
        return sp.get('order_id') || sp.get('orderId');
      } catch (e) { return null; }
    })();

  const [state, setState] = React.useState({
    loading: true,
    order: null,
    error: null,
    tracked: false,
  });

  React.useEffect(() => {
    let alive = true;

    async function fetchOrder() {
      if (!orderId) {
        setState({ loading: false, order: null, error: 'Número do pedido não informado.', tracked: false });
        return;
      }

      try {
        // ── 1) Tenta servidor primeiro (fonte oficial) ──
        let order = null;
        try {
          const resp = await fetch('/api/order-status?order_id=' + encodeURIComponent(orderId), {
            cache: 'no-store',
          });
          if (resp.ok) {
            const json = await resp.json();
            if (json.ok && json.order) order = json.order;
          }
        } catch (e) { /* fallback abaixo */ }

        // ── 2) Fallback: lê do localStorage (admin de teste local) ──
        if (!order) {
          try {
            const orders = JSON.parse(localStorage.getItem('cc26.orders') || '[]');
            order = orders.find((o) => String(o.id) === String(orderId));
            // Compat: pedidos antigos podem ter status string ao invés do enum
            if (order && !order.status_code) {
              if (order.status === 'Pago' || order.status === 'paid' || order.paidAt) {
                order = { ...order, status_code: 'paid' };
              } else {
                order = { ...order, status_code: 'awaiting_pix' };
              }
            }
          } catch (e) { /* */ }
        }

        if (!alive) return;
        if (!order) {
          setState({ loading: false, order: null, error: 'Pedido não encontrado.', tracked: false });
          return;
        }

        // ── 3) Aceita pago via flag explícita OU status_code === 'paid' ──
        const statusCode = order.status_code || order.status;
        const isPaid = statusCode === 'paid'
          || order.status === 'Pago'
          || order.status === 'paid'
          || /pago.*confer.ncia/i.test(order.status || '');

        if (!isPaid) {
          setState({
            loading: false,
            order: order,
            error: 'Pagamento ainda não confirmado.',
            statusReceived: order.status,
            tracked: false,
          });
          return;
        }

        // ── 4) DISPARA Purchase APENAS UMA VEZ ──
        const flagKey = 'purchase_tracked_' + order.id;
        const alreadyTracked = (() => {
          try { return !!localStorage.getItem(flagKey); } catch (e) { return false; }
        })();

        if (!alreadyTracked && window.MKT && window.MKT.trackPurchasePaid) {
          try {
            const result = window.MKT.trackPurchasePaid({
              ...order,
              status: 'paid', // força status pra passar no guard
            });
            console.log('[TRACKING] Purchase fired result:', result);
          } catch (e) { console.warn('[mkt] trackPurchasePaid falhou:', e); }
        }

        setState({ loading: false, order: order, error: null, tracked: true });
      } catch (e) {
        if (!alive) return;
        setState({ loading: false, order: null, error: 'Erro ao carregar pedido.', tracked: false });
      }
    }

    fetchOrder();
    return () => { alive = false; };
  }, [orderId]);

  if (state.loading) {
    return (
      <main className="pg conf"><div className="hd__container" style={{ padding: '80px 0', textAlign: 'center' }}>
        <h2>Carregando seu pedido...</h2>
      </div></main>
    );
  }

  if (state.error) {
    return (
      <main className="pg conf"><div className="hd__container" style={{ padding: '60px 0', textAlign: 'center' }}>
        <div className="conf__seal" style={{ background: '#FFE0E0' }}>
          <Icon name="info" size={42} color="#C8102E" />
        </div>
        <h2 style={{ marginTop: 16 }}>{state.error}</h2>
        {state.order && state.statusReceived && (
          <p className="muted">Status atual do pedido: <strong>{state.statusReceived}</strong></p>
        )}
        <p style={{ marginTop: 12 }}>Se você acredita que isso é um engano, entre em contato pelo WhatsApp.</p>
        <button className="btn btn--gold" onClick={() => navigate('home')}>Voltar à loja</button>
      </div></main>
    );
  }

  const order = state.order;
  const items = order.items || [];

  return (
    <main className="pg conf">
      <div className="hd__container conf__inner">
        <div className="conf__seal">
          <Icon name="check" size={42} color="#009C3B" />
        </div>
        <div className="conf__kicker">PAGAMENTO CONFIRMADO ✅</div>
        <h1>Seu pedido foi <span>confirmado</span></h1>
        <p className="conf__lead">
          Recebemos seu pagamento. Seu pedido entrou na fila de separação e
          será despachado em até 24h úteis. Você receberá o código de
          rastreio em breve.
        </p>

        <div className="conf__num">
          <span>Número do pedido</span>
          <strong>{order.id}</strong>
        </div>

        <div className="conf__grid">
          <div className="conf__card">
            <h3>Itens do pedido</h3>
            {items.map((i) => {
              const product = i.product || (window.PRODUCTS || []).find((p) => p.id === i.id) || { short: i.id, price: 0 };
              return (
                <div key={i.id || product.id} className="conf__item">
                  <div className="conf__item-art"><ProductImage product={product} /></div>
                  <div>
                    <div className="conf__item-name">{product.short || product.name || i.id}</div>
                    <div className="muted">Qtd {i.qty} · {BRL((product.price || 0) * i.qty)}</div>
                  </div>
                </div>
              );
            })}
            <div className="conf__total"><span>Total pago</span><strong>{BRL(order.total)}</strong></div>
          </div>
          <div className="conf__card">
            <h3>Status</h3>
            <ol className="conf__timeline">
              <li className="is-on"><span /> Pedido recebido</li>
              <li className="is-on"><span /> Pagamento confirmado</li>
              <li><span /> Em separação</li>
              <li><span /> Despachado</li>
              <li><span /> Entregue</li>
            </ol>
            {order.paidAt && (
              <p className="muted" style={{ fontSize: 12, marginTop: 12 }}>
                Pagamento confirmado em {new Date(order.paidAt).toLocaleString('pt-BR')}
              </p>
            )}
          </div>
        </div>

        <div className="conf__cta">
          <button className="btn btn--gold btn--lg" onClick={() => navigate('home')}>Voltar à loja</button>
        </div>
      </div>
    </main>
  );
}

window.PedidoConfirmadoPage = PedidoConfirmadoPage;

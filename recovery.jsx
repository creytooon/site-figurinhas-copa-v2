// recovery.jsx — Pop-ups de retenção: carrinho abandonado + exit-intent

const RECOVERY_KEY = 'cc26.recover';
const RECOVERY_DELAY = 25 * 1000;
const RECOVERY_COOLDOWN = 12 * 60 * 60 * 1000;
const EXIT_KEY = 'cc26.exitintent';
const EXIT_COOLDOWN = 24 * 60 * 60 * 1000;

function CartRecovery({ navigate, route }) {
  const cart = React.useContext(CartContext);
  const [show, setShow] = React.useState(false);
  const [timeLeft, setTimeLeft] = React.useState(15 * 60);

  React.useEffect(() => {
    if (!cart || !cart.items.length) { setShow(false); return; }
    if (['cart', 'checkout', 'confirmation'].includes(route.name)) { setShow(false); return; }
    try {
      const last = +localStorage.getItem(RECOVERY_KEY) || 0;
      if (Date.now() - last < RECOVERY_COOLDOWN) return;
    } catch (e) {}
    const t = setTimeout(() => setShow(true), RECOVERY_DELAY);
    return () => clearTimeout(t);
  }, [cart && cart.items.length, route.name]);

  React.useEffect(() => {
    if (!show) return;
    const i = setInterval(() => setTimeLeft((t) => Math.max(0, t - 1)), 1000);
    return () => clearInterval(i);
  }, [show]);

  React.useEffect(() => {
    if (!cart || !cart.items.length) return;
    if (['cart', 'checkout', 'confirmation'].includes(route.name)) return;
    try {
      const last = +localStorage.getItem(RECOVERY_KEY) || 0;
      if (Date.now() - last < RECOVERY_COOLDOWN) return;
    } catch (e) {}
    const onLeave = (e) => { if (e.clientY < 10 && !show) setShow(true); };
    document.addEventListener('mouseleave', onLeave);
    return () => document.removeEventListener('mouseleave', onLeave);
  }, [cart && cart.items.length, route.name, show]);

  if (!show || !cart || !cart.items.length) return null;

  const close = () => {
    setShow(false);
    try { localStorage.setItem(RECOVERY_KEY, String(Date.now())); } catch (e) {}
  };
  const apply = () => { cart.setCoupon('VOLTA10'); navigate('cart'); close(); };

  const items = cart.items.map((i) => PRODUCTS.find((p) => p.id === i.id)).filter(Boolean);
  const visibleItems = items.slice(0, 3);
  const hidden = items.length - visibleItems.length;
  const mins = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const secs = (timeLeft % 60).toString().padStart(2, '0');

  return (
    <div className="recover-pop">
      <div className="recover-pop__head">
        <strong>⚽ ESPERA AÍ, COLECIONADOR!</strong>
        <button className="recover-pop__close" onClick={close} aria-label="Fechar"><Icon name="close" size={14} /></button>
      </div>
      <div className="recover-pop__body">
        <div className="recover-pop__items">
          {visibleItems.map((p) => (
            <div key={p.id} className="recover-pop__art"><ProductImage product={p} /></div>
          ))}
          {hidden > 0 && <div className="recover-pop__more">+{hidden}</div>}
        </div>
        <p>
          Você deixou <strong>{cart.totalCount} {cart.totalCount === 1 ? 'item' : 'itens'}</strong> no carrinho. Estamos guardando para você — mas o estoque é limitado.
        </p>
        <div className="recover-pop__coupon">
          <div>
            <div className="recover-pop__coupon-code">VOLTA10</div>
            <div className="recover-pop__coupon-off">10% off · válido só agora</div>
          </div>
          <div className="recover-pop__timer">
            <span className="recover-pop__timer-dot" />
            {mins}:{secs}
          </div>
        </div>
        <div className="recover-pop__cta">
          <button className="btn btn--ghost btn--sm" onClick={close}>Agora não</button>
          <button className="btn btn--gold btn--sm" onClick={apply}>Aplicar e finalizar</button>
        </div>
      </div>
    </div>
  );
}

// ─── EXIT INTENT POPUP — visitante sem carrinho ────────────────────
function ExitIntentPopup({ navigate, route }) {
  const cart = React.useContext(CartContext);
  const [show, setShow] = React.useState(false);

  React.useEffect(() => {
    if (!['home', 'category', 'product'].includes(route.name)) return;
    if (cart && cart.items.length > 0) return;
    try {
      const last = +localStorage.getItem(EXIT_KEY) || 0;
      if (Date.now() - last < EXIT_COOLDOWN) return;
    } catch (e) {}

    let triggered = false;
    const trigger = () => { if (triggered) return; triggered = true; setShow(true); };

    const onLeave = (e) => { if (e.clientY < 10) trigger(); };
    const inactivityTimer = setTimeout(trigger, 45 * 1000);
    const onKey = (e) => { if (e.key === 'Escape') trigger(); };

    document.addEventListener('mouseleave', onLeave);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('keydown', onKey);
      clearTimeout(inactivityTimer);
    };
  }, [route.name, cart && cart.items.length]);

  if (!show) return null;

  const close = () => {
    setShow(false);
    try { localStorage.setItem(EXIT_KEY, String(Date.now())); } catch (e) {}
  };
  const apply = () => { if (cart) cart.setCoupon('VOLTA10'); navigate('category'); close(); };
  const copyCode = async () => {
    try { await navigator.clipboard.writeText('VOLTA10'); } catch (e) {}
  };

  return (
    <div className="exitpop" onClick={close}>
      <div className="exitpop__inner" onClick={(e) => e.stopPropagation()}>
        <button className="exitpop__close" onClick={close} aria-label="Fechar">×</button>
        <div className="exitpop__seal">🎁</div>
        <h2 className="exitpop__title">ESPERA!</h2>
        <p className="exitpop__lead">
          Antes de você sair — leva um <strong>cupom de 10% off</strong> de
          boas-vindas pra começar sua coleção da Copa.
        </p>
        <div className="exitpop__coupon" onClick={copyCode} title="Clique para copiar">
          <span className="exitpop__coupon-label">CUPOM</span>
          <span className="exitpop__coupon-code">VOLTA10</span>
          <span className="exitpop__coupon-hint">Toque para copiar</span>
        </div>
        <button className="btn btn--gold btn--lg btn--block" onClick={apply}>
          Aplicar cupom e ver coleção
        </button>
        <button className="exitpop__pass" onClick={close}>Não, obrigado</button>
      </div>
    </div>
  );
}

Object.assign(window, { CartRecovery, ExitIntentPopup });

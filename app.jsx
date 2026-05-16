// app.jsx — Root, router, tweaks, mobile preview

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "palette": ["#009C3B", "#FFDF00", "#C8102E"],
  "displayFont": "Bebas Neue",
  "cols": 4,
  "headline": "Garanta agora o álbum, envelopes e cards exclusivos da edição 2026 — direto na sua casa, lacrados, com nota fiscal.",
  "viewMode": "desktop"
}/*EDITMODE-END*/;

function TweaksUI({ t, setTweak, navigate, cartStore }) {
  return (
    <TweaksPanel title="Tweaks · Álbum Copa">
      <TweakSection label="Identidade" />
      <TweakColor
        label="Paleta"
        value={t.palette}
        options={[
          ['#009C3B', '#FFDF00', '#C8102E'],
          ['#006B2A', '#FFDF00', '#E8C800'],
          ['#0a3a72', '#FFDF00', '#C8102E'],
          ['#1a1a1a', '#FFDF00', '#009C3B'],
          ['#5b1409', '#FFDF00', '#009C3B'],
        ]}
        onChange={(v) => setTweak('palette', v)}
      />
      <TweakRadio
        label="Fonte display"
        value={t.displayFont}
        options={['Anton', 'Bebas Neue', 'Oswald']}
        onChange={(v) => setTweak('displayFont', v)}
      />
      <TweakSection label="Layout" />
      <TweakRadio
        label="Visualização"
        value={t.viewMode}
        options={['desktop', 'mobile']}
        onChange={(v) => setTweak('viewMode', v)}
      />
      <TweakSelect
        label="Colunas (vitrine)"
        value={String(t.cols)}
        options={['3', '4', '5']}
        onChange={(v) => setTweak('cols', +v)}
      />
      <TweakSection label="Conteúdo" />
      <TweakText
        label="Headline do hero"
        value={t.headline}
        onChange={(v) => setTweak('headline', v)}
      />
      <TweakSection label="Atalhos" />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {[
          ['Home', 'home'],
          ['Categoria', 'category'],
          ['Produto', 'product', { id: 'box-40' }],
          ['Carrinho', 'cart'],
          ['Checkout', 'checkout'],
          ['Conta', 'account'],
          ['Contato', 'contact'],
        ].map(([label, name, params]) => (
          <button key={label} className="twk-mini" onClick={() => navigate(name, params || {})}>{label}</button>
        ))}
      </div>
    </TweaksPanel>
  );
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const cartStore = window.useCartStore();

  // Força re-render quando o admin altera produtos/cupons/loja em outra aba.
  // O evento `cc26:data-changed` é disparado pelo listener em data.jsx.
  const [, forceTick] = React.useReducer((x) => x + 1, 0);
  React.useEffect(() => {
    const onChange = () => forceTick();
    window.addEventListener('cc26:data-changed', onChange);
    return () => window.removeEventListener('cc26:data-changed', onChange);
  }, []);

  const [route, setRoute] = React.useState({ name: 'home', params: {} });
  const [query, setQuery] = React.useState('');

  React.useEffect(() => {
    const parse = () => {
      // 1) Suporte a /oferta /promo /copa /pedido-confirmado servidos pela Vercel (cleanUrls):
      //    converte o path em rota do SPA via hash.
      const path = window.location.pathname.replace(/\/$/, '');
      const pathMap = {
        '/oferta': 'oferta',
        '/promo': 'oferta',
        '/copa': 'oferta',
        '/pedido-confirmado': 'pedido-confirmado',
        '/obrigado': 'pedido-confirmado',
      };
      if (pathMap[path] && !window.location.hash) {
        // Preserva query string (especialmente order_id)
        const search = window.location.search || '';
        const params = {};
        if (search) {
          new URLSearchParams(search).forEach((v, k) => { params[k] = v; });
        }
        window.history.replaceState({}, '', '/');
        // Monta hash com query params
        const qs = Object.entries(params).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&');
        window.location.hash = pathMap[path] + (qs ? '?' + qs : '');
        return;
      }
      // 2) Suporte a ?_route=oferta (fallback do vercel.json)
      const sp = new URLSearchParams(window.location.search);
      const forced = sp.get('_route');
      if (forced && !window.location.hash) {
        // limpa o query mas preserva utm_*
        sp.delete('_route');
        const cleanQs = sp.toString();
        window.history.replaceState({}, '', '/' + (cleanQs ? '?' + cleanQs : ''));
        window.location.hash = forced;
        return;
      }

      const h = window.location.hash.slice(1);
      if (!h) return setRoute({ name: 'home', params: {} });
      const [name, qs] = h.split('?');
      const params = {};
      if (qs) qs.split('&').forEach((kv) => {
        const [k, v] = kv.split('=');
        params[k] = decodeURIComponent(v || '');
      });
      setRoute({ name, params });
    };
    parse();
    window.addEventListener('hashchange', parse);
    return () => window.removeEventListener('hashchange', parse);
  }, []);

  // Tracking: dispara PageView do SPA a cada mudança de rota
  React.useEffect(() => {
    if (window.MKT) {
      try { window.MKT.trackPageView('/' + (route.name || 'home')); } catch (e) { /* noop */ }
    }
  }, [route.name, JSON.stringify(route.params)]);

  const navigate = (name, params = {}) => {
    const qs = Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== null)
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&');
    window.location.hash = name + (qs ? '?' + qs : '');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  React.useEffect(() => {
    const r = document.documentElement;
    r.style.setProperty('--brand', t.palette[0]);
    r.style.setProperty('--accent', t.palette[1]);
    r.style.setProperty('--alert', t.palette[2]);
    r.style.setProperty('--display-font', `"${t.displayFont}", "Anton", sans-serif`);
  }, [t.palette, t.displayFont]);

  const showHeaderFooter = route.name !== 'checkout';

  let page = null;
  switch (route.name) {
    case 'home': page = <HomePage navigate={navigate} tweaks={t} />; break;
    case 'oferta': page = <OfertaPage navigate={navigate} />; break;
    case 'pedido-confirmado': page = <PedidoConfirmadoPage navigate={navigate} params={route.params} />; break;
    case 'category': page = <CategoryPage navigate={navigate} params={route.params} query={query} setQuery={setQuery} />; break;
    case 'product': page = <ProductPage navigate={navigate} params={route.params} />; break;
    case 'cart': page = <CartPage navigate={navigate} />; break;
    case 'checkout': page = <CheckoutPage navigate={navigate} />; break;
    case 'confirmation': page = <ConfirmationPage navigate={navigate} params={route.params} />; break;
    case 'account': page = <AccountPage navigate={navigate} params={route.params} />; break;
    case 'contact': page = <StaticPage kind="contact" navigate={navigate} />; break;
    case 'faq': page = <StaticPage kind="faq" navigate={navigate} />; break;
    case 'policy': page = <StaticPage kind="policy" navigate={navigate} />; break;
    default: page = <HomePage navigate={navigate} tweaks={t} />;
  }

  const content = (
    <div className="app" data-route={route.name} data-mobile={t.viewMode === 'mobile'}>
      {showHeaderFooter && <Header route={route} navigate={navigate} query={query} setQuery={setQuery} />}
      {page}
      {showHeaderFooter && <Footer navigate={navigate} />}
      {route.name !== 'checkout' && <WhatsappFab />}
      <CartRecovery navigate={navigate} route={route} />
      <ExitIntentPopup navigate={navigate} route={route} />
    </div>
  );

  const CartProvider = window.CartContext.Provider;

  return (
    <CartProvider value={cartStore}>
      {t.viewMode === 'mobile' ? (
        <div className="mobwrap">
          <div className="mobwrap__bg" />
          <div className="mobwrap__inner">
            <IOSDevice width={420} height={900} title="Álbum Copa">
              <div className="mobile-app">{content}</div>
            </IOSDevice>
          </div>
        </div>
      ) : content}
      <TweaksUI t={t} setTweak={setTweak} navigate={navigate} cartStore={cartStore} />
    </CartProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);

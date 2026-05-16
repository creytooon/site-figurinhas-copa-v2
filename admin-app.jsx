// admin-app.jsx — Painel administrativo separado
// Persiste em localStorage: produtos, cupons, integrações de checkout

const SEED_PRODUCTS = window.PRODUCTS;
const SEED_COUPONS = window.COUPONS;

const ADM_STORAGE_KEYS = {
  products: 'cc26.adm.products',
  coupons: 'cc26.adm.coupons',
  banners: 'cc26.adm.banners',
  store: 'cc26.adm.store',
};

// ─── CONFIGURAÇÃO PIX PADRÃO ─────────────────────────────────────
// Estes dados já deixam o checkout pronto para gerar o PIX copia-e-cola
// e o QR Code com a chave informada. O campo usado pelo BR Code é a
// cidade; como o estado informado foi São Paulo, mantemos SAO PAULO em
// city e também salvamos state: 'SP' para uso interno do painel.
const PIX_DEFAULT_CONFIG = {
  pixKey: '66.699.016/0001-42',
  beneficiary: 'JOHN LENON REIS DA CRUZ',
  city: 'SAO PAULO',
  state: 'SP',
};

const PIX_CONFIG_VERSION = '2026-05-12-john-lenon-reis-da-cruz';

function withPixDefaults(config = {}, forcePix = false) {
  const base = forcePix ? { ...(config || {}), ...PIX_DEFAULT_CONFIG } : { ...PIX_DEFAULT_CONFIG, ...(config || {}) };
  base.pixConfigVersion = PIX_CONFIG_VERSION;
  Object.keys(PIX_DEFAULT_CONFIG).forEach((key) => {
    if (base[key] === undefined || base[key] === null || String(base[key]).trim() === '') {
      base[key] = PIX_DEFAULT_CONFIG[key];
    }
  });
  return base;
}

function loadStoreConfig() {
  try {
    const saved = JSON.parse(localStorage.getItem(ADM_STORAGE_KEYS.store) || '{}');
    // Se já existir configuração antiga no navegador, esta versão força uma
    // atualização única para a nova chave PIX definida no código. Depois disso,
    // alterações feitas pelo painel continuam sendo preservadas normalmente.
    return withPixDefaults(saved, saved.pixConfigVersion !== PIX_CONFIG_VERSION);
  } catch (e) {
    return withPixDefaults({}, true);
  }
}

function saveStoreConfig(config) {
  localStorage.setItem(ADM_STORAGE_KEYS.store, JSON.stringify(withPixDefaults(config)));
}

// Garante que a configuração PIX padrão já fique gravada no navegador assim
// que o painel carregar, mesmo antes de clicar em "Salvar configurações".
try {
  saveStoreConfig(loadStoreConfig());
} catch (e) {
  console.warn('[admin] não foi possível inicializar a configuração PIX padrão:', e);
}

function loadJSON(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch (e) {
    return fallback;
  }
}

function useAdminStore() {
  const [products, setProducts] = React.useState(() => loadJSON(ADM_STORAGE_KEYS.products, SEED_PRODUCTS));
  const [coupons, setCoupons] = React.useState(() =>
    loadJSON(ADM_STORAGE_KEYS.coupons, Object.entries(SEED_COUPONS).map(([code, c]) => ({ code, ...c, active: true, uses: 0 })))
  );

  // Wrappers tolerantes — se o navegador estourar a quota do localStorage (o
  // que acontece quando o produto tem fotos grandes em base64), a gente avisa
  // mas não deixa o React quebrar e mostrar tela branca.
  const safeSet = (key, value, label) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error(`[admin] falha ao salvar ${label} no localStorage:`, e);
      // Se foi quota e estamos salvando produtos, tenta recomprimir fotos antigas
      // automaticamente: data URLs >150KB são recomprimidas pra ~80KB.
      if (key === 'cc26.adm.products' && Array.isArray(value)) {
        try {
          const recompressed = value.map((p) => {
            const out = { ...p };
            if (typeof p.photo === 'string' && p.photo.length > 150 * 1024) {
              out.photo = shrinkDataUrl(p.photo);
            }
            if (Array.isArray(p.photos)) {
              out.photos = p.photos.map((ph) =>
                typeof ph === 'string' && ph.length > 150 * 1024 ? shrinkDataUrl(ph) : ph
              );
            }
            return out;
          });
          localStorage.setItem(key, JSON.stringify(recompressed));
          console.warn('[admin] fotos recomprimidas automaticamente — espaço liberado.');
          return true;
        } catch (e2) {
          console.error('[admin] recompressão automática também falhou:', e2);
        }
      }
      try {
        alert(
          'Espaço local cheio! Vá em Painel → Conteúdo → "Otimizar fotos" ' +
          'pra reduzir o tamanho das fotos antigas, ou remova produtos não usados.'
        );
      } catch {}
      return false;
    }
  };

  // Recomprime uma data URL existente (já em base64) reduzindo qualidade.
  // Usa canvas — síncrono pra rodar dentro do safeSet de emergência.
  // Retorna a string original em caso de erro pra não corromper o dado.
  const shrinkDataUrl = (dataUrl, maxDim = 600, quality = 0.65) => {
    try {
      const img = new Image();
      img.src = dataUrl;
      // Image.decode é async, mas se a imagem já estiver carregada (data URL
      // local), o naturalWidth fica disponível direto. Tentamos sincronamente.
      if (!img.complete || !img.naturalWidth) return dataUrl;
      let { naturalWidth: w, naturalHeight: h } = img;
      if (w > maxDim || h > maxDim) {
        if (w > h) { h = Math.round(h * maxDim / w); w = maxDim; } else { w = Math.round(w * maxDim / h); h = maxDim; }
      }
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0, w, h);
      return canvas.toDataURL('image/jpeg', quality);
    } catch (e) {
      console.warn('[admin] shrinkDataUrl falhou:', e);
      return dataUrl;
    }
  };
  // Debounced save: agrupa edições rápidas (digitação) em uma só gravação.
  const debouncedSave = React.useMemo(() => {
    const timers = {};
    return (key, value, label) => {
      clearTimeout(timers[key]);
      timers[key] = setTimeout(() => safeSet(key, value, label), 350);
    };
  }, []);
  React.useEffect(() => { debouncedSave(ADM_STORAGE_KEYS.products, products, 'produtos'); }, [products]);
  React.useEffect(() => { debouncedSave(ADM_STORAGE_KEYS.coupons, coupons, 'cupons'); }, [coupons]);

  return { products, setProducts, coupons, setCoupons };
}

// ─── AUTH ────────────────────────────────────────────────────────
// Usuários padrão (sementes). Você pode trocar a senha pelo painel
// (Conta de admin) — a senha nova fica salva no localStorage.
// IMPORTANTE: senhas são armazenadas em texto. Para segurança real,
// use um backend com hash (bcrypt). Esta é uma melhoria parcial.
const ADMIN_USERS_SEED = [
  { email: 'noiadejogo', password: 'Jajaja123@', name: 'Operador Loja' },
];
const SESSION_KEY = 'cc26.adm.session';
const ADMIN_AUTH_KEY = 'cc26.adm.auth'; // overrides de senha do admin
const SESSION_DURATION = 1000 * 60 * 60 * 8; // 8h

function loadAdminUsers() {
  try {
    const saved = JSON.parse(localStorage.getItem(ADMIN_AUTH_KEY) || 'null');
    if (saved && Array.isArray(saved) && saved.length) return saved;
  } catch (e) {}
  return ADMIN_USERS_SEED;
}

function saveAdminUsers(users) {
  try { localStorage.setItem(ADMIN_AUTH_KEY, JSON.stringify(users)); }
  catch (e) { console.error('[admin] falha ao salvar credenciais:', e); }
}

function useAuth() {
  const [session, setSession] = React.useState(() => {
    try {
      const s = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
      if (s && s.expiresAt && s.expiresAt > Date.now()) return s;
    } catch (e) {}
    return null;
  });
  const login = (email, password, remember) => {
    const users = loadAdminUsers();
    const u = users.find((x) => x.email.toLowerCase() === email.toLowerCase() && x.password === password);
    if (!u) return { ok: false, error: 'Usuário ou senha incorretos.' };
    const s = { email: u.email, name: u.name, expiresAt: Date.now() + (remember ? SESSION_DURATION * 7 : SESSION_DURATION) };
    localStorage.setItem(SESSION_KEY, JSON.stringify(s));
    setSession(s);
    return { ok: true };
  };
  const logout = () => {
    localStorage.removeItem(SESSION_KEY);
    setSession(null);
  };
  // Troca senha: requer senha atual + nova senha. Atualiza o localStorage.
  const changePassword = (email, currentPassword, newPassword) => {
    const users = loadAdminUsers();
    const idx = users.findIndex((x) => x.email.toLowerCase() === email.toLowerCase());
    if (idx === -1) return { ok: false, error: 'Usuário não encontrado.' };
    if (users[idx].password !== currentPassword) return { ok: false, error: 'Senha atual incorreta.' };
    if (!newPassword || newPassword.length < 6) return { ok: false, error: 'A nova senha deve ter ao menos 6 caracteres.' };
    const updated = users.map((u, i) => i === idx ? { ...u, password: newPassword } : u);
    saveAdminUsers(updated);
    return { ok: true };
  };
  return { session, login, logout, changePassword };
}

function AdminLogin({ onLogin }) {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [remember, setRemember] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [mode, setMode] = React.useState('login'); // 'login' | 'forgot'
  const [forgotSent, setForgotSent] = React.useState(false);

  const submit = (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setTimeout(() => {
      const r = onLogin(email, password, remember);
      setLoading(false);
      if (!r.ok) setError(r.error);
    }, 500);
  };
  const submitForgot = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setForgotSent(true); setLoading(false); }, 600);
  };

  return (
    <main className="adm-login">
      <div className="adm-login__bg">
        <div className="adm-login__bg-grid" />
        <div className="adm-login__bg-glow" />
      </div>
      <div className="adm-login__card">
        <div className="adm-login__head">
          <Logo />
          <div className="adm-login__shield">
            <Icon name="shield" size={14} /> Acesso restrito
          </div>
        </div>

        {mode === 'login' && (
          <>
            <h1>Painel de gestão</h1>
            <p className="muted">Entre com suas credenciais para continuar.</p>
            <form onSubmit={submit}>
              <Field label="Usuário">
                <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} autoFocus required placeholder="seu usuário" />
              </Field>
              <Field label="Senha">
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" />
              </Field>
              <div className="adm-login__row">
                <label className="chk">
                  <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                  <span>Manter conectado por 7 dias</span>
                </label>
                <a className="adm-login__forgot" onClick={() => { setMode('forgot'); setError(null); }}>Esqueci a senha</a>
              </div>
              {error && (
                <div className="adm-login__error">
                  <Icon name="info" size={14} /> {error}
                </div>
              )}
              <button className="btn btn--gold btn--lg btn--block" type="submit" disabled={loading}>
                {loading ? 'Verificando…' : 'Entrar no painel'}
              </button>
            </form>
          </>
        )}

        {mode === 'forgot' && (
          <>
            <h1>Recuperar senha</h1>
            <div className="adm-login__sent">
              <div className="adm-login__sent-icon"><Icon name="info" size={28} /></div>
              <h2>Recuperação manual</h2>
              <p className="muted" style={{ fontSize: 13, lineHeight: 1.55 }}>
                Não há sistema automático de recuperação. Se você esqueceu a senha:
              </p>
              <ol style={{ textAlign: 'left', fontSize: 13, lineHeight: 1.8, paddingLeft: 22, marginTop: 12 }}>
                <li>Abra o navegador no console <strong>(F12 → Application → Local Storage)</strong></li>
                <li>Apague a chave <code>cc26.adm.auth</code></li>
                <li>Recarregue e use a senha padrão configurada no código</li>
              </ol>
            </div>
            <a className="adm-login__back" onClick={() => { setMode('login'); setForgotSent(false); }}>← Voltar para entrar</a>
          </>
        )}

        <a className="adm-login__store" href="index.html"><Icon name="chevron-left" size={12} /> Voltar para a loja</a>
      </div>
    </main>
  );
}

// ─── ROOT ────────────────────────────────────────────────────────
function AdminApp() {
  const auth = useAuth();
  if (!auth.session) return <AdminLogin onLogin={auth.login} />;
  return <AdminAppInner auth={auth} />;
}

function AdminAppInner({ auth }) {
  const store = useAdminStore();
  const [section, setSection] = React.useState(() => location.hash.slice(1) || 'dashboard');
  const [toast, setToast] = React.useState(null);

  React.useEffect(() => {
    const onHash = () => setSection(location.hash.slice(1) || 'dashboard');
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  const goto = (id) => { location.hash = id; };

  const showToast = (msg, kind = 'ok') => {
    setToast({ msg, kind });
    setTimeout(() => setToast(null), 2400);
  };

  const SECTIONS = [
    { id: 'dashboard',    label: 'Dashboard',    icon: 'grid' },
    { id: 'products',     label: 'Produtos',     icon: 'package' },
    { id: 'content',      label: 'Conteúdo',     icon: 'edit', badge: 'NOVO' },
    { id: 'coupons',      label: 'Cupons',       icon: 'tag' },
    { id: 'orders',       label: 'Pedidos',      icon: 'truck' },
    { id: 'pix',          label: 'Pagamento PIX', icon: 'card', badge: 'PRÓPRIO' },
    { id: 'shipping',     label: 'Fretes',       icon: 'truck' },
    { id: 'banners',      label: 'Banners',      icon: 'list' },
    { id: 'marketing',    label: 'Marketing & Anúncios', icon: 'tag', badge: 'ADS' },
    { id: 'store',        label: 'Dados da loja', icon: 'shield' },
    { id: 'account',      label: 'Conta de admin', icon: 'lock' },
  ];

  const currentSection = SECTIONS.find((s) => s.id === section) || SECTIONS[0];

  return (
    <main className="adm">
      <aside className="adm__side">
        <div className="adm__brand"><Logo dark /></div>
        <div className="adm__sidehead">PAINEL DE GESTÃO</div>
        {SECTIONS.map((s) => (
          <button key={s.id} className={'adm__tab' + (section === s.id ? ' is-on' : '')} onClick={() => goto(s.id)}>
            <Icon name={s.icon} size={16} />
            <span style={{ flex: 1 }}>{s.label}</span>
            {s.badge && <span className="adm__sidebadge">{s.badge}</span>}
          </button>
        ))}
        <a className="adm__back" href="index.html"><Icon name="chevron-left" size={12} /> Voltar à loja</a>
      </aside>
      <section className="adm__main">
        <header className="adm__head">
          <div>
            <div className="muted" style={{ fontSize: 12, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Loja Álbum Copa 2026 / {currentSection.label}</div>
            <h1>{currentSection.label}</h1>
          </div>
          <div className="adm__head-act">
            <a className="btn btn--ghost btn--sm" href="index.html" target="_blank"><Icon name="search" size={14} /> Ver loja</a>
            <div className="adm__user">
              <div className="adm__user-avatar">{auth.session.name.split(' ').map((s) => s[0]).slice(0, 2).join('')}</div>
              <div className="adm__user-meta">
                <strong>{auth.session.name}</strong>
                <span className="muted">{auth.session.email}</span>
              </div>
              <button className="adm__user-logout" onClick={auth.logout} title="Sair"><Icon name="lock" size={14} /></button>
            </div>
          </div>
        </header>
        {section === 'dashboard'    && <AdminDashboard store={store} goto={goto} />}
        {section === 'products'     && <AdminProducts store={store} showToast={showToast} />}
        {section === 'content'      && <AdminContent showToast={showToast} />}
        {section === 'coupons'      && <AdminCoupons store={store} showToast={showToast} />}
        {section === 'orders'       && <AdminOrders />}
        {section === 'pix'          && <AdminPix showToast={showToast} />}
        {section === 'shipping'     && <AdminShipping showToast={showToast} />}
        {section === 'banners'      && <AdminBanners />}
        {section === 'marketing'    && <AdminMarketing showToast={showToast} />}
        {section === 'store'        && <AdminStore showToast={showToast} />}
        {section === 'account'      && <AdminAccount auth={auth} showToast={showToast} />}
      </section>
      {toast && (
        <div className={'adm__toast adm__toast--' + toast.kind}>
          <Icon name={toast.kind === 'ok' ? 'check' : 'info'} size={16} />
          {toast.msg}
        </div>
      )}
      <PublishBar showToast={showToast} />
    </main>
  );
}

// ═══════════════════════════════════════════════════════════════════
// PUBLISH BAR — botão fixo que publica mudanças no GitHub via /api/publish
// Detecta se há mudanças locais não publicadas e mostra um indicador.
// ═══════════════════════════════════════════════════════════════════
function PublishBar({ showToast }) {
  const [hasChanges, setHasChanges] = React.useState(false);
  const [publishing, setPublishing] = React.useState(false);
  const [showModal, setShowModal] = React.useState(false);
  const [adminKey, setAdminKey] = React.useState(() => localStorage.getItem('cc26.adm.publishKey') || '');
  const [rememberKey, setRememberKey] = React.useState(!!localStorage.getItem('cc26.adm.publishKey'));

  // Detecta mudanças não publicadas comparando localStorage com window.LIVE_DATA_FROM_SERVER
  const checkChanges = React.useCallback(() => {
    try {
      const server = window.LIVE_DATA_FROM_SERVER || {};
      const localProducts = JSON.parse(localStorage.getItem('cc26.adm.products') || 'null');
      const localCoupons  = JSON.parse(localStorage.getItem('cc26.adm.coupons')  || 'null');
      const localStore    = JSON.parse(localStorage.getItem('cc26.adm.store')    || 'null');
      const localShipping = JSON.parse(localStorage.getItem('cc26.adm.shipping') || 'null');
      const localBanners  = JSON.parse(localStorage.getItem('cc26.adm.banners')  || 'null');

      // Se há alguma edição local, considera como "tem mudança pendente"
      const any =
        (localProducts !== null && JSON.stringify(localProducts) !== JSON.stringify(server.products)) ||
        (localCoupons  !== null && JSON.stringify(localCoupons)  !== JSON.stringify(server.coupons)) ||
        (localStore    !== null && JSON.stringify(localStore)    !== JSON.stringify(server.store)) ||
        (localShipping !== null && JSON.stringify(localShipping) !== JSON.stringify(server.shipping)) ||
        (localBanners  !== null && JSON.stringify(localBanners)  !== JSON.stringify(server.banners));

      setHasChanges(any);
    } catch (e) {
      console.warn('[publish] erro detectando mudanças:', e);
    }
  }, []);

  React.useEffect(() => {
    checkChanges();
    // Re-checa quando o admin edita algo (evento que data.jsx dispara)
    const onChange = () => checkChanges();
    window.addEventListener('cc26:data-changed', onChange);
    window.addEventListener('storage', onChange);
    return () => {
      window.removeEventListener('cc26:data-changed', onChange);
      window.removeEventListener('storage', onChange);
    };
  }, [checkChanges]);

  const handlePublish = async () => {
    if (!adminKey) {
      alert('Informe a senha de publicação (configurada na Vercel como ADMIN_PUBLISH_KEY).');
      return;
    }
    setPublishing(true);
    try {
      // Monta o payload com tudo que está em localStorage
      const payload = {};
      const lsP = localStorage.getItem('cc26.adm.products');
      if (lsP) payload.products = JSON.parse(lsP);
      const lsC = localStorage.getItem('cc26.adm.coupons');
      if (lsC) payload.coupons = JSON.parse(lsC);
      const lsS = localStorage.getItem('cc26.adm.store');
      if (lsS) payload.store = JSON.parse(lsS);
      const lsSh = localStorage.getItem('cc26.adm.shipping');
      if (lsSh) payload.shipping = JSON.parse(lsSh);
      const lsB = localStorage.getItem('cc26.adm.banners');
      if (lsB) payload.banners = JSON.parse(lsB);
      const lsCt = localStorage.getItem('cc26.adm.content');
      if (lsCt) payload.content = JSON.parse(lsCt);

      const resp = await fetch('/api/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Key': adminKey,
        },
        body: JSON.stringify(payload),
      });
      const json = await resp.json();
      if (!resp.ok) {
        throw new Error(json.error || 'Erro desconhecido');
      }

      // Salva a senha se o admin marcou "lembrar"
      if (rememberKey) {
        localStorage.setItem('cc26.adm.publishKey', adminKey);
      } else {
        localStorage.removeItem('cc26.adm.publishKey');
      }

      showToast && showToast('✅ Publicado! Site atualiza em ~30s.');
      setShowModal(false);
      setHasChanges(false);
    } catch (e) {
      console.error('[publish] falhou:', e);
      alert('Erro ao publicar: ' + (e.message || e));
    } finally {
      setPublishing(false);
    }
  };

  if (!hasChanges && !showModal) return null;

  return (
    <>
      {/* Barra fixa no rodapé */}
      {hasChanges && (
        <div className="adm__publishbar">
          <div className="adm__publishbar-inner">
            <div className="adm__publishbar-msg">
              <span className="adm__publishbar-dot" />
              <strong>Você tem mudanças não publicadas.</strong>
              <span className="muted">Só você vê — clique em "Publicar" para enviar ao site.</span>
            </div>
            <button className="btn btn--gold" onClick={() => setShowModal(true)}>
              <Icon name="check" size={14} /> 🚀 Publicar mudanças
            </button>
          </div>
        </div>
      )}

      {/* Modal de confirmação */}
      {showModal && (
        <div className="adm__modal-bg" onClick={() => !publishing && setShowModal(false)}>
          <div className="adm__modal" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 8px' }}>🚀 Publicar mudanças no site</h3>
            <p className="muted" style={{ fontSize: 14, marginBottom: 16 }}>
              Isso vai sobrescrever os dados públicos do site com sua versão atual.
              Todos os visitantes verão as mudanças em ~30 segundos.
            </p>

            <div style={{ background: 'var(--paper, #FFF7E6)', padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 13 }}>
              <strong>O que será publicado:</strong>
              <ul style={{ margin: '6px 0 0', paddingLeft: 20 }}>
                {localStorage.getItem('cc26.adm.products') && <li>Produtos</li>}
                {localStorage.getItem('cc26.adm.coupons') && <li>Cupons</li>}
                {localStorage.getItem('cc26.adm.store') && <li>Dados da loja</li>}
                {localStorage.getItem('cc26.adm.shipping') && <li>Fretes</li>}
                {localStorage.getItem('cc26.adm.banners') && <li>Banners</li>}
                {localStorage.getItem('cc26.adm.content') && <li>Conteúdo</li>}
              </ul>
            </div>

            <Field label="Senha de publicação" col="12">
              <input
                type="password"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                placeholder="A senha configurada em ADMIN_PUBLISH_KEY na Vercel"
                disabled={publishing}
              />
            </Field>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, marginTop: 8 }}>
              <input
                type="checkbox"
                checked={rememberKey}
                onChange={(e) => setRememberKey(e.target.checked)}
                disabled={publishing}
              />
              Lembrar senha neste navegador
            </label>

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 20 }}>
              <button className="btn btn--ghost" onClick={() => setShowModal(false)} disabled={publishing}>
                Cancelar
              </button>
              <button className="btn btn--gold" onClick={handlePublish} disabled={publishing || !adminKey}>
                {publishing ? '⏳ Publicando...' : '🚀 Confirmar publicação'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── DASHBOARD ───────────────────────────────────────────────────
function AdminDashboard({ store, goto }) {
  const { products } = store;
  // Lê config de PIX direto do localStorage para alertar se não estiver pronta.
  const [pixCfg, setPixCfg] = React.useState(loadStoreConfig);
  React.useEffect(() => {
    const reload = () => setPixCfg(loadStoreConfig());
    window.addEventListener('storage', reload);
    return () => window.removeEventListener('storage', reload);
  }, []);
  const pixOk = !!(pixCfg.pixKey && pixCfg.beneficiary && pixCfg.city);

  const stats = [
    { label: 'Vendas hoje', value: 'R$ 18.420', delta: '+12%', good: true },
    { label: 'Pedidos hoje', value: '147', delta: '+8%', good: true },
    { label: 'Ticket médio', value: 'R$ 125,30', delta: '+3%', good: true },
    { label: 'Conversão', value: '4,8%', delta: '+0,4 pp', good: true },
  ];
  return (
    <div className="adm__body">
      {!pixOk && (
        <div className="adm__alert">
          <div>
            <strong>Configure sua chave PIX para começar a vender.</strong>
            <p className="muted" style={{ fontSize: 13, marginTop: 4 }}>
              O checkout gera o código PIX copia-e-cola e o QR Code direto no site, usando a sua chave PIX. Sem gateway, sem taxas extras — você recebe direto na sua conta.
            </p>
          </div>
          <button className="btn btn--gold btn--sm" onClick={() => goto('pix')}>Configurar PIX</button>
        </div>
      )}

      <div className="adm__statgrid">
        {stats.map((s) => (
          <div key={s.label} className="adm__stat">
            <div className="muted">{s.label}</div>
            <div className="adm__stat-v">{s.value}</div>
            <div className={'adm__stat-d' + (s.good ? ' is-good' : '')}>{s.delta} vs ontem</div>
          </div>
        ))}
      </div>

      <div className="adm__row">
        <div className="adm__card">
          <h3>Vendas dos últimos 14 dias</h3>
          <Chart />
        </div>
        <div className="adm__card">
          <h3>Top produtos</h3>
          <ul className="adm__top">
            {products.slice(0, 5).map((p, i) => (
              <li key={p.id}>
                <span className="adm__top-n">#{i + 1}</span>
                <div className="adm__top-art"><ProductImage product={p} /></div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="adm__top-name">{p.short}</div>
                  <div className="muted" style={{ fontSize: 12 }}>{200 - i * 22} vendidos · {BRL(p.price)}</div>
                </div>
                <div className="adm__top-bar"><span style={{ width: (90 - i * 12) + '%' }} /></div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function Chart() {
  const data = [42, 55, 38, 67, 71, 58, 80, 92, 76, 88, 95, 110, 102, 124];
  const max = Math.max(...data);
  return (
    <svg viewBox="0 0 600 200" className="chart">
      <defs>
        <linearGradient id="chartg" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#009C3B" stopOpacity="0.7" />
          <stop offset="1" stopColor="#009C3B" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 1, 2, 3].map((i) => (
        <line key={i} x1="0" x2="600" y1={40 + i * 40} y2={40 + i * 40} stroke="rgba(0,0,0,0.06)" />
      ))}
      {(() => {
        const pts = data.map((v, i) => [i * (600 / (data.length - 1)), 200 - (v / max) * 160]);
        const line = pts.map((p, i) => (i === 0 ? 'M' : 'L') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
        const area = line + ' L600 200 L0 200 Z';
        return (
          <g>
            <path d={area} fill="url(#chartg)" />
            <path d={line} fill="none" stroke="#009C3B" strokeWidth="2.5" />
            {pts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r="3" fill="#FFDF00" stroke="#009C3B" strokeWidth="2" />)}
          </g>
        );
      })()}
    </svg>
  );
}

// ─── PRODUTOS ────────────────────────────────────────────────────
function AdminProducts({ store, showToast }) {
  const { products, setProducts } = store;
  const [editing, setEditing] = React.useState(null); // 'new' | productId
  const [search, setSearch] = React.useState('');
  const [filterType, setFilterType] = React.useState('todas');

  const filtered = products.filter((p) => {
    if (search && !(p.name + p.short + p.id).toLowerCase().includes(search.toLowerCase())) return false;
    if (filterType !== 'todas' && p.type !== filterType) return false;
    return true;
  });

  const handleSave = (data) => {
    if (editing === 'new') {
      const id = (data.short || 'novo').toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 20) + '-' + Date.now().toString(36).slice(-4);
      setProducts((prev) => [{ ...data, id }, ...prev]);
      showToast('Produto criado com sucesso');
    } else {
      setProducts((prev) => prev.map((p) => (p.id === editing ? { ...p, ...data } : p)));
      showToast('Produto atualizado');
    }
    setEditing(null);
  };

  const handleDelete = (id) => {
    if (!confirm('Remover este produto? Esta ação não pode ser desfeita.')) return;
    setProducts((prev) => prev.filter((p) => p.id !== id));
    showToast('Produto removido', 'warn');
  };

  const editingProduct = editing === 'new'
    ? null
    : products.find((p) => p.id === editing);

  return (
    <div className="adm__body">
      <div className="adm__topbar">
        <div className="adm__filters">
          <input placeholder="Buscar produto, SKU…" value={search} onChange={(e) => setSearch(e.target.value)} />
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="todas">Todas categorias</option>
            {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <button className="btn btn--primary btn--sm" onClick={() => setEditing('new')}>+ Adicionar produto</button>
      </div>

      <div className="adm__card" style={{ padding: 0 }}>
        <table className="adm__table">
          <thead>
            <tr>
              <th></th>
              <th>Produto</th>
              <th>SKU</th>
              <th>Categoria</th>
              <th>Preço</th>
              <th>Estoque</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id}>
                <td>
                  <div className="adm__rowart">
                    {p.photo
                      ? <img src={p.photo} alt={p.short} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <ProductImage product={p} />}
                  </div>
                </td>
                <td>
                  <strong>{p.short}</strong>
                  <br />
                  <span className="muted" style={{ fontSize: 12 }}>{p.name}</span>
                </td>
                <td className="muted">{p.id.toUpperCase()}</td>
                <td>{p.type}</td>
                <td>
                  <strong>{BRL(p.price)}</strong>
                  {p.oldPrice && (
                    <>
                      <br />
                      <span className="muted" style={{ fontSize: 11, textDecoration: 'line-through' }}>{BRL(p.oldPrice)}</span>
                    </>
                  )}
                </td>
                <td>
                  <span className={p.stock > 30 ? '' : 'adm__lowstock'}>{p.stock} un</span>
                </td>
                <td>
                  <span className={'adm__pill adm__pill--' + (p.stock > 0 ? 'pago' : 'aguardando-pix')}>
                    {p.stock > 0 ? 'Ativo' : 'Sem estoque'}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn--ghost btn--sm" onClick={() => setEditing(p.id)}>Editar</button>
                    <button className="btn btn--ghost btn--sm adm__btn-danger" onClick={() => handleDelete(p.id)}>Excluir</button>
                  </div>
                </td>
              </tr>
            ))}
            {!filtered.length && (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: 40, color: 'var(--ink-2)' }}>
                  Nenhum produto encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editing && (
        <ProductEditor
          product={editingProduct}
          isNew={editing === 'new'}
          onSave={handleSave}
          onCancel={() => setEditing(null)}
        />
      )}
    </div>
  );
}

function ProductEditor({ product, isNew, onSave, onCancel }) {
  const blank = {
    short: '',
    name: '',
    type: TYPES[0],
    price: 0,
    oldPrice: 0,
    stock: 0,
    description: '',
    badge: '',
    photo: null,
    photos: [],
    cardTemplate: 'default',
    heroKicker: '',
    heroDesc: '',
    heroCta: '',
  };
  const [form, setForm] = React.useState(() => ({ ...blank, ...(product || {}) }));
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  // Comprime a imagem para no máximo 800px no maior lado e qualidade 0.72
  // antes de virar data URL. Reduz ~5x o tamanho de cada foto vs original.
  // Cada foto comprimida fica entre 60-200KB, permitindo 20-50 fotos no
  // localStorage de 5MB.
  const compressImage = (file, opts = {}) => new Promise((resolve, reject) => {
    const maxDim = opts.maxDim || 800;
    const quality = opts.quality || 0.72;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) { height = Math.round(height * maxDim / width); width = maxDim; }
          else { width = Math.round(width * maxDim / height); height = maxDim; }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext('2d');
        // Fundo branco pra fotos com transparência não virarem preto
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const handleFile = async (e, isMain = true) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      alert('Imagem maior que 8MB. Reduza o arquivo antes de enviar.');
      return;
    }
    try {
      const dataUrl = await compressImage(file);
      if (isMain) set('photo', dataUrl);
      else set('photos', [...(form.photos || []), dataUrl]);
    } catch (err) {
      console.error('[admin] falha ao processar imagem:', err);
      alert('Não foi possível processar essa imagem. Tente outro arquivo.');
    }
    // limpa o input para permitir re-selecionar o mesmo arquivo
    e.target.value = '';
  };

  const removePhoto = (idx) => {
    set('photos', form.photos.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.short.trim()) return alert('Nome curto é obrigatório.');
    if (!form.name.trim()) return alert('Nome completo é obrigatório.');
    if (form.price <= 0) return alert('Preço deve ser maior que zero.');
    onSave({
      ...form,
      price: parseFloat(form.price) || 0,
      oldPrice: parseFloat(form.oldPrice) || 0,
      stock: parseInt(form.stock, 10) || 0,
    });
  };

  return (
    <div className="adm__modal" onClick={onCancel}>
      <form className="adm__modal-inner" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <header className="adm__modal-head">
          <h2>{isNew ? 'Novo produto' : 'Editar produto'}</h2>
          <button type="button" className="adm__modal-close" onClick={onCancel}>
            <Icon name="close" size={18} />
          </button>
        </header>

        <div className="adm__modal-body">
          <div className="adm__editor-grid">
            {/* fotos */}
            <div className="adm__editor-photos">
              <label className="adm__photo-main">
                {form.photo
                  ? <img src={form.photo} alt="" />
                  : (
                    <div className="adm__photo-empty">
                      <Icon name="camera" size={36} />
                      <span>Clique para enviar foto principal</span>
                      <span className="muted" style={{ fontSize: 11 }}>JPG / PNG · até 4MB</span>
                    </div>
                  )}
                <input type="file" accept="image/*" hidden onChange={(e) => handleFile(e, true)} />
              </label>

              <div className="adm__photo-grid">
                {(form.photos || []).map((p, i) => (
                  <div key={i} className="adm__photo-thumb">
                    <img src={p} alt="" />
                    <button type="button" onClick={() => removePhoto(i)}>×</button>
                  </div>
                ))}
                <label className="adm__photo-add">
                  <Icon name="plus" size={18} />
                  <span>Adicionar</span>
                  <input type="file" accept="image/*" hidden onChange={(e) => handleFile(e, false)} />
                </label>
              </div>
            </div>

            {/* form */}
            <div className="adm__editor-fields">
              <div className="frm">
                <Field label="Nome curto" col="3">
                  <input value={form.short} onChange={(e) => set('short', e.target.value)} placeholder="Ex: Box Premium 40 Envelopes" />
                </Field>
                <Field label="Categoria" col="3">
                  <select value={form.type} onChange={(e) => set('type', e.target.value)}>
                    {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </Field>
                <Field label="Nome completo (vitrine)" col="6">
                  <input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Nome usado na página do produto" />
                </Field>
                <Field label="Preço (R$)" col="2">
                  <input type="number" step="0.01" value={form.price} onChange={(e) => set('price', e.target.value)} />
                </Field>
                <Field label="Preço de" col="2">
                  <input type="number" step="0.01" value={form.oldPrice} onChange={(e) => set('oldPrice', e.target.value)} />
                </Field>
                <Field label="Estoque" col="2">
                  <input type="number" value={form.stock} onChange={(e) => set('stock', e.target.value)} />
                </Field>
                <Field label="Selo (badge)" col="3">
                  <select value={form.badge || ''} onChange={(e) => set('badge', e.target.value)}>
                    <option value="">Nenhum</option>
                    <option value="Mais vendido">Mais vendido</option>
                    <option value="Pré-venda">Pré-venda</option>
                    <option value="Novidade">Novidade</option>
                    <option value="Premium">Premium</option>
                    <option value="Oferta">Oferta</option>
                  </select>
                </Field>
                <Field label="Cor base (placeholder)" col="3">
                  <input type="color" value={form.color || '#009C3B'} onChange={(e) => set('color', e.target.value)} />
                </Field>
                <Field label="Descrição" col="6">
                  <textarea rows="4" value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Descreva o produto, o que vai dentro, dimensões, etc." />
                </Field>
              </div>

              {/* ─── ESTILO DO CARD NA HOME ─── */}
              <div className="adm__card-template">
                <div className="adm__card-template-head">
                  <strong>Estilo do card na home</strong>
                  <span className="muted" style={{ fontSize: 12 }}>Como esse produto aparece destacado na vitrine</span>
                </div>
                <div className="adm__card-template-grid">
                  {[
                    { id: 'default', title: 'Padrão', desc: 'Aparece nos grids normais (1 coluna)', preview: 'default' },
                    { id: 'hero-green', title: 'Destaque Verde', desc: 'Banner duplo, fundo verde, botão amarelo (2 colunas)', preview: 'green' },
                    { id: 'hero-gold', title: 'Destaque Amarelo', desc: 'Banner duplo, fundo amarelo, botão navy (2 colunas)', preview: 'gold' },
                  ].map((opt) => {
                    const active = (form.cardTemplate || 'default') === opt.id;
                    return (
                      <label key={opt.id} className={'adm__template-opt' + (active ? ' is-on' : '')}>
                        <input
                          type="radio"
                          name="cardTemplate"
                          value={opt.id}
                          checked={active}
                          onChange={() => set('cardTemplate', opt.id)}
                          style={{ display: 'none' }}
                        />
                        <div className={'adm__template-preview adm__template-preview--' + opt.preview}>
                          {opt.preview === 'default' && (
                            <div className="adm__template-mock-default">
                              <div className="adm__template-mock-img" />
                              <div className="adm__template-mock-line" />
                              <div className="adm__template-mock-line adm__template-mock-line--sm" />
                            </div>
                          )}
                          {opt.preview !== 'default' && (
                            <div className="adm__template-mock-hero">
                              <div className="adm__template-mock-side">
                                <div className="adm__template-mock-pill" />
                                <div className="adm__template-mock-line adm__template-mock-line--big" />
                                <div className="adm__template-mock-btn" />
                              </div>
                              <div className="adm__template-mock-art" />
                            </div>
                          )}
                        </div>
                        <div className="adm__template-meta">
                          <strong>{opt.title}</strong>
                          <span className="muted" style={{ fontSize: 11 }}>{opt.desc}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>

                {(form.cardTemplate === 'hero-green' || form.cardTemplate === 'hero-gold') && (
                  <div className="frm" style={{ marginTop: 16 }}>
                    <Field label="Texto da tarja (kicker)" col="3">
                      <input
                        value={form.heroKicker || ''}
                        onChange={(e) => set('heroKicker', e.target.value)}
                        placeholder={form.cardTemplate === 'hero-green' ? 'PRÉ-VENDA' : 'DISPLAY'}
                        maxLength={20}
                      />
                    </Field>
                    <Field label="Texto do botão (CTA)" col="3">
                      <input
                        value={form.heroCta || ''}
                        onChange={(e) => set('heroCta', e.target.value)}
                        placeholder={form.cardTemplate === 'hero-green' ? 'Garantir o meu' : 'Quero a caixa'}
                        maxLength={28}
                      />
                    </Field>
                    <Field label="Descrição curta no destaque" col="6">
                      <input
                        value={form.heroDesc || ''}
                        onChange={(e) => set('heroDesc', e.target.value)}
                        placeholder="Ex: 500 figurinhas em uma só caixa. Despacho dia 1º."
                        maxLength={120}
                      />
                    </Field>
                    <div className="muted" style={{ fontSize: 12, gridColumn: '1 / -1', marginTop: -4 }}>
                      💡 Apenas os 2 primeiros produtos com destaque aparecerão na home. Os demais ficam visíveis nos grids normais.
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <footer className="adm__modal-foot">
          <button type="button" className="btn btn--ghost" onClick={onCancel}>Cancelar</button>
          <button type="submit" className="btn btn--primary">{isNew ? 'Criar produto' : 'Salvar alterações'}</button>
        </footer>
      </form>
    </div>
  );
}

// ─── CUPONS ──────────────────────────────────────────────────────
function AdminCoupons({ store, showToast }) {
  const { coupons, setCoupons } = store;
  const [editing, setEditing] = React.useState(null);

  const handleSave = (data) => {
    const code = data.code.toUpperCase().trim();
    if (!code) return alert('Código obrigatório.');
    setCoupons((prev) => {
      const existing = editing === 'new' ? -1 : prev.findIndex((c) => c.code === editing);
      const newCoupon = { ...data, code };
      if (existing >= 0) return prev.map((c, i) => (i === existing ? newCoupon : c));
      if (prev.find((c) => c.code === code)) {
        alert('Já existe um cupom com este código.');
        return prev;
      }
      return [newCoupon, ...prev];
    });
    showToast(editing === 'new' ? 'Cupom criado' : 'Cupom atualizado');
    setEditing(null);
  };

  const handleDelete = (code) => {
    if (!confirm('Remover este cupom?')) return;
    setCoupons((prev) => prev.filter((c) => c.code !== code));
    showToast('Cupom removido', 'warn');
  };

  const toggleActive = (code) => {
    setCoupons((prev) => prev.map((c) => (c.code === code ? { ...c, active: !c.active } : c)));
  };

  const editingCoupon = editing === 'new' ? null : coupons.find((c) => c.code === editing);

  return (
    <div className="adm__body">
      <div className="adm__topbar">
        <p className="muted" style={{ fontSize: 13, maxWidth: 600 }}>
          Códigos promocionais aplicados no carrinho. Suporte a desconto percentual, valor fixo e frete grátis. Ative ou desative sem precisar excluir.
        </p>
        <button className="btn btn--primary btn--sm" onClick={() => setEditing('new')}>+ Novo cupom</button>
      </div>

      <div className="adm__card" style={{ padding: 0 }}>
        <table className="adm__table">
          <thead>
            <tr>
              <th>Código</th>
              <th>Descrição</th>
              <th>Tipo</th>
              <th>Desconto</th>
              <th>Mínimo</th>
              <th>Usos</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((c) => (
              <tr key={c.code}>
                <td><strong style={{ fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.05em' }}>{c.code}</strong></td>
                <td>{c.label}</td>
                <td>
                  {c.off ? 'Percentual' : c.value ? 'Valor fixo' : c.freeShip ? 'Frete grátis' : '—'}
                </td>
                <td>
                  {c.off ? (c.off * 100).toFixed(0) + '%' : c.value ? BRL(c.value) : c.freeShip ? '🚚 Frete' : '—'}
                </td>
                <td>{c.min ? BRL(c.min) : '—'}</td>
                <td className="muted">{c.uses ?? 0}</td>
                <td>
                  <button className={'adm__toggle' + (c.active !== false ? ' is-on' : '')} onClick={() => toggleActive(c.code)}>
                    <span />
                  </button>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn--ghost btn--sm" onClick={() => setEditing(c.code)}>Editar</button>
                    <button className="btn btn--ghost btn--sm adm__btn-danger" onClick={() => handleDelete(c.code)}>Excluir</button>
                  </div>
                </td>
              </tr>
            ))}
            {!coupons.length && (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: 40, color: 'var(--ink-2)' }}>
                  Nenhum cupom criado ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editing && (
        <CouponEditor
          coupon={editingCoupon}
          isNew={editing === 'new'}
          onSave={handleSave}
          onCancel={() => setEditing(null)}
        />
      )}
    </div>
  );
}

function CouponEditor({ coupon, isNew, onSave, onCancel }) {
  const initial = {
    code: '',
    label: '',
    type: 'percent',
    percent: 10,
    value: 0,
    min: 0,
    expires: '',
    active: true,
  };
  if (coupon) {
    initial.code = coupon.code;
    initial.label = coupon.label || '';
    initial.min = coupon.min || 0;
    initial.expires = coupon.expires || '';
    initial.active = coupon.active !== false;
    if (coupon.off) { initial.type = 'percent'; initial.percent = Math.round(coupon.off * 100); }
    else if (coupon.value) { initial.type = 'value'; initial.value = coupon.value; }
    else if (coupon.freeShip) { initial.type = 'freeship'; }
  }
  const [form, setForm] = React.useState(initial);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      code: form.code,
      label: form.label,
      min: parseFloat(form.min) || 0,
      expires: form.expires || null,
      active: form.active,
      uses: coupon?.uses || 0,
    };
    if (form.type === 'percent') payload.off = (parseFloat(form.percent) || 0) / 100;
    else if (form.type === 'value') payload.value = parseFloat(form.value) || 0;
    else if (form.type === 'freeship') payload.freeShip = true;
    onSave(payload);
  };

  return (
    <div className="adm__modal" onClick={onCancel}>
      <form className="adm__modal-inner adm__modal-inner--narrow" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <header className="adm__modal-head">
          <h2>{isNew ? 'Novo cupom' : 'Editar cupom'}</h2>
          <button type="button" className="adm__modal-close" onClick={onCancel}><Icon name="close" size={18} /></button>
        </header>

        <div className="adm__modal-body">
          <div className="frm">
            <Field label="Código (sem espaços)" col="3">
              <input
                value={form.code}
                onChange={(e) => set('code', e.target.value.toUpperCase().replace(/\s/g, ''))}
                placeholder="EX: COPA15"
                style={{ fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.05em' }}
                disabled={!isNew}
              />
            </Field>
            <Field label="Descrição interna" col="3">
              <input value={form.label} onChange={(e) => set('label', e.target.value)} placeholder="Ex: 15% off coleção álbum" />
            </Field>

            <Field label="Tipo de desconto" col="6">
              <div className="adm__radiogroup">
                {[
                  ['percent', 'Percentual', 'Ex: 15% off'],
                  ['value', 'Valor fixo', 'Ex: R$ 30 off'],
                  ['freeship', 'Frete grátis', 'Zera o frete'],
                ].map(([id, label, hint]) => (
                  <label key={id} className={'adm__radio' + (form.type === id ? ' is-on' : '')}>
                    <input type="radio" name="ctype" checked={form.type === id} onChange={() => set('type', id)} />
                    <strong>{label}</strong>
                    <span className="muted">{hint}</span>
                  </label>
                ))}
              </div>
            </Field>

            {form.type === 'percent' && (
              <Field label="Percentual (%)" col="2">
                <input type="number" min="1" max="90" value={form.percent} onChange={(e) => set('percent', e.target.value)} />
              </Field>
            )}
            {form.type === 'value' && (
              <Field label="Valor (R$)" col="2">
                <input type="number" step="0.01" value={form.value} onChange={(e) => set('value', e.target.value)} />
              </Field>
            )}
            <Field label="Pedido mínimo (R$)" col={form.type === 'freeship' ? '3' : '2'}>
              <input type="number" step="0.01" value={form.min} onChange={(e) => set('min', e.target.value)} placeholder="0 = sem mínimo" />
            </Field>
            <Field label="Validade" col={form.type === 'freeship' ? '3' : '2'}>
              <input type="date" value={form.expires} onChange={(e) => set('expires', e.target.value)} />
            </Field>
          </div>

          <label className="chk" style={{ marginTop: 8 }}>
            <input type="checkbox" checked={form.active} onChange={(e) => set('active', e.target.checked)} />
            <span>Cupom ativo (disponível para uso no checkout)</span>
          </label>
        </div>

        <footer className="adm__modal-foot">
          <button type="button" className="btn btn--ghost" onClick={onCancel}>Cancelar</button>
          <button type="submit" className="btn btn--primary">{isNew ? 'Criar cupom' : 'Salvar'}</button>
        </footer>
      </form>
    </div>
  );
}

// ─── PAGAMENTO PIX — Configuração da chave PIX própria ───────────
// O checkout do site gera o código PIX (BR Code) e o QR Code direto no
// navegador, sem depender de gateway. Aqui o lojista informa a chave PIX,
// o nome do beneficiário e a cidade — esses 3 dados são embutidos no
// código gerado, e o cliente recebe o pagamento direto na sua conta.

function AdminPix({ showToast }) {
  // Lê configuração atual (compartilhada com AdminStore via 'cc26.adm.store')
  // já mesclando com o PIX padrão configurado neste arquivo.
  const loadCfg = loadStoreConfig;
  const [cfg, setCfg] = React.useState(loadCfg);
  const [touched, setTouched] = React.useState(false);
  const [saved, setSaved] = React.useState(false);

  const set = (k, v) => { setCfg((c) => ({ ...c, [k]: v })); setTouched(true); setSaved(false); };

  // Tipo de chave detectado automaticamente — ajuda o lojista a saber se digitou certo.
  const detectKeyType = (k) => {
    const s = String(k || '').trim();
    if (!s) return null;
    const onlyDigits = s.replace(/\D/g, '');
    if (/^[\w.+-]+@[\w-]+\.[\w.-]+$/.test(s)) return 'E-mail';
    if (onlyDigits.length === 11 && s.length <= 14) return 'CPF';
    if (onlyDigits.length === 14) return 'CNPJ';
    if (onlyDigits.length === 11 || onlyDigits.length === 13) return 'Telefone';
    if (/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(s)) return 'Aleatória';
    if (s.length >= 32 && /^[a-zA-Z0-9-]+$/.test(s)) return 'Aleatória';
    return 'Verificar formato';
  };
  const keyType = detectKeyType(cfg.pixKey);

  const validate = () => {
    if (!cfg.pixKey || !cfg.pixKey.trim()) return 'Informe a chave PIX.';
    if (!cfg.beneficiary || !cfg.beneficiary.trim()) return 'Informe o nome do beneficiário (até 25 caracteres, sem acentos).';
    if (!cfg.city || !cfg.city.trim()) return 'Informe a cidade do beneficiário (até 15 caracteres).';
    if (cfg.beneficiary.length > 25) return 'O nome do beneficiário deve ter no máximo 25 caracteres.';
    if (cfg.city.length > 15) return 'A cidade deve ter no máximo 15 caracteres.';
    return null;
  };

  const handleSave = () => {
    const err = validate();
    if (err) { alert(err); return; }
    try {
      // Mescla com qualquer outra config da loja (nome, cnpj, etc.)
      const current = loadCfg();
      const merged = { ...current, ...cfg };
      saveStoreConfig(merged);
      setSaved(true);
      setTouched(false);
      showToast && showToast('Configurações de PIX salvas');
    } catch (e) {
      alert('Não foi possível salvar. Tente novamente.');
    }
  };

  // Geração do exemplo de código PIX (preview do que o cliente verá).
  const previewCode = React.useMemo(() => {
    if (!cfg.pixKey || !cfg.beneficiary || !cfg.city) return null;
    try {
      // Usa temporariamente uma cópia de window.STORE para gerar o preview
      const prevStore = (typeof window !== 'undefined') ? window.STORE : null;
      if (typeof window !== 'undefined') {
        window.STORE = {
          ...(prevStore || {}),
          pixKey: cfg.pixKey,
          beneficiary: cfg.beneficiary,
          city: cfg.city,
          state: cfg.state || PIX_DEFAULT_CONFIG.state,
        };
      }
      const code = window.buildPixCode(10.00, 'PREVIEWADM' + Date.now().toString(36).toUpperCase().slice(-6));
      if (typeof window !== 'undefined' && prevStore) window.STORE = prevStore;
      return code;
    } catch (e) {
      return null;
    }
  }, [cfg.pixKey, cfg.beneficiary, cfg.city, cfg.state]);

  const copyCode = async () => {
    if (!previewCode) return;
    try {
      await navigator.clipboard.writeText(previewCode);
      showToast && showToast('Código PIX copiado');
    } catch (e) {}
  };

  return (
    <div className="adm__body">
      <p className="muted" style={{ fontSize: 14, maxWidth: 760, lineHeight: 1.55 }}>
        O checkout gera um código PIX (BR Code) com QR Code de verdade, lido por qualquer aplicativo de banco.
        O dinheiro cai <strong>direto na sua conta</strong> — sem gateway, sem taxas extras, sem intermediários.
      </p>

      <div className="adm__card" style={{ marginTop: 16 }}>
        <h3>Sua chave PIX</h3>
        <div className="frm">
          <Field label="Chave PIX" col="6">
            <input
              value={cfg.pixKey || ''}
              onChange={(e) => set('pixKey', e.target.value)}
              placeholder="Ex.: meuemail@dominio.com, CPF, CNPJ, telefone ou chave aleatória"
              style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13 }}
            />
            {keyType && (
              <small className="muted" style={{ fontSize: 11, marginTop: 4, display: 'block' }}>
                Tipo detectado: <strong>{keyType}</strong>
              </small>
            )}
          </Field>

          <Field label="Nome do beneficiário (até 25 caracteres)" col="3">
            <input
              value={cfg.beneficiary || ''}
              onChange={(e) => set('beneficiary', e.target.value.slice(0, 25))}
              placeholder="Como aparece na sua conta"
              maxLength={25}
            />
            <small className="muted" style={{ fontSize: 11, marginTop: 4, display: 'block' }}>
              {(cfg.beneficiary || '').length}/25 — sem acentos, vai aparecer no app do banco do cliente.
            </small>
          </Field>

          <Field label="Cidade (até 15 caracteres)" col="2">
            <input
              value={cfg.city || ''}
              onChange={(e) => set('city', e.target.value.slice(0, 15).toUpperCase())}
              placeholder="Ex.: SAO PAULO"
              maxLength={15}
            />
            <small className="muted" style={{ fontSize: 11, marginTop: 4, display: 'block' }}>
              {(cfg.city || '').length}/15 — em letras maiúsculas, sem acentos.
            </small>
          </Field>

          <Field label="Estado (UF)" col="1">
            <input
              value={cfg.state || ''}
              onChange={(e) => set('state', e.target.value.slice(0, 2).toUpperCase())}
              placeholder="SP"
              maxLength={2}
            />
            <small className="muted" style={{ fontSize: 11, marginTop: 4, display: 'block' }}>
              Estado salvo no painel.
            </small>
          </Field>
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'flex-end' }}>
          <button className="btn btn--gold" disabled={!touched} onClick={handleSave}>
            <Icon name="check" size={14} /> Salvar configurações
          </button>
        </div>
        {saved && (
          <div className="adm__alert" style={{ marginTop: 12, background: '#e8f5ec', borderColor: '#009C3B' }}>
            <div>
              <strong>Configurações salvas.</strong>
              <p className="muted" style={{ fontSize: 13, marginTop: 4 }}>
                A loja já está usando esta chave PIX no checkout. Faça um pedido de teste para confirmar.
              </p>
            </div>
          </div>
        )}
      </div>

      {previewCode && (
        <div className="adm__card" style={{ marginTop: 16 }}>
          <h3>Pré-visualização (R$ 10,00)</h3>
          <p className="muted" style={{ fontSize: 13, marginBottom: 12 }}>
            Assim seu cliente vai ver o código copia-e-cola no checkout. Você pode testar lendo o QR no app de outra conta sua.
          </p>
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div style={{ width: 220, flexShrink: 0 }}>
              <PixQR text={previewCode} size={220} />
            </div>
            <div style={{ flex: 1, minWidth: 280 }}>
              <textarea
                readOnly
                value={previewCode}
                style={{
                  width: '100%', minHeight: 120, padding: 12,
                  fontFamily: 'JetBrains Mono, monospace', fontSize: 11,
                  border: '1px solid var(--line)', borderRadius: 8, resize: 'vertical',
                  background: '#f7f3ea',
                }}
              />
              <button className="btn btn--ghost btn--sm" style={{ marginTop: 8 }} onClick={copyCode}>
                <Icon name="copy" size={14} /> Copiar código
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="adm__card" style={{ marginTop: 16 }}>
        <h3>Como funciona o fluxo PIX</h3>
        <ol style={{ lineHeight: 1.8, fontSize: 14, paddingLeft: 22 }}>
          <li>Cliente finaliza o checkout e escolhe pagar com PIX.</li>
          <li>O site gera o QR Code e o código copia-e-cola usando os dados acima.</li>
          <li>Cliente paga pelo app do banco — o dinheiro cai direto na sua conta.</li>
          <li>Cliente clica em <strong>"Já paguei"</strong> e o pedido fica como <em>"Pago (aguardando conferência)"</em>.</li>
          <li>Você confere o extrato bancário e, em <strong>Pedidos</strong>, muda o status para <em>"Pago"</em>.</li>
          <li>Continua o fluxo normal: separação → despachado → entregue.</li>
        </ol>
        <div className="adm__alert" style={{ marginTop: 12 }}>
          <div>
            <strong>Importante:</strong>
            <p className="muted" style={{ fontSize: 13, marginTop: 4 }}>
              Como não há integração com banco, a confirmação do pagamento é manual — você precisa
              conferir o extrato. Para confirmação automática, seria necessário contratar uma API
              bancária (ex.: PIX dos bancos, Asaas, Efí/Gerencianet) com webhook autenticado.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── PEDIDOS / FRETES / BANNERS / LOJA ───────────────────────────
function AdminOrders() {
  const [orders, setOrders] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState(null);
  const [filter, setFilter] = React.useState('Todos');
  const [search, setSearch] = React.useState('');
  const [openMsg, setOpenMsg] = React.useState(null); // { order, kind }
  const [tracking, setTracking] = React.useState('');
  const [paymentModal, setPaymentModal] = React.useState(null); // { order }
  const [paymentLoading, setPaymentLoading] = React.useState(false);
  const [paymentResult, setPaymentResult] = React.useState(null); // { paidLink, message }
  const [adminKey, setAdminKey] = React.useState(() => localStorage.getItem('cc26.adm.publishKey') || '');

  // Carrega pedidos do servidor (todos os dispositivos)
  // Cai pro localStorage se servidor falhar (modo offline/sem auth)
  const loadOrders = React.useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const key = localStorage.getItem('cc26.adm.publishKey') || adminKey;
      if (!key) {
        // Sem senha → cai pro localStorage local
        const local = JSON.parse(localStorage.getItem('cc26.orders') || '[]');
        setOrders(local);
        setLoadError('Sem senha admin — exibindo apenas pedidos locais. Marque pago em qualquer pedido pra digitar a senha.');
        setLoading(false);
        return;
      }
      const resp = await fetch('/api/list-orders', {
        headers: { 'X-Admin-Key': key },
        cache: 'no-store',
      });
      if (resp.status === 401) {
        setLoadError('Senha de admin incorreta. Clique em "Confirmar Pagamento" pra atualizar.');
        const local = JSON.parse(localStorage.getItem('cc26.orders') || '[]');
        setOrders(local);
      } else if (!resp.ok) {
        throw new Error('HTTP ' + resp.status);
      } else {
        const json = await resp.json();
        if (json.ok && Array.isArray(json.orders)) {
          setOrders(json.orders);
          // sincroniza no localStorage para uso offline
          try { localStorage.setItem('cc26.orders', JSON.stringify(json.orders)); } catch (e) {}
        }
      }
    } catch (e) {
      console.warn('[admin] falha ao listar pedidos:', e);
      setLoadError('Erro ao buscar pedidos do servidor: ' + (e.message || e));
      const local = JSON.parse(localStorage.getItem('cc26.orders') || '[]');
      setOrders(local);
    } finally {
      setLoading(false);
    }
  }, [adminKey]);

  React.useEffect(() => { loadOrders(); }, [loadOrders]);

  // Marca um pedido como pago no servidor (commit em paid-orders.json)
  // E só então envia o link "/pedido-confirmado?order_id=X" para o cliente.
  const handleMarkPaid = async () => {
    if (!paymentModal || !paymentModal.order) return;
    if (!adminKey) {
      alert('Informe a senha de admin (a mesma do botão Publicar).');
      return;
    }
    setPaymentLoading(true);
    setPaymentResult(null);
    try {
      const o = paymentModal.order;
      const resp = await fetch('/api/mark-paid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Admin-Key': adminKey },
        body: JSON.stringify({
          order: {
            id: o.id,
            total: o.total,
            items: o.items,
            customer: {
              name: o.address && o.address.name,
              email: o.address && o.address.email,
              phone: o.address && o.address.phone,
            },
          },
        }),
      });
      const json = await resp.json();
      if (!resp.ok || !json.ok) {
        throw new Error(json.error || 'Falha ao marcar pago');
      }
      // Salva a senha pra próximas vezes
      try { localStorage.setItem('cc26.adm.publishKey', adminKey); } catch (e) {}
      // Atualiza local
      updateStatus(o.id, 'Pago');
      setPaymentResult({
        paidLink: window.location.origin + json.paidLink,
        message: json.message || 'Pedido marcado como pago.',
        alreadyPaid: !!json.alreadyPaid,
      });
      // Recarrega pedidos do servidor pra ver o novo status
      setTimeout(loadOrders, 1500);
    } catch (e) {
      alert('Erro: ' + (e.message || e));
    } finally {
      setPaymentLoading(false);
    }
  };

  // Pedidos demo (caso ainda não haja vendas reais) — só para ilustração
  const demoOrders = [
    { id: 'CC26-401287', address: { name: 'Marina Silveira', phone: '11987654321' }, items: [{ product: { short: 'Combo Torcedor' }, qty: 1, price: 549.8 }], total: 549.8, status: 'Em separação', payment: 'pix', shipping: 'SEDEX — Correios', date: Date.now() - 12 * 60 * 1000 },
    { id: 'CC26-401286', address: { name: 'Diego Ramos', phone: '21998765432' }, items: [{ product: { short: 'Mega Box 100' }, qty: 1, price: 379.9 }], total: 379.9, status: 'Pago', payment: 'card', shipping: 'PAC — Correios', date: Date.now() - 24 * 60 * 1000 },
    { id: 'CC26-401285', address: { name: 'Pedro H. Costa', phone: '11976543210' }, items: [{ product: { short: 'Kit Álbum + 24 Envelopes' }, qty: 1, price: 299.8 }], total: 299.8, status: 'Despachado', payment: 'pix', shipping: 'SEDEX — Correios', date: Date.now() - 60 * 60 * 1000 },
    { id: 'CC26-401284', address: { name: 'Ana Paula Reis', phone: '11965432109' }, items: [{ product: { short: 'Álbum Capa Dura' }, qty: 1, price: 49.9 }], total: 49.9, status: 'Aguardando Pix', payment: 'pix', shipping: 'PAC — Correios', date: Date.now() - 90 * 60 * 1000 },
  ];
  const list = orders.length > 0 ? orders : demoOrders;

  const filtered = list.filter((o) => {
    if (filter !== 'Todos' && o.status !== filter) return false;
    if (search && !(`${o.id} ${o.address?.name || ''}`.toLowerCase().includes(search.toLowerCase()))) return false;
    return true;
  });

  const updateStatus = (id, newStatus) => {
    const updated = list.map((o) => o.id === id ? { ...o, status: newStatus } : o);
    setOrders(updated);
    localStorage.setItem('cc26.orders', JSON.stringify(updated));
  };

  return (
    <div className="adm__body">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: 14, background: 'var(--paper, #FFF7E6)', border: '2px solid currentColor', borderRadius: 10, marginBottom: 16, fontSize: 13 }}>
        <div>
          💡 <strong>Como confirmar uma venda:</strong> quando o cliente PIX, clique em <strong>💰 Confirmar Pagamento</strong> ao lado do pedido. Isso vai disparar a conversão Purchase no Meta/TikTok/Google Ads e gerar um link único pra mandar pro cliente confirmar.
        </div>
        <button className="btn btn--ghost btn--sm" onClick={loadOrders} disabled={loading} style={{ flexShrink: 0 }}>
          {loading ? '⏳' : '🔄'} Atualizar
        </button>
      </div>
      {loadError && (
        <div style={{ padding: '10px 14px', background: '#FFE0E0', border: '2px solid #C8102E', borderRadius: 8, marginBottom: 16, fontSize: 13 }}>
          ⚠️ {loadError}
        </div>
      )}
      <div className="adm__filters">
        <input placeholder="Buscar pedido ou cliente…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option>Todos</option>
          <option>Aguardando Pix</option>
          <option>Pago</option>
          <option>Em separação</option>
          <option>Despachado</option>
          <option>Entregue</option>
        </select>
      </div>
      {filtered.length === 0 && (
        <div className="adm__empty" style={{ padding: 60, textAlign: 'center' }}>
          <Icon name="package" size={36} />
          <p style={{ marginTop: 12, color: '#666' }}>Nenhum pedido encontrado.</p>
        </div>
      )}
      {filtered.length > 0 && (
        <div className="adm__card" style={{ padding: 0 }}>
          <table className="adm__table">
            <thead>
              <tr><th>Pedido</th><th>Cliente</th><th>Pagamento</th><th>Total</th><th>Status</th><th>Mensagens</th><th></th></tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr key={o.id}>
                  <td>
                    <strong>{o.id}</strong>
                    {o.date && <><br /><span className="muted" style={{ fontSize: 11 }}>{new Date(o.date).toLocaleString('pt-BR')}</span></>}
                  </td>
                  <td>
                    {o.address?.name || '—'}
                    {o.address?.phone && <><br /><span className="muted" style={{ fontSize: 11 }}>{o.address.phone}</span></>}
                  </td>
                  <td className="muted">{o.payment === 'pix' ? 'Pix' : 'Cartão (WhatsApp)'}</td>
                  <td><strong>{BRL(o.total)}</strong></td>
                  <td>
                    <select
                      className="adm__statusel"
                      value={o.status}
                      onChange={(e) => updateStatus(o.id, e.target.value)}
                    >
                      <option>Aguardando Pix</option>
                      <option>Pago</option>
                      <option>Em separação</option>
                      <option>Despachado</option>
                      <option>Entregue</option>
                      <option>Cancelado</option>
                    </select>
                  </td>
                  <td>
                    <div className="adm__waactions">
                      {o.status !== 'Pago' && o.status !== 'Em separação' && o.status !== 'Despachado' && o.status !== 'Entregue' && (
                        <button
                          className="adm__waicon"
                          title="Confirmar pagamento → dispara Purchase nos pixels"
                          style={{ background: '#FFDF00', color: '#0F0F0F', fontWeight: 700 }}
                          onClick={() => { setPaymentResult(null); setPaymentModal({ order: o }); }}
                        >
                          💰 Confirmar Pagamento
                        </button>
                      )}
                      <button
                        className="adm__waicon"
                        title="Confirmar pedido"
                        onClick={() => sendWhatsAppToCustomer(o, 'confirmed')}
                      >
                        <Icon name="whatsapp" size={14} color="#25D366" /> Confirmar
                      </button>
                      <button
                        className="adm__waicon"
                        title="Avisar despacho"
                        onClick={() => setOpenMsg({ order: o, kind: 'shipped' })}
                      >
                        📦 Despachado
                      </button>
                      <button
                        className="adm__waicon"
                        title="Confirmar entrega"
                        onClick={() => sendWhatsAppToCustomer(o, 'delivered')}
                      >
                        ✅ Entregue
                      </button>
                    </div>
                  </td>
                  <td><button className="btn btn--ghost btn--sm">Detalhes</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── MODAL CONFIRMAR PAGAMENTO ── */}
      {paymentModal && (
        <div className="adm__modal" onClick={() => !paymentLoading && setPaymentModal(null)}>
          <div className="adm__modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 560 }}>
            <button className="adm__modal-x" onClick={() => !paymentLoading && setPaymentModal(null)} disabled={paymentLoading}>×</button>

            {!paymentResult ? (
              <>
                <h3>💰 Confirmar pagamento</h3>
                <p className="muted" style={{ fontSize: 13, marginBottom: 12 }}>
                  Você está prestes a marcar o pedido <strong>{paymentModal.order.id}</strong> como pago.
                </p>
                <div style={{ background: 'var(--paper, #FFF7E6)', padding: 12, borderRadius: 8, marginBottom: 14, fontSize: 13 }}>
                  <strong>O que vai acontecer:</strong>
                  <ol style={{ margin: '6px 0 0', paddingLeft: 20 }}>
                    <li>Pedido vai pra <code>paid-orders.json</code> no GitHub</li>
                    <li>Status do pedido vira <strong>"Pago"</strong></li>
                    <li>Um link único é gerado: <code>/pedido-confirmado?order_id={paymentModal.order.id}</code></li>
                    <li>Você envia esse link ao cliente pelo WhatsApp</li>
                    <li>Quando o cliente abrir: <strong>Purchase dispara no Meta, TikTok e Google Ads</strong> 🎯</li>
                  </ol>
                </div>
                <p style={{ fontSize: 13, marginBottom: 10 }}>
                  <strong>Cliente:</strong> {paymentModal.order.address?.name || '—'}<br />
                  <strong>Valor:</strong> {BRL(paymentModal.order.total)}<br />
                  <strong>WhatsApp:</strong> {paymentModal.order.address?.phone || '—'}
                </p>
                <Field label="Senha de admin (mesma do botão Publicar)">
                  <input
                    type="password"
                    value={adminKey}
                    onChange={(e) => setAdminKey(e.target.value)}
                    placeholder="ADMIN_PUBLISH_KEY"
                    disabled={paymentLoading}
                  />
                </Field>
                <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'flex-end' }}>
                  <button className="btn btn--ghost" onClick={() => setPaymentModal(null)} disabled={paymentLoading}>
                    Cancelar
                  </button>
                  <button className="btn btn--gold" onClick={handleMarkPaid} disabled={paymentLoading || !adminKey}>
                    {paymentLoading ? '⏳ Marcando...' : '💰 Sim, marcar como pago'}
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3>✅ Pagamento registrado!</h3>
                {paymentResult.alreadyPaid && (
                  <p className="muted" style={{ fontSize: 13 }}>Este pedido já estava marcado como pago anteriormente.</p>
                )}
                <p style={{ fontSize: 14, marginBottom: 14 }}>
                  Envie esse link para o cliente pelo WhatsApp:
                </p>
                <div style={{ background: '#F0F8E0', border: '2px solid #009C3B', padding: 12, borderRadius: 8, marginBottom: 14, wordBreak: 'break-all', fontSize: 13, fontFamily: 'JetBrains Mono, monospace' }}>
                  {paymentResult.paidLink}
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
                  <button
                    className="btn btn--ghost btn--sm"
                    onClick={() => {
                      navigator.clipboard.writeText(paymentResult.paidLink);
                      alert('Link copiado!');
                    }}
                  >
                    📋 Copiar link
                  </button>
                  <button
                    className="btn btn--gold btn--sm"
                    onClick={() => {
                      const phone = (paymentModal.order.address?.phone || '').replace(/\D/g, '');
                      const msg = encodeURIComponent(
                        `Olá ${paymentModal.order.address?.name || ''}! 🎉\n\n` +
                        `Confirmamos o seu pagamento do pedido *${paymentModal.order.id}*.\n\n` +
                        `Acesse aqui pra ver a confirmação:\n${paymentResult.paidLink}\n\n` +
                        `Seu pedido já entrou na fila de separação. Obrigado pela compra!`
                      );
                      window.open(`https://wa.me/${phone}?text=${msg}`, '_blank', 'noopener,noreferrer');
                    }}
                  >
                    <Icon name="whatsapp" size={14} /> Enviar pelo WhatsApp
                  </button>
                </div>
                <p className="muted" style={{ fontSize: 12 }}>
                  💡 Quando o cliente abrir esse link, os pixels disparam o evento Purchase. Aguarde uns 30 segundos depois de "Confirmar Pagamento" pra Vercel fazer o deploy.
                </p>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 12 }}>
                  <button className="btn btn--gold" onClick={() => { setPaymentModal(null); setPaymentResult(null); }}>
                    Fechar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {openMsg && (
        <div className="adm__modal" onClick={() => setOpenMsg(null)}>
          <div className="adm__modal-box" onClick={(e) => e.stopPropagation()}>
            <button className="adm__modal-x" onClick={() => setOpenMsg(null)}>×</button>
            <h3>Avisar despacho — {openMsg.order.id}</h3>
            <p className="muted" style={{ fontSize: 13, marginBottom: 16 }}>
              Cliente: <strong>{openMsg.order.address?.name}</strong> ·
              WhatsApp: <strong>{openMsg.order.address?.phone}</strong>
            </p>
            <Field label="Código de rastreio (opcional)">
              <input
                value={tracking}
                onChange={(e) => setTracking(e.target.value)}
                placeholder="Ex.: BR123456789BR"
              />
            </Field>
            <div className="adm__msgpreview">
              <strong>Pré-visualização:</strong>
              <pre>{buildWhatsAppOrderShipped(openMsg.order, tracking)}</pre>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'flex-end' }}>
              <button className="btn btn--ghost" onClick={() => setOpenMsg(null)}>Cancelar</button>
              <button
                className="btn btn--gold"
                onClick={() => {
                  sendWhatsAppToCustomer(openMsg.order, 'shipped', tracking);
                  if (tracking) updateStatus(openMsg.order.id, 'Despachado');
                  setOpenMsg(null);
                  setTracking('');
                }}
              >
                <Icon name="whatsapp" size={14} /> Abrir WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AdminShipping({ showToast }) {
  // Carrega config atual do localStorage
  const loadCfg = () => {
    try { return JSON.parse(localStorage.getItem('cc26.adm.shipping') || '{}'); }
    catch (e) { return {}; }
  };
  const SEED_RATES = (typeof window !== 'undefined' && window.SHIPPING_RATES) || {};
  const SEED_CONFIG = (typeof window !== 'undefined' && window.SHIPPING_CONFIG) || { freeShipMin: 49.99, freeShipEnabled: true };

  const initialState = (() => {
    const saved = loadCfg();
    return {
      rates: saved.rates || JSON.parse(JSON.stringify(SEED_RATES)),
      config: saved.config || { ...SEED_CONFIG },
    };
  })();

  const [rates, setRates] = React.useState(initialState.rates);
  const [config, setConfig] = React.useState(initialState.config);
  const [touched, setTouched] = React.useState(false);

  const updateRate = (key, field, value) => {
    setRates((r) => ({ ...r, [key]: { ...r[key], [field]: value } }));
    setTouched(true);
  };

  const updateConfig = (field, value) => {
    setConfig((c) => ({ ...c, [field]: value }));
    setTouched(true);
  };

  const handleSave = () => {
    try {
      // sanitiza preços
      const cleanRates = {};
      for (const k of Object.keys(rates)) {
        const r = rates[k];
        cleanRates[k] = {
          ...r,
          price: parseFloat(r.price) || 0,
          enabled: r.enabled !== false,
        };
      }
      const cleanConfig = {
        freeShipMin: parseFloat(config.freeShipMin) || 0,
        freeShipEnabled: !!config.freeShipEnabled,
      };
      localStorage.setItem('cc26.adm.shipping', JSON.stringify({
        rates: cleanRates, config: cleanConfig,
      }));
      // Atualiza o window pra refletir na vitrine sem reload
      if (typeof window !== 'undefined') {
        window.SHIPPING_RATES = cleanRates;
        window.SHIPPING_CONFIG = cleanConfig;
        window.dispatchEvent(new CustomEvent('cc26:data-changed', { detail: { key: 'cc26.adm.shipping' } }));
      }
      setTouched(false);
      showToast && showToast('Fretes atualizados');
    } catch (e) {
      alert('Não foi possível salvar. Tente novamente.');
    }
  };

  return (
    <div className="adm__body">
      <p className="muted" style={{ fontSize: 14, maxWidth: 760, lineHeight: 1.55 }}>
        Configure os valores e prazos de cada modalidade de frete. As alterações entram em vigor
        no checkout assim que você salvar.
      </p>

      <div className="adm__card" style={{ marginTop: 16 }}>
        <h3>🎉 Frete grátis automático</h3>
        <div className="frm">
          <Field label="Valor mínimo do carrinho (R$)" col="3">
            <input
              type="number"
              step="0.01"
              min="0"
              value={config.freeShipMin}
              onChange={(e) => updateConfig('freeShipMin', e.target.value)}
            />
          </Field>
          <Field label="Status" col="3">
            <label className="chk">
              <input
                type="checkbox"
                checked={!!config.freeShipEnabled}
                onChange={(e) => updateConfig('freeShipEnabled', e.target.checked)}
              />
              <span>{config.freeShipEnabled ? 'Ativado' : 'Desativado'}</span>
            </label>
          </Field>
        </div>
        <small className="muted" style={{ fontSize: 12, display: 'block', marginTop: 4 }}>
          Quando o subtotal do carrinho atingir esse valor, todos os fretes ficam GRÁTIS automaticamente.
        </small>
      </div>

      <div className="adm__card" style={{ marginTop: 16 }}>
        <h3>Modalidades de frete</h3>
        <div className="adm__shiplist">
          {Object.entries(rates).map(([k, s]) => (
            <div key={k} className="adm__shipcard">
              <div className="adm__shipcard-h">
                <Icon name="truck" size={20} />
                <strong>{s.name}</strong>
                {s.restrictTo && s.restrictTo.state && (
                  <span className="adm__sidebadge">{s.restrictTo.state} apenas</span>
                )}
              </div>
              <div className="frm" style={{ marginTop: 12 }}>
                <Field label="Nome exibido" col="6">
                  <input value={s.name || ''} onChange={(e) => updateRate(k, 'name', e.target.value)} />
                </Field>
                <Field label="Preço (R$)" col="2">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={s.price}
                    onChange={(e) => updateRate(k, 'price', e.target.value)}
                  />
                </Field>
                <Field label="Prazo" col="4">
                  <input
                    value={s.days || ''}
                    onChange={(e) => updateRate(k, 'days', e.target.value)}
                    placeholder="Ex.: 2 a 4 dias úteis"
                  />
                </Field>
              </div>
              <label className="chk" style={{ marginTop: 8 }}>
                <input
                  type="checkbox"
                  checked={s.enabled !== false}
                  onChange={(e) => updateRate(k, 'enabled', e.target.checked)}
                />
                <span>Disponível para o cliente</span>
              </label>
              {s.restrictTo && s.restrictTo.state && (
                <small className="muted" style={{ fontSize: 11, display: 'block', marginTop: 4 }}>
                  ⚠️ Esta opção só aparece para clientes do estado {s.restrictTo.state}.
                </small>
              )}
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'flex-end' }}>
        <button className="btn btn--gold" disabled={!touched} onClick={handleSave}>
          <Icon name="check" size={14} /> Salvar configurações de frete
        </button>
      </div>
    </div>
  );
}

// ─── CONTEÚDO (Tarja superior + reset) ───────────────────────────
function AdminContent({ showToast }) {
  const DEFAULT_TOPBAR = {
    enabled: true,
    messages: [
      { icon: '🚚', text: 'FRETE GRÁTIS acima de R$ 49,99', enabled: true },
      { icon: '📦', text: 'Compre até 14h e enviamos hoje', enabled: true },
      { icon: '🔒', text: 'Pagamento 100% seguro', enabled: true },
    ],
  };

  const loadCfg = () => {
    try {
      const stored = JSON.parse(localStorage.getItem('cc26.adm.topbar') || 'null');
      if (stored && Array.isArray(stored.messages)) return stored;
      return DEFAULT_TOPBAR;
    } catch (e) { return DEFAULT_TOPBAR; }
  };

  const [cfg, setCfg] = React.useState(loadCfg);
  const [touched, setTouched] = React.useState(false);

  const set = (updater) => { setCfg(updater); setTouched(true); };

  const setMessage = (idx, key, value) => {
    set((c) => ({
      ...c,
      messages: c.messages.map((m, i) => (i === idx ? { ...m, [key]: value } : m)),
    }));
  };

  const handleSave = () => {
    try {
      // sanitiza: remove mensagens totalmente vazias antes de salvar
      const sanitized = {
        ...cfg,
        messages: cfg.messages.map((m) => ({
          icon: (m.icon || '').slice(0, 4),
          text: (m.text || '').slice(0, 60),
          enabled: m.enabled !== false,
        })),
      };
      localStorage.setItem('cc26.adm.topbar', JSON.stringify(sanitized));
      // notifica o site (header) pra atualizar sem reload
      window.dispatchEvent(new CustomEvent('cc26:topbar', { detail: sanitized }));
      setTouched(false);
      showToast && showToast('Tarja salva — atualize a aba do site pra ver');
    } catch (e) {
      alert('Não foi possível salvar a tarja.');
    }
  };

  const handleReset = () => {
    if (!confirm('Voltar a tarja para os valores padrão? Suas mensagens atuais serão perdidas.')) return;
    setCfg(DEFAULT_TOPBAR);
    localStorage.removeItem('cc26.adm.topbar');
    window.dispatchEvent(new CustomEvent('cc26:topbar', { detail: DEFAULT_TOPBAR }));
    setTouched(false);
    showToast && showToast('Tarja resetada ao padrão');
  };

  const handleResetAll = () => {
    const msg = 'Resetar TUDO ao padrão de fábrica?\n\n'
      + '• Tarja superior voltará às 3 mensagens originais\n'
      + '• Templates de produto voltarão ao padrão (Mega Box / Display 50)\n'
      + '• Demais conteúdos editáveis serão zerados\n\n'
      + 'Pedidos, cupons, fretes e dados de PIX NÃO serão afetados.';
    if (!confirm(msg)) return;
    if (!confirm('Tem certeza? Esta ação não pode ser desfeita.')) return;
    try {
      localStorage.removeItem('cc26.adm.topbar');
      // Para os templates de produto: chama window.PRODUCTS_RESET_TEMPLATES se existir
      if (window.PRODUCTS_RESET_TEMPLATES) {
        try { window.PRODUCTS_RESET_TEMPLATES(); } catch (e) { /* ignore */ }
      }
      setCfg(DEFAULT_TOPBAR);
      window.dispatchEvent(new CustomEvent('cc26:topbar', { detail: DEFAULT_TOPBAR }));
      window.dispatchEvent(new CustomEvent('cc26:data-changed', { detail: { key: 'cc26.adm.products' } }));
      showToast && showToast('Conteúdo restaurado ao padrão');
    } catch (e) { alert('Falha ao resetar.'); }
  };

  return (
    <div className="adm__body">
      {/* TARJA SUPERIOR */}
      <div className="adm__card">
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
          <div>
            <h3 style={{ margin: 0 }}>Tarja superior do site</h3>
            <p className="muted" style={{ fontSize: 13, marginTop: 4 }}>
              As 3 mensagens que aparecem acima do logo (faixa verde-amarelo-azul). Use pra promos rápidas, campanhas e selos de confiança.
            </p>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap' }}>
            <input
              type="checkbox"
              checked={cfg.enabled !== false}
              onChange={(e) => set((c) => ({ ...c, enabled: e.target.checked }))}
            />
            Tarja ativa
          </label>
        </div>

        <div className="adm__topbar-list">
          {cfg.messages.map((m, i) => (
            <div key={i} className={'adm__topbar-row' + (m.enabled === false ? ' is-off' : '')}>
              <div className="adm__topbar-num">{i + 1}</div>
              <div className="adm__topbar-fields">
                <input
                  className="adm__topbar-icon"
                  value={m.icon || ''}
                  onChange={(e) => setMessage(i, 'icon', e.target.value)}
                  placeholder="🚚"
                  maxLength={4}
                  aria-label={`Ícone da mensagem ${i + 1}`}
                />
                <input
                  className="adm__topbar-text"
                  value={m.text || ''}
                  onChange={(e) => setMessage(i, 'text', e.target.value)}
                  placeholder="Sua mensagem aqui (até 60 caracteres)"
                  maxLength={60}
                  aria-label={`Texto da mensagem ${i + 1}`}
                />
              </div>
              <label className="adm__topbar-toggle">
                <input
                  type="checkbox"
                  checked={m.enabled !== false}
                  onChange={(e) => setMessage(i, 'enabled', e.target.checked)}
                />
                <span>Mostrar</span>
              </label>
            </div>
          ))}
        </div>

        {/* Preview */}
        <div className="adm__topbar-preview" aria-hidden>
          <div className="adm__topbar-preview-label">Pré-visualização</div>
          <div className={'adm__topbar-preview-bar' + (cfg.enabled === false ? ' is-off' : '')}>
            {cfg.messages.filter((m) => m.enabled !== false && (m.icon || m.text)).map((m, i) => (
              <span key={i}>{m.icon} {m.text}</span>
            ))}
            {cfg.enabled === false && <span style={{ opacity: 0.6 }}>Tarja desativada — não aparecerá no site</span>}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          <button className="btn btn--ghost btn--sm" onClick={handleReset}>
            Resetar tarja ao padrão
          </button>
          <button className="btn btn--gold" disabled={!touched} onClick={handleSave}>
            <Icon name="check" size={14} /> Salvar tarja
          </button>
        </div>
      </div>

      {/* TEMPLATES DE PRODUTO — informativo */}
      <div className="adm__card" style={{ marginTop: 16 }}>
        <h3>Templates de card de produto</h3>
        <p className="muted" style={{ fontSize: 13, marginTop: 4, marginBottom: 12 }}>
          Os destaques verde e amarelo da home (Mega Box / Caixa Display) agora são <strong>configuráveis por produto</strong>.
          Para escolher o template de cada item, vá em <a onClick={() => { location.hash = '#products'; }} style={{ cursor: 'pointer', color: 'var(--blue)', textDecoration: 'underline' }}>Produtos → Editar</a> e role até "Estilo do card na home".
        </p>
        <div className="adm__hint-box">
          <strong>💡 Como funciona</strong>
          <ul style={{ margin: '8px 0 0 18px', padding: 0, fontSize: 13, lineHeight: 1.6 }}>
            <li><strong>Padrão:</strong> aparece nos grids normais junto com os outros produtos.</li>
            <li><strong>Destaque Verde:</strong> banner duplo, fundo verde, botão amarelo.</li>
            <li><strong>Destaque Amarelo:</strong> banner duplo, fundo amarelo, botão navy.</li>
            <li>Apenas os <strong>2 primeiros produtos</strong> com destaque aparecem na home (1 verde + 1 amarelo é o ideal).</li>
            <li>Se nenhum produto tiver destaque, a seção não aparece.</li>
          </ul>
        </div>
      </div>

      {/* ESPAÇO LOCAL + OTIMIZAÇÃO DE FOTOS */}
      <AdminStorage showToast={showToast} />

      {/* RESET GERAL */}
      <div className="adm__card adm__card--danger" style={{ marginTop: 16 }}>
        <h3 style={{ color: '#B53A3A' }}>Resetar conteúdo ao padrão</h3>
        <p className="muted" style={{ fontSize: 13, marginTop: 4, marginBottom: 12 }}>
          Volta a tarja superior e os templates dos produtos seed (Mega Box / Display 50) ao estado original.
          <br /><strong>Não afeta:</strong> pedidos, cupons, fretes, configurações de PIX, dados da loja ou produtos novos que você criou.
        </p>
        <button className="btn btn--ghost btn--sm" onClick={handleResetAll} style={{ borderColor: '#E0AAAA', color: '#B53A3A' }}>
          ⚠️ Resetar tudo ao padrão
        </button>
      </div>
    </div>
  );
}


// ─── ADMIN STORAGE (medidor de espaço + otimização de fotos) ────────
function AdminStorage({ showToast }) {
  const QUOTA = 5 * 1024 * 1024; // 5 MB padrão dos navegadores
  const [usage, setUsage] = React.useState(() => measureStorage());
  const [busy, setBusy] = React.useState(false);

  function measureStorage() {
    let total = 0;
    const detail = {};
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (!k) continue;
        const v = localStorage.getItem(k) || '';
        const size = (k.length + v.length) * 2; // UTF-16
        total += size;
        if (k.startsWith('cc26')) detail[k] = size;
      }
    } catch (e) { /* ignore */ }
    return { total, detail };
  }

  const refresh = () => setUsage(measureStorage());

  const pct = Math.min(100, Math.round((usage.total / QUOTA) * 100));
  const usedMB = (usage.total / 1024 / 1024).toFixed(2);
  const status = pct > 90 ? 'crit' : pct > 70 ? 'warn' : 'ok';

  // Otimiza todas as fotos do localStorage recomprimindo agressivamente
  const handleOptimize = async () => {
    if (!confirm('Otimizar todas as fotos dos produtos?\n\nVai recomprimir as fotos existentes pra liberar espaço. A qualidade visual fica praticamente igual, mas o tamanho cai pela metade.\n\nO processo leva alguns segundos.')) return;
    setBusy(true);
    try {
      const products = JSON.parse(localStorage.getItem('cc26.adm.products') || '[]');
      const optimized = [];
      for (const p of products) {
        const out = { ...p };
        if (typeof p.photo === 'string' && p.photo.startsWith('data:image')) {
          out.photo = await reCompressDataUrl(p.photo);
        }
        if (Array.isArray(p.photos)) {
          const newPhotos = [];
          for (const ph of p.photos) {
            if (typeof ph === 'string' && ph.startsWith('data:image')) {
              newPhotos.push(await reCompressDataUrl(ph));
            } else newPhotos.push(ph);
          }
          out.photos = newPhotos;
        }
        optimized.push(out);
      }
      const before = usage.total;
      localStorage.setItem('cc26.adm.products', JSON.stringify(optimized));
      // Atualiza window.PRODUCTS pra refletir na vitrine
      if (typeof window !== 'undefined') {
        window.PRODUCTS = optimized;
        window.dispatchEvent(new CustomEvent('cc26:data-changed', { detail: { key: 'cc26.adm.products' } }));
      }
      refresh();
      const after = measureStorage().total;
      const saved = ((before - after) / 1024).toFixed(0);
      showToast && showToast(`Otimizado! ${saved} KB liberados.`);
    } catch (e) {
      console.error('[storage] erro ao otimizar:', e);
      alert('Erro ao otimizar fotos. Tente novamente em alguns segundos.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={'adm__card adm__storage adm__storage--' + status} style={{ marginTop: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h3 style={{ margin: 0 }}>Espaço local do navegador</h3>
          <p className="muted" style={{ fontSize: 13, marginTop: 4 }}>
            O painel guarda produtos, pedidos e configurações no navegador (limite ~5MB).
            Quando passa de 90%, fotos novas não conseguem ser salvas.
          </p>
        </div>
        <div style={{ textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: 14 }}>
          <div style={{ fontSize: 22, color: status === 'crit' ? '#B53A3A' : status === 'warn' ? '#B57A1A' : '#00873B' }}>
            {usedMB} MB
          </div>
          <div className="muted" style={{ fontSize: 11 }}>{pct}% de 5 MB</div>
        </div>
      </div>

      <div className="adm__storage-bar">
        <div className="adm__storage-bar-fill" style={{ width: pct + '%' }} />
      </div>

      {/* Detalhamento por chave */}
      <details style={{ marginTop: 12, fontSize: 12 }}>
        <summary style={{ cursor: 'pointer', fontWeight: 600 }}>Ver detalhes (o que está ocupando espaço)</summary>
        <table style={{ width: '100%', marginTop: 10, fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}>
          <tbody>
            {Object.entries(usage.detail)
              .sort((a, b) => b[1] - a[1])
              .map(([k, s]) => (
                <tr key={k} style={{ borderBottom: '1px dashed #eee' }}>
                  <td style={{ padding: '4px 0' }}>{k}</td>
                  <td style={{ padding: '4px 0', textAlign: 'right' }}>{(s / 1024).toFixed(1)} KB</td>
                </tr>
              ))}
          </tbody>
        </table>
      </details>

      <div style={{ display: 'flex', gap: 8, marginTop: 14, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
        <button className="btn btn--ghost btn--sm" onClick={refresh}>↻ Atualizar</button>
        <button className="btn btn--gold btn--sm" onClick={handleOptimize} disabled={busy}>
          {busy ? 'Otimizando...' : '⚡ Otimizar fotos existentes'}
        </button>
      </div>
    </div>
  );
}

// Recomprime uma data URL existente. Retorna nova data URL menor.
async function reCompressDataUrl(dataUrl, maxDim = 700, quality = 0.7) {
  return new Promise((resolve) => {
    try {
      const img = new Image();
      img.onload = () => {
        let { naturalWidth: w, naturalHeight: h } = img;
        if (w > maxDim || h > maxDim) {
          if (w > h) { h = Math.round(h * maxDim / w); w = maxDim; }
          else { w = Math.round(w * maxDim / h); h = maxDim; }
        }
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    } catch (e) {
      resolve(dataUrl);
    }
  });
}

function AdminBanners() {
  return (
    <div className="adm__body">
      <div className="adm__card">
        <h3>Banners da home</h3>
        <div className="adm__bannerlist">
          {['Hero principal — Coleção Copa 2026', 'Pré-venda Mega Box', 'Combo Torcedor Premium', 'Black November'].map((b, i) => (
            <div key={b} className="adm__banner">
              <div className="adm__banner-thumb" style={{ background: 'linear-gradient(135deg, #009C3B 0%, #00B844 100%)' }}>
                <span style={{ fontFamily: 'Anton, sans-serif', fontSize: 32, color: '#FFDF00' }}>0{i + 1}</span>
              </div>
              <div style={{ flex: 1 }}>
                <strong>{b}</strong>
                <div className="muted" style={{ fontSize: 12 }}>Posição: {i + 1} · Ativo · {(12402 - i * 2300).toLocaleString('pt-BR')} cliques</div>
              </div>
              <button className="btn btn--ghost btn--sm">Editar</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// ADMIN MARKETING & ANÚNCIOS
// As IDs reais ficam em VARIÁVEIS DE AMBIENTE DA VERCEL — esta tela
// apenas MOSTRA o que está em produção (lido de window.MARKETING_CONFIG_FROM_ENV)
// e permite TESTAR localmente sobrescrevendo via localStorage.
// ═══════════════════════════════════════════════════════════════════
function AdminMarketing({ showToast }) {
  // Config "viva" — o que está realmente carregado nos pixels agora
  const live = (window.MKT && window.MKT.loadConfig()) || null;
  // Config das env vars da Vercel (production)
  const fromEnv = (typeof window !== 'undefined' && window.MARKETING_CONFIG_FROM_ENV) || null;

  // Aba ativa: 'production' (env vars) ou 'override' (localStorage local)
  const [tab, setTab] = React.useState('production');

  // Para a aba "override" (teste local), permite o admin editar valores
  // que SOBRESCREVEM as env vars apenas no navegador dele
  const initial = (live) || {
    enabled: true,
    googleAds: { enabled: true, conversionId: '', purchaseLabel: '', leadLabel: '' },
    metaPixel: { enabled: true, pixelId: '', testEventCode: '' },
    tiktok:    { enabled: true, pixelId: '' },
    debugMode: false,
  };
  const [cfg, setCfg] = React.useState(initial);
  const [touched, setTouched] = React.useState(false);
  const [testResult, setTestResult] = React.useState(null);

  const set = (path, value) => {
    setCfg((c) => {
      const next = JSON.parse(JSON.stringify(c));
      const keys = path.split('.');
      let obj = next;
      for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]];
      obj[keys[keys.length - 1]] = value;
      return next;
    });
    setTouched(true);
  };

  const saveOverride = () => {
    if (window.MKT && window.MKT.saveConfig(cfg)) {
      setTouched(false);
      showToast && showToast('Override local salvo (apenas neste navegador)');
      try { window.MKT.initialize(); } catch (e) {}
    } else {
      alert('Não foi possível salvar. Tente novamente.');
    }
  };

  const clearOverride = () => {
    if (!confirm('Remover o override local? Os pixels voltarão a usar as IDs das env vars da Vercel.')) return;
    try {
      localStorage.removeItem('cc26.adm.marketing');
      showToast && showToast('Override removido. Recarregue a página.');
      setTimeout(() => location.reload(), 800);
    } catch (e) { alert('Falha ao limpar.'); }
  };

  const fireTest = () => {
    setTestResult(null);
    if (!window.MKT) {
      setTestResult({ error: 'MKT não carregado. Recarregue a página.' });
      return;
    }
    setTimeout(() => {
      const result = window.MKT.fireTestEvent();
      setTestResult(result);
    }, 800);
  };

  const hasEnv = fromEnv && (fromEnv.googleAds?.conversionId || fromEnv.metaPixel?.pixelId || fromEnv.tiktok?.pixelId);
  const hasOverride = (() => {
    try { return !!localStorage.getItem('cc26.adm.marketing'); } catch (e) { return false; }
  })();

  // Render compacto de IDs (mascara para não vazar 100% se alguém ver tela)
  const mask = (s) => {
    if (!s) return <span className="muted">não configurado</span>;
    if (s.length <= 8) return s;
    return s.slice(0, 4) + '••••' + s.slice(-4);
  };

  return (
    <div className="adm__body">

      {/* Header / Status */}
      <div className="adm__card">
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 280 }}>
            <h3 style={{ margin: 0 }}>Marketing & Anúncios</h3>
            <p className="muted" style={{ fontSize: 13, margin: '6px 0 0' }}>
              As IDs ficam guardadas em <strong>variáveis de ambiente da Vercel</strong> — assim valem para
              todos os visitantes do site. Para editar, vá em{' '}
              <strong>Vercel → seu projeto → Settings → Environment Variables</strong>.
            </p>
          </div>
          <div style={{
            padding: '10px 14px', borderRadius: 10,
            background: live && live.enabled ? '#D9F5E3' : '#FFE0E0',
            border: '2px solid var(--ink, #0F0F0F)',
            fontFamily: 'JetBrains Mono, monospace', fontSize: 12, fontWeight: 700,
          }}>
            {live && live.enabled ? '✅ TRACKING ATIVO' : '⛔ TRACKING DESLIGADO'}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="adm__card" style={{ marginTop: 16, padding: 0, overflow: 'hidden' }}>
        <div style={{ display: 'flex', borderBottom: '2px solid currentColor' }}>
          <button
            className="adm__tab"
            style={{
              flex: 1, padding: '14px 18px', border: 0,
              background: tab === 'production' ? 'var(--accent, #FFDF00)' : 'transparent',
              cursor: 'pointer', fontWeight: 700, textAlign: 'left',
            }}
            onClick={() => setTab('production')}
          >
            🌍 EM PRODUÇÃO (Vercel env)
          </button>
          <button
            className="adm__tab"
            style={{
              flex: 1, padding: '14px 18px', border: 0, borderLeft: '2px solid currentColor',
              background: tab === 'override' ? 'var(--accent, #FFDF00)' : 'transparent',
              cursor: 'pointer', fontWeight: 700, textAlign: 'left',
            }}
            onClick={() => setTab('override')}
          >
            🧪 OVERRIDE LOCAL (teste no seu navegador)
          </button>
        </div>

        {/* ──────────── TAB: PRODUCTION ──────────── */}
        {tab === 'production' && (
          <div style={{ padding: 24 }}>
            {!hasEnv && (
              <div style={{ padding: '12px 16px', background: '#FFE0E0', border: '2px solid #C8102E', borderRadius: 10, marginBottom: 16, fontSize: 14 }}>
                ⚠️ <strong>Nenhuma ID configurada nas env vars da Vercel.</strong><br />
                Os pixels não vão carregar para os visitantes. Configure as variáveis abaixo na Vercel.
              </div>
            )}

            <h4 style={{ margin: '0 0 12px' }}>📊 Google Ads</h4>
            <table style={{ width: '100%', fontSize: 13, fontFamily: 'JetBrains Mono, monospace', marginBottom: 24 }}>
              <tbody>
                <tr style={{ borderBottom: '1px dashed currentColor' }}>
                  <td style={{ padding: '8px 6px', width: '40%' }}><code>GOOGLE_ADS_CONVERSION_ID</code></td>
                  <td style={{ padding: '8px 6px' }}>{mask(fromEnv?.googleAds?.conversionId)}</td>
                </tr>
                <tr style={{ background: 'rgba(255,223,0,0.12)' }}>
                  <td style={{ padding: '8px 6px' }}>
                    <code>GOOGLE_ADS_PURCHASE_LABEL</code>
                    <br /><small className="muted">conv. principal — Compra paga</small>
                  </td>
                  <td style={{ padding: '8px 6px' }}>{mask(fromEnv?.googleAds?.purchaseLabel)}</td>
                </tr>
              </tbody>
            </table>

            <h4 style={{ margin: '0 0 12px' }}>📘 Meta Pixel</h4>
            <table style={{ width: '100%', fontSize: 13, fontFamily: 'JetBrains Mono, monospace', marginBottom: 24 }}>
              <tbody>
                <tr style={{ borderBottom: '1px dashed currentColor' }}>
                  <td style={{ padding: '8px 6px', width: '40%' }}><code>META_PIXEL_ID</code></td>
                  <td style={{ padding: '8px 6px' }}>{mask(fromEnv?.metaPixel?.pixelId)}</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px 6px' }}><code>META_PIXEL_TEST_CODE</code></td>
                  <td style={{ padding: '8px 6px' }}>{mask(fromEnv?.metaPixel?.testEventCode)}</td>
                </tr>
              </tbody>
            </table>

            <h4 style={{ margin: '0 0 12px' }}>🎵 TikTok Pixel</h4>
            <table style={{ width: '100%', fontSize: 13, fontFamily: 'JetBrains Mono, monospace', marginBottom: 24 }}>
              <tbody>
                <tr>
                  <td style={{ padding: '8px 6px', width: '40%' }}><code>TIKTOK_PIXEL_ID</code></td>
                  <td style={{ padding: '8px 6px' }}>{mask(fromEnv?.tiktok?.pixelId)}</td>
                </tr>
              </tbody>
            </table>

            <div style={{ padding: 14, background: 'var(--paper, #FFF7E6)', border: '2px solid currentColor', borderRadius: 10 }}>
              <strong style={{ fontSize: 13 }}>📝 Como editar:</strong>
              <ol style={{ fontSize: 13, lineHeight: 1.6, margin: '8px 0 0', paddingLeft: 20 }}>
                <li>Acesse <a href="https://vercel.com/dashboard" target="_blank" rel="noopener">vercel.com/dashboard</a></li>
                <li>Selecione seu projeto (Álbum Copa)</li>
                <li>Vá em <strong>Settings → Environment Variables</strong></li>
                <li>Adicione/edite as variáveis acima (escopo: Production)</li>
                <li>Volte na aba <strong>Deployments</strong> e clique em <strong>"Redeploy"</strong> no último deploy</li>
                <li>Aguarde ~30 segundos e recarregue esta página com Ctrl+Shift+R</li>
              </ol>
            </div>

            {hasOverride && (
              <div style={{ marginTop: 16, padding: '10px 14px', background: '#FFF4B0', border: '2px solid #0F0F0F', borderRadius: 10, fontSize: 13 }}>
                ℹ️ <strong>Você tem um override local ativo</strong> que está sobrescrevendo as env vars neste navegador.
                {' '}<button onClick={clearOverride} style={{ marginLeft: 6, background: 'transparent', border: 'none', textDecoration: 'underline', cursor: 'pointer', fontWeight: 700 }}>Remover override</button>
              </div>
            )}
          </div>
        )}

        {/* ──────────── TAB: OVERRIDE LOCAL ──────────── */}
        {tab === 'override' && (
          <div style={{ padding: 24 }}>
            <div style={{ padding: '12px 16px', background: '#FFF4B0', border: '2px solid #0F0F0F', borderRadius: 10, marginBottom: 18, fontSize: 13 }}>
              🧪 <strong>Override LOCAL — só funciona no seu navegador.</strong><br />
              Use para testar IDs antes de configurar na Vercel. Os visitantes do site continuam usando as IDs de produção (env vars). Para tirar o override, clique em "Remover override" no fim da página.
            </div>

            <div className="frm">
              <Field label="Google Ads — ID de Conversão (AW-...)" col="6">
                <input value={cfg.googleAds.conversionId} onChange={(e) => set('googleAds.conversionId', e.target.value)} placeholder="AW-1234567890" />
              </Field>
              <Field label="Google Ads — Etiqueta de Compra" col="6">
                <input value={cfg.googleAds.purchaseLabel} onChange={(e) => set('googleAds.purchaseLabel', e.target.value)} placeholder="abcdEFGhiJ" />
              </Field>
              <Field label="Meta Pixel — ID" col="6">
                <input value={cfg.metaPixel.pixelId} onChange={(e) => set('metaPixel.pixelId', e.target.value)} placeholder="123456789012345" />
              </Field>
              <Field label="Meta Pixel — Test Event Code" col="6">
                <input value={cfg.metaPixel.testEventCode} onChange={(e) => set('metaPixel.testEventCode', e.target.value)} placeholder="TEST12345" />
              </Field>
              <Field label="TikTok Pixel — ID" col="6">
                <input value={cfg.tiktok.pixelId} onChange={(e) => set('tiktok.pixelId', e.target.value)} placeholder="C123ABC456DEF" />
              </Field>
              <Field label="Modo Debug" col="6">
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 8 }}>
                  <input type="checkbox" checked={!!cfg.debugMode} onChange={(e) => set('debugMode', e.target.checked)} />
                  <span style={{ fontSize: 13 }}>Imprimir eventos no console</span>
                </label>
              </Field>
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'space-between', flexWrap: 'wrap' }}>
              <button className="btn btn--ghost btn--sm" onClick={clearOverride} disabled={!hasOverride}>
                <Icon name="trash" size={14} /> Remover override
              </button>
              <button className="btn btn--gold" disabled={!touched} onClick={saveOverride}>
                <Icon name="check" size={14} /> Salvar override local
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ──────────── TESTE ──────────── */}
      <div className="adm__card" style={{ marginTop: 16 }}>
        <h3 style={{ margin: 0 }}>🛠️ Disparar evento de teste</h3>
        <p className="muted" style={{ fontSize: 13, margin: '6px 0 12px' }}>
          Manda um evento "teste" para todos os pixels ativos. Confira nas extensões{' '}
          <em>Tag Assistant</em>, <em>Meta Pixel Helper</em> e <em>TikTok Pixel Helper</em>.
        </p>
        <button className="btn btn--ghost btn--sm" onClick={fireTest}>
          <Icon name="check" size={14} /> Disparar evento de teste
        </button>
        {testResult && (
          <div style={{ marginTop: 12, fontSize: 13, fontFamily: 'JetBrains Mono, monospace' }}>
            {testResult.error ? (
              <div style={{ color: '#C8102E' }}>❌ {testResult.error}</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div>{testResult.googleAds ? '✅' : '⚪️'} Google Ads {testResult.googleAds ? 'enviado' : '(sem ID)'}</div>
                <div>{testResult.metaPixel ? '✅' : '⚪️'} Meta Pixel {testResult.metaPixel ? 'enviado' : '(sem ID)'}</div>
                <div>{testResult.tiktok ? '✅' : '⚪️'} TikTok Pixel {testResult.tiktok ? 'enviado' : '(sem ID)'}</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ──────────── GUIA ──────────── */}
      <div className="adm__card" style={{ marginTop: 16 }}>
        <h3 style={{ margin: 0 }}>📖 Eventos disparados automaticamente</h3>
        <p className="muted" style={{ fontSize: 13, margin: '6px 0 12px' }}>
          Funil minimalista — eventos do meio do funil são silenciados pra que apenas a conversão real (compra paga) seja registrada:
        </p>
        <table style={{ width: '100%', fontSize: 12, fontFamily: 'JetBrains Mono, monospace' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid currentColor' }}>
              <th style={{ textAlign: 'left', padding: 6 }}>Quando</th>
              <th style={{ textAlign: 'left', padding: 6 }}>Google Ads</th>
              <th style={{ textAlign: 'left', padding: 6 }}>Meta Pixel</th>
              <th style={{ textAlign: 'left', padding: 6 }}>TikTok</th>
            </tr>
          </thead>
          <tbody>
            <tr><td style={{ padding: 6 }}>Abrir página</td><td>page_view</td><td>PageView</td><td>Pageview</td></tr>
            <tr><td style={{ padding: 6 }}>Ver produto</td><td>view_item</td><td>ViewContent</td><td>ViewContent</td></tr>
            <tr><td style={{ padding: 6 }}>Adicionar carrinho</td><td>add_to_cart</td><td>AddToCart</td><td>AddToCart</td></tr>
            <tr><td style={{ padding: 6 }}>Iniciar checkout</td><td>begin_checkout</td><td>InitiateCheckout</td><td>InitiateCheckout</td></tr>
            <tr style={{ opacity: 0.5 }}>
              <td style={{ padding: 6 }}>PIX gerado</td>
              <td colSpan={3} style={{ padding: 6 }}>— silenciado (modo minimalista) —</td>
            </tr>
            <tr style={{ opacity: 0.5 }}>
              <td style={{ padding: 6 }}>Click WhatsApp</td>
              <td colSpan={3} style={{ padding: 6 }}>— silenciado (modo minimalista) —</td>
            </tr>
            <tr style={{ background: 'rgba(255,223,0,0.4)', fontWeight: 700 }}>
              <td style={{ padding: 6 }}>💰 Admin confirma pagamento ★<br /><small>(cliente abre /pedido-confirmado)</small></td>
              <td>conversion (PURCHASE_LABEL)<br />+ purchase</td>
              <td>Purchase</td>
              <td>CompletePayment</td>
            </tr>
          </tbody>
        </table>
        <p className="muted" style={{ fontSize: 12, marginTop: 8 }}>
          ★ <strong>ÚNICA conversão de venda.</strong> Só dispara quando você marca como pago e o cliente abre o link <code>/pedido-confirmado?order_id=XXX</code>. Com dedup por order_id.
        </p>
      </div>
    </div>
  );
}

function AdminStore({ showToast }) {
  // Compartilha o mesmo storage do AdminPix (cc26.adm.store) para que
  // todos os dados editáveis da loja fiquem em um único objeto.
  const loadCfg = loadStoreConfig;
  const SEED = (typeof window !== 'undefined' && window.STORE) || {};
  const [cfg, setCfg] = React.useState(() => ({
    storeName: 'Álbum Copa 2026',
    cnpj: SEED.cnpj || '00.000.000/0001-00',
    contactEmail: 'contato@albumcopa.com',
    whatsappDisplay: SEED.whatsappDisplay || '(11) 98765-4321',
    whatsapp: SEED.whatsapp || '5511987654321',
    address: 'Av. Paulista, 1000 — São Paulo/SP',
    ...loadCfg(),
  }));
  const [touched, setTouched] = React.useState(false);

  const set = (k, v) => { setCfg((c) => ({ ...c, [k]: v })); setTouched(true); };

  const handleSave = () => {
    try {
      // Mescla com a config existente para preservar os campos do AdminPix.
      const current = loadCfg();
      const merged = { ...current, ...cfg };
      // Mantém o whatsapp (digitos puros) sincronizado com o whatsappDisplay
      const digits = String(cfg.whatsappDisplay || '').replace(/\D/g, '');
      if (digits) merged.whatsapp = digits.length === 10 || digits.length === 11 ? '55' + digits : digits;
      saveStoreConfig(merged);
      setTouched(false);
      showToast && showToast('Dados da loja salvos');
    } catch (e) {
      alert('Não foi possível salvar. Tente novamente.');
    }
  };

  return (
    <div className="adm__body">
      <div className="adm__card">
        <h3>Dados da loja</h3>
        <p className="muted" style={{ fontSize: 13, marginBottom: 12 }}>
          Esses dados aparecem no rodapé do site, nas mensagens automáticas de WhatsApp e no checkout.
        </p>
        <div className="frm">
          <Field label="Nome da loja" col="6">
            <input value={cfg.storeName || ''} onChange={(e) => set('storeName', e.target.value)} />
          </Field>
          <Field label="CNPJ" col="3">
            <input value={cfg.cnpj || ''} onChange={(e) => set('cnpj', e.target.value)} placeholder="00.000.000/0001-00" />
          </Field>
          <Field label="E-mail de contato" col="3">
            <input value={cfg.contactEmail || ''} onChange={(e) => set('contactEmail', e.target.value)} placeholder="contato@suaempresa.com" />
          </Field>
          <Field label="WhatsApp (com DDD)" col="3">
            <input value={cfg.whatsappDisplay || ''} onChange={(e) => set('whatsappDisplay', e.target.value)} placeholder="(11) 98765-4321" />
          </Field>
          <Field label="Endereço da loja" col="9">
            <input value={cfg.address || ''} onChange={(e) => set('address', e.target.value)} placeholder="Rua, número — Cidade/UF" />
          </Field>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'flex-end' }}>
          <button className="btn btn--gold" disabled={!touched} onClick={handleSave}>
            <Icon name="check" size={14} /> Salvar dados da loja
          </button>
        </div>
      </div>

      <div className="adm__card" style={{ marginTop: 16 }}>
        <h3>Backup do catálogo</h3>
        <p className="muted" style={{ fontSize: 13, marginBottom: 12 }}>
          Exporte os produtos para um arquivo JSON e guarde em local seguro.
          Se trocar de navegador ou limpar os dados, você pode restaurar tudo de volta.
        </p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn btn--ghost btn--sm" onClick={() => {
            try {
              const data = {
                products: JSON.parse(localStorage.getItem('cc26.adm.products') || '[]'),
                coupons: JSON.parse(localStorage.getItem('cc26.adm.coupons') || '[]'),
                store: loadStoreConfig(),
                exportedAt: new Date().toISOString(),
              };
              const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `backup-loja-${new Date().toISOString().slice(0, 10)}.json`;
              a.click();
              URL.revokeObjectURL(url);
              showToast && showToast('Backup baixado');
            } catch (e) { alert('Falha ao exportar.'); }
          }}>
            <Icon name="download" size={14} /> Exportar backup (JSON)
          </button>

          <label className="btn btn--ghost btn--sm" style={{ cursor: 'pointer' }}>
            <Icon name="upload" size={14} /> Importar backup
            <input type="file" accept="application/json" hidden onChange={(e) => {
              const file = e.target.files && e.target.files[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = () => {
                try {
                  const data = JSON.parse(reader.result);
                  if (!confirm('Isto vai substituir produtos, cupons e dados da loja atuais. Confirmar?')) return;
                  if (Array.isArray(data.products)) localStorage.setItem('cc26.adm.products', JSON.stringify(data.products));
                  if (Array.isArray(data.coupons)) localStorage.setItem('cc26.adm.coupons', JSON.stringify(data.coupons));
                  if (data.store && typeof data.store === 'object') saveStoreConfig(data.store);
                  showToast && showToast('Backup restaurado — recarregue a página');
                  setTimeout(() => location.reload(), 1500);
                } catch (err) { alert('Arquivo inválido.'); }
              };
              reader.readAsText(file);
              e.target.value = '';
            }} />
          </label>
        </div>
      </div>
    </div>
  );
}

// ─── CONTA DE ADMIN ────────────────────────────────────────────
// Permite ao admin trocar a própria senha. A senha é guardada no
// localStorage (chave cc26.adm.auth). Para resetar caso esqueça,
// abra DevTools → Application → Local Storage e apague essa chave.
function AdminAccount({ auth, showToast }) {
  const [currentPwd, setCurrentPwd] = React.useState('');
  const [newPwd, setNewPwd] = React.useState('');
  const [newPwd2, setNewPwd2] = React.useState('');
  const [error, setError] = React.useState(null);
  const [success, setSuccess] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const submit = (e) => {
    e.preventDefault();
    setError(null); setSuccess(false);
    if (!currentPwd || !newPwd) return setError('Preencha todos os campos.');
    if (newPwd !== newPwd2) return setError('A confirmação não bate com a nova senha.');
    if (newPwd.length < 6) return setError('A nova senha precisa ter ao menos 6 caracteres.');
    if (newPwd === currentPwd) return setError('A nova senha precisa ser diferente da atual.');
    setLoading(true);
    setTimeout(() => {
      const r = auth.changePassword(auth.session.email, currentPwd, newPwd);
      setLoading(false);
      if (!r.ok) { setError(r.error); return; }
      setSuccess(true);
      setCurrentPwd(''); setNewPwd(''); setNewPwd2('');
      showToast && showToast('Senha alterada');
    }, 400);
  };

  return (
    <div className="adm__body">
      <div className="adm__card" style={{ maxWidth: 540 }}>
        <h3>Trocar senha</h3>
        <p className="muted" style={{ fontSize: 13, marginBottom: 16 }}>
          Conta atual: <strong>{auth.session.email}</strong>
        </p>
        <form onSubmit={submit}>
          <div className="frm">
            <Field label="Senha atual" col="6">
              <input type="password" value={currentPwd} onChange={(e) => setCurrentPwd(e.target.value)} autoComplete="current-password" required />
            </Field>
            <Field label="Nova senha (mínimo 6 caracteres)" col="6">
              <input type="password" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} autoComplete="new-password" required />
            </Field>
            <Field label="Confirme a nova senha" col="6">
              <input type="password" value={newPwd2} onChange={(e) => setNewPwd2(e.target.value)} autoComplete="new-password" required />
            </Field>
          </div>
          {error && (
            <div className="adm__alert adm__alert--warn" style={{ marginTop: 12 }}>
              <div><strong>{error}</strong></div>
            </div>
          )}
          {success && (
            <div className="adm__alert" style={{ marginTop: 12, background: '#e8f5ec', borderColor: '#009C3B' }}>
              <div>
                <strong>Senha alterada com sucesso.</strong>
                <p className="muted" style={{ fontSize: 13, marginTop: 4 }}>Use a nova senha no próximo login.</p>
              </div>
            </div>
          )}
          <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn--gold" disabled={loading}>
              <Icon name="check" size={14} /> {loading ? 'Salvando…' : 'Alterar senha'}
            </button>
          </div>
        </form>
      </div>

      <div className="adm__card" style={{ marginTop: 16, maxWidth: 540 }}>
        <h3>⚠️ Esqueci a senha</h3>
        <p className="muted" style={{ fontSize: 13, lineHeight: 1.55 }}>
          Se você esquecer a senha e não conseguir entrar:
        </p>
        <ol style={{ fontSize: 13, lineHeight: 1.8, paddingLeft: 22, marginTop: 8 }}>
          <li>Abra o navegador na tela de login do painel</li>
          <li>Aperte <strong>F12</strong> para abrir as Ferramentas do Desenvolvedor</li>
          <li>Vá na aba <strong>Application</strong> → <strong>Local Storage</strong></li>
          <li>Encontre a chave <code>cc26.adm.auth</code> e apague</li>
          <li>Recarregue a página — a senha volta para a padrão original do código</li>
        </ol>
      </div>

      <div className="adm__card" style={{ marginTop: 16, maxWidth: 540 }}>
        <h3>🔒 Segurança</h3>
        <p className="muted" style={{ fontSize: 13, lineHeight: 1.55 }}>
          A autenticação deste painel é client-side (roda no navegador). A senha
          fica armazenada no <code>localStorage</code> do seu computador.
          Para segurança máxima:
        </p>
        <ul style={{ fontSize: 13, lineHeight: 1.7, paddingLeft: 22, marginTop: 8 }}>
          <li>Use uma senha forte (12+ caracteres, com número, letra e símbolo)</li>
          <li>Não compartilhe a URL do painel publicamente</li>
          <li>Sempre acesse de um dispositivo confiável</li>
          <li>Faça logout ao usar computadores de terceiros</li>
        </ul>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<AdminApp />);

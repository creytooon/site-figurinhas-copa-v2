// pages-account.jsx — Área do Cliente, Admin, Contato/Termos

// ─── ACCOUNT ─────────────────────────────────────────────────────
function AccountPage({ navigate, params }) {
  const cart = React.useContext(CartContext);
  const [tab, setTab] = React.useState(params.tab || (cart.user ? 'orders' : 'login'));
  React.useEffect(() => { if (params.tab) setTab(params.tab); }, [params.tab]);

  if (!cart.user && tab !== 'login' && tab !== 'register') {
    return <LoginPanel navigate={navigate} cart={cart} />;
  }

  if (tab === 'login' || tab === 'register') {
    return <LoginPanel navigate={navigate} cart={cart} initial={tab} />;
  }

  return (
    <main className="pg">
      <div className="hd__container acc">
        <aside className="acc__side">
          <div className="acc__user">
            <div className="acc__avatar">{cart.user.name.split(' ').map((s) => s[0]).slice(0, 2).join('').toUpperCase()}</div>
            <div>
              <div className="acc__name">{cart.user.name}</div>
              <div className="muted" style={{ fontSize: 12 }}>{cart.user.email}</div>
            </div>
          </div>
          {[
            { id: 'orders', label: 'Meus pedidos', icon: 'package' },
            { id: 'wishlist', label: 'Lista de desejos', icon: 'heart' },
            { id: 'profile', label: 'Dados pessoais', icon: 'user' },
            { id: 'addresses', label: 'Endereços', icon: 'truck' },
            { id: 'collection', label: 'Minha coleção', icon: 'grid' },
          ].map((t) => (
            <button key={t.id} className={'acc__tab' + (tab === t.id ? ' is-on' : '')} onClick={() => setTab(t.id)}>
              <Icon name={t.icon} size={16} /> {t.label}
            </button>
          ))}
          <button className="acc__tab" onClick={() => { cart.setUser(null); navigate('home'); }}>
            <Icon name="lock" size={16} /> Sair
          </button>
        </aside>
        <section className="acc__main">
          {tab === 'orders' && <OrdersPanel cart={cart} navigate={navigate} />}
          {tab === 'wishlist' && <WishlistPanel cart={cart} navigate={navigate} />}
          {tab === 'profile' && <ProfilePanel cart={cart} />}
          {tab === 'addresses' && <AddressesPanel cart={cart} />}
          {tab === 'collection' && <CollectionPanel />}
        </section>
      </div>
    </main>
  );
}

function LoginPanel({ navigate, cart, initial = 'login' }) {
  const [mode, setMode] = React.useState(initial);
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [pass, setPass] = React.useState('');
  const submit = (e) => {
    e.preventDefault();
    cart.setUser({ name: name || 'Colecionador', email: email || 'voce@email.com' });
    navigate('account', { tab: 'orders' });
  };
  return (
    <main className="pg">
      <div className="hd__container loginlayout">
        <div className="login__art">
          <div className="login__art-bg">
            <ProductImage product={PRODUCTS[1]} />
          </div>
          <div className="login__art-copy">
            <div className="hero__kicker"><span className="hero__dot" /> Área do colecionador</div>
            <h2>Sua coleção, organizada para você</h2>
            <ul>
              <li><Icon name="check" size={14} /> Acompanhe seus pedidos em tempo real</li>
              <li><Icon name="check" size={14} /> Lista de desejos e alertas de pré-venda</li>
              <li><Icon name="check" size={14} /> Comunidade de troca de figurinhas</li>
              <li><Icon name="check" size={14} /> Cupons exclusivos para colecionadores</li>
            </ul>
          </div>
        </div>
        <div className="login__form">
          <div className="login__tabs">
            <button className={mode === 'login' ? 'is-on' : ''} onClick={() => setMode('login')}>Entrar</button>
            <button className={mode === 'register' ? 'is-on' : ''} onClick={() => setMode('register')}>Cadastrar</button>
          </div>
          <form onSubmit={submit}>
            {mode === 'register' && (
              <Field label="Nome completo"><input value={name} onChange={(e) => setName(e.target.value)} required /></Field>
            )}
            <Field label="E-mail"><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></Field>
            <Field label="Senha"><input type="password" value={pass} onChange={(e) => setPass(e.target.value)} required /></Field>
            {mode === 'register' && (
              <label className="chk" style={{ marginTop: 8 }}>
                <input type="checkbox" defaultChecked /><span>Aceito receber pré-vendas e cupons da Coleção 2026</span>
              </label>
            )}
            <button className="btn btn--gold btn--lg btn--block" type="submit">
              {mode === 'login' ? 'Entrar na minha conta' : 'Criar conta de colecionador'}
            </button>
            {mode === 'login' && <a className="login__forgot">Esqueci minha senha</a>}
          </form>
        </div>
      </div>
    </main>
  );
}

function OrdersPanel({ cart, navigate }) {
  if (cart.orders.length === 0) {
    return (
      <div className="acc__panel">
        <h2>Meus pedidos</h2>
        <div className="acc__empty">
          <Icon name="package" size={32} />
          <p>Você ainda não tem pedidos. Que tal começar pela coleção 2026?</p>
          <button className="btn btn--gold" onClick={() => navigate('category')}>Ver coleção</button>
        </div>
      </div>
    );
  }
  return (
    <div className="acc__panel">
      <h2>Meus pedidos</h2>
      <div className="acc__orders">
        {cart.orders.map((o) => (
          <div key={o.id} className="acc__order">
            <div className="acc__order-head">
              <div>
                <div className="muted" style={{ fontSize: 12 }}>Pedido</div>
                <strong>{o.id}</strong>
              </div>
              <div>
                <div className="muted" style={{ fontSize: 12 }}>Data</div>
                <strong>{new Date(o.date).toLocaleDateString('pt-BR')}</strong>
              </div>
              <div>
                <div className="muted" style={{ fontSize: 12 }}>Total</div>
                <strong>{BRL(o.total)}</strong>
              </div>
              <div className="acc__order-stat">{o.status}</div>
            </div>
            <div className="acc__order-items">
              {o.items.slice(0, 4).map((i) => (
                <div key={i.id} className="acc__order-item">
                  <div className="acc__order-art"><ProductImage product={i.product} /></div>
                  <div>{i.product.short}<span className="muted"> · {i.qty}x</span></div>
                </div>
              ))}
            </div>
            <div className="acc__order-foot">
              <button className="btn btn--ghost btn--sm">Ver nota fiscal</button>
              <button className="btn btn--ghost btn--sm">Rastrear pedido</button>
              <button className="btn btn--primary btn--sm">Comprar novamente</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function WishlistPanel({ cart, navigate }) {
  const items = cart.wishlist.map((id) => PRODUCTS.find((p) => p.id === id)).filter(Boolean);
  if (items.length === 0) {
    return (<div className="acc__panel"><h2>Lista de desejos</h2><div className="acc__empty"><Icon name="heart" size={32} /><p>Sua lista está vazia. Toque no coração nos produtos para salvar para depois.</p><button className="btn btn--gold" onClick={() => navigate('category')}>Explorar produtos</button></div></div>);
  }
  return (
    <div className="acc__panel">
      <h2>Lista de desejos</h2>
      <div className="grid grid--3">
        {items.map((p) => <ProductCard key={p.id} product={p} onOpen={(id) => navigate('product', { id })} />)}
      </div>
    </div>
  );
}

function ProfilePanel({ cart }) {
  const [form, setForm] = React.useState({ ...cart.user, cpf: '', phone: '', birth: '' });
  return (
    <div className="acc__panel">
      <h2>Dados pessoais</h2>
      <p className="muted">Mantenha seu cadastro atualizado para garantir entregas sem atraso.</p>
      <div className="frm">
        <Field label="Nome completo" col="6"><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
        <Field label="E-mail" col="3"><input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
        <Field label="Telefone" col="3"><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
        <Field label="CPF" col="3"><input value={form.cpf} onChange={(e) => setForm({ ...form, cpf: e.target.value })} /></Field>
        <Field label="Data de nascimento" col="3"><input type="date" value={form.birth} onChange={(e) => setForm({ ...form, birth: e.target.value })} /></Field>
      </div>
      <button className="btn btn--gold" onClick={() => cart.setUser({ name: form.name, email: form.email })}>Salvar alterações</button>
    </div>
  );
}

function AddressesPanel({ cart }) {
  const addrs = [
    { id: 1, label: 'Casa', street: 'Rua das Palmeiras, 234 — Apto 42', city: 'São Paulo/SP', cep: '01310-100', main: true },
    { id: 2, label: 'Trabalho', street: 'Av. Paulista, 1000 — 12º andar', city: 'São Paulo/SP', cep: '01311-100', main: false },
  ];
  return (
    <div className="acc__panel">
      <div className="acc__panel-head">
        <h2>Endereços salvos</h2>
        <button className="btn btn--gold btn--sm">+ Novo endereço</button>
      </div>
      <div className="addrs">
        {addrs.map((a) => (
          <div key={a.id} className="addr">
            <div>
              <div className="addr__lbl">{a.label}{a.main && <span className="pill pill--gold">Principal</span>}</div>
              <p>{a.street}<br />{a.city} · CEP {a.cep}</p>
            </div>
            <div className="addr__act">
              <button>Editar</button>
              <button>Remover</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CollectionPanel() {
  // Mini dashboard de progresso do álbum
  const total = 670;
  const collected = 412;
  const pct = Math.round((collected / total) * 100);
  return (
    <div className="acc__panel">
      <h2>Minha coleção</h2>
      <p className="muted">Acompanhe o progresso do seu álbum 2026 e troque repetidas com a comunidade.</p>
      <div className="collstat">
        <div className="collstat__big">
          <div className="collstat__num">{collected}<span>/{total}</span></div>
          <div className="muted">figurinhas coladas</div>
        </div>
        <div className="collstat__bar">
          <div style={{ width: pct + '%' }} />
          <span>{pct}% completo</span>
        </div>
        <div className="collstat__cards">
          <div><strong>258</strong><span>repetidas</span></div>
          <div><strong>14</strong><span>especiais</span></div>
          <div><strong>5</strong><span>brilhantes</span></div>
          <div><strong>22</strong><span>matches de troca</span></div>
        </div>
      </div>
    </div>
  );
}

// ─── ADMIN ───────────────────────────────────────────────────────
function AdminPage({ navigate }) {
  const [section, setSection] = React.useState('dashboard');
  return (
    <main className="adm">
      <aside className="adm__side">
        <div className="adm__brand">
          <Logo dark />
        </div>
        <div className="adm__sidehead">PAINEL</div>
        {[
          { id: 'dashboard', label: 'Dashboard', icon: 'grid' },
          { id: 'products', label: 'Produtos', icon: 'package' },
          { id: 'orders', label: 'Pedidos', icon: 'truck' },
          { id: 'coupons', label: 'Cupons', icon: 'tag' },
          { id: 'shipping', label: 'Fretes', icon: 'truck' },
          { id: 'banners', label: 'Banners', icon: 'list' },
          { id: 'payments', label: 'Pagamentos', icon: 'card' },
          { id: 'store', label: 'Dados da loja', icon: 'shield' },
        ].map((s) => (
          <button key={s.id} className={'adm__tab' + (section === s.id ? ' is-on' : '')} onClick={() => setSection(s.id)}>
            <Icon name={s.icon} size={16} /> {s.label}
          </button>
        ))}
        <a className="adm__back" onClick={() => navigate('home')}>← Voltar à loja</a>
      </aside>
      <section className="adm__main">
        <header className="adm__head">
          <div>
            <div className="muted" style={{ fontSize: 12 }}>Loja Álbum Copa 2026 / {section}</div>
            <h1>{({ dashboard: 'Dashboard', products: 'Produtos', orders: 'Pedidos', coupons: 'Cupons', shipping: 'Fretes', banners: 'Banners da home', payments: 'Métodos de pagamento', store: 'Dados da loja' })[section]}</h1>
          </div>
          <div className="adm__head-act">
            <button className="btn btn--ghost btn--sm">Ver loja</button>
            <button className="btn btn--gold btn--sm">+ Adicionar</button>
          </div>
        </header>
        {section === 'dashboard' && <AdminDashboard />}
        {section === 'products' && <AdminProducts />}
        {section === 'orders' && <AdminOrders />}
        {section === 'coupons' && <AdminCoupons />}
        {section === 'shipping' && <AdminShipping />}
        {section === 'banners' && <AdminBanners />}
        {section === 'payments' && <AdminPayments />}
        {section === 'store' && <AdminStore />}
      </section>
    </main>
  );
}

function AdminDashboard() {
  const stats = [
    { label: 'Vendas hoje', value: 'R$ 18.420', delta: '+12%', good: true },
    { label: 'Pedidos hoje', value: '147', delta: '+8%', good: true },
    { label: 'Ticket médio', value: 'R$ 125,30', delta: '+3%', good: true },
    { label: 'Carrinhos abandonados', value: '23', delta: '-4%', good: true },
  ];
  const orders = [
    { id: 'CC26-401287', name: 'Marina Silveira', items: 'Combo Torcedor + Box Premium', total: 549.8, status: 'Em separação', date: 'há 12 min' },
    { id: 'CC26-401286', name: 'Diego Ramos', items: 'Mega Box 100', total: 379.9, status: 'Pago', date: 'há 24 min' },
    { id: 'CC26-401285', name: 'Pedro H. Costa', items: '2× Kit Álbum + 24 Envelopes', total: 299.8, status: 'Despachado', date: 'há 1h' },
    { id: 'CC26-401284', name: 'Ana Paula Reis', items: 'Álbum Capa Dura', total: 49.9, status: 'Aguardando Pix', date: 'há 1h' },
    { id: 'CC26-401283', name: 'Renata Albuquerque', items: 'Lata Cards 2026', total: 129.9, status: 'Entregue', date: 'há 2h' },
  ];
  return (
    <div className="adm__body">
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
            {PRODUCTS.slice(0, 5).map((p, i) => (
              <li key={p.id}>
                <span className="adm__top-n">#{i + 1}</span>
                <div className="adm__top-art"><ProductImage product={p} /></div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="adm__top-name">{p.short}</div>
                  <div className="muted" style={{ fontSize: 12 }}>{Math.floor(Math.random() * 200 + 50)} vendidos · {BRL(p.price)}</div>
                </div>
                <div className="adm__top-bar"><span style={{ width: (90 - i * 12) + '%' }} /></div>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="adm__card">
        <h3>Pedidos recentes</h3>
        <table className="adm__table">
          <thead>
            <tr><th>Pedido</th><th>Cliente</th><th>Itens</th><th>Total</th><th>Status</th><th></th></tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td><strong>{o.id}</strong><br /><span className="muted">{o.date}</span></td>
                <td>{o.name}</td>
                <td className="muted">{o.items}</td>
                <td><strong>{BRL(o.total)}</strong></td>
                <td><span className={'adm__pill adm__pill--' + o.status.replace(/\s/g, '-').toLowerCase()}>{o.status}</span></td>
                <td><button className="btn btn--ghost btn--sm">Detalhes</button></td>
              </tr>
            ))}
          </tbody>
        </table>
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
      <g>
        {[0, 1, 2, 3].map((i) => (
          <line key={i} x1="0" x2="600" y1={40 + i * 40} y2={40 + i * 40} stroke="rgba(0,0,0,0.06)" />
        ))}
      </g>
      {(() => {
        const pts = data.map((v, i) => [i * (600 / (data.length - 1)), 200 - (v / max) * 160]);
        const line = pts.map((p, i) => (i === 0 ? 'M' : 'L') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
        const area = line + ` L600 200 L0 200 Z`;
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

function AdminProducts() {
  return (
    <div className="adm__body">
      <div className="adm__filters">
        <input placeholder="Buscar produto…" />
        <select><option>Todas as categorias</option>{TYPES.map((t) => <option key={t}>{t}</option>)}</select>
        <select><option>Status: Todos</option><option>Ativos</option><option>Pausados</option></select>
      </div>
      <div className="adm__card">
        <table className="adm__table">
          <thead>
            <tr><th></th><th>Produto</th><th>SKU</th><th>Categoria</th><th>Preço</th><th>Estoque</th><th>Status</th><th></th></tr>
          </thead>
          <tbody>
            {PRODUCTS.map((p) => (
              <tr key={p.id}>
                <td><div className="adm__rowart"><ProductImage product={p} /></div></td>
                <td><strong>{p.short}</strong><br /><span className="muted" style={{ fontSize: 12 }}>{p.name}</span></td>
                <td className="muted">{p.id.toUpperCase()}</td>
                <td>{p.type}</td>
                <td><strong>{BRL(p.price)}</strong>{p.oldPrice && <><br /><span className="muted" style={{ fontSize: 11, textDecoration: 'line-through' }}>{BRL(p.oldPrice)}</span></>}</td>
                <td><span className={p.stock > 30 ? '' : 'adm__lowstock'}>{p.stock} un</span></td>
                <td><span className="adm__pill adm__pill--pago">Ativo</span></td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn--ghost btn--sm">Editar</button>
                    <button className="btn btn--ghost btn--sm">Fotos</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AdminOrders() {
  const orders = [
    { id: 'CC26-401287', name: 'Marina Silveira', total: 549.8, status: 'Em separação', pay: 'Pix' },
    { id: 'CC26-401286', name: 'Diego Ramos', total: 379.9, status: 'Pago', pay: 'Cartão 6x' },
    { id: 'CC26-401285', name: 'Pedro H. Costa', total: 299.8, status: 'Despachado', pay: 'Pix' },
    { id: 'CC26-401284', name: 'Ana Paula Reis', total: 49.9, status: 'Aguardando-Pix', pay: 'Pix' },
    { id: 'CC26-401283', name: 'Renata Albuquerque', total: 129.9, status: 'Entregue', pay: 'Boleto' },
    { id: 'CC26-401282', name: 'Bruno T. Lopes', total: 149.9, status: 'Despachado', pay: 'Cartão 3x' },
    { id: 'CC26-401281', name: 'Carla Mendes', total: 19.9, status: 'Entregue', pay: 'Pix' },
    { id: 'CC26-401280', name: 'João V. Souza', total: 89.9, status: 'Pago', pay: 'Cartão 6x' },
  ];
  return (
    <div className="adm__body">
      <div className="adm__filters">
        <input placeholder="Buscar pedido, cliente, CPF…" />
        <select><option>Status: Todos</option><option>Pago</option><option>Em separação</option><option>Despachado</option></select>
        <input type="date" />
      </div>
      <div className="adm__card">
        <table className="adm__table">
          <thead>
            <tr><th>Pedido</th><th>Cliente</th><th>Pagamento</th><th>Total</th><th>Status</th><th></th></tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td><strong>{o.id}</strong></td>
                <td>{o.name}</td>
                <td className="muted">{o.pay}</td>
                <td><strong>{BRL(o.total)}</strong></td>
                <td><span className={'adm__pill adm__pill--' + o.status.replace(/\s/g, '-').toLowerCase()}>{o.status.replace(/-/g, ' ')}</span></td>
                <td><button className="btn btn--ghost btn--sm">Atualizar</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AdminCoupons() {
  const list = Object.entries(COUPONS).concat([['NATAL26', { off: 0.15, label: '15% off Black November' }]]);
  return (
    <div className="adm__body">
      <div className="adm__card">
        <table className="adm__table">
          <thead><tr><th>Código</th><th>Descrição</th><th>Tipo</th><th>Mínimo</th><th>Usos</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {list.map(([code, c]) => (
              <tr key={code}>
                <td><strong style={{ fontFamily: 'JetBrains Mono, monospace' }}>{code}</strong></td>
                <td>{c.label}</td>
                <td>{c.off ? 'Percentual' : c.freeShip ? 'Frete grátis' : 'Valor'}</td>
                <td>{c.min ? BRL(c.min) : '—'}</td>
                <td>{Math.floor(Math.random() * 500)}</td>
                <td><span className="adm__pill adm__pill--pago">Ativo</span></td>
                <td><button className="btn btn--ghost btn--sm">Editar</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AdminShipping() {
  return (
    <div className="adm__body adm__body--cards">
      {Object.entries(SHIPPING_RATES).map(([k, s]) => (
        <div key={k} className="adm__card adm__shipcard">
          <div className="adm__shipcard-h"><Icon name="truck" size={20} /><strong>{s.name}</strong></div>
          <div className="muted">{s.days}</div>
          <div style={{ marginTop: 12 }}>
            <Field label="Preço base"><input defaultValue={s.price} /></Field>
            <Field label="Prazo"><input defaultValue={s.days} /></Field>
          </div>
          <label className="chk"><input type="checkbox" defaultChecked /><span>Disponível</span></label>
        </div>
      ))}
    </div>
  );
}

function AdminBanners() {
  return (
    <div className="adm__body">
      <div className="adm__card">
        <h3>Banners da home</h3>
        <div className="adm__bannerlist">
          {['Hero principal — Coleção Copa 2026', 'Pré-venda Mega Box', 'Combo Torcedor Premium', 'Black November'].map((b, i) => (
            <div key={b} className="adm__banner">
              <div className="adm__banner-thumb" style={{ background: `linear-gradient(135deg, #009C3B 0%, #00B844 100%)` }}>
                <span style={{ fontFamily: 'Anton, sans-serif', fontSize: 32, color: '#FFDF00' }}>0{i + 1}</span>
              </div>
              <div style={{ flex: 1 }}>
                <strong>{b}</strong>
                <div className="muted" style={{ fontSize: 12 }}>Posição: {i + 1} · Ativo · 12.402 cliques</div>
              </div>
              <button className="btn btn--ghost btn--sm">Editar</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AdminPayments() {
  const methods = [
    { name: 'Pix', desc: '5% off no checkout · Confirmação imediata', on: true },
    { name: 'Cartão de crédito', desc: 'Visa, Master, Elo · Em até 6x sem juros', on: true },
    { name: 'Boleto bancário', desc: 'Compensação em até 2 dias úteis', on: true },
    { name: 'Apple Pay', desc: 'Pagamento por aproximação', on: false },
  ];
  return (
    <div className="adm__body adm__body--cards">
      {methods.map((m) => (
        <div key={m.name} className="adm__card adm__shipcard">
          <strong>{m.name}</strong>
          <p className="muted" style={{ fontSize: 13 }}>{m.desc}</p>
          <label className="chk"><input type="checkbox" defaultChecked={m.on} /><span>Ativo</span></label>
        </div>
      ))}
    </div>
  );
}

function AdminStore() {
  return (
    <div className="adm__body">
      <div className="adm__card">
        <h3>Dados da loja</h3>
        <div className="frm">
          <Field label="Nome da loja" col="6"><input defaultValue="Álbum Copa 2026" /></Field>
          <Field label="CNPJ" col="3"><input defaultValue="00.000.000/0001-00" /></Field>
          <Field label="E-mail de contato" col="3"><input defaultValue="contato@albumcopa.com" /></Field>
          <Field label="WhatsApp" col="3"><input defaultValue="(11) 98765-4321" /></Field>
          <Field label="Endereço da loja" col="6"><input defaultValue="Av. Paulista, 1000 — São Paulo/SP" /></Field>
        </div>
      </div>
    </div>
  );
}

// ─── Páginas auxiliares (Contato, Termos, Política, FAQ) ────────
function StaticPage({ kind, navigate }) {
  const blocks = {
    contact: {
      kicker: 'FALE COM A GENTE',
      title: 'Contato',
      lead: 'Atendemos colecionadores de todo o Brasil. Resposta em até 2 horas úteis.',
      body: (
        <div className="static__grid">
          <div className="static__card">
            <h3><Icon name="whatsapp" size={20} color="#25D366" /> WhatsApp</h3>
            <p>(11) 98765-4321<br />Seg a Sex · 9h às 19h</p>
            <button className="btn btn--gold">Abrir conversa</button>
          </div>
          <div className="static__card">
            <h3>E-mail</h3>
            <p>contato@albumcopa.com<br />suporte@albumcopa.com</p>
          </div>
          <div className="static__card">
            <h3>Endereço</h3>
            <p>Av. Paulista, 1000 — Bela Vista<br />São Paulo/SP · CEP 01310-100</p>
            <p className="muted" style={{ fontSize: 13 }}>Retirada local com agendamento prévio.</p>
          </div>
        </div>
      ),
    },
    terms: {
      kicker: 'LEIA ANTES DE COMPRAR', title: 'Termos de compra',
      lead: 'As regras claras para uma coleção sem dor de cabeça.',
      body: (
        <ol className="static__list">
          <li><strong>Confirmação de pedido.</strong> Pedidos são confirmados após aprovação do pagamento (instantâneo no Pix, em até 2 dias úteis no boleto, em até 1 dia útil no cartão).</li>
          <li><strong>Despacho.</strong> Despachamos em até 24h após confirmação. Pedidos pagos em dia útil até 14h saem no mesmo dia.</li>
          <li><strong>Prazo de entrega.</strong> O prazo informado é a partir do despacho. Atrasos da transportadora não são responsabilidade da Álbum Copa, mas auxiliamos no rastreio.</li>
          <li><strong>Embalagem.</strong> Todos os produtos saem lacrados de fábrica. Caixas vêm com proteção extra para colecionáveis.</li>
          <li><strong>Nota fiscal.</strong> Emitida automaticamente para todos os pedidos. Acompanha o produto e fica também na sua área do cliente.</li>
        </ol>
      ),
    },
    policy: {
      kicker: 'TROCAS E DEVOLUÇÕES', title: 'Política de troca',
      lead: 'Em colecionáveis lacrados, a integridade do produto é nosso compromisso.',
      body: (
        <ol className="static__list">
          <li><strong>7 dias de arrependimento.</strong> Direito garantido pelo CDC. Produtos lacrados podem ser devolvidos em até 7 dias após o recebimento.</li>
          <li><strong>Defeito de fabricação.</strong> Em até 90 dias trocamos imediatamente, sem custo adicional.</li>
          <li><strong>Envelopes lacrados.</strong> Após abertos, não é possível trocar pelo conteúdo aleatório (figurinhas sortidas).</li>
          <li><strong>Como solicitar.</strong> Acesse "Meus pedidos" e clique em "Solicitar troca", ou nos chame no WhatsApp.</li>
        </ol>
      ),
    },
    faq: {
      kicker: 'PERGUNTAS FREQUENTES', title: 'FAQ',
      lead: 'Respostas para as dúvidas mais comuns dos colecionadores.',
      body: <FAQList />,
    },
  };
  const b = blocks[kind];
  return (
    <main className="pg static">
      <div className="hd__container">
        <div className="static__head">
          <div className="hero__kicker"><span className="hero__dot" />{b.kicker}</div>
          <h1>{b.title}</h1>
          <p className="static__lead">{b.lead}</p>
        </div>
        <div className="static__body">{b.body}</div>
      </div>
    </main>
  );
}

function FAQList() {
  const [open, setOpen] = React.useState(0);
  const items = [
    ...FAQ,
    { q: 'Quais formas de pagamento aceitam?', a: 'Pix (com 5% de desconto, gerado direto no site) e cartão de crédito em até 6x sem juros via WhatsApp.' },
    { q: 'Como rastrear meu pedido?', a: 'Em "Meus pedidos" você acompanha em tempo real cada etapa, do despacho à entrega.' },
  ];
  return (
    <div className="faq" style={{ maxWidth: 780, margin: '0 auto' }}>
      {items.map((f, i) => (
        <div key={i} className={'faq__item' + (open === i ? ' is-on' : '')}>
          <button onClick={() => setOpen(open === i ? -1 : i)}><span>{f.q}</span><Icon name="chevron-down" size={16} /></button>
          {open === i && <p>{f.a}</p>}
        </div>
      ))}
    </div>
  );
}

Object.assign(window, { AccountPage, AdminPage, StaticPage });

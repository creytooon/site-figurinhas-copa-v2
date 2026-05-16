// ════════════════════════════════════════════════════════════════
// LOGIN DO PAINEL ADMIN
// ────────────────────────────────────────────────────────────────
// Senha hasheada (SHA-256) salva no localStorage.
// AVISO: client-side só. Pra produção real, combinar com
// Vercel Password Protection (configurado no painel da Vercel).
// ════════════════════════════════════════════════════════════════

const AdminLogin = ({ onSuccess }) => {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError]       = React.useState("");
  const [loading, setLoading]   = React.useState(false);
  const [showPwd, setShowPwd]   = React.useState(false);

  const submit = async (ev) => {
    ev.preventDefault();
    setError("");
    setLoading(true);
    try {
      const cfg = getSiteConfig();
      const expectedUser = cfg.auth?.username || "admin";
      if (username !== expectedUser) {
        setError("Usuário ou senha incorretos.");
        setLoading(false);
        return;
      }
      const ok = await checkPassword(password);
      if (!ok) {
        setError("Usuário ou senha incorretos.");
        setLoading(false);
        return;
      }
      loginSession(username);
      onSuccess?.();
    } catch (e) {
      setError("Erro inesperado. Tente novamente.");
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-bg">
      <div className="admin-login-card">
        <div className="al-eyebrow">⚙ PAINEL ADMINISTRATIVO</div>
        <h1 className="al-title">Pacotes <span className="gold-grad">Copa 2026</span></h1>
        <p className="al-sub">Entre com suas credenciais pra acessar o painel.</p>

        <form onSubmit={submit} className="al-form">
          <div className="al-field">
            <label>Usuário</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
              autoComplete="username"
              placeholder="admin"
            />
          </div>
          <div className="al-field">
            <label>Senha</label>
            <div className="al-pwd-wrap">
              <input
                type={showPwd ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                placeholder="••••••••"
              />
              <button type="button" className="al-pwd-toggle"
                onClick={() => setShowPwd(s => !s)}
                tabIndex={-1}>
                {showPwd ? "🙈" : "👁"}
              </button>
            </div>
          </div>
          {error && <div className="al-error">{error}</div>}
          <button type="submit" disabled={loading || !username || !password}
                  className="al-submit">
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <div className="al-hint">
          <b>Primeiro acesso?</b> Use <code>admin</code> / <code>admin123</code> e troque a senha imediatamente em <b>Admin → Segurança</b>.
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { AdminLogin });

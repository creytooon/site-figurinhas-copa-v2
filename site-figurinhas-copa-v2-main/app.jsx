// ════════════════════════════════════════════════════════════════
// APP · raiz + integração com painel Tweaks
// ════════════════════════════════════════════════════════════════

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "brand": "VOCÊ NA COPA",
  "accent": "#D4AF37",
  "headline2Variant": "campo",
  "showCountdown": true,
  "showHostFilters": true,
  "installments": 18,
  "heroVariant": "main"
}/*EDITMODE-END*/;

// Variações de headline pra brincar (a linha de cima é fixa: "É HORA DE")
const HEADLINE_VARIANTS = {
  "campo":  { label: "Entrar em campo" },
  "lá":     { label: "Estar lá" },
  "viver":  { label: "Viver a Copa" },
  "vestir": { label: "Vestir a camisa" }
};

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [highlightMedia, setHighlightMedia] = React.useState(false);
  // Admin abre automaticamente quando carregado via paineladmin.html
  // (essa página define window.__VNC_ADMIN_MODE antes do app montar).
  const [adminOpen, setAdminOpen] = React.useState(() => !!window.__VNC_ADMIN_MODE);
  // Estado de login (só relevante no modo admin)
  const [authed, setAuthed] = React.useState(() =>
    typeof isLoggedIn === "function" ? isLoggedIn() : false
  );

  // Aplica a cor de acento (dourado) via CSS custom property
  React.useEffect(() => {
    document.documentElement.style.setProperty("--gold", t.accent);
  }, [t.accent]);

  // Toggles globais para esconder elementos via data-attrs no body
  React.useEffect(() => {
    document.body.dataset.countdown = t.showCountdown ? "on" : "off";
    document.body.dataset.hostFilters = t.showHostFilters ? "on" : "off";
  }, [t.showCountdown, t.showHostFilters]);

  // Aplica modo "destacar slots de mídia" no body
  React.useEffect(() => {
    document.body.dataset.mediaHighlight = highlightMedia ? "on" : "off";
  }, [highlightMedia]);

  const subline = `Pacotes premium pra Copa do Mundo 2026 — voos, hotéis 5★, ingressos e atendimento humano pelo WhatsApp. Parcele em até ${t.installments}× sem juros.`;

  const headline2 = HEADLINE_VARIANTS[t.headline2Variant]?.label || "Entrar em campo";

  // Modo admin sem autenticação: mostra apenas a tela de login
  if (window.__VNC_ADMIN_MODE && !authed) {
    return <AdminLogin onSuccess={() => setAuthed(true)} />;
  }

  return (
    <>
      <div className="app-bg" aria-hidden="true"></div>

      <Hero
        brand={t.brand}
        subline={subline}
        headline2={headline2}
        installments={t.installments}
        heroVariant={t.heroVariant}
      />

      <Diferenciais />
      <Pacotes installments={t.installments} />
      <Depoimentos />
      <Builder brand={t.brand} />
      <VisaSection />
      <Sedes />
      <FAQ />
      <CTAStrip brand={t.brand} installments={t.installments} />
      <Footer brand={t.brand} />

      <FabWhatsApp />
      <PacoteModal />
      <LegalModal />
      {adminOpen && typeof AdminPanel !== "undefined" && (
        <AdminPanel
          tweaks={t}
          setTweak={setTweak}
          onClose={() => {
            // Se chegou aqui via /paineladmin.html, voltar pra home;
            // senão, só fecha o modal (uso pontual via console).
            if (window.__VNC_ADMIN_MODE) {
              window.location.href = "index.html";
            } else {
              setAdminOpen(false);
            }
          }}
        />
      )}

      <TweaksPanel>
        <TweakSection label="Marca" />
        <TweakText label="Nome da agência" value={t.brand}
          onChange={(v) => setTweak("brand", v)} />

        <TweakSection label="Visual" />
        <TweakColor label="Cor de acento"
          value={t.accent}
          options={["#D4AF37", "#E8501C", "#22C55E", "#3B82F6", "#F4F1E8"]}
          onChange={(v) => setTweak("accent", v)} />

        <TweakSection label="Hero" />
        <TweakSelect label="Frase de impacto"
          value={t.headline2Variant}
          options={Object.keys(HEADLINE_VARIANTS).map(k => ({value: k, label: HEADLINE_VARIANTS[k].label}))}
          onChange={(v) => setTweak("headline2Variant", v)} />
        <TweakToggle label="Contagem regressiva"
          value={t.showCountdown}
          onChange={(v) => setTweak("showCountdown", v)} />

        <TweakSection label="Comercial" />
        <TweakSlider label="Parcelamento" value={t.installments}
          min={6} max={24} step={1} unit="×"
          onChange={(v) => setTweak("installments", v)} />

        <TweakSection label="Pacotes" />
        <TweakToggle label="Filtros por país"
          value={t.showHostFilters}
          onChange={(v) => setTweak("showHostFilters", v)} />

        <MediaManagerSection
          highlight={highlightMedia}
          onHighlightChange={setHighlightMedia} />
      </TweaksPanel>
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);

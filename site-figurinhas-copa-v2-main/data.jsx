// ════════════════════════════════════════════════════════════════
// DADOS · pacotes da Copa 2026 + sedes
// Edite somente AQUI para mexer no conteúdo dos cards.
// ════════════════════════════════════════════════════════════════

// Número do WhatsApp da agência (formato internacional, só dígitos).
// Pode ser sobrescrito via painel admin (campo empresa.whatsapp).
const WHATSAPP_NUMBER = "551151992968";

// Helper que monta o link do WhatsApp com mensagem pré-preenchida.
// Usa o número configurado no admin (fallback pro WHATSAPP_NUMBER).
function waLink(text) {
  let num = WHATSAPP_NUMBER;
  try {
    const cfg = (typeof getSiteConfig === "function") ? getSiteConfig() : null;
    if (cfg && cfg.empresa && cfg.empresa.whatsapp) num = cfg.empresa.whatsapp;
  } catch {}
  const t = encodeURIComponent(text || "Olá! Tenho interesse nos pacotes da Copa 2026.");
  return `https://wa.me/${num}?text=${t}`;
}

// Helper que gera mensagem WhatsApp detalhada com info do pacote/builder
function buildWhatsAppMessage({ pacote, builderData, passengers }) {
  const lines = ["🏆 *SOLICITAÇÃO DE PACOTE · COPA 2026*", ""];
  if (pacote) {
    lines.push(`📦 *Pacote:* ${pacote.titulo}`);
    lines.push(`📍 *Destino:* ${pacote.cidadeSede}`);
    lines.push(`📅 *Período:* ${pacote.dataInicio} – ${pacote.dataFim} (${pacote.dias} dias)`);
    if (pacote.matchHighlight) lines.push(`⚽ *Destaque:* ${pacote.matchHighlight}`);
    lines.push(`💰 *Valor de tabela:* R$ ${pacote.preco.toLocaleString("pt-BR")}`);
    lines.push("");
    lines.push("*Inclusos:*");
    (pacote.inclusos || []).forEach(i => lines.push(`• ${i}`));
  } else if (builderData) {
    lines.push("📦 *Pacote Customizado pelo Builder*");
    lines.push("");
    if (builderData.matches && builderData.matches.length) {
      lines.push("*Jogos selecionados:*");
      builderData.matches.forEach(m => {
        const d = m.date instanceof Date ? m.date : new Date(m.date);
        const dt = `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}`;
        lines.push(`• ${dt} · ${m.time} · ${m.teamADisplay} vs ${m.teamBDisplay}`);
        lines.push(`   📍 ${m.city.city} · ${m.city.stadium}`);
      });
      lines.push("");
    }
    if (builderData.flightClass) lines.push(`✈️ *Voo:* ${builderData.flightClass}`);
    if (builderData.hotelStars)  lines.push(`🏨 *Hotel:* ${builderData.hotelStars}★`);
    if (builderData.option)      lines.push(`📅 *Modalidade:* ${builderData.option}`);
    if (builderData.estimate) {
      lines.push("");
      lines.push(`💰 *Estimativa:* R$ ${builderData.estimate.min.toLocaleString("pt-BR")} – R$ ${builderData.estimate.max.toLocaleString("pt-BR")}`);
    }
  }
  if (passengers) {
    lines.push("");
    lines.push("👥 *Passageiros:*");
    if (passengers.adults)   lines.push(`• ${passengers.adults} adulto(s)`);
    if (passengers.children) lines.push(`• ${passengers.children} criança(s)`);
    if (passengers.babies)   lines.push(`• ${passengers.babies} bebê(s) de colo`);
  }
  lines.push("");
  lines.push("_⚠️ Valores estimados sujeitos a confirmação._");
  lines.push("Aguardo retorno com cotação final. Obrigado!");
  return lines.join("\n");
}

// Função pra disparar envio direto pro WhatsApp configurado
function sendToWhatsApp({ pacote, builderData, passengers }) {
  const msg = buildWhatsAppMessage({ pacote, builderData, passengers });
  const url = waLink(msg);
  // Tenta GA4 event
  if (typeof gtag === "function") {
    try { gtag("event", pacote ? "select_package" : "complete_builder", {
      package_id: pacote?.id || "custom"
    }); } catch {}
  }
  window.open(url, "_blank", "noopener");
}

// Data oficial de abertura da Copa do Mundo 2026.
const KICKOFF_DATE = new Date("2026-06-11T18:00:00-04:00");

// ─── 6 pacotes principais (curadoria) ────────────────────────────
// Editáveis no painel admin. Preços com early-bird (-20%) sobre estimativa.
// `precoCheio` = referência sem desconto. `preco` = preço promocional.
const BASE_PACOTES = [
  {
    id: "mex-abertura",
    titulo: "Abertura no Azteca",
    cidadeSede: "Cidade do México",
    pais: "MEX",
    fase: "Jogo de Abertura",
    dataInicio: "10 jun", dataFim: "13 jun",
    dias: 4, preco: 11920, precoCheio: 14900,
    tag: "best", tagText: "🇲🇽 Estreia",
    selecao: "MEX",
    matchHighlight: "México x África do Sul · 11/jun",
    vagas: 24,
    image: "assets/pacotes/abertura.jpg",
    inclusos: [
      "Voo direto GRU→MEX (econômica)",
      "Hotel 4★ Reforma · 3 noites",
      "Ingresso categoria 3 · Jogo de Abertura",
      "Transfer aeroporto + estádio",
      "City tour Teotihuacán"
    ]
  },
  {
    id: "br-grupos",
    titulo: "Brasil na Fase de Grupos",
    cidadeSede: "Nova York · Filadélfia · Miami",
    pais: "USA",
    fase: "Fase de Grupos · Grupo C",
    dataInicio: "12 jun", dataFim: "25 jun",
    dias: 14, preco: 17920, precoCheio: 22400,
    tag: "best", tagText: "Mais vendido",
    selecao: "BRA",
    matchHighlight: "3 jogos do Brasil · Marrocos, Haiti, Escócia",
    vagas: 18,
    image: "assets/pacotes/brasil-grupos.jpg",
    inclusos: [
      "Voo executivo GRU→JFK",
      "Hotéis 4★ em 3 cidades · 13 noites",
      "3 ingressos categoria 2 (Brasil x Marrocos, Haiti, Escócia)",
      "Transfers entre cidades",
      "Guia brasileiro acompanhante"
    ]
  },
  {
    id: "argentina-jornada",
    titulo: "Jornada Argentina",
    cidadeSede: "Kansas City · Dallas · San Francisco",
    pais: "USA",
    fase: "Fase de Grupos · Grupo J",
    dataInicio: "15 jun", dataFim: "28 jun",
    dias: 14, preco: 16800, precoCheio: 21000,
    tag: "best", tagText: "🇦🇷 Hermanos",
    selecao: "ARG",
    matchHighlight: "3 jogos da Argentina (Argélia, Áustria, Jordânia)",
    vagas: 22,
    image: "assets/pacotes/argentina.jpg",
    inclusos: [
      "Voo direto GRU→DFW",
      "Hotéis 4★ em 3 cidades",
      "3 ingressos categoria 2",
      "Transfers privativos",
      "City tours em cada cidade"
    ]
  },
  {
    id: "oitavas-grandes",
    titulo: "Oitavas em Nova York",
    cidadeSede: "Nova York / Nova Jersey",
    pais: "USA",
    fase: "Oitavas de Final",
    dataInicio: "04 jul", dataFim: "08 jul",
    dias: 5, preco: 21600, precoCheio: 27000,
    tag: "best", tagText: "🔥 Mata-mata",
    selecao: "BRA",
    matchHighlight: "Oitavas · 05/jul · MetLife Stadium",
    vagas: 12,
    image: "assets/pacotes/oitavas-ny.jpg",
    inclusos: [
      "Voo executivo GRU→JFK",
      "Hotel 5★ Times Square · 4 noites",
      "Ingresso categoria 2",
      "Tour Manhattan + Estátua da Liberdade",
      "Jantar em rooftop"
    ]
  },
  {
    id: "tour-tri-sede",
    titulo: "Roteiro Tri-Sede",
    cidadeSede: "EUA → México → Canadá",
    pais: "USA",
    fase: "Roteiro pelos 3 países",
    dataInicio: "11 jun", dataFim: "27 jun",
    dias: 17, preco: 47200, precoCheio: 59000,
    tag: "premium", tagText: "✨ Edição limitada",
    selecao: "MULTI",
    matchHighlight: "5 jogos · 3 países · 1 Copa",
    vagas: 8,
    image: "assets/pacotes/tri-sede.jpg",
    inclusos: [
      "3 voos executivos entre países",
      "Hotéis 5★ em 5 cidades",
      "5 ingressos categoria 1",
      "Concierge dedicado 24h",
      "Experiências exclusivas em cada cidade"
    ]
  },
  {
    id: "ny-final",
    titulo: "A Grande Final",
    cidadeSede: "Nova York / Nova Jersey",
    pais: "USA",
    fase: "Grande Final · MetLife Stadium",
    dataInicio: "16 jul", dataFim: "20 jul",
    dias: 5, preco: 30800, precoCheio: 38500,
    tag: "premium", tagText: "🏆 A FINAL",
    selecao: "FINAL",
    matchHighlight: "FINAL · 19/jul · 16h · MetLife Stadium",
    vagas: 6,
    image: "assets/pacotes/final.jpg",
    inclusos: [
      "Voo executivo GRU→JFK",
      "Hotel 5★ Manhattan · 4 noites",
      "Ingresso categoria 1 · GRANDE FINAL",
      "City tour VIP Manhattan",
      "Open bar pós-jogo + acesso lounge"
    ]
  }
];

// ─── 16 cidades-sede para a galeria ─────────────────────────────
// `span` define o tamanho do card no grid:
//   "xl" = ocupa 2 colunas + 2 linhas (cidades super-importantes)
//   "w"  = ocupa 2 colunas (importante)
//   "h"  = ocupa 2 linhas (destaque vertical)
//   ""   = 1 coluna x 1 linha (padrão)
// `image` é a URL da foto icônica (Unsplash, uso comercial livre).
// Pode ser sobrescrita pelo painel admin via slot `sede-N`.
const SEDES = [
  { city: "Nova York / NJ",      stadium: "MetLife Stadium",       country: "usa", span: "xl",
    image: "https://images.unsplash.com/photo-1496588152823-86ff7695e68f?w=1600&q=80",
    note: "Sede da GRANDE FINAL · 19/jul · MetLife" },
  { city: "Cidade do México",    stadium: "Estádio Azteca",        country: "mex", span: "w",
    image: "https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?w=1200&q=80",
    note: "Jogo de Abertura · 11/jun · Azteca" },
  { city: "Los Angeles",         stadium: "SoFi Stadium",          country: "usa", span: "h",
    image: "https://images.unsplash.com/photo-1444723121867-7a241cacace9?w=900&q=80",
    note: "Sede de Semifinal · Inglewood" },
  { city: "Miami",               stadium: "Hard Rock Stadium",     country: "usa", span: "w",
    image: "https://images.unsplash.com/photo-1535498730771-e735b998cd64?w=1200&q=80",
    note: "Disputa de 3º lugar · 18/jul" },
  { city: "Dallas",              stadium: "AT&T Stadium",          country: "usa", span: "h",
    image: "https://images.unsplash.com/photo-1545194445-dddb8f4487c6?w=900&q=80",
    note: "Sede de Semifinal · 14/jul" },
  { city: "Toronto",             stadium: "BMO Field",             country: "can", span: "",
    image: "https://images.unsplash.com/photo-1517090504586-fde19ea6066f?w=900&q=80",
    note: "Sede do Canadá · 1ª rodada" },
  { city: "Atlanta",             stadium: "Mercedes-Benz Stadium", country: "usa", span: "",
    image: "assets/cidades/atlanta.jpg",
    note: "Sede de Semifinal · 15/jul" },
  { city: "Vancouver",           stadium: "BC Place",              country: "can", span: "",
    image: "https://images.unsplash.com/photo-1559511260-66a654ae982a?w=900&q=80",
    note: "Cobertura retrátil · Pacífico" },
  { city: "Guadalajara",         stadium: "Estádio Akron",         country: "mex", span: "",
    image: "assets/cidades/guadalajara.jpg",
    note: "Vibe local mexicana autêntica" },
  { city: "Monterrey",           stadium: "Estádio BBVA",          country: "mex", span: "",
    image: "assets/cidades/monterrey.jpg",
    note: "Norte do México · Cerro de la Silla" },
  { city: "Kansas City",         stadium: "Arrowhead Stadium",     country: "usa", span: "",
    image: "assets/cidades/kansascity.jpg",
    note: "Argentina x Argélia · estreia 🇦🇷" },
  { city: "Filadélfia",          stadium: "Lincoln Financial",     country: "usa", span: "",
    image: "https://images.unsplash.com/photo-1569761316261-9a8696fa2ca3?w=900&q=80",
    note: "Sede de Brasil x Haiti · 19/jun" },
  { city: "Boston",              stadium: "Gillette Stadium",      country: "usa", span: "",
    image: "https://images.unsplash.com/photo-1501979376754-2ff867a4f659?w=900&q=80",
    note: "Foxborough · Costa Leste" },
  { city: "Seattle",             stadium: "Lumen Field",           country: "usa", span: "",
    image: "https://images.unsplash.com/photo-1438401171849-74ac270044ee?w=900&q=80",
    note: "Pacífico Noroeste · Lumen" },
  { city: "Houston",             stadium: "NRG Stadium",           country: "usa", span: "",
    image: "assets/cidades/houston.jpg",
    note: "Sede de Alemanha x Curaçao" },
  { city: "San Francisco",       stadium: "Levi's Stadium",        country: "usa", span: "",
    image: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=900&q=80",
    note: "Santa Clara · Silicon Valley" }
];

// Formata preço em BRL — "R$ 84.900"
function fmtBRL(n) {
  return "R$ " + n.toLocaleString("pt-BR");
}

// ═══════════════════════════════════════════════════════════════
// JOGOS · agenda completa da Copa 2026 (104 jogos)
// Formato 48 seleções: 12 grupos × 6 jogos = 72 fase de grupos +
// 16-avos (16) + oitavas (8) + quartas (4) + semi (2) + 3º (1) +
// final (1) = 104.
// Os times saem do sorteio — usamos os "slots" (A1, A2, etc).
// Datas e cidades são alocações realistas mas ilustrativas.
// ═══════════════════════════════════════════════════════════════

// 16 cidades-sede com info de fuso/estádio + região + visto
//   region: usada pra estimar horários de chegada e volta
//   visa:   'usa' (precisa I-160), 'can' (eTA/visto), 'mex' (não precisa pra BR)
const HOST_CITIES = [
  { id: "mex",  city: "Cidade do México",       stadium: "Estádio Azteca",        country: "MEX", region: "mex",      visa: "mex" },
  { id: "gua",  city: "Guadalajara",            stadium: "Estádio Akron",         country: "MEX", region: "mex",      visa: "mex" },
  { id: "mty",  city: "Monterrey",              stadium: "Estádio BBVA",          country: "MEX", region: "mex",      visa: "mex" },
  { id: "tor",  city: "Toronto",                stadium: "BMO Field",             country: "CAN", region: "east",     visa: "can" },
  { id: "van",  city: "Vancouver",              stadium: "BC Place",              country: "CAN", region: "west",     visa: "can" },
  { id: "nyc",  city: "Nova York / Nova Jersey",stadium: "MetLife Stadium",       country: "USA", region: "east",     visa: "usa" },
  { id: "lax",  city: "Los Angeles",            stadium: "SoFi Stadium",          country: "USA", region: "west",     visa: "usa" },
  { id: "mia",  city: "Miami",                  stadium: "Hard Rock Stadium",     country: "USA", region: "east",     visa: "usa" },
  { id: "dal",  city: "Dallas",                 stadium: "AT&T Stadium",          country: "USA", region: "central",  visa: "usa" },
  { id: "atl",  city: "Atlanta",                stadium: "Mercedes-Benz Stadium", country: "USA", region: "east",     visa: "usa" },
  { id: "phi",  city: "Filadélfia",             stadium: "Lincoln Financial",     country: "USA", region: "east",     visa: "usa" },
  { id: "kc",   city: "Kansas City",            stadium: "Arrowhead Stadium",     country: "USA", region: "central",  visa: "usa" },
  { id: "sea",  city: "Seattle",                stadium: "Lumen Field",           country: "USA", region: "west",     visa: "usa" },
  { id: "sfo",  city: "São Francisco Bay",      stadium: "Levi's Stadium",        country: "USA", region: "west",     visa: "usa" },
  { id: "hou",  city: "Houston",                stadium: "NRG Stadium",           country: "USA", region: "central",  visa: "usa" },
  { id: "bos",  city: "Boston / Foxborough",    stadium: "Gillette Stadium",      country: "USA", region: "east",     visa: "usa" }
];

// ─── REGRA DE DATAS DA VIAGEM ───────────────────────────────────
// Cada opção tem N dias ANTES do jogo e N dias DEPOIS.
// A chegada no destino e o retorno ao BR são ajustados por região
// (fuso + tipo de voo BR→destino):
//   east     (Costa Leste / Canadá Leste): ida no mesmo dia (voo noturno), volta +1
//   central  (Centro EUA):                  ida no mesmo dia, volta +1
//   west     (Costa Oeste / Canadá Oeste):  ida no mesmo dia (conexão pode estourar), volta +1
//   mex      (México):                       ida no mesmo dia, volta no mesmo dia
const TRIP_OPTIONS = [
  { id: "econ",   label: "Econômica", days: "3d / 2n", before: 1, after: 1, note: "Chega 1 dia antes, volta 1 dia depois" },
  { id: "segura", label: "Segura",    days: "4d / 3n", before: 2, after: 1, note: "Mais tranquilidade — chega 2 dias antes (recomendado)", recommended: true },
  { id: "premium",label: "Premium",   days: "6d / 5n", before: 3, after: 2, note: "Para curtir a cidade antes e depois do jogo" }
];

const FLIGHT_CLASSES = [
  { id: "econ",  label: "Econômica",      note: "Voo direto ou com 1 conexão",                multiplier: 1.0 },
  { id: "exec",  label: "Executiva",      note: "Lie-flat seats, lounge e fast-track",        multiplier: 2.4 },
  { id: "first", label: "Primeira Classe",note: "Cabine exclusiva, suíte privada onde houver", multiplier: 4.2 }
];

// Estimativa de preço por trecho (apenas referência — fechamento real
// é feito pelo atendente pelo WhatsApp).
const PRICE_BASE = {
  air: { east: 5800, central: 6200, west: 6700, mex: 3200 }, // aéreo BR→destino (econômica, ida+volta)
  hotel: { 3: 580, 4: 980, 5: 1850 } // diária média em BRL por categoria de estrelas
};

// Calcula todas as datas e duração para um pacote
function computeTripPlan({ matches, option, flightClass, hotelTier }) {
  if (!matches || !matches.length) return null;
  const sorted = [...matches].sort((a, b) => a.date - b.date);
  const firstMatch = sorted[0];
  const lastMatch = sorted[sorted.length - 1];
  const opt = TRIP_OPTIONS.find((o) => o.id === option) || TRIP_OPTIONS[1];

  // Saída do Brasil = data do PRIMEIRO jogo − (before)
  // Volta para o Brasil = data do ÚLTIMO jogo + (after)
  const depart = new Date(firstMatch.date);
  depart.setDate(depart.getDate() - opt.before);

  // Por padrão, voo BR→EUA/CAN é noturno: chega no dia seguinte na maior parte das vezes.
  // Mas pra simplificar e ser conservador, dizemos que a CHEGADA no destino
  // é no mesmo dia da partida (voo noturno chega de madrugada/manhã do mesmo dia local,
  // exceto para West Coast onde frequentemente chega no mesmo dia "sem virar").
  const region = firstMatch.city.region;
  const arrival = new Date(depart);
  // Para todas as regiões, na prática o passageiro "consome" 1 dia no voo +
  // ganha de volta pela diferença de fuso. Vamos exibir partida = mesma data
  // que o usuário escolheu (before = N dias antes), chegada = mesma data
  // (voo noturno). Volta sai 1 dia DEPOIS do jogo, chegada no BR conforme região.

  const returnFlight = new Date(lastMatch.date);
  returnFlight.setDate(returnFlight.getDate() + opt.after);

  const returnArrival = new Date(returnFlight);
  if (region === "mex") {
    // Volta direto pra BR — mesma data
  } else {
    // EUA/Canadá → BR atravessa noite: +1 dia
    returnArrival.setDate(returnArrival.getDate() + 1);
  }

  // Check-in no hotel: dia da chegada. Check-out: dia da volta.
  const checkin = new Date(arrival);
  const checkout = new Date(returnFlight);
  const nights = Math.max(1, Math.round((checkout - checkin) / 86400000));

  // Cidades únicas pela ordem dos jogos
  const cities = [];
  const seen = new Set();
  sorted.forEach((m) => {
    if (!seen.has(m.city.id)) { seen.add(m.city.id); cities.push(m.city); }
  });

  // Preço estimado (apenas referência)
  const fc = FLIGHT_CLASSES.find((f) => f.id === flightClass) || FLIGHT_CLASSES[0];
  const airBase = PRICE_BASE.air[region] || 6000;
  const airPrice = Math.round(airBase * fc.multiplier);
  const hotelDaily = PRICE_BASE.hotel[hotelTier] || 980;
  const hotelPrice = nights * hotelDaily;
  const ticketPrice = sorted.length * 1800; // Estimativa por ingresso
  const total = airPrice + hotelPrice + ticketPrice;

  return {
    matches: sorted,
    cities,
    option: opt,
    flightClass: fc,
    depart, arrival, returnFlight, returnArrival,
    checkin, checkout, nights,
    crossCity: cities.length > 1,
    needsVisa: cities.some((c) => c.visa === "usa" || c.visa === "can"),
    visaCountries: [...new Set(cities.map((c) => c.country).filter((c) => c !== "MEX"))],
    prices: { air: airPrice, hotel: hotelPrice, tickets: ticketPrice, total }
  };
}

const _flagEmoji = { USA: "🇺🇸", CAN: "🇨🇦", MEX: "🇲🇽" };
const _stageOrder = ["Grupos", "32-avos", "Oitavas", "Quartas", "Semifinal", "3º lugar", "Final"];

// ─── TABELA OFICIAL DA COPA 2026 (após sorteio de 05/dez/2025) ─────
// Fase de grupos COMPLETA com nomes reais das seleções.
// Mata-mata com cidades e horários definidos mas confrontos a definir.
// Horários em horário de Brasília (UTC-3).
function generateMatches() {
  const matches = [];
  let serial = 1;
  const C = (id) => HOST_CITIES.find((c) => c.id === id);

  function add(o) {
    matches.push({
      id: o.id,
      serial: serial++,
      date: new Date(o.date + "T00:00:00"),
      time: o.time,
      stage: o.stage,
      stageLabel: o.stageLabel,
      teamA: o.teamA, teamB: o.teamB,
      teamADisplay: o.teamADisplay, teamBDisplay: o.teamBDisplay,
      city: C(o.cityId),
      country: C(o.cityId).country,
      priceTier: o.priceTier,
      isFeatured: !!o.isFeatured,
      isBrazil:   !!o.isBrazil
    });
  }

  // Helper p/ identificar emoji da bandeira por país
  const FLAG = {
    "México": "🇲🇽", "África do Sul": "🇿🇦", "Coreia do Sul": "🇰🇷",
    "República Tcheca": "🇨🇿", "Rep. Tcheca": "🇨🇿",
    "Canadá": "🇨🇦", "Bósnia": "🇧🇦",
    "Estados Unidos": "🇺🇸", "EUA": "🇺🇸",
    "Paraguai": "🇵🇾", "Austrália": "🇦🇺", "Turquia": "🇹🇷",
    "Qatar": "🇶🇦", "Suíça": "🇨🇭",
    "Brasil": "🇧🇷", "Marrocos": "🇲🇦",
    "Haiti": "🇭🇹", "Escócia": "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
    "Alemanha": "🇩🇪", "Curaçao": "🇨🇼",
    "Holanda": "🇳🇱", "Japão": "🇯🇵",
    "Costa do Marfim": "🇨🇮", "Equador": "🇪🇨",
    "Suécia": "🇸🇪", "Tunísia": "🇹🇳",
    "Espanha": "🇪🇸", "Cabo Verde": "🇨🇻",
    "Bélgica": "🇧🇪", "Egito": "🇪🇬",
    "Arábia Saudita": "🇸🇦", "Uruguai": "🇺🇾",
    "Irã": "🇮🇷", "Nova Zelândia": "🇳🇿",
    "França": "🇫🇷", "Senegal": "🇸🇳",
    "Iraque": "🇮🇶", "Noruega": "🇳🇴",
    "Argentina": "🇦🇷", "Argélia": "🇩🇿",
    "Áustria": "🇦🇹", "Jordânia": "🇯🇴",
    "Portugal": "🇵🇹", "RD Congo": "🇨🇩", "Congo": "🇨🇩",
    "Inglaterra": "🏴󠁧󠁢󠁥󠁮󠁧󠁿", "Croácia": "🇭🇷",
    "Gana": "🇬🇭", "Panamá": "🇵🇦",
    "Uzbequistão": "🇺🇿", "Colômbia": "🇨🇴",
    "Itália": "🇮🇹"
  };
  const withFlag = (name) => `${name} ${FLAG[name] || ""}`.trim();

  // Mapeamento cidades brasileiras (no texto) → ids do HOST_CITIES
  const CITY_MAP = {
    "Cidade do México": "mex", "Guadalajara": "gua", "Monterrey": "mty",
    "Toronto": "tor", "Vancouver": "van",
    "Los Angeles": "lax", "San Francisco": "sfo", "Nova York": "nyc",
    "Boston": "bos", "Houston": "hou", "Dallas": "dal",
    "Filadélfia": "phi", "Atlanta": "atl", "Seattle": "sea",
    "Miami": "mia", "Kansas City": "kc"
  };

  // ── FASE DE GRUPOS (72 jogos) · 11/jun → 27/jun ─────────────────
  // Dados oficiais conforme sorteio FIFA de 05/dez/2025.
  // Formato: [data, hora, grupo, timeA, timeB, cidade]
  const GROUP_MATCHES = [
    // 11/06
    ["2026-06-11", "16:00", "A", "México",            "África do Sul",     "Cidade do México", "Abertura"],
    ["2026-06-11", "23:00", "A", "Coreia do Sul",     "República Tcheca",  "Guadalajara"],
    // 12/06
    ["2026-06-12", "16:00", "B", "Canadá",            "Bósnia",            "Toronto"],
    ["2026-06-12", "22:00", "D", "Estados Unidos",    "Paraguai",          "Los Angeles"],
    // 13/06
    ["2026-06-13", "01:00", "D", "Austrália",         "Turquia",           "Vancouver"],
    ["2026-06-13", "16:00", "B", "Qatar",             "Suíça",             "San Francisco"],
    ["2026-06-13", "19:00", "C", "Brasil",            "Marrocos",          "Nova York"],
    ["2026-06-13", "22:00", "C", "Haiti",             "Escócia",           "Boston"],
    // 14/06
    ["2026-06-14", "14:00", "E", "Alemanha",          "Curaçao",           "Houston"],
    ["2026-06-14", "17:00", "F", "Holanda",           "Japão",             "Dallas"],
    ["2026-06-14", "20:00", "E", "Costa do Marfim",   "Equador",           "Filadélfia"],
    ["2026-06-14", "23:00", "F", "Suécia",            "Tunísia",           "Monterrey"],
    // 15/06
    ["2026-06-15", "13:00", "H", "Espanha",           "Cabo Verde",        "Atlanta"],
    ["2026-06-15", "16:00", "G", "Bélgica",           "Egito",             "Seattle"],
    ["2026-06-15", "19:00", "H", "Arábia Saudita",    "Uruguai",           "Miami"],
    ["2026-06-15", "22:00", "G", "Irã",               "Nova Zelândia",     "Los Angeles"],
    // 16/06
    ["2026-06-16", "16:00", "I", "França",            "Senegal",           "Nova York"],
    ["2026-06-16", "19:00", "I", "Iraque",            "Noruega",           "Boston"],
    ["2026-06-16", "22:00", "J", "Argentina",         "Argélia",           "Kansas City"],
    // 17/06
    ["2026-06-17", "01:00", "J", "Áustria",           "Jordânia",          "San Francisco"],
    ["2026-06-17", "14:00", "K", "Portugal",          "RD Congo",          "Houston"],
    ["2026-06-17", "17:00", "L", "Inglaterra",        "Croácia",           "Dallas"],
    ["2026-06-17", "20:00", "L", "Gana",              "Panamá",            "Toronto"],
    ["2026-06-17", "23:00", "K", "Uzbequistão",       "Colômbia",          "Cidade do México"],
    // 18/06
    ["2026-06-18", "13:00", "A", "Rep. Tcheca",       "África do Sul",     "Atlanta"],
    ["2026-06-18", "16:00", "B", "Suíça",             "Bósnia",            "Los Angeles"],
    ["2026-06-18", "19:00", "B", "Canadá",            "Qatar",             "Vancouver"],
    ["2026-06-18", "22:00", "A", "México",            "Coreia do Sul",     "Guadalajara"],
    // 19/06
    ["2026-06-19", "01:00", "D", "Turquia",           "Paraguai",          "San Francisco"],
    ["2026-06-19", "16:00", "D", "Estados Unidos",    "Austrália",         "Seattle"],
    ["2026-06-19", "19:00", "C", "Escócia",           "Marrocos",          "Boston"],
    ["2026-06-19", "22:00", "C", "Brasil",            "Haiti",             "Filadélfia"],
    // 20/06
    ["2026-06-20", "14:00", "F", "Holanda",           "Suécia",            "Houston"],
    ["2026-06-20", "17:00", "E", "Alemanha",          "Costa do Marfim",   "Toronto"],
    ["2026-06-20", "21:00", "E", "Equador",           "Curaçao",           "Kansas City"],
    // 21/06
    ["2026-06-21", "01:00", "F", "Tunísia",           "Japão",             "Monterrey"],
    ["2026-06-21", "13:00", "H", "Espanha",           "Arábia Saudita",    "Atlanta"],
    ["2026-06-21", "16:00", "G", "Bélgica",           "Irã",               "Los Angeles"],
    ["2026-06-21", "19:00", "H", "Uruguai",           "Cabo Verde",        "Miami"],
    ["2026-06-21", "22:00", "G", "Nova Zelândia",     "Egito",             "Vancouver"],
    // 22/06
    ["2026-06-22", "14:00", "J", "Argentina",         "Áustria",           "Dallas"],
    ["2026-06-22", "18:00", "I", "França",            "Iraque",            "Filadélfia"],
    ["2026-06-22", "21:00", "I", "Noruega",           "Senegal",           "Nova York"],
    // 23/06
    ["2026-06-23", "00:00", "J", "Jordânia",          "Argélia",           "San Francisco"],
    ["2026-06-23", "14:00", "K", "Portugal",          "Uzbequistão",       "Houston"],
    ["2026-06-23", "17:00", "L", "Inglaterra",        "Gana",              "Boston"],
    ["2026-06-23", "20:00", "L", "Panamá",            "Croácia",           "Toronto"],
    ["2026-06-23", "23:00", "K", "Colômbia",          "Congo",             "Guadalajara"],
    // 24/06
    ["2026-06-24", "16:00", "B", "Suíça",             "Canadá",            "Vancouver"],
    ["2026-06-24", "16:00", "B", "Itália",            "Qatar",             "Seattle"],
    ["2026-06-24", "19:00", "C", "Escócia",           "Brasil",            "Miami"],
    ["2026-06-24", "19:00", "C", "Marrocos",          "Haiti",             "Atlanta"],
    ["2026-06-24", "22:00", "A", "Rep. Tcheca",       "México",            "Cidade do México"],
    ["2026-06-24", "22:00", "A", "África do Sul",     "Coreia do Sul",     "Monterrey"],
    // 25/06
    ["2026-06-25", "17:00", "E", "Equador",           "Alemanha",          "Nova York"],
    ["2026-06-25", "17:00", "E", "Curaçao",           "Costa do Marfim",   "Filadélfia"],
    ["2026-06-25", "20:00", "F", "Tunísia",           "Holanda",           "Kansas City"],
    ["2026-06-25", "20:00", "F", "Japão",             "Suécia",            "Dallas"],
    ["2026-06-25", "23:00", "D", "Turquia",           "Estados Unidos",    "Los Angeles"],
    ["2026-06-25", "23:00", "D", "Paraguai",          "Austrália",         "San Francisco"],
    // 26/06
    ["2026-06-26", "16:00", "I", "Noruega",           "França",            "Boston"],
    ["2026-06-26", "16:00", "I", "Senegal",           "Iraque",            "Toronto"],
    ["2026-06-26", "21:00", "H", "Uruguai",           "Espanha",           "Guadalajara"],
    ["2026-06-26", "21:00", "H", "Cabo Verde",        "Arábia Saudita",    "Houston"],
    ["2026-06-26", "00:00", "G", "Egito",             "Irã",               "Seattle"],
    ["2026-06-26", "00:00", "G", "Nova Zelândia",     "Bélgica",           "Vancouver"],
    // 27/06
    ["2026-06-27", "18:00", "L", "Panamá",            "Inglaterra",        "Nova York"],
    ["2026-06-27", "18:00", "L", "Croácia",           "Gana",              "Filadélfia"],
    ["2026-06-27", "20:30", "K", "Colômbia",          "Portugal",          "Miami"],
    ["2026-06-27", "20:30", "K", "Congo",             "Uzbequistão",       "Atlanta"],
    ["2026-06-27", "23:00", "J", "Jordânia",          "Argentina",         "Dallas"],
    ["2026-06-27", "23:00", "J", "Argélia",           "Áustria",           "Kansas City"]
  ];

  GROUP_MATCHES.forEach((m, i) => {
    const [date, time, group, teamA, teamB, cityName, special] = m;
    const cityId = CITY_MAP[cityName];
    const isOpening = special === "Abertura";
    const isBrazil = teamA === "Brasil" || teamB === "Brasil";
    const isHost = ["México","Estados Unidos","Canadá"].includes(teamA) ||
                   ["México","Estados Unidos","Canadá"].includes(teamB);
    add({
      id: `g-${group}-${i+1}`,
      date, time,
      stage: "Grupos",
      stageLabel: isOpening
        ? "Grupo A · ABERTURA"
        : `Grupo ${group} · Fase de Grupos`,
      teamA, teamB,
      teamADisplay: withFlag(teamA),
      teamBDisplay: withFlag(teamB),
      cityId,
      priceTier: isOpening ? 3 : (isBrazil || isHost ? 2 : 1),
      isFeatured: isOpening || isBrazil || isHost,
      isBrazil
    });
  });

  // ── 32-AVOS · 28/jun → 03/jul (16 jogos) ────────────────────────
  // Confrontos serão definidos após classificação. Cidades reais já confirmadas.
  const KO32 = [
    ["2026-06-28", "16:00", "Los Angeles",      73],
    ["2026-06-29", "14:00", "Houston",          76],
    ["2026-06-29", "17:30", "Boston",           74],
    ["2026-06-29", "22:00", "Monterrey",        75],
    ["2026-06-30", "14:00", "Dallas",           78],
    ["2026-06-30", "18:00", "Nova York",        77],
    ["2026-06-30", "22:00", "Cidade do México", 79],
    ["2026-07-01", "13:00", "Atlanta",          80],
    ["2026-07-01", "17:00", "Seattle",          82],
    ["2026-07-01", "21:00", "San Francisco",    81],
    ["2026-07-02", "16:00", "Los Angeles",      84],
    ["2026-07-02", "20:00", "Toronto",          83],
    ["2026-07-02", "00:00", "Vancouver",        85],
    ["2026-07-03", "15:00", "Dallas",           88],
    ["2026-07-03", "19:00", "Miami",            86],
    ["2026-07-03", "22:30", "Kansas City",      87]
  ];
  KO32.forEach(([date, time, cityName, jogo], i) => {
    add({
      id: `ko32-${jogo}`,
      date, time,
      stage: "32-avos",
      stageLabel: `32-avos · Jogo ${jogo}`,
      teamA: `KO32-${jogo}A`, teamB: `KO32-${jogo}B`,
      teamADisplay: "A definir", teamBDisplay: "A definir",
      cityId: CITY_MAP[cityName],
      priceTier: 2, isFeatured: false, isBrazil: false
    });
  });

  // ── OITAVAS · 04/jul → 07/jul (8 jogos) ─────────────────────────
  const KO16 = [
    ["2026-07-04", "14:00", "Houston",          90],
    ["2026-07-04", "18:00", "Filadélfia",       89],
    ["2026-07-05", "17:00", "Nova York",        91],
    ["2026-07-05", "21:00", "Cidade do México", 92],
    ["2026-07-06", "16:00", "Dallas",           93],
    ["2026-07-06", "21:00", "Seattle",          94],
    ["2026-07-07", "13:00", "Atlanta",          95],
    ["2026-07-07", "17:00", "Vancouver",        96]
  ];
  KO16.forEach(([date, time, cityName, jogo]) => {
    add({
      id: `ko16-${jogo}`,
      date, time,
      stage: "Oitavas",
      stageLabel: `Oitavas · Jogo ${jogo}`,
      teamA: `KO16-${jogo}A`, teamB: `KO16-${jogo}B`,
      teamADisplay: "A definir", teamBDisplay: "A definir",
      cityId: CITY_MAP[cityName],
      priceTier: 3, isFeatured: true, isBrazil: false
    });
  });

  // ── QUARTAS · 09/jul → 11/jul (4 jogos) ─────────────────────────
  const QF = [
    ["2026-07-09", "17:00", "Boston",      97],
    ["2026-07-10", "16:00", "Los Angeles", 98],
    ["2026-07-11", "18:00", "Miami",       99],
    ["2026-07-11", "22:00", "Kansas City", 100]
  ];
  QF.forEach(([date, time, cityName, jogo]) => {
    add({
      id: `qf-${jogo}`,
      date, time,
      stage: "Quartas",
      stageLabel: `Quartas · Jogo ${jogo}`,
      teamA: `QF-${jogo}A`, teamB: `QF-${jogo}B`,
      teamADisplay: "A definir", teamBDisplay: "A definir",
      cityId: CITY_MAP[cityName],
      priceTier: 4, isFeatured: true, isBrazil: false
    });
  });

  // ── SEMIFINAIS · 14/jul · 15/jul ────────────────────────────────
  add({ id:"sf-101", date:"2026-07-14", time:"16:00", stage:"Semifinal",
    stageLabel:"Semifinal · Jogo 101", teamA:"SF1A", teamB:"SF1B",
    teamADisplay:"A definir", teamBDisplay:"A definir", cityId:"dal",
    priceTier:5, isFeatured:true });
  add({ id:"sf-102", date:"2026-07-15", time:"16:00", stage:"Semifinal",
    stageLabel:"Semifinal · Jogo 102", teamA:"SF2A", teamB:"SF2B",
    teamADisplay:"A definir", teamBDisplay:"A definir", cityId:"atl",
    priceTier:5, isFeatured:true });

  // ── 3º LUGAR · 18/jul · Miami ───────────────────────────────────
  add({ id:"third-103", date:"2026-07-18", time:"18:00", stage:"3º lugar",
    stageLabel:"Disputa de 3º lugar", teamA:"3L-A", teamB:"3L-B",
    teamADisplay:"A definir", teamBDisplay:"A definir", cityId:"mia",
    priceTier:5, isFeatured:true });

  // ── GRANDE FINAL · 19/jul · MetLife Stadium · Nova York ────────
  add({ id:"final-104", date:"2026-07-19", time:"16:00", stage:"Final",
    stageLabel:"🏆 GRANDE FINAL", teamA:"FA", teamB:"FB",
    teamADisplay:"A definir", teamBDisplay:"A definir", cityId:"nyc",
    priceTier:6, isFeatured:true });

  return matches.sort((a, b) => a.date - b.date || a.time.localeCompare(b.time));
}

const MATCHES = generateMatches();
// Atalhos públicos — admin edita esses arrays in-place via store.jsx
const PACOTES = BASE_PACOTES;

// Helpers de exibição
const _diasSemana = ["dom","seg","ter","qua","qui","sex","sáb"];
const _meses = ["jan","fev","mar","abr","mai","jun","jul","ago","set","out","nov","dez"];
function fmtDateShort(d) {
  return `${_diasSemana[d.getDay()]} ${String(d.getDate()).padStart(2,"0")}/${_meses[d.getMonth()]}`;
}
function fmtDateMedium(d) {
  return `${String(d.getDate()).padStart(2,"0")} de ${_meses[d.getMonth()]}`;
}

// Categorias de hotel
const HOTEL_TIERS = [
  { id: 3, stars: "★★★",   label: "3 estrelas", note: "Bem localizado, prático, ótimo custo" },
  { id: 4, stars: "★★★★",  label: "4 estrelas", note: "Conforto premium, café incluso" },
  { id: 5, stars: "★★★★★", label: "5 estrelas", note: "Topo de linha — vista, spa, concierge" }
];

// ─── BANCO DE HOTÉIS ─────────────────────────────────────────────
// Por cidade-sede: 3 opções para cada nível de estrela (3★/4★/5★).
// Nomes/bairros são plausíveis — confirme disponibilidade antes de
// fechar pacote. Edite livre aqui caso queira trocar opções.
// Total: 16 cidades × 3 níveis × 3 hotéis = 144 entradas.
const HOTELS = {
  mex: {
    3: [
      { name: "Hampton Inn Centro Histórico",     area: "Centro Histórico", note: "Café da manhã incluso, a 2 min da Catedral" },
      { name: "Holiday Inn Express Reforma",      area: "Reforma",          note: "Vista do Anjo, próximo ao metrô" },
      { name: "City Express Plus Buenavista",     area: "Buenavista",       note: "Boa relação custo-benefício, fácil deslocamento" }
    ],
    4: [
      { name: "Hilton Mexico City Reforma",       area: "Reforma",          note: "Piscina coberta, vista panorâmica" },
      { name: "Marriott Reforma",                 area: "Reforma",          note: "Andares altos, fitness center" },
      { name: "Camino Real Polanco",              area: "Polanco",          note: "Arquitetura icônica de Legorreta" }
    ],
    5: [
      { name: "Four Seasons Mexico City",         area: "Reforma",          note: "Jardins privativos, spa premiado" },
      { name: "The St. Regis Mexico City",        area: "Reforma",          note: "Mordomo 24h, vista do Anjo" },
      { name: "Las Alcobas, a Luxury Collection", area: "Polanco",          note: "Boutique luxo, design contemporâneo" }
    ]
  },
  gua: {
    3: [
      { name: "Holiday Inn Centro Histórico",     area: "Centro",      note: "Próximo ao Teatro Degollado" },
      { name: "Hampton Inn Guadalajara Expo",     area: "Expo",        note: "Em frente ao centro de convenções" },
      { name: "City Express Plus Providencia",    area: "Providencia", note: "Bairro tranquilo, boa gastronomia local" }
    ],
    4: [
      { name: "Hilton Guadalajara",               area: "Expo",        note: "Conectado à Expo, piscina no terraço" },
      { name: "Hyatt Regency Andares",            area: "Zapopan",     note: "Shopping integrado, vista da cidade" },
      { name: "Riu Plaza Guadalajara",            area: "Puerta de Hierro", note: "Piscina ao ar livre, all-inclusive opcional" }
    ],
    5: [
      { name: "Quinta Real Guadalajara",          area: "Providencia", note: "Suítes com jardim, gastronomia premiada" },
      { name: "Hotel Demetria",                   area: "Lafayette",   note: "Boutique de design, rooftop bar" },
      { name: "Casa Pedro Loza",                  area: "Centro",      note: "Mansão histórica restaurada, charme único" }
    ]
  },
  mty: {
    3: [
      { name: "Holiday Inn Express Tecnológico",  area: "Tecnológico", note: "Próximo ao Tec de Monterrey" },
      { name: "Hampton Inn Galerías",             area: "Valle",       note: "Conectado ao shopping" },
      { name: "City Express Plus Valle",          area: "Valle",       note: "Coração da San Pedro, vida noturna" }
    ],
    4: [
      { name: "Hilton Garden Inn Monterrey",      area: "Valle",       note: "Vista para o Cerro de la Silla" },
      { name: "Hyatt Regency Monterrey",          area: "Valle",       note: "Piscina infinity, spa completo" },
      { name: "Crowne Plaza Monterrey",           area: "Centro",      note: "Próximo à Macroplaza" }
    ],
    5: [
      { name: "Live Aqua Urban Resort Monterrey", area: "Valle",       note: "Rooftop com vista 360º, spa premium" },
      { name: "Hotel Habita MTY",                 area: "San Pedro",   note: "Design de Enrique Norten, piscina suspensa" },
      { name: "Quinta Real Monterrey",            area: "Valle",       note: "Suítes amplas, café da manhã gourmet" }
    ]
  },
  tor: {
    3: [
      { name: "Holiday Inn Express Downtown",     area: "Downtown",    note: "Caminhada para a CN Tower" },
      { name: "Hampton Inn King West",            area: "King West",   note: "Distrito gastronômico, café incluso" },
      { name: "Town Inn Suites",                  area: "Church-Yonge",note: "Suítes com cozinha, prático" }
    ],
    4: [
      { name: "Hyatt Regency Toronto",            area: "Entertainment", note: "Em frente ao Roy Thomson Hall" },
      { name: "Delta Hotels Toronto",             area: "Harbourfront",note: "Vista do lago Ontário" },
      { name: "Sheraton Centre Toronto",          area: "Financial",   note: "Piscina coberta-descoberta, central" }
    ],
    5: [
      { name: "Four Seasons Hotel Toronto",       area: "Yorkville",   note: "Spa de classe mundial, fine dining" },
      { name: "Shangri-La Toronto",               area: "Financial",   note: "Vistas espetaculares, serviço impecável" },
      { name: "The Ritz-Carlton Toronto",         area: "Entertainment", note: "Suítes amplas, piscina aquecida" }
    ]
  },
  van: {
    3: [
      { name: "Holiday Inn Vancouver Downtown",   area: "Downtown",    note: "A poucos passos do BC Place" },
      { name: "Sandman Hotel City Centre",        area: "Downtown",    note: "Café com Denny's no térreo" },
      { name: "Days Inn Vancouver Downtown",      area: "West End",    note: "Próximo a Stanley Park" }
    ],
    4: [
      { name: "Hyatt Regency Vancouver",          area: "Downtown",    note: "Conectado ao metrô SkyTrain" },
      { name: "Sheraton Wall Centre",             area: "Downtown",    note: "Duas torres, vista do oceano" },
      { name: "Pinnacle Hotel Harbourfront",      area: "Coal Harbour",note: "Frente ao porto, vista dos hidroaviões" }
    ],
    5: [
      { name: "Fairmont Pacific Rim",             area: "Coal Harbour",note: "Vista 360º do porto e montanhas" },
      { name: "Shangri-La Hotel Vancouver",       area: "Downtown",    note: "Spa CHI, mais alto da cidade" },
      { name: "Rosewood Hotel Georgia",           area: "Downtown",    note: "Histórico de 1927 restaurado, luxo discreto" }
    ]
  },
  nyc: {
    3: [
      { name: "Hampton Inn Manhattan Chelsea",    area: "Chelsea",     note: "Próximo à High Line" },
      { name: "Holiday Inn Express Midtown West", area: "Midtown",     note: "A 5 min da Times Square" },
      { name: "Comfort Inn Times Square",         area: "Times Square",note: "Bem localizado, pé na Broadway" }
    ],
    4: [
      { name: "The Westin Times Square",          area: "Times Square",note: "Vista da praça, lobby moderno" },
      { name: "New York Marriott Marquis",        area: "Times Square",note: "Restaurante giratório no topo" },
      { name: "Renaissance New York Midtown",     area: "Hell's Kitchen", note: "Boutique design, próximo ao Hudson" }
    ],
    5: [
      { name: "The St. Regis New York",           area: "Midtown East",note: "Mordomo dedicado, King Cole Bar" },
      { name: "Mandarin Oriental New York",       area: "Columbus Circle", note: "Vista do Central Park" },
      { name: "The Plaza Hotel",                  area: "Central Park South", note: "Ícone histórico, suítes lendárias" }
    ]
  },
  lax: {
    3: [
      { name: "Hampton Inn Santa Monica",         area: "Santa Monica",note: "A 2 quadras do píer" },
      { name: "Holiday Inn Express Hollywood",    area: "Hollywood",   note: "Próximo à Calçada da Fama" },
      { name: "Best Western Plus LAX",            area: "LAX",         note: "Shuttle gratuito ao aeroporto" }
    ],
    4: [
      { name: "The Westin Bonaventure",           area: "Downtown",    note: "5 torres de vidro icônicas" },
      { name: "Hyatt Regency LA Downtown",        area: "Downtown",    note: "Vista do Staples Center" },
      { name: "Sheraton Universal Hollywood",     area: "Universal",   note: "Em frente aos estúdios" }
    ],
    5: [
      { name: "The Beverly Hills Hotel",          area: "Beverly Hills", note: "Bangalôs lendários, Polo Lounge" },
      { name: "The Peninsula Beverly Hills",      area: "Beverly Hills", note: "Rolls-Royce próprio, spa premiado" },
      { name: "Waldorf Astoria Beverly Hills",    area: "Beverly Hills", note: "Rooftop com piscina e vista" }
    ]
  },
  mia: {
    3: [
      { name: "Hampton Inn Miami Brickell",       area: "Brickell",    note: "Distrito financeiro, próximo ao metrô" },
      { name: "Holiday Inn Port of Miami",        area: "Downtown",    note: "Frente ao porto de cruzeiros" },
      { name: "Best Western Plus Atlantic Beach", area: "North Beach", note: "Pé na areia, ótimo custo" }
    ],
    4: [
      { name: "Hilton Miami Downtown",            area: "Downtown",    note: "Vista da baía, piscina no terraço" },
      { name: "Hyatt Centric South Beach",        area: "South Beach", note: "Em Collins Avenue, agitação garantida" },
      { name: "Kimpton EPIC Hotel",               area: "Downtown",    note: "Piscina no terraço, área pet-friendly" }
    ],
    5: [
      { name: "The Setai Miami Beach",            area: "South Beach", note: "3 piscinas, sushi premiado" },
      { name: "Four Seasons The Surf Club",       area: "Surfside",    note: "Praia privativa, vibe vintage anos 30" },
      { name: "Mandarin Oriental Miami",          area: "Brickell Key",note: "Ilha exclusiva, spa de cobertura" }
    ]
  },
  dal: {
    3: [
      { name: "Hampton Inn Downtown Dallas",      area: "Downtown",    note: "Próximo ao Reunion Tower" },
      { name: "Holiday Inn Express Arlington",    area: "Arlington",   note: "A 5 min do AT&T Stadium" },
      { name: "La Quinta Inn Dallas Stadium",     area: "Arlington",   note: "Ótimo pra dia de jogo" }
    ],
    4: [
      { name: "Sheraton Dallas Hotel",            area: "Downtown",    note: "3 torres, área de eventos" },
      { name: "Hyatt Regency Dallas",             area: "Reunion",     note: "Conectado à Reunion Tower" },
      { name: "The Westin Dallas Downtown",       area: "Downtown",    note: "Vista da cidade, fitness premium" }
    ],
    5: [
      { name: "The Ritz-Carlton Dallas",          area: "Uptown",      note: "Suítes amplas, restaurante Fearing's" },
      { name: "Rosewood Mansion on Turtle Creek", area: "Turtle Creek",note: "Mansão histórica, fine dining lendário" },
      { name: "The Joule Hotel",                  area: "Downtown",    note: "Boutique de design, piscina suspensa" }
    ]
  },
  atl: {
    3: [
      { name: "Hampton Inn Downtown Atlanta",     area: "Downtown",    note: "Próximo ao Mercedes-Benz Stadium" },
      { name: "Holiday Inn Express Midtown",      area: "Midtown",     note: "Caminhada ao High Museum" },
      { name: "Hotel Indigo Atlanta Midtown",     area: "Midtown",     note: "Design boutique, bairro vibrante" }
    ],
    4: [
      { name: "Hyatt Regency Atlanta",            area: "Downtown",    note: "Lobby atrium icônico" },
      { name: "Sheraton Atlanta Hotel",           area: "Downtown",    note: "Piscina interna-externa" },
      { name: "Renaissance Atlanta Midtown",      area: "Midtown",     note: "Acesso fácil à MARTA" }
    ],
    5: [
      { name: "The St. Regis Atlanta",            area: "Buckhead",    note: "Piscina-jardim, mordomo dedicado" },
      { name: "Four Seasons Atlanta",             area: "Midtown",     note: "Suítes panorâmicas, spa premiado" },
      { name: "The Whitley, a Luxury Collection", area: "Buckhead",    note: "Recém-renovado, bar premiado" }
    ]
  },
  phi: {
    3: [
      { name: "Hampton Inn Convention Center",    area: "Center City", note: "Bem central, café incluso" },
      { name: "Holiday Inn Express Midtown",      area: "Midtown",     note: "Próximo ao City Hall" },
      { name: "Comfort Inn Downtown Historic",    area: "Old City",    note: "Histórico, perto da Liberty Bell" }
    ],
    4: [
      { name: "Sheraton Philadelphia Downtown",   area: "Center City", note: "Em frente ao Logan Square" },
      { name: "Le Méridien Philadelphia",         area: "Center City", note: "Boutique elegante" },
      { name: "Hyatt Centric Center City",        area: "Avenue of the Arts", note: "Distrito teatral" }
    ],
    5: [
      { name: "The Ritz-Carlton Philadelphia",    area: "Avenue of the Arts", note: "Antigo banco neoclássico" },
      { name: "Four Seasons Philadelphia at Comcast", area: "Center City", note: "Mais alto da cidade, spa no 60º andar" },
      { name: "The Rittenhouse Hotel",            area: "Rittenhouse Square", note: "Square mais elegante, serviço impecável" }
    ]
  },
  kc: {
    3: [
      { name: "Hampton Inn Country Club Plaza",   area: "Plaza",        note: "Próximo ao distrito de compras" },
      { name: "Holiday Inn Express Downtown",     area: "Downtown",     note: "Próximo ao Power & Light" },
      { name: "La Quinta Inn Stadium",            area: "Sports Complex", note: "Pertinho do Arrowhead" }
    ],
    4: [
      { name: "The Westin Crown Center",          area: "Crown Center", note: "Conectado a Hallmark/Crayola" },
      { name: "Sheraton Suites Country Club",     area: "Plaza",        note: "Só suítes, à beira do parque" },
      { name: "Hyatt Place Power & Light",        area: "Downtown",     note: "No coração da vida noturna" }
    ],
    5: [
      { name: "The Fontaine",                     area: "Plaza",        note: "Boutique design, piscina no terraço" },
      { name: "InterContinental Kansas City",     area: "Plaza",        note: "Suítes vista plaza, restaurante premiado" },
      { name: "Hotel Phillips, Curio Collection", area: "Downtown",     note: "Art Déco histórico restaurado" }
    ]
  },
  sea: {
    3: [
      { name: "Hampton Inn Downtown Seattle",     area: "Downtown",     note: "Próximo ao Pike Place Market" },
      { name: "Holiday Inn Express City Center",  area: "Downtown",     note: "Café americano incluso" },
      { name: "Best Western Pioneer Square",      area: "Pioneer Square", note: "Distrito histórico" }
    ],
    4: [
      { name: "The Westin Seattle",               area: "Downtown",     note: "Torres cilíndricas, vista da baía" },
      { name: "Hyatt Regency Seattle",            area: "Downtown",     note: "Hotel mais alto do Pacífico Noroeste" },
      { name: "Sheraton Grand Seattle",           area: "Downtown",     note: "Piscina coberta, conectado a shopping" }
    ],
    5: [
      { name: "Four Seasons Hotel Seattle",       area: "Downtown",     note: "Vista da Elliott Bay, spa Spa du Soleil" },
      { name: "The Edgewater Hotel",              area: "Waterfront",   note: "Único hotel sobre as águas da baía" },
      { name: "Fairmont Olympic Hotel",           area: "Downtown",     note: "Patrimônio histórico, lobby icônico" }
    ]
  },
  sfo: {
    3: [
      { name: "Hampton Inn Suites Santa Clara",   area: "Santa Clara",  note: "Próximo ao Levi's Stadium" },
      { name: "Holiday Inn Express San Jose",     area: "San Jose",     note: "A 15 min do estádio" },
      { name: "Best Western Plus Sunnyvale",      area: "Sunnyvale",    note: "Boa logística pelo Vale do Silício" }
    ],
    4: [
      { name: "Hyatt Regency Santa Clara",        area: "Santa Clara",  note: "Conectado ao centro de convenções" },
      { name: "The Westin San Francisco Airport", area: "Millbrae",     note: "Vista da baía, fácil acesso ao SFO" },
      { name: "Hotel Nia Menlo Park",             area: "Menlo Park",   note: "Boutique design, próximo ao Facebook" }
    ],
    5: [
      { name: "Four Seasons Silicon Valley",      area: "East Palo Alto", note: "Suítes amplas, jantar premiado" },
      { name: "Rosewood Sand Hill",               area: "Menlo Park",   note: "Resort com vista das colinas" },
      { name: "The Ritz-Carlton Half Moon Bay",   area: "Half Moon Bay",note: "Costa do Pacífico, golfe à beira-mar" }
    ]
  },
  hou: {
    3: [
      { name: "Hampton Inn Downtown Houston",     area: "Downtown",     note: "Pertinho do Discovery Green" },
      { name: "Holiday Inn Express Stadium",      area: "South Loop",   note: "Próximo ao NRG Stadium" },
      { name: "La Quinta Galleria",               area: "Galleria",     note: "Distrito de compras" }
    ],
    4: [
      { name: "Hyatt Regency Houston",            area: "Downtown",     note: "Lobby atrium, vista de túnel" },
      { name: "The Westin Houston Galleria",      area: "Galleria",     note: "Conectado ao maior shopping do TX" },
      { name: "Hilton Americas-Houston",          area: "Downtown",     note: "Conectado ao centro de convenções" }
    ],
    5: [
      { name: "The Post Oak Hotel",               area: "Uptown",       note: "Apartamentos amplos, helipoint próprio" },
      { name: "Four Seasons Hotel Houston",       area: "Downtown",     note: "Spa premiado, fine dining" },
      { name: "The St. Regis Houston",            area: "Galleria",     note: "Mordomo dedicado, refeições no quarto" }
    ]
  },
  bos: {
    3: [
      { name: "Hampton Inn Boston Logan",         area: "East Boston",  note: "Shuttle gratuito ao aeroporto" },
      { name: "Holiday Inn Express Downtown",     area: "Downtown",     note: "Próximo ao Faneuil Hall" },
      { name: "Hyatt Place Boston Seaport",       area: "Seaport",      note: "Bairro novo e vibrante" }
    ],
    4: [
      { name: "The Westin Copley Place",          area: "Back Bay",     note: "Conectado ao Copley shopping" },
      { name: "Hyatt Regency Boston",             area: "Theater District", note: "Próximo ao Boston Common" },
      { name: "Sheraton Boston Hotel",            area: "Back Bay",     note: "Piscina coberta-descoberta" }
    ],
    5: [
      { name: "Four Seasons Hotel Boston",        area: "Back Bay",     note: "Vista do Public Garden" },
      { name: "Mandarin Oriental Boston",         area: "Back Bay",     note: "Em Boylston Street, spa premiado" },
      { name: "The Ritz-Carlton Boston",          area: "Theater District", note: "Suítes amplas, mordomo opcional" }
    ]
  }
};

// ─── CONFIGURAÇÕES EDITÁVEIS NO PAINEL ADMIN ─────────────────────
// Todos os campos abaixo podem ser sobrescritos via localStorage
// (chave "site_config_v1") através do painel /paineladmin.html.
const DEFAULT_SITE_CONFIG = {
  // ─── Contato / Empresa ─────────────────────────────────────────
  empresa: {
    nomeFantasia: "VOCÊ NA COPA",
    razaoSocial: "",
    cnpj: "",
    cadastur: "",
    telefone: "+55 11 5199-2968",
    whatsapp: "551151992968", // só dígitos, formato internacional
    email: "contato@vocenacopa.com.br",
    instagram: "@vocenacopa",
    instagramUrl: "https://instagram.com/vocenacopa",
    endereco: "São Paulo, SP"
  },
  // ─── SEO ────────────────────────────────────────────────────────
  seo: {
    title: "Pacotes Copa do Mundo 2026 — USA, México, Canadá",
    description: "Pacotes exclusivos para a Copa do Mundo 2026. Voos, hotéis 5★, ingressos e atendimento humano via WhatsApp. Parcele em até 18× sem juros.",
    keywords: "copa do mundo 2026, pacote copa, viagem copa 2026, ingressos copa, brasil copa 2026, MetLife Stadium, Azteca",
    ogImage: "" // URL pública pra OpenGraph
  },
  // ─── Analytics ─────────────────────────────────────────────────
  analytics: {
    ga4Id: "",        // ex: "G-XXXXXXXXXX"
    metaPixelId: "",  // ex: "1234567890"
    gtmId: ""         // ex: "GTM-XXXXXX"
  },
  // ─── Selos e Confiança ─────────────────────────────────────────
  selos: {
    abavMembro: false,
    iata: false,
    parceiros: ["FIFA Hospitality", "On Location Experiences"]
  },
  // ─── Estimativa de Preços (multiplicadores) ────────────────────
  estimativa: {
    cotacaoUSD: 5.30,       // BRL por USD
    margemMin: 0.85,        // -15% do estimado
    margemMax: 1.15,        // +15% do estimado
    // Voo base (USD) por região
    vooBase: {
      mex: 900, usa_east: 1100, usa_central: 1200, usa_west: 1500, can: 1300
    },
    // Classes de voo (multiplicador)
    classeMult: { eco: 1, premium: 1.8, exec: 3.5, first: 6 },
    // Hotel base por noite (USD) por cidade × estrelas
    hotelBase: {
      mex: { 3: 110, 4: 220, 5: 380 },
      gua: { 3: 90,  4: 180, 5: 320 },
      mty: { 3: 100, 4: 190, 5: 340 },
      tor: { 3: 180, 4: 320, 5: 580 },
      van: { 3: 170, 4: 310, 5: 550 },
      nyc: { 3: 260, 4: 450, 5: 780 },
      lax: { 3: 220, 4: 380, 5: 680 },
      mia: { 3: 200, 4: 360, 5: 650 },
      dal: { 3: 150, 4: 260, 5: 480 },
      atl: { 3: 140, 4: 250, 5: 460 },
      phi: { 3: 170, 4: 290, 5: 510 },
      kc:  { 3: 130, 4: 230, 5: 420 },
      sea: { 3: 180, 4: 310, 5: 560 },
      sfo: { 3: 240, 4: 410, 5: 720 },
      hou: { 3: 150, 4: 270, 5: 490 },
      bos: { 3: 220, 4: 380, 5: 670 }
    },
    // Multiplicador Copa (alta temporada)
    copaMultiplier: 1.6,
    // Ingresso (USD) por priceTier
    ticketBase: { 1: 200, 2: 350, 3: 500, 4: 700, 5: 1200, 6: 2500 },
    // Passageiros
    pessoaMult: { adulto: 1.0, crianca: 0.75, bebe: 0.10 }
  },
  // ─── Autenticação Admin ────────────────────────────────────────
  // Hash SHA-256 da senha. NÃO é criptografia forte — é "trava de porta".
  // Senha inicial: "admin123" → hash abaixo. Cliente troca no 1º acesso.
  auth: {
    username: "admin",
    passwordHash: "240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9", // SHA-256("admin123")
    sessionDurationHours: 8
  },

  // ─── Deploy / Integração ──────────────────────────────────────
  deploy: {
    vercelDeployHook: "",  // URL secreta do Vercel Deploy Hook
    lastDeployAt: null
  },

  // ─── Páginas legais (rich text) ────────────────────────────────
  paginas: {
    politicaPrivacidade: "Edite este texto no painel admin. Aqui vai a política de privacidade da sua agência conforme LGPD.",
    termosCondicoes:     "Edite este texto no painel admin. Aqui vão os termos e condições de uso dos pacotes.",
    sobre:               "Edite este texto no painel admin com a história da sua agência."
  },
  // ─── FAQ ───────────────────────────────────────────────────────
  faq: [
    { q: "Os ingressos da Copa já estão garantidos?",
      r: "Trabalhamos com revendedores credenciados pela FIFA (FIFA Hospitality, On Location). Os ingressos são confirmados após o pagamento da entrada do pacote." },
    { q: "Preciso de visto americano para a Copa 2026?",
      r: "Sim, brasileiros precisam de visto de turismo (B1/B2) para os EUA. Apoiamos no processo de aplicação. Para México e Canadá, o brasileiro precisa apenas de autorização eletrônica." },
    { q: "Posso cancelar o pacote?",
      r: "Sim, conforme nossa política de cancelamento. Cancelamentos com mais de 60 dias têm devolução de até 80% do valor pago. Detalhes nos Termos & Condições." },
    { q: "O pacote inclui seguro viagem?",
      r: "Sim, todos os pacotes incluem seguro viagem internacional com cobertura mínima de USD 100.000." },
    { q: "Como funciona o parcelamento?",
      r: "Parcelamos em até 18× sem juros no cartão de crédito, ou via Pix com 5% de desconto adicional." }
  ],
  // ─── Depoimentos ────────────────────────────────────────────────
  depoimentos: [
    { nome: "Ricardo Almeida", local: "São Paulo · SP", viagem: "Catar 2022 · Brasil x Suíça",
      texto: "Atendimento impecável. Pagaram cada detalhe que prometeram. Não trocaria por nada — quero ir com vocês de novo em 2026.",
      avatar: "" },
    { nome: "Mariana Costa", local: "Rio de Janeiro · RJ", viagem: "Rússia 2018",
      texto: "Já tinha viajado pela Copa antes por conta própria. A diferença de ter um time cuidando de tudo, especialmente do ingresso, é absurda.",
      avatar: "" },
    { nome: "Carlos & Família", local: "Belo Horizonte · MG", viagem: "Catar 2022 · 4 jogos",
      texto: "Levei minha esposa e dois filhos. O concierge dedicado fez toda a diferença com as crianças. Pacote tri-sede vale cada centavo.",
      avatar: "" }
  ]
};

// API simples pra ler config (com fallback pra default)
function getSiteConfig() {
  try {
    const saved = localStorage.getItem("site_config_v1");
    if (!saved) return DEFAULT_SITE_CONFIG;
    const parsed = JSON.parse(saved);
    // Deep merge raso (1 nível) com defaults pra cobrir campos novos
    const merged = { ...DEFAULT_SITE_CONFIG };
    Object.keys(parsed).forEach(k => {
      merged[k] = (typeof parsed[k] === "object" && !Array.isArray(parsed[k]))
        ? { ...DEFAULT_SITE_CONFIG[k], ...parsed[k] }
        : parsed[k];
    });
    return merged;
  } catch { return DEFAULT_SITE_CONFIG; }
}

function saveSiteConfig(cfg) {
  try {
    localStorage.setItem("site_config_v1", JSON.stringify(cfg));
    window.dispatchEvent(new CustomEvent("site-config-change", { detail: cfg }));
    return true;
  } catch { return false; }
}

// ─── ESTIMATIVA INTELIGENTE DE PREÇOS ──────────────────────────
// Calcula preço de pacote baseado em: cidade, classe de voo, hotel,
// nº noites, passageiros, antecedência, fase do jogo (priceTier).
// Retorna range (min/max) para mostrar como faixa.
function estimatePackagePrice({
  cityIds = [],
  flightClass = "eco",
  hotelStars = 4,
  nights = 5,
  adults = 2,
  children = 0,
  babies = 0,
  priceTier = 1,
  daysToTrip = 365  // dias até o jogo (afeta voo)
}) {
  const cfg = getSiteConfig();
  const est = cfg.estimativa;
  if (!cityIds.length) cityIds = ["nyc"];

  // 1) Voo
  const primaryCity = HOST_CITIES.find(c => c.id === cityIds[0]);
  const regionKey = primaryCity ? (
    primaryCity.country === "MEX" ? "mex" :
    primaryCity.country === "CAN" ? "can" :
    primaryCity.region === "east"    ? "usa_east"    :
    primaryCity.region === "central" ? "usa_central" : "usa_west"
  ) : "usa_east";
  let vooUSD = est.vooBase[regionKey] * (est.classeMult[flightClass] || 1);
  // Antecedência <60 dias = +25%
  if (daysToTrip < 60) vooUSD *= 1.25;
  // Cada cidade adicional = +US$ 300 voo interno
  vooUSD += Math.max(0, cityIds.length - 1) * 300;
  // Multiplicador Copa
  vooUSD *= est.copaMultiplier;

  // 2) Hotel
  let hotelUSD = 0;
  const nightsPerCity = Math.ceil(nights / cityIds.length);
  cityIds.forEach(cid => {
    const base = est.hotelBase[cid]?.[hotelStars] || 200;
    hotelUSD += base * nightsPerCity * est.copaMultiplier;
  });

  // 3) Ingressos
  const ticketUSD = (est.ticketBase[priceTier] || 200) * cityIds.length;

  // 4) Transfers/Extras (10% do total)
  const subtotalUSD = vooUSD + hotelUSD + ticketUSD;
  const extrasUSD = subtotalUSD * 0.10;

  // 5) Multiplicador de pessoas
  const peopleMult = adults * est.pessoaMult.adulto
                   + children * est.pessoaMult.crianca
                   + babies * est.pessoaMult.bebe;

  const totalUSD = (subtotalUSD + extrasUSD) * peopleMult;
  const totalBRL = totalUSD * est.cotacaoUSD;

  return {
    min: Math.round(totalBRL * est.margemMin),
    max: Math.round(totalBRL * est.margemMax),
    breakdown: {
      voo:    Math.round(vooUSD * peopleMult * est.cotacaoUSD),
      hotel:  Math.round(hotelUSD * peopleMult * est.cotacaoUSD),
      ingressos: Math.round(ticketUSD * peopleMult * est.cotacaoUSD),
      extras: Math.round(extrasUSD * peopleMult * est.cotacaoUSD)
    },
    usd: Math.round(totalUSD),
    brl: Math.round(totalBRL),
    pessoas: { adults, children, babies, total: adults + children + babies }
  };
}

// ════════════════════════════════════════════════════════════════
// AUTENTICAÇÃO ADMIN
// ────────────────────────────────────────────────────────────────
// SHA-256 client-side é "trava de porta" — afasta o curioso, NÃO
// é segurança forte. Em produção: combinar com Vercel Password
// Protection (https://vercel.com/docs/security/password-protection).
// ════════════════════════════════════════════════════════════════

// Hash SHA-256 usando Web Crypto API (built-in nos navegadores)
async function sha256(text) {
  const buf = new TextEncoder().encode(text);
  const hashBuf = await crypto.subtle.digest("SHA-256", buf);
  const arr = Array.from(new Uint8Array(hashBuf));
  return arr.map(b => b.toString(16).padStart(2, "0")).join("");
}

// Verifica se a senha bate com o hash salvo
async function checkPassword(password) {
  const cfg = getSiteConfig();
  const expected = cfg.auth?.passwordHash || "";
  if (!expected) return false;
  const got = await sha256(password);
  return got === expected;
}

// Atualiza usuário e/ou senha (salva hash, NUNCA senha em texto puro)
async function updateAuth({ username, newPassword }) {
  const cfg = getSiteConfig();
  if (!cfg.auth) cfg.auth = {};
  if (username) cfg.auth.username = username;
  if (newPassword) {
    cfg.auth.passwordHash = await sha256(newPassword);
  }
  return saveSiteConfig(cfg);
}

// Sessão de login (sessionStorage = some quando fecha aba)
const SESSION_KEY = "vnc:admin:session";

function isLoggedIn() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return false;
    const s = JSON.parse(raw);
    const cfg = getSiteConfig();
    const dur = (cfg.auth?.sessionDurationHours || 8) * 3600 * 1000;
    if (Date.now() - s.t > dur) {
      sessionStorage.removeItem(SESSION_KEY);
      return false;
    }
    return s.user === cfg.auth?.username;
  } catch { return false; }
}

function loginSession(username) {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ user: username, t: Date.now() }));
    return true;
  } catch { return false; }
}

function logoutSession() {
  try {
    sessionStorage.removeItem(SESSION_KEY);
    return true;
  } catch { return false; }
}

// ════════════════════════════════════════════════════════════════
// DEPLOY / EXPORT
// ════════════════════════════════════════════════════════════════

// Exporta TODA a configuração do site como JSON pra download
function exportSiteData() {
  const data = {
    version: 1,
    exportedAt: new Date().toISOString(),
    siteConfig: getSiteConfig(),
    // adicionar outros stores se quiser (jogos editados, pacotes editados, etc)
    adminPacotes: (() => { try { return JSON.parse(localStorage.getItem("vnc:adm:pacotes") || "null"); } catch { return null; } })(),
    adminJogos:   (() => { try { return JSON.parse(localStorage.getItem("vnc:adm:jogos") || "null"); } catch { return null; } })(),
    adminHoteis:  (() => { try { return JSON.parse(localStorage.getItem("vnc:adm:hoteis") || "null"); } catch { return null; } })(),
    mediaSlots:   (() => { try { return JSON.parse(localStorage.getItem("vnc:media:v1") || "null"); } catch { return null; } })()
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  a.download = `pacotes-copa-config-${stamp}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  return true;
}

// Importa do JSON
function importSiteData(jsonText) {
  try {
    const data = JSON.parse(jsonText);
    if (data.siteConfig)    saveSiteConfig(data.siteConfig);
    if (data.adminPacotes)  localStorage.setItem("vnc:adm:pacotes", JSON.stringify(data.adminPacotes));
    if (data.adminJogos)    localStorage.setItem("vnc:adm:jogos",   JSON.stringify(data.adminJogos));
    if (data.adminHoteis)   localStorage.setItem("vnc:adm:hoteis",  JSON.stringify(data.adminHoteis));
    if (data.mediaSlots)    localStorage.setItem("vnc:media:v1",    JSON.stringify(data.mediaSlots));
    return true;
  } catch (e) {
    console.error("Erro ao importar:", e);
    return false;
  }
}

// Dispara Vercel Deploy Hook (URL secreta cadastrada no admin)
async function triggerVercelDeploy() {
  const cfg = getSiteConfig();
  const url = cfg.deploy?.vercelDeployHook;
  if (!url || !/^https:\/\/api\.vercel\.com\//.test(url)) {
    throw new Error("URL do Deploy Hook inválida. Configure em Admin → Deploy.");
  }
  const res = await fetch(url, { method: "POST" });
  if (!res.ok) throw new Error(`Vercel respondeu ${res.status}`);
  // Atualiza timestamp
  cfg.deploy.lastDeployAt = new Date().toISOString();
  saveSiteConfig(cfg);
  if (typeof gtag === "function") gtag("event", "deploy_triggered");
  return await res.json().catch(() => ({}));
}

Object.assign(window, {
  sha256, checkPassword, updateAuth,
  isLoggedIn, loginSession, logoutSession,
  exportSiteData, importSiteData, triggerVercelDeploy
});

Object.assign(window, {
  DEFAULT_SITE_CONFIG, getSiteConfig, saveSiteConfig,
  estimatePackagePrice, buildWhatsAppMessage, sendToWhatsApp
});

Object.assign(window, { HOST_CITIES, MATCHES, HOTEL_TIERS, HOTELS, TRIP_OPTIONS, FLIGHT_CLASSES, computeTripPlan, fmtDateShort, fmtDateMedium, _diasSemana, _meses, _flagEmoji, _stageOrder });
Object.assign(window, { WHATSAPP_NUMBER, waLink, KICKOFF_DATE, PACOTES, SEDES, fmtBRL });


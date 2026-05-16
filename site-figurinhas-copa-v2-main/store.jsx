// ════════════════════════════════════════════════════════════════
// STORE · estado vivo dos pacotes e jogos
//
// Os arrays PACOTES e MATCHES (definidos em data.jsx) são MUTÁVEIS.
// O admin altera diretamente os objetos in-place; chamar saveAndBump()
// persiste em localStorage e notifica todos os componentes pra re-render.
//
// useDataVersion() é o hook que componentes públicos usam pra ouvir
// mudanças (devolve um número que muda sempre que algo é editado).
// ════════════════════════════════════════════════════════════════

const ADM_PKG_KEY    = "vnc:adm:pkgs:v1";
const ADM_MATCH_KEY  = "vnc:adm:matches:v1";
const ADM_BRAND_KEY  = "vnc:adm:brand:v1";

let _dataVersion = 0;
const _versionSubs = new Set();

function bumpDataVersion() {
  _dataVersion++;
  _versionSubs.forEach((fn) => fn(_dataVersion));
}

function useDataVersion() {
  const [v, setV] = React.useState(_dataVersion);
  React.useEffect(() => {
    const fn = (nv) => setV(nv);
    _versionSubs.add(fn);
    return () => _versionSubs.delete(fn);
  }, []);
  return v;
}

// Serializa Match (data é Date object → ISO string)
function serializeMatch(m) {
  return { ...m, date: m.date instanceof Date ? m.date.toISOString() : m.date,
                  city: m.city ? m.city.id : null };
}
function deserializeMatch(raw) {
  const out = { ...raw, date: new Date(raw.date) };
  if (typeof raw.city === "string") {
    const c = HOST_CITIES.find((x) => x.id === raw.city);
    if (c) { out.city = c; out.country = c.country; }
  }
  return out;
}

// ── Persistir tudo ─────────────────────────────────────────────
function savePackages() {
  try { localStorage.setItem(ADM_PKG_KEY, JSON.stringify(PACOTES)); } catch {}
}
function saveMatches() {
  try { localStorage.setItem(ADM_MATCH_KEY, JSON.stringify(MATCHES.map(serializeMatch))); } catch {}
}

// ── Hidratar (na carga) ───────────────────────────────────────
(function hydrate() {
  try {
    const pkgs = JSON.parse(localStorage.getItem(ADM_PKG_KEY) || "null");
    if (Array.isArray(pkgs)) {
      pkgs.forEach((p) => {
        const i = PACOTES.findIndex((x) => x.id === p.id);
        if (i >= 0) Object.assign(PACOTES[i], p);
      });
    }
    const m = JSON.parse(localStorage.getItem(ADM_MATCH_KEY) || "null");
    if (Array.isArray(m)) {
      m.forEach((raw) => {
        const i = MATCHES.findIndex((x) => x.id === raw.id);
        if (i >= 0) Object.assign(MATCHES[i], deserializeMatch(raw));
      });
    }
  } catch {}
})();

// ── API de edição (usada pelo painel admin) ───────────────────
function updatePackage(id, patch) {
  const p = PACOTES.find((x) => x.id === id);
  if (!p) return;
  Object.assign(p, patch);
  savePackages(); bumpDataVersion();
}

function updateMatch(id, patch) {
  const m = MATCHES.find((x) => x.id === id);
  if (!m) return;
  // Trata city por id
  if (typeof patch.city === "string") {
    const c = HOST_CITIES.find((x) => x.id === patch.city);
    if (c) { patch.city = c; patch.country = c.country; }
  }
  // Trata date string → Date
  if (typeof patch.date === "string") {
    patch.date = new Date(patch.date + (patch.date.length === 10 ? "T00:00:00" : ""));
  }
  Object.assign(m, patch);
  saveMatches(); bumpDataVersion();
}

// ─── HOTÉIS ───────────────────────────────────────────────
const ADM_HOTEL_KEY = "vnc:adm:hotels:v1";

function saveHotels() {
  try { localStorage.setItem(ADM_HOTEL_KEY, JSON.stringify(HOTELS)); } catch {}
}
function updateHotel(cityId, tier, idx, patch) {
  if (!HOTELS[cityId] || !HOTELS[cityId][tier]) return;
  const arr = HOTELS[cityId][tier];
  if (!arr[idx]) return;
  Object.assign(arr[idx], patch);
  saveHotels(); bumpDataVersion();
}
function reorderHotel(cityId, tier, fromIdx, toIdx) {
  const arr = HOTELS[cityId]?.[tier];
  if (!arr) return;
  if (toIdx < 0 || toIdx >= arr.length) return;
  const [it] = arr.splice(fromIdx, 1);
  arr.splice(toIdx, 0, it);
  saveHotels(); bumpDataVersion();
}
function setHotelAsBest(cityId, tier, idx) {
  // "Melhor" = posição 0 (default selecionada no carrinho)
  reorderHotel(cityId, tier, idx, 0);
}

// Hidrata HOTELS no boot
(function hydrateHotels() {
  try {
    const raw = JSON.parse(localStorage.getItem(ADM_HOTEL_KEY) || "null");
    if (raw && typeof raw === "object") {
      Object.keys(raw).forEach((cityId) => {
        if (!HOTELS[cityId]) return;
        [3,4,5].forEach((tier) => {
          if (Array.isArray(raw[cityId]?.[tier])) {
            HOTELS[cityId][tier] = raw[cityId][tier];
          }
        });
      });
    }
  } catch {}
})();

// Reset — volta tudo pros defaults (limpa localStorage)
function resetAllAdminData() {
  try {
    localStorage.removeItem(ADM_PKG_KEY);
    localStorage.removeItem(ADM_MATCH_KEY);
    localStorage.removeItem(ADM_BRAND_KEY);
    localStorage.removeItem(ADM_HOTEL_KEY);
  } catch {}
  // Re-load página pra restaurar dados originais
  window.location.reload();
}

// Export JSON — gera download dos overrides atuais
function exportAdminData() {
  const blob = new Blob([JSON.stringify({
    packages: PACOTES,
    matches: MATCHES.map(serializeMatch),
    hotels: HOTELS,
    exportedAt: new Date().toISOString()
  }, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `vocenacopa-dados-${Date.now()}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Import JSON — sobrescreve tudo
function importAdminData(json) {
  try {
    const data = typeof json === "string" ? JSON.parse(json) : json;
    if (Array.isArray(data.packages)) {
      data.packages.forEach((p) => {
        const i = PACOTES.findIndex((x) => x.id === p.id);
        if (i >= 0) Object.assign(PACOTES[i], p);
      });
    }
    if (Array.isArray(data.matches)) {
      data.matches.forEach((raw) => {
        const i = MATCHES.findIndex((x) => x.id === raw.id);
        if (i >= 0) Object.assign(MATCHES[i], deserializeMatch(raw));
      });
    }
    if (data.hotels && typeof data.hotels === "object") {
      Object.keys(data.hotels).forEach((cityId) => {
        if (HOTELS[cityId]) {
          [3,4,5].forEach((tier) => {
            if (Array.isArray(data.hotels[cityId]?.[tier])) {
              HOTELS[cityId][tier] = data.hotels[cityId][tier];
            }
          });
        }
      });
    }
    savePackages(); saveMatches(); saveHotels();
    bumpDataVersion();
    return true;
  } catch (e) {
    console.error("Import error:", e);
    return false;
  }
}

Object.assign(window, {
  useDataVersion, bumpDataVersion,
  updatePackage, updateMatch,
  updateHotel, reorderHotel, setHotelAsBest, saveHotels,
  savePackages, saveMatches,
  resetAllAdminData, exportAdminData, importAdminData
});

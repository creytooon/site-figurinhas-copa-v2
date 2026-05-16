// /api/live-data.js
// Vercel Serverless Function — devolve o conteúdo do live-data.json como
// um script JS que define window.LIVE_DATA_FROM_SERVER. Esse é o "banco
// de dados" público: TODOS os visitantes leem daqui.
//
// O arquivo live-data.json é commitado pelo /api/publish quando o admin
// clica em "Publicar mudanças".
//
// Por que servir como JS e não JSON?
//   1) Mesmo padrão do /api/marketing-config (que já funciona)
//   2) Permite injetar direto no window sem fetch + parse no cliente
//   3) Cache de edge: o navegador não bate na API, baixa direto do CDN

import fs from 'fs';
import path from 'path';

// Lê o arquivo do filesystem (vai estar embedded no deploy da Vercel)
function readLiveData() {
  try {
    // Em runtime na Vercel, o arquivo fica em process.cwd()
    const filePath = path.join(process.cwd(), 'live-data.json');
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('[live-data] erro lendo arquivo:', e);
  }
  return null;
}

export default function handler(req, res) {
  const data = readLiveData();

  // Cache de 1 minuto no edge, 1 hora stale (se a serverless falhar)
  // Curto o bastante pra atualizar rápido após um publish, mas longo
  // o bastante pra não bater na origem a cada PageView.
  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=3600');
  res.setHeader('Content-Type', 'application/javascript; charset=utf-8');

  if (!data) {
    // Sem live-data ainda → cliente cai no seed do data.jsx (comportamento atual)
    return res.status(200).send(
      `// live-data.json ainda não foi publicado pelo admin\n` +
      `window.LIVE_DATA_FROM_SERVER = null;\n`
    );
  }

  // Escapa para não permitir injeção via JSON (paranoia)
  const safe = JSON.stringify(data).replace(/</g, '\\u003c');
  res.status(200).send(
    `// live-data v${data._version || 0} — published ${data._publishedAt || 'never'}\n` +
    `window.LIVE_DATA_FROM_SERVER = ${safe};\n` +
    // Dispara um evento pra forçar componentes a re-renderizarem
    `if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {\n` +
    `  window.dispatchEvent(new CustomEvent('cc26:live-data-loaded'));\n` +
    `}\n`
  );
}

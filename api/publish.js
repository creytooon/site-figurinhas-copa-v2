// /api/publish.js
// Vercel Serverless Function — recebe dados do painel admin e commita
// no arquivo `live-data.json` do repo usando a API do GitHub.
//
// Variáveis de ambiente necessárias na Vercel:
//   GITHUB_TOKEN       — Personal Access Token (fine-grained, com permissão Contents:Read+Write)
//   GITHUB_REPO_OWNER  — ex.: "creytooon"
//   GITHUB_REPO_NAME   — ex.: "site-figurinhas-copa-v2"
//   GITHUB_BRANCH      — opcional, default "main"
//   ADMIN_PUBLISH_KEY  — senha que o painel manda no header pra autenticar
//
// Como funciona:
//   1) Painel manda POST com { products, coupons, store, shipping, banners, content }
//   2) Função lê o `live-data.json` atual do GitHub (pra pegar o "sha")
//   3) Função sobrescreve o arquivo com os novos dados (commit automático)
//   4) Vercel detecta o commit → faz redeploy automático → site atualiza

const GITHUB_API = 'https://api.github.com';

export default async function handler(req, res) {
  // CORS / Method
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // ── Autenticação: senha simples no header ──
  const adminKey = req.headers['x-admin-key'] || req.headers['X-Admin-Key'];
  const expectedKey = process.env.ADMIN_PUBLISH_KEY;
  if (!expectedKey) {
    return res.status(500).json({ error: 'Server not configured: ADMIN_PUBLISH_KEY missing' });
  }
  if (adminKey !== expectedKey) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // ── Validação do payload ──
  const { products, coupons, store, shipping, banners, content } = req.body || {};
  if (!products && !coupons && !store && !shipping && !banners && !content) {
    return res.status(400).json({ error: 'Payload vazio. Mande pelo menos um campo.' });
  }

  // ── Config do GitHub ──
  const token  = process.env.GITHUB_TOKEN;
  const owner  = process.env.GITHUB_REPO_OWNER;
  const repo   = process.env.GITHUB_REPO_NAME;
  const branch = process.env.GITHUB_BRANCH || 'main';

  if (!token || !owner || !repo) {
    return res.status(500).json({
      error: 'GitHub env vars missing',
      missing: { GITHUB_TOKEN: !token, GITHUB_REPO_OWNER: !owner, GITHUB_REPO_NAME: !repo },
    });
  }

  const filePath = 'live-data.json';
  const fileUrl = `${GITHUB_API}/repos/${owner}/${repo}/contents/${filePath}`;
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/vnd.github+json',
    'User-Agent': 'albumcopa-publisher',
  };

  try {
    // ── 1) Lê o arquivo atual pra pegar o SHA + dados existentes ──
    let currentSha = null;
    let currentData = {};
    try {
      const getResp = await fetch(`${fileUrl}?ref=${branch}`, { headers });
      if (getResp.ok) {
        const json = await getResp.json();
        currentSha = json.sha;
        try {
          const decoded = Buffer.from(json.content, 'base64').toString('utf-8');
          currentData = JSON.parse(decoded);
        } catch (e) {
          currentData = {};
        }
      }
      // se 404, arquivo ainda não existe — vamos criar do zero
    } catch (e) {
      console.warn('[publish] não foi possível ler arquivo atual:', e);
    }

    // ── 2) Merge: campos enviados sobrescrevem, demais são preservados ──
    const newData = {
      ...currentData,
      ...(products  !== undefined ? { products }  : {}),
      ...(coupons   !== undefined ? { coupons }   : {}),
      ...(store     !== undefined ? { store }     : {}),
      ...(shipping  !== undefined ? { shipping }  : {}),
      ...(banners   !== undefined ? { banners }   : {}),
      ...(content   !== undefined ? { content }   : {}),
      _publishedAt: new Date().toISOString(),
      _version: (currentData._version || 0) + 1,
    };

    const contentB64 = Buffer.from(JSON.stringify(newData, null, 2), 'utf-8').toString('base64');

    // ── 3) PUT no GitHub (atualiza ou cria o arquivo) ──
    const putBody = {
      message: `admin: publicar mudanças (v${newData._version})`,
      content: contentB64,
      branch,
      committer: {
        name: 'Painel Álbum Copa',
        email: 'admin@albumcopa.com',
      },
    };
    if (currentSha) putBody.sha = currentSha;

    const putResp = await fetch(fileUrl, {
      method: 'PUT',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify(putBody),
    });

    if (!putResp.ok) {
      const errBody = await putResp.text();
      console.error('[publish] GitHub PUT failed:', putResp.status, errBody);
      return res.status(502).json({
        error: 'Falha ao publicar no GitHub',
        status: putResp.status,
        detail: errBody.slice(0, 500),
      });
    }

    const putJson = await putResp.json();
    return res.status(200).json({
      ok: true,
      version: newData._version,
      publishedAt: newData._publishedAt,
      commitSha: putJson.commit && putJson.commit.sha,
      message: 'Publicado com sucesso. O site vai atualizar em ~30 segundos.',
    });
  } catch (e) {
    console.error('[publish] erro:', e);
    return res.status(500).json({ error: 'Erro interno', detail: String(e.message || e) });
  }
}

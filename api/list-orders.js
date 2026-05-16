// /api/list-orders.js
// Vercel Serverless Function — lista TODOS os pedidos para o admin.
// Combina orders.json (pedidos criados) + paid-orders.json (pedidos pagos)
// para dar uma visão unificada com status atualizado.
//
// GET /api/list-orders
//   Headers: X-Admin-Key: <ADMIN_PUBLISH_KEY>
//
// Retorna array de pedidos com status: 'awaiting_pix' | 'paid'

const GITHUB_API = 'https://api.github.com';

async function fetchFile(owner, repo, branch, filePath, token) {
  const url = `${GITHUB_API}/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}&_=${Date.now()}`;
  const resp = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github+json',
      'User-Agent': 'albumcopa-list-orders',
    },
  });
  if (resp.status === 404) return { orders: [] };
  if (!resp.ok) throw new Error(`GitHub ${resp.status} for ${filePath}`);
  const json = await resp.json();
  try {
    const decoded = Buffer.from(json.content, 'base64').toString('utf-8');
    const data = JSON.parse(decoded);
    if (!Array.isArray(data.orders)) data.orders = [];
    return data;
  } catch (e) {
    return { orders: [] };
  }
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  // ── Auth ──
  const adminKey = req.headers['x-admin-key'] || req.headers['X-Admin-Key'];
  if (!process.env.ADMIN_PUBLISH_KEY) {
    return res.status(500).json({ ok: false, error: 'Server not configured' });
  }
  if (adminKey !== process.env.ADMIN_PUBLISH_KEY) {
    return res.status(401).json({ ok: false, error: 'Unauthorized' });
  }

  const token  = process.env.GITHUB_TOKEN;
  const owner  = process.env.GITHUB_REPO_OWNER;
  const repo   = process.env.GITHUB_REPO_NAME;
  const branch = process.env.GITHUB_BRANCH || 'main';
  if (!token || !owner || !repo) {
    return res.status(500).json({ ok: false, error: 'GitHub config missing' });
  }

  try {
    // Busca os dois arquivos em paralelo
    const [ordersData, paidData] = await Promise.all([
      fetchFile(owner, repo, branch, 'orders.json', token).catch(() => ({ orders: [] })),
      fetchFile(owner, repo, branch, 'paid-orders.json', token).catch(() => ({ orders: [] })),
    ]);

    // Cria um mapa dos pedidos pagos para enriquecer os normais
    const paidMap = {};
    (paidData.orders || []).forEach((p) => { paidMap[String(p.id)] = p; });

    // Unifica
    const allOrders = (ordersData.orders || []).map((o) => {
      const paid = paidMap[String(o.id)];
      if (paid) {
        return {
          ...o,
          ...paid,
          status: 'Pago',
          status_code: 'paid',
          paidAt: paid.paidAt,
        };
      }
      return {
        ...o,
        status_code: o.status_code || 'awaiting_pix',
      };
    });

    // Adiciona pedidos que estão em paid-orders mas não em orders (raro mas possível)
    (paidData.orders || []).forEach((p) => {
      if (!allOrders.find((o) => String(o.id) === String(p.id))) {
        allOrders.push({ ...p, status: 'Pago', status_code: 'paid' });
      }
    });

    // Ordena por data de criação (mais recentes primeiro)
    allOrders.sort((a, b) => {
      const da = new Date(a._createdAt || a.date || 0).getTime();
      const db = new Date(b._createdAt || b.date || 0).getTime();
      return db - da;
    });

    res.setHeader('Cache-Control', 'no-store, max-age=0');
    return res.status(200).json({
      ok: true,
      orders: allOrders,
      total: allOrders.length,
      _fetchedAt: new Date().toISOString(),
    });
  } catch (e) {
    console.error('[list-orders] erro:', e);
    return res.status(500).json({ ok: false, error: String(e.message || e) });
  }
}

// /api/mark-paid.js
// Vercel Serverless Function — marca um pedido como pago, gravando em
// paid-orders.json no GitHub. Protegida por ADMIN_PUBLISH_KEY.
//
// POST /api/mark-paid
//   Headers: X-Admin-Key: <ADMIN_PUBLISH_KEY>
//   Body: { order: { id, total, items, customer, ... } }
//
// Retorna { ok: true, paidLink: "/pedido-confirmado?order_id=XXX" }

const GITHUB_API = 'https://api.github.com';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
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

  // ── Payload ──
  const order = req.body && req.body.order;
  if (!order || !order.id) {
    return res.status(400).json({ ok: false, error: 'order.id requerido' });
  }

  const token  = process.env.GITHUB_TOKEN;
  const owner  = process.env.GITHUB_REPO_OWNER;
  const repo   = process.env.GITHUB_REPO_NAME;
  const branch = process.env.GITHUB_BRANCH || 'main';
  if (!token || !owner || !repo) {
    return res.status(500).json({ ok: false, error: 'GitHub config missing' });
  }

  const filePath = 'paid-orders.json';
  const fileUrl = `${GITHUB_API}/repos/${owner}/${repo}/contents/${filePath}`;
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/vnd.github+json',
    'User-Agent': 'albumcopa-mark-paid',
  };

  try {
    // ── Lê arquivo atual (se existir) ──
    let currentSha = null;
    let currentData = { orders: [] };
    try {
      const getResp = await fetch(`${fileUrl}?ref=${branch}`, { headers });
      if (getResp.ok) {
        const json = await getResp.json();
        currentSha = json.sha;
        try {
          const decoded = Buffer.from(json.content, 'base64').toString('utf-8');
          currentData = JSON.parse(decoded);
          if (!Array.isArray(currentData.orders)) currentData.orders = [];
        } catch (e) { currentData = { orders: [] }; }
      }
    } catch (e) { /* 404 OK, vamos criar */ }

    // ── Verifica se já está pago (idempotência) ──
    const already = currentData.orders.find((o) => String(o.id) === String(order.id));
    if (already) {
      return res.status(200).json({
        ok: true,
        alreadyPaid: true,
        order: already,
        paidLink: `/pedido-confirmado?order_id=${encodeURIComponent(order.id)}`,
      });
    }

    // ── Adiciona o pedido ──
    const paidOrder = {
      id: order.id,
      total: order.total,
      items: (order.items || []).map((it) => ({
        id: it.id || (it.product && it.product.id),
        name: it.name || (it.product && (it.product.short || it.product.name)),
        price: it.price || (it.product && it.product.price) || 0,
        qty: it.qty || it.quantity || 1,
      })),
      customer: order.customer ? {
        name: order.customer.name,
        email: order.customer.email,
        phone: order.customer.phone,
      } : null,
      paidAt: new Date().toISOString(),
      status_code: 'paid',
      tracking_purchase_sent: false, // será marcado true quando o cliente abrir a página
    };
    currentData.orders.push(paidOrder);
    currentData._updatedAt = new Date().toISOString();

    const contentB64 = Buffer.from(JSON.stringify(currentData, null, 2), 'utf-8').toString('base64');

    const putBody = {
      message: `admin: marcar pedido ${order.id} como pago`,
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
      return res.status(502).json({ ok: false, error: 'GitHub PUT failed', detail: errBody.slice(0, 500) });
    }

    return res.status(200).json({
      ok: true,
      order: paidOrder,
      paidLink: `/pedido-confirmado?order_id=${encodeURIComponent(order.id)}`,
      message: 'Pedido marcado como pago. Envie o link de confirmação ao cliente.',
    });
  } catch (e) {
    console.error('[mark-paid]', e);
    return res.status(500).json({ ok: false, error: String(e.message || e) });
  }
}

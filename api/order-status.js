// /api/order-status.js
// Vercel Serverless Function — devolve o status de um pedido específico,
// consultando o arquivo `paid-orders.json` no GitHub (gerenciado por
// /api/mark-paid quando o admin marca um pedido como pago).
//
// É READ-ONLY e público. Cliente não consegue forjar status "paid"
// porque o status oficial vem do GitHub (controlado pelo admin).

const GITHUB_API = 'https://api.github.com';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  // pega order_id da query
  const orderId = req.query && (req.query.order_id || req.query.orderId);
  if (!orderId) {
    return res.status(400).json({ ok: false, error: 'order_id requerido' });
  }

  const token  = process.env.GITHUB_TOKEN;
  const owner  = process.env.GITHUB_REPO_OWNER;
  const repo   = process.env.GITHUB_REPO_NAME;
  const branch = process.env.GITHUB_BRANCH || 'main';

  if (!token || !owner || !repo) {
    return res.status(500).json({ ok: false, error: 'GitHub config missing' });
  }

  try {
    const url = `${GITHUB_API}/repos/${owner}/${repo}/contents/paid-orders.json?ref=${branch}`;
    const resp = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github+json',
        'User-Agent': 'albumcopa-order-status',
      },
    });

    if (!resp.ok) {
      // arquivo ainda não existe → nenhum pedido pago
      if (resp.status === 404) {
        return res.status(200).json({ ok: true, order: null, note: 'Sem pedidos pagos ainda' });
      }
      return res.status(502).json({ ok: false, error: 'GitHub indisponível' });
    }

    const json = await resp.json();
    const decoded = Buffer.from(json.content, 'base64').toString('utf-8');
    const data = JSON.parse(decoded);
    const order = (data.orders || []).find((o) => String(o.id) === String(orderId));

    if (!order) {
      return res.status(200).json({ ok: true, order: null });
    }

    // Sucesso: pedido encontrado no arquivo de pagos
    return res.status(200).json({
      ok: true,
      order: {
        ...order,
        status_code: 'paid', // por estar no arquivo paid-orders, está pago oficialmente
      },
    });
  } catch (e) {
    console.error('[order-status]', e);
    return res.status(500).json({ ok: false, error: String(e.message || e) });
  }
}

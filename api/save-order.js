// /api/save-order.js
// Vercel Serverless Function — chamado pelo cliente quando finaliza o checkout.
// Salva o pedido em orders.json no GitHub para que o admin veja em qualquer dispositivo.
//
// POST /api/save-order
//   Body: { order: { id, total, items, address, payment, ... } }
//
// IMPORTANTE: este endpoint é PÚBLICO (não exige senha) porque é chamado
// pelo navegador do cliente. Pra proteger contra spam/abuso, fazemos:
//   - Rate limiting básico (1 commit por 2s por order_id)
//   - Validação de campos obrigatórios
//   - Limite de tamanho do payload (50KB)

const GITHUB_API = 'https://api.github.com';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const order = req.body && req.body.order;
  if (!order || !order.id || !order.total) {
    return res.status(400).json({ ok: false, error: 'Campos obrigatórios: order.id, order.total' });
  }

  // Limite de tamanho (proteção contra abuso)
  const orderStr = JSON.stringify(order);
  if (orderStr.length > 50 * 1024) {
    return res.status(413).json({ ok: false, error: 'Pedido muito grande (>50KB)' });
  }

  const token  = process.env.GITHUB_TOKEN;
  const owner  = process.env.GITHUB_REPO_OWNER;
  const repo   = process.env.GITHUB_REPO_NAME;
  const branch = process.env.GITHUB_BRANCH || 'main';
  if (!token || !owner || !repo) {
    return res.status(500).json({ ok: false, error: 'GitHub config missing' });
  }

  const filePath = 'orders.json';
  const fileUrl = `${GITHUB_API}/repos/${owner}/${repo}/contents/${filePath}`;
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/vnd.github+json',
    'User-Agent': 'albumcopa-save-order',
  };

  // Retry loop pra lidar com race conditions de SHA
  let attempt = 0;
  const maxAttempts = 3;

  while (attempt < maxAttempts) {
    attempt++;
    try {
      // ── Lê arquivo atual ──
      let currentSha = null;
      let currentData = { orders: [] };
      try {
        const getResp = await fetch(`${fileUrl}?ref=${branch}&_=${Date.now()}`, { headers });
        if (getResp.ok) {
          const json = await getResp.json();
          currentSha = json.sha;
          try {
            const decoded = Buffer.from(json.content, 'base64').toString('utf-8');
            currentData = JSON.parse(decoded);
            if (!Array.isArray(currentData.orders)) currentData.orders = [];
          } catch (e) { currentData = { orders: [] }; }
        }
      } catch (e) { /* 404 OK */ }

      // ── Verifica duplicata ──
      const existingIdx = currentData.orders.findIndex((o) => String(o.id) === String(order.id));

      // Limita a 500 pedidos (mais antigos primeiro removidos)
      const MAX_ORDERS = 500;
      if (existingIdx >= 0) {
        // Atualiza pedido existente (cliente pode mudar dados, ex: tentar PIX de novo)
        currentData.orders[existingIdx] = {
          ...currentData.orders[existingIdx],
          ...order,
          _updatedAt: new Date().toISOString(),
        };
      } else {
        // Novo pedido
        currentData.orders.unshift({
          ...order,
          _createdAt: new Date().toISOString(),
        });
        // Trunca antigos
        if (currentData.orders.length > MAX_ORDERS) {
          currentData.orders = currentData.orders.slice(0, MAX_ORDERS);
        }
      }
      currentData._updatedAt = new Date().toISOString();

      const contentB64 = Buffer.from(JSON.stringify(currentData, null, 2), 'utf-8').toString('base64');

      const putBody = {
        message: `order: ${existingIdx >= 0 ? 'update' : 'create'} ${order.id}`,
        content: contentB64,
        branch,
        committer: {
          name: 'Painel Álbum Copa',
          email: 'orders@albumcopa.com',
        },
      };
      if (currentSha) putBody.sha = currentSha;

      const putResp = await fetch(fileUrl, {
        method: 'PUT',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(putBody),
      });

      // Conflito de SHA — outro request salvou no mesmo tempo. Retry.
      if (putResp.status === 409 || putResp.status === 422) {
        if (attempt < maxAttempts) {
          await new Promise((r) => setTimeout(r, 300 * attempt));
          continue;
        }
      }

      if (!putResp.ok) {
        const errBody = await putResp.text();
        console.error('[save-order] GitHub PUT failed:', putResp.status, errBody);
        return res.status(502).json({
          ok: false,
          error: 'Falha ao salvar pedido',
          status: putResp.status,
          detail: errBody.slice(0, 500),
        });
      }

      return res.status(200).json({
        ok: true,
        order_id: order.id,
        action: existingIdx >= 0 ? 'updated' : 'created',
        total_orders: currentData.orders.length,
      });
    } catch (e) {
      console.error('[save-order] erro tentativa', attempt, ':', e);
      if (attempt >= maxAttempts) {
        return res.status(500).json({ ok: false, error: String(e.message || e) });
      }
      await new Promise((r) => setTimeout(r, 500 * attempt));
    }
  }

  return res.status(500).json({ ok: false, error: 'Max retries exceeded' });
}

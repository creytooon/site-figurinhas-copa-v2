# 🎯 Funil de conversão MINIMALISTA — instruções

## ✅ Eventos que disparam

| Etapa | Quando | Eventos |
|---|---|---|
| 1 | Cliente abre site | `PageView` |
| 2 | Abre produto | `ViewContent` (Meta, TikTok) + `view_item` (Google) |
| 3 | Adiciona no carrinho | `AddToCart` |
| 4 | Vai pro checkout | `InitiateCheckout` + `begin_checkout` |
| 5 | PIX gerado | 🔇 **NADA** (silenciado) |
| 6 | Cliente clica "Já paguei" | 🔇 **NADA** (silenciado) |
| 7 | **Admin confirma + cliente abre link** | 💰 **Purchase** + **CompletePayment** + **conversion** |

**Só a venda real (etapa 7) conta como conversão.** Limpo, sem ruído.

---

## 📦 Arquivos (10 total)

**Novos:**
- `pages-paid.jsx` — página `/pedido-confirmado?order_id=XXX`
- `api/mark-paid.js` — endpoint pro admin marcar pago
- `api/order-status.js` — endpoint público que serve status (read-only)

**Alterados:**
- `marketing.js` — `trackPixGenerated` e `trackWhatsAppClick` SILENCIADOS
- `api/marketing-config.js` — labels novos (não usados nesse modo, mas ficam disponíveis)
- `admin-app.jsx` — botão **💰 Confirmar Pagamento** + modal + nova tabela
- `app.jsx` — rota `/pedido-confirmado`
- `pages-flow.jsx` — chamadas dos tracks no fluxo de checkout (que agora não disparam nada além do InitiateCheckout)
- `index.html` — carrega `pages-paid.jsx`
- `vercel.json` — rewrites `/pedido-confirmado` e `/obrigado`

---

## 🚀 Setup completo (10 minutos)

### Passo 1 — Subir tudo no GitHub
1. `Add file → Upload files`
2. Arrasta toda a pasta `SUBIR-NO-GITHUB/` (mantém a subpasta `api/`)
3. Commit: `feat: funil minimalista (Purchase só após pagamento confirmado)`

### Passo 2 — Aguardar deploy
Vercel detecta o commit, faz deploy automático em ~30s. Aguarda ficar verde "Ready".

### Passo 3 — Redeploy sem cache (recomendado)
Vercel → Deployments → último → ⋯ → **Redeploy** → **DESMARCA** "Use existing Build Cache" → Redeploy.

### Passo 4 — Validar Marketing & Anúncios
Em janela anônima, abra `albumcopa.com/paineldodono#marketing`. Aba **🌍 EM PRODUÇÃO** deve mostrar:

```
📊 GOOGLE ADS
GOOGLE_ADS_CONVERSION_ID     AW-1•••••2902    ✅
GOOGLE_ADS_PURCHASE_LABEL    8Bdb••••••s5pD   ✅

📘 META PIXEL
META_PIXEL_ID                9878••••9802     ✅

🎵 TIKTOK PIXEL
TIKTOK_PIXEL_ID              D83C••••KJ51G    ✅
```

---

## 🧪 Como testar

### Teste 1 — Funil sem Purchase (no checkout)

1. Janela anônima → instale **Meta Pixel Helper** + **TikTok Pixel Helper**
2. `albumcopa.com` → adicione produto barato → checkout → preencha dados → finalize
3. Vai pra tela do PIX (não pague de verdade)
4. **Verificar nas extensões:**
   - Meta Pixel Helper: deve mostrar **PageView, ViewContent, AddToCart, InitiateCheckout** — **NADA mais**
   - TikTok Pixel Helper: idem
   - **NÃO deve mostrar:** `AddPaymentInfo`, `Lead`, `Purchase`, `CompletePayment`, `Contact` ✅

5. Clique "Já fiz o pagamento" pra simular
6. **Verificar de novo:** nenhum evento novo disparou ✅

### Teste 2 — Confirmar pagamento

1. Em outra aba → `albumcopa.com/paineldodono` → faça login → **Pedidos**
2. Encontre o pedido recém-criado
3. Clique no botão amarelo **💰 Confirmar Pagamento**
4. Modal abre → digita a senha de admin (`ADMIN_PUBLISH_KEY`)
5. Confirma → modal mostra **link único** tipo `https://albumcopa.com/pedido-confirmado?order_id=CC26-XXXXX`

### Teste 3 — Cliente abre link → Purchase dispara

1. Copia o link
2. Cola em **outra janela anônima** (simulando cliente)
3. **Aguarde 30-60 segundos** depois de confirmar (tempo do redeploy do GitHub)
4. Abre o link → vê página verde "PAGAMENTO CONFIRMADO ✅"
5. **No Meta Pixel Helper:** agora aparece **Purchase** com valor correto ✅
6. **No TikTok Pixel Helper:** **CompletePayment** com valor correto ✅
7. **Console (F12):** `[TRACKING] Purchase fired { ...order }` ✅

### Teste 4 — Dedup

1. Na mesma janela, F5 pra recarregar `/pedido-confirmado?order_id=XXX`
2. Console mostra: `[TRACKING] trackPurchasePaid IGNORADO — já trackeado`
3. Meta Pixel Helper **NÃO** mostra segundo Purchase ✅

### Teste 5 — Google Tag Assistant

1. Instale **Tag Assistant Companion** no Chrome
2. Repita o fluxo
3. Na página de confirmação, deve aparecer:
   - Evento `conversion` com `send_to: AW-18040552902/8BdbCLHjoqwcEMb7s5pD`
   - Evento `purchase` (GA4 fallback)

---

## 🔐 Sobre segurança

- `/api/mark-paid` exige header `X-Admin-Key` = sua senha → só você marca pago
- `/api/order-status` é público mas só retorna pedidos QUE ESTÃO no `paid-orders.json` no GitHub
- **Cliente não consegue forjar `?order_id=X`** pra disparar Purchase falso — a página `/pedido-confirmado` consulta o servidor primeiro e só dispara se confirmado
- Dedup duplo: `purchase_tracked_{order_id}` no localStorage + flag interna

---

## 💡 Workflow do dia a dia

```
1. Cliente compra → faz PIX → manda comprovante pelo WhatsApp
2. Você confere o PIX caiu na sua conta
3. Painel → Pedidos → 💰 Confirmar Pagamento → digita senha
4. Modal mostra link único → você copia
5. Cola no WhatsApp pro cliente, junto com:
   "Pagamento confirmado, obrigado! Veja a confirmação: [LINK]"
6. Cliente abre → Purchase dispara → conversão real registrada 🎯
```

⏱️ **Tempo:** ~30s entre você clicar "Confirmar" e o link estar pronto (deploy da Vercel).

---

## 🚨 Importante: NÃO precisa criar mais conversões no Google Ads

Como vc disse "só compra paga", o código **NÃO usa** as variáveis:
- `GOOGLE_ADS_PIX_LABEL` ❌ não precisa criar
- `GOOGLE_ADS_WHATSAPP_LABEL` ❌ não precisa criar

Suas variáveis atuais (`GOOGLE_ADS_CONVERSION_ID` + `GOOGLE_ADS_PURCHASE_LABEL`) são suficientes.

---

## 📝 Logs de debug (F12 → Console)

Durante o fluxo, você verá:
```
[TRACKING] InitiateCheckout fired ...
[TRACKING] PIX generated (NOT firing pixels — minimalist mode) { orderId, value }
[TRACKING] WhatsApp click (NOT firing pixels — minimalist mode) { orderId, value }
[TRACKING] Purchase fired { orderId, value, items }
```

Esses logs confirmam o comportamento minimalista: PIX e WhatsApp não disparam, só Purchase.

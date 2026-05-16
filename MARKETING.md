# 📊 Marketing & Anúncios — Guia de uso

Este documento explica as novas funcionalidades adicionadas ao site Álbum Copa 2026 para suportar anúncios pagos (Google Ads, Meta Ads, TikTok Ads) e a nova landing page de marketing.

---

## 🎯 O que foi adicionado

1. **Sistema de tracking centralizado** (`marketing.js`)
   Dispara os pixels do Google Ads, Meta e TikTok automaticamente ao longo do funil.
2. **Painel admin → aba "Marketing & Anúncios"**
   Onde você cola os IDs/etiquetas de cada plataforma.
3. **Landing page dedicada** (`/oferta`, `/promo`, `/copa`)
   Página otimizada para conversão, focada em campanhas pagas.
4. **Captura automática de UTMs** (utm_source, utm_medium, utm_campaign, gclid, fbclid, ttclid).

---

## 🔧 Como configurar (passo a passo)

### 1. Acesse o painel admin

Entre em `https://seusite.com/admin` (ou `/painel`) e faça login.

### 2. Vá em "Marketing & Anúncios"

No menu lateral esquerdo, clique na nova aba **Marketing & Anúncios** (com a badge ADS).

### 3. Cole os IDs

#### 📊 Google Ads
- Em **Google Ads**, vá em: **Ferramentas → Conversões → [sua ação de conversão] → Instalar tag por conta própria**.
- Copie o **ID de conversão** (formato `AW-1234567890`) e cole no campo correspondente.
- Copie a **Etiqueta de conversão** (formato `abcdEFGhiJ`) e cole no campo "Etiqueta — Compra".

#### 📘 Meta Pixel (Facebook & Instagram)
- Em **Meta Business → Gerenciador de Eventos** → seu pixel → **Configurações**.
- Copie o **ID do Pixel** (15-16 dígitos numéricos) e cole no campo "ID do Pixel".
- (Opcional) Para testar antes de ir ao ar, gere um **Código de Teste** em "Testar Eventos" e cole no campo correspondente.

#### 🎵 TikTok Pixel
- Em **TikTok Ads Manager → Ativos → Eventos → Web** → seu pixel → **Configurações**.
- Copie o **ID do Pixel** (formato `C123ABC456DEF`) e cole no campo correspondente.

### 4. Salve

Clique em **"Salvar configurações de marketing"**. A partir desse momento, os pixels começam a carregar em todas as páginas.

### 5. Teste

Clique em **"Disparar evento de teste"**. Você deve ver ✅ em cada plataforma cujos IDs foram configurados. Para validar do lado das plataformas:
- **Google Ads**: instale a extensão *Tag Assistant Companion* no Chrome.
- **Meta**: instale a extensão *Meta Pixel Helper*.
- **TikTok**: instale a extensão *TikTok Pixel Helper*.

---

## 🚀 Eventos disparados automaticamente

Você **não precisa configurar nada manualmente** — os eventos disparam sozinhos:

| Quando | Google Ads | Meta Pixel | TikTok |
|---|---|---|---|
| Abrir qualquer página | `page_view` | `PageView` | `Pageview` |
| Ver produto | `view_item` | `ViewContent` | `ViewContent` |
| Adicionar ao carrinho | `add_to_cart` | `AddToCart` | `AddToCart` |
| Iniciar checkout | `begin_checkout` | `InitiateCheckout` | `InitiateCheckout` |
| **Pedido confirmado ★** | `conversion` + `purchase` | `Purchase` | `CompletePayment` |

★ **O evento de compra** é o que cada plataforma usa para otimizar suas campanhas. Ele dispara automaticamente quando o usuário chega na tela de "Pedido Confirmado", com o **valor real do pedido**, o **ID do pedido** (para deduplicação) e os **itens comprados**.

---

## 🛒 Página de marketing dedicada

Acesse `https://seusite.com/oferta` — uma landing page focada em conversão com:

- Hero com headline + countdown de 24h
- 4 benefícios principais (despacho 24h, compra segura, original, parcelamento)
- Depoimentos / prova social (3 reviews)
- Produto destaque com preço e CTA
- FAQ (5 perguntas)
- CTA final com gatilho de urgência (data da Copa)

**URLs equivalentes** (todas levam para a mesma landing):
- `/oferta`
- `/promo`
- `/copa`

**Use essas URLs nos seus anúncios** — assim você consegue ler nos relatórios qual campanha veio de qual URL.

### UTMs automáticos
Qualquer parâmetro `utm_*`, `gclid`, `fbclid` ou `ttclid` na URL é **salvo no navegador por 30 dias**. Eles ficam disponíveis em `window.MKT.getUTMs()` para você usar futuramente (ex.: passar pro WhatsApp na finalização do pedido).

Exemplo de URL de anúncio:
```
https://albumcopa.com/oferta?utm_source=google&utm_medium=cpc&utm_campaign=copa2026-brasil
```

---

## 🐛 Modo Debug

Na aba Marketing → "Debug & Teste", ative **"Modo debug"**. Todos os eventos passam a ser impressos no console do navegador (F12 → Console), com formato:

```
[mkt] AddToCart { content_ids: ['mega-100'], value: 299.90, ... }
[mkt] Purchase { orderId: 'CC26-123456', value: 599.80, ... }
```

Útil para validar **antes** de gastar dinheiro em ads.

---

## 📝 Próximos passos (opcional, mais avançado)

### Conversions API (Meta) — server-side
Hoje os eventos são apenas client-side (browser). Para não perder conversões por causa de bloqueadores de cookies/ads, vale a pena implementar a **API de Conversões da Meta** lado-servidor. O código já envia o `eventID` igual ao ID do pedido — é só você implementar o webhook server e replicar o `Purchase` lá. Documentação: https://developers.facebook.com/docs/marketing-api/conversions-api

### Events API (TikTok) — server-side
Similar ao Meta CAPI. Mais info: https://business-api.tiktok.com/portal/docs

### Google Ads Enhanced Conversions
Para melhor mensuração no iOS/Safari, envie o e-mail do comprador (hasheado SHA-256) junto com o evento de conversão. Hoje o código envia só o valor — adaptação trivial no `marketing.js` se quiser.

---

## ❓ Troubleshooting

**"Salvei o ID mas não vejo eventos no Tag Assistant"**
1. Recarregue a página (F5).
2. Confirme que `Master switch` está em ON.
3. Confirme que o pixel específico está com checkbox marcado.
4. Veja o console do navegador (F12) com Debug mode ligado.

**"O Google Ads não está marcando conversões"**
- Verifique se você preencheu **TANTO** o ID de Conversão **QUANTO** a Etiqueta de Compra.
- Sem etiqueta, o gtag carrega mas o evento de `conversion` não tem `send_to` correto.

**"Eventos duplicados na Meta"**
- Se você implementar a Conversions API server-side, use o mesmo `eventID` (igual ao ID do pedido). O código já envia isso pelo lado do browser.

**"Página /oferta abre como 404"**
- Vá nas configurações da Vercel, force um redeploy. O `vercel.json` precisa estar atualizado.
- Localmente (sem Vercel), use `/#oferta` no lugar de `/oferta`.

---

## 📂 Arquivos alterados/criados nesta atualização

**Novos:**
- `marketing.js` — Sistema de tracking
- `marketing.css` — Estilos da landing page
- `pages-marketing.jsx` — Componente da landing `/oferta`

**Alterados:**
- `index.html` — Carrega `marketing.js`, `marketing.css` e `pages-marketing.jsx`
- `paineldodono.html` — Carrega `marketing.js`
- `app.jsx` — Rota `oferta`, conversão `/oferta` → `#oferta`, PageView SPA
- `admin-app.jsx` — Aba "Marketing & Anúncios" + componente `AdminMarketing`
- `data.jsx` — `trackAddToCart` no `cart.add()`
- `pages-flow.jsx` — `trackInitiateCheckout` no Checkout + `trackPurchase` na Confirmação
- `pages-shop.jsx` — `trackViewContent` na ProductPage
- `vercel.json` — Rewrites `/oferta`, `/promo`, `/copa`

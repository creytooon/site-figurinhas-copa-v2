// marketing.jsx — Tracking centralizado: Google Ads, Meta Pixel, TikTok Pixel
// Carregado ANTES de qualquer página. Lê IDs do localStorage (chave: cc26.adm.marketing)
// e injeta os snippets oficiais de cada plataforma. Em runtime, expõe window.MKT
// com funções uniformes: trackPageView, trackViewContent, trackAddToCart,
// trackInitiateCheckout, trackPurchase, trackLead, trackContact, trackCustom.

(function () {
  'use strict';

  const STORAGE_KEY = 'cc26.adm.marketing';

  // ─── Config padrão (vazia) ────────────────────────────────────────
  const DEFAULTS = {
    enabled: true,                   // master switch (desliga tudo de uma vez)
    googleAds: {
      enabled: true,
      conversionId: '',              // ex.: "AW-1234567890"
      purchaseLabel: '',             // COMPRA PAGA (principal) — só dispara após admin marcar como pago
      pixLabel: '',                  // PIX GERADO (secundária) — quando o pedido é criado
      whatsappLabel: '',             // WHATSAPP CLICK (secundária) — quando clica em "enviar comprovante"
      leadLabel: '',                 // genérico para leads/forms
    },
    metaPixel: {
      enabled: true,
      pixelId: '',                   // ex.: "123456789012345"
      testEventCode: '',             // opcional (usado nos testes do Gerenciador de Eventos)
    },
    tiktok: {
      enabled: true,
      pixelId: '',                   // ex.: "C123ABC456DEF"
    },
    debugMode: false,                // se true, imprime no console todos os eventos
  };

  function loadConfig() {
    // PRIORIDADE 1: env vars da Vercel (injetadas via /api/marketing-config).
    // Essas IDs valem para TODOS os visitantes do site em produção.
    if (typeof window !== 'undefined' && window.MARKETING_CONFIG_FROM_ENV) {
      const envCfg = window.MARKETING_CONFIG_FROM_ENV;
      return {
        ...DEFAULTS,
        ...envCfg,
        googleAds: { ...DEFAULTS.googleAds, ...(envCfg.googleAds || {}) },
        metaPixel: { ...DEFAULTS.metaPixel, ...(envCfg.metaPixel || {}) },
        tiktok:    { ...DEFAULTS.tiktok,    ...(envCfg.tiktok    || {}) },
      };
    }

    // PRIORIDADE 2: localStorage (admin local — preview/teste apenas).
    // Em desenvolvimento local sem env vars, ou se o admin quiser
    // experimentar IDs no próprio navegador antes de subir pra Vercel.
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return JSON.parse(JSON.stringify(DEFAULTS));
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULTS,
        ...parsed,
        googleAds: { ...DEFAULTS.googleAds, ...(parsed.googleAds || {}) },
        metaPixel: { ...DEFAULTS.metaPixel, ...(parsed.metaPixel || {}) },
        tiktok:    { ...DEFAULTS.tiktok,    ...(parsed.tiktok    || {}) },
      };
    } catch (e) {
      console.warn('[mkt] erro lendo config:', e);
      return JSON.parse(JSON.stringify(DEFAULTS));
    }
  }

  function saveConfig(cfg) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
      window.dispatchEvent(new CustomEvent('cc26:marketing-changed', { detail: cfg }));
      return true;
    } catch (e) {
      console.warn('[mkt] erro salvando config:', e);
      return false;
    }
  }

  // ─── Estado de carregamento dos pixels ────────────────────────────
  const loadState = {
    googleAds: { loaded: false, id: null },
    metaPixel: { loaded: false, id: null },
    tiktok:    { loaded: false, id: null },
  };

  function injectScript(src, attrs = {}) {
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src;
      s.async = true;
      Object.entries(attrs).forEach(([k, v]) => s.setAttribute(k, v));
      s.onload = () => resolve();
      s.onerror = () => reject(new Error('Falha carregando ' + src));
      document.head.appendChild(s);
    });
  }

  // ─── Google Ads (gtag.js) ─────────────────────────────────────────
  function loadGoogleAds(conversionId) {
    if (!conversionId || loadState.googleAds.id === conversionId) return;
    if (loadState.googleAds.loaded && loadState.googleAds.id !== conversionId) {
      // Adiciona um config adicional ao gtag já carregado
      if (window.gtag) window.gtag('config', conversionId);
      loadState.googleAds.id = conversionId;
      return;
    }

    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', conversionId);

    injectScript('https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(conversionId))
      .then(() => { loadState.googleAds.loaded = true; loadState.googleAds.id = conversionId; })
      .catch((e) => console.warn('[mkt][google-ads]', e));
  }

  // ─── Meta Pixel (fbq) ─────────────────────────────────────────────
  function loadMetaPixel(pixelId) {
    if (!pixelId || loadState.metaPixel.id === pixelId) return;

    if (!window.fbq) {
      // snippet oficial do Meta
      !function (f, b, e, v, n, t, s) {
        if (f.fbq) return; n = f.fbq = function () {
          n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
        };
        if (!f._fbq) f._fbq = n;
        n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = [];
        t = b.createElement(e); t.async = !0;
        t.src = v; s = b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t, s);
      }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    }
    window.fbq('init', pixelId);
    window.fbq('track', 'PageView');
    loadState.metaPixel.loaded = true;
    loadState.metaPixel.id = pixelId;
  }

  // ─── TikTok Pixel (ttq) ───────────────────────────────────────────
  function loadTikTokPixel(pixelId) {
    if (!pixelId || loadState.tiktok.id === pixelId) return;

    // snippet oficial do TikTok
    !function (w, d, t) {
      w.TiktokAnalyticsObject = t; var ttq = w[t] = w[t] || [];
      ttq.methods = ['page', 'track', 'identify', 'instances', 'debug', 'on', 'off',
        'once', 'ready', 'alias', 'group', 'enableCookie', 'disableCookie',
        'holdConsent', 'revokeConsent', 'grantConsent'];
      ttq.setAndDefer = function (t, e) {
        t[e] = function () { t.push([e].concat(Array.prototype.slice.call(arguments, 0))); };
      };
      for (var i = 0; i < ttq.methods.length; i++) ttq.setAndDefer(ttq, ttq.methods[i]);
      ttq.instance = function (t) {
        for (var e = ttq._i[t] || [], n = 0; n < ttq.methods.length; n++) ttq.setAndDefer(e, ttq.methods[n]);
        return e;
      };
      ttq.load = function (e, n) {
        var r = 'https://analytics.tiktok.com/i18n/pixel/events.js', o = n && n.partner;
        ttq._i = ttq._i || {}; ttq._i[e] = []; ttq._i[e]._u = r;
        ttq._t = ttq._t || {}; ttq._t[e] = +new Date();
        ttq._o = ttq._o || {}; ttq._o[e] = n || {};
        n = document.createElement('script'); n.type = 'text/javascript'; n.async = !0;
        n.src = r + '?sdkid=' + e + '&lib=' + t;
        var i = document.getElementsByTagName('script')[0];
        i.parentNode.insertBefore(n, i);
      };
      ttq.load(pixelId);
      ttq.page();
    }(window, document, 'ttq');

    loadState.tiktok.loaded = true;
    loadState.tiktok.id = pixelId;
  }

  // ─── Inicialização (chama loaders se houver IDs configuradas) ─────
  function initialize() {
    const cfg = loadConfig();
    if (!cfg.enabled) return;

    if (cfg.googleAds.enabled && cfg.googleAds.conversionId) {
      loadGoogleAds(cfg.googleAds.conversionId.trim());
    }
    if (cfg.metaPixel.enabled && cfg.metaPixel.pixelId) {
      loadMetaPixel(cfg.metaPixel.pixelId.trim());
    }
    if (cfg.tiktok.enabled && cfg.tiktok.pixelId) {
      loadTikTokPixel(cfg.tiktok.pixelId.trim());
    }
  }

  // Reinicializa quando o admin salva novas IDs (na mesma aba ou em outra)
  window.addEventListener('cc26:marketing-changed', initialize);
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY) initialize();
  });

  // ─── UTM tracking (cookie/storage de 30 dias) ─────────────────────
  function captureUTMs() {
    try {
      const url = new URL(window.location.href);
      const utmParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid', 'fbclid', 'ttclid'];
      const captured = {};
      let foundAny = false;
      utmParams.forEach((k) => {
        const v = url.searchParams.get(k);
        if (v) { captured[k] = v; foundAny = true; }
      });
      if (foundAny) {
        captured._capturedAt = new Date().toISOString();
        localStorage.setItem('cc26.utm', JSON.stringify(captured));
      }
    } catch (e) { /* noop */ }
  }
  function getUTMs() {
    try {
      const raw = localStorage.getItem('cc26.utm');
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }

  // ─── Eventos de tracking ──────────────────────────────────────────
  function debug(label, payload) {
    const cfg = loadConfig();
    if (cfg.debugMode) console.log('[mkt]', label, payload);
  }

  function trackPageView(pagePath) {
    debug('PageView', pagePath || location.hash);
    const cfg = loadConfig();
    if (!cfg.enabled) return;
    if (cfg.googleAds.enabled && cfg.googleAds.conversionId && window.gtag) {
      window.gtag('event', 'page_view', { page_path: pagePath || location.pathname + location.hash });
    }
    if (cfg.metaPixel.enabled && cfg.metaPixel.pixelId && window.fbq) {
      window.fbq('track', 'PageView');
    }
    if (cfg.tiktok.enabled && cfg.tiktok.pixelId && window.ttq) {
      window.ttq.page();
    }
  }

  function trackViewContent(product) {
    if (!product) return;
    const payload = {
      content_ids: [product.id],
      content_name: product.short || product.name,
      content_type: 'product',
      currency: 'BRL',
      value: product.price,
    };
    debug('ViewContent', payload);
    const cfg = loadConfig();
    if (!cfg.enabled) return;
    if (cfg.googleAds.enabled && window.gtag) {
      window.gtag('event', 'view_item', {
        currency: 'BRL', value: product.price,
        items: [{ item_id: product.id, item_name: product.short || product.name, price: product.price, quantity: 1 }],
      });
    }
    if (cfg.metaPixel.enabled && window.fbq) {
      window.fbq('track', 'ViewContent', payload);
    }
    if (cfg.tiktok.enabled && window.ttq) {
      window.ttq.track('ViewContent', {
        contents: [{ content_id: product.id, content_name: product.short || product.name, price: product.price, quantity: 1 }],
        value: product.price, currency: 'BRL',
      });
    }
  }

  function trackAddToCart(product, qty = 1) {
    if (!product) return;
    const value = (product.price || 0) * qty;
    const payload = {
      content_ids: [product.id],
      content_name: product.short || product.name,
      content_type: 'product',
      currency: 'BRL',
      value: value,
    };
    debug('AddToCart', payload);
    const cfg = loadConfig();
    if (!cfg.enabled) return;
    if (cfg.googleAds.enabled && window.gtag) {
      window.gtag('event', 'add_to_cart', {
        currency: 'BRL', value: value,
        items: [{ item_id: product.id, item_name: product.short || product.name, price: product.price, quantity: qty }],
      });
    }
    if (cfg.metaPixel.enabled && window.fbq) {
      window.fbq('track', 'AddToCart', payload);
    }
    if (cfg.tiktok.enabled && window.ttq) {
      window.ttq.track('AddToCart', {
        contents: [{ content_id: product.id, content_name: product.short || product.name, price: product.price, quantity: qty }],
        value: value, currency: 'BRL',
      });
    }
  }

  function trackInitiateCheckout(cart) {
    const items = (cart && cart.items) || [];
    const value = cart ? cart.subtotal || 0 : 0;
    const ids = items.map((i) => i.id || (i.product && i.product.id)).filter(Boolean);
    const payload = {
      content_ids: ids,
      content_type: 'product',
      currency: 'BRL',
      value: value,
      num_items: items.length,
    };
    debug('InitiateCheckout', payload);
    const cfg = loadConfig();
    if (!cfg.enabled) return;
    if (cfg.googleAds.enabled && window.gtag) {
      window.gtag('event', 'begin_checkout', {
        currency: 'BRL', value: value,
        items: items.map((i) => {
          const p = i.product || (window.PRODUCTS || []).find((pp) => pp.id === i.id);
          return p ? { item_id: p.id, item_name: p.short || p.name, price: p.price, quantity: i.qty } : null;
        }).filter(Boolean),
      });
    }
    if (cfg.metaPixel.enabled && window.fbq) {
      window.fbq('track', 'InitiateCheckout', payload);
    }
    if (cfg.tiktok.enabled && window.ttq) {
      window.ttq.track('InitiateCheckout', {
        contents: items.map((i) => {
          const p = i.product || (window.PRODUCTS || []).find((pp) => pp.id === i.id);
          return p ? { content_id: p.id, content_name: p.short || p.name, price: p.price, quantity: i.qty } : null;
        }).filter(Boolean),
        value: value, currency: 'BRL',
      });
    }
  }

  // Helper para extrair items normalizados de uma order
  function normalizeOrderItems(order) {
    const items = (order && order.items || []).map((i) => {
      const p = i.product || {};
      return { id: p.id || i.id, name: p.short || p.name || i.id, price: p.price || 0, quantity: i.qty || 1 };
    });
    return items;
  }

  // ═══════════════════════════════════════════════════════════════════
  // ETAPA 1 — PIX GERADO (pedido criado, aguardando pagamento)
  // ⚠️ VERSÃO MINIMALISTA: NÃO dispara nada nos pixels.
  // Só registra no console pra debug. Os eventos do funil de venda
  // só voltam a aparecer quando o admin marcar como pago (Purchase).
  // ═══════════════════════════════════════════════════════════════════
  function trackPixGenerated(order) {
    if (!order) return;
    const value = Number(order.total) || 0;
    console.log('[TRACKING] PIX generated (NOT firing pixels — minimalist mode)', {
      orderId: order.id,
      value: value,
      status: 'awaiting_pix',
    });
    debug('PixGenerated (minimalist - no pixel fire)', { orderId: order.id, value });
    // Intencionalmente vazio: nenhum evento dispara aqui.
    // Conversão real só acontece quando o admin confirmar pagamento.
  }

  // ═══════════════════════════════════════════════════════════════════
  // ETAPA 2 — CLICK NO BOTÃO "ENVIAR COMPROVANTE NO WHATSAPP"
  // ⚠️ VERSÃO MINIMALISTA: NÃO dispara nada nos pixels.
  // Só registra no console pra debug.
  // ═══════════════════════════════════════════════════════════════════
  function trackWhatsAppClick(order) {
    if (!order) return;
    const value = Number(order.total) || 0;
    console.log('[TRACKING] WhatsApp click (NOT firing pixels — minimalist mode)', {
      orderId: order.id,
      value: value,
    });
    debug('WhatsAppClick (minimalist - no pixel fire)', { orderId: order.id, value });
    // Intencionalmente vazio: nenhum evento dispara aqui.
  }

  // ═══════════════════════════════════════════════════════════════════
  // ETAPA 3 — COMPRA PAGA (CONVERSÃO REAL)
  // SÓ DISPARA QUANDO order.status === 'paid'.
  // Tem DEDUPLICAÇÃO DUPLA para não disparar 2x o mesmo pedido:
  //   1) localStorage com chave `purchase_tracked_{order_id}`
  //   2) Caller deve setar order.tracking_purchase_sent = true após
  // Eventos:
  //   Meta:   Purchase (eventID = order_id pra deduplicar com CAPI)
  //   TikTok: CompletePayment (status: completed)
  //   Google: conversão PRINCIPAL com purchaseLabel
  // ═══════════════════════════════════════════════════════════════════
  function trackPurchasePaid(order) {
    if (!order) return { ok: false, reason: 'no_order' };

    // ── GUARD: só dispara se status === 'paid' ──
    if (order.status !== 'paid') {
      console.warn('[TRACKING] trackPurchasePaid IGNORADO — status =', order.status, '(esperado: paid)');
      return { ok: false, reason: 'not_paid', status: order.status };
    }

    // ── DEDUPLICAÇÃO 1: localStorage ──
    const flagKey = 'purchase_tracked_' + order.id;
    try {
      if (localStorage.getItem(flagKey)) {
        console.warn('[TRACKING] trackPurchasePaid IGNORADO — já trackeado (localStorage):', order.id);
        return { ok: false, reason: 'already_tracked_local' };
      }
    } catch (e) { /* noop */ }

    // ── DEDUPLICAÇÃO 2: flag na própria order ──
    if (order.tracking_purchase_sent === true) {
      console.warn('[TRACKING] trackPurchasePaid IGNORADO — já trackeado (order flag):', order.id);
      return { ok: false, reason: 'already_tracked_order' };
    }

    const value = Number(order.total) || 0;
    const items = normalizeOrderItems(order);
    const ids = items.map((it) => it.id);
    console.log('[TRACKING] Purchase fired', order);
    debug('PurchasePaid', { orderId: order.id, value, items, status: 'paid' });

    const cfg = loadConfig();
    if (!cfg.enabled) return { ok: false, reason: 'tracking_disabled' };

    // ── Google Ads: conversão PRINCIPAL "Compra paga" ──
    if (cfg.googleAds.enabled && cfg.googleAds.conversionId && window.gtag) {
      const sendTo = cfg.googleAds.purchaseLabel
        ? cfg.googleAds.conversionId + '/' + cfg.googleAds.purchaseLabel
        : cfg.googleAds.conversionId;
      window.gtag('event', 'conversion', {
        send_to: sendTo,
        value: value,
        currency: 'BRL',
        transaction_id: order.id,
      });
      window.gtag('event', 'purchase', {
        transaction_id: order.id,
        value: value,
        currency: 'BRL',
        items: items.map((it) => ({ item_id: it.id, item_name: it.name, price: it.price, quantity: it.quantity })),
      });
    }

    // ── Meta Pixel: Purchase ──
    if (cfg.metaPixel.enabled && cfg.metaPixel.pixelId && window.fbq) {
      const fbPayload = {
        value: value,
        currency: 'BRL',
        content_ids: ids,
        content_type: 'product',
        contents: items.map((it) => ({ id: it.id, quantity: it.quantity, item_price: it.price })),
        num_items: items.reduce((s, it) => s + it.quantity, 0),
      };
      const opts = {};
      if (order.id) opts.eventID = String(order.id); // dedup com Conversions API
      if (cfg.metaPixel.testEventCode) opts.test_event_code = cfg.metaPixel.testEventCode;
      window.fbq('track', 'Purchase', fbPayload, opts);
    }

    // ── TikTok: CompletePayment ──
    if (cfg.tiktok.enabled && cfg.tiktok.pixelId && window.ttq) {
      window.ttq.track('CompletePayment', {
        contents: items.map((it) => ({
          content_id: it.id, content_name: it.name, price: it.price, quantity: it.quantity,
          content_type: 'product',
        })),
        value: value,
        currency: 'BRL',
        content_type: 'product',
        description: 'Pagamento confirmado',
        status: 'completed',
        order_id: order.id,
      });
    }

    // ── Marca como trackeado (deduplicação) ──
    try { localStorage.setItem(flagKey, JSON.stringify({ at: new Date().toISOString(), value, order_id: order.id })); } catch (e) {}

    return { ok: true, orderId: order.id, value };
  }

  // Compat: mantém trackPurchase como alias para trackPurchasePaid
  // (com aviso, pra encontrar chamadas antigas no código)
  function trackPurchase(order) {
    console.warn('[TRACKING] trackPurchase está OBSOLETO — use trackPurchasePaid (apenas após status=paid) ou trackPixGenerated (no PIX gerado).');
    return trackPurchasePaid(order);
  }

  function trackLead(extra = {}) {
    debug('Lead', extra);
    const cfg = loadConfig();
    if (!cfg.enabled) return;
    if (cfg.googleAds.enabled && cfg.googleAds.conversionId && window.gtag) {
      if (cfg.googleAds.leadLabel) {
        window.gtag('event', 'conversion', {
          send_to: cfg.googleAds.conversionId + '/' + cfg.googleAds.leadLabel,
        });
      }
      window.gtag('event', 'generate_lead', { currency: 'BRL', value: 0, ...extra });
    }
    if (cfg.metaPixel.enabled && window.fbq) window.fbq('track', 'Lead', extra);
    if (cfg.tiktok.enabled && window.ttq) window.ttq.track('SubmitForm', extra);
  }

  function trackContact(extra = {}) {
    debug('Contact', extra);
    const cfg = loadConfig();
    if (!cfg.enabled) return;
    if (cfg.googleAds.enabled && window.gtag) window.gtag('event', 'contact', extra);
    if (cfg.metaPixel.enabled && window.fbq) window.fbq('track', 'Contact', extra);
    if (cfg.tiktok.enabled && window.ttq) window.ttq.track('Contact', extra);
  }

  function trackCustom(eventName, payload = {}) {
    debug('Custom: ' + eventName, payload);
    const cfg = loadConfig();
    if (!cfg.enabled) return;
    if (cfg.googleAds.enabled && window.gtag) window.gtag('event', eventName, payload);
    if (cfg.metaPixel.enabled && window.fbq) window.fbq('trackCustom', eventName, payload);
    if (cfg.tiktok.enabled && window.ttq) window.ttq.track(eventName, payload);
  }

  // ─── Teste manual (usado pelo painel admin para validar instalação) ──
  function fireTestEvent() {
    const cfg = loadConfig();
    const results = { googleAds: false, metaPixel: false, tiktok: false };
    if (cfg.googleAds.enabled && cfg.googleAds.conversionId && window.gtag) {
      window.gtag('event', 'test_event', { event_category: 'mkt-test', value: 1 });
      results.googleAds = true;
    }
    if (cfg.metaPixel.enabled && cfg.metaPixel.pixelId && window.fbq) {
      window.fbq('trackCustom', 'TestEvent', { value: 1, currency: 'BRL' });
      results.metaPixel = true;
    }
    if (cfg.tiktok.enabled && cfg.tiktok.pixelId && window.ttq) {
      window.ttq.track('ClickButton', { description: 'test_event' });
      results.tiktok = true;
    }
    return results;
  }

  // ─── Expõe API global ────────────────────────────────────────────
  window.MKT = {
    loadConfig,
    saveConfig,
    initialize,
    trackPageView,
    trackViewContent,
    trackAddToCart,
    trackInitiateCheckout,
    // Funil novo (pedido com PIX manual via WhatsApp):
    trackPixGenerated,        // ETAPA 1: pedido criado, status=awaiting_pix
    trackWhatsAppClick,       // ETAPA 2: clique pra confirmar pagamento
    trackPurchasePaid,        // ETAPA 3: compra paga (SÓ se status=paid)
    // Aliases (compat):
    trackPurchase,            // OBSOLETO — usa trackPurchasePaid
    trackLead,
    trackContact,
    trackCustom,
    fireTestEvent,
    getUTMs,
    captureUTMs,
    _state: loadState,
  };

  // Captura UTMs imediatamente e inicializa pixels
  captureUTMs();
  // Aguarda DOM pronto para injetar scripts (evita race com o React)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }
})();

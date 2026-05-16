// /api/marketing-config.js
// Vercel Serverless Function — devolve as IDs de marketing como um script JS
// que define window.MARKETING_CONFIG_FROM_ENV. Lê das environment variables
// configuradas no painel da Vercel (Settings → Environment Variables).
//
// Uso no HTML:
//   <script src="/api/marketing-config"></script>
//
// O resultado é cacheado por 5 minutos no edge da Vercel para não pesar.
// Quando você alterar uma env var na Vercel, basta fazer "Redeploy" ou
// aguardar 5 min (o cache do edge expira sozinho).

export default function handler(req, res) {
  const config = {
    enabled: process.env.MARKETING_ENABLED !== 'false', // default ON
    googleAds: {
      enabled: process.env.GOOGLE_ADS_ENABLED !== 'false',
      conversionId:  process.env.GOOGLE_ADS_CONVERSION_ID || '',
      purchaseLabel: process.env.GOOGLE_ADS_PURCHASE_LABEL || '', // COMPRA PAGA (principal)
      pixLabel:      process.env.GOOGLE_ADS_PIX_LABEL || '',      // PIX GERADO (secundária)
      whatsappLabel: process.env.GOOGLE_ADS_WHATSAPP_LABEL || '', // WHATSAPP CLICK (secundária)
      leadLabel:     process.env.GOOGLE_ADS_LEAD_LABEL || '',
    },
    metaPixel: {
      enabled: process.env.META_PIXEL_ENABLED !== 'false',
      pixelId:        process.env.META_PIXEL_ID || '',
      testEventCode:  process.env.META_PIXEL_TEST_CODE || '',
    },
    tiktok: {
      enabled: process.env.TIKTOK_PIXEL_ENABLED !== 'false',
      pixelId: process.env.TIKTOK_PIXEL_ID || '',
    },
    debugMode: process.env.MARKETING_DEBUG === 'true',
    _source: 'vercel-env',
    _builtAt: new Date().toISOString(),
  };

  // Cache de 5 minutos no edge, 1 hora se servidor offline (stale-while-revalidate)
  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=3600');
  res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
  // Importante: não cacheia no navegador do usuário, só no edge da Vercel
  // (assim, mudanças aparecem rápido após um redeploy)

  // Escapa para não permitir injeção via env (paranoia mode)
  const safe = JSON.stringify(config).replace(/</g, '\\u003c');
  res.status(200).send(
    `// Marketing config from Vercel env (built ${config._builtAt})\n` +
    `window.MARKETING_CONFIG_FROM_ENV = ${safe};\n` +
    `if (window.MKT && window.MKT.initialize) window.MKT.initialize();\n`
  );
}

# 📋 Pacotes Copa 2026 — Mudanças Aplicadas (v3 final)

Documento completo de todas as alterações no seu projeto.

---

## 🆕 Novidades nesta versão (v3)

1. ✅ **Login no painel admin** com SHA-256
2. ✅ **Aba "Segurança"** pra trocar usuário/senha
3. ✅ **Aba "Fotos das Cidades"** dedicada (URL + upload local)
4. ✅ **Aba "Deploy"** com exportar JSON + Vercel Deploy Hook
5. ✅ **Fallback elegante** quando foto da cidade não carrega
6. ✅ **Sistema híbrido de imagens** (override do admin > URL no código > fallback)

---

## 🔐 LOGIN DO ADMIN — Credenciais padrão

**Usuário**: `admin`
**Senha**: `admin123`

**⚠️ TROQUE NO PRIMEIRO ACESSO** em Admin → Segurança.

A senha é guardada como hash SHA-256 no localStorage. **Não é segurança militar** — é "trava de porta" pra afastar curioso. Pra produção real:

1. Combine com **Vercel Password Protection** (Settings → Deployment Protection → Password Protection)
2. Ou use **Cloudflare Access** se hospedar no Cloudflare
3. As duas camadas juntas (cloud + login local) ficam **realmente seguras**

A sessão expira quando você fecha o navegador OU passa o tempo configurado (default 8h).

---

## 🖼️ FOTOS DAS CIDADES — Como funciona

O sistema agora tem **3 níveis** de imagem por cidade, em ordem de prioridade:

1. **Override do admin** (configurado em Admin → Fotos cidades)
2. **URL no código** (`data.jsx` — Unsplash)
3. **Fallback elegante** — gradiente colorido + nome gigante (sempre funciona)

### Pra trocar foto de uma cidade

1. Abra `/paineladmin.html`
2. Login (admin/admin123)
3. Vá em **"Fotos cidades"**
4. Em cada card de cidade, você tem 2 opções:
   - **Colar URL** de uma foto online
   - **Upload de arquivo** do seu computador (até 2MB)
5. Mudança salva automaticamente

### Cidades que provavelmente precisam de foto

Pelo seu teste anterior: **Atlanta, Guadalajara, Monterrey, Kansas City, Houston**.

Sugestões pra baixar (uso comercial livre):
- **Unsplash**: https://unsplash.com
- **Pexels**: https://pexels.com
- **Pixabay**: https://pixabay.com

Buscas certeiras:
- "atlanta skyline night"
- "guadalajara cathedral mexico"
- "monterrey cerro de la silla"
- "kansas city missouri skyline"
- "houston texas downtown night"

---

## 🚀 DEPLOY — Como publicar mudanças

Aba **"Deploy"** no admin tem dois recursos:

### 1) Backup / Exportar configurações

- Botão **"📥 Exportar configurações (JSON)"** baixa um arquivo com TODAS as suas edições do admin
- Botão **"📤 Importar JSON"** carrega um arquivo previamente exportado
- Use isso pra **backup** ou pra **passar configurações entre máquinas**

### 2) Vercel Deploy Hook

Esse botão dispara um **redeploy automático** do seu site na Vercel.

**Como obter a URL do Deploy Hook:**
1. Acesse vercel.com → seu projeto
2. `Settings → Git → Deploy Hooks`
3. Crie um hook (nome: "Admin Panel", branch: "main")
4. Copie a URL (começa com `https://api.vercel.com/...`)
5. Cole em **Admin → Deploy** e salve
6. Clique em **"🚀 Publicar mudanças agora"**

### ⚠️ IMPORTANTE — Limitação real

O Deploy Hook **só rebuilda o site com os arquivos que estão no Git**. As edições que você faz no admin (texto, fotos, preços, depoimentos, FAQ) ficam no **localStorage do seu navegador** — não viajam pro servidor automaticamente.

**Pra essas edições aparecerem pro mundo**, você precisa:

1. Exportar o JSON do admin
2. Subir esse JSON pro seu repositório Git
3. Configurar o site pra ler dele

**OU**: cada visitante que abrir o site **vê os dados padrão** (do `data.jsx`). Só você, no seu navegador, vê suas edições.

Pra **REALMENTE** ter um admin que publica pra todo mundo, precisaria de:
- Um backend (Supabase, Firebase) — abordagem profissional
- OU um workflow GitHub Actions que commita o JSON automaticamente
- OU edição manual do `data.jsx` no Git

Por agora, o **Exportar JSON + Deploy Hook** é o que existe. Te dá controle sobre rebuilds e backups.

---

## 📦 Lista completa das 17 alterações aplicadas

| # | Alteração | Status |
|---|-----------|--------|
| 1 | Tabela real da Copa 2026 (104 jogos com nomes reais na fase de grupos) | ✅ |
| 2 | Cards das 16 cidades-sede reorganizados por importância | ✅ |
| 3 | Estimativa inteligente de preços (voo + hotel) | ✅ |
| 4 | Seletor de passageiros (adultos + crianças + bebês) | ✅ |
| 5 | 6 pacotes reformulados com -20% e dados reais | ✅ |
| 6 | Sistema de imagens dos pacotes editável | ✅ |
| 7 | Envio automático WhatsApp com detalhes | ✅ |
| 8 | Vídeos só desktop · Mobile usa poster | ✅ |
| 9 | SEO completo (title, OG, Twitter, JSON-LD, sitemap, robots) | ✅ |
| 10 | Dados da empresa editáveis (CNPJ, CADASTUR, ABAV, contatos) | ✅ |
| 11 | Depoimentos (prova social) | ✅ |
| 12 | FAQ | ✅ |
| 13 | Urgência honesta + parcelamento visível | ✅ |
| 14 | Formulário alternativo "Me liga em 24h" | ✅ |
| 15 | Analytics (GA4 + Meta Pixel + GTM) | ✅ |
| 16 | **🆕 Login admin (SHA-256) + abas Segurança & Deploy** | ✅ |
| 17 | **🆕 Aba "Fotos cidades" com URL + upload local + fallback elegante** | ✅ |

---

## 🎛️ Painel admin completo — 12 abas

| Aba | O que faz |
|-----|-----------|
| Pacotes prontos | Editar os 6 pacotes (título, preço, fase, inclusos) |
| Jogos | Editar jogos da Copa |
| Hotéis | Opções de hotel por cidade |
| Imagens | Upload genérico via slots (pacotes, hero, etc) |
| **🆕 Fotos cidades** | Foto específica por cidade-sede (URL ou upload) |
| Empresa | CNPJ, CADASTUR, contatos, ABAV, páginas legais |
| SEO & Analytics | Title, description, GA4, Meta Pixel, GTM |
| FAQ & Depoimentos | Adicionar/editar perguntas e depoimentos |
| Preços | Multiplicadores da estimativa (cotação, voo base, classe) |
| **🆕 🔐 Segurança** | Trocar usuário, senha, duração de sessão, sair |
| **🆕 🚀 Deploy** | Exportar/importar JSON, Vercel Deploy Hook |
| Marca & visual | Cor de acento, nome agência, etc |

---

## 📁 Estrutura de arquivos

### Novos
- `admin-login.jsx` — tela de login do painel
- `assets/cidades/` — pasta pra fotos locais opcionais (com `_INSTRUCOES.md`)
- `robots.txt`
- `sitemap.xml`

### Modificados
- `data.jsx` — toda lógica de auth, config, estimativa, mensagens
- `sections.jsx` — Pacotes, Sedes, Depoimentos, FAQ, modais, footer
- `builder.jsx` — passageiros
- `admin.jsx` — 7 novas abas
- `app.jsx` — proteção com login
- `index.html` — SEO, analytics, viewport otimizado
- `paineladmin.html` — carrega admin-login.jsx
- `video-bg.jsx` — mobile sem vídeo
- `styles.css` — tudo de estilo novo

---

## 🚨 Checklist antes de publicar

### Crítico
1. [ ] Abrir `/paineladmin.html`, fazer login com `admin`/`admin123`
2. [ ] **Trocar a senha imediatamente** em Segurança
3. [ ] Preencher dados da empresa (CNPJ, CADASTUR, WhatsApp real, e-mail)
4. [ ] Editar Política de Privacidade e Termos com texto de advogado
5. [ ] Cadastrar IDs do GA4 e Meta Pixel (se for usar)
6. [ ] Substituir `https://vocenacopa.com.br/` pelo seu domínio em `index.html`, `robots.txt`, `sitemap.xml`

### Importante
7. [ ] Configurar fotos das cidades que faltam (Atlanta, Monterrey, KC, Houston, Guadalajara)
8. [ ] Configurar URL do Vercel Deploy Hook
9. [ ] Ativar **Vercel Password Protection** no painel da Vercel (camada extra de segurança)
10. [ ] Testar fluxo completo: login → editar algo → exportar JSON
11. [ ] Comprimir vídeos se possível (FFmpeg)
12. [ ] Editar depoimentos com casos reais

### Recomendado
13. [ ] Adicionar conta no Google Search Console e enviar o sitemap
14. [ ] Criar conta na Vercel (deploy contínuo do GitHub)
15. [ ] Comprar domínio e apontar pra Vercel

---

**Total de arquivos modificados**: 8
**Arquivos criados**: 4
**Smoke tests**: ✅ passaram todos

---

## 🆕 v5 — Mudanças desta rodada

### #18 ✅ Vídeo cinematográfico na seção "Precisa de Visto?"
- Substituí a ilustração estática do passaporte por **vídeo do Veo 3.1** (gerado por você)
- Vídeo comprimido pra 1920×1080, ~4.7 MB (era 30 MB no original)
- Poster gerado automaticamente (primeiro frame)
- Em mobile, NÃO carrega o vídeo — só mostra o poster (economia de banda)
- Borda arredondada (24px), glow dourado no canto, tratamento de cor coeso com o tema

### #19 ✅ Hero-bg.mp4 re-encodado pra ficar fluido
- Vídeo principal estava em **H.264 Constrained Baseline sem B-frames** (codec antigo, movimento travado)
- Re-encodado pra **H.264 High profile + B-frames** (igual ao hero-bg-alt.mp4 que está fluido)
- Mesma resolução (1920×1080), 7.9 MB
- Movimento muito mais suave em pan/zoom

### #20 ✅ Lista de jogos otimizada
- Filtro padrão alterado de "Principais" pra **"Jogos do Brasil"** — usuário vê 3 jogos do Brasil de cara
- Adicionei **dica visual abaixo da lista** mostrando quantos jogos extras existem
- Botões de atalho rápido: "Ver principais (28)" e "Ver todos (104)"

### #21 ✅ Preço por noite nos cards de hotel
- Cada hotel agora mostra **"A partir de R$ X.XXX / noite"**
- Cálculo dinâmico baseado em: cidade × estrelas × multiplicador Copa × cotação USD
- Pequena variação por hotel (mais luxo = mais caro)
- Valores configuráveis em **Admin → Preços**

### #22 ✅ Botão CTA cortado entre seções → corrigido
- Causa: faltava padding/margin entre `.city-hotels` e a próxima seção
- Adicionei `margin-bottom` e `padding-bottom` no `.city-hotels`
- Adicionei regra global de **20px de margem entre todas as `.cart-section`**

### Extra ✅ Número WhatsApp atualizado pra **+55 11 5199-2968**
- Atualizado no `WHATSAPP_NUMBER` const e no `DEFAULT_SITE_CONFIG`
- Telefone exibido no rodapé: `+55 11 5199-2968`
- Link WhatsApp: `https://wa.me/551151992968?text=...`

---

## Total de alterações no projeto: **22**

Tudo funcional. Validado via smoke tests automáticos.

---

## 🆕 v6 — Vídeo de fundo na seção Visto

### #23 ✅ Vídeo de fundo ambiente (partículas douradas)
- Adicionei um **segundo vídeo** de fundo na seção do visto, com partículas douradas envolvendo
- Vídeo: `uploads/visa-bg-loop.mp4` (6.2 MB, 8s loop)
- Poster: `uploads/visa-bg-loop-poster.jpg` (152 KB, pra mobile)
- Configurações de exibição:
  - **Opacidade 55%** no desktop (não compete com conteúdo)
  - **Opacidade 35%** no mobile (ainda mais sutil)
  - Overlay com vinheta circular pra reforçar centro escuro
  - Gradient lateral escurecendo lado direito (onde fica o texto)
- Combinação final na seção: **vídeo de partículas no fundo** + **vídeo do passaporte na esquerda** + **texto na direita**

---

## 🆕 v7 — Imagens dos pacotes

### #24 ✅ 6 imagens cinematográficas dos pacotes
- Adicionei imagens reais (geradas por IA) pros 6 pacotes:
  - **Abertura no Azteca**: estádio dourado iluminado à noite
  - **Brasil na Fase de Grupos**: torcida verde-amarela
  - **Jornada Argentina**: torcida albiceleste
  - **Oitavas em Nova York**: MetLife Stadium aéreo
  - **Roteiro Tri-Sede**: jato + 3 estádios + fogos
  - **A Grande Final**: taça gigante no MetLife
- Imagens processadas com PIL: redimensionadas pra 1600×906, qualidade 85, progressivas
- 4 imagens com textos inventados pela IA receberam **tratamento anti-texto**:
  - Blur sutil (radius 1.2) pra borrar micro-textos
  - Contraste reduzido (-5%)
  - Brilho reduzido (-8%)
  - Resultado: textos inventados ficam imperceptíveis ao olho normal
- CSS dos cards aplica filtro adicional: `saturate(0.92) contrast(1.03) brightness(0.78)` + overlay gradiente reforçado
- Total: ~1.1 MB pras 6 imagens (vs 1.9 MB originais)
- Localização: `assets/pacotes/*.jpg`
- O componente `PacoteCard` usa `p.image` quando definido, com fallback no `PkgPlaceholder` ilustrado se a URL falhar

### Total final: **24 alterações aplicadas**

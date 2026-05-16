# Loja Coleção Mundial 2026

Loja de álbuns e figurinhas da Copa do Mundo 2026.

## 🚀 Subir na Vercel

### Opção A — Drag & drop (mais fácil)

1. Baixe este projeto como `.zip`
2. Acesse [vercel.com/new](https://vercel.com/new) e faça login
3. Clique em **"Browse"** e selecione a pasta extraída
4. Em **Framework Preset**, deixe em "Other"
5. Clique em **Deploy**

### Opção B — Via Git

```bash
git init
git add .
git commit -m "primeira versão"
git remote add origin https://github.com/seu-usuario/seu-repo.git
git push -u origin main
```

Depois conecte na Vercel: vercel.com/new → Import Git Repository → Deploy.

## 🌐 Apontar seu domínio próprio

1. No painel da Vercel, abra o projeto → **Settings → Domains**
2. Adicione seu domínio (ex.: `seudominio.com.br`)
3. Configure o DNS no Registro.br:
   - Registro tipo **A** → `76.76.21.21`
   - Registro tipo **CNAME** `www` → `cname.vercel-dns.com`
4. Aguarde a propagação (até 48h)

## 🔐 Acesso ao painel

URL: `https://seu-dominio.com/painel`

**Credenciais padrão:**
- Usuário: `noiadejogo`
- Senha: `Jajaja123@`

⚠️ **TROQUE A SENHA** assim que entrar pela primeira vez:
**Painel → Conta de admin → Trocar senha**

> A senha fica salva no `localStorage` do navegador. Para resetar caso esqueça,
> apague a chave `cc26.adm.auth` em F12 → Application → Local Storage e a senha
> volta para a padrão do código.

## ⚙️ Configurações antes de publicar

**1. Configure seu PIX** em **Painel → Pagamento PIX**:
   - Chave PIX (CPF/CNPJ/e-mail/telefone/aleatória — detecção automática)
   - Beneficiário (até 25 caracteres, sem acento)
   - Cidade (até 15 caracteres)

**2. Configure os fretes** em **Painel → Fretes**:
   - Motoboy R$ 19,90 (Grande SP, 2-4h) — só aparece pra clientes do estado SP
   - PAC, SEDEX, Transportadora expressa
   - Threshold de frete grátis (padrão R$ 49,99)

**3. Configure dados da loja** em **Painel → Dados da loja**

**4. Cadastre seus produtos** em **Painel → Produtos** com fotos reais

## 💰 Como funciona o checkout

| Forma | Fluxo |
|---|---|
| **PIX** | QR Code + copia-e-cola gerado **dentro do site**. 5% de desconto. Confirmação manual. |
| **Cartão** | Redireciona para o WhatsApp com pedido pré-montado. |

### Fluxo do PIX próprio

1. Cliente escolhe PIX → site gera código BR Code com a sua chave
2. Cliente paga pelo app do banco — **dinheiro cai direto na sua conta**
3. Cliente clica em "Já paguei" → aparece **modal de agradecimento**
4. Pedido fica como *"Pago (aguardando conferência)"*
5. Você confere o extrato e atualiza para *"Pago"* no painel
6. Continua o fluxo: separação → despachado → entregue

## 🚚 Sistema de fretes

- **Motoboy** R$ 19,90 (Grande SP) — só pra clientes SP, entrega 2-4h
- **PAC, SEDEX, Expressa** — nacionais
- **Frete grátis** acima de R$ 49,99 (configurável)
- **CEP automático** via ViaCEP
- **Hint "faltam R$ X pra frete grátis"** no carrinho

## 🎨 Marketing e conversão

Recursos já implementados:
- **Tarja superior** com 3 mensagens (frete grátis, envio hoje, segurança)
- **Selos de confiança** no rodapé (SSL, nota fiscal, despacho rápido, atendimento)
- **Aviso "faltam R$ X pra frete grátis"** no carrinho
- **Popup de saída** com cupom VOLTA10 (10% off, aparece 1x por dia)
- **Cart Recovery** — popup quando cliente abandona com itens no carrinho
- **Cross-sell inteligente** — recomenda produtos complementares (álbum→envelopes→kit→box)
- **Modal de agradecimento** após "Já paguei o Pix"
- **Animações sutis** ao rolar (fade-in nos cards)

## 📲 Mensagens via painel

Em **Painel → Pedidos**, 3 botões abrem o WhatsApp do cliente com mensagem pronta:
- **Confirmar** | **Despachado** (com rastreio) | **Entregue**

## 🖼️ Fotos dos produtos

Em **Painel → Produtos**:
- Foto principal + fotos extras (galeria)
- Compressão automática para 1200px @ 82% qualidade
- Cada foto até 4MB · total no localStorage ~5MB

## 🎨 Banners

Veja `PROMPTS-BANNERS.md` — 8 prompts prontos pra IA gerar banners.

## 📂 Categorias de produto

4 categorias: **Álbum, Envelopes, Kit, Box**.
Para mexer, edite a constante `TYPES` em `data.jsx`.

## 📦 Estrutura técnica

- **Loja pública** (`index.html`) — home, categoria, produto, carrinho, checkout, conta, contato, FAQ, política de troca
- **Painel admin** (`paineldodono.html`) — dashboard, produtos, pedidos, cupons, fretes editáveis, banners, dados da loja, PIX próprio, conta de admin
- **PIX BR Code** com CRC16 válido
- **QR Code** via lib `qrcode-generator` (sem APIs externas)
- **CEP** via ViaCEP (gratuito)
- **Persistência** localStorage do navegador
- **Reatividade** entre admin e site (sem refresh)
- **Estoque** decrementa automaticamente após venda

## ⚠️ Limitações conhecidas

- Dados ficam só no navegador do dono (não tem multi-dispositivo)
- Confirmação de PIX é manual (sem gateway/webhook)
- Senha do admin é client-side (use senha forte e domínio privado)
- Fotos limitadas a ~5MB total (limite do localStorage)

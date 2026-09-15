# ElevManutenção — Frontend

Loja virtual B2B para peças, ferramentas e kits de manutenção de elevadores.
HTML + CSS + JavaScript puro (sem frameworks), consumindo a API do backend.

---

## 🔧 PASSO A PASSO NO RAILWAY

### 1) Publique o backend primeiro
Siga o `readme.md` da pasta do backend e gere o domínio público dele
(Settings → Networking → Generate Domain).

### 2) Cole a URL do backend aqui no frontend
Abra `assets/js/config.js` e edite **só esta linha**:
```js
const URL_BACKEND_RAILWAY = 'https://SUA-API-NO-RAILWAY.up.railway.app'
```
Troque pela URL que você gerou no passo 1.

### 3) Suba este frontend como um NOVO serviço no Railway
No mesmo projeto: **+ New → GitHub Repo** (ou Empty Service + deploy manual),
apontando para esta pasta (`elevmanutencao-frontend`).
Como é só HTML/CSS/JS estático, o Railway detecta sozinho — mas se pedir um
comando de start, use um servidor estático simples, por exemplo definindo:
```
Start Command: npx serve . -l $PORT
```

### 4) Gere o domínio público do frontend
Settings → Networking → Generate Domain. Essa é a URL final do site.

### 5) (Recomendado) Trave o CORS do backend
Volte no serviço do **backend** → Variables → troque:
```
CORS_ORIGIN=*
```
pela URL do frontend que você acabou de gerar, por exemplo:
```
CORS_ORIGIN=https://elevmanutencao-frontend-production.up.railway.app
```

Pronto — front e back publicados e conversando entre si.

---

## Identidade visual

- **Paleta**: azul (`#123C73`/`#1D5CA8`), laranja de segurança (`#FF6A13`), preto (`#101114`) e branco.
- **Tipografia**: Oswald (títulos, estilo técnico/condensado), Inter (texto/UI), JetBrains Mono (códigos de produto e preços).
- **Elemento de assinatura**: indicador de estoque em segmentos, inspirado nos indicadores de piso de elevadores; faixa diagonal laranja/preto usada como referência à sinalização de segurança.

## Estrutura

```
elevmanutencao-frontend/
├─ index.html            # login
├─ pages/                 # área do cliente
│  ├─ cadastro.html
│  ├─ home.html            # vitrine
│  ├─ loja.html             # catálogo com filtros
│  ├─ produto.html           # detalhe do produto
│  ├─ kits.html / kit.html    # kits de manutenção
│  ├─ carrinho.html
│  ├─ checkout.html
│  ├─ meus-pedidos.html
│  └─ perfil.html
├─ admin/                  # painel administrativo
│  ├─ dashboard.html
│  ├─ produtos.html / categorias.html / fornecedores.html / kits.html
│  ├─ estoque.html / pedidos.html / entregas.html
│  ├─ relatorios.html        # gráficos com Chart.js
│  └─ js/                     # 1 script por página admin
└─ assets/
   ├─ css/  (global.css = design system, + admin.css, loja.css, detalhe.css)
   └─ js/   (config.js 🔧, api.js, auth.js, carrinho.js + pages/*.js)
```

## Login de teste
(depois de rodar `npm run seed` no backend)
- **Admin:** admin@elevmanutencao.com.br / admin123
- **Cliente:** cadastre-se pela tela de cadastro

## Sessão e carrinho

- Sessão do usuário (`token`, `id`, `nome`, `tipo`) fica em `sessionStorage`.
- Carrinho de compras fica em `localStorage` (persiste entre sessões, some ao "Confirmar pedido").
- Páginas de cliente exigem login (`exigirCliente`); páginas `/admin` exigem `tipo: 'ADMIN'` (`exigirAdmin`).

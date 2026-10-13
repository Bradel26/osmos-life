# MAPA DO PROJETO — OSMOS

Guia único para **localizar, editar e atualizar** qualquer conteúdo do site OSMOS sem
afetar os demais produtos ou módulos. Complementa o [`ARQUITETURA-MANUAIS.md`](ARQUITETURA-MANUAIS.md)
(que detalha a Central de Manuais) com a visão geral de **todo** o projeto.

> **Como usar:** procure o que quer mudar na seção correspondente — cada item aponta o
> arquivo/pasta exato. Exemplos no fim ("Receitas rápidas").

---

## 1. O que é este projeto (e onde ele roda)

- **Site de produção:** este diretório (`osmos-site/`) é um repositório Git conectado ao
  GitHub **`Bradel26/osmos-life`**. É um site **Cloudflare Pages** (projeto `osmos-life`,
  conta `osmos.life.26`), publicado em **osmoslife.com.br**. **Deploy = `git push` para `main`**
  (o Pages reconstrói automaticamente). Não é WordPress.
- **Dois bancos D1** (Cloudflare), definidos em [`wrangler.toml`](wrangler.toml):
  - `DB` → `osmos-questionarios`: questionários, leads, raio-x **e a Central de Manuais**
    (tabela `produtos_manual`).
  - `BLOG_DB` → `blog_osmos`: posts do blog (`blog_posts`) e imagens enviadas (`blog_media`).

### Restrição que define a estrutura (importante)

`wrangler.toml` tem **`pages_build_output_dir = "."`** → **a raiz deste repo É o site publicado**.
Por isso a organização segue as convenções do Cloudflare Pages e **não** uma árvore
`produtos/`/`modulos/`:

| Convenção do Pages | O que significa aqui |
|---|---|
| `functions/` | Define as **rotas** (ex.: `functions/manuais/[slug].js` → `/manuais/:slug`). **Não pode ser movida/renomeada.** |
| HTML na raiz | Cada `.html` da raiz é uma **página** (`index.html` → `/`, `sac.html` → `/sac`…). |
| `/assets`, `/css`, `/js` | Servidos por URL a partir dessas pastas. Mover = reescrever todas as URLs. |
| `_redirects`, `robots.txt`, `.assetsignore` | Configuração servida/lida pelo Pages. |

Mover essas pastas para uma árvore "ideal" quebraria URLs, rotas e build. A organização
por produto/módulo é obtida **dentro** dessas convenções (pastas de assets por produto,
módulos de dados por produto, e esta documentação).

---

## 2. Árvore do repositório (`osmos-site/`) e finalidade

```
osmos-site/
├── index.html                  Página inicial (/)
├── sac.html                    Página do SAC (/sac)
├── quiz.html                   Questionário (/quiz)  [redirect: /questionario]
├── raio-x-agua.html            Raio-X da Água (/raio-x-agua)  [redirect: /raio-x-da-agua]
├── a10s-360.html               Página standalone do giro 360° do A10S
├── _redirects                  Redirecionamentos 301 (URLs amigáveis)
├── robots.txt                  SEO
├── wrangler.toml               Config Pages + bindings D1 (NÃO contém segredos)
├── .assetsignore               Pastas/arquivos que o Pages NÃO publica como asset
│
├── assets/                     Arquivos estáticos servidos em /assets/...
│   ├── img/                    Imagens gerais do site  (ver §5)
│   │   ├── marca/              Logomarca oficial (identidade visual)
│   │   ├── site/               Hero e imagens institucionais da home
│   │   └── blog-*.jpg          Capas estáticas de 8 posts (acopladas ao D1 — ver §4)
│   └── manuais/                Imagens POR PRODUTO (ver §3) — uma pasta por modelo
│       ├── a9plus/  a10s/  s9/
│       └── README.md           Convenção de assets por produto
│
├── css/                        Estilos (styles.css=home, manuais.css, blog.css, sac.css, quiz.css, raiox-agua.css)
├── js/                         Scripts de front (ver §6: product360.js é o motor 360°)
│
├── functions/                  Cloudflare Pages Functions = ROTAS + API (SSR)
│   ├── _lib/                   Bibliotecas compartilhadas (render, db, dados por produto)
│   ├── api/                    Endpoints (admin, leads, quiz, raio-x, sac)
│   ├── blog/                   Rotas /blog e /blog/:slug
│   ├── blog-media/             /blog-media/:id (capas enviadas, servidas do D1)
│   ├── manuais/                Rotas /manuais e /manuais/:slug
│   └── sitemap.xml.js          /sitemap.xml
│
├── admin/                      Painel administrativo (estático + chama /api/admin/*)
├── scripts/                    Ferramentas de build/preview/testes (NÃO publicadas)
│
├── ARQUITETURA-MANUAIS.md      Conteúdo × estrutura da Central de Manuais
└── MAPA_DO_PROJETO.md          ESTE documento
```

---

## 3. Produtos (A9 PLUS · A10S · S9) — tudo é independente por produto

**Regra de ouro:** conteúdo, imagens e dados de um produto **nunca** se misturam com os de
outro. Cada produto tem 3 fontes isoladas: **(a)** uma linha no D1, **(b)** um módulo de
dados-semente, **(c)** uma pasta de imagens.

| | **A9 PLUS** | **A10S** | **S9** |
|---|---|---|---|
| Slug / linha D1 (`produtos_manual`) | `purificador-osmos-a9plus` | `purificador-osmos-a10s` | `purificador-osmos-s9` |
| Módulo de dados-semente | [`functions/_lib/manuais-data.js`](functions/_lib/manuais-data.js) | [`functions/_lib/manuais-data-a10s.js`](functions/_lib/manuais-data-a10s.js) | [`functions/_lib/manuais-data-s9.js`](functions/_lib/manuais-data-s9.js) |
| Pasta de imagens | [`assets/manuais/a9plus/`](assets/manuais/a9plus/) | [`assets/manuais/a10s/`](assets/manuais/a10s/) | [`assets/manuais/s9/`](assets/manuais/s9/) |
| Capa (card) | `foto-01-studio.png` | `card.jpg` | `card.jpg` |
| Desenhos técnicos | em `assets/manuais/a9plus/` (`conexoes-traseiras.png`, `remocao-filtros.png`, vistas) | em `assets/manuais/a10s/` (`desenho-*.png`) | em `assets/manuais/s9/` (`desenho-frontal/traseira/instalacao/acessorios/troca-filtros.png`) |
| Visualização 360° | Perfil próprio em [`js/product360.js`](js/product360.js) (fotos `foto-0X-studio.png`) | Perfil próprio em `product360.js` (vistas `frente/lateral-*/tras/superior.png`); página [`a10s-360.html`](a10s-360.html) | Ainda sem 360° (usa viewer genérico) |
| Status | publicado | publicado | publicado |

> **Onde fica o conteúdo "vivo" (o que o site exibe):** na **linha do D1**, campo
> `conteudo_json` (editável pelo painel admin → aba **Manuais**). Os módulos
> `manuais-data*.js` são **sementes idempotentes** (`ON CONFLICT DO NOTHING`): editá-los
> **não** altera uma linha já publicada. Para refletir mudanças em produção, usar um SQL
> de UPDATE (padrão em `_WORKSPACE/migracoes-sql/`, ex.: `update-s9-desenhos.sql`).

Procedimento completo de cadastro de novo produto: [`ARQUITETURA-MANUAIS.md`](ARQUITETURA-MANUAIS.md) §5.
Papel de cada imagem por produto: README dentro de cada pasta `assets/manuais/<modelo>/`.

---

## 4. Módulos gerais

### BLOG — `/blog`
- **Rotas/SSR:** [`functions/blog/index.js`](functions/blog/index.js) (lista),
  [`functions/blog/[slug].js`](functions/blog/%5Bslug%5D.js) (post + JSON-LD).
- **Render compartilhado:** [`functions/_lib/blog-render.js`](functions/_lib/blog-render.js).
- **Dados:** tabela `blog_posts` (banco `BLOG_DB`). Rascunho vs publicado via `status`.
- **Mídias/capas:** dois caminhos — capas **estáticas** `assets/img/blog-*.jpg` (8 posts
  antigos, campo `imagem_url`) **e** uploads servidos por
  [`functions/blog-media/[id].js`](functions/blog-media/%5Bid%5D.js) a partir da tabela
  `blog_media` (7 posts). Admin: [`admin/js/admin-blog.js`](admin/js/admin-blog.js),
  API [`functions/api/admin/blog/`](functions/api/admin/blog/).
- **Estilo:** [`css/blog.css`](css/blog.css). **SEO:** JSON-LD no `[slug].js` + `sitemap.xml.js`.
- **Autopublicação:** worker externo `osmos-blog-autopublish` (fora deste repo).

### SAC / SUPORTE — `/sac`
- **Página:** [`sac.html`](sac.html) · **Estilo:** [`css/sac.css`](css/sac.css) ·
  **Front:** [`js/sac.js`](js/sac.js).
- **API:** [`functions/api/sac.js`](functions/api/sac.js) (integra com o Nexus;
  `SAC_API_URL`/`SAC_ACOMPANHAR_URL` em `wrangler.toml`, chave `SAC_API_KEY` é segredo).
- **FAQ geral + FAQ por produto, garantia e solução de problemas:** vivem no manual de
  cada produto (D1 `conteudo_json`, seções `faq`/`garantia`/`problemas`) e aparecem em
  `/manuais/:slug`. Guias/downloads de instalação: desenhos em `assets/manuais/<modelo>/`.

### MANUAIS INTERATIVOS — `/manuais`, `/manuais/:slug`
- **Rotas:** [`functions/manuais/index.js`](functions/manuais/index.js) (busca/filtros/cards),
  [`functions/manuais/[slug].js`](functions/manuais/%5Bslug%5D.js) (seções, zoom, lightbox).
- **Estrutura reutilizável (NÃO contém dado de modelo):**
  [`functions/_lib/manuais-render.js`](functions/_lib/manuais-render.js) (layout/SEO),
  [`functions/_lib/manuais-estrutura.js`](functions/_lib/manuais-estrutura.js) (SVGs
  genéricos de fallback), [`css/manuais.css`](css/manuais.css),
  [`js/manual.js`](js/manual.js), [`js/manuais-index.js`](js/manuais-index.js).
- **Conteúdo por produto:** ver §3. **Admin:** [`admin/js/admin-manuais.js`](admin/js/admin-manuais.js),
  API [`functions/api/admin/manuais/`](functions/api/admin/manuais/).

### VISUALIZAÇÃO 360° — motor compartilhado + dados por produto
- **Motor (compartilhado):** [`js/product360.js`](js/product360.js) — interação, zoom,
  teclado, WebGL. Caminho das fotos e rótulo vêm do HTML (`data-base`, `data-produto`).
- **Por produto:** perfis de reconstrução (geometria/recortes) por modelo **dentro** do
  `product360.js`; imagens-fonte na pasta `assets/manuais/<modelo>/`. A10S tem página
  dedicada [`a10s-360.html`](a10s-360.html).
- **Preview/teste local:** [`scripts/preview-product360.mjs`](scripts/preview-product360.mjs),
  [`scripts/product360.test.mjs`](scripts/product360.test.mjs),
  [`scripts/product360-integration.md`](scripts/product360-integration.md).

### IDENTIDADE VISUAL
- **Logomarca:** [`assets/img/marca/`](assets/img/marca/) (`osmos-logo.png`,
  `osmos-produto-logo.png`). **Paleta/tipografia/componentes visuais:** definidos em
  [`css/styles.css`](css/styles.css) (variáveis CSS, header/footer, botões). Imagens
  institucionais da home: [`assets/img/site/`](assets/img/site/).

---

## 5. `assets/img/` — organização atual

| Subpasta/arquivo | Conteúdo | Observação |
|---|---|---|
| `assets/img/marca/` | Logomarca oficial | Referenciada em HTML e nos render SSR |
| `assets/img/site/` | Hero (`hero-familia*.jpg`) e institucionais (`meio-ambiente.png`, `onda-de-agua.png`, `osmos-produto-equipamento.png`) | Usadas na home |
| `assets/img/blog-*.jpg` (8) | Capas estáticas de posts | **Acopladas ao D1** `blog_posts.imagem_url`. Mover exige UPDATE coordenado no banco + deploy — por isso permanecem na raiz de `img/` (ver README da pasta). |
| `assets/img/saude-diaria.jpg` | — | **Órfão:** sem referência em código, blog ou manuais (verificado nos 2 bancos). Candidato a remoção (confirmar uso externo antes). |

Detalhes e o procedimento de mover as capas: [`assets/img/README.md`](assets/img/README.md).

---

## 6. Componentes compartilhados (reutilizáveis — sem dado de modelo)

| Componente | Arquivo | Papel |
|---|---|---|
| Render de manuais | `functions/_lib/manuais-render.js` | Layout, cabeçalho/rodapé, SEO/OG, documento HTML |
| Render de blog | `functions/_lib/blog-render.js` | Layout/SEO das páginas do blog |
| SVGs genéricos | `functions/_lib/manuais-estrutura.js` | Ilustrações de apoio/fallback (sem modelo) |
| Acesso a D1 | `functions/_lib/db.js` | Schemas e `ensure*Schema` dos 3 conjuntos de tabelas |
| Helpers | `functions/_lib/query.js`, `session.js`, `raiox-agua.js` | Query params, sessão admin, lógica do raio-x |
| Motor 360° | `js/product360.js` | Visualizador 360° (parametrizado por `data-*`) |
| CRUD admin | `admin/` + `functions/api/admin/*` | Editor genérico de produtos/posts/leads |
| Estilos | `css/styles.css`, `manuais.css`, `blog.css`, `sac.css` | Padrão visual |

> Nenhum destes deve conter dados técnicos fixos de um modelo (regra do `ARQUITETURA-MANUAIS.md`).

---

## 7. Workspace local (fora do Git) — material de apoio

Estes diretórios ficam **acima** de `osmos-site/` e **não** vão para produção. Organizados em
`_WORKSPACE/` (ver `_WORKSPACE/README.md`):

| Pasta | Conteúdo |
|---|---|
| `_WORKSPACE/migracoes-sql/` | SQLs de UPDATE do D1 (histórico de mudanças de conteúdo) |
| `_WORKSPACE/manuais-origem/<modelo>/` | PDFs/DOCX fonte e JSON de referência por produto |
| `_WORKSPACE/360-origem/<modelo>/` | Sequências de imagens-fonte do 360° |
| `_WORKSPACE/fontes-brutas/` | Imagens originais (alta resolução) do site |
| `_WORKSPACE/deploy-logs/` | Logs de deploys anteriores |

Pastas de marketing e ferramentas que seguem separadas (documentadas, não movidas):
`Blog/`, `Instagram Osmos/`, `OSMOS Kanban/`, `Site Osmos/osmos-blog-autopublish/`.

---

## 8. Receitas rápidas (onde mexer para…)

- **"Alterar só o desenho técnico traseiro do A10S"** → `assets/manuais/a10s/desenho-lateral.png`
  / vistas em `assets/manuais/a10s/`; se o conteúdo vivo precisar mudar, UPDATE na linha
  `purificador-osmos-a10s` (campo `conteudo_json.desenhos`). **Não toca A9 PLUS nem S9.**
- **"Atualizar a visualização 360° do A9 PLUS"** → trocar as fotos
  `assets/manuais/a9plus/foto-0X-studio.png`; ajuste de geometria em `js/product360.js`
  (perfil A9 PLUS). **Não toca A10S/S9.**
- **"Trocar a logomarca"** → `assets/img/marca/` (manter o mesmo nome de arquivo).
- **"Novo post no blog"** → painel admin → Blog (grava em `blog_posts`/`blog_media`).
- **"Novo produto"** → seguir `ARQUITETURA-MANUAIS.md` §5 (nova pasta `assets/manuais/<modelo>/`,
  novo `manuais-data-<modelo>.js`, nova linha no admin).
- **"Mudar texto/FAQ/garantia de um produto"** → painel admin → Manuais → o produto
  (campo `conteudo_json`). Reflete no D1; não altera os outros produtos.

---

## 9. Deploy e segurança

- **Publicar:** `git push` para `main` → o Cloudflare Pages reconstrói e publica.
- **Segredos:** `.env` e `.dev.vars` ficam **fora do Git** (`.gitignore`). `wrangler.toml`
  contém só configs públicas; `SAC_API_KEY` e credenciais são segredos no painel/`.env`.
- **Ponto de recuperação:** tag `pre-reorg-2026-10` e branch `backup-local-20261007`.
- **Cache de borda:** após publicar, 404 momentâneo em `osmoslife.com.br` pode ser cache
  (o token não purga automaticamente).

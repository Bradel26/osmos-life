# Arquitetura da Central de Manuais — Conteúdo × Estrutura

Este documento define como a Central de Manuais (`/manuais`) separa **conteúdo de
produto** de **estrutura reutilizável**, e descreve o procedimento para cadastrar
um **novo produto (ex.: A10S)** de forma totalmente independente.

> **Regra de ouro:** cada produto tem como **fonte de verdade exclusiva o seu
> próprio manual**. Nunca copie, deduza ou transfira dados técnicos de um modelo
> para outro. Campo ausente → **"informação não fornecida"** / **"a definir"**,
> nunca o valor de outro produto.

---

## 1. Modelo de dados (multiproduto)

Cada produto é **uma linha** na tabela D1 `produtos_manual`. Todo o manual
interativo (visão geral, componentes, instalação, especificações, desenhos, uso,
manutenção, solução de problemas, FAQ, garantia, dicas, 360° e hotspots) fica no
campo estruturado **`conteudo_json`** daquela linha.

Colunas: `slug`, `nome`, `modelo`, `sku`, `categoria`, `keywords`,
`descricao_curta`, `imagem_url`, `imagem_alt`, `status`, `ordem`,
`conteudo_json`, datas. Schema em [`functions/_lib/db.js`](functions/_lib/db.js).

Produtos são **independentes por construção**: adicionar o A10S é inserir uma
nova linha; isso **não** toca em nada do A9 PLUS.

```
Manuais
 ├── A9 PLUS   (linha própria + conteudo_json próprio + /assets/manuais/a9plus/)
 ├── A10S      (linha própria + conteudo_json próprio + /assets/manuais/a10s/)  ← futuro
 └── futuros…  (cada um com o seu conjunto independente)
```

---

## 2. CONTEÚDO do produto **A9 PLUS** (não reutilizável)

Tudo que descreve o equipamento atual pertence **especificamente ao A9 PLUS** e
está isolado:

| Onde | O quê |
|------|-------|
| Linha D1 `produtos_manual` (slug `purificador-osmos-a9plus`) | Dados técnicos vivos (editáveis no admin) |
| [`functions/_lib/manuais-data.js`](functions/_lib/manuais-data.js) | **Conteúdo-semente do A9 PLUS**: especificações, componentes, filtros PCT/RO, conexões, instalação, uso, manutenção, troubleshooting, FAQ, garantia, dicas, hotspots. Seed idempotente (`seedManuais`) — só insere se o slug ainda não existir. |
| [`assets/manuais/a9plus/`](assets/manuais/a9plus/) | Fotos de estúdio, desenhos técnicos e imagens do A9 PLUS |
| `js/product360.js` (malha + crops) | **Perfil de reconstrução 360° do A9 PLUS** (silhueta em cápsula com dois cartuchos). É específico desta carcaça. |

Nada disso é "regra geral": é a verdade **do A9 PLUS**.

---

## 3. ESTRUTURA reutilizável (compartilhada por todos os produtos)

Tudo que é apenas **forma de organizar e apresentar** qualquer manual:

| Arquivo | Papel estrutural |
|---------|------------------|
| [`functions/_lib/manuais-render.js`](functions/_lib/manuais-render.js) | Layout, cabeçalho/rodapé, SEO/OG, documento HTML, responsividade |
| [`functions/manuais/index.js`](functions/manuais/index.js) | Página-índice: busca, filtros por categoria/modelo, cards |
| [`functions/manuais/[slug].js`](functions/manuais/%5Bslug%5D.js) | Renderização por seções (visão geral, componentes, instalação, especificações, desenhos, uso, manutenção, problemas, FAQ, garantia), navegação, zoom, lightbox, JSON-LD |
| [`functions/_lib/manuais-estrutura.js`](functions/_lib/manuais-estrutura.js) | Ilustrações SVG **genéricas** de apoio/fallback (sem dados de modelo) |
| `js/product360.js` (motor) | Motor do visualizador 360°: interação, zoom, teclado, WebGL. Caminho das fotos e rótulo vêm do HTML (`data-base`, `data-produto`). |
| `js/manual.js`, `js/manuais-index.js`, `css/manuais.css` | Comportamento e padrão visual (menus, FAQ, busca, zoom, hotspots, responsividade) |
| [`functions/api/admin/manuais/`](functions/api/admin/manuais/) + `admin/js/admin-manuais.js` | CRUD genérico de produtos + editor de `conteudo_json` + **template vazio** |

Nenhum destes arquivos deve conter dados técnicos fixos de um modelo. Esse
acoplamento foi removido: o 360° agora **deriva o caminho das fotos do próprio
produto** e os rótulos vêm de `nome`/`modelo` da linha.

---

## 4. Convenção de assets por produto

Cada produto usa a **sua própria pasta**:

```
assets/manuais/<modelo>/        ex.: assets/manuais/a9plus/ , assets/manuais/a10s/
```

Fotos para o giro 360° seguem os nomes `foto-01-studio.png` (frente),
`foto-02-studio.png` (lateral direita), `foto-03-studio.png` (traseira),
`foto-05-studio.png` (lateral esquerda). O 360° só é ativado quando **as quatro
fotos de estúdio do próprio produto** existem; caso contrário, mostra-se só a
galeria. Ver [`assets/manuais/README.md`](assets/manuais/README.md).

---

## 5. Como cadastrar o **A10S** (novo produto independente)

Quando o manual do A10S chegar, trate o documento como **nova fonte**:

1. **Assets:** criar `assets/manuais/a10s/` e subir apenas as imagens do A10S.
2. **Admin:** painel → aba **Manuais** → **Novo produto**. Preencher `nome`,
   `modelo` (A10S), `sku`, `categoria`, `descricao_curta`, imagem — tudo do A10S.
3. **Conteúdo:** usar o botão **"Inserir modelo"** (esqueleto vazio). Preencher
   seção por seção **somente** com o que estiver no manual do A10S.
4. **Lacunas:** o que não constar no manual do A10S fica como **"Informação não
   fornecida"** / **"A definir"** — **nunca** com valores do A9 PLUS.
5. **360° (opcional):** só preencher quando houver as quatro fotos de estúdio
   próprias do A10S **e** um perfil de reconstrução adequado à sua carcaça (a
   malha atual em `product360.js` é do A9 PLUS). Sem isso, deixar `explorar360.base`
   vazio — a página mostra a galeria de fotos normalmente.
6. **Publicar:** mudar status para **Publicado**. O A10S aparece em `/manuais`
   ao lado do A9 PLUS, com a mesma estrutura visual e conteúdo próprio.

O que **não** fazer: não editar a linha/seed do A9 PLUS, não reaproveitar a pasta
`a9plus/`, não preencher campos do A10S com dados do A9 PLUS.

---

## 6. Resumo

- **A9 PLUS** = conteúdo atual do produto (linha D1 + `manuais-data.js` + `assets/manuais/a9plus/` + perfil 360° próprio).
- **Estrutura** = modelo reutilizável (render, admin, SVGs genéricos, motor 360°, CSS/JS).
- **A10S** = produto novo e independente, cadastrado a partir do seu próprio manual, usando a mesma estrutura visual e funcional.

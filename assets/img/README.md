# assets/img — imagens gerais do site

Imagens **não** ligadas a um produto específico (as de produto ficam em
`assets/manuais/<modelo>/`). Organizadas por finalidade:

```
assets/img/
├── marca/                 Logomarca oficial (identidade visual)
│   ├── osmos-logo.png         Logo principal (header/footer/favicon)
│   └── osmos-produto-logo.png Logo usada em OG/JSON-LD e como imagem OG padrão
├── site/                  Home: hero + institucionais
│   ├── hero-familia.jpg        Hero desktop
│   ├── hero-familia-mobile.jpg Hero mobile
│   ├── meio-ambiente.png       Seção institucional
│   ├── onda-de-agua.png        Seção institucional
│   └── osmos-produto-equipamento.png  Imagem do equipamento na home
├── blog-*.jpg             Capas estáticas de 8 posts do blog (ver abaixo)
└── saude-diaria.jpg       ÓRFÃO — ver nota no fim
```

## Capas de blog (`blog-*.jpg`) — por que ficam aqui

As 8 capas `blog-*.jpg` são a imagem de topo de 8 posts **publicados**, referenciadas pelo
campo `imagem_url` na tabela `blog_posts` (banco **`BLOG_DB` / blog_osmos**), **não** pelo
código. (Os outros 7 posts usam capas enviadas pelo painel, servidas por `/blog-media/:id`.)

Por isso elas **não** foram movidas para uma subpasta `blog/` na reorganização: mudar o
caminho do arquivo exigiria um `UPDATE` coordenado no banco de produção **na ordem certa**
para não gerar 404. Como já têm nome autoexplicativo (`blog-…`), ficam na raiz de `img/`.

### Procedimento seguro, se um dia quiser movê-las para `assets/img/blog/`

Sequência **sem downtime** (não inverter a ordem):

1. **Copiar** (não mover) `blog-*.jpg` para `assets/img/blog/`, mantendo os originais.
   Commit → `push` para `main` → aguardar o deploy (novos caminhos no ar, antigos ainda existem).
2. `UPDATE blog_posts SET imagem_url = replace(imagem_url, '/assets/img/', '/assets/img/blog/')`
   `WHERE imagem_url LIKE '/assets/img/blog-%'` no banco `blog_osmos` (`wrangler d1 execute`).
   Conferir com `SELECT` antes/depois. Rollback = `UPDATE` inverso.
3. Só então **remover** os `blog-*.jpg` da raiz (commit de limpeza) → `push`.

Posts afetados hoje: `blog_posts` id 1–8 (slugs `osmose-reversa-o-que-e`, `sinais-…`,
`contaminantes-…`, `agua-filtrada-ou-agua-mineral`, `agua-osmose-reversa-faz-mal-minerais`,
`como-interpretar-laudo-…`, `qualidade-agua-brasil-…`, `como-a-agua-impacta-o-sabor-…`).

## Nota — `saude-diaria.jpg` (órfão)

Sem nenhuma referência em código, nos corpos/capas do blog ou nos manuais (verificado nos
bancos `blog_osmos` e `osmos-questionarios`). É forte candidato a remoção. **Não** foi
removido para não quebrar um eventual uso externo (e-mail, redes). Confirme e, se quiser,
remova com `git rm assets/img/saude-diaria.jpg`.

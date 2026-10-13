# Assets do manual — Purificador OSMOS A10S

Imagens **próprias** do A10S (slug `purificador-osmos-a10s`). Nada aqui é reaproveitado de
outro modelo. Referenciadas pelo seed [`functions/_lib/manuais-data-a10s.js`](../../../functions/_lib/manuais-data-a10s.js)
e pela linha do produto no D1 (`conteudo_json`).

## Card (índice `/manuais`)

| Arquivo | Uso | Campo |
|---|---|---|
| `card.jpg` | Miniatura no índice e topo da página | `imagem_url` |

## Cinco vistas originais — giro 360° e galeria

O perfil 360° do A10S (em [`js/product360.js`](../../../js/product360.js)) usa exclusivamente
estas cinco vistas. Também alimentam a página [`a10s-360.html`](../../../a10s-360.html).

| Arquivo | Vista |
|---|---|
| `frente.png` | Frente |
| `lateral-direita.png` | Lateral direita |
| `tras.png` | Traseira |
| `lateral-esquerda.png` | Lateral esquerda |
| `superior.png` | Superior |

## Desenhos técnicos e detalhes

| Arquivo | Uso |
|---|---|
| `desenho-frontal.png` | Vista frontal (line art) |
| `desenho-lateral.png` · `desenho-lateral-etiqueta.png` | Vista lateral / etiqueta técnica |
| `desenho-painel-superior.png` | Painel superior |
| `desenho-silhueta.png` | Silhueta / dimensões |
| `diagrama-explodido.png` | Diagrama explodido (componentes) |
| `cartucho-cbpa.png` · `cartucho-rocb.png` | Cartuchos dos filtros |
| `conectores.png` | Conectores / conexões |
| `display.png` | Display do equipamento |

> **D1:** editar `manuais-data-a10s.js` **não** atualiza a linha já publicada (seed
> idempotente). Para refletir mudanças em produção, aplicar um SQL de UPDATE (ver
> `_WORKSPACE/migracoes-sql/`, ex.: `insert-a10s.sql`/`activate-a10s-360.sql`).
> Ver [`ARQUITETURA-MANUAIS.md`](../../../ARQUITETURA-MANUAIS.md).

# Assets do manual — Purificador OSMOS A9 PLUS

Imagens **próprias** do A9 PLUS (slug `purificador-osmos-a9plus`). Nada aqui é reaproveitado
de outro modelo. Referenciadas pelo seed [`functions/_lib/manuais-data.js`](../../../functions/_lib/manuais-data.js)
e pela linha do produto no D1 (`conteudo_json`).

## Fotos de estúdio — giro 360° e galeria

O perfil 360° do A9 PLUS (em [`js/product360.js`](../../../js/product360.js)) usa as quatro
fotos ortogonais **de estúdio** (PNG). As versões `.jpeg` são os **originais brutos**
(mantidos como fonte; não usados diretamente na página).

| Estúdio (usado) | Original bruto | Vista |
|---|---|---|
| `foto-01-studio.png` | `foto-01.jpeg` | Frente |
| `foto-02-studio.png` | `foto-02.jpeg` | Lateral direita |
| `foto-03-studio.png` | `foto-03.jpeg` | Traseira |
| `foto-05-studio.png` | `foto-05.jpeg` | Lateral esquerda |

## Vistas e desenhos (seções do manual)

| Arquivo | Uso |
|---|---|
| `vista-frontal.png` | Componentes / vista frontal |
| `vista-traseira.png` | Vista traseira |
| `lateral-direita.png` · `lateral-esquerda.png` | Vistas laterais |
| `conexoes-traseiras.png` | Diagrama de conexões (instalação) |
| `remocao-filtros.png` | Procedimento de troca/remoção de filtros |

> **D1:** editar `manuais-data.js` **não** atualiza a linha já publicada (seed idempotente).
> Para refletir mudanças em produção, aplicar um SQL de UPDATE (ver `_WORKSPACE/migracoes-sql/`,
> ex.: `update-a9plus.sql`). Ver [`ARQUITETURA-MANUAIS.md`](../../../ARQUITETURA-MANUAIS.md).

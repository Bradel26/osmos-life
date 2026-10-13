# Assets do manual — Purificador OSMOS S9

Pasta com as imagens **próprias** do S9. Já incluídos: a **capa** (`card.jpg`) e
os **desenhos técnicos oficiais** (line art do próprio manual). **Pendentes:** a
galeria de fotos de estúdio e o giro 360°, que seguem usando os fallbacks
genéricos da Central até chegarem. Nada aqui é reaproveitado de outro modelo.

Quando o material de estúdio (fotos/360°) do S9 estiver disponível, suba os
arquivos nesta pasta e preencha os campos correspondentes em
`functions/_lib/manuais-data-s9.js`.

## Imagem de card (índice `/manuais`)

| Arquivo | Uso | Campo |
|---------|-----|-------|
| `card.jpg` | Miniatura no índice e imagem de topo da página | `S9.imagem_url` |

## Galeria de fotografias (seção "Fotos do produto")

Preencher `conteudo.fotos[]` com `{ url, alt }`. Enquanto vazio, a seção mostra o
viewer genérico com a legenda de `conteudo.modelo3d.legenda`.

## Giro 360° (opcional)

Só habilitar quando houver as fotos de estúdio ortogonais do próprio S9 **e** um
perfil de reconstrução adequado à sua carcaça em `js/product360.js` (os perfis
atuais são do A9 PLUS e do A10S). Nomes esperados pelo detector de 4 fotos:

| Arquivo | Vista |
|---------|-------|
| `foto-01-studio.png` | Frente |
| `foto-02-studio.png` | Lateral direita |
| `foto-03-studio.png` | Traseira |
| `foto-05-studio.png` | Lateral esquerda |

## Desenhos técnicos (oficiais do manual do S9) — INCLUÍDOS

Os desenhos oficiais já estão nesta pasta e são referenciados em
`conteudo.desenhos[]` (campos `imagem_url` e `arquivo_url`). Não se usam mais as
ilustrações genéricas de apoio.

| Arquivo | Aba / desenho |
|---------|---------------|
| `desenho-frontal.png` | Vista frontal — cartucho CBPA, cartucho da membrana RO, indicadores de troca (CBPA e RO), indicador de funcionamento (ON), display de TDS e botão liga/desliga |
| `desenho-traseira.png` | Vista traseira — entrada de água (da rede), saída de água purificada e saída de água de rejeito |
| `desenho-instalacao.png` | Diagrama de instalação sob a pia — torneira, tê e registro de água fria, mangueiras PE de entrada/pura/rejeito e conexões do purificador |
| `desenho-acessorios.png` | Acessórios inclusos — torneira, fonte, tê de entrada, mangueiras PE 3/8" e 1/4", abraçadeira de rejeito, conexões, parafusos e fita veda-rosca |
| `desenho-troca-filtros.png` | Troca dos filtros — girar no sentido anti-horário e puxar o cartucho para fora |

> **Atenção (D1):** editar `manuais-data-s9.js` **não** atualiza a linha já
> publicada no D1 — o seed usa `ON CONFLICT DO NOTHING`. Para refletir estes
> desenhos em produção, aplicar o SQL `.manual-review/update-s9-desenhos.sql`
> (mesmo padrão de `update-s9-card.sql`).

Ver `ARQUITETURA-MANUAIS.md` na raiz do `osmos-site` para o procedimento completo.

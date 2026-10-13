# Assets do manual — Purificador OSMOS S9

Pasta reservada para as imagens **próprias** do S9. **Ainda não temos mídia do
S9**: a estrutura do manual já está publicada e usa os fallbacks genéricos da
Central (arte SVG de apoio) até estas imagens chegarem. Nada aqui é reaproveitado
de outro modelo.

Quando o material de estúdio/desenhos do S9 estiver disponível, suba os arquivos
nesta pasta e preencha os campos correspondentes em
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

## Desenhos técnicos (vindos do manual do S9)

Hoje a seção usa ilustrações **genéricas** de apoio (chave `svg`), claramente
rotuladas. Ao incluir os desenhos oficiais do S9, preencha `imagem_url` (e, se
quiser, `arquivo_url` para download) nos itens de `conteudo.desenhos[]`:

- Vista frontal: cartucho CBPA, cartucho de membrana RO, luzes de substituição
  (CBPA e RO), botão de energia, valor de TDS e luz de funcionamento.
- Vista traseira: entrada de água da concessionária, saída de água pura, saída de
  água residual e valor de TDS.
- Diagrama de instalação: torneira, tubo PE de água pura, tubo PE de entrada,
  conexão de três vias, registro angular de água fria, tubo PE de água residual e
  tomada elétrica.

Ver `ARQUITETURA-MANUAIS.md` na raiz do `osmos-site` para o procedimento completo.

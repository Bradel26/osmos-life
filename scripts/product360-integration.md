# A9Plus — visualizador fotográfico 360°

Integração publicada em `/manuais/purificador-osmos-a9plus#explorar-3d`.

- HTML: `functions/manuais/[slug].js`, ramo `canExplore360`.
- Código independente: `js/product360.js` (módulo ES, sem CDN ou bibliotecas externas).
- Estilos: bloco `.product360` em `css/manuais.css`.
- Fotografias: `assets/manuais/a9plus/foto-{01,02,03,05}-studio.png`.
- Ordem: frente, lateral direita, traseira, lateral esquerda.

O módulo exporta `mountViewer(root)` e inicializa automaticamente o elemento
`[data-product360]` quando ele se aproxima da tela. Para outra instância, use o
mesmo HTML de controles e chame explicitamente `mountViewer` com seu elemento.
Os nomes de arquivos, recortes e ângulos estão em `VIEWS`.

O corpo arredondado e as duas tampas dos filtros são malhas aproximadas das
silhuetas fotografadas. As quatro imagens são projetadas sobre a malha e
misturadas nas bordas segundo as normais da superfície. A rotação é geométrica
e contínua: não é uma sequência de quatro fotos, nem usa quadros gerados por IA.
Não há detalhes decorativos, portas, logotipos ou textos sintetizados.

Limite: quatro vistas não determinam a geometria exata. Dimensões volumétricas,
relevos, superfícies ocluídas e perspectiva intermediária são aproximados.
Use as fotos e os desenhos técnicos para confirmar os detalhes reais. Para
fidelidade de um modelo industrial em todos os ângulos, substitua a malha por
CAD/GLB validado ou use uma sequência fotográfica calibrada de uma volta completa.

Controles: Pointer Events para mouse, toque e caneta; dois dedos para zoom;
arraste vertical com zoom para deslocamento; rolagem para zoom; setas do teclado
para giro; `+`/`-` para zoom; Home ou "Voltar à frente" para reset. O giro para
ao soltar, sem inércia ou rotação automática. Os quadros são desenhados apenas
quando o estado/tamanho muda. WebGL indisponível ou perdido conserva as quatro
fotografias com botões de seleção.

Validação:

```
node --test scripts/product360.test.mjs
node scripts/prepare-a9plus-update.mjs
node scripts/preview-product360.mjs
```

O último comando gera renderizações rasterizadas da mesma malha/projeções em
oito ângulos para inspeção em `.manual-review/360`, fora da pasta publicada.
Testes automatizados cobrem a geometria, limites, eventos de entrada simulados,
cancelamento, reset, modo sem WebGL e perda de contexto. Não substituem uma
conferência manual em navegadores e dispositivos reais.

## A10S — reconstrução de 5 vistas com inclinação para o topo

O mesmo módulo atende vários produtos por meio de `PROFILES`, escolhido por
`data-model` no HTML (padrão `a9plus`, mantendo a retrocompatibilidade). O perfil
`a10s` tem a sua PRÓPRIA malha (`createMeshA10S`): corpo vertical de seção
"stadium" (duas semicircunferências unidas por retas), topo filetado com deck
plano e duas cúpulas fotografadas (CBPA frontal menor, ROCB traseira maior).

- Vistas: `A10S_VIEWS` (frente, lateral direita, traseira, lateral esquerda) +
  `A10S_TOP` (superior). `A10S_CALIBRATION` mede separadamente corpo e tampas,
  preservando a altura destas. A lateral direita tem a frente à esquerda da
  imagem; a superior tem o painel à esquerda e ROCB à direita. A projeção respeita
  essas orientações para manter textos legíveis e conexões na traseira.
  A faixa rosé é um ponto de calibração compartilhado: o mapeamento compensa
  a perspectiva nas fotos para que a faixa continue alinhada entre as faces.
- A quinta textura (superior) é projetada nas faces com normal para cima; a
  inclinação vertical (`tilt`, 0°–26°) revela o deck. A base não fotografada
  permanece oculta. O enquadramento considera o giro e a inclinação completos,
  usando a mesma escala em todos os ângulos e em incorporações estreitas.
- Interação: arraste horizontal gira; arraste vertical inclina (em vez de
  deslocar o zoom); setas ↑/↓ e os botões ⌃/⌄ também inclinam; o botão
  "Superior" leva à inclinação máxima. Demais controles iguais ao A9Plus.
- Fotos: `assets/manuais/a10s/{frente,lateral-direita,tras,lateral-esquerda,superior}.png`.
- Config no conteúdo do produto: campo `explorar360` em `manuais-data-a10s.js`.
  `functions/manuais/[slug].js` também reconhece cadastros antigos quando as
  cinco fotos originais existem na mesma pasta `/a10s/`. Sem a superior e sem
  configuração explícita, conserva a galeria de fotos.
- Zoom de 100%–300%, pinça e deslocamento vertical com dois dedos. No desktop,
  `Shift` + arraste vertical desloca a imagem ampliada. Ângulo atual exibido em
  graus; botões de inclinação/zoom desativam apenas no limite correspondente.

Mesmos limites de fidelidade do A9Plus: cinco vistas não determinam a geometria
exata; volumes, relevos e a perspectiva intermediária são aproximados. As fotos
e os desenhos técnicos permanecem como fonte de conferência.

**Material (trava):** o viewer não tem modelo de iluminação — sem specular,
`metalness`, clear coat ou reflexo de ambiente. Cada pixel é a média ponderada
de amostras das fotos reais (pesos somam 1), então a saída nunca excede o brilho
das fotos: o gabinete permanece plástico **cinza-chumbo fosco** em todos os
ângulos, a faixa rosé acetinada, as cúpulas translúcidas fumê e os conectores em
plástico branco — exatamente como fotografados. Girar só troca qual foto é
amostrada. Não adicionar iluminação/specular/`pow()` sobre a cor no shader: isso
quebraria a trava e criaria aparência metálica. Ver comentário no
`A10S_FRAGMENT_SHADER`.

Validação do A10S:

```
node --test scripts/product360.test.mjs
node scripts/preview-product360-a10s.mjs   # 15 quadros (giro + inclinação) em .manual-review/360-a10s
node scripts/prepare-a10s.mjs              # página oficial, viewer independente e SQL opcional
node scripts/serve-product360.mjs          # servidor local: http://127.0.0.1:8792/a10s-360.html
```

O viewer independente fica em `a10s-360.html`, pronto para servir na mesma origem
do site. Também está integrado em `/manuais/purificador-osmos-a10s#explorar-3d`.
Para incorporar em outra página da mesma origem:

```html
<iframe src="/a10s-360.html" title="Visualização 360° do purificador A10S"
  loading="lazy" allow="fullscreen"
  style="display:block;width:100%;height:850px;border:0"></iframe>
```

A página independente é gerada a partir do mesmo HTML da página oficial.
Para integrar diretamente ao DOM, use seu elemento `[data-product360]`, carregue
os estilos `.product360` e `js/product360.js` como módulo. O módulo inicializa
todas as instâncias quando se aproximam da tela. Não abra HTML por `file://`;
sirva por HTTP com o comando acima. Nenhuma biblioteca ou CDN 3D é necessária.

Os originais em `assets/manuais/a10s/` não são alterados. Relevos, rótulos e
conexões são pixels das fotos: a malha aproxima apenas os volumes observáveis.
Não existe informação suficiente nestas cinco projeções para certificar CAD,
dimensões ou detalhes ocluídos. A geometria intermediária deve ser revisada contra
o equipamento físico antes de afirmar equivalência industrial exata.

Verificação realizada: testes de interação e malha fechada, renderizações raster
e páginas geradas. A compilação WebGL e o uso em dispositivos reais exigem a
conferência no navegador; as renderizações offline não substituem essa etapa.

Ativação opcional por configuração em banco publicado (o seed preserva linhas): o
`prepare-a10s.mjs` gera `.manual-review/activate-a10s-360.sql`, um `UPDATE` com
`json_set` que injeta apenas a chave `explorar360` (idempotente, sem tocar no
restante do conteúdo). Aplicar com `wrangler d1 execute <DB> --remote --file …`.

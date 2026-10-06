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

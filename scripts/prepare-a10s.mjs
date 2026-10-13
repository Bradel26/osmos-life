import { A10S } from '../functions/_lib/manuais-data-a10s.js';
import { onRequestGet as manual } from '../functions/manuais/[slug].js';
import { onRequestGet as index } from '../functions/manuais/index.js';
import { mkdir, writeFile, access } from 'node:fs/promises';
import assert from 'node:assert/strict';

const output = '../../.manual-review';
await mkdir(output, { recursive: true });
const quote = (value) => "'" + String(value).replaceAll("'", "''") + "'";
// INSERT idempotente do produto A10S (independente do A9 PLUS). O seed em
// manuais-data.js cria a linha automaticamente no primeiro acesso; este SQL
// serve de registro e de fallback para aplicar direto no D1, se necessário.
const cols = 'slug, nome, modelo, sku, categoria, keywords, descricao_curta, imagem_url, imagem_alt, status, ordem, conteudo_json, published_at';
const sql = `INSERT INTO produtos_manual (${cols})
VALUES (${quote(A10S.slug)}, ${quote(A10S.nome)}, ${quote(A10S.modelo)}, ${quote(A10S.sku)}, ${quote(A10S.categoria)}, ${quote(A10S.keywords)}, ${quote(A10S.descricao_curta)}, ${quote(A10S.imagem_url)}, ${quote(A10S.imagem_alt)}, 'publicado', 2, ${quote(JSON.stringify(A10S.conteudo))}, datetime('now'))
ON CONFLICT(slug) DO NOTHING;\n`;
await writeFile(`${output}/insert-a10s.sql`, sql);

// Bancos que JÁ possuem a linha do A10S (publicada antes do 360°) não são
// alterados pelo seed (ON CONFLICT DO NOTHING, para preservar edições do admin).
// Para ATIVAR o 360° sem sobrescrever o restante do conteúdo, este UPDATE injeta
// apenas a chave `explorar360` via json_set — idempotente (só onde ainda falta).
// Aplicar com: wrangler d1 execute <DB> --remote --file .manual-review/activate-a10s-360.sql
const explorar360 = A10S.conteudo.explorar360;
const activate = `-- Ativa o visualizador 360° do A10S sem sobrescrever o conteúdo já publicado.
UPDATE produtos_manual
   SET conteudo_json = json_set(conteudo_json, '$.explorar360', json(${quote(JSON.stringify(explorar360))}))
 WHERE slug = ${quote(A10S.slug)}
   AND json_extract(conteudo_json, '$.explorar360') IS NULL;\n`;
await writeFile(`${output}/activate-a10s-360.sql`, activate);

// Renderiza as duas páginas com um D1 simulado e confere que todas as imagens
// referenciadas existem no repositório.
const prod = { ...A10S, id: 2, status: 'publicado', conteudo_json: JSON.stringify(A10S.conteudo) };
const db = { exec: async () => {}, prepare: () => ({ bind() { return this; }, first: async () => prod, all: async () => ({ results: [prod] }) }) };
for (const [name, handler] of [['manual-a10s', manual], ['index-a10s', index]]) {
  const response = await handler({ env: { DB: db }, params: { slug: A10S.slug } });
  assert.equal(response.status, 200);
  const html = await response.text();
  for (const match of html.matchAll(/src="(\/assets\/manuais\/[^" ]+)"/g)) await access(`.${match[1]}`);
  if (name === 'manual-a10s') {
    assert.ok(html.includes('CBPA') && html.includes('ROCB'));
    assert.ok(html.includes('Esterilização UV') || html.includes('esterilização ultravioleta'));
    assert.ok(html.includes('8 a 12 meses') && html.includes('12 a 24 meses'));
    assert.ok(!html.includes('id="viewer3d"')); // usa o viewer fotográfico 360°, não o viewer3d genérico
    assert.ok(html.includes('Fotografias de referência'));
    assert.ok(html.includes('data-product360') && html.includes('data-model="a10s"')); // 360° próprio do A10S habilitado
    assert.ok(html.includes('data-360-view="top"')); // vista superior (inclinação) presente
    assert.ok(html.includes('data-360-action="tilt-up"')); // controle de inclinação vertical
    assert.ok(html.includes('cinco fotografias')); // nota: 5 vistas incluindo a superior
    assert.equal((html.match(/class="manual-photo-button/g) || []).length, 7); // 7 fotos
    assert.equal((html.match(/draw-zoom-btn/g) || []).length, 8); // 8 desenhos técnicos
    // Standalone viewer reuses the SAME markup as the official product page.
    // Serve over HTTP; ES modules do not work reliably under file://.
    const start = html.indexOf('<div class="product360"');
    const end = html.indexOf('<p class="product360-note">',start);
    assert.ok(start>=0&&end>start);
    const viewer = html.slice(start,end).trim();
    await writeFile('a10s-360.html', `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex">
  <title>A10S · Visualização 360° | OSMOS</title>
  <link rel="stylesheet" href="/css/styles.css">
  <link rel="stylesheet" href="/css/manuais.css?v=20261007-nav-contrast">
  <style>
    body { margin:0; background:#fff; }
    main { max-width:1000px; margin:auto; padding:24px 16px; }
    .viewer-heading { margin:0 0 20px; text-align:center; }
    .viewer-heading p { margin:0 0 4px; font-size:12px; letter-spacing:.14em; color:#5a6576; }
    .viewer-heading h1 { margin:0; font-size:clamp(24px,4vw,34px); color:#0f2138; }
    @media(max-width:480px) { main { padding:16px 8px; } }
  </style>
</head>
<body>
  <main aria-labelledby="viewer-title">
    <header class="viewer-heading"><p>OSMOS</p><h1 id="viewer-title">A10S em 360°</h1></header>
    ${viewer}
    <noscript><div class="manual-photo-grid">${[...A10S.conteudo.explorar360.views,A10S.conteudo.explorar360.top].map(v=>`<figure><a href="${A10S.conteudo.explorar360.base+v.file}"><img src="${A10S.conteudo.explorar360.base+v.file}" alt="A10S — ${v.label}" loading="lazy" style="width:100%;height:auto"></a><figcaption>${v.label}</figcaption></figure>`).join('')}</div></noscript>
  </main>
  <script type="module" src="/js/product360.js?v=20261007-a10s-calibrated"></script>
</body>
</html>
`);
  }
  await writeFile(`${output}/${name}.html`, html);
}
// A legacy row with all five original photos also gets the A10S profile without
// requiring a database edit. A missing top image must retain the photo gallery.
const legacy = structuredClone(A10S.conteudo);
delete legacy.explorar360;
const renderContent = async content => {
  const row = {...prod,conteudo_json:JSON.stringify(content)};
  const legacyDB = {exec:async()=>{},prepare:()=>({bind(){return this;},first:async()=>row,all:async()=>({results:[row]})})};
  return (await manual({env:{DB:legacyDB},params:{slug:A10S.slug}})).text();
};
assert.ok((await renderContent(legacy)).includes('data-model="a10s"'));
legacy.fotos = legacy.fotos.filter(f=>!f.url.endsWith('/superior.png'));
assert.ok(!(await renderContent(legacy)).includes('data-product360'));
console.log('A10S validado: página oficial + a10s-360.html, cinco fontes, ativação de registros antigos, galeria sem topo e SQL opcional conferidos.');
console.log('Configuração explícita opcional no banco: .manual-review/activate-a10s-360.sql. Cadastros com as cinco fotos originais já são reconhecidos pelo renderer.');

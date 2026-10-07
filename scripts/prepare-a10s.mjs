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
    assert.ok(!html.includes('id="viewer3d"')); // usa galeria de fotos, não o viewer 3D
    assert.ok(html.includes('Fotografias de referência'));
    assert.ok(!html.includes('data-product360')); // 360° não habilitado para o A10S
    assert.equal((html.match(/class="manual-photo-button/g) || []).length, 7); // 7 fotos
    assert.equal((html.match(/draw-zoom-btn/g) || []).length, 8); // 8 desenhos técnicos
  }
  await writeFile(`${output}/${name}.html`, html);
}
console.log('A10S validado: INSERT SQL gerado, 2 páginas renderizadas, imagens conferidas, 7 fotos, 8 desenhos, filtros CBPA/ROCB e UV presentes.');

import { A9PLUS } from '../functions/_lib/manuais-data.js';
import { onRequestGet as manual } from '../functions/manuais/[slug].js';
import { onRequestGet as index } from '../functions/manuais/index.js';
import { mkdir, writeFile, access } from 'node:fs/promises';
import assert from 'node:assert/strict';

const output = '../../.manual-review';
await mkdir(output, { recursive: true });
const quote = (value) => "'" + String(value).replaceAll("'", "''") + "'";
// Uma atualização explícita; novos deploys continuam preservando edições do admin.
const sql = `UPDATE produtos_manual SET conteudo_json = ${quote(JSON.stringify(A9PLUS.conteudo))}, imagem_url = ${quote(A9PLUS.imagem_url)}, imagem_alt = ${quote(A9PLUS.imagem_alt)}, descricao_curta = ${quote(A9PLUS.descricao_curta)}, updated_at = datetime('now') WHERE slug = ${quote(A9PLUS.slug)};\n`;
await writeFile(`${output}/update-a9plus.sql`, sql);
const prod = { ...A9PLUS, id: 1, status: 'publicado', conteudo_json: JSON.stringify(A9PLUS.conteudo) };
const db = { exec: async () => {}, prepare: () => ({ bind() { return this; }, first: async () => prod, all: async () => ({ results: [prod] }) }) };
for (const [name, handler] of [['manual', manual], ['index', index]]) {
  const response = await handler({ env: { DB: db }, params: { slug: A9PLUS.slug } });
  assert.equal(response.status, 200);
  const html = await response.text();
  for (const match of html.matchAll(/src="(\/assets\/manuais\/[^" ]+)"/g)) await access(`.${match[1]}`);
  if (name === 'manual') {
    assert.ok(html.includes('8 a 12 meses') && html.includes('12 a 18 meses'));
    assert.ok(!html.includes('12–24 meses') && !html.includes('12–48 meses'));
    assert.equal((html.match(/class="manual-photo-button/g) || []).length, 4);
    assert.equal((html.match(/class="draw-zoom-btn|draw-zoom-btn"/g) || []).length, 6);
    assert.ok(html.includes('Interface de energia da torneira'));
    assert.ok(!html.includes('id="viewer3d"'));
    assert.ok(html.includes('foto-01-studio.png'));
    assert.ok(html.includes('data-product360'));
    assert.ok(html.includes('product360.js?v='));
    assert.ok(html.includes('Reconstrução visual aproximada'));
  }
  await writeFile(`${output}/${name}.html`, html);
}
console.log('Validado: duas páginas, caminhos das imagens, 4 fotos, 6 diagramas e ciclos de troca. SQL preparado.');

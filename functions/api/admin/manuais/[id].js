import { ensureManuaisSchema } from '../../../_lib/db.js';
import { requireAdmin } from '../../../_lib/session.js';
import { slugify } from '../../../_lib/manuais-render.js';
import { normalizeConteudo } from './index.js';

function jsonError(message, status) {
  return new Response(JSON.stringify({ error: message }), { status, headers: { 'Content-Type': 'application/json' } });
}

async function ensureUniqueSlug(db, base, ignoreId) {
  let slug = base || 'produto';
  let n = 1;
  while (true) {
    const row = await db.prepare('SELECT id FROM produtos_manual WHERE slug = ? AND id <> ?').bind(slug, ignoreId).first();
    if (!row) return slug;
    n += 1;
    slug = `${base}-${n}`;
  }
}

export async function onRequestGet({ request, env, params }) {
  const authError = await requireAdmin(request, env);
  if (authError) return authError;

  await ensureManuaisSchema(env.DB);
  const row = await env.DB.prepare('SELECT * FROM produtos_manual WHERE id = ?').bind(params.id).first();
  if (!row) return jsonError('Produto não encontrado', 404);

  // Devolve o conteúdo já desserializado para facilitar o editor.
  let conteudo = {};
  try { conteudo = JSON.parse(row.conteudo_json || '{}'); } catch (e) { conteudo = {}; }
  row.conteudo = conteudo;

  return new Response(JSON.stringify(row), { status: 200, headers: { 'Content-Type': 'application/json' } });
}

export async function onRequestPut({ request, env, params }) {
  const authError = await requireAdmin(request, env);
  if (authError) return authError;

  await ensureManuaisSchema(env.DB);
  const existing = await env.DB.prepare('SELECT * FROM produtos_manual WHERE id = ?').bind(params.id).first();
  if (!existing) return jsonError('Produto não encontrado', 404);

  let body;
  try { body = await request.json(); } catch (e) { return jsonError('JSON inválido', 400); }

  const nome = typeof body.nome === 'string' ? body.nome.trim() : '';
  if (!nome) return jsonError('O nome do produto é obrigatório', 400);

  const modelo = (body.modelo || '').toString().trim();
  const sku = (body.sku || '').toString().trim();
  const categoria = (body.categoria || '').toString().trim();
  const keywords = (body.keywords || '').toString().trim();
  const descricao_curta = (body.descricao_curta || '').toString().trim();
  const imagem_url = (body.imagem_url || '').toString().trim();
  const imagem_alt = (body.imagem_alt || '').toString().trim();
  const status = body.status === 'publicado' ? 'publicado' : 'rascunho';
  const ordem = Number.isFinite(+body.ordem) ? parseInt(body.ordem, 10) : (existing.ordem || 0);
  const conteudo_json = body.conteudo === undefined ? (existing.conteudo_json || '{}') : normalizeConteudo(body.conteudo);

  let slug = existing.slug;
  const desiredBase = slugify(body.slug || `${nome} ${modelo}`);
  if (desiredBase && desiredBase !== existing.slug) {
    slug = await ensureUniqueSlug(env.DB, desiredBase, existing.id);
  }

  let publishedClause = 'published_at = published_at';
  if (status === 'publicado' && !existing.published_at) publishedClause = "published_at = datetime('now')";
  else if (status === 'rascunho') publishedClause = 'published_at = NULL';

  await env.DB.prepare(
    `UPDATE produtos_manual SET
       slug = ?, nome = ?, modelo = ?, sku = ?, categoria = ?, keywords = ?, descricao_curta = ?,
       imagem_url = ?, imagem_alt = ?, status = ?, ordem = ?, conteudo_json = ?,
       updated_at = datetime('now'), ${publishedClause}
     WHERE id = ?`
  ).bind(slug, nome, modelo, sku, categoria, keywords, descricao_curta, imagem_url, imagem_alt, status, ordem, conteudo_json, existing.id).run();

  return new Response(JSON.stringify({ ok: true, id: existing.id, slug }), {
    status: 200, headers: { 'Content-Type': 'application/json' }
  });
}

export async function onRequestDelete({ request, env, params }) {
  const authError = await requireAdmin(request, env);
  if (authError) return authError;

  await ensureManuaisSchema(env.DB);
  const result = await env.DB.prepare('DELETE FROM produtos_manual WHERE id = ?').bind(params.id).run();
  if (!result.meta.changes) return jsonError('Produto não encontrado', 404);

  return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
}

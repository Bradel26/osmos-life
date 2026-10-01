import { ensureManuaisSchema } from '../../../_lib/db.js';
import { requireAdmin } from '../../../_lib/session.js';
import { buildSearchFilter, buildEqualsFilter, combineFilters, buildOrder, buildPagination } from '../../../_lib/query.js';
import { slugify } from '../../../_lib/manuais-render.js';

const SORTABLE = new Set(['id', 'created_at', 'nome', 'modelo', 'status', 'ordem']);
const SEARCH_COLUMNS = ['nome', 'modelo', 'sku', 'slug', 'keywords'];

function jsonError(message, status) {
  return new Response(JSON.stringify({ error: message }), { status, headers: { 'Content-Type': 'application/json' } });
}

async function ensureUniqueSlug(db, base, ignoreId) {
  let slug = base || 'produto';
  let n = 1;
  while (true) {
    const row = ignoreId
      ? await db.prepare('SELECT id FROM produtos_manual WHERE slug = ? AND id <> ?').bind(slug, ignoreId).first()
      : await db.prepare('SELECT id FROM produtos_manual WHERE slug = ?').bind(slug).first();
    if (!row) return slug;
    n += 1;
    slug = `${base}-${n}`;
  }
}

// Aceita conteúdo como objeto ou string JSON; devolve string válida.
export function normalizeConteudo(value) {
  if (value == null) return '{}';
  if (typeof value === 'string') {
    try { JSON.parse(value); return value; } catch (e) { return '{}'; }
  }
  try { return JSON.stringify(value); } catch (e) { return '{}'; }
}

export async function onRequestGet({ request, env }) {
  const authError = await requireAdmin(request, env);
  if (authError) return authError;

  await ensureManuaisSchema(env.DB);
  const url = new URL(request.url);
  const { whereSql, params } = combineFilters(
    buildSearchFilter(url.searchParams, SEARCH_COLUMNS),
    buildEqualsFilter(url.searchParams, 'status', 'status'),
    buildEqualsFilter(url.searchParams, 'categoria', 'categoria')
  );
  const orderSql = buildOrder(url.searchParams, SORTABLE, 'ordem');
  const { page, pageSize, limit, offset } = buildPagination(url.searchParams);

  const countStmt = env.DB.prepare(`SELECT COUNT(*) AS total FROM produtos_manual ${whereSql}`).bind(...params);
  const listStmt = env.DB.prepare(
    `SELECT id, slug, nome, modelo, sku, categoria, status, ordem, created_at, updated_at, published_at
     FROM produtos_manual ${whereSql} ${orderSql} LIMIT ? OFFSET ?`
  ).bind(...params, limit, offset);

  const [countResult, listResult] = await Promise.all([countStmt.first(), listStmt.all()]);

  return new Response(JSON.stringify({
    items: listResult.results,
    total: countResult?.total || 0,
    page,
    pageSize
  }), { status: 200, headers: { 'Content-Type': 'application/json' } });
}

export async function onRequestPost({ request, env }) {
  const authError = await requireAdmin(request, env);
  if (authError) return authError;

  await ensureManuaisSchema(env.DB);

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
  const ordem = Number.isFinite(+body.ordem) ? parseInt(body.ordem, 10) : 0;
  const conteudo_json = normalizeConteudo(body.conteudo);

  const baseSlug = slugify(body.slug || `${nome} ${modelo}`);
  const slug = await ensureUniqueSlug(env.DB, baseSlug);
  const published_at = status === 'publicado' ? "datetime('now')" : 'NULL';

  const result = await env.DB.prepare(
    `INSERT INTO produtos_manual (slug, nome, modelo, sku, categoria, keywords, descricao_curta, imagem_url, imagem_alt, status, ordem, conteudo_json, published_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ${published_at})`
  ).bind(slug, nome, modelo, sku, categoria, keywords, descricao_curta, imagem_url, imagem_alt, status, ordem, conteudo_json).run();

  return new Response(JSON.stringify({ ok: true, id: result.meta.last_row_id, slug }), {
    status: 201, headers: { 'Content-Type': 'application/json' }
  });
}

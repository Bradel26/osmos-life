import { ensureBlogSchema } from '../../../_lib/db.js';
import { requireAdmin } from '../../../_lib/session.js';
import { buildSearchFilter, buildEqualsFilter, combineFilters, buildOrder, buildPagination } from '../../../_lib/query.js';
import { slugify } from '../../../_lib/blog-render.js';

const SORTABLE_COLUMNS = new Set(['id', 'created_at', 'published_at', 'titulo', 'status']);
const SEARCH_COLUMNS = ['titulo', 'resumo', 'slug'];

function jsonError(message, status) {
  return new Response(JSON.stringify({ error: message }), { status, headers: { 'Content-Type': 'application/json' } });
}

// Garante um slug único (acrescenta -2, -3... em caso de colisão).
async function ensureUniqueSlug(db, base, ignoreId) {
  let slug = base || 'post';
  let n = 1;
  while (true) {
    const row = ignoreId
      ? await db.prepare('SELECT id FROM blog_posts WHERE slug = ? AND id <> ?').bind(slug, ignoreId).first()
      : await db.prepare('SELECT id FROM blog_posts WHERE slug = ?').bind(slug).first();
    if (!row) return slug;
    n += 1;
    slug = `${base}-${n}`;
  }
}

export async function onRequestGet({ request, env }) {
  const authError = await requireAdmin(request, env);
  if (authError) return authError;

  await ensureBlogSchema(env.BLOG_DB);
  const url = new URL(request.url);
  const { whereSql, params } = combineFilters(
    buildSearchFilter(url.searchParams, SEARCH_COLUMNS),
    buildEqualsFilter(url.searchParams, 'status', 'status')
  );
  const orderSql = buildOrder(url.searchParams, SORTABLE_COLUMNS, 'created_at');
  const { page, pageSize, limit, offset } = buildPagination(url.searchParams);

  const countStmt = env.BLOG_DB.prepare(`SELECT COUNT(*) AS total FROM blog_posts ${whereSql}`).bind(...params);
  const listStmt = env.BLOG_DB.prepare(
    `SELECT id, slug, titulo, resumo, imagem_url, autor, status, created_at, updated_at, published_at
     FROM blog_posts ${whereSql} ${orderSql} LIMIT ? OFFSET ?`
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

  await ensureBlogSchema(env.BLOG_DB);

  let body;
  try {
    body = await request.json();
  } catch (err) {
    return jsonError('JSON inválido', 400);
  }

  const titulo = typeof body.titulo === 'string' ? body.titulo.trim() : '';
  const conteudo = typeof body.conteudo === 'string' ? body.conteudo.trim() : '';
  if (!titulo || !conteudo) return jsonError('Título e conteúdo são obrigatórios', 400);

  const resumo = typeof body.resumo === 'string' ? body.resumo.trim() : '';
  const imagem_url = typeof body.imagem_url === 'string' ? body.imagem_url.trim() : '';
  const imagem_alt = typeof body.imagem_alt === 'string' ? body.imagem_alt.trim() : '';
  const autor = typeof body.autor === 'string' ? body.autor.trim() : '';
  const meta_description = typeof body.meta_description === 'string' ? body.meta_description.trim() : '';
  const status = body.status === 'publicado' ? 'publicado' : 'rascunho';

  const baseSlug = slugify(body.slug || titulo);
  const slug = await ensureUniqueSlug(env.BLOG_DB, baseSlug);
  const published_at = status === 'publicado' ? "datetime('now')" : 'NULL';

  const result = await env.BLOG_DB.prepare(
    `INSERT INTO blog_posts (slug, titulo, resumo, conteudo, imagem_url, imagem_alt, autor, status, meta_description, published_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ${published_at})`
  ).bind(slug, titulo, resumo, conteudo, imagem_url, imagem_alt, autor, status, meta_description).run();

  return new Response(JSON.stringify({ ok: true, id: result.meta.last_row_id, slug }), {
    status: 201,
    headers: { 'Content-Type': 'application/json' }
  });
}

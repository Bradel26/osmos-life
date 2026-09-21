import { ensureBlogSchema } from '../../../_lib/db.js';
import { requireAdmin } from '../../../_lib/session.js';
import { slugify } from '../../../_lib/blog-render.js';

function jsonError(message, status) {
  return new Response(JSON.stringify({ error: message }), { status, headers: { 'Content-Type': 'application/json' } });
}

async function ensureUniqueSlug(db, base, ignoreId) {
  let slug = base || 'post';
  let n = 1;
  while (true) {
    const row = await db.prepare('SELECT id FROM blog_posts WHERE slug = ? AND id <> ?').bind(slug, ignoreId).first();
    if (!row) return slug;
    n += 1;
    slug = `${base}-${n}`;
  }
}

export async function onRequestGet({ request, env, params }) {
  const authError = await requireAdmin(request, env);
  if (authError) return authError;

  await ensureBlogSchema(env.BLOG_DB);
  const row = await env.BLOG_DB.prepare('SELECT * FROM blog_posts WHERE id = ?').bind(params.id).first();
  if (!row) return jsonError('Post não encontrado', 404);

  return new Response(JSON.stringify(row), { status: 200, headers: { 'Content-Type': 'application/json' } });
}

export async function onRequestPut({ request, env, params }) {
  const authError = await requireAdmin(request, env);
  if (authError) return authError;

  await ensureBlogSchema(env.BLOG_DB);
  const existing = await env.BLOG_DB.prepare('SELECT * FROM blog_posts WHERE id = ?').bind(params.id).first();
  if (!existing) return jsonError('Post não encontrado', 404);

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

  // Recalcula o slug se um novo foi enviado ou se o título mudou.
  let slug = existing.slug;
  const desiredBase = slugify(body.slug || titulo);
  if (desiredBase && desiredBase !== existing.slug) {
    slug = await ensureUniqueSlug(env.BLOG_DB, desiredBase, existing.id);
  }

  // Define published_at na primeira vez que vira "publicado"; mantém caso já exista.
  let publishedClause = 'published_at = published_at';
  if (status === 'publicado' && !existing.published_at) {
    publishedClause = "published_at = datetime('now')";
  } else if (status === 'rascunho') {
    publishedClause = 'published_at = NULL';
  }

  await env.BLOG_DB.prepare(
    `UPDATE blog_posts SET
       slug = ?, titulo = ?, resumo = ?, conteudo = ?, imagem_url = ?, imagem_alt = ?,
       autor = ?, status = ?, meta_description = ?, updated_at = datetime('now'), ${publishedClause}
     WHERE id = ?`
  ).bind(slug, titulo, resumo, conteudo, imagem_url, imagem_alt, autor, status, meta_description, existing.id).run();

  return new Response(JSON.stringify({ ok: true, id: existing.id, slug }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function onRequestDelete({ request, env, params }) {
  const authError = await requireAdmin(request, env);
  if (authError) return authError;

  await ensureBlogSchema(env.BLOG_DB);
  const result = await env.BLOG_DB.prepare('DELETE FROM blog_posts WHERE id = ?').bind(params.id).run();
  if (!result.meta.changes) return jsonError('Post não encontrado', 404);

  return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
}

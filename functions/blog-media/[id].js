// Serve as imagens enviadas pelo painel (guardadas no D1 em blog_media).
// Público e com cache longo: o id é imutável, então trocar a capa gera um id
// novo e uma URL nova, invalidando o cache naturalmente.
import { ensureBlogSchema } from '../_lib/db.js';

export async function onRequestGet({ request, env, params }) {
  const id = parseInt(params.id, 10);
  if (!Number.isFinite(id) || id <= 0) {
    return new Response('Not found', { status: 404 });
  }

  await ensureBlogSchema(env.BLOG_DB);

  const row = await env.BLOG_DB.prepare(
    'SELECT mime, size, bytes, created_at FROM blog_media WHERE id = ?'
  ).bind(id).first();

  if (!row || !row.bytes) {
    return new Response('Not found', { status: 404 });
  }

  const etag = `"media-${id}-${row.size || 0}"`;
  if ((request.headers.get('If-None-Match') || '') === etag) {
    return new Response(null, {
      status: 304,
      headers: {
        'ETag': etag,
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    });
  }

  // D1 devolve BLOB como ArrayBuffer; mantém compatível caso venha como array.
  const body = row.bytes instanceof ArrayBuffer ? row.bytes : new Uint8Array(row.bytes);

  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': row.mime || 'application/octet-stream',
      'Content-Length': String(row.size || (body.byteLength || 0)),
      'Cache-Control': 'public, max-age=31536000, immutable',
      'ETag': etag
    }
  });
}

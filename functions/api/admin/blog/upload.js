// Upload de imagem de capa pelo painel admin do blog.
// Os bytes são guardados no D1 (tabela blog_media) e servidos por /blog-media/:id.
import { ensureBlogSchema } from '../../../_lib/db.js';
import { requireAdmin } from '../../../_lib/session.js';

const ALLOWED = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif'
};
const MAX_BYTES = 2 * 1024 * 1024; // 2 MB (o painel já otimiza antes de enviar)

function jsonError(message, status) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function onRequestPost({ request, env }) {
  const authError = await requireAdmin(request, env);
  if (authError) return authError;

  await ensureBlogSchema(env.BLOG_DB);

  let file;
  let filename = '';
  const contentType = request.headers.get('Content-Type') || '';

  try {
    if (contentType.includes('multipart/form-data')) {
      const form = await request.formData();
      file = form.get('file') || form.get('imagem');
      if (file && typeof file.name === 'string') filename = file.name;
    } else {
      // Permite envio direto do binário com o mime no Content-Type.
      file = await request.blob();
    }
  } catch (err) {
    return jsonError('Não foi possível ler o arquivo enviado.', 400);
  }

  if (!file || typeof file.arrayBuffer !== 'function') {
    return jsonError('Nenhum arquivo recebido.', 400);
  }

  const mime = (file.type || contentType || '').split(';')[0].trim().toLowerCase();
  if (!ALLOWED[mime]) {
    return jsonError('Formato não suportado. Envie JPG, PNG, WebP ou GIF.', 415);
  }

  const buffer = await file.arrayBuffer();
  const size = buffer.byteLength;
  if (size === 0) return jsonError('Arquivo vazio.', 400);
  if (size > MAX_BYTES) {
    return jsonError('Imagem muito grande (máx. 2 MB). Reduza o tamanho e tente de novo.', 413);
  }

  const result = await env.BLOG_DB.prepare(
    'INSERT INTO blog_media (mime, filename, size, bytes) VALUES (?, ?, ?, ?)'
  ).bind(mime, filename || null, size, buffer).run();

  const id = result.meta.last_row_id;

  return new Response(JSON.stringify({
    ok: true,
    id,
    url: `/blog-media/${id}`,
    mime,
    size
  }), {
    status: 201,
    headers: { 'Content-Type': 'application/json' }
  });
}

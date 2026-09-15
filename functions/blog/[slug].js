// Página pública de um post do Blog — /blog/<slug>
// Renderizada no servidor (HTML real) para indexação no Google.
import { ensureSchema } from '../_lib/db.js';
import { renderPage, escapeHtml, formatDatePt, SITE_URL } from '../_lib/blog-render.js';

function notFound() {
  const bodyHtml = `
  <section class="section blog-listing">
    <div class="container blog-notfound">
      <p class="eyebrow">Erro 404</p>
      <h1>Artigo não encontrado</h1>
      <p class="section-lead">O conteúdo que você procura não existe ou ainda não foi publicado.</p>
      <p><a class="btn btn-primary" href="/blog">Voltar para o Blog</a></p>
    </div>
  </section>`;
  const html = renderPage({
    title: 'Artigo não encontrado | Blog OSMOS',
    description: 'O conteúdo que você procura não existe ou ainda não foi publicado.',
    canonicalPath: '/blog',
    bodyHtml
  });
  return new Response(html, {
    status: 404,
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  });
}

export async function onRequestGet({ request, env, params }) {
  await ensureSchema(env.DB);
  const slug = String(params.slug || '').toLowerCase();
  if (!slug) return notFound();

  const post = await env.DB.prepare(
    "SELECT * FROM blog_posts WHERE slug = ? AND status = 'publicado'"
  ).bind(slug).first();

  if (!post) return notFound();

  const dateIso = post.published_at || post.created_at || '';
  const cover = post.imagem_url
    ? `<figure class="blog-post-cover">
         <img src="${escapeHtml(post.imagem_url)}" alt="${escapeHtml(post.imagem_alt || post.titulo)}" width="1200" height="675" decoding="async">
       </figure>`
    : '';

  const bodyHtml = `
  <article class="blog-post">
    <div class="container blog-post-container">
      <p class="blog-post-back"><a href="/blog">‹ Todos os artigos</a></p>
      <header class="blog-post-header">
        <p class="eyebrow">Blog OSMOS</p>
        <h1>${escapeHtml(post.titulo)}</h1>
        <p class="blog-post-meta">
          <time datetime="${escapeHtml(dateIso)}">${escapeHtml(formatDatePt(dateIso))}</time>
          ${post.autor ? ' · por ' + escapeHtml(post.autor) : ''}
        </p>
      </header>
      ${cover}
      <div class="blog-post-content">
        ${post.conteudo || ''}
      </div>
      <div class="blog-post-cta">
        <h2>Quer água pura na sua casa?</h2>
        <p>Fale com um consultor OSMOS e descubra a solução ideal de Osmose Reversa para você.</p>
        <a class="btn btn-primary" href="/#contato">Solicitar Consultoria</a>
      </div>
    </div>
  </article>`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.titulo,
    description: post.meta_description || post.resumo || '',
    image: post.imagem_url ? [post.imagem_url] : undefined,
    datePublished: dateIso,
    dateModified: post.updated_at || dateIso,
    author: { '@type': post.autor ? 'Person' : 'Organization', name: post.autor || 'OSMOS' },
    publisher: {
      '@type': 'Organization',
      name: 'OSMOS',
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/assets/img/osmos-produto-logo.png` }
    },
    mainEntityOfPage: `${SITE_URL}/blog/${post.slug}`
  };

  const html = renderPage({
    title: `${post.titulo} | Blog OSMOS`,
    description: post.meta_description || post.resumo || '',
    canonicalPath: `/blog/${post.slug}`,
    ogImage: post.imagem_url,
    jsonLd,
    bodyHtml
  });

  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=300'
    }
  });
}

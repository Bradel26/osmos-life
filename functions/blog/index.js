// Página pública de listagem do Blog — /blog
// Renderizada no servidor (HTML real) para indexação no Google.
import { ensureSchema } from '../_lib/db.js';
import { renderPage, escapeHtml, formatDatePt, SITE_URL } from '../_lib/blog-render.js';

const PAGE_SIZE = 9;

function renderCard(post) {
  const cover = post.imagem_url
    ? `<a class="blog-card-media" href="/blog/${escapeHtml(post.slug)}">
         <img src="${escapeHtml(post.imagem_url)}" alt="${escapeHtml(post.imagem_alt || post.titulo)}" loading="lazy" decoding="async">
       </a>`
    : `<a class="blog-card-media blog-card-media--placeholder" href="/blog/${escapeHtml(post.slug)}" aria-hidden="true"></a>`;
  return `<article class="blog-card">
    ${cover}
    <div class="blog-card-body">
      <time class="blog-card-date" datetime="${escapeHtml(post.published_at || post.created_at || '')}">${escapeHtml(formatDatePt(post.published_at || post.created_at))}</time>
      <h2 class="blog-card-title"><a href="/blog/${escapeHtml(post.slug)}">${escapeHtml(post.titulo)}</a></h2>
      <p class="blog-card-excerpt">${escapeHtml(post.resumo || '')}</p>
      <a class="blog-card-link" href="/blog/${escapeHtml(post.slug)}">Ler artigo <span aria-hidden="true">→</span></a>
    </div>
  </article>`;
}

export async function onRequestGet({ request, env }) {
  await ensureSchema(env.DB);
  const url = new URL(request.url);
  const page = Math.max(1, parseInt(url.searchParams.get('page'), 10) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  const countRow = await env.DB.prepare(
    "SELECT COUNT(*) AS total FROM blog_posts WHERE status = 'publicado'"
  ).first();
  const total = countRow?.total || 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const { results } = await env.DB.prepare(
    `SELECT slug, titulo, resumo, imagem_url, imagem_alt, published_at, created_at
     FROM blog_posts WHERE status = 'publicado'
     ORDER BY COALESCE(published_at, created_at) DESC
     LIMIT ? OFFSET ?`
  ).bind(PAGE_SIZE, offset).all();

  const posts = results || [];

  const grid = posts.length
    ? `<div class="blog-grid">${posts.map(renderCard).join('')}</div>`
    : `<div class="blog-empty"><p>Em breve, novos conteúdos sobre água pura, saúde e Osmose Reversa.</p></div>`;

  let pager = '';
  if (totalPages > 1) {
    const prev = page > 1 ? `<a class="btn btn-outline btn-outline-dark" href="/blog${page - 1 === 1 ? '' : '?page=' + (page - 1)}">‹ Anterior</a>` : '';
    const next = page < totalPages ? `<a class="btn btn-outline btn-outline-dark" href="/blog?page=${page + 1}">Próxima ›</a>` : '';
    pager = `<nav class="blog-pager" aria-label="Paginação">${prev}<span class="blog-pager-info">Página ${page} de ${totalPages}</span>${next}</nav>`;
  }

  const bodyHtml = `
  <section class="blog-hero">
    <div class="container">
      <p class="eyebrow">Blog OSMOS</p>
      <h1>Água, saúde e tecnologia</h1>
      <p class="section-lead">Conteúdos sobre qualidade da água, bem-estar e a tecnologia de Osmose Reversa que transforma a água da sua casa.</p>
    </div>
  </section>
  <section class="section blog-listing">
    <div class="container">
      ${grid}
      ${pager}
    </div>
  </section>`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'Blog OSMOS',
    url: `${SITE_URL}/blog`,
    description: 'Conteúdos sobre qualidade da água, saúde e Osmose Reversa.'
  };

  const html = renderPage({
    title: 'Blog OSMOS | Água, saúde e Osmose Reversa',
    description: 'Artigos da OSMOS sobre qualidade da água, saúde, bem-estar e a tecnologia de Osmose Reversa.',
    canonicalPath: page > 1 ? `/blog?page=${page}` : '/blog',
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

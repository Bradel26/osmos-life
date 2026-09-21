// Sitemap dinâmico — /sitemap.xml
// Inclui as páginas principais + todos os posts publicados do blog.
import { ensureBlogSchema } from './_lib/db.js';
import { SITE_URL } from './_lib/blog-render.js';

function toW3CDate(value) {
  if (!value) return null;
  const iso = String(value).replace(' ', 'T') + (String(value).includes('T') ? '' : 'Z');
  const d = new Date(iso);
  return isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
}

export async function onRequestGet({ env }) {
  await ensureBlogSchema(env.BLOG_DB);

  const staticUrls = [
    { loc: `${SITE_URL}/`, priority: '1.0', changefreq: 'weekly' },
    { loc: `${SITE_URL}/blog`, priority: '0.8', changefreq: 'weekly' },
    { loc: `${SITE_URL}/quiz.html`, priority: '0.5', changefreq: 'monthly' },
    { loc: `${SITE_URL}/raio-x-agua.html`, priority: '0.5', changefreq: 'monthly' }
  ];

  let posts = [];
  try {
    const { results } = await env.BLOG_DB.prepare(
      "SELECT slug, updated_at, published_at, created_at FROM blog_posts WHERE status = 'publicado' ORDER BY COALESCE(published_at, created_at) DESC"
    ).all();
    posts = results || [];
  } catch (err) {
    posts = [];
  }

  const urlXml = function (u) {
    return `  <url>\n    <loc>${u.loc}</loc>\n` +
      (u.lastmod ? `    <lastmod>${u.lastmod}</lastmod>\n` : '') +
      (u.changefreq ? `    <changefreq>${u.changefreq}</changefreq>\n` : '') +
      (u.priority ? `    <priority>${u.priority}</priority>\n` : '') +
      `  </url>`;
  };

  const entries = staticUrls.map(urlXml);
  posts.forEach(function (p) {
    entries.push(urlXml({
      loc: `${SITE_URL}/blog/${p.slug}`,
      lastmod: toW3CDate(p.updated_at || p.published_at || p.created_at),
      changefreq: 'monthly',
      priority: '0.7'
    }));
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    entries.join('\n') + `\n</urlset>\n`;

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600'
    }
  });
}

// Renderização server-side das páginas públicas do Blog OSMOS.
// Mantém o mesmo cabeçalho/rodapé do site para que as páginas sejam
// totalmente indexáveis pelo Google (HTML real, com meta tags e canonical).

const SITE_URL = 'https://osmoslife.com.br';

export function escapeHtml(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Gera um slug amigável para URL a partir de um título.
export function slugify(text) {
  return String(text || '')
    .normalize('NFD').replace(/[̀-ͯ]/g, '') // remove acentos
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80)
    .replace(/^-+|-+$/g, '');
}

// Data legível em pt-BR: "14 de setembro de 2026".
export function formatDatePt(value) {
  if (!value) return '';
  const iso = String(value).replace(' ', 'T') + (String(value).includes('T') ? '' : 'Z');
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const meses = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  return `${d.getUTCDate()} de ${meses[d.getUTCMonth()]} de ${d.getUTCFullYear()}`;
}

function absoluteImage(url) {
  if (!url) return `${SITE_URL}/assets/img/osmos-produto-logo.png`;
  if (/^https?:\/\//i.test(url)) return url;
  return `${SITE_URL}/${String(url).replace(/^\//, '')}`;
}

const HEADER = `
<a href="#main" class="skip-link">Pular para o conteúdo</a>
<header class="site-header" id="site-header">
  <div class="container header-inner">
    <a href="/" class="logo" aria-label="OSMOS - Página inicial">
      <img src="/assets/img/osmos-logo.png" alt="OSMOS" class="logo-img" width="624" height="280">
    </a>
    <nav class="main-nav" aria-label="Navegação principal">
      <ul>
        <li><a href="/#beneficios">Benefícios</a></li>
        <li><a href="/#tecnologia">Tecnologia</a></li>
        <li><a href="/#comparacao">Comparação</a></li>
        <li><a href="/#para-quem">Para Quem É</a></li>
        <li><a href="/blog" class="active">Blog</a></li>
        <li><a href="/#faq">FAQ</a></li>
      </ul>
    </nav>
    <div class="header-actions">
      <a href="/#contato" class="btn btn-ghost">Fale com um Consultor</a>
      <button class="nav-toggle" id="navToggle" aria-label="Abrir menu" aria-expanded="false" aria-controls="mobileMenu">
        <span></span><span></span><span></span>
      </button>
    </div>
  </div>
  <div class="mobile-menu" id="mobileMenu">
    <ul>
      <li><a href="/#beneficios">Benefícios</a></li>
      <li><a href="/#tecnologia">Tecnologia</a></li>
      <li><a href="/#comparacao">Comparação</a></li>
      <li><a href="/#para-quem">Para Quem É</a></li>
      <li><a href="/blog">Blog</a></li>
      <li><a href="/#faq">FAQ</a></li>
      <li><a href="/#contato" class="btn btn-primary">Solicitar Consultoria</a></li>
    </ul>
  </div>
</header>`;

const FOOTER = `
<footer class="site-footer">
  <div class="container footer-inner">
    <div class="footer-brand">
      <img src="/assets/img/osmos-logo.png" alt="OSMOS" class="logo-img footer-logo" width="624" height="280">
      <p>Especialista em soluções de filtragem e purificação de água por Osmose Reversa.</p>
      <ul class="footer-col footer-brand-links">
        <li><a href="/quiz.html">Diagnóstico de Perfil do Cliente</a></li>
        <li><a href="/raio-x-agua.html">Raio-X da Água</a></li>
      </ul>
    </div>
    <nav class="footer-col" aria-label="Institucional">
      <h4>Institucional</h4>
      <ul>
        <li><a href="/#hero">Sobre</a></li>
        <li><a href="/#beneficios">Produtos</a></li>
        <li><a href="/#tecnologia">Tecnologia</a></li>
        <li><a href="/#garantias">Assistência Técnica</a></li>
        <li><a href="/blog">Blog</a></li>
      </ul>
    </nav>
    <div class="footer-col">
      <h4>Contato</h4>
      <ul>
        <li><a href="/#contato">Fale Conosco</a></li>
        <li><a href="https://wa.me/5500000000000" target="_blank" rel="noopener">WhatsApp</a></li>
        <li><a href="https://instagram.com/osmos" target="_blank" rel="noopener">Instagram</a></li>
        <li><a href="https://linkedin.com/company/osmos" target="_blank" rel="noopener">LinkedIn</a></li>
      </ul>
    </div>
    <div class="footer-col">
      <h4>Legal</h4>
      <ul>
        <li><a href="/#">Política de Privacidade</a></li>
        <li><a href="/#">Termos de Uso</a></li>
      </ul>
    </div>
  </div>
  <div class="container footer-bottom">
    <p>&copy; <span id="year"></span> OSMOS. Todos os direitos reservados.</p>
  </div>
</footer>
<button class="back-to-top" id="backToTop" aria-label="Voltar ao topo">↑</button>`;

// Script mínimo próprio das páginas do blog (o script.js do site espera
// elementos que não existem aqui, então usamos um inline enxuto).
const INLINE_SCRIPT = `
<script>
(function () {
  var header = document.getElementById('site-header');
  function upd(){ if (window.scrollY > 40) header.classList.add('scrolled'); else header.classList.remove('scrolled'); }
  upd(); window.addEventListener('scroll', upd, { passive: true });
  var t = document.getElementById('navToggle'), m = document.getElementById('mobileMenu');
  if (t && m) {
    t.addEventListener('click', function () {
      var open = m.classList.toggle('open');
      t.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    m.querySelectorAll('a').forEach(function (l) {
      l.addEventListener('click', function () { m.classList.remove('open'); t.setAttribute('aria-expanded', 'false'); });
    });
  }
  var b = document.getElementById('backToTop');
  if (b) {
    window.addEventListener('scroll', function () { b.classList.toggle('visible', window.scrollY > 600); }, { passive: true });
    b.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
  }
  var y = document.getElementById('year'); if (y) y.textContent = new Date().getFullYear();
})();
</script>`;

// Monta uma página completa do blog (documento HTML).
export function renderPage({ title, description, canonicalPath, ogImage, jsonLd, bodyHtml }) {
  const canonical = `${SITE_URL}${canonicalPath || '/blog'}`;
  const desc = escapeHtml(description || 'Blog da OSMOS sobre qualidade da água, saúde e Osmose Reversa.');
  const img = absoluteImage(ogImage);
  const ld = jsonLd ? `\n<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>` : '';
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(title)}</title>
<meta name="description" content="${desc}">
<meta name="author" content="OSMOS">
<link rel="canonical" href="${canonical}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="OSMOS">
<meta property="og:title" content="${escapeHtml(title)}">
<meta property="og:description" content="${desc}">
<meta property="og:image" content="${escapeHtml(img)}">
<meta property="og:url" content="${canonical}">
<meta property="og:locale" content="pt_BR">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeHtml(title)}">
<meta name="twitter:description" content="${desc}">
<meta name="twitter:image" content="${escapeHtml(img)}">
<link rel="icon" href="/assets/img/osmos-logo.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/css/styles.css">
<link rel="stylesheet" href="/css/blog.css">${ld}
</head>
<body>
${HEADER}
<main id="main">
${bodyHtml}
</main>
${FOOTER}
${INLINE_SCRIPT}
</body>
</html>`;
}

export { SITE_URL };

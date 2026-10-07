// Página inicial da Central de Manuais e Suporte Técnico — /manuais
// Renderizada no servidor (HTML real) para indexação. O arquivo
// js/manuais-index.js adiciona busca e filtros no cliente.
import { ensureManuaisSchema } from '../_lib/db.js';
import { seedManuais, MANUAIS_SVGS } from '../_lib/manuais-data.js';
import { renderDocument, escapeHtml, SITE_URL } from '../_lib/manuais-render.js';

function cardMedia(prod) {
  if (prod.imagem_url) {
    return `<span class="manual-card-media">
      <img src="${escapeHtml(prod.imagem_url)}" alt="${escapeHtml(prod.imagem_alt || prod.nome)}" loading="lazy" decoding="async">
    </span>`;
  }
  return `<span class="manual-card-media manual-card-media--art" aria-hidden="true">${MANUAIS_SVGS.frontal}</span>`;
}

function renderCard(prod) {
  const sku = prod.sku ? `<span class="manual-card-sku">${escapeHtml(prod.sku)}</span>` : '';
  return `<article class="manual-card fade-up"
      data-nome="${escapeHtml((prod.nome || '').toLowerCase())}"
      data-modelo="${escapeHtml((prod.modelo || '').toLowerCase())}"
      data-sku="${escapeHtml((prod.sku || '').toLowerCase())}"
      data-categoria="${escapeHtml(prod.categoria || '')}"
      data-keywords="${escapeHtml((prod.keywords || '').toLowerCase())}">
    <a class="manual-card-link-cover" href="/manuais/${escapeHtml(prod.slug)}" aria-label="Acessar manual de ${escapeHtml(prod.nome)}"></a>
    ${cardMedia(prod)}
    <div class="manual-card-body">
      <div class="manual-card-meta">
        <span class="manual-card-model">${escapeHtml(prod.modelo || '')}</span>
        ${sku}
      </div>
      <h3 class="manual-card-title">${escapeHtml(prod.nome)}</h3>
      <p class="manual-card-desc">${escapeHtml(prod.descricao_curta || '')}</p>
      <span class="btn btn-primary manual-card-cta">Acessar manual interativo <span aria-hidden="true">→</span></span>
    </div>
  </article>`;
}

export async function onRequestGet({ env }) {
  await ensureManuaisSchema(env.DB);
  await seedManuais(env.DB);

  const { results } = await env.DB.prepare(
    `SELECT slug, nome, modelo, sku, categoria, keywords, descricao_curta, imagem_url, imagem_alt
     FROM produtos_manual WHERE status = 'publicado'
     ORDER BY ordem ASC, nome ASC`
  ).all();
  const produtos = results || [];

  const categorias = Array.from(new Set(produtos.map((p) => p.categoria).filter(Boolean))).sort();
  const modelos = Array.from(new Set(produtos.map((p) => p.modelo).filter(Boolean))).sort();

  const categoriaOpts = categorias.map((c) => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('');
  const modeloOpts = modelos.map((m) => `<option value="${escapeHtml(m)}">${escapeHtml(m)}</option>`).join('');

  const grid = produtos.length
    ? `<div class="manual-grid" id="manualGrid">${produtos.map(renderCard).join('')}</div>
       <p class="manual-noresults" id="manualNoResults" hidden>Nenhum produto encontrado para a sua busca. Tente outro termo ou limpe os filtros.</p>`
    : `<div class="manual-empty"><p>Em breve os manuais interativos dos produtos OSMOS estarão disponíveis aqui.</p></div>`;

  const bodyHtml = `
  <section class="manuais-hero">
    <div class="container">
      <p class="eyebrow fade-up">Central de Manuais e Suporte Técnico</p>
      <h1 class="fade-up delay-1">Conheça seu produto por completo</h1>
      <p class="section-lead fade-up delay-2">Acesse manuais, informações técnicas, orientações de instalação, garantia e recursos interativos para conhecer cada detalhe do seu produto.</p>
    </div>
  </section>

  <section class="section manuais-finder">
    <div class="container">
      <div class="section-head">
        <p class="eyebrow">Encontre seu produto</p>
        <h2>Localize seu manual</h2>
        <p class="section-lead">Pesquise por nome, modelo, código ou palavras relacionadas, ou filtre por categoria e modelo.</p>
      </div>

      <form class="manual-finder-bar" id="manualFinder" role="search" autocomplete="off" onsubmit="return false">
        <div class="manual-search">
          <svg class="manual-search-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="1.6"/><path d="M20 20l-3.2-3.2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
          <input type="search" id="manualSearch" name="q" placeholder="Buscar por nome, modelo ou código (ex.: A9Plus)" aria-label="Buscar produto">
        </div>
        <label class="manual-filter">
          <span class="sr-only">Filtrar por categoria</span>
          <select id="manualCategoria" aria-label="Filtrar por categoria">
            <option value="">Todas as categorias</option>
            ${categoriaOpts}
          </select>
        </label>
        <label class="manual-filter">
          <span class="sr-only">Filtrar por modelo</span>
          <select id="manualModelo" aria-label="Filtrar por modelo">
            <option value="">Todos os modelos</option>
            ${modeloOpts}
          </select>
        </label>
      </form>

      ${grid}
    </div>
  </section>

  <section class="section section-tint manuais-help">
    <div class="container">
      <div class="manuais-help-inner">
        <div>
          <p class="eyebrow">Não encontrou o que precisava?</p>
          <h2>O SAC OSMOS pode ajudar</h2>
          <p class="section-lead">Para situações que o manual não resolve, como suporte técnico, garantia, trocas e instalação, fale com a nossa equipe.</p>
        </div>
        <a href="/sac.html" class="btn btn-primary">Falar com o SAC</a>
      </div>
    </div>
  </section>`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Central de Manuais e Suporte Técnico OSMOS',
    url: `${SITE_URL}/manuais`,
    description: 'Manuais interativos, informações técnicas, instalação, garantia e suporte dos produtos OSMOS.'
  };

  const html = renderDocument({
    title: 'Manuais e Suporte Técnico | OSMOS',
    description: 'Central digital e interativa de manuais OSMOS: encontre seu produto e acesse instalação, especificações, desenhos técnicos, solução de problemas, FAQ e garantia.',
    canonicalPath: '/manuais',
    jsonLd,
    bodyHtml,
    bodyEndScripts: '<script src="/js/manuais-index.js" defer></script>'
  });

  return new Response(html, {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=300' }
  });
}

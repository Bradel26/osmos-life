// Manual eletrônico interativo de um produto — /manuais/:slug
// Renderizado no servidor (HTML real, indexável). A interatividade (navegação,
// busca, filtros, zoom nos desenhos, viewer 3D e hotspots) vem de /js/manual.js.
import { ensureManuaisSchema } from '../_lib/db.js';
import { seedManuais } from '../_lib/manuais-data.js';
import { MANUAIS_SVGS } from '../_lib/manuais-estrutura.js';
import { renderDocument, escapeHtml, SITE_URL } from '../_lib/manuais-render.js';

const FEATURE_ICONS = {
  drop: '<svg viewBox="0 0 24 24" fill="none"><path d="M12 3s6 6.5 6 11a6 6 0 11-12 0c0-4.5 6-11 6-11z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>',
  flow: '<svg viewBox="0 0 24 24" fill="none"><path d="M3 12h7M3 7h12M3 17h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M17 9l4 3-4 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  display: '<svg viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" stroke-width="1.5"/><path d="M8 10v4M12 9v6M16 11v3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
  refresh: '<svg viewBox="0 0 24 24" fill="none"><path d="M20 11a8 8 0 10-.5 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M20 4v6h-6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  filter: '<svg viewBox="0 0 24 24" fill="none"><path d="M4 5h16l-6 7v6l-4 2v-8z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>',
  shield: '<svg viewBox="0 0 24 24" fill="none"><path d="M12 3l8 3v5c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'
};

const DICA_META = {
  dica: { label: 'Dica' },
  atencao: { label: 'Atenção' },
  importante: { label: 'Importante' },
  'nao-recomendado': { label: 'Não recomendado' }
};

const esc = escapeHtml;
const list = (arr, cls) => `<ul class="${cls}">${(arr || []).map((i) => `<li>${esc(i)}</li>`).join('')}</ul>`;

function sectionHead(eyebrow, title, lead) {
  return `<div class="section-head">
    <p class="eyebrow">${esc(eyebrow)}</p>
    <h2>${esc(title)}</h2>
    ${lead ? `<p class="section-lead">${esc(lead)}</p>` : ''}
  </div>`;
}

// A reconstrução 360° é um recurso ESTRUTURAL, mas depende de o PRODUTO fornecer
// as quatro fotos de estúdio ortogonais (frente, laterais, traseira). O caminho
// base é DERIVADO das próprias fotos do produto — nada aqui é fixado a um modelo
// específico. Cada produto usa a sua pasta /assets/manuais/<modelo>/. Enquanto um
// produto não tiver essas fotos próprias, a central mostra apenas a galeria de
// fotos (sem 360°) — nunca reaproveita as fotos de outro modelo.
const STUDIO_360_FILES = ['foto-01-studio.png', 'foto-02-studio.png', 'foto-03-studio.png', 'foto-05-studio.png'];

function studio360Base(c) {
  if (c.explorar360 && c.explorar360.base) return c.explorar360.base;
  const fotos = c.fotos || [];
  if (fotos.length !== 4) return null;
  let base = null;
  for (const name of STUDIO_360_FILES) {
    const foto = fotos.find((f) => (f.url || '').endsWith('/' + name));
    if (!foto) return null;
    const b = foto.url.slice(0, foto.url.length - name.length);
    if (base === null) base = b; else if (b !== base) return null;
  }
  return base;
}

function canExplore360(c) { return studio360Base(c) !== null; }

/* ---------- Seções ---------- */
function renderVisaoGeral(c) {
  const vg = c.visaoGeral || {};
  const cards = (vg.caracteristicas || []).map((f) => `
    <div class="feature-card">
      <span class="feature-icon">${FEATURE_ICONS[f.icone] || FEATURE_ICONS.drop}</span>
      <h3>${esc(f.titulo)}</h3>
      <p>${esc(f.texto)}</p>
    </div>`).join('');
  return `<section id="visao-geral" class="manual-section">
    <div class="container">
      ${sectionHead('Visão geral', 'Apresentação do produto', '')}
      <p class="manual-lead-text">${esc(vg.texto || '')}</p>
      ${vg.destaque ? `<p class="manual-highlight">${esc(vg.destaque)}</p>` : ''}
      <div class="feature-grid">${cards}</div>
    </div>
  </section>`;
}

function render3D(c, prod) {
  prod = prod || {};
  if (c.fotos && c.fotos.length) {
    const base360 = studio360Base(c);
    const can360 = base360 !== null;
    const label = prod.modelo || prod.nome || 'produto';
    const nome = prod.nome || label;
    return `<section id="explorar-3d" class="manual-section section-tint">
      <div class="container">
        ${sectionHead('Produto interativo', can360 ? `Explore o ${label} em 360°` : 'Fotos do produto', can360 ? 'Arraste para os lados e conheça o produto de todos os ângulos.' : 'Selecione uma foto para ampliar.')}
        ${can360 ? `<div class="product360" data-product360 data-base="${esc(base360)}" data-produto="${esc(label)}">
          <div class="product360-stage">
            <img class="product360-poster" src="${esc(c.fotos[0].url)}" alt="Vista frontal do ${esc(nome)}" loading="lazy" decoding="async">
            <canvas hidden tabindex="0" role="img" aria-label="${esc(nome)} em 360 graus. Arraste para girar, use as setas do teclado para rotação, mais e menos para zoom e Home para voltar à frente."></canvas>
            <span class="product360-badge" aria-hidden="true">360°</span>
          </div>
          <div class="product360-controls" role="group" aria-label="Controles de visualização">
            <button type="button" data-360-action="left" aria-label="Girar 15 graus para a esquerda" disabled>↶</button>
            <button type="button" data-360-action="right" aria-label="Girar 15 graus para a direita" disabled>↷</button>
            <span class="product360-divider" aria-hidden="true"></span>
            <button type="button" data-360-action="zoom-out" aria-label="Diminuir zoom" disabled>−</button>
            <output data-360-zoom aria-label="Nível de zoom">100%</output>
            <button type="button" data-360-action="zoom-in" aria-label="Aumentar zoom" disabled>+</button>
            <button type="button" data-360-action="reset">Voltar à frente</button>
            <button type="button" data-360-action="fullscreen" aria-label="Abrir visualizador em tela cheia">⛶</button>
          </div>
          <label class="product360-angle"><span>Rotação</span><input data-360-angle type="range" min="0" max="359" value="0" step="1" disabled aria-label="Ângulo de rotação" aria-valuetext="0 graus"><span>360°</span></label>
          <div class="product360-views" role="group" aria-label="Vistas do produto">
            <button type="button" data-360-view="0" aria-pressed="true">Frente</button>
            <button type="button" data-360-view="90" aria-pressed="false">Lateral direita</button>
            <button type="button" data-360-view="180" aria-pressed="false">Traseira</button>
            <button type="button" data-360-view="270" aria-pressed="false">Lateral esquerda</button>
          </div>
          <p class="product360-status" data-360-status role="status">Carregando visualização interativa…</p>
          <noscript><p class="product360-status">Ative o JavaScript para girar o produto. As fotografias estão disponíveis abaixo.</p></noscript>
        </div>
        <p class="product360-note">Reconstrução visual aproximada a partir de quatro fotografias. Para conferir conexões, rótulos e detalhes técnicos, consulte as fotos e os desenhos abaixo.</p>` : ''}
        <h3 class="product360-photo-heading">Fotografias de referência</h3>
        <div class="manual-photo-grid">${c.fotos.map((f) => `<figure class="draw-panel active"><button type="button" class="manual-photo-button draw-canvas" data-zoomable aria-label="Ampliar ${esc(f.alt)}"><img src="${esc(f.url)}" alt="${esc(f.alt)}" loading="lazy" decoding="async"></button><figcaption>${esc(f.alt)}</figcaption></figure>`).join('')}</div>
      </div>
    </section>`;
  }
  const cfg = c.modelo3d || {};
  const hotspots = c.hotspots || [];
  const legend = hotspots.map((h) => `<li><span class="dot" aria-hidden="true"></span>${esc(h.nome)}</li>`).join('');
  return `<section id="explorar-3d" class="manual-section section-dark manual-3d">
    <div class="container">
      ${(() => {
        return `<div class="section-head"><p class="eyebrow">Produto interativo</p><h2>Explore em 3D</h2><p class="section-lead">Arraste para girar em 360°, use a rolagem para aproximar e clique nos pontos para conhecer cada componente.</p></div>`;
      })()}
      <div class="viewer3d" id="viewer3d" data-type="${esc(cfg.tipo || 'generico')}">
        <div class="viewer3d-stage" id="viewer3dStage">
          <div class="viewer3d-fallback" id="viewer3dFallback">
            <div class="viewer3d-fallback-art">${MANUAIS_SVGS.frontal}</div>
            <p>Carregando experiência 3D…</p>
          </div>
        </div>
        <div class="viewer3d-toolbar">
          <button type="button" class="viewer3d-btn" id="viewer3dReset" title="Posição inicial" aria-label="Voltar à posição inicial">⟲</button>
          <button type="button" class="viewer3d-btn" id="viewer3dFull" title="Tela cheia" aria-label="Tela cheia">⛶</button>
          <button type="button" class="viewer3d-btn viewer3d-btn--soon" id="viewer3dExplode" title="Vista explodida (em breve)" aria-label="Vista explodida (em breve)" disabled>Explodir <span class="soon-tag">em breve</span></button>
        </div>
      </div>
      <ul class="viewer3d-legend">${legend}</ul>
      <p class="viewer3d-hint">${esc(cfg.legenda || 'Modelo 3D ilustrativo do produto.')}</p>
    </div>
  </section>`;
}

function renderComponentes(c) {
  const components = c.componentes || [];
  const split = Math.ceil(components.length / 2);
  const column = (items, start) => `<ol class="component-list" start="${start + 1}">${items.map((k, i) => `
    <li class="component-item" data-ponto="${esc(k.ponto || '')}">
      <span class="component-num" aria-hidden="true">${start + i + 1}</span>
      <div>
        <h3>${esc(k.nome)}</h3>
        <p>${esc(k.descricao)}</p>
      </div>
    </li>`).join('')}</ol>`;
  return `<section id="conheca" class="manual-section section-tint">
    <div class="container">
      ${sectionHead('Conheça seu produto', 'Principais componentes', 'Conheça as partes do equipamento e suas funções.')}
      <div class="component-layout">
        ${column(components.slice(0, split), 0)}
        ${column(components.slice(split), split)}
      </div>
    </div>
  </section>`;
}

function renderInstalacao(c) {
  const inst = c.instalacao || {};
  const passos = (inst.passos || []).map((p, i) => `
    <div class="install-step fade-up">
      <span class="install-step-num">${String(i + 1).padStart(2, '0')}</span>
      <div class="install-step-body">
        <h3>${esc(p.titulo)}</h3>
        <p>${esc(p.texto)}</p>
      </div>
    </div>`).join('');
  const dicas = (c.dicas || []).map((d) => {
    const m = DICA_META[d.tipo] || DICA_META.dica;
    return `<div class="callout callout--${esc(d.tipo || 'dica')}">
      <span class="callout-tag">${esc(m.label)}</span>
      <h4>${esc(d.titulo)}</h4>
      <p>${esc(d.texto)}</p>
    </div>`;
  }).join('');
  return `<section id="instalacao" class="manual-section">
    <div class="container">
      ${sectionHead('Instalação', 'Passo a passo de instalação', 'Siga a ordem abaixo. A máquina executa um flush automático de ~1 minuto ao iniciar.')}
      <div class="install-steps">${passos}</div>
      ${dicas ? `<div class="callout-grid"><h3 class="callout-grid-title">Dicas de instalação</h3><div class="callout-cards">${dicas}</div></div>` : ''}
    </div>
  </section>`;
}

function renderAntes(c) {
  const a = c.antesDeInstalar || {};
  const req = (a.requisitos || []).map((r) => `<div class="spec-row"><span>${esc(r.rotulo)}</span><strong>${esc(r.valor)}</strong></div>`).join('');
  return `<section id="antes" class="manual-section section-tint">
    <div class="container">
      ${sectionHead('Antes de instalar', 'Preparação e requisitos', 'Confira tudo antes de ligar a água e a energia.')}
      <div class="antes-grid">
        <div class="antes-card">
          <h3>Checklist</h3>
          ${list(a.checklist, 'check-list')}
        </div>
        <div class="antes-card">
          <h3>Ferramentas</h3>
          ${list(a.ferramentas, 'bullet-list')}
          <h3 class="mt">Cuidados</h3>
          ${list(a.cuidados, 'bullet-list')}
        </div>
        <div class="antes-card">
          <h3>Requisitos</h3>
          <div class="spec-table">${req}</div>
        </div>
      </div>
    </div>
  </section>`;
}

function renderEspecificacoes(c) {
  const rows = (c.especificacoes || []).map((s) => `<div class="spec-row"><span>${esc(s.rotulo)}</span><strong>${esc(s.valor)}</strong></div>`).join('');
  return `<section id="especificacoes" class="manual-section">
    <div class="container">
      ${sectionHead('Especificações técnicas', 'Ficha técnica', 'Devido a melhorias do produto, os parâmetros podem mudar; o rótulo do produto prevalece.')}
      <div class="spec-table spec-table--full">${rows}</div>
    </div>
  </section>`;
}

function renderDesenhos(c) {
  const des = c.desenhos || [];
  const dim = c.dimensoes || {};
  const tabs = des.map((d, i) => `<button type="button" class="draw-tab${i === 0 ? ' active' : ''}" data-draw="${i}">${esc(d.titulo)}</button>`).join('');
  const panels = des.map((d, i) => {
    const svg = d.imagem_url ? `<img src="${esc(d.imagem_url)}" alt="${esc(d.titulo + (d.descricao ? ': ' + d.descricao : ''))}" loading="lazy" decoding="async">` : (MANUAIS_SVGS[d.svg] || '');
    const dl = d.arquivo_url ? `<a class="btn btn-outline-dark draw-download" href="${esc(d.arquivo_url)}" download>Baixar arquivo original</a>` : '';
    return `<figure class="draw-panel${i === 0 ? ' active' : ''}" data-draw-panel="${i}" data-vista="${esc(d.vista || '')}">
      <div class="draw-canvas" data-zoomable>${svg}</div>
      <figcaption>
        <strong>${esc(d.titulo)}</strong>
        <span>${esc(d.descricao || '')}</span>
        <div class="draw-actions">
          <button type="button" class="btn btn-outline-dark draw-zoom-btn">Ampliar / tela cheia</button>
          ${dl}
        </div>
      </figcaption>
    </figure>`;
  }).join('');
  const dimBar = (dim.altura || dim.largura || dim.profundidade)
    ? `<div class="draw-dims"><span>Dimensões</span><strong>${esc(dim.altura || '—')} (A) × ${esc(dim.largura || '—')} (L) × ${esc(dim.profundidade || '—')} (P)</strong></div>`
    : '';
  return `<section id="desenhos" class="manual-section section-tint">
    <div class="container">
      ${sectionHead('Desenhos técnicos', 'Documentação técnica', 'Alterne entre as vistas, amplie para ver detalhes e consulte as dimensões.')}
      <div class="draw-tabs" role="tablist">${tabs}</div>
      <div class="draw-stage">${panels}</div>
      ${dimBar}
    </div>
  </section>`;
}

function renderUso(c) {
  const u = c.uso || {};
  return `<section id="uso" class="manual-section">
    <div class="container">
      ${sectionHead('Uso e operação', 'Como utilizar', '')}
      <p class="manual-lead-text">${esc(u.texto || '')}</p>
      ${list(u.topicos, 'feature-checklist')}
    </div>
  </section>`;
}

function renderManutencao(c) {
  const m = c.manutencao || {};
  const per = (m.periodicidade || []).map((p) => `<div class="spec-row"><span>${esc(p.rotulo)}</span><strong>${esc(p.valor)}</strong></div>`).join('');
  const passos = (m.passos || []).map((p, i) => `<li><span class="ol-num">${i + 1}</span>${esc(p)}</li>`).join('');
  return `<section id="manutencao" class="manual-section section-tint">
    <div class="container">
      ${sectionHead('Manutenção', 'Conservação e troca de filtros', '')}
      <p class="manual-lead-text">${esc(m.texto || '')}</p>
      <div class="manut-grid">
        <div class="manut-card">
          <h3>Periodicidade de troca</h3>
          <div class="spec-table">${per}</div>
        </div>
        <div class="manut-card">
          <h3>Quando trocar o filtro</h3>
          ${list(m.quandoTrocar, 'check-list')}
        </div>
      </div>
      <h3 class="mt">Passo a passo da troca</h3>
      <ol class="ordered-steps">${passos}</ol>
      ${m.reset ? `<div class="callout callout--dica"><span class="callout-tag">Reset do filtro</span><p>${esc(m.reset)}</p></div>` : ''}
    </div>
  </section>`;
}

function renderProblemas(c) {
  const tbl = c.troubleshooting || [];
  const probs = Array.from(new Set(tbl.map((t) => t.problema)));
  const opts = probs.map((p) => `<option value="${esc(p)}">${esc(p)}</option>`).join('');
  const rows = tbl.map((t) => `<tr class="trouble-row"
      data-problema="${esc(t.problema)}"
      data-text="${esc((t.problema + ' ' + t.causa + ' ' + t.solucao).toLowerCase())}">
    <td data-label="Problema"><strong>${esc(t.problema)}</strong></td>
    <td data-label="Possível causa">${esc(t.causa)}</td>
    <td data-label="O que fazer">${esc(t.solucao)}</td>
  </tr>`).join('');
  return `<section id="problemas" class="manual-section">
    <div class="container">
      ${sectionHead('Solução de problemas', 'Problema → causa → o que fazer', 'Pesquise pelo sintoma ou filtre pelo tipo de problema.')}
      <div class="trouble-controls">
        <div class="manual-search">
          <svg class="manual-search-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="1.6"/><path d="M20 20l-3.2-3.2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
          <input type="search" id="troubleSearch" placeholder="Buscar sintoma (ex.: não liga, E2, vazão)" aria-label="Buscar problema">
        </div>
        <label class="manual-filter">
          <span class="sr-only">Filtrar por problema</span>
          <select id="troubleFilter" aria-label="Filtrar por problema">
            <option value="">Todos os problemas</option>
            ${opts}
          </select>
        </label>
      </div>
      <div class="trouble-table-wrap">
        <table class="trouble-table">
          <thead><tr><th>Problema</th><th>Possível causa</th><th>O que fazer</th></tr></thead>
          <tbody id="troubleBody">${rows}</tbody>
        </table>
      </div>
      <p class="manual-noresults" id="troubleNoResults" hidden>Nenhum resultado. Tente outro termo ou acione o SAC.</p>
    </div>
  </section>`;
}

function renderFaq(c) {
  const faq = c.faq || [];
  const cats = Array.from(new Set(faq.map((f) => f.categoria).filter(Boolean)));
  const chips = ['<button type="button" class="faq-chip active" data-cat="">Todas</button>']
    .concat(cats.map((cat) => `<button type="button" class="faq-chip" data-cat="${esc(cat)}">${esc(cat)}</button>`))
    .join('');
  const items = faq.map((f, i) => `<div class="faq-item" data-cat="${esc(f.categoria || '')}" data-text="${esc((f.pergunta + ' ' + f.resposta).toLowerCase())}">
    <button class="faq-question" aria-expanded="false" aria-controls="faq-a-${i}">
      <span>${esc(f.pergunta)}</span><span class="faq-icon" aria-hidden="true"></span>
    </button>
    <div class="faq-answer" id="faq-a-${i}"><p>${esc(f.resposta)}</p></div>
  </div>`).join('');
  return `<section id="faq" class="manual-section section-tint">
    <div class="container">
      ${sectionHead('Perguntas técnicas frequentes', 'FAQ do produto', 'Dúvidas comuns sobre instalação, funcionamento, manutenção, especificações e uso.')}
      <div class="faq-chips">${chips}</div>
      <div class="faq-list" id="manualFaqList">${items}</div>
    </div>
  </section>`;
}

function renderGarantia(c) {
  const g = c.garantia || {};
  return `<section id="garantia" class="manual-section">
    <div class="container">
      ${sectionHead('Garantia', 'Condições de garantia', '')}
      <div class="warranty-card">
        <div class="warranty-term"><span>Prazo</span><strong>${esc(g.prazo || 'Conforme termo do fabricante')}</strong></div>
        <p>${esc(g.texto || '')}</p>
        ${list(g.condicoes, 'check-list')}
        <a href="/sac.html" class="btn btn-primary">Acionar garantia no SAC</a>
      </div>
    </div>
  </section>`;
}

function renderSac() {
  return `<section id="sac" class="manual-section section-dark manual-sac">
    <div class="container">
      <div class="manual-sac-inner">
        <div>
          <p class="eyebrow">Suporte</p>
          <h2>Precisa de ajuda que o manual não resolveu?</h2>
          <p class="section-lead">Nossa equipe de atendimento cuida de suporte técnico, garantia, trocas e instalação.</p>
        </div>
        <a href="/sac.html" class="btn btn-primary">Acessar o SAC</a>
      </div>
    </div>
  </section>`;
}

/* ---------- Página ---------- */
const NAV = [
  ['visao-geral', 'Visão geral'],
  ['explorar-3d', 'Explorar em 3D'],
  ['conheca', 'Componentes'],
  ['instalacao', 'Instalação'],
  ['antes', 'Antes de instalar'],
  ['especificacoes', 'Especificações'],
  ['desenhos', 'Desenhos técnicos'],
  ['uso', 'Uso e operação'],
  ['manutencao', 'Manutenção'],
  ['problemas', 'Solução de problemas'],
  ['faq', 'FAQ'],
  ['garantia', 'Garantia'],
  ['sac', 'SAC']
];

export async function onRequestGet({ env, params }) {
  await ensureManuaisSchema(env.DB);
  await seedManuais(env.DB);

  const prod = await env.DB.prepare(
    `SELECT * FROM produtos_manual WHERE slug = ? AND status = 'publicado'`
  ).bind(params.slug).first();

  if (!prod) {
    const notFound = renderDocument({
      title: 'Manual não encontrado | OSMOS',
      description: 'O manual solicitado não foi encontrado.',
      canonicalPath: `/manuais/${params.slug}`,
      bodyHtml: `<section class="manuais-hero"><div class="container">
        <p class="eyebrow">Central de Manuais</p>
        <h1>Manual não encontrado</h1>
        <p class="section-lead">Não encontramos este produto. Volte à central e localize seu manual.</p>
        <p style="margin-top:1.5rem"><a class="btn btn-primary" href="/manuais">Ver todos os manuais</a></p>
      </div></section>`
    });
    return new Response(notFound, { status: 404, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
  }

  let c = {};
  try { c = JSON.parse(prod.conteudo_json || '{}'); } catch (e) { c = {}; }

  const navChips = NAV.map(([id, label]) => { if (id === 'explorar-3d' && c.fotos?.length) label = canExplore360(c) ? 'Explorar em 360°' : 'Fotos do produto'; return `<a href="#${id}" data-sec="${id}">${esc(label)}</a>`; }).join('');

  const bodyHtml = `
  <section class="manual-top">
    <div class="container">
      <nav class="breadcrumb" aria-label="Você está em"><a href="/manuais">Manuais</a> <span aria-hidden="true">/</span> <span>${esc(prod.nome)}</span></nav>
      <div class="manual-top-grid">
        <div class="manual-top-info">
          <p class="eyebrow">${esc(prod.categoria || 'Manual interativo')}</p>
          <h1>${esc(prod.nome)}</h1>
          <div class="manual-top-meta">
            ${prod.modelo ? `<span class="manual-chip">Modelo ${esc(prod.modelo)}</span>` : ''}
            ${prod.sku ? `<span class="manual-chip">SKU ${esc(prod.sku)}</span>` : ''}
          </div>
          <p class="section-lead">${esc(prod.descricao_curta || '')}</p>
          <div class="manual-search manual-smart-search">
            <svg class="manual-search-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="1.6"/><path d="M20 20l-3.2-3.2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
            <input type="search" id="manualSmartSearch" placeholder="O que você procura neste manual? (ex.: trocar filtro, E2, pressão)" aria-label="Buscar dentro do manual" autocomplete="off">
            <div class="smart-results" id="smartResults" hidden></div>
          </div>
        </div>
        <div class="manual-top-art">${prod.imagem_url ? `<img src="${esc(prod.imagem_url)}" alt="${esc(prod.imagem_alt || prod.nome)}" fetchpriority="high">` : MANUAIS_SVGS.frontal}</div>
      </div>
    </div>
    <nav class="manual-subnav" id="manualSubnav" aria-label="Seções do manual">
      <div class="container manual-subnav-inner">${navChips}</div>
    </nav>
  </section>

  ${renderVisaoGeral(c)}
  ${render3D(c, prod)}
  ${renderComponentes(c)}
  ${renderInstalacao(c)}
  ${renderAntes(c)}
  ${renderEspecificacoes(c)}
  ${renderDesenhos(c)}
  ${renderUso(c)}
  ${renderManutencao(c)}
  ${renderProblemas(c)}
  ${renderFaq(c)}
  ${renderGarantia(c)}
  ${renderSac()}

  <!-- Lightbox dos desenhos técnicos -->
  <div class="draw-lightbox" id="drawLightbox" hidden>
    <button type="button" class="draw-lightbox-close" id="drawLightboxClose" aria-label="Fechar">✕</button>
    <div class="draw-lightbox-canvas" id="drawLightboxCanvas"></div>
  </div>

  <!-- Painel de hotspot do 3D -->
  <div class="hotspot-popover" id="hotspotPopover" hidden></div>

  <script type="application/json" id="manual-data">${JSON.stringify({ hotspots: c.hotspots || [], modelo3d: c.modelo3d || {} }).replace(/</g, '\\u003c')}</script>`;

  const faqLd = (c.faq && c.faq.length) ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: c.faq.map((f) => ({
      '@type': 'Question',
      name: f.pergunta,
      acceptedAnswer: { '@type': 'Answer', text: f.resposta }
    }))
  } : null;

  const html = renderDocument({
    title: `Manual ${esc(prod.nome)}${prod.modelo ? ' (' + esc(prod.modelo) + ')' : ''} | OSMOS`,
    description: prod.descricao_curta || `Manual interativo do ${prod.nome}: instalação, especificações, desenhos técnicos, manutenção, solução de problemas, FAQ e garantia.`,
    canonicalPath: `/manuais/${prod.slug}`,
    ogImage: prod.imagem_url || '',
    jsonLd: faqLd,
    bodyHtml,
    extraHead: '\n<style>:root{scroll-padding-top:150px}.draw-lightbox[hidden]{display:none!important}</style>',
    bodyEndScripts: '<script src="/js/manual.js?v=20261006-lightbox" defer></script><script type="module" src="/js/product360.js?v=20261002-1"></script>'
  });

  return new Response(html, {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=300' }
  });
}

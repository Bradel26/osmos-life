/* ===== Aba: Manuais (Central de Manuais e Suporte Técnico) ===== */
(function () {
  'use strict';

  var state = { page: 1, pageSize: 25, sortBy: 'ordem', sortDir: 'asc', status: '', total: 0 };

  var els = {
    listPanel: document.getElementById('manualListPanel'),
    editorPanel: document.getElementById('manualEditorPanel'),
    statusFilter: document.getElementById('manualStatusFilter'),
    newBtn: document.getElementById('manualNewBtn'),
    tableBody: document.getElementById('manualTableBody'),
    emptyState: document.getElementById('manualEmptyState'),
    loadingState: document.getElementById('manualLoadingState'),
    resultCount: document.getElementById('manualResultCount'),
    pageInfo: document.getElementById('manualPageInfo'),
    prevPageBtn: document.getElementById('manualPrevPageBtn'),
    nextPageBtn: document.getElementById('manualNextPageBtn'),
    editorTitle: document.getElementById('manualEditorTitle'),
    form: document.getElementById('manualEditorForm'),
    previewLink: document.getElementById('manualPreviewLink'),
    cancelBtn: document.getElementById('manualCancelBtn'),
    cancelBtn2: document.getElementById('manualCancelBtn2'),
    saveBtn: document.getElementById('manualSaveBtn'),
    saveStatus: document.getElementById('manualSaveStatus'),
    jsonStatus: document.getElementById('manualJsonStatus'),
    templateBtn: document.getElementById('manualTemplateBtn'),
    validateBtn: document.getElementById('manualValidateBtn'),
    formatBtn: document.getElementById('manualFormatBtn'),
    fId: document.getElementById('mId'),
    fNome: document.getElementById('mNome'),
    fModelo: document.getElementById('mModelo'),
    fSku: document.getElementById('mSku'),
    fCategoria: document.getElementById('mCategoria'),
    fOrdem: document.getElementById('mOrdem'),
    fStatus: document.getElementById('mStatus'),
    fSlug: document.getElementById('mSlug'),
    fDescricao: document.getElementById('mDescricao'),
    fImagemUrl: document.getElementById('mImagemUrl'),
    fImagemAlt: document.getElementById('mImagemAlt'),
    fKeywords: document.getElementById('mKeywords'),
    fConteudo: document.getElementById('mConteudo')
  };

  if (!els.form) return; // aba não presente

  // Esqueleto VAZIO (estrutura reutilizável) para um PRODUTO NOVO.
  // Regra: cada produto tem como fonte de verdade apenas o SEU próprio manual.
  // Os campos vêm preenchidos com "A definir" / "Informação não fornecida" de
  // propósito — NUNCA copie dados técnicos de outro modelo (ex.: A9 PLUS) para
  // completar lacunas. Preencha só com o que constar no manual deste produto.
  var PENDENTE = 'A definir';
  var SEM_INFO = 'Informação não fornecida';
  var TEMPLATE = {
    visaoGeral: {
      texto: SEM_INFO,
      caracteristicas: [
        { icone: 'drop', titulo: PENDENTE, texto: SEM_INFO }
      ],
      destaque: ''
    },
    componentes: [
      { nome: PENDENTE, descricao: SEM_INFO, ponto: '' }
    ],
    antesDeInstalar: {
      checklist: [PENDENTE],
      ferramentas: [PENDENTE],
      requisitos: [{ rotulo: PENDENTE, valor: SEM_INFO }],
      cuidados: [PENDENTE]
    },
    instalacao: { passos: [{ titulo: PENDENTE, texto: SEM_INFO }] },
    especificacoes: [{ rotulo: 'Modelo', valor: PENDENTE }],
    desenhos: [
      { titulo: PENDENTE, vista: 'frontal', svg: 'frontal', descricao: '', imagem_url: '', arquivo_url: '' }
    ],
    dimensoes: { altura: '', largura: '', profundidade: '' },
    // Galeria de fotos do produto. Use a PASTA PRÓPRIA deste produto:
    // /assets/manuais/<modelo>/...  (nunca a pasta de outro modelo).
    fotos: [],
    // 360° opcional: só preencha quando houver as fotos de estúdio PRÓPRIAS
    // deste produto (frente, lateral dir., traseira, lateral esq.) e o perfil de
    // reconstrução correspondente. Deixe "base" vazio para manter apenas a
    // galeria de fotos, sem giro 360°.
    explorar360: { base: '', views: [] },
    uso: { texto: SEM_INFO, topicos: [PENDENTE] },
    manutencao: {
      texto: SEM_INFO,
      periodicidade: [{ rotulo: PENDENTE, valor: SEM_INFO }],
      quandoTrocar: [PENDENTE],
      passos: [PENDENTE],
      reset: SEM_INFO
    },
    troubleshooting: [{ problema: PENDENTE, causa: SEM_INFO, solucao: SEM_INFO }],
    faq: [{ categoria: PENDENTE, pergunta: PENDENTE, resposta: SEM_INFO }],
    garantia: { prazo: PENDENTE, texto: SEM_INFO, condicoes: [] },
    dicas: [{ tipo: 'dica', titulo: PENDENTE, texto: SEM_INFO }],
    modelo3d: { tipo: 'generico', legenda: 'Modelo 3D ilustrativo. Arraste para girar.' },
    hotspots: [
      { id: 'ponto1', nome: PENDENTE, x: 0, y: 0, z: 0.6, funcao: SEM_INFO, uso: '', cuidado: '', especificacao: '', linkSecao: 'instalacao' }
    ]
  };

  function escapeHtml(v) { var d = document.createElement('div'); d.textContent = v == null ? '' : String(v); return d.innerHTML; }

  function apiFetch(url, options) {
    return fetch(url, Object.assign({ credentials: 'same-origin' }, options || {})).then(function (res) {
      if (res.status === 401) { window.location.href = 'login.html'; throw new Error('unauthorized'); }
      return res;
    });
  }

  function buildQueryParams() {
    var p = new URLSearchParams();
    p.set('page', state.page); p.set('pageSize', state.pageSize);
    p.set('sortBy', state.sortBy); p.set('sortDir', state.sortDir);
    if (state.status) p.set('status', state.status);
    return p;
  }

  function statusBadge(s) {
    return s === 'publicado' ? '<span class="badge badge-ok">Publicado</span>' : '<span class="badge">Rascunho</span>';
  }

  function renderTable(items) {
    els.tableBody.innerHTML = items.map(function (row) {
      var viewBtn = row.status === 'publicado'
        ? '<a class="btn btn-ghost btn-sm" href="/manuais/' + encodeURIComponent(row.slug) + '" target="_blank" rel="noopener">Ver</a>' : '';
      return '<tr>' +
        '<td>' + (row.ordem != null ? row.ordem : '—') + '</td>' +
        '<td>' + escapeHtml(row.nome) + '<div class="muted" style="font-size:0.78rem;">/manuais/' + escapeHtml(row.slug) + '</div></td>' +
        '<td>' + escapeHtml(row.modelo || '—') + '</td>' +
        '<td>' + statusBadge(row.status) + '</td>' +
        '<td class="row-actions">' + viewBtn +
          '<button type="button" class="btn btn-ghost btn-sm" data-action="edit" data-id="' + row.id + '">Editar</button>' +
          '<button type="button" class="btn btn-danger btn-sm" data-action="delete" data-id="' + row.id + '">Excluir</button>' +
        '</td></tr>';
    }).join('');
  }

  function updatePagination() {
    var totalPages = Math.max(1, Math.ceil(state.total / state.pageSize));
    var start = state.total === 0 ? 0 : (state.page - 1) * state.pageSize + 1;
    var end = Math.min(state.page * state.pageSize, state.total);
    els.pageInfo.textContent = 'Mostrando ' + start + '–' + end + ' de ' + state.total;
    els.resultCount.textContent = 'Produtos (' + state.total + ')';
    els.prevPageBtn.disabled = state.page <= 1;
    els.nextPageBtn.disabled = state.page >= totalPages;
  }

  function loadList() {
    els.loadingState.hidden = false; els.emptyState.hidden = true;
    return apiFetch('/api/admin/manuais?' + buildQueryParams().toString())
      .then(function (r) { return r.json(); })
      .then(function (data) {
        state.total = data.total;
        renderTable(data.items);
        updatePagination();
        els.emptyState.hidden = data.items.length > 0;
        els.loadingState.hidden = true;
      })
      .catch(function (err) { if (err.message !== 'unauthorized') console.error(err); els.loadingState.hidden = true; });
  }

  function showEditor(isEdit) {
    els.editorTitle.textContent = isEdit ? 'Editar produto' : 'Novo produto';
    els.saveStatus.textContent = ''; els.jsonStatus.textContent = '';
    els.listPanel.hidden = true; els.editorPanel.hidden = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function showList() { els.editorPanel.hidden = true; els.listPanel.hidden = false; loadList(); }

  function resetForm() {
    els.form.reset();
    els.fId.value = ''; els.fStatus.value = 'rascunho'; els.fOrdem.value = '0';
    els.fConteudo.value = ''; els.previewLink.hidden = true; els.jsonStatus.textContent = '';
  }

  function fillForm(p) {
    els.fId.value = p.id;
    els.fNome.value = p.nome || '';
    els.fModelo.value = p.modelo || '';
    els.fSku.value = p.sku || '';
    els.fCategoria.value = p.categoria || '';
    els.fOrdem.value = p.ordem != null ? p.ordem : 0;
    els.fStatus.value = p.status === 'publicado' ? 'publicado' : 'rascunho';
    els.fSlug.value = p.slug || '';
    els.fDescricao.value = p.descricao_curta || '';
    els.fImagemUrl.value = p.imagem_url || '';
    els.fImagemAlt.value = p.imagem_alt || '';
    els.fKeywords.value = p.keywords || '';
    var conteudo = p.conteudo || {};
    els.fConteudo.value = JSON.stringify(conteudo, null, 2);
    if (p.status === 'publicado' && p.slug) {
      els.previewLink.href = '/manuais/' + encodeURIComponent(p.slug); els.previewLink.hidden = false;
    } else { els.previewLink.hidden = true; }
  }

  function openNew() { resetForm(); els.fConteudo.value = JSON.stringify(TEMPLATE, null, 2); showEditor(false); }
  function openEdit(id) {
    apiFetch('/api/admin/manuais/' + id).then(function (r) { return r.json(); }).then(function (p) {
      resetForm(); fillForm(p); showEditor(true);
    });
  }

  function parseConteudo() {
    var raw = els.fConteudo.value.trim();
    if (!raw) return {};
    return JSON.parse(raw); // pode lançar
  }

  function collectForm(conteudo) {
    return {
      nome: els.fNome.value.trim(),
      modelo: els.fModelo.value.trim(),
      sku: els.fSku.value.trim(),
      categoria: els.fCategoria.value.trim(),
      ordem: parseInt(els.fOrdem.value, 10) || 0,
      status: els.fStatus.value === 'publicado' ? 'publicado' : 'rascunho',
      slug: els.fSlug.value.trim(),
      descricao_curta: els.fDescricao.value.trim(),
      imagem_url: els.fImagemUrl.value.trim(),
      imagem_alt: els.fImagemAlt.value.trim(),
      keywords: els.fKeywords.value.trim(),
      conteudo: conteudo
    };
  }

  els.form.addEventListener('submit', function (e) {
    e.preventDefault();
    var conteudo;
    try { conteudo = parseConteudo(); }
    catch (err) { els.saveStatus.textContent = 'JSON do conteúdo inválido: ' + err.message; return; }
    var payload = collectForm(conteudo);
    if (!payload.nome) { els.saveStatus.textContent = 'Informe o nome do produto.'; return; }

    var id = els.fId.value;
    var url = id ? '/api/admin/manuais/' + id : '/api/admin/manuais';
    var method = id ? 'PUT' : 'POST';
    els.saveBtn.disabled = true; els.saveStatus.textContent = 'Salvando...';

    apiFetch(url, { method: method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      .then(function (res) { return res.json().then(function (data) { return { ok: res.ok, data: data }; }); })
      .then(function (r) {
        els.saveBtn.disabled = false;
        if (!r.ok) { els.saveStatus.textContent = (r.data && r.data.error) || 'Erro ao salvar.'; return; }
        els.saveStatus.textContent = 'Salvo!'; showList();
      })
      .catch(function (err) {
        els.saveBtn.disabled = false;
        if (err.message !== 'unauthorized') { els.saveStatus.textContent = 'Erro ao salvar.'; console.error(err); }
      });
  });

  function deleteProd(id) {
    if (!window.confirm('Excluir este produto e seu manual permanentemente?')) return;
    apiFetch('/api/admin/manuais/' + id, { method: 'DELETE' }).then(function () { loadList(); });
  }

  // JSON helpers
  function validateJson(silent) {
    try { parseConteudo(); els.jsonStatus.textContent = 'JSON válido ✓'; els.jsonStatus.style.color = 'var(--success, #2f9e5c)'; return true; }
    catch (err) { if (!silent) { els.jsonStatus.textContent = 'Erro: ' + err.message; els.jsonStatus.style.color = 'var(--danger, #c0392b)'; } return false; }
  }

  els.templateBtn.addEventListener('click', function () {
    if (els.fConteudo.value.trim() && !window.confirm('Substituir o conteúdo atual pelo modelo de exemplo?')) return;
    els.fConteudo.value = JSON.stringify(TEMPLATE, null, 2); validateJson();
  });
  els.validateBtn.addEventListener('click', function () { validateJson(); });
  els.formatBtn.addEventListener('click', function () {
    try { els.fConteudo.value = JSON.stringify(parseConteudo(), null, 2); els.jsonStatus.textContent = 'Formatado ✓'; els.jsonStatus.style.color = 'var(--success, #2f9e5c)'; }
    catch (err) { els.jsonStatus.textContent = 'Erro: ' + err.message; els.jsonStatus.style.color = 'var(--danger, #c0392b)'; }
  });

  els.newBtn.addEventListener('click', openNew);
  els.cancelBtn.addEventListener('click', showList);
  els.cancelBtn2.addEventListener('click', showList);
  els.statusFilter.addEventListener('change', function () { state.status = els.statusFilter.value; state.page = 1; loadList(); });
  els.tableBody.addEventListener('click', function (e) {
    var btn = e.target.closest('button[data-action]'); if (!btn) return;
    var id = btn.getAttribute('data-id'), action = btn.getAttribute('data-action');
    if (action === 'edit') openEdit(id);
    if (action === 'delete') deleteProd(id);
  });
  els.prevPageBtn.addEventListener('click', function () { if (state.page > 1) { state.page--; loadList(); } });
  els.nextPageBtn.addEventListener('click', function () { state.page++; loadList(); });

  window.OsmosAdminTabs.onActivate('manuais', function () {
    els.editorPanel.hidden = true; els.listPanel.hidden = false; loadList();
  });
})();

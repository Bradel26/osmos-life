/* ===== Aba: Diagnóstico da Água (Raio-X da Água) ===== */
(function () {
  'use strict';

  var QUESTION_LABELS = {
    tipo_imovel: 'Onde você mora?',
    origem_agua: 'Qual é a origem da água que você utiliza?',
    qtd_moradores: 'Quantas pessoas utilizam essa água diariamente?',
    consumo_atual: 'Como você consome água para beber atualmente?',
    problemas_agua: 'Quais problemas você percebe na água?',
    manchas_locais: 'Você percebe manchas em algum destes locais?',
    freq_compra_agua: 'Com que frequência você compra água mineral?',
    cozinha_mesma_agua: 'Você cozinha utilizando a mesma água que bebe?',
    maior_preocupacao: 'Qual sua maior preocupação em relação à água?',
    tem_criancas: 'Você possui crianças pequenas?',
    pessoas_risco: 'Existe alguma dessas pessoas na residência?',
    analise_previa: 'Você já realizou análise da água?',
    interesse_analise: 'Você teria interesse em receber uma análise gratuita da qualidade da sua água?',
    investimento: 'Qual investimento você imagina fazer para resolver definitivamente a qualidade da água?'
  };
  var MULTI_FIELDS = ['consumo_atual', 'problemas_agua', 'manchas_locais', 'pessoas_risco'];

  var state = {
    page: 1,
    pageSize: 25,
    sortBy: 'created_at',
    sortDir: 'desc',
    filters: { dateFrom: '', dateTo: '', cidade: '', estado: '', origemAgua: '', qtdMoradores: '', tipoImovel: '' },
    total: 0
  };

  var els = {
    kpiGrid: document.getElementById('raioxKpiGrid'),
    filtersForm: document.getElementById('raioxFiltersForm'),
    filtersBody: document.getElementById('raioxFiltersBody'),
    toggleFilters: document.getElementById('raioxToggleFilters'),
    clearFiltersBtn: document.getElementById('raioxClearFiltersBtn'),
    tableBody: document.getElementById('raioxTableBody'),
    emptyState: document.getElementById('raioxEmptyState'),
    loadingState: document.getElementById('raioxLoadingState'),
    resultCount: document.getElementById('raioxResultCount'),
    pageInfo: document.getElementById('raioxPageInfo'),
    prevPageBtn: document.getElementById('raioxPrevPageBtn'),
    nextPageBtn: document.getElementById('raioxNextPageBtn'),
    exportCsvBtn: document.getElementById('raioxExportCsvBtn'),
    exportXlsxBtn: document.getElementById('raioxExportXlsxBtn'),
    exportJsonBtn: document.getElementById('raioxExportJsonBtn'),
    viewModal: document.getElementById('viewModal'),
    viewModalBody: document.getElementById('viewModalBody')
  };

  function escapeHtml(value) {
    var div = document.createElement('div');
    div.textContent = value == null ? '' : String(value);
    return div.innerHTML;
  }

  function splitDateTime(createdAt) {
    if (!createdAt) return { data: '—', hora: '—' };
    var parts = createdAt.split(' ');
    return { data: parts[0] || '—', hora: parts[1] || '—' };
  }

  function classBadgeClass(classificacao) {
    if (classificacao === 'Baixo risco') return 'badge-baixo';
    if (classificacao === 'Atenção') return 'badge-atencao';
    if (classificacao === 'Alto risco') return 'badge-alto';
    if (classificacao === 'Crítico') return 'badge-critico';
    return '';
  }

  function parseMulti(value) {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    try {
      var arr = JSON.parse(value);
      return Array.isArray(arr) ? arr : [];
    } catch (err) {
      return [];
    }
  }

  function buildQueryParams(extra) {
    var params = new URLSearchParams();
    params.set('page', state.page);
    params.set('pageSize', state.pageSize);
    params.set('sortBy', state.sortBy);
    params.set('sortDir', state.sortDir);
    Object.keys(state.filters).forEach(function (key) {
      if (state.filters[key]) params.set(key, state.filters[key]);
    });
    if (extra) Object.keys(extra).forEach(function (key) { params.set(key, extra[key]); });
    return params;
  }

  function apiFetch(url, options) {
    return fetch(url, Object.assign({ credentials: 'same-origin' }, options || {})).then(function (res) {
      if (res.status === 401) {
        window.location.href = 'login.html';
        throw new Error('unauthorized');
      }
      return res;
    });
  }

  function renderKpis(kpis) {
    els.kpiGrid.querySelector('[data-kpi="total"]').textContent = kpis.total;
    els.kpiGrid.querySelector('[data-kpi="hoje"]').textContent = kpis.hoje;
    els.kpiGrid.querySelector('[data-kpi="semana"]').textContent = kpis.semana;
    els.kpiGrid.querySelector('[data-kpi="mes"]').textContent = kpis.mes;
    els.kpiGrid.querySelector('[data-kpi="scoreMedio"]').textContent = kpis.scoreMedio == null ? '—' : kpis.scoreMedio;
    els.kpiGrid.querySelector('[data-kpi="criticos"]').textContent = (kpis.porClassificacao && kpis.porClassificacao['Crítico']) || 0;
  }

  function renderTable(items) {
    els.tableBody.innerHTML = items.map(function (row) {
      var dt = splitDateTime(row.created_at);
      var classBadge = row.classificacao
        ? '<span class="badge ' + classBadgeClass(row.classificacao) + '">' + escapeHtml(row.classificacao) + '</span>'
        : '<span class="badge muted">Incompleto</span>';
      return '<tr>' +
        '<td>' + row.id + '</td>' +
        '<td>' + escapeHtml(dt.data) + '</td>' +
        '<td>' + escapeHtml(row.nome || '—') + '</td>' +
        '<td>' + escapeHtml(row.whatsapp || '—') + '</td>' +
        '<td>' + escapeHtml(row.cidade || '—') + '</td>' +
        '<td>' + escapeHtml(row.estado || '—') + '</td>' +
        '<td>' + classBadge + '</td>' +
        '<td>' + (row.score == null ? '—' : row.score) + '</td>' +
        '<td class="row-actions">' +
          '<button type="button" class="btn btn-ghost btn-sm" data-action="view" data-id="' + row.id + '">Visualizar</button>' +
          '<button type="button" class="btn btn-ghost btn-sm" data-action="export-row" data-id="' + row.id + '">Exportar</button>' +
          '<button type="button" class="btn btn-danger btn-sm" data-action="delete" data-id="' + row.id + '">Excluir</button>' +
        '</td>' +
        '</tr>';
    }).join('');
  }

  function updateSortHeaders() {
    document.querySelectorAll('[data-tab-panel="raiox"] th[data-sort]').forEach(function (th) {
      var col = th.getAttribute('data-sort');
      th.classList.toggle('sorted', col === state.sortBy);
      th.setAttribute('data-dir', col === state.sortBy ? state.sortDir : '');
    });
  }

  function updatePagination() {
    var totalPages = Math.max(1, Math.ceil(state.total / state.pageSize));
    var start = state.total === 0 ? 0 : (state.page - 1) * state.pageSize + 1;
    var end = Math.min(state.page * state.pageSize, state.total);
    els.pageInfo.textContent = 'Mostrando ' + start + '–' + end + ' de ' + state.total;
    els.resultCount.textContent = 'Respostas (' + state.total + ')';
    els.prevPageBtn.disabled = state.page <= 1;
    els.nextPageBtn.disabled = state.page >= totalPages;
  }

  function loadList() {
    els.loadingState.hidden = false;
    els.emptyState.hidden = true;
    return apiFetch('/api/admin/raiox-agua?' + buildQueryParams().toString())
      .then(function (res) { return res.json(); })
      .then(function (data) {
        state.total = data.total;
        renderKpis(data.kpis);
        renderTable(data.items);
        updateSortHeaders();
        updatePagination();
        els.emptyState.hidden = data.items.length > 0;
        els.loadingState.hidden = true;
      })
      .catch(function (err) {
        if (err.message !== 'unauthorized') console.error(err);
        els.loadingState.hidden = true;
      });
  }

  /* ===== Filters ===== */
  els.filtersForm.addEventListener('submit', function (e) {
    e.preventDefault();
    state.filters.dateFrom = document.getElementById('rDateFrom').value;
    state.filters.dateTo = document.getElementById('rDateTo').value;
    state.filters.cidade = document.getElementById('rCidade').value.trim();
    state.filters.estado = document.getElementById('rEstado').value.trim();
    state.filters.origemAgua = document.getElementById('rOrigemAgua').value;
    state.filters.qtdMoradores = document.getElementById('rQtdMoradores').value;
    state.filters.tipoImovel = document.getElementById('rTipoImovel').value;
    state.pageSize = parseInt(document.getElementById('rPageSize').value, 10) || 25;
    state.page = 1;
    loadList();
  });

  els.clearFiltersBtn.addEventListener('click', function () {
    els.filtersForm.reset();
    state.filters = { dateFrom: '', dateTo: '', cidade: '', estado: '', origemAgua: '', qtdMoradores: '', tipoImovel: '' };
    state.page = 1;
    loadList();
  });

  els.toggleFilters.addEventListener('click', function () {
    var hidden = els.filtersBody.style.display === 'none';
    els.filtersBody.style.display = hidden ? '' : 'none';
    els.toggleFilters.textContent = hidden ? 'Recolher' : 'Expandir';
  });

  /* ===== Sorting ===== */
  document.querySelectorAll('[data-tab-panel="raiox"] th[data-sort]').forEach(function (th) {
    th.addEventListener('click', function () {
      var col = th.getAttribute('data-sort');
      if (state.sortBy === col) {
        state.sortDir = state.sortDir === 'asc' ? 'desc' : 'asc';
      } else {
        state.sortBy = col;
        state.sortDir = 'desc';
      }
      loadList();
    });
  });

  /* ===== Pagination ===== */
  els.prevPageBtn.addEventListener('click', function () {
    if (state.page > 1) { state.page--; loadList(); }
  });
  els.nextPageBtn.addEventListener('click', function () {
    state.page++; loadList();
  });

  /* ===== Row actions ===== */
  els.tableBody.addEventListener('click', function (e) {
    var btn = e.target.closest('button[data-action]');
    if (!btn) return;
    var id = btn.getAttribute('data-id');
    var action = btn.getAttribute('data-action');
    if (action === 'view') openDetail(id);
    if (action === 'delete') deleteRow(id);
    if (action === 'export-row') exportRow(id);
  });

  function openDetail(id) {
    apiFetch('/api/admin/raiox-agua/' + id)
      .then(function (res) { return res.json(); })
      .then(function (row) {
        var dt = splitDateTime(row.created_at);
        var qaHtml = Object.keys(QUESTION_LABELS).map(function (field) {
          var raw = row[field];
          var value = MULTI_FIELDS.indexOf(field) !== -1 ? parseMulti(raw).join(', ') : raw;
          return '<li class="qa-item"><div class="q">' + escapeHtml(QUESTION_LABELS[field]) + '</div><div class="a">' +
            escapeHtml(value || 'Não respondida') + '</div></li>';
        }).join('');

        els.viewModalBody.innerHTML =
          '<dl>' +
          '<div><dt>ID</dt><dd>' + row.id + '</dd></div>' +
          '<div><dt>Data / Horário</dt><dd>' + escapeHtml(dt.data) + ' ' + escapeHtml(dt.hora) + '</dd></div>' +
          '<div><dt>Nome</dt><dd>' + escapeHtml(row.nome || '—') + '</dd></div>' +
          '<div><dt>WhatsApp</dt><dd>' + escapeHtml(row.whatsapp || '—') + '</dd></div>' +
          '<div><dt>Cidade / Estado</dt><dd>' + escapeHtml(row.cidade || '—') + ' / ' + escapeHtml(row.estado || '—') + '</dd></div>' +
          '<div><dt>Índice de Qualidade da Água</dt><dd>' + (row.score == null ? '—' : row.score) + (row.classificacao ? ' (' + escapeHtml(row.classificacao) + ')' : '') + '</dd></div>' +
          '<div><dt>Status</dt><dd>' + escapeHtml(row.status) + '</dd></div>' +
          '</dl>' +
          '<h3 style="margin-top:1.1rem;font-size:0.95rem;">Respostas do Raio-X da Água</h3>' +
          '<ul class="qa-list">' + qaHtml + '</ul>' +
          '<div class="field" style="margin-top:1.1rem;">' +
          '<label for="raioxObsField">Observações internas</label>' +
          '<textarea id="raioxObsField" rows="3" style="width:100%;padding:0.7rem;border-radius:8px;border:1px solid var(--border);background:var(--bg);color:var(--text);font-family:inherit;">' + escapeHtml(row.observacoes_internas || '') + '</textarea>' +
          '<button type="button" class="btn btn-primary btn-sm" id="raioxSaveObsBtn" style="margin-top:0.6rem;">Salvar observação</button>' +
          '</div>';

        document.getElementById('raioxSaveObsBtn').addEventListener('click', function () {
          saveObservacao(id);
        });

        els.viewModal.hidden = false;
      });
  }

  function saveObservacao(id) {
    var value = document.getElementById('raioxObsField').value;
    apiFetch('/api/admin/raiox-agua/' + id, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ observacoesInternas: value })
    }).then(function () {
      els.viewModal.hidden = true;
      loadList();
    });
  }

  function deleteRow(id) {
    if (!window.confirm('Excluir esta resposta permanentemente?')) return;
    apiFetch('/api/admin/raiox-agua/' + id, { method: 'DELETE' }).then(function () {
      loadList();
    });
  }

  function exportRow(id) {
    apiFetch('/api/admin/raiox-agua/' + id)
      .then(function (res) { return res.json(); })
      .then(function (row) {
        downloadBlob(JSON.stringify(row, null, 2), 'application/json', 'raiox-agua-' + id + '.json');
      });
  }

  /* ===== Bulk export ===== */
  function fetchAllFiltered() {
    var params = buildQueryParams();
    params.delete('page');
    params.delete('pageSize');
    return apiFetch('/api/admin/raiox-agua/export?' + params.toString()).then(function (res) { return res.json(); });
  }

  function flattenRow(row) {
    var dt = splitDateTime(row.created_at);
    var flat = {
      id: row.id,
      data: dt.data,
      horario: dt.hora,
      status: row.status,
      nome: row.nome,
      whatsapp: row.whatsapp,
      cidade: row.cidade,
      estado: row.estado,
      score: row.score,
      classificacao: row.classificacao,
      observacoes_internas: row.observacoes_internas
    };
    Object.keys(QUESTION_LABELS).forEach(function (field) {
      flat[field] = MULTI_FIELDS.indexOf(field) !== -1 ? parseMulti(row[field]).join('; ') : row[field];
    });
    return flat;
  }

  function downloadBlob(content, mime, filename) {
    var blob = new Blob([content], { type: mime });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function toCsv(rows) {
    if (!rows.length) return '';
    var headers = Object.keys(rows[0]);
    var escapeCell = function (v) {
      var s = v == null ? '' : String(v);
      return '"' + s.replace(/"/g, '""') + '"';
    };
    var lines = [headers.join(',')];
    rows.forEach(function (row) {
      lines.push(headers.map(function (h) { return escapeCell(row[h]); }).join(','));
    });
    return lines.join('\r\n');
  }

  els.exportJsonBtn.addEventListener('click', function () {
    fetchAllFiltered().then(function (data) {
      downloadBlob(JSON.stringify(data.items, null, 2), 'application/json', 'raiox-agua.json');
    });
  });

  els.exportCsvBtn.addEventListener('click', function () {
    fetchAllFiltered().then(function (data) {
      var rows = data.items.map(flattenRow);
      downloadBlob(toCsv(rows), 'text/csv;charset=utf-8', 'raiox-agua.csv');
    });
  });

  els.exportXlsxBtn.addEventListener('click', function () {
    fetchAllFiltered().then(function (data) {
      var rows = data.items.map(flattenRow);
      var ws = XLSX.utils.json_to_sheet(rows);
      var wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'DiagnosticoAgua');
      XLSX.writeFile(wb, 'raiox-agua.xlsx');
    });
  });

  window.OsmosAdminTabs.onActivate('raiox', loadList);
})();

/* ===== Tab controller (compartilhado entre abas do painel) ===== */
(function () {
  'use strict';

  var buttons = Array.prototype.slice.call(document.querySelectorAll('.tab-btn'));
  var panels = Array.prototype.slice.call(document.querySelectorAll('.tab-panel'));
  var activateListeners = {};
  var deactivateListeners = {};
  var currentTab = null;

  function activate(tab) {
    if (currentTab && currentTab !== tab && deactivateListeners[currentTab]) {
      deactivateListeners[currentTab].forEach(function (fn) { fn(); });
    }
    buttons.forEach(function (b) { b.classList.toggle('active', b.getAttribute('data-tab') === tab); });
    panels.forEach(function (p) { p.hidden = p.getAttribute('data-tab-panel') !== tab; });
    currentTab = tab;
    (activateListeners[tab] || []).forEach(function (fn) { fn(); });
  }

  buttons.forEach(function (btn) {
    btn.addEventListener('click', function () { activate(btn.getAttribute('data-tab')); });
  });

  window.OsmosAdminTabs = {
    onActivate: function (tab, fn) {
      activateListeners[tab] = activateListeners[tab] || [];
      activateListeners[tab].push(fn);
    },
    onDeactivate: function (tab, fn) {
      deactivateListeners[tab] = deactivateListeners[tab] || [];
      deactivateListeners[tab].push(fn);
    },
    refreshCurrent: function () {
      (activateListeners[currentTab] || []).forEach(function (fn) { fn(); });
    },
    init: function () {
      var activeBtn = document.querySelector('.tab-btn.active') || buttons[0];
      if (activeBtn) activate(activeBtn.getAttribute('data-tab'));
    }
  };
})();

/* ===== Aba: Questionários ===== */
(function () {
  'use strict';

  var state = {
    page: 1,
    pageSize: 25,
    sortBy: 'created_at',
    sortDir: 'desc',
    filters: { dateFrom: '', dateTo: '', perfil: '' },
    total: 0
  };

  var els = {
    kpiGrid: document.getElementById('kpiGrid'),
    filtersForm: document.getElementById('filtersForm'),
    filtersBody: document.getElementById('filtersBody'),
    toggleFilters: document.getElementById('toggleFilters'),
    clearFiltersBtn: document.getElementById('clearFiltersBtn'),
    tableBody: document.getElementById('tableBody'),
    emptyState: document.getElementById('emptyState'),
    loadingState: document.getElementById('loadingState'),
    resultCount: document.getElementById('resultCount'),
    pageInfo: document.getElementById('pageInfo'),
    prevPageBtn: document.getElementById('prevPageBtn'),
    nextPageBtn: document.getElementById('nextPageBtn'),
    logoutBtn: document.getElementById('logoutBtn'),
    refreshBtn: document.getElementById('refreshBtn'),
    exportCsvBtn: document.getElementById('exportCsvBtn'),
    exportXlsxBtn: document.getElementById('exportXlsxBtn'),
    exportJsonBtn: document.getElementById('exportJsonBtn'),
    viewModal: document.getElementById('viewModal'),
    viewModalBody: document.getElementById('viewModalBody'),
    closeModalBtn: document.getElementById('closeModalBtn')
  };

  function escapeHtml(value) {
    var div = document.createElement('div');
    div.textContent = value == null ? '' : String(value);
    return div.innerHTML;
  }

  function formatTempo(seconds) {
    if (seconds == null) return '—';
    var m = Math.floor(seconds / 60);
    var s = seconds % 60;
    return m > 0 ? (m + 'm ' + s + 's') : (s + 's');
  }

  function splitDateTime(createdAt) {
    if (!createdAt) return { data: '—', hora: '—' };
    var parts = createdAt.split(' ');
    return { data: parts[0] || '—', hora: parts[1] || '—' };
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
    els.kpiGrid.querySelector('[data-kpi="tempoMedio"]').textContent = formatTempo(kpis.tempoMedioSegundos);
    els.kpiGrid.querySelector('[data-kpi="perfil"]').textContent = kpis.perfilPredominante || '—';
  }

  function renderTable(items) {
    els.tableBody.innerHTML = items.map(function (row) {
      var dt = splitDateTime(row.created_at);
      return '<tr>' +
        '<td>' + row.id + '</td>' +
        '<td>' + escapeHtml(dt.data) + '</td>' +
        '<td>' + escapeHtml(dt.hora) + '</td>' +
        '<td><span class="badge">' + escapeHtml(row.perfil || '—') + '</span></td>' +
        '<td class="row-actions">' +
          '<button type="button" class="btn btn-ghost btn-sm" data-action="view" data-id="' + row.id + '">Visualizar</button>' +
          '<button type="button" class="btn btn-ghost btn-sm" data-action="export-row" data-id="' + row.id + '">Exportar</button>' +
          '<button type="button" class="btn btn-danger btn-sm" data-action="delete" data-id="' + row.id + '">Excluir</button>' +
        '</td>' +
        '</tr>';
    }).join('');
  }

  function updateSortHeaders() {
    document.querySelectorAll('[data-tab-panel="questionarios"] th[data-sort]').forEach(function (th) {
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
    return apiFetch('/api/admin/questionarios?' + buildQueryParams().toString())
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
    state.filters.dateFrom = document.getElementById('fDateFrom').value;
    state.filters.dateTo = document.getElementById('fDateTo').value;
    state.filters.perfil = document.getElementById('fPerfil').value;
    state.pageSize = parseInt(document.getElementById('fPageSize').value, 10) || 25;
    state.page = 1;
    loadList();
  });

  els.clearFiltersBtn.addEventListener('click', function () {
    els.filtersForm.reset();
    state.filters = { dateFrom: '', dateTo: '', perfil: '' };
    state.page = 1;
    loadList();
  });

  els.toggleFilters.addEventListener('click', function () {
    var hidden = els.filtersBody.style.display === 'none';
    els.filtersBody.style.display = hidden ? '' : 'none';
    els.toggleFilters.textContent = hidden ? 'Recolher' : 'Expandir';
  });

  /* ===== Sorting ===== */
  document.querySelectorAll('[data-tab-panel="questionarios"] th[data-sort]').forEach(function (th) {
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

  /* ===== Refresh (aba ativa) / logout ===== */
  els.refreshBtn.addEventListener('click', function () { window.OsmosAdminTabs.refreshCurrent(); });
  els.logoutBtn.addEventListener('click', function () {
    apiFetch('/api/admin/logout', { method: 'POST' }).then(function () {
      window.location.href = 'login.html';
    });
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
    apiFetch('/api/admin/questionarios/' + id)
      .then(function (res) { return res.json(); })
      .then(function (row) {
        var dt = splitDateTime(row.created_at);
        var respostas = (row.payload && row.payload.respostas) || [];
        var qaHtml = respostas.map(function (r) {
          return '<li class="qa-item"><div class="q">' + escapeHtml(r.pergunta) + '</div><div class="a">' +
            escapeHtml(r.opcaoLetra ? (r.opcaoLetra + ') ' + r.opcaoTexto) : 'Não respondida') + '</div></li>';
        }).join('');

        els.viewModalBody.innerHTML =
          '<dl>' +
          '<div><dt>ID</dt><dd>' + row.id + '</dd></div>' +
          '<div><dt>Data / Horário</dt><dd>' + escapeHtml(dt.data) + ' ' + escapeHtml(dt.hora) + '</dd></div>' +
          '<div><dt>Tempo de resposta</dt><dd>' + formatTempo(row.tempo_resposta) + '</dd></div>' +
          '<div><dt>Nome</dt><dd>' + escapeHtml(row.nome || '—') + '</dd></div>' +
          '<div><dt>Cidade / Estado</dt><dd>' + escapeHtml(row.cidade || '—') + ' / ' + escapeHtml(row.estado || '—') + '</dd></div>' +
          '<div><dt>Perfil identificado</dt><dd>' + escapeHtml(row.perfil || '—') + ' (score ' + (row.score == null ? '—' : row.score) + ')</dd></div>' +
          '<div><dt>IP / Navegador</dt><dd class="muted">' + escapeHtml(row.ip || '—') + ' · ' + escapeHtml(row.user_agent || '—') + '</dd></div>' +
          '</dl>' +
          '<h3 style="margin-top:1.1rem;font-size:0.95rem;">Respostas do questionário</h3>' +
          '<ul class="qa-list">' + (qaHtml || '<li class="qa-item muted">Nenhuma resposta detalhada disponível.</li>') + '</ul>';

        els.viewModal.hidden = false;
      });
  }

  els.closeModalBtn.addEventListener('click', function () { els.viewModal.hidden = true; });
  els.viewModal.addEventListener('click', function (e) {
    if (e.target === els.viewModal) els.viewModal.hidden = true;
  });

  function deleteRow(id) {
    if (!window.confirm('Excluir esta resposta permanentemente?')) return;
    apiFetch('/api/admin/questionarios/' + id, { method: 'DELETE' }).then(function () {
      loadList();
    });
  }

  function exportRow(id) {
    apiFetch('/api/admin/questionarios/' + id)
      .then(function (res) { return res.json(); })
      .then(function (row) {
        downloadBlob(JSON.stringify(row, null, 2), 'application/json', 'resposta-' + id + '.json');
      });
  }

  /* ===== Bulk export ===== */
  function fetchAllFiltered() {
    var params = buildQueryParams();
    params.delete('page');
    params.delete('pageSize');
    return apiFetch('/api/admin/questionarios/export?' + params.toString()).then(function (res) { return res.json(); });
  }

  function flattenRow(row) {
    var dt = splitDateTime(row.created_at);
    return {
      id: row.id,
      data: dt.data,
      horario: dt.hora,
      tempo_resposta_segundos: row.tempo_resposta,
      score: row.score,
      perfil: row.perfil,
      nome: row.nome,
      cidade: row.cidade,
      estado: row.estado,
      ip: row.ip,
      user_agent: row.user_agent,
      respostas: JSON.stringify((row.payload && row.payload.respostas) || [])
    };
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
      downloadBlob(JSON.stringify(data.items, null, 2), 'application/json', 'questionarios.json');
    });
  });

  els.exportCsvBtn.addEventListener('click', function () {
    fetchAllFiltered().then(function (data) {
      var rows = data.items.map(flattenRow);
      downloadBlob(toCsv(rows), 'text/csv;charset=utf-8', 'questionarios.csv');
    });
  });

  els.exportXlsxBtn.addEventListener('click', function () {
    fetchAllFiltered().then(function (data) {
      var rows = data.items.map(flattenRow);
      var ws = XLSX.utils.json_to_sheet(rows);
      var wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Questionarios');
      XLSX.writeFile(wb, 'questionarios.xlsx');
    });
  });

  window.OsmosAdminTabs.onActivate('questionarios', loadList);
})();

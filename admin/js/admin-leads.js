/* ===== Aba: Cadastros do Site ===== */
(function () {
  'use strict';

  var POLL_INTERVAL_MS = 30000;
  var pollTimer = null;

  var state = {
    page: 1,
    pageSize: 25,
    sortBy: 'created_at',
    sortDir: 'desc',
    search: '',
    total: 0
  };

  var els = {
    filtersForm: document.getElementById('leadsFiltersForm'),
    search: document.getElementById('lSearch'),
    pageSize: document.getElementById('lPageSize'),
    clearFiltersBtn: document.getElementById('leadsClearFiltersBtn'),
    tableBody: document.getElementById('leadsTableBody'),
    emptyState: document.getElementById('leadsEmptyState'),
    loadingState: document.getElementById('leadsLoadingState'),
    resultCount: document.getElementById('leadsResultCount'),
    pageInfo: document.getElementById('leadsPageInfo'),
    prevPageBtn: document.getElementById('leadsPrevPageBtn'),
    nextPageBtn: document.getElementById('leadsNextPageBtn')
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

  function apiFetch(url, options) {
    return fetch(url, Object.assign({ credentials: 'same-origin' }, options || {})).then(function (res) {
      if (res.status === 401) {
        window.location.href = 'login.html';
        throw new Error('unauthorized');
      }
      return res;
    });
  }

  function buildQueryParams() {
    var params = new URLSearchParams();
    params.set('page', state.page);
    params.set('pageSize', state.pageSize);
    params.set('sortBy', state.sortBy);
    params.set('sortDir', state.sortDir);
    if (state.search) params.set('search', state.search);
    return params;
  }

  function renderTable(items) {
    els.tableBody.innerHTML = items.map(function (row) {
      var dt = splitDateTime(row.created_at);
      return '<tr>' +
        '<td>' + row.id + '</td>' +
        '<td>' + escapeHtml(dt.data) + '</td>' +
        '<td>' + escapeHtml(dt.hora) + '</td>' +
        '<td>' + escapeHtml(row.nome) + '</td>' +
        '<td>' + escapeHtml(row.whatsapp) + '</td>' +
        '<td>' + escapeHtml(row.email) + '</td>' +
        '</tr>';
    }).join('');
  }

  function updateSortHeaders() {
    document.querySelectorAll('[data-tab-panel="leads"] th[data-sort]').forEach(function (th) {
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
    els.resultCount.textContent = 'Cadastros (' + state.total + ')';
    els.prevPageBtn.disabled = state.page <= 1;
    els.nextPageBtn.disabled = state.page >= totalPages;
  }

  function loadList() {
    els.loadingState.hidden = false;
    els.emptyState.hidden = true;
    return apiFetch('/api/admin/leads?' + buildQueryParams().toString())
      .then(function (res) { return res.json(); })
      .then(function (data) {
        state.total = data.total;
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

  els.filtersForm.addEventListener('submit', function (e) {
    e.preventDefault();
    state.search = els.search.value.trim();
    state.pageSize = parseInt(els.pageSize.value, 10) || 25;
    state.page = 1;
    loadList();
  });

  els.clearFiltersBtn.addEventListener('click', function () {
    els.filtersForm.reset();
    state.search = '';
    state.page = 1;
    loadList();
  });

  document.querySelectorAll('[data-tab-panel="leads"] th[data-sort]').forEach(function (th) {
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

  els.prevPageBtn.addEventListener('click', function () {
    if (state.page > 1) { state.page--; loadList(); }
  });
  els.nextPageBtn.addEventListener('click', function () {
    state.page++; loadList();
  });

  function startPolling() {
    stopPolling();
    pollTimer = window.setInterval(loadList, POLL_INTERVAL_MS);
  }

  function stopPolling() {
    if (pollTimer) {
      window.clearInterval(pollTimer);
      pollTimer = null;
    }
  }

  window.OsmosAdminTabs.onActivate('leads', function () {
    loadList();
    startPolling();
  });
  window.OsmosAdminTabs.onDeactivate('leads', stopPolling);

  window.OsmosAdminTabs.init();
})();

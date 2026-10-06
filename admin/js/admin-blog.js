/* ===== Aba: Blog ===== */
(function () {
  'use strict';

  var state = {
    page: 1,
    pageSize: 25,
    sortBy: 'created_at',
    sortDir: 'desc',
    status: '',
    total: 0
  };

  var els = {
    listPanel: document.getElementById('blogListPanel'),
    editorPanel: document.getElementById('blogEditorPanel'),
    statusFilter: document.getElementById('blogStatusFilter'),
    newBtn: document.getElementById('blogNewBtn'),
    tableBody: document.getElementById('blogTableBody'),
    emptyState: document.getElementById('blogEmptyState'),
    loadingState: document.getElementById('blogLoadingState'),
    resultCount: document.getElementById('blogResultCount'),
    pageInfo: document.getElementById('blogPageInfo'),
    prevPageBtn: document.getElementById('blogPrevPageBtn'),
    nextPageBtn: document.getElementById('blogNextPageBtn'),
    // editor
    editorTitle: document.getElementById('blogEditorTitle'),
    form: document.getElementById('blogEditorForm'),
    previewLink: document.getElementById('blogPreviewLink'),
    cancelBtn: document.getElementById('blogCancelBtn'),
    cancelBtn2: document.getElementById('blogCancelBtn2'),
    saveBtn: document.getElementById('blogSaveBtn'),
    saveStatus: document.getElementById('blogSaveStatus'),
    fId: document.getElementById('bId'),
    fTitulo: document.getElementById('bTitulo'),
    fSlug: document.getElementById('bSlug'),
    fResumo: document.getElementById('bResumo'),
    fConteudo: document.getElementById('bConteudo'),
    fImagemUrl: document.getElementById('bImagemUrl'),
    fImagemAlt: document.getElementById('bImagemAlt'),
    fImagemFile: document.getElementById('bImagemFile'),
    fImagemPreview: document.getElementById('bImagemPreview'),
    imagemUploadBtn: document.getElementById('bImagemUploadBtn'),
    imagemRemoveBtn: document.getElementById('bImagemRemoveBtn'),
    imagemUploadStatus: document.getElementById('bImagemUploadStatus'),
    fAutor: document.getElementById('bAutor'),
    fStatus: document.getElementById('bStatus'),
    fMetaDescription: document.getElementById('bMetaDescription')
  };

  function escapeHtml(value) {
    var div = document.createElement('div');
    div.textContent = value == null ? '' : String(value);
    return div.innerHTML;
  }

  function splitDate(createdAt) {
    if (!createdAt) return '—';
    return String(createdAt).split(' ')[0] || '—';
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

  /* ===== Listagem ===== */
  function buildQueryParams() {
    var params = new URLSearchParams();
    params.set('page', state.page);
    params.set('pageSize', state.pageSize);
    params.set('sortBy', state.sortBy);
    params.set('sortDir', state.sortDir);
    if (state.status) params.set('status', state.status);
    return params;
  }

  function statusBadge(status) {
    if (status === 'publicado') return '<span class="badge badge-ok">Publicado</span>';
    return '<span class="badge">Rascunho</span>';
  }

  function renderTable(items) {
    els.tableBody.innerHTML = items.map(function (row) {
      var viewBtn = row.status === 'publicado'
        ? '<a class="btn btn-ghost btn-sm" href="/blog/' + encodeURIComponent(row.slug) + '" target="_blank" rel="noopener">Ver</a>'
        : '';
      return '<tr>' +
        '<td>' + row.id + '</td>' +
        '<td>' + escapeHtml(row.titulo) + '<div class="muted" style="font-size:0.78rem;">/blog/' + escapeHtml(row.slug) + '</div></td>' +
        '<td>' + statusBadge(row.status) + '</td>' +
        '<td>' + escapeHtml(splitDate(row.published_at)) + '</td>' +
        '<td class="row-actions">' +
          viewBtn +
          '<button type="button" class="btn btn-ghost btn-sm" data-action="edit" data-id="' + row.id + '">Editar</button>' +
          '<button type="button" class="btn btn-danger btn-sm" data-action="delete" data-id="' + row.id + '">Excluir</button>' +
        '</td>' +
        '</tr>';
    }).join('');
  }

  function updatePagination() {
    var totalPages = Math.max(1, Math.ceil(state.total / state.pageSize));
    var start = state.total === 0 ? 0 : (state.page - 1) * state.pageSize + 1;
    var end = Math.min(state.page * state.pageSize, state.total);
    els.pageInfo.textContent = 'Mostrando ' + start + '–' + end + ' de ' + state.total;
    els.resultCount.textContent = 'Posts (' + state.total + ')';
    els.prevPageBtn.disabled = state.page <= 1;
    els.nextPageBtn.disabled = state.page >= totalPages;
  }

  function loadList() {
    els.loadingState.hidden = false;
    els.emptyState.hidden = true;
    return apiFetch('/api/admin/blog?' + buildQueryParams().toString())
      .then(function (res) { return res.json(); })
      .then(function (data) {
        state.total = data.total;
        renderTable(data.items);
        updatePagination();
        els.emptyState.hidden = data.items.length > 0;
        els.loadingState.hidden = true;
      })
      .catch(function (err) {
        if (err.message !== 'unauthorized') console.error(err);
        els.loadingState.hidden = true;
      });
  }

  /* ===== Editor ===== */
  function showEditor(isEdit) {
    els.editorTitle.textContent = isEdit ? 'Editar post' : 'Novo post';
    els.saveStatus.textContent = '';
    els.listPanel.hidden = true;
    els.editorPanel.hidden = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function showList() {
    els.editorPanel.hidden = true;
    els.listPanel.hidden = false;
    loadList();
  }

  function setCoverPreview(url) {
    var u = (url || '').trim();
    if (u) {
      els.fImagemPreview.src = u;
      els.fImagemPreview.hidden = false;
      els.imagemRemoveBtn.hidden = false;
    } else {
      els.fImagemPreview.removeAttribute('src');
      els.fImagemPreview.hidden = true;
      els.imagemRemoveBtn.hidden = true;
    }
  }

  function resetForm() {
    els.form.reset();
    els.fId.value = '';
    els.fStatus.value = 'rascunho';
    els.previewLink.hidden = true;
    if (els.fImagemFile) els.fImagemFile.value = '';
    if (els.imagemUploadStatus) els.imagemUploadStatus.textContent = '';
    setCoverPreview('');
  }

  function fillForm(post) {
    els.fId.value = post.id;
    els.fTitulo.value = post.titulo || '';
    els.fSlug.value = post.slug || '';
    els.fResumo.value = post.resumo || '';
    els.fConteudo.value = post.conteudo || '';
    els.fImagemUrl.value = post.imagem_url || '';
    setCoverPreview(post.imagem_url || '');
    els.fImagemAlt.value = post.imagem_alt || '';
    els.fAutor.value = post.autor || '';
    els.fStatus.value = post.status === 'publicado' ? 'publicado' : 'rascunho';
    els.fMetaDescription.value = post.meta_description || '';
    if (post.status === 'publicado' && post.slug) {
      els.previewLink.href = '/blog/' + encodeURIComponent(post.slug);
      els.previewLink.hidden = false;
    } else {
      els.previewLink.hidden = true;
    }
  }

  function openNew() {
    resetForm();
    showEditor(false);
  }

  function openEdit(id) {
    apiFetch('/api/admin/blog/' + id)
      .then(function (res) { return res.json(); })
      .then(function (post) {
        resetForm();
        fillForm(post);
        showEditor(true);
      });
  }

  function collectForm() {
    return {
      titulo: els.fTitulo.value.trim(),
      slug: els.fSlug.value.trim(),
      resumo: els.fResumo.value.trim(),
      conteudo: els.fConteudo.value.trim(),
      imagem_url: els.fImagemUrl.value.trim(),
      imagem_alt: els.fImagemAlt.value.trim(),
      autor: els.fAutor.value.trim(),
      status: els.fStatus.value === 'publicado' ? 'publicado' : 'rascunho',
      meta_description: els.fMetaDescription.value.trim()
    };
  }

  els.form.addEventListener('submit', function (e) {
    e.preventDefault();
    var payload = collectForm();
    if (!payload.titulo || !payload.conteudo) {
      els.saveStatus.textContent = 'Preencha título e conteúdo.';
      return;
    }
    var id = els.fId.value;
    var url = id ? '/api/admin/blog/' + id : '/api/admin/blog';
    var method = id ? 'PUT' : 'POST';
    els.saveBtn.disabled = true;
    els.saveStatus.textContent = 'Salvando...';

    apiFetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(function (res) {
        return res.json().then(function (data) { return { ok: res.ok, data: data }; });
      })
      .then(function (r) {
        els.saveBtn.disabled = false;
        if (!r.ok) {
          els.saveStatus.textContent = (r.data && r.data.error) || 'Erro ao salvar.';
          return;
        }
        els.saveStatus.textContent = 'Salvo!';
        showList();
      })
      .catch(function (err) {
        els.saveBtn.disabled = false;
        if (err.message !== 'unauthorized') {
          els.saveStatus.textContent = 'Erro ao salvar.';
          console.error(err);
        }
      });
  });

  function deletePost(id) {
    if (!window.confirm('Excluir este post permanentemente?')) return;
    apiFetch('/api/admin/blog/' + id, { method: 'DELETE' }).then(function () { loadList(); });
  }

  /* ===== Upload de imagem de capa ===== */
  var MAX_DIM = 1600;
  var ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

  // Redimensiona (máx. 1600px) e recomprime em JPEG no próprio navegador, para
  // manter a capa leve e dentro do limite do storage. GIF passa intacto.
  function optimizeImage(file) {
    if (file.type === 'image/gif') return Promise.resolve(file);
    return new Promise(function (resolve) {
      var url = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function () {
        var w = img.naturalWidth || 1;
        var h = img.naturalHeight || 1;
        var scale = Math.min(1, MAX_DIM / Math.max(w, h));
        var cw = Math.max(1, Math.round(w * scale));
        var ch = Math.max(1, Math.round(h * scale));
        var canvas = document.createElement('canvas');
        canvas.width = cw;
        canvas.height = ch;
        var ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, cw, ch);
        ctx.drawImage(img, 0, 0, cw, ch);
        URL.revokeObjectURL(url);
        canvas.toBlob(function (blob) {
          resolve(blob && blob.size < file.size ? blob : file);
        }, 'image/jpeg', 0.82);
      };
      img.onerror = function () { URL.revokeObjectURL(url); resolve(file); };
      img.src = url;
    });
  }

  function uploadCover(file) {
    if (!file) return;
    if (ALLOWED_TYPES.indexOf(file.type) === -1) {
      els.imagemUploadStatus.textContent = 'Formato não suportado (use JPG, PNG, WebP ou GIF).';
      return;
    }
    els.imagemUploadBtn.disabled = true;
    els.imagemUploadStatus.textContent = 'Otimizando…';
    optimizeImage(file).then(function (blob) {
      els.imagemUploadStatus.textContent = 'Enviando…';
      var fd = new FormData();
      fd.append('file', blob, file.name || 'capa.jpg');
      return apiFetch('/api/admin/blog/upload', { method: 'POST', body: fd });
    }).then(function (res) {
      return res.json().then(function (data) { return { ok: res.ok, data: data }; });
    }).then(function (r) {
      els.imagemUploadBtn.disabled = false;
      if (!r.ok) {
        els.imagemUploadStatus.textContent = (r.data && r.data.error) || 'Erro ao enviar.';
        return;
      }
      els.fImagemUrl.value = r.data.url;
      setCoverPreview(r.data.url);
      var kb = Math.round((r.data.size || 0) / 1024);
      els.imagemUploadStatus.textContent = 'Imagem enviada (' + kb + ' KB). Salve o post para aplicar.';
    }).catch(function (err) {
      els.imagemUploadBtn.disabled = false;
      if (err.message !== 'unauthorized') {
        els.imagemUploadStatus.textContent = 'Erro ao enviar.';
        console.error(err);
      }
    });
  }

  /* ===== Eventos ===== */
  els.newBtn.addEventListener('click', openNew);
  els.cancelBtn.addEventListener('click', showList);
  els.cancelBtn2.addEventListener('click', showList);

  els.imagemUploadBtn.addEventListener('click', function () { els.fImagemFile.click(); });
  els.fImagemFile.addEventListener('change', function () {
    var f = els.fImagemFile.files && els.fImagemFile.files[0];
    els.fImagemFile.value = '';
    if (f) uploadCover(f);
  });
  els.imagemRemoveBtn.addEventListener('click', function () {
    els.fImagemUrl.value = '';
    setCoverPreview('');
    els.imagemUploadStatus.textContent = 'Capa removida. Salve o post para aplicar.';
  });
  els.fImagemUrl.addEventListener('change', function () { setCoverPreview(els.fImagemUrl.value); });

  els.statusFilter.addEventListener('change', function () {
    state.status = els.statusFilter.value;
    state.page = 1;
    loadList();
  });

  els.tableBody.addEventListener('click', function (e) {
    var btn = e.target.closest('button[data-action]');
    if (!btn) return;
    var id = btn.getAttribute('data-id');
    var action = btn.getAttribute('data-action');
    if (action === 'edit') openEdit(id);
    if (action === 'delete') deletePost(id);
  });

  els.prevPageBtn.addEventListener('click', function () {
    if (state.page > 1) { state.page--; loadList(); }
  });
  els.nextPageBtn.addEventListener('click', function () {
    state.page++; loadList();
  });

  window.OsmosAdminTabs.onActivate('blog', function () {
    els.editorPanel.hidden = true;
    els.listPanel.hidden = false;
    loadList();
  });
})();

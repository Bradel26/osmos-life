/* ============================================================
   OSMOS — Manual interativo (página /manuais/:slug)
   - Subnav com scrollspy
   - Busca inteligente dentro do manual
   - Solução de problemas: busca + filtro
   - FAQ: filtro por categoria + acordeão
   - Desenhos técnicos: abas + zoom/tela cheia
   - Visualizador 3D (Three.js) com hotspots
   ============================================================ */
(function () {
  'use strict';

  function norm(s) { return (s || '').toString().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }

  /* ---------- 1. Subnav scrollspy + rolagem suave ---------- */
  (function subnav() {
    var nav = document.getElementById('manualSubnav');
    if (!nav) return;
    var links = Array.prototype.slice.call(nav.querySelectorAll('a[data-sec]'));
    var sections = links.map(function (l) { return document.getElementById(l.getAttribute('data-sec')); }).filter(Boolean);

    links.forEach(function (l) {
      l.addEventListener('click', function (e) {
        var target = document.getElementById(l.getAttribute('data-sec'));
        if (!target) return;
        e.preventDefault();
        var top = target.getBoundingClientRect().top + window.scrollY - 140;
        window.scrollTo({ top: top, behavior: 'smooth' });
      });
    });

    function onScroll() {
      var pos = window.scrollY + 160;
      var current = sections[0];
      sections.forEach(function (sec) { if (sec.offsetTop <= pos) current = sec; });
      links.forEach(function (l) { l.classList.toggle('active', current && l.getAttribute('data-sec') === current.id); });
      // mantém o link ativo visível na subnav rolável
      var active = nav.querySelector('a.active');
      if (active && active.scrollIntoView) {
        var nr = nav.getBoundingClientRect(), ar = active.getBoundingClientRect();
        if (ar.left < nr.left || ar.right > nr.right) active.scrollIntoView({ inline: 'center', block: 'nearest' });
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  })();

  /* ---------- 2. Busca inteligente dentro do manual ---------- */
  (function smartSearch() {
    var input = document.getElementById('manualSmartSearch');
    var box = document.getElementById('smartResults');
    if (!input || !box) return;

    // Indexa cada seção pelo título + texto.
    var secs = Array.prototype.slice.call(document.querySelectorAll('.manual-section[id]')).map(function (sec) {
      var h = sec.querySelector('h2');
      return { id: sec.id, titulo: h ? h.textContent.trim() : sec.id, texto: norm(sec.textContent) };
    });

    function render(q) {
      var nq = norm(q);
      if (!nq) { box.hidden = true; box.innerHTML = ''; return; }
      var hits = secs.filter(function (s) { return s.texto.indexOf(nq) !== -1; });
      if (!hits.length) { box.innerHTML = '<div class="sr-empty">Nada encontrado. Experimente outro termo ou acione o SAC.</div>'; box.hidden = false; return; }
      box.innerHTML = hits.map(function (s) {
        return '<a href="#' + s.id + '" data-sec="' + s.id + '"><span class="sr-sec">Seção</span>' + s.titulo + '</a>';
      }).join('');
      box.hidden = false;
    }

    function go(id) {
      var target = document.getElementById(id);
      if (!target) return;
      var top = target.getBoundingClientRect().top + window.scrollY - 140;
      window.scrollTo({ top: top, behavior: 'smooth' });
      target.classList.add('flash');
      setTimeout(function () { target.classList.remove('flash'); }, 1600);
      box.hidden = true;
    }

    input.addEventListener('input', function () { render(input.value); });
    input.addEventListener('focus', function () { if (input.value) render(input.value); });
    box.addEventListener('click', function (e) {
      var a = e.target.closest('a[data-sec]');
      if (!a) return;
      e.preventDefault();
      go(a.getAttribute('data-sec'));
    });
    document.addEventListener('click', function (e) {
      if (!box.contains(e.target) && e.target !== input) box.hidden = true;
    });
  })();

  /* ---------- 3. Solução de problemas ---------- */
  (function trouble() {
    var search = document.getElementById('troubleSearch');
    var filter = document.getElementById('troubleFilter');
    var body = document.getElementById('troubleBody');
    var empty = document.getElementById('troubleNoResults');
    if (!body) return;
    var rows = Array.prototype.slice.call(body.querySelectorAll('.trouble-row'));

    function apply() {
      var q = norm(search && search.value.trim());
      var f = filter ? filter.value : '';
      var visible = 0;
      rows.forEach(function (r) {
        var matchQ = !q || norm(r.getAttribute('data-text')).indexOf(q) !== -1;
        var matchF = !f || r.getAttribute('data-problema') === f;
        var show = matchQ && matchF;
        r.classList.toggle('hidden', !show);
        if (show) visible++;
      });
      if (empty) empty.hidden = visible !== 0;
    }
    if (search) search.addEventListener('input', apply);
    if (filter) filter.addEventListener('change', apply);
  })();

  /* ---------- 4. FAQ: chips + acordeão ---------- */
  (function faq() {
    var list = document.getElementById('manualFaqList');
    if (!list) return;
    var items = Array.prototype.slice.call(list.querySelectorAll('.faq-item'));
    var chips = Array.prototype.slice.call(document.querySelectorAll('.faq-chip'));

    items.forEach(function (item) {
      var q = item.querySelector('.faq-question');
      var a = item.querySelector('.faq-answer');
      if (!q || !a) return;
      q.addEventListener('click', function () {
        var open = q.getAttribute('aria-expanded') === 'true';
        q.setAttribute('aria-expanded', open ? 'false' : 'true');
        a.style.maxHeight = open ? '0px' : (a.scrollHeight + 'px');
      });
    });

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        chips.forEach(function (c) { c.classList.remove('active'); });
        chip.classList.add('active');
        var cat = chip.getAttribute('data-cat');
        items.forEach(function (item) {
          item.classList.toggle('hidden', !!cat && item.getAttribute('data-cat') !== cat);
        });
      });
    });
  })();

  /* ---------- 5. Desenhos técnicos: abas + lightbox ---------- */
  (function drawings() {
    var tabs = Array.prototype.slice.call(document.querySelectorAll('.draw-tab'));
    var panels = Array.prototype.slice.call(document.querySelectorAll('.draw-panel'));
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        var i = tab.getAttribute('data-draw');
        tabs.forEach(function (t) { t.classList.toggle('active', t === tab); });
        panels.forEach(function (p) { p.classList.toggle('active', p.getAttribute('data-draw-panel') === i); });
      });
    });

    var lb = document.getElementById('drawLightbox');
    var lbCanvas = document.getElementById('drawLightboxCanvas');
    var lbClose = document.getElementById('drawLightboxClose');
    if (!lb || !lbCanvas) return;
    var zoom = 1;

    function open(svgHtml) {
      lbCanvas.innerHTML = svgHtml;
      zoom = 1;
      var svg = lbCanvas.querySelector('svg');
      if (svg) svg.style.transform = 'scale(1)';
      lb.hidden = false;
      lb.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    }
    function close() { lb.classList.remove('is-open'); lb.hidden = true; lbCanvas.innerHTML = ''; document.body.style.overflow = ''; }

    document.querySelectorAll('.draw-canvas[data-zoomable], .draw-zoom-btn').forEach(function (el) {
      el.addEventListener('click', function () {
        var panel = el.closest('.draw-panel');
        var svg = panel && panel.querySelector('.draw-canvas svg');
        if (svg) open(svg.outerHTML);
      });
    });
    lbClose.addEventListener('click', close);
    lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
    lbCanvas.addEventListener('wheel', function (e) {
      e.preventDefault();
      zoom = Math.min(4, Math.max(1, zoom + (e.deltaY < 0 ? 0.2 : -0.2)));
      var svg = lbCanvas.querySelector('svg');
      if (svg) svg.style.transform = 'scale(' + zoom + ')';
    }, { passive: false });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !lb.hidden) close(); });
  })();

  /* ---------- 6. Visualizador 3D (Three.js) + hotspots ---------- */
  (function viewer3d() {
    var root = document.getElementById('viewer3d');
    var stage = document.getElementById('viewer3dStage');
    var fallback = document.getElementById('viewer3dFallback');
    if (!root || !stage) return;

    var data = { hotspots: [], modelo3d: {} };
    try { data = JSON.parse(document.getElementById('manual-data').textContent); } catch (e) {}
    var popover = document.getElementById('hotspotPopover');

    function failGraceful(msg) {
      if (fallback) {
        var p = fallback.querySelector('p');
        if (p) p.textContent = msg || 'Experiência 3D indisponível neste dispositivo. Consulte os desenhos técnicos abaixo.';
      }
    }

    // WebGL disponível?
    try {
      var test = document.createElement('canvas');
      if (!(window.WebGLRenderingContext && (test.getContext('webgl') || test.getContext('experimental-webgl')))) {
        return failGraceful('Seu navegador não suporta 3D. Veja os desenhos técnicos abaixo.');
      }
    } catch (e) { return failGraceful(); }

    import('https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js')
      .then(function (THREE) { boot(THREE); })
      .catch(function () { failGraceful('Não foi possível carregar o modelo 3D. Veja os desenhos técnicos abaixo.'); });

    function boot(THREE) {
      var width = stage.clientWidth, height = stage.clientHeight;
      var scene = new THREE.Scene();
      var camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
      var CAM0 = new THREE.Vector3(0, 0.2, 6.2);
      camera.position.copy(CAM0);

      var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(width, height);
      stage.appendChild(renderer.domElement);

      // Luzes (tom frio da marca)
      scene.add(new THREE.HemisphereLight(0xffffff, 0x223044, 0.9));
      var key = new THREE.DirectionalLight(0xffffff, 1.1); key.position.set(4, 6, 6); scene.add(key);
      var rim = new THREE.DirectionalLight(0x4fc3e8, 0.8); rim.position.set(-5, 2, -3); scene.add(rim);

      // ---- Modelo procedural representativo do produto ----
      var product = new THREE.Group();
      var bodyMat = new THREE.MeshStandardMaterial({ color: 0xeef3f6, metalness: 0.25, roughness: 0.45 });
      var darkMat = new THREE.MeshStandardMaterial({ color: 0x16304f, metalness: 0.4, roughness: 0.4 });
      var accentMat = new THREE.MeshStandardMaterial({ color: 0x4fc3e8, metalness: 0.3, roughness: 0.35, emissive: 0x11384a, emissiveIntensity: 0.4 });

      var bodyGeo = THREE.CapsuleGeometry ? new THREE.CapsuleGeometry(0.85, 1.5, 12, 32) : new THREE.CylinderGeometry(0.85, 0.85, 2.3, 32);
      var body = new THREE.Mesh(bodyGeo, bodyMat);
      body.scale.set(1, 1, 0.62);
      product.add(body);

      // Dois anéis frontais (filtros)
      [0.62, -0.62].forEach(function (y) {
        var ring = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.1, 16, 48), darkMat);
        ring.position.set(0, y, 0.52);
        product.add(ring);
        var inner = new THREE.Mesh(new THREE.CircleGeometry(0.34, 40), accentMat);
        inner.position.set(0, y, 0.5); inner.material.side = THREE.DoubleSide;
        product.add(inner);
      });

      // Display + botão
      var disp = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.22, 0.05), darkMat);
      disp.position.set(0, -0.35, 0.56); product.add(disp);
      var btn = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.05, 24), accentMat);
      btn.rotation.x = Math.PI / 2; btn.position.set(0, -0.62, 0.56); product.add(btn);

      // Base
      var base = new THREE.Mesh(new THREE.CylinderGeometry(0.78, 0.9, 0.3, 32), darkMat);
      base.scale.set(1, 1, 0.7); base.position.set(0, -1.4, 0); product.add(base);

      product.rotation.y = -0.5;
      scene.add(product);

      // ---- Hotspots (overlay HTML) ----
      var hotspotEls = [];
      (data.hotspots || []).forEach(function (h, i) {
        var el = document.createElement('button');
        el.type = 'button';
        el.className = 'hotspot';
        el.textContent = (i + 1);
        el.setAttribute('aria-label', h.nome || ('Ponto ' + (i + 1)));
        el.dataset.index = i;
        stage.appendChild(el);
        var anchor = new THREE.Vector3(h.x || 0, (h.y || 0) * 1.05, h.z || 0).multiplyScalar(1.15);
        hotspotEls.push({ el: el, anchor: anchor, data: h });
        el.addEventListener('click', function (e) { e.stopPropagation(); showPopover(h, el); });
      });

      function showPopover(h, anchorEl) {
        if (!popover) return;
        var rows = '';
        if (h.funcao) rows += '<p>' + escapeHtml(h.funcao) + '</p>';
        if (h.uso) rows += '<div class="hp-row"><strong>Uso:</strong> ' + escapeHtml(h.uso) + '</div>';
        if (h.cuidado) rows += '<div class="hp-row"><strong>Cuidado:</strong> ' + escapeHtml(h.cuidado) + '</div>';
        if (h.especificacao) rows += '<div class="hp-row"><strong>Especificação:</strong> ' + escapeHtml(h.especificacao) + '</div>';
        var link = h.linkSecao ? '<a class="btn btn-primary btn-sm" href="#' + encodeURIComponent(h.linkSecao) + '" data-sec-link="' + escapeHtml(h.linkSecao) + '">Ver orientação no manual →</a>' : '';
        popover.innerHTML = '<button class="hotspot-popover-close" aria-label="Fechar">✕</button><h4>' + escapeHtml(h.nome || '') + '</h4>' + rows + link;
        popover.hidden = false;
        var r = anchorEl.getBoundingClientRect();
        var pw = Math.min(320, window.innerWidth * 0.9);
        var left = Math.min(window.innerWidth - pw - 12, Math.max(12, r.left + r.width / 2 - pw / 2));
        var top = r.bottom + 12;
        if (top + 200 > window.innerHeight) top = Math.max(12, r.top - 210);
        popover.style.left = left + 'px';
        popover.style.top = top + 'px';
        requestAnimationFrame(function () { popover.classList.add('show'); });
        hotspotEls.forEach(function (x) { x.el.classList.toggle('active', x.el === anchorEl); });

        popover.querySelector('.hotspot-popover-close').addEventListener('click', hidePopover);
        var secLink = popover.querySelector('[data-sec-link]');
        if (secLink) secLink.addEventListener('click', function (ev) {
          ev.preventDefault();
          var t = document.getElementById(secLink.getAttribute('data-sec-link'));
          if (t) window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - 140, behavior: 'smooth' });
          hidePopover();
        });
      }
      function hidePopover() {
        if (!popover) return;
        popover.classList.remove('show');
        popover.hidden = true;
        hotspotEls.forEach(function (x) { x.el.classList.remove('active'); });
      }
      document.addEventListener('click', function (e) {
        if (popover && !popover.hidden && !popover.contains(e.target) && !e.target.classList.contains('hotspot')) hidePopover();
      });

      // ---- Controles (arrastar/zoom) próprios ----
      var dragging = false, lastX = 0, lastY = 0, autoRotate = true;
      var targetRotY = product.rotation.y, targetRotX = 0;

      function onDown(x, y) { dragging = true; autoRotate = false; lastX = x; lastY = y; }
      function onMove(x, y) {
        if (!dragging) return;
        targetRotY += (x - lastX) * 0.01;
        targetRotX += (y - lastY) * 0.008;
        targetRotX = Math.max(-0.7, Math.min(0.7, targetRotX));
        lastX = x; lastY = y;
      }
      function onUp() { dragging = false; }

      stage.addEventListener('mousedown', function (e) { onDown(e.clientX, e.clientY); });
      window.addEventListener('mousemove', function (e) { onMove(e.clientX, e.clientY); });
      window.addEventListener('mouseup', onUp);
      stage.addEventListener('touchstart', function (e) { if (e.touches[0]) onDown(e.touches[0].clientX, e.touches[0].clientY); }, { passive: true });
      stage.addEventListener('touchmove', function (e) { if (e.touches[0]) { onMove(e.touches[0].clientX, e.touches[0].clientY); } }, { passive: true });
      stage.addEventListener('touchend', onUp);
      stage.addEventListener('wheel', function (e) {
        e.preventDefault();
        camera.position.z = Math.max(3.4, Math.min(9, camera.position.z + (e.deltaY > 0 ? 0.4 : -0.4)));
      }, { passive: false });

      // Botões da toolbar
      var resetBtn = document.getElementById('viewer3dReset');
      var fullBtn = document.getElementById('viewer3dFull');
      if (resetBtn) resetBtn.addEventListener('click', function () {
        targetRotY = -0.5; targetRotX = 0; camera.position.copy(CAM0); autoRotate = true; hidePopover();
      });
      if (fullBtn) fullBtn.addEventListener('click', function () {
        if (!document.fullscreenElement) {
          (root.requestFullscreen ? root.requestFullscreen() : (root.webkitRequestFullscreen && root.webkitRequestFullscreen()));
        } else {
          (document.exitFullscreen ? document.exitFullscreen() : (document.webkitExitFullscreen && document.webkitExitFullscreen()));
        }
      });
      document.addEventListener('fullscreenchange', function () {
        root.classList.toggle('fullscreen', !!document.fullscreenElement);
        setTimeout(resize, 60);
      });

      function resize() {
        width = stage.clientWidth; height = stage.clientHeight;
        if (!width || !height) return;
        camera.aspect = width / height; camera.updateProjectionMatrix();
        renderer.setSize(width, height);
      }
      if ('ResizeObserver' in window) { new ResizeObserver(resize).observe(stage); }
      window.addEventListener('resize', resize);

      // Projeção dos hotspots
      var tmp = new THREE.Vector3();
      var camDir = new THREE.Vector3();
      function updateHotspots() {
        var rect = stage.getBoundingClientRect();
        hotspotEls.forEach(function (h) {
          tmp.copy(h.anchor).applyMatrix4(product.matrixWorld);
          var worldPos = tmp.clone();
          tmp.project(camera);
          var x = (tmp.x * 0.5 + 0.5) * rect.width;
          var y = (-tmp.y * 0.5 + 0.5) * rect.height;
          h.el.style.left = x + 'px';
          h.el.style.top = y + 'px';
          // atrás do produto?
          var normalWorld = h.anchor.clone().normalize().applyQuaternion(product.quaternion);
          camDir.copy(worldPos).sub(camera.position).normalize();
          h.el.setAttribute('data-behind', normalWorld.dot(camDir) > 0.15 ? '1' : '0');
        });
      }

      if (fallback) fallback.style.display = 'none';

      function animate() {
        requestAnimationFrame(animate);
        if (autoRotate) targetRotY += 0.0035;
        product.rotation.y += (targetRotY - product.rotation.y) * 0.1;
        product.rotation.x += (targetRotX - product.rotation.x) * 0.1;
        product.updateMatrixWorld();
        renderer.render(scene, camera);
        updateHotspots();
      }
      resize();
      animate();
    }

    function escapeHtml(v) {
      var d = document.createElement('div'); d.textContent = v == null ? '' : String(v); return d.innerHTML;
    }
  })();
})();

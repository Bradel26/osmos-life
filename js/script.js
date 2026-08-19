(function () {
  'use strict';

  /* ===== Header scroll state ===== */
  var header = document.getElementById('site-header');
  function updateHeader() {
    if (window.scrollY > 40) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  }
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  /* ===== Mobile menu ===== */
  var navToggle = document.getElementById('navToggle');
  var mobileMenu = document.getElementById('mobileMenu');
  navToggle.addEventListener('click', function () {
    var isOpen = mobileMenu.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });
  mobileMenu.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      mobileMenu.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  /* ===== Scroll fade-up reveal ===== */
  var revealTargets = document.querySelectorAll(
    '.section-head, .problem-card, .benefit-item, .step-card, .diff-card, .guarantee-item, .audience-card, .authority-item'
  );
  revealTargets.forEach(function (el) { el.classList.add('fade-up'); });

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

  revealTargets.forEach(function (el) { observer.observe(el); });

  /* ===== Hero: fallback de gradiente caso a foto não carregue ===== */
  (function () {
    var heroMedia = document.querySelector('.hero .hero-media');
    var heroPhoto = document.getElementById('heroPhoto');
    if (!heroMedia || !heroPhoto) return;

    function markFallback() { heroMedia.classList.add('hero-media--fallback'); }

    // O script roda ao final do <body>: se o fetch da imagem já tiver
    // resolvido (sucesso ou 404) antes daqui, precisamos checar o estado
    // atual em vez de só escutar eventos que já dispararam e não repetem.
    if (heroPhoto.complete) {
      if (heroPhoto.naturalWidth === 0) markFallback();
    } else {
      heroPhoto.addEventListener('error', markFallback, { once: true });
    }
  })();

  /* ===== Scroll spy: destaca o item do menu correspondente à seção visível ===== */
  (function () {
    var navLinks = Array.prototype.slice.call(
      document.querySelectorAll('.main-nav a[href^="#"], .mobile-menu a[href^="#"]')
    );
    var linksByTarget = {};
    navLinks.forEach(function (link) {
      var id = link.getAttribute('href').slice(1);
      (linksByTarget[id] = linksByTarget[id] || []).push(link);
    });

    var sections = Object.keys(linksByTarget)
      .map(function (id) { return document.getElementById(id); })
      .filter(Boolean);
    if (!sections.length) return;

    function setActive(id) {
      navLinks.forEach(function (link) { link.classList.remove('active'); });
      (linksByTarget[id] || []).forEach(function (link) { link.classList.add('active'); });
    }

    var headerHeight = header.offsetHeight;
    var spyObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    }, {
      rootMargin: '-' + (headerHeight + 10) + 'px 0px -65% 0px',
      threshold: 0
    });

    sections.forEach(function (section) { spyObserver.observe(section); });
  })();

  /* ===== Back to top ===== */
  var backToTop = document.getElementById('backToTop');
  window.addEventListener('scroll', function () {
    backToTop.classList.toggle('visible', window.scrollY > 600);
  }, { passive: true });
  backToTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ===== FAQ accordion ===== */
  document.querySelectorAll('.faq-question').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var expanded = btn.getAttribute('aria-expanded') === 'true';
      var answer = btn.nextElementSibling;

      document.querySelectorAll('.faq-question').forEach(function (other) {
        if (other !== btn) {
          other.setAttribute('aria-expanded', 'false');
          other.nextElementSibling.style.maxHeight = null;
        }
      });

      btn.setAttribute('aria-expanded', expanded ? 'false' : 'true');
      answer.style.maxHeight = expanded ? null : answer.scrollHeight + 'px';
    });
  });

  /* ===== Contact form ===== */
  var form = document.getElementById('contactForm');
  var success = document.getElementById('formSuccess');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var submitBtn = form.querySelector('button[type="submit"]');
    var data = new FormData(form);
    submitBtn.disabled = true;

    fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome: data.get('nome'),
        telefone: data.get('telefone'),
        email: data.get('email')
      })
    })
      .then(function (res) {
        if (!res.ok) throw new Error('Falha ao enviar cadastro');
        form.hidden = true;
        success.hidden = false;
      })
      .catch(function () {
        submitBtn.disabled = false;
        window.alert('Não foi possível enviar seu cadastro agora. Tente novamente em instantes.');
      });
  });

  /* ===== Footer year ===== */
  document.getElementById('year').textContent = new Date().getFullYear();

})();

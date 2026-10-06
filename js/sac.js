(function () {
  'use strict';

  /* ===== Header scroll state =====
     O hero do SAC é escuro: header transparente no topo, sólido ao rolar. */
  var header = document.getElementById('site-header');
  function updateHeader() {
    if (window.scrollY > 40) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  }
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  /* ===== Footer year ===== */
  document.getElementById('year').textContent = new Date().getFullYear();

  /* ===== Scroll fade-up reveal (mesmo padrão de js/script.js) ===== */
  var revealTargets = document.querySelectorAll('.section-head, .sac-card, .sac-channel, .faq-item');
  revealTargets.forEach(function (el) { el.classList.add('fade-up'); });

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
  revealTargets.forEach(function (el) { observer.observe(el); });

  /* ===== FAQ accordion (mesmo comportamento de js/script.js) ===== */
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

  /* ===== Categorias ↔ formulário =====
     Categorias ligadas a um produto/compra exibem os campos condicionais
     (CPF/CNPJ, número do pedido/NF). As demais mantêm o formulário enxuto. */
  var CATEGORIAS_COM_PEDIDO = [
    'Suporte técnico',
    'Garantia e assistência',
    'Trocas e devoluções',
    'Instalação e manutenção',
    'Reclamações'
  ];

  var cards = document.querySelectorAll('.sac-card');
  var categoriaSelect = document.getElementById('sacCategoria');
  var conditionalFields = document.querySelectorAll('[data-conditional]');
  var formSection = document.getElementById('sacForm');
  var nomeInput = document.getElementById('sacNome');

  function toggleConditionalFields(categoria) {
    var mostra = CATEGORIAS_COM_PEDIDO.indexOf(categoria) !== -1;
    conditionalFields.forEach(function (field) {
      field.classList.toggle('show', mostra);
    });
  }

  function highlightCard(categoria) {
    cards.forEach(function (card) {
      card.classList.toggle('active', card.getAttribute('data-categoria') === categoria);
    });
  }

  function aplicarCategoria(categoria) {
    categoriaSelect.value = categoria;
    toggleConditionalFields(categoria);
    highlightCard(categoria);
  }

  cards.forEach(function (card) {
    card.addEventListener('click', function () {
      var categoria = card.getAttribute('data-categoria');
      aplicarCategoria(categoria);
      formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // dá tempo do scroll iniciar antes de mover o foco para o 1º campo
      setTimeout(function () { nomeInput.focus({ preventScroll: true }); }, 450);
    });
  });

  categoriaSelect.addEventListener('change', function () {
    toggleConditionalFields(categoriaSelect.value);
    highlightCard(categoriaSelect.value);
  });

  /* ===== Nome do arquivo anexado ===== */
  var anexoInput = document.getElementById('sacAnexo');
  var anexoName = document.getElementById('sacAnexoName');
  anexoInput.addEventListener('change', function () {
    anexoName.textContent = anexoInput.files && anexoInput.files.length
      ? 'Arquivo selecionado: ' + anexoInput.files[0].name
      : '';
  });

  /* ===== Envio da solicitação =====
     POST /api/sac (functions/api/sac.js) repassa ao SAC do Nexus e devolve
     { ok: true, protocolo, acompanhamento }. Vai como FormData para o anexo
     seguir junto. Sem protocolo real na resposta, nenhuma confirmação é exibida. */
  var form = document.getElementById('sacRequestForm');
  var submitBtn = document.getElementById('sacSubmitBtn');
  var formPanel = document.getElementById('sacFormPanel');
  var successPanel = document.getElementById('sacSuccess');
  var protocolBlock = document.getElementById('sacProtocol');
  var protocolNumber = document.getElementById('sacProtocolNumber');
  var protocolPending = document.getElementById('sacProtocolPending');
  var trackingLink = document.getElementById('sacTrackingLink');
  var TAMANHO_MAXIMO_ANEXO = 15 * 1024 * 1024;

  /* Turnstile (anti-robô): só carrega quando #sacTurnstile tem data-sitekey. */
  var turnstileBox = document.getElementById('sacTurnstile');
  if (turnstileBox && turnstileBox.getAttribute('data-sitekey')) {
    turnstileBox.className = 'cf-turnstile';
    var turnstileScript = document.createElement('script');
    turnstileScript.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
    turnstileScript.async = true;
    turnstileScript.defer = true;
    document.head.appendChild(turnstileScript);
  }
  var MENSAGEM_ERRO = 'Não foi possível enviar sua solicitação agora. Tente novamente em instantes ou utilize um dos outros canais de atendimento.';

  function liberarBotao() {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Enviar solicitação';
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    if (anexoInput.files && anexoInput.files[0] && anexoInput.files[0].size > TAMANHO_MAXIMO_ANEXO) {
      window.alert('O anexo deve ter no máximo 15 MB.');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando...';

    // Campos do formulário pelo atributo name (inclui risco, consentimento,
    // anexo e o token do Turnstile, cf-turnstile-response).
    var dados = new FormData(form);
    dados.set('categoria', categoriaSelect.value);

    fetch('/api/sac', { method: 'POST', body: dados })
      .then(function (res) {
        return res.json().catch(function () { return {}; }).then(function (data) {
          if (!res.ok || !data.ok) throw new Error(data.erro || MENSAGEM_ERRO);
          return data;
        });
      })
      .then(function (data) {
        formPanel.hidden = true;
        successPanel.classList.add('show');

        if (data.protocolo) {
          protocolNumber.textContent = data.protocolo;
          protocolBlock.hidden = false;
          protocolPending.hidden = true;
        } else {
          // backend não retornou protocolo — não inventamos um número
          protocolBlock.hidden = true;
          protocolPending.hidden = false;
        }

        if (trackingLink && data.acompanhamento) {
          trackingLink.href = data.acompanhamento;
          trackingLink.hidden = false;
        }

        successPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
      })
      .catch(function (err) {
        liberarBotao();
        if (window.turnstile) window.turnstile.reset();
        window.alert(err && err.message ? err.message : MENSAGEM_ERRO);
      });
  });

})();

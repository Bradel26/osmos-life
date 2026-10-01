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
     TODO (integração backend): criar o endpoint `POST /api/sac`
     (padrão functions/api/*). Contrato esperado da resposta em caso de
     sucesso: { ok: true, protocolo: "<string>" }.
     A interface NÃO simula protocolo: o bloco de protocolo só aparece
     quando o backend devolver um número real. Enquanto o endpoint não
     existir, a requisição falhará e exibimos uma mensagem de erro —
     nenhuma confirmação falsa é mostrada ao usuário. */
  var form = document.getElementById('sacRequestForm');
  var submitBtn = document.getElementById('sacSubmitBtn');
  var formPanel = document.getElementById('sacFormPanel');
  var successPanel = document.getElementById('sacSuccess');
  var protocolBlock = document.getElementById('sacProtocol');
  var protocolNumber = document.getElementById('sacProtocolNumber');
  var protocolPending = document.getElementById('sacProtocolPending');

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando...';

    var payload = {
      nome: document.getElementById('sacNome').value.trim(),
      email: document.getElementById('sacEmail').value.trim(),
      telefone: document.getElementById('sacTelefone').value.trim(),
      documento: document.getElementById('sacDocumento').value.trim(),
      pedido: document.getElementById('sacPedido').value.trim(),
      assunto: document.getElementById('sacAssunto').value.trim(),
      categoria: categoriaSelect.value,
      descricao: document.getElementById('sacDescricao').value.trim()
      // Observação: o anexo (sacAnexo) exige envio multipart/upload de arquivo,
      // a ser definido junto com o endpoint /api/sac na etapa de integração.
    };

    fetch('/api/sac', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(function (res) {
        if (!res.ok) throw new Error('Falha ao enviar solicitação');
        return res.json().catch(function () { return {}; });
      })
      .then(function (data) {
        formPanel.hidden = true;
        successPanel.classList.add('show');

        if (data && data.protocolo) {
          protocolNumber.textContent = data.protocolo;
          protocolBlock.hidden = false;
          protocolPending.hidden = true;
        } else {
          // backend não retornou protocolo — não inventamos um número
          protocolBlock.hidden = true;
          protocolPending.hidden = false;
        }

        successPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
      })
      .catch(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Enviar solicitação';
        window.alert('Não foi possível enviar sua solicitação agora. Tente novamente em instantes ou utilize um dos outros canais de atendimento.');
      });
  });

})();

(function () {
  'use strict';

  var header = document.getElementById('site-header');
  var introSection = document.getElementById('quizIntro');
  function updateHeader() {
    var overDarkBg = !introSection.hidden;
    if (overDarkBg && window.scrollY <= 40) header.classList.remove('scrolled');
    else header.classList.add('scrolled');
  }
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  document.getElementById('year').textContent = new Date().getFullYear();

  var STORAGE_KEY = 'raiox_agua_sessao';

  /* ===== Question bank =====
     `field` deve bater exatamente com as colunas/opções validadas em
     functions/_lib/raiox-agua.js. `exclusive` é a opção que, ao ser marcada
     numa pergunta de múltipla escolha, desmarca as demais (e vice-versa). */
  var QUESTIONS = [
    { field: 'tipo_imovel', type: 'single', text: 'Onde você mora?', options: ['Casa', 'Apartamento', 'Condomínio Horizontal', 'Condomínio Vertical', 'Chácara / Fazenda', 'Empresa / Comércio'] },
    { field: 'origem_agua', type: 'single', text: 'Qual é a origem da água que você utiliza?', options: ['Rede pública (Saneamento)', 'Poço Artesiano', 'Poço Semi-artesiano', 'Mina / Nascente', 'Caminhão Pipa', 'Não tenho certeza'] },
    { field: 'qtd_moradores', type: 'single', text: 'Quantas pessoas utilizam essa água diariamente?', options: ['1 a 2 pessoas', '3 a 4 pessoas', '5 a 6 pessoas', '7 ou mais'] },
    { field: 'consumo_atual', type: 'multi', text: 'Como você consome água para beber atualmente?', options: ['Direto da torneira', 'Filtro de barro', 'Purificador comum', 'Purificador por Osmose Reversa', 'Água mineral em galão', 'Água mineral em garrafa', 'Filtro de torneira', 'Outro'] },
    { field: 'problemas_agua', type: 'multi', text: 'Quais problemas você percebe na água?', options: ['Gosto de cloro', 'Cheiro de cloro', 'Água esbranquiçada', 'Água amarelada', 'Água barrenta', 'Manchas em louças', 'Manchas em roupas', 'Ferro', 'Ferrugem', 'Calcário', 'Incrustações', 'Sedimentos', 'Nenhum problema aparente'], exclusive: 'Nenhum problema aparente' },
    { field: 'manchas_locais', type: 'multi', text: 'Você percebe manchas em algum destes locais?', options: ['Box do banheiro', 'Torneiras', 'Chuveiro', 'Vaso sanitário', 'Pia', 'Máquina de lavar', 'Não'], exclusive: 'Não' },
    { field: 'freq_compra_agua', type: 'single', text: 'Com que frequência você compra água mineral?', options: ['Nunca', 'Semanalmente', 'Quinzenalmente', 'Mensalmente', 'Eventualmente'] },
    { field: 'cozinha_mesma_agua', type: 'single', text: 'Você cozinha utilizando a mesma água que bebe?', options: ['Sim', 'Não', 'Às vezes'] },
    { field: 'maior_preocupacao', type: 'single', text: 'Qual sua maior preocupação em relação à água?', options: ['Saúde da família', 'Qualidade da água', 'Cloro', 'Metais pesados', 'Bactérias e vírus', 'Agrotóxicos', 'Microplásticos', 'Calcário', 'Economia', 'Sabor da água'] },
    { field: 'tem_criancas', type: 'single', text: 'Você possui crianças pequenas?', options: ['Sim', 'Não'] },
    { field: 'pessoas_risco', type: 'multi', text: 'Existe alguma dessas pessoas na residência?', options: ['Bebês', 'Crianças', 'Gestantes', 'Idosos', 'Pessoas imunossuprimidas', 'Pessoas com doença renal', 'Nenhuma'], exclusive: 'Nenhuma' },
    { field: 'analise_previa', type: 'single', text: 'Você já realizou análise da água?', options: ['Sim', 'Não', 'Não sei'] },
    { field: 'interesse_analise', type: 'single', text: 'Você teria interesse em receber uma análise gratuita da qualidade da sua água?', options: ['Sim', 'Talvez', 'Não'] },
    { field: 'investimento', type: 'single', text: 'Qual investimento você imagina fazer para resolver definitivamente a qualidade da água?', options: ['Até R$ 2.000', 'Entre R$ 2.000 e R$ 4.000', 'Entre R$ 4.000 e R$ 6.000', 'Acima de R$ 6.000', 'Ainda não sei'] }
  ];

  var TOTAL_STEPS = QUESTIONS.length + 1; // 14 perguntas + tela de lead
  var CHECK_ICON = '<svg viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  /* ===== State ===== */
  var current = 0;
  var answers = {};
  var multiSelection = [];
  var sessionId = null;
  var quizStartedAt = null;

  var appSection = document.getElementById('quizApp');
  var leadSection = document.getElementById('quizLead');
  var resultSection = document.getElementById('quizResult');

  var questionEl = document.getElementById('quizQuestion');
  var optionsEl = document.getElementById('quizOptions');
  var progressFill = document.getElementById('quizProgressFill');
  var progressLabel = document.getElementById('quizProgressLabel');
  var backBtn = document.getElementById('quizBack');
  var continueBtn = document.getElementById('quizContinue');

  function saveLocalState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ sessionId: sessionId, answers: answers, current: current, startedAt: quizStartedAt }));
    } catch (err) { /* localStorage indisponível — segue sem persistência local */ }
  }

  function clearLocalState() {
    try { localStorage.removeItem(STORAGE_KEY); } catch (err) { /* ignore */ }
  }

  function patchAnswer(field, value) {
    if (!sessionId) return;
    fetch('/api/raiox-agua/respostas/' + sessionId, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ campo: field, valor: value })
    }).catch(function (err) {
      console.warn('Não foi possível salvar automaticamente a resposta:', err);
    });
  }

  function updateProgress() {
    progressFill.style.width = (current / TOTAL_STEPS * 100) + '%';
    progressLabel.textContent = 'Pergunta ' + Math.min(current + 1, QUESTIONS.length) + ' de ' + QUESTIONS.length;
  }

  function renderQuestion() {
    var q = QUESTIONS[current];
    questionEl.textContent = q.text;
    optionsEl.innerHTML = '';
    backBtn.disabled = current === 0;
    continueBtn.hidden = q.type !== 'multi';

    if (q.type === 'multi') {
      multiSelection = Array.isArray(answers[q.field]) ? answers[q.field].slice() : [];
      renderMultiOptions(q);
      updateContinueState();
    } else {
      q.options.forEach(function (text, i) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'quiz-option';
        if (answers[q.field] === text) btn.classList.add('selected');
        btn.innerHTML = '<span class="quiz-option-letter">' + String.fromCharCode(65 + i) + '</span><span class="quiz-option-text">' + text + '</span>';
        btn.addEventListener('click', function () { selectSingle(q, text); });
        optionsEl.appendChild(btn);
      });
    }

    updateProgress();
  }

  function renderMultiOptions(q) {
    optionsEl.innerHTML = '';
    q.options.forEach(function (text) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'quiz-option';
      if (multiSelection.indexOf(text) !== -1) btn.classList.add('selected');
      btn.innerHTML = '<span class="quiz-option-checkbox">' + CHECK_ICON + '</span><span class="quiz-option-text">' + text + '</span>';
      btn.addEventListener('click', function () { toggleMultiOption(q, text); });
      optionsEl.appendChild(btn);
    });
  }

  function toggleMultiOption(q, text) {
    var idx = multiSelection.indexOf(text);
    if (q.exclusive && text === q.exclusive) {
      multiSelection = idx === -1 ? [text] : [];
    } else {
      if (q.exclusive) {
        var exIdx = multiSelection.indexOf(q.exclusive);
        if (exIdx !== -1) multiSelection.splice(exIdx, 1);
      }
      if (idx === -1) multiSelection.push(text);
      else multiSelection.splice(idx, 1);
    }
    renderMultiOptions(q);
    updateContinueState();
  }

  function updateContinueState() {
    continueBtn.disabled = multiSelection.length === 0;
  }

  function goToStep(index) {
    current = index;
    if (current >= QUESTIONS.length) {
      showLeadForm();
    } else {
      renderQuestion();
    }
    saveLocalState();
  }

  function selectSingle(q, value) {
    answers[q.field] = value;
    patchAnswer(q.field, value);
    Array.from(optionsEl.children).forEach(function (btn, i) {
      btn.classList.toggle('selected', q.options[i] === value);
    });
    saveLocalState();

    setTimeout(function () {
      goToStep(current + 1);
    }, 300);
  }

  continueBtn.addEventListener('click', function () {
    var q = QUESTIONS[current];
    answers[q.field] = multiSelection.slice();
    patchAnswer(q.field, answers[q.field]);
    goToStep(current + 1);
  });

  backBtn.addEventListener('click', function () {
    if (current > 0) goToStep(current - 1);
  });

  function showLeadForm() {
    appSection.hidden = true;
    leadSection.hidden = false;
    updateHeader();
    leadSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  var leadForm = document.getElementById('quizLeadForm');
  var leadSubmitBtn = document.getElementById('leadSubmitBtn');

  leadForm.addEventListener('submit', function (e) {
    e.preventDefault();
    leadSubmitBtn.disabled = true;
    leadSubmitBtn.textContent = 'Enviando...';

    var tempoResposta = quizStartedAt ? Math.round((Date.now() - quizStartedAt) / 1000) : null;
    var body = {
      nome: document.getElementById('leadNome').value.trim(),
      whatsapp: document.getElementById('leadWhatsapp').value.trim(),
      cidade: document.getElementById('leadCidade').value.trim(),
      estado: document.getElementById('leadEstado').value.trim(),
      tempoResposta: tempoResposta
    };

    fetch('/api/raiox-agua/finalizar/' + sessionId, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }).catch(function (err) {
      console.warn('Não foi possível finalizar o Raio-X da Água:', err);
    }).then(function () {
      clearLocalState();
      leadSection.hidden = true;
      resultSection.hidden = false;
      updateHeader();
      resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  function startQuiz() {
    quizStartedAt = Date.now();
    introSection.hidden = true;
    appSection.hidden = false;
    updateHeader();

    fetch('/api/raiox-agua/iniciar', { method: 'POST' })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        sessionId = data.sessionId;
        saveLocalState();
      })
      .catch(function (err) {
        console.warn('Não foi possível iniciar o Raio-X da Água:', err);
      });

    renderQuestion();
  }

  document.getElementById('startQuiz').addEventListener('click', function () {
    startQuiz();
  });

  /* ===== Retomada de sessão incompleta (mesma aba/navegador) ===== */
  (function tryResume() {
    var saved;
    try { saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'); } catch (err) { saved = null; }
    if (!saved || !saved.sessionId) return;

    sessionId = saved.sessionId;
    answers = saved.answers || {};
    quizStartedAt = saved.startedAt || Date.now();
    current = typeof saved.current === 'number' ? saved.current : 0;

    introSection.hidden = true;
    appSection.hidden = false;
    updateHeader();
    goToStep(current);
  })();

})();

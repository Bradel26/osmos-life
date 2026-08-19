(function () {
  'use strict';

  /* ===== Header scroll state =====
     The header is white-on-dark only while the dark intro section is
     showing; the quiz and result screens have a light background, so
     the header must switch to its light "scrolled" style even at
     scrollY 0 once the intro is hidden. */
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

  /* ===== Question bank =====
     Each option's value reflects growing awareness/engagement (A=1 ... D=4). */
  var QUESTIONS = [
    { text: 'Quando você faz compras no supermercado, normalmente...', options: ['Compro sempre os mesmos produtos.', 'Comparo preços.', 'Costumo ler informações e ingredientes antes de comprar.', 'Escolho produtos pensando na minha saúde.'] },
    { text: 'Ao sentir sede durante o dia, você...', options: ['Bebe o que estiver disponível.', 'Lembra de beber água apenas quando sente muita sede.', 'Procura manter uma rotina de hidratação.', 'Sempre busca consumir água de qualidade.'] },
    { text: 'Sobre alimentação, você diria que...', options: ['Não penso muito nisso.', 'Tento melhorar quando lembro.', 'Procuro fazer escolhas mais saudáveis.', 'Tenho uma rotina planejada de alimentação.'] },
    { text: 'Quando surge uma nova informação sobre saúde, você...', options: ['Geralmente ignora.', 'Escuta, mas não muda hábitos.', 'Pesquisa para entender melhor.', 'Costuma colocar em prática rapidamente.'] },
    { text: 'Em casa, você costuma investir mais em...', options: ['Tecnologia.', 'Decoração.', 'Conforto.', 'Saúde e qualidade de vida.'] },
    { text: 'Você costuma ler rótulos nutricionais?', options: ['Nunca.', 'Raramente.', 'Às vezes.', 'Quase sempre.'] },
    { text: 'Quando compra um produto, o que pesa mais?', options: ['Preço.', 'Marca conhecida.', 'Qualidade.', 'Benefícios para minha família.'] },
    { text: 'Qual frase mais combina com você?', options: ['"Se está funcionando, não preciso mudar."', '"Prefiro esperar um pouco antes de decidir."', '"Gosto de pesquisar antes de comprar."', '"Invisto no que melhora minha qualidade de vida."'] },
    { text: 'Você acredita que pequenos hábitos influenciam sua saúde no longo prazo?', options: ['Pouco.', 'Talvez.', 'Sim.', 'Com certeza.'] },
    { text: 'Quando faz um investimento para sua casa, você pensa em...', options: ['Economia.', 'Durabilidade.', 'Conforto.', 'Saúde e bem-estar.'] },
    { text: 'Como você escolhe a água que consome?', options: ['Nunca pensei sobre isso.', 'Pelo custo.', 'Pela praticidade.', 'Pela qualidade.'] },
    { text: 'Qual destas palavras mais representa seu estilo de vida?', options: ['Praticidade.', 'Economia.', 'Equilíbrio.', 'Bem-estar.'] },
    { text: 'Você costuma pesquisar antes de comprar produtos de maior valor?', options: ['Nunca.', 'Pouco.', 'Sim.', 'Bastante.'] },
    { text: 'Quando um especialista recomenda uma mudança de hábito, você...', options: ['Não costuma seguir.', 'Pensa sobre isso.', 'Pesquisa antes.', 'Coloca em prática.'] },
    { text: 'Em relação à água consumida em casa, você considera que...', options: ['Nunca pensei sobre isso.', 'Deve ser boa o suficiente.', 'Poderia ser melhor.', 'É um aspecto importante da saúde da minha família.'] },
    { text: 'O que representa qualidade de vida para você?', options: ['Tempo livre.', 'Estabilidade financeira.', 'Equilíbrio entre trabalho e vida pessoal.', 'Saúde para mim e minha família.'] },
    { text: 'Quando precisa tomar uma decisão importante, você...', options: ['Decide rapidamente.', 'Adia o máximo possível.', 'Pesquisa bastante.', 'Busca informações e especialistas.'] },
    { text: 'Qual destas frases mais combina com você?', options: ['Só resolvo problemas quando aparecem.', 'Prefiro esperar o momento certo.', 'Gosto de prevenir problemas.', 'Invisto em prevenção.'] },
    { text: 'Você acredita que sua casa influencia diretamente sua saúde?', options: ['Nunca pensei nisso.', 'Um pouco.', 'Sim.', 'Totalmente.'] },
    { text: 'Se pudesse melhorar apenas um aspecto da sua rotina hoje, escolheria...', options: ['Economizar dinheiro.', 'Ganhar tempo.', 'Dormir melhor.', 'Melhorar minha saúde.'] }
  ];

  var LETTERS = ['A', 'B', 'C', 'D'];

  var PROFILES = [
    {
      min: 20, max: 35,
      title: 'Perfil Inconsciente',
      description: 'Você ainda não parou para pensar em como pequenos hábitos do dia a dia — como a qualidade da água que sua família consome — podem impactar diretamente a saúde a longo prazo. Vale a pena conhecer o que passa despercebido na rotina de qualquer casa.',
      ctaText: 'Entenda o que pode estar na sua água',
      ctaHref: 'index.html#problema'
    },
    {
      min: 36, max: 50,
      title: 'Perfil Consciente',
      description: 'Você já valoriza saúde e bem-estar, mas ainda não conectou isso diretamente à água que consome em casa. Conhecer os benefícios de uma água verdadeiramente pura pode ser o próximo passo natural na sua rotina.',
      ctaText: 'Veja os benefícios de uma água pura',
      ctaHref: 'index.html#beneficios'
    },
    {
      min: 51, max: 65,
      title: 'Perfil Investigador',
      description: 'Você gosta de pesquisar, comparar e entender a fundo antes de decidir. Esse é o momento ideal para conhecer a tecnologia por trás da Osmose Reversa e comparar com as alternativas que você já conhece.',
      ctaText: 'Compare as tecnologias de purificação',
      ctaHref: 'index.html#comparacao'
    },
    {
      min: 66, max: 80,
      title: 'Perfil Transformador',
      description: 'Você já entende que saúde é o investimento mais importante e está pronto para dar o próximo passo. Fale com um consultor OSMOS e descubra a solução ideal para a sua casa.',
      ctaText: 'Solicitar uma Consultoria',
      ctaHref: 'index.html#contato'
    }
  ];

  function profileFor(score) {
    for (var i = 0; i < PROFILES.length; i++) {
      if (score >= PROFILES[i].min && score <= PROFILES[i].max) return PROFILES[i];
    }
    return PROFILES[PROFILES.length - 1];
  }

  /* ===== State ===== */
  var current = 0;
  var answers = new Array(QUESTIONS.length).fill(null);
  var quizStartedAt = null;

  var appSection = document.getElementById('quizApp');
  var resultSection = document.getElementById('quizResult');

  var questionEl = document.getElementById('quizQuestion');
  var optionsEl = document.getElementById('quizOptions');
  var progressFill = document.getElementById('quizProgressFill');
  var progressLabel = document.getElementById('quizProgressLabel');
  var backBtn = document.getElementById('quizBack');

  function renderQuestion() {
    var q = QUESTIONS[current];
    questionEl.textContent = q.text;
    optionsEl.innerHTML = '';

    q.options.forEach(function (text, i) {
      var value = i + 1;
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'quiz-option';
      if (answers[current] === value) btn.classList.add('selected');
      btn.innerHTML = '<span class="quiz-option-letter">' + LETTERS[i] + '</span><span class="quiz-option-text">' + text + '</span>';
      btn.addEventListener('click', function () { selectOption(value); });
      optionsEl.appendChild(btn);
    });

    backBtn.disabled = current === 0;
    progressFill.style.width = ((current) / QUESTIONS.length * 100) + '%';
    progressLabel.textContent = 'Pergunta ' + (current + 1) + ' de ' + QUESTIONS.length;
  }

  function selectOption(value) {
    answers[current] = value;
    Array.from(optionsEl.children).forEach(function (btn, i) {
      btn.classList.toggle('selected', i === value - 1);
    });

    setTimeout(function () {
      if (current < QUESTIONS.length - 1) {
        current++;
        renderQuestion();
      } else {
        finishQuiz();
      }
    }, 300);
  }

  backBtn.addEventListener('click', function () {
    if (current > 0) {
      current--;
      renderQuestion();
    }
  });

  function submitQuizResult(score, profile) {
    var tempoResposta = quizStartedAt ? Math.round((Date.now() - quizStartedAt) / 1000) : null;
    var respostas = QUESTIONS.map(function (q, i) {
      var value = answers[i];
      return {
        pergunta: q.text,
        opcaoLetra: value ? LETTERS[value - 1] : null,
        opcaoTexto: value ? q.options[value - 1] : null
      };
    });

    fetch('/api/quiz/respostas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ score: score, perfil: profile.title, respostas: respostas, tempoResposta: tempoResposta })
    }).catch(function (err) {
      console.warn('Não foi possível registrar a resposta do diagnóstico:', err);
    });
  }

  function finishQuiz() {
    var score = answers.reduce(function (sum, v) { return sum + v; }, 0);
    var profile = profileFor(score);
    submitQuizResult(score, profile);

    progressFill.style.width = '100%';
    progressLabel.textContent = 'Pergunta ' + QUESTIONS.length + ' de ' + QUESTIONS.length;

    document.getElementById('resultTitle').textContent = profile.title;
    document.getElementById('resultDescription').textContent = profile.description;
    var cta = document.getElementById('resultCta');
    cta.textContent = profile.ctaText;
    cta.href = profile.ctaHref;

    appSection.hidden = true;
    resultSection.hidden = false;
    updateHeader();
    resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  document.getElementById('startQuiz').addEventListener('click', function () {
    quizStartedAt = Date.now();
    introSection.hidden = true;
    appSection.hidden = false;
    updateHeader();
    renderQuestion();
  });

  document.getElementById('quizRestart').addEventListener('click', function () {
    current = 0;
    quizStartedAt = null;
    answers = new Array(QUESTIONS.length).fill(null);
    resultSection.hidden = true;
    introSection.hidden = false;
    updateHeader();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

})();

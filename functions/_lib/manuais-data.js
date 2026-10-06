// Conteúdo-piloto da Central de Manuais — Purificador OSMOS A9Plus.
// Fonte: Manual de instruções oficial do item A9Plus (osmose reversa).
// Este módulo também faz o seed idempotente: insere o A9Plus apenas se ainda
// não existir (ON CONFLICT DO NOTHING), de modo que edições feitas no painel
// admin nunca sejam sobrescritas em novos deploys.

// ---------------------------------------------------------------------------
// Ilustrações técnicas (SVG, traço — mesmo estilo do manual do fabricante).
// Usam currentColor para herdar a cor do contexto (claro/escuro).
// ---------------------------------------------------------------------------

// Vista frontal: corpo em cápsula, dois anéis concêntricos (filtros/alto-falantes),
// base, display de 3 dígitos, LEDs de status e botão redondo.
const SVG_FRONTAL = `<svg viewBox="0 0 220 440" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Vista frontal do purificador OSMOS A9Plus" preserveAspectRatio="xMidYMid meet">
  <rect x="30" y="8" width="160" height="366" rx="80" stroke="currentColor" stroke-width="2"/>
  <circle cx="110" cy="128" r="60" stroke="currentColor" stroke-width="2"/>
  <circle cx="110" cy="128" r="38" stroke="currentColor" stroke-width="1.4"/>
  <circle cx="110" cy="128" r="18" stroke="currentColor" stroke-width="1.4"/>
  <circle cx="110" cy="258" r="60" stroke="currentColor" stroke-width="2"/>
  <circle cx="110" cy="258" r="38" stroke="currentColor" stroke-width="1.4"/>
  <circle cx="110" cy="258" r="18" stroke="currentColor" stroke-width="1.4"/>
  <path d="M40 374 Q40 420 86 420 H134 Q180 420 180 374" stroke="currentColor" stroke-width="2"/>
  <rect x="92" y="330" width="46" height="22" rx="3" stroke="currentColor" stroke-width="1.4"/>
  <path d="M100 335v12M110 335v12M120 335v12" stroke="currentColor" stroke-width="1.2"/>
  <circle cx="90" cy="364" r="2.4" stroke="currentColor" stroke-width="1.1"/>
  <circle cx="90" cy="374" r="2.4" stroke="currentColor" stroke-width="1.1"/>
  <circle cx="90" cy="384" r="2.4" stroke="currentColor" stroke-width="1.1"/>
  <circle cx="110" cy="398" r="8" stroke="currentColor" stroke-width="1.4"/>
  <circle cx="110" cy="398" r="3" stroke="currentColor" stroke-width="1.2"/>
</svg>`;

// Vista traseira: painel de conexões com 6 pontos rotulados.
const SVG_TRASEIRA = `<svg viewBox="0 0 260 440" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Vista traseira do purificador OSMOS A9Plus com conexões" preserveAspectRatio="xMidYMid meet">
  <rect x="20" y="8" width="150" height="366" rx="75" stroke="currentColor" stroke-width="2"/>
  <path d="M30 374 Q30 420 76 420 H124 Q170 420 170 374" stroke="currentColor" stroke-width="2"/>
  <rect x="58" y="70" width="60" height="250" rx="10" stroke="currentColor" stroke-width="1.2"/>
  <g stroke="currentColor" stroke-width="1.4">
    <circle cx="88" cy="96" r="9"/><circle cx="88" cy="96" r="3"/>
    <circle cx="88" cy="140" r="9"/><circle cx="88" cy="140" r="3"/>
    <circle cx="88" cy="184" r="9"/><circle cx="88" cy="184" r="3"/>
    <circle cx="88" cy="228" r="9"/><circle cx="88" cy="228" r="3"/>
    <circle cx="88" cy="272" r="7"/>
    <circle cx="88" cy="300" r="9"/><circle cx="88" cy="300" r="3"/>
  </g>
  <g stroke="currentColor" stroke-width="1" stroke-dasharray="4 3">
    <path d="M100 96h150"/><path d="M100 140h150"/><path d="M100 184h150"/>
    <path d="M100 228h150"/><path d="M100 272h150"/><path d="M100 300h150"/>
  </g>
</svg>`;

// Torneira dupla eletrônica com display (PCT, RO, gota, alerta, TDS, horas).
const SVG_TORNEIRA = `<svg viewBox="0 0 220 300" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Torneira dupla eletrônica OSMOS com display" preserveAspectRatio="xMidYMid meet">
  <path d="M110 20c-26 0-30 26-30 54v10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
  <circle cx="80" cy="20" r="5" stroke="currentColor" stroke-width="1.4"/>
  <rect x="86" y="150" width="48" height="70" rx="8" stroke="currentColor" stroke-width="1.6"/>
  <rect x="94" y="158" width="32" height="18" rx="2" stroke="currentColor" stroke-width="1"/>
  <path d="M102 162v10M110 162v10M118 162v10" stroke="currentColor" stroke-width="1"/>
  <circle cx="96" cy="186" r="2" stroke="currentColor" stroke-width="0.9"/>
  <circle cx="124" cy="186" r="2" stroke="currentColor" stroke-width="0.9"/>
  <path d="M70 180H40c-8 0-14 6-14 14v16" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
  <path d="M150 180h30c8 0 14 6 14 14v16" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
  <path d="M86 220v40h48v-40" stroke="currentColor" stroke-width="1.6"/>
  <path d="M70 274h80" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
</svg>`;

// Diagrama hidráulico resumido (entrada → host → torneira / rejeito).
const SVG_HIDRAULICO = `<svg viewBox="0 0 520 240" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Diagrama de instalação hidráulica do A9Plus" preserveAspectRatio="xMidYMid meet">
  <rect x="40" y="70" width="90" height="120" rx="20" stroke="currentColor" stroke-width="2"/>
  <circle cx="85" cy="110" r="16" stroke="currentColor" stroke-width="1.4"/>
  <circle cx="85" cy="150" r="16" stroke="currentColor" stroke-width="1.4"/>
  <text x="85" y="214" font-size="12" text-anchor="middle" fill="currentColor">Host</text>
  <path d="M8 60h18v16h-18z" stroke="currentColor" stroke-width="1.4"/>
  <path d="M26 68h14v62" stroke="currentColor" stroke-width="1.6"/>
  <path d="M40 130h-14" stroke="currentColor" stroke-width="1.6"/>
  <text x="18" y="52" font-size="11" text-anchor="middle" fill="currentColor">Registro</text>
  <path d="M130 100h210" stroke="currentColor" stroke-width="1.6"/>
  <path d="M130 130h250c20 0 20 -70 20 -70" stroke="currentColor" stroke-width="1.6"/>
  <path d="M130 160h300" stroke="currentColor" stroke-width="1.6" stroke-dasharray="5 4"/>
  <rect x="410" y="20" width="70" height="20" rx="6" stroke="currentColor" stroke-width="1.6"/>
  <text x="445" y="14" font-size="11" text-anchor="middle" fill="currentColor">Torneira</text>
  <text x="250" y="94" font-size="10" fill="currentColor">Água da cozinha</text>
  <text x="250" y="124" font-size="10" fill="currentColor">Água pura</text>
  <text x="250" y="154" font-size="10" fill="currentColor">Rejeito (esgoto)</text>
</svg>`;

export const MANUAIS_SVGS = {
  frontal: SVG_FRONTAL,
  traseira: SVG_TRASEIRA,
  torneira: SVG_TORNEIRA,
  hidraulico: SVG_HIDRAULICO
};

// ---------------------------------------------------------------------------
// Conteúdo estruturado do manual A9Plus.
// ---------------------------------------------------------------------------
const A9PLUS_CONTEUDO = {
  fotoComponentes: '/assets/manuais/a9plus/vista-frontal.png',
  fotos: [{"url": "/assets/manuais/a9plus/foto-01-studio.png", "alt": "Vista frontal: filtros PCT e RO, display e botão de energia"}, {"url": "/assets/manuais/a9plus/foto-02-studio.png", "alt": "Vista lateral com identificação 1000G"}, {"url": "/assets/manuais/a9plus/foto-03-studio.png", "alt": "Vista traseira: conexões de água e energia"}, {"url": "/assets/manuais/a9plus/foto-05-studio.png", "alt": "Vista lateral com etiqueta técnica do produto"}],
  visaoGeral: {
    texto: 'O OSMOS A9Plus é um purificador de água por osmose reversa compacto, de alto desempenho, que elimina até as menores impurezas com precisão de filtragem de 0,0001 µm. Ao ser ligado, inicia automaticamente, executa uma autolimpeza e passa a produzir água pura, exibindo o TDS em tempo real. Acompanha torneira dupla eletrônica (água da cozinha e água pura) e indicadores inteligentes de vida útil dos filtros PCT e RO.',
    caracteristicas: [
      { icone: 'drop', titulo: 'Osmose reversa 0,0001 µm', texto: 'Membrana RO que retém sais, metais, sedimentos e microplásticos.' },
      { icone: 'flow', titulo: 'Vazão de 2,6 L/min', texto: 'Água pura rápida para o dia a dia, com relação pura/rejeito de ~2:1.' },
      { icone: 'display', titulo: 'Display de TDS', texto: 'Mostra o TDS da água pura em tempo real, sincronizado com a torneira.' },
      { icone: 'refresh', titulo: 'Autolimpeza (flush)', texto: 'Enxágua a membrana automaticamente para prolongar a vida útil.' },
      { icone: 'filter', titulo: 'Indicadores de filtro', texto: 'Luzes PCT e RO avisam quando chega a hora da troca.' },
      { icone: 'shield', titulo: 'Proteção contra vazamento', texto: 'Sensor de vazamento interrompe a produção e sinaliza o código E1.' }
    ],
    destaque: 'Purificação por osmose reversa com acompanhamento do TDS da água pura no display.'
  },

  componentes: [
    { nome: 'Filtro PCT (1º estágio)', descricao: 'Filtro composto PCT na posição superior. Retém cloro, sedimentos e partículas antes da membrana.', ponto: 'pct' },
    { nome: 'Filtro RO (2º estágio)', descricao: 'Membrana de osmose reversa com carvão ativado pós-filtro, na posição inferior.', ponto: 'ro' },
    { nome: 'Display de TDS', descricao: 'Mostra o valor de TDS da água pura (efluente) em tempo real.', ponto: 'display' },
    { nome: 'Luzes indicadoras de filtro', descricao: 'LEDs PCT e RO indicam a vida útil de cada elemento filtrante.', ponto: 'display' },
    { nome: 'Botão liga/desliga', descricao: 'Liga, força parada, reinicia após falha e executa o flush manual (pressão longa).', ponto: 'botao' },
    { nome: 'Entrada de água', descricao: 'Conexão da alimentação de água da rede (água fria) ao equipamento.', ponto: 'entrada' },
    { nome: 'Saída de água pura', descricao: 'Leva a água purificada até a torneira (bica de água pura).', ponto: 'purewater' },
    { nome: 'Interface DC', descricao: 'Conexão elétrica da fonte de alimentação da unidade principal.', ponto: 'dc' },
    { nome: 'Água da cozinha', descricao: 'Saída para a bica de água da cozinha da torneira dupla.', ponto: 'cozinha' },
    { nome: 'Interface de energia da torneira', descricao: 'Conexão do cabo de energia da torneira eletrônica, entre a entrada de água e a saída residual.', ponto: 'torneira' },
    { nome: 'Saída de rejeito', descricao: 'Descarte da água de rejeito (esgoto) gerada pela osmose reversa.', ponto: 'rejeito' }
  ],

  antesDeInstalar: {
    checklist: [
      'Confira se todas as ferramentas e acessórios acompanham o produto.',
      'Não ligue a energia nem a água antes de concluir a instalação.',
      'Escolha uma tomada de água fria (água da rede / municipal).',
      'Mantenha o equipamento na posição normal (em pé).',
      'Abra a tampa do filtro, remova o lacre plástico transparente dos elementos e trave a tampa com a chave que acompanha.'
    ],
    ferramentas: ['Chave que acompanha o produto', 'Conector rápido', 'Tubo PE (fornecido)'],
    requisitos: [
      { rotulo: 'Pressão de entrada', valor: '0,1 a 0,4 MPa' },
      { rotulo: 'Temperatura da água', valor: '5 °C a 38 °C' },
      { rotulo: 'Fonte de água', valor: 'Rede pública / água fria' }
    ],
    cuidados: [
      'É normal a tampa do filtro de uma máquina nova não vir totalmente fechada.',
      'Não energize o equipamento com a tubulação desconectada.'
    ]
  },

  instalacao: {
    passos: [
      { titulo: 'Escolha a alimentação de água', texto: 'Em pias com água quente e fria, selecione sempre a tubulação de água fria (água da rede). Posicione o equipamento em pé, na posição normal de uso.' },
      { titulo: 'Defina a posição da torneira', texto: 'Normalmente escolha um dos cantos da pia, conforme o hábito de uso (lavar louça, legumes, arroz), selecionando o canto mais utilizado.' },
      { titulo: 'Instale a torneira', texto: 'Retire o tubo PE e conecte-o diretamente ao conector rápido. Insira firmemente uma extremidade do tubo PE no conector rápido e ligue o cabo de força da torneira à interface do equipamento.' },
      { titulo: 'Conecte a água e verifique', texto: 'Conecte a entrada à água fria da rede, as saídas de água pura e água da cozinha à torneira dupla e a saída de água residual ao esgoto. Conecte a interface DC e o cabo de energia da torneira nas interfaces correspondentes. Confira todas as mangueiras antes de abrir o registro e energizar. Observe a relação água pura/rejeito (~2:1). A máquina executa um flush automático de ~1 minuto ao iniciar.' },
      { titulo: 'Primeira utilização', texto: 'Com o indicador de energia aceso, pressione o botão "liga" por 5 segundos para iniciar o flush de 10 minutos. Líquido turvo é normal nessa etapa. Ao terminar o enxágue, verifique se há vazamentos. Se estiver tudo correto, abra a torneira de água pura e deixe correr por cerca de 3 minutos antes do uso; resíduos de carvão são normais nessa etapa.' }
    ]
  },

  especificacoes: [
    { rotulo: 'Modelo', valor: 'A9Plus' },
    { rotulo: 'Vazão de água purificada', valor: '2,6 L/min' },
    { rotulo: 'Precisão de filtragem', valor: '0,0001 µm' },
    { rotulo: 'Pressão de entrada de água', valor: '0,1 MPa – 0,4 MPa' },
    { rotulo: 'Temperatura de água aplicável', valor: '5 °C – 38 °C' },
    { rotulo: 'Dimensões (A×L×P)', valor: '419 × 158 × 381 mm' },
    { rotulo: 'Relação água pura / rejeito', valor: '≈ 2:1' },
    { rotulo: 'Qualidade da água de saída', valor: 'Conforme a especificação de dispositivos de tratamento por osmose reversa (2001)' }
  ],

  desenhos: [
  {
    "titulo": "Vista frontal",
    "vista": "frontal",
    "descricao": "Filtros PCT e RO, display de TDS, indicadores e botão de energia.",
    "imagem_url": "/assets/manuais/a9plus/vista-frontal.png",
    "arquivo_url": "/assets/manuais/a9plus/vista-frontal.png"
  },
  {
    "titulo": "Vista traseira",
    "vista": "traseira",
    "descricao": "Interfaces elétricas e conexões hidráulicas da unidade principal.",
    "imagem_url": "/assets/manuais/a9plus/vista-traseira.png",
    "arquivo_url": "/assets/manuais/a9plus/vista-traseira.png"
  },
  {
    "titulo": "Lateral direita",
    "vista": "lateral",
    "descricao": "Vista lateral direita do equipamento.",
    "imagem_url": "/assets/manuais/a9plus/lateral-direita.png",
    "arquivo_url": "/assets/manuais/a9plus/lateral-direita.png"
  },
  {
    "titulo": "Lateral esquerda",
    "vista": "lateral",
    "descricao": "Vista lateral esquerda do equipamento.",
    "imagem_url": "/assets/manuais/a9plus/lateral-esquerda.png",
    "arquivo_url": "/assets/manuais/a9plus/lateral-esquerda.png"
  },
  {
    "titulo": "Remoção dos filtros",
    "vista": "frontal",
    "descricao": "Use a chave, gire a tampa no sentido anti-horário e retire o elemento filtrante.",
    "imagem_url": "/assets/manuais/a9plus/remocao-filtros.png",
    "arquivo_url": "/assets/manuais/a9plus/remocao-filtros.png"
  },
  {
    "titulo": "Guia das conexões",
    "vista": "traseira",
    "descricao": "DC, água pura, água da cozinha, entrada da rede e saída de água residual. A interface de energia da torneira fica entre a entrada da rede e a saída residual.",
    "imagem_url": "/assets/manuais/a9plus/conexoes-traseiras.png",
    "arquivo_url": "/assets/manuais/a9plus/conexoes-traseiras.png"
  }
],
  dimensoes: { altura: '419 mm', largura: '158 mm', profundidade: '381 mm' },

  uso: {
    texto: 'O A9Plus foi projetado para operação automática. Ao energizar, emite um bipe, acende todas as luzes (brancas), executa um flush de 30 segundos e passa a produzir água. O display mostra o TDS da água pura.',
    topicos: [
      'Início automático: ao ligar, a máquina faz o flush e entra em produção de água; pressione o botão para forçar a parada.',
      'Flush por produção: a cada 30 minutos acumulados de produção, enxágua automaticamente por 30 segundos (nunca durante a produção).',
      'Proteção E2: 60 minutos de produção contínua acendem a luz vermelha com alarme e exibem "E2"; pressione o botão de energia para reiniciar.',
      'Modo economia: em standby, após 1 minuto apenas o botão de energia fica aceso; ao trabalhar, o display volta ao normal.',
      'Enxágue manual: com os indicadores PCT e RO constantemente brancos, segure o botão de energia por 5 segundos para enxaguar por 10 minutos.',
      'Proteção E1: ao detectar vazamento, o equipamento bloqueia a produção e o enxágue, pisca a luz vermelha e emite 3 bipes. Verifique o vazamento ou acione o SAC.',
      'Interruptor de alta pressão: ao atingir a pressão nominal de desconexão, o circuito desliga e a membrana RO é enxaguada por 3 segundos.',
      'Standby de 24 h: após 24 horas em espera, a máquina faz um flush automático de 30 segundos.',
      'Torneira eletrônica: a gota acende em branco ao produzir água; o alerta fica vermelho em caso de falha; o display mostra o TDS sincronizado com o host.'
    ]
  },

  manutencao: {
    texto: 'A troca dos filtros depende da qualidade da água local. O equipamento também monitora as horas de energização e avisa pelas luzes PCT e RO.',
    periodicidade: [
      { rotulo: 'Filtro PCT (1º estágio)', valor: '8 a 12 meses' },
      { rotulo: 'Membrana RO (2º estágio)', valor: '12 a 18 meses' },
      { rotulo: 'Aviso PCT (horas)', valor: 'Pisca em 7920 h · para em 8760 h' },
      { rotulo: 'Aviso RO (horas)', valor: 'Pisca em 16560 h · para em 17520 h' }
    ],
    quandoTrocar: [
      'Queda na qualidade/sabor da água e aumento do TDS da água pura.',
      'Redução significativa da vazão de saída.',
      'Superfície do elemento coberta por poluentes ou muito descolorida.'
    ],
    passos: [
      'Feche o registro de entrada e abra a torneira para esvaziar a água da máquina.',
      'Desligue o cabo de energia.',
      'Gire o filtro no sentido anti-horário, puxe-o para fora e troque pelo novo (mesmo procedimento para a membrana RO).',
      'Reconecte a energia, abra o registro e segure o botão para executar o flush.',
      'Abra a torneira de água pura e deixe correr por 3 minutos.',
      'Verifique se há vazamentos; estando tudo correto, o equipamento está pronto para uso.'
    ],
    reset: 'Quando a luz PCT ou RO estiver piscando (branca ou vermelha), pressione e segure o botão "liga" por 6 segundos para identificar o filtro e concluir o reset. Se as duas luzes piscarem ao mesmo tempo, o reset é simultâneo.'
  },

  troubleshooting: [
    { problema: 'A máquina não liga', causa: 'A alimentação não está conectada', solucao: 'Verifique a tomada ou o plugue de energia.' },
    { problema: 'A máquina não liga', causa: 'Baixa pressão ou falta de água na rede', solucao: 'Verifique a pressão da água bruta.' },
    { problema: 'A máquina não liga', causa: 'Falha na chave de baixa pressão', solucao: 'Com a água conectada, meça a resistência e substitua a chave.' },
    { problema: 'A máquina não liga', causa: 'Chave de alta pressão não reseta', solucao: 'Após aliviar a pressão, meça a resistência e substitua.' },
    { problema: 'A máquina não liga', causa: 'Transformador queimado ou caixa sem saída de tensão', solucao: 'Meça a tensão de saída e substitua o componente.' },
    { problema: 'A bomba funciona mas não produz água', causa: 'Bomba de alta pressão perdeu pressão', solucao: 'Meça a pressão de saída da bomba e substitua-a.' },
    { problema: 'A bomba funciona mas não produz água', causa: 'Válvula solenoide de entrada com defeito', solucao: 'Substitua a válvula solenoide de entrada (sem água pura nem rejeito).' },
    { problema: 'A bomba funciona mas não produz água', causa: 'Pré-filtro entupido', solucao: 'Observe água pura e rejeito e troque o elemento do pré-filtro.' },
    { problema: 'A bomba funciona mas não produz água', causa: 'Válvula de retenção bloqueada', solucao: 'Com rejeito mas sem água pura, substitua a válvula de retenção.' },
    { problema: 'A bomba funciona mas não produz água', causa: 'Solenoide de flush não fecha (muito rejeito)', solucao: 'Observe a vazão de rejeito e substitua a solenoide de flush automático.' },
    { problema: 'A bomba funciona mas não produz água', causa: 'Membrana RO bloqueada', solucao: 'Limpe ou substitua a membrana RO.' },
    { problema: 'Máquina desligada, mas o rejeito continua correndo', causa: 'Válvula solenoide não corta a água', solucao: 'Observe o rejeito e substitua a válvula solenoide de entrada.' },
    { problema: 'Máquina desligada, mas o rejeito continua correndo', causa: 'Alívio de pressão na válvula de retenção', solucao: 'Observe o rejeito e substitua a válvula de retenção.' },
    { problema: 'Depois de cheia, a máquina liga e desliga repetidamente', causa: 'Alívio de pressão na válvula de retenção', solucao: 'Substitua a válvula de retenção.' },
    { problema: 'Depois de cheia, a máquina liga e desliga repetidamente', causa: 'Falha na chave de alta pressão', solucao: 'Substitua a chave de alta pressão.' },
    { problema: 'Depois de cheia, a máquina liga e desliga repetidamente', causa: 'Alívio de pressão no sistema', solucao: 'Verifique a tubulação de água pura após a válvula de retenção.' },
    { problema: 'Depois de cheia, a máquina liga e desliga repetidamente', causa: 'Pré-filtro entupido', solucao: 'Substitua o elemento do pré-filtro.' },
    { problema: 'Vazão de água pura insuficiente', causa: 'Membrana RO bloqueada', solucao: 'Limpe ou substitua a membrana RO.' },
    { problema: 'Vazão de água pura insuficiente', causa: 'Proporcionador de rejeito muito condutivo', solucao: 'Substitua o proporcionador de água residual.' },
    { problema: 'Vazão de água pura insuficiente', causa: 'Pressão insuficiente da bomba de alta pressão', solucao: 'Meça a pressão de saída da bomba e substitua-a.' },
    { problema: 'Falha E1 (vazamento)', causa: 'Contato do sensor com água (vazamento)', solucao: 'Verifique onde há vazamento ou acione a assistência técnica.' },
    { problema: 'Falha E2 (proteção de produção prolongada)', causa: 'Produção contínua por tempo excessivo', solucao: 'Religue a máquina ou pressione o botão de enxágue duas vezes para restaurar o funcionamento.' }
  ],

  faq: [
    { categoria: 'Instalação', pergunta: 'Posso ligar o A9Plus na água quente?', resposta: 'Não. Conecte sempre à tubulação de água fria (rede municipal). A temperatura de água aplicável é de 5 °C a 38 °C.' },
    { categoria: 'Instalação', pergunta: 'A tampa do filtro veio frouxa, é defeito?', resposta: 'Não. É normal a tampa do filtro de uma máquina nova não vir totalmente fechada. Remova o lacre plástico dos elementos e trave a tampa com a chave que acompanha.' },
    { categoria: 'Instalação', pergunta: 'Qual a pressão de entrada necessária?', resposta: 'A pressão de entrada deve ficar entre 0,1 MPa e 0,4 MPa. Pressão muito baixa pode impedir o funcionamento.' },
    { categoria: 'Funcionamento', pergunta: 'Por que sai água turva nas primeiras utilizações?', resposta: 'É normal após a instalação ou troca de filtros. Faça o flush de 10 minutos (segure o botão por 5 s) e deixe a torneira de água pura correr por ~3 minutos.' },
    { categoria: 'Funcionamento', pergunta: 'O que significa a relação 2:1?', resposta: 'Para cada 2 partes de água pura produzidas, cerca de 1 parte é descartada como rejeito, comportamento esperado da osmose reversa.' },
    { categoria: 'Funcionamento', pergunta: 'O que o display mostra?', resposta: 'O display exibe apenas o TDS da água pura (efluente), sincronizado com a torneira. TDS indica os sólidos dissolvidos totais; o display não avalia sozinho todos os aspectos da qualidade da água.' },
    { categoria: 'Manutenção', pergunta: 'De quanto em quanto tempo troco os filtros?', resposta: 'O filtro PCT a cada 8–12 meses e a membrana RO a cada 12–18 meses, conforme a qualidade da água. As luzes PCT e RO também avisam pelas horas de energização; esses alertas não substituem os ciclos recomendados de troca.' },
    { categoria: 'Manutenção', pergunta: 'Como reseto o indicador de filtro?', resposta: 'Com a luz PCT ou RO piscando, pressione e segure o botão por 6 segundos para identificar o filtro e concluir o reset. Se as duas piscarem, o reset é simultâneo.' },
    { categoria: 'Especificações', pergunta: 'Qual a vazão e a precisão de filtragem?', resposta: 'A vazão de água purificada é de 2,6 L/min e a precisão de filtragem é de 0,0001 µm.' },
    { categoria: 'Utilização', pergunta: 'Apareceu "E2" no display. O que faço?', resposta: 'E2 é a proteção de produção prolongada (60 min contínuos). Pressione o botão de energia para reiniciar, ou acione o enxágue duas vezes para restaurar.' },
    { categoria: 'Utilização', pergunta: 'Apareceu "E1" no display. O que faço?', resposta: 'E1 indica vazamento: o sensor detectou água. A produção é bloqueada por segurança. Verifique vazamentos e, se necessário, acione a assistência.' }
  ],

  garantia: {
    prazo: 'Consulte o termo de garantia do produto',
    texto: 'O manual fornecido não informa prazo nem condições de garantia. Consulte o termo que acompanha o produto ou o SAC OSMOS para confirmar a cobertura e solicitar assistência.',
    condicoes: []
  },

  dicas: [
    { tipo: 'importante', titulo: 'Remova o lacre dos filtros', texto: 'Antes de instalar, abra a tampa, retire o lacre plástico transparente dos elementos PCT e RO e trave a tampa com a chave.' },
    { tipo: 'atencao', titulo: 'Sempre água fria', texto: 'Conecte o equipamento apenas à tubulação de água fria da rede. Água quente danifica a membrana.' },
    { tipo: 'dica', titulo: 'Faça o flush inicial', texto: 'Na primeira utilização, segure o botão por 5 segundos para um flush de 10 minutos e deixe a água pura correr por 3 minutos.' },
    { tipo: 'dica', titulo: 'Escolha o canto certo da pia', texto: 'Instale a torneira no canto que você mais usa para lavar louça, legumes e arroz.' },
    { tipo: 'nao-recomendado', titulo: 'Não energize desconectado', texto: 'Nunca ligue a energia ou a água antes de concluir todas as conexões e verificar vazamentos.' }
  ],

  // Modelo 3D genérico representativo do produto (gerado proceduralmente no
  // cliente com Three.js). Os hotspots são administráveis: novos pontos podem
  // ser adicionados sem reconstruir a página.
  modelo3d: {
    tipo: 'generico',
    legenda: 'Modelo 3D ilustrativo. Arraste para girar e use a rolagem para aproximar.'
  },
  hotspots: [
    { id: 'display', nome: 'Display de TDS', x: 0, y: -0.35, z: 0.62, funcao: 'Mostra o TDS da água pura em tempo real.', uso: 'Acompanhe o valor de sólidos dissolvidos totais da água pura.', cuidado: '', especificacao: 'TDS da água pura (efluente)', linkSecao: 'uso' },
    { id: 'pct', nome: 'Filtro PCT', x: 0, y: 0.62, z: 0.55, funcao: 'Filtro composto de 1º estágio (pré-filtragem).', uso: 'Troque a cada 8–12 meses ou quando a luz PCT avisar.', cuidado: 'Remova o lacre antes do primeiro uso.', especificacao: 'PCT composto', linkSecao: 'manutencao' },
    { id: 'ro', nome: 'Membrana RO', x: 0, y: 0.05, z: 0.6, funcao: 'Membrana de osmose reversa de 2º estágio.', uso: 'Troque a cada 12–18 meses ou quando a luz RO avisar.', cuidado: '', especificacao: '0,0001 µm', linkSecao: 'manutencao' },
    { id: 'botao', nome: 'Botão liga/desliga', x: 0, y: -0.6, z: 0.55, funcao: 'Liga, força parada, reinicia após falha e executa o flush.', uso: 'Segure por 5 s para flush; 6 s para resetar filtro.', cuidado: '', especificacao: '', linkSecao: 'uso' },
    { id: 'entrada', nome: 'Entrada de água', x: 0, y: 0.1, z: -0.6, funcao: 'Conexão da alimentação de água da rede.', uso: 'Conecte à água fria, via registro de entrada.', cuidado: 'Pressão de 0,1 a 0,4 MPa.', especificacao: 'Água fria', linkSecao: 'instalacao' },
    { id: 'purewater', nome: 'Saída de água pura', x: 0.22, y: 0.35, z: -0.55, funcao: 'Leva a água purificada até a torneira.', uso: 'Conecte à bica de água pura da torneira.', cuidado: '', especificacao: '', linkSecao: 'instalacao' },
    { id: 'rejeito', nome: 'Saída de rejeito', x: -0.22, y: -0.4, z: -0.55, funcao: 'Descarte da água de rejeito (esgoto).', uso: 'Direcione ao ralo/sifão da pia.', cuidado: '', especificacao: 'Relação ~2:1', linkSecao: 'instalacao' }
  ]
};

export const A9PLUS = {
  slug: 'purificador-osmos-a9plus',
  nome: 'Purificador OSMOS A9Plus',
  modelo: 'A9Plus',
  sku: 'OSMOS-A9PLUS',
  categoria: 'Purificadores por Osmose Reversa',
  keywords: 'a9plus osmose reversa purificador agua ro pct tds filtro membrana bancada compacto 2.6 l/min torneira dupla',
  descricao_curta: 'Purificador compacto de osmose reversa com precisão de 0,0001 µm, display de TDS e torneira dupla eletrônica.',
  imagem_url: '/assets/manuais/a9plus/foto-01-studio.png',
  imagem_alt: 'Purificador de água OSMOS A9Plus com filtros PCT e RO',
  conteudo: A9PLUS_CONTEUDO
};

// Seed idempotente: só insere se o slug ainda não existir.
export async function seedManuais(db) {
  const row = await db.prepare('SELECT id FROM produtos_manual WHERE slug = ?').bind(A9PLUS.slug).first();
  if (row) return;
  await db.prepare(
    `INSERT INTO produtos_manual
       (slug, nome, modelo, sku, categoria, keywords, descricao_curta, imagem_url, imagem_alt, status, ordem, conteudo_json, published_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'publicado', 1, ?, datetime('now'))
     ON CONFLICT(slug) DO NOTHING`
  ).bind(
    A9PLUS.slug, A9PLUS.nome, A9PLUS.modelo, A9PLUS.sku, A9PLUS.categoria,
    A9PLUS.keywords, A9PLUS.descricao_curta, A9PLUS.imagem_url, A9PLUS.imagem_alt,
    JSON.stringify(A9PLUS.conteudo)
  ).run();
}

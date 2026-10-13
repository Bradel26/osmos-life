// =============================================================================
// CONTEÚDO DO PRODUTO — PURIFICADOR OSMOS **S9**
// -----------------------------------------------------------------------------
// Este arquivo contém EXCLUSIVAMENTE o conteúdo técnico do produto S9, extraído
// do seu PRÓPRIO manual de instruções (INSTRUCTION MANUAL_S9 / MANUAL_S9_PTBR
// v0.5 ajustada e harmonizada — cobertura das páginas 1–12 da fonte).
//
// ESTRUTURA ANTECIPADA, SEM MÍDIA PRÓPRIA AINDA (pedido da área):
//   • Nenhuma fotografia nem desenho oficial do S9 foi adicionado — ainda não os
//     temos. `fotos: []`, `imagem_url: ''` e `explorar360` ausente. A página cai
//     automaticamente nos fallbacks GENÉRICOS da estrutura (arte SVG de apoio,
//     sem imagem quebrada). Os `desenhos` usam as ilustrações genéricas de
//     `manuais-estrutura.js` (chave `svg`), claramente rotuladas como apoio.
//   • Quando as imagens de estúdio próprias do S9 chegarem, basta criar
//     `assets/manuais/s9/`, preencher `fotos`/`imagem_url`/`desenhos.imagem_url`
//     e (opcional) `explorar360` — a estrutura visual já está pronta.
//
// IMPORTANTE (regra de arquitetura — ver ARQUITETURA-MANUAIS.md):
//   • Nada aqui é "regra geral" nem foi copiado do A9 PLUS ou do A10S. A fonte de
//     verdade é apenas o manual do S9. Campos ausentes no manual ficam como
//     "Informação não fornecida" / "A definir" — nunca com dados de outro modelo.
//   • O S9 é mais simples que o A10S: possui DOIS estágios (cartucho composto
//     CBPA + membrana de osmose reversa RO), SEM esterilização UV mencionada,
//     torneira MECÂNICA (sem torneira eletrônica inteligente) e SEM códigos de
//     falha E1/E2 — a própria harmonização do manual registra que esses itens do
//     A9 NÃO foram transferidos ao S9.
//   • Onde a fonte traz valores conflitantes ou expressões imprecisas (ex.:
//     enxágue inicial ~30 min na p.2 × 20–30 min na p.7; manutenção 3–6 meses
//     × ciclos CBPA 8–12 / RO 12–24 meses; "proporcionador de água residual
//     excessivamente condutivo"), ambos/as são apresentados de forma
//     transparente, sem harmonização — conforme as notas de revisão do manual.
// =============================================================================

const S9_CONTEUDO = {
  // Sem fotografias próprias ainda — a seção interativa mostra o viewer genérico
  // com a legenda abaixo (modelo3d). NÃO apontar para imagens inexistentes.
  fotos: [],

  visaoGeral: {
    texto: 'O OSMOS S9 é um purificador de água de ponto de uso por osmose reversa (RO). Combina dois estágios de filtração — o cartucho composto CBPA (1º estágio) e a membrana de osmose reversa RO (2º estágio), com precisão de 0,0001 µm — para fornecer água purificada a uma vazão declarada de 1,83 L/min. O painel frontal reúne o botão de energia, a leitura de TDS, a luz indicadora de funcionamento e as luzes de substituição dos cartuchos CBPA e RO. O equipamento é conectado à tubulação de água fria da concessionária, com saídas de água pura e de água residual.',
    caracteristicas: [
      { icone: 'drop', titulo: 'Osmose reversa 0,0001 µm', texto: 'Membrana RO (2º estágio) que retém impurezas e bactérias na superfície da membrana.' },
      { icone: 'filter', titulo: 'Dois estágios: CBPA + RO', texto: 'Cartucho composto CBPA (1º estágio) seguido da membrana de osmose reversa RO (2º estágio).' },
      { icone: 'display', titulo: 'Leitura de TDS', texto: 'O painel exibe o valor de TDS (total de sólidos dissolvidos) da água.' },
      { icone: 'flow', titulo: 'Vazão de 1,83 L/min', texto: 'Vazão de água purificada declarada pelo fabricante para o S9.' },
      { icone: 'refresh', titulo: 'Enxágue e limpeza automáticos', texto: 'Flush automático de ~1 minuto ao iniciar e limpeza automática da membrana RO durante o uso.' },
      { icone: 'filter', titulo: 'Indicadores de troca de filtro', texto: 'Luzes indicadoras avisam quando substituir os cartuchos CBPA e RO.' }
    ],
    destaque: 'Osmose reversa de 0,0001 µm em dois estágios (CBPA + membrana RO), com vazão declarada de 1,83 L/min e leitura de TDS.'
  },

  componentes: [
    { nome: 'Cartucho filtrante CBPA (1º estágio)', descricao: 'Cartucho filtrante composto CBPA, de pré-filtração. É o primeiro estágio do purificador.', ponto: 'cbpa' },
    { nome: 'Cartucho de membrana RO (2º estágio)', descricao: 'Cartucho filtrante de membrana de osmose reversa RO, com precisão de 0,0001 µm. Retém impurezas e bactérias na superfície da membrana.', ponto: 'ro' },
    { nome: 'Luz indicadora de substituição do cartucho CBPA', descricao: 'Sinaliza quando substituir o cartucho CBPA (1º estágio).', ponto: 'luz-cbpa' },
    { nome: 'Luz indicadora de substituição do cartucho RO', descricao: 'Sinaliza quando substituir o cartucho de membrana de osmose reversa RO (2º estágio).', ponto: 'luz-ro' },
    { nome: 'Luz indicadora de funcionamento', descricao: 'Indica que o equipamento está em operação.', ponto: 'funcionamento' },
    { nome: 'Botão de energia (Power Button)', descricao: 'Liga o equipamento e é usado também na reinicialização do indicador após a troca de cartucho.', ponto: 'power' },
    { nome: 'Valor de TDS (visor)', descricao: 'Mostra o valor de TDS (total de sólidos dissolvidos). A indicação aparece na vista frontal e também na vista traseira do equipamento.', ponto: 'tds' },
    { nome: 'Entrada de água concessionária (Water Inlet)', descricao: 'Conexão da alimentação de água fria da rede pública ao equipamento.', ponto: 'inlet' },
    { nome: 'Saída de água pura (Purified Water Outlet)', descricao: 'Leva a água purificada até a torneira de água pura.', ponto: 'pure' },
    { nome: 'Saída de água residual (Waste Water Outlet)', descricao: 'Descarte da água de rejeito do processo de osmose reversa.', ponto: 'waste' },
    { nome: 'Torneira e mangueiras (tubo PE de 1/4)', descricao: 'Torneira conectada por tubo PE de 1/4 e conector rápido reto de 1/4. O estilo da torneira varia conforme o modelo, mas os acessórios de montagem são os mesmos.', ponto: 'torneira' }
  ],

  antesDeInstalar: {
    checklist: [
      'Verifique se as ferramentas e os acessórios necessários estão completos e preparados.',
      'Não conecte o equipamento à eletricidade nem à água antes de concluir a instalação.',
      'Planeje a posição do registro de água da concessionária e verifique o espaço disponível no gabinete.',
      'Utilize a tubulação de água fria da rede pública para o abastecimento.',
      'Instale o equipamento de forma firme, estável e sem inclinação, em local que permita o uso e a manutenção.',
      'Instale um registro de entrada de água antes do purificador (facilita a manutenção e protege contra pressão excessiva).'
    ],
    ferramentas: [
      'Não especificado no manual do S9. A montagem envolve, no mínimo, o furo para a torneira na pia e as conexões de tubo PE de 1/4 com conector rápido reto (ver as etapas de instalação).'
    ],
    requisitos: [
      { rotulo: 'Pressão de entrada', valor: '0,1 MPa a 0,4 MPa' },
      { rotulo: 'Temperatura da água', valor: '5 °C a 38 °C' },
      { rotulo: 'Fonte de água', valor: 'Água fria da concessionária (rede pública)' },
      { rotulo: 'Alimentação elétrica', valor: 'Tomada de alimentação (Power Socket) — tensão não especificada no manual; ver etiqueta do equipamento' }
    ],
    cuidados: [
      'Se a pressão de entrada for superior a 0,4 MPa, instale uma válvula redutora de pressão; se for inferior a 0,1 MPa, instale uma bomba pressurizadora.',
      'Se a água local apresentar turbidez, sedimentos ou outra condição inadequada, instale um pré-filtro de precisão antes do purificador.',
      'Mantenha o equipamento afastado de substâncias fortemente ácidas ou alcalinas, para evitar corrosão.',
      'Evite ambientes de temperatura muito baixa ou muito alta e a exposição direta ao sol. Em clima frio, não instale em área externa; no inverno a produção pode cair (~3% a cada 1 °C a menos).'
    ]
  },

  instalacao: {
    passos: [
      { titulo: 'Etapa 1 — Preparação da instalação', texto: 'Planeje a posição do registro de água da concessionária e verifique o espaço disponível no gabinete. Utilize a tubulação de água fria da rede pública e posicione o equipamento na sua posição normal de instalação. Não conecte eletricidade nem água antes de concluir a instalação.' },
      { titulo: 'Etapa 2 — Seleção da posição da torneira', texto: 'Em geral, escolha o canto esquerdo ou direito da pia, conforme o uso habitual (lavar verduras, enxaguar arroz). Confira os acessórios da torneira: placa de cobertura superior, junta de borracha macia, chapa de cobertura, arruela de trava e porca. Coloque a placa de cobertura superior e a junta de borracha macia e introduza o conjunto pelo furo. Sob a pia, coloque a junta inferior e a arruela de trava, nessa ordem, e aperte com a porca. Atenção: a junta superior é de borracha macia e a inferior é de borracha rígida — não as inverta; aplique força uniforme ao apertar.' },
      { titulo: 'Etapa 3 — Instalação da mangueira da torneira', texto: 'Separe o tubo PE de 1/4, o conector rápido reto de 1/4 e a torneira. Insira firmemente uma extremidade do tubo PE de 1/4 no conector rápido reto de 1/4 e a outra extremidade do conector na conexão da torneira.' },
      { titulo: 'Etapa 4 — Inspeção do resultado da instalação', texto: 'Após conectar todas as mangueiras e confirmar que não há erros, abra o registro para fornecer água e conecte a alimentação elétrica para colocar o equipamento em funcionamento. Observe a proporção de saída de água pura e água residual — em condições normais, é de 2:1. Ao começar a funcionar, o equipamento realiza automaticamente um enxágue de cerca de 1 minuto.' }
    ]
  },

  especificacoes: [
    { rotulo: 'Modelo', valor: 'S9' },
    { rotulo: 'Tecnologia de filtração', valor: 'Osmose reversa (RO) — dois estágios: cartucho composto CBPA + membrana RO' },
    { rotulo: 'Precisão de filtragem', valor: '0,0001 µm' },
    { rotulo: 'Vazão de água purificada', valor: '1,83 L/min' },
    { rotulo: 'Pressão de entrada de água', valor: '0,1 MPa – 0,4 MPa' },
    { rotulo: 'Temperatura aplicável da água', valor: '5 °C – 38 °C' },
    { rotulo: 'Dimensões', valor: '419 × 158 × 381 mm' },
    { rotulo: 'Proporção água pura : água residual', valor: '2 : 1 (declarada; método de medição não informado no manual)' },
    { rotulo: 'Fonte de água aplicável', valor: 'Água fria da concessionária (rede pública)' },
    { rotulo: 'Vida útil usual do equipamento', valor: 'Superior a 3 anos (conforme qualidade da água e cumprimento dos enxágues)' },
    { rotulo: 'Alimentação elétrica', valor: 'Informação não fornecida no manual — ver etiqueta do equipamento' },
    { rotulo: 'Tanque de pressão', valor: 'Informação não fornecida no manual' },
    { rotulo: 'Qualidade da água de saída', valor: 'Conformidade declarada com as Especificações para Equipamentos de Tratamento por Osmose Reversa (2001)' }
  ],

  // Desenhos técnicos: o manual do S9 traz vista frontal, vista traseira e
  // diagrama de instalação, mas AINDA NÃO temos os desenhos oficiais do S9.
  // Usamos as ilustrações GENÉRICAS de apoio da estrutura (chave `svg` →
  // manuais-estrutura.js), claramente rotuladas, com a descrição do que o
  // desenho oficial do S9 mostrará. Sem `imagem_url`/`arquivo_url` (nada falso).
  desenhos: [
    { titulo: 'Vista frontal (ilustração de apoio)', vista: 'frontal', svg: 'frontal', descricao: 'Ilustração genérica de apoio — desenho oficial do S9 a incluir. A vista frontal do S9 identifica: cartucho CBPA, cartucho de membrana RO, luzes de substituição (CBPA e RO), botão de energia, valor de TDS e luz de funcionamento.' },
    { titulo: 'Vista traseira (ilustração de apoio)', vista: 'traseira', svg: 'traseira', descricao: 'Ilustração genérica de apoio — desenho oficial do S9 a incluir. A vista traseira do S9 traz: entrada de água da concessionária, saída de água pura, saída de água residual e o valor de TDS.' },
    { titulo: 'Diagrama de instalação (ilustração de apoio)', vista: 'frontal', svg: 'hidraulico', descricao: 'Ilustração genérica de apoio — diagrama oficial do S9 a incluir. O diagrama do S9 mostra: torneira, tubo PE de água pura, tubo PE de entrada, conexão de três vias de entrada, registro angular de água fria, tubo PE de água residual e a tomada de alimentação elétrica.' }
  ],

  // Dimensões intencionalmente NÃO desmembradas por eixo: o manual informa apenas
  // "419 × 158 × 381 mm", sem rotular altura/largura/profundidade. Para não
  // afirmar um eixo incorreto, a barra de dimensões dos desenhos fica oculta e o
  // valor bruto aparece na ficha de Especificações acima.
  // dimensoes: { ... }  ← preencher quando o eixo de cada medida for confirmado.

  uso: {
    texto: 'O S9 fornece água purificada por osmose reversa. O painel frontal reúne o botão de energia, a leitura de TDS, a luz de funcionamento e as luzes de substituição dos cartuchos CBPA e RO.',
    topicos: [
      'Primeiro acionamento: toque no botão de energia para ligar o equipamento; em seguida, abra a torneira e enxágue por 20–30 minutos (a página de instalação recomenda ~30 minutos).',
      'Enxágue automático: ao começar a funcionar, o equipamento realiza automaticamente um enxágue de cerca de 1 minuto.',
      'Limpeza automática da membrana RO: durante o uso, o equipamento limpa a membrana automaticamente para preservar o desempenho.',
      'Proporção de água: em condições normais, a proporção de água pura para água residual é de 2:1 (observação visual, conforme o fabricante).',
      'Leitura de TDS: o painel exibe o valor de TDS (total de sólidos dissolvidos) da água; a indicação aparece na frente e também na traseira.',
      'Indicadores de troca: as luzes avisam quando substituir os cartuchos CBPA e RO.',
      'Vazão: depende da temperatura, da pressão de entrada, da qualidade da água e da condição do cartucho. A produção cai cerca de 3% a cada 1 °C a menos; no inverno a vazão pode diminuir — descrito como normal pelo fabricante.',
      'Após longa inatividade: desligue a alimentação elétrica e feche o registro de entrada. Antes de voltar a usar, abra a torneira de água pura, descarte a água remanescente e enxágue por 10 minutos.',
      'Água escura ou com espuma no início: após a instalação ou a troca de cartucho, pode sair água escura e espuma (líquido de proteção e pó de carvão ativado). É descrita como normal; a água deve clarear após alguns minutos.'
    ]
  },

  manutencao: {
    texto: 'O momento de troca depende da qualidade local da água. Como referência, o fabricante indica a substituição por cartucho (CBPA e RO) nos intervalos abaixo. Em condição de água inadequada, o manual também recomenda realizar manutenção e substituir o elemento filtrante a cada 3–6 meses. Ambos os valores constam do manual-fonte e são apresentados sem harmonização — avalie no conjunto, conforme a sua água.',
    periodicidade: [
      { rotulo: 'Cartucho CBPA (1º estágio — composto)', valor: '8 a 12 meses' },
      { rotulo: 'Cartucho de membrana RO (2º estágio)', valor: '12 a 24 meses' },
      { rotulo: 'Manutenção / troca em água inadequada', valor: 'A cada 3 a 6 meses (recomendação do manual)' }
    ],
    quandoTrocar: [
      'O sabor da água de saída piora e o TDS da água pura aumenta.',
      'A vazão de água diminui significativamente.',
      'A superfície do cartucho fica coberta por poluentes e sua cor se altera intensamente.'
    ],
    passos: [
      'Feche o registro de entrada na conexão de três vias e abra a torneira de água pura para esvaziar a água remanescente no equipamento.',
      'Desconecte o cabo de alimentação elétrica.',
      'Gire o cartucho no sentido anti-horário, puxe-o para fora e substitua-o por um novo. O método para o cartucho de membrana de osmose reversa RO é o mesmo.',
      'Reconecte o cabo de alimentação, abra o registro de entrada e, em seguida, abra a torneira da cozinha; a água sairá após alguns segundos. Cartucho CBPA: deixe a água escoar por ~10 minutos (pode sair pó de carvão e escurecer a água; aguarde clarear). Cartucho RO: pressione o botão de energia e enxágue por 30 minutos.',
      'Verifique se há vazamento na unidade principal. Se não houver, a troca está concluída.',
      'Após substituir o cartucho, mantenha pressionado o botão de energia até ouvir um sinal sonoro e solte-o; desconecte e reconecte a alimentação elétrica — a luz indicadora retornará à cor branca normal.'
    ],
    reset: 'Para reiniciar o indicador após a troca: mantenha pressionado o botão de energia até o sinal sonoro, solte-o e, em seguida, desconecte e reconecte a alimentação elétrica — a luz volta à cor branca normal. O manual não detalha a seleção individual de CBPA/RO.'
  },

  // 21 pares de causa × ação, em 5 sintomas (páginas 10 da fonte). Observação:
  // muitas ações são de ASSISTÊNCIA TÉCNICA (medir/substituir válvulas,
  // interruptores, bomba, transformador, "caixa do computador"). A fonte não
  // distingue usuário de assistência — ver a dica sobre acionamento do SAC.
  troubleshooting: [
    { problema: 'O equipamento não liga', causa: 'A alimentação elétrica não está conectada.', solucao: 'Verifique a alimentação elétrica ou o plugue.' },
    { problema: 'O equipamento não liga', causa: 'Baixa pressão da água de alimentação ou interrupção do abastecimento.', solucao: 'Verifique a pressão da água de alimentação.' },
    { problema: 'O equipamento não liga', causa: 'Falha do interruptor de baixa tensão, impossibilitando conectar a alimentação.', solucao: 'Após conectar a água de alimentação, meça a resistência do interruptor e substitua-o.' },
    { problema: 'O equipamento não liga', causa: 'O interruptor de alta tensão não pode ser rearmado.', solucao: 'Após liberar a pressão, meça a resistência do interruptor e substitua-o.' },
    { problema: 'O equipamento não liga', causa: 'Transformador queimado.', solucao: 'Meça a tensão de saída e substitua o transformador.' },
    { problema: 'O equipamento não liga', causa: 'A caixa do computador não tem tensão de saída.', solucao: 'Meça a tensão de saída e substitua a caixa do computador.' },
    { problema: 'A bomba de alta pressão funciona, mas não produz água', causa: 'A bomba de alta pressão perde pressão.', solucao: 'Meça a pressão de saída da bomba de água e substitua-a.' },
    { problema: 'A bomba de alta pressão funciona, mas não produz água', causa: 'A válvula solenoide de entrada apresenta falha e não permite entrada de água (sem água pura nem água residual).', solucao: 'Substitua a válvula solenoide de entrada.' },
    { problema: 'A bomba de alta pressão funciona, mas não produz água', causa: 'Pré-filtro obstruído.', solucao: 'Observe a água pura e a água residual; substitua o elemento do pré-filtro.' },
    { problema: 'A bomba de alta pressão funciona, mas não produz água', causa: 'Válvula de retenção obstruída (há água residual, mas não há água pura).', solucao: 'Substitua a válvula de retenção.' },
    { problema: 'A bomba de alta pressão funciona, mas não produz água', causa: 'A válvula solenoide de enxágue automático não fecha efetivamente; permanece em enxágue, com muita água residual.', solucao: 'Observe a vazão de água residual e substitua a válvula solenoide de enxágue automático.' },
    { problema: 'A bomba de alta pressão funciona, mas não produz água', causa: 'Membrana RO obstruída.', solucao: 'Limpe ou substitua a membrana RO.' },
    { problema: 'O equipamento está desligado, mas a água residual continua fluindo', causa: 'Falha da válvula eletromagnética, que não interrompe efetivamente o fornecimento de água.', solucao: 'Observe a água residual e substitua a válvula solenoide de entrada.' },
    { problema: 'O equipamento está desligado, mas a água residual continua fluindo', causa: 'Alívio de pressão na válvula de retenção, com baixa vazão de água residual.', solucao: 'Observe a água residual e substitua a válvula de retenção.' },
    { problema: 'Após o enchimento de água, o equipamento liga e desliga repetidamente', causa: 'Alívio de pressão na válvula de retenção.', solucao: 'Substitua a válvula de retenção.' },
    { problema: 'Após o enchimento de água, o equipamento liga e desliga repetidamente', causa: 'Falha do interruptor de alta tensão.', solucao: 'Substitua o interruptor de alta tensão.' },
    { problema: 'Após o enchimento de água, o equipamento liga e desliga repetidamente', causa: 'Há um fenômeno de alívio de pressão no sistema.', solucao: 'Verifique a tubulação de água pura após a válvula de retenção.' },
    { problema: 'Vazão insuficiente de água pura', causa: 'Pré-filtro obstruído.', solucao: 'Substitua o elemento do pré-filtro.' },
    { problema: 'Vazão insuficiente de água pura', causa: 'Membrana RO obstruída.', solucao: 'Limpe ou substitua a membrana RO.' },
    { problema: 'Vazão insuficiente de água pura', causa: 'O proporcionador de água residual está excessivamente condutivo (expressão imprecisa da fonte; confirmar o significado da falha).', solucao: 'Substitua o proporcionador de água residual. (A fonte indica "Replacing wastewater ratio"; confirmar peça e ação com o fabricante.)' },
    { problema: 'Vazão insuficiente de água pura', causa: 'Pressão insuficiente da bomba de alta pressão.', solucao: 'Meça a pressão de saída da bomba de água e substitua-a.' }
  ],

  faq: [
    { categoria: 'Instalação', pergunta: 'Qual a pressão de entrada necessária?', resposta: 'Entre 0,1 MPa e 0,4 MPa. Acima disso, instale uma válvula redutora de pressão; abaixo, uma bomba pressurizadora para assegurar o funcionamento normal.' },
    { categoria: 'Instalação', pergunta: 'Posso ligar o S9 na água quente?', resposta: 'Não. Utilize a tubulação de água fria da concessionária (rede pública). A temperatura de água aplicável é de 5 °C a 38 °C.' },
    { categoria: 'Instalação', pergunta: 'Preciso de pré-filtro?', resposta: 'Se a água local apresentar turbidez, sedimentos ou outra condição inadequada, instale um pré-filtro de precisão antes do purificador. Ele retém partículas maiores e ajuda a proteger o equipamento e a prolongar a vida útil.' },
    { categoria: 'Instalação', pergunta: 'Preciso de um registro na entrada?', resposta: 'Sim, recomenda-se instalar um registro de entrada antes do purificador. Ele permite interromper o abastecimento na manutenção e protege os componentes contra pressão excessiva. Feche-o em períodos longos sem uso.' },
    { categoria: 'Funcionamento', pergunta: 'Por que sai água escura ou com espuma nas primeiras utilizações?', resposta: 'É normal após a instalação ou a troca de cartucho, por causa do líquido de proteção e do pó de carvão ativado. Faça o enxágue inicial (~30 minutos na instalação; 20–30 minutos no primeiro acionamento); a água deve ficar transparente em seguida.' },
    { categoria: 'Funcionamento', pergunta: 'O que significa o valor de TDS no painel?', resposta: 'TDS é o total de sólidos dissolvidos na água. O painel exibe esse valor; a indicação aparece na vista frontal e também na traseira do equipamento.' },
    { categoria: 'Funcionamento', pergunta: 'Qual é a vazão de água do S9?', resposta: 'A vazão de água purificada declarada é de 1,83 L/min. Ela depende da temperatura, da pressão, da qualidade da água e da condição do cartucho — cai cerca de 3% a cada 1 °C a menos, podendo diminuir no inverno.' },
    { categoria: 'Funcionamento', pergunta: 'Qual a proporção entre água pura e água residual?', resposta: 'Em condições normais, a proporção de água pura para água residual é de 2:1 (observação visual declarada pelo fabricante). O manual não informa o método de medição.' },
    { categoria: 'Manutenção', pergunta: 'De quanto em quanto tempo troco os cartuchos?', resposta: 'Como referência: cartucho CBPA (1º estágio) a cada 8–12 meses e membrana RO (2º estágio) a cada 12–24 meses, conforme a qualidade da água. Em água inadequada, o manual também recomenda manutenção/troca a cada 3–6 meses.' },
    { categoria: 'Manutenção', pergunta: 'Como reinicio o indicador após trocar o cartucho?', resposta: 'Mantenha pressionado o botão de energia até ouvir um sinal sonoro, solte-o e, em seguida, desconecte e reconecte a alimentação elétrica — a luz indicadora retorna à cor branca normal.' },
    { categoria: 'Utilização', pergunta: 'O equipamento não liga. O que verifico primeiro?', resposta: 'Verifique a alimentação elétrica/o plugue e a pressão da água de alimentação. As demais causas (interruptores de tensão, transformador, caixa do computador) envolvem medição e troca de componentes — acione a assistência técnica (SAC).' },
    { categoria: 'Utilização', pergunta: 'Fiquei muito tempo sem usar. O que faço antes de voltar a usar?', resposta: 'Antes de reutilizar, abra a torneira de água pura, descarte a água remanescente no equipamento e realize o enxágue por 10 minutos.' },
    { categoria: 'Especificações', pergunta: 'O S9 tem esterilização por UV?', resposta: 'O manual do S9 não menciona esterilização por ultravioleta. Ele descreve dois estágios de filtração (cartucho composto CBPA e membrana de osmose reversa RO) com precisão de 0,0001 µm.' },
    { categoria: 'Especificações', pergunta: 'Quais são as dimensões do S9?', resposta: 'As dimensões informadas são 419 × 158 × 381 mm. O manual não detalha qual medida corresponde a altura, largura e profundidade.' },
    { categoria: 'Segurança', pergunta: 'Quando devo desligar o equipamento imediatamente?', resposta: 'Em caso de vazamento de água nas tubulações/componentes, perda de função de componentes, fuga de corrente elétrica ou qualquer outra anormalidade: desligue imediatamente a alimentação elétrica ou feche o registro de entrada e providencie o reparo.' }
  ],

  garantia: {
    prazo: 'Consulte o cartão/termo de garantia do produto',
    texto: 'O manual orienta preencher cuidadosamente o cartão de garantia que acompanha o produto e guardá-lo como comprovante. O prazo e as condições de cobertura não são especificados no manual fornecido; consulte o cartão de garantia do produto ou o SAC OSMOS para confirmar a cobertura e solicitar assistência.',
    condicoes: []
  },

  dicas: [
    { tipo: 'importante', titulo: 'Instale um registro na entrada', texto: 'Instale um registro de entrada antes do purificador para interromper o abastecimento durante a manutenção e proteger os componentes internos contra pressão excessiva. Feche-o quando o equipamento ficar sem uso por longos períodos.' },
    { tipo: 'atencao', titulo: 'Use água fria da concessionária', texto: 'Conecte o S9 à tubulação de água fria da rede pública. Temperatura aplicável: 5 °C a 38 °C. Fonte inadequada compromete o funcionamento e a vida dos cartuchos.' },
    { tipo: 'dica', titulo: 'Faça o enxágue inicial', texto: 'Após instalar, enxágue por cerca de 30 minutos (20–30 minutos no primeiro acionamento). Água escura e espuma iniciais são normais e devem clarear em alguns minutos.' },
    { tipo: 'atencao', titulo: 'Ajuste a pressão de entrada', texto: 'Mantenha a pressão entre 0,1 e 0,4 MPa. Acima disso, use válvula redutora; abaixo, bomba pressurizadora. Se a água tiver turbidez ou sedimentos, instale um pré-filtro.' },
    { tipo: 'nao-recomendado', titulo: 'Não energize antes de concluir', texto: 'Nunca conecte energia ou água antes de finalizar todas as conexões. Evite substâncias fortemente ácidas/alcalinas, exposição ao sol direto e instalação externa em clima frio.' },
    { tipo: 'importante', titulo: 'Reparos elétricos/hidráulicos: acione o SAC', texto: 'Várias ações da tabela de solução de problemas envolvem medir e substituir componentes (válvulas solenoides, válvula de retenção, interruptores de tensão, bomba de alta pressão, transformador, caixa do computador). Em caso de vazamento, perda de função ou fuga de corrente, desligue a energia ou feche o registro e acione a assistência técnica OSMOS.' }
  ],

  // Reconstrução 3D / 360° interativa NÃO ativada para o S9 (sem fotos de
  // estúdio próprias ainda). Mantido por compatibilidade de schema; a seção
  // exibe o viewer genérico com a legenda abaixo.
  modelo3d: {
    tipo: 'generico',
    legenda: 'A galeria de fotos e o giro 360° interativo do S9 serão habilitados quando as fotografias de estúdio próprias do produto forem adicionadas. Por ora, consulte os desenhos técnicos (ilustrações de apoio) e as especificações abaixo.'
  },
  hotspots: []
};

export const S9 = {
  slug: 'purificador-osmos-s9',
  nome: 'Purificador OSMOS S9',
  modelo: 'S9',
  sku: 'OSMOS-S9',
  categoria: 'Purificadores por Osmose Reversa',
  keywords: 's9 osmose reversa purificador agua ro cbpa tds filtro membrana cartucho ponto de uso 0,0001 micrometro 1,83 l/min agua pura agua residual',
  descricao_curta: 'Purificador de ponto de uso por osmose reversa (0,0001 µm) em dois estágios — cartucho CBPA e membrana RO — com vazão declarada de 1,83 L/min e leitura de TDS.',
  // Sem imagem de card própria ainda — fica vazio para a estrutura usar a arte
  // genérica de fallback (sem imagem quebrada). Preencher com /assets/manuais/s9/card.jpg.
  imagem_url: '',
  imagem_alt: 'Purificador de água OSMOS S9',
  conteudo: S9_CONTEUDO
};

// Seed idempotente: só insere o S9 se o slug ainda não existir, preservando
// edições feitas no painel admin em deploys futuros. Produto independente do
// A9 PLUS e do A10S (linha própria).
export async function seedS9(db) {
  const row = await db.prepare('SELECT id FROM produtos_manual WHERE slug = ?').bind(S9.slug).first();
  if (row) return;
  await db.prepare(
    `INSERT INTO produtos_manual
       (slug, nome, modelo, sku, categoria, keywords, descricao_curta, imagem_url, imagem_alt, status, ordem, conteudo_json, published_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'publicado', 3, ?, datetime('now'))
     ON CONFLICT(slug) DO NOTHING`
  ).bind(
    S9.slug, S9.nome, S9.modelo, S9.sku, S9.categoria,
    S9.keywords, S9.descricao_curta, S9.imagem_url, S9.imagem_alt,
    JSON.stringify(S9.conteudo)
  ).run();
}

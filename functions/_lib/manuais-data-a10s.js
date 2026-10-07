// =============================================================================
// CONTEÚDO DO PRODUTO — PURIFICADOR OSMOS **A10S**
// -----------------------------------------------------------------------------
// Este arquivo contém EXCLUSIVAMENTE o conteúdo técnico do produto A10S,
// extraído do seu PRÓPRIO manual de instruções (MANUAL_A10S_PTBR). Modelos
// A10S-600 / A10S-800, modelo comercial A10S. Filtros CBPA (1º estágio PP+AC)
// e ROCB (2º estágio — membrana RO + carvão), com esterilização UV.
//
// IMPORTANTE (regra de arquitetura — ver ARQUITETURA-MANUAIS.md):
//   • Nada aqui é "regra geral" nem foi copiado do A9 PLUS. A fonte de verdade
//     é apenas o manual do A10S. Campos ausentes no manual ficam como
//     "Informação não fornecida" / "A definir" — nunca com dados de outro modelo.
//   • Onde o manual-fonte traz valores conflitantes (ex.: temperatura 5–38 °C
//     na p.2 e 5–45 °C na tabela da p.3; manutenção geral 3–6 meses × troca de
//     filtros 8–12/12–24 meses), ambos são apresentados de forma transparente,
//     sem harmonização — conforme as notas de revisão do próprio manual.
//   • O 360° interativo NÃO é ativado: a malha de reconstrução em product360.js
//     é da carcaça do A9 PLUS. O A10S (corpo cilíndrico alto, dois cartuchos
//     lado a lado) precisa do seu próprio perfil; até lá, mostra-se a galeria
//     de fotografias de referência (comportamento correto).
// =============================================================================

const BASE = '/assets/manuais/a10s';

const A10S_CONTEUDO = {
  fotoComponentes: `${BASE}/frente.png`,

  // Fotografias de referência (galeria). Como não são as 4 fotos de estúdio
  // ortogonais nomeadas foto-01..05-studio, a seção exibe a galeria (sem 360°).
  fotos: [
    { url: `${BASE}/frente.png`, alt: 'Vista frontal do A10S: corpo cilíndrico, cúpula superior e faixa rosé' },
    { url: `${BASE}/lateral-direita.png`, alt: 'Vista lateral direita do purificador A10S' },
    { url: `${BASE}/tras.png`, alt: 'Vista traseira do purificador A10S' },
    { url: `${BASE}/lateral-esquerda.png`, alt: 'Vista lateral esquerda do purificador A10S' },
    { url: `${BASE}/superior.png`, alt: 'Vista superior: painel de controle e tampas dos filtros CBPA e ROCB' },
    { url: `${BASE}/display.png`, alt: 'Painel de controle: Inlet/Outlet TDS, Select, Reset, Rinse, Filter Life, CBPA e ROCB' },
    { url: `${BASE}/conectores.png`, alt: 'Conexões: Water Inlet, Waste Water, Kitchen Water, Pure Water, DC e Smart Faucet' }
  ],

  visaoGeral: {
    texto: 'O OSMOS A10S é um purificador de água de ponto de uso por osmose reversa (modelos A10S-600 e A10S-800), de fluxo direto e sem tanque de pressão. Combina dois estágios de filtração — o filtro composto CBPA (PP+AC) e a membrana ROCB (osmose reversa com carvão pós-filtração), com precisão de 0,0001 µm — a uma etapa de esterilização ultravioleta (UV). O painel superior traz duplo monitoramento de TDS (entrada e saída) e os controles Select, Reset e Flush/Rinse, acompanhando a torneira eletrônica inteligente de água pura e água da cozinha.',
    caracteristicas: [
      { icone: 'drop', titulo: 'Osmose reversa 0,0001 µm', texto: 'Membrana ROCB que retém vírus, bactérias, metais pesados e sais dissolvidos.' },
      { icone: 'shield', titulo: 'Esterilização UV', texto: 'Etapa ultravioleta reforça a segurança microbiológica da água de consumo.' },
      { icone: 'filter', titulo: 'Dois estágios: CBPA + ROCB', texto: 'Pré-filtro composto PP+AC seguido da membrana RO com carvão ativado.' },
      { icone: 'display', titulo: 'Duplo TDS (entrada e saída)', texto: 'O painel mostra o TDS de entrada e o TDS da água purificada (Outlet TDS).' },
      { icone: 'flow', titulo: 'Alta produção 600G / 800G', texto: 'Fluxo direto, sem tanque de pressão, para água pura no ponto de uso.' },
      { icone: 'refresh', titulo: 'Enxágue automático (Flush)', texto: 'Enxágues da membrana ajudam a evitar obstruções e a prolongar a vida útil.' }
    ],
    destaque: 'Osmose reversa de fluxo direto com esterilização UV e duplo monitoramento de TDS (entrada e saída).'
  },

  componentes: [
    { nome: 'Filtro CBPA (1º estágio)', descricao: 'Filtro composto PP+AC. Retém partículas maiores, lodo, coloides e materiais em suspensão e absorve odores, cor, matéria orgânica e alguns metais pesados.', ponto: 'cbpa' },
    { nome: 'Filtro ROCB (2º estágio)', descricao: 'Membrana de osmose reversa com carvão ativado de pós-filtração. Precisão de 0,0001 µm; remove bactérias, vírus, metais pesados e demais impurezas dissolvidas.', ponto: 'rocb' },
    { nome: 'Esterilizador UV', descricao: 'Etapa de esterilização ultravioleta que reforça a desinfecção e torna a água de consumo mais segura.', ponto: 'uv' },
    { nome: 'Painel de controle superior', descricao: 'Botões Select, Reset e Flush/Rinse, indicador Filter Life e luzes CBPA e ROCB, com a identificação Smart Faucet.', ponto: 'painel' },
    { nome: 'Duplo visor de TDS', descricao: 'Mostra o Inlet TDS (entrada) e o Outlet TDS (água purificada). TDS = total de sólidos dissolvidos.', ponto: 'tds' },
    { nome: 'Entrada de água (Water Inlet)', descricao: 'Conexão da alimentação de água fria da concessionária ao equipamento.', ponto: 'inlet' },
    { nome: 'Saída de água residual (Waste Water)', descricao: 'Descarte da água de rejeito. Mantenha a mangueira de dreno desobstruída, sem válvulas.', ponto: 'waste' },
    { nome: 'Água da cozinha (Kitchen Water)', descricao: 'Saída para a bica de água da cozinha da torneira dupla.', ponto: 'kitchen' },
    { nome: 'Saída de água pura (Pure Water)', descricao: 'Leva a água purificada até a bica de água pura da torneira.', ponto: 'pure' },
    { nome: 'Interface DC', descricao: 'Conexão elétrica da fonte de alimentação da unidade principal.', ponto: 'dc' },
    { nome: 'Interface da torneira inteligente (Smart Faucet)', descricao: 'Conexão do cabo de alimentação e dados da torneira eletrônica inteligente.', ponto: 'faucet' },
    { nome: 'Torneira eletrônica inteligente', descricao: 'Indica produção (luz branca) e falha (luz vermelha), mostra o TDS e sinaliza o vencimento dos filtros CBPA e ROCB.', ponto: 'torneira' }
  ],

  antesDeInstalar: {
    checklist: [
      'Confirme se todas as ferramentas e acessórios necessários estão disponíveis.',
      'Não conecte a energia elétrica nem a água antes de concluir a instalação.',
      'Use a tubulação de água fria da concessionária (rede municipal).',
      'Instale o equipamento de forma firme, estável e sem inclinação.',
      'Mantenha a mangueira de drenagem desobstruída — não a bloqueie nem instale válvulas nela.',
      'Mantenha o equipamento em local pouco acessível a crianças, reduzindo risco de colisões ou tombamento.'
    ],
    ferramentas: [
      'Furadeira de impacto com brocas M6 e M22 (e broca de 25 mm para o furo da torneira)',
      'Chaves de 16 mm, 14 mm e 12 mm',
      'Frasco de cola para a mangueira',
      'Chave Phillips e chave de fenda',
      'Rolo de fita e fita veda-rosca (Teflon)',
      'Alicate de bico fino e tesoura'
    ],
    requisitos: [
      { rotulo: 'Pressão de entrada', valor: '0,1 a 0,4 MPa' },
      { rotulo: 'Temperatura da água', valor: '5 °C a 38 °C (uso recomendado)' },
      { rotulo: 'Fonte de água', valor: 'Água da concessionária (rede municipal)' },
      { rotulo: 'Alimentação elétrica', valor: 'DC 24 V — 4 A máx. (96 W) — etiqueta do produto' }
    ],
    cuidados: [
      'Se a pressão for superior a 0,4 MPa, instale uma válvula redutora de pressão; se for inferior a 0,1 MPa, instale uma bomba pressurizadora.',
      'Se a água local tiver turbidez ou sedimentos, instale um pré-filtro antes do purificador.',
      'Não deixe o equipamento próximo de substâncias fortemente ácidas ou alcalinas (risco de corrosão).',
      'Evite temperaturas muito baixas/altas e exposição direta ao sol. No inverno, a vazão pode cair (~3% a cada 1 °C a menos).'
    ]
  },

  instalacao: {
    passos: [
      { titulo: 'Preparação', texto: 'Confirme a posição do registro de água da concessionária e organize o espaço do gabinete. Use a tubulação de água fria e posicione o equipamento de forma estável. Não conecte energia nem água antes de concluir a instalação.' },
      { titulo: 'Instale o T de entrada de água', texto: 'Feche o registro de entrada e desconecte a mangueira da torneira original. Monte o T de entrada e o conversor sob a pia, conferindo os anéis de vedação (pretos ou brancos). Uma conexão vai para o tubo trançado da torneira original; a outra, para a alimentação do purificador.' },
      { titulo: 'Instale a torneira', texto: 'Escolha o canto esquerdo ou direito da pia conforme o uso habitual. A instalação requer furo de 25 mm — se não houver, faça um com broca de 25 mm. Monte a torneira, fixe-a com a tampa inferior e conecte o cabo da torneira eletrônica inteligente à interface do equipamento.' },
      { titulo: 'Conecte o equipamento (traseira)', texto: 'Identifique as conexões: Water Inlet (entrada), Waste Water (residual), Kitchen Water (cozinha), Pure Water (pura), DC e Smart Faucet. Antes de remover os tampões brancos, retire o pino/presilha de retenção, pressione o anel atrás do tampão e puxe-o para fora. Conecte cada mangueira PE ao bocal correspondente — a mangueira azul à água pura e a branca conforme o painel.' },
      { titulo: 'Conecte a água residual', texto: 'Ligue a saída Waste Water diretamente à tubulação de esgoto. Se não for possível inserir a mangueira na tubulação existente, faça um furo de 7 mm, instale a vedação de água residual fornecida e encaixe a mangueira. Mantenha o dreno sempre desobstruído.' },
      { titulo: 'Primeiro enxágue (30 minutos)', texto: 'Conecte a energia e abra o registro de entrada. Realize o primeiro enxágue por 30 minutos — alguns modelos o fazem automaticamente; caso contrário, pressione o botão de enxágue (Flush/Rinse). É normal sair água escura/acinzentada e espuma no início (líquido de proteção e pó de carvão). Depois, o equipamento está pronto para uso.' }
    ]
  },

  especificacoes: [
    { rotulo: 'Modelo comercial', valor: 'A10S' },
    { rotulo: 'Modelos', valor: 'A10S-600 / A10S-800' },
    { rotulo: 'Tecnologia de filtração', valor: 'Osmose reversa (RO) + esterilização UV' },
    { rotulo: 'Precisão de filtração', valor: '0,0001 µm' },
    { rotulo: 'Vazão / capacidade de água purificada', valor: '600G / 800G' },
    { rotulo: 'Estágios de filtração', valor: 'CBPA (PP+AC) + ROCB (membrana RO com carvão)' },
    { rotulo: 'Pressão de entrada de água', valor: '0,1 MPa – 0,4 MPa' },
    { rotulo: 'Temperatura da água aplicável', valor: '5 °C – 45 °C (tabela técnica); uso recomendado 5 °C – 38 °C' },
    { rotulo: 'Fonte de água aplicável', valor: 'Água da concessionária (municipal)' },
    { rotulo: 'Tanque de pressão', valor: 'Não possui (fluxo direto)' },
    { rotulo: 'Peso total', valor: 'Aproximadamente 12 kg' },
    { rotulo: 'Dimensões', valor: '381 × 165 × 435 mm' },
    { rotulo: 'Vida útil usual do equipamento', valor: 'Superior a 3 anos (conforme qualidade da água e enxágues)' },
    { rotulo: 'Alimentação elétrica', valor: 'DC 24 V — 4 A máx. (96 W) — etiqueta do produto' },
    { rotulo: 'Qualidade da água de saída', valor: 'Atende à especificação de equipamentos de tratamento por osmose reversa (2001)' }
  ],

  desenhos: [
    { titulo: 'Vista explodida', vista: 'frontal', descricao: 'Filtros CBPA (1º estágio) e ROCB (2º estágio), suas tampas e os anéis de vedação, e as duas baias de encaixe no topo.', imagem_url: `${BASE}/diagrama-explodido.png`, arquivo_url: `${BASE}/diagrama-explodido.png` },
    { titulo: 'Vista frontal técnica', vista: 'frontal', descricao: 'Corpo e painel de conexões inferior: Water Inlet, Waste Water, Kitchen Water, Pure Water, DC e Reset/Flush.', imagem_url: `${BASE}/desenho-frontal.png`, arquivo_url: `${BASE}/desenho-frontal.png` },
    { titulo: 'Painel superior', vista: 'frontal', descricao: 'Controles Flush, Reset e Smart Faucet, indicador Filter Life, Outlet TDS, DC e as tampas dos filtros CBPA e ROCB.', imagem_url: `${BASE}/desenho-painel-superior.png`, arquivo_url: `${BASE}/desenho-painel-superior.png` },
    { titulo: 'Vista lateral com etiqueta', vista: 'lateral', descricao: 'Perfil do equipamento com a etiqueta técnica (sistema RO de fluxo direto, entrada DC e pressão de trabalho).', imagem_url: `${BASE}/desenho-lateral-etiqueta.png`, arquivo_url: `${BASE}/desenho-lateral-etiqueta.png` },
    { titulo: 'Vista lateral', vista: 'lateral', descricao: 'Perfil com as tampas dos filtros, o corpo e o bocal de conexão lateral.', imagem_url: `${BASE}/desenho-lateral.png`, arquivo_url: `${BASE}/desenho-lateral.png` },
    { titulo: 'Silhueta frontal', vista: 'frontal', descricao: 'Silhueta do equipamento (corpo cilíndrico com cúpula superior).', imagem_url: `${BASE}/desenho-silhueta.png`, arquivo_url: `${BASE}/desenho-silhueta.png` },
    { titulo: 'Cartucho CBPA (1º estágio)', vista: 'frontal', descricao: 'Elemento filtrante composto CBPA (PP+AC) de pré-filtração.', imagem_url: `${BASE}/cartucho-cbpa.png`, arquivo_url: `${BASE}/cartucho-cbpa.png` },
    { titulo: 'Cartucho ROCB (2º estágio)', vista: 'frontal', descricao: 'Membrana de osmose reversa com carvão ativado de pós-filtração.', imagem_url: `${BASE}/cartucho-rocb.png`, arquivo_url: `${BASE}/cartucho-rocb.png` }
  ],

  // Altura = maior dimensão (435 mm); demais eixos conforme a tabela do manual
  // (381 × 165 × 435 mm). Ordem exata dos eixos não detalhada no manual-fonte.
  dimensoes: { altura: '435 mm', largura: '381 mm', profundidade: '165 mm' },

  uso: {
    texto: 'O A10S é um purificador de fluxo direto. A torneira eletrônica inteligente alterna entre água da cozinha e água pura e exibe o TDS; o painel superior reúne os controles e os indicadores de vida útil dos filtros.',
    topicos: [
      'Água da cozinha × água pura: acione a torneira para frente e para trás. Com as conexões corretas, a posição para frente fornece água da cozinha e a posição para trás fornece água pura.',
      'Indicador de água pura: quando o visor de TDS acende, a saída é de água pura; caso contrário, sai água da cozinha.',
      'Indicadores da torneira: produção de água = luz branca acesa; falha = luz vermelha acesa; o visor mostra o valor de TDS.',
      'Luzes CBPA e ROCB: a luz vermelha indica o vencimento do respectivo filtro (CBPA ou ROCB).',
      'Enxágue da membrana: ao iniciar a produção, a válvula solenoide de água residual faz um enxágue de ~18 segundos na superfície da membrana, evitando obstruções.',
      'Interruptor de alta pressão: quando a via hidráulica enche e a pressão interna sobe, o circuito de alta pressão é desconectado e o equipamento para automaticamente.',
      'Enxágue inicial / após inatividade: após longo período desligado, descarte a água remanescente e enxágue por cerca de 10 minutos antes de voltar a usar.',
      'Falha E1 (vazamento) e E2 (produção prolongada / erro elétrico) aparecem no visor da torneira — ver Solução de problemas.'
    ]
  },

  manutencao: {
    texto: 'O momento de troca depende da qualidade local da água. O manual recomenda, como referência geral, manutenção e inspeção dos elementos a cada 3 a 6 meses; e, por elemento, os intervalos de troca do CBPA e do ROCB indicados abaixo. Os dois valores constam do manual-fonte e são apresentados sem harmonização — avalie no conjunto, conforme a sua água.',
    periodicidade: [
      { rotulo: 'Filtro CBPA (1º estágio — PP+AC)', valor: '8 a 12 meses' },
      { rotulo: 'Filtro ROCB (2º estágio — RO + carvão)', valor: '12 a 24 meses' },
      { rotulo: 'Manutenção / inspeção geral', valor: 'A cada 3 a 6 meses (recomendação do manual)' }
    ],
    quandoTrocar: [
      'Queda na qualidade e no sabor da água de saída e aumento do TDS da água purificada.',
      'Redução significativa da vazão de água de saída.',
      'Superfície do filtro coberta por contaminantes ou com forte alteração de cor.'
    ],
    passos: [
      'Feche o registro de entrada de água (no T) e abra a torneira do purificador para drenar a água remanescente.',
      'Desconecte o cabo de alimentação da tela indicadora LCD.',
      'Gire o elemento filtrante no sentido anti-horário, retire-o e substitua-o por um novo (mesmo método para a membrana ROCB).',
      'Reconecte o cabo do monitor LCD e abra o registro de entrada. Pressione "Select" para selecionar o filtro substituído (o indicador piscará).',
      'Mantenha "Reset" pressionado por 6 segundos, até a luz voltar à cor azul. Abra a torneira da cozinha; a água será drenada após alguns segundos.',
      'Filtro CBPA: deixe a água escoar por 10 minutos (pode liberar pó de carvão, deixando a água ligeiramente escura no início).',
      'Filtro ROCB: pressione o botão "Flush" e enxágue por 30 minutos.',
      'Verifique se há vazamentos na unidade principal. Após 10 minutos, feche a torneira do purificador — a troca está concluída.'
    ],
    reset: 'Para reiniciar o indicador de vida útil: pressione "Select" para escolher o filtro trocado (CBPA ou ROCB) e segure "Reset" por 6 segundos, até a luz voltar à cor azul.'
  },

  troubleshooting: [
    { problema: 'Falha E1 (vazamento)', causa: 'E1 no visor da torneira e indicador de falha piscando em vermelho — vazamento detectado', solucao: 'Verifique a existência de vazamentos ao redor do equipamento e contate o atendimento ao cliente (SAC).' },
    { problema: 'Falha E2 (produção prolongada / erro elétrico)', causa: 'E2 no visor da torneira e indicador de falha aceso em branco — produção de água por período excessivo ou pequeno erro elétrico', solucao: 'Desconecte o cabo de alimentação do equipamento por alguns segundos e conecte-o novamente.' },
    { problema: 'Vazamento nas conexões rápidas traseiras', causa: 'Tubos PE/PEX inseridos de forma incompleta', solucao: 'Reinsira o tubo firmemente, até o batente da conexão rápida.' },
    { problema: 'Vazamento nas conexões rápidas traseiras', causa: 'Instalação incorreta ou tubo conectado em ângulo acentuado', solucao: 'Refaça a conexão deixando o tubo alinhado, sem curvas acentuadas junto ao bocal.' },
    { problema: 'Vazamento nas conexões rápidas traseiras', causa: 'Remoção incorreta dos tampões das conexões', solucao: 'Confirme que o pino/presilha e o tampão branco foram removidos corretamente; se o vazamento persistir, acione o SAC.' },
    { problema: 'Vazamento nas conexões de entrada (sob a pia)', causa: 'Rosca sem vedação suficiente', solucao: 'Aplique a fita de Teflon fornecida ao redor das conexões de entrada e verifique novamente; se persistir, solicite suporte técnico.' },
    { problema: 'Água escura, acinzentada ou com espuma no início', causa: 'Líquido de proteção e pó de carvão ativado do elemento filtrante (equipamento novo ou filtro recém-trocado)', solucao: 'Faça o enxágue inicial de ~30 minutos; a água deve ficar transparente após alguns minutos.' },
    { problema: 'Vazão de água reduzida', causa: 'Temperatura baixa, pressão insuficiente, água de pior qualidade ou filtros obstruídos', solucao: 'Verifique a pressão e a temperatura (queda de ~3% por °C); instale bomba pressurizadora se a pressão for baixa e avalie a troca dos filtros.' }
  ],

  faq: [
    { categoria: 'Instalação', pergunta: 'Posso ligar o A10S na água quente?', resposta: 'Não. Use sempre a tubulação de água fria da concessionária (rede municipal). A temperatura de água aplicável é de 5 °C a 38 °C (uso recomendado); a tabela técnica indica até 45 °C.' },
    { categoria: 'Instalação', pergunta: 'Qual a pressão de entrada necessária?', resposta: 'Entre 0,1 MPa e 0,4 MPa. Acima disso, instale uma válvula redutora de pressão; abaixo, uma bomba pressurizadora.' },
    { categoria: 'Instalação', pergunta: 'Preciso de pré-filtro?', resposta: 'Se a água local apresentar turbidez, sedimentos ou outra condição inadequada, instale um pré-filtro antes do purificador. Ele retém partículas maiores e ajuda a prolongar a vida útil dos filtros.' },
    { categoria: 'Instalação', pergunta: 'Preciso furar a pia para a torneira?', resposta: 'A torneira requer um furo de 25 mm. Se a pia não tiver um furo disponível, faça um com broca de 25 mm antes de instalar.' },
    { categoria: 'Funcionamento', pergunta: 'Por que sai água escura ou com espuma nas primeiras utilizações?', resposta: 'É normal após a instalação ou a troca de filtros, por causa do líquido de proteção e do pó de carvão ativado. Faça o enxágue inicial de ~30 minutos; a água deve ficar transparente em seguida.' },
    { categoria: 'Funcionamento', pergunta: 'Como obtenho água pura na torneira?', resposta: 'Acione a torneira para frente e para trás. Com as conexões corretas, para frente sai água da cozinha e para trás sai água pura. Quando o visor de TDS acende, a saída é de água pura.' },
    { categoria: 'Funcionamento', pergunta: 'O que significam Inlet TDS e Outlet TDS?', resposta: 'Inlet TDS é o total de sólidos dissolvidos na entrada e Outlet TDS é o da água purificada. TDS indica os sólidos dissolvidos totais; não avalia sozinho todos os aspectos da qualidade da água.' },
    { categoria: 'Manutenção', pergunta: 'De quanto em quanto tempo troco os filtros?', resposta: 'Como referência: CBPA (1º estágio) a cada 8–12 meses e ROCB (2º estágio) a cada 12–24 meses, conforme a qualidade da água. O manual também cita manutenção/inspeção geral a cada 3–6 meses.' },
    { categoria: 'Manutenção', pergunta: 'Como reseto o indicador de filtro?', resposta: 'Após trocar o elemento, pressione "Select" para selecioná-lo (o indicador pisca) e segure "Reset" por 6 segundos, até a luz voltar à cor azul.' },
    { categoria: 'Utilização', pergunta: 'Apareceu "E1" no visor da torneira. O que faço?', resposta: 'E1 indica vazamento (indicador de falha piscando em vermelho). Verifique vazamentos ao redor do equipamento e contate o SAC.' },
    { categoria: 'Utilização', pergunta: 'Apareceu "E2" no visor da torneira. O que faço?', resposta: 'E2 indica produção de água por período excessivo ou pequeno erro elétrico (indicador de falha aceso em branco). Desconecte o cabo de alimentação por alguns segundos e reconecte-o.' },
    { categoria: 'Especificações', pergunta: 'O A10S tem esterilização UV?', resposta: 'Sim. Além dos dois estágios de filtração (CBPA e ROCB), o purificador possui esterilização ultravioleta (UV) para reforçar a desinfecção da água.' },
    { categoria: 'Especificações', pergunta: 'Qual a diferença entre A10S-600 e A10S-800?', resposta: 'São as versões por capacidade de produção de água purificada: 600G e 800G, respectivamente. O modelo comercial é o A10S.' }
  ],

  garantia: {
    prazo: 'Consulte o termo de garantia do produto',
    texto: 'O manual fornecido não informa prazo nem condições de garantia. Consulte o termo que acompanha o produto ou o SAC OSMOS para confirmar a cobertura e solicitar assistência.',
    condicoes: []
  },

  dicas: [
    { tipo: 'importante', titulo: 'Instale um registro na entrada', texto: 'Instale um registro na entrada de água para facilitar a manutenção e evitar danos por pressão excessiva. Feche-o quando o equipamento ficar sem uso por longos períodos.' },
    { tipo: 'atencao', titulo: 'Sempre água fria da concessionária', texto: 'Conecte o A10S apenas à tubulação de água fria da rede municipal. Fonte inadequada compromete o funcionamento e a vida dos filtros.' },
    { tipo: 'atencao', titulo: 'Mantenha o dreno livre', texto: 'Não bloqueie a mangueira de drenagem nem instale válvulas nela — isso pode prejudicar a qualidade da água residual e danificar o equipamento.' },
    { tipo: 'dica', titulo: 'Faça o enxágue inicial de 30 minutos', texto: 'Após instalar, enxágue por ~30 minutos (automático em alguns modelos ou pelo botão Flush/Rinse). Água escura e espuma iniciais são normais.' },
    { tipo: 'nao-recomendado', titulo: 'Não energize antes de concluir', texto: 'Nunca conecte energia ou água antes de finalizar todas as conexões e verificar vazamentos. Evite instalar perto de ácidos/álcalis fortes ou sob sol direto.' }
  ],

  // Reconstrução 3D interativa não ativada para o A10S (ver cabeçalho). Mantido
  // por compatibilidade de schema; a seção exibe a galeria de fotografias.
  modelo3d: {
    tipo: 'generico',
    legenda: 'Galeria de fotografias de referência do A10S. O giro 360° interativo será habilitado quando houver um perfil de reconstrução próprio desta carcaça.'
  },
  hotspots: []
};

export const A10S = {
  slug: 'purificador-osmos-a10s',
  nome: 'Purificador OSMOS A10S',
  modelo: 'A10S',
  sku: 'OSMOS-A10S',
  categoria: 'Purificadores por Osmose Reversa',
  keywords: 'a10s a10s-600 a10s-800 osmose reversa purificador agua ro uv cbpa rocb tds filtro membrana ponto de uso fluxo direto 600g 800g torneira inteligente',
  descricao_curta: 'Purificador de ponto de uso por osmose reversa (A10S-600/800) com esterilização UV, filtros CBPA e ROCB (0,0001 µm) e duplo monitoramento de TDS.',
  imagem_url: `${BASE}/frente.png`,
  imagem_alt: 'Purificador de água OSMOS A10S com filtros CBPA e ROCB',
  conteudo: A10S_CONTEUDO
};

// Seed idempotente: só insere o A10S se o slug ainda não existir, preservando
// edições feitas no painel admin em deploys futuros. Produto independente do
// A9 PLUS (linha própria).
export async function seedA10S(db) {
  const row = await db.prepare('SELECT id FROM produtos_manual WHERE slug = ?').bind(A10S.slug).first();
  if (row) return;
  await db.prepare(
    `INSERT INTO produtos_manual
       (slug, nome, modelo, sku, categoria, keywords, descricao_curta, imagem_url, imagem_alt, status, ordem, conteudo_json, published_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'publicado', 2, ?, datetime('now'))
     ON CONFLICT(slug) DO NOTHING`
  ).bind(
    A10S.slug, A10S.nome, A10S.modelo, A10S.sku, A10S.categoria,
    A10S.keywords, A10S.descricao_curta, A10S.imagem_url, A10S.imagem_alt,
    JSON.stringify(A10S.conteudo)
  ).run();
}

/* ============================================
   OSMOS — Raio-X da Água
   Definição das perguntas (allowlist de campos/opções)
   e cálculo do Índice de Qualidade da Água (0–100).
   Compartilhado entre os endpoints públicos de respostas/finalização.
   ============================================ */

export const FIELDS = {
  tipo_imovel: { type: 'single', options: ['Casa', 'Apartamento', 'Condomínio Horizontal', 'Condomínio Vertical', 'Chácara / Fazenda', 'Empresa / Comércio'] },
  origem_agua: { type: 'single', options: ['Rede pública (Saneamento)', 'Poço Artesiano', 'Poço Semi-artesiano', 'Mina / Nascente', 'Caminhão Pipa', 'Não tenho certeza'] },
  qtd_moradores: { type: 'single', options: ['1 a 2 pessoas', '3 a 4 pessoas', '5 a 6 pessoas', '7 ou mais'] },
  consumo_atual: { type: 'multi', options: ['Direto da torneira', 'Filtro de barro', 'Purificador comum', 'Purificador por Osmose Reversa', 'Água mineral em galão', 'Água mineral em garrafa', 'Filtro de torneira', 'Outro'] },
  problemas_agua: { type: 'multi', options: ['Gosto de cloro', 'Cheiro de cloro', 'Água esbranquiçada', 'Água amarelada', 'Água barrenta', 'Manchas em louças', 'Manchas em roupas', 'Ferro', 'Ferrugem', 'Calcário', 'Incrustações', 'Sedimentos', 'Nenhum problema aparente'] },
  manchas_locais: { type: 'multi', options: ['Box do banheiro', 'Torneiras', 'Chuveiro', 'Vaso sanitário', 'Pia', 'Máquina de lavar', 'Não'] },
  freq_compra_agua: { type: 'single', options: ['Nunca', 'Semanalmente', 'Quinzenalmente', 'Mensalmente', 'Eventualmente'] },
  cozinha_mesma_agua: { type: 'single', options: ['Sim', 'Não', 'Às vezes'] },
  maior_preocupacao: { type: 'single', options: ['Saúde da família', 'Qualidade da água', 'Cloro', 'Metais pesados', 'Bactérias e vírus', 'Agrotóxicos', 'Microplásticos', 'Calcário', 'Economia', 'Sabor da água'] },
  tem_criancas: { type: 'single', options: ['Sim', 'Não'] },
  pessoas_risco: { type: 'multi', options: ['Bebês', 'Crianças', 'Gestantes', 'Idosos', 'Pessoas imunossuprimidas', 'Pessoas com doença renal', 'Nenhuma'] },
  analise_previa: { type: 'single', options: ['Sim', 'Não', 'Não sei'] },
  interesse_analise: { type: 'single', options: ['Sim', 'Talvez', 'Não'] },
  investimento: { type: 'single', options: ['Até R$ 2.000', 'Entre R$ 2.000 e R$ 4.000', 'Entre R$ 4.000 e R$ 6.000', 'Acima de R$ 6.000', 'Ainda não sei'] }
};

export const PATCHABLE_FIELDS = new Set(Object.keys(FIELDS));

function parseMulti(value) {
  if (!value) return [];
  try {
    const arr = JSON.parse(value);
    return Array.isArray(arr) ? arr : [];
  } catch (err) {
    return [];
  }
}

const ORIGEM_PENALTY = {
  'Rede pública (Saneamento)': 0,
  'Poço Artesiano': 10,
  'Mina / Nascente': 14,
  'Não tenho certeza': 16,
  'Poço Semi-artesiano': 20,
  'Caminhão Pipa': 25
};

const CONSUMO_PENALTY = {
  'Purificador por Osmose Reversa': 0,
  'Água mineral em galão': 6,
  'Água mineral em garrafa': 6,
  'Filtro de torneira': 8,
  'Purificador comum': 10,
  'Filtro de barro': 14,
  'Outro': 14,
  'Direto da torneira': 20
};

const PROBLEMA_PENALTY = {
  'Gosto de cloro': 3,
  'Cheiro de cloro': 3,
  'Água esbranquiçada': 5,
  'Água amarelada': 6,
  'Água barrenta': 7,
  'Manchas em louças': 4,
  'Manchas em roupas': 4,
  'Ferro': 6,
  'Ferrugem': 6,
  'Calcário': 5,
  'Incrustações': 5,
  'Sedimentos': 5
};

const COZINHA_PENALTY = { 'Sim': 5, 'Às vezes': 2, 'Não': 0 };
const ANALISE_PENALTY = { 'Não': 5, 'Não sei': 5, 'Sim': 0 };

const MANCHA_PONTOS = 2;
const MANCHA_MAX = 10;
const GRUPO_RISCO_PONTOS = 3;
const GRUPO_RISCO_MAX = 15;
const PROBLEMA_MAX = 20;

export function computeScore(row) {
  let penalidade = 0;

  penalidade += ORIGEM_PENALTY[row.origem_agua] ?? 0;

  const consumo = parseMulti(row.consumo_atual);
  if (consumo.length) {
    penalidade += Math.min(...consumo.map((v) => CONSUMO_PENALTY[v] ?? 20));
  } else {
    penalidade += 20;
  }

  const problemas = parseMulti(row.problemas_agua);
  const somaProblemas = problemas.reduce((sum, v) => sum + (PROBLEMA_PENALTY[v] ?? 0), 0);
  penalidade += Math.min(somaProblemas, PROBLEMA_MAX);

  const manchas = parseMulti(row.manchas_locais).filter((v) => v !== 'Não');
  penalidade += Math.min(manchas.length * MANCHA_PONTOS, MANCHA_MAX);

  penalidade += COZINHA_PENALTY[row.cozinha_mesma_agua] ?? 0;

  const grupos = parseMulti(row.pessoas_risco).filter((v) => v !== 'Nenhuma');
  penalidade += Math.min(grupos.length * GRUPO_RISCO_PONTOS, GRUPO_RISCO_MAX);

  penalidade += ANALISE_PENALTY[row.analise_previa] ?? 0;

  return Math.max(0, Math.min(100, 100 - penalidade));
}

export function classify(score) {
  if (score >= 80) return 'Baixo risco';
  if (score >= 60) return 'Atenção';
  if (score >= 40) return 'Alto risco';
  return 'Crítico';
}

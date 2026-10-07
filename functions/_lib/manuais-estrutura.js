// =============================================================================
// ESTRUTURA REUTILIZÁVEL da Central de Manuais — NÃO é conteúdo de produto.
// -----------------------------------------------------------------------------
// Ilustrações técnicas genéricas (SVG de traço) usadas como arte de apoio e
// como fallback quando um produto não tem imagem própria. Herdam a cor do
// contexto (currentColor, claro/escuro). São reutilizáveis por QUALQUER
// produto da central — A9 PLUS, A10S e futuros modelos.
//
// Aqui NÃO entra nenhuma especificação, medida, filtro ou dado técnico de um
// modelo específico: isso vive no conteúdo do produto (ex.: manual-a9plus.js e
// a coluna conteudo_json de cada linha de produtos_manual).
// =============================================================================

// Vista frontal: corpo em cápsula, dois anéis concêntricos (filtros),
// base, display de 3 dígitos, LEDs de status e botão redondo.
const SVG_FRONTAL = `<svg viewBox="0 0 220 440" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Ilustração técnica de vista frontal de purificador OSMOS" preserveAspectRatio="xMidYMid meet">
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
const SVG_TRASEIRA = `<svg viewBox="0 0 260 440" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Ilustração técnica de vista traseira de purificador OSMOS com conexões" preserveAspectRatio="xMidYMid meet">
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
const SVG_TORNEIRA = `<svg viewBox="0 0 220 300" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Ilustração técnica de torneira dupla eletrônica OSMOS com display" preserveAspectRatio="xMidYMid meet">
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
const SVG_HIDRAULICO = `<svg viewBox="0 0 520 240" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Ilustração de instalação hidráulica de purificador OSMOS" preserveAspectRatio="xMidYMid meet">
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

// Conjunto de ilustrações reutilizáveis, indexadas por chave de vista.
// O conteúdo de um produto pode referenciar estas chaves (ex.: desenho com
// `svg: 'traseira'`) quando não houver imagem própria enviada.
export const MANUAIS_SVGS = {
  frontal: SVG_FRONTAL,
  traseira: SVG_TRASEIRA,
  torneira: SVG_TORNEIRA,
  hidraulico: SVG_HIDRAULICO
};

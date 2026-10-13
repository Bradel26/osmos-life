import { escapeHtml } from './manuais-render.js';

// This component uses only the S9 geometry; other manual viewers stay independent.
export function renderS9Viewer(prod = {}) {
  const label = escapeHtml(prod.modelo || 'S9');
  const name = escapeHtml(prod.nome || 'Purificador OSMOS S9');
  const poster = prod.imagem_url ? '<img class="s9-poster" src="' + escapeHtml(prod.imagem_url) + '" alt="' + name + '" loading="lazy" decoding="async">' : '';
  return `<section id="explorar-3d" class="manual-section section-tint s9-interactive-section">
    <div class="container">
      <div class="section-head">
        <p class="eyebrow">Produto interativo</p>
        <h2>Explore o ${label} em 3D</h2>
        <p class="section-lead">Arraste para girar e use a roda do mouse ou dois dedos para ampliar. Selecione uma vista para explorar os detalhes do produto.</p>
      </div>
      <div id="osmos-s9-interativo" class="s9-viewer" data-s9-viewer aria-busy="true">
        <div class="s9-controls">
          <label class="s9-view-label" for="s9-vista">Vista
            <select id="s9-vista" class="s9-view-select" disabled>
              <option value="perspectiva">Perspectiva</option>
              <option value="frente">Frente</option>
              <option value="lateral">Lateral</option>
              <option value="traseira">Traseira</option>
            </select>
          </label>
          <div class="s9-button-group" role="group" aria-label="Controles do modelo 3D">
            <button type="button" class="s9-button" id="s9-esquerda" aria-label="Girar para a esquerda" disabled><span aria-hidden="true">↶</span> Girar</button>
            <button type="button" class="s9-button" id="s9-direita" aria-label="Girar para a direita" disabled><span aria-hidden="true">↷</span> Girar</button>
            <button type="button" class="s9-button" id="s9-ampliar" aria-label="Ampliar o modelo" disabled><span aria-hidden="true">+</span> Ampliar</button>
            <button type="button" class="s9-button" id="s9-reduzir" aria-label="Reduzir o modelo" disabled><span aria-hidden="true">−</span> Reduzir</button>
            <button type="button" class="s9-button" id="s9-reset" disabled>Vista inicial</button>
            <button type="button" class="s9-button" id="s9-fullscreen" aria-pressed="false" disabled>Tela cheia</button>
          </div>
        </div>
        <div class="s9-palco" role="group" aria-label="Modelo 3D do ${name}">
          ${poster}
          <div id="s9-carregando" class="s9-loading" role="status">Carregando o S9…</div>
        </div>
        <div class="s9-caption"><span>OSMOS ${label}</span><span>Arraste para girar · Role para ampliar</span></div>
        <span id="s9-status" class="s9-sr-only" aria-live="polite"></span>
        <noscript><p class="s9-fallback">Ative o JavaScript para explorar o modelo 3D. Os desenhos técnicos estão disponíveis abaixo.</p></noscript>
      </div>
      <p class="s9-note">Modelo visual com proporções aproximadas, criado a partir das fotografias do S9. Para conferir conexões e dimensões, consulte a documentação técnica abaixo.</p>
    </div>
  </section>`;
}

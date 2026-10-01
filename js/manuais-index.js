/* Central de Manuais — busca e filtros na página inicial (client-side).
   Os cards já vêm renderizados no servidor; aqui apenas filtramos. */
(function () {
  'use strict';

  var search = document.getElementById('manualSearch');
  var catSel = document.getElementById('manualCategoria');
  var modSel = document.getElementById('manualModelo');
  var grid = document.getElementById('manualGrid');
  var noResults = document.getElementById('manualNoResults');
  if (!grid) return;

  var cards = Array.prototype.slice.call(grid.querySelectorAll('.manual-card'));

  function norm(s) {
    return (s || '').toString().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  }

  function apply() {
    var q = norm(search && search.value.trim());
    var cat = catSel ? catSel.value : '';
    var mod = modSel ? modSel.value : '';
    var visible = 0;

    cards.forEach(function (card) {
      var haystack = norm([
        card.getAttribute('data-nome'),
        card.getAttribute('data-modelo'),
        card.getAttribute('data-sku'),
        card.getAttribute('data-keywords')
      ].join(' '));
      var matchQ = !q || haystack.indexOf(q) !== -1;
      var matchCat = !cat || card.getAttribute('data-categoria') === cat;
      // data-modelo é armazenado em minúsculas no SSR; compara com o valor do select.
      var matchMod = !mod || card.getAttribute('data-modelo') === mod.toLowerCase();
      var show = matchQ && matchCat && matchMod;
      card.style.display = show ? '' : 'none';
      if (show) visible++;
    });

    if (noResults) noResults.hidden = visible !== 0;
  }

  if (search) search.addEventListener('input', apply);
  if (catSel) catSel.addEventListener('change', apply);
  if (modSel) modSel.addEventListener('change', apply);

  // Permite chegar via /manuais?q=a9plus
  try {
    var params = new URLSearchParams(window.location.search);
    var preset = params.get('q');
    if (preset && search) { search.value = preset; apply(); }
  } catch (e) {}

  // Reaproveita o observer de fade-up do site, se existir; senão revela tudo.
  if (!('IntersectionObserver' in window)) {
    cards.forEach(function (c) { c.classList.add('in-view'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in-view'); io.unobserve(en.target); } });
    }, { threshold: 0.12 });
    cards.forEach(function (c) { io.observe(c); });
  }
})();

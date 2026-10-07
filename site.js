/* Overlay header: on pages that open with a dark hero band, the header sits transparent over the hero
   and turns solid white once the visitor scrolls. Pages without a dark hero keep the normal header. */
(function () {
  var header = document.querySelector('body > header');
  var hero = document.querySelector('main > section:first-child');
  if (!header || !hero || !hero.classList.contains('bg-momentum-blueDark')) return;

  var root = document.documentElement;
  root.classList.add('has-overlay-header');

  function measure() { root.style.setProperty('--hdr', header.offsetHeight + 'px'); }
  function update() { header.classList.toggle('is-solid', window.scrollY > 24); }

  measure(); update();
  window.addEventListener('resize', measure);
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('load', measure);

  // Keep the header solid while the mobile menu is open so the links stay readable.
  var toggle = document.getElementById('menu-toggle');
  if (toggle) toggle.addEventListener('click', function () {
    setTimeout(function () {
      var open = toggle.getAttribute('aria-expanded') === 'true';
      header.classList.toggle('menu-open', open);
    }, 0);
  });
})();

(function () {
  var juuri = document.documentElement;
  try { if (localStorage.getItem('teema') === 'tumma') juuri.setAttribute('data-teema', 'tumma'); } catch (e) {}

  window.teemaNappi = function () {
    var paikka = document.querySelector('.sisalto');
    if (!paikka || paikka.querySelector('.teemanappi')) return;
    var nappi = document.createElement('button');
    nappi.type = 'button';
    nappi.className = 'teemanappi';
    function paivita() {
      var tumma = juuri.getAttribute('data-teema') === 'tumma';
      nappi.textContent = tumma ? 'Vaalea tila' : 'Tumma tila';
      nappi.setAttribute('aria-pressed', tumma ? 'true' : 'false');
    }
    nappi.addEventListener('click', function () {
      var tumma = juuri.getAttribute('data-teema') !== 'tumma';
      if (tumma) juuri.setAttribute('data-teema', 'tumma'); else juuri.removeAttribute('data-teema');
      try { localStorage.setItem('teema', tumma ? 'tumma' : 'vaalea'); } catch (e) {}
      paivita();
    });
    paivita();
    paikka.insertBefore(nappi, paikka.firstChild);
  };
  document.addEventListener('DOMContentLoaded', window.teemaNappi);

  try {
    var nav = performance.getEntriesByType && performance.getEntriesByType('navigation')[0];
    if (nav && nav.type === 'reload' && location.hash.indexOf('#/') !== 0) {
      if (location.hash) history.replaceState(null, '', location.pathname + location.search);
      var alkuun = function () { window.scrollTo(0, 0); };
      window.addEventListener('load', function () { alkuun(); setTimeout(alkuun, 0); setTimeout(alkuun, 120); });
    }
  } catch (e) {}
})();

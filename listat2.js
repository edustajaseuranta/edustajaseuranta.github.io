(function () {
  var KARKI = 10;
  var NIMET = { ps: 'Perussuomalaiset', kok: 'Kokoomus', sd: 'SDP', kesk: 'Keskusta', vihr: 'Vihreät',
    vas: 'Vasemmistoliitto', r: 'RKP', kd: 'Kristillisdemokraatit', liik: 'Liike Nyt', tv: 'Eduskuntaryhmä Timo Vornanen',
    skl: 'SKL / Kristillinen Liitto', nuors: 'Nuorsuomalaiset', 'va-r': 'Vasemmistoryhmä', evir: 'Virtasen ryhmä',
    rem: 'Remonttiryhmä', alk: 'Aittoniemen ryhmä', erl: 'Erlundin ryhmä', lib: 'Liberaalit' };
  var EI_PUOLUE = { ministeri: 1, puhemies: 1 };
  function puolue(li) {
    var tagit = li.querySelectorAll('.rr-otsake .tagi');
    for (var i = 0; i < tagit.length; i++) {
      var t = tagit[i].textContent.trim();
      if (!EI_PUOLUE[t]) { var osat = t.split('→'); return osat[osat.length - 1].trim(); }
    }
    return '';
  }
  function luku(n) { var s = String(n); return s.length > 3 ? s.slice(0, -3) + ' ' + s.slice(-3) : s; }

  Array.prototype.forEach.call(document.querySelectorAll('[data-lohko]'), function (lohko) {
    var karki = null;
    Array.prototype.some.call(lohko.querySelectorAll('ol.lista'), function (ol) {
      if (ol.closest('details')) return false;
      karki = ol;
      return true;
    });
    var kaikkiLohko = lohko.querySelector('details.kaikki');
    var loput = lohko.querySelector('details.kaikki > ol.lista');
    var kiinni = kaikkiLohko ? kaikkiLohko.querySelector('.kun-kiinni') : null;
    var kiinniPohja = kiinni ? kiinni.textContent : '';
    var alku = lohko.querySelector('[data-jarj="alku"]');
    var loppu = lohko.querySelector('[data-jarj="loppu"]');
    var lajittelijat = Array.prototype.slice.call(lohko.querySelectorAll('[data-lajittele]'));
    var napit = lohko.querySelector('.jarjestys');
    if (!karki || !alku || !napit || (!loppu && !lajittelijat.length)) return;
    var kaikki = Array.prototype.slice.call(karki.children).concat(loput ? Array.prototype.slice.call(loput.children) : []);
    var rivit = kaikki.filter(function (li) { return !li.hasAttribute('data-kiintea'); });
    var kiinteat = kaikki.filter(function (li) { return li.hasAttribute('data-kiintea'); });
    var tila = 'alku', valittu = '';
    var puoluenapit = null;

    function jarjestetty() {
      if (tila === 'alku') return rivit;
      if (tila === 'loppu') return rivit.slice().reverse();
      return rivit.map(function (li, i) { return { li: li, i: i, v: Number(li.getAttribute('data-' + tila)) || 0 }; })
        .sort(function (a, b) { return b.v - a.v || a.i - b.i; }).map(function (o) { return o.li; });
    }
    function piirra() {
      var n = 0;
      jarjestetty().forEach(function (li) {
        var nakyy = !valittu || puolue(li) === valittu;
        li.hidden = !nakyy;
        if (nakyy) {
          n++;
          var sija = li.querySelector('.sija');
          if (sija) sija.textContent = n + '.';
          (n <= KARKI || !loput ? karki : loput).appendChild(li);
        } else {
          (loput || karki).appendChild(li);
        }
      });
      kiinteat.forEach(function (li) {
        var nakyy = !valittu || puolue(li) === valittu;
        li.hidden = !nakyy;
        if (nakyy) n++;
        (loput || karki).appendChild(li);
      });
      if (kaikkiLohko) {
        kaikkiLohko.hidden = n <= KARKI;
        if (kiinni) kiinni.textContent = kiinniPohja.replace(/\d[\d\s ]*/, luku(n) + ' ');
      }
      alku.setAttribute('aria-pressed', tila === 'alku' ? 'true' : 'false');
      if (loppu) loppu.setAttribute('aria-pressed', tila === 'loppu' ? 'true' : 'false');
      lajittelijat.forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-lajittele') === tila ? 'true' : 'false'); });
      if (puoluenapit) Array.prototype.forEach.call(puoluenapit.querySelectorAll('button'), function (b) {
        b.setAttribute('aria-pressed', b.getAttribute('data-puolue') === valittu ? 'true' : 'false');
      });
    }

    var maarat = {};
    rivit.concat(kiinteat).forEach(function (li) { var p = puolue(li); if (p) maarat[p] = (maarat[p] || 0) + 1; });
    var puolueet = Object.keys(maarat).sort(function (a, b) { return maarat[b] - maarat[a] || a.localeCompare(b, 'fi'); });
    if (puolueet.length > 1) {
      puoluenapit = document.createElement('div');
      puoluenapit.className = 'puolueet';
      puoluenapit.setAttribute('role', 'group');
      puoluenapit.setAttribute('aria-label', 'Näytä vain yhden puolueen edustajat');
      var otsikko = document.createElement('span');
      otsikko.className = 'puolueet-otsikko';
      otsikko.textContent = 'Näytä puolue';
      puoluenapit.appendChild(otsikko);
      [''].concat(puolueet).forEach(function (p) {
        var b = document.createElement('button');
        b.type = 'button';
        b.setAttribute('data-puolue', p);
        b.textContent = p ? (NIMET[p] || p) : 'Kaikki';
        b.addEventListener('click', function () { valittu = p; piirra(); });
        puoluenapit.appendChild(b);
      });
      var selite = document.createElement('p');
      selite.className = 'lyhenteet';
      var selitettavat = puolueet.filter(function (p) { return NIMET[p] && NIMET[p] !== p; });
      selite.textContent = 'Lyhenteet rivillä: ' + selitettavat.map(function (p) { return p + ' = ' + NIMET[p]; }).join(', ') + '.';
      if (!selitettavat.length) selite.hidden = true;
      napit.parentNode.insertBefore(puoluenapit, napit.nextSibling);
      puoluenapit.parentNode.insertBefore(selite, puoluenapit.nextSibling);
    }

    alku.addEventListener('click', function () { tila = 'alku'; piirra(); });
    if (loppu) loppu.addEventListener('click', function () { tila = 'loppu'; piirra(); });
    lajittelijat.forEach(function (b) { b.addEventListener('click', function () { tila = b.getAttribute('data-lajittele'); piirra(); }); });
    napit.hidden = false;
    piirra();
  });

  var m = /^#e-(\d+)(?:-([a-z]+))?$/.exec(location.hash);
  if (m) {
    var rivi = null;
    Array.prototype.some.call(document.querySelectorAll('li.ryhmarivi'), function (li) {
      if (li.closest('details.lahteneet')) return false;
      var a = li.querySelector('a.rr-nimi');
      var h = a ? (a.getAttribute('href') || '') : '';
      if (h === 'edustajat/' + m[1] + '.html' || h.indexOf('edustajat/' + m[1] + '-') === 0) { rivi = li; return true; }
      return false;
    });
    if (rivi) {
      var avattava = rivi.closest('details');
      if (avattava) avattava.open = true;
      rivi.classList.add('korostus');
      rivi.setAttribute('tabindex', '-1');
      var vierita = function () {
        setTimeout(function () {
          rivi.scrollIntoView({ block: 'center', behavior: 'instant' });
          rivi.focus({ preventScroll: true });
        }, 60);
      };
      if (document.readyState === 'complete') vierita(); else window.addEventListener('load', vierita);

      var nimi = rivi.querySelector('.rr-nimi');
      var kortti = 'edustajat/' + m[1] + '.html' + (m[2] ? '#' + m[2] : '');
      var paluu = document.createElement('a');
      paluu.className = 'paluu-kortille';
      paluu.href = kortti;
      paluu.textContent = '← Takaisin: ' + (nimi ? nimi.textContent.trim() : 'edustajan kortti');
      paluu.addEventListener('click', function (e) {
        var tulo = document.referrer || '';
        if (tulo.indexOf(location.origin + '/') === 0 && tulo.indexOf('/edustajat/' + m[1]) !== -1 && history.length > 1) {
          e.preventDefault();
          history.back();
        }
      });
      document.body.appendChild(paluu);
      document.body.classList.add('on-paluu');
    }
  }
})();

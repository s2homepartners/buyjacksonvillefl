/* Interactive neighborhood maps for the Buy and Sell pages.
   <div class="s2-map" data-mode="buyer"></div>   neighborhoods + military bases, with drive times and guide links
   <div class="s2-map" data-mode="seller"></div>  neighborhoods with a "get a free home value" prompt
   Leaflet and the map tiles load only when the map scrolls into view. Marker positions are approximate neighborhood centers. */
(function () {
  var els = [].slice.call(document.querySelectorAll('.s2-map'));
  if (!els.length) return;

  var AREAS = [
    { name: 'San Marco', county: 'Duval', lat: 30.2995, lng: -81.6570, href: 'san-marco.html', t: { nas: '~20', may: '~25', kb: '~50' } },
    { name: 'Riverside & Avondale', county: 'Duval', lat: 30.3030, lng: -81.6900, href: 'riverside-avondale.html', t: { nas: '~18–20', may: '~25–28', kb: '~50' } },
    { name: 'East Arlington', county: 'Duval', lat: 30.3230, lng: -81.5420, href: 'east-arlington.html' },
    { name: 'Atlantic & Neptune Beach', county: 'Duval', lat: 30.3280, lng: -81.3810, href: 'atlantic-neptune-beach.html', t: { nas: '~30–32', may: '~7–10', kb: '~55' } },
    { name: 'Fleming Island', county: 'Clay', lat: 30.1100, lng: -81.7190, href: 'fleming-island-plantation.html', t: { nas: '~13', may: '~42', kb: '~58' } },
    { name: 'Eagle Harbor', county: 'Clay', lat: 30.0870, lng: -81.7160, href: 'eagle-harbor.html' },
    { name: 'Oakleaf Plantation', county: 'Clay', lat: 30.1670, lng: -81.8330, href: 'oakleaf-plantation.html', t: { nas: '~18', may: '~42', kb: '~60' } },
    { name: 'Wildlight', county: 'Nassau', lat: 30.5950, lng: -81.5450, href: 'wildlight.html', t: { nas: '~37', may: '~40', kb: '~17' } },
    { name: 'Amelia National', county: 'Nassau', lat: 30.5890, lng: -81.5110, href: 'amelia-national.html', t: { nas: '~35–37', may: '~40', kb: '~15–17' } },
    { name: 'Nocatee', county: 'St. Johns', lat: 30.0930, lng: -81.3900, href: 'nocatee.html', t: { nas: '~32', may: '~27', kb: '~60' } },
    { name: 'Ponte Vedra Beach', county: 'St. Johns', lat: 30.2330, lng: -81.3830, href: 'ponte-vedra-beach.html', t: { nas: '~38', may: '~22', kb: '~62' } },
    { name: 'World Golf Village', county: 'St. Johns', lat: 29.9910, lng: -81.4700, href: 'world-golf-village.html' }
  ];
  var BASES = [
    { name: 'NAS Jacksonville', lat: 30.2358, lng: -81.6806 },
    { name: 'Naval Station Mayport', lat: 30.3919, lng: -81.4236 },
    { name: 'NSB Kings Bay', lat: 30.7817, lng: -81.5350 }
  ];
  var COUNTIES = ['All', 'Duval', 'Clay', 'Nassau', 'St. Johns'];

  function css() {
    var s = document.createElement('style');
    s.textContent =
      '.s2-map{min-height:520px}.s2m-wrap{display:grid;gap:16px}@media(min-width:1024px){.s2m-wrap{grid-template-columns:minmax(0,1fr) 280px}}' +
      '.s2m-chips{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px}' +
      '.s2m-chip{border:1px solid #E6DFD2;background:#FFFDF9;color:#1E4A5C;border-radius:6px;padding:7px 14px;font-size:13px;font-weight:600;cursor:pointer}' +
      '.s2m-chip[aria-pressed="true"]{background:#1E4A5C;border-color:#1E4A5C;color:#fff}' +
      '.s2m-map{height:440px;border-radius:8px;border:1px solid #E6DFD2;overflow:hidden;background:#EBE3D3}@media(max-width:640px){.s2m-map{height:360px}}' +
      '.s2m-list{max-height:440px;overflow:auto;border-top:1px solid #E6DFD2}@media(max-width:1023px){.s2m-list{max-height:none;display:grid;grid-template-columns:1fr 1fr;column-gap:16px}}' +
      '.s2m-item{display:block;width:100%;text-align:left;padding:11px 4px;border-bottom:1px solid #E6DFD2;background:none;cursor:pointer;color:#1E4A5C}' +
      '.s2m-item b{display:block;font-family:Newsreader,Georgia,serif;font-size:17px;font-weight:600}.s2m-item span{font-size:12px;color:#53636A}' +
      '.s2m-item:hover b{text-decoration:underline}' +
      '.s2m-dot{width:18px;height:18px;border-radius:50%;background:#3F7A68;border:3px solid #fff;box-shadow:0 2px 6px rgba(17,43,55,.45)}' +
      '.s2m-base{width:22px;height:22px;border-radius:4px;background:#1E4A5C;border:3px solid #fff;box-shadow:0 2px 6px rgba(17,43,55,.45);transform:rotate(45deg)}' +
      '.s2m-pop{font-family:"Source Sans 3",system-ui,sans-serif;color:#3D4D55;min-width:190px}.s2m-pop h4{font-family:Newsreader,Georgia,serif;font-size:19px;font-weight:600;color:#1E4A5C;margin:0}' +
      '.s2m-pop small{display:block;color:#6B7A80;text-transform:uppercase;letter-spacing:.1em;font-size:10px;font-weight:700;margin:2px 0 6px}' +
      '.s2m-pop p{margin:0 0 8px;font-size:13px;line-height:1.4}' +
      '.s2m-pop a,.s2m-pop button{display:inline-block;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;padding:8px 12px;border-radius:5px;border:0;cursor:pointer;text-decoration:none}' +
      '.s2m-pop a{background:#1E4A5C;color:#fff!important}.s2m-pop button{background:#3F7A68;color:#fff;margin-left:6px}' +
      '.s2m-note{margin-top:8px;font-size:11px;color:#6B7A80}';
    document.head.appendChild(s);
  }

  function loadLeaflet(cb) {
    if (window.L) return cb();
    var l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css'; document.head.appendChild(l);
    var s = document.createElement('script'); s.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js'; s.onload = cb; document.head.appendChild(s);
  }

  function popup(a, mode) {
    var h = '<div class="s2m-pop"><h4>' + a.name + '</h4><small>' + a.county + ' County</small>';
    if (mode === 'buyer') {
      if (a.t) h += '<p>Approx. drive: NAS Jax ' + a.t.nas + ' min &middot; Mayport ' + a.t.may + ' min &middot; Kings Bay ' + a.t.kb + ' min</p>';
      else h += '<p>Ask us for drive times from a specific address.</p>';
      h += '<a href="' + a.href + '">Read the guide</a>';
    } else {
      h += '<p>Thinking of selling in this area? Request a free home value estimate.</p>';
      h += '<a href="' + a.href + '">Area guide</a><button type="button" data-s2m-value>Home value</button>';
    }
    return h + '</div>';
  }

  function build(el) {
    var mode = el.getAttribute('data-mode') === 'seller' ? 'seller' : 'buyer';
    el.innerHTML = '<div class="s2m-chips" role="group" aria-label="Filter map by county"></div><div class="s2m-wrap"><div><div class="s2m-map" role="application" aria-label="Map of Northeast Florida neighborhoods"></div><p class="s2m-note">Marker positions are approximate neighborhood centers. Drive times are rounded, off-peak estimates.</p></div><div class="s2m-list" role="list"></div></div>';
    var chips = el.querySelector('.s2m-chips'), mapDiv = el.querySelector('.s2m-map'), list = el.querySelector('.s2m-list');

    var map = L.map(mapDiv, { scrollWheelZoom: false, dragging: !L.Browser.mobile, tap: true }).setView([30.35, -81.6], 9);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 17, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' }).addTo(map);
    mapDiv.addEventListener('click', function () { map.scrollWheelZoom.enable(); });
    mapDiv.addEventListener('mouseleave', function () { map.scrollWheelZoom.disable(); });

    var markers = [];
    AREAS.forEach(function (a, i) {
      var m = L.marker([a.lat, a.lng], { icon: L.divIcon({ className: '', html: '<div class="s2m-dot"></div>', iconSize: [18, 18], iconAnchor: [9, 9] }), title: a.name, keyboard: true });
      m.bindPopup(popup(a, mode)); m.__a = a; m.addTo(map); markers.push(m);
      var b = document.createElement('button'); b.type = 'button'; b.className = 's2m-item'; b.setAttribute('role', 'listitem'); b.innerHTML = '<b>' + a.name + '</b><span>' + a.county + ' County</span>'; b.__a = a;
      b.addEventListener('click', function () { map.flyTo([a.lat, a.lng], 11, { duration: 0.8 }); m.openPopup(); mapDiv.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); });
      list.appendChild(b);
    });

    var baseLayer = L.layerGroup();
    if (mode === 'buyer') {
      BASES.forEach(function (b) {
        L.marker([b.lat, b.lng], { icon: L.divIcon({ className: '', html: '<div class="s2m-base"></div>', iconSize: [22, 22], iconAnchor: [11, 11] }), title: b.name })
          .bindPopup('<div class="s2m-pop"><h4>' + b.name + '</h4><small>Military installation</small><p>See our <a href="military-relocation.html" style="padding:0;background:none;color:#1E4A5C!important;text-decoration:underline">PCS hub</a> for relocation help.</p></div>').addTo(baseLayer);
      });
      baseLayer.addTo(map);
    }

    function fit(list2) {
      var pts = list2.map(function (m) { return m.getLatLng(); });
      if (mode === 'buyer' && map.hasLayer(baseLayer)) BASES.forEach(function (b) { pts.push(L.latLng(b.lat, b.lng)); });
      if (pts.length) map.fitBounds(L.latLngBounds(pts).pad(0.15), { maxZoom: 11 });
    }

    function apply(county) {
      [].forEach.call(chips.children, function (c) { c.setAttribute('aria-pressed', c.getAttribute('data-k') === county ? 'true' : 'false'); });
      var shown = [];
      markers.forEach(function (m) { var on = county === 'All' || m.__a.county === county; if (on) { m.addTo(map); shown.push(m); } else map.removeLayer(m); });
      [].forEach.call(list.children, function (b) { b.style.display = (county === 'All' || b.__a.county === county) ? '' : 'none'; });
      fit(shown);
    }
    COUNTIES.forEach(function (c) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 's2m-chip'; b.setAttribute('data-k', c); b.setAttribute('aria-pressed', 'false'); b.textContent = c === 'All' ? 'All areas' : c + ' County';
      b.addEventListener('click', function () { apply(c); }); chips.appendChild(b);
    });
    if (mode === 'buyer') {
      var t = document.createElement('button'); t.type = 'button'; t.className = 's2m-chip'; t.setAttribute('aria-pressed', 'true'); t.textContent = 'Military bases';
      t.addEventListener('click', function () { var on = t.getAttribute('aria-pressed') !== 'true'; t.setAttribute('aria-pressed', on ? 'true' : 'false'); if (on) baseLayer.addTo(map); else map.removeLayer(baseLayer); });
      chips.appendChild(t);
    }
    apply('All');
    setTimeout(function () { map.invalidateSize(); }, 200);

    // The seller prompt reuses the site's existing home value form.
    map.on('popupopen', function (e) {
      var btn = e.popup.getElement().querySelector('[data-s2m-value]');
      if (btn) btn.addEventListener('click', function () { var t2 = document.querySelector('[data-action="open-value-modal"]'); if (t2) t2.click(); });
    });
  }

  css();
  function start() { loadLeaflet(function () { els.forEach(build); }); }
  if ('IntersectionObserver' in window) {
    var started = false;
    var io = new IntersectionObserver(function (es) { if (!started && es.some(function (e) { return e.isIntersecting; })) { started = true; io.disconnect(); start(); } }, { rootMargin: '300px' });
    els.forEach(function (e) { io.observe(e); });
  } else start();
})();

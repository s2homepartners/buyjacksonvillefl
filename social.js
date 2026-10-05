/* Social strips for S² Home Partners.
   Usage:
     <div class="social-strip" data-eyebrow="Watch" data-title="Home tours" data-text="..." data-ids="id1,id2,id3"></div>
     <div class="social-strip" data-mode="grid"></div>
   Videos below are a fallback list; the channel's public feed is merged in when reachable. */
(function () {
  var CHANNEL_ID = 'UCUBMW5nFvtlPWNBJqYZF2tQ';
  var LINKS = {
    YouTube: 'https://www.youtube.com/@S2HomePartners',
    Facebook: 'https://www.facebook.com/s2homepartners',
    Instagram: 'https://www.instagram.com/sarahfullerjax/',
    TikTok: 'https://www.tiktok.com/@s2homepartners'
  };
  var videos = [
    { id: 'nqJ5HBdMds0', title: 'Closed in Bartram Meadows!', date: '2026-10-02' },
    { id: 'juTUxwWvMQg', title: 'How We Negotiated Our Buyers Into a Practically Brand-New Home', date: '2026-09-29' },
    { id: 'wslKWgdfmtk', title: 'Oceanfront Penthouse in Jacksonville Beach', date: '2026-09-29' },
    { id: 'XxyNDvIhFlc', title: 'The Brasher by David Weekly Homes | Tributary, Yulee', date: '2026-09-29' },
    { id: 'aiPUFrWAwH4', title: 'Your beach lifestyle is calling!', date: '2026-09-22' },
    { id: '8wFkpUuooIo', title: 'Tributary House Tour: Don’t Wait 6 Months for a Build', date: '2026-09-16' },
    { id: 'xXYE7s2aLg0', title: 'Our newest listing is live on Chandelier Circle W', date: '2026-08-21' }
  ];

  function clean(t) {
    return String(t).replace(/#\S+/g, '').replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, '').replace(/\s+/g, ' ').trim();
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function fmt(d) {
    var dt = new Date(String(d).replace(' ', 'T')); if (isNaN(dt)) return '';
    return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
  function card(v) {
    var title = esc(clean(v.title)) || 'Watch on YouTube';
    return '<article class="min-w-0">' +
      '<button type="button" class="sp-card group block w-full text-left" data-id="' + v.id + '" aria-label="Play: ' + title + '">' +
      '<span class="sp-frame relative block aspect-video overflow-hidden rounded-lg bg-slate-200">' +
      '<img src="https://i.ytimg.com/vi/' + v.id + '/hqdefault.jpg" alt="" loading="lazy" class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />' +
      '<span class="absolute inset-0 flex items-center justify-center bg-momentum-blueDark/20 transition-colors group-hover:bg-momentum-blueDark/35">' +
      '<span class="flex h-12 w-12 items-center justify-center rounded-full bg-white/95 text-momentum-blue shadow-md" aria-hidden="true">&#9654;</span></span></span>' +
      '<span class="mt-3 block text-xs font-semibold uppercase tracking-wider text-momentum-gray">' + fmt(v.date) + '</span>' +
      '<span class="mt-1 block font-serif text-lg font-semibold leading-snug text-momentum-blue">' + title + '</span>' +
      '</button></article>';
  }
  function followLinks() {
    return Object.keys(LINKS).map(function (k) {
      return '<a href="' + LINKS[k] + '" target="_blank" rel="noopener noreferrer" class="border-b border-teal-300 pb-0.5 hover:border-momentum-blue">' + k + '</a>';
    }).join('');
  }
  function pick(el, list) {
    var ids = (el.getAttribute('data-ids') || '').split(',').map(function (s) { return s.trim(); }).filter(Boolean);
    var count = parseInt(el.getAttribute('data-count') || '3', 10);
    if (el.getAttribute('data-mode') === 'grid') return list;
    var out = [];
    ids.forEach(function (id) { list.forEach(function (v) { if (v.id === id) out.push(v); }); });
    if (!ids.length) out = list.slice(0, count);
    return out.slice(0, count);
  }
  function render(el) {
    var grid = el.getAttribute('data-mode') === 'grid';
    var list = pick(el, videos);
    var cards = '<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 ' + (grid ? 'lg:grid-cols-3' : 'lg:grid-cols-' + Math.min(Math.max(list.length, 1), 4)) + '">' + list.map(card).join('') + '</div>';
    if (grid) { el.innerHTML = cards; return; }
    var sand = el.getAttribute('data-bg') === 'sand';
    el.innerHTML = '<section class="border-t border-momentum-grayLight ' + (sand ? 'bg-momentum-bgLight' : 'bg-white') + ' py-14 sm:py-16"><div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">' +
      '<div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div class="max-w-2xl">' +
      '<span class="text-xs font-semibold uppercase tracking-widest text-teal-600">' + esc(el.getAttribute('data-eyebrow') || 'Watch') + '</span>' +
      '<h2 class="mt-2 font-serif text-2xl font-semibold text-momentum-blue sm:text-3xl">' + esc(el.getAttribute('data-title') || 'From our channels') + '</h2>' +
      (el.getAttribute('data-text') ? '<p class="mt-2 text-base leading-relaxed text-slate-600">' + esc(el.getAttribute('data-text')) + '</p>' : '') +
      '</div><div class="flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-momentum-blue">' + followLinks() + '</div></div>' +
      '<div class="mt-8">' + cards + '</div>' +
      '<p class="mt-6 text-sm"><a href="social.html" class="font-semibold text-momentum-blue underline underline-offset-4">See all videos and posts &rarr;</a></p>' +
      '</div></section>';
  }

  var els = [].slice.call(document.querySelectorAll('.social-strip'));
  if (!els.length) return;
  function renderAll() { els.forEach(render); }
  renderAll();

  document.addEventListener('click', function (e) {
    var btn = e.target.closest && e.target.closest('.sp-card'); if (!btn) return;
    var frame = btn.querySelector('.sp-frame');
    frame.innerHTML = '<iframe class="h-full w-full" src="https://www.youtube-nocookie.com/embed/' + btn.getAttribute('data-id') + '?autoplay=1&rel=0" title="S2 Home Partners video" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>';
  });

  // Merge in the channel's public feed when reachable; otherwise keep the fallback list.
  try {
    var feed = 'https://www.youtube.com/feeds/videos.xml?channel_id=' + CHANNEL_ID;
    fetch('https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent(feed))
      .then(function (r) { return r.ok ? r.json() : Promise.reject(); })
      .then(function (j) {
        if (!j || j.status !== 'ok' || !j.items || !j.items.length) return;
        var live = j.items.slice(0, 12).map(function (it) {
          var m = /[?&]v=([\w-]{11})/.exec(it.link || '') || /\/([\w-]{11})(?:\?|$)/.exec(it.guid || '');
          return m ? { id: m[1], title: it.title, date: it.pubDate } : null;
        }).filter(Boolean);
        if (!live.length) return;
        var seen = {}, merged = [];
        live.concat(videos).forEach(function (v) { if (!seen[v.id]) { seen[v.id] = 1; merged.push(v); } });
        merged.sort(function (a, b) { return new Date(String(b.date).replace(' ', 'T')) - new Date(String(a.date).replace(' ', 'T')); });
        videos = merged.slice(0, 18);
        // Only re-render strips nobody has started playing.
        els.forEach(function (el) { if (!el.querySelector('.sp-frame iframe')) render(el); });
      })
      .catch(function () {});
  } catch (err) {}
})();

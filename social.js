/* Social strips for S² Home Partners.
   <div class="social-strip" data-eyebrow="Watch" data-title="..." data-text="..." data-ids="id1,id2"></div>   -> section with a scrolling marquee
   <div class="social-strip" data-mode="marquee" data-bare="1"></div>                                         -> marquee only
   <div class="social-strip" data-mode="grid"></div>                                                           -> static video grid
   The marquee drifts on its own, pauses on hover/touch, and respects reduced-motion. YouTube items open in a
   lightbox player; Instagram items open the post. The video list below is a fallback that the channel's public
   feed is merged into when reachable. */
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
  // Photos and reels from Instagram (@sarahfullerjax); each links to its post.
  var photos = [
    { code: 'DeARgsLNi-T', img: 'social/ig-closing.jpg', title: 'Closing day gift basket', reel: true },
    { code: 'Dd7ClHYtaJv', img: 'social/ig-fun.jpg', title: 'A local spot we had to try', reel: false },
    { code: 'Dd4ZbXENPhd', img: 'social/ig-penthouse.jpg', title: 'Oceanfront penthouse, Jacksonville Beach', reel: true },
    { code: 'DdoSpKIxzZm', img: 'social/ig-sunshine.jpg', title: 'Let the sun shine', reel: true }
  ];

  function clean(t) {
    return String(t).replace(/#\S+/g, '').replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, '').replace(/\s+/g, ' ').trim();
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function fmt(d) {
    var dt = new Date(String(d).replace(' ', 'T')); if (isNaN(dt)) return '';
    return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  /* ---------- styles ---------- */
  var css = document.createElement('style');
  css.textContent =
    '.sp-marquee{overflow:hidden;position:relative;-webkit-mask-image:linear-gradient(90deg,transparent,#000 4%,#000 96%,transparent);mask-image:linear-gradient(90deg,transparent,#000 4%,#000 96%,transparent)}' +
    '.sp-track{display:flex;width:max-content;animation:sp-scroll var(--sp-dur,60s) linear infinite;will-change:transform}' +
    '.sp-marquee:hover .sp-track,.sp-marquee:focus-within .sp-track,.sp-marquee.sp-paused .sp-track{animation-play-state:paused}' +
    '.sp-set{display:flex;gap:16px;padding-right:16px}' +
    '@keyframes sp-scroll{from{transform:translateX(0)}to{transform:translateX(-50%)}}' +
    '.sp-item{position:relative;display:block;flex:none;height:250px;overflow:hidden;border-radius:8px;background:#E2DACB;text-align:left}' +
    '.sp-yt{width:444px}.sp-ig{width:200px}.sp-tile{width:230px;background:#F6F1E7;border:1px solid #E6DFD2}' +
    '.sp-item img{width:100%;height:100%;object-fit:cover;transition:transform .5s ease}' +
    '.sp-item:hover img{transform:scale(1.04)}' +
    '.sp-cap{position:absolute;left:0;right:0;bottom:0;padding:34px 14px 12px;color:#fff;background:linear-gradient(transparent,rgba(17,43,55,.82));font-weight:600;font-size:15px;line-height:1.25}' +
    '.sp-badge{position:absolute;top:10px;left:10px;padding:3px 8px;border-radius:4px;background:rgba(255,253,249,.92);color:#1E4A5C;font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase}' +
    '.sp-play{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:48px;height:48px;border-radius:50%;background:rgba(255,253,249,.95);color:#1E4A5C;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 14px -6px rgba(17,43,55,.4)}' +
    '.sp-tile-in{display:flex;height:100%;flex-direction:column;justify-content:center;padding:20px;color:#1E4A5C}' +
    '.sp-tile-in b{font-family:Newsreader,Georgia,serif;font-size:22px;line-height:1.15}' +
    '.sp-tile-in span{margin-top:8px;font-size:13px;color:#53636A}' +
    '.sp-lb{position:fixed;inset:0;z-index:120;display:none;align-items:center;justify-content:center;background:rgba(14,32,41,.82);padding:16px}' +
    '.sp-lb.open{display:flex}.sp-lb-box{position:relative;width:100%;max-width:960px;aspect-ratio:16/9;background:#000;border-radius:8px;overflow:hidden}' +
    '.sp-lb-box iframe{width:100%;height:100%;border:0}' +
    '.sp-lb-x{position:absolute;top:-44px;right:0;color:#fff;font-size:30px;line-height:1;background:none;border:0;cursor:pointer;padding:4px 8px}' +
    '@media (max-width:640px){.sp-item{height:210px}.sp-yt{width:340px}.sp-ig{width:170px}.sp-tile{width:200px}}' +
    '@media (prefers-reduced-motion:reduce){.sp-marquee{overflow-x:auto}.sp-track{animation:none}.sp-set[aria-hidden="true"]{display:none}}';
  document.head.appendChild(css);

  /* ---------- marquee ---------- */
  function ytItem(v, dup) {
    var title = esc(clean(v.title)) || 'Watch on YouTube';
    return '<button type="button" class="sp-item sp-yt" data-yt="' + v.id + '" aria-label="Play: ' + title + '"' + (dup ? ' tabindex="-1"' : '') + '>' +
      '<img src="https://i.ytimg.com/vi/' + v.id + '/hqdefault.jpg" alt="" loading="lazy" />' +
      '<span class="sp-badge">YouTube</span><span class="sp-play" aria-hidden="true">&#9654;</span>' +
      '<span class="sp-cap">' + title + '</span></button>';
  }
  function igItem(p, dup) {
    return '<a class="sp-item sp-ig" href="https://www.instagram.com/p/' + p.code + '/" target="_blank" rel="noopener noreferrer"' + (dup ? ' tabindex="-1"' : '') + ' aria-label="Instagram: ' + esc(p.title) + '">' +
      '<img src="' + p.img + '" alt="' + esc(p.title) + '" loading="lazy" />' +
      '<span class="sp-badge">' + (p.reel ? 'Reel' : 'Instagram') + '</span>' +
      (p.reel ? '<span class="sp-play" style="width:40px;height:40px" aria-hidden="true">&#9654;</span>' : '') +
      '<span class="sp-cap">' + esc(p.title) + '</span></a>';
  }
  function tile(label, sub, href, dup) {
    return '<a class="sp-item sp-tile" href="' + href + '" target="_blank" rel="noopener noreferrer"' + (dup ? ' tabindex="-1"' : '') + '><span class="sp-tile-in"><b>' + label + '</b><span>' + sub + '</span></span></a>';
  }
  function ordered(el) {
    var ids = (el.getAttribute('data-ids') || '').split(',').map(function (s) { return s.trim(); }).filter(Boolean);
    var first = [], rest = [];
    videos.forEach(function (v) { (ids.indexOf(v.id) > -1 ? first : rest).push(v); });
    return first.concat(rest);
  }
  function items(el, dup) {
    var vs = ordered(el).slice(0, 9), out = [], pi = 0;
    vs.forEach(function (v, i) {
      out.push(ytItem(v, dup));
      if (i % 2 === 1 && pi < photos.length) out.push(igItem(photos[pi++], dup));
    });
    while (pi < photos.length) out.push(igItem(photos[pi++], dup));
    out.push(tile('Follow on TikTok', '@s2homepartners', LINKS.TikTok, dup));
    out.push(tile('Follow on Facebook', 'S&sup2; Home Partners', LINKS.Facebook, dup));
    return out.join('');
  }
  function marquee(el) {
    return '<div class="sp-marquee" role="region" aria-label="Videos and photos from S2 Home Partners"><div class="sp-track">' +
      '<div class="sp-set">' + items(el, false) + '</div><div class="sp-set" aria-hidden="true">' + items(el, true) + '</div></div></div>';
  }
  function tune(el) {
    var track = el.querySelector('.sp-track'); if (!track) return;
    var w = track.firstChild.getBoundingClientRect().width || 3000;
    track.style.setProperty('--sp-dur', Math.max(30, Math.round(w / 55)) + 's');
  }

  /* ---------- grid (static) ---------- */
  function gridCard(v) {
    var title = esc(clean(v.title));
    return '<article><button type="button" class="group block w-full text-left" data-yt="' + v.id + '" aria-label="Play: ' + title + '">' +
      '<span class="relative block aspect-video overflow-hidden rounded-lg bg-slate-200"><img src="https://i.ytimg.com/vi/' + v.id + '/hqdefault.jpg" alt="" loading="lazy" class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />' +
      '<span class="absolute inset-0 flex items-center justify-center bg-momentum-blueDark/20"><span class="flex h-12 w-12 items-center justify-center rounded-full bg-white/95 text-momentum-blue shadow-md" aria-hidden="true">&#9654;</span></span></span>' +
      '<span class="mt-3 block text-xs font-semibold uppercase tracking-wider text-momentum-gray">' + fmt(v.date) + '</span>' +
      '<span class="mt-1 block font-serif text-lg font-semibold leading-snug text-momentum-blue">' + title + '</span></button></article>';
  }

  function followLinks() {
    return Object.keys(LINKS).map(function (k) {
      return '<a href="' + LINKS[k] + '" target="_blank" rel="noopener noreferrer" class="border-b border-teal-300 pb-0.5 hover:border-momentum-blue">' + k + '</a>';
    }).join('');
  }

  function render(el) {
    var mode = el.getAttribute('data-mode');
    if (mode === 'grid') {
      el.innerHTML = '<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">' + videos.slice(0, 12).map(gridCard).join('') + '</div>';
      return;
    }
    if (el.getAttribute('data-bare')) { el.innerHTML = marquee(el); tune(el); return; }
    var sand = el.getAttribute('data-bg') === 'sand';
    el.innerHTML = '<section class="py-12 sm:py-14">' +
      '<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"><div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div class="max-w-2xl">' +
      '<span class="text-xs font-semibold uppercase tracking-widest text-teal-600">' + esc(el.getAttribute('data-eyebrow') || 'Watch') + '</span>' +
      '<h2 class="mt-2 font-serif text-2xl font-semibold text-momentum-blue sm:text-3xl">' + esc(el.getAttribute('data-title') || 'From our channels') + '</h2>' +
      (el.getAttribute('data-text') ? '<p class="mt-2 text-base leading-relaxed text-slate-600">' + esc(el.getAttribute('data-text')) + '</p>' : '') +
      '</div><div class="flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-momentum-blue">' + followLinks() + '</div></div></div>' +
      '<div class="mt-8">' + marquee(el) + '</div>' +
      '<div class="mx-auto mt-6 max-w-7xl px-4 sm:px-6 lg:px-8"><p class="text-sm"><a href="social.html" class="font-semibold text-momentum-blue underline underline-offset-4">See all videos and posts &rarr;</a></p></div></section>';
    tune(el);
  }

  var els = [].slice.call(document.querySelectorAll('.social-strip'));
  if (!els.length) return;
  els.forEach(render);

  /* ---------- lightbox ---------- */
  var lb = document.createElement('div');
  lb.className = 'sp-lb'; lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-modal', 'true'); lb.setAttribute('aria-label', 'Video player');
  lb.innerHTML = '<div class="sp-lb-box"><button type="button" class="sp-lb-x" aria-label="Close video">&times;</button><div class="sp-lb-slot" style="width:100%;height:100%"></div></div>';
  document.body.appendChild(lb);
  var slot = lb.querySelector('.sp-lb-slot');
  function openVideo(id) {
    slot.innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0" title="S2 Home Partners video" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>';
    lb.classList.add('open');
  }
  function closeVideo() { lb.classList.remove('open'); slot.innerHTML = ''; }
  lb.addEventListener('click', function (e) { if (e.target === lb || e.target.classList.contains('sp-lb-x')) closeVideo(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeVideo(); });
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-yt]'); if (b) openVideo(b.getAttribute('data-yt'));
  });
  // Touch: pause the drift while a finger is down.
  document.addEventListener('touchstart', function (e) { var m = e.target.closest && e.target.closest('.sp-marquee'); if (m) m.classList.add('sp-paused'); }, { passive: true });
  document.addEventListener('touchend', function () { setTimeout(function () { [].forEach.call(document.querySelectorAll('.sp-paused'), function (m) { m.classList.remove('sp-paused'); }); }, 2500); }, { passive: true });

  /* ---------- merge in the channel's public feed ---------- */
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
        // Skip a re-render if a visitor is mid-video so the marquee does not jump.
        if (!lb.classList.contains('open')) els.forEach(render);
      })
      .catch(function () {});
  } catch (err) {}
})();

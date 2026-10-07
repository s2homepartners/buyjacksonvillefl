/* Optional background music.
   - Looks for audio/background.mp3. If the file is missing, nothing is added to the page.
   - Music is OFF until a visitor taps the speaker button (browsers block sound that starts by itself).
   - Once a visitor turns it on, it keeps playing across pages (position is remembered between page loads). */
(function () {
  var SRC = 'audio/background.mp3';
  var KEY = 'sh_music';          // 'on' | 'off'
  var POS = 'sh_music_pos';
  var VOL = 0.22;

  function store(get, k, v) { try { return get ? (sessionStorage.getItem(k) || localStorage.getItem(k)) : (localStorage.setItem(k, v), sessionStorage.setItem(k, v)); } catch (e) { return null; } }

  fetch(SRC, { method: 'HEAD' }).then(function (r) { if (r.ok) init(); }).catch(function () {});

  function init() {
    var audio = new Audio(SRC);
    audio.loop = true; audio.preload = 'none'; audio.volume = VOL;

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Turn background music on');
    btn.setAttribute('aria-pressed', 'false');
    btn.title = 'Background music';
    btn.style.cssText = 'position:fixed;left:16px;bottom:88px;z-index:60;width:44px;height:44px;border-radius:50%;border:1px solid #E6DFD2;background:rgba(255,253,249,.96);color:#1E4A5C;box-shadow:0 4px 14px -6px rgba(17,43,55,.35);display:flex;align-items:center;justify-content:center;cursor:pointer';
    if (window.matchMedia('(min-width: 768px)').matches) btn.style.bottom = '24px';
    var on = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4V5z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/></svg>';
    var off = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4V5z"/><path d="M22 9l-6 6M16 9l6 6"/></svg>';

    function paint(playing) {
      btn.innerHTML = playing ? on : off;
      btn.setAttribute('aria-pressed', playing ? 'true' : 'false');
      btn.setAttribute('aria-label', playing ? 'Turn background music off' : 'Turn background music on');
    }
    paint(false);
    document.body.appendChild(btn);

    function play() {
      var t = parseFloat(store(true, POS)); if (!isNaN(t) && t > 0) { try { audio.currentTime = t; } catch (e) {} }
      var p = audio.play();
      if (p && p.then) return p.then(function () { paint(true); store(false, KEY, 'on'); return true; }).catch(function () { paint(false); return false; });
      paint(true); store(false, KEY, 'on'); return Promise.resolve(true);
    }
    function pause() { audio.pause(); paint(false); store(false, KEY, 'off'); }

    btn.addEventListener('click', function () { if (audio.paused) play(); else pause(); });

    // Remember where we are so the next page can pick up near the same spot.
    function savePos() { if (!audio.paused) store(false, POS, String(audio.currentTime)); }
    window.addEventListener('pagehide', savePos);
    setInterval(savePos, 2000);

    // If the visitor already chose music on a previous page, try to resume; if the browser refuses, resume on the first tap or key press.
    if (store(true, KEY) === 'on') {
      play().then(function (ok) {
        if (ok) return;
        var resume = function () { document.removeEventListener('pointerdown', resume); document.removeEventListener('keydown', resume); if (store(true, KEY) === 'on') play(); };
        document.addEventListener('pointerdown', resume, { once: true });
        document.addEventListener('keydown', resume, { once: true });
      });
    }
  }
})();

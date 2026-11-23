/* Script for the mailer / pop-by landing page at /value/.
   - Picks this month's theme from months.js (switches on the 1st, Eastern time) and
     fills in the headline, letter, colors and artwork
   - Fills in the site header, team contact block and footer
   - Sends the Home Value form to the same Apps Script lead backend as the rest of the
     site (site.js / sell.html), which emails the team and passes the lead on.
   - Records where the visitor came from: add ?src=mailer or ?src=popby to the QR code URL.
   On localhost the form does a dry run (logs the lead to the console, sends nothing)
   unless the URL has ?live=1, so testing never creates fake leads. */
(function () {
  'use strict';

  // Same endpoint as LEAD_BACKEND_URL in site.js. If that ever changes, change it here too.
  var LEAD_BACKEND_URL = 'https://script.google.com/macros/s/AKfycbybi0InSUyh5Rw45uFUlwg2t29wzsYxWrcKXWuf9NqH9Nprlf_YZ3htq-x4n0pr_I5p_w/exec';
  var FORM_TYPE = 'Mailer Home Value Lead';

  var TEAM = {
    name: 'S² Home Partners Real Estate Team',
    agents: 'Sarah Fuller & Sarah Luther',
    brokerage: 'Momentum Realty',
    phones: [
      { label: 'Sarah Luther', display: '850-328-9800', tel: '+18503289800' },
      { label: 'Sarah Fuller', display: '434-713-1221', tel: '+14347131221' }
    ],
    email: 'S2HomePartners@gmail.com',
    site: 'https://buyjacksonvillefl.com/',
    siteLabel: 'www.buyjacksonvillefl.com'
  };

  var params = new URLSearchParams(location.search);
  var isLocal = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
  var dryRun = isLocal && params.get('live') !== '1';
  var source = (params.get('src') || params.get('utm_source') || 'direct').replace(/[^\w-]/g, '').slice(0, 40) || 'direct';

  var PHONE_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M3 5.5A2.5 2.5 0 015.5 3h1.6a1 1 0 01.95.68l1.2 3.6a1 1 0 01-.5 1.2l-1.7.86a11 11 0 005.6 5.6l.86-1.7a1 1 0 011.2-.5l3.6 1.2a1 1 0 01.69.95v1.6A2.5 2.5 0 0118.5 21h-1C9.5 21 3 14.5 3 6.5v-1z"/></svg>';

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function renderHeader(el) {
    var p = TEAM.phones[0];
    el.className = 'lp-topbar';
    el.innerHTML =
      '<div class="lp-wrap">' +
        '<a class="lp-topbar__logo" href="/"><img src="/s2-home-partners-logo.png" alt="S² Home Partners Real Estate Team | Momentum Realty"></a>' +
        '<div class="lp-topbar__actions">' +
          '<a class="lp-topbar__site" href="/">Visit our website</a>' +
          '<a class="lp-topbar__call" href="tel:' + p.tel + '">' + PHONE_ICON + '<span>' + esc(p.display) + '</span></a>' +
        '</div>' +
      '</div>';
  }

  function renderTeam(el) {
    var links = TEAM.phones.map(function (p) {
      return '<a href="tel:' + p.tel + '">' + PHONE_ICON.replace('<svg ', '<svg width="16" height="16" ') + esc(p.display) + '</a>';
    }).join('');
    el.className = 'lp-team';
    el.innerHTML =
      '<div class="lp-wrap lp-team__grid">' +
        '<div class="lp-team__photos">' +
          '<img src="/sarah-fuller.jpg" alt="Sarah Fuller" loading="lazy" width="92" height="92">' +
          '<img src="/sarah-luther.jpg" alt="Sarah Luther" loading="lazy" width="92" height="92">' +
        '</div>' +
        '<div>' +
          '<p class="lp-team__name">' + esc(TEAM.name) + '</p>' +
          '<p class="lp-team__meta">' + esc(TEAM.agents) + ' &middot; ' + esc(TEAM.brokerage) + '</p>' +
          '<p class="lp-team__meta"><a href="' + TEAM.site + '">' + esc(TEAM.siteLabel) + '</a></p>' +
        '</div>' +
        '<div class="lp-team__links">' + links + '</div>' +
      '</div>';
  }

  function renderFooter(el) {
    el.className = 'lp-footer';
    el.innerHTML =
      '<div class="lp-wrap">' +
        '<p style="margin-bottom:10px;font-size:.8rem;line-height:1.6">S² Home Partners Real Estate Team | Momentum Realty<br>13475 Atlantic Blvd, Ste 8, Office S206, Jacksonville, FL 32225<br>' +
          '<a href="tel:+18503289800">850-328-9800</a></p>' +
        '<p>&copy; ' + new Date().getFullYear() + ' S² Home Partners Real Estate Team | Momentum Realty. All rights reserved.</p>' +
        '<nav aria-label="Footer">' +
          '<a href="/">Home</a>' +
          '<a href="/sell.html">Sell</a>' +
          '<a href="/buy.html">Buy</a>' +
          '<a href="/about.html">Meet Sarah &amp; Sarah</a>' +
          '<a href="/success-stories.html">Success Stories</a>' +
          '<a href="/seller-portal.html">Seller Login</a>' +
          '<a href="https://www.facebook.com/s2homepartners" target="_blank" rel="noopener noreferrer">Facebook</a>' +
          '<a href="https://www.instagram.com/sarahfullerjax/" target="_blank" rel="noopener noreferrer">Instagram</a>' +
        '</nav>' +
      '</div>';
  }

  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
    'August', 'September', 'October', 'November', 'December'];

  function monthLabel(key) {
    var m = /^(\d{4})-(\d{2})$/.exec(key || '');
    return m ? MONTHS[+m[2] - 1] + ' ' + m[1] : 'Unknown month';
  }

  // Current year-month in Jacksonville (Eastern) time, e.g. "2027-03".
  function currentKey() {
    try {
      var parts = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', year: 'numeric', month: '2-digit' }).formatToParts(new Date());
      var y = '', mo = '';
      parts.forEach(function (p) { if (p.type === 'year') y = p.value; if (p.type === 'month') mo = p.value; });
      if (y && mo) return y + '-' + mo;
    } catch (e) { /* fall through */ }
    var d = new Date();
    return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2);
  }

  // Pick the theme: ?month=YYYY-MM (preview) if it exists, otherwise the latest month that
  // has started; before the first month, the first one.
  function pickMonth(all) {
    var keys = Object.keys(all).filter(function (k) { return /^\d{4}-\d{2}$/.test(k); }).sort();
    if (!keys.length) return null;
    var wanted = params.get('month');
    if (wanted && all[wanted]) return { key: wanted, cfg: all[wanted], preview: true };
    var now = currentKey();
    var chosen = keys[0];
    keys.forEach(function (k) { if (k <= now) chosen = k; });
    return { key: chosen, cfg: all[chosen], preview: false };
  }

  var GOOGLE_FONTS = 'https://fonts.googleapis.com/css2?family=';

  function applyTheme(active) {
    var cfg = active.cfg, c = cfg.colors || {}, root = document.documentElement.style;
    var map = {
      primary: '--lp-primary', primaryDeep: '--lp-primary-deep', accent: '--lp-accent', accentInk: '--lp-accent-ink',
      heroBg: '--lp-hero-bg', heroInk: '--lp-hero-ink', heroSub: '--lp-hero-sub', heroMuted: '--lp-hero-muted',
      eyebrow: '--lp-eyebrow', paper: '--lp-paper', cream: '--lp-cream', ink: '--lp-ink', muted: '--lp-muted'
    };
    Object.keys(map).forEach(function (k) { if (c[k]) root.setProperty(map[k], c[k]); });
    if (cfg.font && cfg.font.family) {
      var link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = GOOGLE_FONTS + cfg.font.google + '&display=swap';
      document.head.appendChild(link);
      root.setProperty('--lp-display', "'" + cfg.font.family + "', 'Source Sans 3', sans-serif");
    }
    document.body.classList.toggle('lp-upper', !!cfg.uppercase);
    document.body.setAttribute('data-month', active.key);

    var label = monthLabel(active.key);
    document.title = cfg.title.replace(/<[^>]+>/g, '').replace(/&rsquo;/g, '’').replace(/&hellip;/g, '…').replace(/&amp;/g, '&') + ' | S² Home Partners Real Estate Team';

    function set(sel, html) {
      var el = document.querySelector(sel);
      if (!el) return null;
      if (html) { el.innerHTML = html; el.hidden = false; } else { el.hidden = true; }
      return el;
    }
    set('[data-lp-eyebrow]', 'Free Home Value Report &middot; ' + label);
    set('[data-lp-title]', cfg.title);
    set('[data-lp-subtitle]', cfg.subtitle);
    set('[data-lp-lead]', cfg.lead);
    set('[data-lp-letter-eyebrow]', cfg.letterEyebrow || 'A note from Sarah &amp; Sarah');
    set('[data-lp-greeting]', cfg.greeting);
    set('[data-lp-closing]', cfg.closing);
    set('[data-lp-ps]', cfg.ps ? '<strong>P.S.</strong> ' + cfg.ps : '');
    set('[data-lp-letter]', (cfg.letter || []).map(function (block) {
      return /^\s*<(ul|ol|div|table)/i.test(block) ? block : '<p>' + block + '</p>';
    }).join(''));
    if (cfg.thanks) set('[data-lp-thanks]', cfg.thanks.replace('{name}', '<span data-lp-first-name></span>'));

    var art = document.querySelector('[data-lp-art]');
    if (art && cfg.art) {
      if (cfg.art.html && ART[cfg.art.html]) {
        art.innerHTML = ART[cfg.art.html];
        art.setAttribute('aria-hidden', 'true');
      } else if (cfg.art.src) {
        art.innerHTML = '<img class="lp-art-img" src="' + esc(cfg.art.src) + '" alt="' + (cfg.art.alt || '') + '" width="760" height="1064">';
      }
    }
    var edge = document.querySelector('[data-lp-edge]');
    if (edge) edge.hidden = !(cfg.art && cfg.art.html === 'monopoly');
    document.body.classList.remove('lp-loading');
  }

  // Hand-drawn artwork for months without an image (January's Monopoly board).
  var ART = {
    monopoly:
      '<div class="mono-art"><div class="mono-board">' +
      '<svg class="mono-house" viewBox="0 0 320 270" xmlns="http://www.w3.org/2000/svg">' +
        '<ellipse cx="160" cy="252" rx="140" ry="12" fill="#0F1A5E" opacity=".18"/>' +
        '<rect x="18" y="214" width="34" height="30" rx="3" fill="#2B2B33"/><rect x="33" y="186" width="5" height="30" fill="#6B4A2B"/>' +
        '<circle cx="35" cy="168" r="26" fill="#3E8E4E"/><circle cx="24" cy="160" r="12" fill="#57A862"/><circle cx="44" cy="176" r="11" fill="#2F7A40"/>' +
        '<rect x="268" y="214" width="34" height="30" rx="3" fill="#2B2B33"/><rect x="283" y="186" width="5" height="30" fill="#6B4A2B"/>' +
        '<circle cx="285" cy="168" r="26" fill="#3E8E4E"/><circle cx="274" cy="160" r="12" fill="#57A862"/><circle cx="294" cy="176" r="11" fill="#2F7A40"/>' +
        '<rect x="92" y="40" width="22" height="44" fill="#E8DCC0" stroke="#1F2440" stroke-width="3"/>' +
        '<rect x="66" y="108" width="188" height="136" fill="#F3E9D2" stroke="#1F2440" stroke-width="3"/>' +
        '<polygon points="52,112 160,44 268,112" fill="#1A2A8C" stroke="#1F2440" stroke-width="3" stroke-linejoin="round"/>' +
        '<path d="M78 98 L160 46 L242 98" fill="none" stroke="#3446B0" stroke-width="3" opacity=".7"/>' +
        '<rect x="146" y="72" width="28" height="26" rx="13" fill="#0F1A5E" stroke="#F3E9D2" stroke-width="3"/>' +
        '<g fill="#1A2A8C" stroke="#F3E9D2" stroke-width="3"><rect x="84" y="124" width="36" height="40"/><rect x="200" y="124" width="36" height="40"/><rect x="84" y="186" width="36" height="40"/><rect x="200" y="186" width="36" height="40"/></g>' +
        '<g stroke="#F3E9D2" stroke-width="2.5"><line x1="102" y1="124" x2="102" y2="164"/><line x1="84" y1="144" x2="120" y2="144"/><line x1="218" y1="124" x2="218" y2="164"/><line x1="200" y1="144" x2="236" y2="144"/><line x1="102" y1="186" x2="102" y2="226"/><line x1="84" y1="206" x2="120" y2="206"/><line x1="218" y1="186" x2="218" y2="226"/><line x1="200" y1="206" x2="236" y2="206"/></g>' +
        '<rect x="126" y="124" width="68" height="20" rx="2" fill="#1A2A8C" stroke="#1F2440" stroke-width="2"/>' +
        '<text x="160" y="138" text-anchor="middle" font-family="League Spartan, sans-serif" font-weight="800" font-size="10.5" fill="#F5EEDC" letter-spacing=".5">PARK PLACE</text>' +
        '<path d="M128 160 h64 l-6 14 h-52 z" fill="#1A2A8C" stroke="#1F2440" stroke-width="2"/>' +
        '<rect x="140" y="174" width="40" height="70" rx="4" fill="#0F1A5E" stroke="#1F2440" stroke-width="2"/>' +
        '<circle cx="172" cy="212" r="3" fill="#D9A441"/><rect x="132" y="244" width="56" height="8" fill="#2B2B33"/>' +
        '<g fill="#3E8E4E"><circle cx="80" cy="244" r="9"/><circle cx="96" cy="246" r="8"/><circle cx="112" cy="245" r="9"/><circle cx="208" cy="245" r="9"/><circle cx="224" cy="246" r="8"/><circle cx="240" cy="244" r="9"/></g>' +
        '<g transform="translate(232 18) rotate(32)"><circle cx="0" cy="0" r="20" fill="#D9A441" stroke="#8F6229" stroke-width="3"/><circle cx="0" cy="0" r="8" fill="#F5EEDC" stroke="#8F6229" stroke-width="2.5"/><rect x="18" y="-5" width="62" height="10" rx="2" fill="#D9A441" stroke="#8F6229" stroke-width="2.5"/><rect x="62" y="5" width="7" height="12" fill="#D9A441" stroke="#8F6229" stroke-width="2.5"/><rect x="72" y="5" width="7" height="8" fill="#D9A441" stroke="#8F6229" stroke-width="2.5"/></g>' +
      '</svg>' +
      '<div class="mono-deed"><div class="mono-deed__band"><small>TITLE DEED</small><b>PARK PLACE</b></div>' +
        '<ul><li><span>More bedrooms</span><span>&#10003;</span></li><li><span>Bigger yard</span><span>&#10003;</span></li><li><span>Fresh start</span><span>&#10003;</span></li><li><span>Your home&rsquo;s value</span><span>?</span></li></ul>' +
        '<p class="mono-deed__foot">Home Value Report &mdash; FREE</p></div>' +
      '</div>' +
      '<div class="mono-money">' +
        ['500', '100', '50'].map(function (n) {
          return '<div class="mono-stack mono-stack--' + n + '"><div class="mono-bill"></div><div class="mono-bill"></div><div class="mono-bill"><span>' + n + '</span></div></div>';
        }).join('') +
      '</div></div>'
  };

  var ACTIVE = null;

  function formatPhone(v) {
    var d = v.replace(/\D/g, '');
    if (d.length === 11 && d.charAt(0) === '1') d = d.slice(1);
    if (d.length !== 10) return v.trim();
    return '(' + d.slice(0, 3) + ') ' + d.slice(3, 6) + '-' + d.slice(6);
  }

  function initForm(form) {
    // Leads are tagged with the month whose theme was showing (from months.js).
    var month = ACTIVE ? monthLabel(ACTIVE.key) : 'Unknown month';
    var theme = ACTIVE ? (ACTIVE.cfg.theme || '') : '';
    var campaign = month + ' Mailer' + (theme ? ' (' + theme + ')' : '');
    var card = form.closest('[data-lp-form-card]') || form.parentNode;
    var success = card.querySelector('[data-lp-success]');
    var errorBox = form.querySelector('[data-lp-error]');
    var button = form.querySelector('button[type="submit"]');
    var buttonText = button.innerHTML;
    var f = form.elements;

    f.Phone.addEventListener('blur', function () { f.Phone.value = formatPhone(f.Phone.value); });

    function fail(msg, field) {
      errorBox.textContent = msg;
      errorBox.hidden = false;
      if (field) { field.setAttribute('aria-invalid', 'true'); field.focus(); }
    }

    form.addEventListener('input', function (e) {
      if (e.target.removeAttribute) e.target.removeAttribute('aria-invalid');
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      errorBox.hidden = true;

      var first = f.FirstName.value.trim();
      var last = f.LastName.value.trim();
      var address = f.Address.value.trim();
      var phone = formatPhone(f.Phone.value);
      var email = f.Email.value.trim();

      if (!first) return fail('Please enter your first name.', f.FirstName);
      if (!last) return fail('Please enter your last name.', f.LastName);
      if (address.length < 5) return fail('Please enter your property address.', f.Address);
      if (phone.replace(/\D/g, '').length < 10) return fail('Please enter a phone number with area code.', f.Phone);
      if (!email || !f.Email.checkValidity()) return fail('Please enter a valid email address.', f.Email);

      // Bots fill the hidden field; humans never see it. Pretend it worked and send nothing.
      if (f._honey && f._honey.value) return showSuccess(first);

      var data = new FormData();
      data.append('FormType', FORM_TYPE);
      data.append('_subject', 'New Home Value Lead - ' + campaign + ' - S² Home Partners Real Estate Team');
      data.append('Name', first + ' ' + last);
      data.append('FirstName', first);
      data.append('LastName', last);
      data.append('Address', address);
      data.append('Phone', phone);
      data.append('Email', email);
      data.append('MailerMonth', month);
      if (ACTIVE && ACTIVE.preview) data.append('Preview', 'yes (opened with ?month=' + ACTIVE.key + ')');
      data.append('MailerTheme', theme);
      data.append('Campaign', campaign);
      data.append('Source', source);
      data.append('Page', location.pathname);
      data.append('Message',
        'Free Home Value Report request from the ' + campaign + ' (source: ' + source + ').\n' +
        'Mailer month: ' + month + (theme ? '\nMailer theme: ' + theme : '') + '\n' +
        'Name: ' + first + ' ' + last + '\nProperty: ' + address + '\nPhone: ' + phone + '\nEmail: ' + email);

      button.disabled = true;
      button.textContent = 'Sending…';

      var send = dryRun
        ? new Promise(function (resolve) {
            var out = {};
            data.forEach(function (v, k) { out[k] = v; });
            console.info('[landing] DRY RUN on localhost, nothing sent. Add ?live=1 to send for real.', out);
            setTimeout(resolve, 400);
          })
        : fetch(LEAD_BACKEND_URL, { method: 'POST', mode: 'no-cors', body: data });

      send.then(function () { showSuccess(first); })
        .catch(function () {
          button.disabled = false;
          button.innerHTML = buttonText;
          fail('Something went wrong sending your request. Please call ' + TEAM.phones[0].display + ' or email ' + TEAM.email + '.');
        });
    });

    function showSuccess(firstName) {
      form.hidden = true;
      if (!success) return;
      var nameSlot = success.querySelector('[data-lp-first-name]');
      if (nameSlot) nameSlot.textContent = firstName;
      success.hidden = false;
      var heading = success.querySelector('h3');
      if (heading) { heading.setAttribute('tabindex', '-1'); heading.focus(); }
    }
  }

  function init() {
    var header = document.querySelector('[data-lp-header]');
    var team = document.querySelector('[data-lp-team]');
    var footer = document.querySelector('[data-lp-footer]');
    if (header) renderHeader(header);
    if (team) renderTeam(team);
    if (footer) renderFooter(footer);
    if (window.LP_MONTHS) {
      ACTIVE = pickMonth(window.LP_MONTHS);
      if (ACTIVE) applyTheme(ACTIVE);
    }
    document.body.classList.remove('lp-loading');
    Array.prototype.forEach.call(document.querySelectorAll('form[data-lp-form]'), initForm);
    if (dryRun) console.info('[landing] Localhost dry-run mode: form submissions are logged, not sent. Source = ' + source);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

/* Shared script for the monthly mailer / pop-by landing pages in /value/.
   - Fills in the site header, team contact block and footer (one copy for every month)
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
      { label: 'Sarah Fuller', display: '850-328-9800', tel: '+18503289800' },
      { label: 'Sarah Luther', display: '434-713-1221', tel: '+14347131221' }
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
        '<a class="lp-topbar__logo" href="/index.html"><img src="/s2-home-partners-logo.png" alt="S² Home Partners | Momentum Realty"></a>' +
        '<div class="lp-topbar__actions">' +
          '<a class="lp-topbar__site" href="/index.html">Visit our website</a>' +
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
        '<p>&copy; ' + new Date().getFullYear() + ' S&sup2; Home Partners | Momentum Realty. All rights reserved.</p>' +
        '<nav aria-label="Footer">' +
          '<a href="/index.html">Home</a>' +
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

  function mailerMonth() {
    var m = location.pathname.match(/\/value\/(\d{4})-(\d{2})(?:\/|$)/);
    if (!m || +m[2] < 1 || +m[2] > 12) return 'Unknown month (' + location.pathname + ')';
    return MONTHS[+m[2] - 1] + ' ' + m[1];
  }

  function formatPhone(v) {
    var d = v.replace(/\D/g, '');
    if (d.length === 11 && d.charAt(0) === '1') d = d.slice(1);
    if (d.length !== 10) return v.trim();
    return '(' + d.slice(0, 3) + ') ' + d.slice(3, 6) + '-' + d.slice(6);
  }

  function initForm(form) {
    // The mailer month comes from the page's folder name (/value/2027-01/ -> "January 2027"),
    // so a copied page can't accidentally report last month. The theme comes from data-theme.
    var month = mailerMonth();
    var theme = (form.getAttribute('data-theme') || '').trim();
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
      data.append('_subject', 'New Home Value Lead - ' + campaign + ' - S2 Home Partners');
      data.append('Name', first + ' ' + last);
      data.append('FirstName', first);
      data.append('LastName', last);
      data.append('Address', address);
      data.append('Phone', phone);
      data.append('Email', email);
      data.append('MailerMonth', month);
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
    Array.prototype.forEach.call(document.querySelectorAll('form[data-lp-form]'), initForm);
    if (dryRun) console.info('[landing] Localhost dry-run mode: form submissions are logged, not sent. Source = ' + source);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

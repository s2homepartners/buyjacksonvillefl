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

/* Guide downloads: any link to the Listing Guide or Buyer's Guide opens a short form (name, phone, email).
   The request goes to the lead backend like the other site forms, then the PDF downloads.
   Details are remembered in this browser so a returning visitor only has to press the button. */
(function () {
  var LEAD_BACKEND_URL = 'https://script.google.com/macros/s/AKfycbybi0InSUyh5Rw45uFUlwg2t29wzsYxWrcKXWuf9NqH9Nprlf_YZ3htq-x4n0pr_I5p_w/exec';
  var STORE_KEY = 's2-guide-contact';
  var GUIDES = {
    'Listing-Guide.pdf': { title: 'Listing Guide', formType: 'Listing Guide Request' },
    'Buyers-Guide.pdf': { title: 'Buyer’s Guide', formType: 'Buyer\'s Guide Request' }
  };

  function guideFor(link) {
    var href = link.getAttribute('href') || '';
    var file = href.split('#')[0].split('?')[0].split('/').pop();
    return GUIDES[file] ? { href: href, title: GUIDES[file].title, formType: GUIDES[file].formType } : null;
  }

  function loadContact() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; } catch (e) { return {}; }
  }
  function saveContact(c) {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(c)); } catch (e) {}
  }

  function startDownload(href) {
    var a = document.createElement('a');
    a.href = href;
    a.setAttribute('download', '');
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  var FIELD = 'h-12 w-full rounded-xl border border-momentum-grayLight px-4 text-sm text-slate-800 placeholder:text-momentum-gray focus:border-momentum-blue focus:outline-none focus:ring-2 focus:ring-momentum-blue/30';
  var modal = document.createElement('div');
  modal.id = 'guide-modal';
  modal.className = 'fixed inset-0 z-[90] hidden items-center justify-center bg-slate-900/60 p-4';
  modal.innerHTML =
    '<div class="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl sm:p-8" role="dialog" aria-modal="true" aria-labelledby="guide-modal-title">' +
      '<button type="button" data-guide-close aria-label="Close" class="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-2xl leading-none text-momentum-gray transition-colors hover:text-momentum-blue">&times;</button>' +
      '<div data-guide-step="form">' +
        '<p class="text-xs font-bold uppercase tracking-widest text-teal-600">Free Download</p>' +
        '<h3 id="guide-modal-title" class="mt-1 font-serif text-2xl font-bold text-momentum-blue">Get the <span data-guide-title></span></h3>' +
        '<p class="mt-2 text-sm text-slate-600">Tell us where to reach you and your guide will download right away.</p>' +
        '<form class="mt-5 space-y-3" novalidate>' +
          '<div><label for="guide-name" class="sr-only">Full Name</label><input id="guide-name" type="text" name="Name" required autocomplete="name" placeholder="Full Name" class="' + FIELD + '" /></div>' +
          '<div><label for="guide-phone" class="sr-only">Phone</label><input id="guide-phone" type="tel" name="Phone" required autocomplete="tel" placeholder="Phone Number" class="' + FIELD + '" /></div>' +
          '<div><label for="guide-email" class="sr-only">Email</label><input id="guide-email" type="email" name="Email" required autocomplete="email" placeholder="Email Address" class="' + FIELD + '" /></div>' +
          '<p data-guide-error class="hidden text-sm text-rose-700"></p>' +
          '<button type="submit" class="flex h-12 w-full items-center justify-center rounded-xl bg-teal-600 text-sm font-bold text-white shadow-md transition-colors hover:bg-teal-700 disabled:opacity-60">Send My Guide</button>' +
          '<p class="text-center text-[11px] text-slate-500">We respect your privacy and never share your info outside our vetted network.</p>' +
        '</form>' +
      '</div>' +
      '<div data-guide-step="done" class="hidden py-4 text-center">' +
        '<p class="font-serif text-2xl font-bold text-momentum-blue">Thanks! Your guide is on its way.</p>' +
        '<p class="mt-2 text-sm text-slate-600">The download should start on its own. If it doesn’t, use the button below.</p>' +
        '<a data-guide-link download class="mt-5 inline-flex h-12 items-center justify-center rounded-xl bg-teal-600 px-6 text-sm font-bold text-white shadow-md transition-colors hover:bg-teal-700">Download the <span data-guide-title class="ml-1"></span></a>' +
      '</div>' +
    '</div>';

  var form, stepForm, stepDone, errorBox, submitBtn, current = null;

  function setTitle(t) {
    modal.querySelectorAll('[data-guide-title]').forEach(function (el) { el.textContent = t; });
  }

  function openModal(guide) {
    current = guide;
    setTitle(guide.title);
    var saved = loadContact();
    form.Name.value = saved.Name || '';
    form.Phone.value = saved.Phone || '';
    form.Email.value = saved.Email || '';
    errorBox.classList.add('hidden');
    submitBtn.disabled = false;
    stepForm.classList.remove('hidden');
    stepDone.classList.add('hidden');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.classList.add('overflow-hidden');
    var first = [form.Name, form.Phone, form.Email].filter(function (f) { return !f.value; })[0];
    (first || submitBtn).focus();
  }

  function closeModal() {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.body.classList.remove('overflow-hidden');
  }

  function showError(msg) {
    errorBox.textContent = msg;
    errorBox.classList.remove('hidden');
  }

  function init() {
    document.body.appendChild(modal);
    form = modal.querySelector('form');
    stepForm = modal.querySelector('[data-guide-step="form"]');
    stepDone = modal.querySelector('[data-guide-step="done"]');
    errorBox = modal.querySelector('[data-guide-error]');
    submitBtn = form.querySelector('button[type="submit"]');

    modal.addEventListener('click', function (e) {
      if (e.target === modal || e.target.closest('[data-guide-close]')) closeModal();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !modal.classList.contains('hidden')) closeModal();
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!current) return;
      var name = form.Name.value.trim();
      var phone = form.Phone.value.trim();
      var email = form.Email.value.trim();
      if (!name || !phone || !email) return showError('Please fill in your name, phone and email.');
      if (phone.replace(/\D/g, '').length < 10) return showError('Please enter a phone number with area code.');
      if (!form.Email.checkValidity()) return showError('Please enter a valid email address.');
      errorBox.classList.add('hidden');
      submitBtn.disabled = true;

      var data = new FormData();
      data.append('FormType', current.formType);
      data.append('_subject', 'New ' + current.formType + ' - S² Home Partners Real Estate Team');
      data.append('Name', name);
      data.append('Phone', phone);
      data.append('Email', email);
      data.append('Guide', current.title);
      data.append('Page', location.pathname);

      fetch(LEAD_BACKEND_URL, { method: 'POST', mode: 'no-cors', body: data })
        .then(function () {
          saveContact({ Name: name, Phone: phone, Email: email });
          modal.querySelector('[data-guide-link]').setAttribute('href', current.href);
          stepForm.classList.add('hidden');
          stepDone.classList.remove('hidden');
          startDownload(current.href);
        })
        .catch(function () {
          submitBtn.disabled = false;
          showError('Something went wrong. Please try again, or email us at S2HomePartners@gmail.com.');
        });
    });

    // Catch clicks on any guide link (menus, buttons, cards) before the browser downloads the file.
    document.addEventListener('click', function (e) {
      var link = e.target.closest && e.target.closest('a[href]');
      if (!link || link.hasAttribute('data-guide-link')) return;
      var guide = guideFor(link);
      if (!guide) return;
      e.preventDefault();
      openModal(guide);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

/* Nassau County events list: after 30 seconds, invite a signup once.
   Dismiss or submit hides it for 7 days (localStorage and a cookie).
   Not shown on the contact and home-value form pages.
   Posts to the same lead backend as the other site forms, tagged Nassau Events Signup. */
(function () {
  var KEY = 's2-nassau-events-signup';
  var COOKIE = 's2_nassau_events';
  var WEEK = 7 * 24 * 60 * 60 * 1000;
  var LEAD_BACKEND_URL = 'https://script.google.com/macros/s/AKfycbybi0InSUyh5Rw45uFUlwg2t29wzsYxWrcKXWuf9NqH9Nprlf_YZ3htq-x4n0pr_I5p_w/exec';

  function pathName() {
    var p = (location.pathname || '/').toLowerCase();
    if (p.length > 1 && p.charAt(p.length - 1) === '/') p = p.slice(0, -1);
    return p;
  }

  function isContactPage() {
    var p = pathName();
    var file = p.split('/').pop();
    if (file === 'get-started.html' || file === 'get-started') return true;
    if (file === 'lead-form-component.html' || file === 'lead-form-component') return true;
    if (p === '/value' || p.indexOf('/value/') === 0) return true;
    return false;
  }

  function readStamp() {
    var raw = null;
    try { raw = localStorage.getItem(KEY); } catch (e) {}
    if (!raw) {
      var match = document.cookie.match(/(?:^|; )s2_nassau_events=(\d+)/);
      if (match) raw = match[1];
    }
    var n = parseInt(raw, 10);
    return isNaN(n) ? 0 : n;
  }

  function remember() {
    var now = String(Date.now());
    try { localStorage.setItem(KEY, now); } catch (e) {}
    document.cookie = COOKIE + '=' + now + '; Max-Age=604800; Path=/; SameSite=Lax';
  }

  function recentlySeen() {
    var stamp = readStamp();
    return stamp && (Date.now() - stamp) < WEEK;
  }

  if (isContactPage() || recentlySeen()) return;

  function initSignup() {
    if (document.getElementById('nassau-events-modal')) return;
    var lastFocus = null;
    var modal = document.createElement('div');
    modal.id = 'nassau-events-modal';
    modal.className = 'fixed inset-0 z-[100] hidden items-end justify-center bg-slate-900/60 p-0 sm:items-center sm:p-4';
    modal.innerHTML =
      '<div role="dialog" aria-modal="true" aria-labelledby="nassau-events-title" aria-describedby="nassau-events-desc" class="relative max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-white p-5 pb-8 shadow-2xl sm:max-w-md sm:rounded-2xl sm:p-8">' +
        '<div data-events-step="form">' +
          '<div class="flex items-start justify-between gap-3">' +
            '<div>' +
              '<p class="text-xs font-bold uppercase tracking-widest text-teal-600">Nassau County</p>' +
              '<h2 id="nassau-events-title" class="mt-1 font-serif text-2xl font-bold text-momentum-blue">Don&rsquo;t miss what&rsquo;s coming up in Nassau County</h2>' +
            '</div>' +
            '<button type="button" data-events-close class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-2xl leading-none text-momentum-gray hover:text-momentum-blue" aria-label="Close">×</button>' +
          '</div>' +
          '<p id="nassau-events-desc" class="mt-2 text-sm leading-relaxed text-slate-600">Get a note when we add parades, tree lightings and local sales. First name and email. Phone is optional.</p>' +
          '<form class="mt-5 space-y-3" novalidate>' +
            '<div><label for="nassau-events-name" class="mb-1 block text-xs font-bold uppercase text-slate-700">First name</label><input id="nassau-events-name" name="Name" type="text" required autocomplete="given-name" class="h-12 w-full rounded-xl border border-momentum-grayLight px-4 text-base text-slate-800 focus:border-momentum-blue focus:outline-none focus:ring-2 focus:ring-momentum-blue/30" /></div>' +
            '<div><label for="nassau-events-email" class="mb-1 block text-xs font-bold uppercase text-slate-700">Email</label><input id="nassau-events-email" name="Email" type="email" required autocomplete="email" class="h-12 w-full rounded-xl border border-momentum-grayLight px-4 text-base text-slate-800 focus:border-momentum-blue focus:outline-none focus:ring-2 focus:ring-momentum-blue/30" /></div>' +
            '<div><label for="nassau-events-phone" class="mb-1 block text-xs font-bold uppercase text-slate-700">Phone <span class="font-medium normal-case text-slate-500">(optional)</span></label><input id="nassau-events-phone" name="Phone" type="tel" autocomplete="tel" class="h-12 w-full rounded-xl border border-momentum-grayLight px-4 text-base text-slate-800 focus:border-momentum-blue focus:outline-none focus:ring-2 focus:ring-momentum-blue/30" /></div>' +
            '<p data-events-error class="hidden text-sm text-rose-700" role="alert"></p>' +
            '<button type="submit" class="flex h-12 w-full items-center justify-center rounded-xl bg-teal-600 text-sm font-bold text-white hover:bg-teal-700 disabled:opacity-60">Send me events</button>' +
            '<button type="button" data-events-close class="flex h-11 w-full items-center justify-center text-sm font-semibold text-momentum-gray hover:text-momentum-blue">No thanks</button>' +
            '<p class="text-center text-[11px] leading-relaxed text-slate-500">S² Home Partners Real Estate Team, brokered by Momentum Realty. We use this to share local events, not a mailing list we sell.</p>' +
          '</form>' +
        '</div>' +
        '<div data-events-step="done" class="hidden py-6 pr-8 text-center">' +
          '<p class="font-serif text-2xl font-bold text-momentum-blue">You&rsquo;re on the list.</p>' +
          '<p class="mt-2 text-sm text-slate-600">We&rsquo;ll send Nassau County events to that email.</p>' +
          '<button type="button" data-events-close class="mt-5 inline-flex h-12 items-center justify-center rounded-xl bg-teal-600 px-6 text-sm font-bold text-white hover:bg-teal-700">Close</button>' +
        '</div>' +
      '</div>';

    var dialog, form, errorBox, stepForm, stepDone, submitBtn;

    function focusables() {
      return Array.prototype.slice.call(dialog.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), textarea, select')).filter(function (el) {
        return el.offsetParent !== null || el === document.activeElement;
      });
    }

    function setPageChrome(hidden) {
      ['mobile-bottom-nav', 'ask-sarah-fab', 'desktop-quick-actions'].forEach(function (id) {
        var el = document.getElementById(id);
        if (el) el.classList.toggle('invisible', hidden);
      });
    }

    function open() {
      if (recentlySeen() || !modal.classList.contains('hidden')) return;
      lastFocus = document.activeElement;
      modal.classList.remove('hidden');
      modal.classList.add('flex');
      document.body.classList.add('overflow-hidden');
      setPageChrome(true);
      var name = document.getElementById('nassau-events-name');
      (name || dialog).focus();
    }

    function close() {
      remember();
      modal.classList.add('hidden');
      modal.classList.remove('flex');
      document.body.classList.remove('overflow-hidden');
      setPageChrome(false);
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    function showError(msg) {
      errorBox.textContent = msg;
      errorBox.classList.remove('hidden');
    }

    document.body.appendChild(modal);
    dialog = modal.querySelector('[role="dialog"]');
    form = modal.querySelector('form');
    errorBox = modal.querySelector('[data-events-error]');
    stepForm = modal.querySelector('[data-events-step="form"]');
    stepDone = modal.querySelector('[data-events-step="done"]');
    submitBtn = form.querySelector('button[type="submit"]');

    modal.addEventListener('click', function (e) {
      if (e.target === modal || e.target.closest('[data-events-close]')) close();
    });
    document.addEventListener('keydown', function (e) {
      if (modal.classList.contains('hidden')) return;
      if (e.key === 'Escape') { e.preventDefault(); close(); return; }
      if (e.key !== 'Tab') return;
      var items = focusables();
      if (!items.length) return;
      var first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = form.Name.value.trim();
      var email = form.Email.value.trim();
      var phone = form.Phone.value.trim();
      if (!name || !email) return showError('Please add your first name and email.');
      if (!form.Email.checkValidity()) return showError('Please enter a valid email address.');
      if (phone && phone.replace(/\D/g, '').length < 10) return showError('Add a 10-digit phone, or leave it blank.');
      errorBox.classList.add('hidden');
      submitBtn.disabled = true;
      var data = new FormData();
      data.append('FormType', 'Nassau Events Signup');
      data.append('source', 'Nassau Events Signup');
      data.append('_subject', 'Nassau Events Signup - S² Home Partners Real Estate Team');
      data.append('Name', name);
      data.append('Email', email);
      data.append('Phone', phone);
      data.append('Page', location.pathname);
      fetch(LEAD_BACKEND_URL, { method: 'POST', mode: 'no-cors', body: data })
        .then(function () {
          remember();
          stepForm.classList.add('hidden');
          stepDone.classList.remove('hidden');
          stepDone.querySelector('button').focus();
        })
        .catch(function () {
          submitBtn.disabled = false;
          showError('Something went wrong. Email us at S2HomePartners@gmail.com.');
        });
    });

    setTimeout(open, 30000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initSignup);
  else initSignup();
})();

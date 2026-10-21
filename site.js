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
      data.append('_subject', 'New ' + current.formType + ' - S2 Home Partners');
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

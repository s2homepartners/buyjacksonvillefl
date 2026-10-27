/* Seller Portal
   Sellers sign in with an emailed link (Firebase Authentication, no passwords). The nightly updater
   (seller-portal-backend/Code.gs) writes one report per listing to Firestore:
     sellers/{email}       -> { listingIds: [...] }
     listings/{listingId}  -> { sellerEmails: [...], report: "<JSON>", updatedAt }
   firestore.rules only lets a signed-in seller read their own sellers/ doc and the listings that list
   their email, so nobody can see another seller's listing.
   Add ?demo to the URL to preview the page with sample data (nothing is read from Firebase). */

const SDK = 'https://www.gstatic.com/firebasejs/10.12.2/';
const EMAIL_KEY = 's2-portal-signin-email';
const config = window.SELLER_PORTAL_FIREBASE || {};
const demo = new URLSearchParams(location.search).has('demo');

const $ = (id) => document.getElementById(id);
const VIEWS = ['portal-loading', 'portal-setup', 'portal-signin', 'portal-check-email', 'portal-confirm-email', 'portal-nolisting', 'portal-dashboard'];
function show(id) { VIEWS.forEach((v) => $(v).classList.toggle('hidden', v !== id)); }

function store(key, value) { try { value == null ? localStorage.removeItem(key) : localStorage.setItem(key, value); } catch (e) {} }
function recall(key) { try { return localStorage.getItem(key); } catch (e) { return null; } }

/* ---------- formatting ---------- */
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const has = (v) => v !== null && v !== undefined && v !== '' && !(typeof v === 'number' && isNaN(v));
const money = (v) => (has(v) ? '$' + Math.round(v).toLocaleString('en-US') : '—');
const num = (v, d = 0) => (has(v) ? Number(v).toLocaleString('en-US', { maximumFractionDigits: d, minimumFractionDigits: d }) : '—');
const pct = (v, d = 1) => (has(v) ? Number(v).toFixed(d) + '%' : '—');
function date(v, opts = { month: 'short', day: 'numeric', year: 'numeric' }) {
  if (!v) return '—';
  const d = new Date(v);
  return isNaN(d) ? esc(v) : d.toLocaleDateString('en-US', opts);
}

/* ---------- dashboard ---------- */
const CARD = 'rounded-2xl border border-momentum-grayLight bg-white p-6 shadow-sm sm:p-8';
const H2 = 'font-serif text-2xl font-bold text-momentum-blue';
const EYEBROW = 'text-xs font-bold uppercase tracking-widest text-teal-600';

function section(eyebrow, title, body, intro = '') {
  return `<section class="${CARD}">
    <p class="${EYEBROW}">${esc(eyebrow)}</p>
    <h2 class="mt-1 ${H2}">${esc(title)}</h2>
    ${intro ? `<p class="mt-1 text-sm text-slate-600">${intro}</p>` : ''}
    <div class="mt-5">${body}</div>
  </section>`;
}

function tile(label, value, sub = '') {
  return `<div class="rounded-xl bg-momentum-bgLight p-4">
    <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">${esc(label)}</p>
    <p class="mt-1 font-serif text-2xl font-bold text-momentum-blue">${value}</p>
    ${sub ? `<p class="mt-0.5 text-xs text-slate-500">${sub}</p>` : ''}
  </div>`;
}

function empty(text) { return `<p class="rounded-xl bg-momentum-bgLight p-4 text-sm text-slate-500">${esc(text)}</p>`; }

function renderHeader(r) {
  const l = r.listing;
  const facts = [
    ['List price', money(l.price)],
    ['Days on market', num(l.daysOnMarket)],
    ['Listed', date(l.listDate)],
    ['Beds / Baths', has(l.beds) ? `${num(l.beds)} / ${num(l.baths, 1).replace('.0', '')}` : '—'],
    ['Sq ft', num(l.sqft)],
    ['Price / sq ft', money(l.pricePerSqft)],
  ];
  return `<section class="overflow-hidden rounded-2xl border border-momentum-grayLight bg-white shadow-sm md:flex">
    ${l.photo ? `<img src="${esc(l.photo)}" alt="${esc(l.address)}" class="h-56 w-full object-cover md:h-auto md:w-2/5" />` : ''}
    <div class="flex-1 p-6 sm:p-8">
      <div class="flex flex-wrap items-center gap-3">
        <span class="rounded-full bg-teal-600 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">${esc(l.status || 'Active')}</span>
        ${l.mls ? `<span class="text-xs text-slate-500">MLS #${esc(l.mls)}</span>` : ''}
      </div>
      <h2 class="mt-3 font-serif text-3xl font-bold leading-tight text-momentum-blue">${esc(l.address)}</h2>
      <dl class="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
        ${facts.map(([k, v]) => `<div><dt class="text-xs font-semibold uppercase tracking-wide text-slate-500">${k}</dt><dd class="mt-0.5 text-lg font-semibold text-slate-800">${v}</dd></div>`).join('')}
      </dl>
      <div class="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
        ${l.link ? `<a href="${esc(l.link)}" target="_blank" rel="noopener noreferrer" class="font-semibold text-momentum-blue underline hover:text-teal-700">View your listing</a>` : ''}
        <span class="text-slate-500">Updated ${date(r.updatedAt, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</span>
      </div>
    </div>
  </section>`;
}

function renderNote(r) {
  if (!r.listing.agentNote) return '';
  return `<section class="rounded-2xl border-l-4 border-teal-600 bg-white p-6 shadow-sm">
    <p class="${EYEBROW}">A note from Sarah &amp; Sarah</p>
    <p class="mt-2 whitespace-pre-line text-base leading-relaxed text-slate-700">${esc(r.listing.agentNote)}</p>
  </section>`;
}

function renderMarketing(items) {
  if (!items.length) return section('What we are doing', 'Your Marketing Plan', empty('Your marketing plan will appear here shortly.'));
  const done = items.filter((i) => /done|complete/i.test(i.status)).length;
  const icon = (s) => /done|complete/i.test(s)
    ? '<span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-600 text-xs font-bold text-white">&check;</span>'
    : /progress|underway|ongoing/i.test(s)
      ? '<span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-amber-500"><span class="h-2.5 w-2.5 rounded-full bg-amber-500"></span></span>'
      : '<span class="h-6 w-6 shrink-0 rounded-full border-2 border-momentum-grayLight"></span>';
  const body = `<div class="mb-5">
      <div class="flex justify-between text-sm"><span class="font-semibold text-slate-700">${done} of ${items.length} steps complete</span></div>
      <div class="mt-2 h-2 overflow-hidden rounded-full bg-momentum-bgLight"><div class="h-full rounded-full bg-teal-600" style="width:${Math.round((done / items.length) * 100)}%"></div></div>
    </div>
    <ul class="divide-y divide-momentum-grayLight">
      ${items.map((i) => `<li class="flex gap-3 py-3">${icon(i.status)}
        <div class="min-w-0 flex-1">
          <div class="flex flex-wrap items-baseline justify-between gap-x-3"><p class="font-semibold text-slate-800">${esc(i.step)}</p><p class="text-xs text-slate-500">${esc(i.status || 'Planned')}${i.date ? ' · ' + date(i.date) : ''}</p></div>
          ${i.notes ? `<p class="mt-0.5 text-sm text-slate-600">${esc(i.notes)}</p>` : ''}
        </div></li>`).join('')}
    </ul>`;
  return section('What we are doing', 'Your Marketing Plan', body);
}

function renderShowings(r) {
  const fb = r.feedback || [];
  const t = r.exposure?.totals || {};
  const tiles = `<div class="grid grid-cols-2 gap-3">
    ${tile('Showings', num(t.showings))}
    ${tile('Feedback received', num(fb.length))}
  </div>`;
  const list = fb.length
    ? `<ul class="mt-5 space-y-3">${fb.map((f) => `<li class="rounded-xl border border-momentum-grayLight p-4">
        <div class="flex flex-wrap items-baseline justify-between gap-x-3 text-xs text-slate-500"><span>${date(f.date)}${f.agent ? ' · ' + esc(f.agent) : ''}</span>${f.interest ? `<span class="font-semibold text-momentum-blue">Interest: ${esc(f.interest)}</span>` : ''}</div>
        ${f.price ? `<p class="mt-1 text-sm text-slate-700"><span class="font-semibold">Price opinion:</span> ${esc(f.price)}</p>` : ''}
        ${f.comments ? `<p class="mt-1 whitespace-pre-line text-sm text-slate-600">${esc(f.comments)}</p>` : ''}
      </li>`).join('')}</ul>`
    : `<div class="mt-5">${empty('Showing feedback will appear here as agents send it in.')}</div>`;
  return section('Buyer activity', 'Showings & Feedback', tiles + list);
}

function renderExposure(exp) {
  const weeks = exp?.weeks || [];
  if (!weeks.length) return section('Online exposure', 'Views & Saves', empty('Weekly views and saves from Zillow, Realtor.com and Homes.com will appear here.'));
  const sites = [['zillow', 'Zillow'], ['realtor', 'Realtor.com'], ['homes', 'Homes.com']];
  const t = exp.totals;
  const tiles = `<div class="grid grid-cols-1 gap-3 sm:grid-cols-3">${sites.map(([k, name]) => tile(name, num(t[k + 'Views']) + ' <span class="text-sm font-normal text-slate-500">views</span>', num(t[k + 'Saves']) + ' saves')).join('')}</div>`;
  const th = 'px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500';
  const td = 'px-3 py-2 text-sm text-slate-700';
  const table = `<div class="mt-5 overflow-x-auto"><table class="min-w-full divide-y divide-momentum-grayLight">
    <thead><tr><th class="${th}">Week of</th><th class="${th}">Showings</th>${sites.map(([, n]) => `<th class="${th}">${n} views / saves</th>`).join('')}</tr></thead>
    <tbody class="divide-y divide-momentum-grayLight">${weeks.map((w) => `<tr><td class="${td} whitespace-nowrap">${date(w.week, { month: 'short', day: 'numeric' })}</td><td class="${td}">${num(w.showings)}</td>${sites.map(([k]) => `<td class="${td}">${num(w[k + 'Views'])} / ${num(w[k + 'Saves'])}</td>`).join('')}</tr>`).join('')}</tbody>
  </table></div>`;
  return section('Online exposure', 'Views & Saves', tiles + table, 'How many people are finding your home on the major home search sites.');
}

function compsTable(rows, sold) {
  if (!rows?.length) return empty(sold ? 'No recent sales to show.' : 'None right now.');
  const th = 'px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500';
  const td = 'px-3 py-2 text-sm text-slate-700 whitespace-nowrap';
  return `<div class="overflow-x-auto"><table class="min-w-full divide-y divide-momentum-grayLight">
    <thead><tr><th class="${th}">Address</th><th class="${th}">${sold ? 'Sold price' : 'Price'}</th><th class="${th}">Beds / Baths</th><th class="${th}">Sq ft</th><th class="${th}">$ / sq ft</th><th class="${th}">Days on market</th>${sold ? `<th class="${th}">Sold</th>` : ''}</tr></thead>
    <tbody class="divide-y divide-momentum-grayLight">${rows.map((c) => `<tr>
      <td class="${td}"><span class="font-semibold text-slate-800">${esc(c.address)}</span>${c.newConstruction ? ' <span class="ml-1 rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold uppercase text-amber-800">New build</span>' : ''}</td>
      <td class="${td}">${money(sold ? c.soldPrice : c.price)}</td>
      <td class="${td}">${has(c.beds) ? num(c.beds) + ' / ' + num(c.baths, 1).replace('.0', '') : '—'}</td>
      <td class="${td}">${num(c.sqft)}</td>
      <td class="${td}">${money(c.pricePerSqft)}</td>
      <td class="${td}">${num(c.dom)}</td>
      ${sold ? `<td class="${td}">${date(c.closeDate)}</td>` : ''}
    </tr>`).join('')}</tbody></table></div>`;
}

function renderComps(r) {
  const c = r.comps || {};
  const cmp = r.compare || {};
  if (!c.active?.length && !c.pending?.length && !c.sold?.length) {
    return section('Your competition', 'How Your Home Compares', empty('Comparable homes in your ZIP code will appear here after our next market update.'));
  }
  const bars = [['Your home', cmp.yourPricePerSqft, 'bg-teal-600'], ['Active competition (median)', cmp.activeMedianPricePerSqft, 'bg-momentum-blue'], ['Recently sold (median)', cmp.soldMedianPricePerSqft, 'bg-slate-400']].filter((b) => has(b[1]));
  const max = Math.max(...bars.map((b) => b[1]), 1);
  const chart = bars.length ? `<div class="space-y-3">${bars.map(([label, v, color]) => `<div>
      <div class="flex justify-between text-sm"><span class="text-slate-700">${label}</span><span class="font-semibold text-slate-800">${money(v)} / sq ft</span></div>
      <div class="mt-1 h-3 overflow-hidden rounded-full bg-momentum-bgLight"><div class="h-full rounded-full ${color}" style="width:${Math.round((v / max) * 100)}%"></div></div>
    </div>`).join('')}</div>` : '';
  const block = (title, rows, sold) => `<div class="mt-8"><h3 class="font-serif text-lg font-bold text-momentum-blue">${title} <span class="text-sm font-normal text-slate-500">(${rows?.length || 0})</span></h3><div class="mt-2">${compsTable(rows, sold)}</div></div>`;
  return section('Your competition', 'How Your Home Compares', chart
    + block('Active competition', c.active, false)
    + block('Under contract', c.pending, false)
    + block('Recently sold', c.sold, true)
    + (c.asOf ? `<p class="mt-4 text-xs text-slate-500">Comparable homes from the MLS as of ${date(c.asOf)}.</p>` : ''),
  'Homes buyers are comparing yours to, and what similar homes have sold for.');
}

function marketLabel(months) {
  if (!has(months)) return '';
  if (months < 4) return "Seller's market";
  if (months <= 6) return 'Balanced market';
  return "Buyer's market";
}

function renderZip(r) {
  const z = r.zip || {};
  const zipCode = r.listing.zip || '';
  if (!has(z.active) && !has(z.soldLast90)) return section('Your neighborhood', `ZIP Code ${zipCode}`, empty('ZIP code statistics will appear here after our next market update.'));
  const tiles = `<div class="grid grid-cols-2 gap-3 md:grid-cols-4">
    ${tile('Active listings', num(z.active), has(z.newConstructionActive) ? `${num(z.newConstructionActive)} new construction` : '')}
    ${tile('Under contract', num(z.pending))}
    ${tile('Sold (90 days)', num(z.soldLast90))}
    ${tile('Months of supply', num(z.monthsOfSupply, 1), marketLabel(z.monthsOfSupply))}
    ${tile('Median sold price', money(z.medianSoldPrice))}
    ${tile('Median $ / sq ft', money(z.medianSoldPricePerSqft))}
    ${tile('Median days on market', num(z.medianDom))}
    ${tile('Sale-to-list price', pct(z.saleToList))}
  </div>`;
  return section('Your neighborhood', `ZIP Code ${zipCode}`, tiles, 'How the whole market in your ZIP code is moving, including new construction you are competing with.');
}

function sparkline(points) {
  if (!points || points.length < 2) return '';
  const vals = points.map((p) => p.value);
  const min = Math.min(...vals), max = Math.max(...vals), span = max - min || 1;
  const w = 300, h = 60;
  const xy = vals.map((v, i) => `${((i / (vals.length - 1)) * w).toFixed(1)},${(h - 4 - ((v - min) / span) * (h - 8)).toFixed(1)}`).join(' ');
  return `<svg viewBox="0 0 ${w} ${h}" class="mt-3 h-16 w-full" preserveAspectRatio="none" aria-hidden="true"><polyline points="${xy}" fill="none" stroke="#3F7A68" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke" /></svg>
    <div class="flex justify-between text-[11px] text-slate-500"><span>${date(points[0].date, { month: 'short', year: 'numeric' })}</span><span>${date(points[points.length - 1].date, { month: 'short', year: 'numeric' })}</span></div>`;
}

function change(now, then, label) {
  if (!has(now) || !has(then)) return '';
  const d = now - then;
  const dir = d > 0.005 ? 'up' : d < -0.005 ? 'down' : 'unchanged';
  return `${dir === 'unchanged' ? 'Unchanged' : (dir === 'up' ? 'Up ' : 'Down ') + Math.abs(d).toFixed(2) + ' pts'} ${label}`;
}

function renderMarket(r) {
  const m = r.market || {};
  const rates = has(m.rate30) ? `<div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div class="rounded-xl bg-momentum-bgLight p-4">
        <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">30-year fixed rate</p>
        <p class="mt-1 font-serif text-3xl font-bold text-momentum-blue">${pct(m.rate30, 2)}</p>
        <p class="mt-0.5 text-xs text-slate-500">${[change(m.rate30, m.rate30WeekAgo, 'from last week'), change(m.rate30, m.rate30YearAgo, 'from a year ago')].filter(Boolean).join(' · ')}</p>
        ${sparkline(m.rate30Series)}
      </div>
      <div class="rounded-xl bg-momentum-bgLight p-4">
        <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">15-year fixed rate</p>
        <p class="mt-1 font-serif text-3xl font-bold text-momentum-blue">${pct(m.rate15, 2)}</p>
        <p class="mt-0.5 text-xs text-slate-500">${[change(m.rate15, m.rate15WeekAgo, 'from last week'), change(m.rate15, m.rate15YearAgo, 'from a year ago')].filter(Boolean).join(' · ')}</p>
      </div>
    </div>
    <p class="mt-3 text-xs text-slate-500">Freddie Mac weekly average${m.rateDate ? ', week of ' + date(m.rateDate) : ''}. Lower rates raise what buyers can afford.</p>` : empty('Interest rate data will appear after our next market update.');
  const note = m.note ? `<div class="mt-6 rounded-xl border-l-4 border-teal-600 bg-momentum-bgLight p-4"><p class="text-xs font-bold uppercase tracking-widest text-teal-600">Our take on the market</p><p class="mt-1 whitespace-pre-line text-sm leading-relaxed text-slate-700">${esc(m.note)}</p></div>` : '';
  return section('The bigger picture', 'Market Conditions', rates + note);
}

function renderDashboard(report, email, onSignOut) {
  const d = $('portal-dashboard');
  d.innerHTML = `<div class="space-y-6">
    <div class="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
      <span>Signed in as <strong class="text-slate-800">${esc(email)}</strong></span>
      <button type="button" data-portal-signout class="font-semibold text-momentum-blue underline hover:text-teal-700">Sign out</button>
    </div>
    ${renderHeader(report)}
    ${renderNote(report)}
    <div class="grid gap-6 lg:grid-cols-2">${renderMarketing(report.marketing || [])}${renderShowings(report)}</div>
    ${renderExposure(report.exposure)}
    ${renderComps(report)}
    ${renderZip(report)}
    ${renderMarket(report)}
    <p class="text-center text-xs text-slate-500">This page is private to you. Market figures come from the MLS and public sources and are updated daily; they are estimates, not an appraisal.</p>
  </div>`;
  show('portal-dashboard');
  d.querySelectorAll('[data-portal-signout]').forEach((b) => b.addEventListener('click', onSignOut));
}

/* ---------- sample data for ?demo ---------- */
function sampleReport() {
  const today = new Date();
  const ago = (n) => new Date(today.getTime() - n * 864e5).toISOString().slice(0, 10);
  const series = Array.from({ length: 26 }, (_, i) => ({ date: ago((25 - i) * 7), value: +(6.9 - i * 0.03 + Math.sin(i / 3) * 0.06).toFixed(2) }));
  return {
    updatedAt: today.toISOString(),
    listing: { address: '123 Sample Lane, Yulee, FL 32097', zip: '32097', status: 'Active', price: 449900, listDate: ago(24), daysOnMarket: 24, mls: '0000000', beds: 4, baths: 2.5, sqft: 2210, pricePerSqft: 203.6, photo: 'images/eagle-harbor.webp', link: '', agentNote: 'Sample note: Great turnout at Saturday’s open house. Two agents asked for disclosures, so we expect a second showing this week.' },
    marketing: [
      { step: 'Pricing strategy & market analysis', status: 'Done', date: ago(30) },
      { step: 'Professional photography', status: 'Done', date: ago(27) },
      { step: 'Video & drone tour', status: 'Done', date: ago(26) },
      { step: 'Live on MLS (sent to Zillow, Realtor.com, Homes.com)', status: 'Done', date: ago(24) },
      { step: 'Social media launch', status: 'Done', date: ago(23), notes: 'Facebook, Instagram, TikTok and YouTube.' },
      { step: 'Email to local agent network', status: 'Done', date: ago(22) },
      { step: 'Open house', status: 'In Progress', date: ago(-3), notes: 'Saturday 11 to 2.' },
      { step: 'Two-week price & feedback review', status: 'Planned', date: ago(-6) },
    ],
    feedback: [
      { date: ago(2), agent: 'Sample Agent', interest: 'High', price: 'About right', comments: 'Buyers loved the kitchen and the backyard. Considering a second showing.' },
      { date: ago(6), agent: 'Sample Agent', interest: 'Medium', price: 'A little high', comments: 'Liked the layout; compared it with a new build nearby.' },
    ],
    exposure: {
      weeks: [
        { week: ago(14), showings: 4, zillowViews: 612, zillowSaves: 31, realtorViews: 288, realtorSaves: 12, homesViews: 140, homesSaves: 5 },
        { week: ago(7), showings: 3, zillowViews: 455, zillowSaves: 22, realtorViews: 230, realtorSaves: 9, homesViews: 118, homesSaves: 4 },
        { week: ago(0), showings: 2, zillowViews: 390, zillowSaves: 17, realtorViews: 201, realtorSaves: 7, homesViews: 96, homesSaves: 3 },
      ],
      totals: { showings: 9, zillowViews: 1457, zillowSaves: 70, realtorViews: 719, realtorSaves: 28, homesViews: 354, homesSaves: 12 },
    },
    comps: {
      asOf: ago(1),
      active: [
        { address: '45 Example Ct', price: 465000, beds: 4, baths: 3, sqft: 2300, pricePerSqft: 202.2, dom: 41 },
        { address: '78 Model Home Way', price: 479990, beds: 4, baths: 2.5, sqft: 2260, pricePerSqft: 212.4, dom: 12, newConstruction: true },
      ],
      pending: [{ address: '9 Demo Dr', price: 439000, beds: 3, baths: 2, sqft: 2050, pricePerSqft: 214.1, dom: 18 }],
      sold: [
        { address: '210 Placeholder Pl', soldPrice: 442500, beds: 4, baths: 2.5, sqft: 2180, pricePerSqft: 203.0, dom: 33, closeDate: ago(20) },
        { address: '5 Illustration Ave', soldPrice: 455000, beds: 4, baths: 3, sqft: 2290, pricePerSqft: 198.7, dom: 47, closeDate: ago(52) },
      ],
    },
    compare: { yourPricePerSqft: 203.6, activeMedianPricePerSqft: 207.3, soldMedianPricePerSqft: 200.9 },
    zip: { active: 142, newConstructionActive: 38, pending: 61, soldLast90: 118, monthsOfSupply: 3.6, medianSoldPrice: 412000, medianSoldPricePerSqft: 198, medianDom: 39, saleToList: 97.6 },
    market: { rate30: series[25].value, rate30WeekAgo: series[24].value, rate30YearAgo: 6.95, rate15: 5.62, rate15WeekAgo: 5.66, rate15YearAgo: 6.1, rateDate: ago(3), rate30Series: series, note: 'Sample note: Rates have eased this fall, bringing more buyers back. New construction incentives remain the main competition in this ZIP.' },
  };
}

/* ---------- sign-in flow ---------- */
async function main() {
  if (demo) { renderDashboard(sampleReport(), 'sample@example.com', () => { location.href = location.pathname; }); return; }
  if (!config.apiKey) { show('portal-setup'); return; }

  const [{ initializeApp }, authMod, fsMod] = await Promise.all([
    import(SDK + 'firebase-app.js'), import(SDK + 'firebase-auth.js'), import(SDK + 'firebase-firestore.js'),
  ]);
  const app = initializeApp(config);
  const auth = authMod.getAuth(app);
  const db = fsMod.getFirestore(app);

  const signOutNow = async () => { await authMod.signOut(auth); store(EMAIL_KEY, null); show('portal-signin'); };
  document.querySelectorAll('[data-portal-signout]').forEach((b) => b.addEventListener('click', signOutNow));

  // Coming back from the emailed link.
  if (authMod.isSignInWithEmailLink(auth, location.href)) {
    const finish = async (email) => {
      await authMod.signInWithEmailLink(auth, email, location.href);
      store(EMAIL_KEY, null);
      history.replaceState(null, '', location.pathname);
    };
    const saved = recall(EMAIL_KEY);
    if (saved) {
      try { await finish(saved); } catch (e) { show('portal-signin'); showError('portal-signin-error', 'That sign-in link has expired or was already used. Please request a new one.'); return; }
    } else {
      show('portal-confirm-email');
      $('portal-confirm-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = $('portal-confirm-input').value.trim().toLowerCase();
        try { await finish(email); } catch (err) { showError('portal-confirm-error', 'That email doesn’t match the link, or the link has expired. Please request a new one.'); }
      });
      return;
    }
  }

  $('portal-signin-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const input = $('portal-email');
    const email = input.value.trim().toLowerCase();
    if (!input.checkValidity() || !email) return showError('portal-signin-error', 'Please enter a valid email address.');
    const btn = e.target.querySelector('button');
    btn.disabled = true;
    try {
      await authMod.sendSignInLinkToEmail(auth, email, { url: location.origin + location.pathname, handleCodeInApp: true });
      store(EMAIL_KEY, email);
      $('portal-sent-to').textContent = email;
      show('portal-check-email');
    } catch (err) {
      showError('portal-signin-error', 'We couldn’t send the link just now. Please try again in a minute.');
    } finally { btn.disabled = false; }
  });

  authMod.onAuthStateChanged(auth, async (user) => {
    if (!user) { if (!authMod.isSignInWithEmailLink(auth, location.href)) show('portal-signin'); return; }
    const email = (user.email || '').toLowerCase();
    show('portal-loading');
    try {
      const seller = await fsMod.getDoc(fsMod.doc(db, 'sellers', email));
      const ids = seller.exists() ? seller.data().listingIds || [] : [];
      for (const id of ids) {
        const snap = await fsMod.getDoc(fsMod.doc(db, 'listings', id)).catch(() => null);
        if (snap && snap.exists()) { renderDashboard(JSON.parse(snap.data().report), email, signOutNow); return; }
      }
    } catch (err) { /* treated as no listing below */ }
    document.querySelectorAll('[data-portal-email]').forEach((el) => { el.textContent = email; });
    show('portal-nolisting');
  });
}

function showError(id, msg) { const el = $(id); el.textContent = msg; el.classList.remove('hidden'); }

main().catch(() => show('portal-setup'));

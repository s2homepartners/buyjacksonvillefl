#!/usr/bin/env python3
"""Rebuild the military base directory from data/bases.json.

Edit data/bases.json, then from the site folder run:

    python3 scripts/build-bases.py

That refreshes military-bases.html, every page in bases/, sitemap.xml,
and the base-page section of _redirects.

Each record:
  slug            short web address, lowercase with hyphens (fort-bragg)
  name            current official installation name
  branch          Army, Navy, Marine Corps, Air Force, Space Force,
                  Coast Guard, Joint, or National Guard
  city, state     where the installation sits (state is the full name)
  stateCode       two-letter postal code, or PR / GU
  towns           nearby towns families commonly look at
  mission         one factual public sentence (what the base is known for)
  alsoKnownAs     optional former or search names
  officialSite    optional official .mil (or academy) URL. Leave it out if unsure.
  housingUrl      optional housing-office URL. Leave it out if unsure.
  servedDirectly  true only for installations S² Home Partners serves itself
  localGuide      optional path to an existing on-site guide
  intro           optional full intro. If omitted, the page is written from
                  the mission, city, and towns so it is not a copied paragraph.
"""

import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data" / "bases.json"
SITEMAP = ROOT / "sitemap.xml"
REDIRECTS = ROOT / "_redirects"
SITE = "https://buyjacksonvillefl.com"
BAH = "https://www.travel.dod.mil/Allowances/Basic-Allowance-for-Housing/BAH-Rate-Lookup/"
ONESOURCE = "https://www.militaryonesource.mil/"
INSTALLATIONS = "https://installations.militaryonesource.mil/"

BRANCHES = [
    "Army",
    "Navy",
    "Marine Corps",
    "Air Force",
    "Space Force",
    "Coast Guard",
    "Joint",
    "National Guard",
]

FRAMES = [
    "{name} is a {branch} installation in {city}, {state}. {mission} Families often start their housing search in {towns}.",
    "Orders to {name} put you in {city}, {state}. {mission} Nearby towns people compare include {towns}.",
    "{name}, in {city}, {state}, is part of the {branch}. {mission} House-hunting usually includes {towns}.",
    "A PCS to {name} means {city}, {state}. {mission} Families usually compare {towns}.",
]


def esc(value):
    return html.escape(str(value), quote=True)


def town_phrase(towns):
    towns = [t for t in towns if t]
    if not towns:
        return "the surrounding communities"
    if len(towns) == 1:
        return towns[0]
    if len(towns) == 2:
        return f"{towns[0]} and {towns[1]}"
    return ", ".join(towns[:-1]) + ", and " + towns[-1]


def intro_for(base):
    custom = (base.get("intro") or "").strip()
    if custom:
        return custom
    mission = (base.get("mission") or "").strip()
    if mission and not mission.endswith("."):
        mission += "."
    frame = FRAMES[sum(ord(c) for c in base["slug"]) % len(FRAMES)]
    text = frame.format(
        name=base["name"],
        branch=base["branch"],
        city=base["city"],
        state=base["state"],
        mission=mission,
        towns=town_phrase(base.get("towns") or []),
    )
    return re.sub(r"\s+", " ", text).strip()


def load_bases():
    raw = json.loads(DATA.read_text(encoding="utf-8"))
    bases = raw["bases"] if isinstance(raw, dict) else raw
    slugs = set()
    for base in bases:
        for key in ("slug", "name", "branch", "city", "state", "stateCode", "mission"):
            if not str(base.get(key, "")).strip():
                raise SystemExit(f"Missing {key} on {base.get('name') or base}")
        if base["branch"] not in BRANCHES:
            raise SystemExit(f"Unknown branch {base['branch']!r} on {base['name']}")
        if base["slug"] in slugs:
            raise SystemExit(f"Duplicate slug {base['slug']}")
        slugs.add(base["slug"])
        if not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", base["slug"]):
            raise SystemExit(f"Slug must be lowercase hyphens: {base['slug']}")
        base.setdefault("towns", [])
        base.setdefault("alsoKnownAs", [])
        base.setdefault("servedDirectly", False)
    bases.sort(key=lambda b: (not b.get("servedDirectly"), b["state"], b["name"]))
    return bases


def head(title, description, canonical, breadcrumb_json):
    return f"""<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{esc(title)}</title>
  <meta name="description" content="{esc(description)}" />
  <link rel="canonical" href="{esc(canonical)}" />
  <meta property="og:title" content="{esc(title)}" />
  <meta property="og:description" content="{esc(description)}" />
  <meta property="og:url" content="{esc(canonical)}" />
  <meta property="og:image" content="{SITE}/og-cover.jpg" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="S² Home Partners" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="{esc(title)}" />
  <meta name="twitter:description" content="{esc(description)}" />
  <meta name="twitter:image" content="{SITE}/og-cover.jpg" />
  <link rel="preload" href="/fonts/newsreader-normal-latin.woff2" as="font" type="font/woff2" crossorigin />
  <link rel="preload" href="/fonts/source-sans-3-normal-latin.woff2" as="font" type="font/woff2" crossorigin />
  <link rel="icon" href="/favicon.ico" sizes="any" />
  <link rel="icon" type="image/png" href="/favicon-32.png" sizes="32x32" />
  <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
  <link rel="stylesheet" href="/fonts.css?v=1" />
  <link rel="stylesheet" href="/tailwind.css?v=1" />
  <link rel="stylesheet" href="/coastal.css?v=6" />
  <script src="/site.js" defer></script>
  <script type="application/ld+json">
  {breadcrumb_json}
  </script>
</head>
"""


def chrome_header(current):
    def item(href, label, key):
        active = " text-momentum-blue" if key == current else ""
        return f'<a href="{href}" class="transition-colors hover:text-momentum-blue{active}">{label}</a>'

    return f"""<body class="bg-momentum-bgLight font-sans text-slate-800 antialiased">
  <header class="sticky top-0 z-50 border-b border-momentum-grayLight bg-white/95 shadow-sm backdrop-blur-md">
    <div class="mx-auto flex h-24 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
      <a href="/">
        <img src="/s2-home-partners-logo.png" width="1000" height="174" alt="S² Home Partners | Momentum Realty" class="h-12 w-auto max-w-[72vw] object-contain sm:h-16 lg:h-20" />
      </a>
      <nav class="hidden items-center space-x-5 text-xs font-bold uppercase tracking-wider text-momentum-gray xl:flex" aria-label="Primary">
        {item("/buy.html", "Buy", "buy")}
        {item("/sell.html", "Sell", "sell")}
        {item("/military-relocation.html", "Military PCS", "pcs")}
        {item("/military-bases.html", "Base Directory", "directory")}
        {item("/referral.html", "Referrals", "referral")}
        <a href="/get-started.html" class="rounded-md bg-teal-600 px-4 py-2 text-white transition-colors hover:bg-teal-700">Let's Talk</a>
      </nav>
      <button id="menu-toggle" type="button" class="inline-flex items-center justify-center text-momentum-blue xl:hidden" aria-expanded="false" aria-controls="mobile-menu" aria-label="Open menu">
        <svg class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
      </button>
    </div>
    <div id="mobile-menu" class="hidden border-t border-momentum-grayLight bg-white px-4 py-4 xl:hidden">
      <nav class="flex flex-col gap-3 text-sm font-medium text-momentum-blue" aria-label="Mobile">
        <a href="/buy.html" class="mobile-link py-1">Buy</a>
        <a href="/sell.html" class="mobile-link py-1">Sell</a>
        <a href="/military-relocation.html" class="mobile-link py-1">Military PCS</a>
        <a href="/military-bases.html" class="mobile-link py-1">Base Directory</a>
        <a href="/referral.html" class="mobile-link py-1">Referral Program</a>
        <a href="/get-started.html" class="mobile-link py-1 font-bold text-teal-700">Let's Talk</a>
      </nav>
    </div>
  </header>
"""


FOOTER = """
  <footer class="border-t border-slate-800 bg-slate-900 py-8 text-slate-400">
    <div class="mx-auto max-w-7xl px-4 text-center text-sm sm:px-6 lg:px-8">
      <address class="mb-3 not-italic text-xs leading-relaxed text-slate-400"><span class="font-semibold text-slate-300">S&sup2; Home Partners | Momentum Realty</span><br />13475 Atlantic Blvd, Ste 8, Office S206, Jacksonville, FL 32225<br /><a href="tel:+18503289800" class="text-slate-300 hover:text-white">850-328-9800</a></address>
      <p>&copy; <span id="year"></span> S&sup2; Home Partners | Momentum Realty. All rights reserved.</p>
      <p class="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs">
        <a href="/military-bases.html" class="text-slate-300 hover:text-white">Base Directory</a>
        <a href="/military-relocation.html" class="text-slate-300 hover:text-white">Military PCS</a>
        <a href="/referral.html" class="text-slate-300 hover:text-white">Referral Program</a>
        <a href="/faq.html" class="text-slate-300 hover:text-white">FAQs</a>
        <a href="/resources.html" class="text-slate-300 hover:text-white">Guides &amp; Tools</a>
      </p>
    </div>
  </footer>
  <script>
    var year = document.getElementById('year');
    if (year) year.textContent = new Date().getFullYear();
    var menuToggle = document.getElementById('menu-toggle');
    var mobileMenu = document.getElementById('mobile-menu');
    if (menuToggle && mobileMenu) {
      menuToggle.addEventListener('click', function () {
        var open = mobileMenu.classList.toggle('hidden') === false;
        menuToggle.setAttribute('aria-expanded', String(open));
        menuToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      });
      document.querySelectorAll('.mobile-link').forEach(function (link) {
        link.addEventListener('click', function () {
          mobileMenu.classList.add('hidden');
          menuToggle.setAttribute('aria-expanded', 'false');
          menuToggle.setAttribute('aria-label', 'Open menu');
        });
      });
    }
  </script>
</body>
</html>
"""


def breadcrumb(items):
    elements = []
    for i, (name, url) in enumerate(items, 1):
        elements.append({
            "@type": "ListItem",
            "position": i,
            "name": name,
            "item": url,
        })
    return json.dumps({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": elements,
    }, indent=2)


def cta_href(base):
    from urllib.parse import urlencode
    params = {
        "base": base["name"],
        "city": base["city"],
        "state": base["stateCode"],
    }
    if base.get("servedDirectly"):
        params["direct"] = "1"
    return "/referral.html?" + urlencode(params) + "#request-referral"


def resource_links(base):
    links = [
        (INSTALLATIONS, "MilitaryINSTALLATIONS directory"),
        (ONESOURCE, "Military OneSource"),
        (BAH, "DoD Basic Allowance for Housing calculator"),
    ]
    if base.get("officialSite"):
        links.insert(0, (base["officialSite"], f"{base['name']} official website"))
    if base.get("housingUrl"):
        links.append((base["housingUrl"], "Installation housing office"))
    items = []
    for href, label in links:
        items.append(
            f'<li><a href="{esc(href)}" class="font-semibold text-momentum-blue underline underline-offset-2" target="_blank" rel="noopener noreferrer">{esc(label)}</a></li>'
        )
    return "\n            ".join(items)


def render_base(base):
    intro = intro_for(base)
    canonical = f"{SITE}/bases/{base['slug']}.html"
    if base.get("servedDirectly"):
        title = f"PCS to {base['name']}: Homes & Local Realtors | S²"
        description = (
            f"S² Home Partners serves {base['name']} in {base['city']}, {base['state']} directly. "
            f"Nearby towns include {town_phrase((base.get('towns') or [])[:3])}."
        )
    else:
        title = f"PCS to {base['name']}: Homes, Neighborhoods & Realtor Referral"
        description = (
            f"PCSing to {base['name']} in {base['city']}, {base['state']}? "
            f"See nearby towns and get matched with a vetted agent through S² Home Partners."
        )
    if len(description) > 170:
        description = description[:167].rsplit(" ", 1)[0] + "."
    crumbs = breadcrumb([
        ("Home", SITE + "/"),
        ("Military base directory", SITE + "/military-bases.html"),
        (base["name"], canonical),
    ])
    aka = ""
    if base.get("alsoKnownAs"):
        aka = (
            '<p class="mt-3 text-sm text-slate-300">Also known as '
            + esc(", ".join(base["alsoKnownAs"]))
            + ".</p>"
        )
    towns = "\n".join(
        f"<li>{esc(town)}</li>" for town in (base.get("towns") or [])
    ) or "<li>Surrounding communities</li>"
    if base.get("servedDirectly"):
        cta_title = f"PCSing to {base['name']}? Work with S² Home Partners"
        cta_body = (
            "This is one of the installations our team serves directly from Jacksonville. "
            "Tell us your timeline and whether you are buying or selling. There is no handoff to a stranger."
        )
        button = "Start with S²"
    else:
        cta_title = f"PCSing to {base['name']}? Get matched with a vetted, military-savvy agent"
        cta_body = (
            "S² Home Partners refers families to agents we have vetted in our nationwide network. "
            "The match is free for you. We send the base name with your request so the team knows where you are headed."
        )
        button = "Request a vetted agent"
    extras = []
    if base.get("localGuide"):
        extras.append(
            f'<a href="{esc(base["localGuide"])}" class="font-semibold text-white underline underline-offset-2">Read the local PCS guide</a>'
        )
    if base.get("servedDirectly"):
        extras.append(
            f'<a href="/get-started.html?base={esc(base["name"].replace(" ", "+"))}" class="font-semibold text-white underline underline-offset-2">Open the buyer and seller intake form</a>'
        )
    extra_html = ""
    if extras:
        extra_html = '<p class="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm">' + " ".join(extras) + "</p>"
    visible_crumbs = (
        '<nav class="mx-auto max-w-3xl px-4 pt-6 text-sm text-slate-500 sm:px-6" aria-label="Breadcrumb">'
        '<a href="/" class="hover:text-momentum-blue">Home</a>'
        '<span aria-hidden="true"> / </span>'
        '<a href="/military-bases.html" class="hover:text-momentum-blue">Base directory</a>'
        '<span aria-hidden="true"> / </span>'
        f'<span class="text-slate-700">{esc(base["name"])}</span></nav>'
    )
    return (
        head(title, description, canonical, crumbs)
        + chrome_header("directory")
        + f"""
  <main>
    {visible_crumbs}
    <section class="bg-momentum-blueDark py-14 text-white">
      <div class="mx-auto max-w-3xl px-4 sm:px-6">
        <p class="text-xs font-semibold uppercase tracking-widest text-teal-200">{esc(base["branch"])} · {esc(base["state"])}</p>
        <h1 class="mt-3 font-serif text-4xl font-semibold sm:text-5xl">{esc(base["name"])}</h1>
        <p class="mt-3 text-lg text-slate-200">{esc(base["city"])}, {esc(base["state"])}</p>
        {aka}
      </div>
    </section>
    <section class="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <p class="text-base leading-relaxed text-slate-700">{esc(intro)}</p>
      <h2 class="mt-10 font-serif text-2xl font-semibold text-momentum-blue">Nearby towns</h2>
      <ul class="mt-3 list-disc space-y-1 pl-5 text-slate-700">
        {towns}
      </ul>
      <h2 class="mt-10 font-serif text-2xl font-semibold text-momentum-blue">Official resources</h2>
      <ul class="mt-3 space-y-2 text-sm">
            {resource_links(base)}
      </ul>
      <div class="mt-12 rounded-2xl bg-momentum-blue px-6 py-8 text-white">
        <h2 class="font-serif text-2xl font-semibold">{esc(cta_title)}</h2>
        <p class="mt-3 text-sm leading-relaxed text-slate-200">{esc(cta_body)}</p>
        <a href="{esc(cta_href(base))}" class="mt-6 inline-block rounded-xl bg-white px-6 py-3 text-sm font-bold text-momentum-blue hover:bg-slate-100">{esc(button)}</a>
        {extra_html}
      </div>
    </section>
  </main>
"""
        + FOOTER
    )


def render_hub(bases):
    title = "U.S. Military Base Directory for PCS Moves | S² Home Partners"
    description = (
        "Search U.S. military installations by name, state, or branch. "
        "S² Home Partners serves Northeast Florida directly and refers PCSing families to vetted agents nationwide."
    )
    canonical = SITE + "/military-bases.html"
    crumbs = breadcrumb([
        ("Home", SITE + "/"),
        ("Military base directory", canonical),
    ])
    states = []
    seen = set()
    for base in sorted(bases, key=lambda b: b["state"]):
        if base["state"] not in seen:
            seen.add(base["state"])
            states.append(base["state"])
    state_options = "\n".join(
        f'<option value="{esc(state)}">{esc(state)}</option>' for state in states
    )
    branch_buttons = "\n".join(
        f'<button type="button" class="branch-filter rounded-full border border-momentum-grayLight px-3 py-1.5 text-xs font-semibold text-momentum-gray hover:border-momentum-blue hover:text-momentum-blue" data-branch="{esc(branch)}">{esc(branch)}</button>'
        for branch in BRANCHES
    )
    featured = [b for b in bases if b.get("servedDirectly")]
    featured_html = "\n".join(card(b, featured=True) for b in featured)
    groups = []
    by_state = {}
    for base in bases:
        by_state.setdefault(base["state"], []).append(base)
    for state in states:
        items = "\n".join(card(b, featured=False) for b in sorted(by_state[state], key=lambda b: b["name"]))
        groups.append(
            f'<section class="state-group mt-10" data-state="{esc(state)}">'
            f'<h3 class="font-serif text-xl font-semibold text-momentum-blue">{esc(state)}</h3>'
            f'<div class="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{items}</div></section>'
        )
    count = len(bases)
    return (
        head(title, description, canonical, crumbs)
        + chrome_header("directory")
        + f"""
  <main>
    <section class="bg-momentum-blueDark py-16 text-white">
      <div class="mx-auto max-w-4xl px-4 text-center sm:px-6">
        <p class="text-xs font-semibold uppercase tracking-widest text-teal-200">Nationwide PCS directory</p>
        <h1 class="mt-3 font-serif text-4xl font-semibold sm:text-5xl">Every major U.S. base. One trusted contact.</h1>
        <p class="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-200">Search by base, state, or branch. S² Home Partners serves NAS Jacksonville, NS Mayport, NSB Kings Bay, Blount Island, Camp Blanding, and Coast Guard Sector Jacksonville directly. Everywhere else, we match you with a vetted agent in our referral network.</p>
      </div>
    </section>
    <section class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h2 class="font-serif text-2xl font-semibold text-momentum-blue">We serve these installations directly</h2>
      <div class="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {featured_html}
      </div>
      <div class="mt-12 rounded-2xl border border-momentum-grayLight bg-white p-4 sm:p-6">
        <label for="base-search" class="text-xs font-semibold uppercase tracking-wider text-momentum-gray">Search</label>
        <input id="base-search" type="search" placeholder="Base name, former name, or town" class="mt-2 w-full rounded-xl border border-momentum-grayLight px-4 py-3 text-base text-slate-800 focus:border-momentum-blue focus:outline-none" />
        <div class="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div class="sm:w-64">
            <label for="state-filter" class="text-xs font-semibold uppercase tracking-wider text-momentum-gray">State</label>
            <select id="state-filter" class="mt-2 w-full rounded-xl border border-momentum-grayLight px-4 py-3 text-sm">
              <option value="">All states</option>
              {state_options}
            </select>
          </div>
          <div class="flex flex-1 flex-wrap gap-2" role="group" aria-label="Branch of service">
            <button type="button" class="branch-filter rounded-full border border-momentum-blue bg-momentum-blue px-3 py-1.5 text-xs font-semibold text-white" data-branch="">All branches</button>
            {branch_buttons}
          </div>
        </div>
        <p id="result-count" class="mt-4 text-sm text-slate-600">{count} installations</p>
      </div>
      <p id="no-results" class="mt-8 hidden text-slate-600">No installations match that search. Try a state, a branch, or part of the base name.</p>
      <div id="base-list">
        {''.join(groups)}
      </div>
    </section>
  </main>
  <script>
    (function () {{
      var search = document.getElementById('base-search');
      var stateFilter = document.getElementById('state-filter');
      var cards = Array.prototype.slice.call(document.querySelectorAll('.base-card'));
      var groups = Array.prototype.slice.call(document.querySelectorAll('.state-group'));
      var count = document.getElementById('result-count');
      var empty = document.getElementById('no-results');
      var branch = '';
      function apply() {{
        var q = (search.value || '').trim().toLowerCase();
        var state = stateFilter.value;
        var shown = 0;
        cards.forEach(function (card) {{
          var hay = card.getAttribute('data-search') || '';
          var ok = (!q || hay.indexOf(q) !== -1)
            && (!state || card.getAttribute('data-state') === state)
            && (!branch || card.getAttribute('data-branch') === branch);
          card.classList.toggle('hidden', !ok);
          if (ok) shown += 1;
        }});
        groups.forEach(function (group) {{
          var any = group.querySelector('.base-card:not(.hidden)');
          group.classList.toggle('hidden', !any);
        }});
        count.textContent = shown + (shown === 1 ? ' installation' : ' installations');
        empty.classList.toggle('hidden', shown !== 0);
      }}
      document.querySelectorAll('.branch-filter').forEach(function (button) {{
        button.addEventListener('click', function () {{
          branch = button.getAttribute('data-branch') || '';
          document.querySelectorAll('.branch-filter').forEach(function (other) {{
            var on = other === button;
            other.classList.toggle('bg-momentum-blue', on);
            other.classList.toggle('text-white', on);
            other.classList.toggle('border-momentum-blue', on);
            other.classList.toggle('text-momentum-gray', !on);
          }});
          apply();
        }});
      }});
      search.addEventListener('input', apply);
      stateFilter.addEventListener('change', apply);
    }})();
  </script>
"""
        + FOOTER
    )


def card(base, featured):
    aka = " ".join(base.get("alsoKnownAs") or [])
    towns = " ".join(base.get("towns") or [])
    search = " ".join([
        base["name"], aka, base["city"], base["state"], base["branch"], towns,
    ]).lower()
    badge = ""
    if base.get("servedDirectly"):
        badge = '<span class="mt-2 inline-block rounded-full bg-teal-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">S² serves this base</span>'
    kind = "featured-card" if featured else "base-card"
    return (
        f'<a class="{kind} block rounded-2xl border border-momentum-grayLight bg-white p-4 shadow-sm transition hover:border-momentum-blue" '
        f'href="/bases/{esc(base["slug"])}.html" data-branch="{esc(base["branch"])}" data-state="{esc(base["state"])}" data-search="{esc(search)}">'
        f'<span class="text-[11px] font-semibold uppercase tracking-wider text-teal-700">{esc(base["branch"])}</span>'
        f'<span class="mt-1 block font-serif text-lg font-semibold text-momentum-blue">{esc(base["name"])}</span>'
        f'<span class="mt-1 block text-sm text-slate-600">{esc(base["city"])}, {esc(base["state"])}</span>'
        f'{badge}</a>'
    )


def update_sitemap(bases):
    text = SITEMAP.read_text(encoding="utf-8")
    text = re.sub(r"\n?  <!-- bases:start -->.*?<!-- bases:end -->\n?", "\n", text, flags=re.S)
    block = ["  <!-- bases:start -->"]
    for base in bases:
        block.append("  <url>")
        block.append(f"    <loc>{SITE}/bases/{base['slug']}.html</loc>")
        block.append("    <changefreq>monthly</changefreq>")
        block.append("    <priority>0.5</priority>")
        block.append("  </url>")
    block.append("  <!-- bases:end -->")
    text = text.replace("</urlset>", "\n".join(block) + "\n</urlset>")
    SITEMAP.write_text(text, encoding="utf-8")


def update_redirects(bases):
    text = REDIRECTS.read_text(encoding="utf-8")
    text = re.sub(r"\n?# bases:start.*?# bases:end\n?", "\n", text, flags=re.S)
    lines = ["# bases:start", "# Individual base pages. Extensionless addresses forward to the .html canonical."]
    for base in bases:
        slug = base["slug"]
        lines.append(f"/bases/{slug}     /bases/{slug}.html    301!")
        lines.append(f"/bases/{slug}/    /bases/{slug}.html    301!")
    lines.append("# bases:end")
    text = text.rstrip() + "\n\n" + "\n".join(lines) + "\n"
    REDIRECTS.write_text(text, encoding="utf-8")


def main():
    bases = load_bases()
    out_dir = ROOT / "bases"
    out_dir.mkdir(exist_ok=True)
    keep = set()
    for base in bases:
        path = out_dir / f"{base['slug']}.html"
        path.write_text(render_base(base), encoding="utf-8")
        keep.add(path.name)
    for stale in out_dir.glob("*.html"):
        if stale.name not in keep:
            stale.unlink()
    (ROOT / "military-bases.html").write_text(render_hub(bases), encoding="utf-8")
    update_sitemap(bases)
    update_redirects(bases)
    direct = sum(1 for b in bases if b.get("servedDirectly"))
    print(f"Wrote {len(bases)} base pages ({direct} served directly) and the directory hub.")


if __name__ == "__main__":
    main()

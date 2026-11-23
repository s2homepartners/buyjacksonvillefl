#!/usr/bin/env python3
"""Build the new-construction hub and area pages.

From the site folder:

    python3 scripts/build-new-construction.py

Reads nothing but the facts in this file. Prices and builder lineups were
checked against public builder, developer, school-district, and news pages
in November 2026. If a fact is not in this file, it is not on the site.
"""

import html
import json
import re
from pathlib import Path

from local_life import life_section, life_sources

ROOT = Path(__file__).resolve().parents[1]
SITE = "https://buyjacksonvillefl.com"
SITEMAP = ROOT / "sitemap.xml"
REDIRECTS = ROOT / "_redirects"
CHECKED = "November 2026"
NOTE = (
    "Prices and availability last checked Nov 2026, subject to change, "
    "confirm with the builder."
)

NAV_DESKTOP_OLD = (
    '<a href="va-home-buying-guide.html" class="block px-4 py-2.5 text-sm normal-case '
    'tracking-normal text-momentum-gray hover:bg-momentum-bgLight hover:text-momentum-blue">'
    "VA Home Buying Guide</a>"
)
NAV_DESKTOP_NEW = NAV_DESKTOP_OLD + (
    '\n            <a href="new-construction.html" class="block px-4 py-2.5 text-sm normal-case '
    'tracking-normal text-momentum-gray hover:bg-momentum-bgLight hover:text-momentum-blue">'
    "New Construction</a>"
)
NAV_MOBILE_OLD = (
    '<a href="va-home-buying-guide.html" class="mobile-link py-1 pl-4 text-sm text-momentum-gray">'
    "VA Home Buying Guide</a>"
)
NAV_MOBILE_NEW = NAV_MOBILE_OLD + (
    '\n        <a href="new-construction.html" class="mobile-link py-1 pl-4 text-sm text-momentum-gray">'
    "New Construction</a>"
)
FOOTER_OLD = "S² Home Partners Real Estate Team | Momentum Realty"
FOOTER_NEW = "S² Home Partners Real Estate Team, brokered by Momentum Realty"


def esc(value):
    return html.escape(str(value), quote=True)


def paras(items):
    return "\n".join(
        f'<p class="mt-4 text-base leading-relaxed text-slate-700">{p}</p>' for p in items
    )


def buying_section(area_name):
    return f"""
    <section class="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8" aria-labelledby="buying-with-s2">
      <h2 id="buying-with-s2" class="font-serif text-3xl font-semibold text-momentum-blue">Buying new construction with S² Home Partners Real Estate Team</h2>
      <p class="mt-4 max-w-3xl text-base leading-relaxed text-slate-700">S² Home Partners Real Estate Team represents you, the buyer, at new-home communities in {esc(area_name)}. We are not the builder&rsquo;s sales team and we are not a partner of any builder on this page.</p>
      <div class="mt-6 grid gap-4 md:grid-cols-2">
        <article class="rounded-2xl border border-momentum-grayLight bg-white p-5 shadow-sm">
          <h3 class="font-serif text-xl font-semibold text-momentum-blue">Register us on your first visit</h3>
          <p class="mt-2 text-sm leading-relaxed text-slate-700">The on-site agent works for the builder. If you walk in and register alone, that builder may not let you add your own agent later. Tell them S² Home Partners Real Estate Team is your buyer&rsquo;s agent before you sign a registration card, tour a model, or put your name on a VIP list. Our representation does not add a fee on top of the builder&rsquo;s price.</p>
        </article>
        <article class="rounded-2xl border border-momentum-grayLight bg-white p-5 shadow-sm">
          <h3 class="font-serif text-xl font-semibold text-momentum-blue">VA loans and builder incentives</h3>
          <p class="mt-2 text-sm leading-relaxed text-slate-700">Many of these builders will take a VA loan, and many advertise closing-cost help or a rate buydown. Those offers change by homesite, and some incentives do not stack with VA. We read the current incentive sheet against your loan approval before you pick a lot.</p>
        </article>
        <article class="rounded-2xl border border-momentum-grayLight bg-white p-5 shadow-sm">
          <h3 class="font-serif text-xl font-semibold text-momentum-blue">Inspections on a new build</h3>
          <p class="mt-2 text-sm leading-relaxed text-slate-700">A new house still needs your own inspector. We schedule a pre-drywall inspection when the contract allows it, and a final inspection before you walk through. Cosmetic items and incomplete punch-list work are normal. Structural, drainage, and window issues are the ones we do not waive.</p>
        </article>
        <article class="rounded-2xl border border-momentum-grayLight bg-white p-5 shadow-sm">
          <h3 class="font-serif text-xl font-semibold text-momentum-blue">HOA, CDD, and the real payment</h3>
          <p class="mt-2 text-sm leading-relaxed text-slate-700">The base price is not the monthly cost. Ask for the HOA dues, any community development district assessment on the tax bill, and the insurance quote for that lot. We line those up next to BAH before you write a contract.</p>
        </article>
      </div>
    </section>
"""


def form_section(page):
    options = ['<option value="">Choose a community</option>']
    for community in page["communities"]:
        options.append(f'<option value="{esc(community["name"])}">{esc(community["name"])}</option>')
    options.append('<option value="Not sure yet">Not sure yet</option>')
    canonical = page["canonical"]
    return f"""
    <section id="talk" class="scroll-mt-28 bg-white py-14">
      <div class="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div class="rounded-2xl border border-momentum-grayLight bg-momentum-bgLight p-8 shadow-xl lg:p-12">
          <span class="text-xs font-semibold uppercase tracking-wider text-momentum-gray">Talk with Sarah and Sarah</span>
          <h2 class="mt-1 font-serif text-3xl font-bold text-momentum-blue">Ask about new homes in {esc(page["short"])}</h2>
          <p class="mt-3 text-sm leading-relaxed text-slate-600">Tell us the community. We will come back with what is actually for sale, which incentives are written down, and whether a VA loan fits that homesite.</p>
          <form id="newConstructionLeadForm" action="https://formsubmit.co/S2HomePartners@gmail.com" method="POST" class="mt-6 space-y-4">
            <input type="hidden" name="_captcha" value="false" />
            <input type="hidden" name="_next" value="{esc(canonical)}#thanks" />
            <input type="hidden" name="_subject" value="New Construction inquiry - {esc(page["short"])} - S² Home Partners Real Estate Team" />
            <input type="hidden" name="Interest" value="New Construction" />
            <input type="hidden" name="Area" value="{esc(page["area_label"])}" />
            <div>
              <label for="nc-name" class="mb-1 block text-xs font-bold uppercase text-slate-700">Name</label>
              <input id="nc-name" type="text" name="Name" required placeholder="Your full name" class="w-full rounded-xl border border-momentum-grayLight px-4 py-3 text-sm focus:border-momentum-blue focus:outline-none" />
            </div>
            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label for="nc-email" class="mb-1 block text-xs font-bold uppercase text-slate-700">Email</label>
                <input id="nc-email" type="email" name="Email" required placeholder="you@example.com" class="w-full rounded-xl border border-momentum-grayLight px-4 py-3 text-sm focus:border-momentum-blue focus:outline-none" />
              </div>
              <div>
                <label for="nc-phone" class="mb-1 block text-xs font-bold uppercase text-slate-700">Phone</label>
                <input id="nc-phone" type="tel" name="Phone" placeholder="(904) 000-0000" class="w-full rounded-xl border border-momentum-grayLight px-4 py-3 text-sm focus:border-momentum-blue focus:outline-none" />
              </div>
            </div>
            <div>
              <label for="nc-community" class="mb-1 block text-xs font-bold uppercase text-slate-700">Community</label>
              <select id="nc-community" name="Community" class="w-full rounded-xl border border-momentum-grayLight px-4 py-3 text-sm focus:border-momentum-blue focus:outline-none">
                {''.join(options)}
              </select>
            </div>
            <div>
              <label for="nc-message" class="mb-1 block text-xs font-bold uppercase text-slate-700">What you need</label>
              <textarea id="nc-message" name="Message" rows="4" required placeholder="Timeline, beds, budget, VA or conventional, and which base you are commuting to." class="w-full rounded-xl border border-momentum-grayLight px-4 py-3 text-sm focus:border-momentum-blue focus:outline-none"></textarea>
            </div>
            <button type="submit" class="w-full rounded-xl bg-momentum-blue py-4 text-base font-bold text-white shadow-md transition-all hover:bg-momentum-blueHover">Send this to S&sup2;</button>
          </form>
          <div id="thanks" class="mt-6 hidden rounded-2xl border border-momentum-grayLight bg-white p-6 text-center">
            <p class="font-serif text-2xl font-bold text-momentum-blue">Request received.</p>
            <p class="mt-2 text-sm text-slate-600">We will reply within one business day.</p>
          </div>
          <p class="mt-4 text-center text-xs text-slate-500">Or start the full buyer intake at <a href="/get-started.html" class="font-semibold text-momentum-blue underline">get-started.html</a>. Mention {esc(page["short"])} in the notes.</p>
        </div>
      </div>
    </section>
    <script>
      (function () {{
        var select = document.getElementById('nc-community');
        function choose(name) {{
          if (!select || !name) return;
          for (var i = 0; i < select.options.length; i++) {{
            if (select.options[i].value === name) select.value = name;
          }}
        }}
        document.querySelectorAll('[data-community]').forEach(function (link) {{
          link.addEventListener('click', function () {{ choose(link.getAttribute('data-community')); }});
        }});
        var params = new URLSearchParams(window.location.search);
        choose(params.get('community'));
        if (window.location.hash === '#thanks') {{
          var thanks = document.getElementById('thanks');
          var form = document.getElementById('newConstructionLeadForm');
          if (thanks) thanks.classList.remove('hidden');
          if (form) form.classList.add('hidden');
        }}
      }})();
    </script>
"""


def card(community):
    for key in ("builders", "types", "price", "hoa", "amenities", "schools", "bases", "url", "link_label"):
        if key not in community:
            raise SystemExit(f"Community {community.get('name')} missing {key}")
    rows = [
        ("Builders", community["builders"]),
        ("Home types", community["types"]),
        ("Price range", community["price"]),
        ("HOA / CDD", community["hoa"]),
        ("Amenities", community["amenities"]),
        ("School zoning", community["schools"]),
        ("Bases", community["bases"]),
    ]
    body = []
    for label, value in rows:
        body.append(
            f'<p class="mt-3 text-sm leading-relaxed text-slate-700"><span class="font-semibold text-momentum-blue">{esc(label)}. </span>{value}</p>'
        )
    extra = ""
    if community.get("extra"):
        extra = f'<p class="mt-3 text-sm leading-relaxed text-slate-700">{community["extra"]}</p>'
    return f"""
        <article class="flex flex-col overflow-hidden rounded-2xl border border-momentum-grayLight bg-white shadow-sm" style="border-top: 4px solid #0d9488">
          <div class="flex flex-1 flex-col p-5">
            <h3 class="font-serif text-2xl font-semibold text-momentum-blue">{esc(community["name"])}</h3>
            {''.join(body)}
            {extra}
            <div class="mt-5 flex flex-wrap gap-3">
              <a href="{esc(community["url"])}" class="inline-flex rounded-lg border border-momentum-blue px-4 py-2 text-sm font-semibold text-momentum-blue hover:bg-momentum-bgLight" target="_blank" rel="noopener noreferrer">{esc(community["link_label"])}</a>
              <a href="#talk" data-community="{esc(community["name"])}" class="inline-flex rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700">Ask S&sup2; about {esc(community["name"])}</a>
            </div>
          </div>
        </article>
"""


def link_list(items):
    return "".join(
        f'<li><a href="{esc(item["href"])}" class="font-semibold text-momentum-blue underline decoration-momentum-grayLight underline-offset-2 hover:decoration-momentum-blue">{item["label"]}</a></li>'
        for item in items
    )


def json_ld(page, faqs):
    crumbs = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Home", "item": SITE + "/"},
            {"@type": "ListItem", "position": 2, "name": "New Construction", "item": SITE + "/new-construction.html"},
            {"@type": "ListItem", "position": 3, "name": page["short"], "item": page["canonical"]},
        ],
    }
    place = {
        "@context": "https://schema.org",
        "@type": "Place",
        "name": page["place_name"],
        "address": {
            "@type": "PostalAddress",
            "addressLocality": page["locality"],
            "addressRegion": page["region"],
            "addressCountry": "US",
        },
    }
    faq = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": item["q"],
                "acceptedAnswer": {"@type": "Answer", "text": item["a"]},
            }
            for item in faqs
        ],
    }
    blocks = [crumbs, place, faq]
    return "\n".join(
        f'  <script type="application/ld+json">\n  {json.dumps(block, ensure_ascii=False)}\n  </script>'
        for block in blocks
    )


def head(page, faqs):
    title = page["title"]
    description = page["description"]
    canonical = page["canonical"]
    image = SITE + page["hero"]["src"]
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
  <meta property="og:image" content="{esc(image)}" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="S² Home Partners Real Estate Team" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="{esc(title)}" />
  <meta name="twitter:description" content="{esc(description)}" />
  <meta name="twitter:image" content="{esc(image)}" />
  <link rel="preload" href="/fonts/newsreader-normal-latin.woff2" as="font" type="font/woff2" crossorigin />
  <link rel="preload" href="/fonts/source-sans-3-normal-latin.woff2" as="font" type="font/woff2" crossorigin />
  <link rel="icon" href="/favicon.ico" sizes="any" />
  <link rel="icon" type="image/png" href="/favicon-32.png" sizes="32x32" />
  <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
  <link rel="stylesheet" href="/fonts.css?v=1" />
  <link rel="stylesheet" href="/tailwind.css?v=1" />
  <link rel="stylesheet" href="/coastal.css?v=6" />
  <script src="/site.js" defer></script>
{json_ld(page, faqs)}
</head>
"""


def header():
    def item(href, label):
        return (
            f'<a href="{href}" class="block px-4 py-2.5 text-sm normal-case tracking-normal '
            f'text-momentum-gray hover:bg-momentum-bgLight hover:text-momentum-blue">{label}</a>'
        )

    return f"""<body class="bg-momentum-bgLight font-sans text-slate-800 antialiased">
  <header class="sticky top-0 z-50 border-b border-momentum-grayLight bg-white/95 shadow-sm backdrop-blur-md">
    <div class="mx-auto flex h-24 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
      <a href="/">
        <img src="/s2-home-partners-logo.png" width="1000" height="174" alt="S² Home Partners Real Estate Team | Momentum Realty" class="h-12 w-auto max-w-[72vw] object-contain sm:h-16 lg:h-20" />
      </a>
      <nav class="hidden items-center space-x-5 text-xs font-bold uppercase tracking-wider text-momentum-gray xl:flex" aria-label="Primary">
        <div class="group relative">
          <button type="button" class="flex items-center gap-1 transition-colors hover:text-momentum-blue" aria-haspopup="true">Buy <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" /></svg></button>
          <div class="invisible absolute left-0 top-full z-50 w-56 rounded-xl border border-momentum-grayLight bg-white py-2 opacity-0 shadow-lg transition-all group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
            {item("/buy.html#home-search", "Search Homes")}
            {item("/get-started.html", "Buyer Intake Form")}
            {item("/financing-guide.html", "First-Time Buyer Guide")}
            {item("/va-home-buying-guide.html", "VA Home Buying Guide")}
            {item("/new-construction.html", "New Construction")}
          </div>
        </div>
        <div class="group relative">
          <button type="button" class="flex items-center gap-1 transition-colors hover:text-momentum-blue" aria-haspopup="true">Sell <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" /></svg></button>
          <div class="invisible absolute left-0 top-full z-50 w-56 rounded-xl border border-momentum-grayLight bg-white py-2 opacity-0 shadow-lg transition-all group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
            <button type="button" data-action="open-value-modal" class="block w-full px-4 py-2.5 text-left text-sm normal-case tracking-normal text-momentum-gray hover:bg-momentum-bgLight hover:text-momentum-blue">Home Valuation</button>
            {item("/sell.html#net-sheet", "Seller Net Sheet")}
            {item("/sell.html#fix-it-list-it", "Fix It &amp; List It")}
            {item("/seller-portal.html", "Seller Portal Login")}
          </div>
        </div>
        <a href="/military-relocation.html" class="transition-colors hover:text-momentum-blue">Military PCS</a>
        <div class="group relative">
          <button type="button" class="flex items-center gap-1 transition-colors hover:text-momentum-blue" aria-haspopup="true">Areas <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" /></svg></button>
          <div class="invisible absolute left-0 top-full z-50 w-56 rounded-xl border border-momentum-grayLight bg-white py-2 opacity-0 shadow-lg transition-all group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
            {item("/duval-county.html", "Jacksonville")}
            {item("/atlantic-neptune-beach.html", "Beaches")}
            {item("/nassau-county.html", "Yulee &amp; Amelia Island")}
            {item("/st-johns-county.html", "St. Johns")}
            {item("/clay-county.html", "Clay County")}
            {item("/area-guides.html", "All Area Guides")}
          </div>
        </div>
        <div class="group relative">
          <button type="button" class="flex items-center gap-1 transition-colors hover:text-momentum-blue" aria-haspopup="true">Resources <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" /></svg></button>
          <div class="invisible absolute left-0 top-full z-50 w-60 rounded-xl border border-momentum-grayLight bg-white py-2 opacity-0 shadow-lg transition-all group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
            {item("/va-home-buying-guide.html", "VA Home Buying Guide")}
            {item("/new-construction.html", "New Construction")}
            {item("/resources.html", "All Guides &amp; Tools")}
            {item("/faq.html", "FAQs")}
          </div>
        </div>
        <a href="/get-started.html" class="rounded-lg bg-teal-600 px-4 py-2 normal-case tracking-normal text-white hover:bg-teal-700">Let's Talk</a>
      </nav>
      <button id="menu-toggle" type="button" class="inline-flex items-center justify-center text-momentum-blue xl:hidden" aria-expanded="false" aria-controls="mobile-menu" aria-label="Open menu">
        <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M4 7h16M4 12h16M4 17h16" /></svg>
      </button>
    </div>
    <div id="mobile-menu" class="hidden border-t border-momentum-grayLight bg-white px-4 py-4 xl:hidden">
      <nav class="flex flex-col gap-3 text-sm font-medium text-momentum-blue" aria-label="Mobile">
        <span class="pt-1 text-xs font-bold uppercase tracking-widest text-momentum-gray">Buy</span>
        <a href="/buy.html#home-search" class="mobile-link py-1 pl-4 text-sm text-momentum-gray">Search Homes</a>
        <a href="/get-started.html" class="mobile-link py-1 pl-4 text-sm text-momentum-gray">Buyer Intake Form</a>
        <a href="/financing-guide.html" class="mobile-link py-1 pl-4 text-sm text-momentum-gray">First-Time Buyer Guide</a>
        <a href="/va-home-buying-guide.html" class="mobile-link py-1 pl-4 text-sm text-momentum-gray">VA Home Buying Guide</a>
        <a href="/new-construction.html" class="mobile-link py-1 pl-4 text-sm text-momentum-gray">New Construction</a>
        <span class="pt-2 text-xs font-bold uppercase tracking-widest text-momentum-gray">Sell</span>
        <a href="/sell.html" class="mobile-link py-1 pl-4 text-sm text-momentum-gray">Sell</a>
        <a href="/military-relocation.html" class="mobile-link pt-2 py-1 font-bold">Military PCS</a>
        <span class="pt-2 text-xs font-bold uppercase tracking-widest text-momentum-gray">Areas</span>
        <a href="/duval-county.html" class="mobile-link py-1 pl-4 text-sm text-momentum-gray">Jacksonville</a>
        <a href="/nassau-county.html" class="mobile-link py-1 pl-4 text-sm text-momentum-gray">Yulee &amp; Amelia Island</a>
        <a href="/st-johns-county.html" class="mobile-link py-1 pl-4 text-sm text-momentum-gray">St. Johns</a>
        <a href="/clay-county.html" class="mobile-link py-1 pl-4 text-sm text-momentum-gray">Clay County</a>
        <a href="/new-construction.html" class="mobile-link py-1 pl-4 text-sm text-momentum-gray">New Construction</a>
        <a href="/get-started.html" class="mobile-link py-1 pt-3 font-bold text-teal-700">Let's Talk</a>
      </nav>
    </div>
  </header>
"""


FOOTER = """
  <footer class="border-t border-slate-800 bg-slate-900 py-8 text-slate-400">
    <div class="mx-auto max-w-7xl px-4 text-center text-sm sm:px-6 lg:px-8">
      <address class="mb-3 not-italic text-xs leading-relaxed text-slate-400"><span class="font-semibold text-slate-300">S² Home Partners Real Estate Team, brokered by Momentum Realty</span><br />13475 Atlantic Blvd, Ste 8, Office S206, Jacksonville, FL 32225<br /><a href="tel:+18503289800" class="text-slate-300 hover:text-white">850-328-9800</a></address>
      <p>&copy; <span id="year"></span> S² Home Partners Real Estate Team | Momentum Realty. All rights reserved.</p>
      <p class="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs">
        <a href="/new-construction.html" class="text-slate-300 hover:text-white">New Construction</a>
        <a href="/military-bases.html" class="text-slate-300 hover:text-white">Base Directory</a>
        <a href="/military-relocation.html" class="text-slate-300 hover:text-white">Military PCS</a>
        <a href="/va-home-buying-guide.html" class="text-slate-300 hover:text-white">VA Guide</a>
        <a href="/faq.html" class="text-slate-300 hover:text-white">FAQs</a>
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
    }
  </script>
</body>
</html>
"""


def render_page(page):
    hero = page["hero"]
    srcset = ""
    if hero.get("srcset"):
        srcset = f' srcset="{esc(hero["srcset"])}" sizes="100vw"'
    faqs = page["faqs"]
    faq_html = []
    for item in faqs:
        faq_html.append(
            f'<details class="group rounded-xl border border-momentum-grayLight bg-white px-4 py-3 open:border-teal-600">'
            f'<summary class="cursor-pointer font-semibold text-momentum-blue">{esc(item["q"])}</summary>'
            f'<p class="mt-2 text-sm leading-6 text-slate-700">{esc(item["a"])}</p></details>'
        )
    cards = "\n".join(card(community) for community in page["communities"])
    all_sources = page["sources"] + life_sources(page["slug"])
    sources = "".join(
        f'<li><a href="{esc(source["url"])}" class="font-semibold text-momentum-blue underline decoration-momentum-grayLight underline-offset-2 hover:decoration-momentum-blue" target="_blank" rel="noopener noreferrer">{esc(source["label"])}</a></li>'
        for source in all_sources
    )
    return (
        head(page, faqs)
        + header()
        + f"""
  <main>
    <section class="relative overflow-hidden bg-momentum-blueDark text-white">
      <img src="{esc(hero["src"])}"{srcset} width="{hero["width"]}" height="{hero["height"]}" alt="{esc(hero["alt"])}" decoding="async" fetchpriority="high" class="absolute inset-0 h-full w-full object-cover" />
      <div class="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/70 to-slate-950/30"></div>
      <div class="relative mx-auto max-w-5xl px-4 py-20 sm:px-6 md:py-28 lg:px-8">
        <nav class="text-xs text-slate-200" aria-label="Breadcrumb">
          <a href="/" class="underline underline-offset-2">Home</a>
          <span aria-hidden="true"> / </span>
          <a href="/new-construction.html" class="underline underline-offset-2">New Construction</a>
          <span aria-hidden="true"> / </span>
          <span>{esc(page["short"])}</span>
        </nav>
        <p class="mt-4 text-xs font-bold uppercase tracking-widest text-teal-200">{page["eyebrow"]}</p>
        <h1 class="mt-3 max-w-3xl font-serif text-4xl font-bold md:text-5xl">{page["h1"]}</h1>
        <p class="mt-4 max-w-2xl text-base font-light leading-relaxed text-slate-100 md:text-lg">{page["dek"]}</p>
        <div class="mt-7 flex flex-wrap gap-3 text-sm">
          <a href="#communities" class="rounded-xl bg-white px-5 py-3 font-bold text-momentum-blue hover:bg-slate-100">See communities</a>
          <a href="#talk" class="rounded-xl border border-white/70 px-5 py-3 font-bold text-white hover:bg-white/10">Ask about {esc(page["short"])}</a>
        </div>
        <p class="mt-8 max-w-2xl text-[0.7rem] leading-5 text-slate-300">{hero["credit"]}</p>
      </div>
    </section>
    <section class="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h2 class="font-serif text-3xl font-semibold text-momentum-blue">New homes in {esc(page["short"])}</h2>
      {paras(page["intro"])}
      <p class="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-950">{esc(NOTE)} Listing a builder here is not a partnership and not a recommendation of that builder over another.</p>
    </section>
    <section id="communities" class="scroll-mt-28 border-t border-momentum-grayLight bg-white py-14">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 class="font-serif text-3xl font-semibold text-momentum-blue">Active new construction communities</h2>
        <p class="mt-3 max-w-3xl text-base leading-relaxed text-slate-700">{page["community_intro"]}</p>
        <div class="mt-8 grid gap-6 lg:grid-cols-2">
          {cards}
        </div>
      </div>
    </section>
    {life_section(page["slug"])}
    <section class="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <h2 class="font-serif text-3xl font-semibold text-momentum-blue">Why military families look at {esc(page["short"])}</h2>
      {paras(page["military"])}
      <h3 class="mt-8 font-serif text-2xl font-semibold text-momentum-blue">Base guides</h3>
      <ul class="mt-3 list-disc space-y-2 pl-5 text-sm">{link_list(page["base_links"])}</ul>
      <h3 class="mt-8 font-serif text-2xl font-semibold text-momentum-blue">Related guides on this site</h3>
      <ul class="mt-3 list-disc space-y-2 pl-5 text-sm">{link_list(page["related"])}</ul>
    </section>
    {buying_section(page["short"])}
    <section class="mx-auto max-w-3xl px-4 pb-4 sm:px-6">
      <h2 class="font-serif text-3xl font-semibold text-momentum-blue">Questions we hear about {esc(page["short"])}</h2>
      <div class="mt-4 space-y-3">{''.join(faq_html)}</div>
    </section>
    {form_section(page)}
    <section class="mx-auto max-w-3xl px-4 pb-16 sm:px-6">
      <h2 class="font-serif text-2xl font-semibold text-momentum-blue">Sources</h2>
      <p class="mt-3 text-sm leading-relaxed text-slate-600">{esc(NOTE)} Drive times below are the published estimates we cite, not a promise for your gate or your report time.</p>
      <ul class="mt-3 list-disc space-y-2 pl-5 text-sm">{sources}</ul>
    </section>
  </main>
"""
        + FOOTER
    )


def render_hub(pages):
    title = "New Construction Homes in Northeast Florida | S² Home Partners Real Estate Team"
    description = (
        "New construction in Yulee, St. Johns County, Clay County, Jacksonville, "
        "and Kingsland and St. Marys. Builder lineups checked November 2026."
    )
    canonical = SITE + "/new-construction.html"
    hero = HERO["hub"]
    cards = []
    for page in pages:
        cards.append(
            f'<a href="/new-construction/{esc(page["slug"])}.html" class="flex flex-col overflow-hidden rounded-2xl border border-momentum-grayLight bg-white shadow-sm transition hover:border-teal-600">'
            f'<img src="{esc(page["hero"]["src"])}" width="{page["hero"]["width"]}" height="{page["hero"]["height"]}" alt="" loading="lazy" decoding="async" class="h-44 w-full object-cover" />'
            f'<span class="block p-5"><span class="text-xs font-bold uppercase tracking-wider text-teal-700">{page["eyebrow"]}</span>'
            f'<span class="mt-1 block font-serif text-2xl font-semibold text-momentum-blue">{esc(page["short"])}</span>'
            f'<span class="mt-2 block text-sm leading-relaxed text-slate-600">{esc(page["hub_blurb"])}</span></span></a>'
        )
    faqs = [
        {
            "q": "Does new construction representation cost the buyer extra?",
            "a": "No. S² Home Partners Real Estate Team represents you at no cost to you. The builder's site agent represents the builder. Register S² Home Partners Real Estate Team on your first visit, before you sign a registration card.",
        },
        {
            "q": "Can I use a VA loan on a new construction home?",
            "a": "Often yes. The builder has to accept VA, the home has to meet VA minimum property requirements, and a builder incentive does not always stack with a VA loan. We check the current sheet for the homesite.",
        },
        {
            "q": "Should a brand-new house still be inspected?",
            "a": "Yes. Ask for a pre-drywall inspection when the contract allows it, and a final inspection before the builder's orientation. New construction still has drainage, window, and punch-list issues.",
        },
        {
            "q": "Which new construction area is closest to NAS Jacksonville, Mayport, or Kings Bay?",
            "a": "Yulee and Camden County are the short side of a Kings Bay commute. Clay County and Jacksonville's Westside sit nearer NAS Jacksonville. The beaches and eTown sit nearer Naval Station Mayport than Yulee does. Each area page cites the drive figures we could verify.",
        },
    ]
    page = {
        "title": title,
        "description": description,
        "canonical": canonical,
        "short": "Northeast Florida",
        "place_name": "Northeast Florida",
        "locality": "Jacksonville",
        "region": "FL",
        "hero": hero,
    }
    faq_html = "".join(
        f'<details class="group rounded-xl border border-momentum-grayLight bg-white px-4 py-3 open:border-teal-600"><summary class="cursor-pointer font-semibold text-momentum-blue">{esc(item["q"])}</summary><p class="mt-2 text-sm leading-6 text-slate-700">{esc(item["a"])}</p></details>'
        for item in faqs
    )
    hub_page = {
        "canonical": canonical,
        "short": "Northeast Florida",
        "area_label": "Northeast Florida new construction",
        "communities": [
            {"name": name}
            for name in [
                "Yulee / Nassau County",
                "St. Johns County",
                "Clay County",
                "Jacksonville Northside",
                "Jacksonville Southside and the Beaches",
                "Jacksonville Westside",
                "Kingsland and St. Marys",
            ]
        ],
    }
    return (
        head(page, faqs)
        + header()
        + f"""
  <main>
    <section class="relative overflow-hidden bg-momentum-blueDark text-white">
      <img src="{esc(hero["src"])}" width="{hero["width"]}" height="{hero["height"]}" alt="{esc(hero["alt"])}" decoding="async" fetchpriority="high" class="absolute inset-0 h-full w-full object-cover" />
      <div class="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/70 to-slate-950/30"></div>
      <div class="relative mx-auto max-w-5xl px-4 py-20 sm:px-6 md:py-28 lg:px-8">
        <nav class="text-xs text-slate-200" aria-label="Breadcrumb"><a href="/" class="underline underline-offset-2">Home</a> <span aria-hidden="true">/</span> <span>New Construction</span></nav>
        <p class="mt-4 text-xs font-bold uppercase tracking-widest text-teal-200">Buy &middot; Northeast Florida</p>
        <h1 class="mt-3 max-w-3xl font-serif text-4xl font-bold md:text-5xl">New construction homes in Northeast Florida</h1>
        <p class="mt-4 max-w-2xl text-base font-light leading-relaxed text-slate-100 md:text-lg">Yulee, St. Johns County, Clay County, Jacksonville, and Kingsland and St. Marys near Kings Bay. Every community on these pages was on a builder or developer site in {CHECKED}.</p>
        <div class="mt-7 flex flex-wrap gap-3 text-sm">
          <a href="#areas" class="rounded-xl bg-white px-5 py-3 font-bold text-momentum-blue hover:bg-slate-100">Choose an area</a>
          <a href="#talk" class="rounded-xl border border-white/70 px-5 py-3 font-bold text-white hover:bg-white/10">Ask S&sup2;</a>
        </div>
        <p class="mt-8 max-w-2xl text-[0.7rem] leading-5 text-slate-300">{hero["credit"]}</p>
      </div>
    </section>
    <section class="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h2 class="font-serif text-3xl font-semibold text-momentum-blue">Start with the area, then the builder</h2>
      <p class="mt-4 text-base leading-relaxed text-slate-700">Military families searching &ldquo;new construction in Yulee,&rdquo; &ldquo;new homes in St. Johns County,&rdquo; or &ldquo;new construction near NAS Jacksonville&rdquo; are usually comparing a commute, a school zone, and a builder incentive at the same time. These pages keep the three separate. The price on a card is the builder&rsquo;s published start, not a promise that the home you want is still at that number.</p>
      <p class="mt-4 text-base leading-relaxed text-slate-700">S² Home Partners Real Estate Team, brokered by Momentum Realty, represents you at no cost to you. Register us on the first visit. We do not have a partnership with any builder listed here.</p>
      <p class="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-950">{esc(NOTE)}</p>
    </section>
    <section id="areas" class="border-t border-momentum-grayLight bg-white py-14">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 class="font-serif text-3xl font-semibold text-momentum-blue">New construction by area</h2>
        <div class="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">{''.join(cards)}</div>
      </div>
    </section>
    {buying_section("Northeast Florida")}
    <section class="mx-auto max-w-3xl px-4 pb-4 sm:px-6">
      <h2 class="font-serif text-3xl font-semibold text-momentum-blue">New construction questions</h2>
      <div class="mt-4 space-y-3">{faq_html}</div>
    </section>
    {form_section(hub_page)}
    <section class="mx-auto max-w-3xl px-4 pb-16 sm:px-6">
      <h2 class="font-serif text-2xl font-semibold text-momentum-blue">Where the details live</h2>
      <p class="mt-3 text-sm leading-relaxed text-slate-600">Each area page lists the builder page, developer page, or news story behind every community. {esc(NOTE)}</p>
      <ul class="mt-3 list-disc space-y-2 pl-5 text-sm">
        <li><a href="/new-construction/yulee-fl.html" class="font-semibold text-momentum-blue underline">Yulee new construction</a></li>
        <li><a href="/new-construction/st-johns-county-fl.html" class="font-semibold text-momentum-blue underline">St. Johns County new homes</a></li>
        <li><a href="/new-construction/clay-county-fl.html" class="font-semibold text-momentum-blue underline">Clay County new construction</a></li>
        <li><a href="/new-construction/jacksonville-northside-fl.html" class="font-semibold text-momentum-blue underline">Jacksonville Northside new homes</a></li>
        <li><a href="/new-construction/jacksonville-beaches-fl.html" class="font-semibold text-momentum-blue underline">Southside and Beaches new construction</a></li>
        <li><a href="/new-construction/jacksonville-westside-fl.html" class="font-semibold text-momentum-blue underline">Westside new construction near NAS Jacksonville</a></li>
        <li><a href="/new-construction/kingsland-st-marys-ga.html" class="font-semibold text-momentum-blue underline">Kingsland and St. Marys new homes</a></li>
      </ul>
    </section>
  </main>
"""
        + FOOTER
    )


def update_sitemap(pages):
    text = SITEMAP.read_text(encoding="utf-8")
    text = re.sub(
        r"\n?  <!-- new-construction:start -->.*?<!-- new-construction:end -->\n?",
        "\n",
        text,
        flags=re.S,
    )
    block = ["  <!-- new-construction:start -->", "  <url>", f"    <loc>{SITE}/new-construction.html</loc>", "    <changefreq>monthly</changefreq>", "    <priority>0.8</priority>", "  </url>"]
    for page in pages:
        block += [
            "  <url>",
            f"    <loc>{SITE}/new-construction/{page['slug']}.html</loc>",
            "    <changefreq>monthly</changefreq>",
            "    <priority>0.7</priority>",
            "  </url>",
        ]
    block.append("  <!-- new-construction:end -->")
    text = text.replace("</urlset>", "\n".join(block) + "\n</urlset>")
    SITEMAP.write_text(text, encoding="utf-8")


def update_redirects(pages):
    text = REDIRECTS.read_text(encoding="utf-8")
    text = re.sub(
        r"\n?# new-construction:start.*?# new-construction:end\n?",
        "\n",
        text,
        flags=re.S,
    )
    lines = [
        "# new-construction:start",
        "/new-construction     /new-construction.html    301!",
        "/new-construction/    /new-construction.html    301!",
    ]
    for page in pages:
        slug = page["slug"]
        lines.append(f"/new-construction/{slug}     /new-construction/{slug}.html    301!")
        lines.append(f"/new-construction/{slug}/    /new-construction/{slug}.html    301!")
    lines.append("# new-construction:end")
    REDIRECTS.write_text(text.rstrip() + "\n\n" + "\n".join(lines) + "\n", encoding="utf-8")


def patch_nav_and_footer():
    changed = 0
    for path in ROOT.rglob("*.html"):
        if "node_modules" in path.parts:
            continue
        text = path.read_text(encoding="utf-8")
        original = text
        if NAV_DESKTOP_OLD in text and 'href="new-construction.html"' not in text:
            text = text.replace(NAV_DESKTOP_OLD, NAV_DESKTOP_NEW)
            text = text.replace(NAV_MOBILE_OLD, NAV_MOBILE_NEW)
        if path.parts[-2:] != ("bases", path.name) and "bases" not in path.parts:
            text = text.replace(
                f'<span class="font-semibold text-slate-300">{FOOTER_OLD}</span>',
                f'<span class="font-semibold text-slate-300">{FOOTER_NEW}</span>',
            )
        if text != original:
            path.write_text(text, encoding="utf-8")
            changed += 1
    bases_script = ROOT / "scripts" / "build-bases.py"
    script = bases_script.read_text(encoding="utf-8")
    script2 = script.replace(
        f'<span class="font-semibold text-slate-300">{FOOTER_OLD}</span>',
        f'<span class="font-semibold text-slate-300">{FOOTER_NEW}</span>',
    )
    if script2 != script:
        bases_script.write_text(script2, encoding="utf-8")
    return changed


def patch_buy_and_home():
    buy = ROOT / "buy.html"
    text = buy.read_text(encoding="utf-8")
    start = text.find('<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">')
    if start == -1:
        return
    end = text.find("\n      </div>\n    </section>", start)
    if end == -1:
        raise SystemExit("Could not find the buy.html new-construction card grid")
    replacement = """<p class="mx-auto mb-8 max-w-3xl text-center text-sm leading-relaxed text-slate-600">The area pages list the builders and starting prices we could verify in November 2026. Older price bands are not repeated here.</p>
        <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <a href="new-construction/yulee-fl.html" class="rounded-2xl border border-momentum-grayLight bg-white p-5 shadow-sm hover:border-teal-600"><span class="text-xs font-bold uppercase text-momentum-gray">Nassau County</span><span class="mt-1 block font-serif text-xl font-semibold text-momentum-blue">Yulee new construction</span><span class="mt-2 block text-sm text-slate-600">Wildlight, Tributary, Liberty Cove, and Pirates Bluff.</span></a>
          <a href="new-construction/st-johns-county-fl.html" class="rounded-2xl border border-momentum-grayLight bg-white p-5 shadow-sm hover:border-teal-600"><span class="text-xs font-bold uppercase text-momentum-gray">St. Johns County</span><span class="mt-1 block font-serif text-xl font-semibold text-momentum-blue">New homes in St. Johns</span><span class="mt-2 block text-sm text-slate-600">SilverLeaf and the Nocatee villages still selling.</span></a>
          <a href="new-construction/clay-county-fl.html" class="rounded-2xl border border-momentum-grayLight bg-white p-5 shadow-sm hover:border-teal-600"><span class="text-xs font-bold uppercase text-momentum-gray">Clay County</span><span class="mt-1 block font-serif text-xl font-semibold text-momentum-blue">Clay County new construction</span><span class="mt-2 block text-sm text-slate-600">Green Cove Springs and Middleburg, near NAS Jacksonville.</span></a>
          <a href="new-construction/jacksonville-northside-fl.html" class="rounded-2xl border border-momentum-grayLight bg-white p-5 shadow-sm hover:border-teal-600"><span class="text-xs font-bold uppercase text-momentum-gray">Jacksonville</span><span class="mt-1 block font-serif text-xl font-semibold text-momentum-blue">Northside / Mayport area</span><span class="mt-2 block text-sm text-slate-600">Where builder inventory is, and where Mayport actually is.</span></a>
          <a href="new-construction/jacksonville-beaches-fl.html" class="rounded-2xl border border-momentum-grayLight bg-white p-5 shadow-sm hover:border-teal-600"><span class="text-xs font-bold uppercase text-momentum-gray">Jacksonville</span><span class="mt-1 block font-serif text-xl font-semibold text-momentum-blue">Southside and the Beaches</span><span class="mt-2 block text-sm text-slate-600">eTown and Seven Pines, inland from the beach towns.</span></a>
          <a href="new-construction/jacksonville-westside-fl.html" class="rounded-2xl border border-momentum-grayLight bg-white p-5 shadow-sm hover:border-teal-600"><span class="text-xs font-bold uppercase text-momentum-gray">Jacksonville</span><span class="mt-1 block font-serif text-xl font-semibold text-momentum-blue">Westside near NAS Jax</span><span class="mt-2 block text-sm text-slate-600">Diamond Springs, Weston Woods, and Eagles Glen.</span></a>
          <a href="new-construction/kingsland-st-marys-ga.html" class="rounded-2xl border border-momentum-grayLight bg-white p-5 shadow-sm hover:border-teal-600"><span class="text-xs font-bold uppercase text-momentum-gray">Camden County, GA</span><span class="mt-1 block font-serif text-xl font-semibold text-momentum-blue">Kingsland and St. Marys</span><span class="mt-2 block text-sm text-slate-600">New homes near Naval Submarine Base Kings Bay.</span></a>
          <a href="new-construction.html" class="rounded-2xl border border-teal-600 bg-teal-50 p-5 shadow-sm"><span class="text-xs font-bold uppercase text-teal-700">All areas</span><span class="mt-1 block font-serif text-xl font-semibold text-momentum-blue">New construction hub</span><span class="mt-2 block text-sm text-slate-600">Compare every market on one page.</span></a>
        </div>"""
    text = text[:start] + replacement + text[end:]
    if 'href="new-construction.html"' not in text.split("id=\"new-construction\"")[0]:
        pass
    buy.write_text(text, encoding="utf-8")

    index = ROOT / "index.html"
    home = index.read_text(encoding="utf-8")
    needle = """          </a>
        </div>
      </div>
    </section>
    <!-- Talk to us: one photo on each side, text between -->"""
    insert = """          </a>
        </div>
        <a href="new-construction.html" class="mt-10 flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-3d md:flex-row">
          <img src="images/photos/fernandina-beach-fl-courthouse-nassau-county-08-09-2010-7-800.webp" width="800" height="1067" alt="Nassau County Courthouse in Fernandina Beach, near the Yulee new-home market" loading="lazy" decoding="async" class="h-56 w-full object-cover md:h-auto md:w-2/5" />
          <span class="block p-8 md:w-3/5">
            <span class="text-xs font-bold uppercase tracking-widest text-teal-700">New construction</span>
            <span class="mt-2 block font-serif text-2xl font-bold text-momentum-blue">New homes in Yulee, St. Johns, Clay, Jacksonville, and Kingsland</span>
            <span class="mt-2 block text-sm leading-relaxed text-slate-600">Builder lineups and starting prices checked in November 2026, with the commute to NAS Jax, Mayport, and Kings Bay called out on each page.</span>
          </span>
        </a>
      </div>
    </section>
    <!-- Talk to us: one photo on each side, text between -->"""
    if needle not in home:
        raise SystemExit("Could not find the homepage card grid")
    if "New homes in Yulee, St. Johns, Clay, Jacksonville, and Kingsland" not in home:
        home = home.replace(needle, insert, 1)
        index.write_text(home, encoding="utf-8")


# --- page facts -----------------------------------------------------------

HERO = {
    "yulee": {
        "src": "/images/photos/fernandina-beach-fl-courthouse-nassau-county-08-09-2010-7-1280.webp",
        "srcset": "/images/photos/fernandina-beach-fl-courthouse-nassau-county-08-09-2010-7-800.webp 800w, /images/photos/fernandina-beach-fl-courthouse-nassau-county-08-09-2010-7-1280.webp 1280w",
        "width": 1280,
        "height": 1707,
        "alt": "Historic Nassau County Courthouse in Fernandina Beach, Florida",
        "credit": 'Nassau County Courthouse, Fernandina Beach. Photo: Georgia Guercio, <a class="underline" href="https://commons.wikimedia.org/wiki/File:Fernandina_Beach,_FL,_Courthouse,_Nassau_County,_08-09-2010_(7).JPG">CC BY-SA 3.0 via Wikimedia Commons</a>.',
    },
    "stjohns": {
        "src": "/images/photos/aerial-view-of-the-castillo-de-san-marcos-st-augustine-fl-2025-05-20-1280.webp",
        "srcset": "/images/photos/aerial-view-of-the-castillo-de-san-marcos-st-augustine-fl-2025-05-20-800.webp 800w, /images/photos/aerial-view-of-the-castillo-de-san-marcos-st-augustine-fl-2025-05-20-1280.webp 1280w",
        "width": 1280,
        "height": 640,
        "alt": "Aerial view of Castillo de San Marcos in St. Augustine",
        "credit": 'Castillo de San Marcos, St. Augustine. Photo: Schwerdf, <a class="underline" href="https://commons.wikimedia.org/wiki/File:Aerial_view_of_the_Castillo_de_San_Marcos,_St._Augustine,_FL_2025-05-20.jpg">CC BY 4.0 via Wikimedia Commons</a>.',
    },
    "clay": {
        "src": "/images/photos/doctors-lake-1280.webp",
        "srcset": "/images/photos/doctors-lake-480.webp 480w, /images/photos/doctors-lake-800.webp 800w, /images/photos/doctors-lake-1280.webp 1280w",
        "width": 1280,
        "height": 1707,
        "alt": "Doctors Lake in Clay County, Florida",
        "credit": 'Doctors Lake, Clay County. Photo: Saraleebread, <a class="underline" href="https://commons.wikimedia.org/wiki/File:Doctors_Lake.jpg">CC BY-SA 4.0 via Wikimedia Commons</a>.',
    },
    "beaches": {
        "src": "/images/photos/jax-beach-2024-pier-1280.webp",
        "srcset": "/images/photos/jax-beach-2024-pier-800.webp 800w, /images/photos/jax-beach-2024-pier-1280.webp 1280w",
        "width": 1280,
        "height": 459,
        "alt": "The Jacksonville Beach Pier",
        "credit": 'Jacksonville Beach Pier. Photo: Excel23, <a class="underline" href="https://commons.wikimedia.org/wiki/File:Jax_Beach_2024_Pier.jpg">CC BY 4.0 via Wikimedia Commons</a>.',
    },
    "north": {
        "src": "/images/bases/mayport-gate-hero.webp",
        "width": 1600,
        "height": 1200,
        "alt": "Entrance to Naval Station Mayport seen from Kathryn Abbey Hanna Park",
        "credit": 'Naval Station Mayport from Hanna Park. Photo: The Bushranger, <a class="underline" href="https://commons.wikimedia.org/wiki/File:Entrance_to_Naval_Station_Mayport_from_Hanna_Park.jpg">CC BY-SA 4.0 via Wikimedia Commons</a>.',
    },
    "west": {
        "src": "/images/bases/nas-jax-aerial-hero.webp",
        "width": 1600,
        "height": 1067,
        "alt": "Aerial view of Naval Air Station Jacksonville along the St. Johns River",
        "credit": 'Naval Air Station Jacksonville. Photo: U.S. Navy, <a class="underline" href="https://commons.wikimedia.org/wiki/File:Aerial_view_of_Naval_Air_Station_Jacksonville_(180520-N-BO384-001).jpg">public domain</a>.',
    },
    "camden": {
        "src": "/images/bases/st-marys-waterfront-gal.webp",
        "width": 800,
        "height": 534,
        "alt": "Waterfront pavilion and marsh at St. Marys, Georgia",
        "credit": 'St. Marys waterfront pavilion. Photo: Mjrmtg, <a class="underline" href="https://commons.wikimedia.org/wiki/File:St._Marys_Waterfront_Pavilion_full.jpg">CC BY 4.0 via Wikimedia Commons</a>.',
    },
    "hub": {
        "src": "/images/photos/memparkjaxlife-1280.webp",
        "srcset": "/images/photos/memparkjaxlife-800.webp 800w, /images/photos/memparkjaxlife-1280.webp 1280w",
        "width": 1280,
        "height": 1714,
        "alt": "The Life sculpture in Memorial Park, Riverside, Jacksonville",
        "credit": 'Memorial Park, Riverside. Photo: Mgreason, <a class="underline" href="https://commons.wikimedia.org/wiki/File:MemParkJaxLife.jpg">CC BY-SA 3.0 via Wikimedia Commons</a>.',
    },
}


def page_shell(**kwargs):
    slug = kwargs["slug"]
    kwargs["canonical"] = f"{SITE}/new-construction/{slug}.html"
    return kwargs


PAGES = [
    page_shell(
        slug="yulee-fl",
        short="Yulee",
        area_label="Yulee / Nassau County new construction",
        title="Yulee FL New Construction | New Homes in Yulee & Nassau County",
        description="New construction in Yulee, FL: Wildlight, Tributary, Liberty Cove, and Pirates Bluff. Builders, price ranges, schools, and the drive to Kings Bay. Checked Nov 2026.",
        h1="New construction in Yulee, FL",
        eyebrow="Nassau County &middot; New homes in Yulee",
        dek="Wildlight, Tributary, and the other Yulee communities whose builders were still publishing homes in November 2026, with the Kings Bay commute spelled out.",
        hero=HERO["yulee"],
        place_name="Yulee, Florida",
        locality="Yulee",
        region="FL",
        hub_blurb="Wildlight, Tributary, Liberty Cove, and Pirates Bluff, on the Florida side of Kings Bay.",
        community_intro="Four Yulee communities had a builder or developer page with homes for sale or a published start price when we checked in November 2026. Neighborhoods that other sites mention, but that we could not match to a current builder page, are not listed.",
        intro=[
            "Yulee, in Nassau County, is the new-home market military families use when Naval Submarine Base Kings Bay is the gate that matters and a brand-new house is the goal. The two master plans are Wildlight, developed by Raydient Places + Properties, and Tributary. D.R. Horton and Dream Finders Homes are also selling in Yulee outside those two plans.",
            "Nassau County School District serves the area. Which elementary school an address uses is not the same story in every village, so the cards below repeat only what that community&rsquo;s own site published, and they tell you to confirm the homesite.",
        ],
        military=[
            "Kings Bay is the short commute from Yulee. NAS Jacksonville and Naval Station Mayport are the long way around, on the other side of Jacksonville. Our Wildlight guide, last reviewed in October 2026, lists about 17 minutes off-peak to NSB Kings Bay, about 37 minutes to NAS Jacksonville, and about 40 minutes to NS Mayport. A separate Tuesday 8 a.m. measurement on September 23, 2026 put the Wildlight center point at about 37 minutes to NAS Jacksonville and about 47 minutes to NS Mayport. Tributary is in the same Yulee corridor, not the same driveway.",
            "Families who pick Yulee are usually trading that longer NAS Jax or Mayport drive for a newer house, Nassau County schools, and a shorter trip to Amelia Island and Jacksonville International Airport. Wildlight&rsquo;s own site puts the Village Center about 15 minutes from the airport, about 25 minutes from downtown Jacksonville, and about 25 minutes from Amelia Island&rsquo;s beaches.",
        ],
        communities=[
            {
                "name": "Wildlight",
                "builders": "David Weekley Homes, Pulte Homes, Del Webb, and Dostie Homes are the builders Wildlight names as active. Ashton Woods, Perry Homes, and Toll Brothers are named for the Garden District. Raydient Places + Properties is the developer.",
                "types": "Single-family homes, townhomes, and a gated 55+ neighborhood, Del Webb Wildlight. David Weekley&rsquo;s Westerly Park collections run about 1,569 to 1,937 square feet. Woodlyn floor plans on the same site run about 1,779 to 3,291 square feet, without a published start price when we checked.",
                "price": "From the $300s to the $700s and up, which is Wildlight&rsquo;s own published range. David Weekley listed Westerly Park from $299,990 (Overlook), $324,990 (Courtyard and Villa), and $339,990 (Plaza) in November 2026.",
                "hoa": "Wildlight says yes, there are HOA fees, and they vary by builder and neighborhood. Shared assets are managed through structures such as the East Nassau Stewardship District. Get the dues and any district assessment for the specific homesite. We are not publishing a dollar figure because the developer does not publish one number for the whole town.",
                "amenities": "Village Center shops, a Publix, the Wildlight YMCA, UF Health, parks, and trails. The Garden District is the newer, more natural district, with a linear park planned toward the St. Marys River bluffs.",
                "schools": "Nassau County School District. Wildlight Elementary is open inside the community. The developer says land is reserved for future middle and high schools and that families should check which schools serve the address. Do not assume every Wildlight lot is zoned the same way.",
                "bases": "Use the Yulee figures above as corridor estimates. Wildlight to Kings Bay is the short drive. NAS Jacksonville and Mayport are roughly 35 to 50 minutes depending on the hour and which published estimate you use.",
                "extra": "Wildlight&rsquo;s FAQ, still worded this way in November 2026, describes Garden District pre-sales at Bellflower (Perry Homes and Toll Brothers) as a summer 2026 opening, with David Weekley at Woodlyn and Ashton Woods at Mayfield following in winter 2026. David Weekley is already listing Woodlyn plans. Confirm which models are actually open before you drive up. Wildlight and Tributary are on our weekly new-construction visit rotation.",
                "url": "https://wildlight.com/faq/",
                "link_label": "Wildlight FAQ and builder list",
            },
            {
                "name": "Tributary",
                "builders": "Lennar and David Weekley Homes are the current builders, per Tributary&rsquo;s site (reviewed April 6, 2026, and still the lineup on that page). Dream Finders Homes and Richmond American Homes are named only for sold-out phases. GreenPointe is the developer.",
                "types": "One- and two-story single-family homes, about 1,700 to more than 3,000 square feet. Townhomes are described as a future phase, not a current product. Lakeview at Tributary is Lennar&rsquo;s 55+ neighborhood. Tributary says the first Lakeview phase has sold out and more homes are expected.",
                "price": "David Weekley lists Tributary 50-foot homes from $366,900 (about 1,707 to 2,796 square feet) and 70-foot homes from $498,900 (about 2,604 to 3,202 square feet). That is from the mid $360s. Lennar&rsquo;s current Tributary start price was not on a Lennar page we could cite, so it is not printed here.",
                "hoa": "Tributary&rsquo;s FAQ does not publish an HOA dollar amount or say whether a CDD is on the tax bill. Ask the builder for both before you compare a payment with BAH.",
                "amenities": "The Lookout amenity center, a resort-style pool, fitness studio, pickleball, a tot lot, a dog park, and multi-use paths. A kayak launch at Boggy Creek and trail access to Tributary Regional Park are described as part of the plan.",
                "schools": "Tributary says the community is served by Wildlight Elementary, Yulee Middle School, and Yulee High School in the Nassau County School District. GreenPointe has donated land for a future public school next to the community. Confirm the homesite with the district anyway. Zoning can move.",
                "bases": "Tributary says it is about 25 miles north of downtown Jacksonville, about 20 minutes from Jacksonville International Airport, and about 20 minutes from Amelia Island, with access to I-95 and U.S. 17. The same page says the location is used for commutes to Jacksonville&rsquo;s Northside and nearby bases. It does not publish a minute count to Kings Bay, NAS Jacksonville, or Mayport.",
                "extra": "Tributary is on our weekly new-construction visit rotation, paired with Wildlight.",
                "url": "https://tributaryliving.com/community/community-faqs/",
                "link_label": "Tributary community FAQ",
            },
            {
                "name": "Liberty Cove",
                "builders": "D.R. Horton. Single-family homes and a separate townhome collection.",
                "types": "Single-family homes from about 1,402 square feet, 3 to 4 bedrooms, one and two stories, 2-car garages. Townhomes from about 1,167 square feet, 2 to 3 bedrooms, 2.5 baths, one-car garages.",
                "price": "Single-family homes from $329,350, which is from the $320s. Townhomes from $279,990, which is from the high $270s. Both figures are the headings on D.R. Horton&rsquo;s own pages.",
                "hoa": "D.R. Horton&rsquo;s Liberty Cove pages list amenities and do not publish an HOA or CDD amount. Ask for the resale certificate numbers, or the equivalent new-home estimate, for the lot.",
                "amenities": "Pool, cabana, playground, fire pit, walking path, and grill, listed on both the single-family and townhome pages.",
                "schools": "The single-family page lists Wildlight Elementary, Yulee Middle, and Yulee High. The townhome page lists Yulee Elementary, Yulee Middle, and Yulee High. Those two D.R. Horton pages do not agree, so confirm the homesite with the Nassau County School District before you treat either list as zoning.",
                "bases": "Both collections are in Yulee, ZIP 32097, so they sit in the same Kings Bay corridor as Wildlight and Tributary. D.R. Horton does not publish a drive time to the bases.",
                "url": "https://www.drhorton.com/florida/jacksonville-area/yulee/liberty-cove",
                "link_label": "D.R. Horton at Liberty Cove",
            },
            {
                "name": "Pirates Bluff",
                "builders": "Dream Finders Homes.",
                "types": "Single-family homes, 5 bedrooms and 4 baths, about 2,881 to 3,338 square feet. Dream Finders labels the community a final opportunity.",
                "price": "From $569,990, which is from the $560s, on the Dream Finders Yulee page in November 2026.",
                "hoa": "Not stated on the Dream Finders Yulee page we checked. Confirm dues and any district assessment with the builder.",
                "amenities": "Not described on that page. Do not assume Wildlight&rsquo;s amenity list applies. Pirates Bluff is listed as its own Yulee community.",
                "schools": "Yulee is in the Nassau County School District. Dream Finders does not name the zoned schools on this page. Confirm the address.",
                "bases": "Yulee corridor. Same caution as the other Yulee communities: Kings Bay is the nearer base, and NAS Jacksonville and Mayport are a cross-town drive.",
                "url": "https://dreamfindershomes.com/new-homes/fl/yulee/",
                "link_label": "Dream Finders in Yulee",
            },
        ],
        faqs=[
            {
                "q": "What new construction communities are selling in Yulee right now?",
                "a": "In November 2026, Wildlight, Tributary, Liberty Cove, and Pirates Bluff had builder or developer pages with homes for sale or a published price. Wildlight also names Garden District builders whose models may just be opening. Confirm before you visit.",
            },
            {
                "q": "How far is Yulee new construction from Kings Bay, NAS Jacksonville, and Mayport?",
                "a": "Our Wildlight guide lists about 17 minutes off-peak to NSB Kings Bay, about 37 minutes to NAS Jacksonville, and about 40 minutes to NS Mayport. A Tuesday 8 a.m. measurement put Wildlight at about 37 minutes to NAS Jacksonville and about 47 minutes to Mayport. Traffic and the exact village change the drive.",
            },
            {
                "q": "Which schools serve new homes in Yulee?",
                "a": "Nassau County School District. Wildlight Elementary is open at Wildlight. Tributary publishes Wildlight Elementary, Yulee Middle, and Yulee High. D.R. Horton's two Liberty Cove pages name different elementaries. Confirm the homesite with the district.",
            },
            {
                "q": "Do Yulee new construction homes have HOA and CDD fees?",
                "a": "Wildlight says HOA fees vary by neighborhood and that shared assets are handled through the East Nassau Stewardship District. Tributary and the Dream Finders and D.R. Horton pages we checked do not publish one fee for every lot. Get the number for the homesite.",
            },
            {
                "q": "Can S² Home Partners Real Estate Team represent me at a Yulee model home?",
                "a": "Yes. Representation is at no cost to you. Register S² Home Partners Real Estate Team on your first visit, before you sign the builder's registration card. We are not a partner of Wildlight, Tributary, or any builder.",
            },
        ],
        sources=[
            {"label": "Wildlight FAQ, builders, prices, schools, and HOA", "url": "https://wildlight.com/faq/"},
            {"label": "David Weekley Homes in Yulee, including Westerly Park and Tributary prices", "url": "https://www.davidweekleyhomes.com/new-homes/fl/jacksonville/yulee"},
            {"label": "Tributary community FAQ", "url": "https://tributaryliving.com/community/community-faqs/"},
            {"label": "D.R. Horton, Liberty Cove single-family", "url": "https://www.drhorton.com/florida/jacksonville-area/yulee/liberty-cove"},
            {"label": "D.R. Horton, Liberty Cove townhomes", "url": "https://www.drhorton.com/florida/jacksonville-area/yulee/liberty-cove-townhomes"},
            {"label": "Dream Finders Homes in Yulee, Pirates Bluff", "url": "https://dreamfindershomes.com/new-homes/fl/yulee/"},
            {"label": "Tuesday 8 a.m. drive-time table, measured September 23, 2026", "url": "https://www.kristafracke.com/commute-map"},
            {"label": "S² Home Partners Real Estate Team Wildlight guide, off-peak drive times, reviewed October 2026", "url": "https://buyjacksonvillefl.com/wildlight.html"},
        ],
        base_links=[
            {"href": "/bases/nsb-kings-bay.html", "label": "NSB Kings Bay guide"},
            {"href": "/bases/nas-jacksonville.html", "label": "NAS Jacksonville guide"},
            {"href": "/bases/ns-mayport.html", "label": "Naval Station Mayport guide"},
        ],
        related=[
            {"href": "/wildlight.html", "label": "Wildlight neighborhood guide"},
            {"href": "/tributary.html", "label": "Tributary neighborhood guide"},
            {"href": "/nassau-county.html", "label": "Nassau County guide"},
            {"href": "/sandy-ridge-yulee.html", "label": "Sandy Ridge, Yulee"},
            {"href": "/new-construction/kingsland-st-marys-ga.html", "label": "New homes on the Georgia side of Kings Bay"},
        ],
    ),
]


def more_pages():
    """The remaining markets. Kept in a function so the Yulee record stays readable."""
    return [
        page_shell(
            slug="st-johns-county-fl",
            short="St. Johns County",
            area_label="St. Johns County new construction",
            title="St. Johns County New Construction | New Homes in St. Johns, FL",
            description="New homes in St. Johns County, FL: SilverLeaf and Nocatee, with builders, starting prices, schools, and CDD notes checked November 2026.",
            h1="New homes in St. Johns County, FL",
            eyebrow="St. Johns &middot; Nocatee and SilverLeaf",
            dek="SilverLeaf and the Nocatee villages that still had builders publishing homes in November 2026.",
            hero=HERO["stjohns"],
            place_name="St. Johns County, Florida",
            locality="St. Johns County",
            region="FL",
            hub_blurb="SilverLeaf, with no CDD on the developer's site, and Nocatee villages that were still selling.",
            community_intro="St. Johns County has more new-home names than any page should pretend to finish. These two are the master plans whose own sites were still naming builders and, where we cite a number, a starting price.",
            intro=[
                "St. Johns County is the county families mean when they search &ldquo;new homes in St. Johns, FL.&rdquo; SilverLeaf, by The Hutson Companies, sits on St. Johns Parkway between County Road 210 and State Road 16, west of I-95. Nocatee, by The PARC Group, is mostly in northern St. Johns County with a Ponte Vedra address.",
                "A new St. Johns address can carry a master HOA, a neighborhood HOA, and, at Nocatee, a Tolomato Community Development District assessment on the county tax bill. SilverLeaf&rsquo;s own site says the community has no CDD fees. Those are different monthly budgets. Compare them before you compare floor plans.",
            ],
            military=[
                "St. Johns County is a longer drive to Kings Bay than Yulee, and it is not the closest roof to NAS Jacksonville. It is where a lot of PCS buyers still look, because of the schools and because the resale market is deep when the next set of orders comes.",
                "A Tuesday 8 a.m. drive-time table measured on September 23, 2026 puts the Nocatee center point at about 42 minutes to NAS Jacksonville and about 52 minutes to NS Mayport. SilverLeaf is farther west, between CR 210 and SR 16. We are not printing a SilverLeaf minute count because that table did not include it. Run the address.",
            ],
            communities=[
                {
                    "name": "SilverLeaf",
                    "builders": "The developer&rsquo;s builder page lists Ashley Homes, David Weekley Homes, Dream Finders Homes, ICI Homes, Lennar, Master Craft, Reverie, Richmond American Homes, Riverside Homes, Taylor Morrison, and Toll Brothers. Not every name has homes available in a given month.",
                    "types": "The community site describes a wide range of sizes and styles. The builder pages we priced are single-family: Lennar at Silver Meadows, Dream Finders at Silver Landing, and Toll Brothers at Newbrook.",
                    "price": "Lennar lists Silver Meadows from $414,990, from the low $410s. Dream Finders lists Silver Landing from $519,990, from the $510s. Toll Brothers lists the Newbrook Cypress collection from $419,995, from the $410s. Other builders on the roster did not have a start price we are willing to print from their own sites.",
                    "hoa": "SilverLeaf&rsquo;s site says there are no CDD fees. It does not publish a master HOA dollar amount. Ask each builder for neighborhood dues. A payment comparison that ignores dues is not a real comparison.",
                    "amenities": "The developer describes neighborhood parks, more than 50 miles of sidewalks and cart paths, and community amenities, on about 11,000 acres with conservation land. Seven miles of St. Johns Parkway run through the community.",
                    "schools": "St. Johns County School District opened Magnolia Oaks Academy, a K-8 school inside SilverLeaf, for 2026-2027, starting with kindergarten through seventh grade. The district&rsquo;s attendance-zone change for that school names a list of SilverLeaf neighborhoods and leaves other parcels in other zones. Confirm the homesite on the district locator. We are not naming a high school here because the district notice we used is about the K-8 change.",
                    "bases": "West of I-95 between CR 210 and SR 16. Farther from Mayport and NAS Jacksonville than the Ponte Vedra and Nocatee villages, and a long drive to Kings Bay. The developer says downtown Jacksonville is the metro you are driving toward. It does not publish base minutes.",
                    "url": "https://silverleafflorida.com/",
                    "link_label": "SilverLeaf community site",
                },
                {
                    "name": "Nocatee",
                    "builders": "Seabrook Village&rsquo;s own builder page lists David Weekley Homes, Riverside Homes, and Providence Homes from the low $500s, Dostie Homes from the mid $600s, Toll Brothers with one home left in the mid $700s, and ICI Homes with one home left from the high $600s. West End at Town Center lists ICI townhomes from the high $400s and one Dostie villa at $629,900. The Jacksonville Business Journal reported on November 18, 2026 that Toll Brothers had sold its last Nocatee home. Treat Toll as sold out unless the builder still shows a home.",
                    "types": "Townhomes at West End, about 1,650 to 2,450 square feet on ICI&rsquo;s Nocatee listing, and single-family homes in Seabrook. Nocatee is a large master plan. Most villages are resale, not a model-home visit.",
                    "price": "From the high $400s for ICI townhomes at West End, and from the low $500s for several Seabrook builders. That is Nocatee&rsquo;s wording, not a single listing price.",
                    "hoa": "Nocatee has neighborhood associations plus the Tolomato Community Development District. The district says the fiscal year 2027 assessment, debt plus operations and maintenance, is the amount on the November 2026 county tax bill, and that it varies by parcel. Look up the lot at mytcdd.com. We are not printing one CDD number for every village.",
                    "amenities": "Use Nocatee&rsquo;s site and our Nocatee guide for the Town Center and village amenities. They are not the same in Seabrook as they are at West End.",
                    "schools": "Nocatee publishes 2026-2027 zoning. Seabrook Village and several neighboring Seabrook villages are listed for Sabal Crest Academy in grades K-7, Pine Island Academy for 8th grade, and Nease High School. West End at Town Center is listed for Pine Island Academy in grades K-8 and Nease High School. The district says the new K-8 schools open with kindergarten through seventh grade first. Confirm the address. A portion of Nocatee is in Duval County and uses a different lookup.",
                    "bases": "About 42 minutes to NAS Jacksonville and about 52 minutes to NS Mayport at a Tuesday 8 a.m. departure from Nocatee&rsquo;s center point, measured September 23, 2026. Kings Bay is a longer drive than from Yulee. Your village can sit several minutes off that center point.",
                    "extra": "Nocatee is on our weekly new-construction visit rotation. West End and Seabrook are the villages with builder prices on the community site. Most other Nocatee villages are resale.",
                    "url": "https://www.nocatee.com/seabrook-village-builders",
                    "link_label": "Nocatee's Seabrook builder list",
                },
            ],
            faqs=[
                {
                    "q": "Where is new construction still selling in St. Johns County?",
                    "a": "SilverLeaf is actively selling across several builders. Inside Nocatee, Seabrook Village and West End at Town Center were the neighborhoods with builder prices on Nocatee's own site in November 2026. Toll Brothers was reported sold out of Nocatee on November 18, 2026.",
                },
                {
                    "q": "Does SilverLeaf have a CDD?",
                    "a": "SilverLeaf's website says the community has no CDD fees. Ask the builder for any HOA dues. Nocatee is different: Tolomato CDD assessments are on the county tax bill and vary by lot.",
                },
                {
                    "q": "What schools serve SilverLeaf and Nocatee?",
                    "a": "Magnolia Oaks Academy opened inside SilverLeaf for 2026-2027 as a K-8, starting with grades K-7. Nocatee lists Sabal Crest Academy or Pine Island Academy by village, and Nease High School for the villages on its 2026-2027 zoning page. Confirm the address with St. Johns County School District.",
                },
                {
                    "q": "How far is St. Johns County new construction from the bases?",
                    "a": "A Tuesday 8 a.m. measurement puts Nocatee about 42 minutes from NAS Jacksonville and about 52 minutes from NS Mayport. SilverLeaf is west of I-95 and was not in that table. Kings Bay is a longer drive than from Yulee.",
                },
                {
                    "q": "Who represents me at a St. Johns model home?",
                    "a": "S² Home Partners Real Estate Team can, at no cost to you, if we are registered on your first visit. The site agent represents the builder. We are not partners with SilverLeaf, Nocatee, or their builders.",
                },
            ],
            sources=[
                {"label": "SilverLeaf community site, including the no-CDD statement", "url": "https://silverleafflorida.com/"},
                {"label": "SilverLeaf builder list", "url": "https://silverleafflorida.com/builders/"},
                {"label": "Lennar at Silver Meadows", "url": "https://www.lennar.com/new-homes/florida/jacksonville-st-augustine/st-augustine/silver-meadows-at-silverleaf"},
                {"label": "Dream Finders at Silver Landing", "url": "https://dreamfindershomes.com/new-homes/fl/st-augustine/silver-landing-at-silverleaf/"},
                {"label": "Toll Brothers, Newbrook Cypress collection", "url": "https://www.tollbrothers.com/luxury-homes-for-sale/Florida/Newbrook/Cypress-Collection"},
                {"label": "St. Johns County School District on Magnolia Oaks Academy", "url": "https://www.stjohns.k12.fl.us/news/silverleaf-school/"},
                {"label": "St. Johns County attendance zones", "url": "https://www.stjohns.k12.fl.us/zoning/"},
                {"label": "Nocatee, Seabrook Village builders", "url": "https://www.nocatee.com/seabrook-village-builders"},
                {"label": "Nocatee, West End builders", "url": "https://www.nocatee.com/west-end-builders"},
                {"label": "Nocatee 2026-2027 school zoning", "url": "https://www.nocatee.com/schools/school-zoning-for-nocatee-students/"},
                {"label": "Tolomato CDD assessment explanation", "url": "https://mytcdd.com/"},
                {"label": "Jacksonville Business Journal, Toll Brothers sells out of Nocatee, November 18, 2026", "url": "https://www.bizjournals.com/jacksonville/news/2026/11/18/toll-brothers-sells-out-of-offerings-in-nocatee.html"},
                {"label": "Tuesday 8 a.m. drive-time table, measured September 23, 2026", "url": "https://www.kristafracke.com/commute-map"},
            ],
            base_links=[
                {"href": "/bases/ns-mayport.html", "label": "Naval Station Mayport guide"},
                {"href": "/bases/nas-jacksonville.html", "label": "NAS Jacksonville guide"},
                {"href": "/bases/nsb-kings-bay.html", "label": "NSB Kings Bay guide"},
            ],
            related=[
                {"href": "/st-johns-county.html", "label": "St. Johns County guide"},
                {"href": "/nocatee.html", "label": "Nocatee neighborhood guide"},
                {"href": "/silverleaf-rivertown.html", "label": "SilverLeaf and RiverTown guide"},
                {"href": "/ponte-vedra-beach.html", "label": "Ponte Vedra Beach guide"},
            ],
        ),
        page_shell(
            slug="clay-county-fl",
            short="Clay County",
            area_label="Clay County new construction",
            title="Clay County FL New Construction | New Homes in Green Cove & Middleburg",
            description="New construction in Clay County, FL: Wilford Oaks, Hyland Trail, Green Cove Springs, and Middleburg. Prices and local life checked Nov 2026.",
            h1="New construction in Clay County, FL",
            eyebrow="Green Cove Springs, Middleburg, Oakleaf",
            dek="The Clay County communities whose builders were publishing start prices in November 2026, on the side of town closest to NAS Jacksonville.",
            hero=HERO["clay"],
            place_name="Clay County, Florida",
            locality="Green Cove Springs",
            region="FL",
            hub_blurb="Wilford Oaks, Hyland Trail, Amberly, Anabelle Island, and Middleburg.",
            community_intro="Oakleaf Plantation is the established master plan families already compare on this side of the county. The cards are the communities with a builder start price we could read on the builder&rsquo;s or developer&rsquo;s site. Names we could not verify that way are left off.",
            intro=[
                "Clay County sits on the west bank of the St. Johns River, across from NAS Jacksonville and Mandarin. Green Cove Springs and Middleburg are where the production builders are opening new phases. Oakleaf is the larger, mostly built community next door, with its own pools, schools, and CDD history. Our Oakleaf guide covers that resale and established side.",
                "A Clay address can be a fast NAS Jacksonville commute and a long Mayport or Kings Bay commute. Do not borrow a Yulee drive time and do not borrow an Orange Park drive time. They are different roads.",
            ],
            military=[
                "NAS Jacksonville is the base Clay buyers are usually solving for. The county guide on this site describes Clay as directly across the river from the air station. We are not adding a minute figure for every community, because the builders did not publish one and we did not run a same-day measurement for each village.",
                "Hyland Trail&rsquo;s developer says the community is about a 15-minute drive from Ascension St. Vincent&rsquo;s Clay County and Baptist Clay. That is a hospital drive, not a gate drive. Mayport and Kings Bay are the long commutes from this side of the county.",
            ],
            communities=[
                {
                    "name": "Wilford Oaks",
                    "builders": "Dream Finders Homes.",
                    "types": "Single-family homes, ranch and two-story, about 1,657 to 3,533 square feet, 3 to 5 bedrooms. The sales office is 2639 Firethorn Avenue, Orange Park 32073.",
                    "price": "From $348,490, which is from the $340s, on the Dream Finders page in November 2026.",
                    "hoa": "Not published as a dollar amount on the community page. The amenity list means there is an association. Ask for the dues and any CDD before you compare the payment with BAH.",
                    "amenities": "Dream Finders describes a community pool, clubhouse, fitness center, dog park, and playground as part of daily life here, not as a future phase.",
                    "schools": "Dream Finders lists nearby schools as Argyle Elementary, Orange Park Junior High, and Orange Park High School. Treat that as the builder&rsquo;s list and confirm the homesite with Clay County District Schools.",
                    "bases": "Dream Finders says the community is just minutes from NAS Jacksonville, with SR 23 toward downtown. It does not print a gate time. Mayport and Kings Bay are the long drives from Orange Park.",
                    "extra": "Dream Finders also points shoppers to Oakleaf Town Center for retail, restaurants, and entertainment. This is one of the communities on our weekly new-construction visit rotation.",
                    "url": "https://dreamfindershomes.com/new-homes/fl/orange-park/wilford-oaks/",
                    "link_label": "Dream Finders at Wilford Oaks",
                },
                {
                    "name": "Hyland Trail",
                    "builders": "Dream Finders Homes, Drees Homes, Pulte Homes, and Perry Homes, plus Lennar at Edenbrooke, the 55+ section. GreenPointe is the developer.",
                    "types": "Single-family homes on 50-foot and 60-foot homesites. Pulte lists about 1,590 to 3,459 square feet. Edenbrooke is Lennar&rsquo;s active-adult neighborhood inside the community.",
                    "price": "The community site says new homes from the $300s to the $700s, and Lennar at Edenbrooke from the $300s. Pulte lists homes from $334,990. Dream Finders lists the 50-foot collection from $342,490 and the 60-foot collection from $473,990.",
                    "hoa": "Neither GreenPointe nor the builder pages we checked publish one HOA or CDD dollar amount for Hyland Trail. Ask for both. Do not assume &ldquo;from the $300s&rdquo; includes them.",
                    "amenities": "GreenPointe describes multi-purpose trails, pocket parks, a resort-style pool and splash zone, a fitness center, pickleball, a play park, and a dog park, on a 750-acre community of about 1,800 homesites along Henley Road, next to Ronnie Van Zant Memorial Park.",
                    "schools": "Pulte says Clay County schools and does not name the zoned campus on the page we checked. Confirm the address with Clay County District Schools.",
                    "bases": "Green Cove Springs / Lake Asbury. The developer describes access toward downtown Jacksonville and a 15-minute drive to the two Clay hospitals. NAS Jacksonville is the nearer of the three local bases. Mayport and Kings Bay are not short drives from Henley Road.",
                    "extra": "Hyland Trail is on our weekly new-construction visit rotation. Several builders sell here, so register with S² Home Partners Real Estate Team once and we can walk more than one model without you signing in alone at each trailer.",
                    "url": "https://greenpointellc.com/communities/hyland-trail/",
                    "link_label": "GreenPointe on Hyland Trail",
                },
                {
                    "name": "Amberly",
                    "builders": "Dream Finders Homes.",
                    "types": "Single-family collections on 40-foot, 50-foot, and 60-foot homesites in Green Cove Springs.",
                    "price": "From $284,990 on the 40-foot collection, from $319,990 on the 50-foot collection, and from $345,990 on the 60-foot collection. That starts in the $280s.",
                    "hoa": "Not published on the Dream Finders Green Cove Springs page. Confirm dues and any CDD for the lot.",
                    "amenities": "Not listed on that page. Confirm the amenity set at the model, and whether it is open or still planned.",
                    "schools": "Clay County District Schools. The builder page does not name a campus. Confirm the address.",
                    "bases": "Green Cove Springs. Same NAS Jacksonville side of the river as the rest of this page. No builder drive time to the gate.",
                    "url": "https://dreamfindershomes.com/new-homes/fl/green-cove-springs/",
                    "link_label": "Dream Finders in Green Cove Springs",
                },
                {
                    "name": "Anabelle Island",
                    "builders": "Dream Finders Homes, on the builder&rsquo;s Green Cove Springs page. We are not adding a second builder here because that page does not name one.",
                    "types": "40-foot and 55-foot collections.",
                    "price": "From $309,990 on both collections listed, which is from the $300s.",
                    "hoa": "Not published on the page we checked. Confirm for the homesite.",
                    "amenities": "Not published on that page.",
                    "schools": "Clay County District Schools. Confirm the address. The builder page does not name a school.",
                    "bases": "Green Cove Springs. Nearer to NAS Jacksonville than to Mayport or Kings Bay.",
                    "url": "https://dreamfindershomes.com/new-homes/fl/green-cove-springs/",
                    "link_label": "Dream Finders at Anabelle Island",
                },
                {
                    "name": "Atlantis Pointe",
                    "builders": "Dream Finders Homes.",
                    "types": "Homes of about 1,433 to 1,588 square feet, 3 bedrooms, 2 full baths and 1 half bath, in Middleburg.",
                    "price": "From $224,990, which is from the $220s.",
                    "hoa": "Not published on the Dream Finders Middleburg page. Confirm dues and any CDD. A low start price with an unnamed association fee is not a low payment.",
                    "amenities": "Not described on that page.",
                    "schools": "Clay County District Schools. Confirm the address.",
                    "bases": "Middleburg, on the Oakleaf / First Coast Expressway side of Clay County. Practical for NAS Jacksonville. A long drive to Mayport and Kings Bay.",
                    "url": "https://dreamfindershomes.com/new-homes/fl/middleburg/",
                    "link_label": "Dream Finders in Middleburg",
                },
                {
                    "name": "Jennings Farm",
                    "builders": "Dream Finders Homes.",
                    "types": "60-foot collection in Middleburg.",
                    "price": "From $399,990, which is from the $390s.",
                    "hoa": "Not published on the builder page we checked.",
                    "amenities": "Not described on that page.",
                    "schools": "Clay County District Schools. Confirm the address.",
                    "bases": "Middleburg. Same NAS Jacksonville side of the county as Atlantis Pointe.",
                    "url": "https://dreamfindershomes.com/new-homes/fl/middleburg/",
                    "link_label": "Dream Finders at Jennings Farm",
                },
            ],
            faqs=[
                {
                    "q": "Where are new homes being built in Clay County?",
                    "a": "In November 2026 we could verify Wilford Oaks in Orange Park, Hyland Trail, Amberly, and Anabelle Island in Green Cove Springs, and Atlantis Pointe and Jennings Farm in Middleburg, on the builders' own pages.",
                },
                {
                    "q": "Is Clay County close to NAS Jacksonville?",
                    "a": "Clay County is on the west bank of the St. Johns River, across from NAS Jacksonville. It is the nearer of the three local bases. Mayport and Kings Bay are long drives from Green Cove Springs and Middleburg. We are not publishing a single minute count for every village.",
                },
                {
                    "q": "What do Clay County new homes cost?",
                    "a": "Dream Finders lists Atlantis Pointe from $224,990 and Amberly's 40-foot homes from $284,990. Hyland Trail's site says from the $300s to the $700s. Pulte at Hyland Trail lists homes from $334,990. Jennings Farm's 60-foot collection starts at $399,990.",
                },
                {
                    "q": "Do these Clay communities have a CDD?",
                    "a": "The builder and developer pages we checked did not publish a CDD or HOA dollar amount for these five communities. Oakleaf's older villages do have CDDs, and the amount depends on which side of the community you are in. Ask for the homesite.",
                },
                {
                    "q": "Can I use a VA loan and still bring my own agent?",
                    "a": "Yes. Register S² Home Partners Real Estate Team on the first visit so the builder does not lock you to the site agent. We will check whether that builder's incentive stacks with VA. Representation is at no cost to you.",
                },
            ],
            sources=[
                {"label": "GreenPointe, Hyland Trail", "url": "https://greenpointellc.com/communities/hyland-trail/"},
                {"label": "Hyland Trail builder lineup", "url": "https://livehylandtrail.com/builders/"},
                {"label": "Pulte Homes at Hyland Trail", "url": "https://www.pulte.com/homes/florida/jacksonville/green-cove-springs/hyland-trail-211110"},
                {"label": "Dream Finders in Green Cove Springs", "url": "https://dreamfindershomes.com/new-homes/fl/green-cove-springs/"},
                {"label": "Dream Finders in Middleburg", "url": "https://dreamfindershomes.com/new-homes/fl/middleburg/"},
            ],
            base_links=[
                {"href": "/bases/nas-jacksonville.html", "label": "NAS Jacksonville guide"},
                {"href": "/bases/ns-mayport.html", "label": "Naval Station Mayport guide"},
                {"href": "/bases/nsb-kings-bay.html", "label": "NSB Kings Bay guide"},
            ],
            related=[
                {"href": "/clay-county.html", "label": "Clay County guide"},
                {"href": "/oakleaf-plantation.html", "label": "Oakleaf Plantation guide"},
                {"href": "/green-cove-springs.html", "label": "Green Cove Springs guide"},
                {"href": "/middleburg.html", "label": "Middleburg guide"},
                {"href": "/new-construction/jacksonville-westside-fl.html", "label": "Westside Jacksonville new construction"},
            ],
        ),
        page_shell(
            slug="jacksonville-northside-fl",
            short="Jacksonville Northside",
            area_label="Jacksonville Northside new construction",
            title="Northside Jacksonville New Construction | New Homes near Mayport",
            description="New construction on Jacksonville's Northside: The Arbors, Hansen Creek, Saddle Oaks, Villages of Westport, and Trout River. Mayport commute context. Checked Nov 2026.",
            h1="New construction on Jacksonville&rsquo;s Northside",
            eyebrow="Northside and the Mayport side of town",
            dek="The Northside communities D.R. Horton and Lennar were pricing in November 2026, and an honest note about the drive to Naval Station Mayport.",
            hero=HERO["north"],
            place_name="Jacksonville Northside, Florida",
            locality="Jacksonville",
            region="FL",
            hub_blurb="The Arbors, Hansen Creek, Trout River, Saddle Oaks, and Villages of Westport.",
            community_intro="These five had a builder page with a start price. They cluster around the airport, River City Marketplace, and the Westport corridor. That is the Northside. It is not the front gate of Mayport.",
            intro=[
                "Searches for new construction near Naval Station Mayport usually land on the Northside. The beach towns next to the base are mostly resale. The production neighborhoods with builder inventory in November 2026 are farther west, in ZIP codes 32218 and 32219.",
                "That geography matters. A house near River City Marketplace can be a reasonable airport drive and still be a cross-town drive to the Mayport basin. We are not printing a minute count for that trip because we did not measure each community on the same morning.",
            ],
            military=[
                "Mayport families who want a brand-new house often end up choosing among three honest options: a resale closer to the base, a new home on this Northside corridor, or a new home on the Southside at eTown or Seven Pines. The base guide for Mayport is the place to start for housing on the installation itself.",
                "Blount Island and Jacksonville International Airport sit on this side of town. NAS Jacksonville is south and west. Kings Bay is north, through Yulee, and these Northside addresses are not the Yulee shortcut.",
            ],
            communities=[
                {
                    "name": "The Arbors",
                    "builders": "D.R. Horton.",
                    "types": "Single-family homes, 3 to 5 bedrooms, one and two stories, from about 1,609 square feet, with 2- and 3-car garages.",
                    "price": "From $314,900, which is from the $310s. The model is at 12475 Russian Olive Road, Jacksonville 32218.",
                    "hoa": "Not published as a dollar amount on the community page. The page does list a clubhouse, so budget for dues and confirm any CDD.",
                    "amenities": "Pool, fitness room, clubhouse, playground, and splash pad.",
                    "schools": "D.R. Horton lists Garden City Elementary, Highlands Middle, and Jean Ribault High. That is the builder&rsquo;s list. Confirm the address with Duval County Public Schools.",
                    "bases": "D.R. Horton describes the community as Jacksonville&rsquo;s Northside, a few miles from River City Marketplace, with Jacksonville International Airport nearby. Mayport is across the Northside from here.",
                    "url": "https://www.drhorton.com/florida/jacksonville-area/jacksonville/the-arbors",
                    "link_label": "D.R. Horton at The Arbors",
                },
                {
                    "name": "Hansen Creek",
                    "builders": "D.R. Horton.",
                    "types": "Three-bedroom villas, 2.5 baths, one-car garage, two stories, about 1,373 to 1,492 square feet.",
                    "price": "From $224,940, which is from the $220s. Sales address 12707 Geronimo Place, Jacksonville 32218.",
                    "hoa": "Not stated on the community page. Villas almost always have an association. Get the dues.",
                    "amenities": "Not listed on the page we checked, beyond the homes themselves.",
                    "schools": "D.R. Horton lists Garden City Elementary, Highlands Middle, and Jean Ribault High. Confirm with Duval County Public Schools.",
                    "bases": "Northside, same 32218 market as The Arbors. Airport and River City Marketplace side of town, not the Mayport basin.",
                    "url": "https://www.drhorton.com/florida/jacksonville-area/jacksonville/hansen-creek",
                    "link_label": "D.R. Horton at Hansen Creek",
                },
                {
                    "name": "Trout River",
                    "builders": "D.R. Horton.",
                    "types": "Two-story villas, 3 bedrooms, 2.5 baths, one-car garage, from about 1,373 square feet.",
                    "price": "From $208,940, which is from the $200s. Sales address 5839 Victoria Creek Lane, Jacksonville 32219.",
                    "hoa": "Not stated on the page. Confirm dues before you compare this start price with a single-family payment.",
                    "amenities": "The builder does not list a community pool on the page. It does point to Riverview Park, nearby, for kayaking and walks on the Trout River, and to I-295 for the airport and downtown.",
                    "schools": "D.R. Horton lists Rutledge H. Pearson Elementary, Jean Ribault Middle, and Jean Ribault High. Confirm with Duval County Public Schools.",
                    "bases": "32219, with the builder&rsquo;s own note that I-295 is the commute road toward downtown and the airport. Mayport is a separate drive east.",
                    "url": "https://www.drhorton.com/florida/jacksonville-area/jacksonville/trout-river",
                    "link_label": "D.R. Horton at Trout River",
                },
                {
                    "name": "Saddle Oaks",
                    "builders": "Lennar.",
                    "types": "Single-family homes in 40-, 50-, and 60-foot collections.",
                    "price": "Lennar&rsquo;s page lists $284,990 to $489,990, and the 40-foot collection from $284,990. That is from the $280s. Welcome home center at 6061 Authentic Court, Jacksonville 32219.",
                    "hoa": "Lennar says the community has no CDD fees. Ask for the HOA dues. &ldquo;No CDD&rdquo; is not the same sentence as &ldquo;no association.&rdquo;",
                    "amenities": "Swimming pool, playground, dog park, and a pond.",
                    "schools": "Lennar&rsquo;s page includes a computer-generated school list and tells buyers it may be wrong. We are not repeating it. Confirm the address with Duval County Public Schools.",
                    "bases": "32219. Lennar describes a drive toward downtown, the airport, and the zoo. It does not publish a Mayport or NAS Jacksonville time.",
                    "url": "https://www.lennar.com/new-homes/florida/jacksonville-st-augustine/jacksonville/saddle-oaks",
                    "link_label": "Lennar at Saddle Oaks",
                },
                {
                    "name": "Villages of Westport",
                    "builders": "Lennar.",
                    "types": "Single-family homes in 40-, 50-, and 60-foot collections. The 40-foot plans on the page start around 1,428 square feet.",
                    "price": "Lennar&rsquo;s heading says from the low $300s. The 40-foot collection is listed from $294,990, which is the high $290s. Lennar places the community in Jacksonville 32219.",
                    "hoa": "Not stated on the page we checked. Confirm HOA and any CDD. We are not calling this a no-CDD community.",
                    "amenities": "Clubhouse, swimming pool, fitness center, pickleball, playground, and two dog parks.",
                    "schools": "Lennar shows a generated school list and says to confirm it. Confirm with Duval County Public Schools. We are not printing the generated names.",
                    "bases": "Northside 32219, near major highways per Lennar. Same caution as the rest of this page: this is not a Mayport-gate address.",
                    "url": "https://www.lennar.com/new-homes/florida/jacksonville-st-augustine/jacksonville/villages-of-westport",
                    "link_label": "Lennar at Villages of Westport",
                },
            ],
            faqs=[
                {
                    "q": "Is there new construction near Naval Station Mayport?",
                    "a": "The beach neighborhoods next to Mayport are mostly resale. The builder communities we could verify on the Northside in November 2026 are farther west, in 32218 and 32219, around River City Marketplace and the Westport corridor.",
                },
                {
                    "q": "What do Northside new homes cost?",
                    "a": "D.R. Horton lists Trout River villas from $208,940 and Hansen Creek villas from $224,940. The Arbors single-family homes start at $314,900. Lennar lists Saddle Oaks from $284,990 and Villages of Westport from the high $290s into the low $300s.",
                },
                {
                    "q": "Which Northside communities have no CDD?",
                    "a": "Lennar says Saddle Oaks has no CDD fees. The other four pages we checked do not make that statement. Ask for the tax bill and the HOA for the lot.",
                },
                {
                    "q": "How do I confirm schools for a Northside new build?",
                    "a": "Use Duval County Public Schools and the address. D.R. Horton publishes a school list on some community pages. Lennar's list is labeled computer-generated. Neither one replaces the district.",
                },
                {
                    "q": "Do I need my own agent at a Northside model?",
                    "a": "Yes, if you want someone whose job is your side of the contract. Register S² Home Partners Real Estate Team on the first visit. It is at no cost to you, and we are not partners with D.R. Horton or Lennar.",
                },
            ],
            sources=[
                {"label": "D.R. Horton, The Arbors", "url": "https://www.drhorton.com/florida/jacksonville-area/jacksonville/the-arbors"},
                {"label": "D.R. Horton, Hansen Creek", "url": "https://www.drhorton.com/florida/jacksonville-area/jacksonville/hansen-creek"},
                {"label": "D.R. Horton, Trout River", "url": "https://www.drhorton.com/florida/jacksonville-area/jacksonville/trout-river"},
                {"label": "Lennar, Saddle Oaks", "url": "https://www.lennar.com/new-homes/florida/jacksonville-st-augustine/jacksonville/saddle-oaks"},
                {"label": "Lennar, Villages of Westport", "url": "https://www.lennar.com/new-homes/florida/jacksonville-st-augustine/jacksonville/villages-of-westport"},
            ],
            base_links=[
                {"href": "/bases/ns-mayport.html", "label": "Naval Station Mayport guide"},
                {"href": "/bases/blount-island.html", "label": "Blount Island guide"},
                {"href": "/bases/nas-jacksonville.html", "label": "NAS Jacksonville guide"},
                {"href": "/bases/uscg-sector-jacksonville.html", "label": "Coast Guard Sector Jacksonville guide"},
            ],
            related=[
                {"href": "/duval-county.html", "label": "Duval County guide"},
                {"href": "/new-construction/jacksonville-beaches-fl.html", "label": "Southside and Beaches new construction"},
                {"href": "/new-construction/yulee-fl.html", "label": "Yulee new construction, if Kings Bay is the gate"},
            ],
        ),
        page_shell(
            slug="jacksonville-beaches-fl",
            short="Southside and the Beaches",
            area_label="Jacksonville Southside and Beaches new construction",
            title="Southside & Beaches New Construction | New Homes near Jacksonville Beach",
            description="New construction on Jacksonville's Southside: eTown and Seven Pines. What is actually for sale near the beaches, with prices checked November 2026.",
            h1="New construction on Jacksonville&rsquo;s Southside and the Beaches",
            eyebrow="Southside, Jacksonville Beach, Atlantic Beach",
            dek="North Beach Townhomes is new construction in Jacksonville Beach. eTown and Seven Pines are the inland Southside master plans.",
            hero=HERO["beaches"],
            place_name="Jacksonville Southside, Florida",
            locality="Jacksonville",
            region="FL",
            hub_blurb="North Beach Townhomes in Jacksonville Beach, plus eTown and Seven Pines.",
            community_intro="Most of Atlantic Beach, Neptune Beach, and Jacksonville Beach is resale. North Beach Townhomes is the builder community we could verify inside Jacksonville Beach. eTown and Seven Pines are the larger Southside master plans inland from the sand.",
            intro=[
                "Buyers who search &ldquo;new homes Jacksonville Beach&rdquo; usually want the ocean and a builder warranty. Those two wishes rarely land on the same street. The pier and the Town Center areas are resale. The new construction we could document is inland: Kettering at eTown, and Seven Pines.",
                "Both are still Duval County, which is the school district and the flood and insurance conversation you want to have with a specific lot, not with a brochure map.",
            ],
            military=[
                "A Tuesday 8 a.m. measurement on September 23, 2026 puts eTown at about 30 minutes to NAS Jacksonville and about 37 minutes to NS Mayport. That is a more balanced pair of drives than Yulee, and it is not a Kings Bay commute.",
                "Seven Pines uses a 32224 address on its own site, which is the Southside toward Hodges and the Intracoastal, inland from the sand. We do not have a same-day drive table for Seven Pines, so we are not inventing one. Mayport is the nearer base for a beaches-minded buyer. NAS Jacksonville is the other direction.",
            ],
            communities=[
                {
                    "name": "North Beach Townhomes",
                    "builders": "Dream Finders Homes. The builder&rsquo;s Jacksonville page calls it a final opportunity.",
                    "types": "Townhomes, about 1,756 to 1,812 square feet, 3 to 4 bedrooms, 2-car garages. The sales office is 1090 2nd Avenue North, Jacksonville Beach 32250.",
                    "price": "From $489,990, which is from the $480s. A listed home on the same page was $573,080. The start price is the heading, not that one homesite.",
                    "hoa": "Not published as a dollar amount. A townhome community with a pool will have dues. Ask for them, and ask whether a CDD is on the tax bill. The page does not say.",
                    "amenities": "Dream Finders lists a community pool with a shaded deck, grills, a location 10 blocks from the beach, and a site adjacent to Gonzales Park. The same page says residents will soon enjoy the pool, so confirm it is open before you count on swimming there.",
                    "schools": "Dream Finders lists nearby schools as San Pablo Elementary, Fletcher Middle, and Fletcher High. Confirm the address with Duval County Public Schools.",
                    "bases": "Dream Finders says the townhomes are near A1A, Beach Boulevard, Atlantic Boulevard, I-295, and J. Turner Butler Boulevard, and about a 30-minute drive to downtown Jacksonville and Jacksonville International Airport. It does not print a Mayport or NAS Jacksonville time. Mayport is the nearer Navy gate for a Jacksonville Beach address.",
                    "extra": "This is one of the communities on our weekly new-construction visit rotation. Register S² Home Partners Real Estate Team before the first tour. The page also points to Seawalk Pavilion for festivals and a weekly farmers market.",
                    "url": "https://dreamfindershomes.com/new-homes/fl/jacksonville-beach/north-beach-townhomes/",
                    "link_label": "Dream Finders at North Beach Townhomes",
                },
                {
                    "name": "eTown, Kettering",
                    "builders": "David Weekley Homes is the builder eTown&rsquo;s Kettering page is sending shoppers to. The community calls the neighborhood a final opportunity.",
                    "types": "Villas and townhomes. eTown describes a gated portion of 286 homesites with a covered cabana and playground. David Weekley lists paired villas around 2,367 square feet.",
                    "price": "eTown says new villas from the high $400s. David Weekley&rsquo;s Florida page lists Kettering paired villas from $494,700. Quick move-in homes on eTown&rsquo;s site in November 2026 were $494,700, $499,900, and $504,900.",
                    "hoa": "eTown&rsquo;s Kettering page does not publish a dues number. Earlier eTown neighborhoods have been discussed alongside the Cypress Bluff CDD in outside guides. We did not reprint a CDD amount because it was not on the Kettering page. Ask for the homesite.",
                    "amenities": "Covered cabana and playground in the gated villa section, per eTown. The wider eTown plan is a master-planned community. Confirm which amenities the Kettering homes actually get.",
                    "schools": "Duval County Public Schools. eTown does not name a campus on the Kettering page. Confirm the address.",
                    "bases": "About 30 minutes to NAS Jacksonville and about 37 minutes to NS Mayport at a Tuesday 8 a.m. departure, measured September 23, 2026, from eTown&rsquo;s center point. Kings Bay is the long drive.",
                    "url": "https://www.etownjax.com/neighborhoods/kettering",
                    "link_label": "eTown on Kettering",
                },
                {
                    "name": "Seven Pines",
                    "builders": "Seven Pines names David Weekley Homes and ICI Homes as its builders. David Weekley is the one with published collection prices on its own site.",
                    "types": "Single-family homes. David Weekley lists 40-foot front-entry plans of about 1,986 to 2,388 square feet, plus 50-foot front-entry and rear-entry collections.",
                    "price": "David Weekley lists Seven Pines 40-foot homes from $544,900, 50-foot front-entry from $639,800, and 50-foot rear-entry from $661,300. That starts in the $540s. ICI is a named builder on sevenpines.com. We are not printing an ICI start price because we did not take one from ICI&rsquo;s own site.",
                    "hoa": "Not published as a number on the Seven Pines or David Weekley pages we checked. Confirm HOA and any CDD for the lot.",
                    "amenities": "Seven Pines describes walkable neighborhoods, green space, water, and tree-lined streets, and a future village center. Confirm what is open versus planned.",
                    "schools": "Duval County Public Schools. The community page does not name a zoned school. Confirm the address. The sales information on the community site uses 12082 Reunion Circle, Jacksonville 32224.",
                    "bases": "32224 is Southside Jacksonville, inland from the beaches. Mayport is the nearer Navy base for most buyers comparing this with the sand. We do not have a measured drive time to print.",
                    "url": "https://sevenpines.com/new-homes",
                    "link_label": "Seven Pines new homes",
                },
            ],
            faqs=[
                {
                    "q": "Is there new construction in Jacksonville Beach or Atlantic Beach?",
                    "a": "Not as a builder community we could verify in November 2026. Atlantic Beach, Neptune Beach, and Jacksonville Beach are resale markets. eTown and Seven Pines are the Southside master plans that were still selling.",
                },
                {
                    "q": "How much are new homes at eTown and Seven Pines?",
                    "a": "eTown says Kettering villas from the high $400s, and David Weekley lists paired villas from $494,700. David Weekley lists Seven Pines from $544,900. ICI Homes is also building at Seven Pines. We did not publish an ICI price.",
                },
                {
                    "q": "How far is eTown from NAS Jacksonville and Mayport?",
                    "a": "A Tuesday 8 a.m. measurement on September 23, 2026 puts eTown about 30 minutes from NAS Jacksonville and about 37 minutes from NS Mayport. Seven Pines is also on the Southside. We do not have a separate measured time for it.",
                },
                {
                    "q": "What school district covers Southside new construction?",
                    "a": "Duval County Public Schools. Neither community page we used names the zoned campus. Look up the address.",
                },
                {
                    "q": "Should I register my agent before I visit eTown or Seven Pines?",
                    "a": "Yes. Register S² Home Partners Real Estate Team on the first visit, at no cost to you. The model-home agent represents the builder. We are not partners with eTown, Seven Pines, David Weekley, or ICI.",
                },
            ],
            sources=[
                {"label": "eTown, Kettering", "url": "https://www.etownjax.com/neighborhoods/kettering"},
                {"label": "eTown quick move-in homes", "url": "https://www.etownjax.com/quick-move-in-homes"},
                {"label": "David Weekley Homes in Florida, Kettering and Seven Pines prices", "url": "https://www.davidweekleyhomes.com/new-homes/fl"},
                {"label": "Seven Pines", "url": "https://sevenpines.com/new-homes"},
                {"label": "Tuesday 8 a.m. drive-time table, measured September 23, 2026", "url": "https://www.kristafracke.com/commute-map"},
            ],
            base_links=[
                {"href": "/bases/ns-mayport.html", "label": "Naval Station Mayport guide"},
                {"href": "/bases/nas-jacksonville.html", "label": "NAS Jacksonville guide"},
                {"href": "/bases/uscg-sector-jacksonville.html", "label": "Coast Guard Sector Jacksonville guide"},
            ],
            related=[
                {"href": "/atlantic-neptune-beach.html", "label": "Atlantic Beach and Neptune Beach guide"},
                {"href": "/jacksonville-beach.html", "label": "Jacksonville Beach guide"},
                {"href": "/east-arlington.html", "label": "East Arlington guide"},
                {"href": "/southside-deerwood.html", "label": "Southside and Deerwood guide"},
                {"href": "/duval-county.html", "label": "Duval County guide"},
            ],
        ),
        page_shell(
            slug="jacksonville-westside-fl",
            short="Jacksonville Westside",
            area_label="Jacksonville Westside new construction near NAS Jacksonville",
            title="New Construction near NAS Jacksonville | Westside New Homes",
            description="New construction near NAS Jacksonville on the Westside: Diamond Springs, Weston Woods, and Eagles Glen. Builders and prices checked November 2026.",
            h1="New construction near NAS Jacksonville",
            eyebrow="Jacksonville Westside",
            dek="Westside communities that were actually on a builder site in November 2026, for buyers whose gate is Naval Air Station Jacksonville.",
            hero=HERO["west"],
            place_name="Jacksonville Westside, Florida",
            locality="Jacksonville",
            region="FL",
            hub_blurb="Diamond Springs, Weston Woods, and Eagles Glen, on the NAS Jacksonville side of town.",
            community_intro="Clay County, across the county line, has more builder inventory. This page is the Duval County Westside. Three communities had a page we could cite.",
            intro=[
                "&ldquo;New construction near NAS Jacksonville&rdquo; is a Westside and Clay County search. On the Duval side, Diamond Springs is the large master plan, Weston Woods is a 39-home SEDA community, and Eagles Glen is a Dream Finders community the builder still calls coming soon.",
                "Oakleaf and the Middleburg communities are often the better inventory if you can live in Clay County. They are linked below. They are not the same school district.",
            ],
            military=[
                "NAS Jacksonville sits on the west side of the city, which is why these addresses come up in a PCS search. SEDA says Weston Woods is 12 miles from NAS Jacksonville. That is a distance, not a drive time.",
                "Mayport is a cross-town drive from the Westside. Kings Bay is farther. If the orders are to Mayport, read the Northside and Southside pages before you fall in love with a Westside floor plan.",
            ],
            communities=[
                {
                    "name": "Diamond Springs",
                    "builders": "The Jacksonville Daily Record, on October 27, 2026, reported that Metro Development Group&rsquo;s builders at Diamond Springs will be DRB Homes, Dream Finders Homes, D.R. Horton, and Lennar. Dream Finders is the builder whose start prices we are printing.",
                    "types": "Dream Finders lists 40-foot homes of about 1,622 to 2,500 square feet and 50-foot homes of about 1,655 to 3,498 square feet. The Daily Record describes a plan for about 2,700 single-family homes and townhomes on about 1,300 acres.",
                    "price": "Dream Finders lists the 40-foot collection from $270,990 and the 50-foot collection from $289,990. That is from the $270s. The Daily Record said the developer&rsquo;s site showed townhomes from $199,000 and single-family homes from about $236,000. Those lower figures were the paper&rsquo;s reading of the developer site, not a Dream Finders price, so shop the builder you are actually sitting with.",
                    "hoa": "Not published on the Dream Finders page or in the Daily Record story we used. Confirm HOA and any CDD before you compare Diamond Springs with a no-CDD community.",
                    "amenities": "A roughly 4-acre lagoon is the plan. The Daily Record reported a groundbreaking for that lagoon on October 28, 2026, with kayaking, a swim-up bar, sand shores, a splash pad, and related features described by the developer. Dream Finders lists an amenity center, dog park, lagoon, playground, splash pad, and trails as planned amenities. Do not tour expecting all of that to be open.",
                    "schools": "Duval County Public Schools. Dream Finders mentions schools nearby and does not name a zoned campus. Confirm the address. A homesite on the builder page, 5704 Lagoon Cruise Way, is in Jacksonville 32234.",
                    "bases": "The Daily Record places Diamond Springs at Normandy Boulevard and Bright Lagoon Boulevard, about 4.5 miles west of Cecil Airport. Dream Finders says I-10 and I-295 are the roads toward downtown, the airport, and NAS Jacksonville. Neither source prints a minute count to the NAS Jacksonville gate.",
                    "url": "https://dreamfindershomes.com/new-homes/fl/jacksonville/diamond-springs/",
                    "link_label": "Dream Finders at Diamond Springs",
                },
                {
                    "name": "Weston Woods",
                    "builders": "SEDA Construction.",
                    "types": "One- and two-story single-family homes on 39 homesites, 60-foot fronts, on Sandler Road in Duval County. SEDA describes plans of about 1,361 to 2,806 square feet.",
                    "price": "From the $300s, which is SEDA&rsquo;s heading. Homes listed on the community page in November 2026 included prices of $339,900 and $342,900.",
                    "hoa": "SEDA says there are no CDD fees. Ask what, if anything, is charged for the private entrance and common area. No CDD is not automatically no dues.",
                    "amenities": "SEDA describes a private single-entrance neighborhood rather than a resort amenity list. The location notes mention Oakleaf Town Center for shopping.",
                    "schools": "Duval County Public Schools. SEDA does not name a campus on the page we checked. Confirm the address.",
                    "bases": "SEDA says the community is 12 miles from NAS Jacksonville, near Cecil Commerce Center, I-10, and I-295. Mayport and Kings Bay are the long commutes.",
                    "url": "https://sedaconstruction.com/community/weston-woods/",
                    "link_label": "SEDA at Weston Woods",
                },
                {
                    "name": "Eagles Glen",
                    "builders": "Dream Finders Homes. The builder&rsquo;s page says coming soon.",
                    "types": "Single-family homes of about 1,500 to 3,500 square feet. A community pool is described as a future amenity, not an open one.",
                    "price": "From the upper $200s, which is the only price Dream Finders publishes on that coming-soon page.",
                    "hoa": "Not stated. There is not a lot sheet to read yet. Ask when sales open.",
                    "amenities": "A future pool, plus highway access. Dream Finders also points to nearby dining and shopping rather than a finished clubhouse.",
                    "schools": "Dream Finders says the area is part of Duval County Public Schools and does not name a school. Confirm when a homesite exists.",
                    "bases": "Dream Finders places Eagles Glen on the Westside near Cecil Field and NAS Jacksonville. No mileage or minutes are printed.",
                    "extra": "This card is here because the builder has announced the community, not because you can walk a finished model today. Ask us to check whether sales have opened.",
                    "url": "https://dreamfindershomes.com/new-homes/fl/jacksonville/eagles-glen/",
                    "link_label": "Dream Finders at Eagles Glen",
                },
            ],
            faqs=[
                {
                    "q": "Where is new construction near NAS Jacksonville?",
                    "a": "On the Duval Westside, Diamond Springs, Weston Woods, and the coming-soon Eagles Glen community were the pages we could verify in November 2026. Clay County, including Middleburg and Green Cove Springs, has more builder inventory and is linked from this page.",
                },
                {
                    "q": "How far is Weston Woods from NAS Jacksonville?",
                    "a": "SEDA says 12 miles. That is the builder's distance, not a drive time at morning rush. Diamond Springs is near Normandy Boulevard, about 4.5 miles west of Cecil Airport, according to the Jacksonville Daily Record.",
                },
                {
                    "q": "What do Westside new homes cost?",
                    "a": "Dream Finders lists Diamond Springs from $270,990. SEDA lists Weston Woods from the $300s. Dream Finders lists Eagles Glen, which is not open yet, from the upper $200s.",
                },
                {
                    "q": "Is the Diamond Springs lagoon open?",
                    "a": "The Jacksonville Daily Record reported a groundbreaking for the lagoon on October 28, 2026. Dream Finders lists the lagoon and several amenities as planned. Do not assume they are finished.",
                },
                {
                    "q": "Can S² Home Partners Real Estate Team represent me with these builders?",
                    "a": "Yes, at no cost to you, if you register us on the first visit. We are not partners with Dream Finders, SEDA, D.R. Horton, Lennar, DRB, or Metro Development Group.",
                },
            ],
            sources=[
                {"label": "Dream Finders, Diamond Springs", "url": "https://dreamfindershomes.com/new-homes/fl/jacksonville/diamond-springs/"},
                {"label": "Jacksonville Daily Record, Diamond Springs lagoon groundbreaking, October 27, 2026", "url": "https://www.jaxdailyrecord.com/news/2026/oct/27/lagoon-community-in-west-jacksonville-sets-groundbreaking-for-signature-feature/"},
                {"label": "SEDA, Weston Woods", "url": "https://sedaconstruction.com/community/weston-woods/"},
                {"label": "Dream Finders, Eagles Glen", "url": "https://dreamfindershomes.com/new-homes/fl/jacksonville/eagles-glen/"},
            ],
            base_links=[
                {"href": "/bases/nas-jacksonville.html", "label": "NAS Jacksonville guide"},
                {"href": "/bases/ns-mayport.html", "label": "Naval Station Mayport guide"},
                {"href": "/bases/nsb-kings-bay.html", "label": "NSB Kings Bay guide"},
            ],
            related=[
                {"href": "/new-construction/clay-county-fl.html", "label": "Clay County new construction"},
                {"href": "/oakleaf-plantation.html", "label": "Oakleaf Plantation guide"},
                {"href": "/duval-county.html", "label": "Duval County guide"},
            ],
        ),
        page_shell(
            slug="kingsland-st-marys-ga",
            short="Kingsland and St. Marys",
            area_label="Kingsland and St. Marys new construction",
            title="Kingsland & St. Marys GA New Homes | New Construction near Kings Bay",
            description="New construction near Kings Bay in Kingsland and St. Marys, Georgia: Brookshire Green, Fiddler's Cove, Northshore, and Winding River. Checked Nov 2026.",
            h1="New homes in Kingsland and St. Marys, GA",
            eyebrow="Camden County &middot; near NSB Kings Bay",
            dek="Georgia-side new construction for a Kings Bay PCS, with the Florida option in Yulee linked beside it.",
            hero=HERO["camden"],
            place_name="Kingsland, Georgia",
            locality="Kingsland",
            region="GA",
            hub_blurb="Brookshire Green, Fiddler's Cove, Northshore, and Winding River, near NSB Kings Bay.",
            community_intro="Four communities had a builder page with a start price. Osprey Cove and other older Kingsland names are not listed because we could not confirm they were still selling.",
            intro=[
                "Naval Submarine Base Kings Bay is in Camden County, Georgia. St. Marys is the nearest town. Kingsland is the other town families compare, with more of the new-home inventory. A Florida address in Yulee is a different state, a different school district, and a different set of taxes and insurance.",
                "Camden County School District serves Kingsland and St. Marys. The builders below name the district more often than they name a school. Look up the address before you treat a model home as zoned.",
            ],
            military=[
                "This is the Georgia answer to a Kings Bay tour. Maronda says Brookshire Green is 12 minutes from the base. That is the builder&rsquo;s figure. Pulte describes Fiddler&rsquo;s Cove as having convenient access to Kings Bay and does not print a minute count. Century puts Northshore about 10 minutes from downtown Kingsland, about 40 minutes from Jacksonville International Airport, and about 45 minutes from downtown Jacksonville.",
                "Yulee is the Florida comparison. Some buyers prefer Nassau County schools and will drive past the state line. Read that page before you decide the state. BAH is the same duty station either way. The house payment is not.",
            ],
            communities=[
                {
                    "name": "Brookshire Green",
                    "builders": "Maronda Homes, inside Laurel Island Plantation in Kingsland.",
                    "types": "Single-family homes on two cul-de-sac streets. Maronda describes plans up to about 2,471 square feet, with 3-car garage options, and says 10 opportunities were left when the page was written.",
                    "price": "From the $259s, which is Maronda&rsquo;s heading.",
                    "hoa": "Maronda says Laurel Island has low HOA fees. It does not publish the dollar amount or say there is no CDD. Ask for the Laurel Island dues that come with a Brookshire Green lot.",
                    "amenities": "Maronda says residents use Laurel Island Links, a community pool, tennis courts, and a playground. Homesites are described with golf-course and preserve views.",
                    "schools": "The page ties the location to Kings Bay and to Camden County generally. It does not name an elementary school. Confirm with Camden County Schools.",
                    "bases": "Maronda says 12 minutes from Naval Submarine Base Kings Bay, 4 minutes from I-95, and 35 to 45 minutes from downtown Jacksonville. Those are the builder&rsquo;s figures.",
                    "url": "https://www.marondahomes.com/ga/kingsland/brookshire-green-31548.html",
                    "link_label": "Maronda at Brookshire Green",
                },
                {
                    "name": "Fiddler's Cove",
                    "builders": "Pulte Homes, inside Laurel Island Plantation.",
                    "types": "Single-family homes on 60-foot and 80-foot homesites, about 2,016 to 3,842 square feet. Pulte describes six open-concept floor plans and a gated community.",
                    "price": "From $389,990, which is from the $380s.",
                    "hoa": "Pulte says no CDD, low HOA fees, and lawn care included. The page does not print the HOA dollar amount. &ldquo;Low&rdquo; is the builder&rsquo;s adjective. Get the number.",
                    "amenities": "Davis Love III golf course, fitness center, resort-style pool, tennis, and a playground, per Pulte. Marsh-front lots are part of the offering.",
                    "schools": "Pulte says the community is in the Camden County School District. It does not name the zoned school. Confirm the address.",
                    "bases": "Pulte says convenient access to Kings Bay and less than 30 minutes from Jacksonville International Airport, plus a short trip to the St. Marys historic district. It does not publish a Kings Bay minute count.",
                    "extra": "Fiddler&rsquo;s Cove is on our weekly new-construction visit rotation, paired with Winding River in St. Marys.",
                    "url": "https://www.pulte.com/homes/georgia/greater-jacksonville/kingsland/fiddlers-cove-211616",
                    "link_label": "Pulte at Fiddler's Cove",
                },
                {
                    "name": "Northshore",
                    "builders": "Century Communities.",
                    "types": "One- and two-story single-family homes on estate-sized homesites in a gated riverfront community on the St. Marys River. Century lists plans from the Champlain II at about 1,786 square feet up to larger plans around 2,800 square feet.",
                    "price": "Quick move-in homes from $328,990, which is from the $320s. Named plans on the page start at $339,990 for the Champlain II.",
                    "hoa": "Not stated on the page we checked. A gated riverfront community with a boat ramp will have some owner cost. Ask for it.",
                    "amenities": "Century lists a community riverfront building, a private boat ramp, a fishing pier, a floating dock, sports courts, and a playground.",
                    "schools": "Not named on the page. Kingsland addresses are in Camden County Schools. Confirm the lot.",
                    "bases": "Century says about 10 minutes from downtown Kingsland, about 40 minutes from Jacksonville International Airport, and about 45 minutes from downtown Jacksonville, near I-95 and State Route 40. It does not print a Kings Bay drive time. Kingsland is the town beside the base.",
                    "url": "https://www.centurycommunities.com/find-your-new-home/georgia/kingsland-metro/kingsland/northshore/",
                    "link_label": "Century Communities at Northshore",
                },
                {
                    "name": "Winding River",
                    "builders": "Landmark 24 Homes.",
                    "types": "Marsh-front single-family homes in St. Marys, about 2,214 to 3,368 square feet, 3 to 5 bedrooms. Landmark says the community is now selling.",
                    "price": "From $461,400, which is from the $460s.",
                    "hoa": "Not published on the community page we checked. Confirm dues and any district fee.",
                    "amenities": "Landmark describes marsh-front homes and included finishes such as a covered porch, granite counters, and stainless appliances. It does not list a pool or clubhouse on the page we used. Do not borrow another community&rsquo;s amenity list.",
                    "schools": "St. Marys is in the Camden County School District. The builder page does not name a school. Confirm the address.",
                    "bases": "St. Marys is the town next to Kings Bay. Landmark describes the community as about a half hour north of Jacksonville and does not print a base drive time.",
                    "extra": "Winding River is on our weekly new-construction visit rotation, paired with Fiddler&rsquo;s Cove.",
                    "url": "https://www.landmark24.com/communities/brunswick-and-st-marys/st-marys/winding-river",
                    "link_label": "Landmark 24 at Winding River",
                },
            ],
            faqs=[
                {
                    "q": "Where can I buy new construction near Kings Bay?",
                    "a": "On the Georgia side, Maronda, Pulte, Century Communities, and Landmark 24 were selling in Kingsland or St. Marys in November 2026. On the Florida side, Yulee is the comparison, with a different school district.",
                },
                {
                    "q": "How far is Kingsland new construction from the base?",
                    "a": "Maronda says Brookshire Green is 12 minutes from NSB Kings Bay. Pulte says Fiddler's Cove has convenient access and does not print minutes. Century says Northshore is about 10 minutes from downtown Kingsland. Confirm the route to your gate.",
                },
                {
                    "q": "Do Kingsland new homes have a CDD?",
                    "a": "Pulte says Fiddler's Cove has no CDD and a low HOA, with lawn care included. The other three builder pages we checked do not make a no-CDD statement. Get the dues in writing.",
                },
                {
                    "q": "What schools serve Kingsland and St. Marys?",
                    "a": "Camden County School District. The builder pages name the district more often than a specific school. Yulee, across the state line, is Nassau County, Florida. Confirm the address before you enroll anyone.",
                },
                {
                    "q": "Can a Florida agent write a Georgia new-construction contract?",
                    "a": "Ask us before you register at the model. S² Home Partners Real Estate Team is brokered by Momentum Realty in Florida. If a Kings Bay purchase needs a Georgia license on the contract, we will tell you that up front and set it up properly. Either way, do not register with the builder alone on the first visit.",
                },
            ],
            sources=[
                {"label": "Maronda Homes, Brookshire Green", "url": "https://www.marondahomes.com/ga/kingsland/brookshire-green-31548.html"},
                {"label": "Pulte Homes, Fiddler's Cove", "url": "https://www.pulte.com/homes/georgia/greater-jacksonville/kingsland/fiddlers-cove-211616"},
                {"label": "Century Communities, Northshore", "url": "https://www.centurycommunities.com/find-your-new-home/georgia/kingsland-metro/kingsland/northshore/"},
                {"label": "Landmark 24, Winding River", "url": "https://www.landmark24.com/communities/brunswick-and-st-marys/st-marys/winding-river"},
            ],
            base_links=[
                {"href": "/bases/nsb-kings-bay.html", "label": "NSB Kings Bay guide"},
                {"href": "/bases/nas-jacksonville.html", "label": "NAS Jacksonville guide"},
                {"href": "/bases/ns-mayport.html", "label": "Naval Station Mayport guide"},
            ],
            related=[
                {"href": "/new-construction/yulee-fl.html", "label": "Yulee new construction, on the Florida side"},
                {"href": "/nassau-county.html", "label": "Nassau County guide"},
            ],
        ),
    ]


def main():
    pages = PAGES + more_pages()
    out_dir = ROOT / "new-construction"
    out_dir.mkdir(exist_ok=True)
    keep = set()
    for page in pages:
        path = out_dir / f"{page['slug']}.html"
        path.write_text(render_page(page), encoding="utf-8")
        keep.add(path.name)
    for stale in out_dir.glob("*.html"):
        if stale.name not in keep:
            stale.unlink()
    (ROOT / "new-construction.html").write_text(render_hub(pages), encoding="utf-8")
    update_sitemap(pages)
    update_redirects(pages)
    patched = patch_nav_and_footer()
    patch_buy_and_home()
    print(f"Wrote the hub and {len(pages)} area pages. Updated nav or footer in {patched} existing files.")


if __name__ == "__main__":
    main()

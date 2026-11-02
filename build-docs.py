#!/usr/bin/env python3
"""Builds the iteration-D versions of support.html, privacy.html and terms.html in this folder.

Each page is one self-contained file, like index.html: the styles and the script (doc.js, hand-written, kept beside
this file) are written into the page, so uploading the .html alone is enough.

The words come unchanged from the live pages in website/ (the source of truth for every fact). The nav, the mobile
menu, the footer and the shared CSS are copied out of index.html in this folder, so after changing either, run this
again:

    python3 build-docs.py
"""
import html
import pathlib
import re

HERE = pathlib.Path(__file__).resolve().parent
LIVE = HERE.parent.parent  # website/
INDEX = (HERE / "index.html").read_text(encoding="utf-8")

PAGES = {
    "support": {"kicker": "Help", "right": "Replies usually within two days"},
    "privacy": {"kicker": "Legal", "right": "No analytics • No ads • No tracking"},
    "terms": {"kicker": "Legal", "right": "A personal study aid for the IB Diploma"},
}
# shorter names for the lockup readout, where a heading is long
SHORT = {"Quick Add and finding friends from contacts": "Quick Add and contacts", "Signing in with Apple or Google": "Apple and Google sign-in"}
SPRITE_IDS = {"i-apple", "i-ne", "i-dn", "i-star", "i-coin", "i-check"}


def cut(s, start, end):
    i = s.index(start)
    j = s.index(end, i)
    return s[i:j]


def one(pattern, s):
    m = re.findall(pattern, s, flags=re.S)
    if len(m) != 1:
        raise SystemExit("expected one match for %r, found %d" % (pattern[:60], len(m)))
    return m[0]


# ---------- shared CSS, cut from index.html ----------
css = one(r"<style>\n(.*?)</style>", INDEX)
parts = [
    cut(css, ":root{", "/* ---------- nav: islands that merge into one bar ---------- */"),
    cut(css, "/* ---------- nav: islands that merge into one bar ---------- */", "/* ---------- hero ---------- */"),
    one(r"\n(@keyframes float[^\n]*)\n", css) + "\n",
    cut(css, "/* page-wide ink trail */", "/* ---------- subjects ---------- */"),
    "/* ---------- footer ---------- */\n" + cut(css, ".site-foot{", "/* ---------- reveals ---------- */"),
    css[css.index("/* ---------- reveals ---------- */"):],
]
DOC_CSS = r"""
/* ---------- doc pages ---------- */
.doc-head{max-width:var(--max);margin:0 auto;padding:calc(118px + 3vw) var(--pad) clamp(30px,4vw,52px)}
.doc-head h1{margin-top:clamp(22px,3vw,40px);font-size:clamp(54px,9.4vw,148px)}
.doc-head .updated{margin-top:20px;font:500 12px/1.4 var(--mono);letter-spacing:.08em;text-transform:uppercase;color:var(--mute)}
.doc-head .lead{margin-top:22px;max-width:34em;font:500 clamp(18px,1.6vw,22px)/1.45 var(--body);letter-spacing:-.015em;color:var(--ink-2)}
.doc-head .lead a{color:var(--blue);text-underline-offset:3px}
.doc-grid{max-width:var(--max);margin:0 auto;padding:0 var(--pad) clamp(90px,10vw,150px);display:grid;grid-template-columns:230px minmax(0,720px);gap:clamp(32px,6vw,100px)}
.toc{position:sticky;top:112px;align-self:start;max-height:calc(100vh - 140px);overflow:auto;scrollbar-width:none}
.toc::-webkit-scrollbar{display:none}
.toc-h{font:500 11.5px/1.3 var(--mono);letter-spacing:.09em;text-transform:uppercase;color:var(--mute);margin-bottom:14px}
.toc ol{margin:0;padding:0;list-style:none;border-left:1px solid var(--line)}
.toc a{display:flex;gap:10px;margin-left:-1px;padding:6px 0 6px 14px;border-left:2px solid transparent;font-size:13.5px;line-height:1.35;color:var(--mute);text-decoration:none;transition:color .25s,border-color .35s}
.toc a .n{flex:none;font:500 11px/1.65 var(--mono);opacity:.75}
.toc a.on{color:var(--ink);border-left-color:var(--blue)}
@media (hover:hover){.toc a:hover{color:var(--ink)}}
.doc{font-size:16.5px;line-height:1.75;color:var(--ink-2)}
.doc h2{display:flex;align-items:baseline;gap:14px;margin:58px 0 14px;scroll-margin-top:110px;font:600 clamp(22px,2vw,28px)/1.2 var(--body);letter-spacing:-.025em;color:var(--ink)}
.doc h2:first-child{margin-top:0}
.doc h2 .n{flex:none;font:500 12px/1 var(--mono);letter-spacing:.06em;color:var(--blue);transform:translateY(-.2em)}
.doc p{margin:0 0 14px}
.doc ul{margin:0 0 18px;padding:0;list-style:none}
.doc li{position:relative;margin:7px 0;padding-left:24px}
.doc li::before{content:"";position:absolute;left:2px;top:.8em;width:11px;height:2px;border-radius:2px;background:var(--blue)}
.doc a{color:var(--blue);text-underline-offset:3px}
.doc details{border-bottom:1px solid var(--line)}
.doc h2+details{border-top:1px solid var(--line)}
.doc summary{list-style:none;cursor:pointer;display:flex;justify-content:space-between;align-items:center;gap:20px;padding:20px 0;font:500 clamp(18px,1.6vw,21px)/1.35 var(--body);letter-spacing:-.015em;color:var(--ink);transition:color .25s}
.doc summary::-webkit-details-marker{display:none}
@media (hover:hover){.doc summary:hover{color:var(--blue)}}
.doc summary i{position:relative;flex:none;width:36px;height:36px;border-radius:11px;background:#ECEBE6;transition:transform .5s var(--ease),background-color .3s}
.doc summary i::before,.doc summary i::after{content:"";position:absolute;left:50%;top:50%;width:13px;height:2px;margin:-1px 0 0 -6.5px;border-radius:2px;background:var(--ink)}
.doc summary i::after{transform:rotate(90deg)}
.doc details[open]:not(.closing) summary i{transform:rotate(45deg);background:var(--gold)}
.doc .a{padding:0 56px 0 0}
.doc .a p{margin:0;padding-bottom:20px}
.doc .aw{display:inline-block}
@media (max-width:959px){.doc-grid{grid-template-columns:minmax(0,1fr)}.toc{display:none}}
@media (max-width:599px){.doc .a{padding-right:0}.doc h2{margin-top:46px}}
@media print{.nav,.sheet,.ink,.toc,.giant-clip,.skip{display:none!important}.doc-head{padding-top:0}.doc-grid{display:block}html.js .rise .wi,html.js .fade{transform:none!important;opacity:1!important}}
"""
STYLE = "".join(parts) + DOC_CSS
SCRIPT = (HERE / "doc.js").read_text(encoding="utf-8")
assert "</script" not in SCRIPT.lower() and "</style" not in STYLE.lower()

# ---------- shared markup, cut from index.html ----------
sprite = one(r'(<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">.*?</svg>)\n\n<header', INDEX)
keep = [m.group(0) for m in re.finditer(r"<symbol id=\"([^\"]+)\".*?</symbol>", sprite, flags=re.S) if m.group(1) in SPRITE_IDS]
keep += re.findall(r'<filter id="grain".*?</filter>', sprite, flags=re.S)
sprite = '<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">\n  <defs>\n    ' + "\n    ".join(keep) + "\n  </defs>\n</svg>"
nav = one(r'(<header class="nav" id="nav">.*?</header>)', INDEX)
sheet = one(r'(<div class="sheet" id="sheet" hidden>.*?</div>)\n<svg class="ink"', INDEX)
foot = one(r'(<footer class="site-foot" id="footer-nav">.*?</footer>)', INDEX)


def homeward(s):
    """Same-page links on the homepage point back at it from a doc page."""
    s = s.replace('href="#top"', 'href="index.html"')
    return re.sub(r'href="#(?!footer-nav|main)([a-z-]+)"', r'href="index.html#\1"', s)


def slug(t):
    return re.sub(r"[^a-z0-9]+", "-", html.unescape(t).lower()).strip("-")


for name, meta in PAGES.items():
    live = (LIVE / (name + ".html")).read_text(encoding="utf-8")
    title = one(r"<title>(.*?)</title>", live)
    desc = one(r'<meta name="description" content="([^"]*)">', live)
    main = one(r'<main class="doc">(.*?)</main>', live)
    h1 = one(r"<h1>(.*?)</h1>", main)
    updated = one(r'<p class="updated">(.*?)</p>', main)
    body = main.replace("<h1>%s</h1>" % h1, "", 1).replace('<p class="updated">%s</p>' % updated, "", 1).strip()
    # numbered, linkable headings and the "On this page" list
    toc = []

    def number(m):
        text = m.group(1)
        n = "%02d" % (len(toc) + 1)
        sid = slug(text)
        short = SHORT.get(html.unescape(text))
        extra = ' data-short="%s"' % html.escape(short) if short else ""
        if re.match(r"\d+\.\s", text):  # the terms number their own headings ("1. What the app is")
            toc.append('<li><a href="#%s">%s</a></li>' % (sid, text))
            return '<h2 id="%s"%s>%s</h2>' % (sid, extra, text)
        toc.append('<li><a href="#%s"><span class="n">%s</span>%s</a></li>' % (sid, n, text))
        return '<h2 id="%s"%s><span class="n" aria-hidden="true">%s</span>%s</h2>' % (sid, extra, n, text)

    body = re.sub(r"<h2>(.*?)</h2>", number, body)
    # answers that open with their height and rise in, like the homepage FAQ
    body = re.sub(r"<details><summary>(.*?)</summary>(.*?)</details>", r'<details><summary>\1<i aria-hidden="true"></i></summary><div class="a">\2</div></details>', body, flags=re.S)
    if name == "support":
        intro = '<p class="lead fade">%s</p>' % updated
    else:
        intro = '<p class="updated fade">%s</p>' % updated

    page_nav = homeward(nav)
    page_sheet = homeward(sheet)
    if name == "support":
        page_nav = page_nav.replace('<a class="l-arrow" href="support.html">', '<a class="l-arrow" href="support.html" aria-current="page">', 1)
        page_sheet = page_sheet.replace('<a href="support.html" style="--i:4">', '<a class="on" href="support.html" style="--i:4" aria-current="page">', 1)
    page_foot = homeward(foot)

    out = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<!-- Generated by build-docs.py from website/{name}.html (the words) and index.html (nav, footer, styles). -->
<title>{title}</title>
<meta name="description" content="{desc}">
<meta name="theme-color" content="#F6F5F1">
<meta name="color-scheme" content="light">
<meta name="format-detection" content="telephone=no">
<link rel="canonical" href="https://syllabo.org/{name}.html">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Syllabo">
<meta property="og:url" content="https://syllabo.org/{name}.html">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:image" content="https://syllabo.org/assets/og.png">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="../assets/favicon.ico" sizes="48x48">
<link rel="icon" type="image/png" sizes="32x32" href="../assets/favicon-32.png">
<link rel="icon" type="image/png" sizes="192x192" href="../assets/favicon-192.png">
<link rel="apple-touch-icon" href="../assets/apple-touch-icon.png">
<link rel="preload" href="../assets/fonts/archivo-wdth-wght-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="../assets/fonts/poppins-400-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="../assets/fonts/fonts.css">
<script>document.documentElement.classList.add('js')</script>
<style>
{style}</style>
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
{sprite}

{nav}
{sheet}
<svg class="ink" aria-hidden="true" focusable="false"></svg>

<main id="main">
  <header class="doc-head" id="top">
    <div class="sec-label"><p><i></i>{kicker}</p><p>{right}</p></div>
    <h1 class="disp rise">{h1}</h1>
    {intro}
  </header>
  <div class="doc-grid">
    <nav class="toc" aria-label="On this page"><p class="toc-h">On this page</p><ol>{toc}</ol></nav>
    <article class="doc">
{body}
    </article>
  </div>
</main>

{foot}

<script>
{script}</script>
</body>
</html>
""".format(style=STYLE, script=SCRIPT, name=name, title=title, desc=desc, sprite=sprite, nav=page_nav, sheet=page_sheet, kicker=meta["kicker"], right=meta["right"], h1=h1, intro=intro, toc="".join(toc), body=body, foot=page_foot)
    (HERE / (name + ".html")).write_text(out, encoding="utf-8")
    print("wrote", name + ".html", "-", len(toc), "sections")

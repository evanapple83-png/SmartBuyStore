#!/usr/bin/env python3
"""Build phase documentation PDFs in EvanExpert house style.

Usage:
    python3 build-docs.py              # build all FASE-*.md files
    python3 build-docs.py FASE-1.md    # build a specific file
"""
import os, sys, subprocess, re, html, datetime, glob
import markdown

HERE = os.path.dirname(os.path.abspath(__file__))
CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

TODAY = datetime.date.today()
MONTHS_NL = ['januari','februari','maart','april','mei','juni',
             'juli','augustus','september','oktober','november','december']
TODAY_NL = f'{TODAY.day} {MONTHS_NL[TODAY.month-1]} {TODAY.year}'

CSS = """
@page {
  size: A4;
  margin: 22mm 20mm 24mm 20mm;
  @top-left {
    content: 'Smart Buy Store · Project documentation';
    font-family: 'Geist', system-ui, sans-serif;
    font-size: 8.5pt;
    color: #9A9A9A;
  }
  @top-right {
    content: 'EvanExpert Studio';
    font-family: 'Geist', system-ui, sans-serif;
    font-size: 8.5pt;
    color: #9A9A9A;
  }
  @bottom-left {
    content: 'evanexpert.nl';
    font-family: 'Geist', system-ui, sans-serif;
    font-size: 8.5pt;
    color: #9A9A9A;
  }
  @bottom-right {
    content: counter(page) ' / ' counter(pages);
    font-family: 'JetBrains Mono', monospace;
    font-size: 8.5pt;
    color: #9A9A9A;
  }
}
@page :first {
  @top-left { content: ''; } @top-right { content: ''; }
  @bottom-left { content: ''; } @bottom-right { content: ''; }
}

* { box-sizing: border-box; }
:root {
  --bg: #FAFAF7; --bg2: #F3EEE5; --surface: #FFFFFF;
  --ink: #1A1A1A; --ink2: #5C5C5C; --ink3: #9A9A9A;
  --border: #E5E2DA; --border2: #CECCBF;
  --emerald: #22C55E; --emerald-bg: #F0FDF4;
}
html, body { background: var(--bg); margin: 0; }
body {
  font-family: 'Geist', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
  color: var(--ink); font-size: 10.5pt; line-height: 1.65;
  -webkit-font-smoothing: antialiased;
}

/* COVER */
.cover {
  page-break-after: always;
  min-height: 245mm;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding-top: 36mm;
}
.cover .brand { display: flex; align-items: center; gap: 12pt; }
.cover .mark {
  width: 38pt; height: 38pt; border-radius: 9pt;
  background: #1A1A1A; color: white;
  display: flex; align-items: center; justify-content: center;
}
.cover .mark svg { width: 22pt; height: 22pt; }
.cover .wm { font-weight: 700; font-size: 16pt; letter-spacing: -0.02em; }
.cover .wm span { color: var(--ink2); font-weight: 500; }
.cover .eyebrow {
  text-transform: uppercase; letter-spacing: 0.18em;
  font-size: 9pt; font-weight: 700; color: var(--ink3);
  margin-top: 80mm;
}
.cover h1.title {
  font-size: 40pt; line-height: 1.04; letter-spacing: -0.035em;
  font-weight: 700; margin: 10pt 0 0 0; max-width: 160mm;
}
.cover h1.title em {
  font-style: normal; position: relative; display: inline-block;
}
.cover h1.title em::after {
  content: ''; position: absolute; left: 0; right: 0; bottom: -3pt;
  height: 4pt; background: var(--ink); border-radius: 2pt;
}
.cover .lede {
  font-size: 13pt; color: var(--ink2); max-width: 150mm;
  line-height: 1.55; margin-top: 16pt;
}
.cover .doc-card {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 10pt;
  margin-top: 28mm;
}
.cover .doc-card .cell {
  border: 0.5pt solid var(--border); border-radius: 8pt; padding: 10pt 12pt;
  background: var(--bg2);
}
.cover .doc-card .lbl {
  text-transform: uppercase; letter-spacing: 0.12em;
  font-size: 7.5pt; font-weight: 600; color: var(--ink3); margin-bottom: 4pt;
}
.cover .doc-card .val {
  font-size: 10.5pt; font-weight: 600; color: var(--ink);
}
.cover .footer-line {
  margin-top: auto; padding-top: 18pt;
  border-top: 0.5pt solid var(--border);
  font-size: 8.5pt; color: var(--ink3);
  display: flex; justify-content: space-between;
}

/* HEADINGS */
h1 { font-size: 26pt; line-height: 1.08; letter-spacing: -0.03em; margin: 26pt 0 8pt 0; page-break-after: avoid; }
h1:first-of-type { margin-top: 0; }
h2 {
  font-size: 17pt; line-height: 1.18; letter-spacing: -0.025em;
  font-weight: 700; margin: 22pt 0 6pt 0; padding-top: 12pt;
  border-top: 2pt solid var(--ink);
  page-break-after: avoid;
  page-break-before: always;
}
h2:first-of-type { page-break-before: auto; margin-top: 0; }
h3 {
  font-size: 12.5pt; font-weight: 600; margin: 14pt 0 6pt 0;
  letter-spacing: -0.015em; color: var(--ink);
}
h4 { font-size: 11pt; font-weight: 600; margin: 12pt 0 4pt 0; }

p { margin: 0 0 8pt 0; color: var(--ink2); }
p strong { color: var(--ink); font-weight: 600; }

ul, ol { margin: 6pt 0 12pt 0; padding-left: 18pt; }
li { color: var(--ink2); margin-bottom: 3pt; line-height: 1.55; }
li::marker { color: var(--ink3); }

a { color: var(--ink); text-decoration: underline; text-decoration-thickness: 0.5pt; text-underline-offset: 2pt; }

/* TABLES */
table { width: 100%; border-collapse: collapse; margin: 8pt 0 14pt 0; font-size: 9.5pt; page-break-inside: avoid; }
thead th {
  text-align: left; color: var(--ink); font-weight: 600;
  padding: 6pt 8pt; background: var(--bg2);
  border-bottom: 1.5pt solid var(--ink);
}
tbody td {
  padding: 6pt 8pt; border-bottom: 0.5pt solid var(--border);
  color: var(--ink2); vertical-align: top;
}
tbody tr:last-child td { border-bottom: none; }
table code { font-size: 8.5pt; padding: 1pt 4pt; background: var(--bg2); border-radius: 3pt; color: var(--ink); }

/* CODE */
code {
  font-family: 'JetBrains Mono', 'SF Mono', Menlo, Consolas, monospace;
  font-size: 9pt; color: var(--ink); background: var(--bg2);
  padding: 1pt 4pt; border-radius: 3pt;
}
pre {
  background: #FBF7EE; border: 0.5pt solid var(--border);
  border-left: 3pt solid var(--ink); border-radius: 6pt;
  padding: 10pt 12pt; margin: 8pt 0 14pt 0; overflow-x: auto;
  page-break-inside: avoid;
}
pre code {
  background: transparent; padding: 0; font-size: 8.5pt;
  line-height: 1.55; color: var(--ink);
  white-space: pre-wrap; word-break: break-word;
}

hr { border: none; border-top: 0.5pt solid var(--border); margin: 18pt 0; }

blockquote {
  margin: 10pt 0; padding: 10pt 14pt;
  background: var(--bg2); border-left: 3pt solid var(--ink);
  border-radius: 4pt; color: var(--ink2);
  font-size: 10pt;
}
"""

EVX_MARK_SVG = """<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
  <g fill="none" stroke="white" stroke-linecap="round" stroke-width="1.6">
    <line x1="2.5" y1="4.5" x2="7" y2="7.5"/>
    <line x1="2"   y1="8"   x2="7" y2="8"/>
    <line x1="2.5" y1="11.5" x2="7" y2="8.5"/>
  </g>
  <circle cx="10" cy="8" r="2.4" fill="white"/>
</svg>"""

# Phase metadata
PHASE_META = {
    'FASE-1': {
        'eyebrow': 'Fase 1 · Analyse & scope',
        'title': 'Wat we <em>bouwen</em> en wat niet.',
        'lede': 'Inventarisatie van de bestaande Smart Buy Store front-end, scope-afbakening, must/should/later, en architectuurkeuzes die het systeem simpel en foutbestendig houden.',
        'fase_num': '01 van 10',
    },
    'FASE-2': {
        'eyebrow': 'Fase 2 · Technisch plan',
        'title': 'De <em>architectuur</em>, zwart op wit.',
        'lede': 'Volledige technische architectuur, datamodel, authenticatie, rollen & rechten, Mollie- en facturen-integratie, e-mail-abstractie en geïdentificeerde risico\'s met mitigaties.',
        'fase_num': '02 van 10',
    },
    'FASE-3': {
        'eyebrow': 'Fase 3 · UX & schermen',
        'title': 'Elk <em>scherm</em>, elke knop, elke waarschuwing.',
        'lede': 'Volledige beschrijving van alle admin- en klantaccount-schermen, met velden, knoppen, waarschuwingen en foutpreventies per scherm.',
        'fase_num': '03 van 10',
    },
    'FASE-4': {
        'eyebrow': 'Fase 4 · Implementatiebasis',
        'title': 'De <em>fundering</em>: auth, rollen, layouts.',
        'lede': 'Source veilig in git, Supabase auth + RLS opgezet, route-protection via middleware, en de skelet-layouts voor admin én klantaccount klaar voor de volgende fases.',
        'fase_num': '04 van 10',
    },
    'FASE-5': {
        'eyebrow': 'Fase 5 · Producten, categorieën, klanten',
        'title': 'Catalog uit <em>Supabase</em>, admin beheert, site leeft.',
        'lede': 'Productcatalogus volledig in Supabase. Admin-CRUD voor producten, categorieën en klanten met soft-delete en foutpreventies. Public pages lezen direct uit DB met ISR — wijzigingen verschijnen binnen 60s.',
        'fase_num': '05 van 10',
    },
}

def build_pdf(md_path):
    base = os.path.splitext(os.path.basename(md_path))[0]
    meta = PHASE_META.get(base, {
        'eyebrow': f'Project documentatie · {base}',
        'title': base,
        'lede': '',
        'fase_num': base,
    })

    md_text = open(md_path, encoding='utf-8').read()
    # Strip the leading H1
    md_text = re.sub(r'^\s*#\s+.+?\n', '', md_text, count=1)
    body_html = markdown.markdown(
        md_text,
        extensions=['extra', 'sane_lists', 'tables', 'fenced_code', 'attr_list'],
        output_format='html5',
    )

    full_html = f"""<!doctype html>
<html lang="nl">
<head>
<meta charset="utf-8">
<title>{html.escape(base)} · Smart Buy Store</title>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>{CSS}</style>
</head>
<body>

<section class="cover">
  <div>
    <div class="brand">
      <div class="mark">{EVX_MARK_SVG}</div>
      <span class="wm">evan<span>expert</span></span>
    </div>
    <div class="eyebrow">{meta['eyebrow']}</div>
    <h1 class="title">{meta['title']}</h1>
    <p class="lede">{meta['lede']}</p>

    <div class="doc-card">
      <div class="cell">
        <div class="lbl">Project</div>
        <div class="val">Smart Buy Store</div>
      </div>
      <div class="cell">
        <div class="lbl">Document</div>
        <div class="val">{meta['fase_num']}</div>
      </div>
      <div class="cell">
        <div class="lbl">Datum</div>
        <div class="val">{TODAY_NL}</div>
      </div>
      <div class="cell">
        <div class="lbl">Auteur</div>
        <div class="val">Evan Poul</div>
      </div>
    </div>
  </div>
  <div class="footer-line">
    <span>EvanExpert Studio · KvK 78740320 · info@evanexpert.nl</span>
    <span>evanexpert.nl</span>
  </div>
</section>

{body_html}

</body>
</html>
"""

    html_path = md_path.replace('.md', '.html')
    pdf_path = md_path.replace('.md', '.pdf')
    open(html_path, 'w', encoding='utf-8').write(full_html)

    subprocess.run([
        CHROME, '--headless=new', '--no-pdf-header-footer',
        f'--print-to-pdf={pdf_path}',
        '--virtual-time-budget=10000',
        '--no-sandbox',
        'file://' + html_path,
    ], check=True, capture_output=True)
    print(f'  ✓ {os.path.basename(pdf_path)}')

if __name__ == '__main__':
    if len(sys.argv) > 1:
        for arg in sys.argv[1:]:
            build_pdf(os.path.join(HERE, arg) if not os.path.isabs(arg) else arg)
    else:
        for md in sorted(glob.glob(os.path.join(HERE, 'FASE-*.md'))):
            build_pdf(md)

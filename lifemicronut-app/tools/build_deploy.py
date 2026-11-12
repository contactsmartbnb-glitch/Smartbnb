#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Assemble les dossiers à déployer (Cloudflare Pages) dans dist/ :
  dist/prod/bilan    -> bilan.lifemicronut.com     (projet lmn-bilan-test)
  dist/prod/fatigue  -> fatigue.lifemicronut.com   (projet lmn-fatigue)
  dist/prod/admin    -> espace pharmacien          (projet lmn-admin)
  dist/preview       -> aperçu sur un seul hôte (/, /fatigue/, /admin/), non indexé
Police Hanken Grotesk intégrée (aucune requête vers Google). Usage : python3 tools/build_deploy.py"""
import base64, io, os, re, shutil
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIST = os.path.join(ROOT, "dist")
TODAY = "2026-11-12"
def rd(p): return io.open(os.path.join(ROOT, p), encoding="utf-8").read()
def wr(p, s):
    p = os.path.join(DIST, p); os.makedirs(os.path.dirname(p), exist_ok=True); io.open(p, "w", encoding="utf-8").write(s)

FONT = base64.b64encode(open(os.path.join(ROOT, "src/fonts/HankenGrotesk-latin.woff2"), "rb").read()).decode()
FONT_CSS = ('<style>@font-face{font-family:"Hanken Grotesk";font-style:normal;font-weight:400 700;font-display:swap;'
            'src:url(data:font/woff2;base64,' + FONT + ') format("woff2")}</style>')
def inline_font(s):
    s2, n = re.subn(r'(?:<link rel="preconnect" href="https://fonts\.g[^>]*>\s*)*<link rel="stylesheet" href="https://fonts\.googleapis\.com[^>]*>', lambda m: FONT_CSS, s)
    assert n == 1, "balises de police introuvables"
    assert "fonts.googleapis.com" not in s2 and "fonts.gstatic.com" not in s2
    return s2

SEC = """/*
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: geolocation=(), microphone=(), camera=()
  Strict-Transport-Security: max-age=31536000; includeSubDomains
"""
# Les pages n'ont besoin de parler qu'à Supabase (demande de rapport) ; tout le reste est intégré.
CSP_APP = ("  Content-Security-Policy: default-src 'none'; script-src 'unsafe-inline' https://static.cloudflareinsights.com; style-src 'unsafe-inline'; "
           "img-src 'self' data: blob:; font-src data:; connect-src https://ioetcwpsnvoavwpwnumi.supabase.co https://cloudflareinsights.com; "
           "base-uri 'none'; form-action 'none'; frame-ancestors 'none'\n")
def page404(home):
    return ('<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
            '<meta name="robots" content="noindex"><title>Page introuvable | LifeMicroNut</title>'
            '<style>body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#28384A;color:#F6F9FC;'
            'font-family:system-ui,-apple-system,"Segoe UI",sans-serif;text-align:center;padding:24px}a{display:inline-block;margin-top:18px;'
            'background:#fff;color:#28384A;padding:12px 22px;border-radius:999px;text-decoration:none;font-weight:600}</style></head>'
            '<body><main><h1>Cette page n\'existe pas</h1><p>Le lien est peut-être ancien ou incomplet.</p>'
            '<a href="%s">Voir les bilans</a></main></body></html>' % home)
def robots(host): return "User-agent: *\nAllow: /\n\nSitemap: https://%s/sitemap.xml\n" % host
def sitemap(host):
    return ('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
            '  <url><loc>https://%s/</loc><lastmod>%s</lastmod></url>\n</urlset>\n' % (host, TODAY))

if os.path.isdir(DIST): shutil.rmtree(DIST)
dig, fat, bo = inline_font(rd("digestion.html")), inline_font(rd("fatigue.html")), rd("backoffice.html")

# ---------- PROD ----------
for name, html, host in (("bilan", dig, "bilan.lifemicronut.com"), ("fatigue", fat, "fatigue.lifemicronut.com")):
    wr("prod/%s/index.html" % name, html); wr("prod/%s/404.html" % name, page404("/"))
    wr("prod/%s/robots.txt" % name, robots(host)); wr("prod/%s/sitemap.xml" % name, sitemap(host))
    wr("prod/%s/_headers" % name, SEC + CSP_APP)
wr("prod/admin/index.html", bo); wr("prod/admin/robots.txt", "User-agent: *\nDisallow: /\n")
wr("prod/admin/_headers", SEC + "  X-Robots-Tag: noindex, nofollow\n  Cache-Control: no-store\n")

# ---------- APERÇU (un seul hôte) ----------
def preview(html):
    html = html.replace('<meta name="robots" content="index,follow,max-image-preview:large">', '<meta name="robots" content="noindex,nofollow">')
    n1 = html.count('href="https://fatigue.lifemicronut.com"'); n2 = html.count('href="https://bilan.lifemicronut.com"')
    html = html.replace('href="https://fatigue.lifemicronut.com"', 'href="/fatigue/"').replace('href="https://bilan.lifemicronut.com"', 'href="/"')
    return html, n1 + n2
p_dig, a = preview(dig); p_fat, b = preview(fat)
assert a >= 1 and b >= 1, "liens croisés introuvables (%d, %d)" % (a, b)
wr("preview/index.html", p_dig); wr("preview/fatigue/index.html", p_fat); wr("preview/admin/index.html", bo)
wr("preview/404.html", page404("/")); wr("preview/robots.txt", "User-agent: *\nDisallow: /\n")
wr("preview/_headers", SEC + "  X-Robots-Tag: noindex, nofollow\n\n/index.html\n" + CSP_APP + "\n/\n" + CSP_APP + "\n/fatigue/*\n" + CSP_APP)
for d, _, fs in os.walk(DIST):
    for f in fs:
        p = os.path.join(d, f); print("%8d  %s" % (os.path.getsize(p), os.path.relpath(p, DIST)))

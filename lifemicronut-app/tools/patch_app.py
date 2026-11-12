#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Applique (de façon idempotente) les correctifs transverses aux deux bilans :
en-tête SEO, textes de confidentialité, module UX (src/enh.*), module de demande (src/order.*).
Usage : python3 tools/patch_app.py   (depuis lifemicronut-app/)"""
import io, json, os, re, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def rd(p): return io.open(os.path.join(ROOT, p), encoding="utf-8").read()
PAY = "https://www.paypal.com/ncp/payment/USX7H34C8XGP8"
OG_IMG = "https://lifemicronut.com/og-image.png"

FAQ = [
 ("Est-ce que ça pose un diagnostic ?", "Non, jamais. Les bilans orientent vers des pistes, à valider avec un professionnel de santé."),
 ("Mes réponses sont-elles privées ?", "Oui. Pendant le questionnaire, vos réponses restent sur votre appareil. Elles ne sont transmises à LifeMicroNut que si vous demandez votre rapport complet, avec votre accord."),
 ("Combien de temps ça prend ?", "Environ 15 minutes par bilan. Vous ne voyez que les questions qui vous concernent."),
 ("Que contient le résultat ?", "Un aperçu gratuit des pistes, puis un rapport détaillé, relu par une pharmacienne et envoyé par e-mail sous 24 à 48 h."),
]
CONF = {
 "digestion": dict(
   file="digestion.html", allreq="true", url="https://bilan.lifemicronut.com/",
   title="Bilans de micronutrition en ligne : digestion, fatigue | LifeMicroNut",
   desc="Bilans d'orientation en ligne pensés avec une pharmacienne : digestion et microbiote, fatigue. 15 minutes, aperçu gratuit des pistes, rapport relu avant envoi.",
   name="Bilans LifeMicroNut — digestion & microbiote", faq=True),
 "fatigue": dict(
   file="fatigue.html", allreq="false", url="https://fatigue.lifemicronut.com/",
   title="Bilan fatigue en ligne : questionnaire d'orientation | LifeMicroNut",
   desc="Fatigue persistante, coups de pompe, récupération difficile : un questionnaire d'orientation de 15 minutes pensé avec une pharmacienne. Aperçu gratuit des pistes.",
   name="Bilan fatigue & énergie — LifeMicroNut", faq=False),
}

def must(s, old, new, label, count=1, optional_done=None):
    """remplace `old` par `new` ; si déjà fait (new présent, old absent) ne fait rien ; sinon échoue."""
    if old in s:
        return s.replace(old, new) if count == 0 else s.replace(old, new, count)
    if (optional_done or new) in s:
        return s
    sys.exit("PATCH INTROUVABLE : " + label)

def seo_block(c):
    graph = [
      {"@type": "Organization", "@id": "https://lifemicronut.com/#organisation", "name": "LifeMicroNut", "url": "https://lifemicronut.com/"},
      {"@type": "WebPage", "@id": c["url"] + "#page", "url": c["url"], "name": c["name"], "description": c["desc"],
       "inLanguage": "fr-FR", "isPartOf": {"@type": "WebSite", "@id": "https://lifemicronut.com/#site", "url": "https://lifemicronut.com/", "name": "LifeMicroNut"},
       "publisher": {"@id": "https://lifemicronut.com/#organisation"},
       "about": {"@type": "Thing", "name": "Micronutrition"}},
    ]
    if c["faq"]:
        graph.append({"@type": "FAQPage", "@id": c["url"] + "#faq", "mainEntity": [
            {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in FAQ]})
    ld = json.dumps({"@context": "https://schema.org", "@graph": graph}, ensure_ascii=False)
    e = lambda t: t.replace("&", "&amp;").replace('"', "&quot;")
    return ("<!--SEO-START-->\n"
            '<link rel="canonical" href="%s">\n' % c["url"] +
            '<meta property="og:type" content="website">\n<meta property="og:site_name" content="LifeMicroNut">\n<meta property="og:locale" content="fr_FR">\n'
            '<meta property="og:url" content="%s">\n<meta property="og:title" content="%s">\n<meta property="og:description" content="%s">\n<meta property="og:image" content="%s">\n'
            % (c["url"], e(c["title"]), e(c["desc"]), OG_IMG) +
            '<meta name="twitter:card" content="summary_large_image">\n<meta name="twitter:title" content="%s">\n<meta name="twitter:description" content="%s">\n<meta name="twitter:image" content="%s">\n'
            % (e(c["title"]), e(c["desc"]), OG_IMG) +
            '<script type="application/ld+json">' + ld + "</script>\n<!--SEO-END-->\n")

def patch(bilan):
    c = CONF[bilan]; path = os.path.join(ROOT, c["file"]); s = io.open(path, encoding="utf-8").read(); n0 = len(s)
    e = lambda t: t.replace("&", "&amp;").replace('"', "&quot;")
    # --- en-tête ---
    s = re.sub(r"<title>.*?</title>", lambda m: "<title>" + c["title"].replace("&", "&amp;") + "</title>", s, count=1, flags=re.S)
    s = re.sub(r'<meta name="description" content="[^"]*">', lambda m: '<meta name="description" content="%s">' % e(c["desc"]), s, count=1)
    s = re.sub(r'<meta name="robots" content="[^"]*">', '<meta name="robots" content="index,follow,max-image-preview:large">', s, count=1)
    s = re.sub(r"<!--SEO-START-->.*?<!--SEO-END-->\n?", "", s, flags=re.S)
    s = must(s, '<meta name="theme-color" content="#12936A">\n', '<meta name="theme-color" content="#28384A">\n' + seo_block(c), "theme-color",
             optional_done='<meta name="theme-color" content="#28384A">')
    if "<!--SEO-START-->" not in s:
        s = s.replace('<meta name="theme-color" content="#28384A">\n', '<meta name="theme-color" content="#28384A">\n' + seo_block(c), 1)
    # --- textes devenus inexacts avec le flux "demande" ---
    s = must(s, "<p>Oui. La page n'envoie rien : vos réponses restent sur votre appareil.</p>", "<p>" + FAQ[1][1] + "</p>", "FAQ privé")
    s = must(s, "<p>Un aperçu gratuit des pistes, puis un rapport détaillé à télécharger.</p>", "<p>" + FAQ[3][1] + "</p>", "FAQ résultat")
    s = must(s, "Vous pouvez revenir en arrière à tout moment. Vos réponses restent sur votre appareil.</div>",
             "Vous pouvez revenir en arrière à tout moment. Vos réponses restent sur votre appareil tant que vous ne demandez pas votre rapport.</div>", "pied sidebar")
    NEWPC2 = "Elles restent sur cet appareil pendant le questionnaire ; elles ne sont transmises à LifeMicroNut que si vous demandez votre rapport complet, avec votre accord."
    s, npc2 = re.subn(r"Cette page ne les transmet à personne[\u00a0 ]: elles ne quittent cet appareil que dans le fichier PDF que vous envoyez vous-même\.", NEWPC2, s)
    assert npc2 or NEWPC2 in s, "aide pc2 introuvable"
    s = must(s, "Envoyez ce fichier à votre pharmacienne, par le moyen qu\\'elle vous a indiqué.",
             "Gardez une copie de vos réponses, ou montrez-la à votre médecin ou à votre pharmacien.", "texte fin PDF")
    # --- pastille "répondu" : reconnaître aussi l'échelle 0-10 à boutons ---
    s = must(s, "function answered(q){ var ch=q.querySelectorAll('input[type=radio],input[type=checkbox]');",
             "function answered(q){ if(q.querySelector('.s10 .on')) return true; var ch=q.querySelectorAll('input[type=radio],input[type=checkbox]');", "answered s10")
    s = must(s, "pg.addEventListener('input',function(){setTimeout(tick,0);});",
             "pg.addEventListener('input',function(){setTimeout(tick,0);});pg.addEventListener('click',function(){setTimeout(tick,30);});", "tick au clic (s10)")
    # --- module de demande ---
    order = ("<!--ORDER-START-->\n<style>\n" + rd("src/order.css") + "</style>\n<script>\n" +
             rd("src/order.js").replace("__BILAN__", bilan).replace("__PAY_URL__", PAY) + "</script>\n<!--ORDER-END-->\n")
    if "<!--ORDER-START-->" in s:
        s = re.sub(r"<!--ORDER-START-->.*?<!--ORDER-END-->\n?", lambda m: order, s, flags=re.S)
    else:
        a = s.find("#lmn-order-box{"); st = s.rfind("<style>", 0, a); en = s.find("<!--GL-END-->")
        assert a > 0 and st > 0 and en > st, "bloc demande introuvable"
        s = s[:st] + order + s[en:]
    # --- module UX ---
    enh = ("<!--ENH-START-->\n<style>\n" + rd("src/enh.css") + "</style>\n<script>\n" +
           rd("src/enh.js").replace("__ALLREQ__", c["allreq"]) + "</script>\n<!--ENH-END-->\n")
    s = re.sub(r"<!--ENH-START-->.*?<!--ENH-END-->\n?", "", s, flags=re.S)
    i = s.rfind("</body>"); s = s[:i] + enh + s[i:]
    io.open(path, "w", encoding="utf-8").write(s)
    print("%-14s %d -> %d octets" % (c["file"], n0, len(s)))

for b in CONF: patch(b)

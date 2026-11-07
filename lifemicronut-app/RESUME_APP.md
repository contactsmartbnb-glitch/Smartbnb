# LifeMicroNut — Résumé de l'application (pour transfert / relecture externe)

> Document de contexte à transmettre à un assistant tiers (DeepSeek) pour travailler
> sur **le site internet** et **l'arbre décisionnel** des bilans.
> Toutes les données sensibles (clés secrètes, mot de passe) ont été retirées de ce paquet.

---

## 1. Le projet en une phrase

**LifeMicroNut** est une plateforme française de **bilans de santé en ligne** (questionnaires
adaptatifs de micronutrition). L'utilisateur répond à un questionnaire qui **s'adapte à ses
réponses**, puis obtient un **rapport d'orientation éducatif** (pas un diagnostic), **relu et
validé par une pharmacienne** (Dr AICHE Assiya) avant envoi.

- **Décideuse / référente métier** : Dr AICHE Assiya, pharmacienne (pharmacovigilance, ANSM).
- **Langue** : tout en français.
- **Ton / mission** : *on ne minimise pas les symptômes*. Lutter contre l'errance médicale,
  donner des pistes éducatives tôt, « mieux vaut prévenir que guérir ». Toujours cadré :
  orientation, pas de diagnostic, ne remplace pas une consultation (mention 15 / urgences).

---

## 2. Architecture technique (volontairement simple)

- **100% statique** : pages **HTML/CSS/JS autonomes**, aucune dépendance serveur pour le
  questionnaire. Les réponses restent dans le **navigateur** (localStorage) pendant la saisie.
- **Moteur de questionnaire piloté par données** : un objet `QMDATA` (JSON) décrit les pages
  et les questions ; un moteur générique `render()` affiche la bonne question au bon moment
  selon les réponses déjà données.
- **Build "verre dépoli" (glassmorphism)** : un script Python `build_glass.py` prend la source
  d'un bilan et y injecte le style (fond atmosphérique flou, cartes en verre, tuiles numérotées,
  jauge translucide) + une **sidebar de progression** (phases), **sans toucher à la logique**.
  Le même script sert les deux bilans via une variable `BILAN=digestion|fatigue`.
- **Hébergement** : **Cloudflare Pages**. Polices **Hanken Grotesk inlined en base64** sur la
  prod (pages 100% autonomes, zéro requête externe).
- **Back-end "rapport relu & validé"** : **Supabase** (Postgres + Auth + RLS) + **Resend**
  (e-mails) + **PayPal** (lien de paiement hébergé). Détaillé en §6.

### Domaines / déploiements
| URL | Contenu |
|---|---|
| `bilan.lifemicronut.com` | Accueil (hub) + bilan **digestion** — PROD |
| `fatigue.lifemicronut.com` | Bilan **fatigue** — PROD |
| `demande.lmn-bilan-test.pages.dev` | Preview digestion (avec le nouveau flux "rapport relu") |
| `demande.lmn-fatigue.pages.dev` | Preview fatigue (page 1 alignée + option nocturie + flux) |
| `lmn-admin.pages.dev` | **Back-office** pharmacien (relecture/validation) |

> ⚠️ État au moment de l'export : la **prod** ne contient PAS encore le flux "rapport relu"
> ni les derniers correctifs fatigue — ils sont sur les **previews**, en attente d'une dernière
> étape SQL (voir §7). Les fichiers HTML fournis dans ce paquet sont les **versions preview
> (les plus à jour)**.

---

## 3. L'accueil (hub) et le catalogue de bilans

La page d'accueil est un **hub** : hero + **mission** (« On ne minimise pas vos symptômes »,
errance médicale, prévention) + **catalogue de bilans** (cartes) + « comment ça marche » +
présentation de la pharmacienne + FAQ + CTA.

Bilans **disponibles** aujourd'hui : **Digestion (microbiote)**, **Fatigue**.
Bilans **prévus** (cartes « Bientôt », à construire) : Stress, Sommeil, Hormones (périménopause /
ménopause / SPM), Peau, Douleur / immunité / inflammation, « Carences provoquées par vos
médicaments », etc.

---

## 4. L'arbre décisionnel — STRUCTURE (le cœur du sujet)

Chaque bilan = **deux arbres** : (A) l'arbre de **questionnement** (quelles questions poser) et
(B) l'arbre de **restitution** (quelles pistes/orientations en tirer).

### 4.A — Arbre de questionnement : `QMDATA`
Fichiers fournis : `qmdata_digestion.json` (14 pages / 76 questions),
`qmdata_fatigue.json` (20 pages / 154 questions).

Structure :
```
QMDATA = {
  "MB": {
    "pages": [ { "k": "<clé page>", "n": "<titre>", "q": [ ...items... ] }, ... ],
    "ouvre": { "<flag>": ... },        // ouverture conditionnelle de pages selon réponses
    "exclusives": { "<qid>": "<option qui désélectionne les autres>" },
    "nsp": [ "<qid>", ... ],           // questions proposant "Je ne sais pas"
    "cles","sousTitres","siQ","blocs","plein": métadonnées d'affichage
  },
  "questions": [ { ...une question... }, ... ]
}
```

**Un item de page `q`** est soit un **id de question** (string), soit un **bloc d'information
inline** : `{ "t":"warn"|"note", "l":"titre", "h":["paragraphes"], "w":{...condition} }`.

**Une question** :
```
{
  "id":  "d_depuis",
  "t":   "single" | "multi" | "scale5" | "text" | "date" | "num" ...,
  "l":   "Libellé de la question",
  "o":   ["Option 1","Option 2", ...],     // pour single/multi
  "sc":  "FREQ",   "nsp": 1,               // pour scale5 : échelle Jamais→Toujours + "Je ne sais pas"
  "req": 1,                                 // réponse obligatoire (astérisque)
  "w":   { ...condition d'affichage... }    // si absent : toujours affichée
}
```

**Les conditions `w`** (c'est ça, la logique adaptative) :
- `{"q":"sexe","eq":"Femme"}` — affichée seulement si la réponse à `sexe` vaut « Femme ».
- `{"q":"qn_motif","any":["A","B"]}` — si au moins une de ces options est cochée.
- `{"q":"qn_motif","anyBut":["X"]}` — si une option **autre que** X est cochée.
- `{"age_lt":18}` — selon l'âge calculé (date de naissance `ddn`).
- `{"or":[cond1, cond2]}` / `{"and":[...]}` — combinaisons.

**Première page = sécurité / consentement** (identique sur les deux bilans) : avertissement
médical + « J'ai compris » + « J'accepte de répondre à des questions sur ma santé », puis
page sécurité (âge, grossesse, signes d'alarme → messages d'orientation urgente le cas échéant).

### 4.B — Arbre de restitution : règles du rapport
Fichiers fournis : `regles_rapport_digestion.js`, `regles_rapport_fatigue.js`.

Principe : une fonction `lmnData(A)` (A = objet des réponses) applique une **liste de règles
"pistes"**. Chaque règle teste des réponses via un **prédicat** `P(id, op, valeurs)` où `op` ∈
`has` / `in` / `eq` / `count`… Si la condition est vraie, on **ajoute une piste** (orientation)
avec : le *pourquoi* (mécanisme simple), les *analyses à demander au médecin*, les *conseils
alimentation/hygiène de vie*, les *compléments (familles)*, les *erreurs à éviter*, et une
phrase *« à dire à votre médecin »*.

> ⚠️ Détail d'implémentation important : le moteur stocke certaines réponses d'échelle en
> **nombre** alors que des règles comparent des **chaînes** ("3"/"4"). Une coercition
> `String()` a été ajoutée dans `has/in/eq/count` pour fiabiliser. À garder en tête si DeepSeek
> retouche les règles.

Le rapport existe en 2 états : **teaser** (aperçu + nb de pistes, bloc flouté + CTA paiement)
et **rapport complet** (`lmnFullHTML`). Dans le nouveau flux, le rapport complet n'est pas
montré directement : il est **enregistré** pour relecture par la pharmacienne (voir §6).

---

## 5. Parcours utilisateur (front)

1. Accueil (hub) → choisit un bilan → questionnaire glass (sidebar de progression par phases,
   tuiles/chips numérotées, jauge pour les fréquences, « Je ne sais pas » possible).
2. Dernière page → **teaser** du rapport (nombre de pistes, aperçu flouté) + CTA
   **« Obtenir mon rapport complet — 19,99 € »**.
3. Clic → ouvre le **lien PayPal** (paiement avant) puis un **formulaire** : e-mail + case de
   **consentement RGPD** → **« Envoyer ma demande »**.
4. Message : *« Dr AICHE relit votre bilan et vous l'envoie par e-mail sous 24–48 h. »*

---

## 6. Back-end "rapport relu & validé" (human-in-the-loop)

Idée métier : les rapports **ne sont pas téléchargeables immédiatement**. La pharmacienne les
**relit, corrige et valide** avant envoi → meilleure qualité + base de données précise de ce
qu'elle veut. (Validé par la cliente : paiement avant, délai 24–48 h annoncé, livraison e-mail,
consentement RGPD.)

**Flux technique :**
1. **Soumission** (page, clé *publishable* Supabase, sans danger) : `INSERT` dans la table
   `public.demandes` `{ bilan, email, reponses(jsonb), rapport_auto(html), consentement,
   consent_at }`. RLS : insertion autorisée **uniquement avec consentement + e-mail valide**,
   **aucune lecture publique**.
2. **E-mails via Supabase** (triggers `pg_net` → **Resend**, clé Resend **côté serveur**,
   jamais dans une page) :
   - à l'`INSERT` → notification à la pharmacienne (`lifemicronut@gmail.com`) ;
   - à la validation (`statut` → `valide`) → envoi du **rapport final** au client ; expéditeur
     `Bilan LifeMicroNut <bilan@lifemicronut.fr>` (domaine vérifié chez Resend).
3. **Back-office** (`lmn-admin.pages.dev`, fichier `backoffice_live.html`) : page statique qui
   se connecte en **Supabase Auth** (e-mail + mot de passe de la pharmacienne). Les policies RLS
   « authenticated » lui donnent **lecture + mise à jour**. Elle voit la liste des demandes
   (filtres À relire / Validés / Envoyés), les réponses, un **rapport éditable**, et deux
   actions : *Enregistrer le brouillon* et *Valider & envoyer*.
   → **Aucune clé secrète ni mot de passe n'est stocké dans une page.** Le secret Supabase et la
   clé Resend restent exclusivement côté serveur (fonctions SQL).

Schéma + policies + triggers : `supabase_schema_et_emails.sql` (clé Resend = placeholder
`<TA_CLE_RESEND>` à remplacer avant exécution).

**Paiement** : lien **PayPal hébergé** (bouton "no-code") à 19,99 €. Fonctionnement « à
l'honneur » : le client paie, la pharmacienne vérifie le paiement au moment de la relecture
(elle valide chaque bilan avant envoi). *(À confirmer : montant du lien = 19,99 €.)*

---

## 7. État actuel & ce qui reste

- ✅ Bilans **digestion** + **fatigue** en ligne (style verre dépoli, polices inlined).
- ✅ Hub multi-bilans, mission intégrée.
- ✅ Backend validé de bout en bout en test (table+RLS OK, login pharmacien OK, e-mail Resend
  OK, insertion depuis la page OK).
- 🟡 Le **flux "rapport relu"** et les **derniers correctifs fatigue** (page 1 alignée sur
  digestion, option « Ça change selon la période du mois » à la question nocturie) sont sur les
  **previews**, pas encore en prod.
- ⏳ **Dernière étape avant prod** : exécuter `supabase_schema_et_emails.sql` dans Supabase
  (droits du compte pharmacien + 2 e-mails automatiques), puis test end-to-end, puis déploiement
  prod des deux bilans d'un coup.
- 🔜 Idées : vrais visuels (hero, portrait Dr AICHE), autres bilans du catalogue, ton du rapport
  (« on ne minimise pas »).

---

## 8. Contenu de ce paquet (fichiers joints)

| Fichier | Rôle |
|---|---|
| `RESUME_APP_LifeMicroNut.md` | Ce document |
| `qmdata_digestion.json` | Arbre de questionnement — digestion (pages + questions + conditions) |
| `qmdata_fatigue.json` | Arbre de questionnement — fatigue |
| `regles_rapport_digestion.js` | Arbre de restitution — règles "pistes" digestion |
| `regles_rapport_fatigue.js` | Arbre de restitution — règles "pistes" fatigue |
| `supabase_schema_et_emails.sql` | Table `demandes` + RLS + triggers e-mail (clé Resend masquée) |
| `backoffice_live.html` | Back-office pharmacien (Supabase Auth) |
| `digestion_latest.html` | Application complète déployée — digestion (preview, la + à jour) |
| `fatigue_latest.html` | Application complète déployée — fatigue (preview, la + à jour) |

> Pour travailler sur **l'arbre décisionnel**, les fichiers utiles sont les `qmdata_*.json`
> (quelles questions, quelle logique conditionnelle) et les `regles_rapport_*.js` (quelles
> orientations). Les `*_latest.html` sont l'application complète (volumineuse) pour référence.

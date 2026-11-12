# LifeMicroNut — Application (bilans + espace pharmacien)

Copie de travail durable de l'application. Aucun secret ici : seule la clé Supabase
*publishable* (publique par conception) figure dans les pages ; la clé Resend du SQL est un
emplacement à remplir (`<TA_CLE_RESEND>`).

## Fichiers
| Fichier | Rôle |
|---|---|
| `digestion.html`, `fatigue.html` | Bilans complets (accueil-hub + questionnaire + rapport + demande de rapport relu) |
| `backoffice.html` | Espace pharmacien : relecture, correction, validation, envoi |
| `src/enh.css`, `src/enh.js` | Module UX (auto-avance sûre, repère des réponses attendues, mobile) |
| `src/order.css`, `src/order.js` | Formulaire de demande (e-mail + accord → Supabase) |
| `src/backoffice.js` | Script de l'espace pharmacien (assainissement HTML, session) |
| `tools/patch_app.py` | Ré-applique les modules et correctifs aux deux bilans (idempotent) |
| `tools/build_deploy.py` | Produit `dist/` : dossiers prêts à déployer, police intégrée, en-têtes de sécurité |
| `supabase_schema_et_emails.sql` | Table, droits, garde-fous, e-mails (script unique, relançable) |
| `qmdata_*.json`, `regles_rapport_*.js` | Arbre décisionnel extrait (questions / règles du rapport) |
| `FICHE_VALIDATION_arbre_digestion.md` | Décisions cliniques à valider par Dr AICHE |
| `AUDIT.md` | Audit complet (anomalies, corrections, reste à faire) |

## Modifier puis déployer
```
python3 tools/patch_app.py        # après toute modification de src/
python3 tools/build_deploy.py     # produit dist/prod/{bilan,fatigue,admin} et dist/preview
```
| Cible | Projet Cloudflare Pages | Dossier |
|---|---|---|
| bilan.lifemicronut.com | `lmn-bilan-test` (branche `main`) | `dist/prod/bilan` |
| fatigue.lifemicronut.com | `lmn-fatigue` (branche `main`) | `dist/prod/fatigue` |
| espace pharmacien | `lmn-admin` (branche `main`) | `dist/prod/admin` |
| aperçu | dépôt `lifemicronut/lifemicronut`, branche `apercu-app` | `dist/preview` |

Commande : `npx wrangler pages deploy <dossier> --project-name=<projet> --branch=main`
(nécessite un jeton Cloudflare ; il n'est pas stocké dans le dépôt).

**Ne pas mettre les bilans en production avant** d'avoir réactivé le projet Supabase et exécuté
`supabase_schema_et_emails.sql` : sans cela, le formulaire de demande échoue.

# LifeMicroNut — Application (bilans + back-office)

Copie de travail **durable** (le conteneur cloud efface le scratchpad aux restarts).
Aucun secret ici : seule la clé Supabase *publishable* (publique) figure dans les pages ;
la clé Resend du SQL est masquée (`<TA_CLE_RESEND>`).

## Fichiers
- `digestion.html`, `fatigue.html` — applications complètes (hub + questionnaire + rapport + flux "demande"),
  style verre dépoli, avec le **lot UX** (auto-avance choix unique, badge de sauvegarde,
  message d'erreur cliquable). Versions les plus à jour.
- `backoffice.html` — espace pharmacien (Supabase Auth, relecture/validation).
- `supabase_schema_et_emails.sql` — table `demandes` + RLS + e-mails (remplacer `<TA_CLE_RESEND>`).
- `qmdata_*.json` — arbre de questionnement (pages + questions + conditions `w`).
- `regles_rapport_*.js` — arbre de restitution (règles "pistes").
- `enh_block.html` — module UX injecté (source).
- `RESUME_APP.md` — résumé complet de l'app.

## Déploiement (Cloudflare Pages)
| Cible | Projet CF | Fichier (en `index.html`) |
|---|---|---|
| bilan.lifemicronut.com (prod digestion) | `lmn-bilan-test` (branch `main`) | `digestion.html` |
| fatigue.lifemicronut.com (prod fatigue) | `lmn-fatigue` (branch `main`) | `fatigue.html` |
| back-office | `lmn-admin` (branch `main`) | `backoffice.html` |
| previews | même projet, branch `demande` | idem |

> La prod affiche encore les versions SANS le flux "demande" ni le lot UX : à déployer
> après avoir collé le SQL et validé en preview.

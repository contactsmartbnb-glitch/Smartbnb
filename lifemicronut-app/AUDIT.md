# Audit LifeMicroNut — 12 novembre 2026

Périmètre : les bilans (digestion, fatigue), l'arbre décisionnel, le formulaire de demande de rapport,
l'espace pharmacien, la base de données, le référencement (SEO) et la visibilité dans les moteurs de
réponse IA (GEO), l'expérience mobile. Le site vitrine (lifemicronut.com) fait l'objet d'une section à part.

## 1. À faire de votre côté, par ordre de priorité

| # | Sujet | Pourquoi | Action |
|---|---|---|---|
| 1 | **Le projet Supabase ne répond plus** | Son adresse n'existe plus (projet mis en pause pour inactivité, ou supprimé). Le formulaire de demande et l'espace pharmacien ne peuvent pas fonctionner. | Tableau de bord Supabase → « Restore project ». Le plan gratuit se remet en pause après 7 jours sans activité : pour un service en production, prévoir le plan payant. |
| 2 | **Exécuter le nouveau script SQL** | L'ancien script donnait la lecture des demandes à *tout* compte connecté ; si l'inscription est ouverte sur le projet, n'importe qui pouvait s'inscrire et lire des données de santé. | Exécuter `supabase_schema_et_emails.sql` (remplacer les 2 valeurs entre chevrons) et désactiver l'inscription publique (Authentication → Providers). |
| 3 | **Jeton Cloudflare** | Sans lui, impossible de mettre à jour bilan.lifemicronut.com, fatigue.lifemicronut.com et l'espace pharmacien. | L'ajouter dans les réglages de l'environnement (hôte `api.cloudflare.com`). |
| 4 | **Fiche de validation** | 10 décisions cliniques/éditoriales (D1 à D10) attendent Dr AICHE. | Lui transmettre `FICHE_VALIDATION_arbre_digestion.md`. |
| 5 | **Cadre légal des données de santé** | Le service enregistre des réponses de santé associées à une adresse e-mail. | Faire valider par un juriste : page de confidentialité complète, durée de conservation, et la question de l'hébergement de données de santé (HDS). Aucune page de confidentialité n'existe aujourd'hui sur le site. |
| 6 | Lien PayPal | Le montant réel est réglé dans PayPal, pas dans la page. | Vérifier qu'il est bien à 19,99 €. |

## 2. Anomalies trouvées et corrigées dans l'application

### Bloquant
- **Formulaire de demande : bouton « Envoyer ma demande » coupé et presque invisible.** Le formulaire
  s'ouvrait dans un cadre à hauteur fixe qui masquait le bas ; le bouton était blanc sur fond blanc, le champ
  e-mail sans bordure, le lien « En savoir plus » invisible. → Mise en page refaite, testée sur ordinateur et mobile.
- **Bouton d'achat « Obtenir mon rapport complet » blanc sur carte blanche.** → Bouton plein, lisible.
- **Espace pharmacien : exécution possible de code injecté.** Le rapport reçu d'un navigateur inconnu était
  affiché tel quel dans la session connectée ; un envoi malveillant aurait pu lire toutes les demandes.
  → Contenu assaini avant affichage et avant envoi, politique de sécurité stricte. Vérifié avec une charge de test.
- **Droits de la base trop larges** (voir priorité 2). → Droits liés au seul compte de la pharmacienne,
  colonnes limitées, tailles et fréquences plafonnées, e-mails échappés.

### Important
- **Auto-avance dangereuse en fatigue.** Dès que les 2 questions obligatoires d'une page étaient remplies,
  chaque réponse à une question facultative faisait sauter la page. → L'avance automatique ne se déclenche plus
  que sur un clic/tap donnant la *dernière* réponse de la page ; jamais au clavier, jamais en corrigeant une
  réponse, jamais si un message d'avertissement vient d'apparaître, jamais vers la page finale.
- **Repère « réponse attendue » affiché sur des questions facultatives** (fatigue) et jamais retiré sur
  l'échelle 0–10. → Limité aux questions qui bloquent réellement « Suivant ».
- **Textes de confidentialité devenus faux** avec le formulaire de demande (« la page n'envoie rien »,
  « elles ne quittent cet appareil que dans le fichier PDF »). → Reformulés : les réponses restent sur l'appareil
  tant que la personne ne demande pas son rapport.
- **Mobile** : le numéro des tuiles chevauchait le texte des réponses longues ; boutons de l'échelle 0–10 trop
  étroits (29 px → 55 px, sur deux rangées) ; libellés d'extrémités illisibles ; message « réponses nécessaires »
  écrasé entre les boutons ; bandeau d'en-tête trop haut (le rappel de sauvegarde ne s'affiche plus que sur les
  deux premières pages).
- **Pages non référencées et mal décrites** : `noindex`, titre « Questionnaire… (version de test) », description
  obsolète. → Titres et descriptions réécrits, adresse canonique, Open Graph, données structurées (dont la FAQ),
  indexation autorisée.
- **Requêtes vers Google Fonts** à chaque visite (fuite d'adresse IP). → Police intégrée au fichier ; les pages
  ne contactent plus aucun tiers (vérifié : 0 requête externe).

### Mineur
- Page d'erreur 404, `robots.txt`, `sitemap.xml` et en-têtes de sécurité ajoutés aux dossiers de déploiement.
- Espace pharmacien : la session se renouvelle seule (elle expirait au bout d'une heure, en pleine relecture),
  case « paiement vérifié », avertissement avant de quitter une correction non enregistrée.
- Formulaire : champ-piège anti-robots, double envoi empêché, messages lus par les lecteurs d'écran,
  lien de secours si la page PayPal ne s'ouvre pas.

## 3. Arbre décisionnel
- Intégrité : **aucune règle morte, aucune question inatteignable** (4 000 parcours simulés par bilan), aucune
  référence cassée entre questions, conditions et règles.
- Aucune règle clinique n'a été modifiée. Les points à arbitrer sont dans la fiche de validation (D1 à D10),
  notamment : en fatigue, trois pistes sortent dans la majorité des parcours simulés (mitochondries 77 %).

## 4. Tests réalisés
- Parcours complet des deux bilans, 3 profils de réponses, en 1200 px et 390 px : aucune erreur, aucun débordement.
- Formulaire de demande : validations, envoi (serveur simulé), affichage ordinateur et mobile.
- Auto-avance : souris, tactile, clavier, correction d'une réponse, questions facultatives.
- Espace pharmacien : connexion, renouvellement de session, charge malveillante, validation.
- Version de déploiement : sous sa politique de sécurité, 0 requête externe, PDF et page 404 fonctionnels.
- **Non testé** : le script SQL (le projet Supabase est injoignable) et l'envoi réel des e-mails.

## 5. État des mises en ligne
| Élément | État |
|---|---|
| Aperçu des bilans corrigés | En ligne : https://apercu-app.lifemicronut-git.pages.dev/ (et `/fatigue/`, `/admin/`) |
| bilan.lifemicronut.com, fatigue.lifemicronut.com | **Inchangés** (anciennes versions). Mise à jour après les priorités 1 à 3. |
| Code source | Dépôt `Smartbnb`, dossier `lifemicronut-app/` |

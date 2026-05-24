# Stratégie de communication digitale — SmartBNB

> Document de référence interne. Sert de cadre à l'autopilote réseaux
> (`supabase/functions/social-autopilot`) et au pilotage de `reseaux.html`.

## 1. Objectifs

| Objectif | Indicateur | Cible 6 mois |
|---|---|---|
| Notoriété de marque | Abonnés cumulés (IG + FB + LinkedIn) | 8 000 |
| Génération de leads | Leads qualifiés / mois (table `leads`) | 60 |
| Autorité / crédibilité | Taux d'engagement moyen | > 4 % |
| Conversion | Coût par lead (pub) | < 120 MAD |

La communication ne vend pas un rêve : elle prouve un savoir-faire. Aucun
chiffre de rendement n'est annoncé au-delà des données de marché réelles.

## 2. Positionnement & ton de marque

- **Premium, éditorial, sobre** — cohérent avec le site (beige, Fraunces).
- **Pédagogue avant tout** : on explique, on ne survend pas.
- **Transparent** : chiffres réalistes, commission affichée (3 % / 17 %).
- **Rassurant** : on s'adresse à des gens qui investissent à distance.
- Bannir : superlatifs creux, « devenez riche », emojis décoratifs,
  promesses de rendement à deux chiffres.

## 3. Cibles (personas)

1. **Le MRE** — Marocain résidant en France, Belgique, Espagne, Canada,
   Golfe. 35-55 ans. Veut investir au pays sans s'y déplacer. Sensible au
   financement en devises et à la confiance. → cœur de cible.
2. **L'investisseur marocain urbain** — Casablanca / Rabat, cherche un
   placement plus rentable que le locatif classique.
3. **Le primo-investisseur étranger francophone** — séduit par Marrakech /
   Essaouira, a besoin d'être guidé de A à Z.
4. **Le propriétaire déjà équipé** — possède un bien mal exploité, cible
   de l'offre gestion 17 %.

## 4. Plateformes et rôle de chacune

| Réseau | Rôle | Cible | Auto |
|---|---|---|---|
| **Instagram** | Vitrine visuelle, biens, reels pédagogiques | 1, 3 | Oui |
| **Facebook** | Communauté MRE, groupes, audience 35-60 | 1, 4 | Oui |
| **LinkedIn** | Autorité, SCI, gros tickets, B2B | 2, 3 | Oui |
| **WhatsApp** | Conversion directe, diffusion à la base | tous | Assisté |
| **TikTok** | Acquisition jeune, pédagogie virale | 3 | Assisté |

## 5. Piliers de contenu

Quatre piliers, repris tels quels dans la rotation de l'autopilote :

1. **Conseils / pédagogie — 40 %** : LCD, SCI, fiscalité, financement MRE,
   choix du quartier. Construit l'autorité.
2. **Preuve & résultats — 25 %** : témoignages, revenus réels mesurés,
   avant/après ameublement.
3. **Marché & data — 20 %** : rendements par ville, tourisme, tendances.
4. **Biens / offres — 15 %** : nouveaux biens de la marketplace.

## 6. Cadence de publication

| Réseau | Posts | Stories | Reels/Vidéos |
|---|---|---|---|
| Instagram | 5-6 / sem | 4-5 / sem | 2-3 / sem |
| Facebook | 5-6 / sem | — | 1-2 / sem |
| LinkedIn | 3 / sem | — | — |
| TikTok | 3-4 / sem | — | (natif) |
| WhatsApp | 1 diffusion / sem | — | — |

## 7. Calendrier éditorial type (semaine)

| Jour | Pilier |
|---|---|
| Lundi | Conseil / pédagogie |
| Mardi | Nouveau bien |
| Mercredi | Marché & data |
| Jeudi | Témoignage |
| Vendredi | Nouveau bien |
| Samedi | Conseil / pédagogie |
| Dimanche | Marché & data |

→ Implémenté dans `social-autopilot` (tableau `plan`).

## 8. Tunnel de conversion

```
Contenu réseau  →  Profil / lien bio  →  Site (simulateur, marketplace)
   →  Formulaire diagnostic OU WhatsApp  →  Lead (Supabase)  →  Relance
```

- Chaque post renvoie vers une page utile : conseil → `services.html`,
  marché → `simulateur.html`, bien → `marketplace.html`.
- Le simulateur est l'aimant à leads n°1 : à mettre en avant 1 fois/semaine.
- WhatsApp = raccourci de conversion pour les indécis.

## 9. Formats prioritaires

- **Carrousels pédagogiques** (IG/LinkedIn) : 5-7 slides, fort engagement.
- **Reels / TikTok** : visite de bien 20 s, « 3 erreurs à éviter », data.
- **Posts chiffrés** : 1 statistique = 1 visuel sobre.
- **Témoignage** : citation + résultat mesuré + ville.
- **Stories** : coulisses, sondages, rappel simulateur.

## 10. KPIs & pilotage

- Suivi hebdo dans `reseaux.html` (file d'attente, statut).
- Revue mensuelle : reach, engagement, clics sortants, leads attribués
  (source dans la table `leads`), coût par lead.
- Règle : un format sous-performant 3 semaines de suite est remplacé.

## 11. Plan de lancement (90 jours)

- **Mois 1 — Fondations** : comptes optimisés, 30 contenus en file,
  autopilote actif, premiers carrousels pédagogiques. Croissance organique.
- **Mois 2 — Amplification** : test Meta Ads (retargeting visiteurs site +
  audiences MRE par pays), 2 reels/sem, première diffusion WhatsApp.
- **Mois 3 — Optimisation** : on double le budget sur les formats gagnants,
  partenariats / témoignages vidéo, reporting consolidé.

## 12. Budget indicatif mensuel

| Poste | Fourchette (MAD) |
|---|---|
| Publicité Meta (IG + FB) | 3 000 – 8 000 |
| Production visuelle / reels | 1 500 – 4 000 |
| Outils (planification, design) | 300 – 600 |
| **Total démarrage** | **~5 000 – 12 000** |

## 13. Prochaines évolutions possibles

- Légendes rédigées par l'API Claude (variété et personnalisation accrues).
- Génération automatique des visuels (templates dynamiques).
- Séquences WhatsApp Business API (relance de leads automatisée).
- Chaîne YouTube : visites longues + interviews investisseurs.

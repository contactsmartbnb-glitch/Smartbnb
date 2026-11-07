# Fiche de validation — Arbre de restitution (bilan Digestion)
_À relire et valider par Dr AICHE avant toute modification du code. Document généré à partir du code réel (regles_rapport_digestion.js), pas d'une analyse externe._
## Comment une piste « ressort » dans le rapport
Pour chaque piste, le moteur calcule :
> La piste est **retenue** si **au moins un signal FORT est vrai**, **OU** si le **nombre de signaux CONTRIBUTIFS atteint le SEUIL**.
`si (un_fort_vrai)  OU  (nb_contrib ≥ seuil)`
Autrement dit : **un seul FORT suffit** (le seuil ne s'applique qu'aux contributifs). C'est le point que l'analyse externe avait mal lu.

---

# ⬛ Décisions à trancher par Dr AICHE (vérifiées sur le code)

Rien de clinique ne sera modifié avant ta validation. Voici les **vrais** points (les erreurs de l'analyse externe sont écartées en bas).

**D1 — « Fermentation » et « Putréfaction » n'ont AUCUN signal fort.**
Elles ressortent dès **2 contributifs** (sur 5-6). Donc deux signaux faibles suffisent
(ex. putréfaction : « gaz parfois odorants » + « douleurs parfois soulagées »).
→ _Trop sensible ?_ Option : exiger un **couple signe + contexte** (méthode « combo » déjà
utilisée dans le bilan fatigue) au lieu de 2 contributifs quelconques.

**D2 — Questions posées mais jamais utilisées dans une piste** (orphelines, confirmées) :
`r_ippres` (anti-reflux inefficaces), `d_siege` (siège de la douleur), `r_ballreflux`, et quelques autres.
Pour chacune : soit **info pour ton PDF** (volontaire → on l'étiquette), soit **la brancher** sur une piste.
Deux branchements à fort intérêt clinique (à ton avis) :
- anti-reflux inefficaces / rebond → renforcer **hypochlorhydrie** ?
- douleur « en bas à droite » → renforcer **SIBO** (iléon terminal) ?

**D3 — La page « Transit et selles » est toujours ouverte**, même pour un motif non digestif
(ex. « Peau »). L'utilisateur voit alors une page quasi vide (1 seule question, Bristol).
→ La **conditionner à un motif digestif** ? (plus cohérent, moins anxiogène.)

**D4 — « Gaz soufrés (H₂S) » : seuil 1 + fort = soufre « souvent » OU « parfois ».**
Donc « parfois » seul fait déjà ressortir la piste. → _Trop sensible ?_
Option : « souvent » = fort, « parfois » = contributif, seuil 2.

**D5 — Échelles « Je ne sais pas » : incohérence entre bilans.**
Digestion : les 8 échelles de fréquence ont « Je ne sais pas ». Fatigue : **39 échelles, aucune**.
→ Ajouter « Je ne sais pas » aux échelles fatigue par cohérence ?

---

## ⚠️ Points où l'analyse externe (DeepSeek) se trompe — à NE PAS suivre

- **« Candidose jamais affichée si le motif est seulement Mycoses »** → **FAUX.**
  Le motif « Mycoses ou candidoses » est un signal **FORT**, et un seul fort suffit
  (règle `fort OU seuil`). DeepSeek a cru que forts et contributifs s'additionnent vers le
  seuil — ce n'est pas le cas.
- **Brancher la question `m_ipp_arret`** → **impossible** : cette question **n'existe pas** dans
  le questionnaire.
- **« forts déguisés en combos » (SIBO)** → exact, mais **sans effet** : le fort composé est
  redondant avec le seuil, ça ne crée aucun bug. À nettoyer pour la lisibilité un jour, pas urgent.

## ✅ Ce que DeepSeek a vu juste (et qui nourrit les décisions)
- Le champ **`combo`** (déjà présent en fatigue) **manque à digestion** → utile pour D1.
- Page `c_transit` toujours ouverte (D3), questions orphelines (D2).
- Blur glass sur les options (vrai coût mobile) → **déjà corrigé** côté UX.

---

# Table de vérité des 12 pistes (déclencheurs réels)

_Ci-dessous, pour chaque piste : ce qui la fait ressortir, traduit depuis le code en langage lisible.
Relis « FORTS » (chacun suffit) et « CONTRIBUTIFS » (il en faut `seuil`)._


## Fermentation des sucres  _(id: `fermentation`)_
**Ressort si :** un FORT vrai **ou** au moins **2** contributifs.

**Signaux FORTS :** _aucun_ → la piste ne peut ressortir que par le seuil de contributifs.

**Signaux CONTRIBUTIFS** (il en faut 2) :
- **Après quels aliments ou quels repas vos troubles apparaissent-ils ou augmentent-ils ?** → contient « Pain, pâtes, biscuits ou sucreries »
- **À quelle fréquence mangez-vous des produits sucrés (pâtisseries, sodas, chocolat, confiseries) ?** → « Plusieurs fois par semaine » / « Tous les jours »
- **Vos gaz ont-ils une odeur d'œuf pourri ou de soufre ?** → « Je n'ai que très peu ou pas de gaz » / « Odeur habituelle, pas particulièrement forte »
- **De quelle couleur sont vos selles le plus souvent ?** = « Plutôt claire »
- **Pourquoi faites-vous ce questionnaire ?** → contient « Constipation »

## Putréfaction des protéines  _(id: `putrefaction`)_
**Ressort si :** un FORT vrai **ou** au moins **2** contributifs.

**Signaux FORTS :** _aucun_ → la piste ne peut ressortir que par le seuil de contributifs.

**Signaux CONTRIBUTIFS** (il en faut 2) :
- **Après quels aliments ou quels repas vos troubles apparaissent-ils ou augmentent-ils ?** → contient « Viande, œufs ou fromages affinés »
- **À quelle fréquence mangez-vous de la viande rouge ou de la charcuterie ?** → « 3 à 6 fois par semaine » / « Tous les jours »
- **Vos gaz ont-ils une odeur d'œuf pourri ou de soufre ?** → « Oui, souvent » / « Parfois » / « Odeur forte, mais pas d'œuf pourri »
- **De quelle couleur sont vos selles le plus souvent ?** = « Plutôt foncée (brun foncé) »
- **Vos selles ont-elles souvent l'un de ces aspects ?** → « Elles collent à la cuvette ou demandent beaucoup de papier » / « Elles ont une odeur très forte »
- **Vos douleurs ou inconforts du ventre sont-ils soulagés quand vous allez à la selle ?** → « Oui, souvent soulagés » / « Parfois »

## Perte de diversité de la flore  _(id: `deficience`)_
**Ressort si :** un FORT vrai **ou** au moins **2** contributifs.

**Signaux FORTS** (chacun suffit à lui seul) :
- **Combien de cures d'antibiotiques avez-vous prises au cours des 5 dernières années ?** = « Plus de 5 »

**Signaux CONTRIBUTIFS** (il en faut 2) :
- **Combien de cures d'antibiotiques avez-vous prises au cours des 5 dernières années ?** → « 3 à 5 » / « Plus de 5 »
- **Vos troubles ont-ils commencé, ou nettement augmenté, après l'un de ces événements ?** → contient « Une cure d'antibiotiques »
- **Avez-vous l'impression de ne plus rien tolérer, et la liste des aliments qui vous gênent s'allonge-t-elle avec le temps ?** → « Oui, la liste s'allonge nettement » / « Oui, un peu »
- **Mon ventre réagit au stress, aux contrariétés, aux émotions ou au manque de sommeil** → Souvent / Toujours

## Pullulation du grêle (SIBO)  _(id: `sibo`)_
**Ressort si :** un FORT vrai **ou** au moins **2** contributifs.

**Signaux FORTS** (chacun suffit à lui seul) :
- _règle composée (1 combinaison de 2 signaux — voir note SIBO)_

**Signaux CONTRIBUTIFS** (il en faut 2) :
- **Quand vos ballonnements apparaissent-ils ?** → « Pendant le repas ou dans la demi-heure qui suit » / « Entre une demi-heure et une heure et demie après »
- **Avez-vous déjà pris des fibres en complément (inuline, gomme de guar, fibres en poudre…) ? Avec quel effet ?** → contient « Oui, j'ai eu plus de ballonnements ou de douleurs »
- **Avez-vous déjà eu une gastro-entérite sévère, une intoxication alimentaire ou une turista, même il y a plusieurs années ?** → « Oui, avec antibiotiques » / « Oui, sans antibiotiques »
- **Prenez-vous actuellement, ou avez-vous pris récemment, l'un de ces médicaments ?** → contient « Contre le reflux : oméprazole, pantoprazole, ésoméprazole… »

## Production de méthane  _(id: `sibo_methane`)_
**Ressort si :** un FORT vrai **ou** au moins **2** contributifs.

**Signaux FORTS** (chacun suffit à lui seul) :
- _règle composée (1 combinaison de 2 signaux — voir note SIBO)_

**Signaux CONTRIBUTIFS** (il en faut 2) :
- **Pourquoi faites-vous ce questionnaire ?** → contient « Constipation »
- **Quand vous êtes constipé(e), avez-vous aussi le ventre gonflé ?** → « Oui, souvent » / « Parfois »

## Gaz soufrés (H₂S)  _(id: `sibo_h2s`)_
**Ressort si :** un FORT vrai **ou** au moins **1** contributifs.

**Signaux FORTS** (chacun suffit à lui seul) :
- **Vos gaz ont-ils une odeur d'œuf pourri ou de soufre ?** → « Oui, souvent » / « Parfois »

**Signaux CONTRIBUTIFS** (il en faut 1) :
- **Vos gaz ont-ils une odeur d'œuf pourri ou de soufre ?** → « Oui, souvent » / « Parfois »
- **Après quels aliments ou quels repas vos troubles apparaissent-ils ou augmentent-ils ?** → contient « Légumineuses (lentilles, pois chiches), choux, oignon, ail, poireau, artichaut, asperges, pommes ou poires »

## Terrain fongique (Candida)  _(id: `candidose`)_
**Ressort si :** un FORT vrai **ou** au moins **2** contributifs.

**Signaux FORTS** (chacun suffit à lui seul) :
- **Pourquoi faites-vous ce questionnaire ?** → contient « Mycoses ou candidoses qui reviennent »
- **En dehors du ventre, avez-vous souvent, ou depuis longtemps, l'un de ces signes ?** → contient « Des candidoses ou infections qui reviennent (mycoses intimes, buccales, peau ou ongles, cystites, sinusites…) »

**Signaux CONTRIBUTIFS** (il en faut 2) :
- **Avez-vous des envies de sucré ? Si oui, à quel moment ?** → « Oui, surtout en fin d'après-midi ou le soir » / « Oui, à n'importe quel moment, sans horaire »
- **Je vais mieux quand je jeûne ou que je supprime les sucres, mais tout revient dès que je remange normalement** → Souvent / Toujours
- **Vos mycoses ou candidoses apparaissent-elles souvent après un traitement antibiotique ?** → « Oui, souvent » / « Parfois »
- **En dehors du ventre, avez-vous souvent, ou depuis longtemps, l'un de ces signes ?** → contient « Du mal à penser clairement ou à se concentrer (brouillard mental) »
- **En dehors du ventre, avez-vous souvent, ou depuis longtemps, l'un de ces signes ?** → contient « Une fatigue qui dure »

## Hyperperméabilité (leaky gut)  _(id: `leaky`)_
**Ressort si :** un FORT vrai **ou** au moins **2** contributifs.

**Signaux FORTS** (chacun suffit à lui seul) :
- **Avez-vous l'impression de ne plus rien tolérer, et la liste des aliments qui vous gênent s'allonge-t-elle avec le temps ?** = « Oui, la liste s'allonge nettement »

**Signaux CONTRIBUTIFS** (il en faut 2) :
- **En dehors du ventre, avez-vous souvent, ou depuis longtemps, l'un de ces signes ?** → contient « Une fatigue qui dure »
- **En dehors du ventre, avez-vous souvent, ou depuis longtemps, l'un de ces signes ?** → contient « Du mal à penser clairement ou à se concentrer (brouillard mental) »
- **En dehors du ventre, avez-vous souvent, ou depuis longtemps, l'un de ces signes ?** → contient « Des douleurs des articulations »
- **En dehors du ventre, avez-vous souvent, ou depuis longtemps, l'un de ces signes ?** → contient « Des allergies, ou une peau qui réagit (urticaire, eczéma, boutons) »
- **Après quels aliments ou quels repas vos troubles apparaissent-ils ou augmentent-ils ?** → contient « Pain, pâtes, biscuits ou sucreries »
- **Prenez-vous actuellement, ou avez-vous pris récemment, l'un de ces médicaments ?** → contient « Anti-inflammatoires ou aspirine, régulièrement (ibuprofène, kétoprofène, naproxène, diclofénac…) »

## Digestion haute insuffisante  _(id: `hypochlorhydrie`)_
**Ressort si :** un FORT vrai **ou** au moins **2** contributifs.

**Signaux FORTS :** _aucun_ → la piste ne peut ressortir que par le seuil de contributifs.

**Signaux CONTRIBUTIFS** (il en faut 2) :
- **Une lourdeur à l'estomac, même après avoir seulement bu un verre d'eau** → Souvent / Toujours
- **Le soir, j'ai encore l'impression d'avoir mon repas de midi dans l'estomac** → Souvent / Toujours
- **Après un plat de pâtes, l'impression d'avoir avalé une brique** → Souvent / Toujours
- **Vos selles ont-elles souvent l'un de ces aspects ?** → contient « On y voit des morceaux d'aliments non digérés (par exemple des petits pois) »
- **Depuis combien de temps prenez-vous ce médicament contre le reflux ?** → « 6 mois à 2 ans » / « Plus de 2 ans » / « Plus de 10 ans »
- **Comment mangez-vous le plus souvent ?** = « Je mange vite et je mâche peu »

## Digestion des graisses  _(id: `graisses`)_
**Ressort si :** un FORT vrai **ou** au moins **2** contributifs.

**Signaux FORTS** (chacun suffit à lui seul) :
- **Vos selles ont-elles souvent l'un de ces aspects ?** → contient « Elles sont grasses, brillantes ou luisantes »

**Signaux CONTRIBUTIFS** (il en faut 2) :
- **Vos selles ont-elles souvent l'un de ces aspects ?** → contient « Elles sont grasses, brillantes ou luisantes »
- **Après quels aliments ou quels repas vos troubles apparaissent-ils ou augmentent-ils ?** → contient « Plats gras, fritures ou jaune d'œuf »
- **Avez-vous eu l'une de ces interventions ?** → contient « Ablation de la vésicule biliaire »
- **Pourquoi faites-vous ce questionnaire ?** → contient « Digestion difficile : lourdeurs, digestion lente, nausées après les repas »

## Intolérance au lactose  _(id: `lactose`)_
**Ressort si :** un FORT vrai **ou** au moins **2** contributifs.

**Signaux FORTS** (chacun suffit à lui seul) :
- **Tolérez-vous certains produits laitiers mieux que d'autres ?** = « Je tolère les fromages à pâte dure affinés (comté, parmesan, emmental) mais pas le lait »

**Signaux CONTRIBUTIFS** (il en faut 2) :
- **Après quels aliments ou quels repas vos troubles apparaissent-ils ou augmentent-ils ?** → contient « Lait, yaourts, fromages frais ou glaces »
- **Tolérez-vous certains produits laitiers mieux que d'autres ?** = « Je ne tolère aucun laitage »

## Intestin irritable & stress  _(id: `sii`)_
**Ressort si :** un FORT vrai **ou** au moins **2** contributifs.

**Signaux FORTS** (chacun suffit à lui seul) :
- **Vos douleurs ou inconforts du ventre sont-ils soulagés quand vous allez à la selle ?** = « Oui, souvent soulagés »

**Signaux CONTRIBUTIFS** (il en faut 2) :
- **Vos douleurs ou inconforts du ventre sont-ils soulagés quand vous allez à la selle ?** → « Oui, souvent soulagés » / « Parfois »
- **Vos troubles digestifs s'améliorent-ils le week-end ou en vacances ?** → « Oui, nettement » / « Oui, un peu »
- **Mon ventre réagit au stress, aux contrariétés, aux émotions ou au manque de sommeil** → Souvent / Toujours
- **Avez-vous souvent l'un de ces signes ?** → au moins une de « Des angoisses ou des ruminations » / « Une humeur basse, une perte d'élan ou de plaisir » / « Des difficultés à vous endormir »
- **Pourquoi faites-vous ce questionnaire ?** → contient « Transit qui alterne entre constipation et diarrhée »

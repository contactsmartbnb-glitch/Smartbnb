/* ============================================================
   Mehdia — Bilan Santé Global (test "expertise MAPS")
   ------------------------------------------------------------
   Un formulaire d'anamnèse type 1ère consultation micronutrition.
   30 questions stratégiquement calibrées sur les 7 piliers + axe
   hormonal. En sortie : profil multi-piliers (3 priorités),
   analyses biologiques recommandées, 3 actions concrètes.

   Source connaissance : DU MAPS 2026 (cours/01 à 08).
   ============================================================ */

var GLOBAL_QUESTIONS = [

  /* === IDENTITÉ === */
  { id: 'sexe', type: 'single', section: 'identité', question: 'Sexe biologique',
    options: [
      { value: 'femme', label: 'Femme' },
      { value: 'homme', label: 'Homme' }
    ] },
  { id: 'age', type: 'number', section: 'identité', question: 'Âge', min: 16, max: 90, placeholder: 'ex : 47' },
  { id: 'situationF', type: 'single', section: 'identité', question: 'Situation hormonale (si femme)',
    showIf: function (a) { return a.sexe === 'femme'; },
    options: [
      { value: 'cycle',     label: 'J\'ai mes règles régulièrement' },
      { value: 'irregulier',label: 'Cycles irréguliers' },
      { value: 'contracep', label: 'Sous contraception hormonale (pilule, stérilet hormonal)' },
      { value: 'enceinte',  label: 'Enceinte ou en post-partum' },
      { value: 'peri',      label: 'En périménopause (cycles qui changent)' },
      { value: 'menop',     label: 'Ménopause confirmée' },
      { value: 'autre',     label: 'Autre / je ne sais pas' }
    ] },

  /* === MODE DE VIE === */
  { id: 'sommeil', type: 'single', section: 'mode-de-vie', question: 'Comment décririez-vous votre sommeil ?',
    options: [
      { value: 'reparateur', label: 'Réparateur, je me lève en forme' },
      { value: 'moyen',      label: 'Correct mais perfectible' },
      { value: 'fragmente',  label: 'Fragmenté, réveils nocturnes' },
      { value: 'epuise',     label: 'Épuisé(e) au réveil malgré les heures' }
    ] },
  { id: 'stress', type: 'scale', section: 'mode-de-vie', question: 'Niveau de stress chronique au quotidien',
    scaleLabels: ['Faible','Modéré','Élevé','Permanent'] },
  { id: 'sport', type: 'single', section: 'mode-de-vie', question: 'Activité physique par semaine',
    options: [
      { value: 'aucune', label: 'Aucune ou rare' },
      { value: 'peu',    label: '1-2 fois/sem' },
      { value: 'moyen',  label: '3-4 fois/sem' },
      { value: 'beaucoup', label: '5 fois ou plus' }
    ] },
  { id: 'alim', type: 'single', section: 'mode-de-vie', question: 'Votre alimentation au quotidien',
    options: [
      { value: 'mediterraneenne', label: 'Méditerranéenne (légumes, poissons, huile d\'olive)' },
      { value: 'variee',          label: 'Variée mais perfectible' },
      { value: 'occidentale',     label: 'Industrielle / Western (pain blanc, plats préparés, sucres)' },
      { value: 'restrictive',     label: 'Restrictive (vegan strict, sans gluten, éviction multiple)' }
    ] },
  { id: 'poisson_gras', type: 'single', section: 'mode-de-vie', question: 'Poisson gras (saumon, sardines, maquereau) par semaine',
    options: [
      { value: '0', label: 'Jamais ou très rare' },
      { value: '1', label: '1 fois' },
      { value: '2', label: '2 fois' },
      { value: '3', label: '3 fois ou plus' }
    ] },
  { id: 'medic', type: 'multi', section: 'mode-de-vie', question: 'Prenez-vous l\'un de ces médicaments au long cours ?',
    options: [
      { value: 'ipp',         label: 'IPP (anti-acides : Inexium, Mopral…)' },
      { value: 'pilule',      label: 'Pilule contraceptive (femmes)' },
      { value: 'statines',    label: 'Statines (cholestérol)' },
      { value: 'metformine',  label: 'Metformine (diabète)' },
      { value: 'corticoides', label: 'Corticoïdes' },
      { value: 'ains',        label: 'AINS / anti-inflammatoires réguliers' },
      { value: 'antidepresseurs', label: 'Antidépresseurs' },
      { value: 'aucun',       label: 'Aucun', exclusive: true }
    ] },

  /* === TUBE DIGESTIF === */
  { id: 'ballonnements', type: 'single', section: 'digestif', question: 'Ballonnements après les repas',
    options: [
      { value: 'jamais',  label: 'Jamais' },
      { value: 'rapide',  label: 'Souvent, rapides (< 30 min)' },
      { value: 'lent',    label: 'Souvent, plus tard (1-3h après)' },
      { value: 'variable',label: 'Variables, sans pattern clair' }
    ] },
  { id: 'transit', type: 'single', section: 'digestif', question: 'Votre transit intestinal',
    options: [
      { value: 'regulier', label: 'Régulier' },
      { value: 'constipe', label: 'Constipation fréquente' },
      { value: 'diarrhee', label: 'Diarrhées fréquentes' },
      { value: 'alterne',  label: 'Alterne constipation/diarrhée' }
    ] },
  { id: 'rgo', type: 'single', section: 'digestif', question: 'Reflux gastrique / brûlures d\'estomac',
    options: [
      { value: 'non',     label: 'Non' },
      { value: 'parfois', label: 'Parfois' },
      { value: 'souvent', label: 'Souvent / je prends des IPP' }
    ] },
  { id: 'antibio_enfance', type: 'single', section: 'digestif', question: 'Antibiothérapies répétées (surtout enfance) ?',
    options: [
      { value: 'non',    label: 'Non / rare' },
      { value: 'modere', label: 'Quelques cures' },
      { value: 'oui',    label: 'Oui, de nombreuses cures' }
    ] },

  /* === ÉNERGIE / MITOCHONDRIE === */
  { id: 'fatigue', type: 'scale', section: 'energie', question: 'Niveau de fatigue chronique',
    scaleLabels: ['Aucune','Légère','Modérée','Profonde'] },
  { id: 'brouillard', type: 'scale', section: 'energie', question: 'Brouillard mental / troubles de concentration',
    scaleLabels: ['Jamais','Parfois','Souvent','Très souvent'] },
  { id: 'recup', type: 'single', section: 'energie', question: 'Récupération après effort ou maladie',
    options: [
      { value: 'rapide', label: 'Rapide' },
      { value: 'normal', label: 'Normale' },
      { value: 'lente',  label: 'Lente' },
      { value: 'tres_lente', label: 'Très lente, je traîne' }
    ] },

  /* === ACIDES GRAS === */
  { id: 'peau_sec', type: 'single', section: 'acides-gras', question: 'Peau sèche, eczéma, dermatites',
    options: [
      { value: 'non',     label: 'Non' },
      { value: 'parfois', label: 'Parfois' },
      { value: 'chronique', label: 'Chronique' }
    ] },
  { id: 'douleurs_artic', type: 'scale', section: 'acides-gras', question: 'Douleurs articulaires / raideur matinale',
    scaleLabels: ['Aucune','Légère','Modérée','Importante'] },

  /* === DÉTOX / FOIE === */
  { id: 'cafe_alcool', type: 'single', section: 'detox', question: 'Sensibilité au café ou à l\'alcool',
    options: [
      { value: 'normale',  label: 'Normale' },
      { value: 'sensible', label: 'Plus sensible qu\'avant' },
      { value: 'tres_sensible', label: 'Très sensible (effet long, lourd)' }
    ] },
  { id: 'parfums', type: 'single', section: 'detox', question: 'Hypersensibilité aux parfums, solvants, essence',
    options: [
      { value: 'non',     label: 'Non' },
      { value: 'parfois', label: 'Parfois' },
      { value: 'oui',     label: 'Oui, marquée' }
    ] },
  { id: 'intolerances', type: 'multi', section: 'detox', question: 'Intolérances alimentaires connues',
    options: [
      { value: 'gluten',  label: 'Gluten / blé' },
      { value: 'lactose', label: 'Lactose / laitages' },
      { value: 'fodmap',  label: 'FODMAP (oignon, ail, légumineuses)' },
      { value: 'multi',   label: 'Multiples / s\'ajoutent avec le temps' },
      { value: 'aucune',  label: 'Aucune', exclusive: true }
    ] },

  /* === IMMUNITÉ === */
  { id: 'infections', type: 'single', section: 'immunite', question: 'Infections par an (rhumes, ORL, urinaires)',
    options: [
      { value: 'rare',   label: 'Rarement' },
      { value: 'normal', label: '1-2 fois' },
      { value: 'sup',    label: '3-4 fois' },
      { value: 'tres',   label: 'Plus de 5 fois' }
    ] },
  { id: 'atopie', type: 'multi', section: 'immunite', question: 'Terrain atopique / inflammatoire',
    options: [
      { value: 'pollen',  label: 'Allergie pollens / rhinite' },
      { value: 'eczema',  label: 'Eczéma' },
      { value: 'asthme',  label: 'Asthme' },
      { value: 'autoimmune', label: 'Maladie auto-immune connue' },
      { value: 'aucun',   label: 'Aucun', exclusive: true }
    ] },

  /* === GLUCOSE / INSULINE === */
  { id: 'fringales', type: 'scale', section: 'glucose', question: 'Fringales sucrées en fin d\'après-midi',
    scaleLabels: ['Jamais','Parfois','Souvent','Très souvent'] },
  { id: 'coup_barre', type: 'scale', section: 'glucose', question: 'Coup de fatigue 30-60 min après les repas',
    scaleLabels: ['Jamais','Parfois','Souvent','Très souvent'] },
  { id: 'ventre', type: 'single', section: 'glucose', question: 'Prise de poids préférentielle',
    options: [
      { value: 'non',    label: 'Je ne prends pas de poids' },
      { value: 'ventre', label: 'Au ventre (silhouette "pomme")' },
      { value: 'hanches',label: 'Aux hanches/cuisses (silhouette "poire")' },
      { value: 'partout',label: 'Partout uniformément' }
    ] },
  { id: 'reveil_nuit', type: 'single', section: 'glucose', question: 'Réveils nocturnes vers 3-4h du matin',
    options: [
      { value: 'jamais',  label: 'Jamais' },
      { value: 'parfois', label: 'Parfois' },
      { value: 'souvent', label: 'Souvent' }
    ] },

  /* === MINÉRAUX / VITAMINES === */
  { id: 'crampes', type: 'single', section: 'mineraux', question: 'Crampes, fourmillements, paupière qui saute',
    options: [
      { value: 'non',    label: 'Non' },
      { value: 'parfois', label: 'Parfois' },
      { value: 'souvent', label: 'Souvent' }
    ] },
  { id: 'cheveux_ongles', type: 'multi', section: 'mineraux', question: 'Cheveux / ongles / muqueuses',
    options: [
      { value: 'chute',   label: 'Chute de cheveux marquée' },
      { value: 'ongles',  label: 'Ongles cassants / taches blanches' },
      { value: 'levres',  label: 'Lèvres fissurées / perlèche' },
      { value: 'langue',  label: 'Langue lisse ou douloureuse' },
      { value: 'aucun',   label: 'Rien à signaler', exclusive: true }
    ] },
  { id: 'frilosite', type: 'scale', section: 'mineraux', question: 'Frilosité (mains/pieds froids)',
    scaleLabels: ['Jamais','Parfois','Souvent','Très souvent'] },

  /* === HORMONES FÉMININES (conditionnel) === */
  { id: 'spm', type: 'scale', section: 'hormones', question: 'Syndrome prémenstruel (douleurs, sautes d\'humeur, seins gonflés)',
    showIf: function (a) { return a.sexe === 'femme' && (a.situationF === 'cycle' || a.situationF === 'irregulier' || a.situationF === 'contracep'); },
    scaleLabels: ['Aucun','Léger','Modéré','Important'] },
  { id: 'bouffees', type: 'scale', section: 'hormones', question: 'Bouffées de chaleur / sueurs nocturnes',
    showIf: function (a) { return a.sexe === 'femme' && (a.situationF === 'peri' || a.situationF === 'menop' || a.situationF === 'irregulier'); },
    scaleLabels: ['Jamais','Parfois','Souvent','Très souvent'] },
  { id: 'libido_h', type: 'single', section: 'hormones', question: 'Libido ces derniers mois',
    options: [
      { value: 'bonne',  label: 'Bonne' },
      { value: 'baisse', label: 'En baisse' },
      { value: 'absente',label: 'Quasi absente' }
    ] },
  { id: 'humeur_h', type: 'scale', section: 'hormones', question: 'Anxiété / sautes d\'humeur nouvelles ou aggravées',
    scaleLabels: ['Jamais','Parfois','Souvent','Très souvent'] },

  /* === EMAIL FIN === */
  { id: 'email', type: 'email', section: 'final', question: 'Où recevoir votre bilan global ?',
    hint: 'Anonyme : votre email seul, aucun nom. Sert à vous renvoyer votre profil.',
    placeholder: 'votre@email.fr' }
];

/* ============================================================
   MOTEUR D'ANALYSE — Calcule un score par pilier, identifie les
   3 piliers les plus en souffrance, et synthétise un profil.
   ============================================================ */

function scorePilier(answers, piliers) {
  var scores = {
    digestif: 0, energie: 0, ag: 0, detox: 0,
    immunite: 0, glucose: 0, mineraux: 0, hormones: 0
  };
  function add(p, n) { scores[p] = (scores[p] || 0) + n; }

  /* DIGESTIF */
  if (answers.ballonnements === 'rapide')  add('digestif', 3);
  if (answers.ballonnements === 'lent')    add('digestif', 2);
  if (answers.ballonnements === 'variable') add('digestif', 1);
  if (answers.transit !== 'regulier')      add('digestif', 2);
  if (answers.rgo === 'souvent')           add('digestif', 2);
  if (answers.rgo === 'parfois')           add('digestif', 1);
  if (answers.antibio_enfance === 'oui')   add('digestif', 2);
  if (answers.antibio_enfance === 'modere') add('digestif', 1);
  if ((answers.intolerances||[]).length > 0 && (answers.intolerances||[]).indexOf('aucune') < 0) add('digestif', 2);

  /* ÉNERGIE */
  if (answers.fatigue >= 2)     add('energie', answers.fatigue);
  if (answers.brouillard >= 2)  add('energie', answers.brouillard);
  if (answers.recup === 'tres_lente') add('energie', 3);
  if (answers.recup === 'lente') add('energie', 2);
  if (answers.sommeil === 'epuise') add('energie', 2);

  /* ACIDES GRAS */
  if (answers.peau_sec === 'chronique') add('ag', 2);
  if (answers.peau_sec === 'parfois')   add('ag', 1);
  if (answers.douleurs_artic >= 2)      add('ag', answers.douleurs_artic);
  if (answers.poisson_gras === '0')     add('ag', 2);
  if (answers.poisson_gras === '1')     add('ag', 1);
  if (answers.alim === 'occidentale')   add('ag', 1);

  /* DÉTOX */
  if (answers.cafe_alcool === 'tres_sensible') add('detox', 3);
  if (answers.cafe_alcool === 'sensible')      add('detox', 1);
  if (answers.parfums === 'oui')               add('detox', 2);
  if (answers.parfums === 'parfois')           add('detox', 1);
  if ((answers.intolerances||[]).indexOf('multi') > -1) add('detox', 2);
  if ((answers.medic||[]).filter(function(m){return m!=='aucun';}).length >= 2) add('detox', 1);

  /* IMMUNITÉ */
  if (answers.infections === 'sup')  add('immunite', 2);
  if (answers.infections === 'tres') add('immunite', 3);
  if ((answers.atopie||[]).length > 0 && (answers.atopie||[]).indexOf('aucun') < 0) add('immunite', 2);
  if ((answers.atopie||[]).indexOf('autoimmune') > -1) add('immunite', 2);

  /* GLUCOSE */
  if (answers.fringales >= 2)   add('glucose', answers.fringales);
  if (answers.coup_barre >= 2)  add('glucose', answers.coup_barre);
  if (answers.ventre === 'ventre') add('glucose', 3);
  if (answers.reveil_nuit === 'souvent') add('glucose', 2);
  if (answers.reveil_nuit === 'parfois') add('glucose', 1);
  if (answers.alim === 'occidentale') add('glucose', 1);

  /* MINÉRAUX */
  if (answers.crampes === 'souvent') add('mineraux', 2);
  if (answers.crampes === 'parfois') add('mineraux', 1);
  var co = answers.cheveux_ongles || [];
  if (co.indexOf('aucun') < 0) add('mineraux', Math.min(co.length, 3));
  if (answers.frilosite >= 2) add('mineraux', answers.frilosite);
  if (answers.alim === 'restrictive') add('mineraux', 2);
  if (answers.alim === 'occidentale') add('mineraux', 1);
  if ((answers.medic||[]).indexOf('pilule') > -1) add('mineraux', 1);
  if ((answers.medic||[]).indexOf('ipp') > -1) add('mineraux', 1);

  /* HORMONES (si applicable) */
  if (answers.sexe === 'femme') {
    if (answers.spm >= 2) add('hormones', answers.spm);
    if (answers.bouffees >= 2) add('hormones', answers.bouffees);
    if (answers.libido_h === 'baisse')  add('hormones', 1);
    if (answers.libido_h === 'absente') add('hormones', 2);
    if (answers.humeur_h >= 2) add('hormones', answers.humeur_h);
    if (answers.situationF === 'peri') add('hormones', 2);
    if (answers.situationF === 'irregulier') add('hormones', 1);
  } else {
    if (answers.libido_h === 'absente') add('hormones', 2);
    if (answers.libido_h === 'baisse')  add('hormones', 1);
  }

  return scores;
}

var PILIER_LABELS = {
  digestif: { name: 'Tube digestif & microbiote', slug: 'tube-digestif' },
  energie:  { name: 'Énergie & mitochondrie',    slug: 'energie' },
  ag:       { name: 'Acides gras',               slug: 'acides-gras' },
  detox:    { name: 'Foie & détoxication',       slug: 'detox' },
  immunite: { name: 'Immunité & inflammation',   slug: 'immunite' },
  glucose:  { name: 'Glucose & insuline',        slug: 'glucose-insuline' },
  mineraux: { name: 'Minéraux & vitamines',      slug: 'mineraux-vitamines' },
  hormones: { name: 'Hormones',                  slug: 'hormones-femme' }
};

function buildAnalyses(answers, top3Piliers) {
  var seen = {};
  var list = [];
  function add(k, n, w, priority) {
    if (seen[n]) return;
    seen[n] = true;
    list.push({ name: n, why: w, pilier: k, priority: priority || 2 });
  }

  /* Bilan de base — TOUJOURS demandé */
  add('base', 'NFS + ferritine + CRP', 'Base de tout bilan : statut martial, inflammation, terrain hématologique.', 1);
  add('base', 'TSH + T4 libre + T3 libre', 'Thyroïde — souvent en cause dans la fatigue, le poids, l\'humeur.', 1);
  add('base', 'Vitamine D 25(OH)D', 'Régule plus de 200 gènes (immunité, os, hormones). Carence massive en France.', 1);
  add('base', 'Vitamine B12 active + folates + homocystéine', 'Cycle de méthylation : énergie, ADN, neurologie. Cible homocystéine < 10 µmol/L.', 1);

  /* Selon les 3 piliers prioritaires */
  top3Piliers.forEach(function (p, i) {
    var pri = i === 0 ? 1 : 2;
    if (p === 'digestif') {
      add(p, 'Calprotectine fécale', 'Discrimine inflammation intestinale d\'un trouble fonctionnel.', pri);
      add(p, 'LBP sérique (LPS-Binding Protein)', 'Marqueur d\'endotoxémie et d\'intégrité de la barrière intestinale.', pri);
      if (answers.ballonnements === 'rapide') add(p, 'Test respiratoire SIBO (lactulose ou glucose)', 'Ballonnements rapides évoquent une pullulation bactérienne du grêle.', pri);
      if ((answers.intolerances||[]).indexOf('gluten') > -1) add(p, 'Anticorps anti-transglutaminase + IgA totales', 'Éliminer une maladie cœliaque avant tout régime sans gluten.', pri);
    }
    if (p === 'energie') {
      add(p, 'Magnésium érythrocytaire', 'Le dosage sérique sous-estime la carence ; cofacteur ATP.', pri);
      add(p, 'Index Oméga-3 érythrocytaire', 'Fluidité des membranes mitochondriales (cible ≥ 7 %).', pri);
      if ((answers.medic||[]).indexOf('statines') > -1) add(p, 'CoQ10 plasmatique (ubiquinol)', 'Les statines réduisent significativement le CoQ10.', pri);
    }
    if (p === 'ag') {
      add(p, 'Profil acides gras érythrocytaires complet', 'Ratio AA/EPA, ratio ω6/ω3, Index Oméga-3 — reflète 3 mois d\'alimentation.', pri);
      add(p, 'CRP ultra-sensible (hsCRP)', 'Inflammation chronique de bas grade (cible < 1 mg/L).', pri);
    }
    if (p === 'detox') {
      add(p, 'Bilan hépatique complet (ASAT, ALAT, GGT, PAL, bilirubine)', 'Évalue le fonctionnement du foie en première intention.', pri);
      add(p, 'Polymorphisme MTHFR (C677T, A1298C)', 'Détermine si vous avez besoin de folate méthylé (5-MTHF).', pri);
      if (answers.parfums === 'oui' || (answers.medic||[]).length >= 3)
        add(p, 'pH urinaire (3 mesures/jour pendant 3 jours)', 'Évalue la Phase III d\'élimination rénale (cible 6,5-7,0).', pri);
    }
    if (p === 'immunite') {
      add(p, 'Zinc plasmatique + ratio Zn/Cu', 'Cofacteur immunitaire central.', pri);
      if ((answers.atopie||[]).indexOf('autoimmune') > -1 || answers.douleurs_artic >= 2)
        add(p, 'Anticorps anti-nucléaires (AAN) + facteur rhumatoïde', 'Première ligne de dépistage auto-immun.', pri);
    }
    if (p === 'glucose') {
      add(p, 'Glycémie + insulinémie à jeun → HOMA-IR', 'Détecte la résistance à l\'insuline AVANT le pré-diabète.', pri);
      add(p, 'HbA1c', 'Glycation moyenne sur 3 mois (cible optimale < 5,3 %).', pri);
      add(p, 'Triglycérides + HDL → ratio TG/HDL', 'Excellent indice de sensibilité à l\'insuline (cible < 1,5).', pri);
    }
    if (p === 'mineraux') {
      add(p, 'Magnésium érythrocytaire', 'Carence sous-estimée par le dosage sérique standard.', pri);
      add(p, 'Zinc plasmatique', 'Cofacteur enzymatique majeur, déficit fréquent en cas de fatigue/chute cheveux.', pri);
      if ((answers.medic||[]).indexOf('pilule') > -1)
        add(p, 'Vitamine B6 (P5P)', 'Déplétion fréquente sous contraception œstroprogestative.', pri);
    }
    if (p === 'hormones') {
      if (answers.sexe === 'femme') {
        if (answers.age < 40) {
          add(p, 'Estradiol + Progestérone (2ᵉ partie de cycle)', 'Évalue le ratio E2/Prog.', pri);
          if ((answers.cheveux_ongles||[]).indexOf('chute') > -1 && answers.ventre === 'ventre')
            add(p, 'Testostérone + SHBG + glycémie/insuline', 'Bilan orienté SOPK.', pri);
        } else if (answers.age >= 40 && answers.age < 55) {
          add(p, 'FSH + Estradiol + Progestérone (en 2ᵉ partie de cycle)', 'Bilan de transition périménopausique.', pri);
          add(p, 'Cortisol salivaire 4 points + DHEA-S', 'Axe surrénalien (prend le relais des ovaires).', pri);
        } else {
          add(p, 'FSH (confirme ménopause si > 30 mUI/L)', 'Confirmation du statut ménopausique.', pri);
          add(p, 'Ostéodensitométrie (DEXA)', 'Prévention osseuse post-ménopause.', pri);
        }
      } else {
        add(p, 'Testostérone totale + SHBG + Estradiol', 'Bilan andropause / équilibre hormonal masculin.', pri);
      }
    }
  });
  list.sort(function (a, b) { return a.priority - b.priority; });
  return list;
}

function buildProfileText(answers, scores, top3) {
  var name = PILIER_LABELS[top3[0]].name;
  var second = PILIER_LABELS[top3[1]].name;
  var third = PILIER_LABELS[top3[2]].name;

  var profile = '';
  profile += '<p><strong>Vos 3 piliers prioritaires :</strong> <span style="color:var(--green-d)">' + name + '</span>, puis ' + second + ', puis ' + third + '.</p>';

  /* Narration courte par pilier prioritaire */
  var nar = {
    digestif: 'Vos signaux digestifs (ballonnements, transit, ou intolérances) suggèrent un déséquilibre de barrière intestinale ou de microbiote. C\'est souvent <em>la</em> porte d\'entrée à travailler en premier — beaucoup d\'autres dérèglements s\'amplifient quand l\'intestin va mal.',
    energie:  'Vos centrales énergétiques cellulaires (mitochondries) semblent surchargées. Fatigue, brouillard mental, récupération lente : autant de signes que l\'ATP ne suit plus.',
    ag:       'Votre équilibre acides gras semble penché vers le pro-inflammatoire. Les membranes cellulaires rigides freinent la signalisation hormonale et entretiennent une inflammation chronique silencieuse.',
    detox:    'Votre système de détoxication hépatique semble débordé. Sensibilité au café/alcool/parfums, intolérances multiples : autant de signaux d\'une Phase II saturée.',
    immunite: 'Votre immunité semble dysrégulée — soit trop active (allergies, auto-immunité), soit insuffisante (infections récurrentes). L\'inflammation chronique est probable.',
    glucose:  'Votre métabolisme du sucre montre des signes d\'insulino-résistance débutante (fringales, coups de barre, ventre qui s\'installe). C\'est largement réversible si on agit tôt.',
    mineraux: 'Plusieurs carences en cofacteurs (minéraux, vitamines) semblent installées. Vos enzymes ne fonctionnent qu\'à moitié — d\'où la fatigue diffuse.',
    hormones: 'Votre équilibre hormonal mérite attention : ' + (answers.sexe === 'femme' ? 'transition, cycle, axe surrénalien' : 'axe testostérone, sensibilité insuline') + ' à explorer.'
  };
  profile += '<p style="margin-top:.8rem">' + nar[top3[0]] + '</p>';
  return profile;
}

function buildActions(answers, top3) {
  var actions = [];

  /* 3 actions prioritaires basées sur le pilier #1 et le contexte */
  var p1 = top3[0];

  if (p1 === 'digestif') {
    actions.push({ icon: 'sprout', title: 'Calmer puis nourrir votre intestin',
      body: 'Mâcher consciemment (~20 fois par bouchée). Réintroduire des fibres prébiotiques <em>progressivement</em> (légumes cuits d\'abord, légumineuses très lentement si SIBO suspect). Polyphénols quotidiens : baies, thé vert, cacao non sucré.' });
  } else if (p1 === 'energie') {
    actions.push({ icon: 'flame', title: 'Recharger vos mitochondries',
      body: 'Magnésium bisglycinate 300-400 mg le soir. Index oméga-3 à viser (sardines/maquereau 3×/sem ou supplément 1 g EPA+DHA). Exposition matinale à la lumière 10-15 min. Bouger 30 min/j, intensité modérée.' });
  } else if (p1 === 'ag') {
    actions.push({ icon: 'sparkle', title: 'Rééquilibrer vos huiles',
      body: 'Bannir margarines/huiles hydrogénées/tournesol/maïs. Cuisson uniquement à l\'olive ou au coco. Assaisonnement cru : colza ou lin. Petits poissons gras 3×/sem (sardines, hareng, maquereau).' });
  } else if (p1 === 'detox') {
    actions.push({ icon: 'leaf', title: 'Soulager votre foie',
      body: 'Crucifères 3×/sem (brocoli, chou, chou-fleur — soutien Phase II). Eau citronnée le matin (alcalinisant urinaire). Réduire alcool/café/médicaments non essentiels. Glycine 1-3 g/j en soutien conjugaison.' });
  } else if (p1 === 'immunite') {
    actions.push({ icon: 'pulse', title: 'Apaiser le terrain inflammatoire',
      body: 'Vitamine D 2000-4000 UI/j (hiver). Zinc 15 mg/j si infections. Curcuma + poivre + huile (synergie biodisponibilité). Réduire sucres ajoutés et huiles ω6.' });
  } else if (p1 === 'glucose') {
    actions.push({ icon: 'flame', title: 'Stabiliser votre glycémie',
      body: 'Ordre des aliments : crudités/protéines d\'abord, glucides en dernier. Pas de glucides isolés (jus, fruits seuls). Marche 10-15 min après chaque repas. Sommeil 7-8 h non négociable (le manque de sommeil <em>crée</em> l\'insulino-résistance).' });
  } else if (p1 === 'mineraux') {
    actions.push({ icon: 'sparkle', title: 'Renourrir le terrain',
      body: 'Bilan biologique d\'abord (ferritine, B12, D, Mg érythrocytaire). Diversifier l\'assiette : noix du Brésil (sélénium, 1-2/j), graines de courge (zinc), eaux magnésiennes (Hépar, Rozana). Pas d\'auto-supplémentation à l\'aveugle.' });
  } else if (p1 === 'hormones') {
    actions.push({ icon: 'flower', title: 'Soutenir l\'équilibre hormonal',
      body: answers.sexe === 'femme' && (answers.situationF === 'peri' || answers.situationF === 'menop')
        ? 'Phytothérapie ciblée (sauge pour bouffées, gattilier pour cycles). Soja fermenté quotidien (tempeh, miso). Soutien surrénalien : magnésium, B5, sommeil régulier. Mouvement quotidien.'
        : 'Réguler le stress (cortisol vole la progestérone). Sommeil régulier (les hormones se régénèrent la nuit). Réduire perturbateurs endocriniens (plastiques, parfums, cosmétiques chargés).'
    });
  }

  /* Action 2 : toujours sommeil-stress (transverse) */
  if (answers.stress >= 2 || answers.sommeil === 'fragmente' || answers.sommeil === 'epuise') {
    actions.push({ icon: 'leaf', title: 'Restaurer le sommeil et baisser le stress',
      body: 'Routine de coucher fixe (22h-23h idéal). Pas d\'écran 1 h avant. Magnésium 300 mg le soir. Cohérence cardiaque 5 min × 3/j. Limiter caféine après 14 h.' });
  } else {
    actions.push({ icon: 'leaf', title: 'Protéger vos bonnes habitudes',
      body: 'Sommeil régulier (même week-end). Mouvement quotidien. Gestion du stress proactive (cohérence cardiaque, méditation, nature).' });
  }

  /* Action 3 : alimentation socle */
  actions.push({ icon: 'sprout', title: 'Le socle alimentaire micronutritionnel',
    body: 'Modèle méditerranéen : 2/3 d\'assiette en légumes variés et colorés. Petits poissons gras 2-3×/sem. Légumineuses, oléagineux (poignée/j). Huile d\'olive + colza. Limiter ultra-transformés, sucres ajoutés, huiles raffinées.' });

  return actions.slice(0, 3);
}

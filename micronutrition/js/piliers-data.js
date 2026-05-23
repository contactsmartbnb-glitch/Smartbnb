/* ============================================================
   Mehdia — Quizz des 7 piliers + Hormones (Module Endocrino)
   ------------------------------------------------------------
   Étend l'objet TOPICS défini dans quiz-data.js.
   Chaque pilier propose un quizz "Où en es-tu ?" qui débouche
   sur un profil + des analyses biologiques utiles à demander
   à son médecin.

   Source : DU MAPS 2026 (Pr V. Castronovo, Pr S. Merran,
   Dr A. Lucas, Dr S. Balon-Perin). Fiches synthétiques dans
   micronutrition/cours/.
   ============================================================ */
(function () {

  /* Helper : compte les réponses "souvent/très souvent" et "oui" */
  function countPositive(answers, fields) {
    var n = 0;
    fields.forEach(function (f) {
      var v = answers[f];
      if (v === 'oui' || v === 'souvent' || v === 'tres_souvent') n++;
      else if (typeof v === 'number' && v >= 2) n++;
    });
    return n;
  }

  /* ===================== PILIER 1 — Tube digestif ===================== */
  TOPICS['tube-digestif'] = {
    slug: 'tube-digestif', audience: 'femme', icon: 'sprout',
    name: 'Tube digestif & microbiote',
    eyebrow: 'Pilier 1 · Tube digestif',
    metaTitle: 'Bilan Tube digestif & microbiote — Mehdia',
    blurb: 'Ballonnements, transit, fatigue après les repas : où en est votre digestion ?',
    questions: [
      { id: 'ballonnements', type: 'scale', question: 'Avez-vous des ballonnements après les repas ?', scaleLabels: SCALE_FREQ },
      { id: 'vitesse_ballon', type: 'single', question: 'Si oui, à quel moment apparaissent-ils ?',
        options: [
          { value: 'rapide', label: 'Très rapidement (<30 min)' },
          { value: 'lent',   label: 'Plus tard (1-3 h après)' },
          { value: 'na',     label: 'Pas concerné(e)' }
        ] },
      { id: 'transit', type: 'single', question: 'Comment décririez-vous votre transit ?',
        options: [
          { value: 'regulier', label: 'Régulier, sans souci' },
          { value: 'constipe', label: 'Constipation fréquente' },
          { value: 'diarrhee', label: 'Diarrhées fréquentes' },
          { value: 'alterne',  label: 'Alterne constipation/diarrhée' }
        ] },
      { id: 'fatigue_repas', type: 'scale', question: 'Ressentez-vous de la fatigue après les repas ?', scaleLabels: SCALE_FREQ },
      { id: 'douleurs_abdo', type: 'scale', question: 'Avez-vous des douleurs abdominales récurrentes ?', scaleLabels: SCALE_FREQ },
      { id: 'rgo', type: 'single', question: 'Reflux gastrique, brûlures d\'estomac ?',
        options: [{value:'jamais',label:'Jamais'},{value:'parfois',label:'Parfois'},{value:'chronique',label:'Chronique / sous IPP'}] },
      { id: 'antibio', type: 'single', question: 'Avez-vous reçu des antibiotiques répétés (surtout enfance) ?',
        options: [{value:'non',label:'Non / rare'},{value:'modere',label:'Quelques cures'},{value:'oui',label:'Oui, de nombreuses cures'}] },
      { id: 'stress', type: 'scale', question: 'Vivez-vous un stress chronique au quotidien ?', scaleLabels: SCALE_FREQ },
      { id: 'mastication', type: 'single', question: 'Mâchez-vous correctement vos aliments ?',
        options: [{value:'bien',label:'Oui, je prends mon temps'},{value:'moyen',label:'Moyennement'},{value:'mal',label:'Je mange vite'}] },
      { id: 'intolerances', type: 'multi', question: 'Avez-vous des intolérances alimentaires connues ?',
        options: [
          { value: 'gluten',   label: 'Gluten / blé' },
          { value: 'lactose',  label: 'Lactose / produits laitiers' },
          { value: 'fodmap',   label: 'FODMAP (oignon, ail, légumineuses…)' },
          { value: 'autre',    label: 'Autres' },
          { value: 'aucune',   label: 'Aucune', exclusive: true }
        ] }
    ],
    analyses: function (a) {
      var list = [];
      function add(n, w) { list.push({ name: n, why: w }); }
      add('LBP sérique (LPS-Binding Protein)', 'Marqueur d\'endotoxémie et d\'intégrité de la barrière intestinale.');
      add('Calprotectine fécale', 'Discrimine inflammation intestinale (MICI, colite) d\'un trouble fonctionnel.');
      add('Métagénomique fécale (microbiote)', 'Composition du microbiote : ratio Firmicutes/Bacteroidetes, présence d\'Akkermansia, F. prausnitzii.');
      add('Vitamine B12 + ferritine', 'Malabsorption fréquente en cas de dysbiose ou de prise d\'IPP au long cours.');
      add('Vitamine D 25(OH)D', 'Régule l\'immunité intestinale et la barrière épithéliale.');
      if (a.vitesse_ballon === 'rapide') add('Test respiratoire SIBO (lactulose ou glucose)', 'Suspicion de pullulation bactérienne du grêle (ballonnements rapides).');
      if (a.intolerances && a.intolerances.indexOf('gluten') > -1) add('Anticorps anti-transglutaminase (tTG) + IgA totales', 'Éliminer une maladie cœliaque avant tout régime sans gluten.');
      if (a.rgo === 'chronique') add('Helicobacter pylori (recherche fécale ou respiratoire)', 'Cause fréquente de gastrite et reflux chronique.');
      if (a.intolerances && a.intolerances.length > 0 && a.intolerances.indexOf('aucune') === -1) add('IgG alimentaires ciblés (caséine, β-lactoglobuline, gluten)', 'Baromètre de perméabilité intestinale.');
      return list;
    },
    disclaimer: 'Ces analyses sont des pistes basées sur vos symptômes — la décision revient toujours à votre médecin. La micronutrition ne remplace pas un avis médical.'
  };

  /* ===================== PILIER 2 — Énergie / Mitochondrie ===================== */
  TOPICS['energie'] = {
    slug: 'energie', audience: 'femme', icon: 'flame',
    name: 'Énergie & mitochondrie',
    eyebrow: 'Pilier 2 · Énergie',
    metaTitle: 'Bilan Énergie & mitochondrie — Mehdia',
    blurb: 'Fatigue chronique, brouillard mental, récupération lente : vos centrales énergétiques tournent-elles à plein régime ?',
    questions: [
      { id: 'fatigue', type: 'scale', question: 'À quel point vous sentez-vous fatigué(e) au quotidien ?', scaleLabels: ['Pas du tout','Légèrement','Modérément','Profondément'] },
      { id: 'reveil', type: 'single', question: 'Comment vous sentez-vous au réveil ?',
        options: [{value:'frais',label:'Frais et reposé(e)'},{value:'moyen',label:'Moyennement'},{value:'epuise',label:'Déjà épuisé(e)'}] },
      { id: 'effort', type: 'scale', question: 'Êtes-vous essoufflé(e) ou intolérant(e) à l\'effort ?', scaleLabels: SCALE_FREQ },
      { id: 'concentration', type: 'scale', question: 'Avez-vous du brouillard mental ou des troubles de concentration ?', scaleLabels: SCALE_FREQ },
      { id: 'recup', type: 'single', question: 'Récupérez-vous facilement après un effort ou une maladie ?',
        options: [{value:'oui',label:'Oui, facilement'},{value:'lent',label:'Plutôt lentement'},{value:'tres_lent',label:'Très lentement'}] },
      { id: 'sensibilite', type: 'scale', question: 'Êtes-vous très sensible au bruit, à la lumière, aux stimuli ?', scaleLabels: SCALE_FREQ },
      { id: 'crampes', type: 'scale', question: 'Avez-vous des crampes ou douleurs musculaires sans effort ?', scaleLabels: SCALE_FREQ },
      { id: 'infections', type: 'single', question: 'Tombez-vous souvent malade (rhumes, infections) ?',
        options: [{value:'rare',label:'Rarement'},{value:'parfois',label:'2-3 fois/an'},{value:'souvent',label:'Plus de 4 fois/an'}] },
      { id: 'sommeil', type: 'scale', question: 'Votre sommeil est-il réparateur ?', scaleLabels: ['Très','Plutôt','Peu','Pas du tout'] },
      { id: 'statines', type: 'single', question: 'Prenez-vous des statines (cholestérol) ?',
        options: [{value:'non',label:'Non'},{value:'oui',label:'Oui'}] }
    ],
    analyses: function (a) {
      var list = [];
      function add(n, w) { list.push({ name: n, why: w }); }
      add('Ferritine + saturation transferrine', 'Cofacteur des Complexes mitochondriaux I/II ; carence très fréquente chez la femme.');
      add('Vitamine B12 active (holotranscobalamine)', 'Synthèse de la carnitine et de l\'ADN ; carence sous-estimée.');
      add('Vitamine D 25(OH)D', 'Régule la biogenèse mitochondriale et l\'immunité.');
      add('Magnésium érythrocytaire', 'Cofacteur de l\'ATP ; le dosage sérique sous-estime la carence.');
      add('TSH, T4 libre, T3 libre, T3 reverse', 'Une hypothyroïdie fonctionnelle peut mimer l\'épuisement mitochondrial.');
      add('Homocystéine', 'Marqueur de méthylation (cofacteur de la synthèse de carnitine).');
      add('Index Oméga-3 érythrocytaire', 'Reflète la fluidité des membranes mitochondriales (cible ≥ 7 %).');
      if (a.statines === 'oui') add('CoQ10 plasmatique (ubiquinol)', 'Les statines diminuent significativement le CoQ10 mitochondrial.');
      if (a.fatigue >= 2 && a.recup === 'tres_lent') add('Sérologie EBV et profil viral chronique', 'Une fatigue post-infectieuse persistante peut révéler une dysfonction mitochondriale acquise.');
      return list;
    },
    disclaimer: 'Ces examens sont des pistes : votre médecin priorisera selon votre contexte personnel.'
  };

  /* ===================== PILIER 3 — Acides gras ===================== */
  TOPICS['acides-gras'] = {
    slug: 'acides-gras', audience: 'femme', icon: 'sparkle',
    name: 'Acides gras (oméga 3/6/9)',
    eyebrow: 'Pilier 3 · Acides gras',
    metaTitle: 'Bilan Acides gras — Mehdia',
    blurb: 'Peau sèche, douleurs articulaires, humeur instable : votre équilibre oméga-3 / oméga-6 est-il bon ?',
    questions: [
      { id: 'peau', type: 'scale', question: 'Avez-vous la peau sèche, eczéma, dermatite ?', scaleLabels: SCALE_FREQ },
      { id: 'articulations', type: 'scale', question: 'Vos articulations sont-elles raides ou douloureuses ?', scaleLabels: SCALE_FREQ },
      { id: 'humeur', type: 'single', question: 'Comment décririez-vous votre humeur ?',
        options: [{value:'stable',label:'Stable'},{value:'variable',label:'Variable'},{value:'depressive',label:'Tendance dépressive'}] },
      { id: 'concentration_ag', type: 'scale', question: 'Manquez-vous de concentration ou de mémoire ?', scaleLabels: SCALE_FREQ },
      { id: 'poisson', type: 'single', question: 'Combien de fois mangez-vous du poisson gras par semaine (saumon, sardines, maquereau) ?',
        options: [
          { value: 'jamais', label: 'Jamais' },
          { value: 'rare',   label: '1 fois par mois' },
          { value: 'moyen',  label: '1 à 2 fois par semaine' },
          { value: 'bien',   label: '3 fois ou plus par semaine' }
        ] },
      { id: 'huiles', type: 'multi', question: 'Quelles huiles utilisez-vous principalement ?',
        options: [
          { value: 'olive',  label: 'Olive (vierge)' },
          { value: 'colza',  label: 'Colza' },
          { value: 'lin',    label: 'Lin / cameline' },
          { value: 'tournesol', label: 'Tournesol' },
          { value: 'mais',   label: 'Maïs' },
          { value: 'palme',  label: 'Palme (transformée)' }
        ] },
      { id: 'ains', type: 'single', question: 'Prenez-vous des anti-inflammatoires (AINS, ibuprofène…) ?',
        options: [{value:'jamais',label:'Jamais'},{value:'parfois',label:'Occasionnellement'},{value:'regulier',label:'Régulièrement'}] },
      { id: 'libido', type: 'single', question: 'Avez-vous noté une baisse de libido ?',
        options: [{value:'non',label:'Non'},{value:'oui',label:'Oui'}] },
      { id: 'cardio_fam', type: 'single', question: 'Antécédents cardiovasculaires dans votre famille proche ?',
        options: [{value:'non',label:'Non'},{value:'oui',label:'Oui'}] }
    ],
    analyses: function (a) {
      var list = [];
      function add(n, w) { list.push({ name: n, why: w }); }
      add('Profil acides gras érythrocytaires (Index Oméga-3)', 'Reflète l\'équilibre oméga-3/oméga-6 sur 3 mois (cible ≥ 7 %).');
      add('Bilan lipidique complet (cholestérol, HDL, LDL, triglycérides)', 'Évalue le terrain cardiovasculaire.');
      add('CRP ultra-sensible (hsCRP)', 'Mesure l\'inflammation chronique de bas grade (cible < 1 mg/L).');
      add('Apolipoprotéines A1 et B', 'Discriminent mieux le risque cardiovasculaire que LDL/HDL seuls.');
      if (a.peau >= 2 || a.articulations >= 2) add('Vitamine D 25(OH)D', 'Modulateur central de l\'inflammation peau/articulations.');
      if (a.cardio_fam === 'oui') add('Lipoprotéine(a)', 'Facteur génétique de risque cardiovasculaire à dépister une fois.');
      if (a.huiles && a.huiles.indexOf('palme') > -1) add('Acide arachidonique érythrocytaire', 'Excès d\'AG saturés transformés = inflammation chronique.');
      return list;
    },
    disclaimer: 'Le profil acides gras érythrocytaires est rarement remboursé. Demandez son utilité à votre médecin.'
  };

  /* ===================== PILIER 4 — Détox / Foie ===================== */
  TOPICS['detox'] = {
    slug: 'detox', audience: 'femme', icon: 'leaf',
    name: 'Foie, détoxication & méthylation',
    eyebrow: 'Pilier 4 · Détox',
    metaTitle: 'Bilan Détox & méthylation — Mehdia',
    blurb: 'Fatigue, sensibilité au café/alcool, intolérances : votre foie est-il dépassé ?',
    questions: [
      { id: 'fatigue_detox', type: 'scale', question: 'À quel point vous sentez-vous fatigué(e) ?', scaleLabels: SCALE_DEFAULT },
      { id: 'cafe', type: 'single', question: 'Comment réagissez-vous à la caféine ?',
        options: [{value:'normal',label:'Normalement'},{value:'sensible',label:'Effet long (>6h)'},{value:'tres',label:'Très sensible / palpitations'}] },
      { id: 'alcool', type: 'single', question: 'Et à l\'alcool (même petite quantité) ?',
        options: [{value:'normal',label:'Bien toléré'},{value:'lourd',label:'Sensation lourde le lendemain'},{value:'tres',label:'Très mal toléré'}] },
      { id: 'parfums', type: 'scale', question: 'Êtes-vous hypersensible aux parfums, solvants, essence ?', scaleLabels: SCALE_FREQ },
      { id: 'intol_detox', type: 'scale', question: 'Avez-vous des intolérances alimentaires multiples ?', scaleLabels: SCALE_FREQ },
      { id: 'brouillard', type: 'scale', question: 'Avez-vous du brouillard mental ?', scaleLabels: SCALE_FREQ },
      { id: 'sudations', type: 'scale', question: 'Sudations nocturnes ou réveils transpirants ?', scaleLabels: SCALE_FREQ },
      { id: 'migraines', type: 'scale', question: 'Migraines ou maux de tête fréquents ?', scaleLabels: SCALE_FREQ },
      { id: 'medic', type: 'multi', question: 'Prenez-vous régulièrement l\'un de ces médicaments ?',
        options: [
          { value: 'paracetamol', label: 'Paracétamol fréquent' },
          { value: 'pilule',      label: 'Pilule contraceptive' },
          { value: 'ipp',         label: 'IPP (anti-acides)' },
          { value: 'statines',    label: 'Statines' },
          { value: 'aucun',       label: 'Aucun', exclusive: true }
        ] },
      { id: 'exposition', type: 'multi', question: 'Êtes-vous exposé(e) à l\'une de ces situations ?',
        options: [
          { value: 'tabac', label: 'Tabac actif ou passif' },
          { value: 'pesticides', label: 'Pesticides pro / agricoles' },
          { value: 'pollution', label: 'Pollution urbaine forte' },
          { value: 'amalgames', label: 'Amalgames dentaires anciens (mercure)' },
          { value: 'aucune', label: 'Aucune', exclusive: true }
        ] }
    ],
    analyses: function (a) {
      var list = [];
      function add(n, w) { list.push({ name: n, why: w }); }
      add('Homocystéine plasmatique', 'Marqueur clé de la méthylation et de la trans-sulfuration (cible < 10 µmol/L).');
      add('Bilan hépatique (ASAT, ALAT, GGT, PAL, bilirubine)', 'Évalue le fonctionnement de base du foie.');
      add('Ferritine + CRP', 'Équilibre du fer : ni trop bas (↓ Phase I), ni trop haut (Fenton).');
      add('Vitamines B9 (folates) et B12 active', 'Cofacteurs centraux du cycle de méthylation.');
      add('Polymorphisme MTHFR (C677T, A1298C)', 'Détermine la disponibilité du méthyl-folate (recommandé si homocystéine élevée).');
      add('pH urinaire (3 mesures/jour pendant 3 jours)', 'Évalue la Phase III d\'élimination rénale (cible 6,5-7,0).');
      if (a.exposition && (a.exposition.indexOf('amalgames') > -1 || a.exposition.indexOf('pesticides') > -1)) add('Bilan métaux capillaires (Pb, Hg, Cd, As)', 'En cas d\'exposition chronique aux métaux lourds.');
      if (a.medic && a.medic.indexOf('pilule') > -1) add('Métabolites œstrogènes urinaires (2-OH / 16α-OH)', 'Évalue l\'élimination hépatique des œstrogènes.');
      return list;
    },
    disclaimer: 'L\'évaluation des métaux lourds doit être interprétée par un médecin formé en micronutrition.'
  };

  /* ===================== PILIER 5 — Immunité & inflammation ===================== */
  TOPICS['immunite'] = {
    slug: 'immunite', audience: 'femme', icon: 'pulse',
    name: 'Immunité & inflammation',
    eyebrow: 'Pilier 5 · Immunité',
    metaTitle: 'Bilan Immunité & inflammation — Mehdia',
    blurb: 'Infections à répétition, allergies, douleurs chroniques : votre immunité est-elle équilibrée ?',
    questions: [
      { id: 'infections_freq', type: 'single', question: 'Combien d\'infections (rhumes, ORL, urinaires) avez-vous par an ?',
        options: [
          { value: 'rare',   label: 'Moins d\'une' },
          { value: 'normal', label: '1 à 2' },
          { value: 'sup',    label: '3 ou plus' },
          { value: 'tres',   label: 'Plus de 5' }
        ] },
      { id: 'allergies', type: 'multi', question: 'Souffrez-vous d\'allergies ou de troubles atopiques ?',
        options: [
          { value: 'pollen', label: 'Rhinite allergique / pollens' },
          { value: 'eczema', label: 'Eczéma' },
          { value: 'asthme', label: 'Asthme' },
          { value: 'alim',   label: 'Allergies alimentaires' },
          { value: 'aucun',  label: 'Aucun', exclusive: true }
        ] },
      { id: 'douleurs_inflam', type: 'scale', question: 'Douleurs articulaires ou musculaires diffuses ?', scaleLabels: SCALE_FREQ },
      { id: 'aphtes', type: 'scale', question: 'Aphtes, herpès récidivants ?', scaleLabels: SCALE_FREQ },
      { id: 'fatigue_post', type: 'scale', question: 'Êtes-vous très fatigué(e) après une infection ?', scaleLabels: SCALE_FREQ },
      { id: 'ains_freq', type: 'single', question: 'Prenez-vous des anti-inflammatoires (AINS) régulièrement ?',
        options: [{value:'jamais',label:'Jamais'},{value:'parfois',label:'Parfois'},{value:'regulier',label:'Régulièrement'}] },
      { id: 'auto_immune', type: 'single', question: 'Avez-vous une maladie auto-immune connue ?',
        options: [{value:'non',label:'Non'},{value:'famille',label:'Dans la famille'},{value:'oui',label:'Oui'}] },
      { id: 'antecedent', type: 'multi', question: 'Antécédents personnels ou familiaux ?',
        options: [
          { value: 'fausses_couches', label: 'Fausses couches répétées' },
          { value: 'thromboses', label: 'Thromboses' },
          { value: 'aucun', label: 'Aucun', exclusive: true }
        ] },
      { id: 'soleil', type: 'single', question: 'Vous exposez-vous régulièrement au soleil (été) ?',
        options: [{value:'oui',label:'Oui, régulièrement'},{value:'parfois',label:'Parfois'},{value:'non',label:'Très peu'}] }
    ],
    analyses: function (a) {
      var list = [];
      function add(n, w) { list.push({ name: n, why: w }); }
      add('CRP ultra-sensible (hsCRP)', 'Inflammation chronique silencieuse (cible < 1 mg/L).');
      add('Hémogramme complet (NFS) + formule', 'Évalue lymphocytes, neutrophiles, plaquettes ; rapport neutro/lympho (NLR).');
      add('Vitamine D 25(OH)D', 'Régule plus de 200 gènes immunitaires (cible 50-80 ng/mL).');
      add('Ferritine', 'Aussi reflet d\'inflammation (interpréter avec CRP).');
      add('Zinc plasmatique', 'Cofacteur immunitaire universel (Th1, NK, barrière).');
      if (a.allergies && a.allergies.indexOf('aucun') === -1) add('IgE totales + RAST ciblés', 'Confirme et oriente le terrain atopique.');
      if (a.douleurs_inflam >= 2) add('Anticorps anti-nucléaires (AAN) + facteur rhumatoïde', 'Première ligne de dépistage auto-immun.');
      if (a.antecedent && a.antecedent.indexOf('fausses_couches') > -1) add('Bilan anticorps anti-phospholipides', 'Pour évaluer un syndrome inflammatoire / thrombophilie.');
      return list;
    },
    disclaimer: 'Le diagnostic auto-immun nécessite un avis rhumatologique ou immunologique.'
  };

  /* ===================== PILIER 6 — Glucose & insuline ===================== */
  TOPICS['glucose-insuline'] = {
    slug: 'glucose-insuline', audience: 'femme', icon: 'flame',
    name: 'Glucose & insuline',
    eyebrow: 'Pilier 6 · Glucose-Insuline',
    metaTitle: 'Bilan Glucose & insuline — Mehdia',
    blurb: 'Fringales sucrées, fatigue après les repas, ventre qui s\'arrondit : votre métabolisme du sucre est-il équilibré ?',
    questions: [
      { id: 'fringales', type: 'scale', question: 'Avez-vous des fringales sucrées en fin d\'après-midi ?', scaleLabels: SCALE_FREQ },
      { id: 'coup_barre', type: 'scale', question: 'Coup de fatigue 30-60 min après un repas ?', scaleLabels: SCALE_FREQ },
      { id: 'ventre', type: 'single', question: 'Où prenez-vous principalement du poids ?',
        options: [
          { value: 'aucun',  label: 'Je ne prends pas de poids' },
          { value: 'ventre', label: 'Au niveau du ventre (silhouette "pomme")' },
          { value: 'hanches',label: 'Au niveau des hanches/cuisses' },
          { value: 'partout',label: 'Partout uniformément' }
        ] },
      { id: 'tour_taille', type: 'single', question: 'Votre tour de taille est-il supérieur à 80 cm (femme) ou 94 cm (homme) ?',
        options: [{value:'non',label:'Non'},{value:'oui',label:'Oui'},{value:'sais_pas',label:'Je ne sais pas'}] },
      { id: 'fam_diab', type: 'single', question: 'Antécédents familiaux de diabète ou obésité ?',
        options: [{value:'non',label:'Non'},{value:'oui',label:'Oui'}] },
      { id: 'reveil_nuit', type: 'scale', question: 'Réveils nocturnes entre 3 h et 4 h du matin ?', scaleLabels: SCALE_FREQ },
      { id: 'sopk', type: 'single', question: 'Femmes : cycles irréguliers, acné, pilosité excessive ?',
        options: [{value:'non',label:'Non / pas concerné(e)'},{value:'parfois',label:'Quelques signes'},{value:'oui',label:'Oui, plusieurs signes'}] },
      { id: 'sucre_cache', type: 'single', question: 'Vos petit-déjeuners contiennent-ils céréales/pain blanc/jus de fruit/yaourt sucré ?',
        options: [{value:'rare',label:'Rarement'},{value:'parfois',label:'Parfois'},{value:'quotidien',label:'Quotidiennement'}] },
      { id: 'sport_freq', type: 'single', question: 'Combien de fois par semaine bougez-vous (marche rapide, sport) ?',
        options: [
          { value: 'jamais', label: 'Jamais' },
          { value: 'peu',    label: '1-2 fois' },
          { value: 'moyen',  label: '3-4 fois' },
          { value: 'bien',   label: '5 fois ou plus' }
        ] }
    ],
    analyses: function (a) {
      var list = [];
      function add(n, w) { list.push({ name: n, why: w }); }
      add('Glycémie à jeun', 'Cible optimale 0,80-0,95 g/L (≠ norme labo < 1,10).');
      add('Insulinémie à jeun', 'Permet de calculer HOMA-IR (cible < 1,5).');
      add('HbA1c', 'Glycation moyenne sur 3 mois (cible optimale < 5,3 %).');
      add('Bilan lipidique avec triglycérides et HDL', 'Le rapport TG/HDL < 1,5 est un excellent indice de sensibilité insuline.');
      add('Bilan hépatique (ALAT, ASAT, GGT)', 'Stéatose hépatique = signe précoce d\'insulino-résistance.');
      if (a.sopk === 'oui') add('Testostérone totale + SHBG + LH/FSH', 'Bilan SOPK (syndrome des ovaires polykystiques).');
      if (a.ventre === 'ventre' || a.tour_taille === 'oui') add('Échographie abdominale (recherche stéatose)', 'Foie gras non alcoolique très lié à l\'insulino-résistance.');
      if (a.coup_barre >= 2) add('HGPO + insuline (75g de glucose, 2 heures)', 'Détecte une hypoglycémie réactionnelle ou un pré-diabète.');
      return list;
    },
    disclaimer: 'Le diagnostic de pré-diabète ou de SOPK relève de votre médecin traitant.'
  };

  /* ===================== PILIER 7 — Minéraux & vitamines ===================== */
  TOPICS['mineraux-vitamines'] = {
    slug: 'mineraux-vitamines', audience: 'femme', icon: 'sparkle',
    name: 'Minéraux, vitamines & oligoéléments',
    eyebrow: 'Pilier 7 · Cofacteurs',
    metaTitle: 'Bilan Minéraux & vitamines — Mehdia',
    blurb: 'Fatigue inexpliquée, crampes, ongles cassants : les cofacteurs invisibles qui font tourner votre organisme.',
    questions: [
      { id: 'fatigue_min', type: 'scale', question: 'Fatigue chronique sans cause évidente ?', scaleLabels: SCALE_DEFAULT },
      { id: 'crampes_min', type: 'scale', question: 'Crampes, fourmillements, paupière qui saute ?', scaleLabels: SCALE_FREQ },
      { id: 'cheveux', type: 'single', question: 'Vos cheveux chutent-ils plus que normalement ?',
        options: [{value:'non',label:'Non'},{value:'leger',label:'Légèrement'},{value:'oui',label:'Significativement'}] },
      { id: 'ongles', type: 'single', question: 'Ongles cassants, mous, taches blanches ?',
        options: [{value:'non',label:'Non'},{value:'oui',label:'Oui'}] },
      { id: 'lievres', type: 'single', question: 'Lèvres fissurées, perlèche, langue lisse/douloureuse ?',
        options: [{value:'non',label:'Non'},{value:'oui',label:'Oui'}] },
      { id: 'froid', type: 'scale', question: 'Frilosité (mains/pieds froids) ?', scaleLabels: SCALE_FREQ },
      { id: 'regles_abondantes', type: 'single', question: 'Femmes : règles abondantes ou très fréquentes ?',
        options: [{value:'na',label:'Pas concerné(e)'},{value:'non',label:'Non'},{value:'oui',label:'Oui'}] },
      { id: 'alimentation', type: 'single', question: 'Comment évalueriez-vous votre alimentation ?',
        options: [
          { value: 'variee',  label: 'Très variée (légumes, poissons, oléagineux)' },
          { value: 'moyen',   label: 'Moyennement variée' },
          { value: 'pauvre',  label: 'Plutôt monotone / transformée' }
        ] },
      { id: 'medic_min', type: 'multi', question: 'Prenez-vous l\'un de ces médicaments au long cours ?',
        options: [
          { value: 'pilule',  label: 'Pilule contraceptive' },
          { value: 'ipp',     label: 'IPP (anti-acides)' },
          { value: 'statines',label: 'Statines' },
          { value: 'metformine', label: 'Metformine' },
          { value: 'cortico', label: 'Corticoïdes' },
          { value: 'aucun',   label: 'Aucun', exclusive: true }
        ] },
      { id: 'regime', type: 'single', question: 'Suivez-vous un régime particulier ?',
        options: [
          { value: 'omnivore', label: 'Omnivore varié' },
          { value: 'vegetarien', label: 'Végétarien' },
          { value: 'vegan',    label: 'Végan' }
        ] }
    ],
    analyses: function (a) {
      var list = [];
      function add(n, w) { list.push({ name: n, why: w }); }
      add('Ferritine + CRP', 'Statut martial (lire avec l\'inflammation).');
      add('Vitamine D 25(OH)D', 'Cible 50-80 ng/mL — carence très répandue en France.');
      add('Vitamine B12 active (holotranscobalamine) + folates', 'Méthylation, ADN, neurologie.');
      add('Homocystéine', 'Marqueur intégré du statut B9/B12/B6.');
      add('Magnésium érythrocytaire', 'Le dosage sérique sous-estime largement la carence.');
      add('Zinc plasmatique + ratio Zn/Cu', 'Équilibre des oligoéléments structurels.');
      if (a.regime === 'vegan' || a.regime === 'vegetarien') add('Iode urinaire + sélénium plasmatique', 'Axes thyroïdiens souvent fragilisés en régime végétal.');
      if (a.medic_min && a.medic_min.indexOf('aucun') === -1) add('Calcium ionisé + vitamine K2', 'Selon le médicament — risque d\'épuisement osseux.');
      if (a.regles_abondantes === 'oui') add('Recherche d\'hyperménorrhée + bilan martial complet', 'Cause #1 de carence en fer chez la femme.');
      return list;
    },
    disclaimer: 'Supplémenter sans bilan préalable peut nuire (excès de fer, sélénium, vitamine A).'
  };

  /* ===================== Module — Hormones féminines ===================== */
  TOPICS['hormones-femme'] = {
    slug: 'hormones-femme', audience: 'femme', icon: 'flower',
    name: 'Hormones féminines',
    eyebrow: 'Module · Endocrinologie',
    metaTitle: 'Bilan Hormones féminines — Mehdia',
    blurb: 'Cycle, périménopause, ménopause : où en est votre équilibre hormonal selon votre tranche d\'âge ?',
    questions: [
      { id: 'age_h', type: 'number', question: 'Quel âge avez-vous ?', min: 18, max: 80, hint: 'Le quizz s\'adapte selon votre tranche d\'âge.', placeholder: 'ex : 47' },
      { id: 'cycles', type: 'single', question: 'Comment sont vos cycles ces 6 derniers mois ?',
        options: [
          { value: 'reguliers', label: 'Réguliers (26-32 jours)' },
          { value: 'courts',    label: 'Plus courts qu\'avant (<26j)' },
          { value: 'longs',     label: 'Plus longs (>35j) ou irréguliers' },
          { value: 'absents',   label: 'Absents depuis plus d\'un an' },
          { value: 'na',        label: 'Pas concernée (contraception hormonale, hystérectomie…)' }
        ] },
      { id: 'spm', type: 'scale', question: 'Syndrome prémenstruel (douleurs, sautes d\'humeur, seins gonflés) ?', scaleLabels: SCALE_DEFAULT },
      { id: 'bouffees', type: 'scale', question: 'Bouffées de chaleur ?', scaleLabels: SCALE_FREQ },
      { id: 'sueurs', type: 'scale', question: 'Sueurs nocturnes ?', scaleLabels: SCALE_FREQ },
      { id: 'insomnie', type: 'single', question: 'Réveils nocturnes (notamment vers 3-4 h) ?',
        options: [{value:'jamais',label:'Jamais'},{value:'parfois',label:'Parfois'},{value:'souvent',label:'Souvent'}] },
      { id: 'humeur_h', type: 'scale', question: 'Sautes d\'humeur ou anxiété nouvelle ?', scaleLabels: SCALE_FREQ },
      { id: 'libido_h', type: 'single', question: 'Comment est votre libido ces derniers mois ?',
        options: [{value:'bonne',label:'Bonne'},{value:'baisse',label:'En baisse'},{value:'absente',label:'Quasi absente'}] },
      { id: 'cheveux_h', type: 'single', question: 'Chute de cheveux accélérée récemment ?',
        options: [{value:'non',label:'Non'},{value:'oui',label:'Oui'}] },
      { id: 'secheresse', type: 'single', question: 'Sécheresse (peau, vagin, muqueuses) ?',
        options: [{value:'non',label:'Non'},{value:'oui',label:'Oui'}] },
      { id: 'poids_vent', type: 'single', question: 'Prise de poids récente, surtout au ventre ?',
        options: [{value:'non',label:'Non'},{value:'oui',label:'Oui'}] },
      { id: 'fatigue_h', type: 'scale', question: 'Fatigue persistante, brouillard mental ?', scaleLabels: SCALE_FREQ }
    ],
    analyses: function (a) {
      var list = [];
      function add(n, w) { list.push({ name: n, why: w }); }
      add('TSH, T4 libre, T3 libre', 'La thyroïde mime souvent les troubles hormonaux ; cible TSH < 2 et fT3 haut-tiers.');
      add('Ferritine + B12 + vitamine D', 'Cofacteurs essentiels du métabolisme hormonal.');
      add('Estradiol (E2) + Progestérone', 'Profil hormonal de base (idéalement en 2ᵉ partie de cycle).');

      if (a.age_h < 40) {
        add('FSH + LH + Prolactine + AMH', 'Évaluation cycle / fertilité / réserve ovarienne.');
        if (a.spm >= 2) add('Bilan thyroïdien complet + cortisol salivaire', 'SPM marqué oriente vers déséquilibre E2/Prog + stress.');
        if (a.cycles === 'longs' && (a.cheveux_h === 'oui' || a.poids_vent === 'oui')) add('Testostérone + SHBG + glycémie + insuline (HOMA-IR)', 'Bilan SOPK orienté.');
      } else if (a.age_h >= 40 && a.age_h < 55) {
        add('FSH + Estradiol + Progestérone (en 2ᵉ partie de cycle)', 'Bilan de transition péri-ménopausique.');
        add('Cortisol salivaire 4 points + DHEA-S', 'L\'axe surrénalien prend le relais des ovaires : à évaluer.');
        if (a.poids_vent === 'oui') add('Glycémie + insulinémie à jeun + HbA1c', 'Insulino-résistance fréquente à la périménopause.');
        if (a.bouffees >= 2 || a.sueurs >= 2) add('Bilan ostéo (calcium, vitamine D, ostéodensitométrie si > 50)', 'Démarrer la prévention osseuse dès la périménopause.');
      } else {
        add('FSH (confirme ménopause si > 30 mUI/L)', 'Confirmation du statut ménopausique.');
        add('Ostéodensitométrie (DEXA)', 'Prévention de l\'ostéoporose post-ménopausique.');
        add('Glycémie + HbA1c + bilan lipidique', 'Risque cardio-métabolique majoré après la ménopause.');
        if (a.secheresse === 'oui') add('Évaluation gynécologique (THM si pertinent)', 'Sécheresse uro-génitale peut être améliorée par accompagnement spécialisé.');
      }
      return list;
    },
    disclaimer: 'Les bilans hormonaux doivent être interprétés en fonction du moment du cycle. Demandez à votre médecin gynécologue le bon moment pour la prise de sang.'
  };

})();

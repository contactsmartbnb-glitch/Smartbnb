/* ============================================================
   Mehdia — Données des bilans (4 univers, multi-thèmes)
   ------------------------------------------------------------
   AUDIENCES : les 4 univers (Femmes / Hommes / Enfants / Seniors)
   TOPICS    : un thème = questions + logique d'orientation vers
               les analyses. Le moteur lit ?t= dans l'URL.

   IMPORTANT : les questions et la logique sont une PREMIÈRE
   VERSION, à valider et affiner avec les cours de micronutrition
   et l'expertise de la pharmacienne.
   ============================================================ */

var SCALE_DEFAULT = ['Aucun', 'Léger', 'Modéré', 'Important'];
var SCALE_FREQ    = ['Jamais', 'Parfois', 'Souvent', 'Très souvent'];

/* ---------- Les 4 univers ---------- */
var AUDIENCES = {
  femme: {
    key: 'femme', name: 'Femmes', icon: '🌸',
    eyebrow: 'Univers · Femmes',
    metaTitle: 'Univers Femmes — Mehdia',
    tagline: 'Hormones, minceur, beauté, énergie',
    intro: 'Du cycle à la ménopause, l\'équilibre hormonal influence l\'énergie, le poids, la peau et l\'humeur. Nos bilans transforment vos symptômes en plan d\'action.',
    topics: ['perimenopause', 'minceur', 'beaute']
  },
  homme: {
    key: 'homme', name: 'Hommes', icon: '💪',
    eyebrow: 'Univers · Hommes',
    metaTitle: 'Univers Hommes — Mehdia',
    tagline: 'Énergie, métabolisme, vitalité',
    intro: 'Fatigue, baisse de libido, poids qui s\'installe, masse musculaire qui fond : la micronutrition aide à comprendre et à soutenir la vitalité masculine.',
    topics: ['homme']
  },
  enfant: {
    key: 'enfant', name: 'Enfants', icon: '🧒',
    eyebrow: 'Univers · Enfants',
    metaTitle: 'Univers Enfants — Mehdia',
    tagline: 'Croissance, immunité, concentration',
    intro: 'Infections à répétition, fatigue, sommeil agité, appétit difficile : des repères de micronutrition pour accompagner votre enfant — toujours en lien avec son pédiatre.',
    topics: ['enfant']
  },
  senior: {
    key: 'senior', name: 'Seniors', icon: '🌳',
    eyebrow: 'Univers · Seniors',
    metaTitle: 'Univers Seniors — Mehdia',
    tagline: 'Bien-vieillir, énergie, mémoire',
    intro: 'Énergie, mémoire, masse musculaire, appétit : après 65 ans, quelques équilibres micronutritionnels font une vraie différence sur la forme et l\'autonomie.',
    topics: ['senior']
  }
};

/* ---------- Les thèmes de bilan ---------- */
var TOPICS = {

  /* ===================== PÉRI-MÉNOPAUSE ===================== */
  perimenopause: {
    slug: 'perimenopause', audience: 'femme', icon: '🌿',
    name: 'Péri-ménopause & ménopause',
    eyebrow: 'Bilan · Équilibre hormonal',
    metaTitle: 'Mon bilan péri-ménopause — Mehdia',
    blurb: 'Bouffées de chaleur, sommeil, humeur, poids : comprendre la transition hormonale.',
    questions: [
      { id: 'age', type: 'number', question: 'Quel âge avez-vous ?',
        hint: 'La péri-ménopause débute le plus souvent entre 40 et 50 ans.',
        min: 30, max: 75, placeholder: 'Ex. 47' },
      { id: 'cycle', type: 'single', question: 'Où en êtes-vous de vos cycles menstruels ?',
        hint: 'Choisissez la situation la plus proche de la vôtre.',
        options: [
          { value: 'regulier',          label: 'Mes règles sont encore régulières' },
          { value: 'irregulier_recent', label: 'Mes règles sont devenues irrégulières (moins d\'un an)' },
          { value: 'irregulier_long',   label: 'Mes règles sont irrégulières depuis plus d\'un an' },
          { value: 'arret_recent',      label: 'Je n\'ai plus de règles depuis moins de 12 mois' },
          { value: 'arret_long',        label: 'Je n\'ai plus de règles depuis plus de 12 mois' }
        ] },
      { id: 'chaleur', type: 'scale', question: 'Ressentez-vous des bouffées de chaleur ou des sueurs nocturnes ?',
        hint: 'Indiquez l\'intensité de ce que vous vivez.' },
      { id: 'sommeil', type: 'scale', question: 'Rencontrez-vous des troubles du sommeil ?',
        hint: 'Réveils nocturnes, endormissement difficile, sommeil peu réparateur.' },
      { id: 'humeur', type: 'scale', question: 'Irritabilité, anxiété ou baisse de moral ?',
        hint: 'Par rapport à votre état habituel des années précédentes.' },
      { id: 'fatigue', type: 'scale', question: 'Ressentez-vous une fatigue inhabituelle ?',
        hint: 'Manque d\'énergie, récupération plus lente que d\'ordinaire.' },
      { id: 'poids', type: 'single', question: 'Avez-vous remarqué une prise de poids récente, surtout au niveau du ventre ?',
        options: [
          { value: 'non',         label: 'Non, mon poids est stable' },
          { value: 'un_peu',      label: 'Un peu, quelques kilos' },
          { value: 'oui_marquee', label: 'Oui, une prise de poids nette' }
        ] },
      { id: 'sucre', type: 'scale', question: 'Avez-vous des envies de sucre ou des grignotages fréquents ?',
        hint: 'Notamment en fin de journée ou après les repas.' },
      { id: 'autres', type: 'multi', question: 'D\'autres symptômes vous concernent-ils ?',
        hint: 'Plusieurs réponses possibles.',
        options: [
          { value: 'secheresse',    label: 'Sécheresse intime' },
          { value: 'libido',        label: 'Baisse de libido' },
          { value: 'articulations', label: 'Douleurs articulaires' },
          { value: 'brouillard',    label: 'Brouillard mental, troubles de concentration' },
          { value: 'palpitations',  label: 'Palpitations' },
          { value: 'cheveux',       label: 'Chute de cheveux / cheveux fragiles' },
          { value: 'peau',          label: 'Peau sèche' },
          { value: 'maux_tete',     label: 'Maux de tête plus fréquents' },
          { value: 'aucun',         label: 'Aucun de ces symptômes', exclusive: true }
        ] },
      { id: 'antecedents', type: 'multi', question: 'Avez-vous des antécédents personnels ou familiaux ?',
        hint: 'Plusieurs réponses possibles.',
        options: [
          { value: 'thyroide',    label: 'Problème de thyroïde (personnel)' },
          { value: 'fer',         label: 'Carence en fer / anémie déjà diagnostiquée' },
          { value: 'diabete',     label: 'Diabète ou prédiabète (vous ou famille proche)' },
          { value: 'osteoporose', label: 'Ostéoporose ou fractures (familial)' },
          { value: 'cardio',      label: 'Cholestérol élevé / antécédents cardiovasculaires' },
          { value: 'aucun',       label: 'Aucun', exclusive: true }
        ] },
      { id: 'stress', type: 'scale', question: 'Comment évaluez-vous votre niveau de stress au quotidien ?',
        hint: 'Stress professionnel, familial, charge mentale.' },
      { id: 'traitement', type: 'single', question: 'Prenez-vous actuellement un traitement hormonal ?',
        hint: 'Traitement de la ménopause (THM), pilule, stérilet hormonal…',
        options: [
          { value: 'non',         label: 'Non' },
          { value: 'oui',         label: 'Oui' },
          { value: 'ne_sais_pas', label: 'Je ne suis pas sûre' }
        ] }
    ],
    analyses: function (a) {
      var list = [], ant = a.antecedents || [], autres = a.autres || [];
      function add(n, w) { list.push({ name: n, why: w }); }
      add('FSH et œstradiol', 'Situer la phase de transition hormonale.');
      add('TSH (bilan thyroïdien)', 'La thyroïde reproduit de nombreux symptômes de la péri-ménopause.');
      add('25-OH Vitamine D', 'Statut très souvent insuffisant ; impacte énergie, os et humeur.');
      add('Ferritine + numération formule sanguine (NFS)', 'Rechercher une carence en fer, cause fréquente de fatigue.');
      add('Glycémie à jeun', 'Première évaluation de l\'équilibre du sucre.');
      if (a.poids !== 'non' || (a.sucre || 0) >= 2 || ant.indexOf('diabete') > -1)
        add('Insulinémie à jeun + HbA1c', 'Détecter une résistance à l\'insuline débutante (calcul du HOMA).');
      if (a.age >= 50 || a.poids === 'oui_marquee' || ant.indexOf('cardio') > -1)
        add('Bilan lipidique complet', 'Le risque cardiovasculaire évolue avec la baisse des œstrogènes.');
      if (ant.indexOf('thyroide') > -1 || (a.fatigue || 0) >= 2)
        add('T4 libre, T3 libre + anticorps anti-TPO', 'Préciser le bilan thyroïdien au-delà de la seule TSH.');
      if (ant.indexOf('osteoporose') > -1 || a.age >= 52)
        add('Calcium, phosphore (± ostéodensitométrie sur avis médical)', 'Surveiller le capital osseux, fragilisé après la ménopause.');
      if (a.cycle === 'regulier' || a.cycle === 'irregulier_recent' || a.cycle === 'irregulier_long')
        add('Progestérone (2e partie de cycle)', 'Évaluer l\'équilibre œstrogènes / progestérone tant que les cycles persistent.');
      if ((a.stress || 0) >= 2 || (a.sommeil || 0) >= 2)
        add('Magnésium érythrocytaire', 'Le magnésium intervient dans le stress, le sommeil et l\'équilibre nerveux.');
      if (autres.indexOf('cheveux') > -1 || autres.indexOf('peau') > -1)
        add('Zinc et sélénium', 'Micronutriments clés pour la peau, les cheveux et la thyroïde.');
      return list;
    }
  },

  /* ================ MINCEUR & MÉTABOLISME ================== */
  minceur: {
    slug: 'minceur', audience: 'femme', icon: '⚖️',
    name: 'Minceur & métabolisme',
    eyebrow: 'Bilan · Poids & énergie',
    metaTitle: 'Mon bilan minceur & métabolisme — Mehdia',
    blurb: 'Poids qui résiste, ventre qui stocke, fringales : et si c\'était le métabolisme ?',
    questions: [
      { id: 'age', type: 'number', question: 'Quel âge avez-vous ?',
        min: 18, max: 80, placeholder: 'Ex. 42' },
      { id: 'objectif', type: 'single', question: 'Quel est votre objectif principal ?',
        options: [
          { value: 'poids',     label: 'Perdre un poids installé' },
          { value: 'ventre',    label: 'Déstocker la zone du ventre' },
          { value: 'fringales', label: 'Stopper les fringales de sucre' },
          { value: 'energie',   label: 'Retrouver de l\'énergie' },
          { value: 'blocage',   label: 'Comprendre un blocage malgré mes efforts' }
        ] },
      { id: 'ventre', type: 'single', question: 'La prise de poids se concentre-t-elle au niveau du ventre ?',
        options: [
          { value: 'non',         label: 'Non, c\'est réparti' },
          { value: 'un_peu',      label: 'Un peu' },
          { value: 'oui_marquee', label: 'Oui, nettement' }
        ] },
      { id: 'fringales', type: 'scale', question: 'Avez-vous des fringales ou des envies de sucre ?',
        hint: 'Surtout en fin de journée ou après les repas.' },
      { id: 'pompe', type: 'scale', question: 'Ressentez-vous des coups de fatigue après les repas ?',
        scaleLabels: SCALE_FREQ },
      { id: 'tour_taille', type: 'single', question: 'Votre tour de taille dépasse-t-il 88 cm ?',
        hint: 'Mesuré au niveau du nombril. Un repère d\'alerte métabolique chez la femme.',
        options: [
          { value: 'non',         label: 'Non' },
          { value: 'oui',         label: 'Oui' },
          { value: 'ne_sais_pas', label: 'Je ne sais pas' }
        ] },
      { id: 'antecedents', type: 'multi', question: 'Avez-vous des antécédents personnels ou familiaux ?',
        hint: 'Plusieurs réponses possibles.',
        options: [
          { value: 'diabete',      label: 'Diabète de type 2 (vous ou famille proche)' },
          { value: 'prediabete',   label: 'Prédiabète déjà signalé' },
          { value: 'sopk',         label: 'Syndrome des ovaires polykystiques (SOPK)' },
          { value: 'foie',         label: 'Foie « gras » / stéatose hépatique' },
          { value: 'hypertension', label: 'Hypertension artérielle' },
          { value: 'cholesterol',  label: 'Cholestérol ou triglycérides élevés' },
          { value: 'aucun',        label: 'Aucun', exclusive: true }
        ] },
      { id: 'activite', type: 'single', question: 'Quel est votre niveau d\'activité physique ?',
        options: [
          { value: 'sedentaire', label: 'Plutôt sédentaire' },
          { value: 'legere',     label: 'Activité légère et occasionnelle' },
          { value: 'reguliere',  label: 'Activité régulière' }
        ] },
      { id: 'sommeil', type: 'scale', question: 'Rencontrez-vous des troubles du sommeil ?',
        hint: 'Le manque de sommeil dérègle l\'appétit et le stockage des graisses.' },
      { id: 'historique', type: 'single', question: 'Avez-vous déjà suivi des régimes ?',
        options: [
          { value: 'jamais',   label: 'Jamais vraiment' },
          { value: 'quelques', label: 'Quelques-uns' },
          { value: 'nombreux', label: 'De nombreux régimes, avec effet yo-yo' }
        ] }
    ],
    analyses: function (a) {
      var list = [], ant = a.antecedents || [];
      function add(n, w) { list.push({ name: n, why: w }); }
      add('Glycémie à jeun', 'Évaluer la régulation du sucre sanguin.');
      add('Insulinémie à jeun + HbA1c', 'Mesurer la résistance à l\'insuline (calcul du HOMA), souvent à l\'origine des blocages de poids.');
      add('Bilan lipidique complet', 'Cholestérol et triglycérides, marqueurs du métabolisme.');
      add('TSH (bilan thyroïdien)', 'Une thyroïde ralentie freine la perte de poids.');
      add('25-OH Vitamine D', 'Un déficit est associé à une moins bonne sensibilité à l\'insuline.');
      add('Ferritine + numération formule sanguine (NFS)', 'Une carence en fer entretient fatigue et fringales.');
      if (a.ventre !== 'non' || ant.indexOf('foie') > -1)
        add('Bilan hépatique (ASAT, ALAT, GGT)', 'Rechercher une surcharge du foie (stéatose), fréquente avec le surpoids abdominal.');
      if (ant.indexOf('sopk') > -1)
        add('Testostérone, SHBG, delta-4-androstènedione', 'Préciser le profil hormonal en cas de SOPK.');
      if (a.ventre === 'oui_marquee' || a.tour_taille === 'oui')
        add('CRP ultra-sensible', 'Mesurer l\'inflammation de bas grade liée au tissu adipeux abdominal.');
      if ((a.fringales || 0) >= 2 || (a.sommeil || 0) >= 2)
        add('Magnésium érythrocytaire', 'Le magnésium soutient l\'équilibre glycémique, le sommeil et la gestion du stress.');
      return list;
    }
  },

  /* ===================== BEAUTÉ ============================= */
  beaute: {
    slug: 'beaute', audience: 'femme', icon: '✨',
    name: 'Beauté — peau, cheveux, ongles',
    eyebrow: 'Bilan · Beauté de l\'intérieur',
    metaTitle: 'Mon bilan beauté peau & cheveux — Mehdia',
    blurb: 'Cheveux, ongles, éclat de la peau : la beauté se soutient de l\'intérieur.',
    questions: [
      { id: 'age', type: 'number', question: 'Quel âge avez-vous ?',
        min: 16, max: 80, placeholder: 'Ex. 34' },
      { id: 'preoccupations', type: 'multi', question: 'Qu\'aimeriez-vous améliorer en priorité ?',
        hint: 'Plusieurs réponses possibles.',
        options: [
          { value: 'chute_cheveux', label: 'Chute de cheveux' },
          { value: 'cheveux',       label: 'Cheveux fins, ternes ou cassants' },
          { value: 'ongles',        label: 'Ongles mous ou cassants' },
          { value: 'peau_terne',    label: 'Teint terne, manque d\'éclat' },
          { value: 'acne',          label: 'Acné, imperfections' },
          { value: 'peau_seche',    label: 'Peau sèche, inconforts' },
          { value: 'fermete',       label: 'Perte de fermeté, rides' },
          { value: 'aucun',         label: 'Rien de tout cela', exclusive: true }
        ] },
      { id: 'chute', type: 'single', question: 'Concernant vos cheveux, où en êtes-vous ?',
        options: [
          { value: 'non',         label: 'Pas de chute particulière' },
          { value: 'recente',     label: 'Une chute récente (moins de 6 mois)' },
          { value: 'chronique',   label: 'Une chute installée (plus de 6 mois)' },
          { value: 'saisonniere', label: 'Une chute surtout saisonnière' }
        ] },
      { id: 'alimentation', type: 'multi', question: 'Comment décririez-vous votre alimentation ?',
        hint: 'Plusieurs réponses possibles.',
        options: [
          { value: 'vegetarien',    label: 'Végétarienne ou végane' },
          { value: 'peu_proteines', label: 'Je mange peu de protéines' },
          { value: 'regime_recent', label: 'Régime restrictif ou perte de poids rapide récente' },
          { value: 'transformes',   label: 'Beaucoup de produits transformés' },
          { value: 'equilibree',    label: 'Variée et équilibrée' }
        ] },
      { id: 'digestion', type: 'scale', question: 'Avez-vous des troubles digestifs ?',
        hint: 'Ballonnements, transit irrégulier. L\'intestin influence la peau.' },
      { id: 'stress', type: 'scale', question: 'Comment évaluez-vous votre niveau de stress ?' },
      { id: 'hormonal', type: 'single', question: 'Vos imperfections varient-elles avec votre cycle ?',
        options: [
          { value: 'oui_cycle',  label: 'Oui, elles s\'aggravent avant les règles' },
          { value: 'irregulier', label: 'Oui, et j\'ai aussi des cycles irréguliers' },
          { value: 'non',        label: 'Non, ou non concernée' }
        ] },
      { id: 'fatigue', type: 'scale', question: 'Ressentez-vous une fatigue inhabituelle ?' }
    ],
    analyses: function (a) {
      var list = [], al = a.alimentation || [];
      function add(n, w) { list.push({ name: n, why: w }); }
      add('Ferritine + numération formule sanguine (NFS)', 'Le fer est essentiel à la vitalité du cheveu et de l\'ongle.');
      add('Zinc', 'Oligo-élément clé pour la peau, les cheveux et la cicatrisation.');
      add('25-OH Vitamine D', 'Impliquée dans le cycle du cheveu et la qualité de la peau.');
      add('TSH (bilan thyroïdien)', 'La thyroïde influence directement peau, cheveux et ongles.');
      add('Vitamine B12 et folates', 'Vitamines indispensables au renouvellement cellulaire.');
      if (a.chute === 'chronique' || al.indexOf('regime_recent') > -1)
        add('Sélénium', 'Oligo-élément de la kératine et du bon fonctionnement thyroïdien.');
      if (al.indexOf('vegetarien') > -1 || al.indexOf('peu_proteines') > -1)
        add('Protéines totales et albumine', 'Évaluer les apports en protéines, matière première des cheveux et de la peau.');
      if (a.hormonal === 'oui_cycle' || a.hormonal === 'irregulier')
        add('Testostérone et SHBG', 'Explorer une composante hormonale de l\'acné.');
      if (a.hormonal === 'irregulier')
        add('Bilan hormonal (FSH, LH, œstradiol)', 'Préciser l\'origine des cycles irréguliers associés.');
      if ((a.fatigue || 0) >= 2)
        add('Magnésium érythrocytaire', 'Soutient l\'énergie et la résistance au stress, qui marquent la peau.');
      return list;
    }
  },

  /* ================= VITALITÉ MASCULINE ==================== */
  homme: {
    slug: 'homme', audience: 'homme', icon: '💪',
    name: 'Vitalité masculine',
    eyebrow: 'Bilan · Énergie & métabolisme',
    metaTitle: 'Mon bilan vitalité masculine — Mehdia',
    blurb: 'Énergie, libido, poids, masse musculaire : retrouver sa vitalité.',
    questions: [
      { id: 'age', type: 'number', question: 'Quel âge avez-vous ?',
        min: 18, max: 90, placeholder: 'Ex. 45' },
      { id: 'energie', type: 'scale', question: 'Ressentez-vous une baisse d\'énergie ou de motivation ?',
        hint: 'Par rapport à votre forme habituelle des années précédentes.' },
      { id: 'libido', type: 'scale', question: 'Avez-vous remarqué une baisse de libido ?' },
      { id: 'poids', type: 'single', question: 'Avez-vous pris du poids, surtout au niveau du ventre ?',
        options: [
          { value: 'non',         label: 'Non, mon poids est stable' },
          { value: 'un_peu',      label: 'Un peu' },
          { value: 'oui_marquee', label: 'Oui, nettement, surtout le ventre' }
        ] },
      { id: 'force', type: 'single', question: 'Concernant votre masse musculaire et votre force ?',
        options: [
          { value: 'stable',       label: 'Stables' },
          { value: 'baisse_legere',label: 'Une baisse légère' },
          { value: 'baisse_nette', label: 'Une baisse nette' }
        ] },
      { id: 'sommeil', type: 'scale', question: 'Rencontrez-vous des troubles du sommeil ?',
        hint: 'Réveils nocturnes, sommeil peu réparateur, ronflements importants.' },
      { id: 'stress', type: 'scale', question: 'Comment évaluez-vous votre niveau de stress au quotidien ?' },
      { id: 'cheveux', type: 'single', question: 'Concernant vos cheveux ?',
        options: [
          { value: 'non',       label: 'Pas de chute particulière' },
          { value: 'debut',     label: 'Une chute qui débute' },
          { value: 'installee', label: 'Une calvitie installée' }
        ] },
      { id: 'antecedents', type: 'multi', question: 'Avez-vous des antécédents personnels ou familiaux ?',
        hint: 'Plusieurs réponses possibles.',
        options: [
          { value: 'diabete',      label: 'Diabète ou prédiabète (vous ou famille proche)' },
          { value: 'cholesterol',  label: 'Cholestérol ou triglycérides élevés' },
          { value: 'hypertension', label: 'Hypertension artérielle' },
          { value: 'thyroide',     label: 'Problème de thyroïde' },
          { value: 'aucun',        label: 'Aucun', exclusive: true }
        ] },
      { id: 'activite', type: 'single', question: 'Quel est votre niveau d\'activité physique ?',
        options: [
          { value: 'sedentaire', label: 'Plutôt sédentaire' },
          { value: 'legere',     label: 'Activité légère et occasionnelle' },
          { value: 'reguliere',  label: 'Activité régulière' }
        ] }
    ],
    analyses: function (a) {
      var list = [], ant = a.antecedents || [];
      function add(n, w) { list.push({ name: n, why: w }); }
      add('Testostérone totale et biodisponible + SHBG', 'Évaluer le statut androgénique, central pour l\'énergie, la libido et la masse musculaire.');
      add('TSH (bilan thyroïdien)', 'Une thyroïde ralentie pèse sur l\'énergie et le poids.');
      add('Glycémie à jeun + HbA1c', 'Évaluer la régulation du sucre sanguin.');
      add('Bilan lipidique complet', 'Cholestérol et triglycérides, marqueurs cardiovasculaires.');
      add('25-OH Vitamine D', 'Statut souvent insuffisant ; impacte énergie, immunité et muscle.');
      add('Ferritine + numération formule sanguine (NFS)', 'Rechercher une carence ou une anémie sous-jacente à la fatigue.');
      if (a.poids !== 'non')
        add('Insulinémie à jeun', 'Mesurer la résistance à l\'insuline (calcul du HOMA).');
      if (a.poids === 'oui_marquee')
        add('CRP ultra-sensible', 'Mesurer l\'inflammation de bas grade liée au tissu adipeux abdominal.');
      if (a.force !== 'stable' || (a.sommeil || 0) >= 2 || (a.stress || 0) >= 2)
        add('Magnésium érythrocytaire', 'Soutient l\'énergie musculaire, le sommeil et la gestion du stress.');
      if (a.cheveux !== 'non')
        add('Zinc', 'Oligo-élément impliqué dans le métabolisme des hormones et la santé du cheveu.');
      return list;
    }
  },

  /* ============== VITALITÉ DE L'ENFANT ===================== */
  enfant: {
    slug: 'enfant', audience: 'enfant', icon: '🧒',
    name: 'Vitalité de l\'enfant',
    eyebrow: 'Bilan · Croissance & immunité',
    metaTitle: 'Mon bilan vitalité de l\'enfant — Mehdia',
    blurb: 'Immunité, sommeil, concentration, appétit : accompagner sa croissance.',
    disclaimer: 'Ce bilan ne remplace en aucun cas le suivi du pédiatre, seul habilité à examiner votre enfant, prescrire des analyses et poser un diagnostic. Chez l\'enfant, toute analyse ou complément doit être décidé avec lui. Mehdia propose uniquement des repères d\'accompagnement micronutrition, à présenter au pédiatre.',
    questions: [
      { id: 'age', type: 'number', question: 'Quel âge a votre enfant ?',
        hint: 'Ce bilan est destiné aux enfants de 1 à 17 ans, rempli par un parent.',
        min: 1, max: 17, placeholder: 'Ex. 7' },
      { id: 'motif', type: 'multi', question: 'Qu\'observez-vous chez votre enfant ?',
        hint: 'Plusieurs réponses possibles.',
        options: [
          { value: 'infections',    label: 'Infections à répétition (ORL, rhumes…)' },
          { value: 'fatigue',       label: 'Fatigue, manque d\'entrain' },
          { value: 'sommeil',       label: 'Sommeil agité ou difficile' },
          { value: 'appetit',       label: 'Appétit difficile' },
          { value: 'concentration', label: 'Difficultés de concentration' },
          { value: 'peau',          label: 'Peau sèche, eczéma' },
          { value: 'aucun',         label: 'Rien de particulier', exclusive: true }
        ] },
      { id: 'infections', type: 'single', question: 'Concernant les infections (rhumes, angines, otites…) ?',
        options: [
          { value: 'rares',        label: 'Rares, comme la plupart des enfants' },
          { value: 'saisonnieres', label: 'Surtout en hiver' },
          { value: 'repetees',     label: 'Très fréquentes, presque enchaînées' }
        ] },
      { id: 'alimentation', type: 'single', question: 'Comment décririez-vous son alimentation ?',
        options: [
          { value: 'variee',         label: 'Variée, il/elle mange de tout' },
          { value: 'selective',      label: 'Plutôt sélective' },
          { value: 'tres_selective', label: 'Très sélective, peu d\'aliments acceptés' }
        ] },
      { id: 'sommeil', type: 'scale', question: 'Son sommeil est-il perturbé ?',
        hint: 'Endormissement difficile, réveils, sommeil peu réparateur.' },
      { id: 'croissance', type: 'single', question: 'Concernant sa croissance et son poids ?',
        options: [
          { value: 'harmonieuse',     label: 'Harmonieuse, sans inquiétude' },
          { value: 'inquietude_poids',label: 'Une inquiétude sur le poids' },
          { value: 'inquietude_taille',label: 'Une inquiétude sur la taille' }
        ] },
      { id: 'suivi', type: 'single', question: 'Un pédiatre suit-il actuellement votre enfant pour ce motif ?',
        options: [
          { value: 'oui', label: 'Oui' },
          { value: 'non', label: 'Pas encore' }
        ] }
    ],
    analyses: function (a) {
      var list = [], motif = a.motif || [];
      function add(n, w) { list.push({ name: n, why: w }); }
      add('Ferritine + numération formule sanguine (NFS)', 'La carence en fer est fréquente chez l\'enfant et pèse sur l\'énergie et la concentration.');
      add('25-OH Vitamine D', 'Statut souvent insuffisant ; importante pour l\'immunité et la croissance osseuse.');
      if (a.infections === 'repetees' || motif.indexOf('infections') > -1)
        add('Bilan de base à discuter avec le pédiatre', 'Devant des infections répétées, le pédiatre jugera des examens utiles.');
      if (a.alimentation === 'selective' || a.alimentation === 'tres_selective')
        add('Zinc (± vitamine B12 selon le pédiatre)', 'Une alimentation sélective expose à des carences en oligo-éléments.');
      if (a.croissance === 'inquietude_poids' || a.croissance === 'inquietude_taille')
        add('Suivi de la courbe de croissance par le pédiatre', 'Toute inquiétude de croissance relève en priorité d\'un examen pédiatrique.');
      return list;
    }
  },

  /* ================= BIEN-VIEILLIR (SENIOR) ================ */
  senior: {
    slug: 'senior', audience: 'senior', icon: '🌳',
    name: 'Bien-vieillir',
    eyebrow: 'Bilan · Vitalité après 65 ans',
    metaTitle: 'Mon bilan bien-vieillir — Mehdia',
    blurb: 'Énergie, mémoire, masse musculaire, appétit : bien-vieillir en forme.',
    questions: [
      { id: 'age', type: 'number', question: 'Quel âge avez-vous ?',
        min: 55, max: 105, placeholder: 'Ex. 72' },
      { id: 'energie', type: 'scale', question: 'Ressentez-vous une fatigue ou une baisse d\'énergie ?' },
      { id: 'appetit', type: 'single', question: 'Comment est votre appétit ?',
        options: [
          { value: 'bon',     label: 'Bon, je mange avec plaisir' },
          { value: 'diminue', label: 'Diminué' },
          { value: 'faible',  label: 'Faible, je mange peu' }
        ] },
      { id: 'poids', type: 'single', question: 'Avez-vous perdu du poids involontairement ces derniers mois ?',
        options: [
          { value: 'non',         label: 'Non' },
          { value: 'un_peu',      label: 'Un peu' },
          { value: 'oui_marquee', label: 'Oui, une perte nette' }
        ] },
      { id: 'force', type: 'single', question: 'Concernant votre force et votre masse musculaire ?',
        options: [
          { value: 'stable',        label: 'Stables' },
          { value: 'baisse_legere', label: 'Une baisse légère' },
          { value: 'baisse_nette',  label: 'Une baisse nette (se lever, porter…)' }
        ] },
      { id: 'memoire', type: 'scale', question: 'Rencontrez-vous des troubles de la mémoire ou de la concentration ?' },
      { id: 'sommeil', type: 'scale', question: 'Rencontrez-vous des troubles du sommeil ?' },
      { id: 'chutes', type: 'single', question: 'Avez-vous fait des chutes récemment ?',
        options: [
          { value: 'aucune',    label: 'Aucune' },
          { value: 'une',       label: 'Une chute' },
          { value: 'plusieurs', label: 'Plusieurs chutes' }
        ] },
      { id: 'traitements', type: 'single', question: 'Combien de médicaments prenez-vous au quotidien ?',
        options: [
          { value: 'aucun_un',  label: 'Aucun ou un seul' },
          { value: 'deux_trois',label: 'Deux à trois' },
          { value: 'quatre_plus',label: 'Quatre ou plus' }
        ] },
      { id: 'moral', type: 'scale', question: 'Comment évaluez-vous votre moral ces derniers temps ?',
        scaleLabels: ['Très bon', 'Correct', 'Fragile', 'Bas'] }
    ],
    analyses: function (a) {
      var list = [];
      function add(n, w) { list.push({ name: n, why: w }); }
      add('25-OH Vitamine D', 'Essentielle aux os, aux muscles et à l\'immunité ; déficit très fréquent après 65 ans.');
      add('Vitamine B12 et folates', 'Carence fréquente avec l\'âge ; impacte mémoire, énergie et formation du sang.');
      add('Ferritine + numération formule sanguine (NFS)', 'L\'anémie est fréquente et souvent sous-estimée chez le senior.');
      add('Albumine', 'Marqueur clé de l\'état nutritionnel et du risque de dénutrition.');
      add('TSH (bilan thyroïdien)', 'Un déséquilibre thyroïdien peut imiter fatigue et troubles de l\'humeur.');
      add('Calcium + fonction rénale (créatinine, DFG)', 'Surveiller l\'équilibre osseux et adapter tout apport en micronutriments.');
      if (a.appetit !== 'bon' || a.poids !== 'non')
        add('CRP et préalbumine', 'Préciser un risque de dénutrition ou une inflammation associée.');
      if (a.force !== 'stable' || a.chutes !== 'aucune')
        add('Magnésium érythrocytaire (± évaluation de la masse musculaire)', 'Rechercher des facteurs de fonte musculaire (sarcopénie).');
      if (a.traitements === 'quatre_plus')
        add('Revue de l\'ordonnance avec votre médecin', 'La prise de nombreux médicaments peut épuiser certains micronutriments.');
      return list;
    }
  }

};

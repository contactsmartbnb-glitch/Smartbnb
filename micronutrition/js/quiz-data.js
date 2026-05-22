/* ============================================================
   Mehdia — Données des bilans (multi-thèmes)
   ------------------------------------------------------------
   Chaque thème = un jeu de questions + une logique d'orientation
   vers les analyses. Le moteur (quiz-engine.js) lit le paramètre
   ?t= de l'URL pour choisir le thème.

   IMPORTANT : les questions et la logique sont une PREMIÈRE
   VERSION, à valider et affiner avec les cours de micronutrition
   et l'expertise de la pharmacienne.
   ============================================================ */

var SCALE_DEFAULT = ['Aucun', 'Léger', 'Modéré', 'Important'];
var SCALE_FREQ    = ['Jamais', 'Parfois', 'Souvent', 'Très souvent'];

var TOPICS = {

  /* ===================== PÉRI-MÉNOPAUSE ===================== */
  perimenopause: {
    slug: 'perimenopause',
    name: 'Péri-ménopause & ménopause',
    eyebrow: 'Bilan · Équilibre hormonal',
    metaTitle: 'Mon bilan péri-ménopause — Mehdia',
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
    slug: 'minceur',
    name: 'Minceur & métabolisme',
    eyebrow: 'Bilan · Poids & énergie',
    metaTitle: 'Mon bilan minceur & métabolisme — Mehdia',
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
          { value: 'jamais',      label: 'Jamais vraiment' },
          { value: 'quelques',    label: 'Quelques-uns' },
          { value: 'nombreux',    label: 'De nombreux régimes, avec effet yo-yo' }
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
    slug: 'beaute',
    name: 'Beauté — peau, cheveux, ongles',
    eyebrow: 'Bilan · Beauté de l\'intérieur',
    metaTitle: 'Mon bilan beauté peau & cheveux — Mehdia',
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
          { value: 'non',        label: 'Pas de chute particulière' },
          { value: 'recente',    label: 'Une chute récente (moins de 6 mois)' },
          { value: 'chronique',  label: 'Une chute installée (plus de 6 mois)' },
          { value: 'saisonniere',label: 'Une chute surtout saisonnière' }
        ] },
      { id: 'alimentation', type: 'multi', question: 'Comment décririez-vous votre alimentation ?',
        hint: 'Plusieurs réponses possibles.',
        options: [
          { value: 'vegetarien',   label: 'Végétarienne ou végane' },
          { value: 'peu_proteines',label: 'Je mange peu de protéines' },
          { value: 'regime_recent',label: 'Régime restrictif ou perte de poids rapide récente' },
          { value: 'transformes',  label: 'Beaucoup de produits transformés' },
          { value: 'equilibree',   label: 'Variée et équilibrée' }
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
  }

};

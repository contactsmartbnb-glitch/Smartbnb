/* ============================================================
   Mehdia — Moteur de questionnaire « Péri-ménopause »
   Première version. Les questions et la logique d'orientation
   seront affinées avec les cours de micronutrition.
   ============================================================ */

var QUESTIONS = [
  {
    id: 'age', type: 'number',
    question: 'Quel âge avez-vous ?',
    hint: 'La période de péri-ménopause débute le plus souvent entre 40 et 50 ans.',
    min: 30, max: 75, placeholder: 'Ex. 47'
  },
  {
    id: 'cycle', type: 'single',
    question: 'Où en êtes-vous de vos cycles menstruels ?',
    hint: 'Choisissez la situation la plus proche de la vôtre.',
    options: [
      { value: 'regulier',         label: 'Mes règles sont encore régulières' },
      { value: 'irregulier_recent',label: 'Mes règles sont devenues irrégulières (moins d\'un an)' },
      { value: 'irregulier_long',  label: 'Mes règles sont irrégulières depuis plus d\'un an' },
      { value: 'arret_recent',     label: 'Je n\'ai plus de règles depuis moins de 12 mois' },
      { value: 'arret_long',       label: 'Je n\'ai plus de règles depuis plus de 12 mois' }
    ]
  },
  {
    id: 'chaleur', type: 'scale',
    question: 'Ressentez-vous des bouffées de chaleur ou des sueurs nocturnes ?',
    hint: 'Indiquez l\'intensité de ce que vous vivez.'
  },
  {
    id: 'sommeil', type: 'scale',
    question: 'Rencontrez-vous des troubles du sommeil ?',
    hint: 'Réveils nocturnes, endormissement difficile, sommeil peu réparateur.'
  },
  {
    id: 'humeur', type: 'scale',
    question: 'Irritabilité, anxiété ou baisse de moral ?',
    hint: 'Par rapport à votre état habituel des années précédentes.'
  },
  {
    id: 'fatigue', type: 'scale',
    question: 'Ressentez-vous une fatigue inhabituelle ?',
    hint: 'Manque d\'énergie, récupération plus lente que d\'ordinaire.'
  },
  {
    id: 'poids', type: 'single',
    question: 'Avez-vous remarqué une prise de poids récente, surtout au niveau du ventre ?',
    options: [
      { value: 'non',          label: 'Non, mon poids est stable' },
      { value: 'un_peu',       label: 'Un peu, quelques kilos' },
      { value: 'oui_marquee',  label: 'Oui, une prise de poids nette' }
    ]
  },
  {
    id: 'sucre', type: 'scale',
    question: 'Avez-vous des envies de sucre ou des grignotages fréquents ?',
    hint: 'Notamment en fin de journée ou après les repas.'
  },
  {
    id: 'autres', type: 'multi',
    question: 'D\'autres symptômes vous concernent-ils ?',
    hint: 'Plusieurs réponses possibles.',
    options: [
      { value: 'secheresse',  label: 'Sécheresse intime' },
      { value: 'libido',      label: 'Baisse de libido' },
      { value: 'articulations', label: 'Douleurs articulaires' },
      { value: 'brouillard',  label: 'Brouillard mental, troubles de concentration' },
      { value: 'palpitations',label: 'Palpitations' },
      { value: 'cheveux',     label: 'Chute de cheveux / cheveux fragiles' },
      { value: 'peau',        label: 'Peau sèche' },
      { value: 'maux_tete',   label: 'Maux de tête plus fréquents' },
      { value: 'aucun',       label: 'Aucun de ces symptômes', exclusive: true }
    ]
  },
  {
    id: 'antecedents', type: 'multi',
    question: 'Avez-vous des antécédents personnels ou familiaux ?',
    hint: 'Plusieurs réponses possibles.',
    options: [
      { value: 'thyroide',   label: 'Problème de thyroïde (personnel)' },
      { value: 'fer',        label: 'Carence en fer / anémie déjà diagnostiquée' },
      { value: 'diabete',    label: 'Diabète ou prédiabète (vous ou famille proche)' },
      { value: 'osteoporose',label: 'Ostéoporose ou fractures (familial)' },
      { value: 'cardio',     label: 'Cholestérol élevé / antécédents cardiovasculaires' },
      { value: 'aucun',      label: 'Aucun', exclusive: true }
    ]
  },
  {
    id: 'stress', type: 'scale',
    question: 'Comment évaluez-vous votre niveau de stress au quotidien ?',
    hint: 'Stress professionnel, familial, charge mentale.'
  },
  {
    id: 'traitement', type: 'single',
    question: 'Prenez-vous actuellement un traitement hormonal ?',
    hint: 'Traitement de la ménopause (THM), pilule, stérilet hormonal…',
    options: [
      { value: 'non',         label: 'Non' },
      { value: 'oui',         label: 'Oui' },
      { value: 'ne_sais_pas', label: 'Je ne suis pas sûre' }
    ]
  },
  {
    id: 'email', type: 'email',
    question: 'Où souhaitez-vous retrouver votre bilan ?',
    hint: 'Votre email sert uniquement à enregistrer votre bilan et créer votre espace. Aucun nom n\'est demandé.',
    placeholder: 'votre@email.fr'
  }
];

var SCALE_LABELS = ['Aucun', 'Léger', 'Modéré', 'Important'];

/* ---------- Logique d'orientation vers les analyses ---------- */
function buildAnalyses(a) {
  var list = [];
  function add(name, why) { list.push({ name: name, why: why }); }

  // Socle commun
  add('FSH et œstradiol',
      'Situer la phase de transition hormonale.');
  add('TSH (bilan thyroïdien)',
      'La thyroïde reproduit de nombreux symptômes de la péri-ménopause.');
  add('25-OH Vitamine D',
      'Statut très souvent insuffisant ; impacte énergie, os et humeur.');
  add('Ferritine + numération formule sanguine (NFS)',
      'Rechercher une carence en fer, cause fréquente de fatigue.');
  add('Glycémie à jeun',
      'Première évaluation de l\'équilibre du sucre.');

  var ant = a.antecedents || [];
  var autres = a.autres || [];

  if (a.poids !== 'non' || (a.sucre || 0) >= 2 || ant.indexOf('diabete') > -1) {
    add('Insulinémie à jeun + HbA1c',
        'Détecter une résistance à l\'insuline débutante (calcul du HOMA).');
  }
  if (a.age >= 50 || a.poids === 'oui_marquee' || ant.indexOf('cardio') > -1) {
    add('Bilan lipidique complet',
        'Le risque cardiovasculaire évolue avec la baisse des œstrogènes.');
  }
  if (ant.indexOf('thyroide') > -1 || (a.fatigue || 0) >= 2) {
    add('T4 libre, T3 libre + anticorps anti-TPO',
        'Préciser le bilan thyroïdien au-delà de la seule TSH.');
  }
  if (ant.indexOf('osteoporose') > -1 || a.age >= 52) {
    add('Calcium, phosphore (± ostéodensitométrie sur avis médical)',
        'Surveiller le capital osseux, fragilisé après la ménopause.');
  }
  if (a.cycle === 'regulier' || a.cycle === 'irregulier_recent' || a.cycle === 'irregulier_long') {
    add('Progestérone (2e partie de cycle)',
        'Évaluer l\'équilibre œstrogènes / progestérone tant que les cycles persistent.');
  }
  if ((a.stress || 0) >= 2 || (a.sommeil || 0) >= 2) {
    add('Magnésium érythrocytaire',
        'Le magnésium intervient dans le stress, le sommeil et l\'équilibre nerveux.');
  }
  if (autres.indexOf('cheveux') > -1 || autres.indexOf('peau') > -1) {
    add('Zinc et sélénium',
        'Micronutriments clés pour la peau, les cheveux et la thyroïde.');
  }
  return list;
}

/* ---------- Moteur d'affichage ---------- */
(function () {
  var STORAGE_KEY = 'mehdia-bilan-perimenopause';
  var idx = 0;
  var answers = {};

  var elCard = document.getElementById('quizCard');
  var elResult = document.getElementById('resultCard');
  var elBar = document.getElementById('progressBar');
  var elMeta = document.getElementById('quizMeta');
  var elQ = document.getElementById('quizQuestion');
  var elHint = document.getElementById('quizHint');
  var elBody = document.getElementById('quizBody');
  var btnPrev = document.getElementById('btnPrev');
  var btnNext = document.getElementById('btnNext');

  function render() {
    var q = QUESTIONS[idx];
    elBar.style.width = ((idx) / QUESTIONS.length * 100) + '%';
    elMeta.textContent = 'Question ' + (idx + 1) + ' sur ' + QUESTIONS.length;
    elQ.textContent = q.question;
    elHint.textContent = q.hint || '';
    elHint.style.display = q.hint ? 'block' : 'none';
    elBody.innerHTML = '';
    btnPrev.classList.toggle('hidden', idx === 0);
    btnNext.textContent = (idx === QUESTIONS.length - 1) ? 'Voir mon bilan →' : 'Continuer →';

    if (q.type === 'number' || q.type === 'email') {
      var input = document.createElement('input');
      input.className = 'quiz-input';
      input.type = q.type === 'number' ? 'number' : 'email';
      input.id = 'fieldInput';
      input.placeholder = q.placeholder || '';
      if (q.min != null) input.min = q.min;
      if (q.max != null) input.max = q.max;
      if (answers[q.id] != null) input.value = answers[q.id];
      input.addEventListener('keydown', function (e) { if (e.key === 'Enter') btnNext.click(); });
      elBody.appendChild(input);
      setTimeout(function () { input.focus(); }, 50);

    } else if (q.type === 'scale') {
      var scale = document.createElement('div');
      scale.className = 'quiz-scale';
      SCALE_LABELS.forEach(function (lbl, n) {
        var o = document.createElement('div');
        o.className = 'opt' + (answers[q.id] === n ? ' selected' : '');
        o.innerHTML = '<span class="scale-num">' + n + '</span><span class="scale-lbl">' + lbl + '</span>';
        o.addEventListener('click', function () {
          answers[q.id] = n;
          [].forEach.call(scale.children, function (c) { c.classList.remove('selected'); });
          o.classList.add('selected');
        });
        scale.appendChild(o);
      });
      elBody.appendChild(scale);

    } else if (q.type === 'single' || q.type === 'multi') {
      var multi = q.type === 'multi';
      var listEl = document.createElement('div');
      listEl.className = 'opt-list';
      q.options.forEach(function (opt) {
        var selected = multi
          ? (answers[q.id] || []).indexOf(opt.value) > -1
          : answers[q.id] === opt.value;
        var o = document.createElement('div');
        o.className = 'opt' + (selected ? ' selected' : '');
        o.innerHTML = '<span class="opt-check' + (multi ? ' square' : '') + '">'
          + (selected ? '✓' : '') + '</span><span>' + opt.label + '</span>';
        o.addEventListener('click', function () {
          if (multi) {
            var cur = answers[q.id] || [];
            if (opt.exclusive) {
              cur = (cur.indexOf(opt.value) > -1) ? [] : [opt.value];
            } else {
              var i = cur.indexOf(opt.value);
              if (i > -1) cur.splice(i, 1); else cur.push(opt.value);
              cur = cur.filter(function (v) {
                var od = q.options.filter(function (x) { return x.value === v; })[0];
                return !(od && od.exclusive);
              });
            }
            answers[q.id] = cur;
            render();
          } else {
            answers[q.id] = opt.value;
            render();
          }
        });
        listEl.appendChild(o);
      });
      elBody.appendChild(listEl);
    }
  }

  function validate() {
    var q = QUESTIONS[idx];
    var v = answers[q.id];
    if (q.type === 'number') {
      var input = document.getElementById('fieldInput');
      var n = parseInt(input.value, 10);
      if (isNaN(n) || n < q.min || n > q.max) {
        alert('Merci d\'indiquer un âge entre ' + q.min + ' et ' + q.max + ' ans.');
        return false;
      }
      answers[q.id] = n;
      return true;
    }
    if (q.type === 'email') {
      var ie = document.getElementById('fieldInput');
      var val = (ie.value || '').trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
        alert('Merci d\'indiquer une adresse email valide.');
        return false;
      }
      answers[q.id] = val;
      return true;
    }
    if (q.type === 'scale') {
      if (v == null) { alert('Merci de sélectionner une réponse.'); return false; }
      return true;
    }
    if (q.type === 'single') {
      if (!v) { alert('Merci de sélectionner une réponse.'); return false; }
      return true;
    }
    if (q.type === 'multi') {
      if (!v || v.length === 0) { alert('Merci de sélectionner au moins une réponse.'); return false; }
      return true;
    }
    return true;
  }

  function showResults() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        answers: answers, date: new Date().toISOString()
      }));
    } catch (e) {}

    var analyses = buildAnalyses(answers);
    var ul = document.getElementById('analysisList');
    ul.innerHTML = '';
    analyses.forEach(function (item) {
      var li = document.createElement('li');
      li.innerHTML = '<span class="a-dot">●</span><span class="a-txt"><strong>'
        + item.name + '</strong><span>' + item.why + '</span></span>';
      ul.appendChild(li);
    });

    document.getElementById('resultSummary').textContent =
      'Selon vos réponses, voici ' + analyses.length
      + ' analyses utiles à demander à votre médecin. Conservez cette liste pour votre consultation.';

    elCard.style.display = 'none';
    elResult.classList.add('active');
    elBar.style.width = '100%';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  btnNext.addEventListener('click', function () {
    if (!validate()) return;
    if (idx === QUESTIONS.length - 1) { showResults(); return; }
    idx++;
    render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  btnPrev.addEventListener('click', function () {
    if (idx > 0) { idx--; render(); }
  });

  document.getElementById('btnRestart').addEventListener('click', function () {
    answers = {}; idx = 0;
    elResult.classList.remove('active');
    elCard.style.display = 'block';
    render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  document.getElementById('btnSpace').addEventListener('click', function () {
    var note = document.getElementById('spaceNote');
    note.style.display = 'block';
    note.innerHTML = 'Votre bilan est enregistré sur cet appareil. '
      + 'L\'espace privé sécurisé (dépôt de vos analyses et protocole personnalisé) '
      + 'est en cours de mise en place — nous vous préviendrons à l\'adresse <strong>'
      + (answers.email || '') + '</strong> dès son ouverture.';
  });

  render();
})();

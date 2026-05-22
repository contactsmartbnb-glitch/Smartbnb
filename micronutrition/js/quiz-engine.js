/* ============================================================
   Mehdia — Moteur de bilan (générique, multi-thèmes)
   Lit ?t= dans l'URL, charge le thème depuis quiz-data.js,
   affiche le questionnaire et calcule les analyses recommandées.
   ============================================================ */
(function () {

  var EMAIL_Q = {
    id: 'email', type: 'email',
    question: 'Où souhaitez-vous retrouver votre bilan ?',
    hint: 'Votre email sert uniquement à enregistrer votre bilan et créer votre espace. Aucun nom n\'est demandé.',
    placeholder: 'votre@email.fr'
  };

  function getTopicKey() {
    var m = /[?&]t=([a-z]+)/i.exec(window.location.search);
    var k = m ? m[1] : 'perimenopause';
    return TOPICS[k] ? k : 'perimenopause';
  }

  var topic = TOPICS[getTopicKey()];
  var QUESTIONS = topic.questions.concat([EMAIL_Q]);
  var STORAGE_KEY = 'mehdia-bilan-' + topic.slug;

  document.title = topic.metaTitle;
  var elEyebrow = document.getElementById('topicEyebrow');
  var elTopicName = document.getElementById('topicName');
  if (elEyebrow) elEyebrow.textContent = topic.eyebrow;
  if (elTopicName) elTopicName.textContent = topic.name;

  var idx = 0;
  var answers = {};

  var elCard   = document.getElementById('quizCard');
  var elResult = document.getElementById('resultCard');
  var elBar    = document.getElementById('progressBar');
  var elMeta   = document.getElementById('quizMeta');
  var elQ      = document.getElementById('quizQuestion');
  var elHint   = document.getElementById('quizHint');
  var elBody   = document.getElementById('quizBody');
  var btnPrev  = document.getElementById('btnPrev');
  var btnNext  = document.getElementById('btnNext');

  function render() {
    var q = QUESTIONS[idx];
    elBar.style.width = (idx / QUESTIONS.length * 100) + '%';
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
      var labels = q.scaleLabels || SCALE_DEFAULT;
      var scale = document.createElement('div');
      scale.className = 'quiz-scale';
      labels.forEach(function (lbl, n) {
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
        topic: topic.slug, answers: answers, date: new Date().toISOString()
      }));
    } catch (e) {}

    var analyses = topic.analyses(answers);
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

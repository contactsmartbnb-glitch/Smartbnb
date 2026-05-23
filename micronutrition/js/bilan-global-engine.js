/* ============================================================
   Mehdia — Moteur du Bilan Santé Global
   Lit GLOBAL_QUESTIONS (bilan-global-data.js).
   Gère showIf, scoring multi-piliers, affichage du profil.
   ============================================================ */
(function () {

  var idx = 0;
  var answers = {};

  /* Filtre dynamique selon showIf */
  function activeQuestions() {
    return GLOBAL_QUESTIONS.filter(function (q) {
      return !q.showIf || q.showIf(answers);
    });
  }
  function totalCount() { return activeQuestions().length; }
  function currentQ() {
    var list = activeQuestions();
    return list[Math.min(idx, list.length - 1)];
  }

  var elCard   = document.getElementById('quizCard');
  var elResult = document.getElementById('resultCard');
  var elBar    = document.getElementById('progressBar');
  var elMeta   = document.getElementById('quizMeta');
  var elQ      = document.getElementById('quizQuestion');
  var elHint   = document.getElementById('quizHint');
  var elBody   = document.getElementById('quizBody');
  var btnPrev  = document.getElementById('btnPrev');
  var btnNext  = document.getElementById('btnNext');

  var SECTION_LABEL = {
    'identité': 'Vous',
    'mode-de-vie': 'Mode de vie',
    'digestif': 'Tube digestif',
    'energie': 'Énergie',
    'acides-gras': 'Acides gras',
    'detox': 'Foie & détox',
    'immunite': 'Immunité',
    'glucose': 'Glucose',
    'mineraux': 'Minéraux & vit.',
    'hormones': 'Hormones',
    'final': 'Récupération'
  };

  function render() {
    var list = activeQuestions();
    if (idx >= list.length) idx = list.length - 1;
    var q = list[idx];

    elBar.style.width = (idx / list.length * 100) + '%';
    elMeta.textContent = (SECTION_LABEL[q.section] || 'Question') + ' · ' + (idx + 1) + ' sur ' + list.length;
    elQ.textContent = q.question;
    elHint.textContent = q.hint || '';
    elHint.style.display = q.hint ? 'block' : 'none';
    elBody.innerHTML = '';
    btnPrev.classList.toggle('hidden', idx === 0);
    btnNext.textContent = (idx === list.length - 1) ? 'Voir mon bilan global →' : 'Continuer →';

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
      var labels = q.scaleLabels || ['Aucun','Léger','Modéré','Important'];
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
    var q = currentQ();
    var v = answers[q.id];
    if (q.type === 'number') {
      var inp = document.getElementById('fieldInput');
      var n = parseInt(inp.value, 10);
      if (isNaN(n) || n < q.min || n > q.max) { alert('Merci d\'indiquer un âge entre ' + q.min + ' et ' + q.max + ' ans.'); return false; }
      answers[q.id] = n; return true;
    }
    if (q.type === 'email') {
      var ie = document.getElementById('fieldInput');
      var val = (ie.value || '').trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) { alert('Merci d\'indiquer une adresse email valide.'); return false; }
      answers[q.id] = val; return true;
    }
    if (q.type === 'scale')  { if (v == null) { alert('Merci de sélectionner une réponse.'); return false; } return true; }
    if (q.type === 'single') { if (!v) { alert('Merci de sélectionner une réponse.'); return false; } return true; }
    if (q.type === 'multi')  { if (!v || v.length === 0) { alert('Merci de sélectionner au moins une réponse.'); return false; } return true; }
    return true;
  }

  function showResults() {
    try {
      localStorage.setItem('mehdia-bilan-global', JSON.stringify({
        answers: answers, date: new Date().toISOString()
      }));
    } catch (e) {}

    var scores = scorePilier(answers);
    var entries = Object.keys(scores).map(function (k) { return [k, scores[k]]; });
    entries.sort(function (a, b) { return b[1] - a[1]; });
    var top3 = entries.slice(0, 3).map(function (e) { return e[0]; });

    /* PROFIL */
    document.getElementById('profileBlock').innerHTML = buildProfileText(answers, scores, top3);

    /* SCORES VISUELS — barre par pilier */
    var max = Math.max(1, entries[0][1]);
    var scoresBlock = document.getElementById('scoresBlock');
    scoresBlock.innerHTML = '';
    entries.forEach(function (e, i) {
      var k = e[0], val = e[1];
      var pct = Math.round((val / max) * 100);
      var color = i === 0 ? 'var(--green-d)' : i === 1 ? 'var(--green)' : i === 2 ? 'var(--green-br)' : 'var(--ink-2)';
      var row = document.createElement('div');
      row.className = 'score-row';
      row.innerHTML =
        '<span class="score-name">' + PILIER_LABELS[k].name + '</span>' +
        '<span class="score-meter"><i style="width:' + pct + '%;background:' + color + '"></i></span>' +
        '<span class="score-val">' + val + '</span>';
      scoresBlock.appendChild(row);
    });

    /* ANALYSES */
    var analyses = buildAnalyses(answers, top3);
    var analysesBlock = document.getElementById('analysesBlock');
    analysesBlock.innerHTML = '';
    analyses.forEach(function (a, i) {
      var card = document.createElement('div');
      card.className = 'analysis-card';
      var badge = a.priority === 1 ? ' <span style="background:var(--green-d);color:#fff;padding:2px 8px;border-radius:10px;font-size:.7rem;margin-left:6px">PRIORITÉ</span>' : '';
      card.innerHTML = '<span class="ac-num">' + (i + 1) + '</span>'
        + '<div class="ac-body"><strong>' + a.name + badge + '</strong><span>' + a.why + '</span></div>';
      analysesBlock.appendChild(card);
    });
    var sc = document.getElementById('statCount');
    if (sc) sc.textContent = analyses.length;

    /* ACTIONS */
    var actions = buildActions(answers, top3);
    var actionsBlock = document.getElementById('actionsBlock');
    actionsBlock.innerHTML = '';
    actions.forEach(function (a, i) {
      var box = document.createElement('div');
      box.className = 'action-box';
      box.innerHTML = '<div class="action-num">' + (i + 1) + '</div>'
        + '<h4>' + a.title + '</h4>'
        + '<p>' + a.body + '</p>';
      actionsBlock.appendChild(box);
    });

    /* LINKS vers piliers prioritaires */
    var linksBlock = document.getElementById('linksBlock');
    linksBlock.innerHTML = '';
    top3.forEach(function (k) {
      var lbl = PILIER_LABELS[k];
      var a = document.createElement('a');
      a.href = 'piliers/pilier.html?p=' + lbl.slug;
      a.className = 'btn btn-ghost';
      a.style.margin = '0 6px 8px 0';
      a.textContent = '→ ' + lbl.name;
      linksBlock.appendChild(a);
    });

    elCard.style.display = 'none';
    elResult.classList.add('active');
    elBar.style.width = '100%';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  btnNext.addEventListener('click', function () {
    if (!validate()) return;
    var list = activeQuestions();
    if (idx === list.length - 1) { showResults(); return; }
    idx++;
    render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  btnPrev.addEventListener('click', function () {
    if (idx > 0) { idx--; render(); }
  });

  var btnRestart = document.getElementById('btnRestart');
  if (btnRestart) btnRestart.addEventListener('click', function () {
    answers = {}; idx = 0;
    elResult.classList.remove('active');
    elCard.style.display = 'block';
    render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  render();
})();

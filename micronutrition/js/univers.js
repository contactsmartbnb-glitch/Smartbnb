/* ============================================================
   Mehdia — Page d'univers (Femmes / Hommes / Enfants / Seniors)
   Lit ?u= dans l'URL et affiche les bilans de cet univers.
   ============================================================ */
(function () {
  var m = /[?&]u=([a-z]+)/i.exec(window.location.search);
  var key = (m && AUDIENCES[m[1]]) ? m[1] : 'femme';
  var aud = AUDIENCES[key];

  document.title = aud.metaTitle;

  var elEyebrow = document.getElementById('audEyebrow');
  var elName    = document.getElementById('audName');
  var elIntro   = document.getElementById('audIntro');
  if (elEyebrow) elEyebrow.textContent = aud.eyebrow;
  if (elName)    elName.textContent = aud.icon + '  Univers ' + aud.name;
  if (elIntro)   elIntro.textContent = aud.intro;

  var grid = document.getElementById('bilanGrid');
  if (!grid) return;
  grid.innerHTML = '';

  aud.topics.forEach(function (slug) {
    var t = TOPICS[slug];
    if (!t) return;
    var a = document.createElement('a');
    a.className = 'theme-card is-link';
    a.href = 'bilan.html?t=' + slug;
    a.innerHTML =
      '<div class="theme-icon">' + t.icon + '</div>' +
      '<span class="theme-meta">● environ 5 min · gratuit</span>' +
      '<h3>' + t.name + '</h3>' +
      '<p>' + t.blurb + '</p>' +
      '<span class="card-link">Faire ce bilan →</span>';
    grid.appendChild(a);
  });

  // Liens vers les autres univers
  var nav = document.getElementById('audSwitch');
  if (nav) {
    Object.keys(AUDIENCES).forEach(function (k) {
      var u = AUDIENCES[k];
      var link = document.createElement('a');
      link.href = 'univers.html?u=' + k;
      link.className = 'aud-chip' + (k === key ? ' active' : '');
      link.innerHTML = u.icon + ' ' + u.name;
      nav.appendChild(link);
    });
  }
})();

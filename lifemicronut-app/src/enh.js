(function(){
  /* ALLREQ : dans ce bilan, toute question visible bloque « Suivant » (digestion) ; sinon seules celles marquées * (fatigue). */
  var ALLREQ=__ALLREQ__;
  function id(x){return document.getElementById(x);}
  var ANSW='.opts,.scale,.s10,input,textarea,select';
  function isQ(q){
    if(q.classList.contains('warn')||q.classList.contains('note')||q.classList.contains('sub')) return false;
    if(!q.querySelector(ANSW)) return false;
    return q.offsetParent!==null;
  }
  function answered(q){
    if(q.querySelector('input[type=radio]:checked,input[type=checkbox]:checked')) return true;
    if(q.querySelector('.s10 .on')) return true;
    var t=q.querySelector('input[type=text],input[type=date],input[type=number],textarea');
    return !!(t&&t.value&&String(t.value).trim());
  }
  function blocking(q){ return ALLREQ || !!q.querySelector('.req'); }
  function questions(){ return [].filter.call(document.querySelectorAll('#page .q'),isQ); }
  function pageKey(){ return document.documentElement.getAttribute('data-page')||''; }
  function warnCount(){ return [].filter.call(document.querySelectorAll('#page .q.warn'),function(w){return w.offsetParent!==null;}).length; }
  function badge(){
    if(id('lmn-save-badge')) return;
    var top=id('topin'); if(!top) return;
    var b=document.createElement('div'); b.id='lmn-save-badge';
    b.innerHTML='<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 13l4 4L19 7"/></svg><span>Vos réponses sont enregistrées sur cet appareil — vous pouvez fermer et revenir.</span>';
    top.appendChild(b);
  }
  function markMissing(){
    [].forEach.call(document.querySelectorAll('#page .q'),function(q){
      q.classList.toggle('lmn-req', isQ(q) && blocking(q) && !answered(q));
    });
  }
  function firstMissing(){
    var l=questions();
    for(var i=0;i<l.length;i++){ if(blocking(l[i]) && !answered(l[i])) return l[i]; }
    return null;
  }
  /* Auto-avance : seulement quand un clic/tap vient de donner la DERNIÈRE réponse manquante de la page.
     Jamais au clavier (les flèches changent la sélection), jamais quand on corrige une réponse,
     jamais si un avertissement vient d'apparaître, jamais vers la page de fin. */
  var lastPtr=0, ptr=null;
  function wirePage(){
    var pg=id('page'); if(!pg||pg.getAttribute('data-lmn')) return;
    pg.setAttribute('data-lmn','1');
    pg.addEventListener('pointerdown',function(ev){
      var q=ev.target&&ev.target.closest?ev.target.closest('.q'):null;
      lastPtr=Date.now(); ptr={q:q, was:q?answered(q):true, warns:warnCount(), key:pageKey()};
    },true);
    pg.addEventListener('change',function(ev){
      setTimeout(markMissing,0);
      var t=ev.target; if(!t||t.type!=='radio') return;
      if(t.closest('.scale')||t.closest('.s10')) return;
      if(!ptr||Date.now()-lastPtr>1500) return;
      var q=t.closest('.q'); if(!q||ptr.q!==q||ptr.was) return;
      var key=ptr.key, warns=ptr.warns;
      setTimeout(function(){
        if(pageKey()!==key) return;
        if(warnCount()>warns) return;
        if(questions().some(function(x){return !answered(x);})) return;
        var n=id('next'); if(!n||n.hidden||n.disabled) return;
        if(/terminer/i.test(n.textContent||'')) return;
        n.click();
      },320);
    });
    pg.addEventListener('input',function(){ setTimeout(markMissing,0); });
    pg.addEventListener('click',function(){ setTimeout(markMissing,30); });
  }
  function wireMiss(){
    var m=id('miss'); if(!m||m.getAttribute('data-lmn')) return;
    m.setAttribute('data-lmn','1'); m.setAttribute('role','button'); m.setAttribute('tabindex','0');
    m.title='Aller à la première question sans réponse';
    function go(){
      var q=firstMissing(); if(!q) return;
      try{ q.scrollIntoView({behavior:'smooth',block:'center'}); }catch(e){ try{q.scrollIntoView();}catch(_){} }
      q.classList.remove('lmn-flash'); void q.offsetWidth; q.classList.add('lmn-flash');
      setTimeout(function(){ q.classList.remove('lmn-flash'); },1700);
    }
    m.addEventListener('click',go);
    m.addEventListener('keydown',function(e){ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); go(); } });
  }
  function tick(){ try{badge();wirePage();wireMiss();markMissing();}catch(e){} }
  if(window.MutationObserver){ var pgEl=id('page'); if(pgEl) new MutationObserver(tick).observe(pgEl,{childList:true}); }
  tick(); setTimeout(tick,300); setTimeout(tick,1200);
})();

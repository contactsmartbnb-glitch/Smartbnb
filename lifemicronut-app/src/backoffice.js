(function(){
  var SB_URL='https://ioetcwpsnvoavwpwnumi.supabase.co';
  var SB_KEY='sb_publishable_2cPPR1QkBvHEOKQChjKTcA_h-s9NW6h';
  var BILAN_LABEL={digestion:'Digestion',fatigue:'Fatigue'};
  var token=null, refresh=null, rows=[], current=null, filter='en_attente';
  function $(s,r){return (r||document).querySelector(s);}
  function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function fmtDate(s){try{var d=new Date(s);return d.toLocaleDateString('fr-FR')+' '+d.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'});}catch(e){return String(s);}}

  /* ---- Assainissement : le rapport reçu vient d'un navigateur inconnu, on ne garde que du texte mis en forme ---- */
  var OK_TAGS={DIV:1,P:1,SPAN:1,B:1,STRONG:1,I:1,EM:1,U:1,BR:1,HR:1,H1:1,H2:1,H3:1,H4:1,UL:1,OL:1,LI:1,SECTION:1,SMALL:1,BLOCKQUOTE:1};
  var DROP_TAGS={SCRIPT:1,STYLE:1,IFRAME:1,OBJECT:1,EMBED:1,LINK:1,META:1,BASE:1,FORM:1,INPUT:1,BUTTON:1,TEXTAREA:1,SELECT:1,SVG:1,MATH:1,IMG:1,VIDEO:1,AUDIO:1,SOURCE:1,TEMPLATE:1,NOSCRIPT:1,TITLE:1,HEAD:1};
  function clean(node, out){
    for(var c=node.firstChild;c;c=c.nextSibling){
      if(c.nodeType===3){ out.appendChild(document.createTextNode(c.nodeValue)); continue; }
      if(c.nodeType!==1) continue;
      var tag=String(c.nodeName).toUpperCase();
      if(DROP_TAGS[tag]) continue;
      if(OK_TAGS[tag]){
        var el=document.createElement(tag.toLowerCase());
        var cls=c.getAttribute('class'); if(cls && /^[\w\- ]{1,120}$/.test(cls)) el.setAttribute('class',cls);
        clean(c, el); out.appendChild(el);
      } else { clean(c, out); }           /* balise inconnue : on garde seulement son texte */
    }
  }
  function sanitize(html){
    var doc=new DOMParser().parseFromString('<body>'+String(html==null?'':html)+'</body>','text/html');
    var box=document.createElement('div'); clean(doc.body, box); return box.innerHTML;
  }

  /* ---- Appels Supabase, avec renouvellement de session ---- */
  function hdr(){ var h={'apikey':SB_KEY,'Content-Type':'application/json'}; if(token) h['Authorization']='Bearer '+token; return h; }
  function keep(){ try{ sessionStorage.setItem('lmn_bo_tok',token||''); sessionStorage.setItem('lmn_bo_ref',refresh||''); }catch(e){} }
  function renew(){
    if(!refresh) return Promise.reject(new Error('session'));
    return fetch(SB_URL+'/auth/v1/token?grant_type=refresh_token',{method:'POST',headers:{'apikey':SB_KEY,'Content-Type':'application/json'},body:JSON.stringify({refresh_token:refresh})})
      .then(function(r){ return r.json().then(function(j){ if(!r.ok||!j.access_token) throw new Error('session'); token=j.access_token; refresh=j.refresh_token||refresh; keep(); }); });
  }
  function api(path, opt, retried){
    opt=opt||{}; var h=hdr(); if(opt.prefer) h['Prefer']=opt.prefer;
    return fetch(SB_URL+path,{method:opt.method||'GET',headers:h,body:opt.body}).then(function(r){
      if(r.status===401 && !retried) return renew().then(function(){ return api(path,opt,true); });
      if(r.status===401) throw new Error('session');
      if(!r.ok) throw new Error('http '+r.status);
      return r.status===204 ? null : r.text().then(function(t){ return t?JSON.parse(t):null; });
    });
  }
  function sessionLost(){ token=null; refresh=null; try{sessionStorage.removeItem('lmn_bo_tok');sessionStorage.removeItem('lmn_bo_ref');}catch(e){} $('#app').classList.add('hide'); $('#login').classList.remove('hide'); $('#li-err').textContent='Session expirée. Reconnectez-vous.'; }

  /* ---- Connexion ---- */
  $('#loginform').addEventListener('submit',function(e){
    e.preventDefault();
    var mail=$('#li-mail').value.trim(), pass=$('#li-pass').value, err=$('#li-err'), btn=$('#li-btn');
    err.textContent=''; btn.disabled=true; btn.textContent='Connexion…';
    fetch(SB_URL+'/auth/v1/token?grant_type=password',{method:'POST',headers:{'apikey':SB_KEY,'Content-Type':'application/json'},body:JSON.stringify({email:mail,password:pass})})
      .then(function(r){return r.json().then(function(j){return {ok:r.ok,j:j};});})
      .then(function(res){
        if(!res.ok||!res.j.access_token) throw new Error('Identifiants incorrects.');
        token=res.j.access_token; refresh=res.j.refresh_token||null; keep();
        try{sessionStorage.setItem('lmn_bo_mail',mail);}catch(e){}
        $('#li-pass').value=''; btn.disabled=false; btn.textContent='Se connecter'; enterApp(mail);
      })
      .catch(function(e){ err.textContent=(e&&e.message)||'Connexion impossible.'; btn.disabled=false; btn.textContent='Se connecter'; });
  });
  function enterApp(mail){ $('#login').classList.add('hide'); $('#app').classList.remove('hide'); $('#who').textContent=mail||''; load(); }
  $('#logout').onclick=function(){
    var t=token; token=null; refresh=null; current=null; rows=[];
    try{sessionStorage.removeItem('lmn_bo_tok');sessionStorage.removeItem('lmn_bo_ref');}catch(e){}
    if(t){ try{ fetch(SB_URL+'/auth/v1/logout',{method:'POST',headers:{'apikey':SB_KEY,'Authorization':'Bearer '+t}}); }catch(e){} }
    $('#panel').innerHTML='<div class="empty">Sélectionnez une demande à gauche pour la relire.</div>'; $('#list').innerHTML='';
    $('#app').classList.add('hide'); $('#login').classList.remove('hide');
  };
  $('#refresh').onclick=function(){ load(); };
  [].forEach.call(document.querySelectorAll('#filters .chip'),function(c){ c.onclick=function(){ filter=c.getAttribute('data-f'); [].forEach.call(document.querySelectorAll('#filters .chip'),function(x){ var on=x===c; x.classList.toggle('on',on); x.setAttribute('aria-pressed',on?'true':'false'); }); renderList(); }; });

  /* ---- Données ---- */
  function load(){
    var lst=$('#list'); lst.innerHTML='<p class="hint">Chargement…</p>';
    api('/rest/v1/demandes?select=*&order=created_at.desc')
      .then(function(data){ rows=Array.isArray(data)?data:[]; renderList(); if(current){ var u=rows.filter(function(x){return x.id===current.id;})[0]; if(u) current=u; } })
      .catch(function(e){ if(e&&e.message==='session'){ sessionLost(); return; } lst.innerHTML='<p class="hint err">Lecture impossible. Le script SQL des droits a-t-il été exécuté dans Supabase ?</p>'; });
  }
  function statutLabel(s){return s==='en_attente'?'À relire':s==='valide'?'Validé':s==='envoye'?'Envoyé':String(s);}
  function renderList(){
    var lst=$('#list'), f=rows.filter(function(r){return filter==='all'?true:r.statut===filter;});
    var n=rows.filter(function(r){return r.statut==='en_attente';}).length; var c=$('#filters .chip[data-f="en_attente"]'); if(c) c.textContent='À relire'+(n?' ('+n+')':'');
    if(!f.length){ lst.innerHTML='<p class="hint">Aucune demande ici.</p>'; return; }
    lst.innerHTML='';
    f.forEach(function(r){
      var b=document.createElement('button'); b.className='item'+(current&&current.id===r.id?' sel':''); b.type='button';
      b.innerHTML='<div class="r1"><span class="em">'+esc(r.email)+'</span></div><div class="r2"><span class="badge '+esc(r.statut)+'">'+esc(statutLabel(r.statut))+'</span><span class="badge bilan">'+esc(BILAN_LABEL[r.bilan]||r.bilan)+'</span>'+(r.paiement==='verifie'?'<span class="badge valide">Payé</span>':'')+'<span>'+esc(fmtDate(r.created_at))+'</span></div>';
      b.onclick=function(){ openDemande(r); };
      lst.appendChild(b);
    });
  }

  /* ---- Détail ---- */
  var dirty=false;
  window.addEventListener('beforeunload',function(e){ if(dirty){ e.preventDefault(); e.returnValue=''; } });
  function openDemande(r){
    if(dirty && current && current.id!==r.id && !confirm('Des corrections ne sont pas enregistrées. Les abandonner ?')) return;
    current=r; dirty=false; renderList();
    var sent=r.statut==='envoye';
    var p=$('#panel');
    p.innerHTML='<div class="phead"><div class="meta"><span class="em">'+esc(r.email)+'</span><div class="d">'+esc(BILAN_LABEL[r.bilan]||r.bilan)+' · reçu le '+esc(fmtDate(r.created_at))+(r.sent_at?' · envoyé le '+esc(fmtDate(r.sent_at)):'')+'</div></div><span class="badge '+esc(r.statut)+'">'+esc(statutLabel(r.statut))+'</span></div>'
      +'<div class="pbody">'
      +'<label class="pay"><input type="checkbox" id="paid"'+(r.paiement==='verifie'?' checked':'')+(sent?' disabled':'')+'> <span>Paiement PayPal vérifié pour cette adresse</span></label>'
      +'<details class="rep"><summary>Voir les réponses du questionnaire</summary><div class="rc" id="repc"></div></details>'
      +'<p class="sec-t">Rapport — relisez et corrigez librement</p>'
      +'<p class="edit-note">Cliquez dans le texte pour le modifier. « Valider &amp; envoyer » enverra ce rapport par e-mail à '+esc(r.email)+'.</p>'
      +'<div class="editor"><div class="rapedit" id="rapedit" role="textbox" aria-multiline="true" aria-label="Rapport à relire"'+(sent?'':' contenteditable="true"')+'></div></div>'
      +'<div class="actions"><button class="btn ghost" id="save-draft"'+(sent?' disabled':'')+'>Enregistrer le brouillon</button><span class="sp"></span><span class="savemsg" id="savemsg" role="status" aria-live="polite"></span><button class="btn" id="validate"'+(sent?' disabled':'')+'>'+(sent?'Déjà envoyé':'Valider &amp; envoyer')+'</button></div>'
      +'</div>';
    $('#rapedit').innerHTML=sanitize(r.rapport_final||r.rapport_auto)||'<p>(aucun rapport généré)</p>';
    $('#rapedit').addEventListener('input',function(){ dirty=true; });
    renderReponses($('#repc'), r.reponses);
    $('#save-draft').onclick=function(){ saveDraft(r); };
    $('#validate').onclick=function(){ validate(r); };
    $('#paid').onchange=function(){ var v=this.checked?'verifie':'a_verifier'; patch(r,{paiement:v},v==='verifie'?'Paiement noté comme vérifié.':'Paiement à vérifier.',null); };
  }
  function renderReponses(box, rep){
    if(!rep||typeof rep!=='object'||!Object.keys(rep).length){ box.textContent='(pas de réponses enregistrées)'; return; }
    box.innerHTML='';
    Object.keys(rep).forEach(function(k){
      if(k.charAt(0)==='_') return;
      var v=rep[k]; if(Array.isArray(v)) v=v.join(', '); else if(v&&typeof v==='object') v=JSON.stringify(v);
      var d=document.createElement('div'); d.className='repline';
      var a=document.createElement('span'); a.className='k'; a.textContent=k; var b=document.createElement('span'); b.className='v'; b.textContent=String(v==null?'':v);
      d.appendChild(a); d.appendChild(b); box.appendChild(d);
    });
  }
  function patch(r, body, okmsg, btn){
    var msg=$('#savemsg'); if(msg){ msg.className='savemsg'; msg.textContent=''; }
    var orig=btn?btn.innerHTML:''; if(btn){ btn.disabled=true; btn.innerHTML='<span class="spin"></span>'; }
    return api('/rest/v1/demandes?id=eq.'+encodeURIComponent(r.id),{method:'PATCH',prefer:'return=minimal',body:JSON.stringify(body)})
      .then(function(){ for(var k in body) r[k]=body[k]; if(msg){ msg.textContent=okmsg; } if(btn){ btn.disabled=false; btn.innerHTML=orig; } return true; })
      .catch(function(e){ if(e&&e.message==='session'){ sessionLost(); return false; } if(msg){ msg.className='savemsg err'; msg.textContent='Échec de l\'enregistrement.'; } if(btn){ btn.disabled=false; btn.innerHTML=orig; } return false; });
  }
  function saveDraft(r){ patch(r,{rapport_final:sanitize($('#rapedit').innerHTML)},'Brouillon enregistré.',$('#save-draft')).then(function(ok){ if(ok) dirty=false; }); }
  function validate(r){
    var paid=$('#paid')&&$('#paid').checked;
    var q=(paid?'':'Le paiement n\'est pas noté comme vérifié.\n\n')+'Valider ce bilan et l\'envoyer par e-mail à '+r.email+' ?';
    if(!confirm(q)) return;
    patch(r,{rapport_final:sanitize($('#rapedit').innerHTML),statut:'valide'},'Validé — e-mail en cours d\'envoi.',$('#validate')).then(function(ok){ if(ok){ dirty=false; setTimeout(function(){ load(); },1500); } });
  }

  /* reprise de session */
  try{ var t=sessionStorage.getItem('lmn_bo_tok'); if(t){ token=t; refresh=sessionStorage.getItem('lmn_bo_ref')||null; enterApp(sessionStorage.getItem('lmn_bo_mail')||''); } }catch(e){}
})();

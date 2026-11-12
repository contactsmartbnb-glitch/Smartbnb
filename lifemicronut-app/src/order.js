(function(){
  var SB_URL='https://ioetcwpsnvoavwpwnumi.supabase.co';
  var SB_KEY='sb_publishable_2cPPR1QkBvHEOKQChjKTcA_h-s9NW6h';
  var BILAN='__BILAN__', PAY='__PAY_URL__';
  function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
  function report(){ try{ if(window.lmnFullHTML) return window.lmnFullHTML(window.A||{}); }catch(e){} return ''; }
  function pay(){ try{ window.open(PAY,'_blank','noopener'); }catch(e){} }
  function install(){
    var ps=document.getElementById('lmn-pay-start');
    if(!ps || ps.getAttribute('data-lmn-order')) return;
    ps.setAttribute('data-lmn-order','1');
    var s2=document.getElementById('lmn-pay-step2'); if(s2) s2.style.display='none';
    var lock=ps.closest?ps.closest('.lmn-lock'):null;
    var box=document.createElement('div'); box.id='lmn-order-box'; box.style.display='none';
    box.innerHTML='<p class="lmn-order-lead">Votre bilan sera <b>relu et validé par Dr AICHE, pharmacienne</b>, puis envoyé à votre adresse e-mail sous <b>24 à 48 h</b>.</p>'
      +'<label class="lmn-order-l" for="lmn-order-mail">Votre e-mail</label>'
      +'<input type="email" id="lmn-order-mail" name="email" placeholder="prenom@exemple.fr" autocomplete="email" inputmode="email" required aria-describedby="lmn-order-msg">'
      +'<div class="lmn-order-hp" aria-hidden="true"><label>Ne pas remplir<input type="text" id="lmn-order-web" tabindex="-1" autocomplete="off"></label></div>'
      +'<div class="lmn-order-rgpd-box" id="lmn-order-rgpd-box">En envoyant votre demande, vos réponses au questionnaire et votre e-mail sont transmis à LifeMicroNut (hébergement dans l\'Union européenne), uniquement pour établir votre bilan et vous l\'envoyer. Ils ne sont jamais revendus. Vous pouvez en demander la suppression à tout moment en écrivant à lifemicronut@gmail.com.</div>'
      +'<label class="lmn-order-c" for="lmn-order-cons"><input type="checkbox" id="lmn-order-cons"> <span>J\'accepte que mes réponses (données de santé) soient transmises à LifeMicroNut pour établir mon bilan et me l\'envoyer par e-mail. <a href="#" id="lmn-order-rgpd" aria-controls="lmn-order-rgpd-box" aria-expanded="false">En savoir plus</a></span></label>'
      +'<button type="button" id="lmn-order-send" class="lmn-btn-primary">Envoyer ma demande</button>'
      +'<p id="lmn-order-msg" class="lmn-order-msg" role="status" aria-live="polite"></p>'
      +'<p class="lmn-order-pay">La page de paiement ne s\'est pas ouverte ? <a href="'+esc(PAY)+'" target="_blank" rel="noopener">Ouvrir le paiement sécurisé</a></p>';
    ps.parentNode.insertBefore(box, ps.nextSibling);
    ps.onclick=function(){
      pay(); box.style.display='block'; if(lock) lock.classList.add('lmn-ordering');
      ps.textContent='Étape 2 — indiquez où envoyer votre bilan'; ps.disabled=true;
      var m=document.getElementById('lmn-order-mail'); if(m){ try{ m.focus({preventScroll:true}); }catch(e){ m.focus(); } }
      try{ box.scrollIntoView({behavior:'smooth',block:'center'}); }catch(e){}
    };
    var rg=document.getElementById('lmn-order-rgpd');
    if(rg) rg.onclick=function(e){ e.preventDefault(); var b=document.getElementById('lmn-order-rgpd-box'); if(!b) return; var open=b.style.display!=='block'; b.style.display=open?'block':'none'; rg.setAttribute('aria-expanded',open?'true':'false'); };
    var sending=false;
    function send(){
      if(sending) return;
      var mailEl=document.getElementById('lmn-order-mail'), msg=document.getElementById('lmn-order-msg'), btn=document.getElementById('lmn-order-send');
      var mail=(mailEl.value||'').trim();
      var cons=document.getElementById('lmn-order-cons').checked;
      if(!/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(mail)||mail.length>254){ msg.className='lmn-order-msg err'; msg.textContent='Merci d\'indiquer une adresse e-mail valide.'; mailEl.focus(); return; }
      if(!cons){ msg.className='lmn-order-msg err'; msg.textContent='Merci de cocher la case d\'accord pour que nous puissions traiter votre demande.'; return; }
      function ok(){
        box.innerHTML='<div class="lmn-order-ok" role="status"><div class="lmn-order-ok-i" aria-hidden="true">✓</div><p class="lmn-order-ok-t">Merci, votre demande est bien enregistrée.</p><p class="lmn-order-ok-s">Dr AICHE relit votre bilan et vous l\'envoie à <b>'+esc(mail)+'</b> sous 24 à 48 h. Pensez à vérifier vos courriers indésirables.</p></div>';
        ps.style.display='none';
      }
      var hp=document.getElementById('lmn-order-web'); if(hp&&hp.value){ ok(); return; }   /* robot : on n'envoie rien */
      sending=true; btn.disabled=true; btn.textContent='Envoi…'; msg.className='lmn-order-msg'; msg.textContent='';
      var payload={bilan:BILAN,email:mail,reponses:(window.A||{}),rapport_auto:report(),consentement:true,consent_at:new Date().toISOString()};
      fetch(SB_URL+'/rest/v1/demandes',{method:'POST',headers:{'apikey':SB_KEY,'Authorization':'Bearer '+SB_KEY,'Content-Type':'application/json','Prefer':'return=minimal'},body:JSON.stringify(payload)})
        .then(function(r){ if(!r.ok) throw new Error(r.status); ok(); })
        .catch(function(){ sending=false; msg.className='lmn-order-msg err'; msg.textContent='Un souci technique est survenu. Réessayez dans un instant, ou écrivez-nous à lifemicronut@gmail.com.'; btn.disabled=false; btn.textContent='Envoyer ma demande'; });
    }
    document.getElementById('lmn-order-send').onclick=send;
    document.getElementById('lmn-order-mail').addEventListener('keydown',function(e){ if(e.key==='Enter'){ e.preventDefault(); send(); } });
  }
  var pg=document.getElementById('page');
  if(window.MutationObserver && pg){ new MutationObserver(function(){ setTimeout(install,0); }).observe(pg,{childList:true,subtree:true}); }
  setTimeout(install,400);
})();

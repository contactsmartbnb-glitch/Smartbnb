const { chromium } = require('/opt/node22/lib/node_modules/playwright');
(async()=>{ const b=await chromium.launch({args:['--no-sandbox']}); const pg=await b.newPage({viewport:{width:1200,height:850}});
 const errs=[], csp=[]; pg.on('pageerror',e=>errs.push(e.message)); pg.on('console',m=>{ if(/Content Security Policy|Refused/.test(m.text())) csp.push(m.text().slice(0,140)); });
 let patched=null, calls=0;
 const EVIL='<div class="lmn-rap"><h2>Rapport</h2><p onclick="window.__xss=3">Texte <b>gras</b></p><img src=x onerror="window.__xss=1"><script>window.__xss=2<\/script><a href="javascript:window.__xss=4">lien</a><svg onload="window.__xss=5"></svg><iframe src="https://evil.example"></iframe><style>body{display:none}</style></div>';
 await pg.route(/supabase\.co\/auth\/v1\/token/, r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({access_token:'tok'+(++calls),refresh_token:'ref',user:{email:'x'}})}));
 await pg.route(/supabase\.co\/auth\/v1\/logout/, r=>r.fulfill({status:204,body:''}));
 let first401=true;
 await pg.route(/supabase\.co\/rest\/v1\/demandes/, r=>{ const rq=r.request();
   if(rq.method()==='GET'){ if(first401){ first401=false; return r.fulfill({status:401,body:'{}'}); }
     return r.fulfill({status:200,contentType:'application/json',body:JSON.stringify([{id:'11111111-1111-1111-1111-111111111111',created_at:'2026-11-12T10:00:00Z',bilan:'digestion',email:'client"><img src=x onerror=window.__xss=9>@ex.fr',reponses:{atb5:'<img src=x onerror=window.__xss=8>',_bio:{}},rapport_auto:EVIL,rapport_final:null,statut:'en_attente',paiement:'a_verifier'}])}); }
   patched=JSON.parse(rq.postData()); return r.fulfill({status:204,body:''}); });
 await pg.goto('file:///home/user/Smartbnb/lifemicronut-app/backoffice.html'); await pg.waitForTimeout(300);
 await pg.fill('#li-pass','secret'); await pg.click('#li-btn'); await pg.waitForSelector('#list .item',{timeout:5000});
 console.log('connexion + liste OK (script exécuté sous CSP) ; renouvellement de session après 401 : appels token =',calls);
 await pg.click('#list .item'); await pg.waitForSelector('#rapedit'); await pg.waitForTimeout(500);
 const r=await pg.evaluate(()=>({xss:window.__xss, html:document.getElementById('rapedit').innerHTML, imgs:document.querySelectorAll('#panel img,#panel script,#panel iframe,#panel svg,#panel style,#panel a').length, onattrs:[].filter.call(document.querySelectorAll('#rapedit *'),e=>[].some.call(e.attributes,a=>/^on/i.test(a.name))).length}));
 console.log('XSS exécuté ?', r.xss===undefined?'NON':'OUI('+r.xss+')', '| éléments dangereux restants:', r.imgs, '| attributs on*:', r.onattrs); console.log('HTML assaini:', r.html);
 pg.on('dialog',d=>d.accept());
 await pg.check('#paid'); await pg.waitForTimeout(300); console.log('PATCH paiement:', JSON.stringify(patched));
 await pg.click('#rapedit p'); await pg.keyboard.type(' corrigé'); await pg.click('#validate'); await pg.waitForTimeout(600);
 console.log('PATCH validation:', JSON.stringify(patched).slice(0,220)); console.log('CSP violations:', csp.length, csp.slice(0,2)); console.log('erreurs JS:', errs);
 await pg.screenshot({path:'v2_backoffice.png'}); await b.close(); })();

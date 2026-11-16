const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const APP='file:///home/user/Smartbnb/lifemicronut-app/';
(async()=>{ const b=await chromium.launch({args:['--no-sandbox']});
  const R=[]; const ok=(n,c,x)=>R.push((c?'OK  ':'FAIL')+' '+n+(x!==undefined?'  → '+JSON.stringify(x):''));
  const step=pg=>pg.textContent('#step'); const key=pg=>pg.evaluate(()=>document.documentElement.getAttribute('data-page'));
  // ---------- DIGESTION desktop : auto-avance souris / pas au clavier ----------
  let pg=await b.newPage({viewport:{width:1100,height:850}}); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
  await pg.route(/supabase\.co|paypal\.com/, r=>r.abort());
  await pg.goto(APP+'digestion.html#app'); await pg.waitForTimeout(800);
  ok('badge visible page intro', await pg.isVisible('#lmn-save-badge'));
  ok('liseré sur 2 consentements', await pg.$$eval('#page .q.lmn-req',e=>e.length)===2);
  // clavier : focus 1er radio + espace -> coche ; ne doit PAS auto-avancer même si page complète
  await pg.focus('#page .q input[type=radio]'); await pg.keyboard.press('Space'); 
  const r2=await pg.$$('#page .q input[type=radio]'); await r2[1].focus(); await pg.keyboard.press('Space'); await pg.waitForTimeout(700);
  ok('clavier : pas d\'auto-avance', (await key(pg))==='intro', await step(pg));
  // recharger proprement et tester à la souris
  await pg.evaluate(()=>{localStorage.clear();}); await pg.reload(); await pg.waitForTimeout(800);
  await pg.click('text=Oui, j\'ai compris'); await pg.waitForTimeout(500);
  ok('souris 1/2 : reste sur intro', (await key(pg))==='intro');
  await pg.click('text=Oui, j\'accepte'); await pg.waitForTimeout(800);
  ok('souris 2/2 : auto-avance vers securite', (await key(pg))==='securite', await step(pg));
  ok('badge encore visible sur securite', await pg.isVisible('#lmn-save-badge'));
  // retour arrière puis re-clic sur une réponse déjà donnée : pas d'auto-avance (correction)
  await pg.click('#prev'); await pg.waitForTimeout(400);
  await pg.click('text=Oui, j\'accepte'); await pg.waitForTimeout(700);
  ok('correction d\'une réponse : pas d\'auto-avance', (await key(pg))==='intro');
  await pg.close();
  // ---------- FATIGUE mobile : liseré = requis seulement, pas d'auto-avance prématurée ----------
  const ctx=await b.newContext({viewport:{width:390,height:780},isMobile:true,hasTouch:true}); pg=await ctx.newPage(); pg.on('pageerror',e=>errs.push(e.message));
  await pg.route(/supabase\.co|paypal\.com/, r=>r.abort());
  await pg.goto(APP+'fatigue.html#app'); await pg.waitForTimeout(800);
  await pg.tap('text=Oui, j\'ai compris'); await pg.waitForTimeout(300); await pg.tap('text=Oui, j\'accepte'); await pg.waitForTimeout(800);
  ok('fatigue tap : auto-avance intro→securite', (await key(pg))==='securite');
  await pg.evaluate(()=>{ var d=document.querySelector('#page input[type=date]'); d.value='1984-06-15'; d.dispatchEvent(new Event('input',{bubbles:true})); });
  await pg.tap('#page .q:has(#sexe) label:has-text("Homme")').catch(async()=>{ await pg.tap('text=Homme'); }); await pg.waitForTimeout(400);
  // alarme = multi : cocher "Aucun de ces signes"
  await pg.tap('text=Aucun de ces signes'); await pg.waitForTimeout(600);
  ok('multi ne déclenche pas d\'auto-avance', (await key(pg))==='securite');
  await pg.evaluate(()=>document.getElementById('next').click()); await pg.waitForTimeout(400);
  ok('page motif', (await key(pg))==='motif');
  await pg.evaluate(()=>{ document.querySelector('#page input[type=checkbox]').click(); }); await pg.waitForTimeout(200);
  await pg.evaluate(()=>document.getElementById('next').click()); await pg.waitForTimeout(500);
  ok('page fatigue', (await key(pg))==='fatigue');
  const nq=await pg.$$eval('#page .q',e=>e.filter(q=>q.offsetParent).length), nreq=await pg.$$eval('#page .q.lmn-req',e=>e.length);
  ok('liseré seulement sur les requises (2 sur '+nq+')', nreq===2, nreq);
  // répondre aux 2 requises : s10 + f_retent (single)
  await pg.tap('#page .s10c >> nth=6'); await pg.waitForTimeout(250);
  ok('s10 : liseré retiré après réponse', (await pg.$$eval('#page .q.lmn-req',e=>e.length))===1);
  ok('s10 : pastille rap-done', await pg.evaluate(()=>document.querySelector('[data-q="f_niveau"]').classList.contains('rap-done')));
  const s10w=await pg.$eval('#page .s10c',e=>Math.round(e.getBoundingClientRect().width)); ok('s10 : boutons ≥ 44px de large sur mobile', s10w>=44, s10w);
  await pg.tap('[data-q="f_retent"] label >> nth=1'); await pg.waitForTimeout(800);
  ok('requises remplies mais optionnelles restantes : PAS d\'auto-avance', (await key(pg))==='fatigue');
  ok('Suivant actif', !(await pg.$eval('#next',e=>e.disabled)));
  ok('#miss masqué', !(await pg.isVisible('#miss')));
  ok('badge masqué hors pages 1-2', !(await pg.isVisible('#lmn-save-badge')));
  // chevauchement numéro/texte des tuiles
  const overlap=await pg.evaluate(()=>{ var bad=0; [].forEach.call(document.querySelectorAll('#page .opts .opt'),function(o){ if(!o.offsetParent) return; var cs=getComputedStyle(o,'::before'); var txt=o.querySelector('span:not(.n), .t, span')||o; var r=document.createRange(); r.selectNodeContents(o); var rects=[].filter.call(r.getClientRects(),function(x){return x.width>2&&x.height>2;}); var top=Math.min.apply(null,rects.map(function(x){return x.top;})); var ot=o.getBoundingClientRect().top; if(top-ot<30) bad++; }); return bad; });
  ok('tuiles : texte sous le numéro (0 chevauchement)', overlap===0, overlap);
  await pg.screenshot({path:'v2_fat_mobile.png'});
  await pg.evaluate(()=>{var q=document.querySelector('[data-q="f_retent"]'); q.scrollIntoView({block:'start'});}); await pg.waitForTimeout(300); await pg.screenshot({path:'v2_fat_mobile2.png'});
  console.log(R.join('\n')); console.log('erreurs JS:', errs);
  await b.close(); })();

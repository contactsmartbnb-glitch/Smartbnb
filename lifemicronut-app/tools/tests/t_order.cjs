const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const APP='file:///home/user/Smartbnb/lifemicronut-app/';
(async()=>{ const b=await chromium.launch({args:['--no-sandbox']});
 for(const [w,h,mob] of [[1200,850,false],[390,780,true]]){
  const ctx=await b.newContext({viewport:{width:w,height:h},isMobile:mob,hasTouch:mob,deviceScaleFactor:mob?2:1}); const pg=await ctx.newPage(); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
  let posted=null; await pg.route(/paypal\.com/, r=>r.abort());
  await pg.route(/supabase\.co/, r=>{ posted=JSON.parse(r.request().postData()||'{}'); r.fulfill({status:201,body:''}); });
  await pg.goto(APP+'digestion.html#app'); await pg.waitForTimeout(700);
  // injecter des réponses puis aller à la fin via le moteur
  await pg.evaluate(()=>{ A.pc1="Oui, j'ai compris"; A.pc2="Oui, j'accepte"; A.ddn='1984-06-15'; A.sexe='Homme'; A.alarme=['Aucun de ces signes']; A.qn_motif=['Constipation']; A.atb5='Plus de 5'; A.d_constgonf='Oui, souvent'; save(); curK='fin'; render(); });
  await pg.waitForSelector('#lmn-pay-start',{timeout:5000});
  const cta=await pg.$eval('#lmn-pay-start',e=>{var c=getComputedStyle(e);return {bg:c.backgroundColor,fg:c.color,txt:e.textContent};});
  await pg.evaluate(()=>document.getElementById('lmn-pay-start').scrollIntoView({block:'center'})); await pg.waitForTimeout(300); await pg.screenshot({path:`v2_teaser_${w}.png`});
  await pg.evaluate(()=>{ window.open=function(){return null;}; }); await pg.click('#lmn-pay-start'); await pg.waitForTimeout(700);
  const vis=await pg.evaluate(()=>{ function hit(id){ var e=document.getElementById(id); var r=e.getBoundingClientRect(); e.scrollIntoView({block:'center'}); r=e.getBoundingClientRect(); var el=document.elementFromPoint(r.left+r.width/2, r.top+r.height/2); return {h:Math.round(r.height), w:Math.round(r.width), reachable: el===e||e.contains(el)}; }
     return {mail:hit('lmn-order-mail'), cons:hit('lmn-order-cons'), send:hit('lmn-order-send'), sendStyle:(function(){var c=getComputedStyle(document.getElementById('lmn-order-send'));return c.backgroundColor+' / '+c.color;})(), inputBorder:getComputedStyle(document.getElementById('lmn-order-mail')).borderTopColor, link:getComputedStyle(document.getElementById('lmn-order-rgpd')).color}; });
  await pg.evaluate(()=>document.getElementById('lmn-order-box').scrollIntoView({block:'center'})); await pg.waitForTimeout(400); await pg.screenshot({path:`v2_order_${w}.png`});
  // validations
  await pg.click('#lmn-order-send'); const m1=await pg.textContent('#lmn-order-msg');
  await pg.fill('#lmn-order-mail','test@exemple.fr'); await pg.click('#lmn-order-send'); const m2=await pg.textContent('#lmn-order-msg');
  await pg.check('#lmn-order-cons'); await pg.click('#lmn-order-send'); await pg.waitForSelector('.lmn-order-ok',{timeout:4000});
  console.log(`\n== ${w}px ==`); console.log('CTA paywall:', JSON.stringify(cta)); console.log('champs atteignables:', JSON.stringify(vis));
  console.log('msg sans email:', m1, '| sans accord:', m2); console.log('POST:', posted&&Object.keys(posted).join(','), '| bilan', posted&&posted.bilan, '| rapport', posted&&(posted.rapport_auto||'').length, 'car.'); console.log('erreurs:', errs);
  await pg.screenshot({path:`v2_order_ok_${w}.png`}); await ctx.close(); }
 await b.close(); })();

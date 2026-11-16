const { chromium } = require('/opt/node22/lib/node_modules/playwright');
(async()=>{ const b=await chromium.launch({args:['--no-sandbox']});
 for(const u of ['http://localhost:8799/','http://localhost:8799/fatigue/']){ const pg=await b.newPage({viewport:{width:1100,height:850}}); const viol=[], errs=[], ext=[];
  pg.on('console',m=>{ if(/Content Security Policy|Refused to/.test(m.text())) viol.push(m.text().slice(0,200)); }); pg.on('pageerror',e=>errs.push(e.message));
  pg.on('request',r=>{ if(!/^http:\/\/localhost|^data:|^blob:/.test(r.url())) ext.push(r.url().slice(0,80)); });
  await pg.goto(u+'#app',{waitUntil:'load'}); await pg.waitForTimeout(900);
  const font=await pg.evaluate(()=>document.fonts.check('600 16px "Hanken Grotesk"'));
  await pg.evaluate(()=>{ A.pc1="Oui, j'ai compris"; A.pc2="Oui, j'accepte"; A.ddn='1984-06-15'; A.sexe='Homme'; A.alarme=['Aucun de ces signes']; A.qn_motif=['Constipation']; A.atb5='Plus de 5'; A.d_constgonf='Oui, souvent'; A.qn_signes=["J'ai des troubles digestifs (ballonnements, transit, reflux)"]; A.f_niveau=7; A.f_retent="Un peu : je fais tout, mais au prix d'un effort"; A.f_recup='Plus de 3 jours'; A.v_expo=['Tabac']; save(); curK='fin'; render(); });
  await pg.waitForTimeout(800);
  const st=await pg.evaluate(()=>({rapport:!!document.getElementById('lmn-rapport'), pay:!!document.getElementById('lmn-pay-start'), pdf:!!document.getElementById('pdf'), links:[].map.call(document.querySelectorAll('.gl-bcard a.gl-go'),a=>a.getAttribute('href'))}));
  let dl=null; if(st.pdf){ const p=pg.waitForEvent('download',{timeout:6000}).catch(()=>null); await pg.click('#pdf'); const d=await p; dl=d?d.suggestedFilename():'(pas de téléchargement)'; }
  console.log(u,'| police intégrée:',font,'| état:',JSON.stringify(st),'| PDF:',dl,'| requêtes externes:',ext,'| violations CSP:',viol.length,viol.slice(0,3),'| erreurs:',errs.slice(0,3)); await pg.close(); }
 const pg=await b.newPage(); const r=await pg.goto('http://localhost:8799/nexiste-pas'); console.log('404 →',r.status(), (await pg.title()));
 await b.close(); })();

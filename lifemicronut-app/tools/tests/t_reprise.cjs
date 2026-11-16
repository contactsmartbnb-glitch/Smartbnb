const { chromium } = require('/opt/node22/lib/node_modules/playwright');
(async()=>{ const b=await chromium.launch({args:['--no-sandbox']}); const pg=await b.newPage({viewport:{width:1100,height:850}}); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('file:///home/user/Smartbnb/lifemicronut-app/fatigue.html#app'); await pg.waitForTimeout(700);
 await pg.click('text=Oui, j\'ai compris'); await pg.click('text=Oui, j\'accepte'); await pg.waitForTimeout(900);
 await pg.reload(); await pg.waitForTimeout(900);
 const s=await pg.evaluate(()=>({page:document.documentElement.getAttribute('data-page'), txt:(document.getElementById('page').innerText||'').slice(0,160), btns:[].map.call(document.querySelectorAll('#page button'),x=>x.textContent)}));
 console.log('après rechargement:', JSON.stringify(s));
 await pg.click('#reprendre').catch(()=>{}); await pg.waitForTimeout(600); console.log('après Reprendre →', await pg.evaluate(()=>document.documentElement.getAttribute('data-page')), await pg.textContent('#step'));
 // accessibilité rapide : éléments interactifs sans nom, contraste du texte secondaire
 const a11y=await pg.evaluate(()=>{ function name(e){ return (e.getAttribute('aria-label')||e.textContent||e.title||'').trim(); } var noName=[].filter.call(document.querySelectorAll('button,a[href]'),function(e){return e.offsetParent&&!name(e);}).length; var imgs=[].filter.call(document.querySelectorAll('img'),function(i){return !i.hasAttribute('alt');}).length; return {noName:noName, imgsSansAlt:imgs, lang:document.documentElement.lang, h1:document.querySelectorAll('h1').length, titres:[].map.call(document.querySelectorAll('h1,h2'),function(h){return h.tagName+':'+h.textContent.trim().slice(0,30);}).slice(0,12)}; });
 console.log('a11y:', JSON.stringify(a11y)); console.log('erreurs:', errs); await b.close(); })();

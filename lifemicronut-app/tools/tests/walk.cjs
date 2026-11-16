const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const APP='/home/user/Smartbnb/lifemicronut-app/';
const [,, file, mode='first', width='1200'] = process.argv;
(async()=>{
  const b=await chromium.launch({args:['--no-sandbox']});
  const ctx=await b.newContext({viewport:{width:+width,height:850}});
  const pg=await ctx.newPage();
  const errs=[]; pg.on('pageerror',e=>errs.push('PAGEERR '+e.message)); pg.on('console',m=>{ if(m.type()==='error' && !/ERR_CERT|net::|Failed to load resource/.test(m.text())) errs.push('CONSOLE '+m.text()); });
  await pg.route(/supabase\.co|paypal\.com/, r=>r.abort());
  await pg.goto('file://'+APP+file+'#app',{waitUntil:'load'}); await pg.waitForTimeout(700);
  await pg.evaluate(()=>{ window.__seed=7; window.__rnd=function(){ window.__seed=(window.__seed*9301+49297)%233280; return window.__seed/233280; }; window.open=function(){ window.__opened=(window.__opened||0)+1; return null; }; });
  const pages=[]; let last='', stuck=0;
  for(let it=0; it<1500; it++){
    const st=await pg.evaluate((mode)=>{
      function vis(q){return q.offsetParent!==null;}
      var key=document.documentElement.getAttribute('data-page')||'';
      var qs=[].filter.call(document.querySelectorAll('#page .q'),function(q){ return vis(q)&&!q.classList.contains('warn')&&!q.classList.contains('note')&&!q.classList.contains('sub')&&q.querySelector('.opts,.scale,.s10,input,textarea,select'); });
      function ans(q){ if(q.querySelector('input:checked')) return true; if(q.querySelector('.s10 .on')) return true; var t=q.querySelector('input[type=date],input[type=text],input[type=number],textarea'); if(t&&t.value) return true; return false; }
      var todo=qs.filter(function(q){return !ans(q);});
      var nx=document.getElementById('next');
      var info={key:key, step:(document.getElementById('step')||{}).textContent, nq:qs.length, todo:todo.length, nextHidden:nx?nx.hidden:null, nextDisabled:nx?nx.disabled:null,
        overflow: document.documentElement.scrollWidth - window.innerWidth, miss:(document.getElementById('miss')||{}).textContent,
        warns:[].filter.call(document.querySelectorAll('#page .q.warn'),vis).length };
      if(!todo.length) return Object.assign(info,{act:'complete'});
      var q=todo[0], pick=function(n){ return mode==='first'?0: mode==='last'?n-1: Math.floor(window.__rnd()*n); };
      var r=[].filter.call(q.querySelectorAll('input[type=radio]'),function(i){return !i.disabled;});
      var c=q.querySelectorAll('input[type=checkbox]');
      var d=q.querySelector('input[type=date]'), g=q.querySelector('input[type=range]'), t=q.querySelector('input[type=text],input[type=number],textarea,input:not([type])');
      var sb=q.querySelectorAll('.s10c,.s10k'); if(sb.length){ sb[pick(sb.length)].click(); return Object.assign(info,{act:'s10'}); }
      if(r.length){ r[pick(r.length)].click(); return Object.assign(info,{act:'radio'}); }
      if(c.length){ var i=pick(c.length); c[i].click(); if(mode==='rand'&&c.length>2){ c[(i+1)%c.length].click(); } return Object.assign(info,{act:'check'}); }
      if(d){ d.value='1984-06-15'; d.dispatchEvent(new Event('input',{bubbles:true})); d.dispatchEvent(new Event('change',{bubbles:true})); return Object.assign(info,{act:'date'}); }
      if(g){ g.value=mode==='first'?'2':'8'; g.dispatchEvent(new Event('input',{bubbles:true})); return Object.assign(info,{act:'range'}); }
      if(t){ t.value='12'; t.dispatchEvent(new Event('input',{bubbles:true})); return Object.assign(info,{act:'text',tname:t.id||t.name||t.type}); }
      return Object.assign(info,{act:'unknown', html:q.outerHTML.slice(0,300)});
    }, mode);
    if(st.key!==last){ pages.push({key:st.key, step:st.step, nq:st.nq, overflow:st.overflow, warns:st.warns}); last=st.key; stuck=0; }
    if(st.act==='unknown'){ console.log('UNKNOWN Q', JSON.stringify(st)); break; }
    if(st.act==='complete'){
      if(st.nextHidden){ break; }
      if(st.nextDisabled){ stuck++; if(stuck>6){ console.log('STUCK', JSON.stringify(st)); break; } await pg.waitForTimeout(150); continue; }
      await pg.evaluate(()=>document.getElementById('next').click()); await pg.waitForTimeout(260); continue;
    }
    await pg.waitForTimeout(40);
  }
  await pg.waitForTimeout(800);
  const fin=await pg.evaluate(()=>{ var r=document.getElementById('lmn-rapport'); var A=window.A||{};
    return { key:document.documentElement.getAttribute('data-page'), rapport:!!r, pistes:r?r.querySelectorAll('.lmn-pistes li').length:-1, payBtn:!!document.getElementById('lmn-pay-start'), none:!!(r&&r.querySelector('.lmn-none')),
      nAnswers:Object.keys(A).length, overflow:document.documentElement.scrollWidth-window.innerWidth, txt:r?r.innerText.slice(0,260):'' }; });
  let order=null;
  if(fin.payBtn){ await pg.click('#lmn-pay-start'); await pg.waitForTimeout(400); order=await pg.evaluate(()=>({form:!!document.getElementById('lmn-order-mail'), visible:(document.getElementById('lmn-order-box')||{style:{}}).style.display, opened:window.__opened||0, fullFn:typeof window.lmnFullHTML, fullLen:(window.lmnFullHTML?window.lmnFullHTML(window.A||{}):'').length})); }
  await pg.screenshot({path:`fin_${file.replace('.html','')}_${mode}_${width}.png`, fullPage:false});
  console.log(`\n=== ${file} mode=${mode} w=${width} ===`);
  console.log('pages:', pages.map(p=>`${p.key}(${p.nq}q${p.warns?','+p.warns+'w':''}${p.overflow>0?',OVF+'+p.overflow:''})`).join(' > '));
  console.log('fin:', JSON.stringify(fin)); console.log('order:', JSON.stringify(order)); console.log('errors:', errs.slice(0,6));
  await b.close();
})();

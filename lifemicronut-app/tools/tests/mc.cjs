const { chromium } = require('/opt/node22/lib/node_modules/playwright'); const fs=require('fs');
const APP='/home/user/Smartbnb/lifemicronut-app/';
function lines(f,a,b){ return fs.readFileSync(APP+f,'utf8').split('\n').slice(a-1,b).join('\n'); }
const INJ={
 'digestion.html': '(function(){'+lines('regles_rapport_digestion.js',7,190)+';window.__R={kind:"dig",PISTES:PISTES,run:lmnPistes};})();',
 'fatigue.html':   '(function(){'+lines('regles_rapport_fatigue.js',7,343).replace('typeof FAT_PISTES !== "undefined" ? FAT_PISTES : []','Object.keys(FAT_REGLES).map(function(i){return {id:i};})')+';window.__R={kind:"fat",REG:FAT_REGLES,run:fatPistes};})();'
};
(async()=>{ const b=await chromium.launch({args:['--no-sandbox']});
 for(const f of Object.keys(INJ)){ const pg=await b.newPage(); pg.on('pageerror',e=>console.log('ERR',e.message));
  await pg.goto('file://'+APP+f,{waitUntil:'load'}); await pg.waitForTimeout(500); await pg.addScriptTag({content:INJ[f]});
  const res=await pg.evaluate((N)=>{
    var seed=12345; function rnd(){ seed|=0; seed=seed+0x6D2B79F5|0; var t=Math.imul(seed^seed>>>15,1|seed); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; } function ri(n){ return Math.floor(rnd()*n); }
    var EX=(MB.exclusives||{}), asked={}, pisteN={}, predN={}, nPist=[], withAlarm=0, pagesSeen={};
    function answer(q){
      asked[q.id]=(asked[q.id]||0)+1;
      if(q.id==='pc1'||q.id==='pc2'){ A[q.id]=options(q)[0]; return; }
      if(q.t==='single'){ var o=options(q); A[q.id]=o[ri(o.length)]; }
      else if(q.t==='multi'){ var o2=options(q), ex=[].concat(EX[q.id]||[]); var pool=o2.filter(function(x){return ex.indexOf(x)<0;});
        if(ex.length && (rnd()<0.4 || !pool.length)){ A[q.id]=[ex[ri(ex.length)]]; } else { var k=1+ri(Math.min(3,pool.length)), s=[]; while(s.length<k){ var c=pool[ri(pool.length)]; if(s.indexOf(c)<0) s.push(c); } A[q.id]=s; } }
      else if(q.t==='scale5'){ A[q.id]=(q.nsp&&rnd()<0.08)?NSP:ri(5); }
      else if(q.t==='s10'){ A[q.id]=ri(11); }
      else if(q.t==='date'){ var y=2026-(20+ri(60)); A[q.id]=y+'-0'+(1+ri(9))+'-1'+ri(9); }
      else if(q.t==='bristol'){ A[q.id]=1+ri(7); }
    }
    var types={};
    for(var n=0;n<N;n++){
      for(var k in A) delete A[k];
      var done={}, guard=0;
      while(guard++<80){ var V=visible(), s=null; for(var i=0;i<V.length;i++){ if(!done[V[i].k]){ s=V[i]; break; } } if(!s) break; done[s.k]=1; pagesSeen[s.k]=(pagesSeen[s.k]||0)+1;
        var got={}, again=true, rounds=0; while(again&&rounds++<6){ again=false; (s.q||[]).forEach(function(q){ if(!q||!q.id||!q.t||got[q.id]) return; types[q.t]=1; if(['single','multi','scale5','s10','date','bristol'].indexOf(q.t)<0) return; if(!qVis(q)) return; answer(q); got[q.id]=1; again=true; }); } }
      var r=__R.run(A); var ids=r.evoquees.map(function(e){return e.id;}); nPist.push(ids.length); ids.forEach(function(id){ pisteN[id]=(pisteN[id]||0)+1; });
      if(__R.kind==='dig'){ __R.PISTES.forEach(function(p){ ['forts','contrib'].forEach(function(g){ p[g].forEach(function(fn,j){ var key=p.id+'.'+g+'['+j+']'; var v=false; try{v=!!fn(A);}catch(e){} predN[key]=(predN[key]||0)+(v?1:0); }); }); }); }
      else { Object.keys(__R.REG).forEach(function(id){ var R=__R.REG[id]; var groups={forts:R.forts,contrib:R.contrib}; if(R.combo){ groups['combo.signes']=R.combo.signes; groups['combo.facteurs']=R.combo.facteurs; }
        Object.keys(groups).forEach(function(g){ groups[g].forEach(function(r,j){ var key=id+'.'+g+'['+j+'] '+(r[2]||''); var v=false; try{v=!!r[0](A);}catch(e){} predN[key]=(predN[key]||0)+(v?1:0); }); }); }); }
    }
    var hist={}; nPist.forEach(function(x){ hist[x]=(hist[x]||0)+1; });
    var allQ=QMDATA.questions.map(function(q){return q.id;}); var never=allQ.filter(function(id){return !asked[id];});
    return {N:N,pisteN:pisteN,predN:predN,hist:hist,neverAsked:never,pagesSeen:pagesSeen,types:Object.keys(types), nPistes: __R.kind==='dig'?__R.PISTES.map(function(p){return p.id;}):Object.keys(__R.REG)};
  }, 4000);
  console.log('\n######## '+f+' — '+res.N+' profils aléatoires');
  console.log('types rencontrés:', res.types.join(','));
  console.log('pages vues (%):', Object.entries(res.pagesSeen).map(([k,v])=>k+':'+Math.round(v/res.N*100)).join(' '));
  console.log('nb pistes / profil:', JSON.stringify(res.hist));
  console.log('pistes (% des profils):', res.nPistes.map(id=>id+':'+(((res.pisteN[id]||0)/res.N*100).toFixed(1))).join('  '));
  const dead=Object.entries(res.predN).filter(([k,v])=>v===0).map(([k])=>k);
  const rare=Object.entries(res.predN).filter(([k,v])=>v>0&&v/res.N<0.005).map(([k,v])=>k+'='+v);
  console.log('PRÉDICATS JAMAIS VRAIS ('+dead.length+'/'+Object.keys(res.predN).length+'):'); dead.forEach(d=>console.log('   '+d));
  console.log('prédicats très rares (<0,5%):', rare.join(' ; '));
  console.log('QUESTIONS JAMAIS POSÉES ('+res.neverAsked.length+'):', res.neverAsked.join(', '));
  fs.writeFileSync('mc_'+f.replace('.html','')+'.json', JSON.stringify(res));
  await pg.close(); }
 await b.close(); })();

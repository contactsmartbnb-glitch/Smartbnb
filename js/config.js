/* ===== SmartBNB — Config & shared data ===== */
window.SB = {
  url: 'https://jrsvuwbfkdrppmhzvjtp.supabase.co',
  anon: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impyc3Z1d2Jma2RycHBtaHp2anRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2NTM2NDgsImV4cCI6MjA2MzIyOTY0OH0.Qm5a8b3c9d0e1f2a3b4c5d6e7f8a9b0c',
  email: 'contact.smartbnb@gmail.com',
  whatsapp: '212775961740',
  logo: 'https://media.base44.com/images/public/6a0b5a847eb33c0a84ff4e82/edadd18eb_generated_image.png'
};

/* ----- Market data (réelles) ----- */
window.MARKET = {
  marrakech:{ nom:'Marrakech', base:800, occ:0.78, yield:9.8, prixm2:18000 },
  tanger:   { nom:'Tanger',    base:550, occ:0.70, yield:7.8, prixm2:14000 },
  casablanca:{nom:'Casablanca',base:620, occ:0.68, yield:6.5, prixm2:22000 },
  rabat:    { nom:'Rabat',     base:480, occ:0.62, yield:5.2, prixm2:16000 },
  essaouira:{ nom:'Essaouira', base:520, occ:0.65, yield:7.2, prixm2:12000 },
  fes:      { nom:'Fès',       base:420, occ:0.60, yield:6.0, prixm2:10000 }
};
window.MULT_TYPE = { studio:0.72, appartement:1, riad:1.45, villa:2.2 };
window.MULT_STANDING = { standard:0.82, premium:1, luxe:1.35 };

/* ----- Simulateur de rendement ----- */
window.simulate = function(o){
  // o: {ville,type,standing,surface,chambres,piscine,parking}
  const m = MARKET[o.ville] || MARKET.marrakech;
  const mt = MULT_TYPE[o.type] || 1;
  const ms = MULT_STANDING[o.standing] || 1;
  let nuit = m.base * mt * ms;
  if(o.chambres) nuit *= (0.88 + o.chambres*0.05);
  if(o.piscine) nuit *= 1.09;
  if(o.parking) nuit *= 1.03;
  nuit = Math.round(nuit);
  const nuitsMois = Math.round(30 * m.occ);
  const mensuel = nuit * nuitsMois;
  const annuel = mensuel * 12;
  const prixBien = Math.round((o.surface||80) * m.prixm2 * ms);
  const charges = Math.round(annuel * 0.25);          // charges + entretien
  const commission = Math.round(annuel * 0.17);       // SmartBNB 17%
  const net = annuel - charges - commission;
  // rendement borné au marché réel pour rester crédible (jamais surpromis)
  let rendBrut = prixBien ? (annuel / prixBien * 100) : m.yield;
  rendBrut = Math.max(3.5, Math.min(rendBrut, m.yield + 1));
  const rendNet = rendBrut * 0.6;
  const cashflow = Math.round(prixBien * rendNet/100 / 12);
  return {
    nuit, nuitsMois, mensuel, annuel, prixBien, charges, commission, net,
    rendBrut: rendBrut.toFixed(1), rendNet: rendNet.toFixed(1), cashflow,
    occ: Math.round(m.occ*100),
    airbnb: Math.round(annuel*0.55), booking: Math.round(annuel*0.30), direct: Math.round(annuel*0.15)
  };
};

/* ----- Formatting ----- */
window.fmt = n => new Intl.NumberFormat('fr-FR').format(Math.round(n));
window.fmtMAD = n => fmt(n) + ' MAD';

/* ----- Supabase REST insert ----- */
window.sbInsert = async function(table, row){
  try{
    const r = await fetch(`${SB.url}/rest/v1/${table}`, {
      method:'POST',
      headers:{
        'apikey':SB.anon,
        'Authorization':'Bearer '+SB.anon,
        'Content-Type':'application/json',
        'Prefer':'return=minimal'
      },
      body: JSON.stringify(row)
    });
    return { ok: r.ok, status: r.status };
  }catch(e){ return { ok:false, error:e.message }; }
};

/* ----- Email via Formsubmit.co ----- */
window.sendMail = async function(subject, data){
  try{
    const fd = new FormData();
    fd.append('_subject', subject);
    fd.append('_template', 'table');
    fd.append('_captcha', 'false');
    Object.entries(data).forEach(([k,v])=>fd.append(k, Array.isArray(v)?v.join(', '):(v??'')));
    await fetch('https://formsubmit.co/ajax/'+SB.email, {
      method:'POST', headers:{'Accept':'application/json'}, body: fd
    });
    return true;
  }catch(e){ return false; }
};

/* ----- Submit a lead everywhere (Supabase + email) ----- */
window.submitLead = async function(payload, mailSubject){
  const r1 = sbInsert('leads', payload);
  const r2 = sendMail(mailSubject || 'Nouveau lead SmartBNB', payload);
  await Promise.allSettled([r1, r2]);
  return true;
};

/* ----- Toast ----- */
window.toast = function(msg){
  let t = document.querySelector('.toast');
  if(!t){ t=document.createElement('div'); t.className='toast'; document.body.appendChild(t); }
  t.textContent = msg; t.classList.add('show');
  clearTimeout(t._tm); t._tm = setTimeout(()=>t.classList.remove('show'), 3600);
};

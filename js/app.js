/* ===== SmartBNB — Nav, Footer, Chatbot (injected on every page) ===== */
(function(){
  const page = (location.pathname.split('/').pop() || 'index.html');
  const links = [
    ['index.html','Accueil'],
    ['simulateur.html','Simulateur'],
    ['marketplace.html','Marketplace'],
    ['investir.html','Investir'],
    ['services.html','Services'],
    ['sci.html','SCI'],
    ['smartdeco.html','SmartDéco'],
    ['contact.html','Contact']
  ];
  const navLinks = links.map(([h,t])=>
    `<a href="${h}" class="${page===h?'active':''}">${t}</a>`).join('');

  /* ---------- NAV ---------- */
  const nav = `
  <nav class="nav">
    <div class="nav-in">
      <a href="index.html" class="nav-logo">
        <img src="${SB.logo}" alt="SmartBNB"> SmartBNB
      </a>
      <div class="nav-links">${navLinks}</div>
      <div class="nav-cta">
        <a href="espace-client.html" class="btn btn-ghost">Espace client</a>
        <a href="formulaire.html" class="btn btn-vert">Diagnostic gratuit</a>
        <a href="https://wa.me/${SB.whatsapp}" target="_blank" class="btn btn-wa nav-wa">WhatsApp</a>
      </div>
      <button class="burger" aria-label="Menu" onclick="document.getElementById('mobMenu').classList.toggle('open')">
        <span></span><span></span><span></span>
      </button>
    </div>
    <div class="mobile-menu" id="mobMenu">
      ${links.map(([h,t])=>`<a href="${h}">${t}</a>`).join('')}
      <a href="espace-client.html">Espace client</a>
      <a href="espace-chasseur.html">Espace chasseur</a>
      <a href="formulaire.html" style="color:var(--vert);font-weight:600">Diagnostic gratuit →</a>
    </div>
  </nav>`;

  /* ---------- FOOTER ---------- */
  const footer = `
  <footer class="footer">
    <div class="wrap">
      <div class="footer-grid">
        <div>
          <div class="nav-logo" style="color:#fff;margin-bottom:14px">
            <img src="${SB.logo}" alt=""> SmartBNB
          </div>
          <p style="color:#9b9b95;max-width:300px">Cabinet de chasse immobilière & gestion locative courte durée au Maroc. Investissez sans vous déplacer.</p>
          <div style="margin-top:16px">
            <a href="https://wa.me/${SB.whatsapp}" target="_blank">WhatsApp · +212 775 961 740</a>
            <a href="mailto:${SB.email}">${SB.email}</a>
          </div>
        </div>
        <div>
          <h4>Services</h4>
          <a href="services.html">Chasse immobilière</a>
          <a href="services.html">Gestion LCD 17%</a>
          <a href="sci.html">Création SCI</a>
          <a href="smartdeco.html">SmartDéco</a>
        </div>
        <div>
          <h4>Explorer</h4>
          <a href="marketplace.html">Marketplace</a>
          <a href="simulateur.html">Simulateur</a>
          <a href="investir.html">Investir au Maroc</a>
          <a href="profil-acquereur.html">Mandat de chasse</a>
        </div>
        <div>
          <h4>Espaces</h4>
          <a href="espace-client.html">Espace investisseur</a>
          <a href="espace-chasseur.html">Espace chasseur</a>
          <a href="reseaux.html">Autopilote réseaux</a>
          <a href="formulaire.html">Diagnostic gratuit</a>
          <a href="contact.html">Contact</a>
        </div>
      </div>
      <div class="footer-bottom">
        <span>© ${new Date().getFullYear()} SmartBNB — smartbnb.ma · Tous droits réservés</span>
        <span>Marrakech · Tanger · Casablanca · Rabat · Essaouira · Fès</span>
      </div>
    </div>
  </footer>`;

  /* ---------- CHATBOT ---------- */
  const chatbot = `
  <button class="chat-fab" id="chatFab" aria-label="Ouvrir le chat"><svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.5 8.5 0 0 1-12.5 7.5L3 21l2-5.5A8.5 8.5 0 1 1 21 11.5Z"/></svg></button>
  <div class="chat-panel" id="chatPanel">
    <div class="chat-head">
      <strong>Assistant SmartBNB</strong>
      <div style="font-size:.78rem;color:#9b9b95">Réponse immédiate · 7j/7</div>
    </div>
    <div class="chat-body" id="chatBody"></div>
    <div class="chat-quick" id="chatQuick"></div>
    <div class="chat-input">
      <input id="chatInput" placeholder="Votre question…" autocomplete="off">
      <button id="chatSend">→</button>
    </div>
  </div>`;

  /* ---------- INJECT ---------- */
  document.addEventListener('DOMContentLoaded', function(){
    const navSlot = document.querySelector('[data-nav]');
    if(navSlot) navSlot.outerHTML = nav; else document.body.insertAdjacentHTML('afterbegin', nav);

    const ftSlot = document.querySelector('[data-footer]');
    if(ftSlot) ftSlot.outerHTML = footer;
    else if(!document.body.hasAttribute('data-no-footer')) document.body.insertAdjacentHTML('beforeend', footer);

    document.body.insertAdjacentHTML('beforeend', chatbot);
    initChat();
  });

  /* ---------- CHATBOT LOGIC ---------- */
  const KB = [
    {k:['gestion','17','commission','loyer','lcd'],a:"Notre gestion locative courte durée coûte 17% du loyer brut, sans aucun frais fixe. On gère tout : annonces, ménage, check-in, voyageurs et reporting mensuel."},
    {k:['chasse','acheter','achat','3%','bien'],a:"La chasse immobilière, c'est 3% du prix d'achat. On déniche, négocie et sécurise votre bien (y compris off-market) sans que vous ayez à vous déplacer."},
    {k:['sci','société','fiscal'],a:"La création de SCI au Maroc est à 16 900 MAD tout compris : statuts, immatriculation et accompagnement. Voir la page SCI pour le détail."},
    {k:['déco','meuble','ameublement','smartdeco','meubler'],a:"SmartDéco aménage votre bien clé en main : packs de 35 000 MAD (studio) à 200 000 MAD (villa). Devis gratuit sur la page SmartDéco."},
    {k:['rendement','rentabilité','yield','gagner','revenu','simul'],a:"Les rendements bruts vont de 5% à 10% selon la ville. Utilisez notre simulateur pour une estimation personnalisée en 30 secondes."},
    {k:['mre','étranger','devises','financement','crédit'],a:"Les MRE peuvent financer jusqu'à 100% en devises (50% minimum en devises requis par les banques marocaines). On vous accompagne sur le montage."},
    {k:['ville','marrakech','tanger','casa','rabat','essaouira','fes','fès'],a:"On opère à Marrakech, Tanger, Casablanca, Rabat, Essaouira et Fès. Marrakech offre le meilleur rendement (~9,8%). Voir la page Investir."},
    {k:['contact','rendez','rdv','appel','téléphone','joindre'],a:"Vous pouvez nous joindre sur WhatsApp au +212 775 961 740 ou par email à contact.smartbnb@gmail.com. Le diagnostic est gratuit."},
    {k:['marketplace','vente','liste','annonce'],a:"Notre marketplace présente des biens sélectionnés avec rendement estimé. Certains sont off-market. Filtrez par ville, budget et rendement."}
  ];
  function botReply(txt){
    const t = txt.toLowerCase();
    for(const e of KB){ if(e.k.some(w=>t.includes(w))) return e.a; }
    return "Bonne question ! Pour une réponse précise, écrivez-nous sur WhatsApp (+212 775 961 740) ou lancez un diagnostic gratuit. Je peux aussi vous parler de la gestion, la chasse, la SCI ou les rendements.";
  }
  function initChat(){
    const fab=document.getElementById('chatFab'), panel=document.getElementById('chatPanel'),
          body=document.getElementById('chatBody'), input=document.getElementById('chatInput'),
          quick=document.getElementById('chatQuick');
    function add(txt,who){
      const d=document.createElement('div'); d.className='chat-msg '+who; d.textContent=txt;
      body.appendChild(d); body.scrollTop=body.scrollHeight;
    }
    function send(txt){
      txt=(txt||input.value).trim(); if(!txt) return;
      add(txt,'user'); input.value='';
      setTimeout(()=>add(botReply(txt),'bot'),350);
    }
    fab.onclick=()=>{
      panel.classList.toggle('open');
      if(panel.classList.contains('open') && !body.dataset.init){
        body.dataset.init='1';
        add("Bonjour, je suis l'assistant SmartBNB. Comment puis-je vous aider ?",'bot');
      }
    };
    document.getElementById('chatSend').onclick=()=>send();
    input.addEventListener('keydown',e=>{if(e.key==='Enter')send();});
    ['Gestion 17%','Chasse immo','Créer une SCI','Rendements'].forEach(q=>{
      const b=document.createElement('button'); b.textContent=q; b.onclick=()=>send(q);
      quick.appendChild(b);
    });
  }
})();

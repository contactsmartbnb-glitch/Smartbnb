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
        <a href="connexion.html" class="btn btn-ghost">Connexion</a>
        <a href="formulaire.html" class="btn btn-vert">Démarrer mon projet</a>
        <a href="https://wa.me/${SB.whatsapp}" target="_blank" class="btn btn-wa nav-wa">WhatsApp</a>
      </div>
      <button class="burger" aria-label="Menu" onclick="document.getElementById('mobMenu').classList.toggle('open')">
        <span></span><span></span><span></span>
      </button>
    </div>
    <div class="mobile-menu" id="mobMenu">
      ${links.map(([h,t])=>`<a href="${h}">${t}</a>`).join('')}
      <a href="connexion.html">Connexion / Créer un compte</a>
      <a href="formulaire.html" style="color:var(--vert);font-weight:600">Démarrer mon projet →</a>
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
          <a href="formulaire.html">Démarrer mon projet</a>
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

  /* ---------- CHATBOT (Claude via Edge Function) ---------- */
  const CHAT_URL = `${SB.url}/functions/v1/chat`;
  const history = [];   // conversation envoyée à Claude

  async function askClaude(txt){
    history.push({ role: 'user', content: txt });
    const r = await fetch(CHAT_URL, {
      method: 'POST',
      headers: {
        apikey: SB.anon,
        Authorization: 'Bearer ' + SB.anon,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ messages: history })
    });
    const j = await r.json();
    if (!j.text) throw new Error(j.error || 'Réponse vide');
    history.push({ role: 'assistant', content: j.text });
    return j.text;
  }

  function initChat(){
    const fab=document.getElementById('chatFab'), panel=document.getElementById('chatPanel'),
          body=document.getElementById('chatBody'), input=document.getElementById('chatInput'),
          quick=document.getElementById('chatQuick');

    function add(txt, who){
      const d=document.createElement('div'); d.className='chat-msg '+who; d.textContent=txt;
      body.appendChild(d); body.scrollTop=body.scrollHeight;
      return d;
    }

    async function send(txt){
      txt=(txt||input.value).trim(); if(!txt) return;
      add(txt,'user'); input.value='';
      const loading = add('…','bot');
      try{
        const reply = await askClaude(txt);
        loading.textContent = reply;
      }catch(e){
        loading.textContent = "Je ne parviens pas à joindre l'assistant pour l'instant. Écrivez-nous sur WhatsApp au +212 775 961 740 ou par email à contact.smartbnb@gmail.com.";
      }
    }

    fab.onclick=()=>{
      panel.classList.toggle('open');
      if(panel.classList.contains('open') && !body.dataset.init){
        body.dataset.init='1';
        add("Bonjour, je suis l'assistant SmartBNB. Posez-moi votre question — investissement, gestion locative, SCI, fiscalité, financement MRE…",'bot');
      }
    };
    document.getElementById('chatSend').onclick=()=>send();
    input.addEventListener('keydown',e=>{if(e.key==='Enter')send();});
    ['Comment fonctionne la gestion 17 % ?','Quels rendements à Marrakech ?','Créer une SCI au Maroc','Je suis MRE, financement ?'].forEach(q=>{
      const b=document.createElement('button'); b.textContent=q; b.onclick=()=>send(q);
      quick.appendChild(b);
    });
  }
})();

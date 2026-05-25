// SmartBnB Chatbot — Propulsé par Claude (Anthropic)
// Inclure dans toutes les pages : <script src="js/chatbot.js"></script>
//
// =============================================================
//   CONFIG — URL DU WORKER CLOUDFLARE
// =============================================================
// Après avoir déployé js/worker.js sur Cloudflare Workers,
// remplace l'URL ci-dessous par celle de TON Worker.
// Tant que c'est l'URL placeholder, le chatbot tourne en mode
// hors-ligne (réponses pré-définies, pas d'IA).
//
// Voir GUIDE-DEPLOIEMENT.html phase 4 pour la procédure complète.
// =============================================================

(function () {

const CHAT_API_URL = 'https://chat-smartbnb.TONPSEUDO.workers.dev';

const SUGGESTIONS = [
  "Quels sont vos tarifs de gestion ?",
  "Quel rendement à Marrakech ?",
  "Comment créer une SCI au Maroc ?",
  "Vous couvrez quelle ville ?",
  "Je veux confier mon bien",
  "Comment investir depuis la France ?",
];

const CSS = `
#sbnb-fab{position:fixed;bottom:24px;right:24px;z-index:9000;width:54px;height:54px;border-radius:50%;background:#1A1714;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 20px rgba(26,23,20,.3);transition:transform .2s,box-shadow .2s}
#sbnb-fab:hover{transform:scale(1.08);box-shadow:0 6px 28px rgba(26,23,20,.4)}
#sbnb-fab svg{width:26px;height:26px;transition:opacity .2s}
#sbnb-fab .ico-close{display:none}
#sbnb-fab.open .ico-chat{display:none}
#sbnb-fab.open .ico-close{display:block}
#sbnb-notif{position:absolute;top:-3px;right:-3px;width:18px;height:18px;background:#C1714F;border-radius:50%;border:2px solid #fff;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:#fff}
#sbnb-win{position:fixed;bottom:90px;right:24px;z-index:9001;width:370px;max-height:calc(100vh - 110px);background:#fff;border-radius:18px;box-shadow:0 20px 60px rgba(26,23,20,.18);display:flex;flex-direction:column;overflow:hidden;transform:scale(.9) translateY(12px);opacity:0;pointer-events:none;transition:transform .25s cubic-bezier(.4,0,.2,1),opacity .25s}
#sbnb-win.open{transform:scale(1) translateY(0);opacity:1;pointer-events:all}
@media(max-width:460px){#sbnb-win{width:calc(100vw - 20px);right:10px;bottom:82px}}
#sbnb-head{background:#1A1714;padding:13px 16px;display:flex;align-items:center;gap:10px;flex-shrink:0}
#sbnb-av{width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#C9A96E,#C1714F);display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0}
.sbnb-hname{font-size:13px;font-weight:600;color:#FAF8F4}
.sbnb-hstatus{font-size:11px;color:rgba(250,248,244,.5);display:flex;align-items:center;gap:4px}
.sbnb-hstatus::before{content:'';width:6px;height:6px;background:#5DCAA5;border-radius:50%;display:inline-block}
#sbnb-msgs{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:10px;background:#FAFAF8;min-height:200px;max-height:340px}
#sbnb-msgs::-webkit-scrollbar{width:4px}
#sbnb-msgs::-webkit-scrollbar-thumb{background:#E0DDD6;border-radius:2px}
.sbnb-msg{display:flex;gap:7px;align-items:flex-end;max-width:90%}
.sbnb-msg.bot{align-self:flex-start}
.sbnb-msg.user{align-self:flex-end;flex-direction:row-reverse}
.sbnb-msg-av{width:24px;height:24px;border-radius:50%;background:linear-gradient(135deg,#C9A96E,#C1714F);display:flex;align-items:center;justify-content:center;font-size:11px;flex-shrink:0}
.sbnb-bubble{padding:9px 13px;border-radius:14px;font-size:13px;line-height:1.55;white-space:pre-wrap;word-wrap:break-word}
.bot .sbnb-bubble{background:#fff;border:0.5px solid #E8E6DF;color:#2C2420;border-bottom-left-radius:4px}
.user .sbnb-bubble{background:#1A1714;color:#FAF8F4;border-bottom-right-radius:4px}
.sbnb-time{font-size:10px;color:#B4B2A9;margin-top:3px;text-align:right}
.sbnb-typing{display:flex;gap:4px;padding:10px 14px}
.sbnb-dot{width:7px;height:7px;background:#C9A96E;border-radius:50%;animation:sbnb-bounce .8s infinite}
.sbnb-dot:nth-child(2){animation-delay:.15s}
.sbnb-dot:nth-child(3){animation-delay:.3s}
@keyframes sbnb-bounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-6px)}}
#sbnb-sugg{display:flex;gap:5px;flex-wrap:wrap;padding:10px 14px;border-top:0.5px solid #F0EDE8;background:#fff}
.sbnb-pill{background:#F2EDE6;border:0.5px solid #E5DDD5;border-radius:100px;padding:4px 10px;font-size:11px;color:#6B5D54;cursor:pointer;white-space:nowrap;font-family:inherit;transition:all .15s}
.sbnb-pill:hover{background:#E5DDD5;color:#2C2420}
#sbnb-input-row{display:flex;gap:8px;padding:10px 14px;border-top:0.5px solid #F0EDE8;background:#fff;flex-shrink:0}
#sbnb-input{flex:1;border:1.5px solid #E5DDD5;border-radius:100px;padding:8px 14px;font-size:13px;font-family:inherit;background:#fff;color:#2C2420;outline:none;transition:border-color .15s}
#sbnb-input:focus{border-color:#C9A96E}
#sbnb-send{width:34px;height:34px;border-radius:50%;background:#1A1714;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:background .15s}
#sbnb-send:hover{background:#C1714F}
#sbnb-send svg{width:16px;height:16px}
`;

const HTML = `
<button id="sbnb-fab" aria-label="Chat SmartBnB">
  <svg class="ico-chat" viewBox="0 0 24 24" fill="none" stroke="#C9A96E" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
  <svg class="ico-close" viewBox="0 0 24 24" fill="none" stroke="#FAF8F4" stroke-width="2" stroke-linecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
  <div id="sbnb-notif">1</div>
</button>
<div id="sbnb-win" role="dialog" aria-label="Chat SmartBnB">
  <div id="sbnb-head">
    <div id="sbnb-av">🏠</div>
    <div>
      <div class="sbnb-hname">Sami — Conseiller SmartBnB</div>
      <div class="sbnb-hstatus">En ligne · Répond en quelques secondes</div>
    </div>
  </div>
  <div id="sbnb-msgs"></div>
  <div id="sbnb-sugg"></div>
  <div id="sbnb-input-row">
    <input id="sbnb-input" type="text" placeholder="Posez votre question..." autocomplete="off" maxlength="500">
    <button id="sbnb-send" aria-label="Envoyer">
      <svg viewBox="0 0 24 24" fill="none" stroke="#C9A96E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
      </svg>
    </button>
  </div>
</div>
`;

const style = document.createElement('style');
style.textContent = CSS;
document.head.appendChild(style);

const div = document.createElement('div');
div.innerHTML = HTML;
document.body.appendChild(div);

let isOpen = false;
let isTyping = false;
let history = [];

const fab = document.getElementById('sbnb-fab');
const win = document.getElementById('sbnb-win');
const msgs = document.getElementById('sbnb-msgs');
const input = document.getElementById('sbnb-input');
const send = document.getElementById('sbnb-send');
const sugg = document.getElementById('sbnb-sugg');
const notif = document.getElementById('sbnb-notif');

const isWorkerConfigured = !CHAT_API_URL.includes('TONPSEUDO');

function toggle() {
  isOpen = !isOpen;
  fab.classList.toggle('open', isOpen);
  win.classList.toggle('open', isOpen);
  notif.style.display = 'none';
  if (isOpen && msgs.children.length === 0) {
    addMsg('assistant', 'Bonjour ! Je suis Sami, votre conseiller SmartBnB 👋\n\nComment puis-je vous aider ? Investissement, gestion locative, création SCI, ameublement...', true);
    showSuggestions();
  }
  if (isOpen) setTimeout(() => input.focus(), 300);
}

function now() {
  return new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

function addMsg(role, text, animate = false) {
  const row = document.createElement('div');
  row.className = `sbnb-msg ${role === 'assistant' ? 'bot' : 'user'}`;
  const wrap = document.createElement('div');
  const bubble = document.createElement('div');
  bubble.className = 'sbnb-bubble';
  const time = document.createElement('div');
  time.className = 'sbnb-time';
  time.textContent = now();

  if (role === 'assistant') {
    const av = document.createElement('div');
    av.className = 'sbnb-msg-av';
    av.textContent = '🏠';
    row.appendChild(av);
    wrap.appendChild(bubble);
    wrap.appendChild(time);
    row.appendChild(wrap);
    msgs.appendChild(row);

    if (animate) {
      let i = 0;
      const interval = setInterval(() => {
        bubble.textContent = text.slice(0, i);
        i += 3;
        if (i > text.length) { bubble.textContent = text; clearInterval(interval); }
      }, 15);
    } else {
      bubble.textContent = text;
    }
  } else {
    bubble.textContent = text;
    wrap.appendChild(bubble);
    wrap.appendChild(time);
    row.appendChild(wrap);
    msgs.appendChild(row);
  }

  history.push({ role, content: text });
  msgs.scrollTop = msgs.scrollHeight;
}

function showTyping() {
  const el = document.createElement('div');
  el.className = 'sbnb-msg bot';
  el.id = 'sbnb-typing-ind';
  el.innerHTML = `<div class="sbnb-msg-av">🏠</div><div class="sbnb-typing"><div class="sbnb-dot"></div><div class="sbnb-dot"></div><div class="sbnb-dot"></div></div>`;
  msgs.appendChild(el);
  msgs.scrollTop = msgs.scrollHeight;
}

function removeTyping() {
  const el = document.getElementById('sbnb-typing-ind');
  if (el) el.remove();
}

function showSuggestions() {
  const shown = [...SUGGESTIONS].sort(() => Math.random() - 0.5).slice(0, 3);
  sugg.innerHTML = '';
  for (const text of shown) {
    const btn = document.createElement('button');
    btn.className = 'sbnb-pill';
    btn.textContent = text;
    btn.addEventListener('click', () => {
      sugg.innerHTML = '';
      sendMessage(text);
    });
    sugg.appendChild(btn);
  }
}

async function sendMessage(text) {
  const clean = (text || '').trim().slice(0, 500);
  if (!clean || isTyping) return;
  addMsg('user', clean);
  input.value = '';
  isTyping = true;
  showTyping();

  let reply;
  if (isWorkerConfigured) {
    try {
      const apiMessages = history.slice(-10).map(m => ({
        role: m.role,
        content: m.content,
      }));
      const res = await fetch(CHAT_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages }),
      });
      if (!res.ok) throw new Error('API ' + res.status);
      const data = await res.json();
      reply = data.content;
    } catch (e) {
      reply = getFallback(clean);
    }
  } else {
    reply = getFallback(clean);
  }

  removeTyping();
  addMsg('assistant', reply || getFallback(clean), true);
  isTyping = false;
  showSuggestions();
}

function getFallback(q) {
  const lq = q.toLowerCase();
  if (lq.includes('tarif') || lq.includes('prix') || lq.includes('commission') || lq.includes('17'))
    return "Notre commission de gestion locative est de 17% du loyer brut, sans frais fixe. C'est l'un des tarifs les plus compétitifs du marché marocain. Vous ne payez que quand le bien est loué.";
  if (lq.includes('marrakech') || lq.includes('rendement') || lq.includes('rentabilit'))
    return "À Marrakech en location courte durée, le rendement brut est de 8 à 12% selon l'emplacement et la qualité du bien. C'est le meilleur ratio du Maroc. Simulez votre rendement sur notre page Smart Invest.";
  if (lq.includes('sci') || lq.includes('société') || lq.includes('societe'))
    return "La SCI au Maroc permet d'acheter en famille, protéger le patrimoine et optimiser la fiscalité. Notre partenaire comptable agréé crée votre SCI à partir de 2 800 MAD. Remplissez notre formulaire pour un devis.";
  if (lq.includes('confier') || lq.includes('gérer') || lq.includes('gerer') || lq.includes('gestion'))
    return "SmartBnB gère votre bien en location courte durée : 17% du loyer brut, conformité loi 80-14, check-in/out, ménage, maintenance et reporting mensuel. Aucun frais fixe. Remplissez le formulaire \"Confier mon bien\" pour commencer.";
  if (lq.includes('france') || lq.includes('étranger') || lq.includes('etranger') || lq.includes('mre') || lq.includes('belgique'))
    return "On travaille principalement avec des investisseurs MRE. Vous gérez tout à distance — visite virtuelle, signature électronique, gestion déléguée. Notre équipe sur place s'occupe de tout. WhatsApp : +212 775 961 740";
  if (lq.includes('tanger'))
    return "Tanger est notre deuxième marché fort — rendement 6 à 9%, croissance des prix +52% en 14 ans. Idéal pour un premier investissement avec un budget accessible.";
  if (lq.includes('ameublement') || lq.includes('meuble') || lq.includes('deco'))
    return "Notre service SmartDéco propose des packs complets de 35 000 à 200 000 MAD selon la taille du bien. Livraison et installation incluses partout au Maroc en 15 jours. Configurez votre pack sur smartdeco.ma";
  if (lq.includes('contact') || lq.includes('rdv') || lq.includes('rappel'))
    return "Pour un RDV ou un rappel, contactez-nous directement :\n📱 WhatsApp : +212 775 961 740\n✉️ contact.smartbnb@gmail.com\nNous répondons sous 24h ouvrées.";
  return "Bonne question ! Pour vous donner une réponse précise et personnalisée, je vous invite à contacter directement un conseiller SmartBnB :\n📱 WhatsApp : +212 775 961 740\nOu remplissez notre formulaire — on vous rappelle sous 24h.";
}

fab.addEventListener('click', toggle);
send.addEventListener('click', () => sendMessage(input.value));
input.addEventListener('keydown', e => { if (e.key === 'Enter') sendMessage(input.value); });

if (!sessionStorage.getItem('sbnb-chat-seen')) {
  setTimeout(() => {
    if (!isOpen) notif.style.display = 'flex';
  }, 25000);
  sessionStorage.setItem('sbnb-chat-seen', '1');
}

})();

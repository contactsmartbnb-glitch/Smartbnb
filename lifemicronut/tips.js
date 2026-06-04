/* ─────────────────────────────────────────────────────────
   LifeMicroNut — Bouton flottant TIP JAR (don libre)
   Inclure via : <script defer src="tips.js"></script>
   ───────────────────────────────────────────────────────── */
(function(){
  /* ⚙ CONFIG : remplacer par le vrai username PayPal.Me */
  var PAYPAL_USERNAME='lifemicronut';

  var MESSAGES={
    5:'Vous offrez un café — ça compte plus que vous ne croyez.',
    10:'Une vraie marque de soutien. Merci 🌱',
    20:'Ça permet de continuer à créer librement.',
    50:'Un engagement fort — merci pour cette confiance.',
    100:'Vous croyez vraiment au projet. Profondément touchée.',
    300:'Un geste précieux qui finance des semaines de travail.'
  };
  function msgFor(v){
    if(v<=5) return MESSAGES[5];
    if(v<=10) return MESSAGES[10];
    if(v<=20) return MESSAGES[20];
    if(v<=50) return MESSAGES[50];
    if(v<=100) return MESSAGES[100];
    if(v<=300) return MESSAGES[300];
    return 'Un soutien exceptionnel. Merci infiniment 💚';
  }
  function paypalUrl(amount){
    return 'https://www.paypal.com/paypalme/'+PAYPAL_USERNAME+'/'+amount+'EUR';
  }

  /* Styles injectés */
  var s=document.createElement('style');
  s.textContent=
    /* Bouton flottant */
    '.lmn-tip-btn{position:fixed;bottom:22px;left:22px;height:54px;padding:0 22px 0 18px;border-radius:30px;'+
    'background:linear-gradient(135deg,#12936A 0%,#0B6E4F 100%);display:flex;align-items:center;gap:9px;'+
    'box-shadow:0 6px 22px -4px rgba(18,147,106,.55),0 4px 10px rgba(0,0,0,.12);'+
    'z-index:1000;text-decoration:none;color:#fff;font-family:Inter,system-ui,sans-serif;'+
    'font-weight:700;font-size:.95rem;cursor:pointer;border:0;'+
    'transition:transform .2s ease,box-shadow .2s ease;'+
    'animation:lmnTipIn .55s cubic-bezier(.22,.61,.36,1) both;animation-delay:.8s}'+
    '.lmn-tip-btn:hover{transform:scale(1.06);box-shadow:0 10px 30px -4px rgba(18,147,106,.65),0 6px 14px rgba(0,0,0,.15)}'+
    '.lmn-tip-btn .heart{font-size:1.15rem;line-height:1}'+
    '.lmn-tip-btn .lbl{letter-spacing:-.01em}'+
    '@keyframes lmnTipIn{from{transform:scale(0) translateY(20px);opacity:0}to{transform:scale(1) translateY(0);opacity:1}}'+
    '@media(max-width:480px){.lmn-tip-btn{bottom:16px;left:16px;height:50px;padding:0 18px 0 16px;font-size:.88rem}.lmn-tip-btn .lbl{display:none}.lmn-tip-btn .heart{font-size:1.4rem}}'+
    /* Overlay */
    '.lmn-tip-ovl{position:fixed;inset:0;background:rgba(22,33,28,.55);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);z-index:1100;display:none;align-items:center;justify-content:center;padding:20px;opacity:0;transition:opacity .25s ease}'+
    '.lmn-tip-ovl.open{display:flex;opacity:1}'+
    /* Modal */
    '.lmn-tip-modal{background:linear-gradient(135deg,#E3F1E9 0%,#F1F7F3 100%);border:1px solid #CFE7DA;border-radius:24px;padding:32px 28px;max-width:480px;width:100%;text-align:center;position:relative;'+
    'box-shadow:0 25px 60px -10px rgba(0,0,0,.3);transform:scale(.85);transition:transform .3s cubic-bezier(.22,.61,.36,1);font-family:Inter,system-ui,sans-serif}'+
    '.lmn-tip-ovl.open .lmn-tip-modal{transform:scale(1)}'+
    '.lmn-tip-close{position:absolute;top:14px;right:14px;width:34px;height:34px;border-radius:50%;background:#fff;border:1px solid #CFE7DA;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:1.1rem;color:#4C574F;transition:all .15s}'+
    '.lmn-tip-close:hover{background:#16211C;color:#fff;border-color:#16211C}'+
    '.lmn-tip-eyebrow{display:inline-block;font-size:.72rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#0B6E4F;margin-bottom:10px;background:#fff;padding:5px 12px;border-radius:20px;border:1px solid #CFE7DA}'+
    '.lmn-tip-title{font-size:1.35rem;font-weight:800;color:#16211C;margin-bottom:10px;line-height:1.25;letter-spacing:-.025em}'+
    '.lmn-tip-title em{font-family:Fraunces,serif;font-style:italic;font-weight:600;color:#0B6E4F}'+
    '.lmn-tip-lead{font-size:.95rem;color:#4C574F;max-width:380px;margin:0 auto 22px;line-height:1.55}'+
    '.lmn-tip-amount{font-family:Fraunces,serif;font-size:3rem;font-weight:600;color:#0B6E4F;line-height:1;margin-bottom:2px;letter-spacing:-.03em}'+
    '.lmn-tip-amount .cur{font-size:1.5rem;font-weight:500;vertical-align:super;margin-left:4px}'+
    '.lmn-tip-msg{font-size:.82rem;color:#76837A;min-height:20px;margin-bottom:16px;font-style:italic}'+
    /* Slider */
    '.lmn-tip-slider-wrap{max-width:380px;margin:0 auto 16px;padding:0 6px}'+
    '.lmn-tip-slider{width:100%;-webkit-appearance:none;appearance:none;height:6px;border-radius:6px;background:linear-gradient(90deg,#12936A 0%,#12936A var(--p,0%),#CFE7DA var(--p,0%),#CFE7DA 100%);outline:none;cursor:pointer}'+
    '.lmn-tip-slider::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:24px;height:24px;border-radius:50%;background:#12936A;cursor:pointer;border:3px solid #fff;box-shadow:0 2px 8px rgba(18,147,106,.4)}'+
    '.lmn-tip-slider::-moz-range-thumb{width:24px;height:24px;border-radius:50%;background:#12936A;cursor:pointer;border:3px solid #fff;box-shadow:0 2px 8px rgba(18,147,106,.4)}'+
    '.lmn-tip-range-labels{display:flex;justify-content:space-between;font-size:.72rem;color:#76837A;margin-top:5px}'+
    /* Presets */
    '.lmn-tip-presets{display:flex;justify-content:center;gap:7px;flex-wrap:wrap;margin-bottom:18px}'+
    '.lmn-tip-preset{padding:7px 14px;background:#fff;border:1.5px solid #CFE7DA;border-radius:20px;font-size:.85rem;font-weight:700;color:#4C574F;cursor:pointer;transition:all .15s;font-family:inherit}'+
    '.lmn-tip-preset:hover{border-color:#12936A;color:#0B6E4F}'+
    '.lmn-tip-preset.active{background:#12936A;border-color:#12936A;color:#fff}'+
    /* CTA */
    '.lmn-tip-cta{display:inline-flex;align-items:center;gap:10px;padding:14px 30px;background:#12936A;color:#fff;border-radius:10px;font-weight:700;font-size:1rem;text-decoration:none;border:0;cursor:pointer;'+
    'transition:all .2s;box-shadow:0 6px 16px -6px rgba(18,147,106,.5);font-family:inherit}'+
    '.lmn-tip-cta:hover{background:#0B6E4F;transform:translateY(-2px)}'+
    '.lmn-tip-tiny{font-size:.74rem;color:#76837A;margin-top:14px;display:flex;align-items:center;justify-content:center;gap:8px;flex-wrap:wrap}'+
    '.lmn-tip-tiny .sep{opacity:.5}'+
    '@media(max-width:480px){.lmn-tip-modal{padding:26px 20px}.lmn-tip-amount{font-size:2.4rem}.lmn-tip-title{font-size:1.2rem}}';
  document.head.appendChild(s);

  /* DOM */
  var btn=document.createElement('button');
  btn.className='lmn-tip-btn';
  btn.setAttribute('aria-label','Soutenir LifeMicroNut');
  btn.innerHTML='<span class="heart">❤</span><span class="lbl">Soutenir</span>';

  var ovl=document.createElement('div');
  ovl.className='lmn-tip-ovl';
  ovl.innerHTML=
    '<div class="lmn-tip-modal" role="dialog" aria-labelledby="lmnTipTitle">'+
      '<button class="lmn-tip-close" aria-label="Fermer">×</button>'+
      '<span class="lmn-tip-eyebrow">🌱 Une bonne action en amène une autre</span>'+
      '<h3 class="lmn-tip-title" id="lmnTipTitle">Soutenir <em>LifeMicroNut</em></h3>'+
      '<p class="lmn-tip-lead">Ce site, ces bilans, ce blog — c\'est des années de travail. Si ça vous aide, un petit geste fait toute la différence pour continuer.</p>'+
      '<div class="lmn-tip-amount"><span id="lmnTipVal">5</span><span class="cur">€</span></div>'+
      '<div class="lmn-tip-msg" id="lmnTipMsg"></div>'+
      '<div class="lmn-tip-slider-wrap">'+
        '<input type="range" min="5" max="1000" value="5" step="1" class="lmn-tip-slider" id="lmnTipSlider" style="--p:0%">'+
        '<div class="lmn-tip-range-labels"><span>5 €</span><span>100 €</span><span>500 €</span><span>1 000 €</span></div>'+
      '</div>'+
      '<div class="lmn-tip-presets">'+
        '<button type="button" class="lmn-tip-preset active" data-amount="5">5 €</button>'+
        '<button type="button" class="lmn-tip-preset" data-amount="10">10 €</button>'+
        '<button type="button" class="lmn-tip-preset" data-amount="20">20 €</button>'+
        '<button type="button" class="lmn-tip-preset" data-amount="50">50 €</button>'+
        '<button type="button" class="lmn-tip-preset" data-amount="100">100 €</button>'+
      '</div>'+
      '<a href="#" class="lmn-tip-cta" id="lmnTipCta" target="_blank" rel="noopener">❤ Donner <span id="lmnTipCtaVal">5</span> € via PayPal</a>'+
      '<p class="lmn-tip-tiny"><span>Paiement sécurisé PayPal</span><span class="sep">·</span><span>Aucune obligation</span><span class="sep">·</span><span>100% volontaire</span></p>'+
    '</div>';

  function mount(){
    if(!document.body) return setTimeout(mount,50);
    document.body.appendChild(btn);
    document.body.appendChild(ovl);
    var slider=ovl.querySelector('#lmnTipSlider'),
        valEl=ovl.querySelector('#lmnTipVal'),
        ctaValEl=ovl.querySelector('#lmnTipCtaVal'),
        msgEl=ovl.querySelector('#lmnTipMsg'),
        cta=ovl.querySelector('#lmnTipCta'),
        presets=ovl.querySelectorAll('.lmn-tip-preset'),
        closeBtn=ovl.querySelector('.lmn-tip-close');

    function update(v){
      v=Math.max(5,Math.min(1000,parseInt(v)||5));
      valEl.textContent=v;
      ctaValEl.textContent=v;
      msgEl.textContent=msgFor(v);
      slider.style.setProperty('--p',((v-5)/995*100)+'%');
      slider.value=v;
      presets.forEach(function(b){b.classList.toggle('active',parseInt(b.dataset.amount)===v);});
      cta.href=paypalUrl(v);
    }
    slider.addEventListener('input',function(){update(this.value);});
    presets.forEach(function(b){b.addEventListener('click',function(){update(b.dataset.amount);});});
    update(5);

    function open(){ovl.classList.add('open');document.body.style.overflow='hidden';}
    function close(){ovl.classList.remove('open');document.body.style.overflow='';}
    btn.addEventListener('click',open);
    closeBtn.addEventListener('click',close);
    ovl.addEventListener('click',function(e){if(e.target===ovl)close();});
    document.addEventListener('keydown',function(e){if(e.key==='Escape'&&ovl.classList.contains('open'))close();});
  }
  if(document.body) mount(); else document.addEventListener('DOMContentLoaded',mount);
})();

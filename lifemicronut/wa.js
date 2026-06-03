/* ─────────────────────────────────────────────────────────
   LifeMicroNut — Bouton flottant WhatsApp
   Inclure via : <script defer src="wa.js"></script>
   ───────────────────────────────────────────────────────── */
(function(){
  var WA_NUMBER='33669579309';
  var WA_TEXT='Bonjour LifeMicroNut, je viens du site et j\'aurais une question.';
  var url='https://wa.me/'+WA_NUMBER+'?text='+encodeURIComponent(WA_TEXT);

  /* Styles injectés */
  var s=document.createElement('style');
  s.textContent=
    '.lmn-wa{position:fixed;bottom:22px;right:22px;width:58px;height:58px;border-radius:50%;'+
    'background:#25D366;display:flex;align-items:center;justify-content:center;'+
    'box-shadow:0 6px 22px -4px rgba(37,211,102,.55),0 4px 10px rgba(0,0,0,.12);'+
    'z-index:1000;text-decoration:none;transition:transform .2s ease,box-shadow .2s ease;'+
    'animation:lmnWaIn .5s cubic-bezier(.22,.61,.36,1) both;animation-delay:.6s}'+
    '.lmn-wa:hover{transform:scale(1.08);box-shadow:0 10px 30px -4px rgba(37,211,102,.65),0 6px 14px rgba(0,0,0,.15)}'+
    '.lmn-wa svg{width:30px;height:30px;fill:#fff}'+
    '.lmn-wa::before{content:"";position:absolute;inset:-6px;border-radius:50%;background:#25D366;opacity:.4;animation:lmnWaPing 2.6s cubic-bezier(0,0,.2,1) infinite;z-index:-1}'+
    '@keyframes lmnWaIn{from{transform:scale(0) rotate(-30deg);opacity:0}to{transform:scale(1) rotate(0);opacity:1}}'+
    '@keyframes lmnWaPing{0%{transform:scale(1);opacity:.4}80%,100%{transform:scale(1.6);opacity:0}}'+
    '@media(max-width:480px){.lmn-wa{bottom:16px;right:16px;width:52px;height:52px}.lmn-wa svg{width:27px;height:27px}}';
  document.head.appendChild(s);

  /* Bouton */
  var a=document.createElement('a');
  a.className='lmn-wa';
  a.href=url;
  a.target='_blank';
  a.rel='noopener';
  a.setAttribute('aria-label','Contacter LifeMicroNut sur WhatsApp');
  a.title='Discuter sur WhatsApp';
  a.innerHTML=
    '<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">'+
    '<path d="M16.003 3C9.376 3 3.999 8.377 3.999 15.003c0 2.353.677 4.547 1.846 6.405L3 29l7.781-2.78a11.94 11.94 0 0 0 5.222 1.214h.005c6.626 0 12.001-5.377 12.003-12.005 0-3.206-1.247-6.221-3.516-8.491A11.92 11.92 0 0 0 16.003 3Zm0 21.998h-.004a9.94 9.94 0 0 1-5.066-1.387l-.363-.216-4.616 1.649 1.643-4.512-.236-.379a9.948 9.948 0 0 1-1.529-5.321c.001-5.504 4.482-9.984 9.987-9.984 2.667 0 5.171 1.04 7.053 2.926a9.927 9.927 0 0 1 2.926 7.055c-.002 5.504-4.483 9.169-9.795 9.169Zm5.473-7.439c-.299-.15-1.767-.871-2.04-.971-.274-.1-.473-.149-.673.15-.199.298-.771.971-.945 1.171-.174.199-.348.224-.647.075-.299-.15-1.262-.466-2.405-1.485-.889-.794-1.49-1.774-1.664-2.073-.174-.299-.019-.46.131-.609.135-.134.299-.349.448-.523.149-.174.199-.299.299-.498.1-.199.05-.373-.025-.523-.075-.149-.673-1.621-.922-2.221-.243-.583-.49-.504-.673-.513l-.573-.011a1.1 1.1 0 0 0-.797.373c-.274.299-1.045 1.021-1.045 2.491s1.07 2.89 1.219 3.089c.149.199 2.105 3.213 5.099 4.505.713.307 1.27.491 1.703.628.715.227 1.366.195 1.881.118.574-.086 1.767-.722 2.016-1.42.249-.697.249-1.295.174-1.42-.075-.124-.273-.198-.572-.348Z"/>'+
    '</svg>';
  /* On attend que le DOM soit prêt si script chargé en defer ça l'est déjà */
  function mount(){document.body.appendChild(a);}
  if(document.body) mount(); else document.addEventListener('DOMContentLoaded',mount);
})();

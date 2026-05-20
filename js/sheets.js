// ═══════════════════════════════════════════════════
// SmartBnB — Envoi des leads vers Google Sheets
// Inclus dans tous les formulaires
// ═══════════════════════════════════════════════════

// L'URL de ton Google Apps Script déployé
// Tu la trouveras à l'étape 3 du guide
const SCRIPT_URL = localStorage.getItem('smartbnb-script-url') || '';

async function sendToSheets(data) {
  // 1. Sauvegarde locale immédiate (fonctionne toujours)
  try {
    const key = 'crm-leads';
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    const lead = {
      id: Date.now(),
      ...data,
      statut: 'nouveau',
      date: new Date().toISOString().slice(0, 10),
      notes: ''
    };
    existing.unshift(lead);
    localStorage.setItem(key, JSON.stringify(existing.slice(0, 1000)));
  } catch(e) {}

  // 2. Envoi vers Google Sheets si configuré
  const url = SCRIPT_URL || localStorage.getItem('smartbnb-script-url');
  if (!url) {
    console.log('Google Sheets non configuré — lead sauvegardé localement');
    return true;
  }

  try {
    await fetch(url, {
      method: 'POST',
      mode: 'no-cors', // requis pour Google Apps Script
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return true;
  } catch(e) {
    console.log('Erreur envoi:', e);
    return false;
  }
}

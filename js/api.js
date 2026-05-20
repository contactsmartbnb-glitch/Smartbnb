// ════════════════════════════════════════
// SmartBnB — API Supabase
// Ce fichier est inclus dans tous les formulaires
// Il envoie les données vers votre base Supabase
// ════════════════════════════════════════

const SUPABASE_URL = 'https://VOTRE_PROJECT_ID.supabase.co';
const SUPABASE_KEY = 'VOTRE_ANON_KEY';

// Envoi d'un lead vers Supabase
async function sendLead(data) {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/leads`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        prenom: data.prenom || '',
        nom: data.nom || '',
        email: data.email || '',
        telephone: data.telephone || '',
        pays: data.pays || '',
        formulaire: data.formulaire || 'inconnu',
        ville: data.ville || '',
        budget: data.budget || '',
        statut: 'nouveau',
        data: data.reponses || {},
        created_at: new Date().toISOString()
      })
    });
    if (res.ok) {
      console.log('Lead envoyé avec succès');
      return true;
    } else {
      console.error('Erreur Supabase:', res.status);
      return false;
    }
  } catch (e) {
    console.error('Erreur réseau:', e);
    return false;
  }
}

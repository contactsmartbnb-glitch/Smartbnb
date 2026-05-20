// SmartBnB — Envoi des leads vers Airtable
// Inclure ce fichier dans tous les formulaires : <script src="js/airtable.js"></script>

const AIRTABLE = {
  base: localStorage.getItem('crm-cfg') ? JSON.parse(localStorage.getItem('crm-cfg')).base : '',
  key:  localStorage.getItem('crm-cfg') ? JSON.parse(localStorage.getItem('crm-cfg')).key  : '',
};

async function sendToAirtable(data) {
  // Sauvegarde locale d'abord (toujours)
  try {
    const existing = JSON.parse(localStorage.getItem('crm-leads') || '[]');
    existing.unshift({ id: Date.now(), ...data, statut: 'nouveau', date: new Date().toISOString().slice(0, 10) });
    localStorage.setItem('crm-leads', JSON.stringify(existing.slice(0, 500)));
  } catch(e) {}

  // Envoi Airtable si configuré
  if (!AIRTABLE.base || !AIRTABLE.key) return true;

  try {
    const res = await fetch(`https://api.airtable.com/v0/${AIRTABLE.base}/Leads`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AIRTABLE.key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fields: {
          prenom:     data.prenom     || '',
          nom:        data.nom        || '',
          email:      data.email      || '',
          telephone:  data.telephone  || '',
          pays:       data.pays       || '',
          formulaire: data.formulaire || '',
          ville:      data.ville      || '',
          budget:     data.budget     || '',
          statut:     'nouveau',
          date:       new Date().toISOString().slice(0, 10),
          notes:      '',
          reponses:   data.reponses   || '',
        }
      })
    });
    return res.ok;
  } catch(e) {
    console.log('Airtable non configuré — lead sauvegardé localement');
    return false;
  }
}

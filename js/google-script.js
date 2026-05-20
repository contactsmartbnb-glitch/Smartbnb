// ═══════════════════════════════════════════════════
// SmartBnB — Google Apps Script
// Colle ce code dans script.google.com
// Ce script reçoit les leads des formulaires
// et les écrit dans Google Sheets + envoie un email
// ═══════════════════════════════════════════════════

// TON EMAIL pour recevoir les notifications
const EMAIL_NOTIF = 'contact.smartbnb@gmail.com';

// Nom de la feuille dans Google Sheets
const SHEET_NAME = 'Leads';

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);

    // Créer les en-têtes si la feuille est vide
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'ID', 'Date', 'Prénom', 'Nom', 'Email', 'Téléphone',
        'Pays', 'Formulaire', 'Ville', 'Budget', 'Statut', 'Réponses', 'Notes'
      ]);
      sheet.getRange(1, 1, 1, 13).setFontWeight('bold').setBackground('#1a1a1a').setFontColor('#ffffff');
      sheet.setFrozenRows(1);
    }

    // Ajouter le lead
    const id = 'SB-' + new Date().getTime();
    const now = new Date().toLocaleDateString('fr-FR');
    sheet.appendRow([
      id,
      now,
      data.prenom || '',
      data.nom || '',
      data.email || '',
      data.telephone || '',
      data.pays || '',
      data.formulaire || '',
      data.ville || '',
      data.budget || '',
      'Nouveau',
      data.reponses || '',
      ''
    ]);

    // Mettre en couleur la ligne selon le formulaire
    const lastRow = sheet.getLastRow();
    const colors = {
      decouverte: '#e1f5ee',
      sci: '#faeeda',
      profil: '#eeedfe',
      qualification: '#e6f1fb'
    };
    const bg = colors[data.formulaire] || '#ffffff';
    sheet.getRange(lastRow, 1, 1, 13).setBackground(bg);

    // Envoyer un email de notification
    const subject = `🔔 Nouveau lead SmartBnB — ${data.prenom || ''} ${data.nom || ''} (${data.formulaire || ''})`;
    const body = `
Nouveau lead reçu sur SmartBnB.ma

━━━━━━━━━━━━━━━━━━━━━━━━━━
CONTACT
━━━━━━━━━━━━━━━━━━━━━━━━━━
Nom       : ${data.prenom || ''} ${data.nom || ''}
Email     : ${data.email || ''}
Téléphone : ${data.telephone || '—'}
Pays      : ${data.pays || '—'}

━━━━━━━━━━━━━━━━━━━━━━━━━━
PROJET
━━━━━━━━━━━━━━━━━━━━━━━━━━
Formulaire : ${data.formulaire || ''}
Ville      : ${data.ville || '—'}
Budget     : ${data.budget || '—'}

━━━━━━━━━━━━━━━━━━━━━━━━━━
RÉPONSES
━━━━━━━━━━━━━━━━━━━━━━━━━━
${data.reponses || 'Aucune réponse enregistrée'}

━━━━━━━━━━━━━━━━━━━━━━━━━━
Voir dans le CRM : https://smartbnb.ma/crm.html
    `;

    GmailApp.sendEmail(EMAIL_NOTIF, subject, body);

    return ContentService
      .createTextOutput(JSON.stringify({ success: true, id: id }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Test depuis l'éditeur
function test() {
  const fakeEvent = {
    postData: {
      contents: JSON.stringify({
        prenom: 'Test',
        nom: 'Lead',
        email: 'test@test.com',
        telephone: '+33600000000',
        pays: 'France',
        formulaire: 'decouverte',
        ville: 'Marrakech',
        budget: '1m_2m',
        reponses: 'Type: Studio | Emplacement: Vue mer'
      })
    }
  };
  const result = doPost(fakeEvent);
  Logger.log(result.getContent());
}

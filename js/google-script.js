// ═══════════════════════════════════════════════════════════════════
// SmartBnB — Google Apps Script
// ═══════════════════════════════════════════════════════════════════
// Ce script reçoit 3 types d'événements :
//   1. Formulaires du site (legacy) — création d'un lead via les pages
//      formulaire-decouverte.html, formulaire-sci.html, etc.
//   2. type='create' depuis le CRM (création manuelle d'un lead /
//      acquéreur / chantier)
//   3. type='status_change' depuis le CRM Kanban (carte glissée d'une
//      colonne à l'autre)
//
// Pour chaque événement :
//   - Une ligne est ajoutée ou mise à jour dans le bon Sheet
//   - Le journal "Événements" est alimenté
//   - Des emails sont envoyés aux parties concernées selon des templates
//     définis ci-dessous (à personnaliser librement)
// ═══════════════════════════════════════════════════════════════════

// ─── CONFIG ─────────────────────────────────────────────────────────
const ADMIN_EMAIL = 'contact.smartbnb@gmail.com';
const FROM_NAME   = 'SmartBnB';
const CRM_URL     = 'https://smartbnb.ma/crm.html';

const SHEET_LEADS = 'Leads';
const SHEET_ACQ   = 'Acquéreurs';
const SHEET_TRV   = 'Chantiers';
const SHEET_LOG   = 'Événements';

// ─── LIBELLÉS DES STATUTS (doivent matcher ceux du CRM) ─────────────
const SL  = {nouveau:'Nouveau',contact:'Contacté',rdv:'RDV planifié',offre:'Offre faite',gagne:'Gagné',perdu:'Perdu'};
const ASL = {biens_select:'Biens sélectionnés',visites:'Visites planifiées',offre_envoyee:'Offre envoyée',offre_acceptee:'Offre acceptée',compromis:'Compromis signé',acte:'Acte authentique',abandon:'Abandon'};
const TSL = {devis_cours:'Devis en cours',devis_signe:'Devis signé',devis_ameub:'Devis ameublement validé',travaux_cours:'Travaux en cours',reception:'Réception travaux + meubles',en_location:'En location'};

const FL  = {decouverte:'Découverte',sci:'SCI',profil:'Profil acquéreur',qualification:'Qualification'};
const BL  = {'m500k':'< 45k€','500k_1m':'45–90k€','1m_2m':'90–180k€','2m_3m':'180–270k€','p3m':'> 270k€'};

// ─── SCHEMAS DE COLONNES PAR SHEET ──────────────────────────────────
const SCHEMA = {
  leads: {
    sheet: SHEET_LEADS,
    cols: ['ID','Date','Prénom','Nom','Email','Téléphone','Pays','Formulaire','Ville','Budget','Statut','Réponses','Notes'],
    headerColor: '#1a1a1a',
    statusCol: 11, // 1-indexed
    map: it => [
      it.id || '',
      it.date || new Date().toISOString().slice(0,10),
      it.prenom || '',
      it.nom || '',
      it.email || '',
      it.telephone || '',
      it.pays || '',
      FL[it.formulaire] || it.formulaire || '',
      it.ville || '',
      BL[it.budget] || it.budget || '',
      SL[it.statut] || it.statut || 'Nouveau',
      it.reponses || '',
      it.notes || ''
    ],
    rowColor: it => ({decouverte:'#e1f5ee',sci:'#faeeda',profil:'#eeedfe',qualification:'#e6f1fb'}[it.formulaire] || '#ffffff'),
  },
  acquereurs: {
    sheet: SHEET_ACQ,
    cols: ['ID','Date','Prénom','Nom','Email','Téléphone','Ville','Type bien','Budget (MAD)','Bien ciblé','Statut','Notes'],
    headerColor: '#3c3489',
    statusCol: 11,
    map: it => [
      it.id || '',
      it.date || new Date().toISOString().slice(0,10),
      it.prenom || '',
      it.nom || '',
      it.email || '',
      it.telephone || '',
      it.ville || '',
      it.typebien || '',
      it.budget || 0,
      it.bienCible || '',
      ASL[it.statut] || it.statut || '',
      it.notes || ''
    ],
    rowColor: () => '#eeedfe',
  },
  travaux: {
    sheet: SHEET_TRV,
    cols: ['ID','Date','Propriétaire','Email proprio','Téléphone','Ville','Bien','Budget travaux (MAD)','Prestataire','Email prestataire','Statut','Notes'],
    headerColor: '#0c447c',
    statusCol: 11,
    map: it => [
      it.id || '',
      it.date || new Date().toISOString().slice(0,10),
      ((it.prenom || '') + ' ' + (it.nom || '')).trim(),
      it.email || '',
      it.telephone || '',
      it.ville || '',
      it.bien || '',
      it.budget || 0,
      it.prestataire || '',
      it.prestataireEmail || '',
      TSL[it.statut] || it.statut || '',
      it.notes || ''
    ],
    rowColor: () => '#e6f1fb',
  },
};

// ─── TEMPLATES EMAIL PAR TRANSITION ─────────────────────────────────
// Chaque template renvoie : { subject, body, to: [...emails] }
// `to` peut contenir 'admin' (résolu en ADMIN_EMAIL), 'client' (item.email),
// 'prestataire' (item.prestataireEmail).
const EMAIL_TEMPLATES = {

  // ─── LEADS ───
  'leads:create': it => ({
    subject: `🔔 Nouveau lead — ${it.prenom} ${it.nom} (${FL[it.formulaire] || it.formulaire})`,
    to: ['admin'],
    body: `Nouveau lead reçu sur SmartBnB.

CONTACT
Nom       : ${it.prenom} ${it.nom}
Email     : ${it.email}
Téléphone : ${it.telephone || '—'}
Pays      : ${it.pays || '—'}

PROJET
Formulaire : ${FL[it.formulaire] || it.formulaire}
Ville      : ${it.ville || '—'}
Budget     : ${BL[it.budget] || it.budget || '—'}

RÉPONSES
${it.reponses || '—'}

→ Voir dans le CRM : ${CRM_URL}`,
  }),

  'leads:contact': it => ({
    subject: `📞 Lead contacté — ${it.prenom} ${it.nom}`,
    to: ['admin'],
    body: `Le lead ${it.prenom} ${it.nom} est passé au statut "Contacté".
Pense à programmer le RDV de découverte.

→ ${CRM_URL}`,
  }),

  'leads:gagne': it => ({
    subject: `✅ Lead gagné — ${it.prenom} ${it.nom}`,
    to: ['admin'],
    body: `Le lead ${it.prenom} ${it.nom} est marqué comme gagné 🎉.

Étape suivante : crée la fiche Acquéreur dans le CRM pour suivre la transaction.
→ ${CRM_URL}`,
  }),

  'leads:perdu': it => ({
    subject: `❌ Lead perdu — ${it.prenom} ${it.nom}`,
    to: ['admin'],
    body: `Le lead ${it.prenom} ${it.nom} est marqué comme perdu.
Pense à noter la raison dans la fiche pour analyse future.

→ ${CRM_URL}`,
  }),

  // ─── ACQUÉREURS ───
  'acquereurs:create': it => ({
    subject: `🤝 Nouvel acquéreur — ${it.prenom} ${it.nom}`,
    to: ['admin'],
    body: `Nouvel acquéreur dans le pipeline.

Contact : ${it.prenom} ${it.nom} · ${it.email}
Ville   : ${it.ville}
Budget  : ${it.budget ? Number(it.budget).toLocaleString('fr-FR') + ' MAD' : '—'}
Cible   : ${it.bienCible || '—'}
Statut  : ${ASL[it.statut] || it.statut}

→ ${CRM_URL}`,
  }),

  'acquereurs:visites': it => ({
    subject: `🗓️ Visites planifiées — ${it.bienCible || it.prenom + ' ' + it.nom}`,
    to: ['admin', 'client'],
    body: `Bonjour ${it.prenom},

Nous avons planifié les visites pour le bien : ${it.bienCible || 'bien sélectionné'}.

Vous recevrez les détails (date, heure, contact sur place) par WhatsApp dans les prochaines 24h.

À très vite,
L'équipe SmartBnB
WhatsApp : +212 775 961 740`,
  }),

  'acquereurs:offre_envoyee': it => ({
    subject: `📤 Offre envoyée — ${it.prenom} ${it.nom}`,
    to: ['admin'],
    body: `Offre envoyée pour ${it.prenom} ${it.nom}.
Bien : ${it.bienCible || '—'}
Budget acquéreur : ${it.budget ? Number(it.budget).toLocaleString('fr-FR') + ' MAD' : '—'}

Suivi à programmer dans 48h si pas de retour vendeur.
→ ${CRM_URL}`,
  }),

  'acquereurs:offre_acceptee': it => ({
    subject: `🎉 Offre acceptée — bonne nouvelle ${it.prenom}`,
    to: ['admin', 'client'],
    body: `Bonjour ${it.prenom},

Excellente nouvelle : votre offre sur ${it.bienCible || 'le bien'} a été acceptée par le vendeur 🎉.

Étapes suivantes :
1. Rédaction du compromis de vente par le notaire (5 à 10 jours)
2. Signature du compromis (présentiel ou électronique)
3. Délai de rétractation : 10 jours
4. Acte authentique : 2 à 3 mois après le compromis

Nous reprenons contact très vite pour caler le RDV notaire.

Félicitations,
L'équipe SmartBnB
WhatsApp : +212 775 961 740`,
  }),

  'acquereurs:compromis': it => ({
    subject: `📝 Compromis signé — ${it.prenom} ${it.nom}`,
    to: ['admin', 'client'],
    body: `Bonjour ${it.prenom},

Le compromis de vente pour ${it.bienCible || 'votre bien'} est signé ✓.

Nous restons en contact avec le notaire jusqu'à la date d'acte authentique. Vous pouvez d'ores et déjà préparer :
- Justificatifs de fonds (relevés bancaires, attestations)
- Documents d'identité à jour
- Procuration le cas échéant (notamment si vous êtes hors Maroc)

Nous vous tenons informé de l'avancement.

L'équipe SmartBnB`,
  }),

  'acquereurs:acte': it => ({
    subject: `🏠 Acquisition finalisée — félicitations ${it.prenom} !`,
    to: ['admin', 'client'],
    body: `Bonjour ${it.prenom},

C'est officiel : l'acte authentique pour ${it.bienCible || 'votre bien'} est signé. Vous êtes propriétaire 🏠✨.

Étapes immédiates côté SmartBnB :
- Transmission des clés et inventaire
- Si chantier travaux prévu : démarrage selon devis signé
- Si gestion locative SmartBnB : briefing avec votre Responsable Bien

Nous restons à votre entière disposition pour la suite.

Toutes nos félicitations,
L'équipe SmartBnB
WhatsApp : +212 775 961 740`,
  }),

  // ─── TRAVAUX ───
  'travaux:create': it => ({
    subject: `🔧 Nouveau chantier — ${it.bien || it.prenom + ' ' + it.nom}`,
    to: ['admin'],
    body: `Nouveau chantier créé.

Propriétaire : ${it.prenom} ${it.nom} (${it.email})
Bien        : ${it.bien || '—'}
Ville       : ${it.ville || '—'}
Budget      : ${it.budget ? Number(it.budget).toLocaleString('fr-FR') + ' MAD' : '—'}
Prestataire : ${it.prestataire || 'à définir'}
Statut      : ${TSL[it.statut] || it.statut}

→ ${CRM_URL}`,
  }),

  'travaux:devis_signe': it => ({
    subject: `✅ Devis travaux signé — ${it.bien || ''}`,
    to: ['admin', 'client', 'prestataire'],
    body: `Bonjour,

Le devis travaux pour ${it.bien || 'le bien'} est signé ✓.

Récap :
- Propriétaire : ${it.prenom} ${it.nom}
- Budget       : ${it.budget ? Number(it.budget).toLocaleString('fr-FR') + ' MAD' : '—'}
- Prestataire  : ${it.prestataire || '—'}

Étapes suivantes côté SmartBnB :
1. Coordination du démarrage avec le prestataire
2. Visite de chantier hebdomadaire
3. Photos d'avancement partagées au propriétaire

L'équipe SmartBnB
WhatsApp : +212 775 961 740`,
  }),

  'travaux:devis_ameub': it => ({
    subject: `🛋️ Devis ameublement validé — ${it.bien || ''}`,
    to: ['admin', 'client'],
    body: `Bonjour ${it.prenom},

Votre devis ameublement (SmartDéco) pour ${it.bien || 'votre bien'} est validé ✓.

Délais habituels :
- Préparation et fabrication : 7 à 10 jours
- Livraison et installation  : 2 à 5 jours selon la ville

Notre équipe SmartDéco vous contacte sous 48h pour fixer la date d'installation.

L'équipe SmartBnB`,
  }),

  'travaux:travaux_cours': it => ({
    subject: `🚧 Travaux démarrés — ${it.bien || ''}`,
    to: ['admin', 'client'],
    body: `Bonjour ${it.prenom},

Les travaux pour ${it.bien || 'votre bien'} ont démarré 🚧.

Vous recevrez :
- Un reporting photo chaque vendredi
- Une notification à chaque jalon (gros œuvre, second œuvre, finitions)
- Une alerte en cas d'imprévu

Pour toute question, votre interlocuteur est joignable via WhatsApp : +212 775 961 740.

L'équipe SmartBnB`,
  }),

  'travaux:reception': it => ({
    subject: `🎁 Réception travaux + meubles — ${it.bien || ''}`,
    to: ['admin', 'client'],
    body: `Bonjour ${it.prenom},

Les travaux ET l'ameublement de ${it.bien || 'votre bien'} sont réceptionnés ✓.

Documents transmis :
- PV de réception signé
- Garanties artisans et matériel
- Inventaire complet du mobilier
- Photos haute définition pour la mise en location

Si la gestion locative SmartBnB est activée, votre bien part en commercialisation dans les 48h.

L'équipe SmartBnB`,
  }),

  'travaux:en_location': it => ({
    subject: `🌟 Bien en location — ${it.bien || ''}`,
    to: ['admin'],
    body: `${it.bien || ''} est désormais en location.
Propriétaire : ${it.prenom} ${it.nom}
À surveiller : occupation premier mois, reviews du calendrier d'arrivée.

→ ${CRM_URL}`,
  }),
};

// ═══════════════════════════════════════════════════════════════════
//   ROUTAGE PRINCIPAL
// ═══════════════════════════════════════════════════════════════════
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    if (data.type === 'create') {
      return handleCreate(data.board, data.item || data);
    }
    if (data.type === 'status_change') {
      return handleStatusChange(data.board, data.item, data.oldStatus, data.newStatus);
    }
    // Sinon : payload d'un formulaire du site (compat legacy)
    return handleLegacyForm(data);

  } catch (err) {
    console.error(err);
    return jsonOK({ success: false, error: String(err) });
  }
}

// ─── CRÉATION ───────────────────────────────────────────────────────
function handleCreate(board, item) {
  const schema = SCHEMA[board];
  if (!schema) return jsonOK({ success: false, error: 'unknown board: ' + board });

  ensureSheet(schema);
  appendRow(schema, item);
  logEvent('create', board, item, '', item.statut || '');

  const tpl = (EMAIL_TEMPLATES[board + ':create'] || (() => null))(item);
  if (tpl) sendTemplate(tpl, item);

  return jsonOK({ success: true, action: 'create', board });
}

// ─── TRANSITION DE STATUT ───────────────────────────────────────────
function handleStatusChange(board, item, oldStatus, newStatus) {
  const schema = SCHEMA[board];
  if (!schema) return jsonOK({ success: false, error: 'unknown board: ' + board });

  ensureSheet(schema);

  // Met à jour la ligne existante (par ID). Si absente, on l'ajoute.
  const updated = updateRowById(schema, item, newStatus);
  if (!updated) appendRow(schema, item);

  logEvent('status_change', board, item, oldStatus, newStatus);

  const tpl = (EMAIL_TEMPLATES[board + ':' + newStatus] || (() => null))(item);
  if (tpl) sendTemplate(tpl, item);

  return jsonOK({ success: true, action: 'status_change', board });
}

// ─── FORMULAIRE LEGACY (depuis le site) ─────────────────────────────
function handleLegacyForm(data) {
  const item = {
    id: data.id || ('SB-' + Date.now()),
    date: new Date().toISOString().slice(0, 10),
    prenom: data.prenom || '',
    nom: data.nom || '',
    email: data.email || '',
    telephone: data.telephone || '',
    pays: data.pays || '',
    formulaire: data.formulaire || 'decouverte',
    ville: data.ville || '',
    budget: data.budget || '',
    statut: 'nouveau',
    reponses: data.reponses || '',
    notes: '',
  };
  return handleCreate('leads', item);
}

// ═══════════════════════════════════════════════════════════════════
//   SHEETS HELPERS
// ═══════════════════════════════════════════════════════════════════
function ensureSheet(schema) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(schema.sheet);
  if (!sheet) sheet = ss.insertSheet(schema.sheet);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(schema.cols);
    sheet.getRange(1, 1, 1, schema.cols.length)
         .setFontWeight('bold').setBackground(schema.headerColor).setFontColor('#ffffff');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function appendRow(schema, item) {
  const sheet = ensureSheet(schema);
  sheet.appendRow(schema.map(item));
  const row = sheet.getLastRow();
  sheet.getRange(row, 1, 1, schema.cols.length).setBackground(schema.rowColor(item));
}

function updateRowById(schema, item, newStatus) {
  const sheet = ensureSheet(schema);
  const data = sheet.getDataRange().getValues();
  const idStr = String(item.id);
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === idStr) {
      // Met à jour le statut + la date + les notes
      const labels = schema === SCHEMA.leads ? SL : schema === SCHEMA.acquereurs ? ASL : TSL;
      sheet.getRange(i + 1, schema.statusCol).setValue(labels[newStatus] || newStatus);
      sheet.getRange(i + 1, 2).setValue(new Date().toISOString().slice(0, 10)); // colonne Date
      if (item.notes !== undefined) {
        const notesCol = schema.cols.indexOf('Notes') + 1;
        if (notesCol > 0) sheet.getRange(i + 1, notesCol).setValue(item.notes);
      }
      return true;
    }
  }
  return false;
}

function ensureLogSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_LOG);
  if (!sheet) sheet = ss.insertSheet(SHEET_LOG);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Timestamp','Événement','Board','ID','Contact','Email','Ancien statut','Nouveau statut']);
    sheet.getRange(1, 1, 1, 8).setFontWeight('bold').setBackground('#1a1a1a').setFontColor('#ffffff');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function logEvent(type, board, item, oldStatus, newStatus) {
  const sheet = ensureLogSheet();
  const labels = board === 'leads' ? SL : board === 'acquereurs' ? ASL : TSL;
  sheet.appendRow([
    new Date(),
    type,
    board,
    item.id || '',
    ((item.prenom || '') + ' ' + (item.nom || '')).trim(),
    item.email || '',
    labels[oldStatus] || oldStatus || '',
    labels[newStatus] || newStatus || '',
  ]);
}

// ═══════════════════════════════════════════════════════════════════
//   EMAIL HELPERS
// ═══════════════════════════════════════════════════════════════════
function resolveRecipients(tpl, item) {
  const out = [];
  for (const slot of (tpl.to || [])) {
    if (slot === 'admin') out.push(ADMIN_EMAIL);
    else if (slot === 'client' && item.email) out.push(item.email);
    else if (slot === 'prestataire' && item.prestataireEmail) out.push(item.prestataireEmail);
    else if (typeof slot === 'string' && slot.includes('@')) out.push(slot);
  }
  // Déduplication
  return Array.from(new Set(out.filter(Boolean)));
}

function sendTemplate(tpl, item) {
  const recipients = resolveRecipients(tpl, item);
  if (!recipients.length) return;
  GmailApp.sendEmail(recipients.join(','), tpl.subject, tpl.body, { name: FROM_NAME });
}

function jsonOK(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

// ═══════════════════════════════════════════════════════════════════
//   TESTS — à lancer depuis l'éditeur
// ═══════════════════════════════════════════════════════════════════
function testLeadCreate() {
  const fakeEvent = { postData: { contents: JSON.stringify({
    type: 'create',
    board: 'leads',
    item: {
      id: 'TEST-' + Date.now(),
      prenom: 'Test', nom: 'Lead', email: 'test@example.com',
      telephone: '+33600000000', pays: 'France',
      formulaire: 'decouverte', ville: 'Marrakech', budget: '1m_2m',
      statut: 'nouveau',
      reponses: 'Type: Studio | Emplacement: Vue mer',
    },
  }) } };
  Logger.log(doPost(fakeEvent).getContent());
}

function testStatusChange() {
  const fakeEvent = { postData: { contents: JSON.stringify({
    type: 'status_change',
    board: 'acquereurs',
    item: {
      id: 'TEST-ACQ-1',
      prenom: 'Test', nom: 'Acquéreur', email: 'acq@example.com',
      ville: 'Rabat', budget: 1500000, bienCible: 'Appart test Agdal',
    },
    oldStatus: 'visites',
    newStatus: 'offre_acceptee',
  }) } };
  Logger.log(doPost(fakeEvent).getContent());
}

function testLegacyForm() {
  const fakeEvent = { postData: { contents: JSON.stringify({
    prenom: 'Test', nom: 'Legacy', email: 'legacy@example.com',
    telephone: '+33611111111', pays: 'France',
    formulaire: 'decouverte', ville: 'Marrakech', budget: '500k_1m',
    reponses: 'Test format ancien',
  }) } };
  Logger.log(doPost(fakeEvent).getContent());
}

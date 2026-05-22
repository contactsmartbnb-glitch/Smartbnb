/* ============================================================
   Mehdia — Fonction serverless d'accompagnement micronutrition
   ------------------------------------------------------------
   Reçoit : les réponses au questionnaire + le texte DÉ-IDENTIFIÉ
            des analyses déposées par l'utilisatrice.
   Renvoie : un protocole micronutrition structuré, généré par
             l'API Claude, en s'appuyant sur les cours fournis.

   Sécurité : la clé API reste côté serveur (variable
   d'environnement ANTHROPIC_API_KEY). Le front n'y a jamais accès.
   ============================================================ */

var fs = require('fs');
var path = require('path');

var API_URL = 'https://api.anthropic.com/v1/messages';
var MODEL = process.env.MEHDIA_MODEL || 'claude-sonnet-4-6';

// Charge la base de connaissance (cours de micronutrition).
// Déposez les fichiers .txt / .md dans le dossier /cours.
function loadKnowledgeBase() {
  try {
    var dir = path.join(__dirname, '..', '..', 'cours');
    if (!fs.existsSync(dir)) return '';
    return fs.readdirSync(dir)
      .filter(function (f) { return /\.(txt|md)$/i.test(f) && f.charAt(0) !== '_'; })
      .map(function (f) {
        return '### ' + f + '\n' + fs.readFileSync(path.join(dir, f), 'utf8');
      })
      .join('\n\n');
  } catch (e) {
    return '';
  }
}

var SYSTEM_INTRO =
  'Tu es l\'assistant micronutrition de Mehdia, encadré par une pharmacienne ' +
  'diplômée. Tu proposes un ACCOMPAGNEMENT en micronutrition, jamais un ' +
  'diagnostic ni une prescription médicale. Tu t\'appuies STRICTEMENT sur la ' +
  'base de connaissance fournie ci-dessous. Règles : ' +
  '1) Ne jamais nommer la personne ni inventer de données identifiantes. ' +
  '2) Toujours rappeler que les recommandations complètent, sans le remplacer, ' +
  'un suivi médical. ' +
  '3) Si une valeur d\'analyse sort de la normale de façon préoccupante, ' +
  'inviter explicitement à consulter un médecin. ' +
  '4) Rester dans le périmètre de la micronutrition (nutrition, micronutriments, ' +
  'hygiène de vie). ' +
  '5) Répondre en français, avec bienveillance, de façon claire et structurée.';

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'Méthode non autorisée.' });
  }

  var apiKey = process.env.ANTHROPIC_API_KEY;
  var knowledge = loadKnowledgeBase();

  if (!apiKey) {
    return json(200, {
      status: 'config_pending',
      message: 'L\'accompagnement personnalisé sera disponible dès la ' +
               'configuration de la clé API et le dépôt des cours de micronutrition.'
    });
  }
  if (!knowledge) {
    return json(200, {
      status: 'knowledge_pending',
      message: 'La base de connaissance micronutrition n\'a pas encore été ' +
               'chargée (dossier /cours vide).'
    });
  }

  var payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch (e) {
    return json(400, { error: 'Requête invalide.' });
  }

  var questionnaire = JSON.stringify(payload.questionnaire || {}, null, 2);
  var analyses = (payload.analysesText || '').toString().slice(0, 20000);

  var userMessage =
    'Voici le bilan d\'une utilisatrice (données pseudonymisées).\n\n' +
    'RÉPONSES AU QUESTIONNAIRE :\n' + questionnaire + '\n\n' +
    'RÉSULTATS D\'ANALYSES (texte dé-identifié) :\n' +
    (analyses || '(aucune analyse déposée pour le moment)') + '\n\n' +
    'Propose un accompagnement micronutrition structuré : ' +
    '1) lecture des éléments marquants, 2) priorités, ' +
    '3) recommandations alimentaires, 4) micronutriments à envisager ' +
    '(avec réserves d\'usage), 5) hygiène de vie, 6) points à signaler au médecin.';

  try {
    var res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 2000,
        system: [
          { type: 'text', text: SYSTEM_INTRO },
          {
            type: 'text',
            text: 'BASE DE CONNAISSANCE (cours de micronutrition) :\n\n' + knowledge,
            cache_control: { type: 'ephemeral' }
          }
        ],
        messages: [{ role: 'user', content: userMessage }]
      })
    });

    var data = await res.json();
    if (!res.ok) {
      return json(502, { error: 'Erreur du service IA.', detail: data });
    }
    var text = (data.content || [])
      .filter(function (b) { return b.type === 'text'; })
      .map(function (b) { return b.text; })
      .join('\n');

    return json(200, { status: 'ok', protocole: text });
  } catch (e) {
    return json(500, { error: 'Erreur serveur.', detail: String(e) });
  }
};

function json(code, body) {
  return {
    statusCode: code,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body)
  };
}

/* ============================================================
   Mehdia — Cloudflare Pages Function : accompagnement micronutrition
   ------------------------------------------------------------
   Route automatique : POST /api/analyse
   Reçoit : les réponses au questionnaire + le texte DÉ-IDENTIFIÉ
            des analyses déposées par l'utilisatrice.
   Renvoie : un protocole micronutrition structuré, généré par
             l'API Claude, en s'appuyant sur les cours fournis.

   Sécurité : la clé API reste côté serveur (variable
   d'environnement ANTHROPIC_API_KEY, définie dans le tableau de
   bord Cloudflare Pages). Le front n'y a jamais accès.

   Note runtime : les Pages Functions n'ont pas d'accès disque.
   Les cours sont lus via les assets statiques (env.ASSETS) à
   partir du manifeste /cours/manifest.json.
   ============================================================ */

var API_URL = 'https://api.anthropic.com/v1/messages';

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

// Charge les cours de micronutrition depuis les assets statiques.
// Déposez les fichiers dans /cours et listez-les dans /cours/manifest.json.
async function loadKnowledgeBase(env, request) {
  try {
    var manifestRes = await env.ASSETS.fetch(
      new Request(new URL('/cours/manifest.json', request.url))
    );
    if (!manifestRes.ok) return '';
    var files = await manifestRes.json();
    if (!Array.isArray(files) || !files.length) return '';
    var parts = [];
    for (var i = 0; i < files.length; i++) {
      var r = await env.ASSETS.fetch(
        new Request(new URL('/cours/' + files[i], request.url))
      );
      if (r.ok) parts.push('### ' + files[i] + '\n' + (await r.text()));
    }
    return parts.join('\n\n');
  } catch (e) {
    return '';
  }
}

function json(code, body) {
  return new Response(JSON.stringify(body), {
    status: code,
    headers: { 'content-type': 'application/json; charset=utf-8' }
  });
}

export async function onRequestPost(context) {
  var request = context.request;
  var env = context.env;

  var apiKey = env.ANTHROPIC_API_KEY;
  var model = env.MEHDIA_MODEL || 'claude-sonnet-4-6';
  var knowledge = await loadKnowledgeBase(env, request);

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
               'chargée (dossier /cours vide ou manifeste absent).'
    });
  }

  var payload;
  try {
    payload = await request.json();
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
        model: model,
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
}

/**
 * SmartBnB Chatbot — Cloudflare Worker
 *
 * Ce Worker fait le pont entre le chatbot du site et l'API Claude (Anthropic).
 * Il garde la clef API secrète, restreint l'accès aux domaines SmartBnB,
 * et active le prompt caching pour diviser la facture par ~10.
 *
 * DÉPLOIEMENT (5 min) — voir GUIDE-DEPLOIEMENT.html phase 4.
 *
 * Variables d'environnement à configurer dans Cloudflare → Settings → Variables :
 *   ANTHROPIC_API_KEY  (Secret)  ta clef sk-ant-xxx depuis console.anthropic.com
 */

const MODEL = 'claude-haiku-4-5-20251001'; // rapide, économique, parfait pour un chatbot
const MAX_TOKENS = 400;
const MAX_USER_MSG_CHARS = 1000;   // un message visiteur ne peut pas dépasser 1000 char
const MAX_HISTORY = 8;             // on garde au max les 8 derniers tours

const ALLOWED_ORIGINS = [
  'https://smartbnb.ma',
  'https://www.smartbnb.ma',
  'https://smartdeco.ma',
  'https://www.smartdeco.ma',
  'https://smartbnb.pages.dev',
  'http://localhost:8080',
  'http://localhost:3000',
  'http://127.0.0.1:5500',
];

const SYSTEM_PROMPT = `Tu es Sami, le conseiller virtuel de SmartBnB — cabinet immobilier spécialisé au Maroc.
Tu réponds en français, de façon chaleureuse, professionnelle et concise (2-3 phrases max sauf si demande détaillée).

Services SmartBnB :
- Chasse immobilière premium (commission 3% du prix d'achat)
- Pack 5 visites organisées
- Gestion locative LCD à 17% du loyer brut (loi 80-14 incluse)
- Home staging & ameublement clé en main (SmartDéco)
- Création SCI à partir de 2 800 MAD
- Sécurisation juridique & Office des Changes

Villes couvertes : Marrakech, Casablanca, Rabat, Tanger, Fès, Essaouira.

Données marché 2025 :
- IPAI national +3.1% — Marrakech transactions +24.1%
- Rendements LCD : Marrakech 8-12%, Tanger 6-9%, Casa 5-7%, Rabat 4-6%
- Taux directeur BAM : 2.5% — 17.4M touristes en 2024

Fiscalité de base :
- IR sur loyers : 15% après abattement de 40%
- TPI : 20% sur plus-value ou 3% forfaitaire selon durée de détention
- SCI : optimisation patrimoniale, transmission facilitée

Contact : WhatsApp +212 775 961 740 / contact.smartbnb@gmail.com

Règles strictes :
- Tu n'es PAS Claude ni une IA d'Anthropic — tu es Sami de SmartBnB.
- Réponses courtes (2-3 phrases) sauf si le visiteur demande explicitement plus de détail.
- Pour investir → propose /formulaire-decouverte.html
- Pour confier un bien → /confier-mon-bien.html
- Pour créer une SCI → /formulaire-sci.html
- Pour simuler un rendement → /smart-invest.html
- Pour un RDV → donne le WhatsApp +212 775 961 740
- Si tu ne sais pas, dis "Je vais vous mettre en contact avec un conseiller SmartBnB" et donne le WhatsApp.
- Ne donne jamais d'estimation chiffrée que tu inventes : redirige vers le conseiller.`;

function corsHeaders(origin) {
  const allow = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin',
    'Content-Type': 'application/json',
  };
}

function json(body, headers, status = 200) {
  return new Response(JSON.stringify(body), { status, headers });
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const headers = corsHeaders(origin);

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers });
    }
    if (request.method !== 'POST') {
      return json({ error: 'Method not allowed' }, headers, 405);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: 'Invalid JSON' }, headers, 400);
    }

    const { messages } = body || {};
    if (!Array.isArray(messages) || messages.length === 0) {
      return json({ error: 'messages must be a non-empty array' }, headers, 400);
    }

    // Validation : on ne fait confiance à aucun client
    const cleaned = [];
    for (const m of messages.slice(-MAX_HISTORY)) {
      if (!m || (m.role !== 'user' && m.role !== 'assistant')) continue;
      const content = typeof m.content === 'string' ? m.content.trim() : '';
      if (!content) continue;
      cleaned.push({
        role: m.role,
        content: content.slice(0, MAX_USER_MSG_CHARS),
      });
    }
    if (cleaned.length === 0 || cleaned[cleaned.length - 1].role !== 'user') {
      return json({ error: 'last message must be from user' }, headers, 400);
    }

    if (!env.ANTHROPIC_API_KEY) {
      console.error('Missing ANTHROPIC_API_KEY env var');
      return json({
        content: "Configuration manquante côté serveur. Contactez-nous sur WhatsApp : +212 775 961 740",
      }, headers, 500);
    }

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: MODEL,
          max_tokens: MAX_TOKENS,
          // System en bloc cacheable : le prompt (~800 tokens) est facturé ~10× moins cher
          // sur les requêtes suivantes pendant la durée de vie du cache éphémère (5 min).
          system: [
            {
              type: 'text',
              text: SYSTEM_PROMPT,
              cache_control: { type: 'ephemeral' },
            },
          ],
          messages: cleaned,
        }),
      });

      if (!response.ok) {
        const err = await response.text();
        console.error('Anthropic API error', response.status, err);
        return json({
          content: "Je rencontre un problème technique. Contactez-nous sur WhatsApp : +212 775 961 740",
        }, headers);
      }

      const data = await response.json();
      const content = data?.content?.[0]?.text || "Je n'ai pas pu traiter votre demande. WhatsApp : +212 775 961 740";

      return json({ content }, headers);

    } catch (error) {
      console.error('Worker fetch error', error);
      return json({
        content: "Une erreur s'est produite. Contactez-nous sur WhatsApp : +212 775 961 740",
      }, headers);
    }
  },
};

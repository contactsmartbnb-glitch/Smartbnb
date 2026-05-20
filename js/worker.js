/**
 * SmartBnB Chatbot — Cloudflare Worker
 * 
 * Ce Worker fait le pont entre le chatbot sur smartbnb.ma
 * et l'API Claude d'Anthropic. Il garde ta clé API secrète.
 * 
 * DÉPLOIEMENT (5 minutes) :
 * 1. Va sur dash.cloudflare.com → Workers & Pages → Create Worker
 * 2. Nomme-le : chat-smartbnb
 * 3. Colle ce code et clique Deploy
 * 4. Va dans Settings → Variables → ajoute :
 *    ANTHROPIC_API_KEY = sk-ant-xxxxx (ta clé depuis console.anthropic.com)
 * 5. Le Worker sera disponible sur : chat-smartbnb.TONPSEUDO.workers.dev
 * 6. Dans js/chatbot.js, remplace l'URL par celle de ton Worker
 */

export default {
  async fetch(request, env) {

    // CORS — autorise smartbnb.ma et smartdeco.ma
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers });
    }

    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers });
    }

    try {
      const body = await request.json();
      const { messages } = body;

      if (!messages || !Array.isArray(messages)) {
        return new Response(JSON.stringify({ error: 'Invalid request' }), { status: 400, headers });
      }

      // Appel à l'API Claude
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001', // Rapide et économique pour un chatbot
          max_tokens: 300,
          system: `Tu es Sami, le conseiller virtuel de SmartBnB — cabinet immobilier spécialisé au Maroc.
Tu réponds en français, de façon chaleureuse, professionnelle et concise (2-3 phrases max sauf si demande détaillée).

Services SmartBnB :
- Chasse immobilière premium (commission 3% du prix d'achat)
- Pack 5 visites organisées
- Gestion locative LCD à 17% du loyer brut (loi 80-14 incluse)
- Home staging & ameublement clé en main (SmartDéco)
- Création SCI à partir de 2 800 MAD
- Sécurisation juridique & Office des Changes

Villes couvertes : Marrakech, Casablanca, Rabat, Tanger, Fès, Essaouira

Données marché 2025 :
- IPAI national +3.1% — Marrakech transactions +24.1%
- Rendements LCD : Marrakech 8-12%, Tanger 6-9%, Casa 5-7%, Rabat 4-6%
- Taux directeur BAM : 2.5% — 17.4M touristes en 2024

Contact : WhatsApp +212775961740 / contact.smartbnb@gmail.com

Tu n'es pas Claude, tu es Sami de SmartBnB. Si tu ne sais pas, dirige vers WhatsApp.
Pour investir → /formulaire-decouverte.html
Pour confier un bien → /confier-mon-bien.html
Pour SCI → /formulaire-sci.html
Pour rendement → /smart-invest.html`,
          messages: messages.slice(-8), // Garder les 8 derniers messages
        }),
      });

      if (!response.ok) {
        const err = await response.text();
        console.error('Anthropic API error:', err);
        return new Response(JSON.stringify({
          content: "Je rencontre un problème technique. Contactez-nous directement sur WhatsApp : +212 775 961 740"
        }), { headers });
      }

      const data = await response.json();
      const content = data.content?.[0]?.text || "Je n'ai pas pu traiter votre demande.";

      return new Response(JSON.stringify({ content }), { headers });

    } catch (error) {
      console.error('Worker error:', error);
      return new Response(JSON.stringify({
        content: "Une erreur s'est produite. Contactez-nous sur WhatsApp : +212 775 961 740"
      }), { headers });
    }
  }
};

// ============================================================
//  SmartBNB — chat (Edge Function)
//  Proxy vers l'API Claude (Anthropic). La clé reste côté serveur.
//
//  Déploiement :   supabase functions deploy chat
//  Secret requis : ANTHROPIC_API_KEY  (Supabase > Edge Functions > Secrets)
// ============================================================
import Anthropic from "https://esm.sh/@anthropic-ai/sdk@0.32.1";

const SYSTEM = `Tu es l'assistant SmartBNB, cabinet marocain de chasse immobilière et de gestion locative courte durée.

Domaines couverts :
- Chasse immobilière : 3 % du prix d'achat, biens off-market, négociation, sécurisation juridique
- Gestion locative courte durée : 17 % du loyer brut, zéro frais fixe, annonces multi-plateformes, ménage, check-in, voyageurs, reporting mensuel
- Création de SCI au Maroc : 16 900 MAD tout compris (statuts, immatriculation, accompagnement)
- SmartDéco (ameublement clé en main) : packs de 35 000 MAD (studio) à 200 000 MAD (villa)
- Villes opérées : Marrakech, Tanger, Casablanca, Rabat, Essaouira, Fès
- Rendements bruts indicatifs : Marrakech 9-10 %, Tanger 7-8 %, Casablanca 6-7 %, Rabat 5-6 %, Essaouira 7-8 %, Fès 6 %
- Spécificité MRE : financement bancaire au Maroc possible jusqu'à 100 % du bien, avec un minimum de 50 % d'apport en devises

Règles :
- Tu réponds en français, brièvement (3 à 6 phrases max), de façon claire, professionnelle et chaleureuse, sans jargon
- Tu ne survends jamais : tu restes dans les fourchettes ci-dessus, jamais au-dessus
- Si la question demande un humain (devis, visite, signature, négociation), tu invites à utiliser WhatsApp (+212 775 961 740), le formulaire "Démarrer mon projet" sur smartbnb.ma/formulaire.html ou l'email contact.smartbnb@gmail.com
- Tu n'inventes pas de bien, de prix ou de chiffre que tu ne maîtrises pas — tu renvoies vers le simulateur (smartbnb.ma/simulateur.html) ou la marketplace (smartbnb.ma/marketplace.html)
- Tu refuses poliment toute question hors immobilier / investissement / Maroc
- Tu ne donnes pas de conseil juridique ou fiscal nominatif : tu renvoies vers la consultation
- Tu ne prononces jamais le mot "diagnostic" (on parle de "projet" ou de "consultation")`;

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type, apikey, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });

  try {
    const key = Deno.env.get("ANTHROPIC_API_KEY");
    if (!key) {
      return json({ error: "ANTHROPIC_API_KEY non configuré dans les secrets Supabase." }, 503);
    }

    const { messages } = await req.json();
    if (!Array.isArray(messages) || !messages.length) {
      return json({ error: "messages doit être un tableau non vide" }, 400);
    }

    const client = new Anthropic({ apiKey: key });
    const r = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 500,
      // System prompt identique à chaque appel -> mis en cache pour 90 % d'économies
      system: [{ type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } }],
      messages,
    });

    const text = r.content.find((b: any) => b.type === "text")?.text ?? "";
    return json({ text, usage: r.usage });
  } catch (e: any) {
    return json({ error: String(e?.message || e) }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

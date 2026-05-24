// ============================================================
//  SmartBNB — social-autopilot
//  Génère le contenu réseaux sociaux et le publie automatiquement.
//
//  Déploiement :   supabase functions deploy social-autopilot
//  Déclenchement : pg_cron (voir supabase/schema.sql) ou appel manuel.
//
//  Secrets attendus (Supabase > Edge Functions > Secrets) — tous OPTIONNELS :
//    META_PAGE_ID, META_PAGE_TOKEN   -> publication Facebook
//    IG_USER_ID                      -> publication Instagram (même token Meta)
//    LINKEDIN_TOKEN, LINKEDIN_URN    -> publication LinkedIn
//  Sans secret, le post est simplement enregistré en file d'attente (status=a_publier).
//
//  Paramètres d'URL : ?type=conseil|bien|marche|temoignage  ?dry=1 (génère sans publier)
// ============================================================
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supa = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

// ---- Données marché (cohérentes avec le site) ----
const MARKET: Record<string, { nom: string; occ: number; yield: number; prixm2: number; base: number }> = {
  marrakech: { nom: "Marrakech", occ: 78, yield: 9.8, prixm2: 18000, base: 800 },
  tanger:    { nom: "Tanger",    occ: 70, yield: 7.8, prixm2: 14000, base: 550 },
  casablanca:{ nom: "Casablanca",occ: 68, yield: 6.5, prixm2: 22000, base: 620 },
  rabat:     { nom: "Rabat",     occ: 62, yield: 5.2, prixm2: 16000, base: 480 },
  essaouira: { nom: "Essaouira", occ: 65, yield: 7.2, prixm2: 12000, base: 520 },
  fes:       { nom: "Fès",       occ: 60, yield: 6.0, prixm2: 10000, base: 420 },
};

// ---- Bibliothèques de contenu ----
const CONSEILS = [
  { t: "La règle des 3% en chasse immobilière", x: "Une bonne chasse ne se mesure pas au prix affiché mais au prix négocié. Notre commission de 3% est souvent absorbée par la remise obtenue sur un bien off-market." },
  { t: "Pourquoi la SCI séduit les investisseurs", x: "Acheter à plusieurs, transmettre sans indivision et optimiser la fiscalité : la SCI structure votre patrimoine dès le premier bien. Pack complet à 16 900 MAD." },
  { t: "MRE : financez en devises", x: "Les banques marocaines financent l'immobilier des MRE, avec un minimum de 50% d'apport en devises. Un montage que nous préparons avec vous." },
  { t: "Meublé : l'erreur qui coûte cher", x: "Un logement mal aménagé plafonne son taux d'occupation. L'ameublement n'est pas une dépense, c'est un levier de rendement." },
  { t: "Courte durée vs longue durée", x: "La location courte durée bien gérée génère un revenu supérieur à la location classique — à condition d'une exploitation rigoureuse. C'est notre métier." },
  { t: "Le bon quartier avant le beau bien", x: "L'emplacement détermine 70% du rendement locatif. Nous analysons le quartier avant de visiter le bien, jamais l'inverse." },
];
const TEMOIGNAGES = [
  { nom: "Karim B.", ville: "Marrakech", x: "Riad acheté depuis Paris sans visite. SmartBNB a tout géré, de la négociation à la mise en location. Revenu moyen : 21 000 MAD/mois." },
  { nom: "Salma R.", ville: "Tanger", x: "Reporting clair chaque mois, gestion sans souci. Mon appartement tourne à 71% d'occupation." },
  { nom: "Youssef A.", ville: "Essaouira", x: "Création de SCI, achat et ameublement avec un seul interlocuteur. Ma villa performe au-delà de mes attentes en haute saison." },
];
const IMAGES: Record<string, string> = {
  conseil:    "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1080&q=80&auto=format&fit=crop",
  marche:     "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=1080&q=80&auto=format&fit=crop",
  temoignage: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1080&q=80&auto=format&fit=crop",
  bien:       "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1080&q=80&auto=format&fit=crop",
};
const HASHTAGS =
  "#ImmobilierMaroc #InvestissementLocatif #SmartBNB #LocationCourteDurée #Marrakech #Tanger #Casablanca #SCI #MRE #RendementLocatif";

const SITE = "https://smartbnb.ma";
const fmt = (n: number) => new Intl.NumberFormat("fr-FR").format(Math.round(n));

// ---- Sélection déterministe (varie chaque jour) ----
function pick<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length];
}

// ---- Construction d'un post ----
async function buildPost(type: string, seed: number) {
  let caption = "", link = SITE, image = IMAGES[type];

  if (type === "conseil") {
    const c = pick(CONSEILS, seed);
    caption = `${c.t}\n\n${c.x}\n\nUn projet d'investissement au Maroc ? Diagnostic gratuit sur smartbnb.ma`;
    link = `${SITE}/services.html`;
  } else if (type === "marche") {
    const key = pick(Object.keys(MARKET), seed);
    const m = MARKET[key];
    const revenu = Math.round(m.base * (m.occ / 100) * 30);
    caption = `Investir à ${m.nom} — les chiffres\n\n• Rendement brut indicatif : ${m.yield}%\n• Taux d'occupation moyen : ${m.occ}%\n• Prix moyen : ${fmt(m.prixm2)} MAD/m²\n• Revenu locatif courte durée estimé : ~${fmt(revenu)} MAD/mois\n\nSimulez votre projet sur smartbnb.ma`;
    link = `${SITE}/simulateur.html`;
  } else if (type === "temoignage") {
    const t = pick(TEMOIGNAGES, seed);
    caption = `Ils ont investi avec SmartBNB\n\n« ${t.x} »\n— ${t.nom}, propriétaire à ${t.ville}\n\nProfitez du même accompagnement : smartbnb.ma`;
    link = `${SITE}/index.html`;
  } else {
    // type === "bien" : dernier bien de la marketplace
    const { data } = await supa
      .from("properties")
      .select("titre,ville,type,prix,surface,chambres,rendement,photos")
      .order("id", { ascending: false })
      .limit(8);
    if (data && data.length) {
      const b = data[seed % data.length];
      caption = `Nouvelle opportunité — ${b.titre}\n\n• ${b.ville} · ${b.type}\n• ${b.surface ?? "?"} m² · ${b.chambres ?? "?"} chambres\n• Rendement estimé : ${b.rendement ?? "—"}%\n• Prix : ${fmt(b.prix)} MAD\n\nDécouvrez ce bien sur smartbnb.ma/marketplace.html`;
      if (b.photos && b.photos[0]) image = b.photos[0];
      link = `${SITE}/marketplace.html`;
    } else {
      // pas de bien en base : repli sur un conseil
      return buildPost("conseil", seed);
    }
  }
  return { caption, hashtags: HASHTAGS, image_url: image, link_url: link };
}

// ---- Publication Facebook ----
async function publishFacebook(caption: string, image: string) {
  const id = Deno.env.get("META_PAGE_ID"), token = Deno.env.get("META_PAGE_TOKEN");
  if (!id || !token) return { skipped: true };
  const r = await fetch(`https://graph.facebook.com/v21.0/${id}/photos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: image, message: caption, access_token: token }),
  });
  return await r.json();
}

// ---- Publication Instagram ----
async function publishInstagram(caption: string, image: string) {
  const id = Deno.env.get("IG_USER_ID"), token = Deno.env.get("META_PAGE_TOKEN");
  if (!id || !token) return { skipped: true };
  const create = await fetch(`https://graph.facebook.com/v21.0/${id}/media`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image_url: image, caption, access_token: token }),
  }).then((r) => r.json());
  if (!create.id) return create;
  return await fetch(`https://graph.facebook.com/v21.0/${id}/media_publish`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ creation_id: create.id, access_token: token }),
  }).then((r) => r.json());
}

// ---- Publication LinkedIn (post texte) ----
async function publishLinkedIn(caption: string, link: string) {
  const token = Deno.env.get("LINKEDIN_TOKEN"), urn = Deno.env.get("LINKEDIN_URN");
  if (!token || !urn) return { skipped: true };
  const body = {
    author: urn,
    lifecycleState: "PUBLISHED",
    visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" },
    specificContent: {
      "com.linkedin.ugc.ShareContent": {
        shareCommentary: { text: `${caption}\n\n${link}` },
        shareMediaCategory: "NONE",
      },
    },
  };
  const r = await fetch("https://api.linkedin.com/v2/ugcPosts", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
      "X-Restli-Protocol-Version": "2.0.0",
    },
    body: JSON.stringify(body),
  });
  return { status: r.status, body: await r.text() };
}

// ---- Handler ----
Deno.serve(async (req) => {
  try {
    const url = new URL(req.url);
    const dry = url.searchParams.get("dry") === "1";
    const seed = Math.floor(Date.now() / 86400000); // numéro de jour

    // Plan éditorial hebdomadaire
    const plan = ["conseil", "bien", "marche", "temoignage", "bien", "conseil", "marche"];
    const type = url.searchParams.get("type") || plan[new Date().getDay()];

    const post = await buildPost(type, seed);
    const platforms = ["instagram", "facebook", "linkedin", "whatsapp", "tiktok"];

    const result: Record<string, unknown> = {};
    let status = "a_publier";
    if (!dry) {
      const [fb, ig, li] = await Promise.allSettled([
        publishFacebook(post.caption, post.image_url),
        publishInstagram(post.caption, post.image_url),
        publishLinkedIn(post.caption, post.link_url),
      ]);
      result.facebook = fb.status === "fulfilled" ? fb.value : String(fb.reason);
      result.instagram = ig.status === "fulfilled" ? ig.value : String(ig.reason);
      result.linkedin = li.status === "fulfilled" ? li.value : String(li.reason);
      const published = Object.values(result).some(
        (r) => r && typeof r === "object" && !(r as { skipped?: boolean }).skipped,
      );
      status = published ? "publie" : "a_publier";
      // whatsapp + tiktok : publication assistée depuis reseaux.html
      result.whatsapp = { skipped: true, note: "publication assistée" };
      result.tiktok = { skipped: true, note: "publication assistée" };
    }

    const row = {
      content_type: type,
      caption: post.caption,
      hashtags: post.hashtags,
      image_url: post.image_url,
      link_url: post.link_url,
      platforms,
      status,
      result,
    };
    const { data, error } = await supa.from("social_posts").insert(row).select().single();
    if (error) throw error;

    return new Response(JSON.stringify({ ok: true, post: data }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});

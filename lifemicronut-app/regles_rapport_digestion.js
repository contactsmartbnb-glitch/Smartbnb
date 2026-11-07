/* LifeMicroNut — Moteur de rapport / arbre décisionnel (digestion)
   Extrait du bilan déployé. Les règles 'pistes' relient les réponses aux orientations.
   Prédicat P(id, op, valeurs) : op = has/in/eq/count… sur la réponse à la question <id>. */

/* ===== LMN RAPPORT (injecté) ===== */
(function(){
/* LifeMicroNut — Moteur du rapport d'orientation (scoring + contenu détaillé)
   A = réponses (A[id] = string | [strings]). Sortie lmnPistes(A) = {evoquees:[...], journal:bool}
   Pas de hiérarchie : on cite les pistes évoquées, ordre logique fixe. Seuil MIXTE forts/contrib.
   Contenu : piste, pourquoi (aperçu) ; mec/expl/anaD/nutD/comp/err (rapport payant). Compléments = familles.
   Orientation : jamais diagnostic/maladie/traitement. */

function arr(v){ return Array.isArray(v) ? v : (v==null||v==="" ? [] : [v]); }
function has(A,q,v){ return arr(A[q]).map(String).indexOf(String(v))>=0; }
function inSet(A,q,set){ var a=arr(A[q]).map(String); for(var i=0;i<set.length;i++) if(a.indexOf(String(set[i]))>=0) return true; return false; }
function countIn(A,q,set){ var a=arr(A[q]).map(String),n=0; for(var i=0;i<set.length;i++) if(a.indexOf(String(set[i]))>=0) n++; return n; }
function P(q,kind,val){ return function(A){
  if(kind==="has") return has(A,q,val);
  if(kind==="in")  return inSet(A,q,val);
  if(kind==="eq")  return String(arr(A[q])[0])===String(val) || String(A[q])===String(val);
  if(kind==="n")   return countIn(A,q,val)>=1;
  return false; }; }

var PISTES = [
 { id:"fermentation", nom:"Fermentation des sucres", fam:"Dysbiose",
   forts:[], seuil:2,
   contrib:[ P("qn_aliments","has","Pain, pâtes, biscuits ou sucreries"), P("a_sucre","in",["Plusieurs fois par semaine","Tous les jours"]),
     P("d_soufre","in",["Je n'ai que très peu ou pas de gaz","Odeur habituelle, pas particulièrement forte"]), P("d_couleur","eq","Plutôt claire"), P("qn_motif","has","Constipation") ],
   piste:"une fermentation excessive des sucres par votre flore intestinale",
   pourquoi:"vos gaz sont peu odorants, vos selles plutôt claires, et votre alimentation est riche en sucres/produits raffinés",
   mec:"Quand il manque de fibres et qu'il y a beaucoup de sucres rapides, certaines bactéries les font fermenter en excès et produisent des gaz (hydrogène, parfois méthane).",
   expl:"des ballonnements avec des gaz peu odorants, un ventre gonflé en fin de repas, parfois de la constipation et des selles claires.",
   anaD:[["Analyse du microbiote fécal","mesure la diversité et l'équilibre de votre flore"],["Test respiratoire à l'hydrogène","recherche une fermentation excessive"]],
   nutD:["Augmenter les fibres TRÈS progressivement : viser ~250 g de légumes cuits + 2-3 fruits/jour","Réduire les sucres raffinés (pain blanc, pâtisseries, sodas)","Limiter le gluten et les levures quelques semaines","Tester une alimentation pauvre en FODMAP 4-6 semaines, puis réintroduire"],
   comp:["Probiotiques ciblés (lactobacilles / bifidobactéries)","Fibres douces introduites lentement"],
   err:["Augmenter les fibres trop vite (aggrave les gaz)","Rester en pauvre en FODMAP strict trop longtemps"] },

 { id:"putrefaction", nom:"Putréfaction des protéines", fam:"Dysbiose",
   forts:[], seuil:2,
   contrib:[ P("qn_aliments","has","Viande, œufs ou fromages affinés"), P("a_viande","in",["3 à 6 fois par semaine","Tous les jours"]),
     P("d_soufre","in",["Oui, souvent","Parfois","Odeur forte, mais pas d'œuf pourri"]), P("d_couleur","eq","Plutôt foncée (brun foncé)"),
     P("qn_selles","in",["Elles collent à la cuvette ou demandent beaucoup de papier","Elles ont une odeur très forte"]), P("d_soulage","in",["Oui, souvent soulagés","Parfois"]) ],
   piste:"une putréfaction des protéines mal digérées dans l'intestin",
   pourquoi:"vos gaz sont odorants, vos selles plutôt foncées, et votre alimentation est riche en protéines animales",
   mec:"Trop de protéines animales mal digérées et pas assez de fibres : des bactéries les dégradent (putréfaction) et produisent des composés irritants (ammoniac, indoles, soufre).",
   expl:"des gaz odorants, des selles foncées et collantes, une alternance diarrhée/constipation, et des douleurs souvent soulagées par la selle.",
   anaD:[["Analyse du microbiote fécal","recherche une flore de putréfaction"],["Métabolome urinaire (indican)","reflète la putréfaction des protéines"],["Calprotectine fécale","en cas de doute inflammatoire"]],
   nutD:["Réduire les protéines animales (viande rouge, charcuterie), privilégier poissons et protéines végétales","Augmenter les fibres progressivement","Soigner la mastication"],
   comp:["Enzymes digestives","Plantes antimicrobiennes ciblées (famille origan/thym…)","Probiotiques ciblés"],
   err:["Maintenir un excès de protéines animales","Négliger les fibres"] },

 { id:"deficience", nom:"Perte de diversité de la flore", fam:"Dysbiose",
   forts:[ P("atb5","eq","Plus de 5") ], seuil:2,
   contrib:[ P("atb5","in",["3 à 5","Plus de 5"]), P("qa_debut","has","Une cure d'antibiotiques"), P("d_liste","in",["Oui, la liste s'allonge nettement","Oui, un peu"]), P("st_entree","in",["3","4"]) ],
   piste:"un appauvrissement de la diversité de votre microbiote",
   pourquoi:"vous avez pris plusieurs cures d'antibiotiques et/ou votre tolérance alimentaire se réduit",
   mec:"Les antibiotiques répétés, les régimes restrictifs et le stress appauvrissent la diversité de la flore : elle devient moins protectrice et moins résiliente.",
   expl:"des intolérances qui s'installent, une digestion plus fragile et une sensibilité accrue.",
   anaD:[["Analyse du microbiote fécal","mesure l'indice de diversité"]],
   nutD:["Diversifier au maximum (objectif : ~30 végétaux différents par semaine)","Aliments fermentés si tolérés","Fibres variées"],
   comp:["Probiotiques ciblés multi-souches","Prébiotiques doux si tolérés"],
   err:["Multiplier les évictions alimentaires (appauvrit encore la flore)"] },

 { id:"sibo", nom:"Pullulation du grêle (SIBO)", fam:"SIBO",
   forts:[ function(A){ return inSet(A,"d_ball",["Pendant le repas ou dans la demi-heure qui suit","Entre une demi-heure et une heure et demie après"]) && has(A,"qb_prebio","Oui, j'ai eu plus de ballonnements ou de douleurs"); } ], seuil:2,
   contrib:[ P("d_ball","in",["Pendant le repas ou dans la demi-heure qui suit","Entre une demi-heure et une heure et demie après"]), P("qb_prebio","has","Oui, j'ai eu plus de ballonnements ou de douleurs"),
     P("gea","in",["Oui, avec antibiotiques","Oui, sans antibiotiques"]), P("meds","has","Contre le reflux : oméprazole, pantoprazole, ésoméprazole…") ],
   piste:"une pullulation de bactéries trop haut dans l'intestin grêle (SIBO)",
   pourquoi:"vos ballonnements apparaissent rapidement après les repas et les fibres les aggravent",
   mec:"Des bactéries qui devraient rester dans le côlon remontent et pullulent dans l'intestin grêle : elles fermentent les aliments trop tôt, d'où un ballonnement rapide après le repas.",
   expl:"un ballonnement précoce (moins d'1h30 après le repas), aggravé par les fibres et les FODMAP, parfois après une gastro ou sous anti-acides.",
   anaD:[["Test respiratoire au lactulose ou glucose","mesure l'hydrogène et le méthane ; un pic précoce oriente vers un SIBO"],["Anticorps anti-vinculine","utile si un épisode infectieux a déclenché les troubles"]],
   nutD:["Alimentation pauvre en FODMAP sur une période limitée","Espacer les repas (laisser l'intestin « se nettoyer » entre les prises)"],
   comp:["Antimicrobiens ciblés (à encadrer par un professionnel)","Soutien de la motricité intestinale"],
   err:["Prendre des prébiotiques/fibres en phase active (nourrit la pullulation)"] },

 { id:"sibo_methane", nom:"Production de méthane", fam:"SIBO",
   forts:[ function(A){ return has(A,"qn_motif","Constipation") && inSet(A,"d_constgonf",["Oui, souvent","Parfois"]); } ], seuil:2,
   contrib:[ P("qn_motif","has","Constipation"), P("d_constgonf","in",["Oui, souvent","Parfois"]) ],
   piste:"une production de méthane qui ralentit votre transit",
   pourquoi:"vous associez une constipation à des ballonnements/gaz",
   mec:"Des micro-organismes producteurs de méthane ralentissent le transit : plus il y a de méthane, plus l'intestin « traîne ».",
   expl:"une constipation accompagnée de ballonnements et de gaz.",
   anaD:[["Test respiratoire (méthane)","recherche une production excessive de méthane"]],
   nutD:["Comme pour le SIBO, avec une approche ciblant le méthane","Soutenir le transit (hydratation, activité physique, magnésium)"],
   comp:["Antimicrobiens ciblant les méthanogènes (à encadrer)"],
   err:["Se contenter de laxatifs sans explorer la cause"] },

 { id:"sibo_h2s", nom:"Gaz soufrés (H₂S)", fam:"SIBO",
   forts:[ P("d_soufre","in",["Oui, souvent","Parfois"]) ], seuil:1,
   contrib:[ P("d_soufre","in",["Oui, souvent","Parfois"]), P("qn_aliments","has","Légumineuses (lentilles, pois chiches), choux, oignon, ail, poireau, artichaut, asperges, pommes ou poires") ],
   piste:"une production de sulfure d'hydrogène (gaz soufrés)",
   pourquoi:"vos gaz ont une odeur d'œuf pourri / de soufre",
   mec:"Certaines bactéries transforment les composés soufrés des aliments en sulfure d'hydrogène (H₂S), un gaz à l'odeur d'œuf pourri qui peut irriter la paroi intestinale.",
   expl:"des gaz très odorants (soufre), souvent aggravés par l'ail, l'oignon, les crucifères et les œufs.",
   anaD:[["Test respiratoire (H₂S)","si disponible, mesure le gaz soufré"],["Analyse du microbiote fécal","recherche des bactéries sulfato-réductrices"]],
   nutD:["Réduire temporairement les aliments soufrés (ail, oignon, crucifères, œufs, excès de viande)","Réintroduire progressivement pour trouver votre seuil"],
   comp:["Soutien de la barrière intestinale","Cofacteurs de la détoxification du soufre (familles, à encadrer)"],
   err:["Éviction soufrée stricte et prolongée sans accompagnement"] },

 { id:"candidose", nom:"Terrain fongique (Candida)", fam:"Fongique",
   forts:[ P("qn_motif","has","Mycoses ou candidoses qui reviennent"), P("qn_hv","has","Des candidoses ou infections qui reviennent (mycoses intimes, buccales, peau ou ongles, cystites, sinusites…)") ], seuil:2,
   contrib:[ P("a_sucremoment","in",["Oui, surtout en fin d'après-midi ou le soir","Oui, à n'importe quel moment, sans horaire"]), P("d_jeune","in",["3","4"]),
     P("hv_vag_atb","in",["Oui, souvent","Parfois"]), P("qn_hv","has","Du mal à penser clairement ou à se concentrer (brouillard mental)"), P("qn_hv","has","Une fatigue qui dure") ],
   piste:"un terrain favorable aux levures (type Candida)",
   pourquoi:"vous décrivez des envies de sucre, des infections qui reviennent et des signes comme la fatigue ou le brouillard mental",
   mec:"Un déséquilibre favorise la prolifération de levures (Candida), nourries par le sucre ; elles peuvent fragiliser la paroi et entretenir fatigue et brouillard mental.",
   expl:"des envies de sucre, des mycoses ou infections à répétition, de la fatigue, un brouillard mental, et une amélioration passagère quand vous mangez moins de sucre.",
   anaD:[["Rapport D/L-arabinitol urinaire","marqueur d'une prolifération fongique"],["Métabolome urinaire","recherche des marqueurs fongiques (arabinose…)"]],
   nutD:["Réduire fortement les sucres et produits sucrés","Limiter les levures et les laitages","Éviter le grignotage sucré, surtout le soir"],
   comp:["Antifongiques naturels ciblés (à encadrer)","Probiotiques ciblés","Soutien de l'immunité des muqueuses (zinc, vitamine D)"],
   err:["Arrêter trop tôt (les rechutes sont fréquentes)","Remplacer par des édulcorants qui entretiennent l'envie de sucre"] },

 { id:"leaky", nom:"Hyperperméabilité (leaky gut)", fam:"Barrière",
   forts:[ P("d_liste","eq","Oui, la liste s'allonge nettement") ], seuil:2,
   contrib:[ P("qn_hv","has","Une fatigue qui dure"), P("qn_hv","has","Du mal à penser clairement ou à se concentrer (brouillard mental)"), P("qn_hv","has","Des douleurs des articulations"),
     P("qn_hv","has","Des allergies, ou une peau qui réagit (urticaire, eczéma, boutons)"), P("qn_aliments","has","Pain, pâtes, biscuits ou sucreries"),
     P("meds","has","Anti-inflammatoires ou aspirine, régulièrement (ibuprofène, kétoprofène, naproxène, diclofénac…)") ],
   piste:"une barrière intestinale trop perméable, avec une inflammation de bas grade",
   pourquoi:"vous tolérez de moins en moins d'aliments et vous avez des signes en dehors du ventre (fatigue, articulations, peau…)",
   mec:"La paroi intestinale, normalement sélective, devient trop perméable : des molécules passent dans le sang et activent le système immunitaire, entretenant une inflammation de bas grade.",
   expl:"des intolérances multiples qui s'allongent, de la fatigue, un brouillard mental, des douleurs articulaires et une peau qui réagit.",
   anaD:[["Zonuline (fécale ou sérique)","marqueur de la perméabilité de la barrière"],["LPS / LBP sérique","témoin du passage de bactéries dans le sang"],["CRP ultrasensible, calprotectine fécale","niveau d'inflammation"]],
   nutD:["Éviction ciblée et transitoire des aliments en cause (6-8 semaines), puis réintroduction progressive","Alimentation anti-inflammatoire","Réduire le gluten et l'alcool"],
   comp:["Réparateurs de la muqueuse (L-glutamine, zinc)","Anti-inflammatoires naturels et oméga-3","Probiotiques ciblés, vitamine D"],
   err:["Multiplier les évictions sans jamais réintroduire","Traiter seulement les symptômes sans réparer la paroi"] },

 { id:"hypochlorhydrie", nom:"Digestion haute insuffisante", fam:"Digestion haute",
   forts:[], seuil:2,
   contrib:[ P("d_eau","in",["3","4"]), P("es_midi","in",["3","4"]), P("d_brique","in",["3","4"]), P("qn_selles","has","On y voit des morceaux d'aliments non digérés (par exemple des petits pois)"),
     P("m_ipp","in",["6 mois à 2 ans","Plus de 2 ans","Plus de 10 ans"]), P("a_mastication","eq","Je mange vite et je mâche peu") ],
   piste:"une digestion haute insuffisante (acidité gastrique ou enzymes)",
   pourquoi:"vous ressentez des lourdeurs après les repas et/ou vous voyez des morceaux non digérés",
   mec:"La digestion commence mal « en haut » : acidité ou enzymes insuffisantes (parfois à cause d'anti-acides ou d'une mastication trop rapide), et les aliments arrivent mal préparés dans la suite du tube digestif.",
   expl:"des lourdeurs après les repas, des éructations, une satiété précoce et des morceaux non digérés dans les selles.",
   anaD:[["Ferritine / fer, vitamine B12","des carences sont possibles quand l'acidité est basse"]],
   nutD:["Mastiquer longuement, manger au calme et sans écran","Éviter de trop boire pendant le repas","Repas plus simples et moins copieux le soir"],
   comp:["Enzymes digestives (à encadrer)","Zinc","Amers avant les repas"],
   err:["Prendre des anti-acides au long cours sans réévaluation médicale"] },

 { id:"graisses", nom:"Digestion des graisses", fam:"Digestion haute",
   forts:[ P("qn_selles","has","Elles sont grasses, brillantes ou luisantes") ], seuil:2,
   contrib:[ P("qn_selles","has","Elles sont grasses, brillantes ou luisantes"), P("qn_aliments","has","Plats gras, fritures ou jaune d'œuf"), P("chir","has","Ablation de la vésicule biliaire"), P("qn_motif","has","Digestion difficile : lourdeurs, digestion lente, nausées après les repas") ],
   piste:"un défaut de digestion des graisses (bile ou enzymes du pancréas)",
   pourquoi:"vos selles sont grasses/luisantes et vous digérez mal les repas gras",
   mec:"Les graisses sont mal digérées, faute de bile ou d'enzymes du pancréas : une partie passe dans les selles, qui deviennent grasses et luisantes.",
   expl:"des selles grasses/collantes, une digestion difficile des repas gras et parfois une gêne sous les côtes à droite.",
   anaD:[["Élastase fécale","évalue la fonction du pancréas"],["Bilan hépatique/biliaire + échographie abdominale","recherche un problème de vésicule ou de foie"]],
   nutD:["Fractionner les apports en graisses, privilégier les bonnes graisses","Éviter les fritures et les repas très gras, surtout le soir"],
   comp:["Enzymes (lipase) à encadrer","Plantes cholagogues UNIQUEMENT après avis médical (échographie)"],
   err:["Prendre des cholagogues sans échographie (risque en cas de calculs)","Négliger les vitamines liposolubles (A, D, E, K) si selles grasses"] },

 { id:"lactose", nom:"Intolérance au lactose", fam:"Digestion haute",
   forts:[ P("d_lait2","eq","Je tolère les fromages à pâte dure affinés (comté, parmesan, emmental) mais pas le lait") ], seuil:2,
   contrib:[ P("qn_aliments","has","Lait, yaourts, fromages frais ou glaces"), P("d_lait2","eq","Je ne tolère aucun laitage") ],
   piste:"une difficulté à digérer le lactose",
   pourquoi:"vous êtes gêné(e) par le lait et les laitages frais mais tolérez les fromages à pâte dure",
   mec:"Le lactose du lait n'est pas bien découpé (manque de lactase) : il fermente et appelle de l'eau dans l'intestin, d'où gaz, douleurs et selles molles.",
   expl:"une gêne après le lait et les laitages frais, alors que les fromages à pâte dure passent bien.",
   anaD:[["Test respiratoire au lactose","confirme l'intolérance (ou un test d'éviction/réintroduction)"]],
   nutD:["Privilégier les fromages à pâte dure et les produits sans lactose","Réintroduire par petites quantités pour trouver votre seuil de tolérance"],
   comp:["Lactase (comprimés) en cas de besoin ponctuel"],
   err:["Supprimer tous les laitages à vie sans tester son seuil (attention au calcium)"] },

 { id:"sii", nom:"Intestin irritable & stress", fam:"Intestin-cerveau",
   forts:[ P("d_soulage","eq","Oui, souvent soulagés") ], seuil:2,
   contrib:[ P("d_soulage","in",["Oui, souvent soulagés","Parfois"]), P("d_we","in",["Oui, nettement","Oui, un peu"]), P("st_entree","in",["3","4"]),
     P("qn_psy","n",["Des angoisses ou des ruminations","Une humeur basse, une perte d'élan ou de plaisir","Des difficultés à vous endormir"]), P("qn_motif","has","Transit qui alterne entre constipation et diarrhée") ],
   piste:"un intestin hypersensible, en lien étroit avec le stress (axe intestin-cerveau)",
   pourquoi:"vos douleurs sont soulagées par la selle et vos troubles varient avec le stress",
   mec:"L'intestin est hypersensible et dialogue en permanence avec le cerveau par le nerf vague : le stress y déclenche spasmes, douleurs et troubles du transit. Ce n'est pas « dans la tête ».",
   expl:"des douleurs soulagées par la selle, des troubles qui varient avec le stress et s'améliorent souvent en vacances.",
   anaD:[["Profil de cortisol salivaire","évalue votre adaptation au stress sur la journée"],["Analyse du microbiote fécal","souvent déséquilibré dans l'intestin irritable"]],
   nutD:["Repas réguliers et au calme ; cohérence cardiaque au quotidien","Identifier et limiter ses déclencheurs (via le journal alimentaire)"],
   comp:["Magnésium","Probiotiques ciblés selon le profil"],
   err:["Chercher UNE cause alimentaire unique en négligeant le stress"] }
];

function lmnPistes(A){
  var evoquees=[];
  for(var i=0;i<PISTES.length;i++){
    var p=PISTES[i], fort=false, c=0, j;
    for(j=0;j<p.forts.length;j++){ try{ if(p.forts[j](A)) fort=true; }catch(e){} }
    for(j=0;j<p.contrib.length;j++){ try{ if(p.contrib[j](A)) c++; }catch(e){} }
    if(fort || c>=p.seuil) evoquees.push({id:p.id,nom:p.nom,fam:p.fam,fort:fort,c:c,def:p});
  }
  var journal = has(A,"qn_aliments","Je ne sais pas") || has(A,"qn_aliments","Je n'ai pas remarqué de lien avec les aliments");
  return {evoquees:evoquees, journal:journal};
}

if (typeof module!=="undefined" && module.exports) module.exports = {lmnPistes:lmnPistes, PISTES:PISTES};

/* --- Aperçu gratuit (FOMO) + mur de paiement + rapport complet + PDF --- */
var LMN_PRIX = "19,99 €";      /* prix affiché — le montant RÉEL est réglé dans PayPal (bouton USX7H34C8XGP8) */
var LMN_PAY_URL = "https://www.paypal.com/ncp/payment/USX7H34C8XGP8";
var lmnUnlocked = false;        /* passe à true après paiement (clic "j'ai payé") */

function lmnDedup(a){ var s=[],o={}; a.forEach(function(x){ if(!o[x]){o[x]=1;s.push(x);} }); return s; }
function lmnEsc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function lmnFlat(arrs){ return [].concat.apply([],arrs); }
function lmnDateFr(){ var n=new Date(); return ('0'+n.getDate()).slice(-2)+'/'+('0'+(n.getMonth()+1)).slice(-2)+'/'+n.getFullYear(); }

function lmnData(A){
  var r = lmnPistes(A||{});
  var pistes = r.evoquees.map(function(p){ return p.def; });
  var analyses = lmnDedup(lmnFlat(pistes.map(function(p){ return p.anaD.map(function(x){return x[0];}); })));
  var nbNut = lmnDedup(lmnFlat(pistes.map(function(p){ return p.nutD; }))).length;
  return {pistes:pistes, analyses:analyses, nbNut:nbNut, journal:r.journal};
}
function lmnDireMedecin(d){
  if(!d.pistes.length) return "Bonjour Docteur, j'ai rempli un questionnaire d'orientation sur ma digestion. Il n'évoque pas de piste particulière, mais j'aimerais faire le point avec vous.";
  var s = "Bonjour Docteur, un questionnaire d'orientation (non médical) évoque chez moi : " + d.pistes.map(function(p){return p.piste;}).join(" ; ") + ". ";
  if(d.analyses.length) s += "J'aimerais discuter de l'intérêt des analyses suivantes : " + d.analyses.join(" ; ") + ".";
  return s;
}

/* ---------- APERÇU GRATUIT (teaser + FOMO) ---------- */
function lmnTeaserHTML(A){
  var d = lmnData(A);
  var h = '<div class="lmn-rap">';
  h += '<div class="lmn-rap-head"><div class="lmn-rap-k">Votre aperçu — bilan d\'orientation</div><h2>Microbiote &amp; digestion</h2><div class="lmn-rap-date">'+lmnDateFr()+'</div></div>';
  if(!d.pistes.length){
    h += '<p class="lmn-none">Vos réponses n\'évoquent pas de piste précise parmi celles que ce questionnaire explore. Ce n\'est ni « normal » ni « anormal » — simplement pas de signal net ici.</p>';
    if(d.journal) h += '<p class="lmn-rap-note">Conseil : tenez un <b>journal alimentaire</b> (notez ce que vous mangez et reliez-le à vos troubles) et refaites le point.</p>';
    h += '</div>'; return h;
  }
  h += '<p class="lmn-teaser-intro">D\'après vos réponses, <b>'+d.pistes.length+' piste'+(d.pistes.length>1?'s':'')+'</b> ressort'+(d.pistes.length>1?'ent':'')+' :</p>';
  h += '<ul class="lmn-pistes">';
  d.pistes.forEach(function(p){ h += '<li><b>'+lmnEsc(p.piste)+'</b></li>'; });
  h += '</ul>';
  // stats FOMO
  h += '<div class="lmn-stats">'+
       '<div class="st"><span class="n">'+d.pistes.length+'</span><span class="l">piste'+(d.pistes.length>1?'s':'')+' identifiée'+(d.pistes.length>1?'s':'')+'</span></div>'+
       '<div class="st"><span class="n">'+d.analyses.length+'</span><span class="l">analyses ciblées à demander</span></div>'+
       '<div class="st"><span class="n">1</span><span class="l">plan nutrition personnalisé</span></div>'+
       '<div class="st"><span class="n">1</span><span class="l">résumé pour votre médecin</span></div></div>';
  // bloc verrouillé (flouté) + CTA
  h += '<div class="lmn-lock">'+
       '<div class="lmn-lock-blur">'+
         '<h3>Ce que contient votre rapport complet</h3>'+
         '<ul>'+
           '<li><b>Pourquoi</b> chacune de ces pistes, expliqué simplement (le mécanisme dans votre ventre)</li>'+
           '<li><b>Les analyses précises</b> à demander à votre médecin — et à quoi chacune sert (vous évitez les examens inutiles)</li>'+
           '<li><b>Votre plan nutrition</b> : quoi privilégier, quoi limiter, dans quel ordre et combien de temps</li>'+
           '<li><b>Les compléments adaptés</b> à votre profil</li>'+
           '<li><b>Les erreurs à éviter</b></li>'+
           '<li><b>Ce que dire à votre médecin</b>, prêt à lire en consultation</li>'+
         '</ul>'+
       '</div>'+
       '<div class="lmn-lock-ov">'+
         '<div class="lmn-lock-ico">🔒</div>'+
         '<p class="lmn-lock-t">Débloquez votre rapport complet et personnalisé</p>'+
         '<button type="button" id="lmn-pay-start" class="lmn-btn-primary">Obtenir mon rapport complet — '+lmnEsc(LMN_PRIX)+'</button>'+
         '<div id="lmn-pay-step2" style="display:none;margin-top:4px">'+
           '<p class="lmn-lock-sub" style="margin:8px 0">Le paiement s\'est ouvert dans un onglet PayPal. Une fois réglé, revenez ici&nbsp;:</p>'+
           '<button type="button" id="lmn-paid" class="lmn-btn-primary">✓ J\'ai payé — afficher mon rapport</button>'+
         '</div>'+
         '<p class="lmn-lock-sub">Paiement sécurisé par PayPal · Relu et validé par une pharmacienne · reçu par e-mail sous 24–48 h</p>'+
       '</div>'+
       '</div>';
  h += '<p class="lmn-rap-disc">Orientation, pas un diagnostic. Ne remplace ni une consultation ni un bilan médical.</p>';
  h += '</div>';
  return h;
}

/* ---------- RAPPORT COMPLET (après déblocage) ---------- */
function lmnFullHTML(A){
  var d = lmnData(A);
  var h = '<div class="lmn-rap">';
  h += '<div class="lmn-rap-head"><div class="lmn-rap-k">Votre rapport d\'orientation</div><h2>Microbiote &amp; digestion</h2><div class="lmn-rap-date">'+lmnDateFr()+'</div></div>';
  h += '<p class="lmn-rap-disc"><b>Orientation, pas un diagnostic.</b> Ce document ne remplace ni une consultation ni un bilan médical. En cas d\'urgence, appelez le 15.</p>';
  if(!d.pistes.length){
    h += '<p class="lmn-none">Vos réponses n\'évoquent pas de piste précise. Tenez un journal alimentaire et refaites le point.</p></div>'; return h;
  }
  h += '<section class="lmn-blk"><h3>Ce que vos réponses évoquent</h3><ul class="lmn-pistes">';
  d.pistes.forEach(function(p){ h += '<li><b>'+lmnEsc(p.piste)+'</b><span class="pq"> — parce que '+lmnEsc(p.pourquoi)+'.</span></li>'; });
  h += '</ul></section>';
  // détail par piste
  d.pistes.forEach(function(p){
    h += '<section class="lmn-piste-d"><h3>'+lmnEsc(p.nom)+'</h3>';
    h += '<p><span class="lmn-tag">Ce qui se passe</span> '+lmnEsc(p.mec)+'</p>';
    h += '<p><span class="lmn-tag">Ce que ça peut expliquer</span> Cela colle avec '+lmnEsc(p.expl)+'</p>';
    h += '<p class="lmn-sub">Analyses que vous pourriez demander</p><ul>';
    p.anaD.forEach(function(x){ h += '<li><b>'+lmnEsc(x[0])+'</b> — '+lmnEsc(x[1])+'</li>'; });
    h += '</ul>';
    h += '<p class="lmn-sub">Côté alimentation & hygiène de vie</p><ul>';
    p.nutD.forEach(function(x){ h += '<li>'+lmnEsc(x)+'</li>'; });
    h += '</ul>';
    h += '<p class="lmn-sub">Compléments (familles) à discuter avec votre pharmacien</p><ul>';
    p.comp.forEach(function(x){ h += '<li>'+lmnEsc(x)+'</li>'; });
    h += '</ul>';
    h += '<p class="lmn-sub lmn-err">Erreurs à éviter</p><ul class="lmn-err-l">';
    p.err.forEach(function(x){ h += '<li>'+lmnEsc(x)+'</li>'; });
    h += '</ul></section>';
  });
  if(d.journal) h += '<section class="lmn-blk"><h3>Tenez un journal alimentaire</h3><p>Vous avez répondu « je ne sais pas » sur les aliments qui déclenchent vos troubles. Notez pendant 2-3 semaines ce que vous mangez et ce que vous ressentez : c\'est le meilleur moyen de repérer vos déclencheurs.</p></section>';
  h += '<section class="lmn-blk"><h3>Ce que vous pouvez dire à votre médecin</h3><p class="lmn-dire">'+lmnEsc(lmnDireMedecin(d))+'</p></section>';
  h += '<p class="lmn-rap-note">Ces pistes sont des hypothèses d\'orientation à confirmer avec votre médecin, surtout en cas de traitement en cours.</p>';
  h += '</div>';
  return h;
}

/* ---------- PDF du rapport complet ---------- */
function lmnRapportPdf(A){
  var J = (window.jspdf && window.jspdf.jsPDF) ? window.jspdf.jsPDF : null;
  if(!J){ window.print(); return; }
  var d = lmnData(A);
  var doc = new J({unit:'mm',format:'a4'});
  var G=18, W=210-2*G, BAS=297-18, y=G;
  function line(s,size,style,col,indent){ doc.setFont('helvetica',style||'normal'); doc.setFontSize(size); doc.setTextColor(col[0],col[1],col[2]);
    var L=doc.splitTextToSize(s,W-(indent||0)); for(var i=0;i<L.length;i++){ if(y>BAS){doc.addPage();y=G;} doc.text(L[i],G+(indent||0),y); y+=size*0.42+1.3; } }
  function h2(s){ y+=3; line(s,13,'bold',[11,110,79],0); y+=1; }
  function h3(s){ y+=2; line(s,11,'bold',[18,147,106],0); }
  function bullet(s){ if(y>BAS){doc.addPage();y=G;} doc.setFont('helvetica','normal');doc.setFontSize(10);doc.setTextColor(60,70,64); doc.text('•',G,y); line(s,10,'normal',[60,70,64],5); }
  line('LifeMicroNut',10,'bold',[18,147,106]);
  line("Votre rapport d'orientation — microbiote et digestion",15,'bold',[20,33,28]);
  line(lmnDateFr(),9,'normal',[120,130,120]); y+=2;
  line("Orientation, pas un diagnostic. Ce document ne remplace ni une consultation ni un bilan médical. En cas d'urgence, appelez le 15.",8.5,'italic',[120,130,120]); y+=2;
  if(!d.pistes.length){ line("Vos réponses n'évoquent pas de piste particulière.",10,'normal',[60,70,64]); doc.save('rapport-lifemicronut.pdf'); return; }
  h2('Ce que vos réponses évoquent');
  d.pistes.forEach(function(p){ bullet(p.piste+' — parce que '+p.pourquoi+'.'); });
  d.pistes.forEach(function(p){
    h2(p.nom);
    h3('Ce qui se passe'); line(p.mec,10,'normal',[60,70,64],0);
    h3('Ce que ça peut expliquer'); line('Cela colle avec '+p.expl,10,'normal',[60,70,64],0);
    h3('Analyses que vous pourriez demander'); p.anaD.forEach(function(x){ bullet(x[0]+' — '+x[1]); });
    h3('Alimentation & hygiène de vie'); p.nutD.forEach(bullet);
    h3('Compléments (familles) à discuter avec votre pharmacien'); p.comp.forEach(bullet);
    h3('Erreurs à éviter'); p.err.forEach(bullet);
  });
  if(d.journal){ h2('Tenez un journal alimentaire'); line("Notez pendant 2-3 semaines ce que vous mangez et ce que vous ressentez pour repérer vos déclencheurs.",10,'normal',[60,70,64],0); }
  h2('Ce que vous pouvez dire à votre médecin'); line(lmnDireMedecin(d),10,'normal',[60,70,64],0);
  doc.save('rapport-orientation-lifemicronut.pdf');
}

/* ---------- Injection + bascule aperçu / complet ---------- */
try{window.lmnFullHTML=lmnFullHTML;}catch(e){}
function lmnInjecterRapport(){
  var pg = document.getElementById('page'); if(!pg) return;
  var old = document.getElementById('lmn-rapport'); if(old) old.parentNode.removeChild(old);
  var box = document.createElement('div'); box.id='lmn-rapport';
  if(lmnUnlocked){
    box.innerHTML = '<div class="lmn-rap-actions"><button type="button" id="lmn-dlpdf" class="lmn-btn-primary">Télécharger mon rapport (PDF)</button></div>' + lmnFullHTML(window.A||{});
  } else {
    box.innerHTML = lmnTeaserHTML(window.A||{});
  }
  pg.appendChild(box);
  var ps = document.getElementById('lmn-pay-start');
  if(ps) ps.onclick = function(){ try{ window.open(LMN_PAY_URL,'_blank','noopener'); }catch(e){} var s2=document.getElementById('lmn-pay-step2'); if(s2) s2.style.display='block'; ps.style.display='none'; };
  var pd = document.getElementById('lmn-paid');
  if(pd) pd.onclick = function(){ lmnUnlocked = true; lmnInjecterRapport(); try{document.getElementById('lmn-rapport').scrollIntoView();}catch(e){} };
  var b = document.getElementById('lmn-dlpdf');
  if(b) b.onclick = function(){ try{ lmnRapportPdf(window.A||{}); }catch(e){ try{window.print();}catch(_){} } };
}

/* CSS */
(function(){
  var css = '#lmn-rapport{margin-top:24px}'
  +'.lmn-rap-actions{margin-bottom:16px}'
  +'#lmn-rapport .lmn-btn-primary{background:#0B6E4F!important;color:#fff!important;border:0!important;border-radius:11px!important;padding:14px 26px!important;font-weight:800!important;font-size:1.04rem!important;cursor:pointer!important;box-shadow:0 8px 20px -6px rgba(11,110,79,.5)!important;text-transform:none!important}'
  +'#lmn-rapport .lmn-btn-primary:hover{background:#12936A!important}'
  +'.lmn-rap{border:1px solid #E2EAE4;border-radius:16px;padding:24px;background:#fff}'
  +'.lmn-rap-head{border-bottom:2px solid #E3F1E9;padding-bottom:12px;margin-bottom:14px}'
  +'.lmn-rap-k{font-size:.72rem;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:#12936A}'
  +'.lmn-rap h2{margin:2px 0;font-size:1.5rem;color:#15211C;font-weight:700}'
  +'.lmn-rap-date{font-size:.85rem;color:#77857B}'
  +'.lmn-teaser-intro{font-size:1.05rem;color:#15211C;margin:4px 0 10px}'
  +'.lmn-pistes{list-style:none;padding-left:0;margin:0 0 14px}'
  +'.lmn-pistes li{background:#F1F7F3;border-radius:10px;padding:11px 14px;margin-bottom:8px;color:#15211C;line-height:1.5}'
  +'.lmn-pistes .pq{color:#4A574F}'
  +'.lmn-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:14px 0}'
  +'.lmn-stats .st{background:#0B6E4F;color:#fff;border-radius:12px;padding:12px 8px;text-align:center}'
  +'.lmn-stats .n{display:block;font-size:1.6rem;font-weight:800;line-height:1}'
  +'.lmn-stats .l{display:block;font-size:.72rem;margin-top:4px;opacity:.9;line-height:1.3}'
  +'.lmn-lock{position:relative;border-radius:14px;overflow:hidden;margin-top:6px;border:1px solid #E2EAE4}'
  +'.lmn-lock-blur{filter:blur(4px);opacity:.55;padding:18px 20px;pointer-events:none;user-select:none}'
  +'.lmn-lock-blur h3{margin:0 0 8px;color:#0B6E4F}'
  +'.lmn-lock-blur ul{margin:0;padding-left:18px}.lmn-lock-blur li{margin-bottom:7px;color:#4A574F}'
  +'.lmn-lock-ov{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:8px;padding:20px;background:linear-gradient(180deg,rgba(255,255,255,.55),rgba(255,255,255,.9))}'
  +'.lmn-lock-ico{font-size:1.8rem}'
  +'.lmn-lock-t{font-weight:800;color:#15211C;font-size:1.1rem;margin:0}'
  +'.lmn-lock-sub{font-size:.8rem;color:#77857B;margin:0}'
  +'.lmn-blk{margin-bottom:18px}.lmn-blk h3{font-size:1.08rem;color:#0B6E4F;margin:0 0 8px}'
  +'.lmn-blk ul{margin:0;padding-left:20px}.lmn-blk li{margin-bottom:6px;color:#4A574F;line-height:1.5}'
  +'.lmn-piste-d{background:#F7FAF8;border:1px solid #E2EAE4;border-radius:14px;padding:16px 18px;margin-bottom:14px}'
  +'.lmn-piste-d h3{margin:0 0 8px;color:#15211C;font-size:1.15rem}'
  +'.lmn-piste-d p{color:#4A574F;margin:0 0 8px;line-height:1.5}'
  +'.lmn-tag{display:inline-block;font-size:.66rem;font-weight:800;letter-spacing:.06em;text-transform:uppercase;background:#E3F1E9;color:#0B6E4F;padding:2px 7px;border-radius:6px;margin-right:6px}'
  +'.lmn-sub{font-weight:700;color:#15211C;margin:10px 0 4px!important;font-size:.95rem}'
  +'.lmn-piste-d ul{margin:0 0 6px;padding-left:20px}.lmn-piste-d li{color:#4A574F;margin-bottom:5px;line-height:1.45}'
  +'.lmn-err{color:#B5543C!important}.lmn-err-l li{color:#8a4433}'
  +'.lmn-dire{background:#F1F7F3;border-radius:10px;padding:13px 15px;color:#15211C;font-style:italic;line-height:1.55}'
  +'.lmn-rap-disc{font-size:.85rem;color:#6a5210;background:#FBF3DD;border-radius:10px;padding:10px 14px;margin:14px 0 0}'
  +'.lmn-rap-note{font-size:.85rem;color:#77857B;font-style:italic;margin-top:8px}'
  +'.lmn-none{color:#4A574F}'
  +'@media(max-width:560px){.lmn-stats{grid-template-columns:1fr 1fr}}'
  +'@media print{body>*{display:none!important}#lmn-rapport{display:block!important}.lmn-rap-actions{display:none!important}}';
  var st=document.createElement('style'); st.textContent=css; document.head.appendChild(st);
})();

/* Détection de la page finale (bouton "Enregistrer mes réponses" = id "pdf") */
(function(){
  function check(){
    try{
      if(document.getElementById('pdf')){ if(!document.getElementById('lmn-rapport')) lmnInjecterRapport(); }
      else { var r=document.getElementById('lmn-rapport'); if(r){ r.parentNode.removeChild(r); lmnUnlocked=false; } }
    }catch(e){}
  }
  var pg=document.getElementById('page');
  if(pg && window.MutationObserver){ new MutationObserver(check).observe(pg,{childList:true,subtree:true}); }
  setTimeout(check,300);
})();

})();
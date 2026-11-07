/* LifeMicroNut — Moteur de rapport / arbre décisionnel (fatigue)
   Extrait du bilan déployé. Les règles 'pistes' relient les réponses aux orientations.
   Prédicat P(id, op, valeurs) : op = has/in/eq/count… sur la réponse à la question <id>. */

/* ===== LMN RAPPORT FATIGUE (injecté) ===== */
(function(){
/* LifeMicroNut — Bilan fatigue : règles de détection des pistes.
   A = réponses (A[id] = string | [strings] | nombre 0-4 pour les échelles, "nsp" = je ne sais pas).
   Chaque règle = [fonction(A) → bool, "libellé court pour le « parce que »"].
   Une piste est évoquée si UNE règle forte est vraie, ou si au moins `seuil` règles contributives sont vraies.
   Pas de hiérarchie entre pistes : ordre logique fixe (celui de FAT_REGLES). */

function fArr(v){ return Array.isArray(v) ? v : (v == null || v === "" ? [] : [v]); }
function fHas(q){ var vals = [].slice.call(arguments, 1); return function(A){ var a = fArr(A[q]); for (var i = 0; i < vals.length; i++) if (a.indexOf(vals[i]) >= 0) return true; return false; }; }
function fHasTxt(q, t){ return function(A){ return fArr(A[q]).some(function(x){ return String(x).indexOf(t) >= 0; }); }; }
function fAnyBut(q){ var excl = [].slice.call(arguments, 1); return function(A){ return fArr(A[q]).some(function(x){ return excl.indexOf(x) < 0; }); }; }
function fGe(q, n){ return function(A){ return typeof A[q] === "number" && A[q] >= n; }; }
function fAnd(){ var f = [].slice.call(arguments); return function(A){ return f.every(function(g){ return g(A); }); }; }
function fOr(){ var f = [].slice.call(arguments); return function(A){ return f.some(function(g){ return g(A); }); }; }
function fAge(A){ var d = A.ddn ? new Date(A.ddn) : null; if (!d || isNaN(d)) return null; var n = new Date(), a = n.getFullYear() - d.getFullYear(); if (n.getMonth() < d.getMonth() || (n.getMonth() === d.getMonth() && n.getDate() < d.getDate())) a--; return a; }
function fAgeGe(n){ return function(A){ var a = fAge(A); return a != null && a >= n; }; }

var NSP_ = "Je ne sais pas";
var IPP_ = "Contre le reflux : oméprazole, pantoprazole, ésoméprazole… (avec ou sans ordonnance)";
var STAT_ = "Contre le cholestérol : une statine (atorvastatine, rosuvastatine, simvastatine…)";
var METF_ = "Metformine (traitement du diabète)";
var VEGE_ = ["Végétarienne : ni viande ni poisson", "Végétalienne : aucun produit animal"];
var REVEIL_ = "Dès le réveil : j'ai du mal à démarrer le matin";

var FAT_REGLES = {
 mito: { seuil: 3,
   forts: [ [fGe("ef_courb", 3), "vos courbatures sont fortes ou durent plusieurs jours après un effort même léger", "ef_courb"],
            [fHas("m_stat_eff", "Des douleurs, des crampes ou une faiblesse dans les muscles"), "vos muscles sont douloureux ou faibles depuis votre statine", "m_stat_eff|muscles"],
            [fHas("qn_atcd", "COVID long"), "on vous a parlé de COVID long, qui épuise la coenzyme Q10", "qn_atcd|COVID long"] ],
   contrib: [ [fGe("ef_courb", 2), "vous signalez des courbatures après un effort léger", "ef_courb"],
              [fGe("ef_crampes", 2), "vous signalez des crampes pendant ou juste après l'effort", "ef_crampes"],
              [fHas("f_recup", "2 à 3 jours", "Plus de 3 jours", "Je me sens plus mal les jours suivants qu'avant l'effort"), "vous récupérez lentement après un effort", "f_recup"],
              [fHas("ef_endur", "Oui, mais je suis vidé(e) ensuite", "Non, je dois m'arrêter vite"), "vous tenez mal un effort prolongé", "ef_endur"],
              [fHas("f_type", "Les deux"), "votre fatigue touche à la fois le corps et la tête", "f_type|Les deux"] ],
   /* évoquée aussi si UN signe d'effort et UN facteur qui abîme la mitochondrie sont présents (cours MITO : causes acquises majoritaires) */
   combo: {
     signes: [ [fGe("ef_courb", 2)], [fGe("ef_crampes", 2)],
               [fHas("f_recup", "2 à 3 jours", "Plus de 3 jours", "Je me sens plus mal les jours suivants qu'avant l'effort")],
               [fHas("ef_endur", "Oui, mais je suis vidé(e) ensuite", "Non, je dois m'arrêter vite")] ],
     facteurs: [ [fHas("meds", STAT_), "vous prenez une statine", "meds|statine"],
                 [fHas("meds", METF_, "Anticoagulant de type AVK (warfarine, fluindione…)"), "vous prenez un médicament qui freine la mitochondrie (metformine ou AVK)", "meds|metf-avk"],
                 [fHas("meds", "Paracétamol, plusieurs fois par semaine", "Anti-inflammatoires ou aspirine, régulièrement (ibuprofène, kétoprofène…)"), "vous prenez souvent du paracétamol ou des anti-inflammatoires", "meds|antalgiques"],
                 [fHas("meds", "Un antibiotique pris plusieurs mois (acné, rosacée…)"), "vous avez pris un antibiotique pendant plusieurs mois", "meds|atb-long"],
                 [fHas("a_type", "Végétalienne : aucun produit animal", "Végétarienne : ni viande ni poisson", "Je mange peu de viande rouge"), "vous mangez peu ou pas de viande rouge, principale source de carnitine", "a_type|carnitine"],
                 [fHas("a_type", "Je fais des régimes à répétition, avec reprise de poids"), "vous avez enchaîné les régimes", "a_type|regimes"],
                 [fHas("v_alc", "1 verre par jour ou plus", "Plus de 2 verres par jour"), "vous buvez de l'alcool chaque jour", "v_alc"],
                 [fHas("v_tabac", "Oui"), "vous fumez", "v_tabac"],
                 [fAnyBut("v_expo", "Aucun de ces éléments", NSP_), "vous êtes exposé(e) à des métaux, des pesticides ou un air intérieur pollué", "v_expo"],
                 [fHas("a_indus", "Plusieurs fois par semaine", "Tous les jours"), "vous mangez souvent des produits industriels", "a_indus"],
                 [fHas("a_cereales", "Blancs (raffinés)"), "vos céréales sont surtout raffinées, pauvres en vitamines B", "a_cereales"],
                 [fHas("f_debut", "Un COVID", "Une autre infection (virus, grippe, mononucléose…)"), "votre fatigue a commencé après une infection", "f_debut|infection"],
                 [fHas("qn_atcd", "Diabète ou prédiabète", "Fibromyalgie ou syndrome de fatigue chronique", "Ovaires polykystiques (SOPK)", "Une maladie auto-immune (autre que la thyroïde)"), "un de vos antécédents est associé à une moindre production d'énergie", "qn_atcd|mito"],
                 [fHas("m_stat_eff", "Une glycémie qui augmente"), "votre glycémie a augmenté sous statine", "m_stat_eff|glycemie"],
                 [fHas("v_sport", "Aucune, ou presque"), "vous bougez peu", "v_sport|aucune"],
                 [fAgeGe(60), "après 60 ans, les défenses de la mitochondrie baissent", "age60"] ] } },

 muscle: { seuil: 2,
   forts: [ [fGe("ef_force", 3), "vous manquez de force pour vous relever d'une chaise, monter un escalier ou ouvrir un bocal", "ef_force"],
            [fHas("ef_fonte", "Oui"), "vos mollets ou vos cuisses ont fondu", "ef_fonte|Oui"] ],
   contrib: [ [fGe("ef_force", 2), "vous sentez vos muscles plus faibles", "ef_force"],
              [fHas("v_sport", "Aucune, ou presque"), "vous bougez peu", "v_sport|Aucune, ou presque"],
              [fHas("v_arret", "Oui, et j'ai pris du poids depuis", "Oui"), "vous avez arrêté un sport régulier", "v_arret|Oui, et j'ai pris du poids depuis"],
              [fHas("h_sig", "Une perte de muscle"), "vous perdez du muscle", "h_sig|Une perte de muscle"],
              [fNotRenfo, "vous ne faites pas de renforcement musculaire"],
              [fAgeGe(65), "après 65 ans, le muscle fond plus vite"] ] },

 fer: { seuil: 2,
   forts: [ [fHas("c_abond", "Je dois me changer toutes les 2 heures, ou plus souvent", "Le sang traverse mes vêtements ou mes draps", "J'ai des caillots"), "vos règles sont abondantes", "c_abond|Je dois me changer toutes les 2 heures, ou plus souvent"],
            [fHas("atcd_fer", "Il y a moins d'un an", "Il revient régulièrement"), "on vous a trouvé un manque de fer récent ou qui revient", "qn_atcd|fer"] ],
   contrib: [ [fHas("qn_atcd", "Maladie cœliaque"), "une maladie cœliaque peut gêner l'absorption du fer", "qn_atcd|coeliaque"],
              [fHas("atcd_fer", "Il y a 1 à 5 ans", "Il y a plus de 5 ans", "Je ne sais pas"), "on vous a déjà trouvé un manque de fer", "qn_atcd|fer"],
              [fHas("qn_psy", "Un manque de motivation ou d'élan"), "vous manquez de motivation et d'élan", "n_demarr"],
              [fHas("qn_hv", "Des impatiences dans les jambes le soir ou la nuit"), "vous signalez des impatiences dans les jambes", "qn_hv|Des impatiences dans les jambes le soir ou la nuit"],
              [fHas("qn_hv", "Je m'essouffle plus vite qu'avant, ou mon cœur s'accélère pour un petit effort"), "vous vous essoufflez plus vite qu'avant", "qn_hv|Je m'essouffle plus vite qu'avant, ou mon cœur s'accélère pour un petit effort"],
              [fHas("qn_hv", "Des ongles cassants ou striés, des cheveux qui tombent"), "vos cheveux tombent ou vos ongles cassent", "qn_hv|Des ongles cassants ou striés, des cheveux qui tombent"],
              [fOr(fHas("a_type", VEGE_[0], VEGE_[1], "Je mange peu de viande rouge")), "vous mangez peu ou pas de viande"],
              [fHas("meds", IPP_), "vous prenez un médicament contre le reflux", "meds|"],
              [fHas("don_sang", "3 fois par an ou plus"), "vous donnez souvent votre sang", "don_sang|3 fois par an ou plus"],
              [fGe("n_demarr", 3), "vous manquez de motivation et d'élan", "n_demarr"],
              [fHas("k_fer", "Aucun effet sur ma fatigue"), "le fer pris jusqu'ici n'a pas amélioré votre fatigue", "k_fer|Aucun effet sur ma fatigue"],
              [fHas("a_cafe", "Souvent"), "vous buvez du thé ou du café pendant les repas", "a_cafe|Souvent"] ] },

 b12: { seuil: 2,
   forts: [ [fAnd(fHas("qn_hv", "Des fourmillements ou des engourdissements dans les mains ou les pieds"), fOr(fHas("meds", IPP_, METF_), fHas("a_type", "Végétalienne : aucun produit animal"))), "vous signalez des fourmillements et un facteur qui gêne l'absorption ou l'apport de vitamine B12", "qn_hv|Des fourmillements ou des engourdissements dans les mains ou les pieds"] ],
   contrib: [ [fHas("qn_atcd", "Maladie cœliaque"), "une maladie cœliaque peut gêner l'absorption des vitamines B", "qn_atcd|coeliaque"],
              [fHas("qn_hv", "Des fourmillements ou des engourdissements dans les mains ou les pieds"), "vous signalez des fourmillements des mains ou des pieds", "qn_hv|Des fourmillements ou des engourdissements dans les mains ou les pieds"],
              [fGe("n_mem", 3), "votre mémoire flanche", "n_mem"],
              [fHas("meds", IPP_), "vous prenez un médicament contre le reflux", "meds|"],
              [fHas("meds", METF_), "vous prenez de la metformine", "meds|"],
              [fHas("a_type", "Végétalienne : aucun produit animal"), "vous ne mangez aucun produit animal", "a_type|Végétalienne : aucun produit animal"],
              [fHas("dl_aura", "Oui"), "vos migraines s'accompagnent de troubles de la vue", "dl_aura|Oui"],
              [fHas("qn_atcd", "Gastrite atrophique ou maladie de Biermer"), "on vous a parlé de gastrite atrophique ou de maladie de Biermer", "qn_atcd|Gastrite atrophique ou maladie de Biermer"],
              [fAgeGe(65), "après 65 ans, la vitamine B12 est moins bien absorbée"] ] },

 mg: { seuil: 2,
   forts: [ [fHas("qn_hv", "Une paupière qui saute toute seule"), "votre paupière saute toute seule", "qn_hv|Une paupière qui saute toute seule"] ],
   contrib: [ [fHas("qn_hv", "Des crampes la nuit, dans les mollets ou les pieds"), "vous signalez des crampes la nuit", "qn_hv|Des crampes la nuit, dans les mollets ou les pieds"],
              [fHas("qn_hv", "Je supporte mal le bruit ou la lumière, je sursaute facilement"), "vous supportez mal le bruit ou la lumière", "qn_hv|Je supporte mal le bruit ou la lumière, je sursaute facilement"],
              [fGe("st_niv", 7), "votre niveau de stress est élevé", "st_niv"],
              [fAnd(fHas("meds", IPP_), fHas("m_ipp", "1 à 5 ans", "Plus de 5 ans")), "vous prenez un anti-reflux depuis plus d'un an", "meds|"],
              [fHas("meds", "Diurétique"), "vous prenez un diurétique", "meds|Diurétique"],
              [fGe("ef_crampes", 2), "vous signalez des crampes à l'effort", "ef_crampes"],
              [fHas("k_mg", "Aucun effet"), "le magnésium pris jusqu'ici n'a pas eu d'effet", "k_mg|Aucun effet"] ] },

 vitd: { seuil: 2,
   forts: [],
   contrib: [ [fHas("qn_psy", "Mon moral baisse en automne et en hiver, quand les jours raccourcissent"), "votre moral baisse en hiver", "t_hiver"],
              [fHas("dl_ou", "Dans les muscles, un peu partout"), "vous signalez des douleurs musculaires diffuses", "dl_ou|Dans les muscles, un peu partout"],
              [fGe("ef_force", 2), "vous manquez de force", "ef_force"],
              [fGe("t_hiver", 3), "votre fatigue s'aggrave en hiver", "t_hiver"],
              [fHas("a_pg", "Rarement ou jamais"), "vous mangez rarement des poissons gras", "a_pg|Rarement ou jamais"],
              [fHas("meds", STAT_), "vous prenez une statine", "meds|"],
              [fHas("chir", "Ablation de la vésicule biliaire"), "votre vésicule biliaire a été retirée", "chir|Ablation de la vésicule biliaire"],
              [fHas("d_selles", "Grasses, brillantes ou luisantes", "Collantes à la cuvette"), "vos selles sont grasses ou collantes", "d_selles|Grasses, brillantes ou luisantes"],
              [fHas("im_freq", "4 ou plus"), "vous faites beaucoup d'infections", "im_freq|4 ou plus"] ] },

 omega3: { seuil: 3,
   forts: [],
   contrib: [ [fHas("a_pg", "Rarement ou jamais"), "vous mangez rarement des petits poissons gras", "a_pg|Rarement ou jamais"],
              [fHas("qn_hv", "Une peau sèche, des yeux secs"), "votre peau ou vos yeux sont secs", "qn_hv|Une peau sèche, des yeux secs"],
              [fAnd(fHas("qn_psy", "Une tristesse ou une humeur basse", "Moins de plaisir dans ce que je fais"), fHas("psy_duree", "Oui, presque tous les jours, depuis au moins 2 semaines")), "votre moral est bas presque tous les jours", "moral"],
              [fHas("d_selles", "Collantes à la cuvette", "Grasses, brillantes ou luisantes"), "vos selles collent ou sont grasses", "d_selles|Collantes à la cuvette"],
              [fHas("chir", "Ablation de la vésicule biliaire"), "votre vésicule biliaire a été retirée", "chir|Ablation de la vésicule biliaire"],
              [fHas("k_o3", "Aucun effet", "Des renvois au goût de poisson"), "vos oméga-3 n'ont pas eu d'effet ou passent mal", "k_o3|Aucun effet"],
              [fHas("dl_ou", "Dans les articulations"), "vous signalez des douleurs articulaires", "dl_ou|Dans les articulations"] ] },

 thyro: { seuil: 3,
   forts: [ [fHas("t_carot", "Oui, nettement"), "vos paumes ou vos plantes de pieds sont jaune-orangé", "t_carot|Oui, nettement"],
            [fHas("m_thy_fat", "Oui, souvent"), "vous restez fatigué(e) malgré votre traitement de la thyroïde", "m_thy_fat|Oui, souvent"] ],
   contrib: [ [fGe("t_froid", 3), "vous avez souvent froid quand les autres n'ont pas froid", "t_froid"],
              [fGe("t_peau", 3), "votre peau est sèche", "t_peau"],
              [fGe("t_chev", 3), "vos cheveux tombent", "t_chev"],
              [fGe("t_sourc", 2), "la queue de vos sourcils se dégarnit", "t_sourc"],
              [fGe("t_paup", 3), "votre visage est gonflé au réveil", "t_paup"],
              [fGe("t_oreiller", 3), "la marque de l'oreiller reste longtemps sur votre visage", "t_oreiller"],
              [fGe("t_langue", 3), "vous signalez des traces de dents sur la langue", "t_langue"],
              [fGe("t_voix", 3), "votre voix est plus grave ou rauque", "t_voix"],
              [fGe("t_ralent", 3), "vous vous sentez au ralenti", "t_ralent"],
              [fGe("t_const", 3), "vous êtes constipé(e)", "t_const"],
              [fHas("t_poids", "Oui"), "vous prenez du poids en mangeant peu", "t_poids|Oui"],
              [fHas("t_tibia", "Oui"), "le creux reste marqué quand vous appuyez sur le tibia", "t_tibia|Oui"],
              [fHas("f_moment", REVEIL_), "votre fatigue est plus forte au réveil", "f_moment|"],
              [fHas("qn_atcd", "Hypothyroïdie ou maladie de Hashimoto", "Hyperthyroïdie ou nodule de la thyroïde"), "vous signalez un antécédent thyroïdien", "qn_atcd|Hypothyroïdie ou maladie de Hashimoto"],
              [fHas("qn_fam", "Une maladie de la thyroïde"), "la thyroïde fragile est fréquente dans votre famille", "qn_fam|Une maladie de la thyroïde"],
              [fAnyBut("t_hyper", "Aucun de ces signes", NSP_), "vous signalez aussi des signes d'emballement (chaleur, cœur rapide, agitation)", "t_hyper|Aucun de ces signes"] ] },

 cortisol: { seuil: 3,
   forts: [ [fHas("f_matin", "Il me faut 1 à 2 heures pour démarrer"), "il vous faut une à deux heures pour démarrer le matin", "f_matin|Il me faut 1 à 2 heures pour démarrer"],
            [fHas("f_moment", "Je suis à plat toute la journée, puis j'ai un regain d'énergie le soir"), "vous êtes à plat la journée et retrouvez de l'énergie le soir", "f_moment|Je suis à plat toute la journée, puis j'ai un regain d'énergie le soir"],
            [fHas("st_burn", "Oui, et je n'ai jamais retrouvé mon énergie", "Je pense en traverser un en ce moment"), "vous traversez ou avez traversé un burn-out", "st_burn|Oui, et je n'ai jamais retrouvé mon énergie"] ],
   contrib: [ [fHas("d_stress", "Oui, souvent"), "votre ventre réagit au stress", "d_stress|Oui, souvent"],
              [fHas("f_recup", "2 à 3 jours", "Plus de 3 jours"), "une journée chargée, même agréable, vous demande plusieurs jours de récupération", "f_recup|2 à 3 jours"],
              [fGe("f_agite", 3), "vous vous sentez à la fois épuisé(e) et à cran", "f_agite"],
              [fGe("st_niv", 7), "votre stress est élevé", "st_niv"],
              [fHas("st_duree", "Plus d'un an"), "ce stress dure depuis plus d'un an", "st_duree|Plus d'un an"],
              [fGe("n_vuln", 3), "le moindre imprévu vous déborde", "n_vuln"],
              [fHas("qn_hv", "Des envies de salé"), "vous signalez des envies de salé", "qn_hv|Des envies de salé"],
              [fHas("qn_hv", "Des vertiges ou un voile noir quand je me lève vite"), "vous signalez des vertiges en vous levant", "qn_hv|Des vertiges ou un voile noir quand je me lève vite"],
              [fHas("st_evts", "Deux", "Trois ou plus"), "vous avez vécu plusieurs événements importants cette année", "st_evts|Deux"],
              [fGe("s_endor", 3), "vous avez du mal à vous endormir", "s_endor"],
              [fGe("gl_saut", 3), "vous devenez faible si vous sautez un repas", "gl_saut"],
              [fHas("f_matin", "Je me réveille tendu(e), en alerte, parfois avant le réveil"), "vous vous réveillez tendu(e), en alerte", "f_matin|Je me réveille tendu(e), en alerte, parfois avant le réveil"] ] },

 neuro: { seuil: 3,
   forts: [ [fHas("gl_sucre", "Surtout en fin d'après-midi ou le soir"), "vos envies de sucré arrivent en fin d'après-midi ou le soir", "gl_sucre|Surtout en fin d'après-midi ou le soir"] ],
   contrib: [ [fHas("qn_atcd", "Dépression"), "on vous a parlé de dépression", "qn_atcd|depression"],
              [fHas("qn_psy", "Je me renferme, j'ai moins envie de voir du monde"), "vous vous renfermez", "qn_psy|repli"],
              [function(A){ return fHas("qn_psy", "Une tristesse ou une humeur basse", "Moins de plaisir dans ce que je fais")(A) && !fHas("psy_duree", "Oui, presque tous les jours, depuis au moins 2 semaines")(A); }, "votre moral est en baisse", "moral-leger"],
              [fHas("qn_psy", "Un manque de motivation ou d'élan"), "vous manquez de motivation", "n_demarr"],
              [fGe("n_demarr", 3), "vous avez du mal à démarrer ce que vous entreprenez", "n_demarr"],
              [fGe("n_duree", 3), "vous avez du mal à tenir dans la durée", "n_duree"],
              [fGe("n_irrit", 3), "vous vous énervez facilement", "n_irrit"],
              [fGe("n_angoisse", 3), "vous signalez des angoisses ou des ruminations", "n_angoisse"],
              [fGe("n_compense", 3), "vous compensez par le grignotage, les écrans ou les achats", "n_compense"],
              [fAnd(fHas("qn_psy", "Une tristesse ou une humeur basse", "Moins de plaisir dans ce que je fais"), fHas("psy_duree", "Oui, presque tous les jours, depuis au moins 2 semaines")), "votre moral est bas presque tous les jours", "moral"],
              [fHas("f_moment", "En fin d'après-midi, vers 15-17 h"), "vous signalez un coup de barre vers 15-17 h", "f_moment|En fin d'après-midi, vers 15-17 h"],
              [fGe("s_endor", 3), "vous avez du mal à vous endormir", "s_endor"],
              [fHas("gl_pain", "Oui"), "vous mangez beaucoup de pain ou de féculents", "gl_pain|Oui"] ] },

 hormones: { seuil: 2,
   forts: [ [fHas("c_moment", "Une fatigue plus forte avant les règles", "Je dors moins bien avant les règles"), "votre fatigue ou votre sommeil se dégradent avant les règles", "c_moment|Une fatigue plus forte avant les règles"],
            [fHas("c_meno", "Des bouffées de chaleur sans transpiration", "Des bouffées de chaleur avec beaucoup de transpiration, des réveils la nuit draps trempés"), "vous signalez des bouffées de chaleur", "c_meno|Des bouffées de chaleur sans transpiration"],
            [fHas("c_pelv", "Des règles très douloureuses", "Une douleur qui augmente en fin de règles", "Des douleurs pendant les rapports"), "vos règles ou vos rapports sont douloureux", "c_pelv|Des règles très douloureuses"],
            [fHas("h_sig", "Une baisse de la libido", "Des érections moins fermes ou moins fréquentes", "Moins d'érections au réveil"), "votre libido ou vos érections ont baissé", "libido"] ],
   contrib: [ [fHas("qn_atcd", "Cholestérol bas"), "un cholestérol bas prive le corps de la matière première des hormones", "qn_atcd|chol-bas"],
              [fHas("c_statut", "Mes cycles changent depuis quelques années (après 40 ans)"), "vos cycles changent depuis quelques années", "c_statut|Mes cycles changent depuis quelques années (après 40 ans)"],
              [fAnyBut("c_moment", "Pas de lien avec le cycle", NSP_), "certains signes suivent votre cycle", "c_moment|Pas de lien avec le cycle"],
              [fHas("c_contra_eff", "Plus de fatigue", "Une humeur plus basse ou irritable"), "votre contraception vous fatigue ou pèse sur votre humeur", "c_contra_eff|Plus de fatigue"],
              [fHas("qn_atcd", "Ovaires polykystiques (SOPK)", "Endométriose"), "on vous a diagnostiqué un SOPK ou une endométriose", "qn_atcd|Ovaires polykystiques (SOPK)"],
              [fHas("c_accouch", "Oui"), "vous avez accouché il y a moins de deux ans", "c_accouch|Oui"],
              [fHas("c_menoage", "Avant 40 ans"), "vos règles se sont arrêtées avant 40 ans", "c_menoage|Avant 40 ans"],
              [fHas("f_debut", "Une grossesse ou un accouchement", "L'approche de la ménopause, ou la ménopause"), "votre fatigue a commencé avec une grossesse ou la ménopause", "f_debut|Une grossesse ou un accouchement"],
              [fHas("qn_signes", "Ma libido a baissé"), "votre libido a baissé", "libido"],
              [fHas("gl_ventre", "Oui, nettement"), "votre ventre s'est arrondi", "gl_ventre|Oui, nettement"] ] },

 glycemie: { seuil: 3,
   forts: [ [fGe("gl_fringale", 3), "peu après un repas sucré, la faim revient et vous grignotez", "gl_fringale"],
            [fGe("gl_vue", 3), "voir ou sentir de la nourriture vous donne une faim intense", "gl_vue"],
            [fGe("gl_nuit", 3), "vous vous réveillez la nuit avec faim ou besoin de sucré", "gl_nuit"] ],
   contrib: [ [fHas("qn_atcd", "Hypertension artérielle"), "l'hypertension est souvent liée à un excès d'insuline", "qn_atcd|hta"],
              [fHas("f_moment", "En milieu de matinée, vers 10-11 h"), "vous signalez un coup de barre en milieu de matinée", "f_moment|En milieu de matinée, vers 10-11 h"],
              [fGe("gl_apres", 3), "vous signalez un coup de barre après le repas", "gl_apres"],
              [fHas("f_moment", "Après les repas"), "votre fatigue est plus forte après les repas", "f_moment|Après les repas"],
              [fGe("gl_saut", 3), "vous devenez faible si vous sautez un repas", "gl_saut"],
              [fHas("gl_sucre", "Surtout quand je saute ou que je retarde un repas"), "vos envies de sucré arrivent quand un repas est retardé", "gl_sucre|Surtout quand je saute ou que je retarde un repas"],
              [fHas("gl_ventre", "Oui, nettement", "Un peu"), "votre tour de taille a augmenté", "gl_ventre|Oui, nettement"],
              [fHas("qn_atcd", "Diabète ou prédiabète"), "on vous a parlé de diabète ou de prédiabète", "qn_atcd|Diabète ou prédiabète"],
              [fHas("gl_pdj", "Sucré (pain, céréales, confiture, jus de fruits…)"), "votre petit-déjeuner est sucré", "gl_pdj|Sucré (pain, céréales, confiture, jus de fruits…)"],
              [fHas("a_indus", "Tous les jours"), "vous mangez des produits industriels chaque jour", "a_indus|Tous les jours"],
              [fHas("v_malaise", "Souvent", "Parfois"), "vous faites des malaises pendant les efforts longs", "v_malaise|Souvent"],
              [fHas("qn_fam", "Diabète"), "le diabète est présent dans votre famille", "qn_fam|Diabète"] ] },

 sommeil: { seuil: 2,
   forts: [ [fHas("s_ronf", "On m'a signalé des pauses respiratoires"), "on vous a signalé des pauses respiratoires pendant votre sommeil", "s_ronf|On m'a signalé des pauses respiratoires"],
            [fAnd(fHas("f_moment", REVEIL_), fHas("s_ronf", "Je ronfle"), fHas("s_uri", "Deux fois ou plus")), "vous êtes fatigué(e) au réveil, vous ronflez et vous vous levez la nuit pour uriner", "f_moment|"],
            [fHas("s_duree", "Moins de 6 heures"), "vous dormez moins de 6 heures", "s_duree|Moins de 6 heures"] ],
   contrib: [ [fHas("s_sieste", "Oui, longue (plus de 30 minutes)"), "vous faites de longues siestes", "s_sieste|Oui, longue (plus de 30 minutes)"],
              [fHas("s_ronf", "Je ronfle"), "vous ronflez", "s_ronf|Je ronfle"],
              [fHas("s_uri", "Deux fois ou plus"), "vous vous levez plusieurs fois la nuit pour uriner", "s_uri|Deux fois ou plus"],
              [fGe("s_somno", 3), "vous somnolez dans la journée", "s_somno"],
              [fHas("s_coucher", "Après minuit"), "vous vous couchez après minuit", "s_coucher|Après minuit"],
              [fHas("s_rythme", "Horaires décalés (très tôt ou très tard)", "Travail posté (matin, après-midi, nuit en alternance)", "Travail de nuit"), "vos horaires de travail sont décalés ou de nuit", "s_rythme|Horaires décalés (très tôt ou très tard)"],
              [fHas("s_lum", "Non, presque jamais"), "vous ne voyez pas la lumière du jour le matin", "s_lum|Non, presque jamais"],
              [fGe("s_nonrep", 3), "votre sommeil ne vous repose pas", "s_nonrep"],
              [fHas("s_duree", "6 à 7 heures"), "vous dormez moins de 7 heures", "s_duree|6 à 7 heures"],
              [fHas("qn_atcd", "Apnées du sommeil"), "on vous a parlé d'apnées du sommeil", "qn_atcd|Apnées du sommeil"],
              [fGe("s_rev", 3), "vous vous réveillez la nuit", "s_rev"] ] },

 inflam: { seuil: 3,
   forts: [ [fHas("mieux_sous", "Pendant des antibiotiques"), "vous alliez nettement mieux pendant des antibiotiques", "mieux_sous|Pendant des antibiotiques"],
            [fHas("mieux_sous", "Pendant des anti-inflammatoires, de l'aspirine ou de la cortisone"), "vous alliez nettement mieux sous anti-inflammatoires ou cortisone", "mieux_sous|Pendant des anti-inflammatoires, de l'aspirine ou de la cortisone"],
            [fGe("gl_jeune", 3), "vous allez mieux sans sucre ou à jeun, puis tout revient", "gl_jeune"] ],
   contrib: [ [fHas("qn_atcd", "Maladie cœliaque"), "vous signalez une maladie cœliaque", "qn_atcd|coeliaque"],
              [fHas("d_stress", "Oui, souvent"), "vos troubles digestifs augmentent avec le stress", "d_stress|Oui, souvent"],
              [fHas("f_debut", "Une diarrhée de voyage ou un parasite intestinal"), "votre fatigue a commencé après une diarrhée de voyage ou un parasite", "f_debut|Une diarrhée de voyage ou un parasite intestinal"],
              [fHas("f_repos", "Pareil : le repos ne change rien", "Paradoxalement plus fatigué(e)"), "le repos ne vous soulage pas", "f_repos|Pareil : le repos ne change rien"],
              [fHas("qn_hv", "Des démangeaisons des paupières, des bras ou du cuir chevelu"), "vous signalez des démangeaisons des paupières ou des bras", "qn_hv|Des démangeaisons des paupières, des bras ou du cuir chevelu"],
              [fHas("qn_hv", "Des rougeurs, des palpitations ou des maux de tête après le vin, les fromages affinés ou la charcuterie"), "certains aliments vous donnent rougeurs, palpitations ou maux de tête", "qn_hv|Des rougeurs, des palpitations ou des maux de tête après le vin, les fromages affinés ou la charcuterie"],
              [fHas("qn_signes", "J'ai des troubles digestifs (ballonnements, transit, reflux)"), "vous signalez des troubles digestifs", "qn_signes|Troubles digestifs : ballonnements, transit, lourdeurs, reflux"],
              [fHas("d_aliments", "Le pain, les pâtes, les biscuits ou le sucre"), "le pain et le sucre vous font gonfler", "d_aliments|Le pain, les pâtes, les biscuits ou le sucre"],
              [fHas("gl_sucre", "À n'importe quel moment, sans horaire"), "vos envies de sucré arrivent à n'importe quel moment", "gl_sucre|À n'importe quel moment, sans horaire"],
              [fHas("atb5", "3 à 5", "Plus de 5"), "vous avez pris plusieurs cures d'antibiotiques", "atb5|3 à 5"],
              [fHas("im_type", "Mycoses"), "vous signalez des mycoses à répétition", "im_type|Mycoses"],
              [fGe("n_brouil", 3), "vous avez souvent la tête dans le brouillard", "n_brouil"],
              [fGe("n_ivre", 2), "vous vous sentez parfois comme ivre sans avoir bu", "n_ivre"],
              [fHas("qn_atcd", "Une maladie auto-immune (autre que la thyroïde)", "Une maladie inflammatoire chronique (polyarthrite, maladie de Crohn…)"), "vous signalez une maladie inflammatoire ou auto-immune", "qn_atcd|Une maladie auto-immune (autre que la thyroïde)"],
              [fHas("meds", "Anti-inflammatoires ou aspirine, régulièrement (ibuprofène, kétoprofène…)"), "vous prenez souvent des anti-inflammatoires", "meds|Anti-inflammatoires ou aspirine, régulièrement (ibuprofène, kétoprofène…)"],
              [fHas("f_debut", "Une gastro-entérite sévère ou une intoxication alimentaire"), "votre fatigue a commencé après une gastro-entérite", "f_debut|Une gastro-entérite sévère ou une intoxication alimentaire"] ] },

 postinf: { seuil: 3,
   forts: [ [fHas("f_postinf", "Ne s'améliore pas", "S'aggrave"), "votre fatigue ne s'améliore pas depuis l'infection", "f_postinf"],
              [fHas("f_recup", "Je me sens plus mal les jours suivants qu'avant l'effort"), "vous êtes plus mal les jours qui suivent un effort", "f_recup|Je me sens plus mal les jours suivants qu'avant l'effort"],
            [fHas("f_debut", "Un COVID", "Une autre infection (virus, grippe, mononucléose…)"), "votre fatigue a commencé après une infection", "f_debut|Un COVID"],
            [fHas("qn_atcd", "Fibromyalgie ou syndrome de fatigue chronique", "COVID long"), "on vous a parlé de fibromyalgie, de fatigue chronique ou de COVID long", "qn_atcd|Fibromyalgie ou syndrome de fatigue chronique"] ],
   contrib: [ [fHas("f_debut", "Une hépatite"), "votre fatigue a commencé après une hépatite", "f_debut|Une hépatite"],
              [fGe("dl_bouge", 3), "vos douleurs changent d'endroit", "dl_bouge"],
              [fHas("dl_jour", "Augmentent, puis diminuent quand je me repose", "Augmentent le soir et surtout au coucher"), "vos douleurs augmentent au fil de la journée", "dl_jour|Augmentent, puis diminuent quand je me repose"],
              [fGe("dl_contact", 3), "un simple contact vous fait mal", "dl_contact"],
              [fHas("dl_trop", "Oui, souvent"), "en faire trop déclenche vos douleurs", "dl_trop|Oui, souvent"],
              [fHas("qn_fam", "Fibromyalgie"), "la fibromyalgie est présente dans votre famille", "qn_fam|Fibromyalgie"],
              [fGe("s_nonrep", 3), "votre sommeil ne vous repose pas", "s_nonrep"],
              [fHas("im_duree", "Plus de 10 jours"), "vos viroses durent plus de 10 jours", "im_duree|Plus de 10 jours"],
              [fHas("f_repos", "Pareil : le repos ne change rien"), "le repos ne vous soulage pas", "f_repos|Pareil : le repos ne change rien"],
              [fHas("dl_ou", "Dans les muscles, un peu partout"), "vous avez mal un peu partout", "dl_ou|Dans les muscles, un peu partout"] ] },

 foie: { seuil: 2,
   forts: [ [fHas("s_cafe", "Oui"), "un café pris après 14 h vous empêche de dormir", "s_cafe|Oui"],
            [fHas("qn_hv", "Je supporte mal l'alcool, le café, les parfums ou certains médicaments"), "vous supportez mal l'alcool, le café, les parfums ou certains médicaments", "qn_hv|Je supporte mal l'alcool, le café, les parfums ou certains médicaments"] ],
   contrib: [ [fHas("f_debut", "Une hépatite"), "votre fatigue a commencé après une hépatite", "f_debut|Une hépatite"],
              [fHas("s_revq", "C'est souvent vers 3 heures du matin"), "vous vous réveillez souvent vers 3 heures", "s_revq|C'est souvent vers 3 heures du matin"],
              [fHas("qn_hv", "Des sueurs la nuit qui mouillent l'oreiller"), "vous transpirez la nuit", "qn_hv|Des sueurs la nuit qui mouillent l'oreiller"],
              [fHas("v_alc", "1 verre par jour ou plus", "Plus de 2 verres par jour"), "vous buvez de l'alcool chaque jour", "v_alc|1 verre par jour ou plus"],
              [fAnyBut("v_expo", "Aucun de ces éléments", NSP_), "vous êtes exposé(e) à des métaux ou à des produits chimiques", "v_expo|Aucun de ces éléments"],
              [fHas("m_nb", "5 ou plus"), "vous prenez beaucoup de médicaments", "m_nb|5 ou plus"],
              [fHas("meds", "Paracétamol, plusieurs fois par semaine"), "vous prenez souvent du paracétamol", "meds|Paracétamol, plusieurs fois par semaine"],
              [fHas("f_repos", "Pareil : le repos ne change rien"), "le repos ne vous soulage pas", "f_repos|Pareil : le repos ne change rien"],
              [fHas("a_leg", "Rarement ou jamais"), "vous mangez peu de fruits et légumes", "a_leg|Rarement ou jamais"] ] },

 medic: { seuil: 2,
   forts: [ [fAnyBut("m_stat_eff", "Rien de particulier", NSP_), "vous ressentez des effets depuis votre statine", "m_stat_eff|Rien de particulier"],
            [fAnd(fHas("meds", IPP_), fHas("m_ipp", "1 à 5 ans", "Plus de 5 ans")), "vous prenez un anti-reflux depuis plus d'un an", "meds|"],
            [fHas("f_debut", "Un nouveau médicament ou un changement de traitement"), "votre fatigue a commencé avec un nouveau médicament", "f_debut|Un nouveau médicament ou un changement de traitement"] ],
   contrib: [ [fHas("meds", STAT_, IPP_, METF_), "vous prenez un médicament qui peut épuiser certains micronutriments", "meds|"],
              [fHas("m_nb", "3 ou 4", "5 ou plus"), "vous prenez plusieurs médicaments chaque jour", "m_nb|3 ou 4"],
              [fHas("meds", "Antidépresseur", "Antidépresseur tricyclique (amitriptyline, clomipramine…)", "Anxiolytique ou somnifère", "Bêtabloquant (propranolol, bisoprolol…)", "Corticoïdes (cortisone), au long cours ou en cures répétées", "Lithium, antiépileptique ou neuroleptique"), "vous prenez un traitement qui peut peser sur l'énergie", "meds|Antidépresseur"],
              [fHas("c_contra_eff", "Plus de fatigue"), "vous êtes plus fatiguée depuis votre contraception", "c_contra_eff|Plus de fatigue"],
              [fHas("m_ipp_arret", "Oui, et le reflux est revenu plus fort"), "le reflux revient plus fort quand vous arrêtez l'anti-reflux", "m_ipp_arret|Oui, et le reflux est revenu plus fort"] ] }
};
function fNotRenfo(A){ var v = fArr(A.v_sport); return v.length > 0 && v.indexOf("Du renforcement musculaire") < 0 && v.indexOf(NSP_) < 0; }

/* Conditions d'affichage du contenu (même langage que le questionnaire). Réponse absente ou « Je ne sais pas » = faux. */
function fCond(c, A){
  if (!c) return true;
  if (c.or) return c.or.some(function(x){ return fCond(x, A); });
  if (c.and) return c.and.every(function(x){ return fCond(x, A); });
  if (c.non) return !fCond(c.non, A);
  if (c.sexe) return A.sexe === c.sexe;
  if (c.age_ge != null){ var a = fAge(A); return a != null && a >= c.age_ge; }
  if (c.age_lt != null){ var b = fAge(A); return b != null && b < c.age_lt; }
  var v = fArr(A[c.q]);
  if (c.ge != null) return typeof A[c.q] === "number" && A[c.q] >= c.ge;
  if (c.eq != null) return v.indexOf(c.eq) >= 0;
  if (c.any) return v.some(function(x){ return c.any.indexOf(x) >= 0; });
  if (c.anyBut) return v.some(function(x){ return c.anyBut.indexOf(x) < 0 && x !== NSP_; });
  return false;
}
/* Contexte du rapport : alertes et orientations transverses */
function fatContexte(A){
  return {
    alarme: fAnyBut("alarme", "Aucun de ces signes")(A),
    hemochro: fHas("qn_atcd", "Hémochromatose, ou fer trop élevé")(A),
    prudence: fHas("qn_atcd", "Hypertension artérielle", "Maladie du cœur ou des poumons (insuffisance cardiaque, asthme, BPCO…)", "Immunité affaiblie (traitement qui diminue l'immunité, chimiothérapie…)", "Une insuffisance rénale")(A),
    retent: fHas("f_retent", "Oui : j'ai dû réduire mes activités (travail, tâches, sorties)", "Oui, beaucoup : j'ai arrêté certaines activités, ou je suis en arrêt de travail")(A),
    postinfStagne: fHas("f_postinf", "Ne s'améliore pas", "S'aggrave")(A),
    alarmes: fArr(A.alarme).filter(function(x){ return x !== "Aucun de ces signes" && x !== NSP_; }),
    pasConsulte: fHas("x_consult", "Non, pas encore")(A),
    microbiote: fHas("qn_signes", "J'ai des troubles digestifs (ballonnements, transit, reflux)")(A),
    moral: fHas("qn_psy", "Des idées noires, ou des pensées de mort")(A) || fHas("c_moment", "Des idées noires avant les règles")(A)
  };
}

function fatPistes(A){
  var ev = [];
  (typeof FAT_PISTES !== "undefined" ? FAT_PISTES : []).forEach(function(p){
    var R = FAT_REGLES[p.id]; if (!R) return;
    var forts = R.forts.filter(function(r){ try { return r[0](A); } catch(e){ return false; } });
    var contrib = R.contrib.filter(function(r){ try { return r[0](A); } catch(e){ return false; } });
    var ok = function(r){ try { return r[0](A); } catch(e){ return false; } };
    var fact = R.combo ? R.combo.facteurs.filter(ok) : [];
    var combo = R.combo ? (R.combo.signes.some(ok) && fact.length > 0) : false;
    if (forts.length || contrib.length >= R.seuil || combo) {
      var raisons = [], vues = {};
      forts.concat(contrib.slice(0, 2), fact, contrib.slice(2)).forEach(function(r){ var k = r[2] || r[1]; if (vues[k] || raisons.indexOf(r[1]) >= 0) return; vues[k] = 1; raisons.push(r[1]); });
      ev.push({id: p.id, fort: forts.length > 0, n: contrib.length, raisons: raisons.slice(0, 4), def: p});
    }
  });
  return {evoquees: ev, ctx: fatContexte(A)};
}
if (typeof module !== "undefined" && module.exports) module.exports = {fCond: fCond, fatPistes: fatPistes, FAT_REGLES: FAT_REGLES, fatContexte: fatContexte};

/* LifeMicroNut — Bilan fatigue : contenu des pistes (généré par mk_pistes.py depuis rapport_src/out — ne pas modifier à la main).
   src = index des extraits de cours vérifiés (extraits/ALL_ok.json) qui appuient le contenu. */
var FAT_PISTES = [
 {
  "id": "mito",
  "fam": "Énergie cellulaire",
  "nom": "Production d'énergie (mitochondrie)",
  "piste": "une production d'énergie de vos cellules (les mitochondries) qui pourrait tourner au ralenti",
  "mec": [
   {
    "t": "Les mitochondries sont de petites centrales, présentes dans chaque cellule, qui fabriquent l'énergie : comme un moteur, elles donnent de la puissance mais rejettent aussi des « gaz d'échappement », les radicaux libres.",
    "si": null
   },
   {
    "t": "Quand elles tournent mal, la cellule passe à un mode de secours qui fait fermenter le sucre et produit de l'acide : cela peut contribuer aux crampes et aux douleurs après l'effort, et entretient un cercle vicieux.",
    "si": null
   },
   {
    "t": "Le cerveau et le cœur sont les plus gourmands : le cerveau utilise à lui seul environ 20 % de l'énergie du corps pour 2 % de son poids, et le cœur est très riche en mitochondries.",
    "si": null
   },
   {
    "t": "Ces moteurs ont besoin chaque jour de vitamines du groupe B, que le corps ne stocke pas, ainsi que de fer, de cuivre, de magnésium et de coenzyme Q10.",
    "si": null
   },
   {
    "t": "Bonne nouvelle : quand on les aide, le cercle devient vertueux, avec plus d'énergie et moins de radicaux libres, et les mitochondries se renouvellent en quelques semaines (environ 4 pour les muscles).",
    "si": null
   }
  ],
  "expl": [
   {
    "t": "Quand ces centrales tournent au ralenti, l'énergie manque surtout pour durer : tenir un effort et récupérer ensuite deviennent plus difficiles.",
    "si": null
   },
   {
    "t": "Après un effort même léger, les courbatures peuvent être fortes ou durer plusieurs jours, avec parfois des crampes.",
    "si": {
     "or": [
      {
       "q": "ef_courb",
       "ge": 2
      },
      {
       "q": "ef_crampes",
       "ge": 2
      },
      {
       "q": "f_recup",
       "any": [
        "2 à 3 jours",
        "Plus de 3 jours",
        "Je me sens plus mal les jours suivants qu'avant l'effort"
       ]
      },
      {
       "q": "qn_signes",
       "any": [
        "Je récupère mal après un effort, ou mes muscles sont faibles"
       ]
      },
      {
       "q": "m_stat_eff",
       "any": [
        "Des douleurs, des crampes ou une faiblesse dans les muscles"
       ]
      }
     ]
    }
   },
   {
    "t": "Un effort modéré mais prolongé, comme une heure de marche, peut vous laisser vidé(e) ou vous obliger à vous arrêter vite.",
    "si": {
     "or": [
      {
       "q": "ef_endur",
       "any": [
        "Oui, mais je suis vidé(e) ensuite",
        "Non, je dois m'arrêter vite"
       ]
      },
      {
       "q": "f_recup",
       "any": [
        "Je me sens plus mal les jours suivants qu'avant l'effort"
       ]
      }
     ]
    }
   },
   {
    "t": "La fatigue peut toucher à la fois le corps et la tête, avec du mal à se concentrer.",
    "si": {
     "or": [
      {
       "q": "f_type",
       "any": [
        "Les deux",
        "Intellectuelle : concentration, mémoire, brouillard"
       ]
      },
      {
       "q": "n_conc",
       "ge": 2
      },
      {
       "q": "n_brouil",
       "ge": 2
      },
      {
       "q": "n_mem",
       "ge": 2
      },
      {
       "q": "qn_signes",
       "any": [
        "J'ai du mal à me concentrer ou à retenir les choses"
       ]
      },
      {
       "q": "m_stat_eff",
       "any": [
        "Des difficultés de mémoire ou de concentration"
       ]
      }
     ]
    }
   }
  ],
  "anaD": [
   [
    "Vitamines B1, B2, B3 et B5",
    "Elles montrent si les vitamines qui font tourner le moteur sont bien là : le corps ne les stocke pas."
   ],
   [
    "Ferritine (repère autour de 100 µg/L) et saturation de la transferrine (repère idéal autour de 35 %)",
    "Elles disent si le fer, indispensable au moteur, arrive jusqu'aux organes : la ferritine seule peut tromper, car elle monte aussi avec l'inflammation."
   ],
   [
    "Coenzyme Q10 plasmatique (repère : au moins 1,5 µmol/L)",
    "Elle mesure une molécule indispensable à la fabrication d'énergie dans les mitochondries."
   ],
   [
    "Index oméga-3 des globules rouges (cible entre 7 et 10 %)",
    "Il reflète la souplesse des membranes, dont celles de vos mitochondries."
   ],
   [
    "En complément : glutathion des globules rouges, 8-OHdG dans les urines, lactate de repos",
    "Ils montrent l'état de vos défenses contre les radicaux libres, les dégâts déjà subis, et si vos cellules restent trop en mode de secours."
   ],
   [
    "Homocystéine (repère : moins de 10 µmol/L)",
    "Un taux élevé signale indirectement des défenses antioxydantes (glutathion) qui s'épuisent."
   ],
   [
    "TMAO, avant toute prise de carnitine",
    "Il vérifie que votre flore intestinale ne transforme pas la carnitine en une molécule mauvaise pour les vaisseaux."
   ]
  ],
  "nutD": [
   "Chaque matin, pressez un citron dans un grand verre d'eau : le citrate aide les mitochondries à repartir et limite la fermentation.",
   "Choisissez pain, pâtes et riz complets et bio : l'enveloppe du grain apporte les vitamines B et le magnésium dont le moteur a besoin. Si le bio n'est pas possible, préférez les versions blanches, car les pesticides se concentrent dans cette enveloppe.",
   "Mangez des petits poissons gras (sardines, maquereaux, harengs, anchois) : leur DHA garde souples les membranes des mitochondries.",
   "Variez au maximum les végétaux (légumes de toutes les couleurs, jeunes pousses d'épinards, brocolis) et pensez chaque jour aux aliments riches en vitamines B, qui ne se stockent pas : levure de bière, graines de tournesol, œufs, céréales complètes.",
   "La viande rouge (bœuf, agneau, chèvre) est la principale source de carnitine, qui fait entrer les graisses dans les mitochondries : si vous n'en mangez pas ou peu, parlez-en à votre pharmacienne, car la carnitine et la coenzyme Q10 peuvent alors manquer.",
   "Bougez à intensité modérée, sans vous épuiser : de la marche, ou un effort autour de 60 % de votre fréquence cardiaque maximale (220 moins votre âge), en associant cardio et renforcement musculaire. S'entraîner toujours bien au-delà de ses capacités abîme au contraire les mitochondries.",
   "Aérez votre logement et votre bureau chaque jour, et réduisez ce qui oblige le corps à dépenser son énergie pour se débarrasser des toxiques : produits industriels, tabac, alcool."
  ],
  "comp": [
   "Vitamines B1, B3 et B5 associées à l'acide alpha-lipoïque : l'association de référence pour aider le carburant à entrer dans les mitochondries",
   "Coenzyme Q10, à évoquer en particulier si vous prenez une statine ou après un COVID",
   "L-carnitine, intéressante pour l'endurance et la récupération, avec précaution : reins et TMAO à vérifier avant",
   "Magnésium et oméga-3 riches en DHA, sous forme purifiée",
   "Soutien antioxydant en synergie : précurseurs du glutathion (N-acétylcystéine, lactosérum natif), vitamine C en prises fractionnées, polyphénols",
   "Fer ou cuivre : seulement après un dosage",
   "À choisir avec votre pharmacienne, surtout si vous prenez des médicaments"
  ],
  "err": [
   "Croire que le magnésium « donne de l'énergie » : il aide le corps à se servir de l'énergie produite, il ne la remplace pas.",
   "Prendre un seul antioxydant à haute dose (vitamine E seule, par exemple) : cela peut déséquilibrer tout le réseau et produire l'effet inverse.",
   "Prendre du bêta-carotène de synthèse quand on fume.",
   "Prendre du fer, du cuivre ou de la carnitine sans vérification préalable : dosage pour le fer et le cuivre, reins et TMAO pour la carnitine.",
   "Prendre une statine ou un anticoagulant de type AVK sans parler de la coenzyme Q10 avec votre médecin : souvent utile avec une statine, elle demande un avis médical avec un AVK.",
   "Commencer une diète riche en protéines sans avoir d'abord remis vos mitochondries en forme.",
   "Penser que des courbatures fortes ou longues après un petit effort sont normales."
  ],
  "medecin": "Je suis fatigué(e) depuis… ; j'aimerais vérifier mes vitamines B, mon fer (ferritine et saturation de la transferrine), mon homocystéine et, si possible, ma coenzyme Q10.",
  "src": [
   4,
   6,
   19,
   21,
   22,
   23,
   28,
   41,
   49,
   53,
   59,
   120,
   321,
   469,
   930,
   1649,
   1977,
   2112,
   2120,
   2132,
   2146,
   2551,
   2552,
   2554,
   2557,
   2558,
   2560,
   2561,
   2562,
   2567,
   2570,
   2582,
   2583,
   2584,
   2588,
   2591,
   2592,
   2593,
   2599,
   2600,
   2601,
   2602,
   2603,
   2604,
   2605,
   2606,
   2608,
   2609,
   2611,
   2612,
   2613,
   2614,
   2619,
   2622,
   2625,
   2626,
   2630,
   2632,
   2638,
   2639,
   2640,
   2649,
   2650,
   2651,
   2685,
   2686,
   2687
  ],
  "si": {
   "anaD": [
    null,
    null,
    null,
    null,
    null,
    null,
    null
   ],
   "nutD": [
    null,
    {
     "non": {
      "q": "a_cereales",
      "any": [
       "Complets ou semi-complets, bio"
      ]
     }
    },
    {
     "and": [
      {
       "non": {
        "q": "a_pg",
        "any": [
         "Au moins 2 fois par semaine"
        ]
       }
      },
      {
       "non": {
        "q": "a_type",
        "any": [
         "Végétarienne : ni viande ni poisson",
         "Végétalienne : aucun produit animal"
        ]
       }
      }
     ]
    },
    null,
    null,
    null,
    null
   ],
   "comp": [
    null,
    null,
    null,
    null,
    null,
    null,
    null
   ],
   "err": [
    null,
    null,
    {
     "q": "v_tabac",
     "any": [
      "Oui"
     ]
    },
    null,
    {
     "q": "meds",
     "any": [
      "Contre le cholestérol : une statine (atorvastatine, rosuvastatine, simvastatine…)",
      "Anticoagulant de type AVK (warfarine, fluindione…)"
     ]
    },
    {
     "or": [
      {
       "q": "a_type",
       "any": [
        "Riche en protéines (diète protéinée) en ce moment",
        "Je fais des régimes à répétition, avec reprise de poids"
       ]
      },
      {
       "q": "f_debut",
       "any": [
        "Un régime ou une perte de poids rapide"
       ]
      }
     ]
    },
    {
     "or": [
      {
       "q": "ef_courb",
       "ge": 2
      },
      {
       "q": "ef_crampes",
       "ge": 2
      },
      {
       "q": "f_recup",
       "any": [
        "2 à 3 jours",
        "Plus de 3 jours",
        "Je me sens plus mal les jours suivants qu'avant l'effort"
       ]
      },
      {
       "q": "qn_signes",
       "any": [
        "Je récupère mal après un effort, ou mes muscles sont faibles"
       ]
      },
      {
       "q": "m_stat_eff",
       "any": [
        "Des douleurs, des crampes ou une faiblesse dans les muscles"
       ]
      }
     ]
    }
   ]
  }
 },
 {
  "id": "muscle",
  "fam": "Énergie cellulaire",
  "nom": "Muscle et activité physique",
  "piste": "une perte de muscle ou de condition physique qui pèse sur votre énergie",
  "mec": [
   {
    "t": "Le muscle abrite une grande partie des mitochondries, qui fabriquent l'énergie : moins de muscle, c'est moins d'énergie disponible.",
    "si": null
   },
   {
    "t": "Le muscle fond naturellement avec l'âge.",
    "si": {
     "age_ge": 50
    }
   },
   {
    "t": "La forme physique baisse dès quelques semaines d'arrêt.",
    "si": {
     "or": [
      {
       "q": "v_arret",
       "any": [
        "Oui, et j'ai pris du poids depuis",
        "Oui"
       ]
      },
      {
       "q": "f_debut",
       "any": [
        "L'arrêt d'un sport régulier"
       ]
      },
      {
       "q": "v_sport",
       "any": [
        "Aucune, ou presque"
       ]
      }
     ]
    }
   },
   {
    "t": "À l'inverse, trop de sport sans récupération dérègle le cortisol, le moral et les défenses.",
    "si": {
     "or": [
      {
       "q": "v_sport",
       "any": [
        "Un sport d'endurance intense, ou de la compétition"
       ]
      },
      {
       "q": "v_soir",
       "any": [
        "Souvent",
        "Parfois"
       ]
      },
      {
       "q": "v_infect",
       "any": [
        "Souvent",
        "Parfois"
       ]
      }
     ]
    }
   }
  ],
  "expl": [
   {
    "t": "Les efforts de la vie courante (escaliers, courses, ménage) épuisent, les muscles semblent faibles et des courbatures durent après un effort pourtant modéré.",
    "si": {
     "or": [
      {
       "q": "ef_force",
       "ge": 2
      },
      {
       "q": "ef_fonte",
       "any": [
        "Oui"
       ]
      },
      {
       "q": "h_sig",
       "any": [
        "Une perte de muscle"
       ]
      },
      {
       "q": "qn_signes",
       "any": [
        "Je récupère mal après un effort, ou mes muscles sont faibles"
       ]
      }
     ]
    }
   }
  ],
  "anaD": [
   [
    "Composition corporelle (impédancemétrie ou DEXA)",
    "Elle estime la masse musculaire et la masse grasse : un poids « normal » peut cacher une perte de muscle."
   ],
   [
    "Coenzyme Q10 plasmatique, si vous pratiquez un sport d'endurance intense",
    "Ces sportifs en consomment beaucoup et ont souvent des taux très bas."
   ]
  ],
  "nutD": [
   "Prendre des protéines au petit-déjeuner plutôt que le soir, par exemple des œufs plusieurs matins par semaine.",
   "Ne pas sauter de repas quand vous êtes stressé(e) : le corps puise alors dans ses muscles.",
   "Éviter les régimes stricts répétés, qui font perdre du muscle puis reprendre du gras.",
   "Prendre le temps de bien mâcher : c'est la première étape de la digestion, et elle conditionne la bonne utilisation de ce que vous mangez."
  ],
  "comp": [
   "Antioxydants, dont le sélénium, si vous faites beaucoup de sport",
   "Glutamine, pendant et après des infections à répétition",
   "À choisir avec votre pharmacienne, surtout si vous prenez des médicaments"
  ],
  "err": [
   "Ne faire que de la marche ou de l'endurance : il faut aussi du renforcement musculaire pour garder du muscle.",
   "Aller faire un cardio intense après une journée stressante, sans récupération : le cortisol monte encore.",
   "Faire du sport rarement mais très intensément (une grosse sortie le week-end) : mieux vaut bouger régulièrement et de façon modérée.",
   "Penser qu'un poids normal suffit : on peut être mince et manquer de muscle.",
   "S'arrêter complètement : la forme s'entretient par une activité régulière, et à la reprise les premiers bénéfices se voient dès deux semaines."
  ],
  "medecin": "Je suis fatigué(e) depuis…, je me sens moins fort(e) et les efforts du quotidien m'épuisent ; j'aimerais faire le point sur ma masse musculaire (force de préhension, vitesse de marche).",
  "src": [
   219,
   285,
   321,
   364,
   662,
   839,
   847,
   848,
   850,
   854,
   887,
   1593,
   1622,
   2069,
   2110,
   2688,
   2689,
   2690,
   2691,
   2692,
   2693,
   2694,
   2695,
   2696,
   2697,
   2698,
   2699,
   2700,
   2701,
   2702
  ],
  "si": {
   "anaD": [
    null,
    {
     "q": "v_sport",
     "any": [
      "Un sport d'endurance intense, ou de la compétition"
     ]
    }
   ],
   "nutD": [
    {
     "non": {
      "q": "gl_pdj",
      "any": [
       "Salé, avec des protéines (œufs, jambon, fromage…)"
      ]
     }
    },
    null,
    null,
    null
   ],
   "comp": [
    {
     "or": [
      {
       "q": "v_sport",
       "any": [
        "Un sport d'endurance intense, ou de la compétition"
       ]
      },
      {
       "q": "v_soir",
       "any": [
        "Souvent",
        "Parfois"
       ]
      },
      {
       "q": "v_infect",
       "any": [
        "Souvent",
        "Parfois"
       ]
      }
     ]
    },
    {
     "or": [
      {
       "q": "v_infect",
       "any": [
        "Souvent",
        "Parfois"
       ]
      },
      {
       "and": [
        {
         "or": [
          {
           "q": "v_sport",
           "any": [
            "Un sport d'endurance intense, ou de la compétition"
           ]
          },
          {
           "q": "v_soir",
           "any": [
            "Souvent",
            "Parfois"
           ]
          },
          {
           "q": "v_infect",
           "any": [
            "Souvent",
            "Parfois"
           ]
          }
         ]
        },
        {
         "q": "im_freq",
         "any": [
          "4 ou plus"
         ]
        }
       ]
      }
     ]
    },
    null
   ],
   "err": [
    {
     "and": [
      {
       "q": "v_sport",
       "any": [
        "De la marche, au moins 3 fois par semaine",
        "Un sport d'endurance modéré",
        "Un sport d'endurance intense, ou de la compétition"
       ]
      },
      {
       "non": {
        "q": "v_sport",
        "any": [
         "Du renforcement musculaire"
        ]
       }
      }
     ]
    },
    {
     "q": "v_soir",
     "any": [
      "Souvent",
      "Parfois"
     ]
    },
    null,
    null,
    null
   ]
  }
 },
 {
  "id": "fer",
  "fam": "Carences",
  "nom": "Réserves en fer",
  "piste": "des réserves en fer trop basses pour bien fonctionner",
  "mec": [
   {
    "t": "Le fer transporte l'oxygène dans le sang, le stocke dans les muscles et fait tourner les mitochondries, les centrales énergétiques des cellules.",
    "si": null
   },
   {
    "t": "Il sert aussi à fabriquer les messagers de l'envie et de la bonne humeur (dopamine, sérotonine).",
    "si": null
   },
   {
    "t": "Les organes manquent de fer bien avant que la prise de sang montre une anémie.",
    "si": null
   }
  ],
  "expl": [
   {
    "t": "La fatigue s'accompagne souvent d'essoufflement à l'effort.",
    "si": {
     "q": "qn_hv",
     "any": [
      "Je m'essouffle plus vite qu'avant, ou mon cœur s'accélère pour un petit effort"
     ]
    }
   },
   {
    "t": "Elle s'accompagne aussi souvent d'un manque d'envie et de motivation, ou d'un moral en baisse.",
    "si": {
     "or": [
      {
       "q": "n_demarr",
       "ge": 2
      },
      {
       "q": "qn_signes",
       "any": [
        "Je suis stressé(e), anxieux(se) ou irritable",
        "Mon moral ou ma motivation sont en baisse"
       ]
      },
      {
       "q": "qn_psy",
       "any": [
        "Une tristesse ou une humeur basse",
        "Moins de plaisir dans ce que je fais"
       ]
      }
     ]
    }
   },
   {
    "t": "Les jambes peuvent ne pas tenir en place le soir.",
    "si": {
     "q": "qn_hv",
     "any": [
      "Des impatiences dans les jambes le soir ou la nuit"
     ]
    }
   },
   {
    "t": "La chute de cheveux est souvent le premier signe.",
    "si": {
     "or": [
      {
       "q": "qn_hv",
       "any": [
        "Des ongles cassants ou striés, des cheveux qui tombent"
       ]
      },
      {
       "q": "t_chev",
       "ge": 2
      }
     ]
    }
   }
  ],
  "anaD": [
   [
    "Ferritine (repère fonctionnel : au-dessus de 50 à 70 µg/L, et non 12)",
    "Elle reflète vos réserves en fer."
   ],
   [
    "CRP ultrasensible",
    "Elle vérifie s'il y a une inflammation, qui peut faire paraître la ferritine normale à tort."
   ],
   [
    "Coefficient de saturation de la transferrine (optimal : 30 à 35 %)",
    "Il montre le fer réellement disponible pour les organes, même quand la ferritine semble normale."
   ],
   [
    "Hepcidine, si le fer pris par la bouche n'a pas eu d'effet",
    "Elle aide à comprendre pourquoi le fer n'est pas absorbé, souvent à cause d'une inflammation."
   ]
  ],
  "nutD": [
   "Privilégier les sources de fer bien absorbé : viande rouge et boudin.",
   "Boire le thé et le café en dehors des repas, car ils freinent l'absorption du fer.",
   "Si vous êtes végétarien(ne), savoir que le fer des lentilles est bien moins absorbé que celui de la viande : à en parler avec votre pharmacienne.",
   "Chez la femme réglée, l'assiette seule couvre difficilement les apports en fer : un bilan permet de savoir où vous en êtes."
  ],
  "comp": [
   "Fer sous une forme bien tolérée, uniquement après une prise de sang, pris à distance du thé, du café, du calcium, du magnésium et du zinc",
   "À choisir avec votre pharmacienne, surtout si vous prenez des médicaments"
  ],
  "err": [
   "Prendre du fer sans prise de sang : le fer en excès est lui aussi nocif.",
   "Se rassurer parce qu'on n'est « pas anémié(e) » : la fatigue apparaît avant l'anémie.",
   "Se fier à une ferritine « normale » sans CRP ultrasensible ni saturation de la transferrine.",
   "Continuer le fer en comprimés quand il ne fait pas effet : une inflammation peut bloquer son absorption, à vérifier avec votre médecin.",
   "Penser qu'un fer bas est « normal pour une femme ».",
   "Prendre du fer quand on a une hémochromatose ou un fer trop élevé : c'est à proscrire sans avis médical."
  ],
  "medecin": "Je suis fatigué(e) depuis…, j'aimerais vérifier mes réserves en fer : ferritine, coefficient de saturation de la transferrine et CRP ultrasensible.",
  "src": [
   27,
   31,
   146,
   202,
   280,
   323,
   324,
   383,
   384,
   416,
   524,
   576,
   585,
   616,
   617,
   620,
   621,
   687,
   688,
   689,
   690,
   818,
   1612,
   1955,
   2037,
   2067,
   2068,
   2120,
   2124
  ],
  "si": {
   "anaD": [
    null,
    null,
    null,
    {
     "q": "k_fer",
     "any": [
      "Aucun effet sur ma fatigue"
     ]
    }
   ],
   "nutD": [
    {
     "non": {
      "q": "a_type",
      "any": [
       "Végétarienne : ni viande ni poisson",
       "Végétalienne : aucun produit animal"
      ]
     }
    },
    null,
    {
     "q": "a_type",
     "any": [
      "Végétarienne : ni viande ni poisson",
      "Végétalienne : aucun produit animal"
     ]
    },
    {
     "and": [
      {
       "sexe": "Femme"
      },
      {
       "q": "c_statut",
       "any": [
        "J'ai des règles régulières",
        "J'ai des règles irrégulières",
        "Mes cycles changent depuis quelques années (après 40 ans)"
       ]
      }
     ]
    }
   ],
   "comp": [
    {
     "non": {
      "q": "qn_atcd",
      "any": [
       "Hémochromatose, ou fer trop élevé"
      ]
     }
    },
    null
   ],
   "err": [
    null,
    null,
    null,
    {
     "q": "k_fer",
     "any": [
      "Aucun effet sur ma fatigue"
     ]
    },
    {
     "sexe": "Femme"
    },
    {
     "q": "qn_atcd",
     "any": [
      "Hémochromatose, ou fer trop élevé"
     ]
    }
   ]
  }
 },
 {
  "id": "b12",
  "fam": "Carences",
  "nom": "Vitamine B12, folates et méthylation",
  "piste": "un manque de vitamine B12 ou de folates, qui peut freiner la méthylation",
  "mec": [
   {
    "t": "La vitamine B12 et les folates (vitamine B9) font tourner la méthylation, une chaîne de réactions qui fabrique la mélatonine du sommeil, les messagers de l'humeur et des molécules d'énergie pour les muscles.",
    "si": null
   },
   {
    "t": "Les anti-reflux gênent l'absorption de la B12.",
    "si": {
     "q": "meds",
     "any": [
      "Contre le reflux : oméprazole, pantoprazole, ésoméprazole… (avec ou sans ordonnance)"
     ]
    }
   },
   {
    "t": "La metformine gêne l'absorption de la B12.",
    "si": {
     "q": "meds",
     "any": [
      "Metformine (traitement du diabète)"
     ]
    }
   },
   {
    "t": "Avec l'âge, la B12 est moins bien absorbée.",
    "si": {
     "age_ge": 65
    }
   },
   {
    "t": "La B12 ne se trouve que dans les produits animaux.",
    "si": null
   }
  ],
  "expl": [
   {
    "t": "Cela peut se traduire par des fourmillements dans les mains ou les pieds.",
    "si": {
     "or": [
      {
       "q": "qn_hv",
       "any": [
        "Des fourmillements ou des engourdissements dans les mains ou les pieds"
       ]
      },
      {
       "q": "dl_type",
       "any": [
        "Des fourmillements ou des picotements"
       ]
      },
      {
       "q": "t_carp",
       "ge": 2
      }
     ]
    }
   },
   {
    "t": "Des trous de mémoire peuvent apparaître.",
    "si": {
     "or": [
      {
       "q": "n_mem",
       "ge": 2
      },
      {
       "q": "qn_signes",
       "any": [
        "J'ai du mal à me concentrer ou à retenir les choses"
       ]
      }
     ]
    }
   },
   {
    "t": "La fatigue peut s'accompagner d'une faiblesse musculaire.",
    "si": {
     "or": [
      {
       "q": "ef_force",
       "ge": 2
      },
      {
       "q": "qn_signes",
       "any": [
        "Je récupère mal après un effort, ou mes muscles sont faibles"
       ]
      }
     ]
    }
   },
   {
    "t": "Le sommeil peut être moins bon.",
    "si": {
     "or": [
      {
       "q": "qn_signes",
       "any": [
        "Je dors mal, ou mon sommeil ne me repose pas"
       ]
      },
      {
       "q": "s_nonrep",
       "ge": 2
      },
      {
       "q": "s_endor",
       "ge": 2
      },
      {
       "q": "s_rev",
       "ge": 2
      }
     ]
    }
   },
   {
    "t": "Le stress est souvent moins bien supporté.",
    "si": {
     "or": [
      {
       "q": "qn_signes",
       "any": [
        "Je suis stressé(e), anxieux(se) ou irritable",
        "Mon moral ou ma motivation sont en baisse"
       ]
      },
      {
       "q": "n_vuln",
       "ge": 2
      },
      {
       "q": "st_niv",
       "ge": 6
      }
     ]
    }
   }
  ],
  "anaD": [
   [
    "Vitamine B12 active (holotranscobalamine)",
    "Elle mesure la B12 vraiment utilisable, plus fiable que la B12 sanguine totale."
   ],
   [
    "Homocystéine (valeur optimale : moins de 7 µmol/L)",
    "Elle montre si la méthylation fonctionne bien ; un taux élevé signale un manque de B12, de folates ou de B6."
   ],
   [
    "Folates érythrocytaires (vitamine B9)",
    "Ils reflètent vos réserves en folates."
   ],
   [
    "Vitamine B6",
    "Elle complète le bilan, surtout en cas d'anxiété associée à la fatigue."
   ]
  ],
  "nutD": [
   "Manger des légumes verts, des aliments complets et du jaune d'œuf, riches en folates.",
   "Limiter les aliments raffinés, qui ont perdu leurs folates.",
   "Garder des produits animaux (viande, œufs, produits laitiers), seules sources de B12.",
   "Cuire les légumes à la vapeur plutôt qu'à l'eau, et bien mâcher."
  ],
  "comp": [
   "Vitamine B12 sous forme libre (méthylcobalamine), par voie orale ou sublinguale",
   "Folates sous forme active (méthylfolate) plutôt que l'acide folique classique",
   "À choisir avec votre pharmacienne, surtout si vous prenez des médicaments"
  ],
  "err": [
   "Penser qu'on ne peut pas manquer de B12 parce qu'on mange de la viande.",
   "Se rassurer avec une B12 « normale » : elle ne dit pas tout, l'homocystéine et la B12 active complètent.",
   "Prendre de l'acide folique classique, que certaines personnes transforment mal en forme active.",
   "Prendre de la SAMe ou des compléments « méthyl » sans avis.",
   "Être végétalien(ne) sans apport de B12."
  ],
  "medecin": "Je suis fatigué(e) depuis…, j'ai des fourmillements et des trous de mémoire ; j'aimerais vérifier ma vitamine B12 active (holotranscobalamine), mes folates et mon homocystéine.",
  "src": [
   374,
   375,
   376,
   499,
   515,
   516,
   520,
   521,
   579,
   580,
   613,
   614,
   615,
   682,
   683,
   771,
   1005,
   1006,
   1011,
   1022,
   1542,
   1616,
   1660,
   1662,
   2659,
   2660
  ],
  "si": {
   "anaD": [
    null,
    null,
    null,
    null
   ],
   "nutD": [
    null,
    null,
    {
     "non": {
      "q": "a_type",
      "any": [
       "Végétalienne : aucun produit animal"
      ]
     }
    },
    null
   ],
   "comp": [
    null,
    null,
    null
   ],
   "err": [
    {
     "non": {
      "q": "a_type",
      "any": [
       "Végétarienne : ni viande ni poisson",
       "Végétalienne : aucun produit animal"
      ]
     }
    },
    null,
    null,
    null,
    {
     "q": "a_type",
     "any": [
      "Végétalienne : aucun produit animal"
     ]
    }
   ]
  }
 },
 {
  "id": "mg",
  "fam": "Carences",
  "nom": "Magnésium",
  "piste": "un manque de magnésium",
  "mec": [
   {
    "t": "Le magnésium permet aux cellules d'utiliser l'énergie (l'ATP), notamment dans les muscles.",
    "si": null
   },
   {
    "t": "Quand il manque, les nerfs deviennent plus excitables et réagissent au moindre stimulus.",
    "si": null
   },
   {
    "t": "Le corps ne le stocke pas et le stress le fait perdre dans les urines, ce qui entretient un cercle vicieux.",
    "si": null
   }
  ],
  "expl": [
   {
    "t": "La paupière saute toute seule.",
    "si": {
     "q": "qn_hv",
     "any": [
      "Une paupière qui saute toute seule"
     ]
    }
   },
   {
    "t": "Les crampes reviennent.",
    "si": {
     "or": [
      {
       "q": "qn_hv",
       "any": [
        "Des crampes la nuit, dans les mollets ou les pieds"
       ]
      },
      {
       "q": "ef_crampes",
       "ge": 2
      }
     ]
    }
   },
   {
    "t": "Le bruit et la lumière deviennent pénibles, on sursaute ou on tremble.",
    "si": {
     "q": "qn_hv",
     "any": [
      "Je supporte mal le bruit ou la lumière, je sursaute facilement"
     ]
    }
   },
   {
    "t": "Beaucoup décrivent une sensation d'être « électrique », toujours sous tension.",
    "si": null
   }
  ],
  "anaD": [
   [
    "Magnésium érythrocytaire (dans les globules rouges ; repère : plus de 2,0 mmol/L)",
    "Il reflète mieux vos réserves que le magnésium sanguin habituel, peu fiable ; les signes ressentis comptent aussi beaucoup."
   ]
  ],
  "nutD": [
   "Choisir des céréales complètes, de préférence bio (riz complet plutôt que riz blanc, par exemple) : l'enveloppe du grain apporte le magnésium. Si le bio n'est pas possible, mieux vaut la version blanche, car les pesticides s'y concentrent.",
   "Ne pas trop limiter les aliments riches en énergie, souvent riches en magnésium.",
   "Apporter du magnésium chaque jour, car le corps n'en garde pas en réserve."
  ],
  "comp": [
   "Magnésium sous une forme bien tolérée (par exemple citrate ou malate), en évitant le chlorure et le sulfate, laxatifs",
   "À choisir avec votre pharmacienne, surtout si vous prenez des médicaments"
  ],
  "err": [
   "Prendre du chlorure ou du sulfate de magnésium, qui donnent souvent la diarrhée.",
   "Croire que le magnésium donne de l'énergie à lui seul : il aide surtout à bien l'utiliser.",
   "Se rassurer avec un magnésium sanguin « normal », peu fiable.",
   "Sous anti-reflux depuis longtemps, le magnésium par la bouche peut rester sans effet : à en parler avec votre médecin.",
   "Prendre du magnésium sans avis en cas d'antécédent de calculs rénaux."
  ],
  "medecin": "Je suis fatigué(e) depuis…, ma paupière saute, j'ai des crampes et je supporte mal le bruit ; j'aimerais vérifier mon magnésium érythrocytaire.",
  "src": [
   0,
   192,
   317,
   379,
   380,
   382,
   507,
   532,
   693,
   694,
   766,
   768,
   1504,
   2023,
   2591,
   2684
  ],
  "si": {
   "anaD": [
    null
   ],
   "nutD": [
    null,
    null,
    null
   ],
   "comp": [
    null,
    null
   ],
   "err": [
    null,
    null,
    null,
    {
     "and": [
      {
       "q": "meds",
       "any": [
        "Contre le reflux : oméprazole, pantoprazole, ésoméprazole… (avec ou sans ordonnance)"
       ]
      },
      {
       "q": "m_ipp",
       "any": [
        "1 à 5 ans",
        "Plus de 5 ans"
       ]
      }
     ]
    },
    null
   ]
  }
 },
 {
  "id": "vitd",
  "fam": "Carences",
  "nom": "Vitamine D",
  "piste": "un niveau de vitamine D possiblement trop bas",
  "mec": [
   {
    "t": "La vitamine D ne sert pas qu'aux os : elle soutient les muscles et entretient les mitochondries, les petites centrales qui fabriquent l'énergie de vos cellules.",
    "si": null
   },
   {
    "t": "Quand elle manque, les muscles perdent en force et l'énergie baisse.",
    "si": null
   },
   {
    "t": "Elle n'agit pas seule : elle dépend aussi du fer et de la vitamine A.",
    "si": null
   }
  ],
  "expl": [
   {
    "t": "Vous pouvez avoir du mal à vous relever d'une chaise ou à marcher aussi loin qu'avant, avec des douleurs dans les muscles, les os ou le dos.",
    "si": null
   },
   {
    "t": "La fatigue peut être plus marquée en hiver.",
    "si": {
     "q": "t_hiver",
     "ge": 2
    }
   },
   {
    "t": "Le sommeil peut aussi être moins bon.",
    "si": {
     "or": [
      {
       "q": "qn_signes",
       "any": [
        "Je dors mal, ou mon sommeil ne me repose pas"
       ]
      },
      {
       "q": "s_nonrep",
       "ge": 3
      }
     ]
    }
   }
  ],
  "anaD": [
   [
    "25-OH vitamine D (25(OH)D)",
    "Mesure vos réserves de vitamine D ; la norme du laboratoire (30 ng/mL) est fixée sur un critère osseux, et en micronutrition on vise plutôt 60 à 100 ng/mL."
   ],
   [
    "Ferritine (réserves en fer)",
    "Vérifie le fer : sans fer, la vitamine D peut être mal activée, même avec un taux « normal »."
   ],
   [
    "Vitamine A (rétinol)",
    "Vérifie que la vitamine D peut agir : sans vitamine A, elle reste sans effet dans les cellules, même avec un taux sanguin parfait."
   ]
  ],
  "nutD": [
   "Ne comptez pas sur le soleil seul : en France, on n'en fabrique pas assez, même l'été, et pas du tout de novembre à mars dans le nord.",
   "Mettez du poisson au menu : ne pas manger de poisson fait partie, avec le manque de soleil, des contextes associés à une vitamine D basse.",
   "Gardez des aliments riches en calcium dans votre assiette (légumes à feuilles vertes, sardines avec leurs arêtes, amandes) : le calcium se surveille avec la vitamine D."
  ],
  "comp": [
   "Vitamine D, sous une forme adaptée à votre tolérance (il existe aussi une forme qui passe par la peau)",
   "Vitamine A, partenaire indispensable de la vitamine D, si le bilan le montre utile",
   "À choisir avec votre pharmacienne, surtout si vous prenez des médicaments"
  ],
  "err": [
   "Se fier à un résultat « normal » : la norme du laboratoire est pensée pour les os, pas pour l'énergie ni l'immunité.",
   "Prendre de la vitamine D sans vérifier le fer et la vitamine A : elle peut alors rester sans effet.",
   "Prendre de la vitamine D alors que les selles collent ou que la vésicule a été retirée : si les graisses sont mal digérées, elle est mal absorbée.",
   "Sous statine, ne pas faire vérifier sa vitamine D : ce médicament réduit la matière première qui sert à la fabriquer. Ne l'arrêtez pas pour autant : à en parler avec votre médecin."
  ],
  "medecin": "Je suis fatigué(e), j'ai des douleurs musculaires et je m'expose peu au soleil ; j'aimerais vérifier ma vitamine D (25-OH vitamine D), avec ma ferritine.",
  "src": [
   30,
   367,
   484,
   485,
   582,
   623,
   668,
   669,
   760,
   761,
   841,
   842,
   843,
   1023,
   1652,
   1889,
   2017,
   2307,
   2308,
   2735,
   2736
  ],
  "si": {
   "anaD": [
    null,
    null,
    null
   ],
   "nutD": [
    null,
    {
     "and": [
      {
       "q": "a_pg",
       "any": [
        "1 fois par semaine",
        "Rarement ou jamais"
       ]
      },
      {
       "non": {
        "q": "a_type",
        "any": [
         "Végétarienne : ni viande ni poisson",
         "Végétalienne : aucun produit animal"
        ]
       }
      }
     ]
    },
    null
   ],
   "comp": [
    null,
    null,
    null
   ],
   "err": [
    null,
    null,
    {
     "or": [
      {
       "q": "d_selles",
       "any": [
        "Grasses, brillantes ou luisantes",
        "Collantes à la cuvette"
       ]
      },
      {
       "q": "chir",
       "any": [
        "Ablation de la vésicule biliaire"
       ]
      }
     ]
    },
    {
     "q": "meds",
     "any": [
      "Contre le cholestérol : une statine (atorvastatine, rosuvastatine, simvastatine…)"
     ]
    }
   ]
  }
 },
 {
  "id": "omega3",
  "fam": "Carences",
  "nom": "Oméga-3",
  "piste": "des apports en oméga-3 à longue chaîne (EPA et DHA) possiblement trop faibles",
  "mec": [
   {
    "t": "Les oméga-3 à longue chaîne (EPA et surtout DHA) gardent souples les membranes de vos cellules, et la membrane des mitochondries, qui produisent l'énergie, en est très riche.",
    "si": null
   },
   {
    "t": "Quand ils manquent, les membranes se rigidifient : les cellules répondent moins bien aux hormones et aux messages nerveux, et l'énergie produite baisse.",
    "si": null
   }
  ],
  "expl": [
   {
    "t": "Vous pouvez avoir le moral plus bas ou vous sentir plus anxieux(se).",
    "si": {
     "or": [
      {
       "q": "qn_psy",
       "any": [
        "Une tristesse ou une humeur basse",
        "Moins de plaisir dans ce que je fais"
       ]
      },
      {
       "q": "qn_signes",
       "any": [
        "Je suis stressé(e), anxieux(se) ou irritable",
        "Mon moral ou ma motivation sont en baisse"
       ]
      },
      {
       "q": "n_angoisse",
       "ge": 3
      }
     ]
    }
   },
   {
    "t": "Vous pouvez aussi récupérer moins bien après un effort, ou voir votre vue baisser.",
    "si": null
   }
  ],
  "anaD": [
   [
    "Profil des acides gras des globules rouges (érythrocytaires)",
    "Montre les oméga-3 réellement présents dans vos membranes ; il reflète votre alimentation des 3 derniers mois, pas le repas de la veille."
   ],
   [
    "Index oméga-3 (EPA + DHA des globules rouges)",
    "Résume votre statut en oméga-3 ; le repère optimal se situe au-dessus de 8 %."
   ],
   [
    "Rapport oméga-6 / oméga-3 (AA/EPA)",
    "Mesure l'équilibre entre les deux familles ; le repère va de 1 à 5, alors qu'il est souvent de 15 à 50 en Occident."
   ]
  ],
  "nutD": [
   "Mangez du poisson gras environ 3 fois par semaine (portions de 200 g), en privilégiant les petits poissons gras.",
   "Ne comptez pas seulement sur les huiles végétales (colza, lin, noix) : beaucoup de personnes les transforment mal en EPA et DHA, et encore moins avec l'âge.",
   "Limitez la margarine et les huiles de tournesol ou d'arachide, très riches en oméga-6.",
   "Réduisez frites, pâtisseries et confiseries, et ne réutilisez pas l'huile de friture : ce sont des sources de graisses trans.",
   "Gardez vos huiles riches en oméga-3 à l'abri de la lumière, de l'air et au frais."
  ],
  "comp": [
   "Oméga-3 à longue chaîne (EPA et DHA), de type huile de poisson",
   "Si vous prenez une statine et avez des douleurs musculaires : oméga-3 associés au coenzyme Q10",
   "À choisir avec votre pharmacienne, surtout si vous prenez des médicaments"
  ],
  "err": [
   "Prendre des oméga-3 alors que les selles collent ou que la vésicule a été retirée : si les graisses sont mal digérées, ils sont mal absorbés.",
   "Supprimer les graisses de son alimentation : les personnes qui en ont peur ont souvent les oméga-3 les plus bas.",
   "Éviter le poisson gras par peur de grossir : il aide plutôt à maigrir.",
   "Négliger le stress : il freine la fabrication des oméga-3 actifs et peut réduire la bile qui sert à les digérer.",
   "Attendre un effet rapide : rééquilibrer le rapport entre oméga-6 et oméga-3 demande plusieurs mois."
  ],
  "medecin": "Je suis fatigué(e) et je mange peu de petits poissons gras ; j'aimerais faire un profil des acides gras des globules rouges (index oméga-3).",
  "src": [
   15,
   140,
   194,
   605,
   644,
   645,
   674,
   864,
   886,
   920,
   923,
   926,
   928,
   929,
   940,
   941,
   948,
   949,
   950,
   952,
   1496,
   1499,
   1500,
   1508,
   1511,
   1514,
   1516,
   1517,
   1519,
   1627,
   1654,
   1959,
   1984,
   2033,
   2064,
   2713,
   2714,
   2715
  ],
  "si": {
   "anaD": [
    null,
    null,
    null
   ],
   "nutD": [
    {
     "non": {
      "q": "a_type",
      "any": [
       "Végétarienne : ni viande ni poisson",
       "Végétalienne : aucun produit animal"
      ]
     }
    },
    null,
    null,
    null,
    null
   ],
   "comp": [
    null,
    {
     "and": [
      {
       "q": "meds",
       "any": [
        "Contre le cholestérol : une statine (atorvastatine, rosuvastatine, simvastatine…)"
       ]
      },
      {
       "or": [
        {
         "q": "m_stat_eff",
         "any": [
          "Des douleurs, des crampes ou une faiblesse dans les muscles"
         ]
        },
        {
         "q": "dl_ou",
         "any": [
          "Dans les muscles, un peu partout"
         ]
        },
        {
         "q": "ef_crampes",
         "ge": 2
        }
       ]
      }
     ]
    },
    null
   ],
   "err": [
    {
     "or": [
      {
       "q": "d_selles",
       "any": [
        "Grasses, brillantes ou luisantes",
        "Collantes à la cuvette"
       ]
      },
      {
       "q": "chir",
       "any": [
        "Ablation de la vésicule biliaire"
       ]
      }
     ]
    },
    null,
    null,
    null,
    null
   ]
  }
 },
 {
  "id": "thyro",
  "fam": "Hormones et stress",
  "nom": "Thyroïde au ralenti",
  "piste": "une thyroïde qui tourne au ralenti",
  "mec": [
   {
    "t": "Les hormones thyroïdiennes règlent l'activité des mitochondries, qui produisent l'énergie et la chaleur de votre corps.",
    "si": null
   },
   {
    "t": "Quand la forme active (la T3) manque, tout ralentit : moins d'énergie, moins de chaleur, un transit plus lent.",
    "si": null
   },
   {
    "t": "Ce manque peut exister même avec une TSH normale, par exemple quand la T4 est mal transformée en T3.",
    "si": null
   }
  ],
  "expl": [
   {
    "t": "Vous pouvez être surtout fatigué(e) le matin.",
    "si": {
     "or": [
      {
       "q": "f_moment",
       "any": [
        "Dès le réveil : j'ai du mal à démarrer le matin"
       ]
      },
      {
       "q": "f_matin",
       "any": [
        "Il me faut 1 à 2 heures pour démarrer"
       ]
      }
     ]
    }
   },
   {
    "t": "Vous pouvez avoir froid quand les autres n'ont pas froid.",
    "si": {
     "q": "t_froid",
     "ge": 2
    }
   },
   {
    "t": "Vous pouvez être constipé(e).",
    "si": {
     "or": [
      {
       "q": "t_const",
       "ge": 2
      },
      {
       "q": "d_quoi",
       "any": [
        "Constipation"
       ]
      }
     ]
    }
   },
   {
    "t": "Vous pouvez avoir la peau sèche.",
    "si": {
     "or": [
      {
       "q": "t_peau",
       "ge": 2
      },
      {
       "q": "qn_hv",
       "any": [
        "Une peau sèche, des yeux secs"
       ]
      }
     ]
    }
   },
   {
    "t": "Vous pouvez avoir du mal à perdre du poids.",
    "si": {
     "q": "t_poids",
     "any": [
      "Oui"
     ]
    }
   },
   {
    "t": "Des yeux gonflés au réveil, la queue des sourcils qui se dégarnit ou des paumes orangées font aussi partie des signes décrits.",
    "si": null
   }
  ],
  "anaD": [
   [
    "TSH",
    "Le signal envoyé par le cerveau à la thyroïde ; seule, elle ne suffit pas, et en micronutrition on vise plutôt 1 à 2 mUI/L."
   ],
   [
    "T4 libre (T4L)",
    "Mesure la forme de réserve de l'hormone thyroïdienne."
   ],
   [
    "T3 libre (T3L)",
    "Mesure la forme active : elle peut être basse alors que la TSH est normale."
   ],
   [
    "Anticorps anti-TPO et anti-thyroglobuline",
    "Recherchent une thyroïde attaquée par le système immunitaire (Hashimoto), parfois avant même qu'elle ralentisse."
   ],
   [
    "T3 reverse (rT3)",
    "Repère le « mode économie » (stress, régimes, infections), quand la T4 est transformée en une forme inactive."
   ],
   [
    "Iode urinaire (iodurie)",
    "Vérifie vos apports en iode, souvent un peu bas en France ; repère : au moins 100 µg/L (10 µg/100 mL), le seuil de l'OMS."
   ],
   [
    "Sélénium",
    "Vérifie un minéral utile à la transformation de la T4 en T3 ; repère optimal : 100 à 120 µg/L."
   ]
  ],
  "nutD": [
   "Prenez un premier repas dans la demi-heure qui suit le réveil, avec des protéines animales, plutôt que de sauter le petit-déjeuner.",
   "Utilisez du sel iodé et mangez des produits de la mer, surtout si vous vivez loin de la mer.",
   "Si vous êtes végétarien(ne), soyez attentif(ve) au sélénium, peu présent dans les végétaux.",
   "Soja : pas plus de 1 à 2 portions par jour ; choux et brocolis plutôt cuits et en quantité modérée, sans grands jus de légumes crus.",
   "Évitez les régimes très restrictifs : manger trop peu met le corps en mode économie et freine la T3."
  ],
  "comp": [
   "Sélénium, après vérification par une prise de sang",
   "Zinc et fer, si le bilan montre un manque",
   "Iode, seulement après avis et jamais en grande quantité, surtout en cas de thyroïde auto-immune",
   "À choisir avec votre pharmacienne, surtout si vous prenez des médicaments"
  ],
  "err": [
   "Se contenter de la TSH seule : elle peut être normale alors que la T3 active est basse.",
   "Prendre un complément cheveux et ongles à la biotine sans le signaler avant la prise de sang : il fausse les résultats.",
   "Prendre beaucoup d'iode ou d'algues de sa propre initiative : l'excès peut aussi freiner la thyroïde.",
   "Sous lévothyroxine, penser que la fatigue qui persiste est « normale » : la T4 peut être mal transformée en T3. Ne modifiez pas votre traitement de la thyroïde vous-même : à en parler avec votre médecin.",
   "Oublier le stress : quand il dure, il freine la production de T3 active."
  ],
  "medecin": "Je suis fatigué(e) surtout le matin, frileux(se) et constipé(e) ; j'aimerais un bilan thyroïdien complet, pas la TSH seule : TSH, T4 libre, T3 libre et anticorps anti-TPO et anti-thyroglobuline.",
  "src": [
   12,
   208,
   209,
   210,
   218,
   240,
   255,
   277,
   354,
   369,
   581,
   624,
   626,
   627,
   746,
   834,
   889,
   905,
   992,
   1053,
   1605,
   2069,
   2070,
   2071,
   2098,
   2728,
   2729,
   2730,
   2731,
   2732,
   2733,
   2734
  ],
  "si": {
   "anaD": [
    null,
    null,
    null,
    null,
    null,
    null,
    null
   ],
   "nutD": [
    {
     "non": {
      "q": "gl_pdj",
      "any": [
       "Salé, avec des protéines (œufs, jambon, fromage…)"
      ]
     }
    },
    {
     "q": "t_iode",
     "any": [
      "Rarement",
      "Jamais"
     ]
    },
    {
     "q": "a_type",
     "any": [
      "Végétarienne : ni viande ni poisson",
      "Végétalienne : aucun produit animal"
     ]
    },
    null,
    {
     "or": [
      {
       "q": "a_type",
       "any": [
        "Je fais des régimes à répétition, avec reprise de poids",
        "Cétogène, ou très pauvre en glucides",
        "Je saute souvent des repas, ou je pratique le jeûne intermittent"
       ]
      },
      {
       "q": "f_debut",
       "any": [
        "Un régime ou une perte de poids rapide"
       ]
      },
      {
       "q": "t_poids",
       "any": [
        "Oui"
       ]
      }
     ]
    }
   ],
   "comp": [
    null,
    null,
    null,
    null
   ],
   "err": [
    null,
    {
     "or": [
      {
       "q": "compl",
       "any": [
        "Biotine, ou complément pour les cheveux et les ongles"
       ]
      },
      {
       "q": "t_chev",
       "ge": 3
      },
      {
       "q": "qn_hv",
       "any": [
        "Des ongles cassants ou striés, des cheveux qui tombent"
       ]
      }
     ]
    },
    null,
    {
     "q": "meds",
     "any": [
      "Traitement de la thyroïde (lévothyroxine, Cynomel…)"
     ]
    },
    null
   ]
  }
 },
 {
  "id": "cortisol",
  "fam": "Hormones et stress",
  "nom": "Stress chronique et cortisol",
  "piste": "un stress qui dure et qui a pu dérégler le rythme de votre cortisol",
  "mec": [
   {
    "t": "Le cortisol est l'hormone qui vous aide à vous adapter.",
    "si": null
   },
   {
    "t": "Normalement, il monte fort dans la demi-heure qui suit le réveil, puis redescend au fil de la journée.",
    "si": null
   },
   {
    "t": "Quand le stress dure, ce rythme se dérègle : cortisol trop haut le soir, ou trop bas le matin quand les surrénales s'épuisent, avec une DHEA qui baisse.",
    "si": null
   }
  ],
  "expl": [
   {
    "t": "Vous pouvez avoir du mal à démarrer le matin.",
    "si": {
     "or": [
      {
       "q": "f_matin",
       "any": [
        "Il me faut 1 à 2 heures pour démarrer"
       ]
      },
      {
       "q": "f_moment",
       "any": [
        "Dès le réveil : j'ai du mal à démarrer le matin"
       ]
      }
     ]
    }
   },
   {
    "t": "Vous pouvez être à plat toute la journée puis plus éveillé(e) le soir.",
    "si": {
     "q": "f_moment",
     "any": [
      "Je suis à plat toute la journée, puis j'ai un regain d'énergie le soir"
     ]
    }
   },
   {
    "t": "Vos nuits peuvent être peu réparatrices.",
    "si": {
     "or": [
      {
       "q": "s_nonrep",
       "ge": 2
      },
      {
       "q": "qn_signes",
       "any": [
        "Je dors mal, ou mon sommeil ne me repose pas"
       ]
      },
      {
       "q": "s_endor",
       "ge": 3
      }
     ]
    }
   },
   {
    "t": "Beaucoup se sentent « épuisés mais nerveux » et mettent des jours à se remettre d'un simple week-end.",
    "si": null
   },
   {
    "t": "Beaucoup ont aussi envie de salé ou des vertiges en se levant.",
    "si": {
     "q": "qn_hv",
     "any": [
      "Des envies de salé",
      "Des vertiges ou un voile noir quand je me lève vite"
     ]
    }
   }
  ],
  "anaD": [
   [
    "Cycle du cortisol salivaire (5 prélèvements : réveil, réveil + 30 min, midi, 18 h, 21-22 h)",
    "Dessine la courbe de votre cortisol sur la journée : un pic du réveil aplati ou une courbe plate traduit un épuisement."
   ],
   [
    "DHEA (DHEA-S)",
    "Mesure l'hormone qui fait contrepoids au cortisol ; repère : 130 à 280 µg/dL chez la femme, 180 à 450 µg/dL chez l'homme."
   ],
   [
    "Rapport cortisol / DHEA-S",
    "Aide à distinguer la phase où l'on tient « sous pression » de la phase d'épuisement."
   ],
   [
    "Cortisol sanguin, si le cortisol salivaire est effondré",
    "Permet au médecin d'écarter une insuffisance des surrénales avant toute autre démarche."
   ]
  ],
  "nutD": [
   "Mangez le matin : sauter le petit-déjeuner, au moment du pic de cortisol, fait encore monter adrénaline et cortisol.",
   "Ne sautez pas le petit-déjeuner quand vous êtes stressé(e) : prenez un premier repas avec des protéines dans la demi-heure qui suit le réveil.",
   "Prenez vos repas au calme : en mode stress, la digestion est freinée.",
   "Évitez un repas riche en protéines juste après un stress ou une colère : laissez d'abord retomber la tension.",
   "Si vous souhaitez jeûner, sautez plutôt le dîner que le petit-déjeuner."
  ],
  "comp": [
   "Plantes adaptogènes (rhodiola, ashwagandha), en sachant que l'ashwagandha est à éviter en plein burn-out",
   "Vitamine C",
   "À choisir avec votre pharmacienne, surtout si vous prenez des médicaments"
  ],
  "err": [
   "Se rassurer avec un cortisol sanguin de 8 h normal : il ne dit rien d'un rythme déréglé par le stress.",
   "Prendre de l'ashwagandha en plein burn-out : cela peut précipiter la chute.",
   "Ne penser qu'au stress du travail : un déménagement, un mariage, la retraite, la chaleur, le froid, le manque de sommeil ou le surentraînement comptent aussi.",
   "Ignorer les premiers signaux : quand même un week-end agréable vous épuise, ou que vous ne tenez plus « qu'à l'adrénaline », c'est un signal d'alarme.",
   "Faire du sport intense le soir quand on dort mal : cela garde le cortisol haut et retarde l'endormissement.",
   "Prendre de l'ashwagandha avec une thyroïde auto-immune (Hashimoto) mal équilibrée."
  ],
  "medecin": "Je suis épuisé(e) mais à cran, je n'arrive pas à démarrer le matin et je récupère mal ; j'aimerais faire un cycle du cortisol salivaire sur la journée, avec la DHEA.",
  "src": [
   286,
   335,
   361,
   362,
   363,
   628,
   630,
   635,
   798,
   899,
   1065,
   1067,
   1069,
   1618,
   1656,
   1741,
   2090,
   2540,
   2661,
   2662,
   2663,
   2664,
   2665,
   2666
  ],
  "si": {
   "anaD": [
    null,
    null,
    null,
    null
   ],
   "nutD": [
    {
     "or": [
      {
       "q": "gl_pdj",
       "any": [
        "Un café seul, ou rien du tout",
        "C'est variable"
       ]
      },
      {
       "q": "a_type",
       "any": [
        "Je saute souvent des repas, ou je pratique le jeûne intermittent"
       ]
      }
     ]
    },
    {
     "or": [
      {
       "q": "gl_saut",
       "ge": 2
      },
      {
       "q": "v_malaise",
       "any": [
        "Souvent",
        "Parfois"
       ]
      }
     ]
    },
    null,
    null,
    {
     "or": [
      {
       "q": "a_type",
       "any": [
        "Je saute souvent des repas, ou je pratique le jeûne intermittent"
       ]
      },
      {
       "q": "gl_pdj",
       "any": [
        "Un café seul, ou rien du tout"
       ]
      }
     ]
    }
   ],
   "comp": [
    null,
    null,
    null
   ],
   "err": [
    null,
    {
     "q": "st_burn",
     "any": [
      "Oui, et j'ai retrouvé mon énergie",
      "Oui, et je n'ai jamais retrouvé mon énergie",
      "Je pense en traverser un en ce moment"
     ]
    },
    null,
    null,
    {
     "q": "v_soir",
     "any": [
      "Souvent",
      "Parfois"
     ]
    },
    {
     "q": "qn_atcd",
     "any": [
      "Hypothyroïdie ou maladie de Hashimoto"
     ]
    }
   ]
  }
 },
 {
  "id": "neuro",
  "fam": "Hormones et stress",
  "nom": "Moral, motivation et neuromédiateurs",
  "piste": "un déséquilibre des messagers du cerveau qui règlent l'élan, le moral et le calme (dopamine, noradrénaline, sérotonine)",
  "mec": [
   {
    "t": "La dopamine et la noradrénaline donnent l'envie, l'élan pour démarrer et la capacité à tenir dans la durée ; la sérotonine apaise et sert à fabriquer la mélatonine, l'hormone de l'endormissement.",
    "si": null
   },
   {
    "t": "Ces messagers sont fabriqués à partir des protéines du repas, avec l'aide du fer, du magnésium et des vitamines B.",
    "si": null
   },
   {
    "t": "Un stress qui dure ou une inflammation peuvent détourner leurs matières premières, ce qui peut contribuer à la fatigue et au moral en berne.",
    "si": null
   }
  ],
  "expl": [
   {
    "t": "Vous pouvez avoir du mal à vous lancer ou à finir ce que vous commencez.",
    "si": null
   },
   {
    "t": "Vous pouvez aussi vous énerver pour un rien.",
    "si": {
     "q": "n_irrit",
     "ge": 2
    }
   },
   {
    "t": "Vous pouvez craquer pour du sucré vers 17 h : le sucré joue alors souvent le rôle d'un « câlin » qui réconforte.",
    "si": {
     "or": [
      {
       "q": "gl_sucre",
       "any": [
        "Surtout en fin d'après-midi ou le soir",
        "À n'importe quel moment, sans horaire"
       ]
      },
      {
       "q": "f_moment",
       "any": [
        "En fin d'après-midi, vers 15-17 h"
       ]
      },
      {
       "q": "qn_signes",
       "any": [
        "J'ai des coups de barre dans la journée",
        "J'ai des envies de sucré ou des fringales"
       ]
      }
     ]
    }
   },
   {
    "t": "Vous pouvez aussi peiner à vous endormir.",
    "si": {
     "q": "s_endor",
     "ge": 2
    }
   }
  ],
  "anaD": [
   [
    "Cortisol salivaire sur la journée",
    "Il aide à distinguer un épuisement de type burn-out d'un moral bas d'une autre nature, car le cortisol n'y est pas au même niveau."
   ],
   [
    "Fer, vitamine B12, magnésium, zinc, vitamine D et oméga-3",
    "Ces éléments servent à fabriquer les messagers du cerveau : un manque de l'un d'eux peut freiner leur production."
   ],
   [
    "Analyse du microbiote intestinal, si le ventre est aussi en cause",
    "Elle peut montrer des bactéries liées au moral (comme les Alistipes) ou un manque de bactéries protectrices qui produisent du butyrate."
   ]
  ],
  "nutD": [
   "Un petit-déjeuner avec des protéines (œufs, poisson, légumineuses) : il apporte la tyrosine, matière première de la dopamine, pour l'énergie et la motivation.",
   "Des aliments sources de tryptophane chaque jour (viande, volaille, poisson, produits laitiers, noix de cajou) : il sert à fabriquer la sérotonine, et la vitamine B3 aide à éviter qu'il soit détourné vers d'autres usages.",
   "Du poisson gras régulièrement, pour les oméga-3 à longue chaîne (EPA) utiles au moral.",
   "Comptez le pain et les féculents du soir comme du sucre : une envie de pain équivaut souvent à une envie de sucré.",
   "Mangez lentement en mâchant bien : un lien entre mastication et moral est décrit.",
   "Si votre moral baisse en hiver : prenez la lumière du jour le matin ; la luminothérapie (10 000 lux, 20 à 30 minutes dans la demi-heure qui suit le réveil) est reconnue pour la déprime saisonnière."
  ],
  "comp": [
   "Vitamines du groupe B, dont la B6 (indispensable à la fabrication du GABA, le messager du calme) et la B3",
   "Magnésium",
   "Oméga-3 à longue chaîne (EPA)",
   "Précurseurs des messagers (tyrosine le matin ; 5-HTP plutôt que tryptophane), seulement si aucune inflammation ou stress intense n'est en jeu",
   "Probiotiques à base de bifidobactéries et de lactobacilles",
   "À choisir avec votre pharmacienne, surtout si vous prenez des médicaments"
  ],
  "err": [
   "Prendre du tryptophane ou du 5-HTP seul en période de stress ou d'inflammation : il reste sans effet tant que l'inflammation n'est pas calmée.",
   "Sauter le petit-déjeuner ou le prendre sans protéines : la fenêtre du matin pour fabriquer dopamine et sérotonine est manquée, et les compulsions arrivent le soir.",
   "Se croire à l'abri parce qu'on n'aime pas le sucré alors qu'on mange beaucoup de pain : le pain, c'est du sucre.",
   "Voir l'envie de sucre de 17 h comme un simple manque de volonté : elle peut venir d'un manque de sérotonine ou d'une chute de sucre liée au stress.",
   "Laisser durer plus de deux semaines une tristesse ou une perte de plaisir sans en parler à son médecin."
  ],
  "medecin": "Je suis fatigué(e), j'ai du mal à me motiver, je craque sur le sucré en fin de journée et je m'endors difficilement ; j'aimerais en parler avec vous et vérifier mes réserves (fer, vitamine B12, vitamine D, magnésium) et, si c'est utile, mon cortisol salivaire.",
  "src": [
   326,
   331,
   336,
   337,
   341,
   366,
   390,
   395,
   633,
   708,
   714,
   716,
   799,
   900,
   907,
   1064,
   1643,
   1667,
   2015,
   2550,
   2703,
   2704,
   2705,
   2706,
   2707,
   2708,
   2709,
   2710,
   2711,
   2712
  ],
  "si": {
   "anaD": [
    {
     "or": [
      {
       "q": "qn_psy",
       "any": [
        "Une tristesse ou une humeur basse",
        "Moins de plaisir dans ce que je fais"
       ]
      },
      {
       "q": "st_burn",
       "any": [
        "Oui, et je n'ai jamais retrouvé mon énergie",
        "Je pense en traverser un en ce moment"
       ]
      },
      {
       "q": "qn_signes",
       "any": [
        "Je suis stressé(e), anxieux(se) ou irritable",
        "Mon moral ou ma motivation sont en baisse"
       ]
      },
      {
       "q": "st_niv",
       "ge": 6
      }
     ]
    },
    null,
    {
     "or": [
      {
       "q": "qn_signes",
       "any": [
        "J'ai des troubles digestifs (ballonnements, transit, reflux)"
       ]
      },
      {
       "q": "d_quoi",
       "anyBut": [
        "Je ne sais pas"
       ]
      }
     ]
    }
   ],
   "nutD": [
    {
     "non": {
      "q": "gl_pdj",
      "any": [
       "Salé, avec des protéines (œufs, jambon, fromage…)"
      ]
     }
    },
    {
     "non": {
      "q": "a_type",
      "any": [
       "Végétalienne : aucun produit animal"
      ]
     }
    },
    {
     "non": {
      "q": "a_type",
      "any": [
       "Végétarienne : ni viande ni poisson",
       "Végétalienne : aucun produit animal"
      ]
     }
    },
    null,
    null,
    {
     "or": [
      {
       "q": "qn_psy",
       "any": [
        "Mon moral baisse en automne et en hiver, quand les jours raccourcissent"
       ]
      },
      {
       "q": "t_hiver",
       "ge": 3
      }
     ]
    }
   ],
   "comp": [
    null,
    null,
    null,
    {
     "and": [
      {
       "non": {
        "q": "meds",
        "any": [
         "Antidépresseur",
         "Antidépresseur tricyclique (amitriptyline, clomipramine…)",
         "Lithium, antiépileptique ou neuroleptique"
        ]
       }
      },
      {
       "non": {
        "q": "st_niv",
        "ge": 8
       }
      }
     ]
    },
    null,
    null
   ],
   "err": [
    null,
    {
     "non": {
      "q": "gl_pdj",
      "any": [
       "Salé, avec des protéines (œufs, jambon, fromage…)"
      ]
     }
    },
    {
     "q": "gl_pain",
     "any": [
      "Oui"
     ]
    },
    {
     "or": [
      {
       "q": "gl_sucre",
       "any": [
        "Surtout en fin d'après-midi ou le soir",
        "À n'importe quel moment, sans horaire"
       ]
      },
      {
       "q": "f_moment",
       "any": [
        "En fin d'après-midi, vers 15-17 h"
       ]
      },
      {
       "q": "qn_signes",
       "any": [
        "J'ai des coups de barre dans la journée",
        "J'ai des envies de sucré ou des fringales"
       ]
      }
     ]
    },
    null
   ]
  }
 },
 {
  "id": "hormones",
  "fam": "Hormones et stress",
  "nom": "Cycle, périménopause, andropause",
  "piste": "des variations hormonales (cycle, périménopause ou andropause) qui pèsent sur votre énergie",
  "mec": [
   {
    "t": "Les hormones sexuelles (progestérone, œstrogènes, testostérone) sont fabriquées à partir du cholestérol, dans les mitochondries, les petites centrales énergétiques des cellules.",
    "si": null
   },
   {
    "t": "Quand elles baissent ou se déséquilibrent, par exemple avec un stress qui dure, le sommeil, l'humeur, le muscle et l'énergie peuvent en pâtir.",
    "si": null
   },
   {
    "t": "Cela peut aussi arriver en fin de cycle.",
    "si": {
     "and": [
      {
       "sexe": "Femme"
      },
      {
       "q": "c_statut",
       "any": [
        "J'ai des règles régulières",
        "J'ai des règles irrégulières",
        "Mes cycles changent depuis quelques années (après 40 ans)"
       ]
      }
     ]
    }
   },
   {
    "t": "Cela peut aussi arriver à la périménopause.",
    "si": {
     "and": [
      {
       "sexe": "Femme"
      },
      {
       "or": [
        {
         "q": "c_statut",
         "any": [
          "Mes cycles changent depuis quelques années (après 40 ans)",
          "Je n'ai plus de règles : ménopause"
         ]
        },
        {
         "q": "f_debut",
         "any": [
          "L'approche de la ménopause, ou la ménopause"
         ]
        },
        {
         "q": "c_meno",
         "any": [
          "Des bouffées de chaleur sans transpiration",
          "Des bouffées de chaleur avec beaucoup de transpiration, des réveils la nuit draps trempés"
         ]
        }
       ]
      }
     ]
    }
   },
   {
    "t": "Chez l'homme, cela peut aussi arriver à l'andropause.",
    "si": {
     "sexe": "Homme"
    }
   },
   {
    "t": "La progestérone aide aussi la thyroïde à bien fonctionner.",
    "si": {
     "sexe": "Femme"
    }
   }
  ],
  "expl": [
   {
    "t": "Vous pouvez remarquer une fatigue et un sommeil moins bon.",
    "si": null
   },
   {
    "t": "Cela peut se produire dans les jours qui précèdent les règles, avec des envies de chocolat.",
    "si": {
     "and": [
      {
       "sexe": "Femme"
      },
      {
       "q": "c_statut",
       "any": [
        "J'ai des règles régulières",
        "J'ai des règles irrégulières",
        "Mes cycles changent depuis quelques années (après 40 ans)"
       ]
      }
     ]
    }
   },
   {
    "t": "Vos cycles peuvent changer après 40 ans.",
    "si": {
     "and": [
      {
       "sexe": "Femme"
      },
      {
       "age_ge": 40
      },
      {
       "q": "c_statut",
       "any": [
        "J'ai des règles régulières",
        "J'ai des règles irrégulières",
        "Mes cycles changent depuis quelques années (après 40 ans)"
       ]
      }
     ]
    }
   },
   {
    "t": "Des bouffées de chaleur peuvent apparaître.",
    "si": {
     "and": [
      {
       "sexe": "Femme"
      },
      {
       "or": [
        {
         "q": "c_statut",
         "any": [
          "Mes cycles changent depuis quelques années (après 40 ans)",
          "Je n'ai plus de règles : ménopause"
         ]
        },
        {
         "q": "f_debut",
         "any": [
          "L'approche de la ménopause, ou la ménopause"
         ]
        },
        {
         "q": "c_meno",
         "any": [
          "Des bouffées de chaleur sans transpiration",
          "Des bouffées de chaleur avec beaucoup de transpiration, des réveils la nuit draps trempés"
         ]
        }
       ]
      }
     ]
    }
   },
   {
    "t": "Chez l'homme, cela peut se traduire par une baisse du désir, des érections du matin plus rares et une perte de muscle.",
    "si": {
     "sexe": "Homme"
    }
   }
  ],
  "anaD": [
   [
    "Dosages hormonaux faits au bon jour du cycle",
    "Une prise de sang hormonale ne s'interprète qu'en sachant à quel moment du cycle elle a été faite : notez la date de vos dernières règles."
   ],
   [
    "Chez la femme : progestérone, estradiol, DHEA-S, testostérone, prégnénolone et cortisol",
    "Ils donnent une vue d'ensemble de la fabrication des hormones ; seule la biologie permet de confirmer un déséquilibre."
   ],
   [
    "Chez l'homme : testostérone totale avec SHBG (pour calculer la part libre), LH et FSH, estradiol ultrasensible, prolactine",
    "C'est la part libre de l'hormone qui agit : ces dosages précisent si la baisse du désir ou des érections a une origine hormonale."
   ],
   [
    "Cholestérol",
    "Un cholestérol trop bas peut freiner la fabrication des hormones et de la vitamine D."
   ],
   [
    "Glycémie et insuline à jeun, en cas de SOPK",
    "Le SOPK est très souvent lié à un excès d'insuline."
   ]
  ],
  "nutD": [
   "Ne fuyez pas les graisses : une alimentation trop pauvre en gras prive le corps de la matière première des hormones.",
   "Évitez les régimes très stricts et les pertes de poids importantes : sans réserve de gras, la leptine chute et les cycles peuvent s'arrêter.",
   "Pensez aux bons gras (oméga-3, poissons gras) : ils assouplissent les membranes et aident les ovaires à répondre aux hormones du cycle.",
   "Le soja (tofu, tempeh) peut adoucir la baisse hormonale de la ménopause, mais il est à limiter si l'on manque déjà d'œstrogènes : à ajuster avec votre pharmacienne.",
   "En cas de SOPK, limitez les sucres rapides, car l'excès d'insuline en est la cause principale."
  ],
  "comp": [
   "Acides gras GLA et DGLA (utiles dans le syndrome prémenstruel, la périménopause et la ménopause)",
   "Vitamines antioxydantes C et E, en cas de règles douloureuses ou d'endométriose",
   "PEA (palmitoyléthanolamide), pour les douleurs pelviennes",
   "Chrome, en cas de SOPK",
   "Oméga-3",
   "À choisir avec votre pharmacienne, surtout si vous prenez des médicaments"
  ],
  "err": [
   "Faire une prise de sang hormonale à n'importe quel jour du cycle : elle devient impossible à interpréter.",
   "Chez un homme qui a du ventre, prendre de la testostérone : la graisse du ventre la transforme en œstrogènes.",
   "Conclure à un SOPK chez une jeune fille réglée depuis moins de 2 à 3 ans : des cycles irréguliers sont normaux à cet âge.",
   "Attendre 50 ans pour s'intéresser à la ménopause : les premiers changements peuvent commencer dès 35 à 40 ans.",
   "Ne pas faire le lien avec un médicament contre le cholestérol (statine), qui peut réduire la fabrication des hormones : à en parler avec votre médecin, sans rien modifier de vous-même.",
   "Après l'arrêt de la pilule, attendre indéfiniment le retour des règles : au-delà de 6 mois sans règles, cela mérite d'être exploré."
  ],
  "medecin": "Je suis fatigué(e) et j'ai l'impression que c'est lié à mes hormones (cycle, périménopause ou andropause) ; j'aimerais vérifier mon bilan hormonal, fait au bon jour du cycle pour une femme, ou avec testostérone et SHBG pour un homme.",
  "src": [
   57,
   127,
   135,
   138,
   143,
   152,
   156,
   172,
   179,
   187,
   360,
   492,
   493,
   495,
   496,
   604,
   673,
   866,
   917,
   939,
   1886,
   1967,
   1968,
   2048,
   2077,
   2083,
   2085,
   2676,
   2677,
   2678,
   2679,
   2680
  ],
  "si": {
   "anaD": [
    {
     "and": [
      {
       "sexe": "Femme"
      },
      {
       "q": "c_statut",
       "any": [
        "J'ai des règles régulières",
        "J'ai des règles irrégulières",
        "Mes cycles changent depuis quelques années (après 40 ans)"
       ]
      }
     ]
    },
    {
     "sexe": "Femme"
    },
    {
     "sexe": "Homme"
    },
    null,
    {
     "q": "qn_atcd",
     "any": [
      "Ovaires polykystiques (SOPK)"
     ]
    }
   ],
   "nutD": [
    null,
    {
     "and": [
      {
       "sexe": "Femme"
      },
      {
       "non": {
        "q": "c_statut",
        "any": [
         "Je n'ai plus de règles : ménopause"
        ]
       }
      }
     ]
    },
    {
     "and": [
      {
       "sexe": "Femme"
      },
      {
       "non": {
        "q": "c_statut",
        "any": [
         "Je n'ai plus de règles : ménopause"
        ]
       }
      }
     ]
    },
    {
     "and": [
      {
       "sexe": "Femme"
      },
      {
       "or": [
        {
         "q": "c_statut",
         "any": [
          "Mes cycles changent depuis quelques années (après 40 ans)",
          "Je n'ai plus de règles : ménopause"
         ]
        },
        {
         "q": "f_debut",
         "any": [
          "L'approche de la ménopause, ou la ménopause"
         ]
        },
        {
         "q": "c_meno",
         "any": [
          "Des bouffées de chaleur sans transpiration",
          "Des bouffées de chaleur avec beaucoup de transpiration, des réveils la nuit draps trempés"
         ]
        }
       ]
      }
     ]
    },
    {
     "q": "qn_atcd",
     "any": [
      "Ovaires polykystiques (SOPK)"
     ]
    }
   ],
   "comp": [
    {
     "and": [
      {
       "sexe": "Femme"
      },
      {
       "or": [
        {
         "q": "c_moment",
         "anyBut": [
          "Pas de lien avec le cycle",
          "Je ne sais pas"
         ]
        },
        {
         "or": [
          {
           "q": "c_statut",
           "any": [
            "Mes cycles changent depuis quelques années (après 40 ans)",
            "Je n'ai plus de règles : ménopause"
           ]
          },
          {
           "q": "f_debut",
           "any": [
            "L'approche de la ménopause, ou la ménopause"
           ]
          },
          {
           "q": "c_meno",
           "any": [
            "Des bouffées de chaleur sans transpiration",
            "Des bouffées de chaleur avec beaucoup de transpiration, des réveils la nuit draps trempés"
           ]
          }
         ]
        },
        {
         "q": "c_meno",
         "anyBut": [
          "Rien de particulier",
          "Je ne sais pas"
         ]
        }
       ]
      }
     ]
    },
    {
     "or": [
      {
       "q": "c_pelv",
       "any": [
        "Des règles très douloureuses",
        "Une douleur qui augmente en fin de règles"
       ]
      },
      {
       "q": "qn_atcd",
       "any": [
        "Endométriose"
       ]
      }
     ]
    },
    {
     "or": [
      {
       "q": "c_pelv",
       "any": [
        "Des règles très douloureuses",
        "Une douleur qui augmente en fin de règles",
        "Des douleurs pendant les rapports",
        "Des douleurs du bas-ventre en dehors des règles"
       ]
      },
      {
       "q": "qn_atcd",
       "any": [
        "Endométriose"
       ]
      }
     ]
    },
    {
     "q": "qn_atcd",
     "any": [
      "Ovaires polykystiques (SOPK)"
     ]
    },
    null,
    null
   ],
   "err": [
    null,
    {
     "and": [
      {
       "sexe": "Homme"
      },
      {
       "or": [
        {
         "q": "gl_ventre",
         "any": [
          "Oui, nettement",
          "Un peu"
         ]
        },
        {
         "q": "h_sig",
         "any": [
          "Le ventre qui s'arrondit"
         ]
        }
       ]
      }
     ]
    },
    {
     "and": [
      {
       "sexe": "Femme"
      },
      {
       "age_lt": 20
      }
     ]
    },
    {
     "and": [
      {
       "sexe": "Femme"
      },
      {
       "age_ge": 35
      },
      {
       "age_lt": 50
      },
      {
       "non": {
        "q": "c_statut",
        "any": [
         "Je n'ai plus de règles : ménopause"
        ]
       }
      }
     ]
    },
    {
     "q": "meds",
     "any": [
      "Contre le cholestérol : une statine (atorvastatine, rosuvastatine, simvastatine…)"
     ]
    },
    {
     "and": [
      {
       "sexe": "Femme"
      },
      {
       "q": "c_statut",
       "any": [
        "Je n'ai pas de règles pour une autre raison (contraception, stérilet hormonal, autre)",
        "J'ai des règles irrégulières"
       ]
      },
      {
       "q": "c_contra",
       "any": [
        "Aucune contraception hormonale"
       ]
      }
     ]
    }
   ]
  },
  "sx": {
   "Homme": {
    "nom": "Hormones masculines (andropause)",
    "piste": "une baisse des hormones masculines (andropause) qui pèse sur votre énergie",
    "medecin": "Je suis fatigué et j'ai remarqué une baisse du désir ou des érections ; j'aimerais vérifier mon bilan hormonal (testostérone avec SHBG).",
    "anaD": [
     [
      "Chez l'homme : testostérone totale avec SHBG (pour calculer la part libre), LH et FSH, estradiol ultrasensible, prolactine",
      "C'est la part libre de l'hormone qui agit : ces dosages précisent si la baisse du désir ou des érections a une origine hormonale."
     ],
     [
      "Cholestérol",
      "Un cholestérol trop bas peut freiner la fabrication des hormones et de la vitamine D."
     ]
    ],
    "si": {
     "anaD": [
      {
       "sexe": "Homme"
      },
      null
     ],
     "nutD": [
      null
     ],
     "comp": [
      null,
      null
     ],
     "err": [
      {
       "and": [
        {
         "sexe": "Homme"
        },
        {
         "or": [
          {
           "q": "gl_ventre",
           "any": [
            "Oui, nettement",
            "Un peu"
           ]
          },
          {
           "q": "h_sig",
           "any": [
            "Le ventre qui s'arrondit"
           ]
          }
         ]
        }
       ]
      },
      {
       "q": "meds",
       "any": [
        "Contre le cholestérol : une statine (atorvastatine, rosuvastatine, simvastatine…)"
       ]
      }
     ]
    },
    "nutD": [
     "Ne fuyez pas les graisses : une alimentation trop pauvre en gras prive le corps de la matière première des hormones."
    ],
    "comp": [
     "Oméga-3",
     "À choisir avec votre pharmacienne, surtout si vous prenez des médicaments"
    ],
    "err": [
     "Chez un homme qui a du ventre, prendre de la testostérone : la graisse du ventre la transforme en œstrogènes.",
     "Ne pas faire le lien avec un médicament contre le cholestérol (statine), qui peut réduire la fabrication des hormones : à en parler avec votre médecin, sans rien modifier de vous-même."
    ]
   },
   "Femme": {
    "nom": "Cycle, périménopause et ménopause",
    "piste": "des variations hormonales (cycle, périménopause ou ménopause) qui pèsent sur votre énergie",
    "medecin": "Je suis fatiguée et j'ai l'impression que c'est lié à mes hormones (cycle, périménopause ou ménopause) ; j'aimerais vérifier mon bilan hormonal, fait au bon jour du cycle.",
    "anaD": [
     [
      "Dosages hormonaux faits au bon jour du cycle",
      "Une prise de sang hormonale ne s'interprète qu'en sachant à quel moment du cycle elle a été faite : notez la date de vos dernières règles."
     ],
     [
      "Chez la femme : progestérone, estradiol, DHEA-S, testostérone, prégnénolone et cortisol",
      "Ils donnent une vue d'ensemble de la fabrication des hormones ; seule la biologie permet de confirmer un déséquilibre."
     ],
     [
      "Cholestérol",
      "Un cholestérol trop bas peut freiner la fabrication des hormones et de la vitamine D."
     ],
     [
      "Glycémie et insuline à jeun, en cas de SOPK",
      "Le SOPK est très souvent lié à un excès d'insuline."
     ]
    ],
    "si": {
     "anaD": [
      {
       "and": [
        {
         "sexe": "Femme"
        },
        {
         "q": "c_statut",
         "any": [
          "J'ai des règles régulières",
          "J'ai des règles irrégulières",
          "Mes cycles changent depuis quelques années (après 40 ans)"
         ]
        }
       ]
      },
      {
       "sexe": "Femme"
      },
      null,
      {
       "q": "qn_atcd",
       "any": [
        "Ovaires polykystiques (SOPK)"
       ]
      }
     ],
     "err": [
      null,
      {
       "and": [
        {
         "sexe": "Femme"
        },
        {
         "age_lt": 20
        }
       ]
      },
      {
       "and": [
        {
         "sexe": "Femme"
        },
        {
         "age_ge": 35
        },
        {
         "age_lt": 50
        },
        {
         "non": {
          "q": "c_statut",
          "any": [
           "Je n'ai plus de règles : ménopause"
          ]
         }
        }
       ]
      },
      {
       "q": "meds",
       "any": [
        "Contre le cholestérol : une statine (atorvastatine, rosuvastatine, simvastatine…)"
       ]
      },
      {
       "and": [
        {
         "sexe": "Femme"
        },
        {
         "q": "c_statut",
         "any": [
          "Je n'ai pas de règles pour une autre raison (contraception, stérilet hormonal, autre)",
          "J'ai des règles irrégulières"
         ]
        },
        {
         "q": "c_contra",
         "any": [
          "Aucune contraception hormonale"
         ]
        }
       ]
      }
     ]
    },
    "err": [
     "Faire une prise de sang hormonale à n'importe quel jour du cycle : elle devient impossible à interpréter.",
     "Conclure à un SOPK chez une jeune fille réglée depuis moins de 2 à 3 ans : des cycles irréguliers sont normaux à cet âge.",
     "Attendre 50 ans pour s'intéresser à la ménopause : les premiers changements peuvent commencer dès 35 à 40 ans.",
     "Ne pas faire le lien avec un médicament contre le cholestérol (statine), qui peut réduire la fabrication des hormones : à en parler avec votre médecin, sans rien modifier de vous-même.",
     "Après l'arrêt de la pilule, attendre indéfiniment le retour des règles : au-delà de 6 mois sans règles, cela mérite d'être exploré."
    ]
   }
  }
 },
 {
  "id": "glycemie",
  "fam": "Rythme et glycémie",
  "nom": "Coups de pompe et glycémie",
  "piste": "des variations de votre glycémie, avec un excès d'insuline qui fait chuter le sucre après les repas",
  "mec": [
   {
    "t": "Quand le sucre arrive vite dans le sang, le corps libère beaucoup d'insuline ; la glycémie retombe alors trop bas, ce qui donne coup de pompe et fringale, et l'on remange sucré : c'est le « roller-coaster » de l'insuline.",
    "si": null
   },
   {
    "t": "Avec le temps, les cellules répondent moins bien à l'insuline et l'énergie est stockée en graisse, surtout au niveau du ventre.",
    "si": null
   }
  ],
  "expl": [
   {
    "t": "Vous pouvez ressentir un coup de barre après le repas ou une faim impérieuse une à deux heures après avoir mangé sucré.",
    "si": null
   },
   {
    "t": "Un malaise peut aussi survenir si un repas est sauté.",
    "si": {
     "or": [
      {
       "q": "gl_saut",
       "ge": 2
      },
      {
       "q": "gl_sucre",
       "any": [
        "Surtout quand je saute ou que je retarde un repas"
       ]
      },
      {
       "q": "v_malaise",
       "any": [
        "Souvent",
        "Parfois"
       ]
      }
     ]
    }
   },
   {
    "t": "Une faim peut aussi vous réveiller la nuit.",
    "si": {
     "q": "gl_nuit",
     "ge": 2
    }
   },
   {
    "t": "Votre tour de taille peut augmenter.",
    "si": {
     "q": "gl_ventre",
     "any": [
      "Oui, nettement",
      "Un peu"
     ]
    }
   }
  ],
  "anaD": [
   [
    "Glycémie à jeun",
    "Elle mesure le sucre dans le sang le matin (repère du cours : idéalement sous 1,00 g/L, zone grise entre 1,00 et 1,10 g/L), mais une valeur normale n'exclut pas un excès d'insuline."
   ],
   [
    "Insuline à jeun (insulinémie) et index HOMA",
    "Elle montre si le corps doit produire beaucoup d'insuline pour garder une glycémie normale (repère du cours : idéalement sous 5 µUI/mL, excès au-delà de 15)."
   ],
   [
    "Hémoglobine glyquée (HbA1c)",
    "Elle reflète le temps passé avec un sucre trop haut sur les 2 à 3 derniers mois."
   ],
   [
    "Triglycérides et HDL-cholestérol (rapport TG/HDL)",
    "Des triglycérides élevés traduisent souvent un excès d'insuline plutôt qu'un excès de graisses dans l'assiette."
   ],
   [
    "Tour de taille au mètre ruban",
    "Simple à mesurer chez soi, il reflète directement l'excès d'insuline (repères : 80 cm chez la femme, 94 cm chez l'homme)."
   ]
  ],
  "nutD": [
   "Pas de jus de fruits ni de sodas : ce sucre liquide monte très vite, sans fibres, et ne rassasie pas.",
   "Préférez les céréales complètes et les pâtes al dente aux produits raffinés, très cuits ou aux galettes de riz soufflé.",
   "Évitez de grignoter des produits sucrés entre les repas : le sucre fait monter l'insuline, puis la glycémie retombe et la faim revient.",
   "Au déjeuner, un repas de type méditerranéen et pas trop lourd (crudités, légumineuses, poisson, huile d'olive) pour éviter la somnolence de l'après-midi.",
   "Mangez assez de protéines, mâchez bien et prenez au moins 20 minutes pour chaque repas."
  ],
  "comp": [
   "Vitamine B1 (thiamine)",
   "Vitamines du groupe B, magnésium et zinc, qui aident les cellules à utiliser l'amidon",
   "L-carnitine, en cas de malaises pendant un effort prolongé",
   "À choisir avec votre pharmacienne, surtout si vous prenez des médicaments"
  ],
  "err": [
   "Se rassurer avec une glycémie normale : elle peut rester normale des années malgré un excès d'insuline.",
   "Se fier à son poids : un poids normal n'exclut pas un problème d'insuline, c'est le tour de taille qui compte.",
   "Choisir des collations « légères » comme les galettes de riz soufflé ou les yaourts : elles font fortement monter l'insuline.",
   "Rompre un jeûne avec du sucré (dattes par exemple) : une chute de sucre suit, avec une faim difficile à arrêter.",
   "Enchaîner les régimes très pauvres en calories : la faim augmente et devient irrépressible.",
   "Penser que les plats préparés sont sans sucre : environ 3 aliments sur 4 en contiennent (plats cuisinés, charcuteries, soupes, sauces), souvent sans qu'on le goûte."
  ],
  "medecin": "Je suis fatigué(e), j'ai des coups de barre après les repas et des fringales ; j'aimerais vérifier ma glycémie et mon insuline à jeun (index HOMA), mon HbA1c et mes triglycérides.",
  "src": [
   19,
   404,
   405,
   607,
   608,
   846,
   851,
   853,
   862,
   863,
   870,
   871,
   877,
   878,
   882,
   884,
   887,
   888,
   895,
   897,
   1942,
   2606,
   2672,
   2673,
   2674,
   2675
  ],
  "si": {
   "anaD": [
    null,
    null,
    null,
    null,
    null
   ],
   "nutD": [
    null,
    null,
    null,
    null,
    null
   ],
   "comp": [
    null,
    null,
    {
     "q": "v_malaise",
     "any": [
      "Souvent",
      "Parfois"
     ]
    },
    null
   ],
   "err": [
    null,
    null,
    null,
    {
     "or": [
      {
       "q": "a_type",
       "any": [
        "Je saute souvent des repas, ou je pratique le jeûne intermittent"
       ]
      },
      {
       "q": "gl_jeune",
       "ge": 2
      }
     ]
    },
    {
     "or": [
      {
       "q": "a_type",
       "any": [
        "Je fais des régimes à répétition, avec reprise de poids"
       ]
      },
      {
       "q": "f_debut",
       "any": [
        "Un régime ou une perte de poids rapide"
       ]
      }
     ]
    },
    {
     "non": {
      "q": "a_indus",
      "any": [
       "Jamais"
      ]
     }
    }
   ]
  }
 },
 {
  "id": "sommeil",
  "fam": "Rythme et glycémie",
  "nom": "Sommeil et rythme",
  "piste": "un sommeil trop court, décalé ou perturbé, qui ne permet pas une vraie récupération",
  "mec": [
   {
    "t": "La lumière du matin déclenche le pic de cortisol qui réveille et coupe la mélatonine ; le soir, la mélatonine prend le relais pour l'endormissement.",
    "si": null
   },
   {
    "t": "La récupération profite d'un pic d'hormone de croissance entre 22 h et minuit.",
    "si": null
   },
   {
    "t": "Des horaires de travail décalés dérèglent ce rythme.",
    "si": {
     "q": "s_rythme",
     "any": [
      "Horaires décalés (très tôt ou très tard)",
      "Travail posté (matin, après-midi, nuit en alternance)",
      "Travail de nuit"
     ]
    }
   },
   {
    "t": "Un coucher tardif dérègle ce rythme et réduit la récupération.",
    "si": {
     "q": "s_coucher",
     "any": [
      "Après minuit"
     ]
    }
   },
   {
    "t": "Les nuits de moins de 7 h dérèglent ce rythme, réduisent la récupération et favorisent la faim et la résistance à l'insuline.",
    "si": {
     "q": "s_duree",
     "any": [
      "Moins de 6 heures",
      "6 à 7 heures"
     ]
    }
   },
   {
    "t": "Des pauses respiratoires la nuit privent les cellules d'oxygène.",
    "si": {
     "or": [
      {
       "q": "s_ronf",
       "any": [
        "Je ronfle",
        "On m'a signalé des pauses respiratoires"
       ]
      },
      {
       "q": "qn_atcd",
       "any": [
        "Apnées du sommeil"
       ]
      }
     ]
    }
   }
  ],
  "expl": [
   {
    "t": "Vous pouvez vous réveiller fatigué(e) même après une nuit complète, avoir du mal à vous concentrer, avoir plus faim le lendemain d'une mauvaise nuit ou somnoler dans la journée.",
    "si": null
   }
  ],
  "anaD": [
   [
    "Étude du sommeil (polygraphie ventilatoire ou polysomnographie), sur avis médical",
    "Si vous ronflez, vous réveillez fatigué(e) et vous levez 2 à 3 fois par nuit pour uriner, elle permet de rechercher des pauses respiratoires (apnées), même sans surpoids."
   ],
   [
    "Bilan thyroïdien (TSH)",
    "Une thyroïde lente peut favoriser les apnées, et le travail de nuit perturbe la TSH."
   ]
  ],
  "nutD": [
   "Dînez tôt (au moins 3 h avant le coucher), léger, plutôt végétarien ou à base de poisson : cela aide la fabrication de la mélatonine.",
   "Gardez les protéines pour le matin et évitez un dîner très riche en viande, qui peut nuire au sommeil.",
   "Si un café pris l'après-midi vous empêche de dormir, évitez-le après 14 h : c'est le signe que votre corps l'élimine lentement.",
   "Laissez au moins 12 h de jeûne la nuit, entre le dîner et le petit-déjeuner.",
   "Limitez l'alcool, surtout si vous le supportez mal : une sensibilité à l'alcool et des troubles du sommeil font partie des signes d'une élimination des toxiques débordée.",
   "Si vous faites la sieste, limitez-la à 20-30 minutes."
  ],
  "comp": [
   "Magnésium, vitamine B6 ou mélatonine : seulement en appoint, si des apnées sont confirmées et appareillées par votre médecin",
   "Vitamines du groupe B",
   "À choisir avec votre pharmacienne, surtout si vous prenez des médicaments"
  ],
  "err": [
   "Croire que ronfler est sans conséquence, ou que les apnées ne concernent que les personnes en surpoids.",
   "Faire du sport intense tard le soir : le cortisol reste haut et retarde l'endormissement.",
   "Passer ses journées sans lumière naturelle et finir la soirée devant les écrans.",
   "Changer sans cesse d'heure de coucher et de lever : la régularité compte autant que la durée (7 à 9 h).",
   "Faire de longues siestes : elles perturbent le sommeil de la nuit."
  ],
  "medecin": "Je suis fatigué(e) au réveil et mon sommeil n'est pas réparateur (horaires, ronflement, réveils pour uriner) ; j'aimerais savoir si une étude du sommeil est utile pour rechercher des apnées.",
  "src": [
   236,
   341,
   342,
   363,
   364,
   365,
   371,
   414,
   415,
   498,
   914,
   915,
   964,
   966,
   967,
   1602,
   1603,
   1655,
   2103,
   2104,
   2105,
   2148,
   2444,
   2445,
   2723,
   2724,
   2725,
   2726,
   2727
  ],
  "si": {
   "anaD": [
    {
     "or": [
      {
       "or": [
        {
         "q": "s_ronf",
         "any": [
          "Je ronfle",
          "On m'a signalé des pauses respiratoires"
         ]
        },
        {
         "q": "qn_atcd",
         "any": [
          "Apnées du sommeil"
         ]
        }
       ]
      },
      {
       "q": "s_uri",
       "any": [
        "Deux fois ou plus"
       ]
      },
      {
       "q": "s_somno",
       "ge": 3
      },
      {
       "q": "s_nonrep",
       "ge": 3
      }
     ]
    },
    null
   ],
   "nutD": [
    null,
    {
     "non": {
      "q": "gl_pdj",
      "any": [
       "Salé, avec des protéines (œufs, jambon, fromage…)"
      ]
     }
    },
    {
     "non": {
      "q": "s_cafe",
      "any": [
       "Je n'en bois jamais après 14 heures",
       "Je ne bois ni café ni thé"
      ]
     }
    },
    null,
    {
     "q": "v_alc",
     "any": [
      "1 à 7 verres par semaine",
      "1 verre par jour ou plus",
      "Plus de 2 verres par jour"
     ]
    },
    {
     "q": "s_sieste",
     "any": [
      "Oui, courte (moins de 30 minutes)",
      "Oui, longue (plus de 30 minutes)"
     ]
    }
   ],
   "comp": [
    {
     "or": [
      {
       "q": "s_ronf",
       "any": [
        "Je ronfle",
        "On m'a signalé des pauses respiratoires"
       ]
      },
      {
       "q": "qn_atcd",
       "any": [
        "Apnées du sommeil"
       ]
      }
     ]
    },
    null,
    null
   ],
   "err": [
    {
     "or": [
      {
       "q": "s_ronf",
       "any": [
        "Je ronfle",
        "On m'a signalé des pauses respiratoires"
       ]
      },
      {
       "q": "qn_atcd",
       "any": [
        "Apnées du sommeil"
       ]
      }
     ]
    },
    {
     "q": "v_soir",
     "any": [
      "Souvent",
      "Parfois"
     ]
    },
    null,
    null,
    {
     "q": "s_sieste",
     "any": [
      "Oui, longue (plus de 30 minutes)"
     ]
    }
   ]
  }
 },
 {
  "id": "inflam",
  "fam": "Terrain digestif et inflammatoire",
  "nom": "Inflammation de bas grade et intestin",
  "piste": "une inflammation discrète et durable (dite « de bas grade »), qui peut être entretenue par un déséquilibre de votre intestin",
  "mec": [
   {
    "t": "Quand le microbiote (les bactéries et levures de l'intestin) est déséquilibré, il peut entretenir une inflammation discrète mais continue.",
    "si": null
   },
   {
    "t": "Cette inflammation consomme les antioxydants qui protègent normalement les mitochondries, les petites centrales qui fabriquent l'énergie de vos cellules.",
    "si": null
   },
   {
    "t": "Certaines levures comme le Candida libèrent aussi une substance (le tartarate) qui freine directement cette fabrication d'énergie.",
    "si": {
     "or": [
      {
       "q": "im_type",
       "any": [
        "Mycoses"
       ]
      },
      {
       "q": "gl_sucre",
       "any": [
        "À n'importe quel moment, sans horaire"
       ]
      },
      {
       "q": "gl_jeune",
       "ge": 2
      },
      {
       "q": "atb5",
       "any": [
        "3 à 5",
        "Plus de 5"
       ]
      },
      {
       "q": "mieux_sous",
       "any": [
        "Pendant des antibiotiques"
       ]
      },
      {
       "q": "d_aliments",
       "any": [
        "Le pain, les pâtes, les biscuits ou le sucre"
       ]
      }
     ]
    }
   },
   {
    "t": "Chez les personnes très fatiguées, on retrouve souvent moins de bactéries productrices de butyrate, le carburant des cellules du côlon : plus elles manquent, plus la fatigue est marquée.",
    "si": null
   }
  ],
  "expl": [
   {
    "t": "Vous pouvez ressentir une fatigue profonde, physique et mentale, que le repos ne soulage pas.",
    "si": null
   },
   {
    "t": "Des envies de sucre peuvent survenir à n'importe quel moment.",
    "si": {
     "q": "gl_sucre",
     "any": [
      "À n'importe quel moment, sans horaire"
     ]
    }
   },
   {
    "t": "Des mycoses peuvent revenir régulièrement.",
    "si": {
     "or": [
      {
       "q": "im_type",
       "any": [
        "Mycoses"
       ]
      },
      {
       "q": "c_contra_eff",
       "any": [
        "Des mycoses"
       ]
      }
     ]
    }
   },
   {
    "t": "Le ventre peut gonfler.",
    "si": {
     "or": [
      {
       "q": "d_quoi",
       "any": [
        "Ballonnements, gaz"
       ]
      },
      {
       "q": "d_aliments",
       "any": [
        "Le pain, les pâtes, les biscuits ou le sucre"
       ]
      }
     ]
    }
   },
   {
    "t": "Certaines personnes remarquent qu'elles vont mieux sans sucre ou à jeun, puis que tout revient dès qu'elles remangent.",
    "si": {
     "q": "gl_jeune",
     "ge": 2
    }
   },
   {
    "t": "Certaines personnes remarquent qu'elles se sentent mieux sous antibiotique ou sous anti-inflammatoire.",
    "si": {
     "q": "mieux_sous",
     "any": [
      "Pendant des antibiotiques",
      "Pendant des anti-inflammatoires, de l'aspirine ou de la cortisone"
     ]
    }
   }
  ],
  "anaD": [
   [
    "CRP ultrasensible",
    "Repère une inflammation discrète ; selon le cours, une valeur au-dessus de 1 n'est pas idéale, mais une CRP normale n'exclut pas tout (l'aspirine peut la faire baisser)."
   ],
   [
    "Ferritine, avec le coefficient de saturation de la transferrine",
    "Une ferritine haute avec une saturation normale peut refléter une inflammation plutôt qu'un excès de fer."
   ],
   [
    "LBP (LPS-binding protein)",
    "Aide à repérer le passage de toxines bactériennes de l'intestin vers le sang, signe d'un intestin trop perméable."
   ],
   [
    "Acides organiques urinaires (D-arabinitol, tartarate)",
    "Aident à repérer une prolifération de levures de type Candida et son lien avec la fatigue."
   ],
   [
    "Test respiratoire (breath test)",
    "Aide à repérer un excès de bactéries dans l'intestin grêle, souvent en cause dans les ballonnements rapides après le repas."
   ]
  ],
  "nutD": [
   "Réduire les sucres rapides, le pain blanc, les biscuits et les sucreries : les levures comme le Candida s'en nourrissent.",
   "Manger au calme et bien mâcher : la mastication aide à préserver la barrière de l'intestin.",
   "Mettre plus de légumes et de fibres dans l'assiette, et limiter les plats gras et industriels.",
   "Limiter l'alcool : il fragilise la barrière intestinale.",
   "Si des rougeurs, démangeaisons ou palpitations apparaissent après certains repas, repérer les aliments riches en histamine (fromages affinés, charcuterie, vin, conserves, restes) et en limiter la place."
  ],
  "comp": [
   "Glutamine, le carburant principal des cellules de l'intestin",
   "Probiotiques (lactobacilles, bifidobactéries)",
   "Oméga-3 riches en EPA",
   "Vitamine D, après vérification de votre taux",
   "Butyrate, pour nourrir les cellules du côlon",
   "À choisir avec votre pharmacienne, surtout si vous prenez des médicaments"
  ],
  "err": [
   "Supprimer de nombreux aliments sur la base d'un test d'intolérances (IgG) : cela aide rarement et expose à des manques.",
   "Croire qu'un jeûne ou un arrêt total du sucre suffit : on va mieux quelques jours, puis les levures reprennent dès qu'on remange des glucides.",
   "Se rassurer trop vite avec une CRP normale : une inflammation de bas grade peut exister malgré tout.",
   "Prendre des anti-inflammatoires au long cours pour « tenir » sans en parler avec votre médecin : ils peuvent rendre l'intestin plus perméable et faire durer l'inflammation.",
   "Penser que l'intestin est hors de cause parce que vous n'avez pas de trouble digestif : le microbiote peut être perturbé sans symptôme au ventre.",
   "Se lancer dans les fibres ou les probiotiques alors qu'ils font gonfler : cela évoque une pullulation de bactéries, à explorer d'abord.",
   "Prendre de la glutamine sans avis en cas d'hyperactivité ou de nervosité excessive, ou de cancer en cours."
  ],
  "medecin": "Je suis fatigué(e) depuis plusieurs mois et le repos ne me remet pas en forme, avec des troubles digestifs ou des mycoses qui reviennent ; j'aimerais vérifier s'il existe une inflammation de bas grade, avec une CRP ultrasensible et une ferritine accompagnée du coefficient de saturation.",
  "src": [
   9,
   10,
   11,
   390,
   550,
   571,
   573,
   575,
   817,
   820,
   826,
   839,
   909,
   945,
   946,
   953,
   1022,
   1025,
   1039,
   1041,
   1045,
   1048,
   1051,
   1064,
   1073,
   1521,
   1626,
   1646,
   1746,
   1750,
   1983,
   2008,
   2116,
   2149,
   2465,
   2466,
   2467,
   2494,
   2495,
   2496,
   2502,
   2504,
   2544,
   2681,
   2682
  ],
  "si": {
   "anaD": [
    null,
    null,
    null,
    {
     "or": [
      {
       "q": "im_type",
       "any": [
        "Mycoses"
       ]
      },
      {
       "q": "gl_sucre",
       "any": [
        "À n'importe quel moment, sans horaire"
       ]
      },
      {
       "q": "gl_jeune",
       "ge": 2
      },
      {
       "q": "atb5",
       "any": [
        "3 à 5",
        "Plus de 5"
       ]
      },
      {
       "q": "mieux_sous",
       "any": [
        "Pendant des antibiotiques"
       ]
      },
      {
       "q": "d_aliments",
       "any": [
        "Le pain, les pâtes, les biscuits ou le sucre"
       ]
      }
     ]
    },
    {
     "or": [
      {
       "q": "d_quoi",
       "any": [
        "Ballonnements, gaz"
       ]
      },
      {
       "q": "d_delai",
       "any": [
        "Pendant le repas ou dans l'heure et demie qui suit"
       ]
      }
     ]
    }
   ],
   "nutD": [
    null,
    null,
    null,
    {
     "q": "v_alc",
     "anyBut": [
      "Je ne bois pas",
      "Je ne sais pas"
     ]
    },
    {
     "or": [
      {
       "q": "qn_hv",
       "any": [
        "Des rougeurs, des palpitations ou des maux de tête après le vin, les fromages affinés ou la charcuterie",
        "Des démangeaisons des paupières, des bras ou du cuir chevelu"
       ]
      },
      {
       "q": "d_aliments",
       "any": [
        "Les fromages affinés, la charcuterie, le vin ou le chocolat"
       ]
      }
     ]
    }
   ],
   "comp": [
    null,
    null,
    null,
    null,
    null,
    null
   ],
   "err": [
    null,
    null,
    null,
    {
     "or": [
      {
       "q": "meds",
       "any": [
        "Anti-inflammatoires ou aspirine, régulièrement (ibuprofène, kétoprofène…)"
       ]
      },
      {
       "q": "mieux_sous",
       "any": [
        "Pendant des anti-inflammatoires, de l'aspirine ou de la cortisone"
       ]
      }
     ]
    },
    {
     "non": {
      "q": "qn_signes",
      "any": [
       "J'ai des troubles digestifs (ballonnements, transit, reflux)"
      ]
     }
    },
    {
     "q": "d_aliments",
     "any": [
      "Les légumes, les fruits, les légumineuses ou l'oignon"
     ]
    },
    null
   ]
  }
 },
 {
  "id": "postinf",
  "fam": "Terrain digestif et inflammatoire",
  "nom": "Fatigue post-infectieuse ou chronique",
  "piste": "une fatigue qui s'installe dans la durée, parfois depuis une infection, avec des douleurs qui peuvent se diffuser",
  "mec": [
   {
    "t": "Dans ce type de fatigue, les signes évoquent des mitochondries, les petites centrales énergétiques des cellules, qui tournent au ralenti.",
    "si": null
   },
   {
    "t": "Après une infection comme le COVID, la fabrication de coenzyme Q10, une pièce importante de la production d'énergie dans les cellules, peut être perturbée ; le tableau ressemble alors souvent à celui de la fibromyalgie.",
    "si": {
     "or": [
      {
       "q": "f_debut",
       "any": [
        "Un COVID",
        "Une autre infection (virus, grippe, mononucléose…)"
       ]
      },
      {
       "q": "qn_atcd",
       "any": [
        "COVID long"
       ]
      }
     ]
    }
   },
   {
    "t": "Le système nerveux peut aussi devenir plus sensible : la douleur est amplifiée par le manque de sommeil, le stress ou l'effort intellectuel.",
    "si": {
     "or": [
      {
       "q": "qn_signes",
       "any": [
        "J'ai des douleurs (muscles, articulations, dos, maux de tête)"
       ]
      },
      {
       "q": "qn_atcd",
       "any": [
        "Fibromyalgie ou syndrome de fatigue chronique"
       ]
      },
      {
       "q": "dl_ou",
       "any": [
        "Dans les muscles, un peu partout",
        "Dans les articulations",
        "Dans le dos ou la nuque"
       ]
      }
     ]
    }
   },
   {
    "t": "Lors d'une infection, les défenses produisent des messagers (les interférons) qui ralentissent la production d'énergie des cellules ; l'inflammation peut ensuite atteindre le cerveau et entretenir la fatigue.",
    "si": {
     "q": "f_debut",
     "any": [
      "Un COVID",
      "Une autre infection (virus, grippe, mononucléose…)",
      "Une gastro-entérite sévère ou une intoxication alimentaire",
      "Une diarrhée de voyage ou un parasite intestinal",
      "Une hépatite"
     ]
    }
   }
  ],
  "expl": [
   {
    "t": "Le sommeil repose peu et la concentration est difficile.",
    "si": null
   },
   {
    "t": "Vous pouvez avoir des douleurs qui changent d'endroit.",
    "si": {
     "q": "dl_bouge",
     "ge": 2
    }
   },
   {
    "t": "Vos douleurs peuvent augmenter au fil de la journée et diminuer au repos.",
    "si": {
     "q": "dl_jour",
     "any": [
      "Augmentent, puis diminuent quand je me repose",
      "Augmentent le soir et surtout au coucher"
     ]
    }
   },
   {
    "t": "Le simple contact des vêtements ou des draps peut même devenir douloureux.",
    "si": {
     "q": "dl_contact",
     "ge": 2
    }
   },
   {
    "t": "Un effort trop important peut relancer les douleurs.",
    "si": {
     "or": [
      {
       "q": "dl_trop",
       "any": [
        "Oui, souvent",
        "Parfois"
       ]
      },
      {
       "q": "f_recup",
       "any": [
        "Je me sens plus mal les jours suivants qu'avant l'effort"
       ]
      }
     ]
    }
   }
  ],
  "anaD": [
   [
    "NFS-plaquettes",
    "Vérifie les globules rouges, blancs et les plaquettes, notamment pour écarter un manque de globules rouges."
   ],
   [
    "CRP ultrasensible (ou VS-CRP)",
    "Repère une inflammation dans l'organisme."
   ],
   [
    "CPK",
    "Renseigne sur la souffrance des muscles quand ils sont douloureux."
   ],
   [
    "Hormones thyroïdiennes",
    "Vérifient que la thyroïde, qui règle une partie de votre énergie, fonctionne bien."
   ],
   [
    "Zinc, cuivre et sélénium",
    "Font partie du bilan de base ; le cuivre se lit avec les marqueurs d'inflammation, car l'inflammation peut le faire monter."
   ]
  ],
  "nutD": [
   "Mettre de côté la « malbouffe » : sodas, pizzas et plats industriels.",
   "Prévoir des légumes et des fruits frais chaque jour, pour la vitamine C et les antioxydants.",
   "Garder des protéines suffisantes à chaque repas (œufs, poisson, viande, légumineuses), surtout avec l'âge.",
   "Ajouter des légumes soufrés (choux, ail, oignon), qui aident le corps à fabriquer son principal antioxydant.",
   "Boire de l'eau régulièrement au fil de la journée, plutôt que des boissons sucrées.",
   "Reprenez l'activité physique progressivement, par exemple avec la marche ou le yoga.",
   "Après une fièvre, buvez suffisamment pour compenser l'eau perdue.",
   "Mangez des fruits et légumes riches en vitamine C (poivron rouge, kiwi, agrumes), plutôt crus ou peu cuits : une infection fait chuter la vitamine C."
  ],
  "comp": [
   "Coenzyme Q10",
   "Magnésium sous une forme bien tolérée",
   "L-carnitine, associée à une reprise douce du mouvement, à envisager seulement après avoir vérifié l'état de l'intestin",
   "Vitamine C, de préférence sous une forme bien tolérée par l'estomac (ascorbate ou liposomale)",
   "Zinc, sous une forme bien absorbée (bisglycinate plutôt qu'oxyde)",
   "À choisir avec votre pharmacienne, surtout si vous prenez des médicaments"
  ],
  "err": [
   "En faire beaucoup les « bons jours » puis le payer ensuite : mieux vaut fractionner l'effort et doser son activité pour ne pas déclencher les douleurs.",
   "Arrêter complètement de bouger : l'inactivité et le mauvais sommeil entretiennent la douleur, qui entretient la fatigue.",
   "Conclure qu'il n'y a rien à explorer parce que « tout est normal » : un bilan classique peut être normal malgré une vraie fatigue.",
   "Prendre des compléments « à l'aveugle » : sans bilan, c'est beaucoup moins précis, et on peut même obtenir l'inverse de l'effet recherché.",
   "Refaire un bilan trop tôt après avoir changé d'alimentation ou de compléments : le profil en acides gras se contrôle au moins 6 mois après le changement.",
   "Lire la quantité de plante (par exemple d'acérola) sur l'étiquette au lieu de la teneur réelle en vitamine C.",
   "Choisir un zinc sous forme d'oxyde, mal absorbé."
  ],
  "medecin": "Je suis fatigué(e) depuis une infection (ou depuis le COVID), avec des douleurs qui changent d'endroit et un sommeil qui ne me repose pas ; j'aimerais faire un bilan avec NFS-plaquettes, CRP ultrasensible, CPK et hormones thyroïdiennes.",
  "src": [
   24,
   584,
   638,
   719,
   720,
   727,
   730,
   731,
   732,
   741,
   757,
   758,
   808,
   814,
   1908,
   1909,
   1948,
   1963,
   1969,
   1987,
   1989,
   1991,
   1996,
   2019,
   2032,
   2348,
   2349,
   2374,
   2383,
   2385,
   2386,
   2396,
   2401,
   2402,
   2441,
   2446,
   2450,
   2451,
   2458,
   2704,
   2710,
   2716,
   2717,
   2718,
   2719,
   2720,
   2721,
   2722
  ],
  "si": {
   "anaD": [
    null,
    null,
    {
     "or": [
      {
       "q": "dl_ou",
       "any": [
        "Dans les muscles, un peu partout"
       ]
      },
      {
       "q": "ef_courb",
       "ge": 2
      },
      {
       "q": "ef_crampes",
       "ge": 2
      },
      {
       "q": "qn_atcd",
       "any": [
        "Fibromyalgie ou syndrome de fatigue chronique"
       ]
      }
     ]
    },
    null,
    null
   ],
   "nutD": [
    {
     "non": {
      "q": "a_indus",
      "any": [
       "Jamais"
      ]
     }
    },
    null,
    null,
    null,
    null,
    null,
    {
     "q": "f_debut",
     "any": [
      "Un COVID",
      "Une autre infection (virus, grippe, mononucléose…)",
      "Une gastro-entérite sévère ou une intoxication alimentaire",
      "Une diarrhée de voyage ou un parasite intestinal",
      "Une hépatite"
     ]
    },
    null
   ],
   "comp": [
    null,
    null,
    null,
    null,
    null,
    null
   ],
   "err": [
    null,
    null,
    {
     "or": [
      {
       "q": "x_consult",
       "any": [
        "Oui, et des analyses ont été faites"
       ]
      },
      {
       "q": "qn_exam",
       "anyBut": [
        "Je ne sais pas"
       ]
      }
     ]
    },
    null,
    null,
    null,
    null
   ]
  }
 },
 {
  "id": "foie",
  "fam": "Terrain digestif et inflammatoire",
  "nom": "Foie et élimination",
  "piste": "un foie qui élimine plus lentement que nécessaire face à ce qu'il doit neutraliser (café, alcool, médicaments, polluants)",
  "mec": [
   {
    "t": "Le foie neutralise et élimine ce qui vient de l'extérieur : café, alcool, médicaments, produits chimiques.",
    "si": null
   },
   {
    "t": "Ce travail coûte beaucoup d'énergie : quand la charge est forte ou que le foie élimine lentement, la fatigue est souvent l'un des premiers signes.",
    "si": null
   },
   {
    "t": "Certains polluants, comme les métaux lourds et les pesticides, gênent aussi directement la production d'énergie dans les cellules.",
    "si": {
     "q": "v_expo",
     "anyBut": [
      "Aucun de ces éléments",
      "Je ne sais pas"
     ]
    }
   }
  ],
  "expl": [
   {
    "t": "Vous pouvez ressentir une fatigue qui s'installe et avoir du mal à récupérer après un stress ou un effort.",
    "si": null
   },
   {
    "t": "Un café pris après 14 h peut ne plus être supporté.",
    "si": {
     "or": [
      {
       "q": "s_cafe",
       "any": [
        "Oui"
       ]
      },
      {
       "q": "qn_hv",
       "any": [
        "Je supporte mal l'alcool, le café, les parfums ou certains médicaments"
       ]
      }
     ]
    }
   },
   {
    "t": "L'alcool, les parfums ou l'odeur d'essence peuvent être mal tolérés.",
    "si": {
     "q": "qn_hv",
     "any": [
      "Je supporte mal l'alcool, le café, les parfums ou certains médicaments"
     ]
    }
   },
   {
    "t": "Des réveils vers 3 h du matin peuvent aussi apparaître.",
    "si": {
     "q": "s_revq",
     "any": [
      "C'est souvent vers 3 heures du matin"
     ]
    }
   },
   {
    "t": "Des sueurs nocturnes peuvent aussi apparaître.",
    "si": {
     "or": [
      {
       "q": "qn_hv",
       "any": [
        "Des sueurs la nuit qui mouillent l'oreiller"
       ]
      },
      {
       "q": "s_revq",
       "any": [
        "J'ai chaud, je transpire"
       ]
      }
     ]
    }
   }
  ],
  "anaD": [
   [
    "Questionnaire de symptômes (type QSM)",
    "Aucune prise de sang ne mesure à elle seule la charge à éliminer : ce questionnaire aide à l'estimer et à suivre l'évolution."
   ],
   [
    "Ferritine (réserves en fer)",
    "Le foie s'appuie sur le fer pour bien éliminer ; des réserves basses peuvent freiner ce travail."
   ],
   [
    "Bilirubine",
    "Un taux un peu élevé peut évoquer une particularité fréquente (dite de Gilbert) qui ralentit l'élimination de l'alcool et de certains médicaments comme le paracétamol."
   ]
  ],
  "nutD": [
   "Manger des crucifères (chou, brocoli, chou-fleur…) plusieurs fois par semaine.",
   "Préférer les petits poissons (sardine, hareng, anchois) au thon, à l'espadon, au requin ou au bar.",
   "Limiter les grillades et le barbecue.",
   "Éviter la cuisson du poisson en papillote dans du papier aluminium.",
   "Choisir le pain et les céréales complets en bio, sinon plutôt en version blanche."
  ],
  "comp": [
   "Acides aminés qui soutiennent l'élimination par le foie : glycine, taurine, N-acétylcystéine (NAC)",
   "Nutriments qui soutiennent la méthylation, une autre voie d'élimination du foie",
   "Fer, seulement si le bilan montre des réserves basses",
   "À choisir avec votre pharmacienne, surtout si vous prenez des médicaments"
  ],
  "err": [
   "Croire qu'il est normal de ne plus supporter le café de l'après-midi : c'est plutôt le signe que le foie l'élimine lentement, ce qui peut être héréditaire ou venir du vieillissement du foie.",
   "Perdre du poids très vite ou enchaîner les régimes : les polluants stockés dans les graisses sont alors relâchés.",
   "Prendre souvent du paracétamol, surtout avec de l'alcool, sans en parler à votre médecin ou à votre pharmacienne : il épuise le glutathion, un protecteur clé du foie.",
   "Oublier de faire le point sur vos expositions (tabac, alcool, produits chimiques, métaux lourds) quand la fatigue dure : c'est une piste à part entière.",
   "Mettre des sueurs abondantes uniquement sur le compte du foie : si elles s'accompagnent d'une perte de poids, de palpitations ou d'une intolérance à la chaleur, parlez-en à votre médecin."
  ],
  "medecin": "Je suis fatigué(e) et le repos ne me remet pas en forme ; je supporte mal le café de l'après-midi, l'alcool ou les odeurs fortes et je me réveille souvent vers 3 h : j'aimerais en parler avec vous et vérifier ma ferritine et ma bilirubine.",
  "src": [
   21,
   35,
   37,
   132,
   133,
   196,
   197,
   959,
   961,
   963,
   964,
   966,
   967,
   968,
   974,
   976,
   981,
   986,
   987,
   998,
   999,
   1887,
   1986,
   2065,
   2667,
   2668,
   2669,
   2670,
   2671
  ],
  "si": {
   "anaD": [
    null,
    null,
    null
   ],
   "nutD": [
    null,
    {
     "non": {
      "q": "a_type",
      "any": [
       "Végétarienne : ni viande ni poisson",
       "Végétalienne : aucun produit animal"
      ]
     }
    },
    null,
    {
     "non": {
      "q": "a_type",
      "any": [
       "Végétarienne : ni viande ni poisson",
       "Végétalienne : aucun produit animal"
      ]
     }
    },
    null
   ],
   "comp": [
    null,
    null,
    null,
    null
   ],
   "err": [
    {
     "or": [
      {
       "q": "s_cafe",
       "any": [
        "Oui"
       ]
      },
      {
       "q": "qn_hv",
       "any": [
        "Je supporte mal l'alcool, le café, les parfums ou certains médicaments"
       ]
      }
     ]
    },
    null,
    null,
    null,
    {
     "or": [
      {
       "q": "qn_hv",
       "any": [
        "Des sueurs la nuit qui mouillent l'oreiller"
       ]
      },
      {
       "q": "s_revq",
       "any": [
        "J'ai chaud, je transpire"
       ]
      }
     ]
    }
   ]
  }
 },
 {
  "id": "medic",
  "fam": "Médicaments",
  "nom": "Médicaments qui pèsent sur l'énergie",
  "piste": "un ou plusieurs médicaments pris au long cours, qui peuvent peser sur vos réserves et sur votre énergie",
  "mec": [
   {
    "t": "Certains médicaments utiles ont des effets sur la production d'énergie.",
    "si": null
   },
   {
    "t": "Les statines (contre le cholestérol) diminuent la fabrication de coenzyme Q10, indispensable aux muscles.",
    "si": {
     "q": "meds",
     "any": [
      "Contre le cholestérol : une statine (atorvastatine, rosuvastatine, simvastatine…)"
     ]
    }
   },
   {
    "t": "Les anti-reflux réduisent l'acidité de l'estomac, ce qui diminue l'absorption du fer, de la vitamine B12 et du magnésium.",
    "si": {
     "q": "meds",
     "any": [
      "Contre le reflux : oméprazole, pantoprazole, ésoméprazole… (avec ou sans ordonnance)"
     ]
    }
   },
   {
    "t": "La metformine peut aussi réduire l'absorption de la B12.",
    "si": {
     "q": "meds",
     "any": [
      "Metformine (traitement du diabète)"
     ]
    }
   },
   {
    "t": "Le risque d'effets indésirables augmente avec le nombre de médicaments pris chaque jour.",
    "si": null
   }
  ],
  "expl": [
   {
    "t": "Il se peut que vous ayez remarqué une fatigue apparue après le début d'un médicament.",
    "si": null
   },
   {
    "t": "Sous statine, des crampes des mollets ou une faiblesse dans les escaliers peuvent apparaître.",
    "si": {
     "q": "meds",
     "any": [
      "Contre le cholestérol : une statine (atorvastatine, rosuvastatine, simvastatine…)"
     ]
    }
   },
   {
    "t": "Avec un anti-reflux pris depuis longtemps, fatigue, crampes et fourmillements peuvent apparaître.",
    "si": {
     "and": [
      {
       "q": "meds",
       "any": [
        "Contre le reflux : oméprazole, pantoprazole, ésoméprazole… (avec ou sans ordonnance)"
       ]
      },
      {
       "non": {
        "q": "m_ipp",
        "any": [
         "Moins d'un an"
        ]
       }
      }
     ]
    }
   }
  ],
  "anaD": [
   [
    "CPK",
    "Renseigne sur la souffrance des muscles en cas de douleurs sous statine."
   ],
   [
    "Vitamine B12, avec l'homocystéine",
    "Vérifie si l'absorption de la B12 est freinée (anti-reflux, metformine, pilule)."
   ],
   [
    "Bilan du fer (ferritine)",
    "Vérifie que le fer est bien absorbé malgré un anti-reflux au long cours."
   ],
   [
    "Magnésium et zinc",
    "Font partie des minéraux à surveiller sous anti-reflux pris plus d'un an."
   ],
   [
    "Bilan thyroïdien",
    "Utile si une statine a été mal tolérée : la thyroïde lente est plus fréquente dans ce cas."
   ]
  ],
  "nutD": [
   "Avec un médicament pris au long cours, éviter le jus de pamplemousse, les pomelos et la bergamote.",
   "Limiter l'alcool, surtout si vous prenez souvent du paracétamol.",
   "Manger calmement et bien mâcher, surtout sous anti-reflux : les protéines et certains compléments sont alors moins bien digérés.",
   "Si un médicament coupe l'appétit (médicament pour maigrir), garder des protéines à chaque repas pour préserver les muscles."
  ],
  "comp": [
   "Coenzyme Q10, notamment avec une statine",
   "Magnésium sous une forme bien tolérée (pilule, anti-reflux)",
   "Vitamines du groupe B, avec la B6 sous forme active (pyridoxal phosphate), notamment sous pilule",
   "Vitamine B12 et fer, selon le bilan, avec un anti-reflux ou de la metformine",
   "À choisir avec votre pharmacienne, surtout si vous prenez des médicaments"
  ],
  "err": [
   "Arrêter ou espacer un médicament de soi-même : c'est toujours à décider avec votre médecin (un arrêt brutal peut provoquer un rebond ou un sevrage).",
   "Prendre du millepertuis sans en parler : il interagit avec de nombreux médicaments, dont la pilule et les antidépresseurs.",
   "Prendre un anti-reflux sans ordonnance pendant des mois ou des années sans faire vérifier ses réserves.",
   "Prendre souvent du paracétamol sans y penser : il consomme le glutathion, un protecteur important.",
   "Prendre des vitamines B à forte dose de soi-même : un excès de B6 peut donner des fourmillements."
  ],
  "medecin": "Je suis fatigué(e) depuis que je prends ce médicament ; pourrions-nous regarder ensemble si un lien est possible, et vérifier ma vitamine B12, mon fer, mon magnésium et mes CPK si j'ai mal aux muscles ?",
  "src": [
   22,
   271,
   318,
   407,
   460,
   461,
   467,
   470,
   479,
   505,
   508,
   535,
   557,
   588,
   641,
   648,
   649,
   652,
   676,
   686,
   696,
   698,
   803,
   845,
   902,
   918,
   977,
   982,
   983,
   984,
   1015,
   1555,
   1623,
   1650,
   1663,
   1664,
   1670,
   1754,
   2050,
   2051,
   2097,
   2131,
   2135,
   2660,
   2683
  ],
  "si": {
   "anaD": [
    {
     "q": "meds",
     "any": [
      "Contre le cholestérol : une statine (atorvastatine, rosuvastatine, simvastatine…)"
     ]
    },
    null,
    {
     "q": "meds",
     "any": [
      "Contre le reflux : oméprazole, pantoprazole, ésoméprazole… (avec ou sans ordonnance)"
     ]
    },
    {
     "and": [
      {
       "q": "meds",
       "any": [
        "Contre le reflux : oméprazole, pantoprazole, ésoméprazole… (avec ou sans ordonnance)"
       ]
      },
      {
       "non": {
        "q": "m_ipp",
        "any": [
         "Moins d'un an"
        ]
       }
      }
     ]
    },
    {
     "q": "m_stat_eff",
     "anyBut": [
      "Rien de particulier",
      "Je ne sais pas"
     ]
    }
   ],
   "nutD": [
    null,
    {
     "q": "v_alc",
     "anyBut": [
      "Je ne bois pas",
      "Je ne sais pas"
     ]
    },
    null,
    {
     "q": "meds",
     "any": [
      "Injections pour le diabète ou pour maigrir (sémaglutide, tirzépatide…)"
     ]
    }
   ],
   "comp": [
    {
     "q": "meds",
     "any": [
      "Contre le cholestérol : une statine (atorvastatine, rosuvastatine, simvastatine…)"
     ]
    },
    {
     "or": [
      {
       "q": "meds",
       "any": [
        "Contre le reflux : oméprazole, pantoprazole, ésoméprazole… (avec ou sans ordonnance)"
       ]
      },
      {
       "q": "c_contra",
       "any": [
        "Pilule"
       ]
      }
     ]
    },
    {
     "q": "c_contra",
     "any": [
      "Pilule"
     ]
    },
    {
     "q": "meds",
     "any": [
      "Contre le reflux : oméprazole, pantoprazole, ésoméprazole… (avec ou sans ordonnance)",
      "Metformine (traitement du diabète)"
     ]
    },
    null
   ],
   "err": [
    null,
    null,
    {
     "q": "meds",
     "any": [
      "Contre le reflux : oméprazole, pantoprazole, ésoméprazole… (avec ou sans ordonnance)"
     ]
    },
    null,
    null
   ]
  }
 }
];

/* LifeMicroNut — Bilan fatigue : aperçu gratuit + paiement + rapport complet + PDF (adapté de rapport_ui.js du microbiote) */
/* --- Aperçu gratuit (FOMO) + mur de paiement + rapport complet + PDF --- */
var LMN_PRIX = "19,99 €";      /* prix affiché — le montant RÉEL est réglé dans PayPal (bouton USX7H34C8XGP8) */
var LMN_PAY_URL = "https://www.paypal.com/ncp/payment/USX7H34C8XGP8";
var lmnUnlocked = false;        /* passe à true après paiement (clic "j'ai payé") */

function lmnDedup(a){ var s=[],o={}; a.forEach(function(x){ if(!o[x]){o[x]=1;s.push(x);} }); return s; }
function lmnEsc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function lmnFlat(arrs){ return [].concat.apply([],arrs); }
function lmnDateFr(){ var n=new Date(); return ('0'+n.getDate()).slice(-2)+'/'+('0'+(n.getMonth()+1)).slice(-2)+'/'+n.getFullYear(); }

function lmnPourquoi(r){ var x=r.raisons; if(x.length<2) return x[0]||""; return x.slice(0,-1).join(", ")+" et "+x[x.length-1]; }
function lmnResout(p, A){
  ["mec","expl"].forEach(function(k){ if(Array.isArray(p[k])) p[k] = p[k].filter(function(x){ return fCond(x.si, A); }).map(function(x){ return x.t; }).join(" "); p[k] = lmnAccord(p[k]||"", A.sexe); });
  ["anaD","nutD","comp","err"].forEach(function(k){ var c = p.si && p.si[k]; if(c && p[k]) p[k] = p[k].filter(function(x, i){ return fCond(c[i], A); }); });
}
function lmnData(A){
  var r = fatPistes(A||{});
  var sexe = (A||{}).sexe;
  var pistes = r.evoquees.map(function(e){ var p={}, k; for(k in e.def) if(k!=="sx") p[k]=e.def[k]; var v=e.def.sx&&e.def.sx[sexe]; if(v) for(k in v){ if(k==="si"){ var s2={}, j; for(j in (p.si||{})) s2[j]=p.si[j]; for(j in v.si) s2[j]=v.si[j]; p.si=s2; } else p[k]=v[k]; } lmnResout(p, A||{}); p.pourquoi=lmnPourquoi(e); return p; });
  var analyses = lmnDedup(lmnFlat(pistes.map(function(p){ return p.anaD.map(function(x){return x[0];}); })));
  var nbNut = lmnDedup(lmnFlat(pistes.map(function(p){ return p.nutD; }))).length;
  var r2 = {pistes:pistes, analyses:analyses, nbNut:nbNut, ctx:r.ctx, sexe:sexe, depuis:lmnDepuis(A), niveau:(A||{}).f_niveau}; r2.anaCles=lmnAnaCles(r2); return r2;
}
function lmnAccord(s, sexe){ if(sexe==="Homme") return s.replace(/\(e\)/g,""); if(sexe==="Femme") return s.replace(/\(e\)/g,"e"); return s; }

function lmnAlarmes(c){ return (c.alarmes||[]).map(function(x,i){ return i ? x.charAt(0).toLowerCase()+x.slice(1) : x; }).join(' ; '); }
function lmnPlan(d){ var v=[]; d.pistes.forEach(function(p){ if(p.nutD&&p.nutD[0]&&v.indexOf(p.nutD[0])<0) v.push(p.nutD[0]); }); return v.slice(0,6); }
function lmnCtxHTML(d, complet){
  var h='', c=d.ctx||{}, infl=d.pistes.some(function(p){return p.id==="inflam";});
  if(c.alarme) h += '<div class="lmn-alerte"><b>Un point à faire vérifier par un médecin, en parallèle :</b> '+lmnEsc(lmnAlarmes(c))+'. '+((c.alarmes||[]).length>1?'Ces signes ne s\'expliquent':'Ce signe ne s\'explique')+' pas par la micronutrition seule. En cas d\'urgence, appelez le 15.</div>';
  if(c.hemochro) h += '<div class="lmn-alerte"><b>Fer :</b> vous avez signalé une hémochromatose ou un fer trop élevé. Aucun complément contenant du fer sans l\'avis de votre médecin.</div>';
  if(c.prudence && !complet) {} else if(c.prudence) h += '<p class="lmn-rap-note">Compte tenu de vos antécédents, voyez tout complément avec votre médecin ou votre pharmacienne avant de le commencer.</p>';
  if(c.moral) h += '<div class="lmn-alerte"><b>Vous avez parlé d\'idées noires.</b> Vous n\'êtes pas seul(e) : parlez-en à votre médecin, ou appelez le <b>3114</b> (numéro national de prévention du suicide, gratuit, 24 h/24).</div>';
  if(complet && (c.microbiote||infl)) h += '<div class="lmn-renvoi"><b>Votre ventre compte aussi.</b> '+(c.microbiote?'Vous avez signalé des troubles digestifs : l\'intestin':'L\'intestin')+' peut peser sur l\'énergie. Le <b>bilan Microbiote</b> LifeMicroNut explore cette piste en détail.</div>';
  return h;
}

function lmnVisibles(){
  var A0 = window.A || {}, R = {};
  try { if (typeof visible === "function" && typeof qVis === "function") {
    visible().forEach(function(s){ if (s && s.q) s.q.forEach(function(q){ if (q && q.id && qVis(q) && A0[q.id] != null) R[q.id] = A0[q.id]; }); });
    return R; } } catch(e) {}
  return A0;
}
/* ---------- APERÇU GRATUIT (teaser + FOMO) ---------- */
function lmnTeaserHTML(A){
  var d = lmnData(A);
  var h = '<div class="lmn-rap">';
  h += '<div class="lmn-rap-head"><div class="lmn-rap-k">Votre aperçu — bilan d\'orientation</div><h2>Fatigue &amp; énergie</h2><div class="lmn-rap-date">'+lmnDateFr()+'</div></div>';
  if(!d.pistes.length){
    h += lmnCtxHTML(d,false);
    h += '<p class="lmn-none">Vos réponses n\'évoquent pas de piste précise parmi celles que ce questionnaire explore. Ce n\'est ni « normal » ni « anormal » — simplement pas de signal net ici. Si la fatigue dure, parlez-en à votre médecin.</p>';
    h += '</div>'; return h;
  }
  h += lmnCtxHTML(d,false);
  h += '<p class="lmn-teaser-intro">D\'après vos réponses, <b>'+d.pistes.length+' piste'+(d.pistes.length>1?'s':'')+'</b> ressort'+(d.pistes.length>1?'ent':'')+' :</p>';
  h += '<ul class="lmn-pistes">';
  d.pistes.forEach(function(p){ h += '<li><span class="lmn-fam">'+lmnEsc(p.fam)+'</span><b>'+lmnEsc(p.nom)+'</b><span class="pq"><br>Parce que '+lmnEsc(p.pourquoi)+'.</span>'+(p.nutD&&p.nutD[0]?'<span class="lmn-tip"><b>Premier conseil :</b> '+lmnEsc(p.nutD[0])+'</span>':'')+'</li>'; });
  h += '</ul>';
  // stats FOMO
  h += '<div class="lmn-stats">'+
       '<div class="st"><span class="n">'+d.pistes.length+'</span><span class="l">piste'+(d.pistes.length>1?'s':'')+' identifiée'+(d.pistes.length>1?'s':'')+'</span></div>'+
       '<div class="st"><span class="n">'+d.analyses.length+'</span><span class="l">analyses ciblées à demander</span></div>'+
       '<div class="st"><span class="n">'+d.nbNut+'</span><span class="l">conseils alimentation et rythme</span></div>'+
       '<div class="st"><span class="n">1</span><span class="l">résumé pour votre médecin</span></div></div>';
  // bloc verrouillé (flouté) + CTA
  h += '<div class="lmn-lock">'+
       '<div class="lmn-lock-blur">'+
         '<h3>Ce que contient votre rapport complet</h3>'+
         '<ul>'+
           '<li><b>Votre plan d\'action</b> : par où commencer, puis tous les conseils alimentation et rythme, piste par piste</li>'+'<li><b>Pourquoi</b> chacune de ces pistes, expliqué simplement (comment cela peut vous fatiguer)</li>'+
           '<li><b>Les analyses précises</b> à demander à votre médecin — et à quoi chacune sert (vous évitez les examens inutiles)</li>'+
           '<li><b>Vos conseils alimentation et rythme de vie</b>, piste par piste</li>'+
           '<li><b>Les familles de compléments</b> à discuter avec votre pharmacienne</li>'+
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
function lmnMotsCles(s){ var gen=" plasmatique salivaire sanguin sanguine dosage dosages bilan journée faits cycle sommeil "; return s.toLowerCase().replace(/[^a-zà-ÿ0-9 ]/g," ").split(/\s+/).filter(function(w){ return w.length>5 && gen.indexOf(" "+w+" ")<0; }); }
function lmnAnaCles(d){ var v=[], vus={}; d.pistes.forEach(function(p){ var a=p.anaD&&p.anaD[0]; if(!a) return; var s=lmnAnaCourt(a[0]), m=lmnMotsCles(s); if(m.some(function(w){return vus[w];})) return; m.forEach(function(w){vus[w]=1;}); v.push(s); }); return v; }
function lmnDepuis(A){ var m={"Moins de 3 mois":"depuis moins de 3 mois","3 mois à 1 an":"depuis plusieurs mois","1 à 5 ans":"depuis 1 à 5 ans","Plus de 5 ans":"depuis plus de 5 ans","Aussi loin que je me souvienne":"depuis toujours"}; return m[(A||{}).f_depuis]||""; }
function lmnAnaCourt(s){ var i=s.indexOf(" ("); return i>8 ? s.slice(0,i) : s; }
function lmnDireMedecin(d){
  var dep = d.depuis ? " " + d.depuis : "";
  if(!d.pistes.length) return lmnAccord("Bonjour Docteur, je suis fatigué(e)" + dep + ". Un questionnaire d'orientation sur la fatigue ne fait pas ressortir de piste précise, mais j'aimerais faire le point avec vous.", d.sexe);
  var c = d.ctx || {}, plus = "";
  if (typeof d.niveau === "number") plus += " Je note ma fatigue à " + d.niveau + " sur 10.";
  if (c.retent) plus += " Cette fatigue m'oblige à réduire mes activités.";
  if (c.postinfStagne) plus += " Elle ne s'améliore pas depuis la fin de l'infection qui l'a déclenchée.";
  return lmnAccord("Bonjour Docteur, je suis fatigué(e)" + dep + "." + plus + " Un questionnaire d'orientation fait ressortir " + (d.pistes.length>1 ? "ces pistes" : "cette piste") + " : " + d.pistes.map(function(p){return p.nom.toLowerCase();}).join(", ") + "." + (d.anaCles.length ? " Pourriez-vous me dire si ces examens sont utiles dans mon cas ?" : ""), d.sexe);
}
function lmnListe(t, cls, items, fmt){ if(!items||!items.length) return ''; return '<div class="lmn-bloc '+cls+'"><div class="lmn-bt">'+t+'</div><ul>'+items.map(function(x){return '<li>'+(fmt?fmt(x):lmnEsc(x))+'</li>';}).join('')+'</ul></div>'; }
function lmnFullHTML(A){
  var d = lmnData(A);
  var h = '<div class="lmn-rap lmn-v2">';
  h += '<div class="lmn-rap-head"><div class="lmn-rap-k">Votre rapport d\'orientation</div><h2>Fatigue &amp; énergie</h2><div class="lmn-rap-date">'+lmnDateFr()+'</div></div>';
  h += lmnCtxHTML(d,false);
  if(!d.pistes.length){
    h += '<p class="lmn-none">Vos réponses ne font pas ressortir de piste précise. Si la fatigue dure, parlez-en à votre médecin.</p></div>'; return h;
  }
  h += '<div class="lmn-chips">'+d.pistes.map(function(p){ return '<span>'+lmnEsc(p.nom)+'</span>'; }).join('')+'</div>';
  h += '<section class="lmn-plan"><h3>Par où commencer</h3><ol>'+lmnPlan(d).map(function(x){return '<li>'+lmnEsc(x)+'</li>';}).join('')+'</ol></section>';
  h += '<h3 class="lmn-h3">Vos pistes en détail</h3><p class="lmn-hint">Touchez une piste pour l\'ouvrir.</p>';
  d.pistes.forEach(function(p, i){
    h += '<details class="lmn-card"'+(i===0?' open':'')+'><summary><span class="lmn-fam">'+lmnEsc(p.fam)+'</span><span class="lmn-cn">'+lmnEsc(p.nom)+'</span><span class="lmn-pq">Parce que '+lmnEsc(p.pourquoi)+'.</span></summary><div class="lmn-cb">';
    h += '<p class="lmn-mec">'+lmnEsc(p.mec)+'</p>';
    h += '<div class="lmn-grid">';
    h += lmnListe('À faire', 'ok', p.nutD);
    h += lmnListe('À éviter', 'ko', p.err);
    h += '</div>';
    h += lmnListe('Compléments à discuter avec votre pharmacienne', 'cp', p.comp.filter(function(x){ return x.indexOf('À choisir avec votre pharmacienne')<0; }));
    h += lmnListe('Analyses utiles', 'an', p.anaD, function(x){ return '<b>'+lmnEsc(x[0])+'</b><span>'+lmnEsc(x[1])+'</span>'; });
    h += '</div></details>';
  });
  h += lmnCtxHTML(d,true).replace(/<div class="lmn-alerte">.*?<\/div>/g,'');
  h += '<section class="lmn-doc"><h3>Pour votre médecin</h3><p>'+lmnEsc(lmnDireMedecin(d))+'</p>';
  if(d.anaCles.length) h += '<ul>'+d.anaCles.map(function(x){return '<li>'+lmnEsc(lmnAnaCourt(x))+'</li>';}).join('')+'</ul>';
  h += '</section>';
  h += '<p class="lmn-rap-disc">Orientation, pas un diagnostic : ce document ne remplace pas une consultation. Compléments à choisir avec votre pharmacienne ; ne modifiez aucun médicament sans l\'avis de votre médecin. En cas d\'urgence, appelez le 15.</p>';
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
  line("Votre rapport d'orientation — fatigue et énergie",15,'bold',[20,33,28]);
  line(lmnDateFr(),9,'normal',[120,130,120]); y+=2;
  var c=d.ctx||{};
  if(c.alarme){ line("Un point à faire vérifier par un médecin, en parallèle : "+lmnAlarmes(c)+". "+((c.alarmes||[]).length>1?"Ces signes ne s'expliquent":"Ce signe ne s'explique")+" pas par la micronutrition seule. En cas d'urgence, appelez le 15.",10,'bold',[150,60,40]); y+=2; }
  if(c.hemochro){ line("Fer : vous avez signalé une hémochromatose ou un fer trop élevé. Aucun complément contenant du fer sans l'avis de votre médecin.",10,'bold',[150,60,40]); y+=2; }
  if(c.prudence){ line("Compte tenu de vos antécédents, voyez tout complément avec votre médecin ou votre pharmacienne avant de le commencer.",9.5,'italic',[90,100,94]); y+=2; }
  if(c.moral){ line("Vous avez parlé d'idées noires : parlez-en à votre médecin, ou appelez le 3114 (prévention du suicide, gratuit, 24 h/24).",10,'bold',[150,60,40]); y+=2; }
  if(!d.pistes.length){ line("Vos réponses n'évoquent pas de piste particulière. Si la fatigue dure, parlez-en à votre médecin.",10,'normal',[60,70,64]); doc.save('rapport-fatigue-lifemicronut.pdf'); return; }
  h2('Ce que vos réponses évoquent');
  d.pistes.forEach(function(p){ bullet(p.nom+' : '+p.piste+' — parce que '+p.pourquoi+'.'); });
  h2('Par où commencer'); lmnPlan(d).forEach(bullet);
  d.pistes.forEach(function(p){
    h2(p.nom);
    h3('Ce qui se passe'); line(p.mec,10,'normal',[60,70,64],0);
    if(p.expl){ h3('Au quotidien'); line(p.expl,10,'normal',[60,70,64],0); }
    h3('Analyses que vous pourriez demander'); p.anaD.forEach(function(x){ bullet(x[0]+' — '+x[1]); });
    h3('Alimentation & hygiène de vie'); p.nutD.forEach(bullet);
    h3('Compléments (familles) à discuter avec votre pharmacienne'); p.comp.forEach(bullet);
    h3('Erreurs à éviter'); p.err.forEach(bullet);
  });
  if(c.microbiote||d.pistes.some(function(p){return p.id==='inflam';})){ h2('Votre ventre compte aussi'); line((c.microbiote?"Vous avez signalé des troubles digestifs : l'intestin":"L'intestin")+" peut peser sur l'énergie. Le bilan Microbiote LifeMicroNut explore cette piste en détail.",10,'normal',[60,70,64],0); }
  h2('Pour votre médecin'); line(lmnDireMedecin(d),10,'normal',[60,70,64],0); d.anaCles.forEach(bullet);
  y+=3; line("Orientation, pas un diagnostic : ce document ne remplace pas une consultation. N'arrêtez ni ne modifiez aucun médicament sans l'avis de votre médecin. En cas d'urgence, appelez le 15.",8.5,'italic',[120,130,120]);
  doc.save('rapport-fatigue-lifemicronut.pdf');
}

/* ---------- Injection + bascule aperçu / complet ---------- */
try{window.lmnFullHTML=lmnFullHTML;}catch(e){}
function lmnInjecterRapport(){
  var pg = document.getElementById('page'); if(!pg) return;
  var old = document.getElementById('lmn-rapport'); if(old) old.parentNode.removeChild(old);
  var box = document.createElement('div'); box.id='lmn-rapport';
  if(lmnUnlocked){
    box.innerHTML = '<div class="lmn-rap-actions"><button type="button" id="lmn-dlpdf" class="lmn-btn-primary">Télécharger mon rapport (PDF)</button></div>' + lmnFullHTML(lmnVisibles());
  } else {
    box.innerHTML = lmnTeaserHTML(lmnVisibles());
  }
  pg.appendChild(box);
  var ps = document.getElementById('lmn-pay-start');
  if(ps) ps.onclick = function(){ try{ window.open(LMN_PAY_URL,'_blank','noopener'); }catch(e){} var s2=document.getElementById('lmn-pay-step2'); if(s2) s2.style.display='block'; ps.style.display='none'; };
  var pd = document.getElementById('lmn-paid');
  if(pd) pd.onclick = function(){ lmnUnlocked = true; lmnInjecterRapport(); try{document.getElementById('lmn-rapport').scrollIntoView();}catch(e){} };
  var b = document.getElementById('lmn-dlpdf');
  if(b) b.onclick = function(){ try{ lmnRapportPdf(lmnVisibles()); }catch(e){ try{window.print();}catch(_){} } };
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
  +'.lmn-v2{padding:22px 18px}.lmn-v2 h3{font-size:1.1rem;color:#15211C;margin:0 0 8px}'
  +'.lmn-chips{display:flex;flex-wrap:wrap;gap:6px;margin:4px 0 16px}.lmn-chips span{background:#E3F1E9;color:#0B6E4F;font-weight:700;font-size:.82rem;padding:5px 10px;border-radius:999px}'
  +'.lmn-v2 .lmn-plan{margin-bottom:22px}.lmn-v2 .lmn-plan h3{color:#0B6E4F}'
  +'.lmn-h3{margin-top:4px!important}.lmn-hint{font-size:.82rem;color:#77857B;margin:-4px 0 10px}'
  +'.lmn-card{border:1px solid #E2EAE4;border-radius:14px;margin-bottom:10px;background:#fff;overflow:hidden}'
  +'.lmn-card summary{list-style:none;cursor:pointer;padding:14px 44px 14px 16px;position:relative;display:block}'
  +'.lmn-card summary::-webkit-details-marker{display:none}'
  +'.lmn-card summary:after{content:"+";position:absolute;right:16px;top:14px;font-size:1.4rem;line-height:1;color:#12936A;font-weight:700}'
  +'.lmn-card[open] summary:after{content:"–"}.lmn-card[open] summary{background:#F7FAF8;border-bottom:1px solid #E2EAE4}'
  +'.lmn-cn{display:block;font-weight:700;color:#15211C;font-size:1.05rem}'
  +'.lmn-pq{display:block;color:#4A574F;font-size:.9rem;margin-top:4px;line-height:1.45}'
  +'.lmn-cb{padding:14px 16px 6px}.lmn-mec{color:#15211C;line-height:1.55;margin:0 0 14px}'
  +'.lmn-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}'
  +'.lmn-bloc{border-radius:10px;padding:10px 12px;margin-bottom:10px;background:#F7FAF8}'
  +'.lmn-bt{font-size:.72rem;font-weight:800;letter-spacing:.06em;text-transform:uppercase;margin-bottom:6px}'
  +'.lmn-bloc ul{margin:0;padding-left:18px}.lmn-bloc li{color:#2c3a33;line-height:1.45;margin-bottom:5px;font-size:.93rem}'
  +'.lmn-bloc.ok{background:#EEF7F1}.lmn-bloc.ok .lmn-bt{color:#0B6E4F}'
  +'.lmn-bloc.ko{background:#FBF1EE}.lmn-bloc.ko .lmn-bt{color:#A2462F}'
  +'.lmn-bloc.cp .lmn-bt{color:#8A6D12}.lmn-bloc.cp{background:#FBF6E6}'
  +'.lmn-bloc.an .lmn-bt{color:#35506B}.lmn-bloc.an{background:#F1F4F8}.lmn-bloc.an li span{display:block;color:#5B6875;font-size:.86rem}'
  +'.lmn-doc{border:1px solid #E2EAE4;border-radius:14px;padding:14px 16px;margin:18px 0 6px}.lmn-doc p{color:#15211C;line-height:1.55;margin:0 0 8px}.lmn-doc ul{margin:0;padding-left:20px}.lmn-doc li{color:#2c3a33;margin-bottom:3px}'
  +'@media(max-width:560px){.lmn-grid{grid-template-columns:1fr}.lmn-v2{padding:18px 14px}}'
  +'.lmn-tip{display:block;margin-top:8px;padding:8px 10px;background:#fff;border-left:3px solid #12936A;border-radius:6px;color:#15211C;font-size:.94rem}'
  +'.lmn-plan{background:#F1F7F3;border-radius:14px;padding:14px 18px}.lmn-plan p{margin:0 0 6px;color:#4A574F}.lmn-plan ol{margin:0;padding-left:22px}.lmn-plan li{margin-bottom:6px;color:#15211C;line-height:1.5}'
  +'.lmn-fam{display:block;font-size:.66rem;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#12936A;margin-bottom:2px}'
  +'.lmn-alerte{background:#FBEAE5;border:1px solid #E9B9AA;color:#7a2f1c;border-radius:10px;padding:12px 14px;margin:0 0 12px;line-height:1.5}'
  +'.lmn-renvoi{background:#F1F7F3;border:1px dashed #12936A;border-radius:10px;padding:12px 14px;margin:0 0 16px;color:#15211C;line-height:1.5}'
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

window.fatPistes=fatPistes; window.lmnVisibles=lmnVisibles; window.lmnFullHTML=lmnFullHTML; window.lmnTeaserHTML=lmnTeaserHTML;
})();
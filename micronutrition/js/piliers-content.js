/* ============================================================
   Mehdia — Contenu pédagogique des 7 piliers + Hormones
   ------------------------------------------------------------
   Consommé par piliers/pilier.html (?p=slug).
   Source : DU MAPS 2026 — synthèses dans micronutrition/cours/.
   ============================================================ */
var PILIERS = {

  'tube-digestif': {
    slug: 'tube-digestif', n: 1, icon: 'sprout',
    title: 'Tube digestif & microbiote',
    sub: 'Pilier 1 — Castronovo / Balon-Perin',
    hook: 'Votre tube digestif n\'est pas un simple tuyau : c\'est une barrière sophistiquée qui décide ce qui entre dans votre corps. Avec 500 millions de neurones et un microbiote unique, il conditionne votre immunité, votre énergie et votre humeur.',
    sections: [
      { title: 'Un jardin microscopique qui vous fait vivre',
        body: 'Le tube digestif est un long tuyau (9 mètres) avec deux missions opposées : <strong>absorber les bons nutriments</strong> ET <strong>rejeter les envahisseurs</strong>. Un péager vigilant. Le microbiote, ce sont les milliards de bactéries qui vivent dans votre côlon — un jardin microscopique. Bien entretenu, il devient votre meilleur allié en produisant des molécules bénéfiques (comme le butyrate qui nourrit vos cellules intestinales). Mal entretenu, il fermente et perturbe l\'organisme entier.' },
      { title: 'Un deuxième cerveau',
        body: 'Le système nerveux digestif possède <strong>500 millions de neurones</strong> — autant que le cerveau d\'un chien. Il commande chaque étape de la digestion et converse sans cesse avec votre cerveau via le nerf vague. Quand vous êtes stressé, votre ventre le sait tout de suite.' },
      { title: 'Pourquoi c\'est central',
        body: '<ul><li><strong>80 % de vos cellules immunitaires</strong> les plus efficaces se trouvent le long de l\'intestin.</li><li>Une digestion incomplète crée fermentation, dysbiose et inflammation chronique de bas grade → résistance à l\'insuline.</li><li>Le stress, les émotions et l\'alimentation affectent directement la digestion — et inversement.</li><li>Beaucoup de maladies chroniques (obésité, dépression, auto-immunité, Alzheimer) ont souvent une origine intestinale.</li></ul>' },
      { title: 'Les signaux qu\'il faut écouter',
        body: '<ul><li>Ballonnements rapides (évoque une pullulation bactérienne du grêle, SIBO) ou lents (dysbiose colique)</li><li>Fatigue post-repas, transit irrégulier, lourdeur le soir</li><li>Reflux gastrique chronique, antibiothérapies répétées (surtout enfance)</li><li>Stress chronique, émotions refoulées</li></ul>' }
    ],
    quizSlug: 'tube-digestif',
    sources: 'Cours n°9 — Pilier 1 Tube Digestif (Pr V. Castronovo, DU MAPS 2026) ; Cours n°23-24 Microbiote (Dr S. Balon-Perin).'
  },

  'energie': {
    slug: 'energie', n: 2, icon: 'flame',
    title: 'Énergie, mitochondrie & stress oxydant',
    sub: 'Pilier 2 — Castronovo',
    hook: 'Vos mitochondries sont les petites usines énergétiques de chaque cellule. Quand elles tournent bien, vous avez vitalité, clarté mentale, immunité robuste. Quand elles souffrent, vous traînez une fatigue chronique et vous vieillissez plus vite.',
    sections: [
      { title: 'Vos centrales électriques cellulaires',
        body: 'Chaque cellule contient des <strong>milliers de mitochondries</strong>, particulièrement nombreuses dans le cœur (40 % du volume), le cerveau (15 %) et les muscles. Elles transforment l\'énergie de vos aliments en <strong>ATP</strong> — la « monnaie énergétique » qu\'utilise votre organisme pour chaque geste, chaque pensée, chaque battement cardiaque. Vous en consommez l\'équivalent de votre poids chaque jour.' },
      { title: 'Une multiplication par 18 de la production d\'énergie',
        body: 'Avant l\'apparition des mitochondries (il y a 1,6 milliard d\'années), le glucose produisait 2 ATP. Aujourd\'hui, grâce à elles, 36-38 ATP. C\'est cette révolution qui a permis l\'émergence du cerveau humain et des formes de vie complexes.' },
      { title: 'Bien plus que de l\'énergie',
        body: 'Vos mitochondries contrôlent la <strong>thermogenèse</strong> (chaleur du corps), la synthèse des <strong>hormones stéroïdiennes</strong> (œstrogènes, testostérone, cortisol), l\'élimination des toxines, la régulation du calcium intracellulaire, et même la décision de vie ou de mort cellulaire.' },
      { title: 'Les signaux d\'épuisement mitochondrial',
        body: '<ul><li>Fatigue chronique, intolérance à l\'effort, récupération lente</li><li>Brouillard mental, troubles de la concentration</li><li>Sensibilité excessive au bruit, à la lumière</li><li>Crampes, douleurs musculaires, infections fréquentes</li><li>Vieillissement perceptible accéléré</li></ul>' }
    ],
    quizSlug: 'energie',
    sources: 'Cours n°11 — Pilier Énergie / Mitochondrie (Pr V. Castronovo, DU MAPS 2026).'
  },

  'acides-gras': {
    slug: 'acides-gras', n: 3, icon: 'sparkle',
    title: 'Acides gras (oméga 3 / 6 / 9)',
    sub: 'Pilier 3 — Castronovo',
    hook: 'Les acides gras sont les briques de vos membranes cellulaires et les précurseurs de puissants médiateurs d\'inflammation. L\'équilibre entre oméga-6 et oméga-3 détermine si votre corps produit une inflammation utile ou destructrice. En Occident, ce rapport est déséquilibré : 15-50:1 au lieu de 1-5:1.',
    sections: [
      { title: 'Deux fonctions vitales : structure et information',
        body: '<strong>Structurale</strong> : les acides gras forment les membranes de vos 1 000 milliards de cellules. Trop rigides (saturées), elles bloquent les signaux. Trop fluides (polyinsaturées), elles permettent le dialogue. <strong>Informationnelle</strong> : EPA, DHA et acide arachidonique sont les précurseurs des <strong>eicosanoïdes</strong> — messagers chimiques qui modulent l\'inflammation, la coagulation, la fertilité.' },
      { title: 'Pourquoi c\'est central',
        body: '<ul><li>Membranes rigides → les hormones (TSH, insuline, neurotransmetteurs) ne fonctionnent plus bien → hypothyroïdie, résistance à l\'insuline, troubles cognitifs.</li><li>Ratio ω6/ω3 déséquilibré = état pro-inflammatoire chronique → terrain d\'athérosclérose, dégénérescence cérébrale.</li><li>Le cerveau est l\'organe le plus riche en <strong>DHA</strong> : mémoire, apprentissage, prévention d\'Alzheimer.</li><li>Les oméga-3 ne sont pas seulement anti-inflammatoires : ils sont <strong>pro-résolutifs</strong> — ils commandent la fin de l\'inflammation et la réparation (résolvines).</li></ul>' },
      { title: 'Les signaux de déséquilibre',
        body: '<ul><li>Peau sèche, eczéma, cicatrisation lente</li><li>Articulations raides, douleurs inflammatoires</li><li>Difficulté de concentration, sautes d\'humeur, dépression</li><li>Hypertension, palpitations</li><li>Résistance à l\'insuline, surpoids</li></ul>' }
    ],
    quizSlug: 'acides-gras',
    sources: 'Cours n°12 — Pilier Acides Gras (Pr V. Castronovo, DU MAPS 2026). Réf. : Harris WS (Index Oméga-3, JAMA), Serhan C (Résolvines, Nature).'
  },

  'detox': {
    slug: 'detox', n: 4, icon: 'leaf',
    title: 'Foie, détoxication & méthylation',
    sub: 'Pilier 4 — Castronovo',
    hook: 'Votre foie est une véritable usine d\'épuration : 24 h/24, il neutralise les toxines de votre environnement (pesticides, métaux lourds, polluants). Ce travail quotidien épuise rapidement vos réserves en vitamines et minéraux. Fatigue, sensibilité au café, intolérances ? Autant de signaux d\'une détoxication débordée.',
    sections: [
      { title: 'Une station d\'épuration en 3 phases',
        body: '<strong>Phase I (CYP450)</strong> : « accrocher un crochet » — votre foie oxyde la molécule toxique pour créer un point d\'attache. <strong>Phase II (conjugaison)</strong> : « faire un sac poubelle » — il fixe une molécule hydrosoluble (acide glucuronique, sulfate, glutathion) pour rendre la toxine inerte. <strong>Phase III (rein)</strong> : « jeter à la poubelle » — élimination par l\'urine.' },
      { title: 'Pourquoi c\'est central',
        body: '<ul><li><strong>Première barrière</strong> : toute l\'absorption intestinale passe par le foie avant la circulation générale.</li><li>Protège le cerveau et les mitochondries — les toxines s\'accumulent dans les graisses, notamment les cellules nerveuses.</li><li>Dépend de micronutriments précis : fer, B2/B5/B6/B9/B12, antioxydants, glycine, taurine — souvent déficitaires.</li><li>La <strong>méthylation</strong> est centrale : un dérèglement (MTHFR, B12 basse) impacte hormones, neurotransmetteurs, ADN.</li></ul>' },
      { title: 'Les signaux d\'un foie débordé',
        body: '<ul><li>Fatigue chronique (souvent premier signe)</li><li>Sensibilité exagérée à l\'alcool, au café, aux parfums synthétiques</li><li>Intolérances multiples alimentaires ou chimiques</li><li>Brouillard mental, mauvaise récupération post-stress</li><li>Troubles du sommeil, sudations nocturnes</li><li>Migraines fréquentes sans cause claire</li></ul>' }
    ],
    quizSlug: 'detox',
    sources: 'Cours MAPS 2026 — Détoxication, Métaux lourds, Méthylation (Pr V. Castronovo).'
  },

  'immunite': {
    slug: 'immunite', n: 5, icon: 'pulse',
    title: 'Immunité & inflammation',
    sub: 'Pilier 5 — Castronovo',
    hook: 'Votre système immunitaire est votre armée intérieure. L\'inflammation aiguë est un « feu bénéfique » qui détruit les ennemis. Mais quand ce feu ne s\'éteint pas, vous entrez dans une inflammation chronique silencieuse — le terreau des maladies modernes.',
    sections: [
      { title: 'Trois étages de défense',
        body: '<strong>Les barrières</strong> (peau, muqueuses) = la première ligne. <strong>L\'immunité innée</strong> réagit immédiatement, sans finesse. <strong>L\'immunité adaptative</strong> reconnaît précisément l\'ennemi et s\'en souvient. Quand tout fonctionne, l\'inflammation s\'allume, élimine, puis <strong>s\'éteint activement</strong> (résolution). Aujourd\'hui, elle s\'éteint mal et devient chronique à bas bruit : pas de rougeur visible, juste une fatigue, des douleurs, une susceptibilité infectieuse.' },
      { title: 'Pourquoi c\'est central',
        body: '<ul><li>Toutes les maladies chroniques modernes (diabète, cardiovasculaire, neurodégénérescence, cancer, auto-immunité) reposent sur une <strong>inflammation chronique non résolue</strong>.</li><li>L\'équilibre des acides gras membranaires détermine si l\'inflammation s\'éteint ou s\'auto-amplifie.</li><li>Le microbiote intestinal dysbiosé → endotoxémie métabolique → inflammation systémique persistante.</li></ul>' },
      { title: 'Les signaux d\'alerte',
        body: '<ul><li>Infections à répétition malgré une hygiène normale</li><li>Douleurs chroniques diffuses (articulations, muscles)</li><li>Allergies, eczéma, rhinites</li><li>Fatigue persistante, brouillard mental</li><li>Intolérances alimentaires multiples</li><li>Antécédents inflammatoires (fausses couches, thromboses)</li></ul>' }
    ],
    quizSlug: 'immunite',
    sources: 'Cours Immunité & Inflammation (Pr V. Castronovo, DU MAPS 2025/2026).'
  },

  'glucose-insuline': {
    slug: 'glucose-insuline', n: 6, icon: 'flame',
    title: 'Glucose & insuline',
    sub: 'Pilier 6 — Castronovo / Dr A. Lucas',
    hook: 'L\'insuline est le chef d\'orchestre de votre métabolisme. Quand ce système s\'enraye — la résistance à l\'insuline — votre corps accumule les graisses, la fatigue s\'installe, et le risque de maladies chroniques explose. La bonne nouvelle : c\'est largement <strong>réversible</strong>.',
    sections: [
      { title: 'Le chef d\'orchestre du sucre',
        body: 'Chaque fois que vous mangez, votre pancréas libère de l\'<strong>insuline</strong> pour escorter le glucose dans vos cellules. Mais quand le système se dérègle — trop de pics rapides, trop souvent — vos cellules deviennent « <strong>sourdes</strong> » à l\'insuline. Le pancréas crie plus fort (hyperinsulinisme). Résultat : le sucre reste dans le sang et l\'excès se transforme en graisse stockée, surtout au ventre.' },
      { title: 'Pourquoi c\'est central',
        body: '<ul><li><strong>Énergie</strong> : l\'insuline commande si votre corps brûle ou stocke.</li><li><strong>Poids</strong> : hyperinsulinisme = stockage adipeux abdominal (silhouette « pomme »).</li><li><strong>Hormones</strong> : suractive → dérègle hormones sexuelles, thyroïde, surrénales.</li><li><strong>Cognition</strong> : pics et creux glycémiques fragmentent la concentration.</li><li><strong>Longévité</strong> : cause #1 du syndrome métabolique et du diabète type 2.</li></ul>' },
      { title: 'Les signaux à connaître',
        body: '<ul><li>Fringales sucre/féculents en fin d\'après-midi</li><li>Coup de fatigue 30-60 min après les repas</li><li>Prise de poids ventre (silhouette « pomme »)</li><li>Sommeil perturbé, réveils vers 3-4 h</li><li>Antécédents familiaux : diabète, obésité, hypertension</li><li>Femmes : cycles irréguliers, SOPK, acné, pilosité excessive</li></ul>' }
    ],
    quizSlug: 'glucose-insuline',
    sources: 'Cours 13 — Glucose & Insuline (Pr V. Castronovo) ; Cours 21 — Surpoids & Obésité (Dr A. Lucas).'
  },

  'mineraux-vitamines': {
    slug: 'mineraux-vitamines', n: 7, icon: 'sparkle',
    title: 'Minéraux, vitamines & oligoéléments',
    sub: 'Pilier 7 — Transversal MAPS',
    hook: 'Vos enzymes, hormones et neurotransmetteurs n\'existent pas sans cofacteurs : fer, zinc, magnésium, sélénium, iode, vitamines D, B9, B12, C… Les sols se sont appauvris depuis 1950, et l\'alimentation moderne aggrave les carences. La plupart des français présentent au moins une carence subclinique.',
    sections: [
      { title: 'Les clés qui font tourner les machines',
        body: 'Imaginez une usine flambant neuve, mais sans les clés pour démarrer ses machines. C\'est ce qui se passe quand vous manquez de magnésium, de B12 ou de zinc : vos protéines sont là, mais elles ne fonctionnent qu\'à moitié. Les minéraux et vitamines sont les <strong>cofacteurs</strong> sans lesquels rien ne marche.' },
      { title: 'Pourquoi c\'est central',
        body: '<ul><li>Une carence subclinique reste longtemps invisible — mais elle freine l\'énergie, l\'immunité, la cognition, la fertilité.</li><li>Un fruit ou un légume contient aujourd\'hui <strong>30 à 80 % moins de minéraux qu\'en 1950</strong> (sols appauvris).</li><li>Médicaments déplèteurs : pilule (B6, B9, B12, Zn, Mg), IPP (B12, Mg), statines (CoQ10), metformine (B12).</li><li>Les normes labo détectent le déficit franc, pas l\'insuffisance fonctionnelle.</li></ul>' },
      { title: 'Les signaux à reconnaître',
        body: '<ul><li>Fatigue chronique inexpliquée</li><li>Crampes, fourmillements, contractions musculaires</li><li>Cheveux qui chutent, ongles cassants, taches blanches</li><li>Infections à répétition</li><li>Anxiété, irritabilité, sommeil léger</li><li>Lèvres fissurées, langue lisse ou douloureuse</li></ul>' }
    ],
    quizSlug: 'mineraux-vitamines',
    sources: 'Compilation transversale DU MAPS 2026 (Pr V. Castronovo) — pilier traité dans chaque cours spécifique.'
  },

  'hormones-femme': {
    slug: 'hormones-femme', n: 8, icon: 'flower',
    title: 'Hormones féminines',
    sub: 'Module — Pr S. Merran',
    hook: 'Le système endocrinien est l\'orchestre de votre corps : thyroïde, surrénales, ovaires régulent ensemble votre énergie, votre poids, votre humeur, votre cycle, votre fertilité. Chez la femme, ces hormones impactent chaque aspect de la vie.',
    sections: [
      { title: 'L\'orchestre hormonal',
        body: 'Les hormones sont les <strong>messagers chimiques</strong> de votre corps. L\'<strong>hypothalamus</strong> est le maestro (cerveau), l\'<strong>hypophyse</strong> le chef d\'orchestre (relais central), et la thyroïde, les surrénales et les ovaires sont les instruments. Le résultat ? Une harmonie parfaite — ou une cacophonie de symptômes.' },
      { title: 'Pourquoi c\'est central pour les femmes',
        body: '<ul><li><strong>Énergie & poids</strong> : métabolisme, frilosité, prise de poids ventre</li><li><strong>Cycle & fertilité</strong> : régularité, symptômes prémenstruels</li><li><strong>Humeur & sommeil</strong> : anxiété, dépression, insomnies</li><li><strong>Peau & cheveux</strong> : sécheresse, chute</li><li><strong>Libido & bien-être sexuel</strong> : désir, lubrification</li><li><strong>Périménopause / ménopause</strong> : bouffées, irritabilité, sécheresse</li></ul>' },
      { title: 'Trois grandes étapes à comprendre',
        body: '<ul><li><strong>Cycle régulier (< 40 ans)</strong> : équilibre estradiol/progestérone, sensibilité aux carences (fer, B12, magnésium), SOPK chez certaines.</li><li><strong>Périménopause (40-55 ans)</strong> : cycles courts ou irréguliers, sueurs nocturnes, sautes d\'humeur, insomnies 3-4 h. L\'axe surrénalien prend le relais des ovaires.</li><li><strong>Ménopause confirmée (> 55 ans)</strong> : FSH > 30 mUI/L, prévention osseuse et cardio-métabolique prioritaires.</li></ul>' },
      { title: 'Les signaux à écouter',
        body: '<ul><li>Cycles irréguliers ou très douloureux</li><li>Bouffées de chaleur, sueurs nocturnes</li><li>Sautes d\'humeur, anxiété nouvelle</li><li>Sécheresse (peau, vagin), chute de cheveux</li><li>Prise de poids ventre, fatigue persistante</li><li>Libido en chute libre</li></ul>' }
    ],
    quizSlug: 'hormones-femme',
    sources: 'Cours 16 — Endocrinologie (Pr S. Merran, DU MAPS 2025/2026).'
  }

};

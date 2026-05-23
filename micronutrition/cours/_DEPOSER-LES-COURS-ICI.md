# Base de connaissance micronutrition

Déposez ici les cours de micronutrition (un fichier par sujet) au format
`.txt` ou `.md`.

## Étapes

1. Ajoutez vos fichiers de cours dans ce dossier, ex. `perimenopause.md`,
   `thyroide.md`, `resistance-insuline.md`, `vitamine-d.md`…
2. **Listez-les dans `manifest.json`**, par exemple :

   ```json
   ["perimenopause.md", "thyroide.md", "resistance-insuline.md"]
   ```

La fonction `functions/api/analyse.js` lit ce manifeste, charge chaque
cours, et s'en sert de **base de connaissance** pour l'IA : toutes les
recommandations s'appuient strictement sur leur contenu.

## Conseils

- Texte clair, structuré en sections (le format n'a pas besoin d'être parfait).
- N'y mettez aucune donnée personnelle de patientes.
- Sur Cloudflare Pages, les fonctions n'ont pas d'accès disque : c'est le
  manifeste qui permet de retrouver les fichiers.

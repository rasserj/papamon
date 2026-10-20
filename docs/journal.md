# Journal du projet PapaMon

Nouvelles entrées en haut. Chaque contributeur (humain ou IA) ajoute une ligne à chaque modification.

## 2026-10-18 (v0.2.1 - Tirage aléatoire de qualité sauvage)

- Implémentation du tirage aléatoire de la qualité des créatures sauvages (D: 50%, C: 30%, B: 14%, A: 5%, S: 1%).
- Application dynamique du multiplicateur de qualité aux statistiques (`hp`, `atk`, `def`, `spd`) des créatures sauvages générées.
- Mise à jour des documents `docs/qualite-et-progression.md` et `docs/journal.md`.

## 2026-10-18 (v0.2.1)

- Incrémentation du numéro de version visible à l'écran : **v0.2.1**.
- Intégration de la statistique de défense (`def`) et ajustement de la formule de dégâts : `dégâts = max(1, power * atk / (50 + def) * mult * (0.85 + rand * 0.15))`.
- Ajout de l'affichage de la qualité de la créature (`[C]`, `[B]`, etc.) dans la carte de combat.
- Ergonomie : retour automatique fluide vers l'exploration de la carte après un combat sans clic superflu.
- Mise à jour des documents `docs/moteur-de-combat.md` et `docs/compagnon.md`.

## 2026-10-18 (v0.2 - Fuite & Abandon)

- Ajout de l'option **Fuite** pour les combats sauvages (avec vérification comparative de vélocité/vitesse avant de quitter le combat).
- Ajout de l'option **Abandonner** pour les combats officiels/dresseurs (met fin immédiatement au combat sur une défaite).
- Mise à jour de la documentation `docs/moteur-de-combat.md`.

## 2026-10-18 (v0.2)

- Découpage des données de jeu en fichiers JSON sous `/data` (`types.json`, `moves.json`, `creatures.json`, `maps/campagne.json`).
- Extraction du style global dans `/css/style.css`.
- Modularisation du code en JavaScript ES modules (`/js/sprites.js`, `/js/map.js`, `/js/combat.js`, `/js/main.js`).
- Implémentation de la carte en tuiles (Campagne), du déplacement du héros, des collisions et des rencontres aléatoires dans les hautes herbes.
- Prochaine étape : v0.3 (système de capture, équipe de compagnons et persistance locale).

## 2026-10-18

- Dépôt GitHub `rasserj/papamon` créé, page de test publiée avec GitHub Pages.
- Cahier des charges v0.1 rédigé (voir `cahier-des-charges.md`).
- Décisions : pixel art 16×16, univers nature avec biomes, jeu web téléphone + PC.
- Prochaine étape : v0.1 du jeu, un combat 1 contre 1 jouable.

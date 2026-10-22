# Journal du projet PapaMon

Nouvelles entrées en haut. Chaque contributeur (humain ou IA) ajoute une ligne à chaque modification.

## 2026-10-18 (v0.2.7 - Gestion de l'Endurance, Effort & Action Reprendre son souffle)

- Incrémentation officielle de la version affichée : **v0.2.7**.
- Ajout du coût en effort (`cost`) pour chaque attaque dans `data/moves.json`.
- Prise en compte de la qualité pour l'effort maximal (`maxEffort`).
- Consommation dynamique de l'effort lors du lancement des attaques en combat et mise à jour de l'affichage de l'effort dans la carte de combat (`PV X/Y · Effort A/B`).
- Désactivation automatique des attaques dans le sélecteur si l'effort disponible est insuffisant (« - Insuffisant »).
- Ajout de l'action **Reprendre son souffle** (+35 effort), accessible uniquement sous condition de bénéfice intégral (`maxEffort - effort >= 35`).
- Récupération passive d'effort en combat pour les créatures vivantes en réserve (+10 effort par tour).
- Récupération passive d'effort lors des déplacements sur la carte (+1 effort par pas).
- Adaptation de l'IA adverse pour consommer de l'effort et reprendre son souffle en cas d'épuisement.
- Réinitialisation de l'effort de l'équipe lors d'un K.O. collectif.
- Mise à jour de `index.html`, `data/moves.json`, `js/combat.js`, `js/map.js`, `js/main.js` et de la documentation (`docs/moteur-de-combat.md`, `docs/compagnon.md`, `docs/journal.md`).

## 2026-10-18 (v0.2.6 - Persistance des PV & Onglet Options du menu)

- Incrémentation officielle de la version affichée : **v0.2.6**.
- Implémentation de la persistance des PV des compagnons de l'équipe : les dégâts subis en combat sont conservés lors du changement de créature et après la fin des combats.
- Soin automatique de l'équipe en cas de défaite totale (K.O. collectif).
- Ajout de l'onglet **Options** dans le menu du jeu sur la carte, permettant d'activer/désactiver la visibilité du mécanisme d'effort/endurance (activé par défaut).
- Affichage de la jauge d'endurance dans la fiche détaillée des compagnons lorsque l'option est activée.
- Mise à jour de `index.html`, `js/combat.js`, `js/main.js` et de la documentation (`docs/moteur-de-combat.md`, `docs/compagnon.md`, `docs/journal.md`).

## 2026-10-18 (v0.2.5 - Menu du jeu sur carte, Réordonnancement d'équipe & Changement de compagnon en combat)

- Incrémentation officielle de la version affichée : **v0.2.5**.
- Correction et activation effective des fréquences d'apparition des qualités (D: 50%, C: 30%, B: 14%, A: 5%, S: 1%) via `data/qualities.json`.
- Maintien exact de la position du joueur sur la carte lors du retour de combat (à l'endroit où le combat a débuté).
- Ajout d'un bouton « START / MENU » sur la carte permettant d'ouvrir le menu du jeu, d'examiner et de réordonner les compagnons de l'équipe (boutons ▲ / ▼).
- Ajout de la possibilité de réordonner l'équipe et de changer la créature active pendant un combat via l'action « Envoyer X au combat » (coûte un tour d'action).
- Mise à jour de `index.html`, `css/style.css`, `js/combat.js`, `js/main.js`, `js/map.js` et de la documentation (`docs/moteur-de-combat.md`, `docs/compagnon.md`, `docs/journal.md`).

## 2026-10-18 (v0.2.4 - Menu d'action en combat & Observation de l'équipe et des caractéristiques)

- Incrémentation officielle de la version affichée : **v0.2.4**.
- Implémentation du menu principal d'actions en combat avec 3 options : **Attaquer** (sélecteur d'attaques), **Créatures** (sélecteur d'équipe et observation) et **Fuire / Abandonner**.
- Affichage du résumé de l'équipe de compagnons (jusqu'à 6 créatures) avec statut en combat.
- Ajout de la vue d'observation détaillée des caractéristiques d'une créature choisie (PV, attaque, défense, vitesse, liste des attaques connues et détails d'évolution).
- Intégration de boutons de navigation « Retour » dans toutes les sous-vues.
- Mise à jour de `index.html`, `css/style.css`, `js/combat.js`, `js/main.js` et de la documentation (`docs/moteur-de-combat.md`, `docs/journal.md`).

## 2026-10-18 (v0.2.3 - Fréquence des qualités & Position sur carte après combat)

- Incrémentation officielle de la version affichée : **v0.2.3**.
- Externalisation des probabilités d'apparition des qualités et multiplicateurs dans un fichier JSON dédié (`data/qualities.json`).
- Chargement et injection des données de qualités dans le moteur de combat pour la génération des rencontres sauvages.
- Gestion du retour de combat : le joueur retourne au point de départ / centre de la carte (`playerStart`) à l'issue de chaque combat (victoire, fuite ou abandon).
- Mise à jour de `index.html` et de la documentation (`docs/moteur-de-combat.md`, `docs/journal.md`).

## 2026-10-18 (Incrémentation v0.2.2)

- Incrémentation officielle de la version affichée : **v0.2.2**.
- Validation et mise à jour de la documentation dans `docs/qualite-et-progression.md`, `docs/compagnon.md` et `docs/moteur-de-combat.md`.

## 2026-10-18 (Validation des décisions de progression & évolution)

- Documentation des décisions validées dans `docs/qualite-et-progression.md` :
  - Qualité sauvage visible dès le combat (`[D]`, `[C]`, `[B]`, `[A]`, `[S]`).
  - Aucun gain d'expérience pour les compagnons en réserve (0 XP).
  - Renommage et spécification de la fusion en « progression issue de la vie en groupe » (conservation du niveau/stats/trait du compagnon principal).
  - Prise en compte de l'évolution spécifique par espèce (niveau, objet ou biome) et ajout des structures d'évolution dans `data/creatures.json`.

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

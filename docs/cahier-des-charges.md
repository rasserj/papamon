# Cahier des charges – PapaMon (pokémon-like, projet perso)

*Version 0.1 – brouillon à compléter à deux. Les points marqués **[Décidé]** viennent de Jérémy, les points marqués **[Proposition]** sont à valider ou à changer.*

## 1. Vision

Un jeu de créatures à collectionner, au tour par tour, jouable dans le navigateur sur smartphone comme sur PC. Projet personnel, non commercial, avec un univers, des créatures et des graphismes **originaux**.

- **[Décidé]** Jeu web, jouable sur téléphone et sur PC.
- **[Décidé]** Usage personnel, non commercial.
- **[Décidé]** Aucun contenu Nintendo/Pokémon : ni noms, ni designs, ni sprites, ni musiques, ni code.

**Univers [Décidé]** : dans l’esprit des premiers jeux Pokémon, très axé nature. On part de villes et de villages, puis on s’aventure dans des biomes variés :

- Campagne, forêts, lacs et rivières
- Mers, îles et archipels
- Montagnes, grottes et souterrains
- Plongée sous-marine
- Exploration spatiale

Chaque biome a ses propres créatures et son décor, et peut demander une capacité pour y accéder (nager, plonger, escalader, voler). **[Proposition]** On ouvre les biomes un par un en commençant par la campagne, de sorte que le jeu reste jouable à chaque étape ; l’espace, le plus exotique, vient en dernier.

## 2. Contraintes de projet

- **[Décidé]** Réalisable depuis un smartphone : pas besoin d’un poste de dev toujours disponible.
- **[Décidé]** Si possible sans abonnement payant (hébergement et outils gratuits).
- **[Décidé]** Ce document doit permettre à **n’importe quel outil ou contributeur** (chat IA, agent de code, humain) de reprendre le travail sans contexte oral.
- **[Proposition]** Aucune étape de compilation : on édite un fichier, on recharge la page, ça marche.

## 3. Périmètre par étapes

Chaque étape doit produire quelque chose de jouable et de testable sur téléphone.

| Étape | Contenu | Critère de réussite |
|---|---|---|
| v0.1 | Combat 1 contre 1 au tour par tour (attaque, PV, tour adverse, victoire/défaite) | Un combat se joue du début à la fin au doigt |
| v0.2 | Carte en tuiles, déplacement du héros, collisions | On se promène sur une petite carte |
| v0.3 | Rencontres aléatoires, capture, équipe de créatures | On capture et on garde une équipe |
| v0.4 | Sauvegarde locale + export/import | On ferme, on rouvre, on retrouve sa partie |
| v0.5 | Synchro avec le compte Google (voir §6) | La partie suit d’un appareil à l’autre |
| Plus tard | Évolutions, objets, dresseurs, histoire, sons | À définir ensemble |

## 4. Architecture technique

- **[Proposition]** Site statique : HTML + CSS + JavaScript (modules ES), sans bundler ni framework imposé.
- **[Proposition]** Affichage dans un `<canvas>` pour la carte et les combats, interface (menus, boutons) en HTML/CSS.
- **[Proposition]** Données du jeu dans des fichiers JSON séparés du code (créatures, attaques, types, cartes), pour qu’on puisse les modifier sans toucher à la logique.
- **[Proposition]** Structure de dossiers :

```
/index.html
/css/
/js/        (moteur, combat, carte, sauvegarde)
/data/      (creatures.json, moves.json, types.json, maps/)
/assets/    (sprites, sons)
/docs/      (ce cahier des charges, journal des changements)
```

- **[Proposition]** Application installable depuis le navigateur (PWA) avec un manifeste, plus tard.

## 5. Contrôles et affichage

- Tactile : croix directionnelle et boutons d’action affichés à l’écran.
- Clavier sur PC : flèches/WASD, touches d’action.
- Affichage adapté au format portrait et paysage ; zones tactiles assez grandes.
- **[Décidé]** Pixel art, mis à l’échelle sans flou ; sprites en 16×16.

## 6. Sauvegarde et synchronisation

- **[Décidé]** À terme, la progression est rattachée au compte Google de Jérémy, stockée dans son propre Drive (dossier caché réservé à l’appli), pour éviter un stockage tiers.
- **[Proposition]** Trois paliers, sans rien refaire d’un palier à l’autre :
  1. Sauvegarde locale dans le navigateur.
  2. Export et import manuels d’un fichier de sauvegarde.
  3. Synchro Google Drive ; en cas de conflit, la sauvegarde la plus récente l’emporte au début.
- **[Proposition]** Format de sauvegarde : un seul fichier JSON avec un numéro de version (`schemaVersion`) pour pouvoir faire évoluer le format.

Contenu minimal de la sauvegarde : équipe, objets, position sur la carte, progression, date de dernière modification.

## 7. Règles sur les contenus

- Créatures, noms, personnages et univers : **créés pour ce projet**.
- Graphismes : packs libres de droits (CC0 ou licence compatible) ou dessins originaux ; noter la source et la licence de chaque asset dans `/docs/credits.md`.
- Ne jamais copier des ressources extraites d’un jeu existant.
- Les mécaniques générales (tour par tour, capture, types) sont libres ; les reprendre telles quelles n’est pas un problème, contrairement au contenu protégé.

## 8. Travailler depuis un smartphone

- **[Décidé]** Le projet vit dans un dépôt GitHub, avec publication gratuite du site (GitHub Pages).
- Modifications possibles depuis le navigateur du téléphone (éditeur web du dépôt) ou via un chat IA qui produit des fichiers à coller.
- Chaque modification reste petite et testable : un fichier ou une fonctionnalité à la fois.
- Un fichier `/docs/journal.md` note ce qui a été fait et ce qui reste à faire, pour passer le relais d’un outil à l’autre.

## 9. Consignes pour tout contributeur (humain ou IA)

1. Lire ce document en entier avant de modifier quoi que ce soit.
2. Ne pas ajouter de dépendance ni d’étape de compilation sans l’accord de Jérémy.
3. Garder le code lisible et commenté en français ou en anglais, de façon cohérente.
4. Séparer données et logique : les créatures et attaques vont dans `/data`.
5. Tester l’affichage sur petit écran tactile.
6. Mettre à jour `/docs/journal.md` à chaque modification.
7. Ne jamais introduire de contenu protégé (voir §7).

## 10. Questions ouvertes à décider ensemble

- Nom du jeu ; biomes à ouvrir en premier et capacités nécessaires pour accéder aux autres (nager, plonger, escalader, voler).
- Palette de couleurs du pixel art (nombre de couleurs, ambiance propre à chaque biome).
- Nombre de types et règles d’efficacité entre types.
- Combats : attaques par créature (3 ou 4 ?), système de statut, objets en combat.
- Taille et structure du monde pour la v0.2.
- Langue du jeu (français seulement ou plusieurs langues).
- Musique et sons : oui ou non au début.
- Joueur unique, ou un jour échanges et combats entre amis ?

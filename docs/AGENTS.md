# AGENTS.md – consignes pour les agents IA et les contributeurs

Projet : **PapaMon**, un jeu de créatures à collectionner en pixel art, jouable dans le navigateur sur téléphone et sur PC. Projet personnel, non commercial.

## Avant toute modification

1. Lire `docs/cahier-des-charges.md` en entier : il décrit la vision, les décisions prises et les étapes.
2. Lire les dernières entrées de `docs/journal.md` pour savoir où en est le projet.

## Règles de travail

- Site statique : HTML, CSS et JavaScript (modules ES). Pas d’étape de compilation et pas de nouvelle dépendance sans l’accord du propriétaire du dépôt.
- Les données du jeu (créatures, attaques, types, cartes) vont dans des fichiers JSON dans `/data`, séparés du code.
- Priorité au tactile : tout doit fonctionner au doigt sur un petit écran, et aussi au clavier sur PC.
- Pixel art en 16×16, mis à l’échelle sans flou.
- Contenu 100 % original : jamais de noms, designs, sprites, musiques ou code issus de Nintendo/Pokémon ou d’un autre jeu existant. Les assets libres sont acceptés, avec leur source et leur licence notées dans `docs/credits.md`.
- Changements petits et testables : une fonctionnalité ou un fichier à la fois. Une branche (et une pull request) par tâche, avec une description de ce qui change et de la façon de le tester.
- Ne pas modifier le cahier des charges de ta propre initiative : propose le changement dans la pull request.
- Langue : français pour les messages, la documentation et les commentaires du code.

## Après chaque modification

Ajouter une entrée **en haut** de `docs/journal.md` : la date, ce qui a été fait, et la prochaine étape logique.

## Étape en cours

v0.1 : un combat 1 contre 1 au tour par tour jouable au doigt (attaque, PV, tour adverse, victoire ou défaite).

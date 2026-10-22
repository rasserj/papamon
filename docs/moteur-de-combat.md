# Moteur de combat – état v0.2.7

*Ce document décrit ce que fait réellement le code de `js/combat.js` (v0.2.7).*

## 1. Vue d’ensemble

Combat **1 contre 1 au tour par tour**.
Un combat peut être :
- **Sauvage** (`isWild: true`) : déclenché par une rencontre dans les hautes herbes lors de l'exploration de la carte. La créature sauvage possède une qualité aléatoire tirée selon `data/qualities.json`.
- **Officiel / Dresseur** (`isWild: false`) : combat contre un dresseur ou une personne.

Chaque combat démarre avec les PV au maximum.

## 2. Déroulement d’un combat

1. **Choix du compagnon** (écran de sélection) ou démarrage automatique depuis l'exploration de la carte.
2. **Apparition** de l’adversaire (message de 1,2 s), puis les boutons d’attaque et d'action s’activent.
3. **Tour** : le joueur peut naviguer dans le menu principal d'actions (**Attaquer**, **Créatures**, ou **Fuire/Abandonner**).
   - Le menu **Créatures** permet de réordonner l'équipe (boutons ▲ / ▼), d'observer les fiches détaillées et d'envoyer un compagnon en réserve au combat (action « Envoyer au combat »). Changer de créature consomme le tour du joueur, laissant l'adversaire attaquer la créature entrante.
4. **Ordre d’action** : la créature avec la plus grande **vitesse** (`spd`) agit en premier. En cas d’égalité, tirage à pile ou face. L’ordre est fixé au début du tour.
5. **Chaque attaque / action** :
   - L'utilisation d'une attaque consomme de l'effort selon le coût (`cost`) spécifié pour le move.
   - Si l'effort est insuffisant pour lancer une attaque, celle-ci est indisponible. Le compagnon peut choisir l'action **Se reposer** pour regagner +35 effort.
   - Pour chaque attaque : message « X utilise Y ! », test de précision, calcul des dégâts (intégrant la défense de la cible), mise à jour de la barre de PV/Effort, message d’efficacité éventuel.
6. **Fin de combat** : retour automatique à la carte d'exploration au même point où le combat a débuté. Les PV restants de chaque compagnon de l'équipe sont conservés. En cas de K.O. de l'équipe entière, les compagnons sont soignés.

Pendant l’animation d’un tour, les boutons sont désactivés (verrou `busy`).

## 3. Options de fin de combat & Fuite / Abandon

- **Abandonner** (Combats officiels contre une personne) : met immédiatement fin au combat. Le combat se conclut par une défaite.
- **Fuire** (Combats contre une créature sauvage) :
  - **Comparaison de vélocité** : si la créature sauvage est strictement plus rapide (`foe.spd > me.spd`), elle attaque le joueur une fois avant que la fuite ne réussisse.
  - Si le joueur survit à cette attaque (ou si le joueur est au moins aussi rapide), la fuite réussit immédiatement et retourne automatiquement à la carte.

## 4. Formules (v0.2.4)

**Précision.** Un nombre aléatoire entre 0 et 100 est tiré. Si il dépasse la précision de l’attaque (`acc`), l’attaque rate (« Mais ça rate ! »). Une précision de 100 ne rate jamais.

**Multiplicateur de type** (`mult`) :

| Cas | Valeur |
|---|---|
| Le type de l’attaque bat le type de la cible | × 1,5 (« C’est très efficace ! ») |
| Le type de la cible résiste au type de l’attaque | × 0,5 (« Ce n’est pas très efficace… ») |
| Attaque sans type (Normal) ou autre combinaison (y compris même type) | × 1 |

Triangle : **Sylve** bat **Flot**, **Flot** bat **Braise**, **Braise** bat **Sylve**.

**Dégâts avec Statistique de Défense** (`def`) :

```
dégâts = max(1, arrondi( puissance × attaque ÷ (50 + défense_cible) × mult × (0,85 + aléa × 0,15) ))
```

- `puissance` : celle de l’attaque ; `attaque` : stat `atk` de l’attaquant ; `défense_cible` : stat `def` du défenseur.
- `aléa` : nombre aléatoire entre 0 et 1, donc un facteur entre 0,85 et 1,00.

## 5. Endurance, effort et fatigue (v0.2.7)

- **Statistique d'effort** (`effort` / `maxEffort`) : chaque créature dispose d'une réserve d'endurance. La valeur maximale (`maxEffort`) varie avec la qualité de la créature (multiplicateur de qualité).
- **Coût des attaques** (`cost`) : défini dans `data/moves.json` (ex: Charge = 10, Fouet-liane / Étincelle / Jet d'eau = 15).
- **Fatigue** : lorsqu'une créature a un niveau d'effort inférieur au coût d'un move, ce move est désactivé (« - Insuffisant »).
- **Action « Se reposer »** : disponible dans le sélecteur d'actions en combat, consomme un tour et régénère **+35 points d'effort** (dans la limite de `maxEffort`).
- **IA adverse** : l'adversaire gère également son effort. S'il n'a pas suffisamment d'effort pour utiliser une attaque disponible, il se repose automatiquement.
- **Réinitialisation** : l'effort est réinitialisé au maximum lors d'un soin complet de l'équipe (K.O. collectif).

## 6. Interface et affichage

- Version affichée à l'écran : **v0.2.7**.
- Affichage dynamique de l'effort dans la carte de combat (`PV X/Y · Effort A/B`) lorsque l'option est activée.
- Menu d'action hiérarchique avec sous-vues (Attaquer, Créatures/Équipe, Détails/Observation).
- Onglet **Options** dans le menu du jeu pour paramétrer la visibilité du mécanisme d'effort/endurance (visible par défaut).
- Réordonnancement de l'équipe et changement de créature active pendant le combat.
- Badge de qualité visible dans la carte du compagnon (ex: `[C]`).
- Barre de PV : verte au-dessus de 50 %, orange entre 20 % et 50 %, rouge en dessous.
- Commandes : boutons tactiles à l'écran ; sur PC, touches **1** et **2** pour les attaques, **F** ou **Échap** pour Fuire/Abandonner.

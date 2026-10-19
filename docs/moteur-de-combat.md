# Moteur de combat – état v0.2

*Ce document décrit ce que fait réellement le code de `js/combat.js` (v0.2).*

## 1. Vue d’ensemble

Combat **1 contre 1 au tour par tour**.
Un combat peut être :
- **Sauvage** (`isWild: true`) : déclenché par une rencontre dans les hautes herbes lors de l'exploration de la carte.
- **Officiel / Dresseur** (`isWild: false`) : combat contre un dresseur ou une personne.

Chaque combat démarre avec les PV au maximum.

## 2. Déroulement d’un combat

1. **Choix du compagnon** (écran de sélection) ou démarrage automatique depuis l'exploration de la carte.
2. **Apparition** de l’adversaire (message de 1,2 s), puis les boutons d’attaque et d'action s’activent.
3. **Tour** : le joueur choisit une attaque, la fuite ou l'abandon.
4. **Ordre d’action** : la créature avec la plus grande **vitesse** (`spd`) agit en premier. En cas d’égalité, tirage à pile ou face. L’ordre est fixé au début du tour.
5. **Chaque attaque** : message « X utilise Y ! », test de précision, calcul des dégâts, mise à jour de la barre de PV, message d’efficacité éventuel.
6. **Fin de combat immédiate** dès qu’une créature tombe à 0 PV, qu'un joueur fuit avec succès ou abandonne.

Pendant l’animation d’un tour, les boutons sont désactivés (verrou `busy`).

## 3. Options de fin de combat & Fuite / Abandon

- **Abandonner** (Combats officiels contre une personne) : met immédiatement fin au combat. Le combat se conclut par une défaite.
- **Fuire** (Combats contre une créature sauvage) :
  - **Comparaison de vélocité** : si la créature sauvage est strictement plus rapide (`foe.spd > me.spd`), elle attaque le joueur une fois avant que la fuite ne réussisse.
  - Si le joueur survit à cette attaque (ou si le joueur est au moins aussi rapide), la fuite réussit immédiatement et met fin au combat.

## 4. Formules

**Précision.** Un nombre aléatoire entre 0 et 100 est tiré. Si il dépasse la précision de l’attaque (`acc`), l’attaque rate (« Mais ça rate ! »). Une précision de 100 ne rate jamais.

**Multiplicateur de type** (`mult`) :

| Cas | Valeur |
|---|---|
| Le type de l’attaque bat le type de la cible | × 1,5 (« C’est très efficace ! ») |
| Le type de la cible résiste au type de l’attaque | × 0,5 (« Ce n’est pas très efficace… ») |
| Attaque sans type (Normal) ou autre combinaison (y compris même type) | × 1 |

Triangle : **Sylve** bat **Flot**, **Flot** bat **Braise**, **Braise** bat **Sylve**. Le triangle est symétrique : si A bat B, alors B résiste à A.

**Dégâts.**

```
dégâts = max(1, arrondi( puissance × attaque ÷ 50 × mult × (0,85 + aléa × 0,15) ))
```

- `puissance` : celle de l’attaque ; `attaque` : la stat `atk` de l’attaquant.
- `aléa` : nombre aléatoire entre 0 et 1, donc un facteur entre 0,85 et 1,00.

## 5. Interface et rythme

- Barre de PV : verte au-dessus de 50 %, orange entre 20 % et 50 %, rouge en dessous.
- Délais (millisecondes) : apparition 1 200 ; annonce d’attaque 800 ; coup 700 ; message d’efficacité 900 ; rate 900 ; K.O. 1 100.
- Commandes : boutons tactiles à l'écran ; sur PC, touches **1** et **2** pour les attaques, **F** ou **Échap** pour Fuire/Abandonner.

## 6. Ce qui reste à faire (v0.3 et après)

Coups critiques, bonus d’attaque de même type, statistique de défense, niveaux et expérience, statuts, capture, équipe de plusieurs compagnons, persistance locale (sauvegarde).

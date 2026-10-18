# Moteur de combat – état v0.1

*Ce document décrit ce que fait réellement le code de `index.html` (v0.1). Il sert de base pour proposer des améliorations. Les passages « Pistes » ne sont pas implémentés.*

## 1. Vue d’ensemble

Combat **1 contre 1 au tour par tour**. Le joueur choisit un compagnon (voir `compagnon.md`), l’adversaire est tiré au hasard parmi les 3 compagnons existants (il peut donc être identique à celui du joueur). Chaque combat démarre avec les PV au maximum ; rien n’est sauvegardé entre deux combats.

## 2. Déroulement d’un combat

1. **Choix du compagnon** (écran de sélection).
2. **Apparition** de l’adversaire (message de 1,2 s), puis les boutons d’attaque s’activent.
3. **Tour** : le joueur choisit une attaque, l’adversaire en choisit une au hasard parmi les siennes (tirage uniforme).
4. **Ordre d’action** : la créature avec la plus grande **vitesse** (`spd`) agit en premier. En cas d’égalité, tirage à pile ou face. L’ordre est fixé au début du tour.
5. **Chaque attaque** : message « X utilise Y ! », test de précision, calcul des dégâts, mise à jour de la barre de PV, message d’efficacité éventuel.
6. **Fin de combat immédiate** dès qu’une créature tombe à 0 PV : l’autre n’attaque pas ce tour-là. Message « X est K.O. ! », puis victoire ou défaite, et bouton **Rejouer** (retour au choix du compagnon).
7. Si personne n’est K.O. à la fin du tour, on recommence à l’étape 3.

Pendant l’animation d’un tour, les boutons sont désactivés (verrou `busy`).

## 3. Formules

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
- Pas de statistique de défense chez la cible pour l’instant.
- Au minimum 1 de dégât.

**Dégâts de base** (avant `mult` et aléa) :

| Compagnon | Charge (35) | Attaque de type (50) |
|---|---|---|
| Mousselin (atk 12) | 8,4 | 12 |
| Cendrille (atk 14) | 9,8 | 14 |
| Gouttelin (atk 11) | 7,7 | 11 |

Avec 40 à 46 PV de départ, un combat dure en général 3 à 6 attaques réussies par camp.

## 4. Interface et rythme

- Barre de PV : verte au-dessus de 50 %, orange entre 20 % et 50 %, rouge en dessous.
- Délais (millisecondes) : apparition 1 200 ; annonce d’attaque 800 ; coup 700 ; message d’efficacité 900 ; rate 900 ; K.O. 1 100.
- Le sprite touché clignote.
- Commandes : boutons tactiles ; sur PC, touches **1** et **2** pour les attaques.

## 5. Ce qui n’existe pas encore

Coups critiques, bonus d’attaque de même type, statistique de défense, niveaux et expérience, statuts (brûlure, sommeil…), changement de compagnon, objets, capture, fuite, priorité d’attaque, précision/esquive modifiables, IA qui choisit intelligemment (elle joue au hasard), sons.

## 6. Pistes d’amélioration (à discuter)

- **Équilibrage** : défense, critiques, plage d’aléa, durée moyenne d’un combat.
- **IA adverse** : préférer l’attaque efficace contre le type du joueur.
- **Profondeur** : statuts, attaques qui modifient les stats, priorité.
- **Lisibilité** : journal des derniers messages, affichage des dégâts infligés.
- **Données** : passer `TYPES`, `MOVES`, `CREATURES` dans `/data` en JSON (prévu pour la v0.2).

## 7. Évolutions décidées (non implémentées)

- Trois catégories de moves (attaque, défense, esquive), chacun avec une **vitesse d’exécution** qui se combine à la vitesse du compagnon et décide de l’ordre d’action ainsi que de l’efficacité des défenses et esquives.
- Une **fatigue masquée** (liée au move et au compagnon) qui affaiblit progressivement les moves, puis peut rendre un move impossible (message, tour perdu). Elle ne compte que dans les combats longs.
- Des **PV persistants** d’un combat à l’autre (aujourd’hui, chaque combat repart de PV pleins), avec des soins en combat (à la place d’un tour, par un move ou un objet, sur soi ou sur un autre compagnon), hors combat ou en établissements dédiés.
- Un compagnon à 0 PV (K.O.) ne se relève que par réanimation : moves rares avec coût en PV pour l’exécutant, objets, établissements spécialisés.
- Une statistique de **défense** (la formule de dégâts sera à revoir) et une **endurance** par compagnon.
- Des **traits de caractère** qui peuvent modifier les choix : entrer à la place d’un autre, remplacer un move défensif ou de soin par une attaque, envoyer un autre compagnon. Le trait prime sur la fatigue : le compagnon ne choisit jamais un move impossible.
- Un **gain d’expérience** à la fin de chaque combat, pour le vainqueur et, moins vite, pour le vaincu.

Détails : `attaques-fatigue-esquive.md`, `qualite-et-progression.md` et `traits-de-caractere.md`.

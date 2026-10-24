# Niveaux et expérience – spécification pour l’implémentation

*Ce document complète `qualite-et-progression.md` et le remplace sur la croissance des stats, qui n’est plus linéaire. Toutes les valeurs sont des **[Proposition]** de départ, à équilibrer. Destiné à un agent de code (Jules ou autre) : lire aussi `AGENTS.md`, `compagnon.md` et `traits-de-caractere.md`.*

## 1. Expérience gagnée en battant une créature

Pour chaque créature adverse `E` mise K.O., chaque compagnon bénéficiaire reçoit une part de :

```
XP(E) = arrondi( 12 × niveau(E) × F_niveau × F_qualité × F_combat × F_espèce × F_duel )   (minimum 1)
```

| Facteur | Règle |
|---|---|
| `F_niveau` | `niveau(E) ÷ niveau du bénéficiaire`, borné entre 0,5 et 2 |
| `F_qualité` | qualité de `E` : D 0,8 · C 1,0 · B 1,2 · A 1,5 · S 2,0 |
| `F_combat` | adversaire sauvage 1,0 · dresseur 1,5 |
| `F_espèce` | champ `difficulte` de l’espèce de `E` (entre 0,8 et 1,3, 1,0 par défaut) : plus la créature est dure à vaincre (évasive, défensive, rapide), plus elle rapporte |
| `F_duel` *(option)* | pour le compagnon qui porte le coup final : `1 + 0,2 × (1 − PV restants ÷ PV max)`, soit jusqu’à +20 % pour une victoire serrée. Pour les autres : 1 |

**Qui reçoit quoi :**

- Le compagnon qui porte le **coup final** : 100 % de `XP(E)`.
- Les autres compagnons **entrés au combat** pendant que `E` était en jeu : 50 %.
- Les compagnons restés en **réserve** sans jamais entrer : 0.
- Un compagnon **K.O. pendant le combat** (il est « vaincu » lui aussi) progresse quand même, mais à **40 %** de sa part.
- **Défaite totale** du joueur : chaque compagnon entré reçoit **40 %** de `XP(E)` pour chaque adversaire qui a combattu (pas de partage).
- Trait **intelligent** : +25 % sur la part finale du bénéficiaire.
- Un compagnon au niveau maximum (100 pour l’instant, simple paramètre) ne gagne plus d’expérience.

**Exemple.** Un Mousselin de niveau 12 bat un Cendrille sauvage de niveau 14, qualité B, difficulté 1,0 : `12 × 14 × 1,17 × 1,2 = 235 XP`. Contre un dresseur, `× 1,5 = 353 XP`. Si Mousselin avait perdu, il recevrait `40 % ≈ 94 XP`.

## 2. Progression d’un niveau à l’autre

Expérience nécessaire pour passer du niveau `n` au niveau `n + 1` : **`10 × n²`**. C’est de plus en plus difficile. Niveau maximum : **100**, défini par le paramètre `niveauMax` dans `data/progression.json` (jamais écrit en dur dans le code).

| Niveau `n` | XP pour le suivant | Victoires typiques* |
|---|---|---|
| 1 | 10 | 1 |
| 5 | 250 | ≈ 4 |
| 10 | 1 000 | ≈ 8 |
| 20 | 4 000 | ≈ 17 |
| 30 | 9 000 | ≈ 25 |
| 50 | 25 000 | ≈ 42 |
| 75 | 56 250 | ≈ 63 |
| 99 | 98 010 | ≈ 83 |

\* Contre un sauvage de même niveau, qualité C. Total pour aller du niveau 1 au niveau 100 : 3 283 500 XP (404 250 pour atteindre le niveau 50). Le surplus d’XP après un niveau est reporté ; plusieurs niveaux peuvent être gagnés d’un coup.

## 3. Effet d’une montée de niveau

### 3.1 Stats : croissance non linéaire, propre à chaque espèce

Pour chaque statistique (PV, attaque, défense, vitesse, endurance) :

```
stat(n) = référence × multiplicateur de qualité × ( 1 + gain × modificateur de trait × ((n − 1) ÷ (niveauMax − 1)) ^ courbe )
```

Chaque espèce définit, **pour chaque stat**, deux réglages :

| Réglage | Valeurs |
|---|---|
| `gain` (amplitude totale au niveau max) | faible 1,4 · moyen 2,0 · fort 2,8 |
| `courbe` (forme) | précoce 0,7 (monte vite puis se tasse) · régulière 1,0 · tardive 1,5 (démarre lentement puis accélère) |

À mi-parcours (niveau 50 sur 100, gain moyen), une stat précoce est à ×2,22 de sa valeur de départ, une stat tardive à ×1,70 ; toutes deux atteignent ×3,0 au niveau 100. L’amplitude totale reste donc la même qu’avec un maximum de 50 : seule la vitesse de croissance change (à gain et courbe égaux, chaque niveau apporte moins).

**Exemples de profils** (à mettre dans les données de chaque espèce) :

| Espèce | PV | Attaque | Défense | Vitesse | Endurance |
|---|---|---|---|---|---|
| Cendrille | faible, régulière | fort, précoce | faible, tardive | fort, régulière | moyen, tardive |
| Fougerin | fort, régulière | faible, régulière | fort, tardive | faible, précoce | moyen, régulière |
| Mousselin | moyen, régulière | moyen, régulière | moyen, précoce | faible, tardive | fort, tardive |

### 3.2 Influence du trait de caractère sur la croissance

Le trait multiplie le `gain` de certaines stats. **Cela remplace les bonus fixes de `traits-de-caractere.md` (rapide +15 %, endurant +20 %, costaud +15 %).**

| Trait | Modificateur de gain |
|---|---|
| Rapide | vitesse × 1,25 |
| Endurant | endurance × 1,25 |
| Costaud | PV × 1,25 |
| Belliqueux | attaque × 1,15 · défense × 0,9 |
| Prudent | défense × 1,15 · attaque × 0,9 |
| Peureux | vitesse × 1,1 · attaque × 0,9 |
| Compétiteur | attaque × 1,1 |
| Altruiste | PV × 1,1 |
| Intelligent | aucun (son effet est le +25 % d’XP) |

### 3.3 À chaque montée de niveau, dans cet ordre

1. Le niveau augmente ; les stats sont recalculées avec les formules ci-dessus.
2. **PV et endurance** : l’augmentation du maximum s’ajoute aussi à la valeur courante (si le compagnon n’est pas K.O.). Un compagnon K.O. n’est pas relevé par un niveau.
3. **Apprentissage** : chaque espèce a une table `apprentissage` (niveau, move). Tous les moves dont le niveau est atteint sont appris, dans l’ordre.
4. **Évolution** : si l’espèce a une évolution et que le niveau requis est atteint, le compagnon évolue (au plus une évolution par montée de niveau).
5. Un récapitulatif s’affiche : nouveau niveau, gain de chaque stat (les gains varient d’une stat à l’autre), moves appris, évolution.

### 3.4 Évolution

Champ `evolution` de l’espèce : `{ niveau, vers, traits: [{ trait, poids }] }`.

- L’espèce change (apparence, stats de référence, profils de croissance, table d’apprentissage). Niveau, XP, qualité et pourcentage de PV sont conservés.
- Le **trait peut changer** : tirage pondéré dans `traits` (on y inclut le trait actuel avec un poids pour qu’il puisse rester).
- Les moves déjà appris sont conservés.

## 4. Règles d’implémentation pour l’agent de code

1. **Piloté par les données.** Aucune constante dans le code : tout dans `data/progression.json` (`niveauMax`, facteurs d’XP, valeurs de `gain` et de `courbe`, modificateurs de trait) et dans les données d’espèces.
2. **Fonctions pures, testables**, dans un module `js/progression.js` : `xpPourNiveauSuivant(niveau)`, `xpRecompense(...)`, `statAuNiveau(espece, stat, niveau, qualite, trait)`, `appliquerXp(compagnon, xp)` (qui renvoie la liste des événements : niveaux gagnés, moves appris, évolution).
3. **Tests sans dépendance** : un script `tests/progression.test.mjs` exécutable avec `node` qui vérifie les exemples de ce document (235 XP, tableau des niveaux, ×2,22 et ×1,70 au niveau 50, 3 283 500 XP au total jusqu’au niveau 100).
4. **Site statique, aucune dépendance, aucune étape de compilation** (voir `AGENTS.md`). Les modules ES et `fetch` ne marchent pas en ouvrant le fichier directement : tester sur la page GitHub Pages.
5. **Sauvegarde** : ajouter `schemaVersion` et migrer une sauvegarde existante sans perdre la progression.
6. **Ne pas modifier les règles de combat** : seulement ajouter les niveaux et l’XP, et brancher la récompense à la fin du combat.
7. **Cas limites** : plusieurs niveaux d’un coup, niveau maximum, compagnon K.O. qui gagne de l’XP, arrondis (PV et endurance en entiers), aucune évolution définie.
8. **Mettre à jour** `docs/journal.md` et la section « État d’avancement » des fiches concernées.

## 5. Critères d’acceptation

- Les valeurs d’exemple de ce document sont reproduites par les tests.
- Deux espèces de profils différents n’ont pas les mêmes stats au niveau 50 ni au niveau 100.
- Modifier `niveauMax` dans `data/progression.json` suffit à changer le plafond : aucun 50 ni 100 ne reste en dur dans le code.
- Un compagnon intelligent gagne 25 % d’XP de plus qu’un autre dans la même situation.
- Un compagnon K.O. dans un combat gagné progresse à 40 % de sa part.
- Une défaite totale donne 40 % de l’XP, sans partage.
- Une évolution conserve niveau, XP, qualité et pourcentage de PV, et peut changer le trait.
- Une ancienne sauvegarde se charge toujours.

## 6. Prompt à donner à Jules

> Lis `AGENTS.md`, puis `docs/niveaux-et-experience.md`, `docs/compagnon.md`, `docs/qualite-et-progression.md` et `docs/traits-de-caractere.md`. Implémente la gestion des niveaux et de l’expérience telle que décrite dans `docs/niveaux-et-experience.md`, en respectant les règles de la section 4 et les critères de la section 5. Le niveau maximum est 100 et doit rester un simple paramètre des données. Commence par le module `js/progression.js`, les données `data/progression.json` et les tests, puis branche le tout sur la fin de combat. Ouvre une pull request décrivant ce qui change et comment le tester, et ajoute une entrée en haut de `docs/journal.md`.

## 7. Questions ouvertes

- **Courbe d’XP au-delà du niveau 50** : garder `10 × n²` (passer du niveau 99 au niveau 100 coûte 98 010 XP, environ 83 victoires contre un sauvage de même niveau) ou l’adoucir (par exemple `10 × n^1,8`, soit environ 33 victoires) ?
- **Amplitude des stats au niveau 100** : rester à ×3,0 (équilibre inchangé) ou l’augmenter ?
- Nombre maximum de moves connus par compagnon, et choix de celui à oublier quand la liste est pleine.
- Le `F_duel` est-il retenu ?
- Les valeurs de `difficulte` par espèce (et pas seulement par qualité) sont-elles fixées à la main ou dérivées des stats ?
- Les compagnons en réserve doivent-ils gagner un peu d’XP (par exemple 10 %) ?
- Faut-il une courbe d’XP différente selon la rareté de l’espèce ?

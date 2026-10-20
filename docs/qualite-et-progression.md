# Qualité, niveaux, évolution et rareté

*Les points marqués **[Décidé]** viennent de Jérémy. **[Proposition]** : valeur ou mécanique à équilibrer en jouant. **[À confirmer]** : interprétation à valider. Rien de ceci n’est encore implémenté.*

## 1. Décisions

- **[Décidé]** Chaque compagnon a une **qualité visible** : **D, C, B, A, S** (S est la meilleure). Elle préjuge de ses **stats de base** et de ses **stats max** (attaque, défense, endurance, vitesse…).
- **[Décidé]** Un compagnon **monte de niveau en combattant**, comme dans Pokémon, mais **le vaincu progresse aussi**, moins vite.
- **[Décidé]** Chaque niveau augmente les stats de base et les stats max. Monter de niveau est **de plus en plus difficile**.
- **[Décidé]** Les **stats max** sont un plafond qui monte lui-même avec le niveau. Il peut être atteint **temporairement** pendant un combat, ou **de façon permanente** grâce à des objets qui améliorent les stats de base. Un **minimum** est aussi à prévoir.
- **[Décidé]** Un niveau permet d’**apprendre de nouveaux moves** et parfois d’**évoluer**.
- **[Décidé]** Dans la nature, plus la qualité est haute, plus elle est **rare**.
- **[Décidé]** **Cumuler plusieurs exemplaires** du même compagnon améliore sa qualité ; la quantité nécessaire augmente à chaque rang.
- **[Décidé]** Le trait de caractère *intelligent* accélère la progression ; une évolution peut modifier le trait (voir `traits-de-caractere.md`).

## 2. Statistiques

Liste visée : **PV, attaque, défense, endurance, vitesse** (d’autres pourront s’ajouter). En v0.1 il n’existe que PV, attaque et vitesse.

**Trois valeurs par statistique** **[Décidé]** :

- **Stat de base** : la valeur permanente du compagnon. Elle monte avec le niveau et grâce à des objets d’amélioration.
- **Stat max (plafond)** : elle monte elle-même avec le niveau. En combat, la valeur courante peut l’atteindre **temporairement** (effets de renforcement) ; de façon **permanente**, c’est la stat de base qui peut l’atteindre grâce à des objets.
- **Stat min (plancher)** : valeur sous laquelle la stat ne descend jamais, pour limiter l’effet des affaiblissements.

**Valeur courante en combat** **[Proposition]** : la stat de base, modifiée temporairement par des renforcements ou des affaiblissements, toujours bornée entre le min et le max. Ces effets disparaissent à la fin du combat.

**Formules** **[Proposition]**

| Valeur | Calcul |
|---|---|
| Stat de base naturelle au niveau `n` | stat de référence × multiplicateur de qualité × `(1 + 0,04 × (n − 1))` |
| Bonus permanents d’objets | s’ajoutent à la stat de base, sans dépasser le max |
| Stat max | 150 % de la stat de base naturelle du niveau |
| Stat min | 50 % de la stat de base |

**Exemple** : attaque de référence 12, qualité C, niveau 10. Base naturelle : 12 × 1,00 × 1,36 ≈ 16. Max ≈ 24. Min ≈ 8. Un renforcement peut donc pousser l’attaque courante jusqu’à 24 le temps d’un combat, un affaiblissement ne la fera pas descendre sous 8, et des objets peuvent faire passer la base de 16 jusqu’à 24 de façon durable.

**Défense** : elle suppose de revoir la formule de dégâts. **[Proposition]** `dégâts × 50 ÷ (50 + défense)`, à équilibrer avec l’attaque.

## 3. Qualité

**[Proposition]** La qualité applique un multiplicateur aux stats de référence de l’espèce, et fixe la probabilité de la rencontrer à l’état sauvage.

| Qualité | Multiplicateur des stats | Probabilité d’apparition |
|---|---|---|
| D | × 0,90 | 50 % |
| C | × 1,00 | 30 % |
| B | × 1,10 | 14 % |
| A | × 1,25 | 5 % |
| S | × 1,40 | 1 % |

Les probabilités pourront varier selon le biome et l’espèce.

## 4. Niveaux et expérience

**[Proposition]**

- **Niveau maximum** : 100.
- **Expérience pour passer du niveau `n` au suivant** : `10 × n²`, donc de plus en plus difficile.

| Niveau actuel | Expérience nécessaire pour le suivant |
|---|---|
| 5 | 250 |
| 10 | 1 000 |
| 20 | 4 000 |
| 40 | 16 000 |

- **Gain d’expérience par combat** : le vainqueur reçoit `12 × niveau de l’adversaire`, le vaincu **40 %** de ce montant. Le gain est multiplié par le rapport entre le niveau de l’adversaire et celui du compagnon, borné entre 0,5 et 2.
- **Exemples** : un compagnon de niveau 5 qui bat un niveau 5 gagne 60 (environ 4 victoires pour monter) ; au niveau 20 contre un niveau 20, il gagne 240 (environ 17 victoires) et 96 s’il est vaincu.
- **Intelligent** : +25 % d’expérience.
- **Croissance des stats** : chaque niveau ajoute environ **4 %** des stats de référence. Exemple : un compagnon de qualité C avec 12 d’attaque au niveau 1 en aura environ 21 au niveau 20.

## 5. Moves et évolution

- Chaque espèce a une **table d’apprentissage** (niveau, move). Exemple pour Mousselin : niveau 1 Charge et Fouet-liane ; niveau 6 Carapace ; niveau 12 Pas de côté ; niveau 18 Baume de mousse ; niveau 35 Sève vitale (réanimation, rare).
- **Évolution** : à un niveau donné, ou sous une autre condition à définir. Elle change l’apparence, les stats de référence, les moves disponibles, et **peut modifier le trait de caractère** (**[Décidé]**).

## 6. Rareté et fusion

- **Rareté** : voir le tableau de la partie 3.
- **Fusion** **[Proposition]** : pour passer à la qualité supérieure, on cumule des exemplaires supplémentaires de la **même espèce** et de la **même qualité**:

| Passage | Exemplaires supplémentaires |
|---|---|
| D vers C | 2 D |
| C vers B | 3 C |
| B vers A | 5 B |
| A vers S | 8 A |

Pour aller de D à S, il faut donc 18 doublons (sans prise en compte de la qualité dans cet exemple !en ne prenant que des qualités D, 80 créatures nécessaires), alors qu’un S sauvage n’apparaît qu’une fois sur cent : la fusion est la voie principale vers le sommet.

## 7. Questions ouvertes

1. **Min et plafond** : valeurs à valider (propositions : 50 % de la stat de base pour le min, 150 % de la base naturelle pour le max). Quelle limite de bonus permanent par objet ?
2. Les compagnons en réserve (qui ne combattent pas) gagnent-ils de l’expérience ?
3. Fusion : quel exemplaire garde son niveau et son trait ? Les doublons sont-ils consommés ? Peut-on fusionner des niveaux différents ?
4. Niveau maximum et conditions d’évolution (niveau seul, objet, lieu…).
5. La qualité d’un compagnon sauvage est-elle visible avant la capture ?
6. Tous les chiffres sont à équilibrer par essais successifs.

# Qualité, niveaux, évolution et rareté

*Les points marqués **[Décidé]** viennent de Jérémy. **[Proposition]** : valeur ou mécanique à équilibrer en jouant. **[À confirmer]** : interprétation à valider.*

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

Liste visée : **PV, attaque, défense, endurance, vitesse** (d’autres pourront s’ajouter).
En v0.2.1, **PV, attaque, défense et vitesse** sont entièrement implémentés dans le moteur de combat.

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

**Formule de Dégâts (Implémentée v0.2.1)** : `dégâts = max(1, Math.round(power * atk / (50 + def) * mult * (0.85 + rand * 0.15)))`.

## 3. Qualité et Probabilités d'apparition (Implémenté en v0.2.1)

La qualité applique un multiplicateur aux stats de référence de l’espèce et fixe la probabilité de rencontrer la créature à l'état sauvage :

| Qualité | Multiplicateur des stats | Probabilité d’apparition sauvage |
|---|---|---|
| D | × 0,90 | 50 % |
| C | × 1,00 | 30 % |
| B | × 1,10 | 14 % |
| A | × 1,25 | 5 % |
| S | × 1,40 | 1 % |

## 4. Niveaux et expérience

**[Proposition]**

- **Niveau maximum** : 50.
- **Expérience pour passer du niveau `n` au suivant** : `10 × n²`, donc de plus en plus difficile.

| Niveau actuel | Expérience nécessaire pour le suivant |
|---|---|
| 5 | 250 |
| 10 | 1 000 |
| 20 | 4 000 |
| 40 | 16 000 |

- **Gain d’expérience par combat** : le vainqueur reçoit `12 × niveau de l’adversaire`, le vaincu **40 %** de ce montant.
- **Intelligent** : +25 % d’expérience.

## 5. Moves et évolution

- Chaque espèce a une **table d’apprentissage** (niveau, move).
- **Évolution** : change l’apparence, les stats de référence, les moves disponibles, et **peut modifier le trait de caractère** (**[Décidé]**).

## 6. Rareté et fusion

- **Fusion** **[Proposition]** : pour passer à la qualité supérieure, on cumule des exemplaires supplémentaires de la **même espèce** :

| Passage | Exemplaires supplémentaires |
|---|---|
| D vers C | 2 |
| C vers B | 3 |
| B vers A | 5 |
| A vers S | 8 |

## 7. Questions ouvertes (à arbitrer)

1. **Visibilité de la qualité** : La qualité d'une créature sauvage doit-elle être visible dès l'apparition sauvage (actuellement affichée), ou masquée jusqu'à sa capture ?
2. **Gain d'expérience en réserve** : Les compagnons dans l'équipe qui ne combattent pas reçoivent-ils une fraction de l'expérience ?
3. **Modalités de fusion** : Lors d'une fusion de doublons, quel compagnon conserve son niveau/stats ?
4. **Conditions d'évolution** : Évolution par niveau uniquement ou besoin d'objets/pierres ?

# Qualité, niveaux, évolution et rareté

*Les points marqués **[Décidé]** sont validés. **[Proposition]** : valeur ou mécanique à équilibrer en jouant.*

## 1. Décisions

- **[Décidé]** Chaque compagnon a une **qualité visible** : **D, C, B, A, S** (S est la meilleure). Elle préjuge de ses **stats de base** et de ses **stats max** (attaque, défense, endurance, vitesse…).
- **[Décidé]** **Visibilité de la qualité sauvage** : La qualité d'une créature sauvage est **directement visible dès son apparition en combat** (ex: `[D]`, `[C]`, `[B]`, `[A]`, `[S]`).
- **[Décidé]** Un compagnon **monte de niveau en combattant**, comme dans Pokémon, mais **le vaincu progresse aussi**, moins vite.
- **[Décidé]** **Compagnons en réserve** : Les compagnons de l'équipe restant en réserve et n'ayant pas participé au combat ne reçoivent **pas d'expérience** (0 XP).
- **[Décidé]** Chaque niveau augmente les stats de base et les stats max. Monter de niveau est **de plus en plus difficile**.
- **[Décidé]** Les **stats max** sont un plafond qui monte lui-même avec le niveau.
- **[Décidé]** Dans la nature, plus la qualité est haute, plus elle est **rare**.
- **[Décidé]** **Progression issue de la vie en groupe** (fusion de doublons) : Cumuler plusieurs exemplaires du même compagnon de même qualité améliore sa qualité. Le compagnon principal au **niveau le plus élevé conserve son niveau, ses statistiques et son trait de caractère**, et les doublons secondaires sont consommés pour faire grimper sa qualité.
- **[Décidé]** **Évolution spécifique par espèce** : L'évolution est propre à chaque espèce et peut être déclenchée par un **niveau fixe** (ex: niveau 16), un **objet spécifique** (ex: pierre élémentaire) ou des **conditions de biome** (ex: au bord de l'eau ou en montagne).
- **[Décidé]** Le trait de caractère *intelligent* accélère la progression ; une évolution peut modifier le trait (voir `traits-de-caractere.md`).

## 2. Statistiques

Liste visée : **PV, attaque, défense, endurance, vitesse** (d’autres pourront s’ajouter).
En v0.2.1/v0.2.2, **PV, attaque, défense et vitesse** sont entièrement implémentés dans le moteur de combat.

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

**Formule de Dégâts (Implémentée v0.2.1/v0.2.2)** : `dégâts = max(1, Math.round(power * atk / (50 + def) * mult * (0.85 + rand * 0.15)))`.

## 3. Qualité et Probabilités d'apparition (Implémenté en v0.2.1/v0.2.2)

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

- **Niveau maximum** : 100.
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
- **Évolution [Décidé]** : Chaque espèce possède ses propres critères d'évolution spécifiés dans sa fiche (`data/creatures.json`).
  - Exemple 1 (par niveau) : Mousselin évolue au niveau 16.
  - Exemple 2 (par objet) : Cendrille évolue avec une Pierre de Braise.
  - Exemple 3 (par biome) : Gouttelin évolue dans le biome Lac/Plongée.

## 6. Progression issue de la vie en groupe (fusion de doublons)

- **[Décidé]** Pour faire passer un compagnon à la qualité supérieure, on consomme des doublons de la **même espèce** et de la **même qualité** :

| Passage | Exemplaires secondaires consommés |
|---|---|
| D vers C | 2 D |
| C vers B | 3 C |
| B vers A | 5 B |
| A vers S | 8 A |

Le compagnon principal au niveau le plus élevé conserve son niveau, ses statistiques et son trait de caractère, tandis que les créatures secondaires sont consommées.

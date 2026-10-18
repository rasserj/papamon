# Traits de caractère

*Le principe est **[Décidé]** ; les pourcentages et les traits supplémentaires sont des **[Proposition]**. Rien de ceci n’est encore implémenté.*

## 1. Principe

- **[Décidé]** Chaque compagnon a un **trait de caractère** qui influence son comportement.
- **[Décidé]** Une **évolution peut modifier le trait**.

## 2. Traits envisagés par Jérémy

| Trait | Catégorie | Effet | Valeur proposée |
|---|---|---|---|
| Compétiteur | comportement | Chance d’entrer en combat à la place d’un autre compagnon | 25 % |
| Belliqueux | comportement | Chance de remplacer un move d’esquive, de défense ou de soin par un move offensif | 20 % |
| Intelligent | progression | Passe les niveaux plus vite | +25 % d’expérience |
| Peureux | comportement | Chance d’envoyer un autre compagnon à sa place | 25 % |
| Rapide | statistiques | Vitesse particulièrement élevée | +15 % de vitesse |

## 3. Traits supplémentaires possibles

**[Proposition]** pour compléter le catalogue :

| Trait | Catégorie | Effet | Valeur proposée |
|---|---|---|---|
| Prudent | comportement | Quand ses PV sont bas (moins de 30 %), chance de remplacer une attaque par une défense ou une esquive | 25 % |
| Altruiste | comportement | Si un allié est blessé et qu’il connaît un move de soin, chance de le soigner au lieu de l’action choisie | 15 % |
| Endurant | statistiques | Endurance maximale plus élevée | +20 % |
| Costaud | statistiques | PV maximum plus élevés | +15 % |

Trois grandes familles : **comportement** (le trait interfère avec les choix du joueur), **progression** (il change la vitesse de montée en niveau), **statistiques** (il modifie une stat).

## 4. Règles de déclenchement

**[Proposition]**

- Les tirages ont lieu **au moment de la décision concernée** : entrée en combat pour compétiteur et peureux, choix du move pour belliqueux, prudent et altruiste.
- Un **message** s’affiche quand un trait se déclenche (par exemple « Cendrille, belliqueux, ignore l’ordre et attaque ! ») pour que le comportement reste lisible.
- **[Décidé]** Un trait de comportement est **prioritaire sur la fatigue** : c’est l’exercice du libre arbitre du compagnon, qui ne s’engage donc jamais dans un move impossible. Le move de remplacement est choisi parmi ceux que sa fatigue lui permet d’exécuter.
- Le move choisi consomme son effort et suit sa vitesse d’exécution comme d’habitude. **[Proposition]** S’il n’existe aucun move de remplacement possible, le trait ne se déclenche pas et l’ordre du joueur s’applique normalement.

## 5. Questions ouvertes

- Le trait est-il visible dès la capture, ou découvert à l’usage ?
- Un compagnon peut-il avoir plusieurs traits ?
- Quand exactement agissent compétiteur et peureux (début de combat, après un K.O., à chaque changement) et lequel passe en premier si les deux se déclenchent ?
- Le trait dépend-il de l’espèce, est-il tiré au hasard à la capture, ou lié à la qualité ?
- Une évolution donne-t-elle un trait fixé par l’espèce ou tiré dans une liste ?
- Le joueur peut-il influencer un trait (objets, entraînement) ?

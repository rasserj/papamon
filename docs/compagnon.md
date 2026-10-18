# Entité « compagnon » – état v0.1

*Un compagnon est une créature jouable ou adverse. Ce document liste ses caractéristiques telles qu’elles existent dans `index.html` (v0.1) et ce qui reste à définir.*

## 1. Caractéristiques actuelles

| Champ | Rôle | Exemple (Mousselin) |
|---|---|---|
| `name` | Nom affiché | Mousselin |
| `type` | Type élémentaire (`sylve`, `braise` ou `flot`), qui décide des avantages et résistances | `sylve` |
| `hp` | Points de vie maximum | 44 |
| `atk` | Attaque : multiplie les dégâts infligés | 12 |
| `spd` | Vitesse : décide de l’ordre d’action dans le tour | 9 |
| `moves` | Liste des attaques connues (identifiants) | `charge`, `fouet` |
| `top` | Forme du sommet du sprite (`sprout`, `flame`, `drop`) | `sprout` |
| `colors` | Deux couleurs du sprite : principale et claire | `#4caf50`, `#a5e08a` |

Pendant un combat, chaque participant est un **combattant** : le compagnon (modèle fixe) plus ses **PV actuels**. Seuls les PV changent ; les statistiques ne bougent pas.

## 2. Les trois compagnons

| Nom | Type | PV | Attaque | Vitesse | Attaques |
|---|---|---|---|---|---|
| Mousselin | Sylve | 44 | 12 | 9 | Charge, Fouet-liane |
| Cendrille | Braise | 40 | 14 | 11 | Charge, Étincelle |
| Gouttelin | Flot | 46 | 11 | 10 | Charge, Jet d’eau |

Chacun a donc un profil : Cendrille frappe fort et vite mais encaisse peu, Gouttelin est le plus résistant, Mousselin est le plus lent.

## 3. Apparence (sprite)

- Pixel art **16×16**, dessiné en code, agrandi sans flou.
- Légende : `k` contour, `w` blanc, `g` couleur principale, `G` couleur claire, `.` transparent.
- Pour l’instant : un **corps commun** à tous, plus un **sommet** propre à chaque compagnon, et une palette par compagnon. Ce sont des sprites provisoires.
- Le sprite du joueur est affiché retourné horizontalement.

## 4. Exemple de fiche en JSON (format cible pour `/data`)

```json
{
  "name": "Mousselin",
  "type": "sylve",
  "hp": 44,
  "atk": 12,
  "spd": 9,
  "moves": ["charge", "fouet"],
  "sprite": { "top": "sprout", "colors": ["#4caf50", "#a5e08a"] }
}
```

## 5. Ce qui n’existe pas encore

Niveau et expérience, évolution, statistique de défense, description ou histoire de la créature, biome d’origine, rareté, capacité spéciale, apprentissage de nouvelles attaques, équipe de plusieurs compagnons, surnom, état persistant (PV, blessures) entre deux combats.

## 6. Pistes (à discuter)

- **Identité** : biome d’origine (campagne, mer, grotte, espace…), fiche descriptive, rareté.
- **Progression** : niveau, expérience, évolution, nouvelles attaques.
- **Statistiques** : défense, éventuellement une seconde stat offensive.
- **Capacité** : un trait propre qui change la façon de jouer (par exemple pour franchir un biome : nager, plonger).
- **Collection** : équipe de plusieurs compagnons et stockage de ceux qu’on capture (étape v0.3).

## 7. Évolutions décidées (non implémentées)

- **Endurance masquée** : caractéristique cachée, même pour le joueur, propre à chaque compagnon. Chaque move consomme un effort ; la fatigue affaiblit progressivement les moves, puis un move devient impossible (tour perdu). Elle ne compte que dans les combats longs.
- **Récupération** : le compagnon actif ne récupère pas pendant ses tours ; un compagnon inactif (en réserve dans l’équipe) regagne de l’endurance avec les tours écoulés. Fin de combat : endurance remise au maximum, sauf compagnon « dans le rouge » (endurance réduite de moitié).
- **PV persistants** d’un combat à l’autre ; soins en combat (à la place d’un tour), hors combat ou en établissements dédiés.
- **Vitesse** : la vitesse du compagnon se combine à la vitesse d’exécution de chaque move.
- **Équipe** : **6 compagnons** (décidé). Ceux en réserve récupèrent de l’endurance et peuvent être soignés en combat par un move ou un objet.
- **K.O.** : à 0 PV, un compagnon n’est relevé que par une réanimation (certains moves rares, avec un coût en PV pour l’exécutant, certains objets, ou un établissement spécialisé). Un soin ordinaire ne suffit pas.
- **Qualité visible** (D, C, B, A, S) qui préjuge des stats de base et des stats max (attaque, défense, endurance, vitesse…). Plus la qualité est haute, plus elle est rare ; cumuler des doublons l’améliore.
- **Niveaux et expérience** : on gagne des niveaux en combattant (le vaincu progresse aussi, moins vite), de plus en plus difficiles ; chaque niveau augmente les stats, fait apprendre de nouveaux moves et permet parfois d’évoluer.
- **Trait de caractère** : influence le comportement (compétiteur, belliqueux, intelligent, peureux, rapide…) ; une évolution peut le modifier.
- **Statistiques visées** : PV, attaque, défense, endurance, vitesse (la défense et l’endurance n’existent pas encore dans le code). Chaque stat a une valeur de base, un plafond (stat max, qui monte avec le niveau) et un minimum ; en combat, la valeur courante varie temporairement entre le min et le max, et des objets peuvent relever durablement la base.

Détails : `attaques-fatigue-esquive.md`, `qualite-et-progression.md` et `traits-de-caractere.md`.

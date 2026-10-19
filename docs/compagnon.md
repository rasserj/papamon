# Entité « compagnon » – état v0.2.1

*Un compagnon est une créature jouable ou adverse. Ce document liste ses caractéristiques telles qu’elles existent dans `data/creatures.json` (v0.2.1).*

## 1. Caractéristiques actuelles

| Champ | Rôle | Exemple (Mousselin) |
|---|---|---|
| `id` | Identifiant unique | `mousselin` |
| `name` | Nom affiché | Mousselin |
| `type` | Type élémentaire (`sylve`, `braise` ou `flot`), qui décide des avantages et résistances | `sylve` |
| `quality` | Qualité visible (D, C, B, A, S) | `C` |
| `hp` | Points de vie maximum | 44 |
| `atk` | Attaque : multiplie les dégâts infligés | 12 |
| `def` | Défense : réduit les dégâts reçus | 10 |
| `spd` | Vitesse : décide de l’ordre d’action et des chances de fuite | 9 |
| `moves` | Liste des attaques connues (identifiants) | `charge`, `fouet` |
| `top` | Forme du sommet du sprite (`sprout`, `flame`, `drop`) | `sprout` |
| `colors` | Deux couleurs du sprite : principale et claire | `#4caf50`, `#a5e08a` |

## 2. Les trois compagnons (v0.2.1)

| Nom | Qualité | Type | PV | Attaque | Défense | Vitesse | Attaques |
|---|---|---|---|---|---|---|---|
| Mousselin | C | Sylve | 44 | 12 | 10 | 9 | Charge, Fouet-liane |
| Cendrille | C | Braise | 40 | 14 | 8 | 11 | Charge, Étincelle |
| Gouttelin | C | Flot | 46 | 11 | 12 | 10 | Charge, Jet d’eau |

## 3. Exemple de fiche en JSON (`data/creatures.json`)

```json
{
  "id": "mousselin",
  "name": "Mousselin",
  "type": "sylve",
  "quality": "C",
  "hp": 44,
  "atk": 12,
  "def": 10,
  "spd": 9,
  "top": "sprout",
  "colors": ["#4caf50", "#a5e08a"],
  "moves": ["charge", "fouet"]
}
```

## 4. Ce qui reste à faire (v0.3 et après)

- Niveaux et expérience
- Évolution
- Capture et inventaire d'équipe
- Traits de caractère
- Endurance et fatigue

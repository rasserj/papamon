import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  xpPourNiveauSuivant,
  xpRecompense,
  statAuNiveau,
  appliquerXp,
  calculerToutesStats
} from '../js/progression.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const progressionConfig = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/progression.json'), 'utf8'));
const creaturesData = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/creatures.json'), 'utf8'));
const qualitiesData = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/qualities.json'), 'utf8'));

// Test 1: XP pour niveau suivant = 10 * n^2
assert.strictEqual(xpPourNiveauSuivant(1, progressionConfig), 10);
assert.strictEqual(xpPourNiveauSuivant(5, progressionConfig), 250);
assert.strictEqual(xpPourNiveauSuivant(10, progressionConfig), 1000);
assert.strictEqual(xpPourNiveauSuivant(20, progressionConfig), 4000);
assert.strictEqual(xpPourNiveauSuivant(30, progressionConfig), 9000);
assert.strictEqual(xpPourNiveauSuivant(50, progressionConfig), 25000);
assert.strictEqual(xpPourNiveauSuivant(75, progressionConfig), 56250);
assert.strictEqual(xpPourNiveauSuivant(99, progressionConfig), 98010);

// Sum total XP from lvl 1 to 100 = 3 283 500 XP
let totalXpTo100 = 0;
for (let n = 1; n < 100; n++) {
  totalXpTo100 += xpPourNiveauSuivant(n, progressionConfig);
}
assert.strictEqual(totalXpTo100, 3283500);

// Test 2: Exemple du document docs/niveaux-et-experience.md
// Mousselin (lvl 12) bat Cendrille sauvage (lvl 14), qualite B, difficulte 1.0 -> 235 XP
const xpSauvage = xpRecompense({
  niveauE: 14,
  niveauBeneficiaire: 12,
  qualiteE: "B",
  typeCombat: "sauvage",
  difficulteE: 1.0,
  estCoupFinal: true,
  estPartEntre: true
}, progressionConfig);
assert.strictEqual(xpSauvage, 235);

// Même situation contre un dresseur -> 353 XP
const xpDresseur = xpRecompense({
  niveauE: 14,
  niveauBeneficiaire: 12,
  qualiteE: "B",
  typeCombat: "dresseur",
  difficulteE: 1.0,
  estCoupFinal: true,
  estPartEntre: true
}, progressionConfig);
assert.strictEqual(xpDresseur, 353);

// Si Mousselin avait perdu -> 40% ≈ 94 XP
const xpPerdu = xpRecompense({
  niveauE: 14,
  niveauBeneficiaire: 12,
  qualiteE: "B",
  typeCombat: "sauvage",
  difficulteE: 1.0,
  estDefaiteTotale: true,
  estPartEntre: true
}, progressionConfig);
assert.strictEqual(xpPerdu, 94);

// Trait Intelligent -> +25%
const xpIntelligent = xpRecompense({
  niveauE: 14,
  niveauBeneficiaire: 12,
  qualiteE: "B",
  typeCombat: "sauvage",
  difficulteE: 1.0,
  estCoupFinal: true,
  estPartEntre: true,
  traitBeneficiaire: "intelligent"
}, progressionConfig);
assert.strictEqual(xpIntelligent, Math.floor(235 * 1.25));

// Test 3: Croissance des stats non-linéaire à mi-parcours (niveau 50) pour gain moyen
// x2.22 pour précoce, x1.70 pour tardive, x3.0 au niveau 100
const dummySpeciePrecoce = {
  atk: 10,
  croissance: { atk: { gain: "moyen", courbe: "precoce" } }
};
const dummySpecieTardive = {
  atk: 10,
  croissance: { atk: { gain: "moyen", courbe: "tardive" } }
};

const atk50Precoce = statAuNiveau(dummySpeciePrecoce, "atk", 50, "C", null, progressionConfig, qualitiesData);
// 10 * 2.2243 = 22
assert.strictEqual(atk50Precoce, 22);

const atk50Tardive = statAuNiveau(dummySpecieTardive, "atk", 50, "C", null, progressionConfig, qualitiesData);
// 10 * 1.696 = 16 (floor de 16.96)
assert.strictEqual(atk50Tardive, 16);

const atk100Precoce = statAuNiveau(dummySpeciePrecoce, "atk", 100, "C", null, progressionConfig, qualitiesData);
assert.strictEqual(atk100Precoce, 30); // 10 * (1 + 2.0 * 1.0) = 30

// Test 4: Application XP, level up, multiple levels, KO behavior
const comp = {
  id: "mousselin",
  speciesId: "mousselin",
  name: "Mousselin",
  level: 1,
  xp: 0,
  quality: "C",
  hp: 44,
  maxHp: 44,
  atk: 12,
  def: 10,
  spd: 9,
  effort: 100,
  maxEffort: 100,
  moves: ["charge", "fouet", "esquive"]
};

// Donner 260 XP (assez pour passer lvl 1 -> lvl 2 -> lvl 3...)
const resultApp = appliquerXp(comp, 260, progressionConfig, creaturesData, qualitiesData);
assert.strictEqual(resultApp.niveauxGagnes > 0, true);
assert.strictEqual(comp.level > 1, true);

console.log("Tous les tests du module progression sont passés avec succès !");

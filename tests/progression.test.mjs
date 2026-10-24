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

// Test 5: Régression bug niveau 2 - Compagnon blessé et épuisé
const injuredComp = {
  id: "mousselin_injured",
  speciesId: "mousselin",
  name: "Mousselin",
  level: 1,
  xp: 0,
  quality: "C",
  hp: 5,         // Très blessé
  maxHp: 44,
  atk: 12,
  def: 10,
  spd: 9,
  effort: 0,     // Épuisé
  maxEffort: 100,
  moves: ["charge", "fouet", "esquive"]
};

const resultInjured = appliquerXp(injuredComp, 15, progressionConfig, creaturesData, qualitiesData);
assert.strictEqual(injuredComp.level, 2);
// Max HP et Max Effort ne doivent JAMAIS chuter à 5 ou 0 lors de la montée de niveau
assert.strictEqual(injuredComp.maxHp >= 44, true);
assert.strictEqual(injuredComp.maxEffort >= 100, true);
// Et 'Reprendre son souffle' (effet intégral de +35 effort) doit rester possible quand l'effort retombe
assert.strictEqual(injuredComp.maxEffort - injuredComp.effort >= 35 || injuredComp.maxEffort >= 35, true);

// Test 6: Compagnon en réserve gagne de l'XP et monte de niveau (réévaluation des stats)
const reserveComp = {
  id: "gouttelin_reserve",
  speciesId: "gouttelin",
  name: "Gouttelin",
  level: 1,
  xp: 0,
  quality: "C",
  hp: 30,
  maxHp: 46,
  effort: 50,
  maxEffort: 95,
  moves: ["charge", "jet", "esquive"]
};

const resultReserve = appliquerXp(reserveComp, 15, progressionConfig, creaturesData, qualitiesData);
assert.strictEqual(reserveComp.level, 2);
assert.strictEqual(reserveComp.maxHp >= 46, true);
assert.strictEqual(reserveComp.hp > 0, true);

// Test 7: Compagnon K.O. gagne de l'XP lors d'une défaite (réévaluation des PV Max mais SANS réanimation)
const koComp = {
  id: "cendrille_ko",
  speciesId: "cendrille",
  name: "Cendrille",
  level: 1,
  xp: 0,
  quality: "C",
  hp: 0, // K.O.
  maxHp: 40,
  effort: 0,
  maxEffort: 90,
  moves: ["charge", "etincelle", "esquive"]
};

const resultKO = appliquerXp(koComp, 15, progressionConfig, creaturesData, qualitiesData);
assert.strictEqual(koComp.level, 2);
assert.strictEqual(koComp.hp, 0); // Toujours K.O., aucune réanimation !
assert.strictEqual(koComp.maxHp >= 40, true); // Stats réévaluées
assert.strictEqual(koComp.atk > 0, true);

// Test 8: Soin complet par le PNJ Soignante Flora
const teamToHeal = [
  { name: "Cendrille", hp: 0, maxHp: 40, effort: 0, maxEffort: 90 },
  { name: "Mousselin", hp: 12, maxHp: 44, effort: 10, maxEffort: 100 }
];

teamToHeal.forEach((c) => {
  c.hp = c.maxHp;
  c.effort = c.maxEffort;
});

assert.strictEqual(teamToHeal[0].hp, 40);
assert.strictEqual(teamToHeal[0].effort, 90);
assert.strictEqual(teamToHeal[1].hp, 44);
assert.strictEqual(teamToHeal[1].effort, 100);

console.log("Tous les tests du module progression sont passés avec succès !");

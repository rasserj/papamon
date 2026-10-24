/**
 * Module de gestion de la progression, de l'expérience et des niveaux.
 */

/**
 * Calcul de l'XP requise pour passer du niveau `n` au niveau `n + 1`.
 */
export function xpPourNiveauSuivant(niveau, config) {
  const mult = config?.xpFormulaMultiplier ?? 10;
  const exp = config?.xpFormulaExponent ?? 2;
  return mult * Math.pow(niveau, exp);
}

/**
 * Calcul du gain d'expérience (XP) distribué lors du K.O. d'une créature adverse E.
 */
export function xpRecompense(params, config) {
  const {
    niveauE,
    niveauBeneficiaire,
    qualiteE = "C",
    typeCombat = "sauvage", // "sauvage" ou "dresseur"
    difficulteE = 1.0,
    estCoupFinal = false,
    pvRestantsE = 0,
    pvMaxE = 100,
    traitBeneficiaire = null,
    estKO = false,
    estPartEntre = true,
    estDefaiteTotale = false
  } = params;

  // F_niveau = niveau(E) / niveau(bénéficiaire), borné entre 0.5 et 2.0
  const ratioNiveau = niveauE / Math.max(1, niveauBeneficiaire);
  const F_niveau = Math.min(2.0, Math.max(0.5, ratioNiveau));

  // F_qualité
  const F_qualite = config?.qualiteMultipliers?.[qualiteE] ?? 1.0;

  // F_combat
  const F_combat = config?.combatTypeMultipliers?.[typeCombat] ?? 1.0;

  // F_espèce
  const F_espece = difficulteE;

  // F_duel (optionnel, par défaut 1.0 sauf si actif dans config)
  let F_duel = 1.0;
  if (config?.enableFDuel && estCoupFinal && pvMaxE > 0) {
    const ratioPvRestants = Math.max(0, Math.min(1, pvRestantsE / pvMaxE));
    F_duel = 1 + 0.2 * (1 - ratioPvRestants);
  }

  const baseXp = config?.baseXp ?? 12;
  const xpBrute = Math.round(baseXp * niveauE * F_niveau * F_qualite * F_combat * F_espece * F_duel);
  const xpBase = Math.max(1, xpBrute);

  // Détermination de la part selon le rôle du compagnon
  let ratioPart = 0;
  if (estDefaiteTotale) {
    ratioPart = estPartEntre ? 0.4 : 0;
  } else {
    if (estCoupFinal) {
      ratioPart = 1.0;
    } else if (estPartEntre) {
      ratioPart = 0.5;
    } else {
      ratioPart = 0;
    }

    if (estKO) {
      ratioPart *= 0.4;
    }
  }

  let xpPart = Math.floor(xpBase * ratioPart);

  // Bonus de trait (ex: Intelligent +25%)
  if (traitBeneficiaire === "intelligent") {
    const bonusTrait = config?.traitXpBonus?.intelligent ?? 0.25;
    xpPart = Math.floor(xpPart * (1 + bonusTrait));
  }

  return xpPart;
}

/**
 * Calcul de la valeur d'une stat pour un niveau donné selon l'espèce, la qualité et le trait.
 */
export function statAuNiveau(espece, statKey, niveau, qualiteKey = "C", traitKey = null, config = {}, qualiteData = {}) {
  // Stat de référence (niveau 1)
  let baseRef = espece[statKey] ?? 10;
  if (statKey === "hp" && espece.baseHp) baseRef = espece.baseHp;
  if (statKey === "effort" && espece.baseEffort) baseRef = espece.baseEffort;

  // Multiplicateur de qualité
  let qualiteMult = 1.0;
  if (Array.isArray(qualiteData)) {
    const qObj = qualiteData.find(q => (q.id || q.quality) === qualiteKey);
    if (qObj) qualiteMult = qObj.multiplier ?? qObj.mult ?? 1.0;
  } else if (qualiteData?.[qualiteKey]) {
    qualiteMult = qualiteData[qualiteKey].multiplier ?? qualiteData[qualiteKey].mult ?? 1.0;
  } else if (config?.qualiteMultipliers?.[qualiteKey]) {
    qualiteMult = config.qualiteMultipliers[qualiteKey];
  }

  // Params de croissance
  const croissanceSpecie = espece.croissance?.[statKey] ?? { gain: "moyen", courbe: "reguliere" };
  const gainNom = croissanceSpecie.gain ?? "moyen";
  const courbeNom = croissanceSpecie.courbe ?? "reguliere";

  const gainVal = config?.gainAmplitudes?.[gainNom] ?? 2.0;
  const courbeExp = config?.courbeExponents?.[courbeNom] ?? 1.0;

  // Modificateur de trait
  const traitMods = config?.traitGainModifiers?.[traitKey] ?? {};
  const modTrait = traitMods[statKey] ?? 1.0;

  const niveauMax = config?.niveauMax ?? 100;
  const avancement = Math.max(0, (niveau - 1) / (niveauMax - 1));
  const facteurCourbe = Math.pow(avancement, courbeExp);

  const multiplicateurTotal = qualiteMult * (1 + gainVal * modTrait * facteurCourbe);
  return Math.floor(baseRef * multiplicateurTotal);
}

/**
 * Recalcule toutes les stats courantes d'un compagnon pour son niveau actuel.
 */
export function calculerToutesStats(compagnon, speciesData, config, qualiteData) {
  const targetId = compagnon.speciesId || compagnon.id;
  let espece = Array.isArray(speciesData) ? speciesData.find(s => s.id === targetId) : null;

  if (espece) {
    if (!compagnon.speciesId) compagnon.speciesId = espece.id;
    if (!compagnon.baseHp) compagnon.baseHp = espece.hp;
    if (!compagnon.baseEffort) compagnon.baseEffort = espece.effort;
  } else {
    espece = {
      ...compagnon,
      hp: compagnon.baseHp || compagnon.maxHp || 40,
      effort: compagnon.baseEffort || compagnon.maxEffort || 100
    };
  }

  const level = compagnon.level || 1;
  const qualite = compagnon.quality || "C";
  const trait = compagnon.trait || null;

  const newMaxHp = statAuNiveau(espece, "hp", level, qualite, trait, config, qualiteData);
  const newAtk = statAuNiveau(espece, "atk", level, qualite, trait, config, qualiteData);
  const newDef = statAuNiveau(espece, "def", level, qualite, trait, config, qualiteData);
  const newSpd = statAuNiveau(espece, "spd", level, qualite, trait, config, qualiteData);
  const newMaxEffort = statAuNiveau(espece, "effort", level, qualite, trait, config, qualiteData);

  return {
    maxHp: newMaxHp,
    atk: newAtk,
    def: newDef,
    spd: newSpd,
    maxEffort: newMaxEffort
  };
}

/**
 * Applique des points d'expérience à un compagnon et gère la montée de niveau, les stats,
 * les attaques apprises et les évolutions.
 */
export function appliquerXp(compagnon, xpGagne, config, speciesData, qualiteData) {
  const niveauMax = config?.niveauMax ?? 100;
  const result = {
    xpGagne,
    niveauxGagnes: 0,
    ancienNiveau: compagnon.level || 1,
    nouveauNiveau: compagnon.level || 1,
    movesAppris: [],
    evolution: null,
    gainsStats: null
  };

  if ((compagnon.level || 1) >= niveauMax) {
    return result;
  }

  compagnon.xp = (compagnon.xp || 0) + xpGagne;

  let currentLevel = compagnon.level || 1;
  let xpRequise = xpPourNiveauSuivant(currentLevel, config);

  let origStats = {
    maxHp: compagnon.maxHp || compagnon.hp || 40,
    atk: compagnon.atk,
    def: compagnon.def,
    spd: compagnon.spd,
    maxEffort: compagnon.maxEffort || 100
  };

  while (compagnon.xp >= xpRequise && currentLevel < niveauMax) {
    compagnon.xp -= xpRequise;
    currentLevel++;
    result.niveauxGagnes++;
    xpRequise = xpPourNiveauSuivant(currentLevel, config);
  }

  compagnon.level = currentLevel;
  result.nouveauNiveau = currentLevel;

  if (result.niveauxGagnes > 0) {
    const newStats = calculerToutesStats(compagnon, speciesData, config, qualiteData);

    const prevMaxHp = compagnon.maxHp || origStats.maxHp;
    const prevMaxEffort = compagnon.maxEffort || origStats.maxEffort;

    const diffHp = newStats.maxHp - prevMaxHp;
    const diffEffort = newStats.maxEffort - prevMaxEffort;

    compagnon.maxHp = newStats.maxHp;
    compagnon.atk = newStats.atk;
    compagnon.def = newStats.def;
    compagnon.spd = newStats.spd;
    compagnon.maxEffort = newStats.maxEffort;

    // Si pas KO, augmenter les PV et l'effort actuels de la différence
    if (compagnon.hp > 0) {
      compagnon.hp += Math.max(0, diffHp);
    }
    compagnon.effort = Math.min(compagnon.maxEffort, (compagnon.effort || 0) + Math.max(0, diffEffort));

    result.gainsStats = {
      hp: newStats.maxHp - origStats.maxHp,
      atk: newStats.atk - origStats.atk,
      def: newStats.def - origStats.def,
      spd: newStats.spd - origStats.spd,
      effort: newStats.maxEffort - origStats.maxEffort
    };

    // Apprentissage de capacités
    const espece = speciesData.find(s => s.id === (compagnon.speciesId || compagnon.id)) || compagnon;
    if (espece.apprentissage) {
      for (const item of espece.apprentissage) {
        if (item.niveau > result.ancienNiveau && item.niveau <= currentLevel) {
          if (!compagnon.moves.includes(item.move)) {
            compagnon.moves.push(item.move);
            result.movesAppris.push(item.move);
          }
        }
      }
    }

    // Évolution si condition de niveau atteinte
    if (espece.evolution && espece.evolution.type === "level" && currentLevel >= espece.evolution.level) {
      const targetSpecies = speciesData.find(s => s.id === espece.evolution.into);
      if (targetSpecies) {
        compagnon.speciesId = targetSpecies.id;
        compagnon.name = targetSpecies.name;
        // Recalcul des stats après évolution
        const postEvoStats = calculerToutesStats(compagnon, speciesData, config, qualiteData);
        compagnon.maxHp = postEvoStats.maxHp;
        compagnon.atk = postEvoStats.atk;
        compagnon.def = postEvoStats.def;
        compagnon.spd = postEvoStats.spd;
        compagnon.maxEffort = postEvoStats.maxEffort;
        result.evolution = targetSpecies.name;
      }
    }
  }

  return result;
}

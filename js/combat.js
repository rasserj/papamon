import { makeCreatureSprite } from './sprites.js';
import { xpRecompense, appliquerXp, statAuNiveau } from './progression.js';

const $ = (s) => document.querySelector(s);
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const say = (t) => { $('#msg').textContent = t; };

const DEFAULT_QUALITY_RATES = [
  { quality: 'D', mult: 0.90, prob: 0.50 },
  { quality: 'C', mult: 1.00, prob: 0.30 },
  { quality: 'B', mult: 1.10, prob: 0.14 },
  { quality: 'A', mult: 1.25, prob: 0.05 },
  { quality: 'S', mult: 1.40, prob: 0.01 },
];

export function rollWildQuality(qualitiesList = null) {
  const rates = (qualitiesList && qualitiesList.length > 0) ? qualitiesList : DEFAULT_QUALITY_RATES;
  const rand = Math.random();
  let cumulative = 0;
  for (const q of rates) {
    cumulative += q.prob;
    if (rand < cumulative) return q;
  }
  return rates[1] || rates[0]; // fallback
}

export function applyQualityToCreature(baseCreature, qualityInfo = null, qualitiesList = null) {
  const q = qualityInfo || rollWildQuality(qualitiesList);
  const mult = q.mult;
  const hpVal = Math.max(10, Math.round(baseCreature.hp * mult));
  const maxEffortVal = Math.max(50, Math.round((baseCreature.maxEffort || 100) * mult));
  return {
    ...baseCreature,
    quality: q.quality,
    maxHp: hpVal,
    hp: hpVal,
    atk: Math.max(1, Math.round(baseCreature.atk * mult)),
    def: Math.max(1, Math.round((baseCreature.def || 10) * mult)),
    spd: Math.max(1, Math.round(baseCreature.spd * mult)),
    effort: maxEffortVal,
    maxEffort: maxEffortVal,
  };
}

export class CombatEngine {
  constructor(types, moves, creatures, qualities = null, settings = null, progression = null) {
    this.types = types;
    this.moves = moves;
    this.creatures = creatures;
    this.qualities = qualities;
    this.settings = settings || { showEffort: true };
    this.progression = progression || {};
    this.me = null;
    this.foe = null;
    this.playerTeam = [];
    this.busy = true;
    this.isWild = true;
    this.onBattleEnd = null;
    this.battleParticipants = new Set();
    this.finalHitCompanion = null;

    this.setupKeyboard();
  }

  setupKeyboard() {
    if (typeof document === 'undefined') return;
    document.addEventListener('keydown', (e) => {
      if ($('#battle').hidden) return;
      const activeContainer = $('#movesBox') && !$('#movesBox').hidden
        ? $('#movesBox')
        : $('#mainActions') && !$('#mainActions').hidden
          ? $('#mainActions')
          : null;

      if (activeContainer) {
        const btns = [...activeContainer.querySelectorAll('button')];
        const i = parseInt(e.key, 10) - 1;
        if (btns[i] && !btns[i].disabled) btns[i].click();
      }

      if ((e.key === 'f' || e.key === 'F' || e.key === 'Escape') && !this.busy) {
        if ($('#detailBox') && !$('#detailBox').hidden) {
          this.showTeamSummary();
        } else if ($('#movesBox') && !$('#movesBox').hidden) {
          this.showMainActions();
        } else if ($('#teamBox') && !$('#teamBox').hidden) {
          this.showMainActions();
        } else {
          if (this.isWild) {
            const fleeBtn = $('#fleeBtn');
            if (fleeBtn && !fleeBtn.disabled) fleeBtn.click();
          } else {
            const forfeitBtn = $('#forfeitBtn');
            if (forfeitBtn && !forfeitBtn.disabled) forfeitBtn.click();
          }
        }
      }
    });
  }

  typeMult(moveType, defType) {
    if (!moveType) return 1;
    if (this.types[moveType] && this.types[moveType].strong === defType) return 1.5;
    if (this.types[moveType] && this.types[moveType].weak === defType) return 0.5;
    return 1;
  }

  fighter(base) {
    if (!base.maxHp) base.maxHp = base.hp;
    if (base.maxEffort === undefined) base.maxEffort = 100;
    if (base.effort === undefined) base.effort = base.maxEffort;
    if (base.consecutiveDodgeCount === undefined) base.consecutiveDodgeCount = 0;
    return {
      base,
      hp: base.hp,
      maxHp: base.maxHp,
      effort: base.effort,
      maxEffort: base.maxEffort,
      consecutiveDodgeCount: base.consecutiveDodgeCount,
      isDodging: false,
    };
  }

  getMoveCost(fighterInstance, move) {
    if (!move) return 10;
    if (move.category === 'dodge' || move.id === 'esquive') {
      return (move.cost || 10) + 5 * (fighterInstance.consecutiveDodgeCount || 0);
    }
    return move.cost || 10;
  }

  updateBars() {
    [['me', this.me], ['foe', this.foe]].forEach(([id, f]) => {
      const maxHp = f.base.maxHp || f.maxHp || f.base.hp;
      const maxEffort = f.base.maxEffort || f.maxEffort || 100;
      const pct = Math.round((f.hp / maxHp) * 100);
      const bar = $('#' + id + 'Bar');
      bar.style.width = Math.max(0, pct) + '%';
      bar.style.background = pct > 50 ? '#6fcf7f' : pct > 20 ? '#f0b84a' : '#e5594f';
      const showEffortText = (this.settings && this.settings.showEffort) ? ` · Effort ${f.effort}/${maxEffort}` : '';
      $('#' + id + 'Hp').textContent = `PV ${f.hp}/${maxHp}${showEffortText}`;
    });
  }

  setMoveButtons(enabled) {
    if (typeof document === 'undefined') return;
    document.querySelectorAll('#battleControls button, #moves button, #battleActions button').forEach((b) => {
      if (!enabled) {
        b.disabled = true;
      } else {
        b.disabled = b.dataset.unavailable === 'true';
      }
    });
  }

  hideSubViews() {
    if (typeof document === 'undefined') return;
    ['#mainActions', '#movesBox', '#teamBox', '#detailBox'].forEach((s) => {
      const el = $(s);
      if (el) el.hidden = true;
    });
  }

  showMainActions() {
    this.hideSubViews();
    const box = $('#mainActions');
    if (!box) return;
    box.replaceChildren();

    say(`Que doit faire ${this.me.base.name} ?`);

    const attackBtn = document.createElement('button');
    attackBtn.className = 'btn-main-attack';
    attackBtn.id = 'mainAttackBtn';
    attackBtn.innerHTML = 'Attaquer <small>Sélecteur d’attaques</small>';
    attackBtn.addEventListener('click', () => this.showAttackSelector());
    box.appendChild(attackBtn);

    const teamBtn = document.createElement('button');
    teamBtn.className = 'btn-main-team';
    teamBtn.id = 'mainTeamBtn';
    teamBtn.innerHTML = 'Créatures <small>Équipe & caractéristiques</small>';
    teamBtn.addEventListener('click', () => this.showTeamSummary());
    box.appendChild(teamBtn);

    if (this.isWild) {
      const fleeBtn = document.createElement('button');
      fleeBtn.id = 'fleeBtn';
      fleeBtn.className = 'btn-action btn-flee full';
      fleeBtn.innerHTML = 'Fuire <small>Tenter d’échapper au combat</small>';
      fleeBtn.addEventListener('click', () => this.attemptFlee());
      box.appendChild(fleeBtn);
    } else {
      const forfeitBtn = document.createElement('button');
      forfeitBtn.id = 'forfeitBtn';
      forfeitBtn.className = 'btn-action btn-forfeit full';
      forfeitBtn.innerHTML = 'Abandonner <small>Déclarer forfait (défaite)</small>';
      forfeitBtn.addEventListener('click', () => this.forfeit());
      box.appendChild(forfeitBtn);
    }

    box.hidden = false;
    this.setMoveButtons(!this.busy);
  }

  showAttackSelector() {
    this.hideSubViews();
    const box = $('#movesBox');
    if (!box) return;
    box.replaceChildren();

    say(`Choisis une action pour ${this.me.base.name} :`);

    this.me.base.moves.forEach((id) => {
      const m = this.moves[id];
      if (!m) return;
      const cost = this.getMoveCost(this.me, m);
      const b = document.createElement('button');
      const moveTypeLabel = m.type && this.types[m.type] ? this.types[m.type].label : 'Normal';
      const canAfford = this.me.effort >= cost;
      const subInfo = m.category === 'dodge'
        ? `Esquive · (${cost} effort)`
        : `${moveTypeLabel} · puissance ${m.power} (${cost} effort)`;
      b.innerHTML = `${m.name}<small>${subInfo}${canAfford ? '' : ' - Insuffisant'}</small>`;
      if (!canAfford) {
        b.dataset.unavailable = 'true';
        b.disabled = true;
      } else {
        b.addEventListener('click', () => this.playTurn(id));
      }
      box.appendChild(b);
    });

    const restGain = 35;
    const canRestFull = (this.me.maxEffort - this.me.effort) >= restGain;
    const restBtn = document.createElement('button');
    restBtn.className = 'btn-main-team full';
    restBtn.innerHTML = `Reprendre son souffle <small>Récupérer +${restGain} d’effort${canRestFull ? '' : ' - Effet non intégral'}</small>`;
    if (!canRestFull) {
      restBtn.dataset.unavailable = 'true';
      restBtn.disabled = true;
    } else {
      restBtn.addEventListener('click', () => this.playRestTurn());
    }
    box.appendChild(restBtn);

    const backBtn = document.createElement('button');
    backBtn.className = 'btn-back full';
    backBtn.innerHTML = '◄ Retour <small>Menu principal</small>';
    backBtn.addEventListener('click', () => this.showMainActions());
    box.appendChild(backBtn);

    box.hidden = false;
    this.setMoveButtons(!this.busy);
  }

  reorderTeam(index, direction) {
    if (direction === 'up' && index > 0) {
      const temp = this.playerTeam[index];
      this.playerTeam[index] = this.playerTeam[index - 1];
      this.playerTeam[index - 1] = temp;
    } else if (direction === 'down' && index < this.playerTeam.length - 1) {
      const temp = this.playerTeam[index];
      this.playerTeam[index] = this.playerTeam[index + 1];
      this.playerTeam[index + 1] = temp;
    }
    this.showTeamSummary();
  }

  showTeamSummary() {
    this.hideSubViews();
    const box = $('#teamBox');
    if (!box) return;
    box.replaceChildren();

    const count = this.playerTeam ? this.playerTeam.length : 1;
    say(`Équipe de compagnons (${count}/6) - Choisis une créature :`);

    const teamList = this.playerTeam && this.playerTeam.length > 0 ? this.playerTeam : [this.me.base];

    teamList.forEach((c, idx) => {
      const card = document.createElement('div');
      card.className = 'team-card-btn';
      card.style.cursor = 'pointer';

      const infoDiv = document.createElement('div');
      infoDiv.className = 'team-card-info';

      const spriteSlot = document.createElement('div');
      spriteSlot.replaceChildren(makeCreatureSprite(c));
      infoDiv.appendChild(spriteSlot);

      const metaDiv = document.createElement('div');
      metaDiv.className = 'team-card-meta';
      const quality = c.quality || 'C';
      const typeLabel = this.types[c.type] ? this.types[c.type].label : c.type;
      const maxHp = c.maxHp || c.hp;
      const hpStatus = c.hp <= 0 ? `<span style="color:#e5594f; font-weight:bold;">K.O. (0/${maxHp})</span>` : `PV ${c.hp}/${maxHp}`;
      metaDiv.innerHTML = `<span class="title">${c.name} <small class="quality-badge">[${quality}]</small> <small style="color:var(--muted);">Niv. ${c.level || 1}</small></span><span class="sub-text">Type ${typeLabel} · ${hpStatus}</span>`;
      infoDiv.appendChild(metaDiv);

      card.appendChild(infoDiv);

      const rightDiv = document.createElement('div');
      rightDiv.style.display = 'flex';
      rightDiv.style.alignItems = 'center';
      rightDiv.style.gap = '8px';

      if (c.id === this.me.base.id) {
        const tag = document.createElement('span');
        tag.className = 'active-tag';
        tag.textContent = 'En combat';
        rightDiv.appendChild(tag);
      } else {
        const tag = document.createElement('span');
        tag.className = 'sub-text';
        tag.textContent = 'Observer ►';
        rightDiv.appendChild(tag);
      }

      const actionsDiv = document.createElement('div');
      actionsDiv.className = 'reorder-btns';
      actionsDiv.addEventListener('click', (e) => e.stopPropagation());

      if (idx > 0) {
        const upBtn = document.createElement('button');
        upBtn.className = 'btn-reorder';
        upBtn.textContent = '▲';
        upBtn.ariaLabel = 'Monter';
        upBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.reorderTeam(idx, 'up');
        });
        actionsDiv.appendChild(upBtn);
      }

      if (idx < this.playerTeam.length - 1) {
        const downBtn = document.createElement('button');
        downBtn.className = 'btn-reorder';
        downBtn.textContent = '▼';
        downBtn.ariaLabel = 'Descendre';
        downBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.reorderTeam(idx, 'down');
        });
        actionsDiv.appendChild(downBtn);
      }

      rightDiv.appendChild(actionsDiv);
      card.appendChild(rightDiv);

      card.addEventListener('click', () => this.showCreatureDetail(c));
      box.appendChild(card);
    });

    const backBtn = document.createElement('button');
    backBtn.className = 'btn-back full';
    backBtn.innerHTML = '◄ Retour <small>Menu principal</small>';
    backBtn.addEventListener('click', () => this.showMainActions());
    box.appendChild(backBtn);

    box.hidden = false;
    this.setMoveButtons(!this.busy);
  }

  showCreatureDetail(c) {
    this.hideSubViews();
    const box = $('#detailBox');
    if (!box) return;
    box.replaceChildren();

    say(`Observation : ${c.name}`);

    const header = document.createElement('div');
    header.className = 'detail-header';
    header.appendChild(makeCreatureSprite(c));

    const headerText = document.createElement('div');
    const quality = c.quality || 'C';
    const typeLabel = this.types[c.type] ? this.types[c.type].label : c.type;
    headerText.innerHTML = `<div class="detail-title">${c.name} <span class="quality-badge">[Qualité ${quality}]</span> <span style="font-size:0.9rem; color:var(--muted);">Niv. ${c.level || 1}</span></div><div style="color:var(--muted); font-size:0.85rem;">Type ${typeLabel} · XP ${c.xp || 0}</div>`;
    header.appendChild(headerText);
    box.appendChild(header);

    const statsGrid = document.createElement('div');
    statsGrid.className = 'stats-grid';
    const targetDef = c.def || 10;
    const maxHp = c.maxHp || c.hp;
    const effortHtml = (this.settings && this.settings.showEffort)
      ? `<div class="stat-item"><label>Endurance :</label> <strong>${c.effort !== undefined ? c.effort : 100}/${c.maxEffort || 100}</strong></div>`
      : '';
    statsGrid.innerHTML = `
      <div class="stat-item"><label>PV :</label> <strong>${c.hp}/${maxHp}</strong></div>
      <div class="stat-item"><label>Attaque :</label> <strong>${c.atk}</strong></div>
      <div class="stat-item"><label>Défense :</label> <strong>${targetDef}</strong></div>
      <div class="stat-item"><label>Vitesse :</label> <strong>${c.spd}</strong></div>
      ${effortHtml}
    `;
    box.appendChild(statsGrid);

    const movesTitle = document.createElement('div');
    movesTitle.className = 'detail-section-title';
    movesTitle.textContent = 'Attaques connues :';
    box.appendChild(movesTitle);

    const movesList = document.createElement('div');
    movesList.className = 'detail-moves-list';
    if (c.moves && c.moves.length > 0) {
      c.moves.forEach((mId) => {
        const m = this.moves[mId];
        if (!m) return;
        const chip = document.createElement('div');
        chip.className = 'detail-move-chip';
        const mTypeLabel = m.type && this.types[m.type] ? this.types[m.type].label : 'Normal';
        chip.innerHTML = `<span><strong>${m.name}</strong> (${mTypeLabel})</span> <span>puissance ${m.power}</span>`;
        movesList.appendChild(chip);
      });
    }
    box.appendChild(movesList);

    if (c.evolution) {
      const evoTitle = document.createElement('div');
      evoTitle.className = 'detail-section-title';
      evoTitle.textContent = 'Évolution :';
      box.appendChild(evoTitle);

      const evoChip = document.createElement('div');
      evoChip.className = 'evolution-chip';
      let evoText = '';
      if (c.evolution.type === 'level') evoText = `Évolue au niveau ${c.evolution.level} en ${c.evolution.into}`;
      else if (c.evolution.type === 'item') evoText = `Évolue avec l’objet "${c.evolution.item}" en ${c.evolution.into}`;
      else if (c.evolution.type === 'biome') evoText = `Évolue dans le biome "${c.evolution.biome}" en ${c.evolution.into}`;
      else evoText = `Conditions d'évolution définies pour ${c.evolution.into}`;
      evoChip.textContent = evoText;
      box.appendChild(evoChip);
    }

    if (c.id !== this.me.base.id && c.hp > 0) {
      const switchBtn = document.createElement('button');
      switchBtn.className = 'btn-main-attack full';
      switchBtn.style.marginTop = '8px';
      switchBtn.innerHTML = `Envoyer ${c.name} au combat <small>Remplacer la créature active (coûte un tour)</small>`;
      switchBtn.addEventListener('click', () => this.switchCreature(c));
      box.appendChild(switchBtn);
    }

    const backBtn = document.createElement('button');
    backBtn.className = 'btn-back full';
    backBtn.innerHTML = '◄ Retour <small>Liste de l’équipe</small>';
    backBtn.addEventListener('click', () => this.showTeamSummary());
    box.appendChild(backBtn);

    box.hidden = false;
    this.setMoveButtons(!this.busy);
  }

  async switchCreature(newBaseCreature) {
    if (this.busy) return;
    this.busy = true;
    this.hideSubViews();
    this.setMoveButtons(false);

    const oldName = this.me.base.name;
    say(`${oldName} revient ! En avant, ${newBaseCreature.name} !`);

    this.me = this.fighter(newBaseCreature);
    if (this.battleParticipants) this.battleParticipants.add(this.me.base);

    $('#meName').textContent = `${this.me.base.name} (Niv. ${this.me.base.level || 1})`;
    const quality = this.me.base.quality || 'C';
    const qBadge = $('#meQuality');
    if (qBadge) qBadge.textContent = ` [${quality}]`;
    const typeLabel = this.types[this.me.base.type] ? this.types[this.me.base.type].label : this.me.base.type;
    $('#meType').textContent = typeLabel;
    const slot = $('#meSprite');
    slot.replaceChildren(makeCreatureSprite(this.me.base));
    this.updateBars();

    await wait(1200);

    // Foe turn: foe attacks incoming creature or rests
    await this.executeFoeTurn();

    if (this.me.hp <= 0) {
      await this.handlePlayerKO();
      return;
    }

    this.busy = false;
    this.showMainActions();
  }

  buildSelect(container, onSelect) {
    container.replaceChildren();
    this.creatures.forEach((c) => {
      const b = document.createElement('button');
      b.appendChild(makeCreatureSprite(c));
      const t = document.createElement('div');
      const typeLabel = this.types[c.type] ? this.types[c.type].label : c.type;
      const quality = c.quality || 'C';
      t.innerHTML = `${c.name} <small>[Qualité ${quality}] · Type ${typeLabel} · PV ${c.hp}</small>`;
      b.appendChild(t);
      b.addEventListener('click', () => onSelect(c));
      container.appendChild(b);
    });
  }

  async startBattle(playerCreature, foeCreature = null, options = {}) {
    this.isWild = options.isWild !== undefined ? options.isWild : true;
    this.onBattleEnd = options.onEndCallback || null;
    this.playerTeam = options.playerTeam || [playerCreature];

    let lead = playerCreature;
    if (lead.hp <= 0) {
      const alive = this.playerTeam.find((c) => c.hp > 0);
      if (alive) lead = alive;
    }
    this.me = this.fighter(lead);

    const rawFoe = foeCreature || pick(this.creatures);
    const generatedFoe = this.isWild ? applyQualityToCreature(rawFoe, null, this.qualities) : { ...rawFoe };
    generatedFoe.speciesId = generatedFoe.speciesId || rawFoe.id || generatedFoe.id;
    generatedFoe.baseHp = generatedFoe.baseHp || rawFoe.hp || 40;
    generatedFoe.baseEffort = generatedFoe.baseEffort || rawFoe.effort || 100;

    // Attribuer niveau au foe basé sur le niveau du joueur
    if (!generatedFoe.level) {
      const leadLevel = lead.level || 1;
      generatedFoe.level = Math.max(1, leadLevel + Math.floor(Math.random() * 3) - 1);
    }
    const qKey = generatedFoe.quality || "C";
    const tKey = generatedFoe.trait || null;
    const maxHp = statAuNiveau(rawFoe, "hp", generatedFoe.level, qKey, tKey, this.progression, this.qualities);
    generatedFoe.maxHp = maxHp;
    generatedFoe.hp = maxHp;
    generatedFoe.atk = statAuNiveau(rawFoe, "atk", generatedFoe.level, qKey, tKey, this.progression, this.qualities);
    generatedFoe.def = statAuNiveau(rawFoe, "def", generatedFoe.level, qKey, tKey, this.progression, this.qualities);
    generatedFoe.spd = statAuNiveau(rawFoe, "spd", generatedFoe.level, qKey, tKey, this.progression, this.qualities);
    const maxEffort = statAuNiveau(rawFoe, "effort", generatedFoe.level, qKey, tKey, this.progression, this.qualities);
    generatedFoe.maxEffort = maxEffort;
    generatedFoe.effort = maxEffort;

    this.foe = this.fighter(generatedFoe);

    this.battleParticipants = new Set([this.me.base]);
    this.finalHitCompanion = null;

    $('#select').hidden = true;
    $('#map').hidden = true;
    $('#battle').hidden = false;

    [['me', this.me], ['foe', this.foe]].forEach(([id, f]) => {
      $('#' + id + 'Name').textContent = `${f.base.name} (Niv. ${f.base.level || 1})`;
      const quality = f.base.quality || 'C';
      const qBadge = $('#' + id + 'Quality');
      if (qBadge) qBadge.textContent = ` [${quality}]`;
      const typeLabel = this.types[f.base.type] ? this.types[f.base.type].label : f.base.type;
      $('#' + id + 'Type').textContent = typeLabel;
      const slot = $('#' + id + 'Sprite');
      slot.replaceChildren(makeCreatureSprite(f.base));
    });
    this.updateBars();

    this.busy = true;
    say(this.isWild ? `${this.foe.base.name} sauvage (Niv. ${this.foe.base.level}) apparaît !` : `Un dresseur envoie ${this.foe.base.name} (Niv. ${this.foe.base.level}) !`);
    await wait(1200);

    this.busy = false;
    this.showMainActions();
  }

  async forfeit() {
    if (this.busy) return;
    this.busy = true;
    this.setMoveButtons(false);

    say(`Tu abandonnes le combat !`);
    await wait(1100);
    await this.finishBattle(false, 'Abandon');
  }

  async attemptFlee() {
    if (this.busy) return;
    this.busy = true;
    this.setMoveButtons(false);

    say(`${this.me.base.name} tente de fuir !`);
    await wait(800);

    if (this.foe.base.spd > this.me.base.spd) {
      say(`${this.foe.base.name} est plus rapide et tente d'agir avant ta fuite !`);
      await wait(900);

      await this.executeFoeTurn();

      if (this.me.hp <= 0) {
        await this.handlePlayerKO();
        return;
      }
    }

    say(`Tu as pris la fuite avec succès !`);
    await wait(1100);
    await this.finishBattle(false, 'Fuite');
  }

  async attack(att, def, move, defSlot) {
    say(`${att.base.name} utilise ${move.name} !`);
    await wait(800);

    if (def.isDodging) {
      say(`${def.base.name} esquive l’attaque de ${att.base.name} !`);
      await wait(1000);
      return;
    }

    if (Math.random() * 100 > move.acc) {
      say('Mais ça rate !');
      await wait(900);
      return;
    }
    const mult = this.typeMult(move.type, def.base.type);
    const targetDef = def.base.def || 0;
    const dmg = Math.max(1, Math.round(move.power * att.base.atk / (50 + targetDef) * mult * (0.85 + Math.random() * 0.15)));

    const sprite = $('#' + defSlot + 'Sprite');
    sprite.classList.add('hit');
    def.hp = Math.max(0, def.hp - dmg);
    def.base.hp = def.hp; // Persist HP damage on base companion
    if (def.hp <= 0 && def === this.foe) {
      this.finalHitCompanion = att.base;
    }
    this.updateBars();
    await wait(700);
    sprite.classList.remove('hit');
    if (mult > 1) { say('C’est très efficace !'); await wait(900); }
    else if (mult < 1) { say('Ce n’est pas très efficace…'); await wait(900); }
  }

  getActionPriority(action) {
    if (!action) return 0;
    if (action.type === 'attack' && action.move && action.move.category === 'dodge') {
      return 1;
    }
    return 0;
  }

  getFoeAction() {
    const affordableFoeMoves = this.foe.base.moves.filter((id) => {
      const m = this.moves[id];
      if (!m) return false;
      const cost = this.getMoveCost(this.foe, m);
      return cost <= this.foe.effort;
    });
    if (affordableFoeMoves.length > 0) {
      const dodgeId = affordableFoeMoves.find((id) => this.moves[id]?.category === 'dodge');
      const foeLowHp = (this.foe.hp / (this.foe.base.maxHp || this.foe.maxHp || this.foe.hp)) <= 0.35;
      if (dodgeId && foeLowHp && Math.random() < 0.50) {
        return { type: 'attack', move: this.moves[dodgeId] };
      }
      return { type: 'attack', move: this.moves[pick(affordableFoeMoves)] };
    }
    return { type: 'rest' };
  }

  async executeFoeTurn() {
    const fAction = this.getFoeAction();
    await this.executeAction(this.foe, this.me, fAction, 'me');
  }

  async executeAction(a, d, action, slot) {
    if (a.hp <= 0) return;
    if (action.type === 'attack') {
      if (action.move.category === 'dodge') {
        const cost = this.getMoveCost(a, action.move);
        a.effort = Math.max(0, a.effort - cost);
        a.base.effort = a.effort;
        a.isDodging = true;
        a.consecutiveDodgeCount = (a.consecutiveDodgeCount || 0) + 1;
        a.base.consecutiveDodgeCount = a.consecutiveDodgeCount;
        this.updateBars();
        say(`${a.base.name} se prépare à esquiver la prochaine attaque !`);
        await wait(1000);
      } else {
        a.isDodging = false;
        a.consecutiveDodgeCount = 0;
        a.base.consecutiveDodgeCount = 0;
        const cost = this.getMoveCost(a, action.move);
        a.effort = Math.max(0, a.effort - cost);
        a.base.effort = a.effort;
        this.updateBars();
        await this.attack(a, d, action.move, slot);
      }
    } else if (action.type === 'rest') {
      a.isDodging = false;
      a.consecutiveDodgeCount = 0;
      a.base.consecutiveDodgeCount = 0;
      const gain = 35;
      a.effort = Math.min(a.maxEffort, a.effort + gain);
      a.base.effort = a.effort;
      this.updateBars();
      say(`${a.base.name} reprend son souffle et récupère +${gain} d'effort !`);
      await wait(1100);
    }
  }

  recoverReserveEffort() {
    if (!this.playerTeam || !this.me || !this.me.base) return;
    this.playerTeam.forEach((c) => {
      if (c !== this.me.base && c.hp > 0) {
        const maxEffort = c.maxEffort || 100;
        const currentEffort = c.effort !== undefined ? c.effort : maxEffort;
        c.effort = Math.min(maxEffort, currentEffort + 10);
      }
    });
  }

  async playTurn(moveId) {
    if (this.busy) return;
    this.busy = true;
    this.setMoveButtons(false);

    this.me.isDodging = false;
    this.foe.isDodging = false;

    const pAction = { type: 'attack', move: this.moves[moveId] };
    const fAction = this.getFoeAction();

    if (pAction.move && pAction.move.category === 'dodge') {
      this.me.isDodging = true;
    }
    if (fAction.move && fAction.move.category === 'dodge') {
      this.foe.isDodging = true;
    }

    const pPriority = this.getActionPriority(pAction);
    const fPriority = this.getActionPriority(fAction);

    let playerFirst = false;
    if (pPriority > fPriority) {
      playerFirst = true;
    } else if (fPriority > pPriority) {
      playerFirst = false;
    } else {
      playerFirst = this.me.base.spd > this.foe.base.spd || (this.me.base.spd === this.foe.base.spd && Math.random() < 0.5);
    }

    const order = playerFirst
      ? [[this.me, this.foe, pAction, 'foe'], [this.foe, this.me, fAction, 'me']]
      : [[this.foe, this.me, fAction, 'me'], [this.me, this.foe, pAction, 'foe']];

    for (const [a, d, act, slot] of order) {
      await this.executeAction(a, d, act, slot);
      if (d.hp <= 0) {
        this.me.isDodging = false;
        this.foe.isDodging = false;
        if (d === this.me) {
          await this.handlePlayerKO();
        } else {
          await this.endBattle(true, d);
        }
        return;
      }
    }

    this.me.isDodging = false;
    this.foe.isDodging = false;
    this.recoverReserveEffort();
    this.busy = false;
    this.showMainActions();
  }

  async playRestTurn() {
    if (this.busy) return;
    this.busy = true;
    this.setMoveButtons(false);

    this.me.isDodging = false;
    this.foe.isDodging = false;

    const pAction = { type: 'rest' };
    const fAction = this.getFoeAction();

    if (fAction.move && fAction.move.category === 'dodge') {
      this.foe.isDodging = true;
    }

    const pPriority = this.getActionPriority(pAction);
    const fPriority = this.getActionPriority(fAction);

    let playerFirst = false;
    if (pPriority > fPriority) {
      playerFirst = true;
    } else if (fPriority > pPriority) {
      playerFirst = false;
    } else {
      playerFirst = this.me.base.spd > this.foe.base.spd || (this.me.base.spd === this.foe.base.spd && Math.random() < 0.5);
    }

    const order = playerFirst
      ? [[this.me, this.foe, pAction, 'foe'], [this.foe, this.me, fAction, 'me']]
      : [[this.foe, this.me, fAction, 'me'], [this.me, this.foe, pAction, 'foe']];

    for (const [a, d, act, slot] of order) {
      await this.executeAction(a, d, act, slot);
      if (d.hp <= 0) {
        this.me.isDodging = false;
        this.foe.isDodging = false;
        if (d === this.me) {
          await this.handlePlayerKO();
        } else {
          await this.endBattle(true, d);
        }
        return;
      }
    }

    this.me.isDodging = false;
    this.foe.isDodging = false;
    this.recoverReserveEffort();
    this.busy = false;
    this.showMainActions();
  }

  async handlePlayerKO() {
    say(`${this.me.base.name} est K.O. !`);
    await wait(1100);
    const hasAlive = this.playerTeam.some((c) => c.hp > 0);
    if (hasAlive) {
      say(`Choisis un autre compagnon pour poursuivre le combat !`);
      await wait(1000);
      this.busy = false;
      this.showTeamSummary();
    } else {
      await this.endBattle(false, this.me);
    }
  }

  async endBattle(playerWon, loser) {
    if (loser === this.foe) {
      say(`${loser.base.name} est K.O. !`);
      await wait(1100);
    }
    say(playerWon ? 'Victoire ! Bravo !' : 'Défaite… ce sera pour la prochaine fois.');
    await wait(1000);

    if (this.foe && this.playerTeam && this.playerTeam.length > 0) {
      for (const comp of this.playerTeam) {
        const estCoupFinal = (comp === this.finalHitCompanion);
        const estPartEntre = this.battleParticipants ? this.battleParticipants.has(comp) : false;
        const estKO = (comp.hp <= 0);

        const xpGagne = xpRecompense({
          niveauE: this.foe.base.level || 1,
          niveauBeneficiaire: comp.level || 1,
          qualiteE: this.foe.base.quality || 'C',
          typeCombat: this.isWild ? 'sauvage' : 'dresseur',
          difficulteE: this.foe.base.difficulte || 1.0,
          estCoupFinal,
          pvRestantsE: this.foe.hp,
          pvMaxE: this.foe.maxHp,
          traitBeneficiaire: comp.trait || null,
          estKO,
          estPartEntre,
          estDefaiteTotale: !playerWon
        }, this.progression);

        if (xpGagne > 0) {
          const res = appliquerXp(comp, xpGagne, this.progression, this.creatures, this.qualities);
          say(`${comp.name} gagne +${xpGagne} XP !`);
          await wait(900);

          if (res.niveauxGagnes > 0) {
            say(`★ ${comp.name} passe au niveau ${res.nouveauNiveau} !`);
            await wait(1000);

            if (res.movesAppris && res.movesAppris.length > 0) {
              for (const mId of res.movesAppris) {
                const moveObj = this.moves[mId];
                const moveName = moveObj ? moveObj.name : mId;
                say(`${comp.name} apprend ${moveName} !`);
                await wait(1000);
              }
            }

            if (res.evolution) {
              say(`✨ Incroyable ! ${comp.name} évolue en ${res.evolution} !`);
              await wait(1200);
            }
          }
        }
      }
    }

    await this.finishBattle(playerWon, 'KO');
  }

  async finishBattle(playerWon, reason) {
    this.hideSubViews();
    const box = $('#moves');
    box.replaceChildren();
    $('#battleActions').replaceChildren();

    if (this.onBattleEnd) {
      await wait(1200);
      this.onBattleEnd(playerWon, reason);
    } else {
      const b = document.createElement('button');
      b.className = 'full';
      b.textContent = 'Rejouer';
      b.addEventListener('click', () => {
        $('#battle').hidden = true;
        $('#select').hidden = false;
      });
      box.appendChild(b);
      b.focus();
    }
  }
}

import { makeCreatureSprite } from './sprites.js';

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
  return {
    ...baseCreature,
    quality: q.quality,
    hp: Math.max(10, Math.round(baseCreature.hp * mult)),
    atk: Math.max(1, Math.round(baseCreature.atk * mult)),
    def: Math.max(1, Math.round((baseCreature.def || 10) * mult)),
    spd: Math.max(1, Math.round(baseCreature.spd * mult)),
  };
}

export class CombatEngine {
  constructor(types, moves, creatures, qualities = null) {
    this.types = types;
    this.moves = moves;
    this.creatures = creatures;
    this.qualities = qualities;
    this.me = null;
    this.foe = null;
    this.playerTeam = [];
    this.busy = true;
    this.isWild = true;
    this.onBattleEnd = null;

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
    return { base, hp: base.hp };
  }

  updateBars() {
    [['me', this.me], ['foe', this.foe]].forEach(([id, f]) => {
      const pct = Math.round((f.hp / f.base.hp) * 100);
      const bar = $('#' + id + 'Bar');
      bar.style.width = pct + '%';
      bar.style.background = pct > 50 ? '#6fcf7f' : pct > 20 ? '#f0b84a' : '#e5594f';
      $('#' + id + 'Hp').textContent = `PV ${f.hp}/${f.base.hp}`;
    });
  }

  setMoveButtons(enabled) {
    if (typeof document === 'undefined') return;
    document.querySelectorAll('#battleControls button, #moves button, #battleActions button').forEach((b) => { b.disabled = !enabled; });
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

    say(`Choisis une attaque pour ${this.me.base.name} :`);

    this.me.base.moves.forEach((id) => {
      const m = this.moves[id];
      if (!m) return;
      const b = document.createElement('button');
      const moveTypeLabel = m.type && this.types[m.type] ? this.types[m.type].label : 'Normal';
      b.innerHTML = `${m.name}<small>${moveTypeLabel} · puissance ${m.power}</small>`;
      b.addEventListener('click', () => this.playTurn(id));
      box.appendChild(b);
    });

    const backBtn = document.createElement('button');
    backBtn.className = 'btn-back full';
    backBtn.innerHTML = '◄ Retour <small>Menu principal</small>';
    backBtn.addEventListener('click', () => this.showMainActions());
    box.appendChild(backBtn);

    box.hidden = false;
    this.setMoveButtons(!this.busy);
  }

  showTeamSummary() {
    this.hideSubViews();
    const box = $('#teamBox');
    if (!box) return;
    box.replaceChildren();

    const count = this.playerTeam ? this.playerTeam.length : 1;
    say(`Équipe de compagnons (${count}/6) - Choisis une créature :`);

    const teamList = this.playerTeam && this.playerTeam.length > 0 ? this.playerTeam : [this.me.base];

    teamList.forEach((c) => {
      const b = document.createElement('button');
      b.className = 'team-card-btn';

      const infoDiv = document.createElement('div');
      infoDiv.className = 'team-card-info';

      const spriteSlot = document.createElement('div');
      spriteSlot.replaceChildren(makeCreatureSprite(c));
      infoDiv.appendChild(spriteSlot);

      const metaDiv = document.createElement('div');
      metaDiv.className = 'team-card-meta';
      const quality = c.quality || 'C';
      const typeLabel = this.types[c.type] ? this.types[c.type].label : c.type;
      metaDiv.innerHTML = `<span class="title">${c.name} <small class="quality-badge">[${quality}]</small></span><span class="sub-text">Type ${typeLabel} · PV ${c.hp}</span>`;
      infoDiv.appendChild(metaDiv);

      b.appendChild(infoDiv);

      if (c.id === this.me.base.id) {
        const tag = document.createElement('span');
        tag.className = 'active-tag';
        tag.textContent = 'En combat';
        b.appendChild(tag);
      } else {
        const tag = document.createElement('span');
        tag.className = 'sub-text';
        tag.textContent = 'Observer ►';
        b.appendChild(tag);
      }

      b.addEventListener('click', () => this.showCreatureDetail(c));
      box.appendChild(b);
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
    headerText.innerHTML = `<div class="detail-title">${c.name} <span class="quality-badge">[Qualité ${quality}]</span></div><div style="color:var(--muted); font-size:0.85rem;">Type ${typeLabel}</div>`;
    header.appendChild(headerText);
    box.appendChild(header);

    const statsGrid = document.createElement('div');
    statsGrid.className = 'stats-grid';
    const targetDef = c.def || 10;
    statsGrid.innerHTML = `
      <div class="stat-item"><label>PV :</label> <strong>${c.hp}</strong></div>
      <div class="stat-item"><label>Attaque :</label> <strong>${c.atk}</strong></div>
      <div class="stat-item"><label>Défense :</label> <strong>${targetDef}</strong></div>
      <div class="stat-item"><label>Vitesse :</label> <strong>${c.spd}</strong></div>
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

    const backBtn = document.createElement('button');
    backBtn.className = 'btn-back full';
    backBtn.innerHTML = '◄ Retour <small>Liste de l’équipe</small>';
    backBtn.addEventListener('click', () => this.showTeamSummary());
    box.appendChild(backBtn);

    box.hidden = false;
    this.setMoveButtons(!this.busy);
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
    this.me = this.fighter(playerCreature);

    const rawFoe = foeCreature || pick(this.creatures);
    const generatedFoe = this.isWild ? applyQualityToCreature(rawFoe, null, this.qualities) : rawFoe;
    this.foe = this.fighter(generatedFoe);

    $('#select').hidden = true;
    $('#map').hidden = true;
    $('#battle').hidden = false;

    [['me', this.me], ['foe', this.foe]].forEach(([id, f]) => {
      $('#' + id + 'Name').textContent = f.base.name;
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
    say(this.isWild ? `${this.foe.base.name} (Qualité ${this.foe.base.quality}) sauvage apparaît !` : `Un dresseur envoie ${this.foe.base.name} !`);
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
      say(`${this.foe.base.name} est plus rapide et t’attaque avant ta fuite !`);
      await wait(900);

      const fMove = this.moves[pick(this.foe.base.moves)];
      await this.attack(this.foe, this.me, fMove, 'me');

      if (this.me.hp <= 0) {
        await this.endBattle(false, this.me);
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
    this.updateBars();
    await wait(700);
    sprite.classList.remove('hit');
    if (mult > 1) { say('C’est très efficace !'); await wait(900); }
    else if (mult < 1) { say('Ce n’est pas très efficace…'); await wait(900); }
  }

  async playTurn(moveId) {
    if (this.busy) return;
    this.busy = true;
    this.setMoveButtons(false);

    const pMove = this.moves[moveId];
    const fMove = this.moves[pick(this.foe.base.moves)];

    const playerFirst = this.me.base.spd > this.foe.base.spd || (this.me.base.spd === this.foe.base.spd && Math.random() < 0.5);
    const order = playerFirst
      ? [[this.me, this.foe, pMove, 'foe'], [this.foe, this.me, fMove, 'me']]
      : [[this.foe, this.me, fMove, 'me'], [this.me, this.foe, pMove, 'foe']];

    for (const [a, d, m, slot] of order) {
      await this.attack(a, d, m, slot);
      if (d.hp <= 0) { await this.endBattle(a === this.me, d); return; }
    }

    this.busy = false;
    this.showMainActions();
  }

  async endBattle(playerWon, loser) {
    say(`${loser.base.name} est K.O. !`);
    await wait(1100);
    say(playerWon ? 'Victoire ! Bravo !' : 'Défaite… ce sera pour la prochaine fois.');
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

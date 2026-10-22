import { MapEngine } from './map.js';
import { CombatEngine } from './combat.js';
import { makeCreatureSprite } from './sprites.js';

let combatEngine = null;
let mapEngine = null;
let selectedCreature = null;
let playerTeam = [];
let gameData = { types: {}, moves: {}, creatures: [], qualities: [] };

async function init() {
  const [types, moves, creatures, qualities] = await Promise.all([
    fetch('./data/types.json').then((r) => r.json()),
    fetch('./data/moves.json').then((r) => r.json()),
    fetch('./data/creatures.json').then((r) => r.json()),
    fetch('./data/qualities.json').then((r) => r.json())
  ]);

  gameData = { types, moves, creatures, qualities };

  combatEngine = new CombatEngine(types, moves, creatures, qualities);

  const startersBox = document.querySelector('#starters');
  combatEngine.buildSelect(startersBox, (creature) => {
    selectedCreature = creature;
    const teamOthers = creatures.filter((c) => c.id !== creature.id);
    playerTeam = [selectedCreature, ...teamOthers].slice(0, 6);
    startMapExploration();
  });

  const canvas = document.querySelector('#mapCanvas');
  mapEngine = new MapEngine(canvas, () => {
    triggerWildEncounter();
  });

  mapEngine.bindTouchControls(document.querySelector('.controls'));

  setupMapMenu();
}

function setupMapMenu() {
  const startBtn = document.querySelector('#startMenuBtn');
  if (startBtn) {
    startBtn.addEventListener('click', () => {
      toggleMapMenu();
    });
  }
}

function toggleMapMenu() {
  const menuBox = document.querySelector('#mapMenuBox');
  if (!menuBox) return;
  if (menuBox.hidden) {
    showMapMenuMain();
    menuBox.hidden = false;
  } else {
    menuBox.hidden = true;
  }
}

function hideMapMenuSubViews() {
  ['#mapMenuMain', '#mapTeamBox', '#mapDetailBox'].forEach((s) => {
    const el = document.querySelector(s);
    if (el) el.hidden = true;
  });
}

function showMapMenuMain() {
  hideMapMenuSubViews();
  const box = document.querySelector('#mapMenuMain');
  if (!box) return;
  box.replaceChildren();

  const title = document.createElement('h2');
  title.style.margin = '0 0 10px 0';
  title.style.textAlign = 'center';
  title.textContent = 'Menu du jeu';
  box.appendChild(title);

  const teamBtn = document.createElement('button');
    teamBtn.id = 'mapTeamBtn';
  teamBtn.className = 'btn-main-team full';
  teamBtn.style.marginBottom = '8px';
  teamBtn.innerHTML = `Équipe de compagnons (${playerTeam.length}/6) <small>Voir et réordonner l'équipe</small>`;
  teamBtn.addEventListener('click', () => showMapTeamSummary());
  box.appendChild(teamBtn);

  const closeBtn = document.createElement('button');
    closeBtn.id = 'mapCloseBtn';
  closeBtn.className = 'btn-back full';
  closeBtn.innerHTML = 'Fermer le menu';
  closeBtn.addEventListener('click', () => {
    document.querySelector('#mapMenuBox').hidden = true;
  });
  box.appendChild(closeBtn);

  box.hidden = false;
}

function reorderTeam(index, direction) {
  if (direction === 'up' && index > 0) {
    const temp = playerTeam[index];
    playerTeam[index] = playerTeam[index - 1];
    playerTeam[index - 1] = temp;
  } else if (direction === 'down' && index < playerTeam.length - 1) {
    const temp = playerTeam[index];
    playerTeam[index] = playerTeam[index + 1];
    playerTeam[index + 1] = temp;
  }
  selectedCreature = playerTeam[0];
  showMapTeamSummary();
}

function showMapTeamSummary() {
  hideMapMenuSubViews();
  const box = document.querySelector('#mapTeamBox');
  if (!box) return;
  box.replaceChildren();

  const title = document.createElement('div');
  title.className = 'sub';
  title.style.margin = '0 0 8px 0';
  title.textContent = `Équipe de compagnons (${playerTeam.length}/6) :`;
  box.appendChild(title);

  playerTeam.forEach((c, idx) => {
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
    const typeLabel = gameData.types[c.type] ? gameData.types[c.type].label : c.type;
    metaDiv.innerHTML = `<span class="title">${idx === 0 ? '★ ' : ''}${c.name} <small class="quality-badge">[${quality}]</small></span><span class="sub-text">Type ${typeLabel} · PV ${c.hp}</span>`;
    infoDiv.appendChild(metaDiv);

    card.appendChild(infoDiv);

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
        reorderTeam(idx, 'up');
      });
      actionsDiv.appendChild(upBtn);
    }

    if (idx < playerTeam.length - 1) {
      const downBtn = document.createElement('button');
      downBtn.className = 'btn-reorder';
      downBtn.textContent = '▼';
      downBtn.ariaLabel = 'Descendre';
      downBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        reorderTeam(idx, 'down');
      });
      actionsDiv.appendChild(downBtn);
    }

    card.appendChild(actionsDiv);

    card.addEventListener('click', () => showMapCreatureDetail(c));
    box.appendChild(card);
  });

  const backBtn = document.createElement('button');
  backBtn.id = 'mapMenuBackBtn';
  backBtn.className = 'btn-back full';
  backBtn.innerHTML = '◄ Retour <small>Menu principal du jeu</small>';
  backBtn.addEventListener('click', () => showMapMenuMain());
  box.appendChild(backBtn);

  box.hidden = false;
}

function showMapCreatureDetail(c) {
  hideMapMenuSubViews();
  const box = document.querySelector('#mapDetailBox');
  if (!box) return;
  box.replaceChildren();

  const header = document.createElement('div');
  header.className = 'detail-header';
  header.appendChild(makeCreatureSprite(c));

  const headerText = document.createElement('div');
  const quality = c.quality || 'C';
  const typeLabel = gameData.types[c.type] ? gameData.types[c.type].label : c.type;
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
      const m = gameData.moves[mId];
      if (!m) return;
      const chip = document.createElement('div');
      chip.className = 'detail-move-chip';
      const mTypeLabel = m.type && gameData.types[m.type] ? gameData.types[m.type].label : 'Normal';
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
  backBtn.addEventListener('click', () => showMapTeamSummary());
  box.appendChild(backBtn);

  box.hidden = false;
}

async function startMapExploration() {
  document.querySelector('#select').hidden = true;
  document.querySelector('#battle').hidden = true;
  document.querySelector('#map').hidden = false;
  const menuBox = document.querySelector('#mapMenuBox');
  if (menuBox) menuBox.hidden = true;

  await mapEngine.loadMap('./data/maps/campagne.json');
}

function resumeMapExploration() {
  document.querySelector('#select').hidden = true;
  document.querySelector('#battle').hidden = true;
  document.querySelector('#map').hidden = false;
  const menuBox = document.querySelector('#mapMenuBox');
  if (menuBox) menuBox.hidden = true;

  if (mapEngine) {
    mapEngine.draw();
  }
}

function triggerWildEncounter() {
  const activeLead = playerTeam[0] || selectedCreature;
  combatEngine.startBattle(activeLead, null, {
    isWild: true,
    playerTeam: playerTeam,
    onEndCallback: (playerWon, reason) => {
      resumeMapExploration();
    }
  });
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}

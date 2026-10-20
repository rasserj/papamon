import { MapEngine } from './map.js';
import { CombatEngine } from './combat.js';

let combatEngine = null;
let mapEngine = null;
let selectedCreature = null;

async function init() {
  const [types, moves, creatures, qualities] = await Promise.all([
    fetch('./data/types.json').then((r) => r.json()),
    fetch('./data/moves.json').then((r) => r.json()),
    fetch('./data/creatures.json').then((r) => r.json()),
    fetch('./data/qualities.json').then((r) => r.json())
  ]);

  combatEngine = new CombatEngine(types, moves, creatures, qualities);

  const startersBox = document.querySelector('#starters');
  combatEngine.buildSelect(startersBox, (creature) => {
    selectedCreature = creature;
    startMapExploration();
  });

  const canvas = document.querySelector('#mapCanvas');
  mapEngine = new MapEngine(canvas, () => {
    triggerWildEncounter();
  });

  mapEngine.bindTouchControls(document.querySelector('.controls'));
}

async function startMapExploration() {
  document.querySelector('#select').hidden = true;
  document.querySelector('#battle').hidden = true;
  document.querySelector('#map').hidden = false;

  await mapEngine.loadMap('./data/maps/campagne.json');
}

function returnToMap() {
  document.querySelector('#select').hidden = true;
  document.querySelector('#battle').hidden = true;
  document.querySelector('#map').hidden = false;

  if (mapEngine) {
    mapEngine.render();
  }
}

function triggerWildEncounter() {
  combatEngine.startBattle(selectedCreature, null, {
    isWild: true,
    onEndCallback: (playerWon, reason) => {
      returnToMap();
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

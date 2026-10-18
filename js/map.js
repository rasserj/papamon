import { renderMapTile, renderHeroTile } from './sprites.js';

export class MapEngine {
  constructor(canvas, onEncounter) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.onEncounter = onEncounter;
    this.mapData = null;
    this.player = { x: 0, y: 0 };
    this.tileSize = 32; // Screen display size per tile
    this.isMoving = false;
    this.activeTouchDir = null;
    this.touchInterval = null;

    this.setupInputs();
  }

  async loadMap(mapPath) {
    const res = await fetch(mapPath);
    this.mapData = await res.json();
    this.player.x = this.mapData.playerStart.x;
    this.player.y = this.mapData.playerStart.y;

    this.canvas.width = this.mapData.width * this.tileSize;
    this.canvas.height = this.mapData.height * this.tileSize;

    this.render();
  }

  setupInputs() {
    window.addEventListener('keydown', (e) => {
      if (document.querySelector('#map').hidden) return;
      let dx = 0, dy = 0;
      if (e.key === 'ArrowUp' || e.key === 'z' || e.key === 'Z' || e.key === 'w' || e.key === 'W') dy = -1;
      else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') dy = 1;
      else if (e.key === 'ArrowLeft' || e.key === 'q' || e.key === 'Q' || e.key === 'a' || e.key === 'A') dx = -1;
      else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') dx = 1;

      if (dx !== 0 || dy !== 0) {
        e.preventDefault();
        this.movePlayer(dx, dy);
      }
    });
  }

  bindTouchControls(container) {
    const buttons = container.querySelectorAll('.dpad-btn');
    buttons.forEach((btn) => {
      const dir = btn.dataset.dir;
      const startMove = (e) => {
        e.preventDefault();
        let dx = 0, dy = 0;
        if (dir === 'up') dy = -1;
        else if (dir === 'down') dy = 1;
        else if (dir === 'left') dx = -1;
        else if (dir === 'right') dx = 1;

        this.movePlayer(dx, dy);

        if (!this.touchInterval) {
          this.touchInterval = setInterval(() => {
            this.movePlayer(dx, dy);
          }, 200);
        }
      };

      const stopMove = (e) => {
        e.preventDefault();
        if (this.touchInterval) {
          clearInterval(this.touchInterval);
          this.touchInterval = null;
        }
      };

      btn.addEventListener('touchstart', startMove, { passive: false });
      btn.addEventListener('touchend', stopMove, { passive: false });
      btn.addEventListener('mousedown', startMove);
      btn.addEventListener('mouseup', stopMove);
      btn.addEventListener('mouseleave', stopMove);
    });
  }

  getTileAt(x, y) {
    if (!this.mapData) return null;
    if (x < 0 || x >= this.mapData.width || y < 0 || y >= this.mapData.height) return null;
    const char = this.mapData.grid[y][x];
    return this.mapData.legend[char] || null;
  }

  movePlayer(dx, dy) {
    if (this.isMoving || !this.mapData) return;

    const targetX = this.player.x + dx;
    const targetY = this.player.y + dy;

    const tile = this.getTileAt(targetX, targetY);
    if (!tile || !tile.walkable) return;

    this.player.x = targetX;
    this.player.y = targetY;
    this.render();

    // Random encounter check in wild tall grass (20% chance)
    if (tile.wild && Math.random() < 0.20) {
      if (this.onEncounter) {
        this.onEncounter();
      }
    }
  }

  render() {
    if (!this.mapData) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let y = 0; y < this.mapData.height; y++) {
      for (let x = 0; x < this.mapData.width; x++) {
        const char = this.mapData.grid[y][x];
        const tileInfo = this.mapData.legend[char];
        const tileType = tileInfo ? tileInfo.type : 'grass';
        renderMapTile(this.ctx, tileType, x * this.tileSize, y * this.tileSize, this.tileSize);
      }
    }

    renderHeroTile(this.ctx, this.player.x * this.tileSize, this.player.y * this.tileSize, this.tileSize);
  }
}

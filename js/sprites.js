/* ============ SPRITES 16x16 ============ */

const TOPS = {
  sprout: [
    '................',
    '.......kk.......',
    '......kGGk......',
    '.......kGk......',
    '....kkkkkkkk....'
  ],
  flame: [
    '................',
    '.......kk.......',
    '......kGGk......',
    '.....kGggGk.....',
    '....kkkggkkk....'
  ],
  drop: [
    '................',
    '.......kk.......',
    '......kGGk......',
    '.....kGGGGk.....',
    '....kkkkkkkk....'
  ]
};

const BODY = [
  '..kggggggggggk..',
  '.kggggggggggggk.',
  '.kggwkggggkwggk.',
  '.kggwkggggkwggk.',
  '.kggggggggggggk.',
  '.kgGgggkkgggGgk.',
  '..kggggggggggk..',
  '...kkggggggkk...',
  '....kkkkkkkk....',
  '................',
  '................'
];

export function makeCreatureSprite(c) {
  const cv = document.createElement('canvas');
  cv.width = 16;
  cv.height = 16;
  cv.className = 'sprite';
  const ctx = cv.getContext('2d');
  const pal = { k: '#14201a', w: '#ffffff', g: c.colors[0], G: c.colors[1] };
  const topRows = TOPS[c.top] || TOPS.sprout;
  [...topRows, ...BODY].forEach((row, y) => {
    [...row].forEach((ch, x) => {
      if (ch !== '.') {
        ctx.fillStyle = pal[ch];
        ctx.fillRect(x, y, 1, 1);
      }
    });
  });
  return cv;
}

// Hero sprite matrix (16x16)
const HERO_SPRITE = [
  '.....kkkkkk.....',
  '....kHhhhhHk....',
  '....kHhhhhHk....',
  '....kHhhhhHk....',
  '....kHhhhhHk....',
  '....kkwkkwkk....',
  '....kkwkkwkk....',
  '....kffffffk....',
  '...kfffffffffk..',
  '..kfffffffffffk.',
  '..kfffffffffffk.',
  '..kfffffffffffk.',
  '..kffbffffbfk..',
  '...kbbk..kbbk...',
  '...kkk....kkk...',
  '................'
];

export function renderHeroTile(ctx, x, y, size) {
  const scale = size / 16;
  const pal = {
    k: '#111b15',
    H: '#d44e38', // Hat/Cap
    h: '#f06d56',
    w: '#ffffff',
    f: '#3d72a8', // Jacket/Shirt
    b: '#273b2c'  // Pants/Shoes
  };

  HERO_SPRITE.forEach((row, ry) => {
    [...row].forEach((ch, rx) => {
      if (ch !== '.') {
        ctx.fillStyle = pal[ch] || '#ffffff';
        ctx.fillRect(x + rx * scale, y + ry * scale, scale, scale);
      }
    });
  });
}

export function renderMapTile(ctx, tileType, x, y, size) {
  if (tileType === 'grass') {
    ctx.fillStyle = '#4a854d';
    ctx.fillRect(x, y, size, size);
    ctx.fillStyle = '#3f7342';
    ctx.fillRect(x + 2, y + 3, 2, 4);
    ctx.fillRect(x + 10, y + 8, 2, 4);
  } else if (tileType === 'tall_grass') {
    ctx.fillStyle = '#3d7840';
    ctx.fillRect(x, y, size, size);
    ctx.fillStyle = '#225225';
    // Tall grass tufts
    ctx.fillRect(x + 2, y + 2, 3, 10);
    ctx.fillRect(x + 7, y + 4, 3, 10);
    ctx.fillRect(x + 12, y + 2, 3, 10);
  } else if (tileType === 'path') {
    ctx.fillStyle = '#c2a874';
    ctx.fillRect(x, y, size, size);
    ctx.fillStyle = '#b09663';
    ctx.fillRect(x + 4, y + 4, 3, 3);
    ctx.fillRect(x + 10, y + 10, 2, 2);
  } else if (tileType === 'water') {
    ctx.fillStyle = '#3b72a8';
    ctx.fillRect(x, y, size, size);
    ctx.fillStyle = '#568cc4';
    ctx.fillRect(x + 2, y + 4, 6, 2);
    ctx.fillRect(x + 8, y + 10, 6, 2);
  } else if (tileType === 'tree') {
    // Ground base
    ctx.fillStyle = '#4a854d';
    ctx.fillRect(x, y, size, size);
    // Trunk
    ctx.fillStyle = '#5c3d28';
    ctx.fillRect(x + 6, y + 10, 4, 6);
    // Foliage
    ctx.fillStyle = '#1c4222';
    ctx.fillRect(x + 2, y + 2, 12, 10);
    ctx.fillStyle = '#2b5c33';
    ctx.fillRect(x + 4, y + 4, 8, 6);
  } else {
    ctx.fillStyle = '#4a854d';
    ctx.fillRect(x, y, size, size);
  }

  // Grid border line subtle effect
  ctx.strokeStyle = 'rgba(0,0,0,0.06)';
  ctx.strokeRect(x, y, size, size);
}

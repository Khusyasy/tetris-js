const gridEl = document.getElementById('grid');
const scoreEl = document.getElementById('score');
const linesEl = document.getElementById('lines');
const holdEl = document.getElementById('hold');
const nextEl = document.getElementById('next');

const startBtn = document.getElementById('start');
const resetBtn = document.getElementById('reset');

const keybindsModal = document.getElementById('keybinds-modal');
const customKeybindsBtn = document.getElementById('custom-keybinds');
const keybindsBtn = document.getElementById('btn-keybinds');

const parameterModal = document.getElementById('parameter-modal');
const resetParameterBtn = document.getElementById('reset-parameter');
const parameterBtn = document.getElementById('btn-parameter');

const keysDown = {};
let prevKeysDown = {};
const keysHold = {};

document.addEventListener('keydown', (e) => {
  keysDown[e.key] = true;
});
document.addEventListener('keyup', (e) => {
  delete keysDown[e.key];
});

function getCookie(name) {
  var cname = name + '=';
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(cname) == 0) {
      return c.substring(cname.length, c.length);
    }
  }
  return '';
}

function setCookie(name, value, exp_days) {
  var d = new Date();
  d.setTime(d.getTime() + exp_days * 24 * 60 * 60 * 1000);
  var expires = 'expires=' + d.toGMTString();
  document.cookie = name + '=' + value + ';' + expires + ';path=/';
}

function storageGet(key) {
  // return localStorage.getItem(key);
  return decodeURIComponent(atob(getCookie(key)));
}

function storageSet(key, value) {
  // localStorage.setItem(key, value);
  setCookie(key, btoa(encodeURIComponent(value)), 365);
}

// read from local storage
const DEFAULT_INPUT_CONFIG = {
  mv_left: 'a',
  mv_right: 'd',
  softdrop: 'w',
  harddrop: 's',
  rot_ccw: 'ArrowLeft',
  rot_cw: 'ArrowRight',
  rot_180: 'ArrowUp',
  hold: 'Shift',
};
let INPUT_CONFIG = { ...DEFAULT_INPUT_CONFIG };
if (storageGet('INPUT_CONFIG')) {
  INPUT_CONFIG = {
    ...INPUT_CONFIG,
    ...JSON.parse(storageGet('INPUT_CONFIG')),
  };
}
storageSet('INPUT_CONFIG', JSON.stringify(INPUT_CONFIG));

let USE_DEFAULT_KEYBINDS = true;
if (storageGet('USE_DEFAULT_KEYBINDS')) {
  USE_DEFAULT_KEYBINDS = storageGet('USE_DEFAULT_KEYBINDS') === 'true';
}
storageSet('USE_DEFAULT_KEYBINDS', USE_DEFAULT_KEYBINDS);
if (USE_DEFAULT_KEYBINDS) {
  customKeybindsBtn.innerText = 'Keybinds: Default';
} else {
  customKeybindsBtn.innerText = 'Keybinds: Custom';
}

// read from local storage
const DEFAULT_PARAMETER = {
  FPS: {
    min: 10,
    max: 1000,
    step: 10,
    value: 240,
    unit: 'fps',
  },
  gravity_interval: {
    min: 20,
    max: 2 * 1000,
    step: 20,
    value: 200,
    unit: 'ms',
  },
  softdrop_mult: {
    min: 1,
    max: 20,
    step: 1,
    value: 4,
    unit: 'x',
  },
  ARR: {
    min: 10,
    max: 500,
    step: 5,
    value: 30,
    unit: 'ms',
  },
  DAS: {
    min: 10,
    max: 500,
    step: 5,
    value: 160,
    unit: 'ms',
  },
};
let PARAMETER = { ...DEFAULT_PARAMETER };
if (storageGet('PARAMETER')) {
  PARAMETER = {
    ...PARAMETER,
    ...JSON.parse(storageGet('PARAMETER')),
  };
}
storageSet('PARAMETER', JSON.stringify(PARAMETER));

function getInput(key, prev = false) {
  if (USE_DEFAULT_KEYBINDS) {
    if (prev) {
      return prevKeysDown[DEFAULT_INPUT_CONFIG[key]];
    }
    return keysDown[DEFAULT_INPUT_CONFIG[key]];
  } else {
    if (prev) {
      return prevKeysDown[INPUT_CONFIG[key]];
    }
    return keysDown[INPUT_CONFIG[key]];
  }
}

// GAME LOOKUP TABLES

// PIECES_TABLE
const PIECES_TABLE = [
  {
    name: 'I',
    color: '#00ffff',
    centerX: 1,
    centerY: 2,
    shapes: {
      0: [
        [0, 1],
        [1, 1],
        [2, 1],
        [3, 1],
      ],
      1: [
        [2, 0],
        [2, 1],
        [2, 2],
        [2, 3],
      ],
      2: [
        [0, 2],
        [1, 2],
        [2, 2],
        [3, 2],
      ],
      3: [
        [1, 0],
        [1, 1],
        [1, 2],
        [1, 3],
      ],
    },
  },
  {
    name: 'J',
    color: '#0000ff',
    centerX: 1,
    centerY: 2,
    shapes: {
      0: [
        [0, 0],
        [0, 1],
        [1, 1],
        [2, 1],
      ],
      1: [
        [1, 0],
        [2, 0],
        [1, 1],
        [1, 2],
      ],
      2: [
        [0, 1],
        [1, 1],
        [2, 1],
        [2, 2],
      ],
      3: [
        [1, 0],
        [1, 1],
        [1, 2],
        [0, 2],
      ],
    },
  },
  {
    name: 'L',
    color: '#ffa500',
    centerX: 1,
    centerY: 2,
    shapes: {
      0: [
        [2, 0],
        [0, 1],
        [1, 1],
        [2, 1],
      ],
      1: [
        [1, 0],
        [1, 1],
        [1, 2],
        [2, 2],
      ],
      2: [
        [0, 1],
        [1, 1],
        [2, 1],
        [0, 2],
      ],
      3: [
        [0, 0],
        [1, 0],
        [1, 1],
        [1, 2],
      ],
    },
  },
  {
    name: 'O',
    color: '#ffff00',
    centerX: 0,
    centerY: 2,
    shapes: {
      0: [
        [0, 0],
        [1, 0],
        [0, 1],
        [1, 1],
      ],
      1: [
        [0, 0],
        [1, 0],
        [0, 1],
        [1, 1],
      ],
      2: [
        [0, 0],
        [1, 0],
        [0, 1],
        [1, 1],
      ],
      3: [
        [0, 0],
        [1, 0],
        [0, 1],
        [1, 1],
      ],
    },
  },
  {
    name: 'S',
    color: '#00ff00',
    centerX: 1,
    centerY: 2,
    shapes: {
      0: [
        [1, 0],
        [2, 0],
        [0, 1],
        [1, 1],
      ],
      1: [
        [1, 0],
        [1, 1],
        [2, 1],
        [2, 2],
      ],
      2: [
        [1, 1],
        [2, 1],
        [0, 2],
        [1, 2],
      ],
      3: [
        [0, 0],
        [0, 1],
        [1, 1],
        [1, 2],
      ],
    },
  },
  {
    name: 'T',
    color: '#800080',
    centerX: 1,
    centerY: 2,
    shapes: {
      0: [
        [1, 0],
        [0, 1],
        [1, 1],
        [2, 1],
      ],
      1: [
        [1, 0],
        [1, 1],
        [2, 1],
        [1, 2],
      ],
      2: [
        [0, 1],
        [1, 1],
        [2, 1],
        [1, 2],
      ],
      3: [
        [1, 0],
        [0, 1],
        [1, 1],
        [1, 2],
      ],
    },
  },
  {
    name: 'Z',
    color: '#ff0000',
    centerX: 1,
    centerY: 2,
    shapes: {
      0: [
        [0, 0],
        [1, 0],
        [1, 1],
        [2, 1],
      ],
      1: [
        [2, 0],
        [1, 1],
        [2, 1],
        [1, 2],
      ],
      2: [
        [0, 1],
        [1, 1],
        [1, 2],
        [2, 2],
      ],
      3: [
        [1, 0],
        [0, 1],
        [1, 1],
        [0, 2],
      ],
    },
  },
];

// KICK_TABLE[currentRotation][nextRotation]
const KICK_TABLE = {
  0: {
    1: [
      [0, 0],
      [-1, 0],
      [-1, 1],
      [0, -2],
      [-1, -2],
    ],
    3: [
      [0, 0],
      [1, 0],
      [1, -1],
      [0, -2],
      [1, -2],
    ],
  },
  1: {
    0: [
      [0, 0],
      [1, 0],
      [1, -1],
      [0, 2],
      [1, 2],
    ],
    2: [
      [0, 0],
      [1, 0],
      [1, -1],
      [0, 2],
      [1, 2],
    ],
  },
  2: {
    1: [
      [0, 0],
      [-1, 0],
      [-1, 1],
      [0, -2],
      [-1, -2],
    ],
    3: [
      [0, 0],
      [1, 0],
      [1, 1],
      [0, -2],
      [1, -2],
    ],
  },
  3: {
    0: [
      [0, 0],
      [-1, 0],
      [-1, -1],
      [0, 2],
      [-1, 2],
    ],
    2: [
      [0, 0],
      [-1, 0],
      [-1, -1],
      [0, 2],
      [-1, 2],
    ],
  },
};

const KICK_TABLE_I = {
  0: {
    1: [
      [0, 0],
      [-2, 0],
      [1, 0],
      [-2, -1],
      [1, 2],
    ],
    3: [
      [0, 0],
      [-1, 0],
      [2, 0],
      [-1, 2],
      [2, -1],
    ],
  },
  1: {
    0: [
      [0, 0],
      [2, 0],
      [-1, 0],
      [2, 1],
      [-1, -2],
    ],
    2: [
      [0, 0],
      [-1, 0],
      [2, 0],
      [-1, 2],
      [2, -1],
    ],
  },
  2: {
    1: [
      [0, 0],
      [1, 0],
      [-2, 0],
      [1, -2],
      [-2, 1],
    ],
    3: [
      [0, 0],
      [2, 0],
      [-1, 0],
      [2, 1],
      [-1, -2],
    ],
  },
  3: {
    0: [
      [0, 0],
      [-2, 0],
      [1, 0],
      [-2, -1],
      [1, 2],
    ],
    2: [
      [0, 0],
      [1, 0],
      [-2, 0],
      [1, -2],
      [-2, 1],
    ],
  },
};

const COLOR_BLANK = '#00000000';
const COLOR_GHOST = '#33333340';

class GridCell {
  constructor(col, htmlEl, isPlaced = false) {
    this.col = col;
    this.htmlEl = htmlEl;
    this.isPlaced = isPlaced;
  }
  clear() {
    this.col = COLOR_BLANK;
    this.isPlaced = false;
  }
}

const playGrid = [];
const playWidth = 10;
const playHeight = 23;
for (let i = 0; i < playHeight; i++) {
  playGrid.push([]);
  for (let j = 0; j < playWidth; j++) {
    const cell = document.createElement('div');
    cell.classList.add('cell');
    gridEl.appendChild(cell);
    playGrid[i].push(new GridCell(COLOR_BLANK, cell));
  }
}

const nextGrid = [];
const nextWidth = 4;
const nextHeight = 20;
for (let i = 0; i < nextHeight; i++) {
  nextGrid.push([]);
  for (let j = 0; j < nextWidth; j++) {
    const cell = document.createElement('div');
    cell.classList.add('cell');
    nextEl.appendChild(cell);
    nextGrid[i].push(new GridCell(COLOR_BLANK, cell));
  }
}

let holdPiece = null;
const holdGrid = [];
const holdWidth = 4;
const holdHeight = 4;
for (let i = 0; i < holdHeight; i++) {
  holdGrid.push([]);
  for (let j = 0; j < holdWidth; j++) {
    const cell = document.createElement('div');
    cell.classList.add('cell');
    holdEl.appendChild(cell);
    holdGrid[i].push(new GridCell(COLOR_BLANK, cell));
  }
}

let score = 0;
let linesCleared = 0;
function updateDOM() {
  playGrid.forEach((row, i) => {
    row.forEach((cell, j) => {
      if (cell.col !== COLOR_BLANK) {
        cell.htmlEl.style.setProperty('--cell-color', cell.col);
      } else {
        cell.htmlEl.style.removeProperty('--cell-color');
      }
    });
  });
  scoreEl.innerText = `Score: ${score}`;
  linesEl.innerText = `Lines Cleared: ${linesCleared}`;
  // show next pieces
  nextGrid.forEach((row, i) => {
    row.forEach((cell, j) => {
      if (cell.col !== COLOR_BLANK) {
        cell.htmlEl.style.setProperty('--cell-color', cell.col);
      } else {
        cell.htmlEl.style.removeProperty('--cell-color');
      }
    });
  });
  // show hold piece
  holdGrid.forEach((row, i) => {
    row.forEach((cell, j) => {
      if (cell.col !== COLOR_BLANK) {
        cell.htmlEl.style.setProperty('--cell-color', cell.col);
      } else {
        cell.htmlEl.style.removeProperty('--cell-color');
      }
    });
  });
}

let currX = 0;
let currY = 0;
let currPiece = null;
let currRotation = 0;
let canHold = true;

let moveCounter = 0;
let delayMoveCounter = 0;
let gravityCounter = 0;

function resetPiece() {
  currX = Math.floor(playWidth / 2) - 1;
  currY = 2;
  currRotation = 0;
}

let bag = [];
function newPiece() {
  while (bag.length <= 7) {
    let temp = [...PIECES_TABLE];
    for (let i = temp.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [temp[i], temp[j]] = [temp[j], temp[i]];
    }
    bag.unshift(...temp);
  }
  resetPiece();
  canHold = true;
  currPiece = bag.pop();
  if (!validShapePlace(currPiece, 0, currX, currY)) {
    startBtn.innerText = 'Game Over';
    startBtn.disabled = true;
    clearInterval(gameInterval);
  }
}

function clearGrid() {
  // clear play grid
  for (let i = 0; i < playHeight; i++) {
    for (let j = 0; j < playWidth; j++) {
      if (!playGrid[i][j].isPlaced) {
        playGrid[i][j].col = COLOR_BLANK;
      }
    }
  }
  // clear hold grid
  holdGrid.forEach((row) => {
    row.forEach((cell) => {
      cell.col = COLOR_BLANK;
    });
  });
  // clear next grid
  nextGrid.forEach((row) => {
    row.forEach((cell) => {
      cell.col = COLOR_BLANK;
    });
  });
}

function validShapePlace(piece, rotation, x, y) {
  x = x - piece.centerX;
  y = y - piece.centerY;
  for (let i = 0; i < piece.shapes[rotation].length; i++) {
    const [px, py] = piece.shapes[rotation][i];
    if (
      x + px < 0 ||
      x + px >= playWidth ||
      y + py < 0 ||
      y + py >= playHeight
    ) {
      return false;
    }
    if (playGrid[y + py][x + px].isPlaced) {
      return false;
    }
  }
  return true;
}

let gameInterval = null;
let lastTime = performance.now();
function gameLoop() {
  const deltaTime = performance.now() - lastTime;
  lastTime = performance.now();
  clearGrid();

  // move
  let dx = 0;
  if (getInput('mv_left')) {
    if (validShapePlace(currPiece, currRotation, currX - 1, currY)) {
      dx = -1;
    }
  }
  if (getInput('mv_right')) {
    if (validShapePlace(currPiece, currRotation, currX + 1, currY)) {
      dx = 1;
    }
  }

  if (dx != 0) {
    if (delayMoveCounter <= PARAMETER.DAS.value) {
      if (delayMoveCounter == 0) {
        moveCounter = 0;
        currX += dx;
      }
      delayMoveCounter += deltaTime;
    } else {
      moveCounter += deltaTime;
      if (moveCounter >= PARAMETER.ARR.value) {
        moveCounter = 0;
        currX += dx;
      }
    }
  } else {
    delayMoveCounter = 0;
  }

  // rotate
  let newRotation = currRotation;
  const KICK_TABLE_USED = currPiece.name == 'I' ? KICK_TABLE_I : KICK_TABLE;
  if (getInput('rot_ccw')) {
    newRotation = (4 + (currRotation - 1)) % 4;
    if (newRotation != currRotation && !keysHold['rot_ccw']) {
      for (const [kx, ky] of KICK_TABLE_USED[currRotation][newRotation]) {
        if (validShapePlace(currPiece, newRotation, currX + kx, currY - ky)) {
          currRotation = newRotation;
          currX += kx;
          currY -= ky;
          break;
        }
      }
      keysHold['rot_ccw'] = true;
    }
  } else {
    keysHold['rot_ccw'] = false;
  }
  if (getInput('rot_cw')) {
    newRotation = (4 + (currRotation + 1)) % 4;
    if (newRotation != currRotation && !keysHold['rot_cw']) {
      for (const [kx, ky] of KICK_TABLE_USED[currRotation][newRotation]) {
        if (validShapePlace(currPiece, newRotation, currX + kx, currY - ky)) {
          currRotation = newRotation;
          currX += kx;
          currY -= ky;
          break;
        }
      }
      keysHold['rot_cw'] = true;
    }
  } else {
    keysHold['rot_cw'] = false;
  }
  if (getInput('rot_180')) {
    newRotation = (4 + (currRotation + 2)) % 4;
    if (newRotation != currRotation && !keysHold['rot_180']) {
      if (validShapePlace(currPiece, newRotation, currX, currY)) {
        currRotation = newRotation;
      }
      keysHold['rot_180'] = true;
    }
  } else {
    keysHold['rot_180'] = false;
  }

  // draw ghost piece placement
  let ghostY = currY;
  while (validShapePlace(currPiece, currRotation, currX, ghostY + 1)) {
    ghostY++;
  }
  for (let i = 0; i < currPiece.shapes[currRotation].length; i++) {
    const [px, py] = currPiece.shapes[currRotation][i];
    const ty = ghostY - currPiece.centerY + py;
    const tx = currX - currPiece.centerX + px;
    playGrid[ty][tx].col = COLOR_GHOST;
  }

  // gravity
  gravityCounter += deltaTime;
  let reset = false;
  let scaledGravityInterval =
    PARAMETER.gravity_interval.value - Math.floor(linesCleared / 10) * 20;
  if (scaledGravityInterval < 20) {
    scaledGravityInterval = 20;
  }

  let tempGravityInterval = scaledGravityInterval;
  if (currY == ghostY) {
    tempGravityInterval = scaledGravityInterval * 4;
  } else if (getInput('softdrop')) {
    tempGravityInterval = scaledGravityInterval / PARAMETER.softdrop_mult.value;
  }
  if (gravityCounter >= tempGravityInterval) {
    if (validShapePlace(currPiece, currRotation, currX, currY + 1)) {
      currY++;
    } else {
      // place piece
      for (let i = 0; i < currPiece.shapes[currRotation].length; i++) {
        const [px, py] = currPiece.shapes[currRotation][i];
        const ty = currY - currPiece.centerY + py;
        const tx = currX - currPiece.centerX + px;
        playGrid[ty][tx].isPlaced = true;
      }
      reset = true;
    }
    gravityCounter = 0;
  }

  // harddrop
  if (!keysHold['harddrop']) {
    if (getInput('harddrop')) {
      keysHold['harddrop'] = true;
      currY = ghostY;
      // place piece
      for (let i = 0; i < currPiece.shapes[currRotation].length; i++) {
        const [px, py] = currPiece.shapes[currRotation][i];
        const ty = currY - currPiece.centerY + py;
        const tx = currX - currPiece.centerX + px;
        playGrid[ty][tx].isPlaced = true;
      }
      reset = true;
    }
  }
  if (!getInput('harddrop')) {
    keysHold['harddrop'] = false;
  }

  // draw piece
  for (let i = 0; i < currPiece.shapes[currRotation].length; i++) {
    const [px, py] = currPiece.shapes[currRotation][i];
    const ty = currY - currPiece.centerY + py;
    const tx = currX - currPiece.centerX + px;
    playGrid[ty][tx].col = currPiece.color;
  }

  if (reset) {
    // check for full rows
    const fullRows = [];
    for (let i = 0; i < playHeight; i++) {
      let full = true;
      for (let j = 0; j < playWidth; j++) {
        if (!playGrid[i][j].isPlaced) {
          full = false;
          continue;
        }
      }
      if (full) {
        fullRows.push(i);
      }
    }
    // remove full rows
    for (let i = 0; i < fullRows.length; i++) {
      for (let j = fullRows[i]; j >= 0; j--) {
        for (let k = 0; k < playWidth; k++) {
          if (j == 0) {
            playGrid[j][k].isPlaced = false;
            playGrid[j][k].col = COLOR_BLANK;
          } else {
            playGrid[j][k].isPlaced = playGrid[j - 1][k].isPlaced;
            playGrid[j][k].col = playGrid[j - 1][k].col;
          }
        }
      }
    }
    // check for continuous full rows
    linesCleared += fullRows.length;
    if (fullRows.length == 1) {
      score += 100;
    } else if (fullRows.length == 2) {
      score += 300;
    } else if (fullRows.length == 3) {
      score += 500;
    } else if (fullRows.length >= 4) {
      score += 800;
    }
    newPiece();
  }

  // check to swap hold piece
  if (!keysHold['hold']) {
    if (getInput('hold') && canHold) {
      if (holdPiece) {
        const temp = holdPiece;
        holdPiece = currPiece;
        currPiece = temp;
        resetPiece();
      } else {
        holdPiece = currPiece;
        newPiece();
      }
      keysHold['hold'] = true;
      canHold = false;
    }
  }
  if (!getInput('hold')) {
    keysHold['hold'] = false;
  }

  // update holdGrid
  if (holdPiece) {
    holdPiece.shapes[0].forEach((pos) => {
      const [x, y] = pos;
      const ty = 2 + y - holdPiece.centerY;
      const tx = 1 + x - holdPiece.centerX;
      holdGrid[ty][tx].col = holdPiece.color + (canHold ? '' : +'50');
    });
  }

  // update nextGrid
  for (let i = 0; i < 5; i++) {
    const showPiece = bag[bag.length - 1 - i];
    showPiece.shapes[0].forEach((pos) => {
      const [x, y] = pos;
      const ty = i * 4 + 2 + y - showPiece.centerY;
      const tx = 1 + x - showPiece.centerX;
      nextGrid[ty][tx].col = showPiece.color;
    });
  }
  updateDOM();
  prevKeysDown = JSON.parse(JSON.stringify(keysDown));
}

function newGame() {
  playGrid.forEach((row) => {
    row.forEach((cell) => {
      cell.clear();
    });
  });
  holdPiece = null;
  bag = [];
  score = 0;
  linesCleared = 0;
  clearGrid();
  newPiece();
  updateDOM();
  lastTime = performance.now();
  gameLoop();
}
newGame();

function pauseGame() {
  playing = false;
  startBtn.innerText = 'Start';
  clearInterval(gameInterval);
  clearInterval(countdownInterval);
}

let playing = false;
let countdownInterval = null;
let countdown = 1;
startBtn.addEventListener('click', () => {
  if (!playing) {
    playing = true;
    countdown = 1;
    clearInterval(countdownInterval);
    const countdownFunc = () => {
      if (countdown > 0) {
        startBtn.innerText = countdown;
        countdown--;
      } else {
        startBtn.innerText = 'Pause';
        lastTime = performance.now();
        gameLoop();
        gameInterval = setInterval(gameLoop, 1000 / PARAMETER.FPS.value);
        clearInterval(countdownInterval);
      }
    };
    countdownFunc();
    countdownInterval = setInterval(countdownFunc, 1000);
  } else {
    pauseGame();
  }
  startBtn.blur();
});

resetBtn.addEventListener('click', () => {
  newGame();
  playing = false;
  startBtn.innerText = 'Start';
  startBtn.disabled = false;
  clearInterval(gameInterval);
  resetBtn.blur();
});

const editElements = {};
let editActive = null;
Object.entries(INPUT_CONFIG).forEach(([name, value]) => {
  const divEl = document.createElement('div');
  divEl.classList.add('form-group');

  const labelEl = document.createElement('label');
  labelEl.innerText = name;
  labelEl.htmlFor = name;
  divEl.appendChild(labelEl);

  const inputEl = document.createElement('input');
  inputEl.type = 'text';
  inputEl.value = USE_DEFAULT_KEYBINDS ? DEFAULT_INPUT_CONFIG[name] : value;
  inputEl.id = name;
  inputEl.disabled = true;
  divEl.appendChild(inputEl);

  const editBtn = document.createElement('button');
  editBtn.innerText = 'Change';
  function changeKey(e) {
    editActive = name;
    // check duplicate
    for (let [inName, inValue] of Object.entries(INPUT_CONFIG)) {
      if (inName != name && inValue == e.key) {
        alert('Key already in use');
        return;
      }
    }
    if (e.key != 'Escape') {
      inputEl.value = e.key;
      INPUT_CONFIG[name] = e.key;
      storageSet('INPUT_CONFIG', JSON.stringify(INPUT_CONFIG));
      document.removeEventListener('keydown', changeKey);
    }
    editActive = null;
    editBtn.innerText = 'Change';
  }
  editBtn.addEventListener('click', async () => {
    if (editActive == null) {
      editBtn.innerText = 'Press key';
      document.addEventListener('keydown', changeKey);
      editActive = name;
    } else if (editActive == name) {
      editBtn.innerText = 'Change';
      document.removeEventListener('keydown', changeKey);
      editActive = null;
    }
  });
  divEl.appendChild(editBtn);

  keybindsModal.appendChild(divEl);
  editElements[name] = {
    inputEl,
    editBtn,
  };
});

customKeybindsBtn.addEventListener('click', () => {
  USE_DEFAULT_KEYBINDS = !USE_DEFAULT_KEYBINDS;
  storageSet('USE_DEFAULT_KEYBINDS', USE_DEFAULT_KEYBINDS);
  if (USE_DEFAULT_KEYBINDS) {
    customKeybindsBtn.innerText = 'Keybinds: Default';
    Object.entries(editElements).forEach(([name, data]) => {
      const { inputEl, editBtn } = data;
      inputEl.value = DEFAULT_INPUT_CONFIG[name];
      editBtn.disabled = true;
    });
  } else {
    customKeybindsBtn.innerText = 'Keybinds: Custom';
    Object.entries(editElements).forEach(([name, data]) => {
      const { inputEl, editBtn } = data;
      inputEl.value = INPUT_CONFIG[name];
      editBtn.disabled = false;
    });
  }
});

keybindsBtn.addEventListener('click', pauseGame);

const parameterElements = {};
Object.entries(PARAMETER).forEach(([name, data]) => {
  const divEl = document.createElement('div');
  divEl.classList.add('form-group');

  const labelEl = document.createElement('label');
  labelEl.innerText = name;
  labelEl.htmlFor = name;
  divEl.appendChild(labelEl);

  const conEl = document.createElement('div');
  conEl.classList.add('parameter-info');

  const valueEl = document.createElement('p');
  valueEl.innerText = data.value;
  valueEl.htmlFor = name;

  const unitEl = document.createElement('p');
  unitEl.innerText = data.unit;
  unitEl.htmlFor = name;

  conEl.appendChild(valueEl);
  conEl.appendChild(unitEl);

  const inputEl = document.createElement('input');
  inputEl.type = 'range';
  inputEl.min = data.min;
  inputEl.max = data.max;
  inputEl.step = data.step;
  inputEl.value = data.value;
  inputEl.id = name;
  inputEl.addEventListener('input', () => {
    PARAMETER[name].value = inputEl.value;
    valueEl.innerText = inputEl.value;
    storageSet('PARAMETER', JSON.stringify(PARAMETER));
  });

  divEl.appendChild(inputEl);
  divEl.appendChild(conEl);

  parameterModal.appendChild(divEl);
  parameterElements[name] = {
    inputEl,
    valueEl,
  };
});

resetParameterBtn.addEventListener('click', () => {
  PARAMETER = JSON.parse(JSON.stringify(DEFAULT_PARAMETER));
  storageSet('PARAMETER', JSON.stringify(PARAMETER));
  Object.entries(PARAMETER).forEach(([name, data]) => {
    const { inputEl, valueEl } = parameterElements[name];
    inputEl.value = data.value;
    valueEl.innerText = data.value;
  });
  resetParameterBtn.blur();
});

parameterBtn.addEventListener('click', pauseGame);

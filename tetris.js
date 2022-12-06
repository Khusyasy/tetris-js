const gridEl = document.getElementById('grid');
const scoreEl = document.getElementById('score');
const holdEl = document.getElementById('hold');
const nextEl = document.getElementById('next');

const startBtn = document.getElementById('start');
const resetBtn = document.getElementById('reset');

const keysDown = {};
let prevKeysDown = {};
document.addEventListener('keydown', (e) => {
  keysDown[e.key] = true;
});
document.addEventListener('keyup', (e) => {
  delete keysDown[e.key];
});

const pieces = [
  {
    name: 'I',
    color: '#00ffff',
    shape: [
      [-1, -1],
      [0, -1],
      [1, -1],
      [2, -1],
    ],
  },
  {
    name: 'J',
    color: '#0000ff',
    shape: [
      [-1, -1],
      [-1, 0],
      [0, 0],
      [1, 0],
    ],
  },
  {
    name: 'L',
    color: '#ffa500',
    shape: [
      [-1, 0],
      [0, 0],
      [1, 0],
      [1, -1],
    ],
  },
  {
    name: 'O',
    color: '#ffff00',
    shape: [
      [0, 0],
      [0, 1],
      [1, 0],
      [1, 1],
    ],
  },
  {
    name: 'S',
    color: '#00ff00',
    shape: [
      [-1, 0],
      [0, 0],
      [0, -1],
      [1, -1],
    ],
  },
  {
    name: 'T',
    color: '#800080',
    shape: [
      [-1, 0],
      [0, 0],
      [1, 0],
      [0, -1],
    ],
  },
  {
    name: 'Z',
    color: '#ff0000',
    shape: [
      [-1, -1],
      [0, -1],
      [0, 0],
      [1, 0],
    ],
  },
];

function rotate(shape, rotation) {
  if (rotation === 0) {
    return shape;
  }
  const newShape = [];
  for (let i = 0; i < shape.length; i++) {
    const [x, y] = shape[i];
    newShape.push([-y, x]);
  }
  return rotate(newShape, rotation - 1);
}

const COLOR_BLANK = '#00000000';

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
const playHeight = 20;
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
let holdHold = false;
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

let moveInterval = 7;
let moveCounter = 0;

let rotateHold = false;

let gravityInterval = 15;
let gravityCounter = 0;

function resetPiece() {
  currX = Math.floor(playWidth / 2) - 1;
  currY = 1;
  currRotation = 0;
}

let bag = [];
function newPiece() {
  while (bag.length <= 7) {
    let temp = [...pieces];
    for (let i = temp.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [temp[i], temp[j]] = [temp[j], temp[i]];
    }
    bag.push(...temp);
  }
  resetPiece();
  currPiece = bag.pop();
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

function newGame() {
  playGrid.forEach((row) => {
    row.forEach((cell) => {
      cell.clear();
    });
  });
  holdPiece = null;
  bag = [];
  clearGrid();
  newPiece();
  updateDOM();
}
newGame();

let gameInterval = null;
function gameLoop() {
  const currShape = rotate(currPiece.shape, currRotation);
  clearGrid();

  // move
  let dx = 0;
  // get key input
  if (keysDown['a'] || keysDown['A']) {
    let canMove = true;
    for (let i = 0; i < currPiece.shape.length; i++) {
      const [px, py] = currShape[i];
      if (currX + px - 1 < 0) {
        canMove = false;
        break;
      }
      if (playGrid[currY + py][currX + px - 1].isPlaced) {
        canMove = false;
        break;
      }
    }
    if (canMove) {
      dx = -1;
    }
  }
  if (keysDown['d'] || keysDown['D']) {
    let canMove = true;
    for (let i = 0; i < currPiece.shape.length; i++) {
      const [px, py] = currShape[i];
      if (currX + px + 1 >= playWidth) {
        canMove = false;
        break;
      }
      if (playGrid[currY + py][currX + px + 1].isPlaced) {
        canMove = false;
        break;
      }
    }
    if (canMove) {
      dx = 1;
    }
  }
  if (
    prevKeysDown['a'] ||
    prevKeysDown['A'] ||
    prevKeysDown['d'] ||
    prevKeysDown['D']
  ) {
    moveCounter++;
    if (moveCounter >= moveInterval) {
      moveCounter = 0;
      currX += dx;
    }
  } else {
    moveCounter = 0;
    currX += dx;
  }

  // rotate
  let canRotate = true;
  let newRotation = currRotation;
  if (keysDown['q'] || keysDown['Q']) {
    newRotation = (4 + (currRotation - 1)) % 4;
  }
  if (keysDown['e'] || keysDown['E']) {
    newRotation = (4 + (currRotation + 1)) % 4;
  }
  if (newRotation != currRotation) {
    const newShape = rotate(currPiece.shape, newRotation);
    for (let i = 0; i < currPiece.shape.length; i++) {
      const [px, py] = newShape[i];
      if (currX + px < 0 || currX + px >= playWidth) {
        canRotate = false;
        break;
      }
      if (playGrid[currY + py][currX + px].isPlaced) {
        canRotate = false;
        break;
      }
    }
  }
  if (!rotateHold) {
    if (canRotate) {
      currRotation = newRotation;
    }
    rotateHold = true;
  }
  if (!keysDown['q'] && !keysDown['Q'] && !keysDown['e'] && !keysDown['E']) {
    rotateHold = false;
  }

  // gravity
  gravityCounter++;
  let reset = false;
  let tempGravityInterval = gravityInterval;
  if (keysDown[' ']) {
    tempGravityInterval = gravityInterval / 4;
  }
  if (gravityCounter >= tempGravityInterval) {
    gravityCounter = 0;
    // check collision
    let canMove = true;
    for (let i = 0; i < currPiece.shape.length; i++) {
      const [px, py] = currShape[i];
      if (currY + py + 1 >= playHeight) {
        canMove = false;
        break;
      } else if (playGrid[currY + py + 1][currX + px].isPlaced) {
        canMove = false;
        break;
      }
    }

    if (canMove) {
      currY++;
    } else {
      // place piece
      for (let i = 0; i < currPiece.shape.length; i++) {
        const [px, py] = currShape[i];
        if (currY + py < playHeight) {
          playGrid[currY + py][currX + px].isPlaced = true;
        }
      }
      reset = true;
    }
  }
  // draw
  for (let i = 0; i < currPiece.shape.length; i++) {
    const [px, py] = currShape[i];

    playGrid[currY + py][currX + px].col = currPiece.color;
  }

  if (reset) {
    newPiece();
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
    if (fullRows.length == 1) {
      score += 100;
    } else if (fullRows.length == 2) {
      score += 300;
    } else if (fullRows.length == 3) {
      score += 500;
    } else if (fullRows.length >= 4) {
      score += 800;
    }
  }

  // check to swap hold piece
  if (!holdHold) {
    if (keysDown['w'] || keysDown['W']) {
      if (holdPiece) {
        const temp = holdPiece;
        holdPiece = currPiece;
        currPiece = temp;
        resetPiece();
      } else {
        holdPiece = currPiece;
        newPiece();
      }
      holdHold = true;
    }
  }
  if (!keysDown['w'] && !keysDown['W']) {
    holdHold = false;
  }

  // update holdGrid
  if (holdPiece) {
    holdPiece.shape.forEach((pos) => {
      const [x, y] = pos;
      holdGrid[2 + y][1 + x].col = holdPiece.color;
    });
  }

  // update nextGrid
  for (let i = 0; i < 5; i++) {
    const showPiece = bag[bag.length - 1 - i];
    showPiece.shape.forEach((pos) => {
      const [x, y] = pos;
      nextGrid[i * 4 + 2 + y][1 + x].col = showPiece.color;
    });
  }
  updateDOM();
  prevKeysDown = JSON.parse(JSON.stringify(keysDown));
}

let playing = false;
startBtn.addEventListener('click', () => {
  if (!playing) {
    playing = true;
    startBtn.innerText = 'Pause';
    gameInterval = setInterval(gameLoop, 1000 / 60);
  } else {
    playing = false;
    startBtn.innerText = 'Start';
    clearInterval(gameInterval);
  }
  startBtn.blur();
});

resetBtn.addEventListener('click', () => {
  newGame();
  playing = false;
  startBtn.innerText = 'Start';
  clearInterval(gameInterval);
  resetBtn.blur();
});

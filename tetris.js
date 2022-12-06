const gridEl = document.getElementById('grid');
const scoreEl = document.getElementById('score');
const nextEl = document.getElementById('next');

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

const width = 10;
const height = 20;

let score = 0;
const grid = [];

const COLOR_BLANK = '#00000000';

// create grid
for (let i = 0; i < height; i++) {
  grid.push([]);
  for (let j = 0; j < width; j++) {
    const cell = document.createElement('div');
    cell.classList.add('cell');
    gridEl.appendChild(cell);
    grid[i].push({ col: COLOR_BLANK, cell, isPlaced: false });
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
    nextGrid[i].push({ col: COLOR_BLANK, cell });
  }
}

function updateDOM() {
  grid.forEach((row, i) => {
    row.forEach((cell, j) => {
      if (cell.col !== COLOR_BLANK) {
        cell.cell.style.setProperty('--cell-color', cell.col);
      } else {
        cell.cell.style.removeProperty('--cell-color');
      }
    });
  });
  scoreEl.innerText = `Score: ${score}`;
  // show next pieces
  nextGrid.forEach((row, i) => {
    row.forEach((cell, j) => {
      if (cell.col !== COLOR_BLANK) {
        cell.cell.style.setProperty('--cell-color', cell.col);
      } else {
        cell.cell.style.removeProperty('--cell-color');
      }
    });
  });
}

const keysDown = {};
let prevKeysDown = {};
document.addEventListener('keydown', (e) => {
  keysDown[e.key] = true;
});
document.addEventListener('keyup', (e) => {
  delete keysDown[e.key];
});

let currX = 0;
let currY = 0;
let currPiece = null;
let currRotation = 0;

let moveInterval = 7;
let moveCounter = 0;

let rotateHold = false;

let gravityInterval = 15;
let gravityCounter = 0;

const bag = [];
function newPiece() {
  while (bag.length <= 7) {
    let temp = [...pieces];
    for (let i = temp.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [temp[i], temp[j]] = [temp[j], temp[i]];
    }
    bag.push(...temp);
  }
  currX = Math.floor(width / 2) - 1;
  currY = 1;
  currPiece = bag.pop();
  currRotation = 0;
}

newPiece();
updateDOM();
const interval = setInterval(() => {
  const currShape = rotate(currPiece.shape, currRotation);
  // clear
  for (let i = 0; i < height; i++) {
    for (let j = 0; j < width; j++) {
      if (!grid[i][j].isPlaced) {
        grid[i][j].col = COLOR_BLANK;
      }
    }
  }

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
      if (grid[currY + py][currX + px - 1].isPlaced) {
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
      if (currX + px + 1 >= width) {
        canMove = false;
        break;
      }
      if (grid[currY + py][currX + px + 1].isPlaced) {
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
      if (currX + px < 0 || currX + px >= width) {
        canRotate = false;
        break;
      }
      if (grid[currY + py][currX + px].isPlaced) {
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
      if (currY + py + 1 >= height) {
        canMove = false;
        break;
      } else if (grid[currY + py + 1][currX + px].isPlaced) {
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
        if (currY + py < height) {
          grid[currY + py][currX + px].isPlaced = true;
        }
      }
      reset = true;
    }
  }
  // draw
  for (let i = 0; i < currPiece.shape.length; i++) {
    const [px, py] = currShape[i];

    grid[currY + py][currX + px].col = currPiece.color;
  }

  if (reset) {
    newPiece();
    // check for full rows
    const fullRows = [];
    for (let i = 0; i < height; i++) {
      let full = true;
      for (let j = 0; j < width; j++) {
        if (!grid[i][j].isPlaced) {
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
        for (let k = 0; k < width; k++) {
          if (j == 0) {
            grid[j][k].isPlaced = false;
            grid[j][k].col = COLOR_BLANK;
          } else {
            grid[j][k].isPlaced = grid[j - 1][k].isPlaced;
            grid[j][k].col = grid[j - 1][k].col;
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

  // update nextGrid
  nextGrid.forEach((row) => {
    row.forEach((cell) => {
      cell.col = COLOR_BLANK;
    });
  });
  for (let i = 0; i < 5; i++) {
    const showPiece = bag[bag.length - 1 - i];
    showPiece.shape.forEach((pos) => {
      const [x, y] = pos;
      nextGrid[i * 4 + 2 + y][1 + x].col = showPiece.color;
    });
  }
  updateDOM();
  prevKeysDown = JSON.parse(JSON.stringify(keysDown));
}, 1000 / 60);

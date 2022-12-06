const gridEl = document.getElementById('grid');
const scoreEl = document.getElementById('score');

const pieces = [
  {
    name: 'I',
    color: '#00ffff',
    shape: [
      [-2, -1],
      [-1, -1],
      [0, -1],
      [1, -1],
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

// create grid
for (let i = 0; i < height; i++) {
  grid.push([]);
  for (let j = 0; j < width; j++) {
    const cell = document.createElement('div');
    cell.classList.add('cell');
    gridEl.appendChild(cell);
    grid[i].push({ col: '#00000000', cell, isPlaced: false });
  }
}

function updateDOM() {
  grid.forEach((row, i) => {
    row.forEach((cell, j) => {
      cell.cell.style.backgroundColor = cell.col;
    });
  });
  scoreEl.innerText = `Score: ${score}`;
}

const keysDown = {};
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

let moveInterval = 5;
let moveCounter = 0;

let rotateHold = false;

let gravityInterval = 15;
let gravityCounter = 0;

function newPiece() {
  currX = Math.floor(width / 2);
  currY = 1;
  currPiece = pieces[Math.floor(Math.random() * pieces.length)];
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
        grid[i][j].col = '#00000000';
      }
    }
  }

  // move
  let dx = 0;
  // get key input
  if (keysDown['ArrowLeft'] || keysDown['a'] || keysDown['A']) {
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
  if (keysDown['ArrowRight'] || keysDown['d'] || keysDown['D']) {
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
  moveCounter++;
  if (moveCounter >= moveInterval) {
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
  if (gravityCounter >= gravityInterval) {
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
    for (let i = height - 1; i >= 0; i--) {
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
            grid[j][k].col = '#00000000';
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
  updateDOM();
}, 1000 / 60);

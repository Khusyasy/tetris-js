const gridEl = document.getElementById('grid');

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

const width = 10;
const height = 20;

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

function updateGrid() {
  grid.forEach((row, i) => {
    row.forEach((cell, j) => {
      cell.cell.style.backgroundColor = cell.col;
    });
  });
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

let moveInterval = 5;
let moveCounter = 0;

let gravityInterval = 20;
let gravityCounter = 0;

function newPiece() {
  currX = Math.floor(width / 2);
  currY = 1;
  currPiece = pieces[Math.floor(Math.random() * pieces.length)];
}

newPiece();
updateGrid();
const interval = setInterval(() => {
  // clear
  for (let i = 0; i < currPiece.shape.length; i++) {
    const [px, py] = currPiece.shape[i];

    grid[currY + py][currX + px].col = '#00000000';
  }

  let dx = 0;
  // get key input
  if (keysDown['ArrowLeft'] || keysDown['a'] || keysDown['A']) {
    let canMove = true;
    for (let i = 0; i < currPiece.shape.length; i++) {
      const [px, py] = currPiece.shape[i];
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
      const [px, py] = currPiece.shape[i];
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
  // move
  moveCounter++;
  if (moveCounter >= moveInterval) {
    moveCounter = 0;
    currX += dx;
  }

  // gravity
  gravityCounter++;
  let reset = false;
  if (gravityCounter >= gravityInterval) {
    gravityCounter = 0;
    // check collision
    let canMove = true;
    for (let i = 0; i < currPiece.shape.length; i++) {
      const [px, py] = currPiece.shape[i];
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
        const [px, py] = currPiece.shape[i];
        if (currY + py < height) {
          grid[currY + py][currX + px].isPlaced = true;
        }
      }
      reset = true;
    }
  }
  // draw
  for (let i = 0; i < currPiece.shape.length; i++) {
    const [px, py] = currPiece.shape[i];

    grid[currY + py][currX + px].col = currPiece.color;
  }

  updateGrid();
  if (reset) {
    newPiece();
  }
}, 1000 / 60);

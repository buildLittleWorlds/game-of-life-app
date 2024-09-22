const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Grid settings
const resolution = 20;
canvas.width = 800;
canvas.height = 600;
const COLS = canvas.width / resolution;
const ROWS = canvas.height / resolution;

// Create the grid
let grid = buildGrid();

// Initialize variables
let animationId = null;
let speed = 10; // Default speed
let lastRenderTime = 0;
let animationRunning = false;

// Build a 2D grid array
function buildGrid() {
  return new Array(COLS).fill(null)
    .map(() => new Array(ROWS).fill(0));
}

// Render the grid onto the canvas
function render(grid) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let col = 0; col < COLS; col++) {
    for (let row = 0; row < ROWS; row++) {
      const cell = grid[col][row];

      ctx.beginPath();
      ctx.rect(col * resolution, row * resolution, resolution, resolution);
      ctx.fillStyle = cell ? '#000' : '#fff';
      ctx.fill();
      ctx.strokeStyle = '#ccc';
      ctx.stroke();
    }
  }
}

// Compute the next generation of the grid
function nextGeneration(grid) {
  const nextGen = grid.map(arr => [...arr]);

  for (let col = 0; col < COLS; col++) {
    for (let row = 0; row < ROWS; row++) {
      const cell = grid[col][row];
      let numNeighbors = 0;

      // Count live neighbors
      for (let i = -1; i < 2; i++) {
        for (let j = -1; j < 2; j++) {
          if (i === 0 && j === 0) {
            continue;
          }

          const x_cell = col + i;
          const y_cell = row + j;

          if (x_cell >= 0 && y_cell >= 0 && x_cell < COLS && y_cell < ROWS) {
            numNeighbors += grid[x_cell][y_cell];
          }
        }
      }

      // Apply the Game of Life rules
      if (cell === 1 && (numNeighbors < 2 || numNeighbors > 3)) {
        nextGen[col][row] = 0;
      } else if (cell === 0 && numNeighbors === 3) {
        nextGen[col][row] = 1;
      }
    }
  }

  return nextGen;
}

// Update the grid and render it
function update(currentTime) {
  if (!animationRunning) return;

  const timeSinceLastRender = currentTime - lastRenderTime;

  // Control the speed of the simulation
  if (timeSinceLastRender >= (1000 / speed)) {
    grid = nextGeneration(grid);
    render(grid);
    lastRenderTime = currentTime;
  }

  animationId = requestAnimationFrame(update);
}

// Start the simulation
document.getElementById('startBtn').addEventListener('click', () => {
  if (!animationRunning) {
    animationRunning = true;
    animationId = requestAnimationFrame(update);
  }
});

// Pause the simulation
document.getElementById('pauseBtn').addEventListener('click', () => {
  animationRunning = false;
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
});

// Clear the grid
document.getElementById('clearBtn').addEventListener('click', () => {
  animationRunning = false;
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
  grid = buildGrid();
  render(grid);
});

// Save the current grid state
function savePattern() {
  const patternName = prompt('Enter a name for your pattern:');
  if (patternName) {
    localStorage.setItem(`pattern_${patternName}`, JSON.stringify(grid));
    alert(`Pattern "${patternName}" saved!`);
  }
}

// Load a saved pattern
function loadPattern() {
  const patternName = prompt('Enter the name of the pattern to load:');
  const savedPattern = localStorage.getItem(`pattern_${patternName}`);
  if (savedPattern) {
    grid = JSON.parse(savedPattern);
    render(grid);
    alert(`Pattern "${patternName}" loaded!`);
  } else {
    alert('Pattern not found.');
  }
}

// Add event listeners for save and load buttons
document.getElementById('saveBtn').addEventListener('click', savePattern);
document.getElementById('loadBtn').addEventListener('click', loadPattern);

// Toggle cell state on click
let isDrawing = false;

canvas.addEventListener('mousedown', (event) => {
  isDrawing = true;
  toggleCell(event);
});

canvas.addEventListener('mousemove', (event) => {
  if (isDrawing) {
    toggleCell(event);
  }
});

canvas.addEventListener('mouseup', () => {
  isDrawing = false;
});

canvas.addEventListener('mouseleave', () => {
  isDrawing = false;
});

function toggleCell(event) {
  const rect = canvas.getBoundingClientRect();
  const col = Math.floor((event.clientX - rect.left) / resolution);
  const row = Math.floor((event.clientY - rect.top) / resolution);

  if (col >= 0 && row >= 0 && col < COLS && row < ROWS) {
    grid[col][row] = grid[col][row] ? 0 : 1;
    render(grid);
  }
}

// Handle speed control
document.getElementById('speedRange').addEventListener('input', (event) => {
  speed = parseInt(event.target.value);
});

// Initial render
render(grid);

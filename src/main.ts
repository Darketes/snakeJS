// State
type Snake = {
  x: number;
  y: number;
};
type Food = {
  x: number;
  y: number;
};

interface State {
  snake: Snake[];
  food: Food;
  alive: boolean;
  count: number;
  speed: number;
}

let globalState: State = {
  snake: [{ x: 14, y: 14 }],
  food: { x: 14, y: 8 },
  alive: true,
  count: 0,
  speed: 10,
};

// DOM creation
const game = document.getElementsByClassName('game')[0];

const scale = 20;
const numCols = 30;
const numRows = 30;

const grid = document.createElement('div');
grid.className = 'grid';
grid.style.display = 'grid';
grid.style.gridTemplateColumns = `repeat(${numCols}, ${scale}px)`;

game.appendChild(grid);

const drawDom = () => {
  let div = document.createElement('div');
  div.style.width = `${scale * numCols}px`;
  div.style.height = `${scale * numRows}px`;
  div.style.background = '#F3ECDA';
  grid.appendChild(div);
};

const entities = document.createElement('div');
game.appendChild(entities);

const drawEntities = (state: State) => {
  entities.innerHTML = '';
  const { snake } = state;
  for (let i = 0; i < snake.length; i++) {
    let div = document.createElement('div');
    div.className = 'actor snake';
    div.style.width = `${scale}px`;
    div.style.height = `${scale}px`;
    div.style.transform = `translate(${snake[i].x * scale}px, ${
      snake[i].y * scale
    }px)`;
    // div.style.top = `${snake[i].y * scale}px`;
    // div.style.left = `${snake[i].x * scale}px`;

    entities.appendChild(div);
  }

  const { food } = state;
  let div = document.createElement('div');
  div.className = 'actor food';
  div.style.top = `${food.y * scale}px`;
  div.style.left = `${food.x * scale}px`;
  div.style.width = `${scale}px`;
  div.style.height = `${scale}px`;
  entities.appendChild(div);
};

drawDom();
drawEntities(globalState);

// Count

const domCount = document.createElement('div');
domCount.style.fontSize = '30px';
domCount.style.margin = '10px';
domCount.style.textAlign = 'center';
domCount.textContent = `Food count: ${globalState.count}`;
game.appendChild(domCount);

// Game over Menu

const gameover = document.createElement('div');
gameover.className = 'gameover';
game.appendChild(gameover);

// Movement

const set = [
  { x: 1, y: 0 },
  { x: -1, y: 0 },
  { x: 0, y: 1 },
  { x: 0, y: -1 },
  { x: 0, y: 0 },
];

let direction = set[4];
let lastDirection = set[4];

function track(event: KeyboardEvent) {
  event.preventDefault();
  switch (event.key) {
    case 'ArrowUp':
      if (lastDirection.y === set[2].y) break;
      direction = set[3];
      break;

    case 'ArrowDown':
      if (lastDirection.y === set[3].y) break;
      direction = set[2];
      break;

    case 'ArrowRight':
      if (lastDirection.x === set[1].x) break;
      direction = set[0];
      break;

    case 'ArrowLeft':
      if (lastDirection.x === set[0].x) break;
      direction = set[1];
      break;
  }
}

window.addEventListener('keydown', track);

function restart(event: KeyboardEvent) {
  if (!globalState.alive) {
    if (event.key === 'Enter') {
      direction = set[4];
      gameover.classList.toggle('active');
      globalState = {
        snake: [{ x: 14, y: 14 }],
        food: { x: 14, y: 8 },
        alive: true,
        count: 0,
        speed: 10,
      };
      domCount.textContent = `Food count: ${globalState.count}`;
      window.requestAnimationFrame(runGame);
    }
  }
}
window.addEventListener('keydown', restart);

// Run game
const update = () => {
  const snake = [...globalState.snake];
  const food = { ...globalState.food };
  let alive: boolean = globalState.alive;
  let count = globalState.count;
  let speed = globalState.speed;

  lastDirection = direction;
  // head push

  snake.push({
    x: snake[snake.length - 1].x + direction.x,
    y: snake[snake.length - 1].y + direction.y,
  });

  if (
    snake[snake.length - 1].x < 0 ||
    snake[snake.length - 1].x > numCols - 1
  )
    alive = !alive;
  if (
    snake[snake.length - 1].y < 0 ||
    snake[snake.length - 1].y > numRows - 1
  )
    alive = !alive;
  if (
    count !== 0 &&
    globalState.snake.some(
      body =>
        body.x === snake[snake.length - 1].x &&
        body.y === snake[snake.length - 1].y
    )
  )
    alive = !alive;
  // tail pop
  if (
    snake[snake.length - 1].x === globalState.food.x &&
    snake[snake.length - 1].y === globalState.food.y
  ) {
    count++;
    if (count % 3 === 0) speed++;
    for (;;) {
      food.x = Math.floor(Math.random() * (numCols - 0));
      food.y = Math.floor(Math.random() * (numRows - 0));
      if (!snake.some(body => body.x === food.x && body.y === food.y))
        break;
    }
  } else snake.shift();

  globalState.snake = snake;
  globalState.food = food;
  globalState.alive = alive;
  globalState.count = count;
  globalState.speed = speed;
  domCount.textContent = `Food count: ${globalState.count}`;
  // drawEntities(globalState);

  // setTimeout(update, 40);
};

// update();

// Run Game
let lastRenderTime = 0;

const runGame = (currentTime: any) => {
  if (!globalState.alive) {
    gameover.innerHTML = `
<h1> ${globalState.count}</h1>
<h2>Press Enter To Reset</h2>
`;
    gameover.classList.toggle('active');
    return;
  }
  const secondsSinceLastRender =
    (currentTime - lastRenderTime) / 1000;

  window.requestAnimationFrame(runGame);
  if (secondsSinceLastRender < 1 / globalState.speed) return;
  lastRenderTime = currentTime;

  update();
  drawEntities(globalState);
};

window.requestAnimationFrame(runGame);

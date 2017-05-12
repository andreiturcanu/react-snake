import React, { Component } from 'react';
import cs from 'classnames';

import './App.css';

const GRID_SIZE = 40;
const TICK_RATE = 100;
const GRID_ARRAY = [];

for (var i = 0; i <= GRID_SIZE; i++) {
  GRID_ARRAY.push(i);
}

const KEY_CODES_MAPPER = {
  38: 'UP',
  39: 'RIGHT',
  37: 'LEFT',
  40: 'BOTTOM',
};

const CONTROLS = {
  UP: 'UP',
  RIGHT: 'RIGHT',
  LEFT: 'LEFT',
  BOTTOM: 'BOTTOM',
};

const DIRECTION_TICKS = {
  UP: (x, y) => ({ x, y: y - 1 }),
  BOTTOM: (x, y) => ({ x, y: y + 1 }),
  RIGHT: (x, y) => ({ x: x + 1, y }),
  LEFT: (x, y) => ({ x: x - 1, y }),
};

const getIsGameOver = (state) =>
  state.playground.isGameOver;

const getIsAllowedToChangeDirection = (state, e) =>
  !getIsGameOver(state) && KEY_CODES_MAPPER[e.keyCode];

const getRandomCoordinate = () =>
  ({
    x: Math.floor(Math.random() * GRID_SIZE),
    y: Math.floor(Math.random() * GRID_SIZE),
  });

const isPosition = (x, y, diffX, diffY) =>
  x === diffX && y === diffY;

// TODO make own some, use compose
const isSnake = (x, y, snakeCoordinates) => {
  for (var i = 0; i < snakeCoordinates.length; i++) {
    if (isPosition(snakeCoordinates[i].x, snakeCoordinates[i].y, x, y)) {
      return true;
    }
  }
  return false;
};

const getSnakeHead = (snake) =>
  snake.coordinates[0];

// apply FP
const getIsSnakeOutside = (snake) =>
  getSnakeHead(snake).x >= GRID_SIZE ||
  getSnakeHead(snake).y >= GRID_SIZE ||
  getSnakeHead(snake).x < 0 ||
  getSnakeHead(snake).y < 0;

const getIsSnakeClumy = (snake) =>
  false;

// apply FP
const getIsSnakeEating = ({ snake, snack }) =>
 isPosition(getSnakeHead(snake).x, getSnakeHead(snake).y, snack.coordinate.x, snack.coordinate.y);

// TODO compose instead: direction ticks
// TODO make last a previous compose step
const applySnakePosition = (prevState) => {
  const isSnakeEating = getIsSnakeEating(prevState);

  const snakeHead = DIRECTION_TICKS[prevState.playground.direction](
    getSnakeHead(prevState.snake).x,
    getSnakeHead(prevState.snake).y,
  );

  // TODO babel stage
  // const [...snakeCoordinatesWithoutLast, lastCoordinate] = prevState.snake.coordinates;
  const snakeTail = isSnakeEating
    ? prevState.snake.coordinates
    : prevState.snake.coordinates.slice(0, prevState.snake.coordinates.length - 1);

  const snackCoordinate = isSnakeEating
   ? getRandomCoordinate()
   : prevState.snack.coordinate;

  return {
    snake: {
      coordinates: [snakeHead].concat(snakeTail), // babel
    },
    snack: {
      coordinate: snackCoordinate,
    },
  };
};

const doChangeDirection = (direction) => () => ({
  playground: {
    direction,
  },
});

const getCellCs = (snake, snack, x, y) =>
  cs(
    'grid-cell',
    {
      'grid-cell-snake': isSnake(x, y, snake.coordinates),
      'grid-cell-snack': isPosition(x, y, snack.coordinate.x, snack.coordinate.y),
    }
  );

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      playground: {
        direction: CONTROLS.RIGHT,
        isGameOver: false,
      },
      snake: {
        coordinates: [getRandomCoordinate()],
      },
      snack: {
        coordinate: getRandomCoordinate(),
      },
    };
  }

  componentDidMount() {
    this.interval = setInterval(this.onTick, TICK_RATE);

    window.addEventListener('keyup', this.onChangeDirection, false);
  }

  componentWillUnmount() {
    clearInterval(this.interval);

    window.removeEventListener('keyup', this.onChangeDirection, false);
  }

  onTick = () => {
    if (getIsSnakeOutside(this.state.snake) || getIsSnakeClumy(this.state.snake)) {
      return;
    }

    this.setState(applySnakePosition);
  }

  onChangeDirection = (e) => {
    if (getIsAllowedToChangeDirection(this.state, e)) {
      this.setState(doChangeDirection(KEY_CODES_MAPPER[e.keyCode]));
    }
  }

  render() {
    const { snake, snack } = this.state;
    return (
      <div>
        <Grid
          snake={snake}
          snack={snack}
        />
      </div>
    );
  }
}

const Grid = ({ snake, snack }) =>
  <div className="grid">
    {GRID_ARRAY.map(y => <Row
      y={y}
      key={y}
      snake={snake}
      snack={snack}
    />)}
  </div>

const Row = ({ snake, snack, y }) =>
  <div className="grid-row">
    {GRID_ARRAY.map(x => <Cell
      x={x}
      y={y}
      key={x}
      snake={snake}
      snack={snack}
    />)}
  </div>

const Cell = ({ snake, snack, x, y }) =>
  <div className={getCellCs(snake, snack, x, y)} />;

export default App;

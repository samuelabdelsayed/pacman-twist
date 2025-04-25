const TILE_SIZE = 30;
const GAME_SPEED = 60;

const GAME_STATES = {
    MENU: 'menu',
    PLAYING: 'playing',
    PAUSED: 'paused',
    GAME_OVER: 'game_over',
    LEVEL_COMPLETE: 'level_complete'
};

const POINTS = {
    DOT: 10,
    POWER_PELLET: 50,
    GHOST: 200,
    FRUIT: 100
};

const DIRECTIONS = {
    NONE: { dx: 0, dy: 0 },
    RIGHT: { dx: 1, dy: 0 },
    LEFT: { dx: -1, dy: 0 },
    UP: { dx: 0, dy: -1 },
    DOWN: { dx: 0, dy: 1 }
};

const GHOST_COLORS = {
    BLINKY: '#FF0000',
    PINKY: '#FFB8FF',
    INKY: '#00FFFF',
    CLYDE: '#FFB852'
};

const GHOST_STATES = {
    SCATTER: 'scatter',
    CHASE: 'chase',
    FRIGHTENED: 'frightened',
    EATEN: 'eaten'
};

const CELL_TYPE = {
    EMPTY: 0,
    WALL: 1,
    PACMAN_SPAWN: 2,
    GHOST_SPAWN: 3,
    POWER_PELLET: 4,
    TUNNEL: 5
};

window.GAME_STATES = GAME_STATES;
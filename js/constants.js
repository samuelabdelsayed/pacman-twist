// Game constants
const CELL_SIZE = 20;
const PACMAN_SIZE = 18;
const GHOST_SIZE = 18;
const DOT_SIZE = 4;
const POWER_PELLET_SIZE = 8;
const GRID_WIDTH = 30;
const GRID_HEIGHT = 30;
const CANVAS_WIDTH = CELL_SIZE * GRID_WIDTH;
const CANVAS_HEIGHT = CELL_SIZE * GRID_HEIGHT;

// Colors
const COLORS = {
    pacman: '#FFFF00',
    blinky: '#FF0000',
    pinky: '#FFB8FF',
    inky: '#00FFFF',
    clyde: '#FFB852',
    maze: '#1919A6',
    dot: '#FFFFFF',
    powerPellet: '#FFAAAA',
    frightenedGhost: '#0000FF',
    background: '#000000'
};

// Game speeds
const SPEEDS = {
    beginner: {
        pacman: 5,
        ghost: 3
    },
    intermediate: {
        pacman: 6,
        ghost: 5
    },
    advanced: {
        pacman: 7,
        ghost: 6.5
    }
};

// Movement directions
const DIRECTIONS = {
    UP: { x: 0, y: -1 },
    DOWN: { x: 0, y: 1 },
    LEFT: { x: -1, y: 0 },
    RIGHT: { x: 1, y: 0 }
};

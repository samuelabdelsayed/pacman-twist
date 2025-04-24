class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.difficulty = 'beginner';
        this.gameState = 'menu'; // menu, playing, paused, gameOver
        this.pacman = new Pacman(14 * CELL_SIZE, 23 * CELL_SIZE);
        this.ghosts = [];
        this.dots = [];
        this.powerPellets = [];
        this.setupGame();
    }

    setupGame() {
        // Initialize game elements based on difficulty
        this.initializeLevel();
        this.setupEventListeners();
        this.gameLoop();
    }

    initializeLevel() {
        // Clear existing elements
        this.dots = [];
        this.powerPellets = [];
        this.ghosts = [];

        // Create maze and dots based on current level
        const layout = LEVELS[this.difficulty][this.level - 1];
        this.createMazeFromLayout(layout);

        // Initialize ghosts based on difficulty
        const ghostCount = this.difficulty === 'beginner' ? 2 : 
                          this.difficulty === 'intermediate' ? 3 : 4;
        this.initializeGhosts(ghostCount);
    }

    createMazeFromLayout(layout) {
        // Layout implementation here
        // Creates walls, dots, and power pellets
    }

    initializeGhosts(count) {
        const ghostTypes = ['blinky', 'pinky', 'inky', 'clyde'];
        for (let i = 0; i < count; i++) {
            this.ghosts.push(new Ghost(
                13 * CELL_SIZE + i * CELL_SIZE,
                11 * CELL_SIZE,
                ghostTypes[i],
                SPEEDS[this.difficulty].ghost
            ));
        }
    }

    gameLoop() {
        if (this.gameState === 'playing') {
            this.update();
        }
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }

    update() {
        this.pacman.update();
        this.ghosts.forEach(ghost => ghost.update());
        this.checkCollisions();
    }

    draw() {
        this.ctx.fillStyle = COLORS.background;
        this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        
        // Draw game elements
        this.drawMaze();
        this.dots.forEach(dot => dot.draw(this.ctx));
        this.powerPellets.forEach(pellet => pellet.draw(this.ctx));
        this.ghosts.forEach(ghost => ghost.draw(this.ctx));
        this.pacman.draw(this.ctx);
        
        // Draw UI
        this.drawScore();
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'ArrowUp':
                case 'w':
                    this.pacman.setDirection(DIRECTIONS.UP);
                    break;
                case 'ArrowDown':
                case 's':
                    this.pacman.setDirection(DIRECTIONS.DOWN);
                    break;
                case 'ArrowLeft':
                case 'a':
                    this.pacman.setDirection(DIRECTIONS.LEFT);
                    break;
                case 'ArrowRight':
                case 'd':
                    this.pacman.setDirection(DIRECTIONS.RIGHT);
                    break;
                case ' ':
                    this.toggleGame();
                    break;
                case 'p':
                    this.togglePause();
                    break;
            }
        });
    }
}

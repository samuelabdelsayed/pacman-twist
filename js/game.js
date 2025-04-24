class Game {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            console.error('Canvas element not found:', canvasId);
            return;
        }
        
        this.ctx = this.canvas.getContext('2d');
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.difficulty = 'beginner';
        this.gameState = GAME_STATES.MENU;
        this.pacman = null;
        this.ghosts = [];
        this.dots = [];
        this.powerPellets = [];
        this.fruit = null;
        this.maze = [];
        this.currentAnimation = null;
        this.speedMultiplier = 1.0;
        this.mazeColor = '#1919A6';
        
        console.log('Game initialized with canvas size:', this.canvas.width, 'x', this.canvas.height);
        this.initializeLevel();
        this.setupEventListeners();
    }

    setupEventListeners() {
        window.addEventListener('keydown', (e) => {
            if (!this.pacman || this.gameState !== GAME_STATES.PLAYING) return;
            
            switch(e.key) {
                case 'ArrowLeft':
                case 'a':
                    this.pacman.nextDirection = {...DIRECTIONS.LEFT};
                    break;
                case 'ArrowRight':
                case 'd':
                    this.pacman.nextDirection = {...DIRECTIONS.RIGHT};
                    break;
                case 'ArrowUp':
                case 'w':
                    this.pacman.nextDirection = {...DIRECTIONS.UP};
                    break;
                case 'ArrowDown':
                case 's':
                    this.pacman.nextDirection = {...DIRECTIONS.DOWN};
                    break;
            }
        });

        document.getElementById('start-btn').addEventListener('click', () => {
            console.log('Start button clicked');
            this.start();
        });

        document.getElementById('pause-btn').addEventListener('click', () => {
            // Pause logic handled in main.js for music sync
        });

        document.getElementById('beginner-btn').addEventListener('click', () => {
            this.changeDifficulty('beginner');
        });

        document.getElementById('intermediate-btn').addEventListener('click', () => {
            this.changeDifficulty('intermediate');
        });

        document.getElementById('advanced-btn').addEventListener('click', () => {
            this.changeDifficulty('advanced');
        });
    }

    start() {
        console.log('Starting game');
        this.gameState = GAME_STATES.PLAYING;
        this.ghosts.forEach((ghost, i) => {
            ghost.penDwellTime = 100 + (i * 60);
        });
        this.gameLoop();
    }

    togglePause() {
        if (this.gameState === GAME_STATES.PLAYING) {
            this.gameState = GAME_STATES.PAUSED;
            cancelAnimationFrame(this.currentAnimation);
        } else if (this.gameState === GAME_STATES.PAUSED) {
            this.gameState = GAME_STATES.PLAYING;
            this.gameLoop();
        }
    }

    changeDifficulty(difficulty) {
        this.difficulty = difficulty;
        document.querySelectorAll('.difficulty-buttons button').forEach(btn => {
            btn.classList.remove('active');
        });
        document.getElementById(`${difficulty}-btn`).classList.add('active');
        this.initializeLevel();
    }

    update() {
        if (this.gameState !== GAME_STATES.PLAYING) return;

        if (this.pacman) {
            this.pacman.move(this.maze, this.speedMultiplier);
        }

        this.ghosts.forEach(ghost => {
            ghost.move(this.maze, this.pacman.getGridPosition(), 'chase', this.speedMultiplier);
        });

        this.powerPellets.forEach(pellet => {
            pellet.update();
        });

        this.checkCollisions();

        if (this.dots.length === 0 && this.powerPellets.length === 0) {
            this.levelComplete();
        }

        document.getElementById('score').textContent = this.score;
        document.getElementById('lives').textContent = this.lives;
        document.getElementById('current-level').textContent = this.level;
    }

    checkCollisions() {
        if (!this.pacman) return;
        
        const pacmanPos = this.pacman.getGridPosition();
        
        for (let i = this.dots.length - 1; i >= 0; i--) {
            const dot = this.dots[i];
            const dotPos = dot.getGridPosition();
            if (pacmanPos.x === dotPos.x && pacmanPos.y === dotPos.y) {
                this.dots.splice(i, 1);
                this.score += POINTS.DOT;
                break;
            }
        }
        
        for (let i = this.powerPellets.length - 1; i >= 0; i--) {
            const pellet = this.powerPellets[i];
            const pelletPos = pellet.getGridPosition();
            if (pacmanPos.x === pelletPos.x && pacmanPos.y === pelletPos.y) {
                this.powerPellets.splice(i, 1);
                this.score += POINTS.POWER_PELLET;
                this.ghostsVulnerable();
                break;
            }
        }
        
        this.ghosts.forEach(ghost => {
            const ghostPos = ghost.getGridPosition();
            if (pacmanPos.x === ghostPos.x && pacmanPos.y === ghostPos.y) {
                if (ghost.isVulnerable) {
                    ghost.isVulnerable = false;
                    this.score += POINTS.GHOST;
                    ghost.inPen = true;
                    ghost.penDwellTime = 150;
                    this.resetGhostPosition(ghost);
                } else if (!ghost.inPen) {
                    this.loseLife();
                }
            }
        });
        
        if (!this.fruit?.visible && Math.random() < 0.0005) {
            const fruitPos = this.getRandomEmptyPosition();
            if (fruitPos && this.fruit) {
                this.fruit.spawn(fruitPos.x * TILE_SIZE, fruitPos.y * TILE_SIZE);
            }
        }
        
        if (this.fruit?.visible) {
            const fruitPos = this.fruit.getGridPosition();
            if (pacmanPos.x === fruitPos.x && pacmanPos.y === fruitPos.y) {
                this.score += POINTS.FRUIT;
                this.fruit.visible = false;
            }
        }
    }

    resetGhostPosition(ghost) {
        for (let y = 0; y < this.maze.length; y++) {
            for (let x = 0; x < this.maze[y].length; x++) {
                if (this.maze[y][x] === CELL_TYPE.GHOST_SPAWN) {
                    ghost.x = x * TILE_SIZE;
                    ghost.y = y * TILE_SIZE;
                    ghost.direction = {...DIRECTIONS.UP};
                    return;
                }
            }
        }
    }

    getRandomEmptyPosition() {
        const emptyPositions = [];
        for (let y = 0; y < this.maze.length; y++) {
            for (let x = 0; x < this.maze[y].length; x++) {
                if (this.maze[y][x] === CELL_TYPE.EMPTY) {
                    emptyPositions.push({x: x, y: y});
                }
            }
        }
        if (emptyPositions.length === 0) return null;
        return emptyPositions[Math.floor(Math.random() * emptyPositions.length)];
    }

    ghostsVulnerable() {
        this.ghosts.forEach(ghost => {
            if (!ghost.inPen) {
                ghost.makeVulnerable(300);
            }
        });
    }

    loseLife() {
        this.lives--;
        if (this.lives <= 0) {
            this.gameOver();
        } else {
            this.resetPositions();
        }
    }

    resetPositions() {
        if (!this.maze || this.maze.length === 0) return;
        let pacmanX = 10;
        let pacmanY = 15;
        const midY = Math.floor(this.maze.length / 2);
        let found = false;
        for (let y = this.maze.length - 2; y >= midY && !found; y--) {
            for (let x = 1; x < this.maze[y].length - 1; x++) {
                if (this.maze[y][x] === CELL_TYPE.EMPTY ||
                    this.maze[y][x] === CELL_TYPE.PACMAN_SPAWN) {
                    pacmanX = x;
                    pacmanY = y;
                    found = true;
                    break;
                }
            }
        }
        if (this.pacman) {
            this.pacman.x = pacmanX * TILE_SIZE;
            this.pacman.y = pacmanY * TILE_SIZE;
            this.pacman.direction = {...DIRECTIONS.NONE};
            this.pacman.nextDirection = {...DIRECTIONS.NONE};
        }
        this.ghosts.forEach((ghost, index) => {
            ghost.inPen = true;
            ghost.penDwellTime = 100 + (index * 60);
            this.resetGhostPosition(ghost);
        });
    }

    gameOver() {
        this.gameState = GAME_STATES.GAME_OVER;
        const highScore = localStorage.getItem('pacmanHighScore') || 0;
        if (this.score > highScore) {
            localStorage.setItem('pacmanHighScore', this.score.toString());
            this.highScore = this.score;
        } else {
            this.highScore = highScore;
        }
        this.drawGameOver();
        if (this.currentAnimation) {
            cancelAnimationFrame(this.currentAnimation);
            this.currentAnimation = null;
        }
    }

    drawGameOver() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = '#FFD700';
        this.ctx.font = '40px Arial Bold';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2 - 50);
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = '25px Arial';
        this.ctx.fillText(`Final Score: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2);
        this.ctx.fillText(`High Score: ${this.highScore}`, this.canvas.width / 2, this.canvas.height / 2 + 30);
        this.ctx.fillText('Press START to play again', this.canvas.width / 2, this.canvas.height / 2 + 70);
    }

    levelComplete() {
        this.gameState = GAME_STATES.LEVEL_COMPLETE;
        this.level++;
        this.drawLevelComplete();
        if (this.currentAnimation) {
            cancelAnimationFrame(this.currentAnimation);
            this.currentAnimation = null;
        }
    }

    drawLevelComplete() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = '#00FF00';
        this.ctx.font = '40px Arial Bold';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('LEVEL COMPLETE!', this.canvas.width / 2, this.canvas.height / 2 - 50);
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = '25px Arial';
        this.ctx.fillText(`Score: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2);
        this.ctx.fillText('Press START for next level', this.canvas.width / 2, this.canvas.height / 2 + 50);
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawMaze();
        this.dots.forEach(dot => dot.draw(this.ctx));
        this.powerPellets.forEach(pellet => pellet.draw(this.ctx));
        if (this.fruit && this.fruit.visible) {
            this.fruit.draw(this.ctx);
        }
        this.ghosts.forEach(ghost => ghost.draw(this.ctx));
        if (this.pacman) {
            this.pacman.draw(this.ctx);
        }
        if (this.gameState === GAME_STATES.MENU) {
            this.drawMenu();
        } else if (this.gameState === GAME_STATES.PAUSED) {
            this.drawPaused();
        } else if (this.gameState === GAME_STATES.GAME_OVER) {
            this.drawGameOver();
        } else if (this.gameState === GAME_STATES.LEVEL_COMPLETE) {
            this.drawLevelComplete();
        }
    }

    drawMaze() {
        if (!this.maze || !this.ctx) return;
        for (let y = 0; y < this.maze.length; y++) {
            for (let x = 0; x < this.maze[y].length; x++) {
                if (this.maze[y][x] === CELL_TYPE.WALL) {
                    this.ctx.fillStyle = this.mazeColor;
                    this.ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                    this.ctx.fillStyle = '#3939C6';
                    this.ctx.fillRect(
                        x * TILE_SIZE + 2, 
                        y * TILE_SIZE + 2, 
                        TILE_SIZE - 4, 
                        TILE_SIZE - 4
                    );
                } else if (this.maze[y][x] === CELL_TYPE.TUNNEL) {
                    this.ctx.fillStyle = 'rgba(50, 50, 200, 0.3)';
                    this.ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                }
            }
        }
    }

    drawMenu() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = '#FFCC00';
        this.ctx.font = '40px Arial Bold';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('PACMAN', this.canvas.width / 2, this.canvas.height / 2 - 80);
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = '25px Arial';
        this.ctx.fillText('Select Difficulty and Press START', this.canvas.width / 2, this.canvas.height / 2);
        this.ctx.font = '18px Arial';
        this.ctx.fillText('Arrow Keys or WASD to move', this.canvas.width / 2, this.canvas.height / 2 + 60);
        this.ctx.fillText('Space or P to pause', this.canvas.width / 2, this.canvas.height / 2 + 90);
    }

    drawPaused() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = '40px Arial Bold';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2);
        this.ctx.font = '25px Arial';
        this.ctx.fillText('Press SPACE to continue', this.canvas.width / 2, this.canvas.height / 2 + 50);
    }

    gameLoop() {
        this.update();
        this.draw();
        if (this.gameState === GAME_STATES.PLAYING) {
            this.currentAnimation = requestAnimationFrame(() => this.gameLoop());
        }
    }

    initializeLevel() {
        console.log('Initializing level for difficulty:', this.difficulty);
        this.gameState = GAME_STATES.MENU;
        if (this.currentAnimation) {
            cancelAnimationFrame(this.currentAnimation);
            this.currentAnimation = null;
        }
        if (LEVELS[this.difficulty]) {
            this.maze = JSON.parse(JSON.stringify(LEVELS[this.difficulty]));
        } else {
            console.error('Invalid difficulty level:', this.difficulty);
            this.maze = JSON.parse(JSON.stringify(LEVELS.beginner));
        }
        this.setupGameObjects();
        this.draw();
    }

    setupGameObjects() {
        console.log('Setting up game objects');
        this.pacman = null;
        this.ghosts = [];
        this.dots = [];
        this.powerPellets = [];
        this.fruit = new Fruit();
        for (let y = 0; y < this.maze.length; y++) {
            for (let x = 0; x < this.maze[y].length; x++) {
                const cellType = this.maze[y][x];
                const posX = x * TILE_SIZE;
                const posY = y * TILE_SIZE;
                switch(cellType) {
                    case CELL_TYPE.EMPTY:
                        this.dots.push(new Dot(posX, posY));
                        break;
                    case CELL_TYPE.PACMAN_SPAWN:
                        this.pacman = new Pacman(posX, posY);
                        console.log('Created Pacman at', x, y, '(', posX, posY, ')');
                        this.dots.push(new Dot(posX, posY));
                        break;
                    case CELL_TYPE.GHOST_SPAWN:
                        if (this.ghosts.length < 4) {
                            const ghostColors = [
                                GHOST_COLORS.BLINKY,
                                GHOST_COLORS.PINKY,
                                GHOST_COLORS.INKY,
                                GHOST_COLORS.CLYDE
                            ];
                            this.ghosts.push(new Ghost(posX, posY, ghostColors[this.ghosts.length]));
                            console.log('Created Ghost at', x, y);
                        }
                        break;
                    case CELL_TYPE.POWER_PELLET:
                        this.powerPellets.push(new PowerPellet(posX, posY));
                        break;
                }
            }
        }
        if (!this.pacman) {
            const defaultX = Math.floor(this.maze[0].length / 2);
            const defaultY = this.maze.length - 2;
            this.pacman = new Pacman(defaultX * TILE_SIZE, defaultY * TILE_SIZE);
            console.log('Created default Pacman at', defaultX, defaultY);
        }
        if (this.difficulty === 'beginner') {
            this.speedMultiplier = 0.8;
            this.ghosts = this.ghosts.slice(0, 2);
        } else if (this.difficulty === 'intermediate') {
            this.speedMultiplier = 1.0;
            this.ghosts = this.ghosts.slice(0, 3);
        } else {
            this.speedMultiplier = 1.2;
        }
    }
}
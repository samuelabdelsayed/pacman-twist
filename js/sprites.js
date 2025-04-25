const TURN_THRESHOLD = 30;

// --- Dot ---
class Dot {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = 6;
    }
    getGridPosition() {
        return {
            x: Math.floor((this.x + this.size / 2) / TILE_SIZE),
            y: Math.floor((this.y + this.size / 2) / TILE_SIZE)
        };
    }
    draw(ctx) {
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.arc(this.x + TILE_SIZE/2, this.y + TILE_SIZE/2, this.size/2, 0, Math.PI*2);
        ctx.fill();
    }
}

// --- PowerPellet ---
class PowerPellet extends Dot {
    constructor(x, y) {
        super(x, y);
        this.size = 14;
        this.pulse = 0;
    }
    update() {
        this.pulse += 0.1;
    }
    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = 0.7 + 0.3 * Math.sin(this.pulse);
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(this.x + TILE_SIZE/2, this.y + TILE_SIZE/2, this.size/2, 0, Math.PI*2);
        ctx.fill();
        ctx.restore();
    }
}

// --- Fruit ---
class Fruit {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.visible = false;
    }
    spawn(x, y) {
        this.x = x;
        this.y = y;
        this.visible = true;
    }
    getGridPosition() {
        return {
            x: Math.floor((this.x + TILE_SIZE / 2) / TILE_SIZE),
            y: Math.floor((this.y + TILE_SIZE / 2) / TILE_SIZE)
        };
    }
    draw(ctx) {
        if (!this.visible) return;
        ctx.fillStyle = '#F00';
        ctx.beginPath();
        ctx.arc(this.x + TILE_SIZE/2, this.y + TILE_SIZE/2, 10, 0, Math.PI*2);
        ctx.fill();
    }
}

// --- Pacman ---
class Pacman {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = TILE_SIZE;
        this.color = '#FFFF00';
        this.speed = 3;
        this.direction = {...DIRECTIONS.NONE};
        this.nextDirection = {...DIRECTIONS.NONE};
        this.mouthOpen = 0;
        this.mouthDir = 1;
        this.angle = 0;
    }

    getGridPosition() {
        return {
            x: Math.floor((this.x + this.size / 2) / TILE_SIZE),
            y: Math.floor((this.y + this.size / 2) / TILE_SIZE)
        };
    }

    handleTunnelWrap(maze) {
        const mazeWidth = maze[0].length * TILE_SIZE;
        const mazeHeight = maze.length * TILE_SIZE;
        if (this.x < -this.size) {
            this.x = mazeWidth - this.size;
        } else if (this.x >= mazeWidth) {
            this.x = -this.size + 1;
        }
        if (this.y < -this.size) {
            this.y = mazeHeight - this.size;
        } else if (this.y >= mazeHeight) {
            this.y = -this.size + 1;
        }
    }

    canMove(nextPos, maze) {
        const margin = 4;
        const positions = [
            {x: nextPos.x + margin, y: nextPos.y + margin},
            {x: nextPos.x + this.size - margin, y: nextPos.y + margin},
            {x: nextPos.x + margin, y: nextPos.y + this.size - margin},
            {x: nextPos.x + this.size - margin, y: nextPos.y + this.size - margin}
        ];
        return !positions.some(pos => {
            const gridX = Math.floor(pos.x / TILE_SIZE);
            const gridY = Math.floor(pos.y / TILE_SIZE);
            if (gridY < 0 || gridY >= maze.length || gridX < 0 || gridX >= maze[0].length) {
                return false;
            }
            return maze[gridY]?.[gridX] === CELL_TYPE.WALL;
        });
    }

    move(maze, speedMultiplier = 1) {
        if (this.nextDirection.dx !== 0 || this.nextDirection.dy !== 0) {
            const centerX = Math.floor((this.x + this.size / 2) / TILE_SIZE) * TILE_SIZE + TILE_SIZE / 2 - this.size / 2;
            const centerY = Math.floor((this.y + this.size / 2) / TILE_SIZE) * TILE_SIZE + TILE_SIZE / 2 - this.size / 2;
            const distToCenter = Math.abs(this.x - centerX) + Math.abs(this.y - centerY);

            const nextPos = {
                x: this.x + this.nextDirection.dx * this.speed,
                y: this.y + this.nextDirection.dy * this.speed
            };

            if (this.canMove(nextPos, maze) && distToCenter <= TURN_THRESHOLD) {
                this.x = centerX;
                this.y = centerY;
                this.direction = {...this.nextDirection};
                this.nextDirection = {...DIRECTIONS.NONE};
            }
        }

        if (this.direction.dx !== 0 || this.direction.dy !== 0) {
            const nextPos = {
                x: this.x + this.direction.dx * this.speed,
                y: this.y + this.direction.dy * this.speed
            };
            if (this.canMove(nextPos, maze)) {
                const effectiveSpeed = this.speed * speedMultiplier;
                this.x += this.direction.dx * effectiveSpeed;
                this.y += this.direction.dy * effectiveSpeed;
                this.handleTunnelWrap(maze);
            }
        }

        this.mouthOpen += this.mouthDir * 0.15;
        if (this.mouthOpen >= 0.7 || this.mouthOpen <= 0) {
            this.mouthDir *= -1;
        }
    }

    draw(ctx) {
        const centerX = this.x + this.size / 2;
        const centerY = this.y + this.size / 2;
        const radius = this.size / 2;
        if (this.direction.dx === 1) this.angle = 0;
        else if (this.direction.dx === -1) this.angle = Math.PI;
        else if (this.direction.dy === -1) this.angle = 1.5 * Math.PI;
        else if (this.direction.dy === 1) this.angle = 0.5 * Math.PI;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, 
                this.angle + this.mouthOpen * Math.PI, 
                this.angle + (2 - this.mouthOpen) * Math.PI);
        ctx.lineTo(centerX, centerY);
        ctx.fill();
    }
}

// --- Ghost ---
class Ghost {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.size = TILE_SIZE;
        this.color = color;
        this.speed = 2.5;
        this.direction = {...DIRECTIONS.RIGHT};
        this.isVulnerable = false;
        this.vulnerableColor = '#0000FF';
        this.vulnerableTime = 0;
        this.state = GHOST_STATES.SCATTER;
        this.stateTime = 0;
        this.penDwellTime = Math.random() * 50 + 50;
        this.inPen = true;
    }

    getGridPosition() {
        return {
            x: Math.floor((this.x + this.size / 2) / TILE_SIZE),
            y: Math.floor((this.y + this.size / 2) / TILE_SIZE)
        };
    }

    makeVulnerable(time) {
        this.isVulnerable = true;
        this.vulnerableTime = time;
        this.state = GHOST_STATES.FRIGHTENED;
    }

    move(maze, targetPos, mode, speedMultiplier = 1) {
        if (this.vulnerableTime > 0) {
            this.vulnerableTime--;
            if (this.vulnerableTime <= 0) {
                this.isVulnerable = false;
                this.state = GHOST_STATES.CHASE;
            }
        }
        if (this.inPen) {
            this.penDwellTime--;
            if (this.penDwellTime <= 0) {
                this.inPen = false;
                this.exitPen(maze);
            }
            return;
        }
        const effectiveSpeed = this.speed * (this.isVulnerable ? 0.6 : 1) * speedMultiplier;
        const nextPos = {
            x: this.x + this.direction.dx * effectiveSpeed,
            y: this.y + this.direction.dy * effectiveSpeed
        };
        if (this.canMove(nextPos, maze)) {
            this.x = nextPos.x;
            this.y = nextPos.y;
            this.handleTunnelWrap(maze);
        } else {
            this.chooseNewDirection(maze, targetPos);
        }
        if (Math.random() < 0.05 && !this.isVulnerable) {
            this.chooseNewDirection(maze, targetPos);
        }
    }

    handleTunnelWrap(maze) {
        const mazeWidth = maze[0].length * TILE_SIZE;
        const mazeHeight = maze.length * TILE_SIZE;
        if (this.x < -this.size) {
            this.x = mazeWidth - this.size;
        } else if (this.x >= mazeWidth) {
            this.x = -this.size + 1;
        }
        if (this.y < -this.size) {
            this.y = mazeHeight - this.size;
        } else if (this.y >= mazeHeight) {
            this.y = -this.size + 1;
        }
    }

    canMove(nextPos, maze) {
        const margin = 4;
        const positions = [
            {x: nextPos.x + margin, y: nextPos.y + margin},
            {x: nextPos.x + this.size - margin, y: nextPos.y + margin},
            {x: nextPos.x + margin, y: nextPos.y + this.size - margin},
            {x: nextPos.x + this.size - margin, y: nextPos.y + this.size - margin}
        ];
        return !positions.some(pos => {
            const gridX = Math.floor(pos.x / TILE_SIZE);
            const gridY = Math.floor(pos.y / TILE_SIZE);
            if (gridY < 0 || gridY >= maze.length || gridX < 0 || gridX >= maze[0].length) {
                return false;
            }
            return maze[gridY]?.[gridX] === CELL_TYPE.WALL;
        });
    }

    exitPen(maze) {
        this.direction = {...DIRECTIONS.UP};
        for (let y = 0; y < maze.length; y++) {
            for (let x = 0; x < maze[y].length; x++) {
                if (maze[y][x] === CELL_TYPE.GHOST_SPAWN && maze[y-1][x] !== CELL_TYPE.WALL) {
                    this.x = x * TILE_SIZE;
                    this.y = (y-1) * TILE_SIZE;
                    return;
                }
            }
        }
    }

    chooseNewDirection(maze, targetPos) {
        const possibleDirs = [];
        const currentPos = this.getGridPosition();
        for (const dir of Object.values(DIRECTIONS)) {
            if (dir === DIRECTIONS.NONE) continue;
            const nextPos = {
                x: this.x + dir.dx * this.speed,
                y: this.y + dir.dy * this.speed
            };
            if (this.canMove(nextPos, maze)) {
                if (!this.isVulnerable && 
                    this.direction.dx === -dir.dx && 
                    this.direction.dy === -dir.dy) {
                    continue;
                }
                possibleDirs.push({
                    dir: dir,
                    distance: this.getDistanceToTarget(
                        currentPos.x + dir.dx, 
                        currentPos.y + dir.dy, 
                        targetPos
                    )
                });
            }
        }
        if (possibleDirs.length > 0) {
            possibleDirs.sort((a, b) => {
                if (this.isVulnerable) {
                    return b.distance - a.distance;
                } else {
                    return a.distance - b.distance;
                }
            });
            const randomIndex = Math.floor(Math.random() * Math.min(2, possibleDirs.length));
            this.direction = {...possibleDirs[randomIndex].dir};
        }
    }
    
    getDistanceToTarget(x, y, targetPos) {
        return Math.sqrt(
            Math.pow(x - targetPos.x, 2) + 
            Math.pow(y - targetPos.y, 2)
        );
    }

    draw(ctx) {
        const centerX = this.x + this.size / 2;
        const centerY = this.y + this.size / 2;
        ctx.fillStyle = this.isVulnerable ? this.vulnerableColor : this.color;
        ctx.beginPath();
        ctx.arc(centerX, centerY - 5, this.size / 2.5, Math.PI, 0, false);
        ctx.lineTo(centerX + this.size / 2.5, centerY + 5);
        const waveHeight = 4;
        for (let i = 0; i < 3; i++) {
            ctx.quadraticCurveTo(
                centerX + (this.size / 2.5) - (this.size / 2.5 / 3) * (i + 0.5),
                centerY + 5 + (i % 2 ? waveHeight : -waveHeight),
                centerX + (this.size / 2.5) - (this.size / 2.5 / 3) * (i + 1),
                centerY + 5
            );
        }
        ctx.lineTo(centerX - this.size / 2.5, centerY - 5);
        ctx.fill();
        if (!this.isVulnerable) {
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc(centerX - 5, centerY - 5, 4, 0, Math.PI * 2);
            ctx.arc(centerX + 5, centerY - 5, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = 'black';
            ctx.beginPath();
            ctx.arc(centerX - 5 + this.direction.dx * 2, 
                   centerY - 5 + this.direction.dy * 2, 2, 0, Math.PI * 2);
            ctx.arc(centerX + 5 + this.direction.dx * 2,
                   centerY - 5 + this.direction.dy * 2, 2, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc(centerX - 5, centerY - 5, 3, 0, Math.PI * 2);
            ctx.arc(centerX + 5, centerY - 5, 3, 0, Math.PI * 2);
            ctx.fill();
            if (this.vulnerableTime < 60 && Math.floor(this.vulnerableTime / 10) % 2 === 0) {
                ctx.fillStyle = '#FFFFFF';
                ctx.beginPath();
                ctx.arc(centerX, centerY, this.size / 2.5, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }
}

// --- Grim Reaper (Hard mode only) ---
class GrimReaper {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = TILE_SIZE;
         this.color = '#555555'; // Slightly darker grey for visibility
        this.speed = 2.7;
        this.direction = {...DIRECTIONS.RIGHT};
        this.inPen = true;
        this.penDwellTime = Math.random() * 50 + 50;
    }

    getGridPosition() {
        return {
            x: Math.floor((this.x + this.size / 2) / TILE_SIZE),
            y: Math.floor((this.y + this.size / 2) / TILE_SIZE)
        };
    }

    move(maze, targetPos, speedMultiplier = 1) {
        if (this.inPen) {
            this.penDwellTime--;
            if (this.penDwellTime <= 0) {
                this.inPen = false;
                this.exitPen(maze);
            }
            return;
        }
        const effectiveSpeed = this.speed * speedMultiplier;
        const nextPos = {
            x: this.x + this.direction.dx * effectiveSpeed,
            y: this.y + this.direction.dy * effectiveSpeed
        };
        if (this.canMove(nextPos, maze)) {
            this.x = nextPos.x;
            this.y = nextPos.y;
            this.handleTunnelWrap(maze);
        } else {
            this.chooseNewDirection(maze, targetPos);
        }
        if (Math.random() < 0.05) {
            this.chooseNewDirection(maze, targetPos);
        }
    }

    handleTunnelWrap(maze) {
        const mazeWidth = maze[0].length * TILE_SIZE;
        const mazeHeight = maze.length * TILE_SIZE;
        if (this.x < -this.size) {
            this.x = mazeWidth - this.size;
        } else if (this.x >= mazeWidth) {
            this.x = -this.size + 1;
        }
        if (this.y < -this.size) {
            this.y = mazeHeight - this.size;
        } else if (this.y >= mazeHeight) {
            this.y = -this.size + 1;
        }
    }

    canMove(nextPos, maze) {
        const margin = 4;
        const positions = [
            {x: nextPos.x + margin, y: nextPos.y + margin},
            {x: nextPos.x + this.size - margin, y: nextPos.y + margin},
            {x: nextPos.x + margin, y: nextPos.y + this.size - margin},
            {x: nextPos.x + this.size - margin, y: nextPos.y + this.size - margin}
        ];
        return !positions.some(pos => {
            const gridX = Math.floor(pos.x / TILE_SIZE);
            const gridY = Math.floor(pos.y / TILE_SIZE);
            if (gridY < 0 || gridY >= maze.length || gridX < 0 || gridX >= maze[0].length) {
                return false;
            }
            return maze[gridY]?.[gridX] === CELL_TYPE.WALL;
        });
    }

    exitPen(maze) {
        this.direction = {...DIRECTIONS.UP};
        for (let y = 0; y < maze.length; y++) {
            for (let x = 0; x < maze[y].length; x++) {
                if (maze[y][x] === CELL_TYPE.GHOST_SPAWN && maze[y-1][x] !== CELL_TYPE.WALL) {
                    this.x = x * TILE_SIZE;
                    this.y = (y-1) * TILE_SIZE;
                    return;
                }
            }
        }
    }

    chooseNewDirection(maze, targetPos) {
        const possibleDirs = [];
        const currentPos = this.getGridPosition();
        for (const dir of Object.values(DIRECTIONS)) {
            if (dir === DIRECTIONS.NONE) continue;
            const nextPos = {
                x: this.x + dir.dx * this.speed,
                y: this.y + dir.dy * this.speed
            };
            if (this.canMove(nextPos, maze)) {
                if (this.direction.dx === -dir.dx && this.direction.dy === -dir.dy) {
                    continue;
                }
                possibleDirs.push({
                    dir: dir,
                    distance: this.getDistanceToTarget(
                        currentPos.x + dir.dx, 
                        currentPos.y + dir.dy, 
                        targetPos
                    )
                });
            }
        }
        if (possibleDirs.length > 0) {
            possibleDirs.sort((a, b) => a.distance - b.distance);
            const randomIndex = Math.floor(Math.random() * Math.min(2, possibleDirs.length));
            this.direction = {...possibleDirs[randomIndex].dir};
        }
    }

    getDistanceToTarget(x, y, targetPos) {
        return Math.sqrt(
            Math.pow(x - targetPos.x, 2) + 
            Math.pow(y - targetPos.y, 2)
        );
    }

    draw(ctx) {
        const centerX = this.x + this.size / 2;
        const centerY = this.y + this.size / 2;
        ctx.save();
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(centerX, centerY, this.size / 2.2, Math.PI, 0, false);
        ctx.lineTo(centerX + this.size / 2.2, centerY + this.size / 2.2);
        ctx.lineTo(centerX - this.size / 2.2, centerY + this.size / 2.2);
        ctx.closePath();
        ctx.fill();
        // Face
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(centerX, centerY - 2, 6, 0, Math.PI * 2);
        ctx.fill();
        // Eyes
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(centerX - 2, centerY - 2, 1.5, 0, Math.PI * 2);
        ctx.arc(centerX + 2, centerY - 2, 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}
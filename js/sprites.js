class Pacman {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.direction = DIRECTIONS.RIGHT;
        this.nextDirection = null;
        this.speed = SPEEDS.beginner.pacman;
        this.mouthOpen = 0;
        this.mouthDir = 1;
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.fillStyle = COLORS.pacman;
        
        // Calculate mouth animation
        this.mouthOpen += 0.2 * this.mouthDir;
        if (this.mouthOpen >= 0.5 || this.mouthOpen <= 0) this.mouthDir *= -1;

        // Draw Pacman with animated mouth
        ctx.arc(
            this.x + PACMAN_SIZE/2, 
            this.y + PACMAN_SIZE/2, 
            PACMAN_SIZE/2, 
            this.mouthOpen * Math.PI, 
            (2 - this.mouthOpen) * Math.PI
        );
        ctx.lineTo(this.x + PACMAN_SIZE/2, this.y + PACMAN_SIZE/2);
        ctx.fill();
        ctx.closePath();
    }

    update() {
        // Update position based on direction
        this.x += this.direction.x * this.speed;
        this.y += this.direction.y * this.speed;

        // Keep Pacman within bounds
        this.x = Math.max(0, Math.min(this.x, CANVAS_WIDTH - PACMAN_SIZE));
        this.y = Math.max(0, Math.min(this.y, CANVAS_HEIGHT - PACMAN_SIZE));
    }

    setDirection(dir) {
        this.direction = dir;
    }
}

class Ghost {
    constructor(x, y, type, speed) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.speed = speed;
        this.direction = DIRECTIONS.RIGHT;
        this.frightened = false;
        this.color = COLORS[type];
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.fillStyle = this.frightened ? COLORS.frightenedGhost : this.color;
        
        // Draw ghost body
        ctx.arc(
            this.x + GHOST_SIZE/2,
            this.y + GHOST_SIZE/2,
            GHOST_SIZE/2,
            Math.PI,
            0
        );
        
        // Draw ghost skirt
        ctx.rect(
            this.x,
            this.y + GHOST_SIZE/2,
            GHOST_SIZE,
            GHOST_SIZE/2
        );
        ctx.fill();
        ctx.closePath();

        // Draw eyes
        this.drawEyes(ctx);
    }

    drawEyes(ctx) {
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(this.x + 6, this.y + 8, 3, 0, Math.PI * 2);
        ctx.arc(this.x + 12, this.y + 8, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();

        ctx.fillStyle = 'blue';
        ctx.beginPath();
        ctx.arc(this.x + 6, this.y + 8, 1.5, 0, Math.PI * 2);
        ctx.arc(this.x + 12, this.y + 8, 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
    }

    update() {
        // Basic ghost movement
        this.x += this.direction.x * this.speed;
        this.y += this.direction.y * this.speed;

        // Keep ghost within bounds
        this.x = Math.max(0, Math.min(this.x, CANVAS_WIDTH - GHOST_SIZE));
        this.y = Math.max(0, Math.min(this.y, CANVAS_HEIGHT - GHOST_SIZE));

        // Random direction changes
        if (Math.random() < 0.02) {
            const directions = Object.values(DIRECTIONS);
            this.direction = directions[Math.floor(Math.random() * directions.length)];
        }
    }
}

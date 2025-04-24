// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const game = new Game(canvas);

    // Set up difficulty buttons
    const difficultyButtons = {
        beginner: document.getElementById('beginner-btn'),
        intermediate: document.getElementById('intermediate-btn'),
        advanced: document.getElementById('advanced-btn')
    };

    // Difficulty selection
    Object.entries(difficultyButtons).forEach(([difficulty, button]) => {
        button.addEventListener('click', () => {
            // Update active button
            Object.values(difficultyButtons).forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Update game difficulty
            game.setDifficulty(difficulty);
        });
    });

    // Start button
    const startButton = document.getElementById('start-btn');
    startButton.addEventListener('click', () => {
        game.start();
    });

    // Pause button
    const pauseButton = document.getElementById('pause-btn');
    pauseButton.addEventListener('click', () => {
        game.togglePause();
    });
});

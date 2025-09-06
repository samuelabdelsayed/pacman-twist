document.addEventListener('DOMContentLoaded', function() {
    const game = new Game('game-canvas');
    window.game = game;

    // Music controls
    const music = document.getElementById('bg-music');
    document.getElementById('start-btn').addEventListener('click', () => {
        game.start();
        if (music.paused) {
            music.currentTime = 0;
            music.volume = 0.5;
            music.play();
        }
    });
    document.getElementById('pause-btn').addEventListener('click', () => {
        if (game.gameState === GAME_STATES.PLAYING) {
            game.togglePause();
            music.pause();
        } else if (game.gameState === GAME_STATES.PAUSED) {
            game.togglePause();
            if (music.paused) music.play();
        }
    });

    // Pause music when game is over or level complete
    const originalGameOver = game.gameOver.bind(game);
    game.gameOver = function() {
        music.pause();
        originalGameOver();
    };
    const originalLevelComplete = game.levelComplete.bind(game);
    game.levelComplete = function() {
        music.pause();
        originalLevelComplete();
    };

    // Listen for spacebar and 'p' to pause/unpause (fix: only on first press, not repeats)
    window.addEventListener('keydown', (e) => {
        if ((e.code === 'Space' || e.key === 'p' || e.key === 'P') && !e.repeat) {
            e.preventDefault();
            if (game.gameState === GAME_STATES.PLAYING) {
                game.togglePause();
                music.pause();
            } else if (game.gameState === GAME_STATES.PAUSED) {
                game.togglePause();
                if (music.paused) music.play();
            }
        }
    });
});
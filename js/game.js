class Game {
    constructor() {
        // Access configuration from GameConfig object
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.ctx.imageSmoothingEnabled = true; // Disable antialiasing

        // Configuration Variables from config.js
        this.colors = GameConfig.colors;
        this.colorsAsHex = GameConfig.colorsAsHex;
        this.controlsList = GameConfig.controlsList;
        this.initialSnakeSpeed = GameConfig.initialSnakeSpeed;
        this.snakeSpeedIncrement = GameConfig.snakeSpeedIncrement;
        this.steeringSpeed = GameConfig.steeringSpeed;
        this.lineWidth = GameConfig.lineWidth;
        this.backgroundImage = GameConfig.backgroundImage;
        this.melodyVolume = GameConfig.melodyVolume;
        this.musicFile = GameConfig.musicFile;
        this.initialMusicPlaybackRate = GameConfig.initialMusicPlaybackRate;
        this.boostSpeed = GameConfig.boostSpeed;
        this.displayApples = GameConfig.displayApples;
        this.displayGoldenApples = GameConfig.displayGoldenApples;
        this.appleDisplayFrequencyInSeconds = GameConfig.appleDisplayFrequencyInSeconds;        
        this.appleRadius = GameConfig.appleRadius;
        this.specialAppleProbability = GameConfig.specialAppleProbability;
        this.disableCollisionPointGain = GameConfig.disableCollisionPointGain;

        // Game State Variables        
        this.appleTimer = null;
        this.roundTimeout = null;
        this.players = [];
        this.snakes = [];
        this.aliveSnakes = [];
        this.numPlayers = 2;
        this.numRounds = 5;
        this.currentRound = 0;
        this.scores = [];
        this.gameTickInterval = null;        
        this.audioCtx = null;
        this.keysPressed = {};
        this.gameFrozen = false;

        // New variable to track game speed
        this.gameSpeed = 0;

        // Audio element for music playback
        this.musicAudio = null;

        // Audio element for bite sound
        this.biteAudio = null;

        // Background color as RGBA
        this.backgroundColor = { r: 0, g: 0, b: 0, a: 0 }; // Solid black

        // Event Listeners
        this.init();
    }

    init() {
        // Set background image if specified
        if (this.backgroundImage) {
            document.body.style.backgroundImage = `url('${this.backgroundImage}')`;
        }

        document.getElementById("scoreboard").style.display = "none";

        document.getElementById('start-button').addEventListener('click', () => {
            this.startGame();
        });

        // Start game on Enter key press
        window.addEventListener('keydown', (e) => {
            // Check for both Enter and NumpadEnter
            if ((e.code === 'Enter' || e.code === 'NumpadEnter') && document.getElementById('start-screen').style.display !== 'none') {
                this.startGame();
            } else if ((e.code === 'Enter' || e.code === 'NumpadEnter') && document.getElementById('winning-screen').style.display !== 'none') {
                this.resetGame();
            }
            
            // Escape key handling
            if (e.code === 'Escape' && document.getElementById('winning-screen').style.display !== 'none') {
                this.resetGame();
            } else if (e.code === 'Escape' && document.getElementById('start-screen').style.display === 'none') {
                this.endGame();
            }
            
            // Log the key as pressed
            this.keysPressed[e.code] = true;
        });
        
        window.addEventListener('keyup', (e) => {
            this.keysPressed[e.code] = false;
        });

        // Update controls table when number of players changes
        document.getElementById('num-players').addEventListener('change', () => {
            this.updateControlsTable();
        });

        document.getElementById('restart-button').addEventListener('click', () => {
            this.resetGame();
        });

        const showHideAppleSettings = ()=>{
            if(document.getElementById('display-apples').checked){
                [...document.getElementsByClassName('apple-settings-wrapper')].forEach(e=>e.style.display = "");
            }
            else{
                [...document.getElementsByClassName('apple-settings-wrapper')].forEach(e=>e.style.display = "none");
            }
        };

        document.getElementById('display-apples').addEventListener('change', showHideAppleSettings);
        showHideAppleSettings();

        this.updateControlsTable();
    }

    resetGame() {
        this.postGameCleanup();

        // Hide the winning screen
        document.getElementById('winning-screen').style.display = 'none';
        
        // Reset scores and rounds
        this.currentRound = 0;
        this.scores = new Array(this.numPlayers).fill(0);
        
        // Update scoreboard
        this.updateScoreboard();
        
        // Show the start screen
        document.getElementById('start-screen').style.display = 'block';
    }

    updateControlsTable() {
        const numPlayers = parseInt(document.getElementById('num-players').value);
        const controlsTableDiv = document.getElementById('controls-table');
        let tableHTML = `<table id=""><tr><th>Hráč</th><th>Doleva</th><th>Doprava</th></tr>`;
        for (let i = 0; i < numPlayers; i++) {
            const controls = this.controlsList[i % this.controlsList.length];
            tableHTML += `<tr style='color:${this.colors[i]}'><td>Hráč ${i + 1}</td><td>${this.getKeyName(controls.left)}</td><td>${this.getKeyName(controls.right)}</td></tr>`;
        }
        tableHTML += '</table>';
        controlsTableDiv.innerHTML = tableHTML;
    }

    getKeyName(code) {
        const keyMap = {
            'ArrowLeft': 'Šipka doleva',
            'ArrowRight': 'Šipka doprava',
            'ArrowUp': 'Šipka nahoru',
            'ArrowDown': 'Šipka dolů',
            'Space': 'Mezerník'
            // Add more key code mappings as needed
        };
        if (code in keyMap) {
            return keyMap[code];
        } else if (code.startsWith('Key')) {
            return code.replace('Key', '');
        } else {
            return code;
        }
    }

    startGame() {
        this.numPlayers = parseInt(document.getElementById('num-players').value);
        this.numRounds = parseInt(document.getElementById('num-rounds').value);
        this.displayApples = document.getElementById("display-apples").checked;
        this.displayGoldenApples = document.getElementById("display-golden-apples").checked;
        this.disableCollisionPointGain = document.getElementById("points-for-apples-only").checked;
        this.appleDisplayFrequencyInSeconds = parseInt(document.getElementById("num-apple-frequency").value);
        this.specialAppleProbability = parseInt(document.getElementById("num-golden-apple-probability").value) / 100;
        
        this.currentRound = 0;
        this.scores = new Array(this.numPlayers).fill(0);
        document.getElementById('start-screen').style.display = 'none';
        document.getElementById("scoreboard").style.display = "";
        this.updateControlsTable(); // Update the controls table to match the actual number of players
        this.startRound();
        console.log(this)
    }

    startRound() {
        this.postGameCleanup();

        // Clear the canvas and fill it with the background color
        document.getElementById("gameCanvas").classList.remove("animated-background");
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        console.log('Canvas cleared.');

        this.ctx.fillStyle = `rgba(${this.backgroundColor.r}, ${this.backgroundColor.g}, ${this.backgroundColor.b}, ${this.backgroundColor.a / 255})`;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        console.log('Canvas background filled with color:', this.ctx.fillStyle);

        this.snakes = [];
        this.aliveSnakes = [];   
        
        this.apples = []; // Reset apples for the new round        
        this.eatenApples = [];
        this.startAppleTimer(); // Start apple generation timer

        // Initialize players and snakes
        let positioningMap = null;
        while(!positioningMap){
            positioningMap = positioningHelpers.positionPointsOnCircle(this.canvas.width, this.canvas.height, 35, 17, this.numPlayers, .2)
        }
        
        for (let i = 0; i < this.numPlayers; i++) {
            let color = this.colors[i % this.colors.length];
            let colorAsHex = this.colorsAsHex[i % this.colors.length];
            let control = this.controlsList[i % this.controlsList.length];
            let player = new Player(i, color, colorAsHex, control);
            this.players[i] = player;
            let snake = new Snake(
                this,
                player,
                positioningMap.get(i),
                this.canvas.width,
                this.canvas.height,
                this.initialSnakeSpeed,
                this.snakeSpeedIncrement,
                this.steeringSpeed,
                this.lineWidth
            );
            this.snakes[i] = snake;
            this.aliveSnakes.push(snake);
        }
        this.gameFrozen = false;
        this.updateScoreboard();
        this.gameTickInterval = setInterval(() => this.gameTick(), 1000 / 60);
        this.playMusic();
    }

    gameTick() {
        if(this.gameFrozen){
            return;
        }

        // Draw apples
        for (let apple of this.eatenApples) {
            apple.remove(this.ctx);            
        }
        this.eatenApples = [];

        for (let apple of this.apples) {
            apple.draw(this.ctx);            
        }       

        for (let snake of this.snakes) {
            if (snake.alive) {
                // Update snake position
                snake.update(this.keysPressed);                

                this.checkAppleCollision(snake);

                // Check for collision after updating position
                if (snake.checkCollision()) {
                    this.updateScores(snake);
                } else {
                    // Draw the snake
                    snake.draw(this.ctx);
                }
            }
        }

        if (this.aliveSnakes.length <= 1) {
            this.endRound();
        }

        // Update game speed and music playback rate
        this.updateGameSpeedDisplay();
        this.updateMusicPlaybackRate();
    }

    updateGameSpeed(){
        // Calculate average speed of alive snakes
        let totalSpeed = 0;
        for (let snake of this.aliveSnakes) {
            totalSpeed += snake.speed;
        }

        this.gameSpeed = (totalSpeed / this.aliveSnakes.length) || 0;
    }

    updateGameSpeedDisplay() {        
        this.updateGameSpeed();
        const gameSpeedDisplay = (this.gameSpeed / this.initialSnakeSpeed) * 100
        // Display the game speed with two decimal places
        const gameSpeedDiv = document.getElementById('game-speed');
        gameSpeedDiv.textContent = `Rychlost: ${gameSpeedDisplay.toFixed(0)} %`;
    }

    checkAppleCollision(snake) {        
        this.apples.forEach(apple => {
            if (collisionHelper.isPointInsideCircle(snake.x, snake.y, apple.x, apple.y, apple.radius + 3)) {                
                console.log(`Snake ${snake.player.id} collected an apple at (${apple.x}, ${apple.y})`);                
                apple.collect(this);
                this.scores[snake.player.id] += apple.pointValue; // Increment snake's score
                this.updateScoreboard(); // Update scoreboard
            }
        });

        this.eatenApples = [...this.eatenApples, ...this.apples.filter(a => a.isEaten)];
        this.apples = this.apples.filter(a => !a.isEaten);
    }    

    generateApple() {
        if (!this.displayApples) return;

        const maxAttempts = 100; // Prevent infinite loops
        let attempts = 0;
        let validPosition = false;
        let x, y;

        while (!validPosition && attempts < maxAttempts) {
            // Generate random coordinates within the canvas bounds, considering apple radius
            x = this.appleRadius + Math.random() * (this.canvas.width - 2 * this.appleRadius);
            y = this.appleRadius + Math.random() * (this.canvas.height - 2 * this.appleRadius);

            // Check collision with existing apples
            let collisionWithApples = this.apples.some(apple => {
                const dx = x - apple.x;
                const dy = y - apple.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                return distance < (this.appleRadius * 2);
            });

            // Check collision with snakes
            let collisionWithSnakes = this.snakes.some(snake => {
                return snake.segments.some(segment => {
                    return collisionHelper.isPointInsideCircle(x, y, segment.x1, segment.y1, this.appleRadius + this.lineWidth) ||
                           collisionHelper.isPointInsideCircle(x, y, segment.x2, segment.y2, this.appleRadius + this.lineWidth);
                });
            });

            if (!collisionWithApples && !collisionWithSnakes) {
                validPosition = true;
            }

            attempts++;
        }

        if (validPosition) {
            const newApple = new Apple(x, y, this.appleRadius, this.displayGoldenApples ? this.specialAppleProbability : 0);
            this.apples.push(newApple);
            //console.log(`Apple added at (${x}, ${y})`);
        } else {
            console.warn('Failed to place a new apple after maximum attempts.');
        }
    }

    startAppleTimer() {
        if (!this.displayApples) return;

        this.appleTimer = setInterval(() => {
            this.generateApple();
        }, this.appleDisplayFrequencyInSeconds * 1000); // Convert seconds to milliseconds
    }

    /**
     * Stops the apple generation timer.
     */
    stopAppleTimer() {
        if (this.appleTimer) {
            clearInterval(this.appleTimer);
            this.appleTimer = null;
        }
    }

    getMusicPlaybackStep = ()=>(this.gameSpeed - this.initialSnakeSpeed) * 0.2;    

    updateMusicPlaybackRate() {
        if (this.musicAudio && !this.musicAudio.paused) {
            // Map the game speed to a playback rate
            let playbackRate = this.initialMusicPlaybackRate + this.getMusicPlaybackStep();
            // Ensure playbackRate stays within reasonable bounds
            playbackRate = Math.min(Math.max(playbackRate, 0.5), 3);
            this.musicAudio.playbackRate = playbackRate;

            // Update the music speed display
            const musicSpeedDiv = document.getElementById('music-speed');
            musicSpeedDiv.textContent = `Rychlost hudby: ${playbackRate.toFixed(2)}x`;
        }
    }

    updateScores(deadSnake) {
        deadSnake.alive = false;
        this.aliveSnakes.splice(this.aliveSnakes.indexOf(deadSnake), 1);

        if(!this.disableCollisionPointGain){
            this.aliveSnakes
                .map(snake=>snake.player.id)
                .forEach(id=>this.scores[id]++);
        }

        this.updateScoreboard();

        // Play deep note on collision
        this.playCollisionSound();

        // Blink background with snake's color
        this.blinkBackground(deadSnake.player.color);
    }

    playCollisionSound() {
        if (!this.audioCtx) {
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        let ctx = this.audioCtx;
        let o = ctx.createOscillator();
        let g = ctx.createGain();
        o.type = 'sine';
        o.frequency.setValueAtTime(100, ctx.currentTime); // Deep note
        o.connect(g);
        g.connect(ctx.destination);
        o.start();
        g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.5); // Fade out
        o.stop(ctx.currentTime + 0.5);
    }

    blinkBackground(color) {
        let overlay = document.getElementById('blink-overlay');
        overlay.style.backgroundColor = color;
        overlay.style.opacity = '0.5'; // Adjust the opacity as desired
        setTimeout(() => {
            overlay.style.backgroundColor = 'transparent';
            overlay.style.opacity = '0';
        }, 500);
    }

    updateScoreboard() {
        let scoreboard = document.getElementById('scoreboard');
        const maxScore = Math.max(...this.scores);
        scoreboard.innerHTML = '<h3>Skóre</h3>';
        scoreboard.innerHTML += `<div>Kolo: <b>${this.currentRound + 1}</b>/${this.numRounds}</div>`;
        for (let i = 0; i < this.numPlayers; i++) {
            const snakeOfPlayer = this.snakes.filter(s=>s.player.id === this.players[i].id)[0];
            let controls = this.players[i].controls;
            let leftKey = this.getKeyName(controls.left);
            let rightKey = this.getKeyName(controls.right);
            const isTopPlayer = maxScore > 0 && this.scores[i] === maxScore;
            const topPlayerBadge = isTopPlayer ? "&#x1F451;" : "";
            const deadPlayerBadge = snakeOfPlayer.alive ? '' : "&#128128;";
            scoreboard.innerHTML += `<div style="color:${this.players[i].color}">${topPlayerBadge}${deadPlayerBadge}Hráč ${i + 1}: <b>${this.scores[i]}</b><br><small>${leftKey} / ${rightKey}</small></div>`;
        }
    }

    endRound() {
        clearInterval(this.gameTickInterval);
        this.stopAppleTimer(); // Stop apple generation timer

        if(!this.disableCollisionPointGain){
            if(this.aliveSnakes.length === 1){
                this.scores[this.aliveSnakes[0].player.id]++;
            }
        }

        this.updateScoreboard();
        this.currentRound++;
        // Stop the music
        if (this.musicAudio) {
            this.musicAudio.pause();
            this.musicAudio = null;
        }
        // Check for winner
        let maxScore = Math.max(...this.scores);
        let topPlayers = this.scores.filter(score => score === maxScore).length;
        if (topPlayers > 1) {
            // If tie, add another round
            this.numRounds++;
            this.roundTimeout = setTimeout(() => {
                this.startRound();
            }, 2000);
        } else if (this.currentRound >= this.numRounds) {
            this.endGame();
        } else {
            this.roundTimeout = setTimeout(() => {
                this.startRound();
            }, 2000);
        }

        this.keysPressed = {};
    }   

    postGameCleanup(){
        clearInterval(this.gameTickInterval);
        clearTimeout(this.roundTimeout); 
        this.stopAppleTimer();
        this.gameFrozen = false;        

        if (this.musicAudio) {
            this.musicAudio.pause();
            this.musicAudio = null;
        }
        if (this.audioCtx) {
            this.audioCtx.close();
            this.audioCtx = null;
        }

        // Reset game speed and music speed display
        const gameSpeedDiv = document.getElementById('game-speed');
        gameSpeedDiv.textContent = 'Rychlost: 0';
        const musicSpeedDiv = document.getElementById('music-speed');
        musicSpeedDiv.textContent = 'Rychlost hudby: 0';
    }

    endGame() {
        this.postGameCleanup();
        this.updateScoreboard();

        
        // Determine the winner(s)
        let maxScore = Math.max(...this.scores);
        let winners = [];
        for (let i = 0; i < this.scores.length; i++) {
            if (this.scores[i] === maxScore) {
                winners.push(i + 1); // Player numbers are 1-based
            }
        }
        
        // Update the winning title
        let winningTitle = '&#x1F451;<br/>';
        if (winners.length === 1) {
            winningTitle += `Hráč ${winners[0]} vyhrál!`;
        } else {
            winningTitle += `Hráči ${winners.join(', ')} všichni vyhráli!`;
        }
        document.getElementById('winning-title').innerHTML = winningTitle;
        
        // Create a sorted list of players by score descending
        let playerScores = [];
        for (let i = 0; i < this.numPlayers; i++) {
            playerScores.push({ player: i + 1, score: this.scores[i], color: this.players[i].color });
        }
        playerScores.sort((a, b) => b.score - a.score);
        
        // Populate the player scores list
        document.getElementById("gameCanvas").classList.remove("animated-background");
        const playerScoresList = document.getElementById('player-scores');
        playerScoresList.innerHTML = ''; // Clear any existing entries
        playerScores.forEach(p => {
            let li = document.createElement('li');
            let suffix = ''
            switch(p.score){
                case 1:
                    suffix = '';
                case 2:
                case 3:
                case 4:
                    suffix = 'y';
                    break;
                case 0:
                default:
                    suffix = "ů"
                    break;
            }
            li.innerHTML = `<span style="color:${p.color};">Hráč ${p.player}</span>: ${p.score} bod${suffix}`;
            playerScoresList.appendChild(li);
        });
        
        // Hide other UI elements if necessary
        document.getElementById('winning-screen').style.display = '';
        document.getElementById('start-screen').style.display = 'none';                
        document.getElementById('scoreboard').style.display = 'none';
    }


    playMusic() {
        // Load and play the music file
        this.musicAudio = new Audio(this.musicFile);
        this.musicAudio.loop = true;
        this.musicAudio.volume = this.melodyVolume;
        this.musicAudio.playbackRate = this.initialMusicPlaybackRate;
        this.musicAudio.play().catch((error) => {
            console.error('Error playing music:', error);
        });
    }

        
}

window.onload = () => {
    const game = new Game();
};




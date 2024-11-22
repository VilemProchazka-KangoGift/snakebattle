// game.js
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

        // Game State Variables
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

        // New variable to track game speed
        this.gameSpeed = 0;

        // Audio element for music playback
        this.musicAudio = null;

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

        document.getElementById('start-button').addEventListener('click', () => {
            this.startGame();
        });

        // Start game on Enter key press
        window.addEventListener('keydown', (e) => {
            if (e.code === 'Enter' && document.getElementById('start-screen').style.display !== 'none') {
                this.startGame();
            }
            if (e.code === 'Escape' && document.getElementById('start-screen').style.display === 'none') {
                this.endGame();
            }
            this.keysPressed[e.code] = true;
        });
        window.addEventListener('keyup', (e) => {
            this.keysPressed[e.code] = false;
        });

        // Update controls table when number of players changes
        document.getElementById('num-players').addEventListener('change', () => {
            this.updateControlsTable();
        });

        this.updateControlsTable();
    }

    updateControlsTable() {
        const numPlayers = parseInt(document.getElementById('num-players').value);
        const controlsTableDiv = document.getElementById('controls-table');
        let tableHTML = `<table id=""><tr><th>Hráč</th><th>Doleva</th><th>Doprava</th></tr>`;
        for (let i = 0; i < numPlayers; i++) {
            const controls = this.controlsList[i % this.controlsList.length];
            tableHTML += `<tr style='color:${GameConfig.colors[i]}'><td>Hráč ${i + 1}</td><td>${this.getKeyName(controls.left)}</td><td>${this.getKeyName(controls.right)}</td></tr>`;
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
        this.currentRound = 0;
        this.scores = new Array(this.numPlayers).fill(0);
        document.getElementById('start-screen').style.display = 'none';
        this.updateControlsTable(); // Update the controls table to match the actual number of players
        this.startRound();
    }

    startRound() {
        // Clear the canvas and fill it with the background color
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        console.log('Canvas cleared.');

        this.ctx.fillStyle = `rgba(${this.backgroundColor.r}, ${this.backgroundColor.g}, ${this.backgroundColor.b}, ${this.backgroundColor.a / 255})`;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        console.log('Canvas background filled with color:', this.ctx.fillStyle);

        this.snakes = [];
        this.aliveSnakes = [];        

        // Initialize players and snakes
        for (let i = 0; i < this.numPlayers; i++) {
            let color = this.colors[i % this.colors.length];
            let colorAsHex = this.colorsAsHex[i % this.colors.length];
            let control = this.controlsList[i % this.controlsList.length];
            let player = new Player(i, color, colorAsHex, control);
            this.players[i] = player;
            let snake = new Snake(
                this,
                player,
                this.canvas.width,
                this.canvas.height,
                this.initialSnakeSpeed,
                this.snakeSpeedIncrement,
                this.steeringSpeed,
                this.lineWidth,
                this.snakes
            );
            this.snakes[i] = snake;
            this.aliveSnakes.push(snake);
        }
        this.updateScoreboard();
        this.gameTickInterval = setInterval(() => this.gameTick(), 1000 / 60);
        this.playMusic();
    }

    gameTick() {
        for (let snake of this.snakes) {
            if (snake.alive) {
                // Update snake position
                snake.update(this.keysPressed);

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

    updateGameSpeedDisplay() {
        // Calculate average speed of alive snakes
        let totalSpeed = 0;
        for (let snake of this.aliveSnakes) {
            totalSpeed += snake.speed;
        }
        this.gameSpeed = (totalSpeed / this.aliveSnakes.length) || 0;
        const gameSpeedDisplay = (this.gameSpeed / GameConfig.initialSnakeSpeed) * 100
        // Display the game speed with two decimal places
        const gameSpeedDiv = document.getElementById('game-speed');
        gameSpeedDiv.textContent = `Rychlost: ${gameSpeedDisplay.toFixed(0)} %`;
    }

    updateMusicPlaybackRate() {
        if (this.musicAudio && !this.musicAudio.paused) {
            // Map the game speed to a playback rate
            let playbackRate = this.initialMusicPlaybackRate + (this.gameSpeed - this.initialSnakeSpeed) * 0.2;
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

        this.aliveSnakes
            .map(snake=>snake.player.id)
            .forEach(id=>this.scores[id]++);

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
            let controls = this.players[i].controls;
            let leftKey = this.getKeyName(controls.left);
            let rightKey = this.getKeyName(controls.right);
            const isTopPlayer = maxScore > 0 && this.scores[i] === maxScore;
            const topPlayerBadge = isTopPlayer ? "&#x1F451;" : "";
            scoreboard.innerHTML += `<div style="color:${this.players[i].color}">${topPlayerBadge}Hráč ${i + 1}: <b>${this.scores[i]}</b><br><small>${leftKey} / ${rightKey}</small></div>`;
        }
    }

    endRound() {
        clearInterval(this.gameTickInterval);
        
        if(this.aliveSnakes.length === 1){
            this.scores[this.aliveSnakes[0].player.id]++;
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
            setTimeout(() => {
                this.startRound();
            }, 2000);
        } else if (this.currentRound >= this.numRounds) {
            this.endGame();
        } else {
            setTimeout(() => {
                this.startRound();
            }, 2000);
        }

        this.keysPressed = {};
    }   

    endGame() {
        clearInterval(this.gameTickInterval);
        
        this.updateScoreboard();

        if (this.musicAudio) {
            this.musicAudio.pause();
            this.musicAudio = null;
        }
        if (this.audioCtx) {
            this.audioCtx.close();
            this.audioCtx = null;
        }
        let maxScore = Math.max(...this.scores);
        let winners = [];
        for (let i = 0; i < this.scores.length; i++) {
            if (this.scores[i] === maxScore) {
                winners.push(i + 1);
            }
        }
        alert('Konec hry! Zvítězil hráč ' + winners.join(', '));
        document.getElementById('start-screen').style.display = 'block';
        document.getElementById('scoreboard').innerHTML = '';
        // Reset game speed and music speed display
        const gameSpeedDiv = document.getElementById('game-speed');
        gameSpeedDiv.textContent = 'Rychlost: 0';
        const musicSpeedDiv = document.getElementById('music-speed');
        musicSpeedDiv.textContent = 'Rychlost hudby: 0';
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

    shadeColor(color, percent) {
        // Ensure percent is a decimal between -1 and 1
        if (percent > 1) percent = 1;
        if (percent < -1) percent = -1;
    
        // Expand shorthand form (e.g. "03F") to full form ("0033FF")
        let fullColor = color.length === 4
            ? `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`
            : color;
    
        // Convert hex to RGB
        let R = parseInt(fullColor.substring(1, 3), 16);
        let G = parseInt(fullColor.substring(3, 5), 16);
        let B = parseInt(fullColor.substring(5, 7), 16);
    
        // Calculate new color components
        R = Math.round(R + (percent < 0 ? R * percent : (255 - R) * percent));
        G = Math.round(G + (percent < 0 ? G * percent : (255 - G) * percent));
        B = Math.round(B + (percent < 0 ? B * percent : (255 - B) * percent));
    
        // Clamp values to [0, 255]
        R = Math.min(255, Math.max(0, R));
        G = Math.min(255, Math.max(0, G));
        B = Math.min(255, Math.max(0, B));
    
        // Convert back to hex and ensure two digits
        const newColor = "#" + 
            ("0" + R.toString(16)).slice(-2) + 
            ("0" + G.toString(16)).slice(-2) + 
            ("0" + B.toString(16)).slice(-2);
    
        return newColor;
    }   

    createScalePattern(colorAsHex) {
        const patternCanvas = document.createElement('canvas');
        const size = 40; // Adjust size for scale size
        patternCanvas.width = size;
        patternCanvas.height = size;
        const pctx = patternCanvas.getContext('2d');
    
        // Use shades of the snake's color
        const darkerColor = this.shadeColor(colorAsHex, -0.3); // Darken by 20%
        const lighterColor = colorAsHex;// this.shadeColor(color, 0.2); // Lighten by 20%
    
        // Fill background with the darker shade
        pctx.fillStyle = lighterColor;
        pctx.fillRect(0, 0, size, size);
    
        // Draw scales using the lighter shade
        pctx.fillStyle = darkerColor;
    
        const scaleSize = size / 5; // Adjust scale size
        const scaleGap = scaleSize / 3;
    
        // Draw overlapping scales with pointed tips
        for (let y = scaleGap; y < size; y += scaleSize + scaleGap) {
            for (let x = scaleGap; x < size; x += scaleSize + scaleGap) {
                pctx.beginPath();
                pctx.moveTo(x, y);
                pctx.lineTo(x + scaleSize, y + scaleSize / 2);
                pctx.lineTo(x, y + scaleSize);
                pctx.closePath();
                pctx.fill();
            }
        }
    
        return pctx.createPattern(patternCanvas, 'repeat');
    }
}

class Player {
    constructor(id, color, colorAsHex, controls) {
        this.id = id;
        this.color = color;
        this.colorAsHex = colorAsHex;
        this.controls = controls;
        this.leftKey = controls.left;
        this.rightKey = controls.right;
    }
}
class Snake {
    constructor(game, player, canvasWidth, canvasHeight, initialSpeed, speedIncrement, steeringSpeed, lineWidth, existingSnakes) {
        this.game = game; // Store the reference to the Game instance
        this.player = player;
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.alive = true;
        
        this.scalePattern = this.game.createScalePattern(this.player.colorAsHex);
        
        // Initialize segments and previous position
        this.segments = [];
        this.x = canvasWidth / 2 + (Math.random() - 0.5) * 100;
        this.y = canvasHeight / 2 + (Math.random() - 0.5) * 100;
        this.prevX = this.x;
        this.prevY = this.y;

        console.log(`Initialized snake ${player.id} at position (${this.x}, ${this.y})`);

        // Aim at a random direction
        this.angle = Math.random() * 2 * Math.PI;

        this.speed = initialSpeed;
        this.speedIncrement = speedIncrement;
        this.isBoosting = false;
        this.turnSpeed = steeringSpeed;
        this.lineWidth = lineWidth;
    }
    
    applyBoost(newStatus){
        if(this.isBoosting === newStatus){
            return;
        }

        this.isBoosting = newStatus;

        if(newStatus === true){
            console.log("Boosting", this.player);           
            this.speed += GameConfig.boostSpeed;
        }

        if(newStatus === false){
            console.log("Unboosting", this.player);
            this.speed -= GameConfig.boostSpeed;
        }
    }

    update(keysPressed) {
        // Update controls
        this.controls = {
            left: keysPressed[this.player.leftKey],
            right: keysPressed[this.player.rightKey]
        };
        
        if(this.controls.left && this.controls.right){
            this.applyBoost(true);
        }
        else if (this.controls.left) {
            this.angle -= this.turnSpeed;
            this.applyBoost(false);
        }        
        else if (this.controls.right) {
            this.angle += this.turnSpeed;
            this.applyBoost(false);
        }
        else{
            this.applyBoost(false);
        }       
        

        // Store the current position before updating
        this.prevX = this.x;
        this.prevY = this.y;

        // Update position
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;

        // Increase speed
        this.speed += this.speedIncrement;

        // Create a new segment only if the snake has moved
        if (this.prevX !== this.x || this.prevY !== this.y) {
            this.segments.push({
                x1: this.prevX,
                y1: this.prevY,
                x2: this.x,
                y2: this.y
            });
        }        
    }

    checkCollision() {
        const currentSegment = {
            x1: this.prevX,
            y1: this.prevY,
            x2: this.x,
            y2: this.y
        };

        // Only check self-collision if the snake has more than one segment
        const topSegmentsToIgnore = 50;
        if (this.segments.length > topSegmentsToIgnore) {
            if (this.intersectsWithSegments(currentSegment, this.segments.slice(0, -(topSegmentsToIgnore+1)))) {
                console.log(`Snake ${this.player.id} collided with itself.`);
                return true;
            }
        }

        // Check collision with other snakes
        for (let snake of this.game.snakes) {
            if (snake !== this) {
                if (this.intersectsWithSegments(currentSegment, snake.segments)) {
                    console.log(`Snake ${this.player.id} collided with snake ${snake.player.id}.`);

                    if(snake.alive){
                        this.game.scores[snake.player.id]++;
                        this.game.updateScoreboard();
                        console.log("Bonus points from to", this.player, snake.player)
                    }

                    return true;
                }
            }
        }

        // Check collision with walls
        if (this.x < 0 || this.x >= this.canvasWidth || this.y < 0 || this.y >= this.canvasHeight) {
            console.log(`Snake ${this.player.id} collided with wall at (${this.x}, ${this.y}).`);
            return true;
        }

        return false;
    }

    intersectsWithSegments(segment, segments) {
        const radius = GameConfig.lineWidth / 2;
        for (let s of segments) {
            // add more points around the future segment
            for (let addToX = -1 * radius; addToX <= radius; addToX++) {
                for (let addToY = -1 * radius; addToY <= radius; addToY++) {
                    if(this.isPointInsideCircle(segment.x2 + addToX, segment.y2 + addToY, s.x1, s.y1, radius)){
                        return true;
                    }                
                }
            }
        }
        return false;
    }

    isPointInsideCircle(x1, y1, x2, y2, r) {
        const dx = x1 - x2;
        const dy = y1 - y2;
        const distanceSquared = dx * dx + dy * dy;
        const radiusSquared = r * r;
        return distanceSquared <= radiusSquared;
    }

    draw(ctx) {
        if (this.segments.length === 0) return;
    
        // Extract all points from segments
        const points = this.segments.map(segment => ({ x: segment.x2, y: segment.y2 }));
    
        // Ensure there's at least two points to draw a line
        if (points.length < 2) return;
    
        // Set common properties
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
    
        // === 1. Draw the White Outline for the Entire Snake ===
        ctx.lineWidth = this.lineWidth + 1; // Adjust outline thickness as needed
        ctx.strokeStyle = this.game.shadeColor(this.player.colorAsHex, 0.1);;
        ctx.beginPath();
    
        // Move to the first point
        ctx.moveTo(this.segments[0].x1, this.segments[0].y1);
    
        // Iterate through points and draw quadratic curves
        for (let i = 0; i < points.length - 1; i++) {
            const currentPoint = points[i];
            const nextPoint = points[i + 1];
    
            // Calculate the midpoint between current and next points
            const midPoint = {
                x: (currentPoint.x + nextPoint.x) / 2,
                y: (currentPoint.y + nextPoint.y) / 2
            };
    
            // Draw a quadratic curve to the midpoint
            ctx.quadraticCurveTo(currentPoint.x, currentPoint.y, midPoint.x, midPoint.y);
        }
    
        // For the last segment, draw a straight line to the last point
        ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
    
        ctx.stroke();
    
        // === 2. Draw the Main Snake Line on Top of the Outline ===
        ctx.lineWidth = this.lineWidth;
        ctx.strokeStyle = this.player.colorAsHex;// this.scalePattern;
        ctx.beginPath();
    
        ctx.moveTo(this.segments[0].x1, this.segments[0].y1);
    
        for (let i = 0; i < points.length - 1; i++) {
            const currentPoint = points[i];
            const nextPoint = points[i + 1];
    
            const midPoint = {
                x: (currentPoint.x + nextPoint.x) / 2,
                y: (currentPoint.y + nextPoint.y) / 2
            };
    
            ctx.quadraticCurveTo(currentPoint.x, currentPoint.y, midPoint.x, midPoint.y);
        }
    
        ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
    
        ctx.stroke();
    
        // === 3. Draw the Enlarged Head ===
        // Draw a larger white circle at the head position
        ctx.fillStyle = 'white';
        ctx.beginPath();
        const headRadius = this.lineWidth * 1; // Double the original size
        ctx.arc(this.x, this.y, headRadius, 0, 2 * Math.PI);
        ctx.fill();          
    }
}

window.onload = () => {
    const game = new Game();
};

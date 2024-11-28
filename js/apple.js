class Apple {
    constructor(x, y, radius, specialAppleProbability) {   
        this.id = Math.random();     
        this.x = x;
        this.y = y;
        this.radius = radius;        
        this.createdAt = Date.now(); // Timestamp when the apple was created
        this.isEaten = false;        
        this.biteAudio = null;

        this.isSpecialApple = specialAppleProbability > 0 && Math.random() <= specialAppleProbability;
        this.color = this.isSpecialApple ? '#FFD700' /* gold */ : '#FF0000';
        this.pointValue = this.isSpecialApple ? 3 : 1;
    }

    draw(ctx) {
        ctx.fillStyle = drawHelper.shadeColor(this.color, 0.4);
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        ctx.fill();

        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius - 2, 0, 2 * Math.PI);
        ctx.fill();
    }

    remove(ctx) {
        ctx.save();
        ctx.globalCompositeOperation = 'destination-out'
        ctx.fillStyle = 'black';        
        ctx.arc(this.x, this.y, this.radius + 3, 0, 2 * Math.PI);
        ctx.fill();
        ctx.restore();
    }
    
    collect(game, eatenBySnake){
        this.isEaten = true;
        this.playAppleCollectionSound();       
        
        if(this.isSpecialApple){

            let effectArray = [
                this.startHallucinogenicBackground, 
                ()=>this.shufflePlayers(game),
                ()=>this.temporarySpeedUp(game),                
                ()=>this.pernamentSpeedDown(game),
                ()=>this.shortenSnakes(game),
                ()=>this.thinSnakes(game),            
                ()=>this.flipCanvas(game),
                this.rotateCanvas,
                this.skewCanvas
            ];

            if(game.displayApples){
                effectArray = [...effectArray, ()=>this.superAppleMode(game)];
            }

            this.shuffleArray(effectArray)[0]();
        }
        else{
            eatenBySnake.speed += game.snakeSpeedIncrement * 75;
        }
    }

    superAppleMode(game){        
        console.log("apple mode side effect");   
        game.stopAppleTimer();        
        game.startAppleTimer(.1);
        
        setTimeout(()=>{
            if(game.appleTimer){
                game.stopAppleTimer();
                game.startAppleTimer(game.appleDisplayFrequencyInSeconds);
            }
        }, 3000);
    }

    skewCanvas(){
        console.log("skew canvas side effect");   
        const canvas = document.getElementById("gameCanvas");
        canvas.classList.toggle("side-effect-skew")        
    }

    rotateCanvas(){
        console.log("rotate canvas side effect");   
        const canvas = document.getElementById("gameCanvas");
        canvas.classList.toggle("side-effect-rotate")        
    }

    flipCanvas(game){
        console.log("flip canvas side effect");   
        const canvas = document.getElementById("gameCanvas");
        canvas.classList.toggle("side-effect-flip")
        setTimeout(() => {
            game.gameFrozen = true;
            game.stopGameTickInterval();
        }, 50);        
        setTimeout(() => {
            game.gameFrozen = false;
            game.startGameTickInterval();
        }, 1700);
    }

    thinSnakes(game){
        console.log("thin snakes side effect");   
        game.aliveSnakes.forEach(s=> s.lineWidth = 1);             
        setTimeout(()=>{
            game.aliveSnakes.forEach(s=> s.lineWidth = game.lineWidth);
        }, 10000);    
    }

    shortenSnakes(game){
        console.log("shorten snakes side effect");                
        game.aliveSnakes
            .flatMap(snake => snake.segments.filter((_, index) => index <= snake.segments.length / 2))
            .forEach(segment => segment.markedForDeletion = true);        
    }

    pernamentSpeedDown(game){
        console.log("speed down side effect")        
        game.aliveSnakes.forEach(s=>{
            let targetSpeed = s.speed;
            let targetMusicRate = game.initialMusicPlaybackRate + (game.musicAudio.playbackRate - game.initialMusicPlaybackRate) / 6;
            console.log(game.initialMusicPlaybackRate, targetMusicRate);     
            if(s.isBoosting){
                targetSpeed -= game.boostSpeed;
                targetSpeed = (targetSpeed / 2) + game.boostSpeed;
            }
            else{
                targetSpeed = (targetSpeed / 2);
            }

            game.musicAudio.playbackRate = targetMusicRate;
            s.speed = targetSpeed;
            game.updateGameSpeed();
        });
    }
    
    temporarySpeedUp(game){
        console.log("speed up side effect")    
        let targetMusicIncrement = game.musicAudio.playbackRate * 1.5 - game.musicAudio.playbackRate;        
        console.log(game.initialMusicPlaybackRate, targetMusicIncrement);

        game.musicAudio.playbackRate += targetMusicIncrement;        
        game.aliveSnakes.forEach(s=>s.speed += 1.2);        
        game.updateGameSpeed();

        setTimeout(()=>{
            game.musicAudio.playbackRate -= targetMusicIncrement;
            game.aliveSnakes.forEach(s=>s.speed -= 1);
            game.updateGameSpeed();
        }, 3000);        
    }

    shufflePlayers(game){
        console.log("shuffle side effect")
        const players = game.aliveSnakes.map(s=>s.player);
        
        let isShuffleunique = false;
        let playersShuffled = [];
        while(!isShuffleunique){
            playersShuffled = this.shuffleArray(players);
            isShuffleunique = players.every((value, index) => value.id !== playersShuffled[index].id)
        }
        game.aliveSnakes.forEach((s, i)=>s.player = playersShuffled[i]);
        setTimeout(() => {
            game.gameFrozen = true;
            game.stopGameTickInterval();
        }, 50);        
        setTimeout(() => {
            game.gameFrozen = false;
            game.startGameTickInterval();
        }, 1700);
    }

    startHallucinogenicBackground(){
        console.log("hallucination side effect")
        document.getElementById("gameCanvas").classList.add("animated-background");
            document.getElementById("gameCanvas").dataset.lastAppleId = this.id;
            setTimeout(()=>{
                if(document.getElementById("gameCanvas").dataset.lastAppleId == this.id){
                    document.getElementById("gameCanvas").classList.remove("animated-background");
                }
            }, 6000)      
    }

    shuffleArray = (arr) => {
        if(arr.length === 1){
            return arr;
        }

        const newArr = arr.slice()
        for (let i = newArr.length - 1; i > 0; i--) {
            const rand = Math.floor(Math.random() * (i + 1));
            [newArr[i], newArr[rand]] = [newArr[rand], newArr[i]];
        }

        return newArr
    };


    playAppleCollectionSound() {
        if (!this.audioCtx) {
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        // Load and play the music file
        this.biteAudio = new Audio('bite.mp3');
        this.biteAudio.loop = false;
        this.biteAudio.volume = .075;        
        this.biteAudio.currentTime = .03;
        this.biteAudio.play().catch((error) => {
            console.error('Error playing music:', error);
        });
    }
}
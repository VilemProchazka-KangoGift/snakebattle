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
        this.color = this.isSpecialApple ? 'gold' : 'red';
        this.pointValue = this.isSpecialApple ? 3 : 1;
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        ctx.fill();
    }

    remove(ctx) {
        ctx.save();
        ctx.globalCompositeOperation = 'destination-out'
        ctx.fillStyle = 'black';        
        ctx.arc(this.x, this.y, this.radius + 1, 0, 2 * Math.PI);
        ctx.fill();
        ctx.restore();
    }
    
    collect(game){
        this.isEaten = true;
        this.playAppleCollectionSound();
        
        if(this.isSpecialApple){
            this.shuffleArray([
                this.startHallucinogenicBackground, 
                ()=>this.shufflePlayers(game)
            ])[0]();
        }
    }

    shufflePlayers(game){
        const players = game.aliveSnakes.map(s=>s.player);
        const playersShuffled = this.shuffleArray(players);
        game.aliveSnakes.forEach((s, i)=>s.player = playersShuffled[i]);
        game.gameFrozen = true;
        setTimeout(()=>game.gameFrozen = false, 1500);
    }

    startHallucinogenicBackground(){
        document.getElementById("gameCanvas").classList.add("animated-background");
            document.getElementById("gameCanvas").dataset.lastAppleId = this.id;
            setTimeout(()=>{
                if(document.getElementById("gameCanvas").dataset.lastAppleId == this.id){
                    document.getElementById("gameCanvas").classList.remove("animated-background");
                }
            }, 10000)      
    }

    shuffleArray = arr => {
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
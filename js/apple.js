class Apple {
    constructor(x, y, radius, color) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.createdAt = Date.now(); // Timestamp when the apple was created
        this.isEaten = false;
        this.pointValue = 1;
        this.biteAudio = null;
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
    
    collect(){
        this.isEaten = true;
        this.playAppleCollectionSound();
    }

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
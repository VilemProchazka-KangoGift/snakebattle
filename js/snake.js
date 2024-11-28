class Snake {
    constructor(game, player, position, canvasWidth, canvasHeight, initialSpeed, speedIncrement, steeringSpeed, lineWidth) {
        this.game = game; // Store the reference to the Game instance
        this.player = player;
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.alive = true;
        // Initialize segments and previous position
        this.segments = [];
        this.x = position.px;
        this.y = position.py;
        this.prevX = this.x;
        this.prevY = this.y;

        console.log(`Initialized snake ${player.id} at position (${this.x}, ${this.y})`);

        // Aim at a random direction
        this.angle = position.angle;

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
           // console.log("Boosting", this.player.id );           
            this.speed += this.game.boostSpeed;
        }

        if(newStatus === false){
           // console.log("Unboosting", this.player.id);
            this.speed -= this.game.boostSpeed;
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
        
        let originalValues = {
            prevX: this.prevX,
            prevY: this.prevY,
            x: this.x,
            y: this.y
        }

        // Store the current position before updating
        this.prevX = this.x;
        this.prevY = this.y;

        // Update position
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;

        let newValues = {
            prevX: this.prevX,
            prevY: this.prevY,
            x: this.x,
            y: this.y
        }

        // Increase speed
        this.speed += this.speedIncrement;

        if(this.checkIf180Turn(originalValues, newValues)){
            this.prevX = originalValues.prevX;
            this.prevY = originalValues.prevY;
            this.x = originalValues.x;
            this.y = originalValues.y;
            return;
        }

        // Create a new segment only if the snake has moved
        if (this.prevX !== this.x || this.prevY !== this.y) {
            this.segments.push({
                x1: this.prevX,
                y1: this.prevY,
                x2: this.x,
                y2: this.y,
                markedForDeletion: false
            });
        }        
    }

    // check for 180 degree change in direction - timing bug
    checkIf180Turn(originalValues, newValues){
        const getDirection = (prev, current) => {
            if((!prev && prev !== 0) || (!current && current !== 0)){
                return 0;
            }

            if(prev === current){
                return 0;
            }

            (prev - current) < 0 ? -1 : 1
        };

        const prevXDirection = getDirection(originalValues.prevX, originalValues.x);
        const prevYDirection = getDirection(originalValues.prevY, originalValues.y);
        const currentXDirection = getDirection(newValues.prevX, newValues.x);
        const currentYDirection = getDirection(newValues.prevY, newValues.y);


        return prevXDirection !== currentXDirection 
            && prevYDirection !== currentYDirection
            && prevXDirection !== 0
            && prevYDirection !== 0
            && currentXDirection !== 0
            && currentYDirection !== 0;
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

                    if(snake.alive && !this.game.disableCollisionPointGain){                        
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
        const radius = this.game.lineWidth / 2;
        for (let s of segments) {
            // add more points around the future segment
            for (let addToX = -1 * radius; addToX <= radius; addToX++) {
                for (let addToY = -1 * radius; addToY <= radius; addToY++) {
                    if(collisionHelper.isPointInsideCircle(segment.x2 + addToX, segment.y2 + addToY, s.x1, s.y1, radius)){
                        return true;
                    }                
                }
            }
        }
        return false;
    }

    draw(ctx) {
        if (this.segments.length === 0) return;

        let deletedSegments = this.segments.filter(s=> s.markedForDeletion);
        this.drawPart(ctx, deletedSegments, true);

        this.segments = this.segments.filter(s=> !s.markedForDeletion);
        this.drawPart(ctx, this.segments, false);          
    }

    drawPart(ctx, segments, deleteSegments) {        
        if (segments.length === 0) return;

        let lineWidth = this.lineWidth;
        if(deleteSegments){
            ctx.save();
            ctx.globalCompositeOperation = 'destination-out'
            ctx.fillStyle = 'black';   
            lineWidth = lineWidth + 4.5;
        }

        if (segments.length === 0) return;
    
        // Extract all points from segments
        const points = segments.map(segment => ({ x: segment.x2, y: segment.y2 }));
    
        // Ensure there's at least two points to draw a line
        if (points.length < 2) return;
    
        // Set common properties
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
    
        // === 1. Draw the White Outline for the Entire Snake ===
        ctx.lineWidth = lineWidth + 1; // Adjust outline thickness as needed
        ctx.strokeStyle = drawHelper.shadeColor(this.player.colorAsHex, 0.1);
        ctx.beginPath();
    
        // Move to the first point
        ctx.moveTo(segments[0].x1, segments[0].y1);
    
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
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = this.player.colorAsHex;// this.scalePattern;
        ctx.beginPath();
    
        ctx.moveTo(segments[0].x1, segments[0].y1);
    
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
        if(!deleteSegments){
            ctx.fillStyle = 'white';
            ctx.beginPath();
            const headRadius = lineWidth * 1;
            ctx.arc(this.x, this.y, headRadius, 0, 2 * Math.PI);
            ctx.fill();    
        }
        
        if(deleteSegments){
            ctx.restore();
        }
    }
}
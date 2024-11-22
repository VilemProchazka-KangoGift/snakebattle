const positioningHelpers= {
   /**
 * Positions N points around a circle's edge with minimum distance constraints and random variations
 * @param {number} canvasWidth - Canvas width in pixels
 * @param {number} canvasHeight - Canvas height in pixels
 * @param {number} radius - Circle radius in pixels
 * @param {number} minDistance - Minimum distance between points in pixels
 * @param {number} numPoints - Number of points to position
 * @returns {Map<number, {px: number, py: number, angle: number}>} Map of positioned points with coordinates and angles
 */
positionPointsOnCircle : (canvasWidth, canvasHeight, radius, minDistance, numPoints, varyByPct = .1) =>{
    // Validate inputs
    if (numPoints <= 0) return new Map();
    
    // Calculate center of canvas
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;
    
    // Helper function to calculate distance between two points
    const getDistance = (p1, p2) => {
        const dx = p1.px - p2.px;
        const dy = p1.py - p2.py;
        return Math.sqrt(dx * dx + dy * dy);
    };
    
    // Function to add random variation (-10% to 10%)
    const addVariation = (value) => {
        const variation = (Math.random() * varyByPct * 2 - varyByPct); // -10% to 10%
        return value * (1 + variation);
    };
    
    // Function to get point coordinates from angle
    const getPointFromAngle = (angle, rad) => {
        return {
            px: Math.round(centerX + Math.cos(angle) * rad),
            py: Math.round(centerY + Math.sin(angle) * rad),
            angle: angle
        };
    };
    
    // Function to check if a new position is valid
    const isValidPosition = (newPoint, positions) => {
        for (const [_, pos] of positions) {
            if (getDistance(newPoint, pos) < minDistance) {
                return false;
            }
        }
        return true;
    };
    
    // Calculate maximum possible points based on circumference
    const circumference = 2 * Math.PI * radius;
    const maxPoints = Math.floor(circumference / minDistance);
    const actualPoints = Math.min(numPoints, maxPoints);
    
    const positions = new Map();
    let attempts = 0;
    const maxAttempts = 1000;
    
    // Try fully random positioning first
    while (positions.size < actualPoints && attempts < maxAttempts) {
        if (positions.size === 0) {
            // Place first point at random angle
            const randomAngle = Math.random() * 2 * Math.PI;
            const radiusWithVariation = addVariation(radius);
            const point = getPointFromAngle(randomAngle, radiusWithVariation);
            positions.set(0, point);
            continue;
        }
        
        // Try to place next point
        const randomAngle = Math.random() * 2 * Math.PI;
        const radiusWithVariation = addVariation(radius);
        const newPoint = getPointFromAngle(randomAngle, radiusWithVariation);
        
        if (isValidPosition(newPoint, positions)) {
            positions.set(positions.size, newPoint);
            attempts = 0; // Reset attempts for next point
        } else {
            attempts++;
        }
    }
    
    // If random positioning fails, use semi-random positioning with guaranteed minimum distance
    if (positions.size < actualPoints) {
        positions.clear();
        
        // Calculate base angle with some padding for variations
        const baseAngleDelta = (2 * Math.PI) / actualPoints * 1.2; // Add 20% padding
        let currentAngle = Math.random() * 2 * Math.PI; // Random start
        
        for (let i = 0; i < actualPoints; i++) {
            let validPoint = null;
            let tryCount = 0;
            
            while (!validPoint && tryCount < 50) {
                // Add some randomness to the angle while maintaining general spacing
                const angleVariation = (Math.random() * 0.5 - 0.25) * baseAngleDelta; // ±25% variation
                const tryAngle = currentAngle + angleVariation;
                const radiusWithVariation = addVariation(radius);
                
                const tryPoint = getPointFromAngle(tryAngle, radiusWithVariation);
                
                if (i === 0 || isValidPosition(tryPoint, positions)) {
                    validPoint = tryPoint;
                }
                
                tryCount++;
            }
            
            if (validPoint) {
                positions.set(i, validPoint);
                currentAngle += baseAngleDelta;
            }
        }
    }
    
    return positions;
}
}
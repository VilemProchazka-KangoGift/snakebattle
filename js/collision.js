const collisionHelper ={ 
    isPointInsideCircle: (x1, y1, x2, y2, r)=> {
        const dx = x1 - x2;
        const dy = y1 - y2;
        const distanceSquared = dx * dx + dy * dy;
        const radiusSquared = r * r;
        return distanceSquared <= radiusSquared;
    }
}

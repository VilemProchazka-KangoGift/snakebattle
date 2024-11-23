const drawHelper = {
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

}
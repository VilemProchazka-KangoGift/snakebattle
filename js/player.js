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
class OrbSlot extends Phaser.GameObjects.Zone {

    constructor(scene, x, y, row, col) {
        super(scene, x, y, Orb.WIDTH, Orb.HEIGHT);
        this.setInteractive({ dropZone: true });
        this.orb = null;
        this.row = row;
        this.col = col;
    }
}
class OrbSlot extends Phaser.GameObjects.Zone{

    constructor(scene, x, y) {
        super(scene, x, y,100,100);
        this.setInteractive({dropZone: true });
        this.orb = null;
    }
}
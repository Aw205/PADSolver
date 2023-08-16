class OrbSlot extends Phaser.GameObjects.Zone{

    constructor(scene, x, y) {
        super(scene, x, y,Orb.WIDTH,Orb.HEIGHT);
        this.setInteractive({dropZone: true });
        this.orb = null;
    }
}
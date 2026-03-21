class OrbSlot extends Phaser.GameObjects.Zone {

    constructor(scene, x, y, index) {
        super(scene, x, y, Orb.WIDTH, Orb.HEIGHT);
        this.setInteractive({ dropZone: true });
        this.orb = null;
        this.index = index;

        this.rouletteImage = null;
        this.hasRoulette = false;
        this.rouletteTween = null;
        this.g = null;

    }

    addRoulette() {

        if (!this.hasRoulette) {

            this.hasRoulette = true;
            this.rouletteImage = this.scene.add.image(this.x, this.y, "roulette");
            this.g = this.scene.add.graphics({ fillStyle: { color: 0xffffff, alpha: 0.8 } }).setDepth(-1);
            let tw = this.scene.tweens.addCounter({
                from: 0,
                to: 360,
                duration: 3000,
                onUpdate: (tween) => {
                    const value = tween.getValue();
                    this.g.clear();
                    const startAngle = Phaser.Math.DegToRad(-90);
                    const endAngle = Phaser.Math.DegToRad(value - 90);
                    this.g.slice(this.x, this.y, Orb.WIDTH / 2 + 5, startAngle, endAngle, false);
                    this.g.fillPath();
                },
                loop: -1,
                onLoop: () => {
                    if (!this.orb.isPointerdown) {
                        this.orb.setTypeNoAnim((this.orb.type + 1) % 6);
                    }
                }
            });
            this.rouletteTween = tw;
            this.scene.rouletteTweens.push(tw);
            this.scene.tweens.tweens.forEach((t) => {
                t.restart();
            });
        }
    }

    removeRoulette() {
        if (this.hasRoulette) {
            this.hasRoulette = false;
            this.rouletteTween.destroy();
            this.rouletteTween = null;
            this.rouletteImage.destroy();
            this.g.destroy();
        }
    }
}
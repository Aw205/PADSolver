class OrbSlot extends Phaser.GameObjects.Zone {

    constructor(scene, x, y, index) {
        super(scene, x, y, Orb.WIDTH, Orb.HEIGHT);
        this.setInteractive({ dropZone: true });
        this.orb = null;
        this.index = index;
        this.hasRoulette = false;

    }

    addRoulette() {

        if (!this.hasRoulette) {

            this.hasRoulette = true;
            this.scene.add.image(this.x, this.y, "roulette");
            let g = this.scene.add.graphics({ fillStyle: { color: 0xffffff, alpha: 0.8 } }).setDepth(-1);

            let tw = this.scene.tweens.addCounter({
                from: 0,
                to: 360,
                duration: 3000,
                onUpdate: (tween) => {
                    const value = tween.getValue();
                    g.clear();
                    const startAngle = Phaser.Math.DegToRad(-90);
                    const endAngle = Phaser.Math.DegToRad(value - 90);
                    g.slice(this.x, this.y, Orb.WIDTH / 2 + 5, startAngle, endAngle, false);
                    g.fillPath();
                },
                loop: -1,
                onLoop: () => {
                    if(!this.orb.isPointerdown){
                        this.orb.setTypeNoAnim((this.orb.type + 1) % 6);
                    }
                }
            });
            this.scene.rouletteTweens.push(tw);
            this.scene.tweens.tweens.forEach((t)=>{
                t.restart();
            });
        }


    }
}
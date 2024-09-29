
const ORB_TYPE_TO_TEXTURE_KEY = Object.freeze(["fire","water","wood","light","dark","heart"]);

class Orb extends Phaser.GameObjects.Image {

    static HEIGHT = 100;
    static WIDTH = 100;

    constructor(scene, x, y, texture) {
        super(scene, x, y, texture);

        this.type = null; 
        this.slot = null;
        this.shadow = this.scene.add.image(x, y, texture).setAlpha(0.4).setVisible(false);
        this.hasSwapped = false;

        this.setInteractive({ draggable: true, useHandCursor: true });
        this.addFirstSwapListener();
        this.#createListeners();

        this.scene.add.existing(this);
    }

    #createListeners() {

        this.on("pointerdown", (pointer, localX, localY) => {
            this.shadow.setPosition(this.x, this.y).setVisible(true);
            this.setAlpha(0.8);
            this.setOrigin(1 - localX / Orb.HEIGHT, 1 - localY / Orb.HEIGHT);
        });
        this.on("drag", (pointer, dragX, dragY) => {
            this.setPosition(dragX, dragY);
        });
        this.on("dragenter", (pointer, target) => {
            this.swap(target);
        });
        this.on("drop", (pointer, target) => {
            this.onOrbRelease();
        });
        this.on("pointerup", () => {
            this.onOrbRelease();
        });

    }

    /**
     * @param {OrbSlot} target 
     */
    swap(target) {

        this.scene.board.swapOrbs(this.slot.index, target.index);

        target.orb.setPosition(this.slot.x, this.slot.y);
        this.shadow.setPosition(target.x, target.y);

        let tempTargetOrb = target.orb;
        [target.orb, this.slot.orb] = [this.slot.orb, target.orb];
        [this.slot, tempTargetOrb.slot] = [tempTargetOrb.slot, this.slot];

    }

     /**
     * @param {Orb} target 
     */
    swapAnimated(target) {

        this.scene.board.swapOrbs(this.slot.index,target.slot.index);
        
        this.shadow.setPosition(target.slot.x, target.slot.y);
        [target.slot.orb, this.slot.orb] = [this.slot.orb, target.slot.orb];
        [this.slot, target.slot] = [target.slot, this.slot];

        this.scene.tweens.add({
            targets: [this, target],
            x: target => { return target.slot.x; },
            y: target => { return target.slot.y; },
            duration: 500,
            ease: Phaser.Math.Easing.Linear,
        });
    }

    addFirstSwapListener() {
        this.once("dragleave", (pointer, target) => {
            this.hasSwapped = true;
            this.scene.board.prevBoard = this.scene.board.getNumericModel();
        });
    }

    onOrbRelease() {

        this.shadow.setVisible(false);
        this.setPosition(this.slot.x, this.slot.y).setOrigin(0.5).setAlpha(1);
        if (this.hasSwapped) {
            this.hasSwapped = false;
            this.addFirstSwapListener();
            this.scene.events.emit("solveBoard");
        }
    }

    /**
     * 
     * @param {Number} type from 0 - 5 
     */
    setType(type) {

        this.setTexture(ORB_TYPE_TO_TEXTURE_KEY[type]);
        this.shadow.setTexture(ORB_TYPE_TO_TEXTURE_KEY[type]);
        this.type = type;
    }

    destroyOrb() {
        this.shadow.destroy();
        this.destroy();
    }

}


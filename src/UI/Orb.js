
const OrbType = Object.freeze({
    Fire: Symbol("0"),
    Water: Symbol("1"),
    Grass: Symbol("2"),
    Light: Symbol("3"),
    Dark: Symbol("4"),
    Heart: Symbol("5"),
});


class Orb extends Phaser.GameObjects.Image {

    static HEIGHT = 100;
    static WIDTH = 100;

    constructor(scene, x, y, row, col, texture) {
        super(scene, x, y, texture);

        this.type = null; //number

        this.row = row;
        this.col = col;
        this.isVisited = false;
        this.startPos = new Phaser.Math.Vector2(x, y);
        this.currentSlot = null;
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
            this.swapLocations(target);
        });
        this.on("drop", (pointer, target) => {
            this.onOrbRelease();
        });
        this.on("pointerup", () => {
            this.onOrbRelease();
        });

    }

    swapLocations(target) {

        [this.row, target.orb.row] = [target.orb.row, this.row];
        [this.col, target.orb.col] = [target.orb.col, this.col];

        this.scene.events.emit("swapOrbs", this.row, this.col, target.orb.row, target.orb.col);

        [this.startPos, target.orb.startPos] = [target.orb.startPos, this.startPos];
        target.orb.setPosition(target.orb.startPos.x, target.orb.startPos.y);

        let tempTargetOrb = target.orb;
        [target.orb, this.currentSlot.orb] = [this.currentSlot.orb, target.orb];
        [this.currentSlot, tempTargetOrb.currentSlot] = [tempTargetOrb.currentSlot, this.currentSlot];

        this.shadow.setPosition(this.startPos.x, this.startPos.y);
    }


    swapLocations2(target) {

        [this.row, target.orb.row] = [target.orb.row, this.row];
        [this.col, target.orb.col] = [target.orb.col, this.col];

        this.scene.events.emit("swapOrbs", this.row, this.col, target.orb.row, target.orb.col);

        [this.startPos, target.orb.startPos] = [target.orb.startPos, this.startPos];

        this.scene.tweens.add({
            targets: this,
            x: this.startPos.x,
            y: this.startPos.y,
            duration: 500,
            ease: Phaser.Math.Easing.Linear,
        });

        this.scene.tweens.add({
            targets: target.orb,
            x: target.orb.startPos.x,
            y:  target.orb.startPos.y,
            duration: 500,
            ease: Phaser.Math.Easing.Linear,
        });

        let tempTargetOrb = target.orb;
        [target.orb, this.currentSlot.orb] = [this.currentSlot.orb, target.orb];
        [this.currentSlot, tempTargetOrb.currentSlot] = [tempTargetOrb.currentSlot, this.currentSlot];

        this.shadow.setPosition(this.startPos.x, this.startPos.y);
    }


    addFirstSwapListener() {
        this.once("dragleave", (pointer, target) => {
            this.hasSwapped = true;
            this.scene.board.prevBoard = this.scene.board.getNumericModel();
        });
    }

    onOrbRelease() {

        this.shadow.setVisible(false);
        this.setPosition(this.startPos.x, this.startPos.y);
        this.setOrigin(0.5);
        this.setAlpha(1);
        if (this.hasSwapped) {
            this.hasSwapped = false;
            this.addFirstSwapListener();
            this.scene.events.emit("solveBoard");
        }
    }

    changeType(type){
        this.setTexture(typeTextureMap.get(type));
        this.shadow.setTexture(typeTextureMap.get(type));
        this.type = Object.values(OrbType)[type];
    }

    destroyOrb(){
        this.shadow.destroy();
        this.destroy();
    }

}


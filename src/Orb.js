

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

        this.type = null;

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
            //Board.timeLabel.setVisible(true).setPosition(pointer.x, pointer.y - 30);
            this.shadow.setPosition(this.x, this.y).setVisible(true);
            this.setAlpha(0.8);
            this.setOrigin(1 - localX / Orb.HEIGHT, 1 - localY / Orb.HEIGHT);
        });
        this.on("drag", (pointer, dragX, dragY) => {
            this.setPosition(dragX, dragY);
            // Board.timer.setPosition(pointer.x, pointer.y - 30);
            // Board.timeLabel.setPosition(pointer.x, pointer.y - 30);
        });
        this.on("dragenter", (pointer, target) => {
            //if(target!= this.currentSlot){
            this.#swapLocations(target);
            //}

        });
        this.on("drop", (pointer, target) => {
            this.onOrbRelease();
        });
        this.on("pointerup", () => {
            this.onOrbRelease();
        });

    }

    #swapLocations(target) {

        [this.row, target.orb.row] = [target.orb.row, this.row];
        [this.col, target.orb.col] = [target.orb.col, this.col];


        this.scene.events.emit("swapOrbs", this.row, this.col, target.orb.row, target.orb.col);

        //[Board.orbArray[this.row][this.col], Board.orbArray[target.orb.row][target.orb.col]] = [Board.orbArray[target.orb.row][target.orb.col], Board.orbArray[this.row][this.col]];

        [this.startPos, target.orb.startPos] = [target.orb.startPos, this.startPos];
        target.orb.setPosition(target.orb.startPos.x, target.orb.startPos.y);

        let tempTargetOrb = target.orb;
        [target.orb, this.currentSlot.orb] = [this.currentSlot.orb, target.orb];
        [this.currentSlot, tempTargetOrb.currentSlot] = [tempTargetOrb.currentSlot, this.currentSlot];

        this.shadow.setPosition(this.startPos.x, this.startPos.y);


        // let tpos = new Phaser.Math.Vector2(target.orb.x,target.orb.y);
        // let p1 = new Phaser.Math.Vector2(this.startPos.x,this.startPos.y - 20);
        // let p2 = new Phaser.Math.Vector2(tpos.x,this.startPos.y - 20);

        // //let bezierCurve = new Phaser.Curves.CubicBezier(tpos,p2,p1,this.startPos);
        // let bezierCurve = new Phaser.Curves.CubicBezier(this.startPos,p1,p2,tpos);

        // this.scene.tweens.addCounter({
        //     duration: 2000,
        //     onUpdate: (tween) => {
        //         let pos = bezierCurve.getPoint(tween.getValue());
        //         //this.shadow.setPosition(pos.x,pos.y);
        //         target.orb.setPosition(pos.x,pos.y)
        //     },
        //     callbackScope: this
        // });
    }


    addFirstSwapListener() {
        this.once("dragleave", (pointer, target) => {
            //Board.timeLabel.setVisible(false);
            this.hasSwapped = true;

            // this.timeIndicatorEvent = this.scene.time.delayedCall(5000, () => {

            //     let e = Board.timer.getChildByID("timer");
            //     e.style.visibility = "visible";
            //     e.style.animationName = "none";
            //     requestAnimationFrame(() => {
            //         setTimeout(() => {
            //             e.style.animationName = ""
            //         }, 0);
            //     });
            //     e.addEventListener("animationend", this.onTimerEnd.bind(this), { once: true });
            // });
        });
    }

    onOrbRelease() {

        // Board.timeLabel.setVisible(false);
        // this.scene.time.removeEvent(this.timeIndicatorEvent);
        // Board.timer.getChildByID("timer").removeEventListener("animationend", this.onTimerEnd);
        // Board.timer.getChildByID("timer").style.visibility = "hidden";
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

    onTimerEnd() {
        //Board.timer.getChildByID("timer").style.visibility = "hidden";
        this.emit("drop");
    }


    changeType(texture,type){

        this.setTexture(texture);
        this.type = Object.values(OrbType)[type];

    }

    destroyOrb(){
        this.shadow.destroy();
        this.destroy();

    }

}
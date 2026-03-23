
export const ORB_TYPE_MAP = new Map();
ORB_TYPE_MAP.set(0, "fire");
ORB_TYPE_MAP.set(1, "water");
ORB_TYPE_MAP.set(2, "wood");
ORB_TYPE_MAP.set(3, "light");
ORB_TYPE_MAP.set(4, "dark");
ORB_TYPE_MAP.set(5, "heart");
ORB_TYPE_MAP.set(6, "poison");
ORB_TYPE_MAP.set(7, "jammer");
ORB_TYPE_MAP.set("fire", 0);
ORB_TYPE_MAP.set("water", 1);
ORB_TYPE_MAP.set("wood", 2);
ORB_TYPE_MAP.set("light", 3);
ORB_TYPE_MAP.set("dark", 4);
ORB_TYPE_MAP.set("heart", 5);
ORB_TYPE_MAP.set("poison", 6);
ORB_TYPE_MAP.set("jammer", 7);

export const ORB_HEIGHT = 208;

import { GameObjects } from "phaser";

export class Orb extends GameObjects.Container {

    static HEIGHT = 208;
    static WIDTH = 208;

    /**
    * @param {int} type 
    */
    constructor(scene, x, y, type) {
        super(scene, x, y);

        this.setSize(Orb.WIDTH, Orb.HEIGHT);

        this.orbImage = this.scene.add.image(0, 0, ORB_TYPE_MAP.get(type));
        this.shadow = this.scene.add.image(x, y, ORB_TYPE_MAP.get(type)).setAlpha(0.4).setVisible(false);

        this.type = type;
        this.slot = null;
        this.isBlind = false;
        this.isEnhanced = false;
        this.plus = null;
        this.isPointerdown = false;
        this.hasSwapped = false;
        this.startTime = 0;

        this.setInteractive({
            hitArea: new Phaser.Geom.Rectangle(0, 0, 208, 208),
            hitAreaCallback: Phaser.Geom.Rectangle.Contains,
            useHandCursor: true,
            draggable: true
        });

        this.addFirstSwapListener();
        this.#createListeners();

        this.add(this.orbImage);
        this.scene.add.existing(this);
    }

    #createListeners() {

        this.on("pointerdown", (pointer, localX, localY) => {
            this.isPointerdown = true;
            this.setToTop();
            this.shadow.setPosition(this.x, this.y).setVisible(true);
            this.orbImage.setAlpha(0.8);
            this.orbImage.setOrigin(1 - localX / Orb.HEIGHT, 1 - localY / Orb.HEIGHT);
            this.plus?.setOrigin(1 - localX / Orb.HEIGHT, 1 - localY / Orb.HEIGHT);
            this.orbImage.setTint(0xffffff);
        });
        this.on("drag", (pointer, dragX, dragY) => {
            this.setPosition(dragX, dragY);
        });
        this.on("dragenter", (pointer, target) => {
            if (this.hasSwapped) {
                this.swap(target);
            }
        });
        this.on("pointerup", () => {
            this.onOrbRelease();
        });

    }

    /**
     * @param {OrbSlot} target 
     */
    swap(target) {

        if (target.orb.isBlind) {
            target.orb.unblind();
        }

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

        this.scene.board.swapOrbs(this.slot.index, target.slot.index);

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
            if (this.isBlind) {
                this.isBlind = false;
                this.shadow.setTint(0xffffff);
            }
            this.hasSwapped = true;
            this.scene.board.prevBoard = this.scene.board.getNumericModel();
            this.startTime = performance.now();
        });
    }

    onOrbRelease() {

        this.isPointerdown = false;
        this.scene.pauseRoulettes();
        if (this.isBlind) {
            this.orbImage.setTint(0);
        }
        this.shadow.setVisible(false);
        this.setPosition(this.slot.x, this.slot.y);
        this.orbImage.setOrigin(0.5).setAlpha(1);
        this.plus?.setOrigin(0.5);

        if (this.hasSwapped) {
            this.hasSwapped = false;
            this.addFirstSwapListener();
            if (!document.getElementById("free-move-toggle").classList.contains("button-activate")) {
                this.scene.events.emit("solveBoard");
                document.getElementById("time-count").textContent = ((performance.now() - this.startTime) / 1000).toFixed(2);
            }
        }
    }


    enhance() {
        if (!this.isEnhanced) {
            this.isEnhanced = true;
            this.orbImage.setPipeline("TestShader");
            this.plus = this.scene.add.image(0, 0, "plus");
            this.add(this.plus);
        }

    }

    blind() {
        this.isBlind = true;
        this.shadow.setTint(0);
        this.scene.tweens.addCounter({
            from: 0,
            to: 100,
            duration: 200,
            onUpdate: (tween) => {
                const value = tween.getValue();
                const color = Phaser.Display.Color.Interpolate.ColorWithColor({ r: 255, g: 255, b: 255 }, { r: 0, g: 0, b: 0 }, 100, value);
                this.orbImage.setTint(Phaser.Display.Color.GetColor(color.r, color.g, color.b));
            }
        });
    }

    unblind() {

        this.isBlind = false;
        this.scene.tweens.addCounter({
            from: 0,
            to: 100,
            duration: 200,
            onUpdate: (tween) => {
                const value = tween.getValue();
                const color = Phaser.Display.Color.Interpolate.ColorWithColor({ r: 0, g: 0, b: 0 }, { r: 255, g: 255, b: 255 }, 100, value);
                this.orbImage.setTint(Phaser.Display.Color.GetColor(color.r, color.g, color.b));
            }
        });
    }

    removeEnhance() {
        this.isEnhanced = false;
        this.orbImage.resetPipeline();
        this.remove(this.plus);
        this.plus.destroy();
        this.plus = null;

    }

    removeModifiers() {
        if (this.isEnhanced) {
            this.removeEnhance();
        }
        if (this.isBlind) {
            this.unblind();
        }
        if (this.slot.hasRoulette) {
            this.slot.removeRoulette();
        }
    }


    /**
     * 
     * @param {int} type 0 - 5 
     */
    setType(type, showAnim = false) {

        this.type = type;
        this.orbImage.setTexture(ORB_TYPE_MAP.get(type));
        this.shadow.setTexture(ORB_TYPE_MAP.get(type));
        if (showAnim) {
            this.setScale(0.9);
            this.scene.tweens.add({
                targets: this,
                scale: 1,
                duration: 300,
                ease: Phaser.Math.Easing.Back.Out
            });
        }
    }

    destroyOrb() {
        this.shadow.destroy();
        this.destroy();
    }

}





const typeTextureMap = new Map(
    [[0, "fire"], [1, "water"], [2, "wood"],
    [3, "light"], [4, "dark"], [5, "heart"]]
);


class Board extends Phaser.GameObjects.GameObject {

    constructor(scene, x, y) {
        super(scene);

        this.orbImages = ["fire", "water", "wood", "light", "dark", "heart"];

        this.solveInProgress = false;

        this.x = x;
        this.y = y;
        this.BOARD_HEIGHT = 5;
        this.BOARD_WIDTH = 6;

        this.prevBoard = null;

        this.orbArray = new Array(this.BOARD_HEIGHT);
        this.skyfallArray = new Array(this.BOARD_HEIGHT);
        this.orbSlotArray = new Array(this.BOARD_HEIGHT);

        this.comboList = [];
        this.generateBoard();

        this.scene.events.on("solveBoard", () => {
            this.solveBoard();
        });
        this.scene.events.on("swapOrbs", (row, col, targetR, targetC) => {
            [this.orbArray[row][col], this.orbArray[targetR][targetC]] = [this.orbArray[targetR][targetC], this.orbArray[row][col]];
        })
    }

    generateBoard() {

        for (let i = 0; i < this.BOARD_HEIGHT; i++) {
            this.orbArray[i] = new Array(this.BOARD_WIDTH);
            this.skyfallArray[i] = new Array(this.BOARD_WIDTH);
            this.orbSlotArray[i] = new Array(this.BOARD_WIDTH);
        }

        for (let row = 0; row < this.BOARD_HEIGHT; row++) {
            for (let col = 0; col < this.BOARD_WIDTH; col++) {

                let rand = Phaser.Math.Between(0, 5);
                let x = this.x + col * Orb.WIDTH;
                let y = this.y + row * Orb.HEIGHT;

                this.orbArray[row][col] = new Orb(this.scene, x, y, row, col, this.orbImages[rand]);
                this.orbArray[row][col].type = Object.values(OrbType)[rand];

                rand = Phaser.Math.Between(0, 5);

                this.skyfallArray[row][col] = new Orb(this.scene, x, y - this.BOARD_HEIGHT * Orb.HEIGHT, row, col, this.orbImages[rand]).setVisible(false);
                this.skyfallArray[row][col].type = Object.values(OrbType)[rand];

                let slot = new OrbSlot(this.scene, x, y);
                slot.orb = this.orbArray[row][col];
                this.orbSlotArray[row][col] = slot;

                this.orbArray[row][col].currentSlot = slot;
            }
        }
    }

    solveBoard() {

        this.solveInProgress = true;

        for (let arr of this.orbArray) {
            for (let o of arr) {
                if (o != null) {
                    o.disableInteractive();
                }
            }
        }

        this.resetBoardState();
        let numCombos = this.findCombos();
        if (numCombos > 0) {
            return this.fadeCombos();
        }
        else {
            //this.scene.scene.get("BoardScene").events.emit("solveComplete");
            for (let arr of this.orbArray) {
                for (let o of arr) {
                    if (o != null) {
                        o.setInteractive();
                    }

                }
            }
            this.solveInProgress = false;
            console.log("all combos have finished");
        }
    }

    resetBoardState() {

        for (let row = 0; row < this.BOARD_HEIGHT; row++) {
            for (let col = 0; col < this.BOARD_WIDTH; col++) {

                let x = this.x + col * Orb.WIDTH;
                let y = this.y + row * Orb.HEIGHT;
                if (this.orbArray[row][col] != null) {
                    this.orbArray[row][col].isVisited = false;
                }

                if (this.skyfallArray[row][col] == null) {
                    let rand = Phaser.Math.Between(0, 5);
                    this.skyfallArray[row][col] = new Orb(this.scene, x, y - this.BOARD_HEIGHT * Orb.HEIGHT, row, col, this.orbImages[rand]).setVisible(false);
                    this.skyfallArray[row][col].type = Object.values(OrbType)[rand];
                }
            }
        }
    }

    fadeCombos() {

        this.scene.time.addEvent({
            delay: 500,
            callback: this.fadeCombosEvent,
            callbackScope: this,
            repeat: this.comboList.length,
        });

    }

    fadeCombosEvent() {

        if (this.comboList.length == 0) {
            return (document.getElementById("skyfall").checked) ? this.skyfall() : this.simulateGravity();
        }
        //this.scene.sound.play("orbCombo");
        let set = this.comboList.pop();
        let arr = Array.from(set);
        this.scene.tweens.add({
            targets: arr,
            alpha: 0,
            ease: 'Sine.InOut',
            duration: 450,
            onComplete: () => {
                //this.scene.events.emit("comboMatched", arr[1].type, set.size, { x: arr[1].startPos.x, y: arr[1].startPos.y });
                for (let orb of set) {
                    this.orbArray[orb.row][orb.col] = null;
                    this.orbSlotArray[orb.row][orb.col].orb = null;
                    orb.destroyOrb();
                }
            }
        });

    }

    findCombos() {

        for (let arr of this.orbArray) {
            for (let orb of arr) {
                let comboSet = new Set();
                if (orb != null && !orb.isVisited) {
                    orb.isVisited = true;
                    this.floodfill(orb.row, orb.col, orb.type, comboSet);
                }
                if (comboSet.size > 2) {
                    this.comboList.push(comboSet);
                }
            }
        }
        return this.comboList.length;
    }

    floodfill(row, col, type, comboSet) {

        let adj_arr = [];
        let matches = [[], []]; //horizontal and vertical matches

        for (let i = 0; i < 4; i++) {
            let x = (i - 1) % 2;     // -1 0 1 0
            let y = (3 - i - 1) % 2; // 0 1 0 -1
            if (this.isInBounds(row + x, col + y) && this.orbArray[row + x][col + y] != null) {
                let adj = this.orbArray[row + x][col + y];
                if (adj.type == type) {
                    (x == 0) ? matches[0].push(adj) : matches[1].push(adj);
                    if (!adj.isVisited) {
                        adj_arr.push(adj);
                    }
                }
            }
        }
        for (let orb of adj_arr) {
            orb.isVisited = true;
            this.floodfill(orb.row, orb.col, type, comboSet);
        }
        for (let arr of matches) {
            if (arr.length == 2) {
                comboSet.add(this.orbArray[row][col]);
                for (let orb of arr) {
                    comboSet.add(orb);
                }
            }
        }
    }


    simulateGravity() {

        let dropDist = 0;
        for (let col = 0; col < this.BOARD_WIDTH; col++) {
            for (let row = this.BOARD_HEIGHT - 1; row > -1; row--) {

                let current = this.orbArray[row][col];
                if (current == null) {
                    dropDist++;
                    continue;
                }
                this.scene.tweens.add({
                    targets: current,
                    y: current.y + dropDist * Orb.HEIGHT,
                    duration: 500,
                    ease: Phaser.Math.Easing.Linear,
                });

                this.orbArray[row][col] = null;
                this.orbSlotArray[row][col].orb = null;

                current.row += dropDist;
                current.startPos.set(current.x, current.y + dropDist * Orb.HEIGHT);

                this.orbSlotArray[current.row][col].orb = current; // point slot to new orb
                current.currentSlot = this.orbSlotArray[current.row][col]; //point orb to correct orb slot
                [current, this.orbArray[row + dropDist][col]] = [this.orbArray[row + dropDist][col], current]; // setting new array location of orb

            }
            dropDist = 0;
        }
        this.solveBoard();
    }



    skyfall() {

        let dropDist = 0;
        for (let col = 0; col < this.BOARD_WIDTH; col++) {
            for (let row = this.BOARD_HEIGHT - 1; row > -1; row--) {
                let current = this.orbArray[row][col];
                if (current == null) {
                    dropDist++;
                    continue;
                }
                this.scene.tweens.add({
                    targets: current,
                    y: current.y + dropDist * Orb.HEIGHT,
                    duration: 500,
                    ease: Phaser.Math.Easing.Linear,
                });

                current.row += dropDist;
                current.startPos.set(current.x, current.y + dropDist * Orb.HEIGHT);

                this.orbSlotArray[current.row][col].orb = current; // point slot to new orb
                current.currentSlot = this.orbSlotArray[current.row][col]; //point orb to correct orb slot
                [current, this.orbArray[row + dropDist][col]] = [this.orbArray[row + dropDist][col], current]; // setting new array location of orb

            }
            //skyfalling new orbs 

            for (let r = this.BOARD_HEIGHT - 1; r > this.BOARD_HEIGHT - dropDist - 1; r--) {

                let current = this.skyfallArray[r][col];
                let newRow = r - this.BOARD_HEIGHT + dropDist;
                current.setVisible(true);

                this.scene.tweens.add({
                    targets: current,
                    y: this.y + newRow * Orb.HEIGHT,
                    duration: 500,
                    ease: Phaser.Math.Easing.Linear
                });

                current.row = newRow;
                current.startPos.set(current.x, this.y + newRow * Orb.HEIGHT);

                this.orbSlotArray[newRow][col].orb = current;
                current.currentSlot = this.orbSlotArray[newRow][col];
                this.orbArray[newRow][col] = current;

                this.skyfallArray[r][col] = null;
            }
            dropDist = 0;
        }
        this.solveBoard();
    }


    isInBounds(row, col) {
        return (row > -1 && row < this.BOARD_HEIGHT && col > -1 && col < this.BOARD_WIDTH);
    }

    setBoard(arr) {

        for (let row = 0; row < this.BOARD_HEIGHT; row++) {
            for (let col = 0; col < this.BOARD_WIDTH; col++) {
                let o = this.orbArray[row][col];
                if (o != null) {
                    o.changeType(arr[row][col]);
                    continue;
                }
                let s = this.orbSlotArray[row][col];
                this.orbArray[row][col] = new Orb(this.scene, s.x, s.y, row, col, this.orbImages[arr[row][col]]);
                this.orbArray[row][col].type = Object.values(OrbType)[arr[row][col]];
                this.orbArray[row][col].currentSlot = s;
                s.orb = this.orbArray[row][col];


            }
        }
    }


    getNumericModel() {

        let model = new Array(this.BOARD_HEIGHT);

        for (let row = 0; row < this.BOARD_HEIGHT; row++) {
            model[row] = new Array(this.BOARD_WIDTH);
            for (let col = 0; col < this.BOARD_WIDTH; col++) {
                let o = this.orbArray[row][col];
                model[row][col] = Number(o.type.description);
            }
        }

        return model;

    }

    destoryBoard() {

        for (let row = 0; row < this.BOARD_HEIGHT; row++) {
            for (let col = 0; col < this.BOARD_WIDTH; col++) {
                let o = this.orbArray[row][col];
                let o2 = this.skyfallArray[row][col];
                if (o2 != null) {
                    o2.destroyOrb();
                }
                if (o != null) {
                    o.destroyOrb();
                }
                this.orbSlotArray[row][col].destroy();
            }
        }
        this.scene.events.off("swapOrbs");
        this.scene.events.off("solveBoard");
        this.destroy();

    }


    cloneOrbArray() {

        const clone = [];
        let arr = this.getNumericModel();
        for (let i = 0; i < arr.length; i++) {
            clone[i] = arr[i].slice();
        }
        return clone;
    }

}
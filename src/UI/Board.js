
const typeTextureMap = new Map(
    [[0, "fire"], [1, "water"], [2, "wood"],
    [3, "light"], [4, "dark"], [5, "heart"]]
);


class Board extends Phaser.GameObjects.GameObject {

    constructor(scene, x, y) {
        super(scene);

        this.orbImages = ["fire", "water", "wood", "light", "dark", "heart"];

        this.solveInProgress = false;

        this.prevBoard = null;

        this.x = x;
        this.y = y;
        this.BOARD_HEIGHT = 5;
        this.BOARD_WIDTH = 6;

        this.orbArray = new Array(this.BOARD_HEIGHT);
        this.skyfallArray = new Array(this.BOARD_HEIGHT);
        this.orbSlotArray = new Array(this.BOARD_HEIGHT);

        this.comboList = [];
        this.generateBoard();

        this.scene.events.on("solveBoard", () => {
            this.solveBoard();
        });

    }

    swapOrbs(r1, c1, r2, c2) {
        [this.orbArray[r1][c1], this.orbArray[r2][c2]] = [this.orbArray[r2][c2], this.orbArray[r1][c1]];
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

                this.orbArray[row][col] = new Orb(this.scene, x, y, this.orbImages[rand]);
                this.orbArray[row][col].type = rand;

                rand = Phaser.Math.Between(0, 5);

                this.skyfallArray[row][col] = new Orb(this.scene, x, y - this.BOARD_HEIGHT * Orb.HEIGHT, this.orbImages[rand]).setVisible(false);
                this.skyfallArray[row][col].type = rand;

                let slot = new OrbSlot(this.scene, x, y, row, col);
                slot.orb = this.orbArray[row][col];
                this.orbSlotArray[row][col] = slot;

                this.orbArray[row][col].slot = slot;
            }
        }
    }

    solveBoard() {

        this.solveInProgress = true;
        //this.setOrbInteractive(false);

        this.resetBoardState();
        let numCombos = this.findCombos();
        if (numCombos > 0) {
            return this.fadeCombos();
        }
        else {
            if (!this.orbArray.flat().some(item => item === null)) {
                this.setOrbInteractive(true);
            }
            this.solveInProgress = false;
            //this.scene.events.emit("message log", "Solve finished");
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
                    this.skyfallArray[row][col] = new Orb(this.scene, x, y - this.BOARD_HEIGHT * Orb.HEIGHT, this.orbImages[rand]).setVisible(false);
                    this.skyfallArray[row][col].type = rand;
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
            return (document.getElementById("skyfall-toggle").classList.contains("button-activate")) ? this.skyfall() : this.simulateGravity();
        }
        let set = this.comboList.pop();
        let arr = Array.from(set, obj => obj.orb);
        this.scene.tweens.add({
            targets: arr,
            alpha: 0,
            ease: 'Sine.InOut',
            duration: 450,
            onComplete: () => {
                for (let orb of set) {
                    this.orbArray[orb.row][orb.col] = null;
                    this.orbSlotArray[orb.row][orb.col].orb = null;
                    orb.orb.destroyOrb();
                }
            }
        });

    }

    findCombos() {

        for (let row = 0; row < 5; row++) {
            for (let col = 0; col < 6; col++) {
                let o = this.orbArray[row][col];
                let comboSet = new Set();
                if (o != null && !o.isVisited) {
                    o.isVisited = true;
                    this.floodfill(row, col, o.type, comboSet);
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
                    (x == 0) ? matches[0].push({ orb: adj, row: row + x, col: col + y }) : matches[1].push({ orb: adj, row: row + x, col: col + y });
                    if (!adj.isVisited) {
                        adj_arr.push({ orb: adj, row: row + x, col: col + y });
                    }
                }
            }
        }
        for (let o of adj_arr) {
            o.orb.isVisited = true;
            this.floodfill(o.row, o.col, o.orb.type, comboSet);
        }
        for (let arr of matches) {
            if (arr.length == 2) {
                comboSet.add({ orb: this.orbArray[row][col], row: row, col: col });
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

                this.orbSlotArray[row + dropDist][col].orb = current; // point slot to new orb
                current.slot = this.orbSlotArray[row + dropDist][col]; //point orb to correct orb slot
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

                this.orbArray[row][col] = null;
                this.orbSlotArray[row][col].orb = null;

                this.orbSlotArray[row + dropDist][col].orb = current; // point slot to new orb
                current.slot = this.orbSlotArray[row + dropDist][col]; //point orb to correct orb slot
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

                this.orbSlotArray[newRow][col].orb = current;
                current.slot = this.orbSlotArray[newRow][col];
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
                this.orbArray[row][col] = new Orb(this.scene, s.x, s.y, this.orbImages[arr[row][col]]);
                this.orbArray[row][col].type = arr[row][col];
                this.orbArray[row][col].slot = s;
                s.orb = this.orbArray[row][col];

            }
        }
    }

    getNumericModel() {
        return this.orbArray.map((arr) => arr.map((orb) => orb.type));
    }

    changeOrbs(from, to) {
        this.orbArray.forEach((arr) => arr.forEach((orb) => { if (from.includes(orb.type)) orb.changeType(to) }));
    }

    setOrbInteractive(isInteractive) {

        let func = (isInteractive) ? (o) => { o.setInteractive() } : (o) => { o.disableInteractive() };
        for (let arr of this.orbArray) {
            for (let o of arr) {
                if (o) func(o);
            }
        }
    }
}
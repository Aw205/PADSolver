
class Board extends Phaser.GameObjects.GameObject {

    constructor(scene, x, y) {
        super(scene);

        this.solveInProgress = false;
        this.prevBoard = null;

        this.x = x;
        this.y = y;
        this.BOARD_HEIGHT = 5;
        this.BOARD_WIDTH = 6;

        this.orbArray = new Array(30);
        this.skyfallArray = new Array(30);
        this.orbSlotArray = new Array(30);

        this.visited = 0;

        this.comboList = [];
        this.generateBoard();

        this.scene.events.on("solveBoard", () => {
            this.solveBoard();
        });

    }

    swapOrbs(i, j) {
        [this.orbArray[i], this.orbArray[j]] = [this.orbArray[j], this.orbArray[i]];
    }

    generateBoard() {

        for (let i = 0; i < 30; i++) {

            let rand = Phaser.Math.Between(0, 5);
            let x = this.x + i % 6 * Orb.WIDTH;
            let y = this.y + Math.floor(i / 6) * Orb.HEIGHT;

            this.orbArray[i] = new Orb(this.scene, x, y, ORB_TYPE_TO_TEXTURE_KEY[rand]);
            this.orbArray[i].type = rand;

            rand = Phaser.Math.Between(0, 5);

            this.skyfallArray[i] = new Orb(this.scene, x, y - this.BOARD_HEIGHT * Orb.HEIGHT, ORB_TYPE_TO_TEXTURE_KEY[rand]).setVisible(false);
            this.skyfallArray[i].type = rand;

            let slot = new OrbSlot(this.scene, x, y, i);
            slot.orb = this.orbArray[i];
            this.orbSlotArray[i] = slot;

            this.orbArray[i].slot = slot;
        }
    }

    solveBoard() {

        this.solveInProgress = true;

        this.resetBoardState();
        let numCombos = this.findCombos();
        if (numCombos > 0) {
            return this.fadeCombos();
        }
        else {
            if (!this.orbArray.some(item => item === null)) {
                this.setOrbInteractive(true);
            }
            this.solveInProgress = false;
        }
    }

    resetBoardState() {

        this.visited = 0;
        for (let i = 0; i < 30; i++) {
            if (this.skyfallArray[i] == null) {

                let x = this.x + Math.floor(i % 6) * Orb.WIDTH;
                let y = this.y + Math.floor(i / 6) * Orb.HEIGHT;

                let rand = Phaser.Math.Between(0, 5);
                this.skyfallArray[i] = new Orb(this.scene, x, y - this.BOARD_HEIGHT * Orb.HEIGHT, ORB_TYPE_TO_TEXTURE_KEY[rand]).setVisible(false);
                this.skyfallArray[i].type = rand;
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
        let orbs = Array.from(set, i => this.orbArray[i]);

        this.scene.tweens.add({
            targets: orbs,
            alpha: 0,
            ease: 'Sine.InOut',
            duration: 450,
            onComplete: () => {
                for (let idx of set) {
                    this.orbArray[idx].destroyOrb();
                    this.orbArray[idx] = null;
                    this.orbSlotArray[idx].orb = null;
                }
            }
        });

    }

    findCombos() {

        for (let i = 0; i < 30; i++) {
            let o = this.orbArray[i];
            let comboSet = new Set();
            if (o != null && ((this.visited & (1 << i)) == 0)) {
                this.visited |= 1 << i;
                this.floodfill(i, o.type, comboSet);
            }
            if (comboSet.size > 2) {
                this.comboList.push(comboSet);
            }
        }
        return this.comboList.length;
    }

    floodfill(index, type, comboSet) {

        let adj = [];
        let matches = [[], []];

        for (let m of BoardModel.orbMoves[index]) {
            let o = this.orbArray[m];
            if (o != null && o.type == type) {
                (Math.abs(m - index) == 1) ? matches[0].push(m) : matches[1].push(m);
                if ((this.visited & (1 << m)) == 0) {
                    adj.push(m);
                }
            }
        }

        for (let pos of adj) {
            this.visited |= 1 << pos;
            this.floodfill(pos, type, comboSet);
        }

        for (let m of matches) {
            if (m.length == 2) {
                comboSet.add(index).add(m[0]).add(m[1]);
            }
        }
    }

    simulateGravity() {


        let dropDist = 0;
        for (let col = 24; col < 30; col++) {
            for (let i = col; i > -1; i -= 6) {

                let current = this.orbArray[i];
                if (current == null) {
                    dropDist += 6;
                    continue;
                }
                this.scene.tweens.add({
                    targets: current,
                    y: current.y + (dropDist / 6) * Orb.HEIGHT,
                    duration: 500,
                    ease: Phaser.Math.Easing.Linear,
                });

                this.orbArray[i] = null;
                this.orbSlotArray[i].orb = null;

                this.orbSlotArray[i + dropDist].orb = current; // point slot to new orb
                current.slot = this.orbSlotArray[i + dropDist]; //point orb to correct orb slot
                [current, this.orbArray[i + dropDist]] = [this.orbArray[i + dropDist], current]; // setting new array location of orb

            }
            dropDist = 0;
        }

        this.solveBoard();
    }


    skyfall() {

        let dropDist = 0;
        for (let col = 24; col < 30; col++) {

            for (let i = col; i > -1; i -= 6) {

                let current = this.orbArray[i];
                if (current == null) {
                    dropDist += 6;
                    continue;
                }
                this.scene.tweens.add({
                    targets: current,
                    y: current.y + (dropDist / 6) * Orb.HEIGHT,
                    duration: 500,
                    ease: Phaser.Math.Easing.Linear,
                });

                this.orbArray[i] = null;
                this.orbSlotArray[i].orb = null;

                this.orbSlotArray[i + dropDist].orb = current; // point slot to new orb
                current.slot = this.orbSlotArray[i + dropDist]; //point orb to correct orb slot
                [current, this.orbArray[i + dropDist]] = [this.orbArray[i + dropDist], current]; // setting new array location of orb

            }

            //skyfalling new orbs 

            for (let r = col; r > col - dropDist; r -= 6) {

                let current = this.skyfallArray[r];
                let newPos = ((dropDist - 6) - 6 * (4 - Math.floor(r / 6))) + r % 6;

                current.setVisible(true);

                this.scene.tweens.add({
                    targets: current,
                    y: current.y + (dropDist / 6) * Orb.HEIGHT,
                    duration: 500,
                    ease: Phaser.Math.Easing.Linear
                });

                this.orbSlotArray[newPos].orb = current;
                current.slot = this.orbSlotArray[newPos];
                this.orbArray[newPos] = current;
                this.skyfallArray[r] = null;
            }
            dropDist = 0;
        }
        this.solveBoard();
    }

    setBoard(arr) {

        for (let i = 0; i < 30; i++) {

            let o = this.orbArray[i];
            if (o != null) {
                o.setType(arr[i]);
                continue;
            }
            let s = this.orbSlotArray[i];
            this.orbArray[i] = new Orb(this.scene, s.x, s.y, ORB_TYPE_TO_TEXTURE_KEY[arr[i]]);
            this.orbArray[i].type = arr[i];
            this.orbArray[i].slot = s;
            s.orb = this.orbArray[i];

        }
    }

    getNumericModel() {
        return this.orbArray.map(orb => orb.type);
    }

    get2DNumericModel() {
        return this.orbArray.map((arr) => arr.map((orb) => orb.type));
    }

    changeOrbs(from, to) {
        this.orbArray.forEach((o) => {
            if (from.includes(o.type)) {
                o.setType(to);
            }
        });
    }

    setOrbInteractive(isInteractive) {

        let func = (isInteractive) ? (o) => { o.setInteractive() } : (o) => { o.disableInteractive() };
        for (let o of this.orbArray) {
            if (o) func(o);
        }
    }
}
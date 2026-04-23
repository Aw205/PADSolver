import BoardModel from "../solver/BoardModel.js";
import { GameObjects,Math as PhaserMath } from "phaser";
import { Orb,ORB_HEIGHT } from "./Orb.js";
import OrbSlot from "./OrbSlot.js";

export default class Board extends GameObjects.GameObject {

    constructor(scene, x, y) {
        super(scene);

        window.board = this;

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
        this.path = [];

        this.comboList = [];
        this.generateBoard();

        this.scene.events.on("solveBoard", () => {

            let model = new BoardModel(this.getNumericModel(),[]);
            let res = model.calcCombos();
            document.getElementById("combo-count").textContent = res.comboList.length;

            let count = 0;
            for (let combo of res.comboList) {
                count += combo.number;
            }
            let dirChanges = 0;
            let prevDiff = 0;
            for (let i = 1; i < this.path.length; i++) {
                let diff = this.path[i] - this.path[i-1];
                if (diff != prevDiff) {
                    dirChanges++;
                    prevDiff = diff;
                }
            }

            document.querySelector(".manual-solve-timestamp").textContent = "Board - " + new Date().toLocaleTimeString("en-US")

            document.getElementById("orb-clear-count").textContent = count + "/30";
            document.getElementById("path-length-count").textContent = this.path.length;
            document.getElementById("direction-change-count").textContent = dirChanges;
            this.path = [];

            this.setOrbInteractive(false);
            this.solveBoard();
        });

    }

    swapOrbs(i, j) {
        this.path.push(i);
        [this.orbArray[i], this.orbArray[j]] = [this.orbArray[j], this.orbArray[i]];
    }

    generateBoard() {

        let res = this.decode();

        for (let i = 0; i < 30; i++) {

            let rand = PhaserMath.Between(0, 5);
            if (res != null) {
                rand = res[i];
            }
            let x = this.x + i % 6 * ORB_HEIGHT;
            let y = this.y + Math.floor(i / 6) * ORB_HEIGHT;

            this.orbArray[i] = new Orb(this.scene, x, y, rand);
            this.orbArray[i].type = rand;

            rand = PhaserMath.Between(0, 5);
            this.skyfallArray[i] = new Orb(this.scene, x, y - this.BOARD_HEIGHT * ORB_HEIGHT, rand).setVisible(false);
            this.skyfallArray[i].type = rand;

            let slot = new OrbSlot(this.scene, x, y, i);
            slot.orb = this.orbArray[i];
            this.orbSlotArray[i] = slot;

            this.orbArray[i].slot = slot;
        }

    }

    getBoardUrl() {

        const board = this.getNumericModel().join("");
        let num = 0n;
        for (let digit of board) {
            num = num * 6n + BigInt(digit);
        }
        let param = this.encodeBase62(num);
        let url = new URL(window.location.href);
        url.searchParams.set("board", param)
        return url.href;

    }

    decode() {

        const url = new URLSearchParams(window.location.search);
        let param = url.get("board");
        if (param == null) {
            return null;
        }
        let s = this.decodeBase62(param);
        let result = [];
        let temp = s;
        for (let i = 0; i < 30; i++) {
            result.unshift(Number(temp % 6n));
            temp = temp / 6n;
        }
        return result;

    }

    encode() {

        let s = this.getNumericModel().join("");
        let base = 0n;
        for (let digit of s) {
            base = base * 6n + BigInt(digit);
        }
        base = this.encodeBase62(base);
    }

    encodeBase62(num) {
        const ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        if (num === 0n) return '0';
        let result = '';
        while (num > 0n) {
            result = ALPHABET[Number(num % 62n)] + result;
            num = num / 62n;
        }
        return result;
    }

    decodeBase62(str) {
        const ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let result = 0n;
        for (let char of str) {
            result = result * 62n + BigInt(ALPHABET.indexOf(char));
        }
        return result;
    }

    solveBoard() {

        this.solveInProgress = true;

        this.resetBoardState();
        let list = this.findCombos();
        // let numCombos = this.findCombos();
        let numCombos = list.length;
        if (numCombos > 0) {
            return this.fadeCombos();
        }
        else {
            if (!this.orbArray.some(item => item === null)) {
                this.setOrbInteractive(true);
            }
            
            this.scene.resumeRoulettes();
            this.solveInProgress = false;
        }
    }

    resetBoardState() {

        this.visited = 0;
        for (let i = 0; i < 30; i++) {
            if (this.skyfallArray[i] == null) {

                let x = this.x + Math.floor(i % 6) * ORB_HEIGHT;
                let y = this.y + Math.floor(i / 6) * ORB_HEIGHT;

                let rand = PhaserMath.Between(0, 5);
                this.skyfallArray[i] = new Orb(this.scene, x, y - this.BOARD_HEIGHT * ORB_HEIGHT,rand).setVisible(false);
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
            let BB = { val: 0 };
            if (o != null && ((this.visited & (1 << i)) == 0)) {
                this.visited |= 1 << i;
                this.floodfill(i, o.type, comboSet, BB);
            }
            if (comboSet.size > 2) {
                this.comboList.push(comboSet);
            }
        }
        return this.comboList;
    }

    floodfill(index, type, comboSet, BB) {

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
            this.floodfill(pos, type, comboSet, BB);
        }

        for (let m of matches) {
            if (m.length == 2) {

                BB.val = BB.val | (1 << index) | (1 << m[0]) | (1 << m[1])
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
                    y: current.y + (dropDist / 6) * ORB_HEIGHT,
                    duration: 500,
                    ease: PhaserMath.Easing.Linear,
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


     /**
     * Skyfalls new orbs 
     */
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
                    y: current.y + (dropDist / 6) * ORB_HEIGHT,
                    duration: 500,
                    ease: PhaserMath.Easing.Linear,
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
                    y: current.y + (dropDist / 6) * ORB_HEIGHT,
                    duration: 500,
                    ease: PhaserMath.Easing.Linear
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

     /**
     * 
     * @param {int[]} arr
     */
    setBoard(arr) {

        for (let i = 0; i < 30; i++) {

            let o = this.orbArray[i];
            if (o != null) {
                o.setType(arr[i],true);
                continue;
            }
            let s = this.orbSlotArray[i];
            this.orbArray[i] = new Orb(this.scene, s.x, s.y, arr[i]);
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

    /**
     * 
     * @param {int[]} from
     * @param {int} to
     */
    changeOrbs(from, to) {
        this.orbArray.forEach((o) => {
            if (from.includes(o.type)) {
                o.setType(to,true);
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
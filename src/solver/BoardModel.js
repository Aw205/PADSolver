export default class BoardModel {

    static orbMoves = [];
    //x-x-x 0 1 2
    //x-x-x 3 4 5
    static {
        for (let i = 0; i < 30; i++) {
            let legalMoves = [];
            let possibleMoves = [i + 1, i - 1, i + 6, i - 6];
            for (let move of possibleMoves) {
                if (move > -1 && move < 30) {
                    if (Math.abs(move - i) == 1) {
                        if (Math.floor(move / 6) == Math.floor(i / 6)) {
                            legalMoves.push(move);
                        }
                        continue;
                    }
                    legalMoves.push(move);
                }
            }
            this.orbMoves.push(legalMoves);
        }
    }

    /**
     * @param {int[]} board 
     */
    constructor(board, configs) {

        this.orbs = board;
        this.hash = 0;
        //this.hash = this.getHash();
        this.zobristOrbNums = new Array(10); //[Type][Index]
        this.zobristPointerNums = new Array(30);
        for (let type = 0; type < 10; type++) {
            this.zobristOrbNums[type] = new Array(30);
            for (let i = 0; i < 30; i++) {
                this.zobristOrbNums[type][i] = Math.floor(Math.random() * (Number.MAX_SAFE_INTEGER + 1));
                this.zobristPointerNums[i] = Math.floor(Math.random() * (Number.MAX_SAFE_INTEGER + 1));
            }
        }
        this.visited = 0;
        this.configs = configs;
    }

    calcCombos() {
        let clone = [...this.orbs];

        let comboList = [];
        let currentCombos = -1;

        while (currentCombos != 0) {
            this.visited = 0;
            let newCombos = this.findCombos(clone);
            currentCombos = newCombos.length;
            comboList = comboList.concat(newCombos);
            this.simulateGravity(clone, currentCombos);
        }
        return { comboList: comboList, score: this.getStaticEvaluation(comboList) };
    }

    /**
     * 
     * @param {*} arr array of integers representing board
     * @returns list of combos
     */
    findCombos(arr) {

        let returnList = [];

        for (let i = 0; i < 30; i++) {
            let type = arr[i];
            let comboSet = new Set();
            let BB = { val: 0 };
            if (type != -1 && ((this.visited & (1 << i)) == 0)) {
                this.visited |= 1 << i;
                this.floodfill(arr, i, type, comboSet, BB);
            }
            for (let pos of comboSet) {
                arr[pos] = -1;
            }
            if (comboSet.size > 2) {
                let comboInfo = { color: type, number: comboSet.size, shape: BB.val };
                returnList.push(comboInfo);
            }
        }
        return returnList;
    }

    floodfill(arr, index, type, comboSet, BB) {

        let adj = [];
        let matches = [[], []]; //horizontal and vertical matches

        for (let m of BoardModel.orbMoves[index]) {
            if (arr[m] == type) {
                (Math.abs(m - index) == 1) ? matches[0].push(m) : matches[1].push(m);
                if ((this.visited & (1 << m)) == 0) {
                    adj.push(m);
                }
            }
        }
        for (let pos of adj) {
            this.visited |= 1 << pos;
            this.floodfill(arr, pos, type, comboSet, BB);
        }
        for (let m of matches) {
            if (m.length == 2) {
                BB.val = BB.val | (1 << index) | (1 << m[0]) | (1 << m[1])
                comboSet.add(index).add(m[0]).add(m[1]);
            }
        }
    }

    simulateGravity(arr, currentCombos) {

        if (currentCombos == 0) {
            return;
        }
        let dropDist = 0;
        for (let col = 24; col < 30; col++) {
            for (let i = col; i > -1; i -= 6) {
                if (arr[i] == -1) {
                    dropDist += 6;
                    continue;
                }
                [arr[i], arr[i + dropDist]] = [arr[i + dropDist], arr[i]];
            }
            dropDist = 0;
        }
    }

    swapOrbs(currIdx, targetIdx) {
        [this.orbs[currIdx], this.orbs[targetIdx]] = [this.orbs[targetIdx], this.orbs[currIdx]];
        this.hash ^= this.zobristOrbNums[this.orbs[currIdx]][currIdx] ^ this.zobristOrbNums[this.orbs[currIdx]][currIdx] ^ this.zobristPointerNums[currIdx] ^ this.zobristPointerNums[targetIdx];
    }

    /**
     * @param {*} currentPos - position of orb currently held
     * @returns 
     */
    getHash(currentPos) {

        let hash = this.zobristPointerNums[currentPos];
        for (let i = 0; i < 30; i++) {
            let type = this.orbs[i];
            hash ^= this.zobristOrbNums[type][i];
        }
        return hash;
    }

    getStaticEvaluation(comboList) {

        let score = comboList.length * 0.1;
        for (let combo of comboList) {
            let comboShape = this.getShape(combo.shape);
            for (let config of this.configs) {
                if (config.attribute == "any" || combo.color == +config.attribute) {
                    if (config.shape == "any" || config.shape == comboShape) {
                        score += +config.value;
                        break;
                    }
                }
            }
        }
        return score;
    }


    getShape(combo) {
        if (this.isLShape(combo)) {
            return "L";
        }
        else if (this.isVDP(combo)) {
            return "VDP";
        }
        else if (this.isCross(combo)) {
            return "cross";
        }
        else if (this.isTPA(combo)) {
            return "TPA";
        }
        return "normal";
    }

    /**
   * 
   * @param {*} combo - bitboard
   */
    isLShape(combo) {
        combo = combo / (-combo & combo);
        let LBitboards = [0b111000001000001, 0b1000001000111, 0b100000100000111, 0b1110001000001];
        for (let bb of LBitboards) {
            if (combo == bb) {
                return true;
            }
        }
        return false;
    }

    /**
     * 
     * @param {*} combo - bitboard
     */
    isVDP(combo) {
        combo = combo / (-combo & combo);
        let vdpBB = 0b111000111000111;
        return combo == vdpBB;
    }

      /**
     * 
     * @param {*} combo - bitboard
     */
      isCross(combo) {
        combo = combo / (-combo & combo);
        let crossBB = 0b1000011100001;
        return combo == crossBB;
    }

    /**
    * 
    * @param {*} combo - bitboard
    */
    isTPA(combo) {
        combo = combo / (-combo & combo);
        let tpaBB = [0b1111, 0b1000001000001000001];
        for (let bb of tpaBB) {
            if (combo == bb) {
                return true;
            }
        }
        return false;
    }
}
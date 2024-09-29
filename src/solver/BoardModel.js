
class BoardModel {

    static orbMoves = [];

    constructor(board) {

        this.orbs = board;
        this.hash = 0;
        //this.hash = this.getHash();
        this.zobristOrbNums = new Array(6); //[Type][Index]
        this.zobristPointerNums = new Array(30);
        for (let type = 0; type < 6; type++) {
            this.zobristOrbNums[type] = new Array(30);
            for (let i = 0; i < 30; i++) {
                this.zobristOrbNums[type][i] = Phaser.Math.Between(0, Number.MAX_VALUE);
                this.zobristPointerNums[i] = Phaser.Math.Between(0,Number.MAX_VALUE);
            }
        }
        this.visited = 0;
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
        return comboList;
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
            if (type != -1 && ((this.visited & (1 << i)) == 0)) {
                this.visited |= 1 << i;
                this.floodfill(arr, i, type, comboSet);
            }
            for (let pos of comboSet) {
                arr[pos] = -1;
            }
            if (comboSet.size > 2) {
                let comboInfo = { color: type, number: comboSet.size };
                returnList.push(comboInfo);
            }
        }
        return returnList;
    }

    floodfill(arr, index, type, comboSet) {

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
            this.floodfill(arr, pos, type, comboSet);
        }
        for (let m of matches) {
            if (m.length == 2) {
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
            for (let i = col; i > -1; i-=6) {
                if (arr[i] == -1) {
                    dropDist+=6;
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
        for(let i = 0; i < 30; i++){
            let type = this.orbs[i];
            hash ^= this.zobristOrbNums[type][i];
        }
        return hash; 
    }

    getStaticEvaluation() {

        comboList = [];
        //orb proximity

        for (let i = 0; i < this.HEIGHT; i++) {
            for (let j = 0; j < this.WIDTH; j++) {

            }
        }
    }

    //x-x-x 0 1 2
    //x-x-x 3 4 5
    static precalculateOrbSwaps() {

        for (let i = 0; i < 30; i++) {
            let legalMoves = [];
            let possibleMoves = [i + 1, i - 1, i + 6, i - 6];
            for (let move of possibleMoves) {
                if (move > -1 && move < 30) {
                    if (Math.abs(move - i) == 1) {
                        if( Math.floor(move / 6) == Math.floor(i / 6)){
                            legalMoves.push(move);
                        }
                        continue;
                    }
                    legalMoves.push(move);
                }
            }
            BoardModel.orbMoves.push(legalMoves);
        }
    }
}
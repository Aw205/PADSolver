class BoardModel {


    constructor(board) {

        this.HEIGHT = 5;
        this.WIDTH = 6;

        this.orbs = board;
        this.comboColors = null;

        this.visited = new Array(this.HEIGHT);
        for (let i = 0; i < this.HEIGHT; i++) {
            this.visited[i] = new Array(this.WIDTH).fill(false);
        }
    }

    calcCombos() {

        let clone = this.orbs.map(row => [...row]);

        let comboList = [];
        let currentCombos = -1;

        while (currentCombos != 0) {
            this.resetVisited();
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

        for (let row = 0; row < this.HEIGHT; row++) {
            for (let col = 0; col < this.WIDTH; col++) {

                let type = arr[row][col];
                let comboSet = new Set();

                if (type != -1 && !this.visited[row][col]) {
                    this.visited[row][col] = true;
                    this.floodfill(arr, row, col, type, comboSet);
                }

                for (let pos of comboSet) {
                    arr[pos[0]][pos[1]] = -1;
                }
                if (comboSet.size > 2) {
                    let comboInfo = { color: type, number: comboSet.size };
                    returnList.push(comboInfo);
                }

            }
        }

        return returnList;
    }


    floodfill(arr, row, col, type, comboSet) {

        let adj_arr = [];
        let matches = [[], []]; //horizontal and vertical matches

        let x = [-1, 0, 1, 0];
        let y = [0, 1, 0, -1];

        for (let i = 0; i < 4; i++) {
            let adjRow = row + x[i];
            let adjCol = col + y[i];
            if (this.isInBounds(adjRow, adjCol) && arr[adjRow][adjCol] == type) {
                (x[i] == 0) ? matches[0].push([adjRow, adjCol]) : matches[1].push([adjRow, adjCol]);
                if (!this.visited[adjRow][adjCol]) {
                    adj_arr.push([adjRow, adjCol]);
                }
            }
        }
        for (let pos of adj_arr) {
            this.visited[pos[0]][pos[1]] = true;
            this.floodfill(arr, pos[0], pos[1], type, comboSet);
        }
        for (let m of matches) {
            if (m.length == 2) {
                comboSet.add([row, col]);
                comboSet.add(m[0]);
                comboSet.add(m[1]);

            }
        }
    }


    simulateGravity(arr, currentCombos) {

        if (currentCombos == 0) {
            return;
        }

        let dropDist = 0;
        for (let col = 0; col < this.WIDTH; col++) {
            for (let row = this.HEIGHT - 1; row > -1; row--) {
                let current = arr[row][col];
                if (current == -1) {
                    dropDist++;
                    continue;
                }
                [arr[row][col], arr[row + dropDist][col]] = [arr[row + dropDist][col], arr[row][col]];

            }
            dropDist = 0;
        }
    }



    isInBounds(row, col) {
        return (row > -1 && row < this.HEIGHT && col > -1 && col < this.WIDTH);
    }

    swapOrbs(currentPos, targetPos) {
        let rows = [currentPos.x, targetPos.x];
        let cols = [currentPos.y, targetPos.y];
        [this.orbs[rows[0]][cols[0]], this.orbs[rows[1]][cols[1]]] = [this.orbs[rows[1]][cols[1]], this.orbs[rows[0]][cols[0]]];
    }

    resetVisited() {

        for (let i = 0; i < this.HEIGHT; i++) {
            for (let j = 0; j < this.WIDTH; j++) {
                this.visited[i][j] = false;
            }
        }
    }


    getHash(currentPos) {

        let hash = 0;
        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 6; j++) {
                hash = (hash * 31 + this.orbs[i][j] * 37 + i * 41 + j * 43) & 0xFFFFFFFF;
            }
        }
        return (hash * 53 + currentPos.x * 59 + currentPos.y * 61) & 0xFFFFFFFF;

    }


    getStaticEvaluation() {

        comboList = [];
        //orb proximity

        for (let i = 0; i < this.HEIGHT; i++) {
            for (let j = 0; j < this.WIDTH; j++) {

            }
        }
    }

}
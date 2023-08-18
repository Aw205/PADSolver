class BoardModel {


    constructor(board) {

        this.HEIGHT = 5;
        this.WIDTH = 6;

        // this.orbs =
        //     [[0, 1, 2, 3, 4, 5],
        //     [0, 1, 1, 3, 4, 5],
        //     [0, 1, 1, 3, 4, 5],
        //     [1, 1, 1, 3, 4, 5],
        //     [1, 1, 2, 3, 4, 5]];

        this.orbs = board;

        this.visited = new Array(this.HEIGHT);
        for (let i = 0; i < this.HEIGHT; i++) {
            this.visited[i] = new Array(this.WIDTH).fill(false);
        }
    }

    calcCombos() {

        // if (this.findCombos() > 0) {
        //     return this.fadeCombos();
        // }

        return this.findCombos();
    }


    findCombos() {

        let comboList = [];

        for (let row = 0; row < this.HEIGHT; row++) {
            for (let col = 0; col < this.WIDTH; col++) {

                let type = this.orbs[row][col];
                let comboSet = new Set();

                if (type != -1 && !this.visited[row][col]) {
                    this.visited[row][col] = true;
                    this.floodfill(row, col, type, comboSet);
                }
                if (comboSet.size > 2) {
                    comboList.push(comboSet);
                }

            }
        }
        return comboList.length;
    }


    floodfill(row, col, type, comboSet) {

        let adj_arr = [];
        let matches = [[], []]; //horizontal and vertical matches

        let x = [-1, 0, 1, 0];
        let y = [0, 1, 0, -1];

        for (let i = 0; i < 4; i++) {
            let adjRow = row + x[i];
            let adjCol = col + y[i];
            if (this.isInBounds(adjRow, adjCol) && this.orbs[adjRow][adjCol] == type) {
                (x[i] == 0) ? matches[0].push([adjRow, adjCol]) : matches[1].push([adjRow, adjCol]);
                if (!this.visited[adjRow][adjCol]) {
                    adj_arr.push([adjRow, adjCol]);
                }
            }
        }
        for (let pos of adj_arr) {
            this.visited[pos[0]][pos[1]] = true;
            this.floodfill(pos[0], pos[1], type, comboSet);
        }
        for (let arr of matches) {
            if (arr.length == 2) {
                comboSet.add([row, col]);
                comboSet.add(arr[0]);
                comboSet.add(arr[1]);

            }
        }
    }

    isInBounds(row, col) {
        return (row > -1 && row < this.HEIGHT && col > -1 && col < this.WIDTH);
    }

    swapOrbs(currentPos,targetPos) {
        let rows = [currentPos.x,targetPos.x];
        let cols = [currentPos.y,targetPos.y];
        [this.orbs[rows[0]][cols[0]], this.orbs[rows[1]][cols[1]]] = [this.orbs[rows[1]][cols[1]], this.orbs[rows[0]][cols[0]]];
    }


    resetVisited(){

        for (let i = 0; i < this.HEIGHT; i++) {
            for (let j = 0; j < this.WIDTH; j++) {
              this.visited[i][j] = false;
            }
          }



    }

}
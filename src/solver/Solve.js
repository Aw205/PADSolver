
class Solve {

    constructor(board, depth, beamWidth, numIterations) {

        this.boardModel = new BoardModel(board);
        this.transpositionTable = new Map();
        this.DEPTH_LIMIT = 10;
        this.BEAM_WIDTH = 15;
        this.NUM_ITERATIONS = 8;
        this.count = 0;
        this.selectedType = -1;
    }

    /**
     * Where the solve starts. 
     * 
     * @returns {Solution} solution -- combo List, path list
     */
    beamSearch() {

        const timeStart = performance.now();

        let searchedSolutions = [];

        let successorSolutions = this.initialSearch();
        //console.log("successor solutions length: " + successorSolutions.length);

        for (let i = 0; i < this.NUM_ITERATIONS; i++) {

            successorSolutions.sort((a, b) => {
                if (a.comboList.length == b.comboList.length) {
                    return a.path.length - b.path.length;
                }
                return b.comboList.length - a.comboList.length;
            });

            // successorSolutions.forEach((e) =>{
            //     console.log("combos: " + e.comboList.length + " path length: " + e.path.length);
            // });
            // console.log("------------------------------------");

            //successorSolutions = successorSolutions.slice(0, this.BEAM_WIDTH);

            //need to remove solutions that we searched through already

            for (let j = 0; j < this.BEAM_WIDTH; j++) {

                let sol = successorSolutions.shift();
                let path = sol.path;
                searchedSolutions.push(sol);

                if (path.length < 2) {
                    continue;
                }
                this.updateBoard(path);

                let currentPos = new Phaser.Math.Vector2(path[path.length - 1].x, path[path.length - 1].y);
                let prevPos = new Phaser.Math.Vector2(path[path.length - 2].x, path[path.length - 2].y);
                let comboList = this.boardModel.calcCombos();

                this.selectedType = this.boardModel.orbs[currentPos.x][currentPos.y];

                let solutions = this.search(this.boardModel, prevPos, currentPos, comboList, 0);

                this.updateBoard(path.toReversed());

                for (let s of solutions) {
                    s.path = [...path, ...s.path];
                }

                successorSolutions.push(...solutions);
            }
        }

        searchedSolutions.push(...successorSolutions);
        searchedSolutions.sort((a, b) => {
            if (a.comboList.length == b.comboList.length) {
                return a.path.length - b.path.length;
            }
            return b.comboList.length - a.comboList.length;
        });

        let bestSolution = searchedSolutions[0];

        console.log("searched solutions best: combos: " + bestSolution.comboList.length + "path: " + bestSolution.path.length );

         //bestSolution = successorSolutions[0];

        // let bestSolution = successorSolutions.reduce((max, current) => {
        //     if (current[0] == max[0]) {
        //         return current[1].length < max[1].length ? current : max;
        //     }
        //     return current[0] > max[0] ? current : max;
        // });

        const timeEnd = performance.now();
        const timeElapsed = timeEnd - timeStart;

        console.log("Total search time: " + timeElapsed);

        return { solution: bestSolution, solutionList: searchedSolutions };

    }

    /**
     * Starts a search from every position on the board.
     * 
     * @returns The results obtained at each position.
     */
    initialSearch() {

        let results = [];
        let comboList = this.boardModel.calcCombos();

        for (let row = 0; row < 5; row++) {
            for (let col = 0; col < 6; col++) {

                let currentPos = new Phaser.Math.Vector2(row, col);
                let prevPos = new Phaser.Math.Vector2(row, col);
                this.selectedType = this.boardModel.orbs[row][col];
                let res = this.search(this.boardModel, prevPos, currentPos, comboList, 0);
                for (let r of res) {
                    r.path.unshift(currentPos);
                }
                results.push(...res);
            }
        }

        return results;
    }


    // return value is solution in the form [combo count, [path]]
    search(board, prevPos, currentPos, comboList, depth) {

        this.count++;

        let hash = board.getHash(currentPos);
        let hashRes = this.transpositionTable.get(hash);

        if (hashRes != undefined && depth < hashRes) {
            this.transpositionTable.set(hash, depth);
        }
        else if (hashRes != undefined) {
            if (depth == 0) {
                return [new Solution([], [])];
            }
            return new Solution([], []);
        }
        if (this.selectedType != board.orbs[prevPos.x][prevPos.y]) {

            let newComboList = board.calcCombos();  
            if (newComboList.length < comboList.length - 2) {
                return new Solution(newComboList, [currentPos]);
            }
            comboList = newComboList;
        }

        if (comboList.length == 0 && depth > 2) {
            return new Solution([], [currentPos]);
        }

        if (depth == this.DEPTH_LIMIT) {
            return new Solution(comboList, [currentPos]);
        }

        let moves = [];

        for (let m of this.getValidMoves(prevPos, currentPos)) {

            board.swapOrbs(currentPos, m);
            moves.push(this.search(board, currentPos, m, comboList, depth + 1));
            board.swapOrbs(currentPos, m);
        }

        if (depth == 0) {
            
            // if none of the moves are better than current solution then return nothing
            return moves; //successors for beam
        }

        let bestMove = moves.reduce((max, current) => {
            if (current.comboList.length == max.comboList.length) {
                return current.path.length < max.path.length ? current : max;
            }
            return current.comboList.length > max.comboList.length ? current : max;
        });

        if (bestMove.comboList.length <= comboList.length) {
            this.transpositionTable.set(hash, depth);
            return new Solution(comboList, [currentPos]);
        }

        let path = [currentPos, ...bestMove.path];
        this.transpositionTable.set(hash, depth);

        return new Solution(bestMove.comboList, path);
    }

    getValidMoves(prevPos, currentPos) {


        let moves = [];
        let x = [-1, 0, 1, 0]; // -1,0 0,1 1,0 0,-1
        let y = [0, 1, 0, -1];

        for (let i = 0; i < 4; i++) {

            let adjRow = currentPos.x + x[i];
            let adjCol = currentPos.y + y[i];
            let newMove = new Phaser.Math.Vector2(adjRow, adjCol);

            if (this.isInBounds(adjRow, adjCol) && !newMove.equals(prevPos)) {
                moves.push(newMove);
            }
        }
        return moves;
    }

    isInBounds(row, col) {
        return (row > -1 && row < 5 && col > -1 && col < 6);
    }

    updateBoard(path) {
        for (let i = 0; i < path.length - 1; i++) {
            this.boardModel.swapOrbs(path[i], path[i + 1]);
        }
    }


    test() {
        //generate random boards
        // solve and collect stats on random boards

        let combos = 0;
        let iters= 1;


        for (let i = 0; i < iters; i++) {

            const arr = [];
            for (let i = 0; i < 5; i++) {
                arr[i] = [];
                for (let j = 0; j < 6; j++) {
                    arr[i][j] = Phaser.Math.Between(0, 5);
                }
            }

            this.boardModel.orbs = arr;
            let res = this.beamSearch();
            let num = res.solution.comboList.length
            combos+= num;

            console.log("combos: " + num +" path length: " + res.solution.path.length);
        }

        console.log("Average combos: " + combos/iters);

    }

}

class Solution {

    /**
     * @param {*} comboList 
     * @param {*} path 
     */

    constructor(comboList, path) {

        this.comboList = comboList;
        this.path = path;
    }

}



import BoardModel from "./BoardModel.js";
export class Solve {

    constructor(board,configs,startPositions) {

        this.boardModel = new BoardModel(board,configs);

        this.startPositions = startPositions;

        this.transpositionTable = new Map();
        this.DEPTH_LIMIT = 10;
        this.BEAM_WIDTH = 15;
        this.NUM_ITERATIONS = 8;
        this.count = 0;
        this.selectedType = -1;

    }

    /**
     * Where the solve starts. 
     * @returns {Solution} bestSolution: {combo List ,path} solutionList
     */
    beamSearch() {

        const timeStart = performance.now();

        let searchedSolutions = [];
        let successorSolutions = this.initialSearch();

        for (let i = 0; i < this.NUM_ITERATIONS; i++) {

            successorSolutions.sort((a, b) => {
                if (a.score == b.score) {
                    return a.path.length - b.path.length;
                }
                return b.score - a.score;
            });

            for (let j = 0; j < this.BEAM_WIDTH; j++) {

                let sol = successorSolutions.shift();
                let path = sol.path;
                searchedSolutions.push(sol);

                if (path.length < 2) {
                    continue;
                }

                this.updateBoard(path);

                let currentPos = path[path.length - 1];
                let prevPos = path[path.length - 2];
                this.selectedType = this.boardModel.orbs[currentPos];
                let boardData = this.boardModel.calcCombos();


                let solutions = this.search(this.boardModel, prevPos, currentPos, boardData, 0);

                this.updateBoard(path.toReversed());

                for (let s of solutions) {
                    s.path = [...path, ...s.path];
                }
                successorSolutions.push(...solutions);
            }
        }

        searchedSolutions = searchedSolutions.concat(successorSolutions);
        searchedSolutions.sort((a, b) => {
            if (a.score == b.score) {
                return a.path.length - b.path.length;
            }
            return b.score - a.score;
        });

        let bestSolution = searchedSolutions[0];
        return { solution: bestSolution, solutionList: searchedSolutions };

    }

    /**
     * Starts a search from every position on the board.
     * @returns The results obtained at each position.
     */
    initialSearch() {

        let successorSolutions = [];
        let boardData = this.boardModel.calcCombos();

        for(let i of this.startPositions){
            this.selectedType = this.boardModel.orbs[i];
            let res = this.search(this.boardModel, i, i, boardData, 0);
            for (let r of res) {
                r.path.unshift(i);
            }
            successorSolutions.push(...res);
        }

        // for (let i = 0; i < 30; i++) {
           
        // }
        return successorSolutions;
    }

    search(board, prevPos, currentPos, boardData, depth) {


        if (this.selectedType != board.orbs[prevPos]) {

            let newBoardData = board.calcCombos();
            boardData = newBoardData;
        }

        if (depth == this.DEPTH_LIMIT) {
            return new Solution(boardData.score,boardData.comboList, [currentPos]);
        }

        let moves = [];
        for (let m of BoardModel.orbMoves[currentPos]) {
            if (m != prevPos) {
                board.swapOrbs(currentPos, m);
                moves.push(this.search(board, currentPos, m, boardData, depth + 1));
                board.swapOrbs(currentPos, m);
            }
        }


        if (depth == 0) {
            return moves;
        }

        let bestMove = moves.reduce((max, current) => {
            if (current.score == max.score) {
                return current.path.length < max.path.length ? current : max;
            }
            return current.score > max.score ? current : max;
        });

        if (bestMove.score <= boardData.score) {
            return new Solution(boardData.score,boardData.comboList, [currentPos]);
        }

        let path = [currentPos, ...bestMove.path];
        //this.transpositionTable.set(this.boardModel.hash,this.DEPTH_LIMIT - depth);

        return new Solution(bestMove.score,bestMove.comboList, path);
    }


    updateBoard(path) {
        for (let i = 0; i < path.length - 1; i++) {
            this.boardModel.swapOrbs(path[i], path[i + 1]);
        }
    }

    //generate, solve, and collect stats on random boards
    test() {

        let combos = 0;
        let iters = 1;
        for (let i = 0; i < iters; i++) {

            const arr = [];
            for (let i = 0; i < 30; i++) {
                arr[i] =  Math.floor(Math.random() * 2);
            }

            this.boardModel.orbs = arr;
            let res = this.beamSearch();
            let num = res.solution.comboList.length
            combos += num;

            console.log("combos: " + num + " path length: " + res.solution.path.length);
        }
        console.log("Average combos: " + combos / iters);
    }
}

class Solution {

    /**
     * @param {*} score - How good the solution is
     * @param {*} comboList 
     * @param {*} path 
     */
    constructor(score,comboList, path) {

        this.score = score;
        this.comboList = comboList;
        this.path = path;
    }

}
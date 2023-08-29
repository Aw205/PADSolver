class Solve {

    constructor(board, depth) {

        this.boardModel = new BoardModel(board);
        this.transpositionTable = new Map();
        this.DEPTH_LIMIT = depth;
        this.BEAM_WIDTH = 5;
        this.NUM_ITERATIONS = 8;
        this.count = 0;
        this.selectedType = -1;

    }

    beamSearch() {

        const timeStart = performance.now();

        let successorSolutions =  this.initialSearch();

        for (let i = 0; i < this.NUM_ITERATIONS; i++) {
            successorSolutions.sort((a, b) => {
                if (a[0] == b[0]) {
                    return b[1].length - a[0].length;
                }
                return b[0] - a[0];
            });

            successorSolutions = successorSolutions.slice(0, this.BEAM_WIDTH);

            for (let j = 0; j < this.BEAM_WIDTH; j++) {

                let path = successorSolutions[j][1];

                if(path.length < 2){
                    continue;
                }
                this.updateBoard(path);

                let currentPos = new Phaser.Math.Vector2(path[path.length - 1].x, path[path.length - 1].y);
                let prevPos = new Phaser.Math.Vector2(path[path.length - 2].x, path[path.length - 2].y);
                let cc = this.boardModel.calcCombos();

                this.selectedType = this.boardModel.orbs[currentPos.x][currentPos.y];

                let solutions = this.search(this.boardModel, prevPos, currentPos, cc, 0); 

                this.updateBoard(path.toReversed());

                for (let s of solutions) {
                    s[1] = [...path, ...s[1]];
                }

                successorSolutions.push(...solutions);
            }
        }

        let bestSolution = successorSolutions.reduce((max, current) => {
            if (current[0] == max[0]) {
                return current[1].length < max[1].length ? current : max;
            }
            return current[0] > max[0] ? current : max;
        });

        const timeEnd = performance.now();
        const timeElapsed = timeEnd - timeStart;
        return [bestSolution[0], bestSolution[1], timeElapsed, this.count]; 

    }


    /**
     * Starts a search from every position on the board.
     * 
     * @returns The results obtained at each position.
     */
    initialSearch() {

        let results = [];
        let numCombos = this.boardModel.calcCombos();

        for (let row = 0; row < 5; row++) {
            for (let col = 0; col < 6; col++) {

                let currentPos = new Phaser.Math.Vector2(row, col);
                let prevPos = new Phaser.Math.Vector2(row, col);
                this.selectedType = this.boardModel.orbs[row][col];
                let res = this.search(this.boardModel, prevPos, currentPos, numCombos, 0);
                for(let r of res){
                    r[1].unshift(currentPos);
                }
                results.push(...res);
            }
        }

        return results;
    }

    search(board, prevPos, currentPos, currentCombos, depth) {

        this.count++;

        let hash = board.getHash(currentPos);
        let hashRes = this.transpositionTable.get(hash);

        if (hashRes != undefined && depth < hashRes) {
            this.transpositionTable.set(hash, depth);
        }
        else if (hashRes != undefined) {
            if(depth == 0){
                console.log("depth is zero");
                return [[0,[]]];
            }
            return [0, []];
        }
        if (this.selectedType != board.orbs[prevPos.x][prevPos.y]) {
            let newCombos = board.calcCombos();
            if (newCombos < currentCombos - 2) {
                return [newCombos, [currentPos]];
            }
            currentCombos = newCombos;
        }

        if (currentCombos == 0 && depth > 2) {
            return [0, [currentPos]];
        }

        if (depth == this.DEPTH_LIMIT) {
            return [currentCombos, [currentPos]];
        }

        let moves = [];

        for (let m of this.getValidMoves(prevPos, currentPos)) {

            board.swapOrbs(currentPos, m);
            moves.push(this.search(board, currentPos, m, currentCombos, depth + 1));
            board.swapOrbs(currentPos, m);
        }

        if (depth == 0) {
            return moves; //successors for beam
        }

        let bestMove = moves.reduce((max, current) => {
            if (current[0] == max[0]) {
                return current[1].length < max[1].length ? current : max;
            }
            return current[0] > max[0] ? current : max;
        });

        if (bestMove[0] <= currentCombos) {
            this.transpositionTable.set(hash, depth);
            return [currentCombos, [currentPos]];
        }

        let path = [currentPos, ...bestMove[1]];
        this.transpositionTable.set(hash, depth);
        return [bestMove[0], path];

    }

    getValidMoves(prevPos, currentPos) {

        let moves = [];
        let x = [-1, 0, 1, 0];
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

}
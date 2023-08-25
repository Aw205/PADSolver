class Solve {

    constructor(board, depth) {

        this.boardModel = new BoardModel(board);
        this.boardMap = new Map();
        this.DEPTH_LIMIT = depth
    }

    initialSearch() {

        let results = [];

        for (let row = 0; row < 5; row++) {
            for (let col = 0; col < 6; col++) {

                let currentPos = new Phaser.Math.Vector2(row, col);
                let prevPos = new Phaser.Math.Vector2(-1, -1);
               
                let res = this.search(this.boardModel, prevPos,currentPos, 1);
                results.push(res);
            }
        }

        let bestMove = results.reduce((max, current) => {
            return current[0] > max[0] ? current : max;
        });

        return bestMove[1];

    }

    search(board, prevPos, currentPos, depth) {

        let currentCombos = board.calcCombos();
        board.resetVisited();

        //console.log("combos: " + currentCombos);

        if (depth == this.DEPTH_LIMIT) {
            return [currentCombos, [currentPos]];
        }

        let moves = [];

        for (let m of this.getValidMoves(prevPos,currentPos)) {

            board.swapOrbs(currentPos, m);
            moves.push(this.search(board, currentPos, m, depth + 1));
            board.swapOrbs(currentPos, m);
        }

        let bestMove = moves.reduce((max, current) => {
            return current[0] > max[0] ? current : max;
        });

        if (bestMove[0] <= currentCombos) {
            return [currentCombos, [currentPos]];
        }

        let path = [currentPos, ...bestMove[1]];
        return [bestMove[0], path];

    }

    getValidMoves(prevPos,currentPos) {

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

        // Pick the top 5 moves based on a heuristic
        // Heuristic: Leads to immediate combo
        let movesWithScores = [];

        for (let move of moves) {
            this.boardModel.swapOrbs(currentPos, move);
            let score = this.boardModel.calcCombos();
            this.boardModel.swapOrbs(currentPos, move);

            movesWithScores.push({move, score});
        }

        movesWithScores.sort((a, b) => b.score - a.score);

        const n = 5;
        let topNMoves = movesWithScores.slice(0, n).map(m => m.move);
        let filteredMoves = topNMoves.filter(move => !move.equals(prevPos));

        return filteredMoves;
    }

    isInBounds(row, col) {
        return (row > -1 && row < 5 && col > -1 && col < 6);
    }
}
class PathManager {


    constructor(scene, path, board) {

        this.scene = scene;
        this.path = path;
        this.board = board;
        this.pathIndex = 0;
        this.playing = false;
        this.playEvent = null;

        this.createPathButtons();

        this.pathList = [];
        this.initialBoard = null;
        this.g = this.scene.add.graphics({ lineStyle: { width: 5, color: 0, alpha: 0.8 } });
    }

    createPathButtons() {

        let html = `
            <div id = "path-button-container">
                <button id= "first-button" class="path-button"> <i class= "fa fa-step-backward"></i> </button>
                <button id= "prev-button"  class="path-button"> <i class= "fa fa-chevron-left"></i> </button>
                <button id= "play-button"  class="path-button"> <i id="play-image" class= "fa fa-pause fa-play fa-fw"> </i> </button>
                <button id= "next-button"  class="path-button"> <i class= "fa fa-chevron-right"></i> </button>
                <button id= "last-button"  class="path-button"> <i class= "fa fa-step-forward"></i> </button>
            </div>
            <i id="eye-button" class="fa fa-eye-slash fa-eye fa-fw tooltip icon-button" style="position:absolute;"> <span class="tooltiptext right-tooltiptext">Show Path</span> </i>`;
        this.scene.add.dom(600, 610).createFromHTML(html);

        document.getElementById("first-button").addEventListener("pointerup", () => {

            if (this.initialBoard != null) {
                this.scene.board.setBoard(this.initialBoard);
                this.pathIndex = 0;
            }
        });
        document.getElementById("prev-button").addEventListener("pointerup", () => {
            this.step(-1);
        });
        document.getElementById("play-button").addEventListener("click", () => {

            if (this.play()) {
                document.getElementById("play-image").classList.toggle("fa-play");
            }
        });

        document.getElementById("next-button").addEventListener("pointerup", () => {
            this.step(1);
        });

        document.getElementById("last-button").addEventListener("pointerup", () => {

            let copy = [...this.initialBoard].map(row => [...row])
            for (let i = 0; i < this.path.length - 1; i++) {

                let row = this.path[i].x;
                let row2 = this.path[i + 1].x;
                let col = this.path[i].y
                let col2 = this.path[i + 1].y;

                [copy[row][col], copy[row2][col2]] = [copy[row2][col2], copy[row][col]];
            }

            this.scene.board.setBoard(copy)
            this.pathIndex = this.path.length - 1;
        });

        document.getElementById("eye-button").addEventListener("click", (event) => {
            event.target.classList.toggle("fa-eye");
            this.togglePathVisibility();
        });
    }

    step(direction) {

        //this.board.orbArray[path[0].x][path[0].y].setAlpha(0.5);

        let stepIndex = this.pathIndex + direction
        if (stepIndex > -1 && stepIndex < this.path.length) {
            let curr = this.board.orbArray[this.path[this.pathIndex].x][this.path[this.pathIndex].y];
            let target = this.board.orbSlotArray[this.path[stepIndex].x][this.path[stepIndex].y];
            curr.swapLocations2(target);
            this.pathIndex += direction;
            return;
        }
        if (this.pathIndex == this.path.length - 1) {
            document.getElementById("play-button").click();
        }
    }

    /**
     * 
     * @returns whether button should be toggled
     */
    play() {

        if (this.playing && this.pathIndex == this.path.length - 1) {
            this.playing = false;
            return true;
        }

        if (this.pathIndex == this.path.length - 1) {
            return false;
        }

        if (!this.playing) {

            this.playEvent = this.scene.time.addEvent({
                delay: 500,
                callback: this.step,
                args: [1],
                callbackScope: this,
                repeat: this.path.length - 1 - this.pathIndex,
            });
            this.playing = true;
            return true;
        }

        this.playEvent.remove(false);
        this.playing = false;
        return true;
    }


    setPath(index) {
        this.g.clear();
        this.pathIndex = 0; // also need to reset the state of the board to beginning
        this.createLinePath(this.pathList[index]);
    }

    createLinePath(path) {

        let prevPos = new Phaser.Math.Vector2(0, 0);
        let startOrb = this.scene.board.orbArray[path[0].x][path[0].y];
        let sp = new Phaser.Curves.Spline([startOrb.x, startOrb.y]);
        let visited = [];
        let offset = 0;

        for (let i = 0; i < path.length - 1; i++) {

            let curr = this.scene.board.orbArray[path[i].x][path[i].y];
            let target = this.scene.board.orbArray[path[i + 1].x][path[i + 1].y];

            let dx = target.x - curr.x;
            let dy = target.y - curr.y;

            let dir = (dx == 0) ? "vertical" : "horizontal";

            if (this.isCorner(path, i + 1)) {
                let dire = this.getDirection(path[i + 1], path[i + 2]);
                offset = this.calcPathOffset(path, i + 2, dire, visited);
                dir = (dx == 0) ? "vertical" : "horizontal";
            }

            let ele = { position: path[i], direction: dir };
            visited.push(ele);

            let deltaX = target.x - prevPos.x;
            let deltaY = target.y - prevPos.y;
            offset *= (dx == 0) ? dy / dy : dx / dx;

            prevPos.set(curr.x, curr.y);

            let v = sp.points[sp.points.length - 1];

            if (deltaX != 0 && deltaY != 0 && i != 0) {
                sp.addPoint(v.x + deltaX / 10, v.y + deltaY / 10);
                v = sp.points[sp.points.length - 1];
            }
            (dx == 0) ? sp.addPoint(v.x, target.y - dy / 10 - offset) : sp.addPoint(target.x - dx / 10 - offset, v.y);

            offset = 0;
        }

        let start = sp.getStartPoint();
        let end = sp.points[sp.points.length - 1];

        sp.draw(this.g, sp.points.length - 1);

        this.g.fillStyle(0x33cc33, 1);
        this.g.fillCircle(start.x, start.y, 10);

        this.g.fillStyle(0xff0000, 1);
        this.g.fillCircle(end.x, end.y, 10);

        this.g.fillStyle(0, 1);
        this.g.strokeCircle(start.x, start.y, 10);
        this.g.strokeCircle(end.x, end.y, 10);

    }

    calcPathOffset(path, currentIndex, currDir, visited) {

        for (let i = currentIndex; i < path.length - 1; i++) {
            let found = visited.find(p => p.position.equals(path[i]));
            if (found != null && currDir == found.direction) {
                return 20;
            }
            if (this.isCorner(path, i)) {
                return 0;
            }
        }
        return 0;
    }


    getDirection(curr, prev) {
        return (curr.x - prev.x) == 0 ? "vertical" : "horizontal";

    }

    isCorner(path, index) {

        if (index < 1 || index > path.length - 2) {
            return false;
        }
        let prev = path[index - 1];
        let target = path[index + 1];

        let dx = target.x - prev.x;
        let dy = target.y - prev.y;

        return (dx != 0 && dy != 0);
    }


    togglePathVisibility() {
        if (this.g.visible) {
            return this.g.setVisible(false);
        }
        this.g.setVisible(true);
    }


    resetBoard(){
        this.board.setBoard(this.initialBoard);
        this.pathIndex = 0;

    }

}
class PathManager {


    constructor(scene, path, board) {

        this.scene = scene;
        this.path = path;

        this.board = board;
        this.pathIndex = 0;
        this.playing = false;
        this.playEvent = null;

        this.createPathButtons();

        this.initialBoard = null;
        this.finalBoard = null;
        this.g = this.scene.add.graphics({ lineStyle: { width: 5, color: 0, alpha: 0.8 } });

        this.g.setDepth(10);
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
                this.setPath(this.path);
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
            this.scene.board.setBoard(this.finalBoard)
            this.pathIndex = this.path.length - 1;
        });

        document.getElementById("eye-button").addEventListener("click", (event) => {
            event.target.classList.toggle("fa-eye");
            this.togglePathVisibility();
        });
    }

    step(direction) {

        let stepIndex = this.pathIndex + direction
        if (stepIndex > -1 && stepIndex < this.path.length) {
            let curr = this.board.orbArray[this.path[this.pathIndex]];
            let target = this.board.orbArray[this.path[stepIndex]];
            curr.swapAnimated(target);
            this.pathIndex += direction;
            return;
        }
        if (this.pathIndex == this.path.length - 1) {
            document.getElementById("play-button").click();
        }
    }

    /**
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

    createLinePath(path) {

        let prevPos = new Phaser.Math.Vector2(0, 0);
        let startOrb = this.scene.board.orbArray[path[0]];
        let sp = new Phaser.Curves.Spline([startOrb.x, startOrb.y]);
        let visited = [];
        let offset = 0;

        for (let i = 0; i < path.length - 1; i++) {

            let curr = this.scene.board.orbArray[path[i]];
            let target = this.scene.board.orbArray[path[i + 1]];

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

        this.g.fillStyle(0x33cc33, 0.5);
        this.g.fillCircle(start.x, start.y, 10);

        this.g.fillStyle(0xff0000, 0.5);
        this.g.fillCircle(end.x, end.y, 10);

        this.g.fillStyle(0, 0.5);
        this.g.strokeCircle(start.x, start.y, 10);
        this.g.strokeCircle(end.x, end.y, 10);

        // let follower = new Phaser.GameObjects.PathFollower(this.scene,sp,start.x,start.y,"fire");
        // follower.setAlpha(0.8).setScale(0.5);
        // this.scene.add.existing(follower);
        // follower.startFollow({duration: path.length*500});

    }

    calcPathOffset(path, currentIndex, currDir, visited) {

        for (let i = currentIndex; i < path.length - 1; i++) {
            let found = visited.find(p => p.position == path[i]);
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
        return Math.abs(curr - prev) == 1 ? "horizontal" : "vertical";

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

    setPath(path) {

        this.g.clear(); // set depth also so it displays above the orbs
        this.pathIndex = 0;
        this.scene.board.setBoard(this.initialBoard);
        this.createLinePath(path);
        this.path = path;

        let copy = [...this.initialBoard];
        for (let i = 0; i < path.length - 1; i++) {
            [copy[path[i]], copy[path[i+1]]] = [copy[path[i+1]], copy[path[i]]];
        }
        this.finalBoard = copy;        
    }

}
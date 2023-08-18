
class BoardScene extends Phaser.Scene {

    constructor() {
        super("BoardScene");
    }

    create() {

        this.cameras.main.setBackgroundColor('rgb(20,20,20)');

        let grid = this.add.grid(350, 50, 600, 500, 100, 100, 0x272829);
        grid.setAltFillStyle(0x3b3d3e)
            .setOrigin(0, 0)
            .setOutlineStyle();

        this.board = new Board(this, 400, 100);

        this.createBoardSelectMenu();
        this.createBoardButtons();
        this.createOrbPalette();

    }


    createBoardSelectMenu() {

        let html = `
        <details>
        <summary style= "color: DarkGray; user-select:none; font: 32px kreon;" >Load Board</summary>
        <select id="select1" style= "margin-left: 50px; margin-top: 20px;">
            <option value="Choose board">Choose board</option>
            <option value="Rainbow">Rainbow</option>
            <option value="Bicolor">Bicolor</option>
            <option value="Tricolor">Tricolor</option>
        </select> <br>
        <button id= "load-button" style="background-color: gray; margin-left: 50px; margin-top: 20px;"> Load </button>
        </details>`;

        this.add.dom(100, 250).createFromHTML(html);

        document.getElementById("load-button").addEventListener("pointerup", () => {

            if (!this.board.solveInProgress) {
                let filename = document.getElementById("select1").value;
                this.loadBoard(filename);

            }
        });
    }

    loadBoard(filename) {

        fetch(`assets/example_boards/${filename}.txt`)
            .then(response => response.text())
            .then(text => {
                this.board.setBoard(eval(text));
            })
            .catch(error => {
                console.error('Error fetching the file:', error);
            });
    }



    createBoardButtons() {

        let toggle = `<link rel = "stylesheet" href= "./src/styles/main.css">
                        <div style="display:grid;grid-template-columns: max-content max-content; grid-gap:5px;"> 
                            <label style="font: 32px kreon; color: DarkGray; user-select: none; display: inline-block;" for="skyfall">Skyfall</label>
                                <label class="switch">
                                <input id="skyfall" type="checkbox" checked>
                                <span class="slider round"></span>
                            </label>
                         </div>`;
        this.add.dom(100, 170).createFromHTML(toggle);

        let html = `<button id = "randomize-button" class="default-button" >Randomize</button>
                    <button id = "reset-button" class="default-button" >Reset</button>
                    <button id = "solve-button" class="default-button" >Solve</button>`;
        this.add.dom(570, 600).createFromHTML(html);

        document.getElementById("randomize-button").addEventListener("pointerup", () => {

            if (!this.board.solveInProgress) {
                for (let row = 0; row < 5; row++) {
                    for (let col = 0; col < 6; col++) {
                        let o = this.board.orbArray[row][col];
                        let rand = Phaser.Math.Between(0, 5)
                        if (o != null) {
                            o.changeType(rand);
                            continue;
                        }
                        let s = this.board.orbSlotArray[row][col];
                        this.board.orbArray[row][col] = new Orb(this, s.x, s.y, row, col, this.board.orbImages[rand]);
                        this.board.orbArray[row][col].type = Object.values(OrbType)[rand];
                        this.board.orbArray[row][col].currentSlot = s;
                        s.orb = this.board.orbArray[row][col];

                    }
                }
            }

        });
        document.getElementById("reset-button").addEventListener("pointerup", () => {
            console.log("pressing reset");

        });

        document.getElementById("solve-button").addEventListener("pointerup", () => {
            // let path = [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4], [0, 5],
            // [1, 5], [2, 5], [3, 5], [4, 5]];

            let model = this.board.getNumericModel();
            //console.log(model);
            
            let solver = new Solve(model);
            let path = solver.initialSearch();

            



            if (!this.board.solveInProgress) {

                this.board.orbArray[path[0].x][path[0].y].setAlpha(0.5);
                this.time.addEvent({
                    delay: 500,
                    callback: this.followPath,
                    args: [path],
                    callbackScope: this,
                    repeat: path.length - 2,
                });

            }

        });
    }


    followPath(path) {

        let curr = this.board.orbArray[path[0].x][path[0].y];
        let target = this.board.orbSlotArray[path[1].x][path[1].y];
        curr.swapLocations2(target);
        path.shift();

    }



    createOrbPalette() {

        let ids = ["Fire", "Water", "Wood", "Light", "Dark", "Heart"];
        let html = `<details id="orb-palette">
                        <summary style= "color: DarkGray; user-select:none; font: 32px kreon;" > Orb Palette </summary>`;
        for (let id of ids) {
            html += `<button id= "${id}-button" class="palette-button">
                            <img width="50" height="50" src="assets/images/orbs/${id}.png">
                        </button>`;
        }
        html += `<button id= "exit-button" class= "palette-button">
                    <img width="50" height="50" src="assets/UI/exit.svg">
                 </button>
                 </details>`;

        this.add.dom(100, 700).createFromHTML(html);

        for (let id of ids) {
            let lc = id.toLowerCase();
            document.getElementById(`${id}-button`).addEventListener("pointerup", () => {

                this.input.setDefaultCursor(`url(assets/images/cursorOrbs/${lc}Cursor.png), auto`);
                this.input.on("pointermove", (pointer, currentlyOver) => {
                    if (pointer.isDown && currentlyOver.length > 0) {
                        currentlyOver[0].orb.changeType(ids.indexOf(id));
                    }
                });
                for (let arr of this.board.orbArray) {
                    for (let o of arr) {
                        o.disableInteractive();
                    }
                }
            });
        }

        document.getElementById("exit-button").addEventListener("pointerup", () => {

            this.input.setDefaultCursor("default");
            this.input.removeAllListeners("pointermove");

            document.getElementById("orb-palette").removeAttribute('open');
            for (let arr of this.board.orbArray) {
                for (let o of arr) {
                    o.setInteractive();
                }
            }
        });
    }

}

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
            let filename = document.getElementById("select1").value
            this.loadBoard(filename);

        });
    }

    loadBoard(filename) {
        fetch(`assets/boards/${filename}.txt`)
        .then(response => response.text())
        .then(text => {
            for(let char of text){
                // todo

            }
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
            this.time.removeAllEvents();
            this.board.destoryBoard();
            this.board = new Board(this, 400, 100);

        });
        document.getElementById("reset-button").addEventListener("pointerup", () => {
            console.log("pressing reset");

        });
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
                        currentlyOver[0].orb.changeType(`${lc}`, ids.indexOf(id));
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
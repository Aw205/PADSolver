
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
        this.currPath = this.add.group();

        this.createBoardSelectMenu();
        this.createBoardButtons();
        this.createOrbPalette();
        this.createStatMenu();
        this.createPathButtons();
        this.createBoardImageProcessor();
        this.createDepthSlider();
        this.createBeamWidthSlider();
        this.createIterationSlider();
    }

    createBoardSelectMenu() {

        let html = `

        <link rel = "stylesheet" href= "./src/styles/main.css">
        <div style="padding-left: 20px; display: flex; flex-direction: column; gap: 20px;">
        <details id="settings-detail">
        <summary style= "color: DarkGray; user-select:none; font: 32px kreon;"> 
            <img src="assets/UI/settings.svg" style="vertical-align: middle; transition: transform 0.3s ease;">
            Board Settings
        </summary>
        <div style ="background-color: rgb(50,50,50); margin-left: 50px; margin-top: 20px; padding: 10px; border-radius: 10px;">
            <div style="display:grid;grid-template-columns: max-content max-content; grid-gap:5px;"> 
                            <label style="font: 20px kreon; color: DarkGray; user-select: none; display: inline-block;" for="skyfall">Skyfall</label>
                                <label class="switch">
                                <input id="skyfall" type="checkbox">
                                <span class="slider round"></span>
                            </label>
            </div>

            <label style="font: 20px kreon; color: DarkGray; user-select: none; display: inline-block;" for="speed-select">Animation Speed</label>
            <select id="speed-select" style="font: 16px kreon;">
                <option value="Slow">Slow</option>
                <option value="Medium" selected >Medium</option>
                <option value="Fast">Fast</option>
            </select>
        </div>
        </details>

        <details>
        <summary style= "color: DarkGray; user-select:none; font: 32px kreon;" >
            <img src="assets/UI/board.svg" style="vertical-align: middle;">
            Load Board
        </summary>
        <div style ="background-color: rgb(50,50,50);margin-left: 50px; margin-top: 20px; padding: 10px; border-radius: 10px; user-select: none;">
        <select id="select1" style="font: 20px kreon;">
            <option value="Choose board">Choose board</option>
            <option value="Rainbow">Rainbow</option>
            <option value="Bicolor">Bicolor</option>
            <option value="Tricolor">Tricolor</option>
        </select> <br>
        <button id= "load-button" style="background-color: gray; margin-top: 20px; font: 20px kreon;"> Load </button> <br>
        <label class="custom-file-upload">
            <input id="upload-button" type="file" accept="image/*" /> Upload Screenshot
        </label>
        </div>
        </details>
        </div>`;

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

        let html = `
        
        <div id = "button-container" style="background-color: rgb(50,50,50); padding: 10px; border-radius: 10px; user-select: none;">
                    <button id = "randomize-button" class="default-button" >Randomize</button>
                    <button id = "reset-button" class="default-button" >Reset</button>
                    <button id = "solve-button" class="default-button" >
                        <span> Solve</span>
                    </button>
        </div>`;
        this.add.dom(570, 650).createFromHTML(html);

        document.getElementById("randomize-button").addEventListener("pointerup", () => {

            if (!this.board.solveInProgress) {
                const arr = [];
                for (let i = 0; i < 5; i++) {
                    arr[i] = [];
                    for (let j = 0; j < 6; j++) {
                        arr[i][j] = Phaser.Math.Between(0, 5);
                    }
                }
                this.board.setBoard(arr);
            }

        });
        document.getElementById("reset-button").addEventListener("pointerup", () => {

            this.currPath.clear(true, true);

            if (this.board.prevBoard != null && !this.board.solveInProgress) {
                this.board.setBoard(this.board.prevBoard);
            }

        });

        document.getElementById("solve-button").addEventListener("pointerup", () => {



            function followPath(path) {
                let curr = this.board.orbArray[path[0].x][path[0].y];
                let target = this.board.orbSlotArray[path[1].x][path[1].y];
                curr.swapLocations2(target);
                path.shift();
            }

            if (!this.board.solveInProgress) {

                document.getElementById("solve-button").classList.add("button--loading");

                setTimeout(() => {

                    this.board.solveInProgress = true;

                    this.board.prevBoard = this.board.cloneOrbArray();
                    let model = this.board.getNumericModel();

                    const depth = parseInt(document.getElementById("depthSlider").value);
                    const beamWidth = parseInt(document.getElementById("beamWidthSlider").value);
                    const numIterations = parseInt(document.getElementById("iterationSlider").value);
                    let solver = new Solve(model, depth,beamWidth,numIterations);

                    let res = solver.beamSearch();
                    document.getElementById("solve-button").classList.remove("button--loading");

                    let path = res[1];
                    this.updateStats(res);

                    this.createLinePath(path);

                    if (path.length > 1) {
                        this.board.orbArray[path[0].x][path[0].y].setAlpha(0.5);
                        this.time.addEvent({
                            delay: 500,
                            callback: followPath,
                            args: [path],
                            callbackScope: this,
                            repeat: path.length - 2,
                        });

                        this.time.delayedCall(500 * (path.length + 1), this.board.solveBoard, null, this.board);
                    }
                }, 10);

            }
        });
    }


    createLinePath(path) {

        for (let i = 0; i < path.length - 1; i++) {

            let curr = this.board.orbArray[path[i].x][path[i].y];
            let target = this.board.orbArray[path[i + 1].x][path[i + 1].y];
            this.currPath.add(this.add.line(0, 0, curr.x, curr.y, target.x, target.y, 0, 0.7).setLineWidth(4, 4).setOrigin(0, 0).setDepth(100));

        }

        let end = this.board.orbArray[path[path.length - 1].x][path[path.length - 1].y];
        let start = this.board.orbArray[path[0].x][path[0].y];

        this.currPath.add(this.add.dom(end.x - 25, end.y - 20).createFromHTML(`<img src="assets/UI/endPath.svg" >`));
        this.currPath.add(this.add.dom(start.x - 25, start.y - 20).createFromHTML(`<img src="assets/UI/startPath.svg" >`));

    }

    createOrbPalette() {

        let ids = ["Fire", "Water", "Wood", "Light", "Dark", "Heart"];
        let html = `<details id="orb-palette">
                        <summary style= "color: DarkGray; user-select:none; font: 32px kreon;" > 
                            <img src="assets/UI/orbPalette.svg" style="vertical-align: middle;">
                            Orb Palette 
                        </summary>`;
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

    createStatMenu() {

        let html = `<div style=" width: 270px; height: 800px; background-color: rgb(30,30,30); border-radius: 10px; padding: 10px;"> 
                        <div id="combo-count" style="font: 24px kreon; color: DarkGray; user-select:none; data-combos="0"; > Combos:
                            <span style="color:tan;"> </span>
                        </div>
                        <div id="swap-count" style="font: 24px kreon; color: DarkGray; user-select:none; data-swaps="0"; > Swaps:
                            <span style="color:tan;"> </span>
                        </div>
                        <div id="time-count" style="font: 24px kreon; color: DarkGray; user-select:none; data-time="0"; > Time:
                            <span style="color:tan;"> </span>
                        </div>
                        <div id="explored-count" style="font: 24px kreon; color: DarkGray; user-select:none; data-explored="0"; > Nodes Explored:
                            <span style="color:tan;"> </span>
                        </div>
                    </div>`

        this.add.dom(1120, 445).createFromHTML(html);
    }


    updateStats(result) {

        let cc = result[0];
        let path = result[1];
        let time = result[2].toFixed(2);
        let ne = result[3];

        document.getElementById("combo-count").getElementsByTagName("span")[0].textContent = cc;
        document.getElementById("swap-count").getElementsByTagName("span")[0].textContent = path.length - 1;
        document.getElementById("time-count").getElementsByTagName("span")[0].textContent = time + " ms";
        document.getElementById("explored-count").getElementsByTagName("span")[0].textContent = ne;

    }

    createPathButtons() {

        let html = `
        <div id = "button-container" style="background-color: rgb(50,50,50); padding: 1px; border-radius: 10px; user-select: none;">
                    <button id = "first-button" class="path-button" >
                        <img src="assets/UI/last.svg" style="transform: rotate(180deg);" />
                    </button>
                    <button id = "prev-button" class="path-button" >
                        <img src="assets/UI/next.svg" style="transform: rotate(180deg);"/>
                    </button>
                    <button id = "play-button" class="path-button" >
                        <img src="assets/UI/play.svg" />
                    </button>
                    <button id = "next-button"  class="path-button">
                        <img src="assets/UI/next.svg" />
                    </button>
                    <button id = "last-button"  class="path-button">
                        <img src="assets/UI/last.svg" />
                    </button>
        </div>`;
        this.add.dom(490, 580).createFromHTML(html);

        document.getElementById("first-button").addEventListener("pointerup", () => {
        });
        document.getElementById("prev-button").addEventListener("pointerup", () => {
        });
        document.getElementById("play-button").addEventListener("pointerup", () => {
        });
        document.getElementById("next-button").addEventListener("pointerup", () => {
        });
        document.getElementById("last-button").addEventListener("pointerup", () => {
        });
    }


    createBoardImageProcessor() {

        const input = document.getElementById("upload-button");
        input.addEventListener("change", () => {
            console.log("working");
            let file = input.files;
            let img_url = URL.createObjectURL(file[0]);
            const img = new Image();
            const canvas = document.getElementById("myCanvas");
            const context = canvas.getContext('2d');
            img.src = img_url;
            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height / 2;
                context.drawImage(img, 0, canvas.height, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
                let imgData = context.getImageData(0, 0, canvas.width, canvas.height);
                let data = imgData.data;
                let i = 0;

                let board_start = 0;
                let board_end = 0;

                while (i < data.length && board_end == 0) {
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];
                    if (r == 51 && g == 33 && b == 34 && board_start == 0) {
                        board_start = i;
                    }
                    if (r == 0 && g == 0 && b == 0 && board_start != 0) {
                        board_end = i;
                    }
                    i += 4;
                }

                let board_width = (board_end - board_start) / 4;
                let tile_length = Math.round((board_width / 6) - 0.1);

                // let k = board_start + 2 * tile_length * canvas.width;
                // for (let i = 0; i < 5; i++) {

                //     for (let j = k; j < k + canvas.width * 4; j += 4) {
                //         data[j] = 255;
                //         data[j+1] = 255;
                //         data[j+2] = 255;
                //     }
                //     k += 4 * tile_length * canvas.width;
                // }

                // let start = board_start + 2 * tile_length;
                // for (let i = 0; i < canvas.height; i++) {
                //     k = start;
                //     for (let j = 0; j < 6; j++) {
                //         data[k] = 255;
                //         data[k+1] = 255;
                //         data[k+2] = 255;
                //         k += 4 * tile_length;
                //     }
                //     start += canvas.width * 4;
                // }

                let results = [];
                let start = board_start + 2 * tile_length * canvas.width;
                for (let i = 0; i < 5; i++) {
                    let row = [];
                    let k = start + 2 * tile_length;
                    console.log(i + 1);
                    for (let j = 0; j < 6; j++) {

                        const r = data[k];
                        const g = data[k + 1];
                        const b = data[k + 2];
                        console.log(r, g, b);
                        if (r >= 254) {
                            row.push(0);
                        } else if (b >= 254) {
                            row.push(1);
                        } else if (r < 100 && g > 200 && b < 250) {
                            row.push(2);
                        } else if (r > 100 && g > 200 && b < 250) {
                            row.push(3);
                        } else if (r < 210 && g < 210 && b < 210) {
                            row.push(4);
                        } else {
                            row.push(5);
                        }

                        k += 4 * tile_length;
                    }
                    results.push(row);
                    start += 4 * tile_length * canvas.width;
                }

                this.board.setBoard(eval(results));
                context.putImageData(imgData, 0, 0);
            };

        });
    }

    createDepthSlider() {
        let html = `
            <div style="padding: 50px; display: inline-block;">
                <label for="depthSlider" style="font: 32px kreon; color: DarkGrey; user-select: none;">Depth:</label>
            </div>
            <div style="display: inline-block;">
                <input type="range" id="depthSlider" name="depthSlider" min="6" max="12" value="8" step="1">
                <span id="depthValue" style="color: DarkGrey; font-size: 25px;">8</span>
            </div>
        `;

        this.add.dom(620, 730).createFromHTML(html);

        const depthSlider = document.getElementById("depthSlider");
        const depthValueDisplay = document.getElementById("depthValue");
        depthSlider.oninput = function() {
            depthValueDisplay.textContent = this.value;
        }
    }

    createBeamWidthSlider() {
        let html = `
            <div style="padding: 50px; display: inline-block;">
                <label for="beamWidthSlider" style="font: 32px kreon; color: DarkGrey; user-select: none;">Beam Width:</label>
            </div>
            <div style="display: inline-block;">
                <input type="range" id="beamWidthSlider" name="beamWidthSlider" min="2" max="10" value="5" step="1">
                <span id="beamValue" style="color: DarkGrey; font-size: 25px;">5</span>
            </div>
        `;

        this.add.dom(620, 800).createFromHTML(html);

        const beamSlider = document.getElementById("beamWidthSlider");
        const beamValueDisplay = document.getElementById("beamValue");
        beamSlider.oninput = function() {
            beamValueDisplay.textContent = this.value;
        }
    }

    createIterationSlider() {
        let html = `
            <div style="padding: 50px; display: inline-block;">
                <label for="iterationSlider" style="font: 32px kreon; color: DarkGrey; user-select: none;">Num Iterations:</label>
            </div>
            <div style="display: inline-block;">
                <input type="range" id="iterationSlider" name="iterationSlider" min="6" max="12" value="8" step="1">
                <span id="iterationValue" style="color: DarkGrey; font-size: 25px;">8</span>
            </div>
        `;

        this.add.dom(620, 870).createFromHTML(html);

        const iterationSlider = document.getElementById("iterationSlider");
        const iterationValueDisplay = document.getElementById("iterationValue");
        iterationSlider.oninput = function() {
            console.log("")
            iterationValueDisplay.textContent = this.value;
        }
    }
}


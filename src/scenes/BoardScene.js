
class BoardScene extends Phaser.Scene {

    constructor() {
        super("BoardScene");
    }

    create() {

        this.cameras.main.setBackgroundColor('rgba(25,25,25,1)');

        let grid = this.add.grid(300, 80, 600, 500, 100, 100, 0x272829);
        grid.setAltFillStyle(0x3b3d3e)
            .setOrigin(0, 0)
            .setOutlineStyle();

        this.board = new Board(this, 350, 130);

        this.pathManager = new PathManager(this, null, this.board);

        this.createBoardButtons();
        new EditToolbar(this);
        this.statWindow = new StatWindow(this);
        this.createSideBarToggles();

        new SettingModal(this);
        new SaveModal(this);
        new LoadBoardModal(this);
        this.createDialogListeners();
        new MessageLog(this);
        BoardModel.precalculateOrbSwaps();

    }

    createDialogListeners() {

        const exitButtons = document.querySelectorAll(".close-button");
        exitButtons.forEach(function (b) {
            b.addEventListener('click', function () {
                let dialog = b.parentElement;
                dialog.close();
            });
        });
    }

    createSideBarToggles() {

        let html = `
            <div style="display: flex; flex-direction: column; gap: 1em;"> 
                <i id="skyfall-toggle" class="fa fa-arrows-down-to-line fa-fw tooltip icon-button">
                    <span class="tooltiptext">Skyfall</span>
                </i>       
                <i id="shuffle-toggle" class="fa-solid fa-shuffle fa-fw tooltip icon-button">
                    <span class="tooltiptext">Shuffle</span>
                </i>
                <i id="save-modal-open-button" class="fa-solid fa-floppy-disk fa-fw tooltip icon-button" >
                    <span class="tooltiptext">Save</span>
                </i>
            </div>`;

        this.add.dom(250, 200).createFromHTML(html);

        document.getElementById("skyfall-toggle").addEventListener("pointerup", (event) => {
            event.target.classList.toggle("button-activate");
        });
        document.getElementById("shuffle-toggle").addEventListener("pointerup", (event) => {
            event.target.classList.toggle("button-activate");
        });

        let h = `   
                    <i id="stopwatch-toggle" class="fa-solid fa-stopwatch fa-fw tooltip icon-button">
                        <span class="tooltiptext">Timer</span>
                    </i>
                    <div id= "timer-container" style="display: none;">
                        <input id= "timer-input" type="number" placeholder="move time" min="1" step="0.1"/>
                        <span style="border:2px inset gray; color:gray; background-color:black; font: 1rem kreon; border-radius: 0 10px 10px 0; margin:0; border-left:none;padding: 5px;">(s)</span>
                    </div> `;

        this.add.dom(340,40).createFromHTML(h);

        document.getElementById("stopwatch-toggle").addEventListener("pointerup", (event) => {
            event.target.classList.toggle("button-activate");     
            document.getElementById("timer-container").style.display = document.getElementById("timer-container").style.display === 'none' ? 'inline-flex' : 'none';
        });

    }

    createBoardButtons() {
        let html = `
        <div>
            <button id = "randomize-button" class="board-button"> Randomize</button>
            <button id = "reset-button" class="board-button"> Reset </button>
            <button id = "solve-button" class="board-button"> <span> Solve</span> </button>
        </div>`;
        this.add.dom(600, 680).createFromHTML(html);

        document.getElementById("randomize-button").addEventListener("pointerup", () => {

            if (!this.board.solveInProgress) {
               
                if(document.getElementById("shuffle-toggle").classList.contains("button-activate")){
                    if(this.board.orbArray.some(item => item === null)){
                        this.events.emit("message log",MessageLog.ERROR,"Can't shuffle incomplete board");
                        return;
                    }
                    let model = this.board.getNumericModel().sort((a, b) => 0.5 - Math.random());
                    this.board.setBoard(model);
                    return;
                }
                this.events.emit("message log", MessageLog.STANDARD,"Randomized board");
                const arr = Array.from({ length: 30 }, () =>  Phaser.Math.Between(0, 5));
                this.board.setBoard(arr);
                this.board.setOrbInteractive(true);

            }
        });
        document.getElementById("reset-button").addEventListener("pointerup", () => {
            if (this.board.prevBoard != null && !this.board.solveInProgress) {
                this.events.emit("message log",MessageLog.STANDARD ,"Reset board");
                this.board.setBoard(this.board.prevBoard);
                this.board.setOrbInteractive(true);
            }
        });

        document.getElementById("solve-button").addEventListener("pointerup", () => {

            if (!this.board.solveInProgress) {

                this.events.emit("message log", MessageLog.IN_PROGRESS,"Solving board...");
                this.board.solveInProgress = true;

                this.pathManager.g.clear();
                document.getElementById("combo-paths").innerHTML = "";
                document.getElementById("solve-button").classList.add("button--loading");

                setTimeout(() => {

                    let model = this.board.getNumericModel();
                    let res = new Solve(model).beamSearch();
    
                    document.getElementById("solve-button").classList.remove("button--loading");

                    this.statWindow.updateStats(res);
                    this.pathManager.initialBoard = model;

                    document.getElementById("combo-paths").firstChild.click();
                   
                    this.events.emit("message log", MessageLog.COMPLETION,"Finished solve");
                    this.board.solveInProgress = false;
                }, 10);

            }
        });
    }
}


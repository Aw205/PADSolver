import Board from "../UI/Board.js";
import getStartPositions from "../components/position-select-modal.js";

export default class BoardScene extends Phaser.Scene {

    constructor() {
        super("BoardScene");
    }

    create() {

        this.add.grid(0, 0, Orb.HEIGHT * 6, Orb.HEIGHT * 5, Orb.HEIGHT, Orb.HEIGHT, 0x1c130f)
            .setAltFillStyle(0x2e201a)
            .setOrigin(0, 0)
            .setOutlineStyle().setDepth(-999);

        this.board = new Board(this, Orb.HEIGHT / 2, Orb.HEIGHT / 2);
        this.pathManager = new PathManager(this, null, this.board);

        this.rouletteTweens = [];

        this.createBoardButtons();
        new EditToolbar(this);
        this.createSideBarToggles();
        this.createDialogListeners();

        this.renderer.pipelines.add('TestShader', new TestShader(this.game));
    }

    createDialogListeners() {

        document.querySelectorAll(".close-button").forEach((b) => {
            b.addEventListener('click', () => b.parentElement.close());
        });
        let modals = document.querySelectorAll("dialog");
        modals.forEach((e) => {
            e.addEventListener("click", (event) => {
                if (event.target == e) {
                    e.close();
                }
            })
        });

        document.querySelector(".solver-config-button").addEventListener("click",()=>{

            document.querySelector(".solver-config-container").classList.toggle("show1");
        })

        const menuBtn = document.querySelector('#menu-button');
        menuBtn.addEventListener('click', () => {
            document.querySelector(".menu-icons").classList.toggle("show");
        });

        const addConfigButton = document.querySelector('.add-config-button');
        const orbWeightContainer = document.querySelector('.orb-weight-container');
        addConfigButton.addEventListener('click', () => {
            let newNode = document.createElement("combo-config");
            orbWeightContainer.appendChild(newNode);
        });
    }

    createSideBarToggles() {

        document.querySelector(".share-button").addEventListener("click", (e) => {


            if (this.board.orbArray.some((o) => o === null)) {
                Toastify({
                    text: "Board cannot be empty",
                    duration: 4000,
                    style: {
                        background: "linear-gradient(90deg, #f12711 0%, #f5af19 100%)"
                    },
                    gravity: "bottom",
                    position: "left",
                    className: "toast",
                }).showToast();
            }
            else {
                navigator.clipboard.writeText(this.board.getBoardUrl());
                Toastify({
                    text: "Copied to clipboard",
                    duration: 4000,
                    style: {
                        background: "linear-gradient(90deg,rgba(42, 123, 155, 1) 0%, rgba(87, 199, 133, 1) 100%)"
                    },
                    gravity: "bottom",
                    position: "left",
                    className: "toast",
                }).showToast();
            }



        });

        document.getElementById("skyfall-toggle").addEventListener("pointerup", (event) => {
            event.currentTarget.classList.toggle("button-activate");
        });
        document.getElementById("shuffle-toggle").addEventListener("pointerup", (event) => {
            event.currentTarget.classList.toggle("button-activate");
        });
        document.getElementById("timer-toggle").addEventListener("pointerup", (event) => {
            if (event.target != document.getElementById("timer-input")) {
                event.currentTarget.classList.toggle("button-activate");
                document.getElementById("timer-input").style.display = document.getElementById("timer-input").style.display === 'none' ? 'inline-flex' : 'none';
            }
        });
        document.getElementById("free-move-toggle").addEventListener("click", (event) => {
            event.currentTarget.classList.toggle("button-activate");
        });
    }

    createBoardButtons() {

        document.getElementById("randomize-button").addEventListener("pointerup", () => {

            if (!this.board.solveInProgress) {
                if (document.getElementById("shuffle-toggle").classList.contains("button-activate")) {
                    if (this.board.orbArray.some(item => item === null)) {
                        return;
                    }
                    let model = this.board.getNumericModel().sort((a, b) => 0.5 - Math.random());
                    this.board.setBoard(model);
                    return;
                }
                const arr = Array.from({ length: 30 }, () => Phaser.Math.Between(0, 5));
                this.board.setBoard(arr);
                this.board.setOrbInteractive(true);

            }
        });
        document.getElementById("reset-button").addEventListener("pointerup", () => {
            if (this.board.prevBoard != null) {
                this.board.setBoard(this.board.prevBoard);
                this.board.setOrbInteractive(true);
            }
        });

        document.getElementById("solve-button").addEventListener("pointerup", () => {

            if (!this.board.solveInProgress) {

                document.getElementById("solution-window").classList.toggle("fade-border");

                this.board.solveInProgress = true;

                this.pathManager.g.clear();
                document.getElementById("combo-paths").innerHTML = "";
                document.getElementById("solve-button").classList.add("button--loading");

                let configs = [];
                document.querySelectorAll("combo-config").forEach((e) => {
                    let shape = e.querySelector(".shape-select").value;
                    let value = e.querySelector("input").value;
                    let attribute = e.querySelector(".attribute-select").value;

                    if (shape.length > 0 && attribute.length > 0) {
                        configs.push({ shape: shape, value: value, attribute: attribute });
                    }
                });

                for (let c of configs) {
                    let score = 0;
                    if (c.shape != "any") {
                        score += 1;
                    }
                    if (c.attribute != "any") {
                        score += 1;
                    }
                    c.specificity = score;
                }
                configs.sort((a, b) => {
                    return b.specificity - a.specificity;
                });

                console.log(configs);
                let startPositions = getStartPositions();
                console.log(startPositions);
                let model = this.board.getNumericModel();
                const myWorker = new Worker("src/solver/worker.js", { type: 'module' });
                myWorker.postMessage({ model: model, configs: configs, startPositions: startPositions });
                myWorker.onmessage = (event) => {

                    this.pathManager.initialBoard = model;

                    document.getElementById("solve-button").classList.remove("button--loading");
                    document.getElementById("solution-window").classList.toggle("fade-border");

                    let solution = event.data.solution;

                    for (let i = 0; i < 20; i++) {
                        solution = event.data.solutionList[i];
                        if (event.data.solutionList[i].comboList.length > 1) {
                            let newSolution = document.createElement("solver-solution");
                            newSolution.pathManager = this.pathManager;
                            newSolution.solutionData = solution;
                            document.getElementById("combo-paths").appendChild(newSolution);

                        }
                    }
                    document.getElementById("combo-paths").children[0].click();
                    this.board.solveInProgress = false;
                }
            }
        });
    }

    pauseRoulettes() {
        for (let t of this.rouletteTweens) {
            t.pause();
        }
    }

    resumeRoulettes() {
        for (let t of this.rouletteTweens) {
            t.restart();
        }
    }
}


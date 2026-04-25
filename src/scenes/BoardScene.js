import Board from "../UI/Board.js";
import getStartPositions from "../components/position-select-modal.js";
import { ORB_HEIGHT } from "../UI/Orb.js";
import PathManager from "../UI/PathManager.js";
import EditToolbar from "../UI/EditToolbar.js";
import { Scene, Math as PhaserMath } from "phaser";

export default class BoardScene extends Scene {

    constructor() {
        super("BoardScene");
    }

    preload() {

        this.load.image('fire', 'assets/orbs/fire.webp');
        this.load.image('water', 'assets/orbs/water.webp');
        this.load.image('wood', 'assets/orbs/wood.webp');
        this.load.image('light', 'assets/orbs/light.webp');
        this.load.image('dark', 'assets/orbs/dark.webp');
        this.load.image('heart', 'assets/orbs/heart.webp');
        this.load.image('poison', 'assets/orbs/poison.webp');
        this.load.image('mortal_poison', 'assets/orbs/mortal_poison.webp');
        this.load.image('jammer', 'assets/orbs/jammer.webp');
        this.load.image('bomb', 'assets/orbs/bomb.webp');
        this.load.image('plus', 'assets/modifiers/plus.webp');
        this.load.image('roulette', 'assets/modifiers/roulette.webp');

    }

    create() {

        this.add.grid(0, 0, ORB_HEIGHT * 6, ORB_HEIGHT * 5, ORB_HEIGHT, ORB_HEIGHT, 0x1c130f)
            .setAltFillStyle(0x2e201a)
            .setOrigin(0, 0).setDepth(-999);

        this.board = new Board(this, ORB_HEIGHT / 2, ORB_HEIGHT / 2);
        this.pathManager = new PathManager(this, null, this.board);

        this.rouletteTweens = [];

        this.createBoardButtons();
        new EditToolbar(this);
        this.createSideBarToggles();
        this.createDialogListeners();
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
            });
        });

        const menuBtn = document.querySelector('#menu-button');
        menuBtn.addEventListener('click', () => {
            document.querySelector(".menu-icons").showModal();
        });
        const menuModal = document.querySelector('.menu-icons');
        menuModal.addEventListener("click", (e) => {
            menuModal.close();
        });

        const solverButton = document.querySelector('.solver-config-button');
        solverButton.addEventListener('click', () => {
            document.querySelector(".solver-config-modal").showModal();
        });

        const mobileQuery = window.matchMedia('(max-width: 1024px)');
        mobileQuery.addEventListener('change', this.handleLayoutChange.bind(this));
        this.handleLayoutChange(mobileQuery);

        const addConfigButton = document.querySelector('.add-config-button');
        const orbWeightContainer = document.querySelector('.orb-weight-container');
        addConfigButton.addEventListener('click', () => {
            let newNode = document.createElement("combo-config");
            orbWeightContainer.appendChild(newNode);
        });
    }

    handleLayoutChange(e) {
        let menuModal2 = document.querySelector(".solver-config-modal");
        const content = document.querySelector('.solver-config-container');
        const originalParent = document.querySelector('.main-container');
        if (e.matches) {

            content.style.display = "block";
            menuModal2.appendChild(content);
        } else {
            originalParent.appendChild(content);
        }
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
                const arr = Array.from({ length: 30 }, () => PhaserMath.Between(0, 5));
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

                let startPositions = getStartPositions();
                let model = this.board.getNumericModel();
                const myWorker = new Worker(new URL("../solver/worker.js", import.meta.url), { type: 'module' });
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


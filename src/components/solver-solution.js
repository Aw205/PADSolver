import { phrases } from "./language-modal.js";
import { ORB_TYPE_MAP } from "../UI/Orb.js";

class SolverSolution extends HTMLElement {

    #stats;
    #pathManagerRef;
    constructor() {
        super();
    }

    set pathManager(path) {

        this.#pathManagerRef = path;
    }

    set solutionData(solution) {

        let freqMap = new Map();
        let comboHtml = ``;
        for (let combo of solution.comboList) {
            let color = ORB_TYPE_MAP.get(combo.color);
            freqMap.set(color, (freqMap.get(color) || 0) + 1);
        }
        for (const [key, value] of freqMap) {
            comboHtml += ` <img src="assets/orbs/${key}.svg">x${value}`;
        }

        let count = 0;
        for (let combo of solution.comboList) {
            count += combo.number;
        }
        let dirChanges = 0;
        let prevDiff = 0;
        for (let i = 1; i < solution.path.length; i++) {
            let diff = solution.path[i] - solution.path[i - 1];
            if (diff != prevDiff) {
                dirChanges++;
                prevDiff = diff;
            }
        }

        this.#stats = {
            combos: solution.comboList.length,
            score: solution.score,
            pathLength: solution.path.length,
            dirChange: dirChanges,
            orbsCleared: count
        };

        this.innerHTML = `
                <div class="solution-header">
                    <span>${phrases["score"]}=${solution.score.toFixed(2)}</span>
                    <span>${phrases["combos"]}=${solution.comboList.length}</span>
                    <span>${phrases["path length"]}=${solution.path.length}</span>
                </div>
                <div class="combo-container">${comboHtml}</div>`;

        this.addEventListener('click', () => {

            document.getElementById("auto-combo-count").textContent = this.#stats.combos;
            document.getElementById("score-count").textContent = this.#stats.score.toFixed(2);
            document.getElementById("auto-path-length-count").textContent = this.#stats.pathLength;
            document.getElementById("auto-direction-change-count").textContent = this.#stats.dirChange;
            document.getElementById("auto-orb-clear-count").textContent = this.#stats.orbsCleared;
            document.querySelector(".path-select")?.classList.remove("path-select");
            this.classList.add("path-select");

            this.#pathManagerRef.setPath(solution.path);
        });
    }
}
customElements.define('solver-solution', SolverSolution);
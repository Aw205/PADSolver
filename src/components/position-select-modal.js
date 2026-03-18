class PositionSelectModal extends HTMLElement {

    constructor() {
        super();
    }

    connectedCallback() {

        let gridHTML = "";
        for (let i = 0; i < 30; i++) {
            gridHTML += `<div class="position-select-orb position-select-active" data-index=${i}></div>`;
        }
        this.innerHTML = `
        <dialog class="position-select-modal">
            <button class="close-button">&times</button>
            <div style="font: 1rem kreon; color: gray; margin-bottom: 1rem;" data-i18n="select starting positions"></div>
            <button class="clear-button" data-i18n="clear"></button>
            <button class="select-all-button" data-i18n="select all"></button>
            <div class="select-position-grid">
                ${gridHTML}
            </div>
        </dialog>`;

        document.getElementById("position-edit-icon").addEventListener("click", (e) => {
            this.querySelector("dialog").showModal();
        });

        this.querySelector(".clear-button").addEventListener("click", () => {
            let selectOrbs = this.querySelectorAll(".position-select-orb");
            selectOrbs.forEach((e) => {
                e.classList.remove("position-select-active");
            });
        });

        this.querySelector(".select-all-button").addEventListener("click", () => {
            let selectOrbs = this.querySelectorAll(".position-select-orb");
            selectOrbs.forEach((e) => {
                e.classList.add("position-select-active");
            });
        });

        this.querySelector(".select-position-grid").addEventListener("click",(event)=>{
            if(event.target.dataset.index != undefined){
                event.target.classList.toggle("position-select-active");
            }
        });
    }
}

export default function getStartPositions() {

    let startPositions = [];
    document.querySelectorAll(".position-select-active").forEach((e) => {
        startPositions.push(e.dataset.index);
    });
    return startPositions;
}

customElements.define('position-select-modal', PositionSelectModal);
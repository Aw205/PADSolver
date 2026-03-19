class ToOrbModal extends HTMLElement {

    constructor() {
        super();
    }

    connectedCallback() {
        this.innerHTML =
            `
            <dialog class="to-orb-menu">
                <img src="assets/images/orbs/fire.svg" data-type="Fire" draggable="false" class="palette-active">
                <img src="assets/images/orbs/water.svg" data-type="Water" draggable="false">
                <img src="assets/images/orbs/wood.svg" data-type="Wood" draggable="false">
                <img src="assets/images/orbs/light.svg" data-type="Light" draggable="false">
                <img src="assets/images/orbs/dark.svg" data-type="Dark" draggable="false">
                <img src="assets/images/orbs/heart.svg" data-type="Heart" draggable="false">
            </dialog>`;

        let toOrb = document.getElementById("to-orb");
        this.addEventListener("click", (e) => {

            let orb = e.target;
            if (orb.dataset.type != undefined) {
                toOrb.src = e.target.src;
                toOrb.dataset.type = e.target.dataset.type;
                this.querySelector(".palette-active").classList.remove("palette-active");
                orb.classList.add("palette-active");
            }
        });

    }

}

customElements.define('to-orb-modal', ToOrbModal);
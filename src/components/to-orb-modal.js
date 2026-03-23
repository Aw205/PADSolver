class ToOrbModal extends HTMLElement {

    constructor() {
        super();
    }

    connectedCallback() {
        this.innerHTML =
            `
            <dialog class="to-orb-menu">
                <img src="assets/orbs/fire.svg" data-type="fire" draggable="false" class="palette-active">
                <img src="assets/orbs/water.svg" data-type="water" draggable="false">
                <img src="assets/orbs/wood.svg" data-type="wood" draggable="false">
                <img src="assets/orbs/light.svg" data-type="light" draggable="false">
                <img src="assets/orbs/dark.svg" data-type="dark" draggable="false">
                <img src="assets/orbs/heart.svg" data-type="heart" draggable="false">
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
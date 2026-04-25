class ToOrbModal extends HTMLElement {

    constructor() {
        super();
    }

    connectedCallback() {
        this.innerHTML =
            `
            <dialog class="to-orb-menu">
                <img src="assets/orbs/fire.webp" data-type="fire" draggable="false" class="palette-active" alt="fire">
                <img src="assets/orbs/water.webp" data-type="water" draggable="false" alt="water">
                <img src="assets/orbs/wood.webp" data-type="wood" draggable="false" alt="wood">
                <img src="assets/orbs/light.webp" data-type="light" draggable="false" alt="light">
                <img src="assets/orbs/dark.webp" data-type="dark" draggable="false" alt="dark">
                <img src="assets/orbs/heart.webp" data-type="heart" draggable="false" alt="heart">
                <img src="assets/images/orbs/poison.webp" data-type="poison" draggable="false" alt="Poison orb">
                <img src="assets/images/orbs/mortal_poison.webp" data-type="mortal_poison" draggable="false" alt="Mortal poison orb">
                <img src="assets/images/orbs/jammer.webp" data-type="jammer" draggable="false" alt="Jammer orb">
                <img src="assets/images/orbs/bomb.webp" data-type="bomb" draggable="false" alt="Bomb orb">
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
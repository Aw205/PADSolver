
export const five = 5;

class ComboConfig extends HTMLElement {

    constructor() {
        super();
    }

    connectedCallback() {

        this.innerHTML = `
        <span class="material-symbols-outlined" style="color:indianred; cursor: pointer;">delete</span>
        <img src="assets/UI/unknown.webp" class="shape-image">
        <select class="shape-select">
            <option value="" disabled selected hidden data-i18n="shape">Shape</option>
            <option value="TPA" data-i18n="tpa">TPA</option>
            <option value="VDP" data-i18n="vdp">VDP</option>
            <option value="L" data-i18n="l">L</option>
            <option value="cross" data-i18n="cross">Cross</option>
            <option value="any" data-i18n="any">Any</option>
        </select>
        <label>1.5</label>
        <input type="range" step="0.1" max="3">
        <img src="assets/UI/unknown.webp" class="attribute-image">
        <select class="attribute-select">
            <option value="" disabled selected hidden data-i18n="attribute">Attribute</option>
            <option value="0" data-i18n="fire">Fire</option>
            <option value="1" data-i18n="water">Water</option>
            <option value="2" data-i18n="wood">Wood</option>
            <option value="3" data-i18n="light">Light</option>
            <option value="4" data-i18n="dark">Dark</option>
            <option value="any" data-i18n="any">Any</option>
        </select>`;

        let range = this.querySelector("input");
        let label = this.querySelector("label");
        let shapeSelect = this.querySelector(".shape-select");
        let shapeImg = this.querySelector(".shape-image");
        let attributeSelect = this.querySelector(".attribute-select");
        let attributeImg = this.querySelector(".attribute-image");
        let trash = this.querySelector("span");

        shapeSelect.addEventListener("change", (event) => {
            shapeImg.src = `assets/UI/awakenings/${event.target.value}.webp`;
        });

        attributeSelect.addEventListener("change", (event) => {

            let names = ["fire", "water", "wood", "light", "dark", "heart","any"];

            if(event.target.value == "any"){
                attributeImg.src = `assets/images/orbs/any.webp`;
                range.className = "any";
            }
            else{
                attributeImg.src = `assets/images/orbs/${names[event.target.value]}.webp`;
                range.className = names[event.target.value];
            }

           
        });
        range.addEventListener("input", function () {
            label.innerHTML = this.value;
        });

        trash.addEventListener("click", () => {
            this.remove();
        });

    }

    static getConfigurations(){
        let configs = [];
        document.querySelectorAll("combo-config").forEach((e) => {
            let shape = e.querySelector(".shape-select").value;
            let value = e.querySelector("input").value;
            let attribute =  e.querySelector(".attribute-select").value;
            configs.push({shape:shape, value: value, attribute: attribute});
        });
        return configs;
    }
}

customElements.define('combo-config', ComboConfig);
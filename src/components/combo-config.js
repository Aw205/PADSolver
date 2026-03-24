
class ComboConfig extends HTMLElement {

    constructor() {
        super();
    }

    connectedCallback() {

        if (this.innerHTML.trim() !== "") return;

        const template = document.getElementById('combo-config-template');
        const templateContent = document.importNode(template.content, true);

        let rangeLabel = templateContent.querySelector(".range-label");
        let range = rangeLabel.querySelector("input");
        let rangeValue = rangeLabel.querySelector("span");

        let shapeSelect = templateContent.querySelector(".shape-select");
        let shapeImg = templateContent.querySelector(".shape-image");
        let attributeSelect = templateContent.querySelector(".attribute-select");
        let attributeImg = templateContent.querySelector(".attribute-image");
        let trash = templateContent.querySelector("span");

        shapeSelect.addEventListener("change", (event) => {
            shapeImg.src = `assets/awakenings/${event.target.value}.webp`;
        });

        attributeSelect.addEventListener("change", (event) => {

            let names = ["fire", "water", "wood", "light", "dark", "heart", "any"];

            if (event.target.value == "any") {
                attributeImg.src = `assets/orbs/any.svg`;
                range.className = "any";
            }
            else {
                attributeImg.src = `assets/orbs/${names[event.target.value]}.webp`;
                range.className = names[event.target.value];
            }
        });
        range.addEventListener("input", function () {
            rangeValue.textContent = this.value;
        });

        trash.addEventListener("click", () => {
            this.remove();
        });

        this.appendChild(templateContent);

    }

    static getConfigurations() {
        let configs = [];
        document.querySelectorAll("combo-config").forEach((e) => {
            let shape = e.querySelector(".shape-select").value;
            let value = e.querySelector("input").value;
            let attribute = e.querySelector(".attribute-select").value;
            configs.push({ shape: shape, value: value, attribute: attribute });
        });
        return configs;
    }
}

customElements.define('combo-config', ComboConfig);
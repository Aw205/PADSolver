import { ORB_TYPE_MAP,Orb } from "./Orb";

export default class EditToolbar {

    constructor(scene) {
        this.scene = scene;
        this.createListeners();
        this.createOrbChangeListeners();
    }

    createListeners() {

        let timerToggle = document.getElementById("timer-toggle");
        let timerProgress = document.querySelector(".timer-progress-bar");
        timerToggle.addEventListener("click", (e) => {
            if (e.target.tagName != "INPUT") {
                timerProgress.classList.toggle("progress-active");
            }
        });

        let paletteToggle = document.querySelector(".palette-toggle");
        let modifierToggle = document.querySelector(".modifier-toggle");
        let parent = paletteToggle.parentElement;

        parent.addEventListener("click", (e) => {

            if (e.target.classList.length > 0) {
                parent.querySelector(`.button-activate:not(.${e.target.classList[1]})`)?.classList.toggle("button-activate");
                e.target.classList.toggle("button-activate");
                document.querySelector(`.${e.target.dataset.container}`).classList.toggle("show");
                document.querySelector(`.auxiliary-container .show:not(.${e.target.dataset.container})`)?.classList.remove("show");

                if (e.target.classList.contains("palette-toggle") || e.target.classList.contains("modifier-toggle")) {

                    this.scene.input.removeAllListeners("pointermove");
                    this.scene.input.removeAllListeners("pointerdown");
                    this.scene.board.setOrbInteractive(true);

                    let toggleFunc = e.target.dataset.container == "palette-container" ? this.paletteFunc.bind(this) : this.modifierFunc;
                    if (e.target.classList.contains("button-activate")) {

                        this.scene.board.setOrbInteractive(false);
                        this.scene.input.on("pointerdown", (pointer, currentlyOver) => {
                            toggleFunc(e.target, currentlyOver);
                        });
                        this.scene.input.on("pointermove", (pointer, currentlyOver) => {
                            if (pointer.isDown) {
                                toggleFunc(e.target, currentlyOver);
                            }
                        });
                    }
                }
            }
        });

        document.querySelectorAll(".palette-container, .modifier-container").forEach((container) => {
            container.addEventListener("click", (e) => {
                if (e.target.tagName == "IMG") {
                    container.querySelector(".palette-active")?.classList.remove("palette-active");
                    e.target.classList.add("palette-active");
                    let toggle = container.classList[0] == "palette-container" ? paletteToggle : modifierToggle;
                    toggle.dataset.type = e.target.dataset.type;
                }
            });
        })
    }

    createOrbChangeListeners() {

        document.querySelector(".orb-change-container").addEventListener("click", (e) => {

            if (e.target.id == "to-orb") {
                document.querySelector(".to-orb-menu").showModal();
            }
            else if (e.target.className == "orb-change-button") {
                let from = [];
                for (let ele of document.querySelectorAll(".from-orbs .palette-active")) {
                    from.push(ORB_TYPE_MAP.get(ele.dataset.type));
                }
                let to = ORB_TYPE_MAP.get(document.getElementById("to-orb").dataset.type);
                this.scene.board.changeOrbs(from, to);
            }
            else if (e.target.tagName == "IMG") {
                e.target.classList.toggle("palette-active");
            }
        });
    }

    paletteFunc(toggle, currentlyOver) {
        currentlyOver[0].orb?.setType(ORB_TYPE_MAP.get(toggle.dataset.type), true);
        if (currentlyOver[0].orb == undefined) {
            let slot = currentlyOver[0];
            let newOrb = new Orb(this.scene, slot.x, slot.y, ORB_TYPE_MAP.get(toggle.dataset.type));
            slot.orb = newOrb;
            this.scene.board.orbArray[slot.index] = slot.orb;
            newOrb.slot = slot;
            newOrb.disableInteractive();
        }
    }

    modifierFunc(toggle, currentlyOver) {

        let type = toggle.dataset.type;
        if (type == "enhance") {
            let o = currentlyOver[0].orb;
            if (!o.isEnhanced) {
                o.enhance();
            }
        }
        else if (type == "blind") {
            let o = currentlyOver[0].orb;
            if (!o.isBlind) {
                o.blind();
            }
        }
        else if (type == "roulette") {
            currentlyOver[0].orb?.slot.addRoulette();
        }
        else if (type == "erase") {
            currentlyOver[0].orb?.removeModifiers();
        }
    }
}
class EditToolbar {

    constructor(scene) {
        this.scene = scene;
        this.createListeners();
    }

    createListeners() {

        let ids = ["Fire", "Water", "Wood", "Light", "Dark", "Heart"];

        let paletteToggle = document.getElementById("palette-toggle");
        paletteToggle.addEventListener("click", (e) => {

            document.querySelector(".palette-container").classList.toggle("show");
            this.scene.input.removeAllListeners("pointermove");
            this.scene.input.removeAllListeners("pointerdown");
            this.scene.board.setOrbInteractive(true);
            document.querySelectorAll(".board-edit .button-activate").forEach((tool) => {
                if (tool != e.currentTarget) {
                    tool.classList.toggle("button-activate");
                }
            });
            e.currentTarget.classList.toggle("button-activate");
            let ele = document.querySelector(".auxiliary-container .show:not(.palette-container)")
            if (ele != undefined) {
                ele.classList.remove("show");
            }
            if (e.currentTarget.classList.contains("button-activate")) {
                this.scene.board.setOrbInteractive(false);
                this.scene.input.on("pointerdown", (pointer, currentlyOver) => {
                    currentlyOver[0].orb?.setType(ids.indexOf(paletteToggle.dataset.type));

                    if (currentlyOver[0].orb == undefined) {
                        let slot = currentlyOver[0];
                        let newOrb = new Orb(this.scene, slot.x, slot.y, ORB_TYPE_TO_TEXTURE_KEY[ids.indexOf(paletteToggle.dataset.type)]);
                        slot.orb = newOrb;
                        this.scene.board.orbArray[slot.index] = slot.orb;
                        newOrb.slot = slot;
                        newOrb.disableInteractive();
                    }
                })
                this.scene.input.on("pointermove", (pointer, currentlyOver) => {
                    if (pointer.isDown) {
                        currentlyOver[0].orb?.setType(ids.indexOf(paletteToggle.dataset.type));

                        if (currentlyOver[0].orb == undefined) {
                            let slot = currentlyOver[0];
                            let newOrb = new Orb(this.scene, slot.x, slot.y, ORB_TYPE_TO_TEXTURE_KEY[ids.indexOf(paletteToggle.dataset.type)]);
                            slot.orb = newOrb;
                            this.scene.board.orbArray[slot.index] = slot.orb;
                            newOrb.slot = slot;
                            newOrb.disableInteractive();
                        }
                    }
                });
            }
        });

        let orbs = document.querySelector(".palette-container").children;
        for (let o of orbs) {
            o.addEventListener("click", (event) => {
                document.querySelector(".palette-container .palette-active")?.classList.remove("palette-active");
                event.target.classList.add("palette-active");
                paletteToggle.dataset.type = o.dataset.type;
            });
        }


        let orbModifierContainer = document.querySelector(".orb-modifier-container");
        orbModifierContainer.addEventListener("click", (e) => {

            document.querySelector(".modifier-container").classList.toggle("show");

            this.scene.input.removeAllListeners("pointerdown");
            this.scene.input.removeAllListeners("pointermove");
            this.scene.board.setOrbInteractive(true);

            document.querySelectorAll(".board-edit .button-activate").forEach((tool) => {
                if (tool != e.currentTarget) {
                    tool.classList.toggle("button-activate");
                }
            });
            e.currentTarget.classList.toggle("button-activate");
            let ele = document.querySelector(".auxiliary-container .show:not(.modifier-container)")
            if (ele != undefined) {
                ele.classList.remove("show");
            }

            if (e.currentTarget.classList.contains("button-activate")) {
                this.scene.board.setOrbInteractive(false);
                this.scene.input.on("pointerdown", (pointer, currentlyOver) => {
                    if (pointer.isDown) {
                        let modifier = orbModifierContainer.dataset.modifier;
                        if (modifier == "enhance") {
                            currentlyOver[0].orb?.enhance();
                        }
                        else if (modifier == "blind") {
                            let o = currentlyOver[0].orb;
                            if (!o.isBlind) {
                                o.blind();
                            }
                        }
                        else if (modifier = "roulette") {
                            currentlyOver[0].orb?.slot.addRoulette();
                        }
                    }

                });
                this.scene.input.on("pointermove", (pointer, currentlyOver) => {
                    if (pointer.isDown) {
                        let modifier = orbModifierContainer.dataset.modifier;
                        if (modifier == "enhance") {
                            currentlyOver[0].orb?.enhance();
                        }
                        else if (modifier == "blind") {
                            let o = currentlyOver[0].orb;
                            if (!o.isBlind) {
                                o.blind();
                            }
                        }
                    }
                });
            }


        });
        let modifierContainer = document.querySelector(".modifier-container");
        for (let e of modifierContainer.children) {
            e.addEventListener("click", () => {
                modifierContainer.querySelectorAll(".palette-active").forEach((tool) => {
                    if (tool != e) {
                        tool.classList.remove("palette-active");
                    }
                });
                event.target.classList.add("palette-active");
                orbModifierContainer.dataset.modifier = e.dataset.modifier;
            });
        }

        document.querySelector(".orb-change-button-container").addEventListener("click", (e) => {

            document.querySelector(".orb-change-container").classList.toggle("show");
            document.querySelectorAll(".board-edit .button-activate").forEach((tool) => {
                if (tool != e.currentTarget) {
                    tool.classList.toggle("button-activate");
                }
            });
            e.currentTarget.classList.toggle("button-activate");
            let ele = document.querySelector(".auxiliary-container .show:not(.orb-change-container)")
            if (ele != undefined) {
                ele.classList.remove("show");
            }
        });

        let fromArr = document.querySelector(".from-orbs");
        for (let c of fromArr.children) {
            c.addEventListener("click", (e) => {
                c.classList.toggle("palette-active");
            });
        }

        document.getElementById("to-orb").addEventListener("click", (e) => {
            document.querySelector(".to-orb-menu").showModal();
        });

        document.querySelector(".orb-change-button").addEventListener("click", () => {
            let from = [];
            for (let ele of document.querySelectorAll(".from-orbs .palette-active")) {
                from.push(ids.indexOf(ele.dataset.type));
            }
            let to = ids.indexOf(document.getElementById("to-orb").dataset.type);
            this.scene.board.changeOrbs(from, to);
        });
    }
}
class EditToolbar {



    constructor(scene) {
        this.scene = scene;
        this.create();
        this.createListeners();
    }

    create() {

        let orbImages = ``, orbFrom = ``, orbTo = ``;
        let ids = ["Fire", "Water", "Wood", "Light", "Dark", "Heart"];
        for (let id of ids) {
            orbImages += `<img id= "${id}-palette" class="palette-button" style="max-width: 10%;" src="assets/UI/${id}.svg">`;
            orbFrom += `<img id= "${id}-from" class="palette-button" style="max-width: 60%; height: auto;" src="assets/UI/${id}.svg">`
            orbTo += `<img id= "${id}-to" class="palette-button" style="max-width: 60%; height: auto;" src="assets/UI/${id}.svg">`
        }

        let html = `
                <div style= "background-color: rgb(40,40,40); padding: 0.7rem 0.7rem 0 1rem; height: 50px; display:inline-flex;">
                    <button class="tablinks edit-board-button" data-name="orb-palette"> 
                        <img src="assets/UI/orbPalette.svg" style="vertical-align: middle;"> Orb Palette 
                    </button>
                    <button class="tablinks edit-board-button" data-name="orb-change"> 
                        <img src="assets/UI/orbChange.png" style="height:50%; width:auto; vertical-align: middle;"> Orb Change 
                    </button>
                    <button class="tablinks edit-board-button" data-name="CTW">
                        <img src="assets/UI/yomi.png" style="max-height:100%; max-width:80%; vertical-align: middle;"> Change the World
                    </button>
                </div>
                
                <div id = "edit-background">

                    <div class="tab-content" id="orb-palette">
                        <div style="display: flex; height: 100%; justify-content: space-evenly; align-items: center;"> 
                            ${orbImages}
                            <i id="exit-button" class="fa-regular fa-2xl fa-circle-xmark" style="color: gray; cursor: pointer; transition: scale 0.2s;"></i>
                        </div>
                    </div>

                    <div class="tab-content" id="orb-change">
                        <div style="display: flex; height: 100%; justify-content: center; align-items: center;">
                            <div style="display:grid;height: 100%; grid-template-columns: auto auto auto; place-items: center;"> 
                                ${orbFrom}
                            </div>
                            <button id ="orb-convert-button" class="orb-change-button"> &rarr; </button>
                            <div style="display:grid;height: 100%; grid-template-columns: auto auto auto; place-items: center;"> 
                                ${orbTo}
                            </div>
                        </div>
                    </div>

                    <div class="tab-content" id="CTW" style="font: 2em kreon; color: gray;"> 
                        <div style="display:flex; align-items: center; height: 100%; user-select: none; justify-content: center;">  
                            <div> Move orbs freely! </div> 
                        </div>
                    </div>

                </div>`;

        this.scene.add.dom(420, 830).createFromHTML(html);
    }

    createListeners() {

        let ids = ["Fire", "Water", "Wood", "Light", "Dark", "Heart"];

        for (let id of ids) {

            document.getElementById(`${id}-palette`).addEventListener("pointerup", (event) => {

                document.querySelector("#orb-palette .palette-active")?.classList.remove("palette-active");
                event.target.classList.add("palette-active");

                this.scene.input.setDefaultCursor(`url(assets/UI/paintbrush.svg) 0 64, auto`);
                this.scene.input.on("pointermove", (pointer, currentlyOver) => {
                    if (pointer.isDown && currentlyOver.length > 0) {
                        currentlyOver[0].orb.setType(ids.indexOf(id));
                    }
                });
                this.scene.board.setOrbInteractive(false);
            });

            document.getElementById(`${id}-from`).addEventListener("pointerup", (event) => {
                event.target.classList.toggle("palette-active");
            });
            document.getElementById(`${id}-to`).addEventListener("pointerup", (event) => {
                document.querySelector("[id$='to'].palette-active")?.classList.remove("palette-active");
                event.target.classList.add("palette-active");
            });
        }

        document.getElementById("orb-convert-button").addEventListener("click", () => {

            let from = [];
            let to = null;

            for (let id of ids) {
                if (document.getElementById(`${id}-from`).classList.contains("palette-active")) {
                    from.push(ids.indexOf(id));
                }
                if (document.getElementById(`${id}-to`).classList.contains("palette-active")) {
                    to = ids.indexOf(id);
                }
            }
            this.scene.board.changeOrbs(from, to);
        });

        document.getElementById("exit-button").addEventListener("pointerup", () => {

            this.scene.input.setDefaultCursor("default");
            this.scene.input.removeAllListeners("pointermove");
            document.querySelector("#orb-palette .palette-active")?.classList.remove("palette-active");
            if (!this.scene.board.orbArray.flat().some(o => o === null)) {
                this.scene.board.setOrbInteractive(true);
            }
        });
    }
}
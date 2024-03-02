class SettingModal{

    constructor(scene){
        this.scene = scene;
        this.create();
    }


    create(){

        let s = ``;
        let ids = ["Fire", "Water", "Wood", "Light", "Dark", "Heart"];
        for (let id of ids) {
            s += `<img id= "${id}-rando" class="palette-button" width="70" height="70" src="assets/UI/${id}.svg">`;
        }
        let html = `

        <dialog id = "setting-dialog-modal" class="settings-dialog">
            <button class="tablinks" data-name="randomizer-setting" id="default-open" >Randomizer</button>
            <button class="tablinks" data-name="board-setting">Board</button>
            <button class="tablinks" data-name="solver-setting">Solver</button>
            <button id="modal-close-button" style="position:absolute; right:5%; background-color:transparent;">
                <span class="close">&times;</span>
            </button>
            <div id="randomizer-setting" class="tab-content">
                <p>select/deselect orbs </p> 
                ${s} <br>
                <input type="checkbox" id="random-position-checkbox" value="Bike">
                <label for="random-position-checkbox"> Only randomize position </label> <br>

                <div style="padding-top: 50px;display:flex; flex-direction: column; gap: 60px;">
                    <input type="range" min="1" max="30" value="15" class="slid fire-slider">
                    <input type="range" min="1" max="30" value="15" class="slid water-slider">
                    <input type="range" min="1" max="30" value="15" class="slid wood-slider">
                    <input type="range" min="1" max="30" value="15" class="slid dark-slider">
                    <input type="range" min="1" max="30" value="15" class="slid light-slider">
                    <input type="range" min="1" max="30" value="15" class="slid heart-slider">
                </div>

            </div>
            <div id="board-setting" class="tab-content">

                <label style="font: 24px kreon; color: DarkGray; user-select: none; display: inline-block;" for="skyfall">Skyfall</label>
                <label class="switch">
                    <input id="skyfall" type="checkbox">
                    <span class="slider round"></span>
                </label>
                    
                <label style="font: 20px kreon; color: DarkGray; user-select: none; display: inline-block;" for="speed-select">Animation Speed</label>
                <select id="speed-select" style="font: 16px kreon;">
                    <option value="Slow">Slow</option>
                    <option value="Medium" selected >Medium</option>
                    <option value="Fast">Fast</option>
                </select>
                

            </div>
            <div id="solver-setting" class="tab-content">
            </div>
        </dialog>`;

        this.scene.add.dom(100, 100).createFromHTML(html);

        let tablinks = document.getElementsByClassName("tablinks");
        for (let i = 0; i < tablinks.length; i++) {
            tablinks[i].addEventListener("click", (event) => {
                let tabcontent = document.getElementsByClassName("tab-content");
                for (let j = 0; j < tabcontent.length; j++) {
                    tabcontent[j].style.display = "none";
                }
                for (let j = 0; j < tablinks.length; j++) {
                    tablinks[j].className = tablinks[j].className.replace("active", "");
                }
                document.getElementById(tablinks[i].dataset.name).style.display = "block";
                //document.getElementById(tablinks[i].dataset.name).style.display = "flex";
                event.currentTarget.className += " active";
            });
        }

        //const dialog = document.querySelector("dialog");
        const dialog = document.querySelector("#setting-dialog-modal");
        const showButton = document.querySelector("#show-dialog-button");
        const closeButton = document.querySelector("#modal-close-button");

        closeButton.addEventListener("click", () => {
            dialog.close();
        });

        document.getElementById("default-open").click();

        // showButton.addEventListener("click", () => {
        //     dialog.showModal();
        // });

    }

}
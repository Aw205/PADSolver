class SaveModal {


    static pixelOrbs = [];

    constructor(scene) {
        this.scene = scene;
        this.thumbnailHTML = null;
        this.currBoardModel = null;

        this.create();
    }

    create() {

        let html = `

        <dialog id="save-board-modal" class="save-modal">
            <div style="display: flex; flex-direction: column; justify-content: space-around; gap: 20px; align-items: center;">
                <div id="save-modal-thumbnail"> </div>
                <input id= "save-modal-input" type="text" placeholder="Enter board name" style="background-color: black; font: 1rem kreon; color: beige; border-radius: 10px; border: 1px solid gray; width: 60%;"/>
                <div style="display: flex; flex-direction:row; gap: 3%;"> 
                    <button id="save-button"style="background-color:SeaGreen;"> Save </button>
                    <button id ="save-modal-cancel-button" style="background-color: transparent;"> Cancel </button>
                </div>
            </div>
        </dialog>`;

        this.scene.add.dom(100, 100).createFromHTML(html);

        for (let id of ["Fire", "Water", "Wood", "Light", "Dark", "Heart"]) {
            this.preloadImage(`assets/images/orbs/${id}Pixel.png`);
        }

        let saveOpenButton = document.getElementById("save-modal-open-button");
        saveOpenButton.addEventListener("pointerup", () => {

            document.getElementById("save-board-modal").showModal();

            let board = this.scene.board.getNumericModel();
            this.currBoardModel = board;

            let html = SaveModal.getThumbnailHTML(board);

            document.getElementById("save-modal-thumbnail").innerHTML = html;
            this.thumbnailHTML = html;
        });

        let cancelButton = document.getElementById("save-modal-cancel-button");
        cancelButton.addEventListener("pointerup", () => {

            document.getElementById("save-board-modal").close();
        });

        let saveButton = document.getElementById("save-button");
        saveButton.addEventListener("pointerup", () => {

            document.getElementById("save-board-modal").close();
            let boardName = document.getElementById("save-modal-input").value;
            if (boardName.trim().length == 0) {
                boardName = "Untitled";
            }
            localStorage.setItem(boardName, JSON.stringify(this.currBoardModel));
            this.scene.events.emit("saveBoard", {imageHTML: this.thumbnailHTML, name: boardName, model: this.currBoardModel });
        });

    }

    static getThumbnailHTML(board) {

        let canvas = document.getElementById('loadBoardCanvas');
        let ctx = canvas.getContext('2d');
        let orbSize = 50;

        for(let i = 0; i< 30;i++){
            ctx.drawImage(SaveModal.pixelOrbs[board[i]], (i%6) * orbSize, Math.floor(i/6) * orbSize, orbSize, orbSize);
        }

        let url = canvas.toDataURL('image/png');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return `<img src="${url}" class="thumbnail">`;
    }

    preloadImage(url) {
        let img = new Image();
        img.src = url;
        img.style.display = "none";
        SaveModal.pixelOrbs.push(img);
    }

}
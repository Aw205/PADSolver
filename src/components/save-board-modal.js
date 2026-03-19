export default class SaveBoardModal extends HTMLElement {

    static pixelOrbs = [];

    constructor() {
        super();
    }

    connectedCallback() {

        this.innerHTML =
            `
        <dialog id="save-board-modal" class="save-modal">
            <button class="close-button">&times</button>
            <div class="input-container">
                <div id="save-modal-thumbnail"> </div>
                <input type="text" placeholder="Enter name..." autocomplete="off" maxlength="25" /> 
                <button class="save-button">Save</button>
            </div>
        </dialog>`;


        for (let id of ["fire", "water", "wood", "light", "dark", "heart"]) {
            this.preloadImage(`assets/images/orbs/${id}_pixel.webp`);
        }

        let input = this.querySelector("input");

        let saveOpenButton = document.getElementById("save-modal-open-button");
        saveOpenButton.addEventListener("click", () => {
            document.getElementById("save-board-modal").showModal();
            let html = SaveBoardModal.getThumbnailHTML(window.board.getNumericModel());
            document.getElementById("save-modal-thumbnail").innerHTML = html;
        });

        this.querySelector(".save-button").addEventListener("click", () => {

            Toastify({
                text: "Saved board",
                duration: 4000,
                style: {
                    background: "linear-gradient(90deg,rgba(42, 123, 155, 1) 0%, rgba(87, 199, 133, 1) 100%)"
                },
                gravity: "bottom",
                position: "left",
                className: "toast",
            }).showToast();

            document.getElementById("save-board-modal").close();
            let boardName = input.value;
            if (boardName.trim().length == 0) {
                boardName = "Untitled";
            }

            let boards = JSON.parse(localStorage.getItem("boards"));
            boards[boardName] = window.board.getNumericModel();
            localStorage.setItem("boards", JSON.stringify(boards));
        });

    }

    static getThumbnailHTML(board) {

        let canvas = document.getElementById('loadBoardCanvas');
        const ctx = canvas.getContext('2d');
        let orbSize = 10;
        ctx.imageSmoothingEnabled = false;
        for (let i = 0; i < 30; i++) {
            ctx.drawImage(SaveBoardModal.pixelOrbs[board[i]], (i % 6) * orbSize + (i % 6), Math.floor(i / 6) * orbSize + Math.floor(i / 6), orbSize, orbSize);
        }
        let url = canvas.toDataURL('image/webp');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return `<img src="${url}">`;
    }

    preloadImage(url) {
        let img = new Image(10, 10);
        img.src = url;
        img.style.display = "none";
        SaveBoardModal.pixelOrbs.push(img);
    }
}

customElements.define('save-board-modal', SaveBoardModal);
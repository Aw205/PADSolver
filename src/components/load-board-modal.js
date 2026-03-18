import SaveBoardModal from "./save-board-modal.js";

class LoadBoardModal extends HTMLElement {

    constructor() {
        super();
        this.boardList = [];
    }

    connectedCallback() {

        this.innerHTML = `
        <dialog class="load-dialog">
          <button class="close-button">&times</button>
            <div class="load-modal">
                <div class="search-container">
                    <span class="material-symbols-outlined">search</span>
                    <input type="text" placeholder="" data-i18n="search..."/>
                </div>
            <div class="board-list"></div>
            <div style="display: flex; justify-content: right;">
            <button class="load-button" data-i18n="load"></button>
            </div>
            </div>
        </dialog>`;

        const dialog = this.querySelector("dialog");
        document.querySelectorAll(".load-board-button").forEach((e) => {
            e.addEventListener("click", () => {
                dialog.showModal();
            });
        });

        const searchBar = this.querySelector("input");
        searchBar.addEventListener("input", () => {
            const filter = searchBar.value.toLowerCase();
            for (let board of this.boardList) {
                board.style.display = (board.name.toLowerCase().includes(filter)) ? '' : 'none';
            }
        });

        dialog.addEventListener("toggle", () => {
            this.readFromLocalStorage();
        });

        this.querySelector(".load-button").addEventListener("click", () => {

            let ele = this.querySelector(".active");
            if (ele != null) {
                window.board.setBoard(ele.board);
                Toastify({
                    text: "Loaded board",
                    duration: 4000,
                    style: {
                        background: "linear-gradient(90deg,rgba(42, 123, 155, 1) 0%, rgba(87, 199, 133, 1) 100%)"
                    },
                    gravity: "bottom",
                    position: "left",
                    className: "toast",
                }).showToast();

                this.querySelector("dialog").close();
            }
        });

    }

    readFromLocalStorage() {

        let listContainer = this.querySelector(".board-list");
        listContainer.replaceChildren();
        let boards = JSON.parse(localStorage.getItem("boards"));
        for (const [name, model] of Object.entries(boards)) {
            let thumbnailHTML = SaveBoardModal.getThumbnailHTML(model);
            let s = `<load-board-list-item>${thumbnailHTML}<span class="board-name">${name}</span></load-board-list-item>`;
            listContainer.insertAdjacentHTML("beforeend", s);
            listContainer.lastElementChild.board = model;
            listContainer.lastElementChild.name = name;
        }

        this.boardList = this.getElementsByTagName("load-board-list-item");
    }
}

customElements.define('load-board-modal', LoadBoardModal);
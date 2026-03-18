class LoadBoardListItem extends HTMLElement {

    board = null;
    name = null;
    constructor() {
        super();
    }

    set name(value){
        this.name = value;
    }

    set board(value) {
        this.board = value;
    }

    connectedCallback() {

        let insert = this.innerHTML;
        this.innerHTML = `${insert}<span class="material-symbols-outlined edit-name-button">edit_square</span><span class="material-symbols-outlined delete">delete</span>`;
        let listContainer = document.querySelector(".board-list");
        this.addEventListener("click", (event) => {
            listContainer.querySelector(".active")?.classList.remove("active");
            this.classList.add("active");
        });

        this.querySelector(".delete").addEventListener("click", () => {
            let boards = JSON.parse(localStorage.getItem("boards"));
            delete boards[this.name];
            localStorage.setItem("boards",JSON.stringify(boards));
            this.remove();
        });
    }
}

customElements.define('load-board-list-item', LoadBoardListItem);
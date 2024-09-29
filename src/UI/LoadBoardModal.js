class LoadBoardModal {

    constructor(scene) {
        this.scene = scene;
        this.create();

        this.boardID = 0;
        this.boardElements = [];
        this.boardList = [];
        this.currBoardModel = null;
        this.imageProcessor = new ImageProcessor();

    }

    create() {

        let html = `
            <dialog id="load-modal" class="load-modal">
                <button class="close-button">
                    <span class="close">&times</span>
                </button>
                <div style="display: flex; flex-direction: row; justify-content: center; padding-bottom: 2%;"> 
                    <i class="fa fa-magnifying-glass search-symbol"></i> 
                    <input type="text" placeholder="search.." class="search-bar"/>
                </div>

                <div id="thumbnail-grid" ></div>

                <div style="display:flex; background-color: rgb(35,35,35); border-radius: 10px; width: 100%; height:20%; align-items: center; justify-content: space-around; margin-top: 5%; "> 

                    <div style="display: flex; font:1.5rem kreon; color: darkgray; height: 80%; width: 35%; align-items: center; justify-content: space-around; user-select: none;"> Selected board:  
                        <img id="selected-board" style="background-color: rgb(25, 25, 25); aspect-ratio: 6/5; height: 100%; padding: 5px; object-fit:contain;"> 
                    </div>

                    <button id="load-button" > Load </button>
                    <img id="imageSrc" alt="No Image" style="display: none;" />
                    <canvas id="imageCanvas" style="background-color: blue; display:none;"></canvas>
                    <label style="font-size: 1.5rem; color: darkgray; border-radius: 10px; background-color: rgb(30, 30, 30); border: 2px outset gray; height: 40%; width:20%;display:flex; align-items: center; justify-content: center;cursor:pointer;">
                        <input id="upload-button" type="file" accept="image/*"/> Upload Screenshot
                    </label>
                </div>
            </dialog>`;

        this.scene.add.dom(100, 100).createFromHTML(html);

        const dialog = document.getElementById("load-modal");
        const showButton = document.querySelector("#load-board-button");
        const searchBar = document.querySelector(".search-bar");

        searchBar.addEventListener("input", () => {

            const filter = searchBar.value.toLowerCase();
            for (let board of this.boardElements) {
                board.style.display = (board.dataset.name.toLowerCase().includes(filter)) ? '' : 'none';
            }
        });

        showButton.addEventListener("click", () => {
            this.readFromLocalStorage();
        }, { once: true });

        showButton.addEventListener("click", () => {
            dialog.showModal();
        });

        document.getElementById("imageSrc").onload = (ev) => {

            let mat = cv.imread(ev.target);
            cv.imshow('imageCanvas', mat);
            mat.delete();
            this.currBoardModel = this.imageProcessor.processImage();
        };

        document.getElementById("upload-button").addEventListener("change", (event) => {

            document.getElementById("selected-board").src = URL.createObjectURL(event.target.files[0]);
            let img = document.getElementById("imageSrc");
            img.src = URL.createObjectURL(event.target.files[0]);

        });

        document.getElementById("load-button").addEventListener("click", () => {
            if (this.currBoardModel != null) {
                this.scene.board.setBoard(this.currBoardModel);
            }
        });

        this.createSaveListener();


    }

    readFromLocalStorage() {

        for (let i = 0; i < localStorage.length; i++) {

            let boardName = localStorage.key(i);
            let boardModel = JSON.parse(localStorage.getItem(boardName));
            let thumbnailHTML = SaveModal.getThumbnailHTML(boardModel);
            this.scene.events.emit("saveBoard", { imageHTML: thumbnailHTML, name: boardName, model: boardModel });
        }
    }


    createSaveListener() {

        // {imageHTML: thumbnailHTML, name: boardName, model: boardModel}
        this.scene.events.on("saveBoard", (data) => {

            let borderstyle = this.getBorderStyleHTML(data.model);
            let df = `<div id="board-${this.boardID}" class="test" data-name="${data.name}" style="${borderstyle}"> 
                            ${data.imageHTML} 
                            <input type="text" value= "${data.name}" class="thumbnail-title"> 
                            <div class="board-delete-button">
                                <i class="fa-solid fa-trash-can fa-2xs fa-fw"> </i>
                            </div>
                        </div>`;

            this.boardList.push(data.model);
            document.getElementById("thumbnail-grid").insertAdjacentHTML('beforeend', df);
            let bid = this.boardID;

            const boardEle = document.getElementById(`board-${this.boardID}`);

            boardEle.addEventListener("click", (event) => {

                document.querySelector(".test-select")?.classList.remove("test-select");
                event.currentTarget.classList.add("test-select");
                document.getElementById("selected-board").src = event.currentTarget.firstElementChild.src;
                this.currBoardModel = this.boardList[bid];

            });

            boardEle.querySelector(".board-delete-button").addEventListener("click", (event) => {

                event.stopPropagation();
                localStorage.removeItem(data.name);
                this.boardElements.splice(this.boardElements.indexOf(boardEle), 1);
                boardEle.remove();
            });

            this.boardElements.push(boardEle);
            this.boardID++;

        });
    }




    getBorderStyleHTML(board) {

        let colors = [[255, 0, 0], [0, 153, 204], [0, 153, 51], [255, 255, 0], [153, 0, 204], [255, 102, 153]]; //fire, water, wood,light,dark,heart

        let borderTop = [0, 0, 0];
        let borderBottom = [0, 0, 0];
        let borderLeft = [0, 0, 0];
        let borderRight = [0, 0, 0];

        for (let i = 0; i < 6; i++) {

            let colorTop = colors[board[i]];
            let colorBot = colors[board[24 + i]]

            borderTop = borderTop.map((x, index) => x + colorTop[index] / 6);
            borderBottom = borderBottom.map((x, index) => x + colorBot[index] / 6);

        }
        for (let i = 0; i < 5; i++) {

            let colorLeft = colors[board[i * 6]];
            let colorRight = colors[board[5 + 6 * i]];

            borderLeft = borderLeft.map((x, index) => x + colorLeft[index] / 5);
            borderRight = borderRight.map((x, index) => x + colorRight[index] / 5);
        }

        let b = [borderTop, borderBottom, borderLeft, borderRight];
        return `border-top-color:rgb(${b[0]});border-bottom-color:rgb(${b[1]});border-left-color:rgb(${b[2]});border-right-color:rgb(${b[3]});`;
    }

}
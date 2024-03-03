class LoadBoardModal {

    constructor(scene) {
        this.scene = scene;
        this.create();

        this.boardID = 0;
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
                <input type="text" placeholder="search.." class="search-bar"/>
                <i class="fa fa-magnifying-glass search-button"></i> 
            </div>

            <div id="thumbnail-grid" ></div>

            <div style="display:flex; background-color: rgb(35,35,35); border-radius: 10px; width: 100%; height:20%; align-items: center; justify-content: space-around; margin-top: 5%; "> 

                <div style="display: flex; font:1.5rem kreon; color: darkgray; height: 80%; width: 35%; align-items: center; justify-content: space-around; user-select: none;"> Selected board:  
                    <img id="selected-board" style="border-radius: 20px; background-color: rgb(35, 35, 35); border: 0.4rem gray ridge; aspect-ratio: 6/5; height: 100%; padding: 5px; object-fit:contain;"> 
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

        //[this.thumbnailHTML, boardName,this.currBoardModel]
        this.scene.events.on("saveBoard", (args) => {

            let borderstyle = this.getBorderStyleHTML(args[2]);
            let df = `<div id="board-${this.boardID}" class="test" style="${borderstyle}"> 
                            ${args[0]} 
                            <input type="text" value= "${args[1]}" class="thumbnail-title"> 
                        </div>`;

            this.boardList.push(args[2]);
            document.getElementById("thumbnail-grid").insertAdjacentHTML('beforeend', df);
            let bid = this.boardID;

            document.getElementById(`board-${this.boardID}`).addEventListener("click", (event) => {
                let prev = document.querySelector(".test-select");
                if (prev != null) {
                    prev.classList.remove("test-select");
                }
                event.currentTarget.classList.add("test-select");
                document.getElementById("selected-board").src = event.currentTarget.firstElementChild.src;
                this.currBoardModel = this.boardList[bid];

            });
            this.boardID++;
        });
    }


    readFromLocalStorage() {

        for (let i = 0; i < localStorage.length; i++) {

            let boardName = localStorage.key(i);
            let boardModel = JSON.parse(localStorage.getItem(boardName));
            let thumbnailHTML = SaveModal.getThumbnailHTML(boardModel);
            this.scene.events.emit("saveBoard", [thumbnailHTML, boardName, boardModel]);
        }
    }


    getBorderStyleHTML(board) {

        let colors = [[255, 0, 0], [0, 153, 204], [0, 153, 51], [255, 255, 0], [153, 0, 204], [255, 102, 153]]; //fire, water, wood,light,dark,heart

        let borderTop = [0, 0, 0];
        let borderBottom = [0, 0, 0];
        let borderLeft = [0, 0, 0];
        let borderRight = [0, 0, 0];

        for (let i = 0; i < 5; i++) {

            let colorTop = colors[board[0][i]];
            let colorBot = colors[board[4][i]]
            borderTop = borderTop.map((x, index) => x + colorTop[index] / 6);
            borderBottom = borderBottom.map((x, index) => x + colorBot[index] / 6);

        }
        for (let i = 0; i < 4; i++) {
            let colorLeft = colors[board[i][0]];
            let colorRight = colors[board[i][5]];
            borderLeft = borderLeft.map((x, index) => x + colorLeft[index] / 5);
            borderRight = borderRight.map((x, index) => x + colorRight[index] / 5);
        }

        let b = [borderTop, borderBottom, borderLeft, borderRight];
        return `border-top-color:rgb(${b[0]});border-bottom-color:rgb(${b[1]});border-left-color:rgb(${b[2]});border-right-color:rgb(${b[3]});`;
    }

}
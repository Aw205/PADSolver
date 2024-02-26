class SaveModal{

    constructor(scene) {
        this.scene = scene;
        this.pixelOrbs = [];
        this.thumbnailHTML = null;
        this.borderColors = null;


        this.currBoardModel = null;


        this.create();

    }

    create(){

        let html = `

        <dialog id="save-board-modal" class="save-modal">

            <div style="display: flex; flex-direction: column; justify-content: space-around; gap: 20px; align-items: center;">

                <div id="save-modal-thumbnail" style="border: none;"> </div>

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
            let saveModal = document.getElementById("save-board-modal");
            saveModal.showModal();
            this.createBoardThumbnail();
            
        });

        let cancelButton = document.getElementById("save-modal-cancel-button");
        cancelButton.addEventListener("pointerup", () => {
            let saveModal = document.getElementById("save-board-modal");
            saveModal.close();
            
        });

        let saveButton = document.getElementById("save-button");
        saveButton.addEventListener("pointerup", () => {
           document.getElementById("save-board-modal").close();
           let boardName = document.getElementById("save-modal-input").value;
           if(boardName.trim().length==0){
                boardName = "Untitled";
           }

            this.scene.events.emit("randomevent", [this.thumbnailHTML,this.borderColors, boardName,this.currBoardModel]);
            
        });

    }

    createBoardThumbnail() {

        let board = this.scene.board.getNumericModel();

        this.currBoardModel = board;

        this.calcColors(board);

        let canvas = document.getElementById('loadBoardCanvas');
        let ctx = canvas.getContext('2d');

        let orbSize = 50;

        for (let row = 0; row < board.length; row++) {
            for (let col = 0; col < board[row].length; col++) {
                let i = board[row][col];
                ctx.drawImage(this.pixelOrbs[i], col * orbSize, row * orbSize, orbSize, orbSize);
            }
        }

        let url = canvas.toDataURL('image/png');
        let preview = document.getElementById("save-modal-thumbnail");

        let html = `
                <img src="${url}" class="thumbnail">
        `;
        preview.innerHTML = html;
        
        this.thumbnailHTML = html;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }


    calcColors(arr){

        let colors = [[255, 0, 0],[0, 153, 204],[0, 153, 51],[255, 255, 0],[153, 0, 204],[255, 102, 153]]; //fire, water, wood,light,dark,heart

        // iterate edges

        let borderTop = [0,0,0];
        let borderBottom =[0,0,0];
        let borderLeft =[0,0,0];
        let borderRight =[0,0,0];
       
        for(let i =0; i< 5;i++){

            let colorTop = colors[arr[0][i]];
            let colorBot = colors[arr[4][i]]
            borderTop = borderTop.map((x, index) => x + colorTop[index]/6);
            borderBottom = borderBottom.map((x, index) => x + colorBot[index]/6);

        }
        for(let i =0; i< 4;i++){
            let colorLeft = colors[arr[i][0]];
            let colorRight = colors[arr[i][5]];
            borderLeft = borderLeft.map((x, index) => x + colorLeft[index]/5);
            borderRight = borderRight.map((x, index) => x + colorRight[index]/5);
        }

        this.borderColors = [borderTop,borderBottom,borderLeft,borderRight];

    }

    preloadImage(url) {

        let img = new Image();
        img.src = url;
        img.style.display = "none";
        this.pixelOrbs.push(img);
    }

}
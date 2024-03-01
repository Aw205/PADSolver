class LoadBoardModal {

    constructor(scene) {
        this.scene = scene;
        this.create();

        this.boardID = 0;
        this.boardList = [];
        this.currBoardModel = null;

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
            this.processImage();
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


    processImage() {

        let src = cv.imread('imageCanvas');
        let org = src.clone();

        //let dst = cv.Mat.zeros(src.cols + 300, src.rows, cv.CV_8UC3);

        cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY, 0);
        cv.cvtColor(org, org, cv.COLOR_BGR2HSV_FULL, 0);

        cv.threshold(src, src, 120, 200, cv.THRESH_BINARY);
        let contours = new cv.MatVector();
        let hierarchy = new cv.Mat();
        cv.findContours(src, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

        //let colors = [];
        // fire, water, wood, dark, light, heal
        let ranges = [[167, 180, 243], [18, 139, 235], [78, 118, 178], [139, 155, 238], [216, 163, 167], [197, 205, 240]]; //hsv
        //let ranges2 = [[165, 158, 234], [31, 165, 226], [66, 151, 168], [133, 163, 215], [211, 144, 172], [196, 181, 225]]; //hsv2
        let centerPoints = [];


        for (let i = 0; i < contours.size(); ++i) {

            if (i < 30) {

                let moments = cv.moments(contours.get(i), false);
                let centerX = Math.round(moments.m10 / moments.m00);
                let centerY = Math.round(moments.m01 / moments.m00);
                let p = new Phaser.Math.Vector2(centerX, centerY);

                let rect = cv.boundingRect(contours.get(i));
                let x = rect.x;
                let y = rect.y;
                let width = rect.width;
                let height = rect.height;

                let sumColors = [0, 0, 0];
                let numPixels = 0;

                let offset = Math.round(width / 4);

                for (let yCoord = y + offset; yCoord < y + width - offset; yCoord++) {
                    for (let xCoord = x + offset; xCoord < x + width - offset; xCoord++) {
                        let pixelColor = org.ucharPtr(yCoord, xCoord);
                        numPixels++;
                        sumColors = sumColors.map((num, idx) => num + pixelColor[idx]);
                    }
                }
                let averageColor = sumColors.map((num) => Math.round(num / numPixels));

                //console.log(averageColor);
                // let point1 = new cv.Point(rect.x, rect.y);
                // let point2 = new cv.Point(rect.x + rect.width, rect.y + rect.height);
                // cv.rectangle(dst, point1, point2, new cv.Scalar(255, 0, 0), 0.3, cv.LINE_AA, 0);

                // let rgbMat = new cv.Mat(1, 1, cv.CV_8UC3);
                // rgbMat.data.set(averageColor);
                // let hsvMat = new cv.Mat();
                // cv.cvtColor(rgbMat, hsvMat, cv.COLOR_HSV2BGR_FULL);
                // let hsvArray = hsvMat.data;
                // colors.push(hsvArray);

                for (let i = 0; i < ranges.length; i++) {
                    if (averageColor[0] > ranges[i][0] - 18 && averageColor[0] < ranges[i][0] + 18) {
                        p.orbVal = i;
                        break;
                    }
                }
                centerPoints.push(p);

            }
        }
        centerPoints.reverse();
        let sorted = Array.from({ length: 5 }, (_, rowIndex) => centerPoints.slice(rowIndex * 6, (rowIndex + 1) * 6).toSorted((a, b) => { return a.x - b.x }));
        this.currBoardModel = sorted.map((row) => row.map(p => p.orbVal));

        // for (let i = 0; i < contours.size(); ++i) {
        //     if (i < 30) {
        //         let color = new cv.Scalar(colors[i][0], colors[i][1], colors[i][2]);
        //         cv.drawContours(dst, contours, i, color, -1, cv.LINE_8, hierarchy, 10);
        //     }
        // }
        //cv.imshow('imageCanvas', dst);
        //dst.delete();
        src.delete();
        contours.delete();
        hierarchy.delete();
    }

}
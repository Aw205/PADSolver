class StatWindow {

    constructor(scene) {
        this.scene = scene;
        this.create();
    }

    create() {

        let html = `<div style=" width: 270px; height: 630px; background-color: rgb(30,30,30); border-radius: 10px; padding: 10px;"> 

                            <details style="background-color: rgb(20,20,20); border-radius: 10px;" open>
                                <summary style="font: 1.5rem kreon; color: darkGray;user-select: none; background-color: rgb(45,45,45); border-bottom: 2px ridge DimGray; "> 
                                    <i class="fa fa-chart-simple" style="width: 10%; height:10%;"></i> Stats 
                                </summary>
                                <div id="combo-count" style="font: 1.3rem kreon; padding-left: 5%; color: DarkGray; user-select:none; data-combos="0"; > Combos:
                                    <span style="color:tan;"> </span>
                                </div>
                                <div id="swap-count" style="font: 1.3rem kreon; padding-left: 5%; color: DarkGray; user-select:none; data-swaps="0"; > Swaps:
                                    <span style="color:tan;"> </span>
                                </div>
                            </details>

                        <details open>
                            <summary style="font: 1.5rem kreon; color: darkGray;user-select: none; background-color: rgb(45,45,45); border-bottom: 2px ridge DimGray;"> 
                                <i class="fa fa-arrows-turn-to-dots" style="width: 10%; height:10%;"></i> Solutions
                            </summary>
                            <div id="combo-paths" style="height: 500px; background-color: rgb(20,20,20); border-radius: 10px; overflow-y: scroll;"></div>
                        </details>
                    </div>`

        this.scene.add.dom(1120, 375).createFromHTML(html);

    }

     /**
     * @param {*} result - {solution,solutionList}
     */
    updateStats(result) {

        let solution = result.solution;
        let cc = solution.comboList.length;
        let path = solution.path;

        let ccEle = document.getElementById("combo-count").getElementsByTagName("span")[0];
        let swapEle = document.getElementById("swap-count").getElementsByTagName("span")[0];

        ccEle.textContent = cc;
        swapEle.textContent = path.length - 1;

        let pathStats = [];

        for (let i = 0; i < 20; i++) {

            this.scene.pathManager.pathList.push(result.solutionList[i].path);

            if(result.solutionList[i].comboList.length > 1){

                let comboHtml = ``;
                for (let combo of result.solutionList[i].comboList) {
                    let color = typeTextureMap.get(combo.color);
                    comboHtml += ` <img src="../assets/UI/${color}.svg" style = "width: 10%; height: 10%; padding: 0px 5px;"> x${combo.number}`;
                }
                document.getElementById("combo-paths").innerHTML += `<div class= "orbs-matched" data-path="${i}"> ${comboHtml} </div>`;
                //pathStats.push({comboCount: result.solutionList[i].comboList.length, swapCount: result.solutionList[i].path.length});

            }
        }

        document.querySelectorAll('.orbs-matched').forEach(sol => {
            sol.addEventListener('click', () => {
                document.querySelector(".path-select").classList.remove("path-select");
                sol.classList.add("path-select");
                //swapEle.textContent = pathStats;
                this.scene.pathManager.setPath(sol.dataset.path);
                this.scene.pathManager.resetBoard();
            });
        });
    }

}
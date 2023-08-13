class SettingsScene extends Phaser.Scene {

    constructor() {
        super("SettingsScene");
    }

    create() {
        
        let volumeHtml = `
        <div style= "width: 300px; height: 250px; background-color: rgb(20,20,20); border: 2px solid gray; border-radius: 10px; ">  
            <input type="range" min="1" max="100" value="50" style="">
        </div>`;
        this.add.dom(320,240).createFromHTML(volumeHtml);
     
    }

}
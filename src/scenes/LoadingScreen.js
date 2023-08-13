class LoadingScreen extends Phaser.Scene {

    constructor() {
        super({
            key: "LoadingScreen", pack: {
                files: [
                    { type: "json", key: "assets", url: "./assets/assets.json" }
                ]
            }
        });
    }

    preload() {

        this.load.setBaseURL("assets/");
        this.loadAssets(this.cache.json.get("assets"));
        this.createProgressBar();
    }

    loadAssets(assets) {
        Object.keys(assets).forEach((group) => {
            Object.keys(assets[group]).forEach((key) => {
                let value = assets[group][key];
                if (group == "bitmapFont" || group == "spritesheet" || group == "atlas" || group == "svg" || group == "aseprite") {
                    this.load[group](key, value[0], value[1]);
                }
                else {
                    this.load[group](key, value);
                }
            }, this);
        }, this);
    }

    createProgressBar() {

        this.add.dom(game.config.width / 2, game.config.height / 2 - 50).createFromHTML(`<p style = "user-select:none; font: 32px kreon; color: white;" > Loading... </p>`);
        let progressBar = this.add.dom(game.config.width / 2, game.config.height / 2).createFromHTML(`<progress id = "progress-bar" max="100" value="0"></progress>`).getChildByID("progress-bar");
        this.load.on("progress", (progress) => {
            progressBar.value = progress * 100;
        }, this);
        this.load.once("complete", () => {
            this.load.off("progress");
            this.scene.start("BoardScene");
        }, this);
    }
}
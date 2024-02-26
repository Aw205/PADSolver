class MessageLog {


    static ERROR = 'IndianRed';
    static WARNING = 'Khaki';
    static IN_PROGRESS = 'LightGoldenRodYellow';
    static COMPLETION = 'MediumSeaGreen';
    static STANDARD = 'Gray';

    constructor(scene) {

        this.scene = scene;
        this.create();

    }

    create() {




        let map

        let chat = document.getElementById("chat-box");
        this.scene.events.on("message log", (type,message) => {
            let ts = this.getTimestamp();
            chat.innerHTML += `<p style="margin:0; user-select: none;"> ${ts} <span style="color: ${type};"> ${message} </span> </p>`;

        });
        this.scene.events.emit("message log", MessageLog.STANDARD, "Hello!");
    }

    getTimestamp() {

        const date = new Date();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');

        return `[${hours}:${minutes}]`;
    }

}
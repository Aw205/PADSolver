class BoardModel {


    constructor() {


        this.HEIGHT = 5;
        this.WIDTH = 6;
        this.orbs = new Array(this.HEIGHT);
        this.bitboards = [];


        this.createBoard();


    }


    createBoard() {

        for (let row = 0; row < this.HEIGHT; row++) {
            this.orbs[row] = new Array(this.WIDTH);
            for (let col = 0; col < this.WIDTH; col++) {
                let rand = Phaser.Math.Between(0, 5);
                this.orbs[row][col] = rand;
            }
        }

        //console.log(this.orbs);
        this.bitboards.push(0);
        let typeBoard = 0;
        for (let i =0; i<6;i++) {

            for (let row = 0; row < this.HEIGHT; row++) {
                for (let col = 0; col < this.WIDTH; col++) {
                    type |= 1 << row * this.WIDTH + col;
                }
            }

        }





    }



    swap(targetPos) {

        //[this.orbs[0], this.orb[1]] = [this.orbs[1], this.orbs[0]];

    }


    calcCombos() {



        // 111000 
        // 011100
        // 001110
        // 000111

    }






}

class ImageProcessor {

    constructor(){

    }

    create(){

    }

    processImage() {

        let src = cv.imread('imageCanvas');
        let org = src.clone();

        cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY, 0);
        cv.cvtColor(org, org, cv.COLOR_BGR2HSV_FULL, 0);

        cv.threshold(src, src, 120, 200, cv.THRESH_BINARY);
        let contours = new cv.MatVector();
        let hierarchy = new cv.Mat();
        cv.findContours(src, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

        // fire, water, wood, dark, light, heal
        let ranges = [[167, 180, 243], [18, 139, 235], [78, 118, 178], [139, 155, 238], [216, 163, 167], [197, 205, 240]]; //hsv
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

        src.delete();
        org.delete();
        contours.delete();
        hierarchy.delete();
    }

}
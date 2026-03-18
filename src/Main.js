'use strict';

import BoardScene from "./scenes/BoardScene.js";

let config = {
  type: Phaser.WEBGL,
  parent: 'board-container',
  width: Orb.HEIGHT * 6,
  height: Orb.HEIGHT * 5,
  resolution: window.devicePixelRatio,
  scene: [LoadingScreen, BoardScene],
  transparent: true,
  input:{
    windowEvents: false
  },
  scale: {
    mode: Phaser.Scale.FIT
  },
  dom: {
    createContainer: true
  },
  autoCenter: Phaser.Scale.CENTER_BOTH,
  plugins: {
  }
};

const game = new Phaser.Game(config);
'use strict';

let config = {
  type: Phaser.WEBGL,
  parent: window,
  width: 1280,
  height: 960,
  resolution: window.devicePixelRatio,
  scene: [LoadingScreen,BoardScene],
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

let game = new Phaser.Game(config);
'use strict';
import { Game } from "phaser";
import { ORB_HEIGHT } from "./UI/Orb.js";
import BoardScene from "./scenes/BoardScene.js";

let config = {
  type: Phaser.WEBGL,
  parent: 'board-container',
  width: ORB_HEIGHT * 6,
  height: ORB_HEIGHT * 5,
  resolution: window.devicePixelRatio,
  scene: [BoardScene],
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
  autoCenter: Phaser.Scale.CENTER_BOTH
};

const game = new Game(config);
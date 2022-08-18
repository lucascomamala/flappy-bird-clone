import Phaser from "Phaser";

class PlayScene extends Phaser.Scene {
  constructor() {
    super("PlayScene");
    this.initialBirdPos = { 
        x: 80,
        y: 300
    };
    this.bird = null;
  }

  preload() {
    this.load.image("sky", "assets/sky.png");
    this.load.image("bird", "assets/bird.png");
  }

  create() {
    this.add.image(0, 0, "sky").setOrigin(0, 0);
    this.bird = this.physics.add
      .sprite(this.initialBirdPos.x, this.initialBirdPos.y, "bird")
      .setOrigin(0, 0);
    this.bird.body.gravity.y = 400;
  }

  update() {}
}

export default PlayScene;

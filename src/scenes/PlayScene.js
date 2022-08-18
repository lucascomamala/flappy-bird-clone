import Phaser from "phaser";

const PIPES = 4;

class PlayScene extends Phaser.Scene {
  constructor(config) {
    super("PlayScene");
    this.config = config;

    this.bird = null;
    this.pipes = null;

    this.pipeGapRange = [120, 250];
    this.pipeSpacingRange = [400, 550];

    this.pipePosX = 0;
    this.flapVelocity = 300;
  }

  preload() {
    this.load.image("sky", "assets/sky.png");
    this.load.image("bird", "assets/bird.png");
    this.load.image("pipe", "assets/pipe.png");
  }

  create() {
    this.add.image(0, 0, "sky").setOrigin(0, 0);
    this.bird = this.physics.add
      .sprite(this.config.startPosition.x, this.config.startPosition.y, "bird")
      .setOrigin(0, 0);
    this.bird.body.gravity.y = 400;

    this.pipes = this.physics.add.group();

    for (let i = 1; i <= PIPES; i += 1) {
      const upperPipe = this.pipes.create(0, 0, "pipe").setOrigin(0, 1);
      const lowerPipe = this.pipes.create(0, 0, "pipe").setOrigin(0, 0);
      this.placePipe(upperPipe, lowerPipe);
    }

    this.pipes.setVelocityX(-200);

    this.input.on("pointerdown", this.flap, this);
    this.input.keyboard.on("keydown_SPACE", this.flap, this);
  }

  update() {
    if (this.bird.y > this.config.height || this.bird.y < -this.bird.height) {
      this.restartBirdPosition();
    }
    this.recyclePipe();
  }

  placePipe(uPipe, lPipe) {
    const rightMostX = this.getRightMostPipe();
    const pipeGap = Phaser.Math.Between(...this.pipeGapRange);
    const pipeTop = Phaser.Math.Between(
      0 + 20,
      this.config.height - 20 - pipeGap
    );
    const pipeDistance = Phaser.Math.Between(...this.pipeSpacingRange);

    uPipe.x = rightMostX + pipeDistance;
    uPipe.y = pipeTop;

    lPipe.x = uPipe.x;
    lPipe.y = uPipe.y + pipeGap;
  }

  recyclePipe() {
    const tempPipes = [];
    this.pipes.getChildren().forEach((pipe) => {
      if (pipe.getBounds().right <= 0) {
        tempPipes.push(pipe);
        if (tempPipes.length === 2) {
          this.placePipe(...tempPipes);
        }
      }
    });
  }

  getRightMostPipe() {
    let rightMost = 0;
    this.pipes.getChildren().forEach((pipe) => {
      rightMost = Math.max(pipe.x, rightMost);
    });
    return rightMost;
  }

  restartBirdPosition() {
    this.bird.x = this.config.startPosition.x;
    this.bird.y = this.config.startPosition.y;
    this.bird.body.velocity.y = 0;
  }

  flap() {
    this.bird.body.velocity.y = -this.flapVelocity;
  }
}

export default PlayScene;

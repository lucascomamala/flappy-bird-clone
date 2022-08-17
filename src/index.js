
import Phaser from 'phaser';

const config = {
  // WebGL
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    // Arcade physics plugin
    default: 'arcade',
    arcade: {
        debug: true,
    }
  },
  scene: {
    preload,
    create,
    update,
  },
};

const VELOCITY = 200;
const flapVelocity = 300;
const initialBirdPos = { x: config.width * 0.1, y: config.height * 0.5 }

const PIPES = 4;

let bird, lowerPipe, upperPipe = null;
let pipeGapRange = [120, 250];
let pipeGap, pipeTop, pipeSpacing = 300;

function preload() {
  this.load.image('sky', 'assets/sky.png');
  this.load.image('bird', 'assets/bird.png');
  this.load.image('pipe', 'assets/pipe.png');
}

function create() {
  this.add.image(0, 0, 'sky').setOrigin(0, 0);
  bird = this.physics.add.sprite(initialBirdPos.x, initialBirdPos.y, 'bird').setOrigin(0,0);
  bird.body.gravity.y = 400;

  for ( let i = 1; i <= PIPES; i += 1 ) {
    pipeGap = Phaser.Math.Between(...pipeGapRange);
    pipeTop = Phaser.Math.Between(0 + 20, config.height - 20 - pipeGap);
    upperPipe = this.physics.add.sprite(pipeSpacing * i, pipeTop, 'pipe').setOrigin(0, 1);
    lowerPipe = this.physics.add.sprite(pipeSpacing * i, upperPipe.y + pipeGap, 'pipe').setOrigin(0, 0);

    upperPipe.body.velocity.x = -200;
    lowerPipe.body.velocity.x = -200;
  }

  this.input.on('pointerdown', flap);
  this.input.keyboard.on('keydown_SPACE', flap);
}

// if bird position y position is smaller than 0 or greater than h of canvas then alert u lost
function update(time, delta) {
  if (bird.y > config.height|| bird.y < -bird.height) {
    restartBirdPosition();
  }

}

function restartBirdPosition() {
  bird.x = initialBirdPos.x;
  bird.y = initialBirdPos.y;
  bird.body.velocity.y = 0;
}

function flap() {
  bird.body.velocity.y = -flapVelocity;
}

new Phaser.Game(config);

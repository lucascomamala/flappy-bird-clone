
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
}

function preload() {
  this.load.image('sky', 'assets/sky.png');
  this.load.image('bird', 'assets/bird.png');
  this.load.image('pipe', 'assets/pipe.png');
}

const VELOCITY = 200;
const flapVelocity = 300;
const initialBirdPos = {x: config.width * 0.1, y: config.height * 0.5}

let bird = null;
let pipe = null;

function create() {
  this.add.image(0, 0, 'sky').setOrigin(0, 0);
  bird = this.physics.add.sprite(initialBirdPos.x, initialBirdPos.y, 'bird').setOrigin(0,0);
  bird.body.gravity.y = 400;
  pipe = this.physics.add.sprite(300, 100, 'pipe').setOrigin(0);

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

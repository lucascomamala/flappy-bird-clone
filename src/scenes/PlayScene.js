import BaseScene from './BaseScene';

const PIPES = 4;

class PlayScene extends BaseScene {
  constructor(config) {
    super('PlayScene', config);

    this.bird = null;
    this.pipes = null;

    this.pipeGapRange = [120, 250];
    this.pipeSpacingRange = [400, 550];

    this.pipePosX = 0;
    this.flapVelocity = 300;

    this.score = 0;
    this.scoreText = '';
    this.bestScore = 0;
    this.bestScoreText = '';
  }

  create() {
    super.create();
    this.createBird();
    this.createPipes();
    this.createColliders();
    this.createScore();
    this.createPause();
    this.handleInputs();
    this.listenToEvents();
  }

  update() {
    this.checkGameStatus();
    this.recyclePipe();
  }

  listenToEvents() {
    this.events.on('resume', () => {
      this.initialTime = 3;
      this.countDownText = this.add.text(...this.screenCenter, 'Fly in ' + this.initialTime + '...', this.fontOptions).setOrigin(0.5);
      this.timedEvent = this.time.addEvent({
        delay: 1000,
        callback: () => console.log(this.initialTime--),
        callbackScope: this,
        loop: true,
      });
      // this.physics.resume();
    });
  }

  createBG() {
    this.add.image(0, 0, 'sky').setOrigin(0, 0);
  }

  createBird() {
    this.bird = this.physics.add
      .sprite(this.config.startPosition.x, this.config.startPosition.y, 'bird')
      .setOrigin(0, 0);
    this.bird.body.gravity.y = 550;
    this.bird.setCollideWorldBounds(true);
  }

  createPipes() {
    this.pipes = this.physics.add.group();

    for (let i = 1; i <= PIPES; i += 1) {
      const upperPipe = this.pipes
        .create(0, 0, 'pipe')
        .setImmovable(true)
        .setOrigin(0, 1);
      const lowerPipe = this.pipes
        .create(0, 0, 'pipe')
        .setImmovable(true)
        .setOrigin(0, 0);
      this.placePipe(upperPipe, lowerPipe);
    }

    this.pipes.setVelocityX(-200);
  }

  createColliders() {
    this.physics.add.collider(this.bird, this.pipes, this.gameOver, null, this);
  }

  createScore() {
    this.score = 0;
    this.bestScore = localStorage.getItem('bestScore');
    this.scoreText = this.add.text(16, 16, `Score: ${0}`, {
      fontSize: '32px',
      fill: '#000',
    });
    this.bestScoreText = this.add.text(16, 52, `Best: ${this.bestScore || 0}`, {
      fontSize: '18px',
      fill: '#000',
    });
  }

  createPause() {
    const pauseButton = this.add
      .image(this.config.width - 10, this.config.height - 10, 'pause')
      .setInteractive()
      .setScale(3)
      .setOrigin(1, 1);

    pauseButton.on('pointerdown', () => {
      this.physics.pause();
      this.scene.pause();
      this.scene.launch('PauseScene');
    });
  }

  handleInputs() {
    this.input.on('pointerdown', this.flap, this);
    this.input.keyboard.on('keydown_SPACE', this.flap, this);
  }

  checkGameStatus() {
    if (
      this.bird.getBounds().bottom >= this.config.height ||
      this.bird.y <= 0
    ) {
      this.gameOver();
    }
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
          this.increaseScore();
          this.saveBestScore();
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

  saveBestScore() {
    if (!this.bestScore || this.score >= this.bestScore) {
      localStorage.setItem('bestScore', this.score);
    }
  }

  gameOver() {
    this.physics.pause();
    this.bird.setTint(0xee4824);

    this.saveBestScore();

    this.time.addEvent({
      delay: 1000,
      callback: () => {
        this.scene.restart();
      },
      loop: false,
    });
  }

  flap() {
    this.bird.body.velocity.y = -this.flapVelocity;
  }

  increaseScore() {
    this.score += 1;
    this.scoreText.setText(`Score: ${this.score}`);
    if (this.score > this.bestScore) {
      this.bestScore = this.score;
      this.bestScoreText.setText(`Best: ${this.bestScore}`);
    }
  }
}

export default PlayScene;

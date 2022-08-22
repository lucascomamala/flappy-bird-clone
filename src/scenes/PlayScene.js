import BaseScene from './BaseScene';

const PIPES = 4;

class PlayScene extends BaseScene {
  constructor(config) {
    super('PlayScene', config);

    this.bird = null;
    this.pipes = null;
    this.isPaused = false;

    this.pipeGapRange = [120, 250];
    this.pipeSpacingRange = [400, 550];

    this.pipePosX = 0;
    this.flapVelocity = 300;

    this.score = 0;
    this.scoreText = '';
    this.bestScore = 0;
    this.bestScoreText = '';

    this.currentDificulty = 'easy';
    this.difficulties = {
      'easy': {
        pipeSpacingRange: [300, 350],
        pipeGapRange: [150, 200]
      },
      'normal': {
        pipeSpacingRange: [280, 330],
        pipeGapRange: [140, 190]
      },
      'hard': {
        pipeSpacingRange: [250, 310],
        pipeGapRange: [120, 150]
      }
    };
  }

  create() {
    this.currentDificulty = 'easy';
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
    if (this.pauseEvent) { return; }
    this.pauseEvent = this.events.on('resume', () => {
      this.initialTime = 3;
      this.countDownText = this.add.text(...this.screenCenter, 'Fly in ' + this.initialTime + '...', this.fontOptions).setOrigin(0.5);
      this.timedEvent = this.time.addEvent({
        delay: 1000,
        callback: this.countDown,
        callbackScope: this,
        loop: true,
      });
    });
  }

  countDown() {
    this.initialTime -= 1;
    this.countDownText.setText('Fly in ' + this.initialTime + '...');
    if (this.initialTime <= 0) {
      this.isPaused = false;
      this.countDownText.setText('');
      this.physics.resume();
      this.timedEvent.remove();
    }
  }

  createBG() {
    this.add.image(0, 0, 'sky').setOrigin(0, 0);
  }

  createBird() {
    this.bird = this.physics.add
      .sprite(this.config.startPosition.x, this.config.startPosition.y, 'bird')
      .setOrigin(0, 0)
      .setScale(3)
      .setFlipX(true);
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
    this.isPaused = false;
    const pauseButton = this.add
      .image(this.config.width - 10, this.config.height - 10, 'pause')
      .setInteractive()
      .setScale(3)
      .setOrigin(1, 1);

    pauseButton.on('pointerdown', () => {
      this.isPaused = true;
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
    const difficulty = this.difficulties[this.currentDificulty];
    const rightMostX = this.getRightMostPipe();
    const pipeGap = Phaser.Math.Between(...difficulty.pipeGapRange);
    const pipeTop = Phaser.Math.Between(
      0 + 20,
      this.config.height - 20 - pipeGap
    );
    const pipeDistance = Phaser.Math.Between(...difficulty.pipeSpacingRange);

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
          this.increaseDifficulty();
        }
      }
    });
  }

  increaseDifficulty() {
    if (this.score === 1) {
      this.currentDificulty = 'normal';
    } else if (this.score === 3) {
      this.currentDificulty = 'hard';
    }
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
    if (this.isPaused) { return; }
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

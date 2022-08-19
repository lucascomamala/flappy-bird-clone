import BaseScene from './BaseScene';

class ScoreScene extends BaseScene {
  constructor(config) {
    super('ScoreScene', {...config, canGoBack: true});

  }

  create() {
    super.create();

    const bestScoreText = localStorage.getItem('bestScore');
    this.add.text(...this.screenCenter, `Best Score: ${bestScoreText}`, this.fontOptions).setOrigin(0.5, 1);
  }
}

export default ScoreScene;

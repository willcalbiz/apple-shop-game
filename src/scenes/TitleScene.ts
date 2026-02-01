import Phaser from 'phaser';

export class TitleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TitleScene' });
  }

  create() {
    const { width, height } = this.scale;

    // 배경
    this.add.rectangle(width / 2, height / 2, width, height, 0xFDF6E3);

    // 타이틀
    this.add.text(width / 2, height * 0.3, '🍎', {
      fontSize: '120px',
    }).setOrigin(0.5);

    this.add.text(width / 2, height * 0.45, '사과 가게', {
      fontSize: '48px',
      color: '#E74C3C',
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.text(width / 2, height * 0.52, '회계 시뮬레이션', {
      fontSize: '24px',
      color: '#8B7355',
      fontFamily: 'Arial, sans-serif',
    }).setOrigin(0.5);

    // 시작 버튼
    const startBtn = this.add.rectangle(width / 2, height * 0.7, 200, 60, 0xE74C3C, 1)
      .setInteractive({ useHandCursor: true });
    
    this.add.text(width / 2, height * 0.7, '시작하기', {
      fontSize: '24px',
      color: '#FFFFFF',
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    startBtn.on('pointerdown', () => {
      this.scene.start('MainScene');
      this.scene.launch('UIScene');
    });

    startBtn.on('pointerover', () => startBtn.setFillStyle(0xC0392B));
    startBtn.on('pointerout', () => startBtn.setFillStyle(0xE74C3C));

    // 안내 텍스트
    this.add.text(width / 2, height * 0.85, '사과를 사고 팔며\n회계의 기초를 배워보세요!', {
      fontSize: '16px',
      color: '#8B7355',
      fontFamily: 'Arial, sans-serif',
      align: 'center',
    }).setOrigin(0.5);
  }
}

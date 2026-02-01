import Phaser from 'phaser';

export class TitleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TitleScene' });
  }

  create() {
    const { width, height } = this.scale;

    // 그라데이션 배경
    const bg = this.add.graphics();
    for (let y = 0; y < height; y++) {
      const ratio = y / height;
      const r = Math.floor(255 - ratio * 30);
      const g = Math.floor(248 - ratio * 40);
      const b = Math.floor(220 - ratio * 50);
      bg.fillStyle((r << 16) | (g << 8) | b);
      bg.fillRect(0, y, width, 1);
    }

    // 구름 애니메이션
    this.createClouds();

    // 타이틀 사과 (바운스 애니메이션)
    const apple = this.add.text(width / 2, height * 0.25, '🍎', {
      fontSize: '100px',
    }).setOrigin(0.5);

    this.tweens.add({
      targets: apple,
      y: height * 0.25 - 15,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // 잎사귀 이펙트
    this.add.text(width / 2 + 40, height * 0.25 - 30, '🍃', {
      fontSize: '30px',
    }).setOrigin(0.5);

    // 게임 타이틀
    this.add.text(width / 2 + 3, height * 0.42 + 3, '사과 가게', {
      fontSize: '48px',
      color: '#8B7355',
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold',
    }).setOrigin(0.5).setAlpha(0.3);

    this.add.text(width / 2, height * 0.42, '사과 가게', {
      fontSize: '48px',
      color: '#C0392B',
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.text(width / 2, height * 0.50, '💰 회계 시뮬레이션 💰', {
      fontSize: '20px',
      color: '#8B7355',
      fontFamily: 'Arial, sans-serif',
    }).setOrigin(0.5);

    // 버전
    this.add.text(width / 2, height * 0.55, 'v2.0', {
      fontSize: '12px',
      color: '#AAAAAA',
    }).setOrigin(0.5);

    // 시작 버튼 (그라데이션 효과)
    const btnY = height * 0.68;
    const btnContainer = this.add.container(width / 2, btnY);

    const btnShadow = this.add.rectangle(3, 3, 220, 65, 0x8B4513, 0.3);
    const btnBg = this.add.graphics();
    btnBg.fillGradientStyle(0xE74C3C, 0xE74C3C, 0xC0392B, 0xC0392B, 1);
    btnBg.fillRoundedRect(-110, -32, 220, 65, 15);

    const btnText = this.add.text(0, 0, '🎮 시작하기', {
      fontSize: '26px',
      color: '#FFFFFF',
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    btnContainer.add([btnShadow, btnBg, btnText]);
    btnContainer.setSize(220, 65);
    btnContainer.setInteractive({ useHandCursor: true });

    btnContainer.on('pointerover', () => {
      this.tweens.add({
        targets: btnContainer,
        scale: 1.05,
        duration: 100,
      });
    });

    btnContainer.on('pointerout', () => {
      this.tweens.add({
        targets: btnContainer,
        scale: 1,
        duration: 100,
      });
    });

    btnContainer.on('pointerdown', () => {
      this.tweens.add({
        targets: btnContainer,
        scale: 0.95,
        duration: 50,
        yoyo: true,
        onComplete: () => {
          this.scene.start('MainScene');
          this.scene.launch('UIScene');
        },
      });
    });

    // 안내 텍스트
    const infoBox = this.add.graphics();
    infoBox.fillStyle(0xFFFFFF, 0.8);
    infoBox.fillRoundedRect(40, height * 0.78, width - 80, 80, 15);

    this.add.text(width / 2, height * 0.82, '🍎 사과를 매입하고 판매하며', {
      fontSize: '15px',
      color: '#666666',
      fontFamily: 'Arial, sans-serif',
    }).setOrigin(0.5);

    this.add.text(width / 2, height * 0.87, '📊 회계의 기초를 배워보세요!', {
      fontSize: '15px',
      color: '#666666',
      fontFamily: 'Arial, sans-serif',
    }).setOrigin(0.5);

    // 크레딧
    this.add.text(width / 2, height * 0.95, 'Made with 🔥 by AI Team', {
      fontSize: '12px',
      color: '#AAAAAA',
    }).setOrigin(0.5);
  }

  private createClouds() {
    const { width } = this.scale;

    for (let i = 0; i < 3; i++) {
      const cloud = this.add.text(
        Phaser.Math.Between(-50, width),
        Phaser.Math.Between(50, 150),
        '☁️',
        { fontSize: `${Phaser.Math.Between(30, 50)}px` }
      ).setAlpha(0.5);

      this.tweens.add({
        targets: cloud,
        x: width + 100,
        duration: Phaser.Math.Between(15000, 25000),
        repeat: -1,
        onRepeat: () => {
          cloud.x = -100;
          cloud.y = Phaser.Math.Between(50, 150);
        },
      });
    }
  }
}

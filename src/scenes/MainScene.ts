import Phaser from 'phaser';
import type { Customer } from '../game/GameState';
import { gameState } from '../game/GameState';

export class MainScene extends Phaser.Scene {
  private shopApples: Phaser.GameObjects.Text[] = [];
  private customerSprites: Map<number, Phaser.GameObjects.Container> = new Map();
  private backgroundGradient?: Phaser.GameObjects.Graphics;

  constructor() {
    super({ key: 'MainScene' });
  }

  create() {
    this.createBackground();
    this.drawShop();
    this.updateAppleDisplay();

    // 상태 구독
    gameState.subscribe(() => {
      this.updateAppleDisplay();
      this.updateCustomerDisplay();
      this.updateBackground();
    });

    // 손님 생성 타이머
    this.time.addEvent({
      delay: 2000,
      callback: () => {
        const state = gameState.getState();
        if (state.timeOfDay === 'noon' && Math.random() < 0.4) {
          gameState.generateCustomer();
        }
      },
      loop: true,
    });

    // 손님 인내심 감소 타이머
    this.time.addEvent({
      delay: 1500,
      callback: () => gameState.decreasePatience(),
      loop: true,
    });
  }

  private createBackground() {
    this.backgroundGradient = this.add.graphics();
    this.updateBackground();
  }

  private updateBackground() {
    const { width, height } = this.scale;
    const state = gameState.getState();

    if (!this.backgroundGradient) return;
    this.backgroundGradient.clear();

    let topColor: number, bottomColor: number;

    switch (state.timeOfDay) {
      case 'morning':
        topColor = 0xFFD89B; // 연한 주황
        bottomColor = 0xFFF1E6;
        break;
      case 'noon':
        topColor = 0x87CEEB; // 하늘색
        bottomColor = 0xFFF8DC;
        break;
      case 'evening':
        topColor = 0xE6A57E; // 노을
        bottomColor = 0xFFE4B5;
        break;
    }

    // 그라데이션 배경
    for (let y = 0; y < height; y++) {
      const ratio = y / height;
      const r1 = (topColor >> 16) & 0xFF;
      const g1 = (topColor >> 8) & 0xFF;
      const b1 = topColor & 0xFF;
      const r2 = (bottomColor >> 16) & 0xFF;
      const g2 = (bottomColor >> 8) & 0xFF;
      const b2 = bottomColor & 0xFF;

      const r = Math.floor(r1 + (r2 - r1) * ratio);
      const g = Math.floor(g1 + (g2 - g1) * ratio);
      const b = Math.floor(b1 + (b2 - b1) * ratio);

      this.backgroundGradient.fillStyle((r << 16) | (g << 8) | b);
      this.backgroundGradient.fillRect(0, y, width, 1);
    }
  }

  private drawShop() {
    const { width, height } = this.scale;

    // 바닥
    this.add.rectangle(width / 2, height * 0.75, width, height * 0.5, 0x8B7355);

    // 가게 건물 (더 디테일하게)
    const shopX = width / 2;
    const shopY = height * 0.35;

    // 건물 본체 (그림자 효과)
    this.add.rectangle(shopX + 4, shopY + 4, 280, 180, 0x5D4E37, 0.3);
    this.add.rectangle(shopX, shopY, 280, 180, 0xF5DEB3)
      .setStrokeStyle(4, 0x8B7355);

    // 지붕
    this.add.triangle(shopX, shopY - 100, 0, 60, 160, 0, 320, 60, 0xC0392B)
      .setStrokeStyle(3, 0x922B21);

    // 간판 (그림자)
    this.add.rectangle(shopX + 2, shopY - 50 + 2, 140, 45, 0x5D4E37, 0.3);
    this.add.rectangle(shopX, shopY - 50, 140, 45, 0x27AE60)
      .setStrokeStyle(3, 0x1E8449);
    this.add.text(shopX, shopY - 50, '🍎 사과', {
      fontSize: '22px',
      color: '#FFFFFF',
      fontFamily: 'Arial',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // 가격표
    this.add.rectangle(shopX + 90, shopY - 30, 70, 50, 0xFFFACD)
      .setStrokeStyle(2, 0xDAA520);

    // 진열대
    this.add.rectangle(shopX, shopY + 45, 240, 55, 0xDEB887)
      .setStrokeStyle(3, 0x8B7355);

    // 진열대 다리
    this.add.rectangle(shopX - 80, shopY + 85, 20, 35, 0x8B7355);
    this.add.rectangle(shopX + 80, shopY + 85, 20, 35, 0x8B7355);

    // 손님 대기 영역 표시
    this.add.text(width / 2, height * 0.58, '─── 손님 대기열 ───', {
      fontSize: '14px',
      color: '#8B7355',
      fontFamily: 'Arial',
    }).setOrigin(0.5);
  }

  private updateAppleDisplay() {
    // 기존 사과 제거
    this.shopApples.forEach(a => a.destroy());
    this.shopApples = [];

    const state = gameState.getState();
    const { width, height } = this.scale;

    // 가격표 업데이트
    const priceText = this.add.text(width / 2 + 90, height * 0.35 - 30, `₩${state.applePrice}`, {
      fontSize: '16px',
      color: '#333333',
      fontFamily: 'Arial',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    this.shopApples.push(priceText);

    // 사과 진열 (더 예쁘게)
    const displayCount = Math.min(state.apples, 12);
    const startX = width / 2 - 100;
    const baseY = height * 0.35 + 35;

    for (let i = 0; i < displayCount; i++) {
      const col = i % 6;
      const row = Math.floor(i / 6);
      const x = startX + col * 35;
      const y = baseY + row * 28;
      const apple = this.add.text(x, y, '🍎', { fontSize: '26px' });

      // 입장 애니메이션
      apple.setAlpha(0);
      this.tweens.add({
        targets: apple,
        alpha: 1,
        y: y - 5,
        duration: 200,
        delay: i * 30,
        yoyo: true,
        repeat: 0,
      });

      this.shopApples.push(apple);
    }

    // 재고 숫자 (12개 초과시)
    if (state.apples > 12) {
      const moreText = this.add.text(width / 2 + 90, baseY + 10, `+${state.apples - 12}`, {
        fontSize: '14px',
        color: '#E74C3C',
        fontStyle: 'bold',
      });
      this.shopApples.push(moreText);
    }
  }

  private updateCustomerDisplay() {
    const { width, height } = this.scale;
    const queue = gameState.getCustomerQueue();

    // 기존 손님 스프라이트 중 없어진 것 제거
    const currentIds = new Set(queue.map(c => c.id));
    this.customerSprites.forEach((sprite, id) => {
      if (!currentIds.has(id)) {
        // 퇴장 애니메이션
        this.tweens.add({
          targets: sprite,
          alpha: 0,
          x: sprite.x + 50,
          duration: 300,
          onComplete: () => sprite.destroy(),
        });
        this.customerSprites.delete(id);
      }
    });

    // 새 손님 추가 및 위치 업데이트
    queue.forEach((customer, index) => {
      const targetX = width / 2 - 120 + index * 60;
      const targetY = height * 0.65;

      if (this.customerSprites.has(customer.id)) {
        // 기존 손님 업데이트
        const container = this.customerSprites.get(customer.id)!;
        this.tweens.add({
          targets: container,
          x: targetX,
          duration: 300,
          ease: 'Power2',
        });
        this.updateCustomerMood(container, customer);
      } else {
        // 새 손님 생성
        const container = this.createCustomerSprite(customer, targetX - 100, targetY);
        this.customerSprites.set(customer.id, container);

        // 입장 애니메이션
        this.tweens.add({
          targets: container,
          x: targetX,
          duration: 500,
          ease: 'Back.easeOut',
        });
      }
    });
  }

  private createCustomerSprite(customer: Customer, x: number, y: number): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);

    // 손님 이모지 (더 크게)
    const emoji = this.add.text(0, 0, customer.emoji, {
      fontSize: '42px',
    }).setOrigin(0.5);

    // 말풍선 배경
    const bubble = this.add.graphics();
    bubble.fillStyle(0xFFFFFF, 0.95);
    bubble.fillRoundedRect(-40, -70, 80, 45, 10);
    bubble.lineStyle(2, 0x8B7355);
    bubble.strokeRoundedRect(-40, -70, 80, 45, 10);

    // 말풍선 꼬리
    bubble.fillStyle(0xFFFFFF, 0.95);
    bubble.fillTriangle(-5, -25, 5, -25, 0, -15);

    // 주문 내용
    const orderText = this.add.text(0, -55, `🍎×${customer.quantity}`, {
      fontSize: '16px',
      color: '#333333',
      fontFamily: 'Arial',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // 기분 이모지
    const moodEmoji = this.add.text(25, -65, this.getMoodEmoji(customer.mood), {
      fontSize: '16px',
    }).setOrigin(0.5);
    moodEmoji.setName('mood');

    // 인내심 바
    const patienceBg = this.add.rectangle(0, 30, 50, 8, 0xDDDDDD).setStrokeStyle(1, 0x999999);
    const patienceBar = this.add.rectangle(-25 + (customer.patience / 100) * 25, 30, customer.patience / 2, 6, this.getPatienceColor(customer.patience));
    patienceBar.setName('patience');

    container.add([bubble, emoji, orderText, moodEmoji, patienceBg, patienceBar]);

    // 터치로 판매
    container.setSize(80, 120);
    container.setInteractive({ useHandCursor: true });
    container.on('pointerdown', () => this.handleSale(customer));

    return container;
  }

  private updateCustomerMood(container: Phaser.GameObjects.Container, customer: Customer) {
    const moodEmoji = container.getByName('mood') as Phaser.GameObjects.Text;
    if (moodEmoji) {
      moodEmoji.setText(this.getMoodEmoji(customer.mood));
    }

    const patienceBar = container.getByName('patience') as Phaser.GameObjects.Rectangle;
    if (patienceBar) {
      patienceBar.width = customer.patience / 2;
      patienceBar.setFillStyle(this.getPatienceColor(customer.patience));
      patienceBar.x = -25 + (customer.patience / 100) * 25;
    }
  }

  private getMoodEmoji(mood: string): string {
    switch (mood) {
      case 'happy': return '😊';
      case 'neutral': return '😐';
      case 'angry': return '😠';
      default: return '😊';
    }
  }

  private getPatienceColor(patience: number): number {
    if (patience > 60) return 0x27AE60;
    if (patience > 30) return 0xF39C12;
    return 0xE74C3C;
  }

  private handleSale(customer: Customer) {
    const result = gameState.sellToCustomer(customer.id);

    if (result.success) {
      this.showMoneyEffect(result.revenue);
      this.showFeedback(result.message, 0x27AE60);
    } else {
      this.showFeedback(result.message, 0xE74C3C);
    }
  }

  private showMoneyEffect(amount: number) {
    const { width, height } = this.scale;

    // 동전 파티클 효과
    for (let i = 0; i < 5; i++) {
      const coin = this.add.text(
        width / 2 + Phaser.Math.Between(-50, 50),
        height * 0.5,
        '💰',
        { fontSize: '24px' }
      );

      this.tweens.add({
        targets: coin,
        y: height * 0.1,
        x: width - 50,
        alpha: 0,
        duration: 800,
        delay: i * 100,
        ease: 'Power2',
        onComplete: () => coin.destroy(),
      });
    }

    // 금액 텍스트
    const amountText = this.add.text(width / 2, height * 0.45, `+₩${amount.toLocaleString()}`, {
      fontSize: '32px',
      color: '#27AE60',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      stroke: '#FFFFFF',
      strokeThickness: 4,
    }).setOrigin(0.5);

    this.tweens.add({
      targets: amountText,
      y: height * 0.35,
      alpha: 0,
      scale: 1.5,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => amountText.destroy(),
    });
  }

  private showFeedback(text: string, color: number) {
    const { width, height } = this.scale;

    const feedback = this.add.text(width / 2, height * 0.55, text, {
      fontSize: '24px',
      color: `#${color.toString(16).padStart(6, '0')}`,
      fontFamily: 'Arial',
      fontStyle: 'bold',
      stroke: '#FFFFFF',
      strokeThickness: 3,
    }).setOrigin(0.5);

    this.tweens.add({
      targets: feedback,
      y: height * 0.50,
      alpha: 0,
      duration: 1500,
      onComplete: () => feedback.destroy(),
    });
  }
}

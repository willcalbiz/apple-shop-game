import Phaser from 'phaser';
import { gameState } from '../game/GameState';

export class MainScene extends Phaser.Scene {
  private shopApples: Phaser.GameObjects.Text[] = [];
  private customerBubble?: Phaser.GameObjects.Container;
  private currentCustomer?: { quantity: number; maxPrice: number };

  constructor() {
    super({ key: 'MainScene' });
  }

  create() {
    // 배경 (시간대별 색상)
    this.updateBackground();

    // 가게 그리기
    this.drawShop();

    // 사과 진열
    this.updateAppleDisplay();

    // 이벤트 리스너
    gameState.subscribe(() => {
      this.updateAppleDisplay();
      this.updateBackground();
    });

    // 손님 생성 타이머 (낮에만)
    this.time.addEvent({
      delay: 3000,
      callback: () => this.maybeSpawnCustomer(),
      loop: true,
    });
  }

  private updateBackground() {
    const state = gameState.getState();
    let color = 0xFDF6E3;
    
    if (state.timeOfDay === 'morning') {
      color = 0xFFE4C4; // 연한 분홍/주황
    } else if (state.timeOfDay === 'noon') {
      color = 0xFDF6E3; // 밝은 베이지
    } else {
      color = 0xE8D5C4; // 저녁 톤
    }
    
    this.cameras.main.setBackgroundColor(color);
  }

  private drawShop() {
    const { width, height } = this.scale;

    // 가게 건물
    this.add.rectangle(width / 2, height * 0.35, 300, 200, 0xD4C4A8)
      .setStrokeStyle(4, 0x8B7355);

    // 지붕
    this.add.triangle(
      width / 2, height * 0.2,
      0, 80,
      170, 0,
      340, 80,
      0xC0392B
    );

    // 간판
    this.add.rectangle(width / 2, height * 0.28, 120, 40, 0x8B7355);
    this.add.text(width / 2, height * 0.28, '🍎 사과', {
      fontSize: '20px',
      color: '#FFFFFF',
      fontFamily: 'Arial, sans-serif',
    }).setOrigin(0.5);

    // 진열대
    this.add.rectangle(width / 2, height * 0.42, 250, 60, 0x8B7355);
  }

  private updateAppleDisplay() {
    // 기존 사과 제거
    this.shopApples.forEach(a => a.destroy());
    this.shopApples = [];

    const state = gameState.getState();
    const { width, height } = this.scale;

    // 사과 표시 (최대 10개만 시각적으로)
    const displayCount = Math.min(state.apples, 10);
    const startX = width / 2 - 100;

    for (let i = 0; i < displayCount; i++) {
      const x = startX + (i % 5) * 50;
      const y = height * 0.40 + Math.floor(i / 5) * 25;
      const apple = this.add.text(x, y, '🍎', { fontSize: '28px' });
      this.shopApples.push(apple);
    }

    // 재고 숫자
    if (state.apples > 10) {
      const moreText = this.add.text(width / 2 + 80, height * 0.42, `+${state.apples - 10}`, {
        fontSize: '16px',
        color: '#8B7355',
      });
      this.shopApples.push(moreText);
    }
  }

  private maybeSpawnCustomer() {
    const state = gameState.getState();
    
    // 낮에만 손님 등장
    if (state.timeOfDay !== 'noon') return;
    
    // 이미 손님이 있으면 스킵
    if (this.currentCustomer) return;
    
    // 사과가 없으면 스킵
    if (state.apples === 0) return;

    // 30% 확률로 손님 등장
    if (Math.random() > 0.3) return;

    this.spawnCustomer();
  }

  private spawnCustomer() {
    const state = gameState.getState();
    const { width, height } = this.scale;

    // 손님 정보 생성
    const quantity = Math.min(Math.floor(Math.random() * 5) + 1, state.apples);
    const maxPrice = state.appleCost + Math.floor(Math.random() * 200) + 50; // 원가 + 50~250

    this.currentCustomer = { quantity, maxPrice };

    // 손님 말풍선
    this.customerBubble = this.add.container(width / 2, height * 0.6);

    const bubble = this.add.rectangle(0, 0, 280, 120, 0xFFFFFF, 1)
      .setStrokeStyle(2, 0x8B7355);
    
    const customerEmoji = this.add.text(-100, 0, '👤', { fontSize: '40px' });
    
    const text = this.add.text(0, -20, `"사과 ${quantity}개 주세요~"`, {
      fontSize: '18px',
      color: '#333333',
      fontFamily: 'Arial, sans-serif',
    }).setOrigin(0.5);

    const priceText = this.add.text(0, 15, `희망가: 최대 ${maxPrice}원/개`, {
      fontSize: '14px',
      color: '#666666',
      fontFamily: 'Arial, sans-serif',
    }).setOrigin(0.5);

    this.customerBubble.add([bubble, customerEmoji, text, priceText]);

    // UI Scene에 손님 정보 전달
    this.events.emit('customerArrived', this.currentCustomer);
  }

  // UIScene에서 호출
  public handleSale(pricePerApple: number) {
    if (!this.currentCustomer) return;

    const { quantity, maxPrice } = this.currentCustomer;

    if (pricePerApple <= maxPrice) {
      // 판매 성공
      gameState.sellApples(quantity, pricePerApple);
      this.showFeedback(`+${quantity * pricePerApple}원!`, 0x27AE60);
    } else {
      // 너무 비싸서 거절
      this.showFeedback('너무 비싸요...', 0xE74C3C);
    }

    this.dismissCustomer();
  }

  public dismissCustomer() {
    if (this.customerBubble) {
      this.customerBubble.destroy();
      this.customerBubble = undefined;
    }
    this.currentCustomer = undefined;
    this.events.emit('customerLeft');
  }

  private showFeedback(text: string, color: number) {
    const { width, height } = this.scale;
    
    const feedback = this.add.text(width / 2, height * 0.5, text, {
      fontSize: '32px',
      color: `#${color.toString(16)}`,
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.tweens.add({
      targets: feedback,
      y: height * 0.4,
      alpha: 0,
      duration: 1000,
      onComplete: () => feedback.destroy(),
    });
  }

  public getCurrentCustomer() {
    return this.currentCustomer;
  }
}

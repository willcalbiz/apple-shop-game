import Phaser from 'phaser';
import { gameState } from '../game/GameState';

export class UIScene extends Phaser.Scene {
  private cashText?: Phaser.GameObjects.Text;
  private applesText?: Phaser.GameObjects.Text;
  private dayText?: Phaser.GameObjects.Text;
  private timeText?: Phaser.GameObjects.Text;
  private buyModal?: Phaser.GameObjects.Container;
  private sellModal?: Phaser.GameObjects.Container;
  private currentCustomer?: { quantity: number; maxPrice: number };
  private sellPriceText?: Phaser.GameObjects.Text;
  private sellPrice: number = 300;

  constructor() {
    super({ key: 'UIScene' });
  }

  create() {
    const { width } = this.scale;

    // 상단 바
    this.add.rectangle(width / 2, 40, width, 80, 0x8B7355);

    this.dayText = this.add.text(20, 20, 'Day 1', {
      fontSize: '20px',
      color: '#FFFFFF',
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold',
    });

    this.timeText = this.add.text(20, 45, '☀️ 아침', {
      fontSize: '16px',
      color: '#FDF6E3',
      fontFamily: 'Arial, sans-serif',
    });

    this.cashText = this.add.text(width - 20, 20, '💰 10,000원', {
      fontSize: '18px',
      color: '#FFFFFF',
      fontFamily: 'Arial, sans-serif',
    }).setOrigin(1, 0);

    this.applesText = this.add.text(width - 20, 45, '🍎 0개', {
      fontSize: '16px',
      color: '#FDF6E3',
      fontFamily: 'Arial, sans-serif',
    }).setOrigin(1, 0);

    // 하단 버튼들
    this.createActionButtons();

    // 상태 업데이트
    gameState.subscribe(() => this.updateUI());
    this.updateUI();

    // MainScene에서 손님 이벤트 수신
    const mainScene = this.scene.get('MainScene');
    mainScene.events.on('customerArrived', (customer: { quantity: number; maxPrice: number }) => {
      this.currentCustomer = customer;
      this.showSellModal();
    });
    mainScene.events.on('customerLeft', () => {
      this.currentCustomer = undefined;
      if (this.sellModal) {
        this.sellModal.destroy();
        this.sellModal = undefined;
      }
    });
  }

  private createActionButtons() {
    const { width, height } = this.scale;
    const btnY = height - 120;

    // 구매 버튼
    const buyBtn = this.add.rectangle(width * 0.2, btnY, 100, 60, 0x27AE60)
      .setInteractive({ useHandCursor: true });
    this.add.text(width * 0.2, btnY - 10, '🛒', { fontSize: '24px' }).setOrigin(0.5);
    this.add.text(width * 0.2, btnY + 15, '구매', {
      fontSize: '14px',
      color: '#FFFFFF',
      fontFamily: 'Arial, sans-serif',
    }).setOrigin(0.5);
    buyBtn.on('pointerdown', () => this.showBuyModal());

    // 장부 버튼
    const ledgerBtn = this.add.rectangle(width * 0.5, btnY, 100, 60, 0x3498DB)
      .setInteractive({ useHandCursor: true });
    this.add.text(width * 0.5, btnY - 10, '📒', { fontSize: '24px' }).setOrigin(0.5);
    this.add.text(width * 0.5, btnY + 15, '장부', {
      fontSize: '14px',
      color: '#FFFFFF',
      fontFamily: 'Arial, sans-serif',
    }).setOrigin(0.5);
    ledgerBtn.on('pointerdown', () => this.scene.launch('LedgerScene'));

    // 다음 버튼
    const nextBtn = this.add.rectangle(width * 0.8, btnY, 100, 60, 0xF39C12)
      .setInteractive({ useHandCursor: true });
    this.add.text(width * 0.8, btnY - 10, '⏭️', { fontSize: '24px' }).setOrigin(0.5);
    this.add.text(width * 0.8, btnY + 15, '다음', {
      fontSize: '14px',
      color: '#FFFFFF',
      fontFamily: 'Arial, sans-serif',
    }).setOrigin(0.5);
    nextBtn.on('pointerdown', () => gameState.advanceTime());

    // 하단 네비게이션
    this.add.rectangle(width / 2, height - 30, width, 60, 0xD4C4A8);
  }

  private updateUI() {
    const state = gameState.getState();

    if (this.cashText) {
      this.cashText.setText(`💰 ${state.cash.toLocaleString()}원`);
    }
    if (this.applesText) {
      this.applesText.setText(`🍎 ${state.apples}개`);
    }
    if (this.dayText) {
      this.dayText.setText(`Day ${state.day}`);
    }
    if (this.timeText) {
      const timeEmoji = state.timeOfDay === 'morning' ? '☀️ 아침' :
                        state.timeOfDay === 'noon' ? '🌞 낮' : '🌙 저녁';
      this.timeText.setText(timeEmoji);
    }
  }

  private showBuyModal() {
    if (this.buyModal) return;

    const { width, height } = this.scale;
    const state = gameState.getState();

    this.buyModal = this.add.container(width / 2, height / 2);

    // 배경
    const bg = this.add.rectangle(0, 0, 320, 350, 0xFFFFFF)
      .setStrokeStyle(3, 0x8B7355);

    // 제목
    const title = this.add.text(0, -140, '📦 도매상 구매', {
      fontSize: '24px',
      color: '#8B7355',
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // 현재 자금
    const cashInfo = this.add.text(0, -100, `보유: ${state.cash.toLocaleString()}원`, {
      fontSize: '16px',
      color: '#666666',
      fontFamily: 'Arial, sans-serif',
    }).setOrigin(0.5);

    // 사과 가격 정보
    const priceInfo = this.add.text(0, -70, `🍎 개당 ${state.appleCost}원`, {
      fontSize: '18px',
      color: '#333333',
      fontFamily: 'Arial, sans-serif',
    }).setOrigin(0.5);

    // 수량 선택
    let quantity = 10;
    const maxQty = Math.floor(state.cash / state.appleCost);

    const qtyText = this.add.text(0, -20, `${quantity}개`, {
      fontSize: '32px',
      color: '#E74C3C',
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    const totalText = this.add.text(0, 20, `합계: ${(quantity * state.appleCost).toLocaleString()}원`, {
      fontSize: '18px',
      color: '#333333',
      fontFamily: 'Arial, sans-serif',
    }).setOrigin(0.5);

    // - 버튼
    const minusBtn = this.add.rectangle(-80, -20, 50, 50, 0xE74C3C)
      .setInteractive({ useHandCursor: true });
    this.add.text(-80, -20, '-', {
      fontSize: '32px',
      color: '#FFFFFF',
    }).setOrigin(0.5);
    minusBtn.on('pointerdown', () => {
      quantity = Math.max(1, quantity - 5);
      qtyText.setText(`${quantity}개`);
      totalText.setText(`합계: ${(quantity * state.appleCost).toLocaleString()}원`);
    });

    // + 버튼
    const plusBtn = this.add.rectangle(80, -20, 50, 50, 0x27AE60)
      .setInteractive({ useHandCursor: true });
    this.add.text(80, -20, '+', {
      fontSize: '32px',
      color: '#FFFFFF',
    }).setOrigin(0.5);
    plusBtn.on('pointerdown', () => {
      quantity = Math.min(maxQty, quantity + 5);
      qtyText.setText(`${quantity}개`);
      totalText.setText(`합계: ${(quantity * state.appleCost).toLocaleString()}원`);
    });

    // 구매 버튼
    const buyBtn = this.add.rectangle(0, 90, 200, 50, 0x27AE60)
      .setInteractive({ useHandCursor: true });
    this.add.text(0, 90, '🛒 구매하기', {
      fontSize: '20px',
      color: '#FFFFFF',
      fontFamily: 'Arial, sans-serif',
    }).setOrigin(0.5);
    buyBtn.on('pointerdown', () => {
      gameState.buyApples(quantity);
      this.closeBuyModal();
    });

    // 닫기 버튼
    const closeBtn = this.add.text(140, -150, '✕', {
      fontSize: '24px',
      color: '#999999',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => this.closeBuyModal());

    this.buyModal.add([bg, title, cashInfo, priceInfo, qtyText, totalText, minusBtn, plusBtn, buyBtn, closeBtn]);
  }

  private closeBuyModal() {
    if (this.buyModal) {
      this.buyModal.destroy();
      this.buyModal = undefined;
    }
  }

  private showSellModal() {
    if (this.sellModal || !this.currentCustomer) return;

    const { width, height } = this.scale;
    const state = gameState.getState();
    const { quantity, maxPrice } = this.currentCustomer;
    this.sellPrice = Math.min(maxPrice, state.appleCost + 100);

    this.sellModal = this.add.container(width / 2, height / 2 + 100);

    // 배경
    const bg = this.add.rectangle(0, 0, 320, 200, 0xFFFFFF)
      .setStrokeStyle(3, 0x8B7355);

    // 제목
    const title = this.add.text(0, -70, `💵 ${quantity}개 판매`, {
      fontSize: '20px',
      color: '#8B7355',
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // 가격 설정
    this.sellPriceText = this.add.text(0, -30, `${this.sellPrice}원/개`, {
      fontSize: '28px',
      color: '#E74C3C',
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // - 버튼
    const minusBtn = this.add.rectangle(-100, -30, 40, 40, 0xE74C3C)
      .setInteractive({ useHandCursor: true });
    this.add.text(-100, -30, '-', { fontSize: '24px', color: '#FFFFFF' }).setOrigin(0.5);
    minusBtn.on('pointerdown', () => {
      this.sellPrice = Math.max(state.appleCost, this.sellPrice - 50);
      this.sellPriceText?.setText(`${this.sellPrice}원/개`);
    });

    // + 버튼
    const plusBtn = this.add.rectangle(100, -30, 40, 40, 0x27AE60)
      .setInteractive({ useHandCursor: true });
    this.add.text(100, -30, '+', { fontSize: '24px', color: '#FFFFFF' }).setOrigin(0.5);
    plusBtn.on('pointerdown', () => {
      this.sellPrice += 50;
      this.sellPriceText?.setText(`${this.sellPrice}원/개`);
    });

    // 예상 수익
    const profitText = this.add.text(0, 10, `예상 매출: ${(quantity * this.sellPrice).toLocaleString()}원`, {
      fontSize: '14px',
      color: '#27AE60',
      fontFamily: 'Arial, sans-serif',
    }).setOrigin(0.5);

    // 판매 버튼
    const sellBtn = this.add.rectangle(0, 60, 200, 45, 0x27AE60)
      .setInteractive({ useHandCursor: true });
    this.add.text(0, 60, '✅ 판매하기', {
      fontSize: '18px',
      color: '#FFFFFF',
      fontFamily: 'Arial, sans-serif',
    }).setOrigin(0.5);
    sellBtn.on('pointerdown', () => {
      const mainScene = this.scene.get('MainScene') as any;
      mainScene.handleSale(this.sellPrice);
    });

    this.sellModal.add([bg, title, this.sellPriceText, minusBtn, plusBtn, profitText, sellBtn]);
  }
}

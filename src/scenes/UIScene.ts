import Phaser from 'phaser';
import type { DaySummary } from '../game/GameState';
import { gameState } from '../game/GameState';

export class UIScene extends Phaser.Scene {
  private cashText?: Phaser.GameObjects.Text;
  private applesText?: Phaser.GameObjects.Text;
  private dayText?: Phaser.GameObjects.Text;
  private timeText?: Phaser.GameObjects.Text;
  private reputationText?: Phaser.GameObjects.Text;
  private priceText?: Phaser.GameObjects.Text;
  private modal?: Phaser.GameObjects.Container;
  private currentPrice: number = 350;

  constructor() {
    super({ key: 'UIScene' });
  }

  create() {
    const { width } = this.scale;

    // 상단 바 (그라데이션 효과)
    const topBar = this.add.graphics();
    topBar.fillGradientStyle(0x8B7355, 0x8B7355, 0x6B5344, 0x6B5344, 1);
    topBar.fillRect(0, 0, width, 90);

    // 상단 바 그림자
    topBar.fillStyle(0x000000, 0.1);
    topBar.fillRect(0, 90, width, 3);

    this.createTopBar();
    this.createActionButtons();
    this.createPriceControl();

    gameState.subscribe(() => this.updateUI());
    this.updateUI();
  }

  private createTopBar() {
    const { width } = this.scale;

    // 왼쪽: 날짜/시간
    this.dayText = this.add.text(20, 18, 'Day 1', {
      fontSize: '24px',
      color: '#FFFFFF',
      fontFamily: 'Arial',
      fontStyle: 'bold',
    });

    this.timeText = this.add.text(20, 48, '☀️ 아침', {
      fontSize: '16px',
      color: '#FFE4B5',
      fontFamily: 'Arial',
    });

    // 가운데: 평판
    this.reputationText = this.add.text(width / 2, 30, '⭐⭐⭐☆☆', {
      fontSize: '20px',
      color: '#FFD700',
    }).setOrigin(0.5, 0);

    this.add.text(width / 2, 55, '평판', {
      fontSize: '12px',
      color: '#FFE4B5',
    }).setOrigin(0.5, 0);

    // 오른쪽: 현금/재고
    this.cashText = this.add.text(width - 20, 18, '💰 10,000원', {
      fontSize: '18px',
      color: '#90EE90',
      fontFamily: 'Arial',
      fontStyle: 'bold',
    }).setOrigin(1, 0);

    this.applesText = this.add.text(width - 20, 45, '🍎 0개', {
      fontSize: '16px',
      color: '#FFE4B5',
      fontFamily: 'Arial',
    }).setOrigin(1, 0);

    // 수익/분 표시
    this.add.text(width - 20, 68, '', {
      fontSize: '12px',
      color: '#90EE90',
    }).setOrigin(1, 0).setName('incomeRate');
  }

  private createPriceControl() {
    const { width, height } = this.scale;
    const y = height - 200;

    // 가격 설정 패널
    const panel = this.add.graphics();
    panel.fillStyle(0xFFFFFF, 0.95);
    panel.fillRoundedRect(20, y, width - 40, 60, 15);
    panel.lineStyle(2, 0x8B7355);
    panel.strokeRoundedRect(20, y, width - 40, 60, 15);

    this.add.text(40, y + 10, '판매가', {
      fontSize: '14px',
      color: '#8B7355',
      fontFamily: 'Arial',
    });

    // 가격 조절 버튼
    const minusBtn = this.add.rectangle(width / 2 - 80, y + 30, 45, 35, 0xE74C3C)
      .setInteractive({ useHandCursor: true })
      .setStrokeStyle(2, 0xC0392B);
    this.add.text(width / 2 - 80, y + 30, '−50', {
      fontSize: '14px',
      color: '#FFFFFF',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    minusBtn.on('pointerdown', () => {
      this.currentPrice = Math.max(200, this.currentPrice - 50);
      gameState.setPrice(this.currentPrice);
    });

    this.priceText = this.add.text(width / 2, y + 30, '₩350', {
      fontSize: '24px',
      color: '#E74C3C',
      fontFamily: 'Arial',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    const plusBtn = this.add.rectangle(width / 2 + 80, y + 30, 45, 35, 0x27AE60)
      .setInteractive({ useHandCursor: true })
      .setStrokeStyle(2, 0x1E8449);
    this.add.text(width / 2 + 80, y + 30, '+50', {
      fontSize: '14px',
      color: '#FFFFFF',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    plusBtn.on('pointerdown', () => {
      this.currentPrice = Math.min(1000, this.currentPrice + 50);
      gameState.setPrice(this.currentPrice);
    });

    // 원가 대비 표시
    this.add.text(width - 40, y + 10, '원가: ₩200', {
      fontSize: '12px',
      color: '#999999',
    }).setOrigin(1, 0);
  }

  private createActionButtons() {
    const { width, height } = this.scale;
    const btnY = height - 110;

    // 버튼 배경
    this.add.rectangle(width / 2, height - 80, width, 160, 0xF5F5DC);

    // 구매 버튼
    this.createButton(width * 0.17, btnY, '🛒', '매입', 0x27AE60, () => this.showBuyModal());

    // 장부 버튼
    this.createButton(width * 0.39, btnY, '📒', '장부', 0x3498DB, () => this.scene.launch('LedgerScene'));

    // 업그레이드 버튼
    this.createButton(width * 0.61, btnY, '⬆️', '업그레이드', 0x9B59B6, () => this.showUpgradeModal());

    // 다음 버튼
    this.createButton(width * 0.83, btnY, '⏭️', '다음', 0xF39C12, () => this.handleAdvanceTime());
  }

  private createButton(x: number, y: number, emoji: string, label: string, color: number, onClick: () => void) {
    const btn = this.add.container(x, y);

    const bg = this.add.graphics();
    bg.fillStyle(color, 1);
    bg.fillRoundedRect(-38, -32, 76, 64, 12);
    bg.lineStyle(3, color - 0x222222);
    bg.strokeRoundedRect(-38, -32, 76, 64, 12);

    const emojiText = this.add.text(0, -10, emoji, { fontSize: '26px' }).setOrigin(0.5);
    const labelText = this.add.text(0, 18, label, {
      fontSize: '12px',
      color: '#FFFFFF',
      fontFamily: 'Arial',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    btn.add([bg, emojiText, labelText]);
    btn.setSize(76, 64);
    btn.setInteractive({ useHandCursor: true });

    btn.on('pointerdown', () => {
      this.tweens.add({
        targets: btn,
        scale: 0.9,
        duration: 50,
        yoyo: true,
      });
      onClick();
    });
  }

  private updateUI() {
    const state = gameState.getState();

    if (this.cashText) {
      const cashColor = state.cash >= 10000 ? '#90EE90' : state.cash >= 3000 ? '#FFD700' : '#FF6B6B';
      this.cashText.setText(`💰 ${state.cash.toLocaleString()}원`);
      this.cashText.setColor(cashColor);
    }

    if (this.applesText) {
      const appleColor = state.apples > 10 ? '#FFE4B5' : state.apples > 0 ? '#FFD700' : '#FF6B6B';
      this.applesText.setText(`🍎 ${state.apples}개`);
      this.applesText.setColor(appleColor);
    }

    if (this.dayText) {
      this.dayText.setText(`Day ${state.day}`);
    }

    if (this.timeText) {
      const timeInfo: Record<string, string> = {
        morning: '🌅 아침 (매입시간)',
        noon: '☀️ 낮 (영업시간)',
        evening: '🌆 저녁 (마감)',
      };
      this.timeText.setText(timeInfo[state.timeOfDay]);
    }

    if (this.reputationText) {
      const stars = Math.round(state.reputation);
      const fullStars = '⭐'.repeat(stars);
      const emptyStars = '☆'.repeat(5 - stars);
      this.reputationText.setText(fullStars + emptyStars);
    }

    if (this.priceText) {
      this.priceText.setText(`₩${state.applePrice}`);
      this.currentPrice = state.applePrice;
    }
  }

  private handleAdvanceTime() {
    const result = gameState.advanceTime();
    if (result.newDay && result.summary) {
      this.showDaySummary(result.summary);
    }
  }

  private showBuyModal() {
    if (this.modal) return;

    const { width, height } = this.scale;
    const state = gameState.getState();

    this.modal = this.add.container(width / 2, height / 2);

    // 배경 오버레이
    const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.5);

    // 모달 패널
    const panel = this.add.graphics();
    panel.fillStyle(0xFFFFFF, 1);
    panel.fillRoundedRect(-160, -180, 320, 360, 20);
    panel.lineStyle(4, 0x27AE60);
    panel.strokeRoundedRect(-160, -180, 320, 360, 20);

    // 제목
    const title = this.add.text(0, -150, '🛒 도매상 매입', {
      fontSize: '24px',
      color: '#27AE60',
      fontFamily: 'Arial',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // 현재 잔액
    const balance = this.add.text(0, -110, `보유 자금: ₩${state.cash.toLocaleString()}`, {
      fontSize: '16px',
      color: '#666666',
    }).setOrigin(0.5);

    // 사과 이미지
    const appleImg = this.add.text(0, -50, '🍎', { fontSize: '60px' }).setOrigin(0.5);

    // 단가
    const unitPrice = this.add.text(0, 0, `개당 ₩${state.appleCost}`, {
      fontSize: '18px',
      color: '#333333',
    }).setOrigin(0.5);

    // 수량 선택
    let quantity = 20;
    const maxQty = Math.floor(state.cash / state.appleCost);

    const qtyText = this.add.text(0, 50, `${quantity}개`, {
      fontSize: '36px',
      color: '#E74C3C',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    const totalText = this.add.text(0, 95, `합계: ₩${(quantity * state.appleCost).toLocaleString()}`, {
      fontSize: '18px',
      color: '#333333',
    }).setOrigin(0.5);

    // - 버튼
    const minusBtn = this.add.rectangle(-80, 50, 50, 50, 0xE74C3C)
      .setInteractive({ useHandCursor: true });
    this.add.text(-80, 50, '−', { fontSize: '32px', color: '#FFFFFF' }).setOrigin(0.5);
    minusBtn.on('pointerdown', () => {
      quantity = Math.max(5, quantity - 5);
      qtyText.setText(`${quantity}개`);
      totalText.setText(`합계: ₩${(quantity * state.appleCost).toLocaleString()}`);
    });

    // + 버튼
    const plusBtn = this.add.rectangle(80, 50, 50, 50, 0x27AE60)
      .setInteractive({ useHandCursor: true });
    this.add.text(80, 50, '+', { fontSize: '32px', color: '#FFFFFF' }).setOrigin(0.5);
    plusBtn.on('pointerdown', () => {
      quantity = Math.min(maxQty, quantity + 5);
      qtyText.setText(`${quantity}개`);
      totalText.setText(`합계: ₩${(quantity * state.appleCost).toLocaleString()}`);
    });

    // 구매 버튼
    const buyBtn = this.add.rectangle(0, 150, 200, 50, 0x27AE60)
      .setInteractive({ useHandCursor: true });
    this.add.text(0, 150, '🛒 구매하기', {
      fontSize: '20px',
      color: '#FFFFFF',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    buyBtn.on('pointerdown', () => {
      gameState.buyApples(quantity);
      this.closeModal();
    });

    // 닫기 버튼
    const closeBtn = this.add.text(140, -160, '✕', {
      fontSize: '28px',
      color: '#999999',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => this.closeModal());

    this.modal.add([overlay, panel, title, balance, appleImg, unitPrice, qtyText, totalText, minusBtn, plusBtn, buyBtn, closeBtn]);
  }

  private showUpgradeModal() {
    if (this.modal) return;

    const { width, height } = this.scale;
    const state = gameState.getState();
    const upgradeCost = state.shopLevel * 5000;

    this.modal = this.add.container(width / 2, height / 2);

    const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.5);

    const panel = this.add.graphics();
    panel.fillStyle(0xFFFFFF, 1);
    panel.fillRoundedRect(-150, -150, 300, 300, 20);
    panel.lineStyle(4, 0x9B59B6);
    panel.strokeRoundedRect(-150, -150, 300, 300, 20);

    const title = this.add.text(0, -120, '⬆️ 가게 업그레이드', {
      fontSize: '22px',
      color: '#9B59B6',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    const levelText = this.add.text(0, -70, `현재 레벨: ${state.shopLevel}`, {
      fontSize: '18px',
      color: '#333333',
    }).setOrigin(0.5);

    const shopEmoji = this.add.text(0, 0, '🏪', { fontSize: '60px' }).setOrigin(0.5);

    const costText = this.add.text(0, 60, `업그레이드 비용: ₩${upgradeCost.toLocaleString()}`, {
      fontSize: '16px',
      color: '#666666',
    }).setOrigin(0.5);

    const canAfford = state.cash >= upgradeCost;

    const upgradeBtn = this.add.rectangle(0, 110, 180, 45, canAfford ? 0x9B59B6 : 0xCCCCCC)
      .setInteractive({ useHandCursor: canAfford });
    this.add.text(0, 110, canAfford ? '업그레이드!' : '자금 부족', {
      fontSize: '18px',
      color: '#FFFFFF',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    if (canAfford) {
      upgradeBtn.on('pointerdown', () => {
        gameState.upgradeShop();
        this.closeModal();
      });
    }

    const closeBtn = this.add.text(130, -130, '✕', {
      fontSize: '28px',
      color: '#999999',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => this.closeModal());

    this.modal.add([overlay, panel, title, levelText, shopEmoji, costText, upgradeBtn, closeBtn]);
  }

  private showDaySummary(summary: DaySummary) {
    if (this.modal) this.closeModal();

    const { width, height } = this.scale;

    this.modal = this.add.container(width / 2, height / 2);

    const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.7);

    const panel = this.add.graphics();
    panel.fillStyle(0xFFFACD, 1);
    panel.fillRoundedRect(-170, -220, 340, 440, 20);
    panel.lineStyle(4, 0xDAA520);
    panel.strokeRoundedRect(-170, -220, 340, 440, 20);

    // 제목
    const titleEmoji = summary.profit >= 0 ? '🎉' : '😢';
    const title = this.add.text(0, -190, `${titleEmoji} Day ${summary.day} 결산`, {
      fontSize: '26px',
      color: '#8B7355',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // 결과 카드
    const cardY = -100;
    const card = this.add.graphics();
    card.fillStyle(0xFFFFFF, 1);
    card.fillRoundedRect(-140, cardY, 280, 180, 15);

    // 판매량
    this.add.text(-120, cardY + 20, '🍎 판매량', { fontSize: '16px', color: '#666' });
    this.add.text(120, cardY + 20, `${summary.sales}개`, { fontSize: '16px', color: '#333', fontStyle: 'bold' }).setOrigin(1, 0);

    // 매출
    this.add.text(-120, cardY + 50, '💵 매출', { fontSize: '16px', color: '#666' });
    this.add.text(120, cardY + 50, `₩${summary.revenue.toLocaleString()}`, { fontSize: '16px', color: '#27AE60', fontStyle: 'bold' }).setOrigin(1, 0);

    // 비용
    this.add.text(-120, cardY + 80, '📦 비용', { fontSize: '16px', color: '#666' });
    this.add.text(120, cardY + 80, `₩${summary.expenses.toLocaleString()}`, { fontSize: '16px', color: '#E74C3C', fontStyle: 'bold' }).setOrigin(1, 0);

    // 감모손실
    if (summary.spoiledApples > 0) {
      this.add.text(-120, cardY + 110, '🗑️ 감모손실', { fontSize: '14px', color: '#999' });
      this.add.text(120, cardY + 110, `${summary.spoiledApples}개`, { fontSize: '14px', color: '#E74C3C' }).setOrigin(1, 0);
    }

    // 구분선
    this.add.rectangle(0, cardY + 140, 240, 2, 0xDDDDDD);

    // 순이익
    const profitColor = summary.profit >= 0 ? '#27AE60' : '#E74C3C';
    const profitSign = summary.profit >= 0 ? '+' : '';
    this.add.text(-120, cardY + 155, '💎 순이익', { fontSize: '18px', color: '#333', fontStyle: 'bold' });
    this.add.text(120, cardY + 155, `${profitSign}₩${summary.profit.toLocaleString()}`, {
      fontSize: '18px',
      color: profitColor,
      fontStyle: 'bold',
    }).setOrigin(1, 0);

    // 손님 통계
    this.add.text(0, 120, `👥 손님: ${summary.customersServed}명 응대 / ${summary.customersLost}명 이탈`, {
      fontSize: '14px',
      color: '#666',
    }).setOrigin(0.5);

    // 평판
    const stars = Math.round(summary.reputation);
    this.add.text(0, 150, `⭐ 평판: ${'⭐'.repeat(stars)}${'☆'.repeat(5 - stars)}`, {
      fontSize: '16px',
      color: '#DAA520',
    }).setOrigin(0.5);

    // 다음 날 버튼
    const nextBtn = this.add.rectangle(0, 195, 200, 50, 0xF39C12)
      .setInteractive({ useHandCursor: true });
    this.add.text(0, 195, '▶️ 다음 날', {
      fontSize: '20px',
      color: '#FFFFFF',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    nextBtn.on('pointerdown', () => this.closeModal());

    this.modal.add([overlay, panel, card, title, nextBtn]);

    // 축하 이펙트 (이익일 때)
    if (summary.profit > 0) {
      this.createConfetti();
    }
  }

  private createConfetti() {
    const { width, height } = this.scale;
    const emojis = ['🎉', '✨', '💰', '⭐', '🍎'];

    for (let i = 0; i < 15; i++) {
      const emoji = this.add.text(
        Phaser.Math.Between(50, width - 50),
        -50,
        emojis[Math.floor(Math.random() * emojis.length)],
        { fontSize: '24px' }
      );

      this.tweens.add({
        targets: emoji,
        y: height + 50,
        x: emoji.x + Phaser.Math.Between(-100, 100),
        rotation: Phaser.Math.Between(-3, 3),
        duration: Phaser.Math.Between(2000, 3000),
        delay: i * 100,
        onComplete: () => emoji.destroy(),
      });
    }
  }

  private closeModal() {
    if (this.modal) {
      this.modal.destroy();
      this.modal = undefined;
    }
  }
}

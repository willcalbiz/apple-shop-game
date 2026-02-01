import Phaser from 'phaser';
import { gameState } from '../game/GameState';

export class LedgerScene extends Phaser.Scene {
  constructor() {
    super({ key: 'LedgerScene' });
  }

  create() {
    const { width, height } = this.scale;
    const state = gameState.getState();

    // 반투명 배경
    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.5)
      .setInteractive();

    // 장부 패널
    this.add.rectangle(width / 2, height / 2, 350, 600, 0xFDF6E3)
      .setStrokeStyle(4, 0x8B7355);

    // 제목
    this.add.text(width / 2, height / 2 - 260, `📒 장부 - Day ${state.day}`, {
      fontSize: '24px',
      color: '#8B7355',
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // 닫기 버튼
    const closeBtn = this.add.text(width / 2 + 150, height / 2 - 270, '✕', {
      fontSize: '28px',
      color: '#999999',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => this.scene.stop());

    // 현금 잔고
    this.add.rectangle(width / 2, height / 2 - 200, 300, 50, 0x27AE60);
    this.add.text(width / 2, height / 2 - 200, `💰 현금 잔고: ${state.cash.toLocaleString()}원`, {
      fontSize: '20px',
      color: '#FFFFFF',
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // 오늘의 거래
    this.add.text(width / 2, height / 2 - 150, '── 오늘의 거래 ──', {
      fontSize: '16px',
      color: '#8B7355',
      fontFamily: 'Arial, sans-serif',
    }).setOrigin(0.5);

    // 거래 내역
    const todayTx = gameState.getTodayTransactions();
    let yPos = height / 2 - 120;

    if (todayTx.length === 0) {
      this.add.text(width / 2, yPos, '아직 거래가 없습니다', {
        fontSize: '14px',
        color: '#999999',
        fontFamily: 'Arial, sans-serif',
      }).setOrigin(0.5);
      yPos += 30;
    } else {
      todayTx.slice(-6).forEach(tx => {
        const color = tx.type === 'income' ? '#27AE60' : '#E74C3C';
        const sign = tx.type === 'income' ? '+' : '-';
        this.add.text(width / 2 - 140, yPos, tx.description, {
          fontSize: '14px',
          color: '#333333',
          fontFamily: 'Arial, sans-serif',
        });
        this.add.text(width / 2 + 100, yPos, `${sign}${tx.amount.toLocaleString()}원`, {
          fontSize: '14px',
          color: color,
          fontFamily: 'Arial, sans-serif',
        }).setOrigin(1, 0);
        yPos += 28;
      });
    }

    // 구분선
    yPos += 10;
    this.add.rectangle(width / 2, yPos, 280, 2, 0x8B7355);
    yPos += 20;

    // 오늘의 손익
    const todayProfit = gameState.getTodayProfit();
    const profitColor = todayProfit >= 0 ? '#27AE60' : '#E74C3C';
    const profitSign = todayProfit >= 0 ? '+' : '';
    
    this.add.text(width / 2, yPos, '📊 오늘의 손익', {
      fontSize: '18px',
      color: '#8B7355',
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    yPos += 35;

    this.add.text(width / 2, yPos, `${profitSign}${todayProfit.toLocaleString()}원`, {
      fontSize: '32px',
      color: profitColor,
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    yPos += 50;

    // 자산 현황
    this.add.text(width / 2, yPos, '── 자산 현황 ──', {
      fontSize: '16px',
      color: '#8B7355',
      fontFamily: 'Arial, sans-serif',
    }).setOrigin(0.5);
    yPos += 30;

    // 재고
    const inventoryValue = state.apples * state.appleCost;
    this.add.text(width / 2 - 140, yPos, `🍎 재고 (${state.apples}개)`, {
      fontSize: '14px',
      color: '#333333',
      fontFamily: 'Arial, sans-serif',
    });
    this.add.text(width / 2 + 100, yPos, `${inventoryValue.toLocaleString()}원`, {
      fontSize: '14px',
      color: '#333333',
      fontFamily: 'Arial, sans-serif',
    }).setOrigin(1, 0);
    yPos += 30;

    // 누적 현황
    yPos += 20;
    this.add.text(width / 2, yPos, '── 누적 현황 ──', {
      fontSize: '16px',
      color: '#8B7355',
      fontFamily: 'Arial, sans-serif',
    }).setOrigin(0.5);
    yPos += 30;

    this.add.text(width / 2 - 140, yPos, '📈 총 매출', {
      fontSize: '14px',
      color: '#333333',
      fontFamily: 'Arial, sans-serif',
    });
    this.add.text(width / 2 + 100, yPos, `${state.totalRevenue.toLocaleString()}원`, {
      fontSize: '14px',
      color: '#27AE60',
      fontFamily: 'Arial, sans-serif',
    }).setOrigin(1, 0);
    yPos += 25;

    this.add.text(width / 2 - 140, yPos, '📉 총 비용', {
      fontSize: '14px',
      color: '#333333',
      fontFamily: 'Arial, sans-serif',
    });
    this.add.text(width / 2 + 100, yPos, `${state.totalExpenses.toLocaleString()}원`, {
      fontSize: '14px',
      color: '#E74C3C',
      fontFamily: 'Arial, sans-serif',
    }).setOrigin(1, 0);
    yPos += 30;

    // 총 순이익
    const totalProfit = gameState.getTotalProfit();
    const totalProfitColor = totalProfit >= 0 ? '#27AE60' : '#E74C3C';
    
    this.add.text(width / 2 - 140, yPos, '💎 총 순이익', {
      fontSize: '16px',
      color: '#333333',
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold',
    });
    this.add.text(width / 2 + 100, yPos, `${totalProfit >= 0 ? '+' : ''}${totalProfit.toLocaleString()}원`, {
      fontSize: '16px',
      color: totalProfitColor,
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold',
    }).setOrigin(1, 0);

    // 회계 팁
    const tips = [
      '💡 순이익 = 매출 - 비용',
      '💡 재고는 팔기 전까지 자산이에요',
      '💡 감모손실은 상한 사과로 인한 손해예요',
      '💡 마진 = 판매가 - 원가',
    ];
    const tip = tips[state.day % tips.length];
    
    this.add.text(width / 2, height / 2 + 250, tip, {
      fontSize: '12px',
      color: '#8B7355',
      fontFamily: 'Arial, sans-serif',
    }).setOrigin(0.5);
  }
}

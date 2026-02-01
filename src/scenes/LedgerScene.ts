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
    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.6)
      .setInteractive();

    // 장부 패널 (스크롤 가능한 영역)
    const panel = this.add.graphics();
    panel.fillStyle(0xFFFAF0, 1);
    panel.fillRoundedRect(20, 100, width - 40, height - 150, 20);
    panel.lineStyle(4, 0x8B7355);
    panel.strokeRoundedRect(20, 100, width - 40, height - 150, 20);

    // 제목 바
    const titleBar = this.add.graphics();
    titleBar.fillStyle(0x8B7355, 1);
    titleBar.fillRoundedRect(20, 100, width - 40, 60, { tl: 20, tr: 20, bl: 0, br: 0 });

    this.add.text(width / 2, 130, `📒 장부 - Day ${state.day}`, {
      fontSize: '24px',
      color: '#FFFFFF',
      fontFamily: 'Arial',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // 닫기 버튼
    const closeBtn = this.add.circle(width - 45, 130, 18, 0xE74C3C)
      .setInteractive({ useHandCursor: true });
    this.add.text(width - 45, 130, '✕', {
      fontSize: '20px',
      color: '#FFFFFF',
    }).setOrigin(0.5);
    closeBtn.on('pointerdown', () => this.scene.stop());

    // 현금 잔고 카드
    let yPos = 180;
    
    const cashCard = this.add.graphics();
    cashCard.fillStyle(0x27AE60, 1);
    cashCard.fillRoundedRect(40, yPos, width - 80, 70, 15);
    
    this.add.text(60, yPos + 15, '💰 현금 잔고', {
      fontSize: '16px',
      color: '#FFFFFF',
    });
    
    this.add.text(width - 60, yPos + 15, `₩${state.cash.toLocaleString()}`, {
      fontSize: '24px',
      color: '#FFFFFF',
      fontStyle: 'bold',
    }).setOrigin(1, 0);
    
    // 변동
    const totalProfit = gameState.getTotalProfit();
    const profitText = totalProfit >= 0 ? `▲ ₩${totalProfit.toLocaleString()}` : `▼ ₩${Math.abs(totalProfit).toLocaleString()}`;
    this.add.text(width - 60, yPos + 45, profitText, {
      fontSize: '14px',
      color: totalProfit >= 0 ? '#90EE90' : '#FFB6C1',
    }).setOrigin(1, 0);

    yPos += 90;

    // 자산 현황 섹션
    this.add.text(50, yPos, '📦 자산 현황', {
      fontSize: '18px',
      color: '#8B7355',
      fontStyle: 'bold',
    });
    yPos += 35;

    // 재고
    const inventoryValue = state.apples * state.appleCost;
    this.createInfoRow(50, yPos, '🍎 재고', `${state.apples}개`, `₩${inventoryValue.toLocaleString()}`);
    yPos += 35;

    // 가게 레벨
    this.createInfoRow(50, yPos, '🏪 가게 레벨', `Lv.${state.shopLevel}`, '');
    yPos += 45;

    // 오늘의 거래 섹션
    this.add.text(50, yPos, '📋 오늘의 거래', {
      fontSize: '18px',
      color: '#8B7355',
      fontStyle: 'bold',
    });
    yPos += 35;

    const todayTx = state.transactions.filter(t => t.day === state.day);
    
    if (todayTx.length === 0) {
      this.add.text(width / 2, yPos + 20, '아직 거래가 없습니다', {
        fontSize: '14px',
        color: '#999999',
      }).setOrigin(0.5, 0);
      yPos += 60;
    } else {
      // 거래 내역 카드
      const txCard = this.add.graphics();
      txCard.fillStyle(0xFFFFFF, 1);
      txCard.fillRoundedRect(40, yPos, width - 80, Math.min(todayTx.length * 35 + 20, 150), 10);
      txCard.lineStyle(1, 0xDDDDDD);
      txCard.strokeRoundedRect(40, yPos, width - 80, Math.min(todayTx.length * 35 + 20, 150), 10);

      todayTx.slice(-4).forEach((tx, i) => {
        const color = tx.type === 'income' ? '#27AE60' : '#E74C3C';
        const sign = tx.type === 'income' ? '+' : '-';
        
        this.add.text(55, yPos + 12 + i * 35, tx.description, {
          fontSize: '13px',
          color: '#333333',
        });
        
        this.add.text(width - 55, yPos + 12 + i * 35, `${sign}₩${tx.amount.toLocaleString()}`, {
          fontSize: '14px',
          color: color,
          fontStyle: 'bold',
        }).setOrigin(1, 0);
      });
      
      yPos += Math.min(todayTx.length * 35 + 30, 160);
    }

    yPos += 20;

    // 누적 통계 섹션
    this.add.text(50, yPos, '📊 누적 통계', {
      fontSize: '18px',
      color: '#8B7355',
      fontStyle: 'bold',
    });
    yPos += 35;

    this.createStatRow(50, yPos, '총 매출', `₩${state.totalRevenue.toLocaleString()}`, '#27AE60');
    yPos += 30;
    this.createStatRow(50, yPos, '총 비용', `₩${state.totalExpenses.toLocaleString()}`, '#E74C3C');
    yPos += 30;

    const netProfit = state.totalRevenue - state.totalExpenses;
    const netColor = netProfit >= 0 ? '#27AE60' : '#E74C3C';
    this.createStatRow(50, yPos, '순이익', `${netProfit >= 0 ? '+' : ''}₩${netProfit.toLocaleString()}`, netColor, true);
    yPos += 40;

    // 회계 팁
    const tips = [
      '💡 순이익 = 매출 - 비용',
      '💡 마진 = 판매가 - 원가',
      '💡 재고는 팔기 전까지 자산이에요',
      '💡 감모손실은 상한 재고로 인한 손해',
      '💡 평판이 높으면 손님이 더 많이 와요',
    ];
    const tip = tips[state.day % tips.length];

    const tipBox = this.add.graphics();
    tipBox.fillStyle(0xFFF8DC, 1);
    tipBox.fillRoundedRect(40, height - 110, width - 80, 45, 10);
    tipBox.lineStyle(2, 0xDAA520);
    tipBox.strokeRoundedRect(40, height - 110, width - 80, 45, 10);

    this.add.text(width / 2, height - 88, tip, {
      fontSize: '14px',
      color: '#8B7355',
    }).setOrigin(0.5);
  }

  private createInfoRow(x: number, y: number, label: string, value1: string, value2: string) {
    const { width } = this.scale;
    
    this.add.text(x, y, label, {
      fontSize: '15px',
      color: '#666666',
    });
    
    this.add.text(width / 2, y, value1, {
      fontSize: '15px',
      color: '#333333',
      fontStyle: 'bold',
    }).setOrigin(0.5, 0);
    
    if (value2) {
      this.add.text(width - 50, y, value2, {
        fontSize: '15px',
        color: '#8B7355',
      }).setOrigin(1, 0);
    }
  }

  private createStatRow(x: number, y: number, label: string, value: string, color: string, bold: boolean = false) {
    const { width } = this.scale;
    
    this.add.text(x, y, label, {
      fontSize: bold ? '16px' : '14px',
      color: '#666666',
      fontStyle: bold ? 'bold' : 'normal',
    });
    
    this.add.text(width - 50, y, value, {
      fontSize: bold ? '18px' : '15px',
      color: color,
      fontStyle: 'bold',
    }).setOrigin(1, 0);
  }
}

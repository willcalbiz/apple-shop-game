import './styles/game.css';
import { gameState } from './game/GameState';
import type { Customer, DaySummary } from './game/GameState';

class AppleShopGame {
  private container: HTMLElement;
  private isPlaying = false;

  constructor() {
    this.container = document.getElementById('app')!;
    this.showTitleScreen();
  }

  private showTitleScreen() {
    this.container.innerHTML = `
      <div class="title-screen">
        <div class="title-logo"></div>
        <div class="title-text">사과 가게</div>
        <div class="title-subtitle">💰 회계 시뮬레이션 💰</div>
        <button class="start-btn">🎮 시작하기</button>
        <div class="title-hint">
          <div class="title-hint-text">
            🍎 사과를 매입하고 판매하며<br>
            📊 회계의 기초를 배워보세요!
          </div>
        </div>
      </div>
    `;

    const startBtn = this.container.querySelector('.start-btn')!;
    startBtn.addEventListener('click', () => this.startGame());
  }

  private startGame() {
    this.isPlaying = true;
    this.renderGameScreen();
    this.setupEventListeners();
    this.startGameLoop();
  }

  private renderGameScreen() {
    const state = gameState.getState();
    const queue = gameState.getCustomerQueue();

    this.container.innerHTML = `
      <div class="game-container">
        <!-- 상단 바 -->
        <div class="top-bar">
          <div class="day-info">
            <div class="day-text">Day ${state.day}</div>
            <div class="time-badge">
              ${this.getTimeIcon(state.timeOfDay)} ${this.getTimeName(state.timeOfDay)}
            </div>
          </div>
          <div class="currency-display">
            <div class="currency-item">
              <span class="currency-icon">💰</span>
              <span class="currency-value ${this.getCashClass(state.cash)}" id="cash-display">
                ${this.formatNumber(state.cash)}원
              </span>
            </div>
            <div class="currency-item">
              <span class="currency-icon">🍎</span>
              <span class="currency-value ${this.getAppleClass(state.apples)}" id="apple-display">
                ${state.apples}개
              </span>
            </div>
          </div>
        </div>

        <!-- 게임 영역 -->
        <div class="game-area">
          <!-- 가게 -->
          <div class="shop-area">
            <div class="shop-building">
              <div class="shop-roof"></div>
              <div class="shop-body">
                <div class="shop-sign">
                  <span class="shop-sign-text">🍎 사과 가게</span>
                </div>
                <div class="display-stand" id="apple-display-stand">
                  ${this.renderApples(state.apples)}
                </div>
              </div>
              <div class="price-tag">
                <span class="price-tag-value" id="price-tag">₩${state.applePrice}</span>
              </div>
            </div>
          </div>

          <!-- 손님 대기열 -->
          <div class="customer-area">
            <div class="customer-area-label">손님 대기열</div>
            <div class="customer-queue" id="customer-queue">
              ${this.renderCustomers(queue)}
            </div>
          </div>
        </div>

        <!-- 하단 액션 바 -->
        <div class="action-bar">
          <!-- 가격 조절 -->
          <div class="price-control">
            <span class="price-control-label">판매가</span>
            <button class="price-btn price-btn-minus" id="price-minus">−</button>
            <span class="price-control-value" id="price-value">₩${state.applePrice}</span>
            <button class="price-btn price-btn-plus" id="price-plus">+</button>
            <span class="price-control-label" style="color:#999;font-size:11px;">원가₩200</span>
          </div>

          <!-- 액션 버튼 -->
          <div class="action-buttons">
            <button class="action-btn action-btn-buy" id="btn-buy">
              <span class="action-btn-icon">🛒</span>
              <span class="action-btn-label">매입</span>
            </button>
            <button class="action-btn action-btn-ledger" id="btn-ledger">
              <span class="action-btn-icon">📒</span>
              <span class="action-btn-label">장부</span>
            </button>
            <button class="action-btn action-btn-upgrade" id="btn-upgrade">
              <span class="action-btn-icon">⬆️</span>
              <span class="action-btn-label">업그레이드</span>
            </button>
            <button class="action-btn action-btn-next" id="btn-next">
              <span class="action-btn-icon">⏭️</span>
              <span class="action-btn-label">다음</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  private setupEventListeners() {
    // 가격 조절
    document.getElementById('price-minus')?.addEventListener('click', () => {
      const state = gameState.getState();
      const newPrice = Math.max(200, state.applePrice - 50);
      gameState.setPrice(newPrice);
      this.updatePriceDisplay();
    });

    document.getElementById('price-plus')?.addEventListener('click', () => {
      const state = gameState.getState();
      const newPrice = Math.min(1000, state.applePrice + 50);
      gameState.setPrice(newPrice);
      this.updatePriceDisplay();
    });

    // 매입 버튼
    document.getElementById('btn-buy')?.addEventListener('click', () => this.showBuyModal());

    // 장부 버튼
    document.getElementById('btn-ledger')?.addEventListener('click', () => this.showLedgerModal());

    // 업그레이드 버튼
    document.getElementById('btn-upgrade')?.addEventListener('click', () => this.showUpgradeModal());

    // 다음 버튼
    document.getElementById('btn-next')?.addEventListener('click', () => this.handleNext());

    // 게임 상태 구독
    gameState.subscribe(() => this.updateUI());
  }

  private startGameLoop() {
    // 손님 생성
    setInterval(() => {
      if (!this.isPlaying) return;
      const state = gameState.getState();
      if (state.timeOfDay === 'noon' && Math.random() < 0.3) {
        gameState.generateCustomer();
      }
    }, 2500);

    // 인내심 감소
    setInterval(() => {
      if (!this.isPlaying) return;
      gameState.decreasePatience();
    }, 1500);
  }

  private updateUI() {
    const state = gameState.getState();
    const queue = gameState.getCustomerQueue();

    // 현금
    const cashEl = document.getElementById('cash-display');
    if (cashEl) {
      cashEl.textContent = `${this.formatNumber(state.cash)}원`;
      cashEl.className = `currency-value ${this.getCashClass(state.cash)}`;
    }

    // 사과
    const appleEl = document.getElementById('apple-display');
    if (appleEl) {
      appleEl.textContent = `${state.apples}개`;
      appleEl.className = `currency-value ${this.getAppleClass(state.apples)}`;
    }

    // 사과 진열
    const standEl = document.getElementById('apple-display-stand');
    if (standEl) {
      standEl.innerHTML = this.renderApples(state.apples);
    }

    // 손님 대기열
    const queueEl = document.getElementById('customer-queue');
    if (queueEl) {
      queueEl.innerHTML = this.renderCustomers(queue);
      this.attachCustomerListeners();
    }

    // 날짜/시간
    const dayText = this.container.querySelector('.day-text');
    if (dayText) dayText.textContent = `Day ${state.day}`;

    const timeBadge = this.container.querySelector('.time-badge');
    if (timeBadge) {
      timeBadge.innerHTML = `${this.getTimeIcon(state.timeOfDay)} ${this.getTimeName(state.timeOfDay)}`;
    }
  }

  private updatePriceDisplay() {
    const state = gameState.getState();
    
    const priceValue = document.getElementById('price-value');
    if (priceValue) priceValue.textContent = `₩${state.applePrice}`;

    const priceTag = document.getElementById('price-tag');
    if (priceTag) priceTag.textContent = `₩${state.applePrice}`;
  }

  private attachCustomerListeners() {
    const customerCards = document.querySelectorAll('.customer-card');
    customerCards.forEach(card => {
      card.addEventListener('click', () => {
        const customerId = parseInt(card.getAttribute('data-id') || '0');
        this.handleCustomerSale(customerId);
      });
    });
  }

  private handleCustomerSale(customerId: number) {
    const result = gameState.sellToCustomer(customerId);
    
    if (result.success) {
      this.showFloatingText(`+₩${this.formatNumber(result.revenue)}`, true);
      this.showCoinEffect();
    } else {
      this.showFloatingText(result.message, false);
    }
  }

  private showFloatingText(text: string, positive: boolean) {
    const gameArea = this.container.querySelector('.game-area');
    if (!gameArea) return;

    const floater = document.createElement('div');
    floater.className = `floating-text ${positive ? 'positive' : 'negative'}`;
    floater.textContent = text;
    floater.style.left = '50%';
    floater.style.top = '40%';
    floater.style.transform = 'translateX(-50%)';
    gameArea.appendChild(floater);

    setTimeout(() => floater.remove(), 1200);
  }

  private showCoinEffect() {
    const gameArea = this.container.querySelector('.game-area');
    if (!gameArea) return;

    const emojis = ['💰', '💵', '✨'];
    for (let i = 0; i < 5; i++) {
      const coin = document.createElement('div');
      coin.className = 'coin-particle';
      coin.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      coin.style.left = `${40 + Math.random() * 20}%`;
      coin.style.top = '50%';
      coin.style.animation = `float-up 1s ease-out ${i * 0.1}s forwards`;
      gameArea.appendChild(coin);
      setTimeout(() => coin.remove(), 1200);
    }
  }

  private handleNext() {
    const result = gameState.advanceTime();
    
    if (result.newDay && result.summary) {
      this.showSummaryModal(result.summary);
    } else {
      this.updateUI();
    }
  }

  private showBuyModal() {
    const state = gameState.getState();
    let quantity = 20;
    const maxQty = Math.floor(state.cash / state.appleCost);

    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-panel">
        <button class="modal-close">✕</button>
        <div class="modal-title">🛒 도매상 매입</div>
        
        <div style="text-align:center;margin-bottom:20px;">
          <div style="font-size:60px;margin-bottom:8px;">🍎</div>
          <div style="color:#666;">개당 ₩${state.appleCost}</div>
        </div>

        <div style="display:flex;align-items:center;justify-content:center;gap:16px;margin-bottom:20px;">
          <button class="price-btn price-btn-minus" id="modal-qty-minus">−</button>
          <span id="modal-qty" style="font-family:var(--font-numbers);font-size:32px;font-weight:800;color:#E74C3C;min-width:80px;text-align:center;">${quantity}개</span>
          <button class="price-btn price-btn-plus" id="modal-qty-plus">+</button>
        </div>

        <div style="text-align:center;margin-bottom:20px;">
          <div style="font-size:14px;color:#666;margin-bottom:4px;">합계</div>
          <div id="modal-total" style="font-family:var(--font-numbers);font-size:24px;font-weight:700;color:#333;">₩${this.formatNumber(quantity * state.appleCost)}</div>
        </div>

        <button id="modal-buy-btn" style="width:100%;background:linear-gradient(180deg,#22C55E 0%,#16A34A 100%);border:none;border-bottom:4px solid #15803D;border-radius:16px;padding:16px;font-family:var(--font-primary);font-size:18px;font-weight:800;color:white;cursor:pointer;">🛒 구매하기</button>
      </div>
    `;

    this.container.appendChild(modal);

    const qtyEl = document.getElementById('modal-qty')!;
    const totalEl = document.getElementById('modal-total')!;

    const updateModal = () => {
      qtyEl.textContent = `${quantity}개`;
      totalEl.textContent = `₩${this.formatNumber(quantity * state.appleCost)}`;
    };

    document.getElementById('modal-qty-minus')?.addEventListener('click', () => {
      quantity = Math.max(5, quantity - 5);
      updateModal();
    });

    document.getElementById('modal-qty-plus')?.addEventListener('click', () => {
      quantity = Math.min(maxQty, quantity + 5);
      updateModal();
    });

    document.getElementById('modal-buy-btn')?.addEventListener('click', () => {
      gameState.buyApples(quantity);
      modal.remove();
    });

    modal.querySelector('.modal-close')?.addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });
  }

  private showLedgerModal() {
    const state = gameState.getState();
    const todayTx = state.transactions.filter(t => t.day === state.day);
    const todayIncome = todayTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const todayExpense = todayTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const todayProfit = todayIncome - todayExpense;

    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-panel" style="max-height:80vh;overflow-y:auto;">
        <button class="modal-close">✕</button>
        <div class="modal-title">📒 장부</div>
        
        <div style="background:linear-gradient(180deg,#22C55E 0%,#16A34A 100%);border-radius:16px;padding:16px;margin-bottom:16px;text-align:center;">
          <div style="color:rgba(255,255,255,0.8);font-size:14px;margin-bottom:4px;">현금 잔고</div>
          <div style="font-family:var(--font-numbers);font-size:28px;font-weight:800;color:white;">₩${this.formatNumber(state.cash)}</div>
        </div>

        <div style="margin-bottom:16px;">
          <div style="font-weight:700;color:#8B7355;margin-bottom:8px;">📋 오늘의 거래</div>
          <div style="background:#F8F8F8;border-radius:12px;padding:12px;">
            ${todayTx.length === 0 ? '<div style="color:#999;text-align:center;">아직 거래가 없습니다</div>' :
              todayTx.slice(-5).map(t => `
                <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #EEE;">
                  <span style="font-size:14px;color:#666;">${t.description}</span>
                  <span style="font-family:var(--font-numbers);font-weight:700;color:${t.type === 'income' ? '#22C55E' : '#EF4444'};">
                    ${t.type === 'income' ? '+' : '-'}₩${this.formatNumber(t.amount)}
                  </span>
                </div>
              `).join('')
            }
          </div>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
          <div style="background:#F0FFF4;border-radius:12px;padding:12px;text-align:center;">
            <div style="font-size:12px;color:#666;">오늘 매출</div>
            <div style="font-family:var(--font-numbers);font-size:18px;font-weight:700;color:#22C55E;">+₩${this.formatNumber(todayIncome)}</div>
          </div>
          <div style="background:#FEF2F2;border-radius:12px;padding:12px;text-align:center;">
            <div style="font-size:12px;color:#666;">오늘 비용</div>
            <div style="font-family:var(--font-numbers);font-size:18px;font-weight:700;color:#EF4444;">-₩${this.formatNumber(todayExpense)}</div>
          </div>
        </div>

        <div style="margin-top:16px;background:${todayProfit >= 0 ? '#F0FFF4' : '#FEF2F2'};border-radius:12px;padding:16px;text-align:center;">
          <div style="font-size:14px;color:#666;">오늘 순이익</div>
          <div style="font-family:var(--font-numbers);font-size:24px;font-weight:800;color:${todayProfit >= 0 ? '#22C55E' : '#EF4444'};">
            ${todayProfit >= 0 ? '+' : ''}₩${this.formatNumber(todayProfit)}
          </div>
        </div>

        <div style="margin-top:16px;background:#FFF8DC;border:2px solid #DAA520;border-radius:12px;padding:12px;text-align:center;">
          <div style="font-size:13px;color:#8B7355;">💡 순이익 = 매출 - 비용</div>
        </div>
      </div>
    `;

    this.container.appendChild(modal);
    modal.querySelector('.modal-close')?.addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });
  }

  private showUpgradeModal() {
    const state = gameState.getState();
    const cost = state.shopLevel * 5000;
    const canAfford = state.cash >= cost;

    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-panel">
        <button class="modal-close">✕</button>
        <div class="modal-title">⬆️ 가게 업그레이드</div>
        
        <div style="text-align:center;margin-bottom:20px;">
          <div style="font-size:60px;margin-bottom:8px;">🏪</div>
          <div style="font-size:18px;font-weight:700;">현재 레벨: ${state.shopLevel}</div>
        </div>

        <div style="text-align:center;margin-bottom:20px;color:#666;">
          업그레이드 비용: ₩${this.formatNumber(cost)}
        </div>

        <button id="modal-upgrade-btn" style="width:100%;background:linear-gradient(180deg,${canAfford ? '#A855F7' : '#CCC'} 0%,${canAfford ? '#9333EA' : '#AAA'} 100%);border:none;border-bottom:4px solid ${canAfford ? '#7C3AED' : '#999'};border-radius:16px;padding:16px;font-family:var(--font-primary);font-size:18px;font-weight:800;color:white;cursor:${canAfford ? 'pointer' : 'not-allowed'};">
          ${canAfford ? '⬆️ 업그레이드!' : '💸 자금 부족'}
        </button>
      </div>
    `;

    this.container.appendChild(modal);

    if (canAfford) {
      document.getElementById('modal-upgrade-btn')?.addEventListener('click', () => {
        gameState.upgradeShop();
        modal.remove();
      });
    }

    modal.querySelector('.modal-close')?.addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });
  }

  private showSummaryModal(summary: DaySummary) {
    const isProfit = summary.profit >= 0;

    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-panel summary-modal">
        <div class="summary-header">
          <div class="summary-day">Day ${summary.day} 결산</div>
          <div class="summary-title">${isProfit ? '🎉 수고했어요!' : '😢 힘내세요!'}</div>
        </div>

        <div class="summary-card">
          <div class="summary-row">
            <span class="summary-label">🍎 판매량</span>
            <span class="summary-value">${summary.sales}개</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">💵 매출</span>
            <span class="summary-value positive">+₩${this.formatNumber(summary.revenue)}</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">📦 비용</span>
            <span class="summary-value negative">-₩${this.formatNumber(summary.expenses)}</span>
          </div>
          ${summary.spoiledApples > 0 ? `
          <div class="summary-row">
            <span class="summary-label">🗑️ 감모손실</span>
            <span class="summary-value negative">${summary.spoiledApples}개</span>
          </div>
          ` : ''}
          <div class="summary-row">
            <span class="summary-label">👥 손님</span>
            <span class="summary-value">${summary.customersServed}명 응대 / ${summary.customersLost}명 이탈</span>
          </div>
        </div>

        <div class="summary-profit ${isProfit ? '' : 'loss'}">
          <div class="summary-profit-label">순이익</div>
          <div class="summary-profit-value">${isProfit ? '+' : ''}₩${this.formatNumber(summary.profit)}</div>
        </div>

        <button class="summary-next-btn" id="summary-next">▶️ 다음 날로</button>
      </div>
    `;

    this.container.appendChild(modal);

    if (isProfit) {
      this.showConfetti();
    }

    document.getElementById('summary-next')?.addEventListener('click', () => {
      modal.remove();
      this.updateUI();
    });
  }

  private showConfetti() {
    const emojis = ['🎉', '✨', '💰', '⭐', '🍎', '🎊'];
    for (let i = 0; i < 20; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      confetti.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      confetti.style.left = `${Math.random() * 100}%`;
      confetti.style.animationDelay = `${Math.random() * 2}s`;
      document.body.appendChild(confetti);
      setTimeout(() => confetti.remove(), 5000);
    }
  }

  // === 헬퍼 함수들 ===

  private renderApples(count: number): string {
    if (count === 0) {
      return '<div style="color:#999;font-size:14px;">재고 없음</div>';
    }
    
    const displayCount = Math.min(count, 12);
    let html = '';
    
    for (let i = 0; i < displayCount; i++) {
      html += '<div class="apple-item"></div>';
    }
    
    if (count > 12) {
      html += `<span class="apple-count-badge">+${count - 12}</span>`;
    }
    
    return html;
  }

  private renderCustomers(customers: Customer[]): string {
    if (customers.length === 0) {
      return '<div style="color:#999;font-size:14px;">손님을 기다리는 중...</div>';
    }

    return customers.map(c => `
      <div class="customer-card ${c.mood}" data-id="${c.id}">
        <div class="customer-avatar">${c.emoji}</div>
        <div class="customer-mood">${this.getMoodEmoji(c.mood)}</div>
        <div class="customer-order">🍎×${c.quantity}</div>
        <div class="customer-patience">
          <div class="customer-patience-bar ${this.getPatienceClass(c.patience)}" style="width:${c.patience}%"></div>
        </div>
      </div>
    `).join('');
  }

  private getMoodEmoji(mood: string): string {
    switch (mood) {
      case 'happy': return '😊';
      case 'neutral': return '😐';
      case 'angry': return '😠';
      default: return '😊';
    }
  }

  private getPatienceClass(patience: number): string {
    if (patience > 60) return '';
    if (patience > 30) return 'warning';
    return 'danger';
  }

  private getTimeIcon(time: string): string {
    switch (time) {
      case 'morning': return '🌅';
      case 'noon': return '☀️';
      case 'evening': return '🌆';
      default: return '☀️';
    }
  }

  private getTimeName(time: string): string {
    switch (time) {
      case 'morning': return '아침 (매입)';
      case 'noon': return '낮 (영업)';
      case 'evening': return '저녁 (마감)';
      default: return '';
    }
  }

  private getCashClass(cash: number): string {
    if (cash >= 10000) return 'positive';
    if (cash >= 3000) return 'warning';
    return 'danger';
  }

  private getAppleClass(apples: number): string {
    if (apples > 10) return '';
    if (apples > 0) return 'warning';
    return 'danger';
  }

  private formatNumber(num: number): string {
    return num.toLocaleString();
  }
}

// 게임 시작
new AppleShopGame();

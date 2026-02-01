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
            📊 회계의 기초를 배워보세요!<br>
            <small style="color:#999;">v4.0 - 튜토리얼 & 목표 시스템</small>
          </div>
        </div>
      </div>
    `;

    const startBtn = this.container.querySelector('.start-btn')!;
    startBtn.addEventListener('click', () => this.startGame());
  }

  private startGame() {
    this.isPlaying = true;
    gameState.reset();
    this.renderGameScreen();
    this.setupEventListeners();
    this.startGameLoop();
    
    // 튜토리얼 시작
    setTimeout(() => this.showTutorialStep(), 500);
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
                ${this.formatNumber(state.cash)}
              </span>
            </div>
            <div class="currency-item">
              <span class="currency-icon">🍎</span>
              <span class="currency-value ${this.getAppleClass(state.apples)}" id="apple-display">
                ${state.apples}
              </span>
            </div>
          </div>
        </div>

        <!-- 날씨 & 목표 바 -->
        <div class="info-bar">
          <div class="weather-badge" id="weather-badge">
            ${state.weather.description}
          </div>
          <div class="goal-badge ${state.dailyGoal?.completed ? 'completed' : ''}" id="goal-badge">
            🎯 목표: ${this.formatNumber(state.dailyGoal?.current || 0)} / ${this.formatNumber(state.dailyGoal?.target || 0)}원
            ${state.dailyGoal?.completed ? '✅' : ''}
          </div>
        </div>

        <!-- 콤보 표시 -->
        <div class="combo-display ${state.combo >= 2 ? 'active' : ''}" id="combo-display">
          ${state.combo >= 2 ? `🔥 ${state.combo} COMBO!` : ''}
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
                  ${state.shopLevel > 1 ? `<span class="shop-level">Lv.${state.shopLevel}</span>` : ''}
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
          <div class="price-control" id="price-control">
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

        <!-- 튜토리얼 오버레이 -->
        <div class="tutorial-overlay" id="tutorial-overlay" style="display:none;"></div>
      </div>
    `;
  }

  private setupEventListeners() {
    // 가격 조절
    document.getElementById('price-minus')?.addEventListener('click', () => {
      const state = gameState.getState();
      gameState.setPrice(state.applePrice - 50);
      this.updatePriceDisplay();
    });

    document.getElementById('price-plus')?.addEventListener('click', () => {
      const state = gameState.getState();
      gameState.setPrice(state.applePrice + 50);
      this.updatePriceDisplay();
    });

    // 버튼들
    document.getElementById('btn-buy')?.addEventListener('click', () => this.showBuyModal());
    document.getElementById('btn-ledger')?.addEventListener('click', () => this.showLedgerModal());
    document.getElementById('btn-upgrade')?.addEventListener('click', () => this.showUpgradeModal());
    document.getElementById('btn-next')?.addEventListener('click', () => this.handleNext());

    // 상태 구독
    gameState.subscribe(() => this.updateUI());
  }

  private startGameLoop() {
    // 손님 생성 (2.5초마다)
    window.setInterval(() => {
      if (!this.isPlaying) return;
      const state = gameState.getState();
      if (state.timeOfDay === 'noon') {
        gameState.generateCustomer();
      }
    }, 2500);

    // 인내심 감소 (1.5초마다)
    window.setInterval(() => {
      if (!this.isPlaying) return;
      const state = gameState.getState();
      if (state.timeOfDay === 'noon') {
        const lostAny = gameState.decreasePatience();
        if (lostAny) {
          this.showFloatingText('손님이 떠났어요 😢', false, 'center');
        }
      }
    }, 1500);
  }

  private showTutorialStep() {
    const state = gameState.getState();
    if (state.tutorialCompleted) return;

    const overlay = document.getElementById('tutorial-overlay');
    if (!overlay) return;

    const tutorials = [
      {
        message: '🍎 사과 가게에 오신 걸 환영해요!<br><br>사과를 사서 팔아 돈을 벌어보세요.<br>회계의 기초를 배울 수 있어요!',
        highlight: null,
        buttonText: '시작하기',
      },
      {
        message: '🛒 먼저 <b>매입</b> 버튼을 눌러<br>사과를 구매하세요!<br><br>원가 200원에 사서<br>비싸게 팔면 이익이에요.',
        highlight: 'btn-buy',
        buttonText: '알겠어요',
      },
      {
        message: '⏭️ <b>다음</b> 버튼을 눌러<br>낮(영업시간)으로 넘어가세요!<br><br>손님이 찾아올 거예요.',
        highlight: 'btn-next',
        buttonText: '알겠어요',
      },
      {
        message: '👆 손님 카드를 <b>터치</b>하면<br>사과를 판매할 수 있어요!<br><br>손님이 떠나기 전에 빨리!',
        highlight: 'customer-queue',
        buttonText: '알겠어요',
      },
      {
        message: '🎯 매일 <b>목표 매출</b>을 달성하면<br>보너스를 받아요!<br><br>🔥 연속 판매하면 <b>콤보 보너스</b>도!',
        highlight: 'goal-badge',
        buttonText: '시작!',
      },
    ];

    const step = state.tutorialStep;
    if (step >= tutorials.length) {
      overlay.style.display = 'none';
      gameState.advanceTutorial();
      return;
    }

    const tutorial = tutorials[step];

    // 하이라이트
    if (tutorial.highlight) {
      const target = document.getElementById(tutorial.highlight);
      if (target) {
        target.classList.add('tutorial-highlight');
      }
    }

    overlay.style.display = 'flex';
    overlay.innerHTML = `
      <div class="tutorial-bubble">
        <div class="tutorial-message">${tutorial.message}</div>
        <button class="tutorial-btn" id="tutorial-next">${tutorial.buttonText}</button>
        <button class="tutorial-skip" id="tutorial-skip">튜토리얼 건너뛰기</button>
      </div>
    `;

    document.getElementById('tutorial-next')?.addEventListener('click', () => {
      // 하이라이트 제거
      document.querySelectorAll('.tutorial-highlight').forEach(el => {
        el.classList.remove('tutorial-highlight');
      });
      
      gameState.advanceTutorial();
      
      const newState = gameState.getState();
      if (newState.tutorialStep < tutorials.length) {
        this.showTutorialStep();
      } else {
        overlay.style.display = 'none';
      }
    });

    document.getElementById('tutorial-skip')?.addEventListener('click', () => {
      document.querySelectorAll('.tutorial-highlight').forEach(el => {
        el.classList.remove('tutorial-highlight');
      });
      overlay.style.display = 'none';
      gameState.skipTutorial();
    });
  }

  private updateUI() {
    const state = gameState.getState();
    const queue = gameState.getCustomerQueue();

    // 현금
    const cashEl = document.getElementById('cash-display');
    if (cashEl) {
      const oldValue = parseInt(cashEl.textContent?.replace(/[^0-9]/g, '') || '0');
      const newValue = state.cash;
      cashEl.textContent = this.formatNumber(newValue);
      cashEl.className = `currency-value ${this.getCashClass(newValue)}`;
      
      if (newValue > oldValue) {
        cashEl.classList.add('bump');
        setTimeout(() => cashEl.classList.remove('bump'), 300);
      }
    }

    // 사과
    const appleEl = document.getElementById('apple-display');
    if (appleEl) {
      appleEl.textContent = String(state.apples);
      appleEl.className = `currency-value ${this.getAppleClass(state.apples)}`;
    }

    // 사과 진열
    const standEl = document.getElementById('apple-display-stand');
    if (standEl) {
      standEl.innerHTML = this.renderApples(state.apples);
    }

    // 손님
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

    // 날씨
    const weatherBadge = document.getElementById('weather-badge');
    if (weatherBadge) {
      weatherBadge.textContent = state.weather.description;
    }

    // 목표
    const goalBadge = document.getElementById('goal-badge');
    if (goalBadge && state.dailyGoal) {
      goalBadge.innerHTML = `🎯 목표: ${this.formatNumber(state.dailyGoal.current)} / ${this.formatNumber(state.dailyGoal.target)}원 ${state.dailyGoal.completed ? '✅' : ''}`;
      goalBadge.className = `goal-badge ${state.dailyGoal.completed ? 'completed' : ''}`;
    }

    // 콤보
    const comboDisplay = document.getElementById('combo-display');
    if (comboDisplay) {
      if (state.combo >= 2) {
        comboDisplay.innerHTML = `🔥 ${state.combo} COMBO!`;
        comboDisplay.className = 'combo-display active';
      } else {
        comboDisplay.innerHTML = '';
        comboDisplay.className = 'combo-display';
      }
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
      // 판매 성공
      let text = `+₩${this.formatNumber(result.revenue)}`;
      if (result.tip > 0) {
        text += ` (+팁!)`;
      }
      this.showFloatingText(text, true);
      this.showCoinEffect();
      
      // 콤보 효과
      if (result.isCombo) {
        this.showComboEffect(result.combo);
      }
      
      // 메시지
      this.showCustomerMessage(result.message, true);
    } else {
      // 실패
      this.showFloatingText(result.message, false);
      this.showCustomerMessage(result.message, false);
    }
  }

  private showFloatingText(text: string, positive: boolean, position: string = 'center') {
    const gameArea = this.container.querySelector('.game-area');
    if (!gameArea) return;

    const floater = document.createElement('div');
    floater.className = `floating-text ${positive ? 'positive' : 'negative'}`;
    floater.textContent = text;
    floater.style.left = '50%';
    floater.style.top = position === 'center' ? '30%' : '50%';
    floater.style.transform = 'translateX(-50%)';
    gameArea.appendChild(floater);

    setTimeout(() => floater.remove(), 1200);
  }

  private showCoinEffect() {
    const gameArea = this.container.querySelector('.game-area');
    if (!gameArea) return;

    const emojis = ['💰', '💵', '✨', '🪙'];
    for (let i = 0; i < 6; i++) {
      const coin = document.createElement('div');
      coin.className = 'coin-particle';
      coin.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      coin.style.left = `${40 + Math.random() * 20}%`;
      coin.style.top = '50%';
      coin.style.animation = `float-up 1s ease-out ${i * 0.08}s forwards`;
      gameArea.appendChild(coin);
      setTimeout(() => coin.remove(), 1200);
    }
  }

  private showComboEffect(_combo: number) {
    const comboDisplay = document.getElementById('combo-display');
    if (comboDisplay) {
      comboDisplay.classList.add('pulse');
      setTimeout(() => comboDisplay.classList.remove('pulse'), 500);
    }
  }

  private showCustomerMessage(message: string, positive: boolean) {
    const queueArea = this.container.querySelector('.customer-area');
    if (!queueArea) return;

    const bubble = document.createElement('div');
    bubble.className = `customer-message ${positive ? 'positive' : 'negative'}`;
    bubble.textContent = message;
    queueArea.appendChild(bubble);
    setTimeout(() => bubble.remove(), 2000);
  }

  private handleNext() {
    const result = gameState.advanceTime();
    
    if (result.newDay && result.summary) {
      this.showSummaryModal(result.summary);
    } else {
      this.updateUI();
      
      // 튜토리얼 체크
      const state = gameState.getState();
      if (!state.tutorialCompleted && state.tutorialStep === 2 && state.timeOfDay === 'noon') {
        setTimeout(() => this.showTutorialStep(), 500);
      }
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
          <div class="modal-apple-icon"></div>
          <div style="color:#666;margin-top:8px;">개당 <b>₩${state.appleCost}</b></div>
        </div>

        <div style="display:flex;align-items:center;justify-content:center;gap:16px;margin-bottom:20px;">
          <button class="price-btn price-btn-minus" id="modal-qty-minus">−</button>
          <span id="modal-qty" style="font-family:var(--font-numbers);font-size:36px;font-weight:800;color:#E74C3C;min-width:100px;text-align:center;">${quantity}개</span>
          <button class="price-btn price-btn-plus" id="modal-qty-plus">+</button>
        </div>

        <div style="text-align:center;margin-bottom:20px;">
          <div style="font-size:14px;color:#666;margin-bottom:4px;">합계</div>
          <div id="modal-total" style="font-family:var(--font-numbers);font-size:28px;font-weight:700;color:#333;">₩${this.formatNumber(quantity * state.appleCost)}</div>
          <div style="font-size:12px;color:#999;margin-top:4px;">보유: ₩${this.formatNumber(state.cash)}</div>
        </div>

        <button id="modal-buy-btn" class="modal-primary-btn">🛒 구매하기</button>
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
      this.showFloatingText(`🍎 ${quantity}개 구매!`, true);
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
      <div class="modal-panel" style="max-height:85vh;overflow-y:auto;">
        <button class="modal-close">✕</button>
        <div class="modal-title">📒 장부</div>
        
        <div class="ledger-cash-card">
          <div class="ledger-cash-label">현금 잔고</div>
          <div class="ledger-cash-value">₩${this.formatNumber(state.cash)}</div>
        </div>

        <div class="ledger-section">
          <div class="ledger-section-title">📋 오늘의 거래</div>
          <div class="ledger-transactions">
            ${todayTx.length === 0 ? '<div class="ledger-empty">아직 거래가 없습니다</div>' :
              todayTx.slice(-6).map(t => `
                <div class="ledger-tx-row">
                  <span class="ledger-tx-desc">${t.description}</span>
                  <span class="ledger-tx-amount ${t.type}">${t.type === 'income' ? '+' : '-'}₩${this.formatNumber(t.amount)}</span>
                </div>
              `).join('')
            }
          </div>
        </div>

        <div class="ledger-summary">
          <div class="ledger-summary-item income">
            <div class="ledger-summary-label">오늘 매출</div>
            <div class="ledger-summary-value">+₩${this.formatNumber(todayIncome)}</div>
          </div>
          <div class="ledger-summary-item expense">
            <div class="ledger-summary-label">오늘 비용</div>
            <div class="ledger-summary-value">-₩${this.formatNumber(todayExpense)}</div>
          </div>
        </div>

        <div class="ledger-profit ${todayProfit >= 0 ? 'positive' : 'negative'}">
          <div class="ledger-profit-label">오늘 순이익</div>
          <div class="ledger-profit-value">${todayProfit >= 0 ? '+' : ''}₩${this.formatNumber(todayProfit)}</div>
        </div>

        <div class="ledger-tip">
          💡 순이익 = 매출 - 비용
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
        
        <div style="text-align:center;margin:20px 0;">
          <div style="font-size:64px;">🏪</div>
          <div style="font-size:20px;font-weight:700;margin-top:8px;">현재 레벨: ${state.shopLevel}</div>
          <div style="color:#666;margin-top:4px;">업그레이드하면 평판이 더 빨리 올라요!</div>
        </div>

        <div style="text-align:center;margin-bottom:20px;color:#666;">
          업그레이드 비용: <b>₩${this.formatNumber(cost)}</b>
        </div>

        <button class="modal-primary-btn ${canAfford ? '' : 'disabled'}" id="modal-upgrade-btn">
          ${canAfford ? '⬆️ 업그레이드!' : '💸 자금 부족'}
        </button>
      </div>
    `;

    this.container.appendChild(modal);

    if (canAfford) {
      document.getElementById('modal-upgrade-btn')?.addEventListener('click', () => {
        gameState.upgradeShop();
        modal.remove();
        this.showFloatingText('🏪 업그레이드 완료!', true);
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
          <div class="summary-weather">${summary.weather.description}</div>
          <div class="summary-day">Day ${summary.day} 결산</div>
          <div class="summary-title">${isProfit ? '🎉 수고했어요!' : '😢 힘내세요!'}</div>
          ${summary.isNewRecord ? '<div class="summary-record">🏆 신기록!</div>' : ''}
        </div>

        <div class="summary-card">
          <div class="summary-row">
            <span class="summary-label">🍎 판매량</span>
            <span class="summary-value">${summary.sales}개</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">👥 손님</span>
            <span class="summary-value">${summary.customersServed}명 응대 / ${summary.customersLost}명 이탈</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">🔥 최대 콤보</span>
            <span class="summary-value">${summary.maxCombo}x</span>
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
        </div>

        ${summary.goalCompleted ? `
        <div class="summary-goal-reward">
          <div>🎯 목표 달성 보너스!</div>
          <div class="summary-goal-amount">+₩${this.formatNumber(summary.goalReward)}</div>
        </div>
        ` : ''}

        <div class="summary-profit ${isProfit ? '' : 'loss'}">
          <div class="summary-profit-label">순이익</div>
          <div class="summary-profit-value">${isProfit ? '+' : ''}₩${this.formatNumber(summary.profit)}</div>
        </div>

        <button class="summary-next-btn" id="summary-next">▶️ 다음 날로</button>
      </div>
    `;

    this.container.appendChild(modal);

    if (isProfit || summary.goalCompleted || summary.isNewRecord) {
      this.showConfetti();
    }

    document.getElementById('summary-next')?.addEventListener('click', () => {
      modal.remove();
      this.updateUI();
    });
  }

  private showConfetti() {
    const emojis = ['🎉', '✨', '💰', '⭐', '🍎', '🎊', '🏆'];
    for (let i = 0; i < 25; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      confetti.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      confetti.style.left = `${Math.random() * 100}%`;
      confetti.style.animationDelay = `${Math.random() * 2}s`;
      confetti.style.animationDuration = `${2 + Math.random() * 2}s`;
      document.body.appendChild(confetti);
      setTimeout(() => confetti.remove(), 5000);
    }
  }

  // === 헬퍼 함수들 ===

  private renderApples(count: number): string {
    if (count === 0) {
      return '<div class="empty-stand">재고 없음<br><small>매입 버튼을 눌러주세요</small></div>';
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
      const state = gameState.getState();
      if (state.timeOfDay === 'noon') {
        return '<div class="empty-queue">손님을 기다리는 중... ⏳</div>';
      } else if (state.timeOfDay === 'morning') {
        return '<div class="empty-queue">아침이에요! 먼저 사과를 매입하세요 🛒</div>';
      } else {
        return '<div class="empty-queue">영업 종료! 내일을 기다려요 🌙</div>';
      }
    }

    return customers.map(c => {
      const typeClass = c.type !== 'normal' ? `customer-${c.type}` : '';
      const typeBadge = c.type === 'regular' ? '<span class="customer-type-badge regular">단골</span>' :
                       c.type === 'bulk' ? '<span class="customer-type-badge bulk">대량</span>' :
                       c.type === 'picky' ? '<span class="customer-type-badge picky">까다로움</span>' : '';
      
      return `
        <div class="customer-card ${c.mood} ${typeClass}" data-id="${c.id}">
          ${typeBadge}
          <div class="customer-avatar">${c.emoji}</div>
          <div class="customer-mood">${this.getMoodEmoji(c.mood)}</div>
          <div class="customer-order">🍎×${c.quantity}</div>
          ${c.tip > 0 ? '<div class="customer-tip-hint">💕</div>' : ''}
          <div class="customer-patience">
            <div class="customer-patience-bar ${this.getPatienceClass(c.patience)}" style="width:${c.patience}%"></div>
          </div>
        </div>
      `;
    }).join('');
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

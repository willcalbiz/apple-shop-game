// 사과 가게 v4 - 게임 상태 관리

export interface Transaction {
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description: string;
  day: number;
}

export interface Customer {
  id: number;
  emoji: string;
  type: 'normal' | 'regular' | 'bulk' | 'picky'; // 일반, 단골, 대량, 까다로운
  name: string;
  quantity: number;
  maxPrice: number;
  patience: number;
  mood: 'happy' | 'neutral' | 'angry';
  tip: number; // 팁 (단골일 경우)
}

export interface DailyGoal {
  type: 'revenue' | 'sales' | 'customers';
  target: number;
  current: number;
  reward: number;
  completed: boolean;
}

export interface Weather {
  type: 'sunny' | 'cloudy' | 'rainy';
  customerMultiplier: number;
  description: string;
}

export interface GameState {
  // 기본
  day: number;
  timeOfDay: 'morning' | 'noon' | 'evening';
  cash: number;
  apples: number;
  appleCost: number;
  applePrice: number;
  
  // 통계
  transactions: Transaction[];
  totalRevenue: number;
  totalExpenses: number;
  reputation: number;
  shopLevel: number;
  
  // 일일
  dailySales: number;
  dailyRevenue: number;
  dailyCustomersServed: number;
  dailyCustomersLost: number;
  
  // 콤보
  combo: number;
  maxCombo: number;
  
  // 목표
  dailyGoal: DailyGoal | null;
  
  // 날씨
  weather: Weather;
  
  // 튜토리얼
  tutorialStep: number;
  tutorialCompleted: boolean;
  
  // 기록
  bestDailyRevenue: number;
  totalDaysPlayed: number;
}

const CUSTOMER_TYPES = {
  normal: { emoji: ['👩', '👨', '🧑', '👧', '👦'], name: '손님', tipChance: 0, bulkChance: 0 },
  regular: { emoji: ['👩‍🦰', '👨‍🦱', '🧓'], name: '단골', tipChance: 0.5, bulkChance: 0.2 },
  bulk: { emoji: ['👔', '👩‍💼', '🧑‍🍳'], name: '대량구매', tipChance: 0.3, bulkChance: 1 },
  picky: { emoji: ['🧐', '😤', '🤨'], name: '까다로운 손님', tipChance: 0, bulkChance: 0 },
};

const WEATHERS: Weather[] = [
  { type: 'sunny', customerMultiplier: 1.2, description: '☀️ 맑음 - 손님 많음!' },
  { type: 'cloudy', customerMultiplier: 1.0, description: '⛅ 흐림 - 평범한 하루' },
  { type: 'rainy', customerMultiplier: 0.6, description: '🌧️ 비 - 손님 적음' },
];

class GameStateManager {
  private state: GameState;
  private customerQueue: Customer[] = [];
  private nextCustomerId = 1;
  private listeners: (() => void)[] = [];

  constructor() {
    this.state = this.getInitialState();
  }

  private getInitialState(): GameState {
    return {
      day: 1,
      timeOfDay: 'morning',
      cash: 10000,
      apples: 0,
      appleCost: 200,
      applePrice: 350,
      transactions: [],
      totalRevenue: 0,
      totalExpenses: 0,
      reputation: 3.0,
      shopLevel: 1,
      dailySales: 0,
      dailyRevenue: 0,
      dailyCustomersServed: 0,
      dailyCustomersLost: 0,
      combo: 0,
      maxCombo: 0,
      dailyGoal: this.generateDailyGoal(1),
      weather: this.generateWeather(),
      tutorialStep: 0,
      tutorialCompleted: false,
      bestDailyRevenue: 0,
      totalDaysPlayed: 0,
    };
  }

  private generateDailyGoal(day: number): DailyGoal {
    const baseTarget = 2000 + (day - 1) * 500;
    return {
      type: 'revenue',
      target: baseTarget,
      current: 0,
      reward: Math.floor(baseTarget * 0.2),
      completed: false,
    };
  }

  private generateWeather(): Weather {
    const rand = Math.random();
    if (rand < 0.5) return WEATHERS[0]; // 맑음 50%
    if (rand < 0.8) return WEATHERS[1]; // 흐림 30%
    return WEATHERS[2]; // 비 20%
  }

  getState(): GameState {
    return { ...this.state };
  }

  getCustomerQueue(): Customer[] {
    return [...this.customerQueue];
  }

  subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(l => l());
  }

  // 튜토리얼 진행
  advanceTutorial() {
    if (this.state.tutorialStep < 5) {
      this.state.tutorialStep++;
      this.notify();
    } else {
      this.state.tutorialCompleted = true;
      this.notify();
    }
  }

  skipTutorial() {
    this.state.tutorialCompleted = true;
    this.state.tutorialStep = 99;
    this.notify();
  }

  // 사과 구매
  buyApples(quantity: number): boolean {
    const cost = quantity * this.state.appleCost;
    if (this.state.cash >= cost) {
      this.state.cash -= cost;
      this.state.apples += quantity;
      this.state.totalExpenses += cost;
      this.state.transactions.push({
        type: 'expense',
        category: '매입',
        amount: cost,
        description: `🍎 사과 ${quantity}개 구매`,
        day: this.state.day,
      });
      
      // 튜토리얼 진행
      if (this.state.tutorialStep === 1) {
        this.advanceTutorial();
      }
      
      this.notify();
      return true;
    }
    return false;
  }

  // 가격 설정
  setPrice(price: number) {
    this.state.applePrice = Math.max(this.state.appleCost, Math.min(1000, price));
    this.notify();
  }

  // 손님 생성
  generateCustomer(): Customer | null {
    if (this.state.apples === 0) return null;
    if (this.customerQueue.length >= 5) return null;
    if (this.state.timeOfDay !== 'noon') return null;

    // 날씨에 따른 손님 생성 확률
    if (Math.random() > this.state.weather.customerMultiplier * 0.4) return null;

    // 손님 유형 결정
    let customerType: keyof typeof CUSTOMER_TYPES = 'normal';
    const rand = Math.random();
    if (this.state.reputation >= 4 && rand < 0.2) {
      customerType = 'regular';
    } else if (rand < 0.1) {
      customerType = 'bulk';
    } else if (rand < 0.15) {
      customerType = 'picky';
    }

    const typeInfo = CUSTOMER_TYPES[customerType];
    
    // 수량 결정
    let maxQty = Math.min(Math.floor(Math.random() * 4) + 1, this.state.apples);
    if (customerType === 'bulk') {
      maxQty = Math.min(Math.floor(Math.random() * 6) + 5, this.state.apples);
    }

    // 가격 허용 범위
    let priceMultiplier = 1.0 + Math.random() * 0.5; // 100%~150%
    if (customerType === 'picky') {
      priceMultiplier = 0.8 + Math.random() * 0.3; // 80%~110%
    } else if (customerType === 'regular') {
      priceMultiplier = 1.2 + Math.random() * 0.5; // 120%~170%
    }
    const maxPrice = Math.floor(this.state.appleCost * priceMultiplier);

    // 팁
    let tip = 0;
    if (customerType === 'regular' && Math.random() < typeInfo.tipChance) {
      tip = Math.floor(maxQty * 50 * Math.random());
    }

    const customer: Customer = {
      id: this.nextCustomerId++,
      emoji: typeInfo.emoji[Math.floor(Math.random() * typeInfo.emoji.length)],
      type: customerType,
      name: typeInfo.name,
      quantity: maxQty,
      maxPrice,
      patience: 100,
      mood: 'happy',
      tip,
    };

    this.customerQueue.push(customer);
    
    // 튜토리얼
    if (this.state.tutorialStep === 2 && this.customerQueue.length === 1) {
      this.advanceTutorial();
    }
    
    this.notify();
    return customer;
  }

  // 인내심 감소
  decreasePatience() {
    let lostAny = false;
    
    this.customerQueue.forEach(c => {
      // 손님 유형별 인내심 감소 속도
      let decreaseRate = 5;
      if (c.type === 'picky') decreaseRate = 8;
      if (c.type === 'regular') decreaseRate = 3;
      
      c.patience -= decreaseRate;
      
      if (c.patience > 60) c.mood = 'happy';
      else if (c.patience > 30) c.mood = 'neutral';
      else c.mood = 'angry';
    });

    // 인내심 0 이하 → 이탈
    const leaving = this.customerQueue.filter(c => c.patience <= 0);
    if (leaving.length > 0) {
      lostAny = true;
      this.state.dailyCustomersLost += leaving.length;
      this.state.reputation = Math.max(0, this.state.reputation - 0.1 * leaving.length);
      this.state.combo = 0; // 콤보 리셋
    }

    this.customerQueue = this.customerQueue.filter(c => c.patience > 0);
    this.notify();
    
    return lostAny;
  }

  // 판매
  sellToCustomer(customerId: number): { 
    success: boolean; 
    revenue: number; 
    tip: number;
    combo: number;
    message: string;
    isCombo: boolean;
  } {
    const idx = this.customerQueue.findIndex(c => c.id === customerId);
    if (idx === -1) {
      return { success: false, revenue: 0, tip: 0, combo: 0, message: '손님이 없어요', isCombo: false };
    }

    const customer = this.customerQueue[idx];

    // 가격 체크
    if (this.state.applePrice > customer.maxPrice) {
      this.customerQueue.splice(idx, 1);
      this.state.dailyCustomersLost++;
      this.state.reputation = Math.max(0, this.state.reputation - 0.05);
      this.state.combo = 0;
      this.notify();
      
      const messages = ['너무 비싸요! 😤', '가격이 좀...', '다른 데 갈게요'];
      return { 
        success: false, 
        revenue: 0, 
        tip: 0, 
        combo: 0, 
        message: messages[Math.floor(Math.random() * messages.length)],
        isCombo: false
      };
    }

    // 판매 성공!
    const revenue = customer.quantity * this.state.applePrice;
    const tip = customer.tip;
    const totalEarned = revenue + tip;

    this.state.apples -= customer.quantity;
    this.state.cash += totalEarned;
    this.state.totalRevenue += totalEarned;
    this.state.dailySales += customer.quantity;
    this.state.dailyRevenue += totalEarned;
    this.state.dailyCustomersServed++;

    // 콤보
    this.state.combo++;
    const isCombo = this.state.combo >= 2;
    if (this.state.combo > this.state.maxCombo) {
      this.state.maxCombo = this.state.combo;
    }

    // 콤보 보너스 (3콤보부터)
    let comboBonus = 0;
    if (this.state.combo >= 3) {
      comboBonus = Math.floor(revenue * 0.1 * (this.state.combo - 2));
      this.state.cash += comboBonus;
      this.state.dailyRevenue += comboBonus;
    }

    // 평판 상승
    if (this.state.applePrice < customer.maxPrice * 0.8) {
      this.state.reputation = Math.min(5, this.state.reputation + 0.05);
    }

    // 목표 업데이트
    if (this.state.dailyGoal && !this.state.dailyGoal.completed) {
      this.state.dailyGoal.current = this.state.dailyRevenue;
      if (this.state.dailyGoal.current >= this.state.dailyGoal.target) {
        this.state.dailyGoal.completed = true;
        this.state.cash += this.state.dailyGoal.reward;
      }
    }

    // 거래 기록
    this.state.transactions.push({
      type: 'income',
      category: '매출',
      amount: totalEarned + comboBonus,
      description: `🍎 ${customer.quantity}개 판매${tip > 0 ? ' (+팁)' : ''}${comboBonus > 0 ? ` (+콤보 ${comboBonus}원)` : ''}`,
      day: this.state.day,
    });

    this.customerQueue.splice(idx, 1);
    
    // 튜토리얼
    if (this.state.tutorialStep === 3) {
      this.advanceTutorial();
    }
    
    this.notify();

    const messages = tip > 0 
      ? ['고마워요! 팁이에요~ 💕', '맛있겠다! 팁 드릴게요!']
      : ['감사합니다! 😊', '좋은 사과네요!', '또 올게요~', '잘 먹을게요!'];

    return { 
      success: true, 
      revenue: totalEarned + comboBonus, 
      tip,
      combo: this.state.combo,
      message: messages[Math.floor(Math.random() * messages.length)],
      isCombo
    };
  }

  // 시간 진행
  advanceTime(): { newDay: boolean; summary?: DaySummary } {
    if (this.state.timeOfDay === 'morning') {
      this.state.timeOfDay = 'noon';
      
      // 튜토리얼
      if (this.state.tutorialStep === 1) {
        // 매입 안 했으면 다시 안내
      } else if (this.state.tutorialStep === 2 || !this.state.tutorialCompleted) {
        // 낮이 되면 손님 기다리라고
      }
      
      this.notify();
      return { newDay: false };
    } 
    
    if (this.state.timeOfDay === 'noon') {
      this.state.timeOfDay = 'evening';
      this.state.dailyCustomersLost += this.customerQueue.length;
      this.customerQueue = [];
      this.notify();
      return { newDay: false };
    }

    // 하루 종료
    const summary = this.endDay();
    return { newDay: true, summary };
  }

  private endDay(): DaySummary {
    const summary: DaySummary = {
      day: this.state.day,
      sales: this.state.dailySales,
      revenue: this.state.dailyRevenue,
      expenses: this.state.transactions
        .filter(t => t.day === this.state.day && t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0),
      profit: 0,
      customersServed: this.state.dailyCustomersServed,
      customersLost: this.state.dailyCustomersLost,
      spoiledApples: 0,
      maxCombo: this.state.maxCombo,
      goalCompleted: this.state.dailyGoal?.completed || false,
      goalReward: this.state.dailyGoal?.reward || 0,
      weather: this.state.weather,
      isNewRecord: false,
    };

    summary.profit = summary.revenue - summary.expenses;

    // 최고 기록 체크
    if (summary.revenue > this.state.bestDailyRevenue) {
      this.state.bestDailyRevenue = summary.revenue;
      summary.isNewRecord = true;
    }

    // 감모 (10%)
    const spoiled = Math.floor(this.state.apples * 0.1);
    if (spoiled > 0) {
      summary.spoiledApples = spoiled;
      this.state.apples -= spoiled;
      const loss = spoiled * this.state.appleCost;
      this.state.totalExpenses += loss;
      this.state.transactions.push({
        type: 'expense',
        category: '감모손실',
        amount: loss,
        description: `🗑️ 상한 사과 ${spoiled}개 폐기`,
        day: this.state.day,
      });
    }

    // 다음 날 준비
    this.state.day++;
    this.state.totalDaysPlayed++;
    this.state.timeOfDay = 'morning';
    this.state.dailySales = 0;
    this.state.dailyRevenue = 0;
    this.state.dailyCustomersServed = 0;
    this.state.dailyCustomersLost = 0;
    this.state.combo = 0;
    this.state.maxCombo = 0;
    this.state.dailyGoal = this.generateDailyGoal(this.state.day);
    this.state.weather = this.generateWeather();

    // 튜토리얼 완료
    if (this.state.tutorialStep >= 4 && !this.state.tutorialCompleted) {
      this.state.tutorialCompleted = true;
    }

    this.notify();
    return summary;
  }

  // 업그레이드
  upgradeShop(): boolean {
    const cost = this.state.shopLevel * 5000;
    if (this.state.cash >= cost) {
      this.state.cash -= cost;
      this.state.shopLevel++;
      this.state.transactions.push({
        type: 'expense',
        category: '투자',
        amount: cost,
        description: `🏪 가게 업그레이드 Lv.${this.state.shopLevel}`,
        day: this.state.day,
      });
      this.notify();
      return true;
    }
    return false;
  }

  getTotalProfit(): number {
    return this.state.totalRevenue - this.state.totalExpenses;
  }

  // 리셋
  reset() {
    this.state = this.getInitialState();
    this.customerQueue = [];
    this.nextCustomerId = 1;
    this.notify();
  }
}

export interface DaySummary {
  day: number;
  sales: number;
  revenue: number;
  expenses: number;
  profit: number;
  customersServed: number;
  customersLost: number;
  spoiledApples: number;
  maxCombo: number;
  goalCompleted: boolean;
  goalReward: number;
  weather: Weather;
  isNewRecord: boolean;
}

export const gameState = new GameStateManager();

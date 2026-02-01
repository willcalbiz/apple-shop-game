// 게임 상태 관리 v2
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
  name: string;
  quantity: number;
  maxPrice: number;
  patience: number; // 0-100, 시간 지나면 감소
  mood: 'happy' | 'neutral' | 'angry';
}

export interface GameState {
  day: number;
  timeOfDay: 'morning' | 'noon' | 'evening';
  cash: number;
  apples: number;
  appleCost: number;
  applePrice: number; // 판매가
  transactions: Transaction[];
  totalRevenue: number;
  totalExpenses: number;
  reputation: number; // 0-5 별점
  customersServed: number;
  customersLost: number;
  shopLevel: number; // 가게 레벨 (업그레이드)
  dailySales: number;
  dailyProfit: number;
}

const CUSTOMER_EMOJIS = ['👩', '👨', '👵', '👴', '🧑', '👧', '👦', '🧓'];
const CUSTOMER_NAMES = ['손님', '단골', '관광객', '학생', '직장인', '주부', '어르신', '아이'];

class GameStateManager {
  private state: GameState = {
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
    customersServed: 0,
    customersLost: 0,
    shopLevel: 1,
    dailySales: 0,
    dailyProfit: 0,
  };

  private customerQueue: Customer[] = [];
  private nextCustomerId = 1;
  private listeners: (() => void)[] = [];

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

  // 사과 구매 (도매상)
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
      this.notify();
      return true;
    }
    return false;
  }

  // 가격 설정
  setPrice(price: number) {
    this.state.applePrice = Math.max(this.state.appleCost, price);
    this.notify();
  }

  // 손님 생성
  generateCustomer(): Customer | null {
    if (this.state.apples === 0) return null;
    if (this.customerQueue.length >= 5) return null;
    if (this.state.timeOfDay !== 'noon') return null;

    const maxQty = Math.min(Math.floor(Math.random() * 5) + 1, this.state.apples);
    const priceMultiplier = 0.8 + Math.random() * 0.6; // 80% ~ 140%
    const maxPrice = Math.floor(this.state.appleCost * priceMultiplier * 1.5);

    const customer: Customer = {
      id: this.nextCustomerId++,
      emoji: CUSTOMER_EMOJIS[Math.floor(Math.random() * CUSTOMER_EMOJIS.length)],
      name: CUSTOMER_NAMES[Math.floor(Math.random() * CUSTOMER_NAMES.length)],
      quantity: maxQty,
      maxPrice: maxPrice,
      patience: 100,
      mood: 'happy',
    };

    this.customerQueue.push(customer);
    this.notify();
    return customer;
  }

  // 손님 인내심 감소
  decreasePatience() {
    this.customerQueue.forEach(c => {
      c.patience -= 5;
      if (c.patience > 60) c.mood = 'happy';
      else if (c.patience > 30) c.mood = 'neutral';
      else c.mood = 'angry';
    });

    // 인내심 0 이하면 이탈
    const leaving = this.customerQueue.filter(c => c.patience <= 0);
    leaving.forEach(() => {
      this.state.customersLost++;
      this.state.reputation = Math.max(0, this.state.reputation - 0.1);
    });

    this.customerQueue = this.customerQueue.filter(c => c.patience > 0);
    this.notify();
  }

  // 판매 처리
  sellToCustomer(customerId: number): { success: boolean; revenue: number; message: string } {
    const customerIndex = this.customerQueue.findIndex(c => c.id === customerId);
    if (customerIndex === -1) {
      return { success: false, revenue: 0, message: '손님을 찾을 수 없어요' };
    }

    const customer = this.customerQueue[customerIndex];

    if (this.state.applePrice > customer.maxPrice) {
      // 가격이 너무 비쌈
      this.customerQueue.splice(customerIndex, 1);
      this.state.customersLost++;
      this.state.reputation = Math.max(0, this.state.reputation - 0.05);
      this.notify();
      return { success: false, revenue: 0, message: '너무 비싸요! 😤' };
    }

    // 판매 성공
    const revenue = customer.quantity * this.state.applePrice;
    this.state.apples -= customer.quantity;
    this.state.cash += revenue;
    this.state.totalRevenue += revenue;
    this.state.customersServed++;
    this.state.dailySales += customer.quantity;
    this.state.dailyProfit += revenue - (customer.quantity * this.state.appleCost);

    // 좋은 가격이면 평판 상승
    if (this.state.applePrice < customer.maxPrice * 0.8) {
      this.state.reputation = Math.min(5, this.state.reputation + 0.1);
    }

    this.state.transactions.push({
      type: 'income',
      category: '매출',
      amount: revenue,
      description: `🍎 ${customer.quantity}개 판매 (@${this.state.applePrice}원)`,
      day: this.state.day,
    });

    this.customerQueue.splice(customerIndex, 1);
    this.notify();
    return { success: true, revenue, message: `고마워요! 💕` };
  }

  // 다음 시간대로
  advanceTime(): { newDay: boolean; summary?: DaySummary } {
    if (this.state.timeOfDay === 'morning') {
      this.state.timeOfDay = 'noon';
      this.notify();
      return { newDay: false };
    } else if (this.state.timeOfDay === 'noon') {
      this.state.timeOfDay = 'evening';
      // 남은 손님 처리
      this.state.customersLost += this.customerQueue.length;
      this.customerQueue = [];
      this.notify();
      return { newDay: false };
    } else {
      // 하루 종료
      const summary = this.endDay();
      return { newDay: true, summary };
    }
  }

  private endDay(): DaySummary {
    const summary: DaySummary = {
      day: this.state.day,
      sales: this.state.dailySales,
      revenue: this.state.transactions
        .filter(t => t.day === this.state.day && t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0),
      expenses: this.state.transactions
        .filter(t => t.day === this.state.day && t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0),
      profit: 0,
      customersServed: this.state.customersServed,
      customersLost: this.state.customersLost,
      spoiledApples: 0,
      reputation: this.state.reputation,
    };

    summary.profit = summary.revenue - summary.expenses;

    // 사과 감모 (10%)
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

    // 다음 날로
    this.state.day++;
    this.state.timeOfDay = 'morning';
    this.state.dailySales = 0;
    this.state.dailyProfit = 0;
    this.state.customersServed = 0;
    this.state.customersLost = 0;

    this.notify();
    return summary;
  }

  // 가게 업그레이드
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
  reputation: number;
}

export const gameState = new GameStateManager();

// 게임 상태 관리
export interface Transaction {
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description: string;
  day: number;
}

export interface GameState {
  day: number;
  timeOfDay: 'morning' | 'noon' | 'evening';
  cash: number;
  apples: number;
  appleCost: number; // 사과 매입 원가
  transactions: Transaction[];
  totalRevenue: number;
  totalExpenses: number;
}

class GameStateManager {
  private state: GameState = {
    day: 1,
    timeOfDay: 'morning',
    cash: 10000, // 시작 자금 10,000원
    apples: 0,
    appleCost: 200, // 도매 원가 200원
    transactions: [],
    totalRevenue: 0,
    totalExpenses: 0,
  };

  private listeners: (() => void)[] = [];

  getState(): GameState {
    return { ...this.state };
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
        description: `사과 ${quantity}개 구매`,
        day: this.state.day,
      });
      this.notify();
      return true;
    }
    return false;
  }

  // 사과 판매
  sellApples(quantity: number, pricePerApple: number): boolean {
    if (this.state.apples >= quantity) {
      const revenue = quantity * pricePerApple;
      this.state.apples -= quantity;
      this.state.cash += revenue;
      this.state.totalRevenue += revenue;
      this.state.transactions.push({
        type: 'income',
        category: '매출',
        amount: revenue,
        description: `사과 ${quantity}개 판매 (@${pricePerApple}원)`,
        day: this.state.day,
      });
      this.notify();
      return true;
    }
    return false;
  }

  // 다음 시간대로
  advanceTime() {
    if (this.state.timeOfDay === 'morning') {
      this.state.timeOfDay = 'noon';
    } else if (this.state.timeOfDay === 'noon') {
      this.state.timeOfDay = 'evening';
    } else {
      // 하루 종료 → 다음 날
      this.state.day++;
      this.state.timeOfDay = 'morning';
      // 사과 감모 (10% 손실)
      const spoiled = Math.floor(this.state.apples * 0.1);
      if (spoiled > 0) {
        this.state.apples -= spoiled;
        const loss = spoiled * this.state.appleCost;
        this.state.totalExpenses += loss;
        this.state.transactions.push({
          type: 'expense',
          category: '감모손실',
          amount: loss,
          description: `상한 사과 ${spoiled}개 폐기`,
          day: this.state.day - 1,
        });
      }
    }
    this.notify();
  }

  // 오늘의 손익 계산
  getTodayProfit(): number {
    const todayTx = this.state.transactions.filter(t => t.day === this.state.day);
    const income = todayTx.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expense = todayTx.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    return income - expense;
  }

  // 오늘의 거래 내역
  getTodayTransactions(): Transaction[] {
    return this.state.transactions.filter(t => t.day === this.state.day);
  }

  // 전체 순이익
  getTotalProfit(): number {
    return this.state.totalRevenue - this.state.totalExpenses;
  }
}

export const gameState = new GameStateManager();

export type RiskProfile = 'LOW' | 'MEDIUM' | 'HIGH' | null;

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
}

export interface Investment {
  id: string;
  title: string;
  type: 'MF' | 'SIP' | 'ETF';
  amount: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  expectedReturn: string;
  currentValue: number;
}

export interface Goal {
  id: string;
  title: string;
  targetAmount: number;
  savedAmount: number;
}

export interface Transaction {
  id: string;
  type: 'CREDIT' | 'DEBIT';
  amount: number;
  title: string;
  date: string;
}

export interface AppState {
  user: {
    name: string;
    isLoggedIn: boolean;
    riskProfile: RiskProfile;
  };
  walletBalance: number;
  expenses: Expense[];
  investments: Investment[];
  goals: Goal[];
  transactions: Transaction[];
}

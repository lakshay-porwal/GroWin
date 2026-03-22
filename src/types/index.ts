export type RiskProfileValue = 'LOW' | 'MEDIUM' | 'HIGH';
export type RiskProfile = RiskProfileValue | null;
export type UserRole = 'student' | 'authority' | 'admin';
export type FundStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface AppUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  riskProfile: RiskProfile;
  isLoggedIn: boolean;
  joinedAt: string;
}

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

export interface Fund {
  id: string;
  title: string;
  type: 'MF' | 'SIP' | 'ETF';
  amount: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  expectedReturn: string;
  description: string;
  status: FundStatus;
  submittedBy: string;     // authority user id
  submittedByName: string; // authority name
  approvedBy?: string;     // admin user id
  submittedAt: string;
  resolvedAt?: string;
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
  currentUser: AppUser | null;
  users: AppUser[];
  funds: Fund[];        // authority-submitted funds
  walletBalance: number;
  expenses: Expense[];
  investments: Investment[];
  goals: Goal[];
  transactions: Transaction[];
}

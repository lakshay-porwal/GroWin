import React, { createContext, useState, ReactNode } from 'react';
import { AppState, RiskProfile, Expense, Investment, Goal, Transaction } from '../types';

interface AppContextProps extends AppState {
  theme: 'light' | 'dark';
  login: (name: string) => void;
  logout: () => void;
  setRiskProfile: (profile: RiskProfile) => void;
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  addInvestment: (investment: Omit<Investment, 'id' | 'currentValue'>) => void;
  addGoal: (goal: Omit<Goal, 'id' | 'savedAmount'>) => void;
  updateGoal: (id: string, amount: number) => void;
  addMoneyToWallet: (amount: number) => void;
  toggleTheme: () => void;
}

const initialState: AppState = {
  user: {
    name: '',
    isLoggedIn: false,
    riskProfile: null,
  },
  walletBalance: 15000,
  expenses: [
    { id: 'e1', title: 'Spotify Subscription', amount: 119, category: 'Subscriptions', date: new Date(Date.now() - 86400000 * 2).toISOString() },
    { id: 'e2', title: 'College Cafeteria', amount: 350, category: 'Food', date: new Date(Date.now() - 86400000 * 1).toISOString() },
    { id: 'e3', title: 'Uber to Library', amount: 220, category: 'Travel', date: new Date(Date.now() - 86400000 * 3).toISOString() },
    { id: 'e4', title: 'Semester Books', amount: 1500, category: 'Learning', date: new Date(Date.now() - 86400000 * 5).toISOString() },
  ],
  investments: [
    { id: 'i1', title: 'Student Starter SIP', amount: 500, type: 'SIP', riskLevel: 'LOW', currentValue: 512, expectedReturn: '8% p.a.' },
  ],
  goals: [
    { id: 'g1', title: 'New Laptop', targetAmount: 60000, savedAmount: 15000 },
    { id: 'g2', title: 'Goa Trip', targetAmount: 15000, savedAmount: 3000 },
  ],
  transactions: [
    { id: 't4', type: 'DEBIT', title: 'College Cafeteria', amount: 350, date: new Date(Date.now() - 86400000 * 1).toISOString() },
    { id: 't3', type: 'DEBIT', title: 'Spotify Subscription', amount: 119, date: new Date(Date.now() - 86400000 * 2).toISOString() },
    { id: 't2', type: 'DEBIT', title: 'Uber to Library', amount: 220, date: new Date(Date.now() - 86400000 * 3).toISOString() },
    { id: 't1', type: 'CREDIT', title: 'Pocket Money', amount: 5000, date: new Date(Date.now() - 86400000 * 4).toISOString() },
  ],
};

export const AppContext = createContext<AppContextProps>({
  ...initialState,
  theme: 'dark',
  login: () => {},
  logout: () => {},
  setRiskProfile: () => {},
  addExpense: () => {},
  addInvestment: () => {},
  addGoal: () => {},
  updateGoal: () => {},
  addMoneyToWallet: () => {},
  toggleTheme: () => {},
});

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AppState>(initialState);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const login = (name: string) => {
    setState((prev) => ({
      ...prev,
      user: { ...prev.user, name, isLoggedIn: true },
    }));
  };

  const logout = () => {
    setState(initialState);
  };

  const setRiskProfile = (profile: RiskProfile) => {
    setState((prev) => ({
      ...prev,
      user: { ...prev.user, riskProfile: profile },
    }));
  };

  const addExpense = (expense: Omit<Expense, 'id'>) => {
    const newExpense: Expense = { ...expense, id: Date.now().toString() };
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      type: 'DEBIT',
      amount: expense.amount,
      title: expense.title,
      date: expense.date,
    };
    setState((prev) => ({
      ...prev,
      expenses: [...prev.expenses, newExpense],
      walletBalance: prev.walletBalance - expense.amount,
      transactions: [newTransaction, ...prev.transactions],
    }));
  };

  const addInvestment = (investment: Omit<Investment, 'id' | 'currentValue'>) => {
    const newInvestment: Investment = { ...investment, id: Date.now().toString(), currentValue: investment.amount };
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      type: 'DEBIT',
      amount: investment.amount,
      title: `Invested in ${investment.title}`,
      date: new Date().toISOString(),
    };
    setState((prev) => ({
      ...prev,
      investments: [...prev.investments, newInvestment],
      walletBalance: prev.walletBalance - investment.amount,
      transactions: [newTransaction, ...prev.transactions],
    }));
  };

  const addGoal = (goal: Omit<Goal, 'id' | 'savedAmount'>) => {
    const newGoal: Goal = { ...goal, id: Date.now().toString(), savedAmount: 0 };
    setState((prev) => ({
      ...prev,
      goals: [...prev.goals, newGoal],
    }));
  };

  const updateGoal = (id: string, amount: number) => {
    setState((prev) => ({
      ...prev,
      goals: prev.goals.map((g) => (g.id === id ? { ...g, savedAmount: g.savedAmount + amount } : g)),
      walletBalance: prev.walletBalance - amount,
      transactions: [
        {
          id: Date.now().toString(),
          type: 'DEBIT',
          amount,
          title: `Added to Goal`,
          date: new Date().toISOString(),
        },
        ...prev.transactions,
      ],
    }));
  };

  const addMoneyToWallet = (amount: number) => {
    setState((prev) => ({
      ...prev,
      walletBalance: prev.walletBalance + amount,
      transactions: [
        {
          id: Date.now().toString(),
          type: 'CREDIT',
          amount,
          title: 'Added Money to Wallet',
          date: new Date().toISOString(),
        },
        ...prev.transactions,
      ],
    }));
  };

  return (
    <AppContext.Provider
      value={{
        ...state,
        theme,
        login,
        logout,
        setRiskProfile,
        addExpense,
        addInvestment,
        addGoal,
        updateGoal,
        addMoneyToWallet,
        toggleTheme,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

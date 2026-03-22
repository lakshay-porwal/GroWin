import React, { createContext, useState, ReactNode } from 'react';
import { AppState, RiskProfile, Expense, Investment, Goal, Transaction } from '../types';

interface AppContextProps extends AppState {
  login: (name: string) => void;
  logout: () => void;
  setRiskProfile: (profile: RiskProfile) => void;
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  addInvestment: (investment: Omit<Investment, 'id' | 'currentValue'>) => void;
  addGoal: (goal: Omit<Goal, 'id' | 'savedAmount'>) => void;
  updateGoal: (id: string, amount: number) => void;
  addMoneyToWallet: (amount: number) => void;
}

const initialState: AppState = {
  user: {
    name: '',
    isLoggedIn: false,
    riskProfile: null,
  },
  walletBalance: 0,
  expenses: [],
  investments: [],
  goals: [],
  transactions: [],
};

export const AppContext = createContext<AppContextProps>({
  ...initialState,
  login: () => {},
  logout: () => {},
  setRiskProfile: () => {},
  addExpense: () => {},
  addInvestment: () => {},
  addGoal: () => {},
  updateGoal: () => {},
  addMoneyToWallet: () => {},
});

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AppState>(initialState);

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
        login,
        logout,
        setRiskProfile,
        addExpense,
        addInvestment,
        addGoal,
        updateGoal,
        addMoneyToWallet,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

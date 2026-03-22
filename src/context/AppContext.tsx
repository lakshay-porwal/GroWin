import React, { createContext, useState, ReactNode, useEffect, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, AppUser, UserRole, RiskProfile, Expense, Investment, Fund, Goal, Transaction } from '../types';

// ─── Storage Keys ──────────────────────────────────────────────────────────────
const KEYS = {
  USERS: '@growin:users',
  FUNDS: '@growin:funds',
  THEME: '@growin:theme',
  CURRENT_USER_ID: '@growin:currentUserId',
  USER_DATA: (id: string) => `@growin:data:${id}`,
};

// ─── Per-User Financial Data ───────────────────────────────────────────────────
interface UserData {
  walletBalance: number;
  expenses: Expense[];
  investments: Investment[];
  goals: Goal[];
  transactions: Transaction[];
}

const EMPTY_USER_DATA: UserData = {
  walletBalance: 0,
  expenses: [],
  investments: [],
  goals: [],
  transactions: [],
};

// ─── Seed Admin (always exists) ────────────────────────────────────────────────
const ADMIN_SEED: AppUser = {
  id: 'admin-001',
  name: 'Admin',
  email: 'admin@growin.app',
  password: 'admin123',
  role: 'admin',
  riskProfile: null,
  isLoggedIn: false,
  joinedAt: '2025-01-01T00:00:00.000Z',
};

// ─── Context Interface ─────────────────────────────────────────────────────────
interface AppContextProps extends AppState {
  theme: 'light' | 'dark';
  isLoaded: boolean;
  // Auth
  register: (name: string, email: string, password: string, role: UserRole) => Promise<{ success: boolean; message: string }>;
  loginUser: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  setRiskProfile: (profile: RiskProfile) => Promise<void>;
  updateProfile: (name: string) => Promise<void>;
  // Student
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  addInvestment: (investment: Omit<Investment, 'id' | 'currentValue'>) => void;
  addGoal: (goal: Omit<Goal, 'id' | 'savedAmount'>) => void;
  updateGoal: (id: string, amount: number) => void;
  addMoneyToWallet: (amount: number) => void;
  // Authority
  submitFund: (fund: Omit<Fund, 'id' | 'status' | 'submittedBy' | 'submittedByName' | 'submittedAt'>) => void;
  // Admin
  approveFund: (fundId: string) => void;
  rejectFund: (fundId: string) => void;
  toggleTheme: () => void;
}

// ─── Context Default ───────────────────────────────────────────────────────────
export const AppContext = createContext<AppContextProps>({
  currentUser: null, users: [], funds: [],
  ...EMPTY_USER_DATA,
  theme: 'dark', isLoaded: false,
  register: async () => ({ success: false, message: '' }),
  loginUser: async () => ({ success: false, message: '' }),
  logout: async () => {},
  setRiskProfile: async () => {},
  updateProfile: async () => {},
  addExpense: () => {}, addInvestment: () => {}, addGoal: () => {},
  updateGoal: () => {}, addMoneyToWallet: () => {},
  submitFund: () => {}, approveFund: () => {}, rejectFund: () => {},
  toggleTheme: () => {},
});

// ─── Provider ─────────────────────────────────────────────────────────────────
export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [users, setUsers] = useState<AppUser[]>([ADMIN_SEED]);
  const [funds, setFunds] = useState<Fund[]>([]);
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [userData, setUserData] = useState<UserData>(EMPTY_USER_DATA);

  // ── Load from storage on mount ──────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const [rawUsers, rawFunds, rawTheme, currentUserId] = await Promise.all([
          AsyncStorage.getItem(KEYS.USERS),
          AsyncStorage.getItem(KEYS.FUNDS),
          AsyncStorage.getItem(KEYS.THEME),
          AsyncStorage.getItem(KEYS.CURRENT_USER_ID),
        ]);

        const loadedUsers: AppUser[] = rawUsers ? JSON.parse(rawUsers) : [ADMIN_SEED];
        // Ensure admin seed always exists
        const hasAdmin = loadedUsers.some(u => u.id === 'admin-001');
        const finalUsers = hasAdmin ? loadedUsers : [ADMIN_SEED, ...loadedUsers];

        setUsers(finalUsers);
        if (rawFunds) setFunds(JSON.parse(rawFunds));
        if (rawTheme) setTheme(rawTheme as 'light' | 'dark');

        if (currentUserId) {
          const user = finalUsers.find(u => u.id === currentUserId) ?? null;
          setCurrentUser(user);
          if (user) {
            const rawUD = await AsyncStorage.getItem(KEYS.USER_DATA(user.id));
            setUserData(rawUD ? JSON.parse(rawUD) : EMPTY_USER_DATA);
          }
        }
      } catch (e) {
        console.error('GroWin: failed to load storage', e);
      } finally {
        setIsLoaded(true);
      }
    })();
  }, []);

  // ── Persist helpers ─────────────────────────────────────────────────────────
  const saveUsers = useCallback(async (u: AppUser[]) => {
    await AsyncStorage.setItem(KEYS.USERS, JSON.stringify(u));
  }, []);

  const saveFunds = useCallback(async (f: Fund[]) => {
    await AsyncStorage.setItem(KEYS.FUNDS, JSON.stringify(f));
  }, []);

  const saveUserData = useCallback(async (uid: string, data: UserData) => {
    await AsyncStorage.setItem(KEYS.USER_DATA(uid), JSON.stringify(data));
  }, []);

  // Auto-save user financial data whenever it changes
  const didMount = useRef(false);
  useEffect(() => {
    if (!didMount.current) { didMount.current = true; return; }
    if (currentUser && isLoaded) {
      saveUserData(currentUser.id, userData);
    }
  }, [userData, currentUser, isLoaded, saveUserData]);

  // ── Auth ────────────────────────────────────────────────────────────────────
  const register = async (name: string, email: string, password: string, role: UserRole): Promise<{ success: boolean; message: string }> => {
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, message: 'This email is already registered. Try logging in.' };
    }
    if (password.length < 6) {
      return { success: false, message: 'Password must be at least 6 characters.' };
    }
    const newUser: AppUser = {
      id: Date.now().toString(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      role,
      riskProfile: null,
      isLoggedIn: true,
      joinedAt: new Date().toISOString(),
    };
    const newUsers = [...users, newUser];
    setUsers(newUsers);
    setCurrentUser(newUser);
    setUserData(EMPTY_USER_DATA);
    await saveUsers(newUsers);
    await AsyncStorage.setItem(KEYS.CURRENT_USER_ID, newUser.id);
    await saveUserData(newUser.id, EMPTY_USER_DATA);
    return { success: true, message: `Welcome to GroWin, ${newUser.name}! 🎉` };
  };

  const loginUser = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    const user = users.find(
      u => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password
    );
    if (!user) return { success: false, message: 'Incorrect email or password. Please try again.' };
    setCurrentUser(user);
    const rawUD = await AsyncStorage.getItem(KEYS.USER_DATA(user.id));
    setUserData(rawUD ? JSON.parse(rawUD) : EMPTY_USER_DATA);
    await AsyncStorage.setItem(KEYS.CURRENT_USER_ID, user.id);
    return { success: true, message: `Welcome back, ${user.name}! 👋` };
  };

  const logout = async () => {
    if (currentUser) await saveUserData(currentUser.id, userData);
    setCurrentUser(null);
    setUserData(EMPTY_USER_DATA);
    await AsyncStorage.removeItem(KEYS.CURRENT_USER_ID);
  };

  const setRiskProfile = async (profile: RiskProfile) => {
    if (!currentUser) return;
    const updated = { ...currentUser, riskProfile: profile };
    const newUsers = users.map(u => u.id === currentUser.id ? updated : u);
    setCurrentUser(updated);
    setUsers(newUsers);
    await saveUsers(newUsers);
  };

  const updateProfile = async (name: string) => {
    if (!currentUser) return;
    const updated = { ...currentUser, name: name.trim() };
    const newUsers = users.map(u => u.id === currentUser.id ? updated : u);
    setCurrentUser(updated);
    setUsers(newUsers);
    await saveUsers(newUsers);
  };

  // ── Student Actions ─────────────────────────────────────────────────────────
  const addExpense = (expense: Omit<Expense, 'id'>) => {
    const newExp: Expense = { ...expense, id: Date.now().toString() };
    const newTx: Transaction = { id: `${Date.now() + 1}`, type: 'DEBIT', amount: expense.amount, title: expense.title, date: expense.date };
    setUserData(prev => ({
      ...prev,
      expenses: [newExp, ...prev.expenses],
      walletBalance: prev.walletBalance - expense.amount,
      transactions: [newTx, ...prev.transactions],
    }));
  };

  const addInvestment = (investment: Omit<Investment, 'id' | 'currentValue'>) => {
    const newInv: Investment = { ...investment, id: Date.now().toString(), currentValue: investment.amount };
    const newTx: Transaction = { id: `${Date.now() + 1}`, type: 'DEBIT', amount: investment.amount, title: `Invested in ${investment.title}`, date: new Date().toISOString() };
    setUserData(prev => ({
      ...prev,
      investments: [newInv, ...prev.investments],
      walletBalance: prev.walletBalance - investment.amount,
      transactions: [newTx, ...prev.transactions],
    }));
  };

  const addGoal = (goal: Omit<Goal, 'id' | 'savedAmount'>) => {
    const newGoal: Goal = { ...goal, id: Date.now().toString(), savedAmount: 0 };
    setUserData(prev => ({ ...prev, goals: [...prev.goals, newGoal] }));
  };

  const updateGoal = (id: string, amount: number) => {
    const newTx: Transaction = { id: Date.now().toString(), type: 'DEBIT', amount, title: 'Added to Savings Goal', date: new Date().toISOString() };
    setUserData(prev => ({
      ...prev,
      goals: prev.goals.map(g => g.id === id ? { ...g, savedAmount: g.savedAmount + amount } : g),
      walletBalance: prev.walletBalance - amount,
      transactions: [newTx, ...prev.transactions],
    }));
  };

  const addMoneyToWallet = (amount: number) => {
    const newTx: Transaction = { id: Date.now().toString(), type: 'CREDIT', amount, title: 'Money Added to Wallet', date: new Date().toISOString() };
    setUserData(prev => ({
      ...prev,
      walletBalance: prev.walletBalance + amount,
      transactions: [newTx, ...prev.transactions],
    }));
  };

  // ── Authority Actions ───────────────────────────────────────────────────────
  const submitFund = (fund: Omit<Fund, 'id' | 'status' | 'submittedBy' | 'submittedByName' | 'submittedAt'>) => {
    const newFund: Fund = {
      ...fund, id: Date.now().toString(), status: 'PENDING',
      submittedBy: currentUser?.id ?? '',
      submittedByName: currentUser?.name ?? 'Authority',
      submittedAt: new Date().toISOString(),
    };
    const newFunds = [newFund, ...funds];
    setFunds(newFunds);
    saveFunds(newFunds);
  };

  // ── Admin Actions ───────────────────────────────────────────────────────────
  const approveFund = (fundId: string) => {
    const newFunds = funds.map(f =>
      f.id === fundId ? { ...f, status: 'APPROVED' as const, approvedBy: currentUser?.id, resolvedAt: new Date().toISOString() } : f
    );
    setFunds(newFunds);
    saveFunds(newFunds);
  };

  const rejectFund = (fundId: string) => {
    const newFunds = funds.map(f =>
      f.id === fundId ? { ...f, status: 'REJECTED' as const, approvedBy: currentUser?.id, resolvedAt: new Date().toISOString() } : f
    );
    setFunds(newFunds);
    saveFunds(newFunds);
  };

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    AsyncStorage.setItem(KEYS.THEME, next);
  };

  // ── Compose state ───────────────────────────────────────────────────────────
  const appState: AppState = {
    currentUser,
    users,
    funds,
    ...userData,
  };

  return (
    <AppContext.Provider
      value={{
        ...appState,
        theme, isLoaded,
        register, loginUser, logout,
        setRiskProfile, updateProfile,
        addExpense, addInvestment, addGoal, updateGoal, addMoneyToWallet,
        submitFund, approveFund, rejectFund,
        toggleTheme,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

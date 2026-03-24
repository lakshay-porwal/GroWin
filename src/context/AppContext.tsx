import React, { createContext, useState, ReactNode, useEffect, useCallback, useRef } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Updates from 'expo-updates';
import { AppState, AppUser, UserRole, RiskProfile, Expense, Investment, Fund, Goal, Transaction } from '../types';

// ─── App Reloader Helper ───────────────────────────────────────────────────────
const reloadApp = async () => {
  try {
    if (Platform.OS === 'web') {
      window.location.reload();
    } else {
      await Updates.reloadAsync();
    }
  } catch (e) {
    console.warn('Reload not supported', e);
  }
};
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
  lastPLUpdate: string | null; // ISO timestamp of last P&L simulation tick
}

const EMPTY_USER_DATA: UserData = {
  walletBalance: 0,
  expenses: [],
  investments: [],
  goals: [],
  transactions: [],
  lastPLUpdate: null,
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
  lastPLUpdate: string | null;
  // Auth
  register: (name: string, email: string, password: string, role: UserRole) => Promise<{ success: boolean; message: string }>;
  loginUser: (email: string, password: string, role: UserRole) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  setRiskProfile: (profile: RiskProfile) => Promise<void>;
  updateProfile: (name: string) => Promise<void>;
  // Student
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  addInvestment: (investment: Omit<Investment, 'id' | 'currentValue'>) => void;
  addMoneyToInvestment: (id: string, amount: number) => { success: boolean; message: string };
  sellInvestment: (id: string) => void;
  addGoal: (goal: Omit<Goal, 'id' | 'savedAmount'>) => void;
  updateGoal: (id: string, amount: number) => void;
  editGoal: (id: string, updates: Partial<Omit<Goal, 'id'>>) => void;
  removeGoal: (id: string) => void;
  addMoneyToWallet: (amount: number) => void;
  withdrawMoneyFromWallet: (amount: number) => { success: boolean; message: string };
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
  theme: 'dark', isLoaded: false, lastPLUpdate: null,
  register: async () => ({ success: false, message: '' }),
  loginUser: async () => ({ success: false, message: '' }),
  logout: async () => {},
  setRiskProfile: async () => {},
  updateProfile: async () => {},
  addExpense: () => {}, addInvestment: () => {}, addMoneyToInvestment: () => ({ success: false, message: '' }), sellInvestment: () => {}, addGoal: () => {},
  updateGoal: () => {}, editGoal: () => {}, removeGoal: () => {}, addMoneyToWallet: () => {}, withdrawMoneyFromWallet: () => ({ success: false, message: '' }),
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

  // ── Investment P&L simulation (every 3 hours) ────────────────────────
  const THREE_HOURS_MS = 3 * 60 * 60 * 1000; // 10_800_000 ms

  /**
   * Apply a small random P&L fluctuation to all investments.
   * Each investment gains or loses between 0.5% and 2.0%.
   * Risk profile influences direction bias:
   *   HIGH  — slightly bullish bias (+0.3%)
   *   LOW   — slightly defensive (-0.1% floor protects capital)
   *   MEDIUM — neutral
   */
  const applyPLUpdate = useCallback((prevData: UserData, userRisk: string | null): UserData => {
    if (prevData.investments.length === 0) return prevData;
    const bias = userRisk === 'HIGH' ? 0.003 : userRisk === 'LOW' ? -0.001 : 0;
    const updatedInvestments = prevData.investments.map(inv => {
      const delta = (Math.random() * 0.015 + 0.005 + bias); // 0.5%–2.0% base
      const direction = Math.random() > 0.42 ? 1 : -1;      // ~58% chance of gain
      const change = direction * delta;
      const newValue = Math.max(inv.currentValue * (1 + change), inv.amount * 0.75); // floor at 75% of invested
      return { ...inv, currentValue: Math.round(newValue * 100) / 100 };
    });
    return { ...prevData, investments: updatedInvestments, lastPLUpdate: new Date().toISOString() };
  }, []);

  // Run P&L update if stale (on load or user switch) and set up recurring interval
  useEffect(() => {
    if (!isLoaded || !currentUser || currentUser.role !== 'student') return;

    const runUpdate = () => {
      setUserData(prev => applyPLUpdate(prev, currentUser.riskProfile));
    };

    // Check if stale on mount
    const lastUpdate = userData.lastPLUpdate;
    const isStale = !lastUpdate || (Date.now() - new Date(lastUpdate).getTime()) >= THREE_HOURS_MS;
    if (isStale && userData.investments.length > 0) {
      runUpdate();
    }

    // Recurring interval — fires every 3 hours
    const intervalId = setInterval(runUpdate, THREE_HOURS_MS);
    return () => clearInterval(intervalId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, currentUser?.id]);

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
    
    setTimeout(() => reloadApp(), 500);
    return { success: true, message: `Welcome to GroWin, ${newUser.name}! 🎉` };
  };

  const loginUser = async (email: string, password: string, role: UserRole): Promise<{ success: boolean; message: string }> => {
    const user = users.find(
      u => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password
    );
    if (!user) return { success: false, message: 'Incorrect email or password. Please try again.' };
    if (user.role !== role) {
      return { success: false, message: `This account is not registered as a ${role}.` };
    }
    
    setCurrentUser(user);
    const rawUD = await AsyncStorage.getItem(KEYS.USER_DATA(user.id));
    setUserData(rawUD ? JSON.parse(rawUD) : EMPTY_USER_DATA);
    await AsyncStorage.setItem(KEYS.CURRENT_USER_ID, user.id);
    
    setTimeout(() => reloadApp(), 500);
    return { success: true, message: `Welcome back, ${user.name}! 👋` };
  };

  const logout = async () => {
    if (currentUser) await saveUserData(currentUser.id, userData);
    setCurrentUser(null);
    setUserData(EMPTY_USER_DATA);
    await AsyncStorage.removeItem(KEYS.CURRENT_USER_ID);
    
    setTimeout(() => reloadApp(), 500);
  };

  const setRiskProfile = async (profile: RiskProfile) => {
    if (!currentUser) return;
    const updated = { ...currentUser, riskProfile: profile };
    const newUsers = users.map(u => u.id === currentUser.id ? updated : u);
    setCurrentUser(updated);
    setUsers(newUsers);
    await saveUsers(newUsers);
    
    setTimeout(() => reloadApp(), 500);
  };

  const updateProfile = async (name: string) => {
    if (!currentUser) return;
    const updated = { ...currentUser, name: name.trim() };
    const newUsers = users.map(u => u.id === currentUser.id ? updated : u);
    setCurrentUser(updated);
    setUsers(newUsers);
    await saveUsers(newUsers);

    setTimeout(() => reloadApp(), 500);
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

  const addMoneyToInvestment = (id: string, amount: number) => {
    if (userData.walletBalance < amount) {
      return { success: false, message: 'Insufficient Balance' };
    }
    const newTx: Transaction = { id: Date.now().toString(), type: 'DEBIT', amount, title: 'Added Funds to Investment', date: new Date().toISOString() };
    setUserData(prev => ({
      ...prev,
      walletBalance: prev.walletBalance - amount,
      investments: prev.investments.map(i => i.id === id ? { ...i, amount: i.amount + amount, currentValue: i.currentValue + amount } : i),
      transactions: [newTx, ...prev.transactions],
    }));
    return { success: true, message: 'Funds added successfully' };
  };

  const sellInvestment = (id: string) => {
    setUserData(prev => {
      const inv = prev.investments.find(i => i.id === id);
      const saleValue = inv ? inv.currentValue : 0;
      const updates: Partial<typeof prev> = { investments: prev.investments.filter(i => i.id !== id) };
      
      if (saleValue > 0) {
        updates.walletBalance = prev.walletBalance + saleValue;
        const newTx: Transaction = { id: Date.now().toString(), type: 'CREDIT', amount: saleValue, title: `Sold: ${inv!.title}`, date: new Date().toISOString() };
        updates.transactions = [newTx, ...prev.transactions];
      }
      return { ...prev, ...updates };
    });
  };

  const addGoal = (goal: Omit<Goal, 'id' | 'savedAmount'>) => {
    const newGoal: Goal = { ...goal, id: Date.now().toString(), savedAmount: 0 };
    setUserData(prev => ({ ...prev, goals: [...prev.goals, newGoal] }));
  };

  const updateGoal = (id: string, amount: number) => {
    if (userData.walletBalance < amount) return;
    const newTx: Transaction = { id: Date.now().toString(), type: 'DEBIT', amount, title: 'Added to Savings Goal', date: new Date().toISOString() };
    setUserData(prev => ({
      ...prev,
      walletBalance: prev.walletBalance - amount,
      goals: prev.goals.map(g => g.id === id ? { ...g, savedAmount: g.savedAmount + amount } : g),
      transactions: [newTx, ...prev.transactions],
    }));
  };

  const editGoal = (id: string, updates: Partial<Omit<Goal, 'id'>>) => {
    setUserData(prev => ({
      ...prev,
      goals: prev.goals.map(g => g.id === id ? { ...g, ...updates } : g),
    }));
  };

  const removeGoal = (id: string) => {
    setUserData(prev => {
      const goalToRemove = prev.goals.find(g => g.id === id);
      const refundedAmount = goalToRemove ? goalToRemove.savedAmount : 0;
      const updates: Partial<typeof prev> = { goals: prev.goals.filter(g => g.id !== id) };
      
      if (refundedAmount > 0) {
        updates.walletBalance = prev.walletBalance + refundedAmount;
        const refundTx: Transaction = { id: Date.now().toString(), type: 'CREDIT', amount: refundedAmount, title: `Refund: ${goalToRemove!.title}`, date: new Date().toISOString() };
        updates.transactions = [refundTx, ...prev.transactions];
      }
      return { ...prev, ...updates };
    });
  };

  const addMoneyToWallet = (amount: number) => {
    const newTx: Transaction = { id: Date.now().toString(), type: 'CREDIT', amount, title: 'Money Added to Wallet', date: new Date().toISOString() };
    setUserData(prev => ({
      ...prev,
      walletBalance: prev.walletBalance + amount,
      transactions: [newTx, ...prev.transactions],
    }));
  };

  const withdrawMoneyFromWallet = (amount: number): { success: boolean; message: string } => {
    if (amount <= 0) return { success: false, message: 'Enter a valid amount.' };
    let result = { success: false, message: '' };
    setUserData(prev => {
      if (prev.walletBalance < amount) {
        result = { success: false, message: `Insufficient balance. Available: ₹${prev.walletBalance.toLocaleString('en-IN')}` };
        return prev;
      }
      const newTx: Transaction = { id: Date.now().toString(), type: 'DEBIT', amount, title: 'Withdrawal from Wallet', date: new Date().toISOString() };
      result = { success: true, message: 'Withdrawn successfully.' };
      return { ...prev, walletBalance: prev.walletBalance - amount, transactions: [newTx, ...prev.transactions] };
    });
    return result;
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
        lastPLUpdate: userData.lastPLUpdate,
        register, loginUser, logout,
        setRiskProfile, updateProfile,
        addExpense,
        addInvestment,
        addMoneyToInvestment,
        sellInvestment,
        addGoal,
        updateGoal,
        editGoal,
        removeGoal,
        addMoneyToWallet,
        withdrawMoneyFromWallet,
        submitFund, approveFund, rejectFund,
        toggleTheme,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

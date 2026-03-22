import React, { useContext, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  TextInput, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import tw from 'twrnc';
import { AppContext } from '../context/AppContext';
import { Ionicons } from '@expo/vector-icons';
import { getThemeClasses } from '../utils/theme';
import { Header } from '../components/Header';

const QUICK_AMOUNTS = [500, 1000, 2000, 5000];

export const WalletScreen = () => {
  const { walletBalance, transactions, addMoneyToWallet, withdrawMoneyFromWallet, investments, theme } = useContext(AppContext);
  const tc = getThemeClasses(theme);
  const isDark = theme === 'dark';

  const [modalVisible, setModalVisible] = useState(false);
  const [amount, setAmount] = useState('');
  const [withdrawVisible, setWithdrawVisible] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawError, setWithdrawError] = useState('');

  const handleAdd = () => {
    const n = parseFloat(amount);
    if (!isNaN(n) && n > 0) {
      addMoneyToWallet(n);
      setAmount('');
      setModalVisible(false);
    }
  };

  const handleWithdraw = () => {
    const n = parseFloat(withdrawAmount);
    if (isNaN(n) || n <= 0) { setWithdrawError('Enter a valid amount.'); return; }
    const { success, message } = withdrawMoneyFromWallet(n);
    if (success) {
      setWithdrawAmount('');
      setWithdrawError('');
      setWithdrawVisible(false);
    } else {
      setWithdrawError(message);
    }
  };

  const totalInvested = investments.reduce((s, i) => s + i.amount, 0);
  const credits = transactions.filter(t => t.type === 'CREDIT').reduce((s, t) => s + t.amount, 0);
  const debits = transactions.filter(t => t.type === 'DEBIT').reduce((s, t) => s + t.amount, 0);

  return (
    <SafeAreaView style={tw`flex-1 ${tc.backgroundMain}`}>
      <Header title="Wallet" subtitle="Manage your money" />

      <ScrollView style={tw`flex-1`} showsVerticalScrollIndicator={false}>
        {/* Balance card */}
        <View style={tw`mx-5 mt-2 mb-5 bg-emerald-600 rounded-3xl p-6 overflow-hidden`}>
          {/* Background blur circles */}
          <View style={tw`absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/10`} />
          <View style={tw`absolute -left-4 -bottom-6 w-24 h-24 rounded-full bg-white/5`} />

          <Text style={tw`text-emerald-100 text-xs font-semibold uppercase tracking-widest mb-1`}>Available Balance</Text>
          <Text style={tw`text-white text-4xl font-extrabold mb-4`}>₹{walletBalance.toLocaleString()}</Text>

          <View style={tw`flex-row gap-3`}>
            <TouchableOpacity
              style={tw`flex-1 bg-white/20 border border-white/30 flex-row items-center justify-center px-4 py-2.5 rounded-xl`}
              onPress={() => setModalVisible(true)}
            >
              <Ionicons name="add-circle" size={17} color="#fff" />
              <Text style={tw`text-white font-bold ml-1.5`}>Add</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={tw`flex-1 bg-red-500/30 border border-red-300/30 flex-row items-center justify-center px-4 py-2.5 rounded-xl`}
              onPress={() => { setWithdrawError(''); setWithdrawVisible(true); }}
            >
              <Ionicons name="arrow-up-circle" size={17} color="#FCA5A5" />
              <Text style={tw`text-red-200 font-bold ml-1.5`}>Withdraw</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Row */}
        <View style={tw`mx-5 mb-5 flex-row`}>
          {[
            { label: 'Total Invested', val: `₹${totalInvested.toLocaleString()}`, color: 'text-blue-400', bg: 'bg-blue-500/10', icon: 'trending-up' },
            { label: 'Money In', val: `₹${credits.toLocaleString()}`, color: 'text-emerald-500', bg: 'bg-emerald-500/10', icon: 'arrow-down' },
            { label: 'Money Out', val: `₹${debits.toLocaleString()}`, color: 'text-red-500', bg: 'bg-red-500/10', icon: 'arrow-up' },
          ].map((s, i) => (
            <View key={i} style={tw`flex-1 ${tc.backgroundCard} border ${tc.borderMain} rounded-2xl p-3 items-center mx-1`}>
              <View style={tw`${s.bg} w-8 h-8 rounded-full items-center justify-center mb-1`}>
                <Ionicons name={s.icon as any} size={14} color={s.color.replace('text-', '')} />
              </View>
              <Text style={tw`${s.color} font-bold text-xs`}>{s.val}</Text>
              <Text style={tw`${tc.textMuted} text-[10px] mt-0.5 text-center`}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Transactions */}
        <View style={tw`px-5 mb-8`}>
          <Text style={tw`${tc.textMain} font-bold text-base mb-4`}>Transaction History</Text>

          {transactions.length === 0 ? (
            <View style={tw`${tc.backgroundCard} border ${tc.borderMain} rounded-2xl p-8 items-center`}>
              <Ionicons name="receipt-outline" size={44} color={isDark ? '#374151' : '#D1D5DB'} />
              <Text style={tw`${tc.textSecondary} text-sm mt-2`}>No transactions yet</Text>
            </View>
          ) : (
            transactions.map(tx => (
              <View key={tx.id} style={tw`${tc.backgroundCard} border ${tc.borderMain} rounded-2xl p-4 mb-3 flex-row items-center`}>
                <View style={tw`${tx.type === 'CREDIT' ? 'bg-emerald-500/15' : 'bg-red-500/15'} w-11 h-11 rounded-xl items-center justify-center mr-3`}>
                  <Ionicons
                    name={tx.type === 'CREDIT' ? 'arrow-down' : 'arrow-up'}
                    size={18}
                    color={tx.type === 'CREDIT' ? '#10B981' : '#EF4444'}
                  />
                </View>
                <View style={tw`flex-1`}>
                  <Text style={tw`${tc.textMain} font-semibold text-sm`} numberOfLines={1}>{tx.title}</Text>
                  <Text style={tw`${tc.textMuted} text-xs mt-0.5`}>
                    {new Date(tx.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    {' · '}
                    {new Date(tx.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
                <Text style={tw`${tx.type === 'CREDIT' ? 'text-emerald-500' : 'text-red-500'} font-bold text-base`}>
                  {tx.type === 'CREDIT' ? '+' : '-'}₹{tx.amount.toLocaleString()}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Add Money Modal */}
      <Modal animationType="slide" transparent visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={tw`flex-1 justify-end bg-black/60`}>
          <View style={tw`${tc.backgroundCard} rounded-t-3xl border-t ${tc.borderMain} p-6`}>
            <View style={tw`flex-row justify-between items-center mb-6`}>
              <Text style={tw`${tc.textMain} text-xl font-bold`}>Add Money</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close-circle" size={28} color={isDark ? '#4B5563' : '#9CA3AF'} />
              </TouchableOpacity>
            </View>

            <View style={tw`${tc.inputBackground} border ${tc.borderEmeraldTint} rounded-2xl flex-row items-center px-4 py-2 mb-5`}>
              <Text style={tw`text-emerald-500 text-3xl font-bold mr-2`}>₹</Text>
              <TextInput
                style={tw`flex-1 ${tc.inputText} text-3xl font-bold py-3`}
                placeholder="0"
                placeholderTextColor={isDark ? '#4B5563' : '#9CA3AF'}
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
                autoFocus
              />
            </View>

            {/* Quick amounts */}
            <View style={tw`flex-row mb-6`}>
              {QUICK_AMOUNTS.map(v => (
                <TouchableOpacity
                  key={v}
                  style={tw`flex-1 ${tc.backgroundSecondary} border ${tc.borderSecondary} py-2.5 rounded-xl items-center mx-1`}
                  onPress={() => setAmount(v.toString())}
                >
                  <Text style={tw`${tc.textMain} font-medium text-xs`}>+₹{v >= 1000 ? `${v / 1000}K` : v}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={tw`bg-emerald-500 py-4 items-center rounded-2xl shadow-lg shadow-emerald-500/30`}
              onPress={handleAdd}
              activeOpacity={0.8}
            >
              <Text style={tw`text-white font-bold text-base`}>Add to Wallet</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Withdraw Modal */}
      <Modal animationType="slide" transparent visible={withdrawVisible} onRequestClose={() => setWithdrawVisible(false)}>
        <View style={tw`flex-1 justify-end bg-black/60`}>
          <View style={tw`${tc.backgroundCard} rounded-t-3xl border-t ${tc.borderMain} p-6`}>
            <View style={tw`flex-row justify-between items-center mb-6`}>
              <View>
                <Text style={tw`${tc.textMain} text-xl font-bold`}>Withdraw Money</Text>
                <Text style={tw`${tc.textMuted} text-xs mt-0.5`}>Balance: ₹{walletBalance.toLocaleString('en-IN')}</Text>
              </View>
              <TouchableOpacity onPress={() => setWithdrawVisible(false)}>
                <Ionicons name="close-circle" size={28} color={isDark ? '#4B5563' : '#9CA3AF'} />
              </TouchableOpacity>
            </View>

            <View style={tw`bg-red-500/10 border border-red-500/20 rounded-2xl flex-row items-center px-4 py-2 mb-4`}>
              <Text style={tw`text-red-400 text-3xl font-bold mr-2`}>₹</Text>
              <TextInput
                style={tw`flex-1 text-red-400 text-3xl font-bold py-3`}
                placeholder="0"
                placeholderTextColor={isDark ? '#4B5563' : '#9CA3AF'}
                keyboardType="numeric"
                value={withdrawAmount}
                onChangeText={t => { setWithdrawAmount(t); setWithdrawError(''); }}
                autoFocus
              />
            </View>

            {withdrawError ? (
              <View style={tw`flex-row items-center bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-4`}>
                <Ionicons name="warning" size={15} color="#EF4444" />
                <Text style={tw`text-red-400 text-xs font-medium ml-2 flex-1`}>{withdrawError}</Text>
              </View>
            ) : null}

            {/* Quick amounts */}
            <View style={tw`flex-row mb-6`}>
              {[500, 1000, 2000, 5000].map(v => (
                <TouchableOpacity
                  key={v}
                  style={tw`flex-1 ${tc.backgroundSecondary} border ${tc.borderSecondary} py-2.5 rounded-xl items-center mx-1 ${walletBalance < v ? 'opacity-40' : ''}`}
                  onPress={() => { setWithdrawAmount(v.toString()); setWithdrawError(''); }}
                  disabled={walletBalance < v}
                >
                  <Text style={tw`${tc.textMain} font-medium text-xs`}>₹{v >= 1000 ? `${v / 1000}K` : v}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={tw`${!withdrawAmount ? tc.backgroundSecondary : 'bg-red-500'} py-4 items-center rounded-2xl`}
              onPress={handleWithdraw}
              disabled={!withdrawAmount}
              activeOpacity={0.8}
            >
              <Text style={tw`${!withdrawAmount ? tc.textMuted : 'text-white'} font-bold text-base`}>Withdraw</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

import React, { useContext, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Dimensions, Modal, TextInput, KeyboardAvoidingView, Platform, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import tw from 'twrnc';
import { AppContext } from '../context/AppContext';
import { Ionicons } from '@expo/vector-icons';
import { getThemeClasses } from '../utils/theme';
import { Header } from '../components/Header';
import { LineChart } from 'react-native-chart-kit';
import { Investment } from '../types';

const W = Dimensions.get('window').width;

// Mock portfolio sparkline data
const SPARKLINE = [12200, 12800, 12400, 13100, 12900, 13500, 13200, 14000, 13800, 14500, 14200, 15000];

export const DashboardScreen = ({ navigation }: any) => {
  const { currentUser, walletBalance, investments, expenses, transactions, theme, addMoneyToInvestment, sellInvestment } = useContext(AppContext);
  const tc = getThemeClasses(theme);
  const isDark = theme === 'dark';

  const [manageModal, setManageModal] = useState(false);
  const [selectedInv, setSelectedInv] = useState<Investment | null>(null);
  const [addAmount, setAddAmount] = useState('');

  const totalInvested = investments.reduce((s, i) => s + i.amount, 0);
  const totalCurrentValue = investments.reduce((s, i) => s + i.currentValue, 0);
  const totalGain = totalCurrentValue - totalInvested;
  const gainPct = totalInvested > 0 ? ((totalGain / totalInvested) * 100).toFixed(2) : '0.00';
  const isProfit = totalGain >= 0;

  const thisMonthExpenses = expenses.reduce((s, e) => s + e.amount, 0);

  const getAIInsight = () => {
    if (!currentUser?.riskProfile) return "Complete your risk profile to get personalized insights.";
    if (currentUser.riskProfile === 'LOW') return "💡 Safe pick: ₹500/mo in Debt Fund. Capital-protected, 7-9% returns.";
    if (currentUser.riskProfile === 'MEDIUM') return "💡 Balanced pick: ₹1000/mo in Nifty Index Fund. Steady 10-12% p.a.";
    return "💡 Power move: Allocate 20% of balance to Small-Cap MF for 15-18% potential.";
  };

  const handleAddFunds = () => {
    if (!selectedInv || !addAmount) return;
    const n = parseFloat(addAmount);
    if (!isNaN(n) && n > 0) {
      const res = addMoneyToInvestment(selectedInv.id, n);
      if (res.success) {
        setAddAmount('');
        setManageModal(false);
        if (Platform.OS === 'web') window.alert(`✅ Added ₹${n.toLocaleString()} to ${selectedInv.title}`);
        else Alert.alert('✅ Success', `Added ₹${n.toLocaleString()} to ${selectedInv.title}`);
      } else {
        if (Platform.OS === 'web') window.alert(res.message);
        else Alert.alert('Error', res.message);
      }
    }
  };

  const handleSell = () => {
    if (!selectedInv) return;
    const executeSell = () => {
      sellInvestment(selectedInv.id);
      setManageModal(false);
    };

    if (Platform.OS === 'web') {
      if (window.confirm(`Sell ${selectedInv.title} for ₹${selectedInv.currentValue.toLocaleString()}?`)) {
        executeSell();
      }
    } else {
      Alert.alert(
        "Sell Investment",
        `Sell ${selectedInv.title} for ₹${selectedInv.currentValue.toLocaleString()}?\nFunds will be returned to your wallet.`,
        [
          { text: "Cancel", style: "cancel" },
          { text: "Sell", style: "destructive", onPress: executeSell }
        ]
      );
    }
  };

  const chartConfig = {
    backgroundGradientFrom: isDark ? '#111827' : '#ffffff',
    backgroundGradientTo: isDark ? '#111827' : '#ffffff',
    backgroundGradientFromOpacity: 0,
    backgroundGradientToOpacity: 0,
    color: () => (isProfit ? '#10B981' : '#EF4444'),
    strokeWidth: 2.5,
    propsForDots: { r: '0' },
    propsForBackgroundLines: { stroke: 'transparent' },
    fillShadowGradient: isProfit ? '#10B981' : '#EF4444',
    fillShadowGradientOpacity: 0.15,
  };

  const quickActions = [
    { label: 'Invest', icon: 'trending-up', color: '#10B981', bg: 'bg-emerald-500/15', route: 'Invest' },
    { label: 'Wallet', icon: 'wallet', color: '#3B82F6', bg: 'bg-blue-500/15', route: 'Wallet' },
    { label: 'Expenses', icon: 'pie-chart', color: '#F59E0B', bg: 'bg-amber-500/15', route: 'Expenses' },
    { label: 'Goals', icon: 'flag', color: '#8B5CF6', bg: 'bg-violet-500/15', route: 'Goals' },
  ];

  return (
    <SafeAreaView style={tw`flex-1 ${tc.backgroundMain}`}>
      <Header title="GroWin" showBack={false} />

      <ScrollView showsVerticalScrollIndicator={false} style={tw`flex-1`}>
        {/* Welcome Row */}
        <View style={tw`px-5 pt-2 pb-4`}>
          <Text style={tw`${tc.textSecondary} text-xs font-medium`}>Good day,</Text>
          <Text style={tw`text-xl font-extrabold ${tc.textMain} mt-0.5`}>{currentUser?.name} 👋</Text>
        </View>

        {/* Portfolio Card */}
        <View style={tw`mx-5 mb-5 bg-${isDark ? 'gray-900' : 'white'} rounded-3xl border ${tc.borderMain} overflow-hidden`}>
          <View style={tw`px-5 pt-5 pb-2`}>
            <Text style={tw`${tc.textSecondary} text-xs font-semibold uppercase tracking-widest`}>Total Portfolio</Text>
            <Text style={tw`text-4xl font-extrabold ${tc.textMain} mt-1`}>
              ₹{walletBalance.toLocaleString()}
            </Text>
            <View style={tw`flex-row items-center mt-2`}>
              <View style={tw`flex-row items-center ${isProfit ? 'bg-emerald-500/15' : 'bg-red-500/15'} px-2.5 py-1 rounded-full`}>
                <Ionicons
                  name={isProfit ? 'trending-up' : 'trending-down'}
                  size={13}
                  color={isProfit ? '#10B981' : '#EF4444'}
                />
                <Text style={tw`${isProfit ? 'text-emerald-500' : 'text-red-500'} text-xs font-bold ml-1`}>
                  {isProfit ? '+' : ''}₹{Math.abs(totalGain).toLocaleString()} ({gainPct}%)
                </Text>
              </View>
              <Text style={tw`${tc.textMuted} text-xs ml-2`}>All time</Text>
            </View>
          </View>

          {/* Sparkline Chart */}
          <LineChart
            data={{ labels: [], datasets: [{ data: SPARKLINE, strokeWidth: 2.5 }] }}
            width={W - 40}
            height={90}
            chartConfig={chartConfig}
            bezier
            withHorizontalLabels={false}
            withVerticalLabels={false}
            withInnerLines={false}
            withOuterLines={false}
            style={{ paddingRight: 0, paddingLeft: 0 }}
          />

          {/* Stats Row */}
          <View style={tw`flex-row border-t ${tc.borderMain}`}>
            {[
              { label: 'Invested', value: `₹${totalInvested.toLocaleString()}`, color: 'text-blue-400' },
              { label: 'Gain/Loss', value: `${isProfit ? '+' : ''}₹${Math.abs(totalGain).toLocaleString()}`, color: isProfit ? 'text-emerald-500' : 'text-red-500' },
              { label: 'Spent', value: `₹${thisMonthExpenses.toLocaleString()}`, color: 'text-amber-400' },
            ].map((s, i) => (
              <View key={i} style={tw`flex-1 p-4 items-center ${i < 2 ? `border-r ${tc.borderMain}` : ''}`}>
                <Text style={tw`${tc.textMuted} text-[10px] uppercase tracking-wider mb-1`}>{s.label}</Text>
                <Text style={tw`${s.color} font-bold text-sm`}>{s.value}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={tw`px-5 mb-5`}>
          <Text style={tw`${tc.textSecondary} text-xs font-semibold uppercase tracking-widest mb-3`}>Quick Actions</Text>
          <View style={tw`flex-row justify-between`}>
            {quickActions.map(a => (
              <TouchableOpacity
                key={a.label}
                style={tw`flex-1 mx-1 items-center ${tc.backgroundCard} border ${tc.borderMain} rounded-2xl py-3.5 px-1`}
                onPress={() => navigation.navigate(a.route)}
                activeOpacity={0.75}
              >
                <View style={tw`${a.bg} w-10 h-10 rounded-full items-center justify-center mb-2`}>
                  <Ionicons name={a.icon as any} size={20} color={a.color} />
                </View>
                <Text style={tw`${tc.textMain} font-semibold text-xs`}>{a.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* AI Insight Banner */}
        <TouchableOpacity
          style={tw`mx-5 mb-5 bg-emerald-500/10 border border-emerald-500/25 rounded-2xl p-4 flex-row items-center`}
          onPress={() => navigation.navigate('ChatBot')}
          activeOpacity={0.8}
        >
          <View style={tw`bg-emerald-500 w-10 h-10 rounded-full items-center justify-center mr-3`}>
            <Ionicons name="sparkles" size={18} color="#fff" />
          </View>
          <View style={tw`flex-1`}>
            <Text style={tw`text-emerald-500 font-bold text-xs uppercase tracking-wider mb-0.5`}>AI Advisor</Text>
            <Text style={tw`${tc.textMain} text-sm font-medium leading-5`}>{getAIInsight()}</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#10B981" />
        </TouchableOpacity>

        {/* Holdings */}
        {investments.length > 0 && (
          <View style={tw`px-5 mb-5`}>
            <View style={tw`flex-row justify-between items-center mb-3`}>
              <Text style={tw`${tc.textMain} font-bold text-base`}>My Holdings</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Invest')}>
                <Text style={tw`text-emerald-500 text-xs font-semibold`}>+ Add more</Text>
              </TouchableOpacity>
            </View>
            {investments.map(inv => {
              const gain = inv.currentValue - inv.amount;
              const pct = ((gain / inv.amount) * 100).toFixed(1);
              const positive = gain >= 0;
              return (
                <TouchableOpacity 
                  key={inv.id} 
                  style={tw`${tc.backgroundCard} border ${tc.borderMain} rounded-2xl p-4 mb-3 flex-row items-center`}
                  activeOpacity={0.7}
                  onPress={() => { setSelectedInv(inv); setManageModal(true); }}
                >
                  <View style={tw`bg-emerald-500/15 w-11 h-11 rounded-xl items-center justify-center mr-3`}>
                    <Ionicons name={inv.type === 'SIP' ? 'calendar' : inv.type === 'ETF' ? 'bar-chart' : 'briefcase'} size={20} color="#10B981" />
                  </View>
                  <View style={tw`flex-1`}>
                    <Text style={tw`${tc.textMain} font-semibold text-sm`} numberOfLines={1}>{inv.title}</Text>
                    <Text style={tw`${tc.textMuted} text-xs mt-0.5`}>{inv.type} · {inv.riskLevel}</Text>
                  </View>
                  <View style={tw`items-end`}>
                    <Text style={tw`${tc.textMain} font-bold text-sm`}>₹{inv.currentValue.toLocaleString()}</Text>
                    <Text style={tw`${positive ? 'text-emerald-500' : 'text-red-500'} text-xs font-semibold mt-0.5`}>
                      {positive ? '+' : ''}{pct}%
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Recent Transactions */}
        <View style={tw`px-5 mb-8`}>
          <View style={tw`flex-row justify-between items-center mb-3`}>
            <Text style={tw`${tc.textMain} font-bold text-base`}>Recent Transactions</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Wallet')}>
              <Text style={tw`text-emerald-500 text-xs font-semibold`}>View All</Text>
            </TouchableOpacity>
          </View>
          {transactions.length === 0 ? (
            <View style={tw`${tc.backgroundCard} border ${tc.borderMain} p-6 rounded-2xl items-center`}>
              <Text style={tw`${tc.textSecondary} text-sm`}>No transactions yet</Text>
            </View>
          ) : (
            transactions.slice(0, 4).map(tx => (
              <View key={tx.id} style={tw`flex-row items-center py-3 border-b ${tc.borderMain} last:border-0`}>
                <View style={tw`${tx.type === 'CREDIT' ? 'bg-emerald-500/15' : 'bg-red-500/15'} w-10 h-10 rounded-full items-center justify-center mr-3`}>
                  <Ionicons name={tx.type === 'CREDIT' ? 'arrow-down' : 'arrow-up'} size={16} color={tx.type === 'CREDIT' ? '#10B981' : '#EF4444'} />
                </View>
                <View style={tw`flex-1`}>
                  <Text style={tw`${tc.textMain} font-medium text-sm`} numberOfLines={1}>{tx.title}</Text>
                  <Text style={tw`${tc.textMuted} text-xs mt-0.5`}>{new Date(tx.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</Text>
                </View>
                <Text style={tw`${tx.type === 'CREDIT' ? 'text-emerald-500' : 'text-red-500'} font-bold text-sm`}>
                  {tx.type === 'CREDIT' ? '+' : '-'}₹{tx.amount.toLocaleString()}
                </Text>
              </View>
            ))
          )}
        </View>
        {/* Manage Investment Modal */}
        <Modal animationType="slide" transparent visible={manageModal} onRequestClose={() => setManageModal(false)}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={tw`flex-1 justify-end bg-black/60`}>
            {selectedInv && (() => {
              const gain = selectedInv.currentValue - selectedInv.amount;
              const isProfit = gain >= 0;
              const pct = ((gain / selectedInv.amount) * 100).toFixed(2);
              
              return (
                <View style={tw`${tc.backgroundCard} rounded-t-3xl border-t ${tc.borderMain} p-6`}>
                  <View style={tw`flex-row justify-between items-start mb-5`}>
                    <View style={tw`flex-1 mr-3`}>
                      <Text style={tw`${tc.textMuted} text-xs uppercase tracking-widest mb-1`}>Manage Asset</Text>
                      <Text style={tw`${tc.textMain} text-xl font-bold`}>{selectedInv.title}</Text>
                      <Text style={tw`${tc.textSecondary} text-sm mt-0.5`}>{selectedInv.type} · {selectedInv.riskLevel} Risk</Text>
                    </View>
                    <TouchableOpacity onPress={() => setManageModal(false)}>
                      <Ionicons name="close-circle" size={28} color={isDark ? '#4B5563' : '#9CA3AF'} />
                    </TouchableOpacity>
                  </View>

                  <View style={tw`flex-row pb-4 border-b ${tc.borderMain} mb-5`}>
                    <View style={tw`flex-1 items-start`}>
                      <Text style={tw`${tc.textMuted} text-xs mb-1`}>Current Value</Text>
                      <Text style={tw`${tc.textMain} font-bold text-lg`}>₹{selectedInv.currentValue.toLocaleString()}</Text>
                      <Text style={tw`${isProfit ? 'text-emerald-500' : 'text-red-500'} text-xs font-bold mt-1`}>
                        {isProfit ? '+' : ''}₹{gain.toLocaleString()} ({isProfit ? '+' : ''}{pct}%)
                      </Text>
                    </View>
                    <View style={tw`flex-1 items-end`}>
                      <Text style={tw`${tc.textMuted} text-xs mb-1`}>Invested</Text>
                      <Text style={tw`${tc.textSecondary} font-bold text-lg`}>₹{selectedInv.amount.toLocaleString()}</Text>
                    </View>
                  </View>

                  <Text style={tw`${tc.textSecondary} text-xs font-semibold uppercase tracking-wider mb-2`}>Add Funds</Text>
                  <View style={tw`${tc.inputBackground} border ${tc.borderMain} rounded-xl flex-row items-center px-4 mb-4`}>
                    <Text style={tw`text-emerald-500 text-2xl font-bold mr-2`}>₹</Text>
                    <TextInput
                      style={tw`flex-1 ${tc.inputText} text-2xl font-bold py-3`}
                      placeholder="0"
                      placeholderTextColor={isDark ? '#4B5563' : '#9CA3AF'}
                      keyboardType="numeric"
                      value={addAmount}
                      onChangeText={setAddAmount}
                    />
                  </View>

                  <TouchableOpacity
                    style={tw`${!addAmount ? tc.backgroundSecondary : 'bg-emerald-500'} py-4 rounded-xl items-center mb-4`}
                    onPress={handleAddFunds}
                    disabled={!addAmount}
                  >
                    <Text style={tw`${!addAmount ? tc.textMuted : 'text-white'} font-bold text-base`}>Invest More</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={tw`bg-red-500/10 border border-red-500/30 py-4 rounded-xl items-center`}
                    onPress={handleSell}
                  >
                    <Text style={tw`text-red-500 font-bold text-sm`}>Sell Entire Holding</Text>
                  </TouchableOpacity>
                </View>
              );
            })()}
          </KeyboardAvoidingView>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
};

import React, { useState, useContext } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  TextInput, Modal, Dimensions, KeyboardAvoidingView, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import tw from 'twrnc';
import { AppContext } from '../context/AppContext';
import { Ionicons } from '@expo/vector-icons';
import { getThemeClasses } from '../utils/theme';
import { Header } from '../components/Header';
import { PieChart } from 'react-native-chart-kit';

const W = Dimensions.get('window').width;

const CATEGORIES = ['Food', 'Travel', 'Shopping', 'Subscriptions', 'Learning', 'Others'];
const CATEGORY_COLORS: Record<string, string> = {
  Food: '#F59E0B',
  Travel: '#3B82F6',
  Shopping: '#EC4899',
  Subscriptions: '#8B5CF6',
  Learning: '#06B6D4',
  Others: '#9CA3AF',
};
const CAT_ICONS: Record<string, string> = {
  Food: 'restaurant',
  Travel: 'airplane',
  Shopping: 'cart',
  Subscriptions: 'play-circle',
  Learning: 'book',
  Others: 'receipt',
};

export const ExpenseScreen = () => {
  const { expenses, addExpense, walletBalance, theme } = useContext(AppContext);
  const tc = getThemeClasses(theme);
  const isDark = theme === 'dark';

  const [modalVisible, setModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<'ALL' | 'MONTH' | 'WEEK'>('MONTH');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);

  const filteredExpenses = expenses.filter(e => {
    if (activeTab === 'ALL') return true;
    const expDate = new Date(e.date);
    const now = new Date();
    if (activeTab === 'MONTH') {
      return expDate.getMonth() === now.getMonth() && expDate.getFullYear() === now.getFullYear();
    }
    if (activeTab === 'WEEK') {
      const msInWeek = 7 * 24 * 60 * 60 * 1000;
      return (now.getTime() - expDate.getTime()) <= msInWeek;
    }
    return true;
  });

  const total = filteredExpenses.reduce((s, e) => s + e.amount, 0);
  const totalAllTime = expenses.reduce((s, e) => s + e.amount, 0);
  const budget = walletBalance + totalAllTime;
  const budgetUsedPct = budget > 0 ? Math.min((total / budget) * 100, 100) : 0;

  const handleAdd = () => {
    const num = parseFloat(amount);
    if (!isNaN(num) && num > 0 && title.trim()) {
      addExpense({ title, amount: num, category, date: new Date().toISOString() });
      setTitle(''); setAmount(''); setCategory(CATEGORIES[0]);
      setModalVisible(false);
    }
  };

  const chartData = CATEGORIES.map(cat => ({
    name: cat,
    population: filteredExpenses.filter(e => e.category === cat).reduce((s, e) => s + e.amount, 0),
    color: CATEGORY_COLORS[cat],
    legendFontColor: isDark ? '#9CA3AF' : '#6B7280',
    legendFontSize: 11,
  })).filter(d => d.population > 0);

  return (
    <SafeAreaView style={tw`flex-1 ${tc.backgroundMain}`}>
      <Header title="Expenses" subtitle="Track every rupee" showBack={false} />

      {/* Time Filter Tabs */}
      <View style={tw`flex-row px-5 mb-3 mt-1`}>
        {(['ALL', 'MONTH', 'WEEK'] as const).map(tab => (
          <TouchableOpacity
            key={tab}
            style={tw`mr-2 px-4 py-2 rounded-full border ${activeTab === tab ? 'border-emerald-500 bg-emerald-500/15' : `border-transparent ${tc.backgroundSecondary}`}`}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={tw`font-bold text-xs ${activeTab === tab ? 'text-emerald-500' : tc.textMuted}`}>
              {tab === 'ALL' ? 'All Time' : tab === 'MONTH' ? 'This Month' : 'This Week'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={tw`flex-1`} showsVerticalScrollIndicator={false}>
        {/* Summary Card */}
        <View style={tw`mx-5 mt-2 mb-4 ${tc.backgroundCard} border ${tc.borderMain} rounded-3xl overflow-hidden`}>
          <View style={tw`px-5 pt-5 pb-4`}>
            <View style={tw`flex-row justify-between items-start mb-4`}>
              <View>
                <Text style={tw`${tc.textMuted} text-xs uppercase tracking-wider`}>Total Spent</Text>
                <Text style={tw`text-3xl font-extrabold text-red-500 mt-1`}>₹{total.toLocaleString()}</Text>
              </View>
              <TouchableOpacity
                style={tw`bg-emerald-500 flex-row items-center px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-500/30`}
                onPress={() => setModalVisible(true)}
              >
                <Ionicons name="add" size={16} color="#fff" />
                <Text style={tw`text-white font-bold text-xs ml-1`}>Add</Text>
              </TouchableOpacity>
            </View>

            {/* Budget bar */}
            <View>
              <View style={tw`flex-row justify-between mb-1.5`}>
                <Text style={tw`${tc.textMuted} text-xs`}>Budget usage</Text>
                <Text style={tw`${budgetUsedPct > 80 ? 'text-red-500' : 'text-emerald-500'} text-xs font-bold`}>
                  {budgetUsedPct.toFixed(0)}%
                </Text>
              </View>
              <View style={tw`h-2 ${tc.backgroundSecondary} rounded-full overflow-hidden`}>
                <View
                  style={[
                    tw`h-full rounded-full`,
                    { width: `${budgetUsedPct}%`, backgroundColor: budgetUsedPct > 80 ? '#EF4444' : '#10B981' },
                  ]}
                />
              </View>
            </View>
          </View>

          {/* Pie Chart */}
          {chartData.length > 0 ? (
            <PieChart
              data={chartData}
              width={W - 40}
              height={175}
              chartConfig={{ color: () => '#10B981' }}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="10"
              center={[5, 0]}
              absolute
            />
          ) : (
            <View style={tw`items-center py-8`}>
              <Ionicons name="pie-chart-outline" size={44} color={isDark ? '#374151' : '#D1D5DB'} />
              <Text style={tw`${tc.textMuted} text-sm mt-2`}>No expenses yet</Text>
            </View>
          )}

          {/* Category breakdown */}
          {chartData.length > 0 && (
            <View style={tw`flex-row flex-wrap px-5 pb-4`}>
              {chartData.map(d => (
                <View key={d.name} style={tw`flex-row items-center mr-4 mb-2`}>
                  <View style={[tw`w-2.5 h-2.5 rounded-full mr-1.5`, { backgroundColor: d.color }]} />
                  <Text style={tw`${tc.textSecondary} text-xs`}>{d.name} ₹{d.population.toLocaleString()}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Expense List */}
        <View style={tw`px-5 mb-8`}>
          <Text style={tw`${tc.textMain} font-bold text-base mb-3`}>
            {activeTab === 'ALL' ? 'All' : activeTab === 'MONTH' ? 'Monthly' : 'Weekly'} Expenses <Text style={tw`${tc.textMuted} font-normal text-sm`}>({filteredExpenses.length})</Text>
          </Text>

          {filteredExpenses.length === 0 ? (
            <View style={tw`${tc.backgroundCard} border ${tc.borderMain} rounded-2xl p-8 items-center`}>
              <Text style={tw`text-3xl mb-2`}>💸</Text>
              <Text style={tw`${tc.textSecondary} text-sm`}>No expenses recorded yet.</Text>
            </View>
          ) : (
            filteredExpenses.slice().reverse().map(exp => (
              <View key={exp.id} style={tw`${tc.backgroundCard} border ${tc.borderMain} rounded-2xl p-4 mb-3 flex-row items-center`}>
                <View style={[tw`w-11 h-11 rounded-xl items-center justify-center mr-3`, { backgroundColor: CATEGORY_COLORS[exp.category] + '22' }]}>
                  <Ionicons name={CAT_ICONS[exp.category] as any} size={20} color={CATEGORY_COLORS[exp.category]} />
                </View>
                <View style={tw`flex-1`}>
                  <Text style={tw`${tc.textMain} font-semibold text-sm`} numberOfLines={1}>{exp.title}</Text>
                  <Text style={tw`${tc.textMuted} text-xs mt-0.5`}>
                    {exp.category} · {new Date(exp.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </Text>
                </View>
                <Text style={tw`text-red-500 font-bold text-base`}>-₹{exp.amount.toLocaleString()}</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Add Expense Modal */}
      <Modal animationType="slide" transparent visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={tw`flex-1 justify-end bg-black/60`}>
          <View style={tw`${tc.backgroundCard} rounded-t-3xl border-t ${tc.borderMain} max-h-[85%]`}>
            <ScrollView contentContainerStyle={tw`p-6`} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <View style={tw`flex-row justify-between items-center mb-6`}>
                <Text style={tw`${tc.textMain} text-xl font-bold`}>Add Expense</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Ionicons name="close-circle" size={28} color={isDark ? '#4B5563' : '#9CA3AF'} />
                </TouchableOpacity>
              </View>

              {/* Amount */}
              <View style={tw`${tc.inputBackground} border ${tc.borderMain} rounded-2xl flex-row items-center px-4 py-2 mb-5`}>
                <Text style={tw`text-red-500 text-3xl font-bold mr-2`}>₹</Text>
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

              {/* Title */}
              <View style={tw`${tc.inputBackground} border ${tc.borderMain} rounded-xl flex-row items-center px-4 mb-5`}>
                <Ionicons name="pencil-outline" size={18} color={isDark ? '#6B7280' : '#9CA3AF'} style={tw`mr-3`} />
                <TextInput
                  style={tw`flex-1 ${tc.inputText} text-base py-4`}
                  placeholder="What was this for?"
                  placeholderTextColor={isDark ? '#4B5563' : '#9CA3AF'}
                  value={title}
                  onChangeText={setTitle}
                />
              </View>

              {/* Category */}
              <Text style={tw`${tc.textSecondary} text-xs font-semibold uppercase tracking-wider mb-3`}>Category</Text>
              <View style={tw`flex-row flex-wrap mb-6`}>
                {CATEGORIES.map(cat => {
                  const active = category === cat;
                  return (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        tw`flex-row items-center px-3 py-2.5 rounded-xl border mr-2 mb-2`,
                        active
                          ? { backgroundColor: CATEGORY_COLORS[cat] + '22', borderColor: CATEGORY_COLORS[cat] }
                          : tw`${tc.backgroundSecondary} border-transparent`,
                      ]}
                      onPress={() => setCategory(cat)}
                    >
                      <Ionicons name={CAT_ICONS[cat] as any} size={14} color={active ? CATEGORY_COLORS[cat] : (isDark ? '#6B7280' : '#9CA3AF')} style={tw`mr-1.5`} />
                      <Text style={[tw`font-medium text-xs`, { color: active ? CATEGORY_COLORS[cat] : (isDark ? '#9CA3AF' : '#6B7280') }]}>{cat}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <TouchableOpacity
                style={tw`${!amount || !title ? tc.backgroundSecondary : 'bg-emerald-500'} py-4 items-center rounded-2xl`}
                onPress={handleAdd}
                disabled={!amount || !title}
              >
                <Text style={tw`${!amount || !title ? tc.textMuted : 'text-white'} font-bold text-base`}>Save Expense</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

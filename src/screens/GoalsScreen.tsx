import React, { useState, useContext } from 'react';
import {
  View, Text, ScrollView, SafeAreaView, TouchableOpacity,
  TextInput, Modal, Alert, Platform
} from 'react-native';
import tw from 'twrnc';
import { AppContext } from '../context/AppContext';
import { Ionicons } from '@expo/vector-icons';
import { Goal } from '../types';
import { getThemeClasses } from '../utils/theme';
import { Header } from '../components/Header';

const GOAL_EMOJIS = ['🎯', '💻', '✈️', '🏠', '🎓', '🚗', '📱', '💎'];

export const GoalsScreen = () => {
  const { goals, addGoal, updateGoal, walletBalance, theme } = useContext(AppContext);
  const tc = getThemeClasses(theme);
  const isDark = theme === 'dark';

  const [addModal, setAddModal] = useState(false);
  const [fundModal, setFundModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [title, setTitle] = useState('');
  const [target, setTarget] = useState('');
  const [emoji, setEmoji] = useState(GOAL_EMOJIS[0]);
  const [fundAmount, setFundAmount] = useState('');

  const totalSaved = goals.reduce((s, g) => s + g.savedAmount, 0);
  const totalTarget = goals.reduce((s, g) => s + g.targetAmount, 0);

  const handleCreate = () => {
    const n = parseFloat(target);
    if (!isNaN(n) && n > 0 && title.trim()) {
      addGoal({ title: `${emoji} ${title}`, targetAmount: n });
      setTitle(''); setTarget(''); setEmoji(GOAL_EMOJIS[0]);
      setAddModal(false);
    }
  };

  const handleFund = () => {
    const n = parseFloat(fundAmount);
    if (!isNaN(n) && n > 0 && selectedGoal) {
      if (walletBalance >= n) {
        updateGoal(selectedGoal.id, n);
        setFundAmount('');
        setFundModal(false);
        if (Platform.OS === 'web') window.alert(`✅ Funded! ₹${n.toLocaleString()} added to ${selectedGoal.title}`);
        else Alert.alert('✅ Funded!', `₹${n.toLocaleString()} added to ${selectedGoal.title}`);
      } else {
        if (Platform.OS === 'web') window.alert('Insufficient Balance. Add money to your wallet first.');
        else Alert.alert('Insufficient Balance', 'Add money to your wallet first.');
      }
    }
  };

  return (
    <SafeAreaView style={tw`flex-1 ${tc.backgroundMain}`}>
      <Header title="Goals" subtitle="Save for what matters most" />

      <ScrollView style={tw`flex-1`} showsVerticalScrollIndicator={false}>
        {/* Summary card */}
        <View style={tw`mx-5 mt-2 mb-5 ${tc.backgroundCard} border ${tc.borderMain} rounded-3xl p-5`}>
          <View style={tw`flex-row justify-between items-center mb-4`}>
            <View>
              <Text style={tw`${tc.textMuted} text-xs uppercase tracking-wider`}>Total Saved</Text>
              <Text style={tw`text-3xl font-extrabold text-emerald-500 mt-1`}>₹{totalSaved.toLocaleString()}</Text>
              <Text style={tw`${tc.textMuted} text-xs mt-0.5`}>of ₹{totalTarget.toLocaleString()} target</Text>
            </View>
            <TouchableOpacity
              style={tw`bg-emerald-500 px-4 py-2.5 rounded-xl flex-row items-center shadow-lg shadow-emerald-500/30`}
              onPress={() => setAddModal(true)}
            >
              <Ionicons name="add" size={16} color="#fff" />
              <Text style={tw`text-white font-bold text-xs ml-1`}>New Goal</Text>
            </TouchableOpacity>
          </View>

          {totalTarget > 0 && (
            <View>
              <View style={tw`h-2.5 ${tc.backgroundSecondary} rounded-full overflow-hidden`}>
                <View
                  style={[tw`h-full rounded-full bg-emerald-500`, { width: `${Math.min((totalSaved / totalTarget) * 100, 100)}%` }]}
                />
              </View>
              <Text style={tw`${tc.textMuted} text-xs mt-1.5 text-right`}>
                {((totalSaved / totalTarget) * 100).toFixed(0)}% of total goals funded
              </Text>
            </View>
          )}
        </View>

        {/* Goals list */}
        <View style={tw`px-5`}>
          {goals.length === 0 ? (
            <View style={tw`${tc.backgroundCard} border ${tc.borderMain} rounded-3xl p-10 items-center`}>
              <Text style={tw`text-5xl mb-3`}>🎯</Text>
              <Text style={tw`${tc.textMain} font-bold text-lg mb-1`}>No Goals Yet</Text>
              <Text style={tw`${tc.textSecondary} text-sm text-center mb-5`}>Set a financial goal and start saving today!</Text>
              <TouchableOpacity style={tw`bg-emerald-500 px-6 py-3 rounded-2xl`} onPress={() => setAddModal(true)}>
                <Text style={tw`text-white font-bold`}>Create First Goal</Text>
              </TouchableOpacity>
            </View>
          ) : (
            goals.map(g => {
              const pct = Math.min((g.savedAmount / g.targetAmount) * 100, 100);
              const done = pct >= 100;
              const remaining = g.targetAmount - g.savedAmount;
              return (
                <View
                  key={g.id}
                  style={tw`${tc.backgroundCard} border ${done ? 'border-emerald-500/50' : tc.borderMain} rounded-2xl p-5 mb-4`}
                >
                  <View style={tw`flex-row items-start justify-between mb-3`}>
                    <View style={tw`flex-1`}>
                      <Text style={tw`${tc.textMain} font-bold text-base`}>{g.title}</Text>
                      <View style={tw`flex-row items-center mt-1`}>
                        <Text style={tw`text-emerald-500 font-semibold text-sm`}>₹{g.savedAmount.toLocaleString()}</Text>
                        <Text style={tw`${tc.textMuted} text-sm`}> / ₹{g.targetAmount.toLocaleString()}</Text>
                      </View>
                    </View>
                    {done ? (
                      <View style={tw`bg-amber-500/15 border border-amber-500/30 px-2.5 py-1 rounded-full`}>
                        <Text style={tw`text-amber-400 text-xs font-bold`}>🏆 Done!</Text>
                      </View>
                    ) : (
                      <View style={tw`bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-full`}>
                        <Text style={tw`text-blue-400 text-xs font-bold`}>{pct.toFixed(0)}%</Text>
                      </View>
                    )}
                  </View>

                  {/* Progress */}
                  <View style={tw`h-2 ${tc.backgroundSecondary} rounded-full overflow-hidden mb-2`}>
                    <View style={[tw`h-full rounded-full`, { width: `${pct}%`, backgroundColor: done ? '#F59E0B' : '#10B981' }]} />
                  </View>
                  {!done && (
                    <Text style={tw`${tc.textMuted} text-xs mb-3`}>₹{remaining.toLocaleString()} remaining</Text>
                  )}

                  {!done ? (
                    <TouchableOpacity
                      style={tw`${tc.backgroundSecondary} border ${tc.borderSecondary} py-2.5 rounded-xl flex-row items-center justify-center`}
                      onPress={() => { setSelectedGoal(g); setFundModal(true); }}
                    >
                      <Ionicons name="add-circle-outline" size={16} color="#10B981" />
                      <Text style={tw`text-emerald-500 font-bold text-sm ml-2`}>Add Funds</Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={tw`bg-emerald-500/10 border border-emerald-500/20 py-2.5 rounded-xl flex-row items-center justify-center`}>
                      <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                      <Text style={tw`text-emerald-500 font-bold text-sm ml-2`}>Goal Completed! 🎉</Text>
                    </View>
                  )}
                </View>
              );
            })
          )}
        </View>
        <View style={tw`h-10`} />
      </ScrollView>

      {/* Create Goal Modal */}
      <Modal animationType="slide" transparent visible={addModal} onRequestClose={() => setAddModal(false)}>
        <View style={tw`flex-1 justify-end bg-black/60`}>
          <View style={tw`${tc.backgroundCard} rounded-t-3xl border-t ${tc.borderMain} p-6`}>
            <View style={tw`flex-row justify-between items-center mb-5`}>
              <Text style={tw`${tc.textMain} text-xl font-bold`}>🎯 New Goal</Text>
              <TouchableOpacity onPress={() => setAddModal(false)}>
                <Ionicons name="close-circle" size={28} color={isDark ? '#4B5563' : '#9CA3AF'} />
              </TouchableOpacity>
            </View>

            {/* Emoji selector */}
            <Text style={tw`${tc.textSecondary} text-xs font-semibold uppercase tracking-wider mb-2`}>Pick an Icon</Text>
            <View style={tw`flex-row flex-wrap mb-4`}>
              {GOAL_EMOJIS.map(e => (
                <TouchableOpacity
                  key={e}
                  style={tw`w-11 h-11 items-center justify-center rounded-xl mr-2 mb-2 ${emoji === e ? 'bg-emerald-500/20 border border-emerald-500' : `${tc.backgroundSecondary}`}`}
                  onPress={() => setEmoji(e)}
                >
                  <Text style={tw`text-xl`}>{e}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Title */}
            <View style={tw`${tc.inputBackground} border ${tc.borderMain} rounded-xl px-4 mb-4`}>
              <TextInput
                style={tw`${tc.inputText} py-3.5 text-base`}
                placeholder="Goal name (e.g. New Laptop)"
                placeholderTextColor={isDark ? '#4B5563' : '#9CA3AF'}
                value={title}
                onChangeText={setTitle}
              />
            </View>

            {/* Amount */}
            <View style={tw`${tc.inputBackground} border ${tc.borderMain} rounded-xl flex-row items-center px-4 mb-6`}>
              <Text style={tw`text-emerald-500 text-2xl font-bold mr-2`}>₹</Text>
              <TextInput
                style={tw`flex-1 ${tc.inputText} text-2xl font-bold py-3`}
                placeholder="Target amount"
                placeholderTextColor={isDark ? '#4B5563' : '#9CA3AF'}
                keyboardType="numeric"
                value={target}
                onChangeText={setTarget}
              />
            </View>

            <TouchableOpacity
              style={tw`${!target || !title ? tc.backgroundSecondary : 'bg-emerald-500'} py-4 rounded-2xl items-center`}
              onPress={handleCreate}
              disabled={!target || !title}
            >
              <Text style={tw`${!target || !title ? tc.textMuted : 'text-white'} font-bold text-base`}>Create Goal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Fund Modal */}
      <Modal animationType="slide" transparent visible={fundModal} onRequestClose={() => setFundModal(false)}>
        <View style={tw`flex-1 justify-end bg-black/60`}>
          <View style={tw`${tc.backgroundCard} rounded-t-3xl border-t ${tc.borderMain} p-6`}>
            <View style={tw`flex-row justify-between items-center mb-2`}>
              <View>
                <Text style={tw`${tc.textMain} text-xl font-bold`}>Fund Your Goal</Text>
                <Text style={tw`${tc.textSecondary} text-sm mt-0.5`}>{selectedGoal?.title}</Text>
              </View>
              <TouchableOpacity onPress={() => setFundModal(false)}>
                <Ionicons name="close-circle" size={28} color={isDark ? '#4B5563' : '#9CA3AF'} />
              </TouchableOpacity>
            </View>

            <View style={tw`bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 my-4 flex-row items-center`}>
              <Ionicons name="wallet-outline" size={16} color="#3B82F6" />
              <Text style={tw`text-blue-400 text-sm font-medium ml-2`}>Wallet: ₹{walletBalance.toLocaleString()}</Text>
            </View>

            <View style={tw`${tc.inputBackground} border ${tc.borderMain} rounded-xl flex-row items-center px-4 mb-6`}>
              <Text style={tw`text-emerald-500 text-2xl font-bold mr-2`}>₹</Text>
              <TextInput
                style={tw`flex-1 ${tc.inputText} text-2xl font-bold py-4`}
                placeholder="0"
                placeholderTextColor={isDark ? '#4B5563' : '#9CA3AF'}
                keyboardType="numeric"
                value={fundAmount}
                onChangeText={setFundAmount}
                autoFocus
              />
            </View>

            <TouchableOpacity
              style={tw`${!fundAmount ? tc.backgroundSecondary : 'bg-emerald-500'} py-4 rounded-2xl items-center`}
              onPress={handleFund}
              disabled={!fundAmount}
            >
              <Text style={tw`${!fundAmount ? tc.textMuted : 'text-white'} font-bold text-base`}>Add to Goal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

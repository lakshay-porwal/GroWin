import React, { useState, useContext } from 'react';
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity, TextInput, Modal, Alert, Image } from 'react-native';
import tw from 'twrnc';
import { AppContext } from '../context/AppContext';
import { Ionicons } from '@expo/vector-icons';
import { Goal } from '../types';
import { getThemeClasses } from '../utils/theme';
import { Header } from '../components/Header';

export const GoalsScreen = () => {
  const { goals, addGoal, updateGoal, walletBalance, theme } = useContext(AppContext);
  const tc = getThemeClasses(theme);
  
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [fundModalVisible, setFundModalVisible] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [fundAmount, setFundAmount] = useState('');

  const handleCreateGoal = () => {
    const num = parseFloat(targetAmount);
    if (!isNaN(num) && num > 0 && title.trim()) {
      addGoal({ title, targetAmount: num });
      setTitle('');
      setTargetAmount('');
      setAddModalVisible(false);
    }
  };

  const handleFundGoal = () => {
    const num = parseFloat(fundAmount);
    if (!isNaN(num) && num > 0 && selectedGoal) {
      if (walletBalance >= num) {
        updateGoal(selectedGoal.id, num);
        setFundAmount('');
        setFundModalVisible(false);
        setSelectedGoal(null);
        Alert.alert("Success!", `Added ₹${num} to ${selectedGoal.title}`);
      } else {
        Alert.alert("Insufficient Funds", "You don't have enough balance in your wallet.");
      }
    }
  };

  const openFundModal = (goal: Goal) => {
    setSelectedGoal(goal);
    setFundModalVisible(true);
  };

  return (
    <SafeAreaView style={tw`flex-1 ${tc.backgroundMain}`}>
      <Header title="Goals" subtitle="Save for what matters most" />
      <View style={tw`px-6 pb-4 flex-row justify-end items-center -mt-8 mb-4 z-10`} pointerEvents="box-none">
        <TouchableOpacity 
          style={tw`bg-emerald-500 p-3 rounded-xl shadow-lg shadow-emerald-500/30 ml-auto`}
          onPress={() => setAddModalVisible(true)}
        >
          <Ionicons name="add" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={tw`flex-1 px-6`} showsVerticalScrollIndicator={false}>
        {/* Decorative AI Banner */}
        <View style={tw`w-full h-32 rounded-3xl overflow-hidden shadow-lg border ${tc.borderEmeraldTint} mb-6`}>
           <Image 
             source={require('../../assets/goal_banner.png')} 
             style={tw`w-full h-full opacity-90`}
             resizeMode="cover"
           />
           <View style={tw`absolute inset-0 bg-black/40 p-5 justify-center`}>
             <Text style={tw`text-white font-bold text-lg`}>Dream Big.</Text>
             <Text style={tw`text-emerald-300 text-xs mt-1 w-2/3`}>Visualize your financial freedom and track your progress in real-time.</Text>
           </View>
        </View>

        {goals.length === 0 ? (
          <View style={tw`${tc.backgroundCard} border ${tc.borderMain} p-8 rounded-3xl items-center mt-4`}>
            <View style={tw`${tc.backgroundSecondary} p-4 rounded-full mb-4`}>
              <Ionicons name="flag-outline" size={48} color="#10B981" />
            </View>
            <Text style={tw`text-xl font-bold ${tc.textMain} mb-2`}>No Goals Yet</Text>
            <Text style={tw`${tc.textSecondary} text-center mb-6`}>Create your first financial goal to start tracking your savings progress.</Text>
            <TouchableOpacity 
              style={tw`bg-emerald-500 py-3 px-6 rounded-xl`}
              onPress={() => setAddModalVisible(true)}
            >
              <Text style={tw`text-white font-bold`}>Create Goal</Text>
            </TouchableOpacity>
          </View>
        ) : (
          goals.map((goal) => {
            const progress = Math.min((goal.savedAmount / goal.targetAmount) * 100, 100);
            const isCompleted = progress >= 100;

            return (
              <View key={goal.id} style={tw`${tc.backgroundCard} border ${isCompleted ? 'border-emerald-500/50' : tc.borderMain} p-5 rounded-3xl mb-4 shadow-md shadow-black/5 overflow-hidden relative`}>
                {isCompleted && (
                  <View style={tw`absolute -right-6 -top-6 opacity-10`}>
                    <Ionicons name="trophy" size={100} color="#10B981" />
                  </View>
                )}
                
                <View style={tw`flex-row justify-between items-start mb-4`}>
                  <View style={tw`flex-1`}>
                    <Text style={tw`text-xl font-bold ${tc.textMain} mb-1`}>{goal.title}</Text>
                    <Text style={tw`text-emerald-500 font-medium`}>
                      ₹{goal.savedAmount.toLocaleString()} <Text style={tw`${tc.textMuted}`}>/ ₹{goal.targetAmount.toLocaleString()}</Text>
                    </Text>
                  </View>
                  <View style={tw`${tc.backgroundSecondary} p-2 rounded-xl`}>
                    <Ionicons name={isCompleted ? 'trophy' : 'flag'} size={24} color={isCompleted ? "#F59E0B" : "#10B981"} />
                  </View>
                </View>

                {/* Progress Bar */}
                <View style={tw`mb-5`}>
                  <View style={tw`flex-row justify-between mb-2`}>
                    <Text style={tw`${tc.textSecondary} text-xs font-medium`}>Progress</Text>
                    <Text style={tw`${tc.textSecondary} text-xs font-medium`}>{progress.toFixed(0)}%</Text>
                  </View>
                  <View style={tw`h-3 ${tc.backgroundSecondary} rounded-full overflow-hidden`}>
                    <View style={tw`h-full bg-emerald-500 w-[${progress}%] rounded-full`} />
                  </View>
                </View>

                {!isCompleted ? (
                  <TouchableOpacity 
                    style={tw`${tc.backgroundSecondary} border ${tc.borderSecondary} py-3 rounded-xl items-center flex-row justify-center active:bg-gray-700`}
                    onPress={() => openFundModal(goal)}
                  >
                    <Ionicons name="add-circle-outline" size={20} color="#10B981" style={tw`mr-2`} />
                    <Text style={tw`${tc.textMain} font-medium`}>Add Funds</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={tw`bg-emerald-500/20 py-3 rounded-xl items-center flex-row justify-center border border-emerald-500/30`}>
                    <Ionicons name="checkmark-circle" size={20} color="#10B981" style={tw`mr-2`} />
                    <Text style={tw`text-emerald-500 font-bold`}>Goal Reached!</Text>
                  </View>
                )}
              </View>
            );
          })
        )}
        <View style={tw`h-10`} />
      </ScrollView>

      {/* Create Goal Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={addModalVisible}
        onRequestClose={() => setAddModalVisible(false)}
      >
        <View style={tw`flex-1 justify-end bg-black/60`}>
          <View style={tw`${tc.backgroundCard} rounded-t-3xl p-6 border-t ${tc.borderMain} h-[70%]`}>
            <View style={tw`flex-row justify-between items-center mb-6`}>
              <Text style={tw`text-2xl font-bold ${tc.textMain}`}>New Goal</Text>
              <TouchableOpacity onPress={() => setAddModalVisible(false)} style={tw`${tc.backgroundSecondary} p-2 rounded-full`}>
                <Ionicons name="close" size={24} color={theme === 'dark' ? '#9CA3AF' : '#6B7280'} />
              </TouchableOpacity>
            </View>
            
            <Text style={tw`${tc.textSecondary} mb-2 font-medium ml-1`}>Goal Title</Text>
            <View style={tw`${tc.inputBackground} rounded-2xl px-4 py-2 border ${tc.borderSecondary} mb-6`}>
              <TextInput
                style={tw`${tc.inputText} text-lg py-3`}
                placeholder="e.g. New Laptop, Trip to Goa"
                placeholderTextColor={theme === 'dark' ? '#4B5563' : '#9CA3AF'}
                value={title}
                onChangeText={setTitle}
                autoFocus
              />
            </View>

            <Text style={tw`${tc.textSecondary} mb-2 font-medium ml-1`}>Target Amount</Text>
            <View style={tw`${tc.inputBackground} rounded-2xl flex-row items-center px-4 py-2 border ${tc.borderSecondary} mb-8`}>
              <Text style={tw`text-2xl text-emerald-500 font-bold mr-2`}>₹</Text>
              <TextInput
                style={tw`flex-1 ${tc.inputText} text-2xl font-bold py-3`}
                placeholder="0"
                placeholderTextColor={theme === 'dark' ? '#4B5563' : '#9CA3AF'}
                keyboardType="numeric"
                value={targetAmount}
                onChangeText={setTargetAmount}
              />
            </View>

            <TouchableOpacity 
              style={tw`${!targetAmount || !title ? tc.backgroundSecondary : 'bg-emerald-500'} py-4 items-center rounded-xl shadow-md ${!targetAmount || !title ? '' : 'shadow-emerald-500/30'}`}
              onPress={handleCreateGoal}
              disabled={!targetAmount || !title}
            >
              <Text style={tw`${!targetAmount || !title ? tc.textMuted : 'text-white'} font-bold text-lg`}>Create Goal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Add Funds Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={fundModalVisible}
        onRequestClose={() => setFundModalVisible(false)}
      >
        <View style={tw`flex-1 justify-end bg-black/60`}>
          <View style={tw`${tc.backgroundCard} rounded-t-3xl p-6 border-t ${tc.borderMain} h-[60%]`}>
            <View style={tw`flex-row justify-between items-center mb-6`}>
              <View>
                <Text style={tw`text-2xl font-bold ${tc.textMain}`}>Fund Goal</Text>
                <Text style={tw`${tc.textSecondary} mt-1`}>For {selectedGoal?.title}</Text>
              </View>
              <TouchableOpacity onPress={() => setFundModalVisible(false)} style={tw`${tc.backgroundSecondary} p-2 rounded-full`}>
                <Ionicons name="close" size={24} color={theme === 'dark' ? '#9CA3AF' : '#6B7280'} />
              </TouchableOpacity>
            </View>

            <View style={tw`${tc.backgroundSecondary} border-l-4 border-emerald-500 p-4 rounded-xl mb-6 flex-row justify-between`}>
              <Text style={tw`${tc.textSecondary} font-medium`}>Wallet Balance:</Text>
              <Text style={tw`${tc.textMain} font-bold`}>₹{walletBalance.toLocaleString()}</Text>
            </View>
            
            <Text style={tw`${tc.textSecondary} mb-2 font-medium ml-1`}>Amount to Add</Text>
            <View style={tw`${tc.inputBackground} rounded-2xl flex-row items-center px-4 py-2 border ${tc.borderSecondary} mb-8`}>
              <Text style={tw`text-2xl text-emerald-500 font-bold mr-2`}>₹</Text>
              <TextInput
                style={tw`flex-1 ${tc.inputText} text-2xl font-bold py-3`}
                placeholder="0"
                placeholderTextColor={theme === 'dark' ? '#4B5563' : '#9CA3AF'}
                keyboardType="numeric"
                value={fundAmount}
                onChangeText={setFundAmount}
                autoFocus
              />
            </View>

            <TouchableOpacity 
              style={tw`${!fundAmount ? tc.backgroundSecondary : 'bg-emerald-500'} py-4 items-center rounded-xl shadow-md ${!fundAmount ? '' : 'shadow-emerald-500/30'}`}
              onPress={handleFundGoal}
              disabled={!fundAmount}
            >
              <Text style={tw`${!fundAmount ? tc.textMuted : 'text-white'} font-bold text-lg`}>Add to Goal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

import React, { useState, useContext } from 'react';
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import tw from 'twrnc';
import { AppContext } from '../context/AppContext';
import { Ionicons } from '@expo/vector-icons';
import { Goal } from '../types';

export const GoalsScreen = () => {
  const { goals, addGoal, updateGoal, walletBalance } = useContext(AppContext);
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
    <SafeAreaView style={tw`flex-1 bg-gray-950`}>
      <View style={tw`p-6 pt-8 pb-4 flex-row justify-between items-center`}>
        <View>
          <Text style={tw`text-3xl font-bold text-white mb-1`}>Goals</Text>
          <Text style={tw`text-gray-400`}>Save for what matters most</Text>
        </View>
        <TouchableOpacity 
          style={tw`bg-emerald-500 p-3 rounded-xl shadow-lg shadow-emerald-500/30`}
          onPress={() => setAddModalVisible(true)}
        >
          <Ionicons name="add" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={tw`flex-1 px-6`} showsVerticalScrollIndicator={false}>
        {goals.length === 0 ? (
          <View style={tw`bg-gray-900 border border-gray-800 p-8 rounded-3xl items-center mt-4`}>
            <View style={tw`bg-gray-800 p-4 rounded-full mb-4`}>
              <Ionicons name="flag-outline" size={48} color="#10B981" />
            </View>
            <Text style={tw`text-xl font-bold text-white mb-2`}>No Goals Yet</Text>
            <Text style={tw`text-gray-400 text-center mb-6`}>Create your first financial goal to start tracking your savings progress.</Text>
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
              <View key={goal.id} style={tw`bg-gray-900 border ${isCompleted ? 'border-emerald-500/50' : 'border-gray-800'} p-5 rounded-3xl mb-4 shadow-md overflow-hidden relative`}>
                {isCompleted && (
                  <View style={tw`absolute -right-6 -top-6 opacity-10`}>
                    <Ionicons name="trophy" size={100} color="#10B981" />
                  </View>
                )}
                
                <View style={tw`flex-row justify-between items-start mb-4`}>
                  <View style={tw`flex-1`}>
                    <Text style={tw`text-xl font-bold text-white mb-1`}>{goal.title}</Text>
                    <Text style={tw`text-emerald-400 font-medium`}>
                      ₹{goal.savedAmount.toLocaleString()} <Text style={tw`text-gray-500`}>/ ₹{goal.targetAmount.toLocaleString()}</Text>
                    </Text>
                  </View>
                  <View style={tw`bg-gray-800 p-2 rounded-xl`}>
                    <Ionicons name={isCompleted ? 'trophy' : 'flag'} size={24} color={isCompleted ? "#F59E0B" : "#10B981"} />
                  </View>
                </View>

                {/* Progress Bar */}
                <View style={tw`mb-5`}>
                  <View style={tw`flex-row justify-between mb-2`}>
                    <Text style={tw`text-gray-400 text-xs font-medium`}>Progress</Text>
                    <Text style={tw`text-gray-400 text-xs font-medium`}>{progress.toFixed(0)}%</Text>
                  </View>
                  <View style={tw`h-3 bg-gray-800 rounded-full overflow-hidden`}>
                    <View style={tw`h-full bg-emerald-500 w-[${progress}%] rounded-full`} />
                  </View>
                </View>

                {!isCompleted ? (
                  <TouchableOpacity 
                    style={tw`bg-gray-800 border border-gray-700 py-3 rounded-xl items-center flex-row justify-center active:bg-gray-700`}
                    onPress={() => openFundModal(goal)}
                  >
                    <Ionicons name="add-circle-outline" size={20} color="#10B981" style={tw`mr-2`} />
                    <Text style={tw`text-white font-medium`}>Add Funds</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={tw`bg-emerald-500/20 py-3 rounded-xl items-center flex-row justify-center border border-emerald-500/30`}>
                    <Ionicons name="checkmark-circle" size={20} color="#10B981" style={tw`mr-2`} />
                    <Text style={tw`text-emerald-400 font-bold`}>Goal Reached!</Text>
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
        <View style={tw`flex-1 justify-end bg-black/80`}>
          <View style={tw`bg-gray-900 rounded-t-3xl p-6 border-t border-gray-800 h-[70%]`}>
            <View style={tw`flex-row justify-between items-center mb-6`}>
              <Text style={tw`text-2xl font-bold text-white`}>New Goal</Text>
              <TouchableOpacity onPress={() => setAddModalVisible(false)} style={tw`bg-gray-800 p-2 rounded-full`}>
                <Ionicons name="close" size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
            
            <Text style={tw`text-gray-400 mb-2 font-medium ml-1`}>Goal Title</Text>
            <View style={tw`bg-gray-800 rounded-2xl px-4 py-2 border border-gray-700 mb-6`}>
              <TextInput
                style={tw`text-white text-lg py-3`}
                placeholder="e.g. New Laptop, Trip to Goa"
                placeholderTextColor="#4B5563"
                value={title}
                onChangeText={setTitle}
                autoFocus
              />
            </View>

            <Text style={tw`text-gray-400 mb-2 font-medium ml-1`}>Target Amount</Text>
            <View style={tw`bg-gray-800 rounded-2xl flex-row items-center px-4 py-2 border border-gray-700 mb-8`}>
              <Text style={tw`text-2xl text-emerald-500 font-bold mr-2`}>₹</Text>
              <TextInput
                style={tw`flex-1 text-white text-2xl font-bold py-3`}
                placeholder="0"
                placeholderTextColor="#4B5563"
                keyboardType="numeric"
                value={targetAmount}
                onChangeText={setTargetAmount}
              />
            </View>

            <TouchableOpacity 
              style={tw`${!targetAmount || !title ? 'bg-gray-800' : 'bg-emerald-500'} py-4 items-center rounded-xl shadow-md ${!targetAmount || !title ? '' : 'shadow-emerald-500/30'}`}
              onPress={handleCreateGoal}
              disabled={!targetAmount || !title}
            >
              <Text style={tw`${!targetAmount || !title ? 'text-gray-500' : 'text-white'} font-bold text-lg`}>Create Goal</Text>
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
        <View style={tw`flex-1 justify-end bg-black/80`}>
          <View style={tw`bg-gray-900 rounded-t-3xl p-6 border-t border-gray-800 h-[60%]`}>
            <View style={tw`flex-row justify-between items-center mb-6`}>
              <View>
                <Text style={tw`text-2xl font-bold text-white`}>Fund Goal</Text>
                <Text style={tw`text-gray-400 mt-1`}>For {selectedGoal?.title}</Text>
              </View>
              <TouchableOpacity onPress={() => setFundModalVisible(false)} style={tw`bg-gray-800 p-2 rounded-full`}>
                <Ionicons name="close" size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            <View style={tw`bg-gray-800 border-l-4 border-emerald-500 p-4 rounded-xl mb-6 flex-row justify-between`}>
              <Text style={tw`text-gray-400 font-medium`}>Wallet Balance:</Text>
              <Text style={tw`text-white font-bold`}>₹{walletBalance.toLocaleString()}</Text>
            </View>
            
            <Text style={tw`text-gray-400 mb-2 font-medium ml-1`}>Amount to Add</Text>
            <View style={tw`bg-gray-800 rounded-2xl flex-row items-center px-4 py-2 border border-gray-700 mb-8`}>
              <Text style={tw`text-2xl text-emerald-500 font-bold mr-2`}>₹</Text>
              <TextInput
                style={tw`flex-1 text-white text-2xl font-bold py-3`}
                placeholder="0"
                placeholderTextColor="#4B5563"
                keyboardType="numeric"
                value={fundAmount}
                onChangeText={setFundAmount}
                autoFocus
              />
            </View>

            <TouchableOpacity 
              style={tw`${!fundAmount ? 'bg-gray-800' : 'bg-emerald-500'} py-4 items-center rounded-xl shadow-md ${!fundAmount ? '' : 'shadow-emerald-500/30'}`}
              onPress={handleFundGoal}
              disabled={!fundAmount}
            >
              <Text style={tw`${!fundAmount ? 'text-gray-500' : 'text-white'} font-bold text-lg`}>Add to Goal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

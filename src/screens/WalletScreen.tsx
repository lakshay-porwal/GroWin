import React, { useContext, useState } from 'react';
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity, TextInput, Modal } from 'react-native';
import tw from 'twrnc';
import { AppContext } from '../context/AppContext';
import { Ionicons } from '@expo/vector-icons';

export const WalletScreen = ({ navigation }: any) => {
  const { walletBalance, transactions, addMoneyToWallet } = useContext(AppContext);
  const [modalVisible, setModalVisible] = useState(false);
  const [amount, setAmount] = useState('');

  const handleAddMoney = () => {
    const num = parseFloat(amount);
    if (!isNaN(num) && num > 0) {
      addMoneyToWallet(num);
    }
    setAmount('');
    setModalVisible(false);
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-gray-950`}>
      <View style={tw`p-6 bg-emerald-900 mx-6 mt-6 rounded-3xl border border-emerald-500 shadow-lg relative overflow-hidden mb-6`}>
        <View style={tw`absolute -right-4 -top-4 opacity-20`}>
           <Ionicons name="card" size={100} color="#10B981" />
        </View>
        <Text style={tw`text-emerald-300 font-medium mb-1`}>Available Balance</Text>
        <Text style={tw`text-4xl font-extrabold text-white mb-6`}>₹{walletBalance.toLocaleString()}</Text>
        
        <TouchableOpacity 
          style={tw`bg-emerald-500 py-3 px-6 rounded-xl flex-row items-center justify-center self-start`}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add-circle" size={20} color="#fff" style={tw`mr-2`} />
          <Text style={tw`text-white font-bold`}>Add Money</Text>
        </TouchableOpacity>
      </View>

      <View style={tw`flex-1 px-6`}>
        <Text style={tw`text-white font-bold text-xl mb-4`}>Transaction History</Text>
        <ScrollView showsVerticalScrollIndicator={false}>
          {transactions.length === 0 ? (
            <View style={tw`bg-gray-900 border border-gray-800 p-8 rounded-2xl items-center`}>
              <Ionicons name="receipt-outline" size={48} color="#4B5563" style={tw`mb-4`} />
              <Text style={tw`text-gray-400 text-center`}>No transactions yet. Add money to your wallet to get started!</Text>
            </View>
          ) : (
            transactions.map((tx) => (
              <View key={tx.id} style={tw`bg-gray-900 border border-gray-800 p-5 rounded-2xl mb-3 flex-row justify-between items-center`}>
                <View style={tw`flex-row items-center flex-1`}>
                  <View style={tw`${tx.type === 'CREDIT' ? 'bg-emerald-500/20' : 'bg-red-500/20'} p-3 rounded-xl mr-4`}>
                    <Ionicons name={tx.type === 'CREDIT' ? 'arrow-down' : 'arrow-up'} size={24} color={tx.type === 'CREDIT' ? '#10B981' : '#EF4444'} />
                  </View>
                  <View style={tw`flex-1 mr-2`}>
                    <Text style={tw`text-white font-medium text-base mb-1`} numberOfLines={1}>{tx.title}</Text>
                    <Text style={tw`text-gray-500 text-xs`}>
                      {new Date(tx.date).toLocaleDateString()} • {new Date(tx.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                </View>
                <Text style={tw`${tx.type === 'CREDIT' ? 'text-emerald-400' : 'text-white'} font-bold text-lg`}>
                  {tx.type === 'CREDIT' ? '+' : '-'}₹{tx.amount.toLocaleString()}
                </Text>
              </View>
            ))
          )}
          <View style={tw`h-10`} />
        </ScrollView>
      </View>

      {/* Add Money Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={tw`flex-1 justify-end bg-black/70`}>
          <View style={tw`bg-gray-900 rounded-t-3xl p-6 border-t border-gray-800`}>
            <View style={tw`flex-row justify-between items-center mb-6`}>
              <Text style={tw`text-2xl font-bold text-white`}>Add Money</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={tw`bg-gray-800 p-2 rounded-full`}>
                <Ionicons name="close" size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
            
            <View style={tw`bg-gray-800 rounded-2xl flex-row items-center px-4 py-2 border border-emerald-500/30 mb-6`}>
              <Text style={tw`text-3xl text-emerald-500 font-bold mr-2`}>₹</Text>
              <TextInput
                style={tw`flex-1 text-white text-3xl font-bold py-4`}
                placeholder="0"
                placeholderTextColor="#4B5563"
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
                autoFocus
              />
            </View>
            
            <View style={tw`flex-row gap-3 mb-6`}>
              {[500, 1000, 5000].map(val => (
                <TouchableOpacity 
                  key={val}
                  style={tw`flex-1 bg-gray-800 border border-gray-700 p-3 rounded-xl items-center`}
                  onPress={() => setAmount(val.toString())}
                >
                  <Text style={tw`text-white font-medium`}>+₹{val}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity 
              style={tw`bg-emerald-500 py-4 items-center rounded-xl shadow-md shadow-emerald-500/30`}
              onPress={handleAddMoney}
              activeOpacity={0.8}
            >
              <Text style={tw`text-white font-bold text-lg`}>Add to Wallet</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

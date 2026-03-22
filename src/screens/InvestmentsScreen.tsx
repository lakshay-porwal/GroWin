import React, { useState, useContext } from 'react';
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import tw from 'twrnc';
import { AppContext } from '../context/AppContext';
import { Ionicons } from '@expo/vector-icons';
import { Investment } from '../types';

const MOCK_FUNDS: Omit<Investment, 'id' | 'currentValue'>[] = [
  { title: "Safe Haven Liquid Fund", type: "MF", amount: 1000, riskLevel: "LOW", expectedReturn: "5-7% p.a." },
  { title: "Growth Index 50", type: "MF", amount: 1000, riskLevel: "MEDIUM", expectedReturn: "10-12% p.a." },
  { title: "Aggressive Small Cap", type: "MF", amount: 1000, riskLevel: "HIGH", expectedReturn: "15-18% p.a." },
  { title: "Student Starter SIP", type: "SIP", amount: 500, riskLevel: "LOW", expectedReturn: "8% p.a." },
  { title: "Tech Growth SIP", type: "SIP", amount: 1000, riskLevel: "HIGH", expectedReturn: "14% p.a." },
  { title: "Top 50 Giants ETF", type: "ETF", amount: 5000, riskLevel: "MEDIUM", expectedReturn: "11% p.a." },
  { title: "Gold Safe ETF", type: "ETF", amount: 2000, riskLevel: "LOW", expectedReturn: "6% p.a." },
];

export const InvestmentsScreen = () => {
  const { addInvestment, walletBalance, user } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState<'MF' | 'SIP' | 'ETF'>('MF');

  const filteredFunds = MOCK_FUNDS.filter(f => f.type === activeTab);

  const handleInvest = (fund: Omit<Investment, 'id' | 'currentValue'>) => {
    if (walletBalance >= fund.amount) {
      addInvestment(fund);
      Alert.alert("Success!", `You have successfully invested ₹${fund.amount} in ${fund.title}.`);
    } else {
      Alert.alert("Insufficient Funds", "Please add money to your wallet first.");
    }
  };

  const getRiskColor = (risk: string) => {
    switch(risk) {
      case 'LOW': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'MEDIUM': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'HIGH': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-gray-950`}>
      <View style={tw`p-6 pt-8 pb-4`}>
        <Text style={tw`text-3xl font-bold text-white mb-2`}>Invest</Text>
        <Text style={tw`text-gray-400`}>Simple, curated funds based on your <Text style={tw`text-emerald-500 font-bold`}>{user.riskProfile}</Text> risk profile.</Text>
      </View>

      {/* Custom Tabs */}
      <View style={tw`px-6 mb-6 flex-row`}>
        {['MF', 'SIP', 'ETF'].map((tab) => (
          <TouchableOpacity 
            key={tab}
            style={tw`flex-1 py-3 items-center border-b-2 ${activeTab === tab ? 'border-emerald-500' : 'border-gray-800'}`}
            onPress={() => setActiveTab(tab as any)}
          >
            <Text style={tw`font-bold text-lg ${activeTab === tab ? 'text-emerald-500' : 'text-gray-500'}`}>
              {tab === 'MF' ? 'Mutual Funds' : tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={tw`flex-1 px-6`} showsVerticalScrollIndicator={false}>
        {filteredFunds.map((fund, index) => (
          <View key={index} style={tw`bg-gray-900 border border-gray-800 p-5 rounded-2xl mb-4 shadow-md`}>
            <View style={tw`flex-row justify-between items-start mb-4`}>
              <View style={tw`flex-1 mr-2`}>
                <Text style={tw`text-xl font-bold text-white mb-1`}>{fund.title}</Text>
                <View style={tw`flex-row items-center mt-1`}>
                  <View style={tw`px-2 py-1 rounded-md border ${getRiskColor(fund.riskLevel)} mr-3`}>
                    <Text style={tw`text-xs font-bold uppercase`}>{fund.riskLevel} RISK</Text>
                  </View>
                  <Text style={tw`text-emerald-400 font-medium text-sm`}>
                    <Ionicons name="trending-up" size={14} /> {fund.expectedReturn}
                  </Text>
                </View>
              </View>
              <View style={tw`bg-gray-800 p-2 rounded-xl`}>
                <Ionicons 
                  name={fund.type === 'MF' ? 'briefcase' : fund.type === 'SIP' ? 'calendar' : 'bar-chart'} 
                  size={24} 
                  color="#10B981" 
                />
              </View>
            </View>

            <View style={tw`bg-gray-800/50 p-3 rounded-xl mb-4 border border-gray-700/50`}>
              <Text style={tw`text-gray-400 text-sm`}>
                {fund.type === 'SIP' ? 'Monthly auto-investment of' : 'Minimum investment:'} <Text style={tw`text-white font-bold`}>₹{fund.amount}</Text>
              </Text>
            </View>

            <TouchableOpacity 
              style={tw`bg-emerald-500 py-3 rounded-xl items-center shadow-sm shadow-emerald-500/20`}
              onPress={() => handleInvest(fund)}
            >
              <Text style={tw`text-white font-bold`}>
                {fund.type === 'SIP' ? 'Start SIP' : 'Invest Now'}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
        <View style={tw`h-10`} />
      </ScrollView>
    </SafeAreaView>
  );
};

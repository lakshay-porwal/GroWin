import React, { useState, useContext } from 'react';
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity, Alert, Modal, ActivityIndicator } from 'react-native';
import tw from 'twrnc';
import { AppContext } from '../context/AppContext';
import { Ionicons } from '@expo/vector-icons';
import { Investment } from '../types';
import { getThemeClasses } from '../utils/theme';
import { analyzeSIPRisk } from '../services/geminiService';
import { Header } from '../components/Header';

const MOCK_FUNDS: Omit<Investment, 'id' | 'currentValue'>[] = [
  { title: "Safe Haven Liquid Fund", type: "MF", amount: 1000, riskLevel: "LOW", expectedReturn: "5-7% p.a." },
  { title: "Growth Index 50", type: "MF", amount: 1000, riskLevel: "MEDIUM", expectedReturn: "10-12% p.a." },
  { title: "Aggressive Small Cap", type: "MF", amount: 1000, riskLevel: "HIGH", expectedReturn: "15-18% p.a." },
  { title: "Student Starter SIP", type: "SIP", amount: 500, riskLevel: "LOW", expectedReturn: "8% p.a." },
  { title: "Tech Growth SIP", type: "SIP", amount: 1000, riskLevel: "HIGH", expectedReturn: "14% p.a." },
  { title: "Top 50 Giants ETF", type: "ETF", amount: 5000, riskLevel: "MEDIUM", expectedReturn: "11% p.a." },
  { title: "Gold Safe ETF", type: "ETF", amount: 2000, riskLevel: "LOW", expectedReturn: "6% p.a." },
  { title: "Green Energy Future SIP", type: "SIP", amount: 2000, riskLevel: "HIGH", expectedReturn: "16% p.a." },
  { title: "Bluechip Stability SIP", type: "SIP", amount: 1500, riskLevel: "MEDIUM", expectedReturn: "12% p.a." },
  { title: "Global Tech Leaders MF", type: "MF", amount: 5000, riskLevel: "HIGH", expectedReturn: "18% p.a." },
  { title: "Nifty Next 50 ETF", type: "ETF", amount: 2500, riskLevel: "MEDIUM", expectedReturn: "13% p.a." },
  { title: "Micro-Saving Daily SIP", type: "SIP", amount: 100, riskLevel: "LOW", expectedReturn: "7% p.a." },
  { title: "Healthcare Sector MF", type: "MF", amount: 2000, riskLevel: "MEDIUM", expectedReturn: "11% p.a." }
];

export const InvestmentsScreen = () => {
  const { addInvestment, walletBalance, user, theme } = useContext(AppContext);
  const tc = getThemeClasses(theme);
  
  const [activeTab, setActiveTab] = useState<'MF' | 'SIP' | 'ETF'>('MF');
  
  // AI Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [selectedFundTitle, setSelectedFundTitle] = useState('');

  const filteredFunds = MOCK_FUNDS.filter(f => f.type === activeTab);

  const handleInvest = (fund: Omit<Investment, 'id' | 'currentValue'>) => {
    if (walletBalance >= fund.amount) {
      addInvestment(fund);
      Alert.alert("Success!", `You have successfully invested ₹${fund.amount} in ${fund.title}.`);
    } else {
      Alert.alert("Insufficient Funds", "Please add money to your wallet first.");
    }
  };

  const handleAIAnalysis = async (fund: Omit<Investment, 'id' | 'currentValue'>) => {
    setSelectedFundTitle(fund.title);
    setAiAnalysis('');
    setIsAnalyzing(true);
    setModalVisible(true);
    
    const result = await analyzeSIPRisk(fund, user);
    setAiAnalysis(result);
    setIsAnalyzing(false);
  };

  const getRiskColor = (risk: string) => {
    switch(risk) {
      case 'LOW': return 'bg-blue-500/20 text-blue-500 border-blue-500/30';
      case 'MEDIUM': return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30';
      case 'HIGH': return 'bg-red-500/20 text-red-500 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-500 border-gray-500/30';
    }
  };

  return (
    <SafeAreaView style={tw`flex-1 ${tc.backgroundMain}`}>
      <Header title="Invest" subtitle="Curated funds based on your risk profile." />

      {/* Custom Tabs */}
      <View style={tw`px-6 mb-6 flex-row`}>
        {['MF', 'SIP', 'ETF'].map((tab) => (
          <TouchableOpacity 
            key={tab}
            style={tw`flex-1 py-3 items-center border-b-2 ${activeTab === tab ? 'border-emerald-500' : 'border-transparent'}`}
            onPress={() => setActiveTab(tab as any)}
          >
            <Text style={tw`font-bold text-lg ${activeTab === tab ? 'text-emerald-500' : tc.textMuted}`}>
              {tab === 'MF' ? 'Mutual Funds' : tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={tw`flex-1 px-6`} showsVerticalScrollIndicator={false}>
        {filteredFunds.map((fund, index) => (
          <View key={index} style={tw`${tc.backgroundCard} border ${tc.borderMain} p-5 rounded-3xl mb-4 shadow-sm shadow-black/5`}>
            <View style={tw`flex-row justify-between items-start mb-4`}>
              <View style={tw`flex-1 mr-2`}>
                <Text style={tw`text-xl font-bold ${tc.textMain} mb-1`}>{fund.title}</Text>
                <View style={tw`flex-row items-center mt-1`}>
                  <View style={tw`px-2 py-1 rounded-md border ${getRiskColor(fund.riskLevel)} mr-3`}>
                    <Text style={tw`text-[10px] font-bold uppercase`}>{fund.riskLevel} RISK</Text>
                  </View>
                  <Text style={tw`text-emerald-500 font-medium text-sm`}>
                    <Ionicons name="trending-up" size={14} /> {fund.expectedReturn}
                  </Text>
                </View>
              </View>
              <View style={tw`${tc.bgEmeraldTint} p-2 rounded-xl`}>
                <Ionicons 
                  name={fund.type === 'MF' ? 'briefcase' : fund.type === 'SIP' ? 'calendar' : 'bar-chart'} 
                  size={24} 
                  color="#10B981" 
                />
              </View>
            </View>

            <View style={tw`${tc.backgroundSecondary} p-3 rounded-xl mb-4 border ${tc.borderSecondary}`}>
              <Text style={tw`${tc.textSecondary} text-sm`}>
                {fund.type === 'SIP' ? 'Monthly auto-investment of' : 'Minimum investment:'} <Text style={tw`${tc.textMain} font-bold`}>₹{fund.amount}</Text>
              </Text>
            </View>

            <View style={tw`flex-row justify-between items-center`}>
               <TouchableOpacity 
                 style={tw`flex-row items-center justify-center p-3 rounded-xl border border-emerald-500 mr-2 flex-1`}
                 onPress={() => handleAIAnalysis(fund)}
               >
                 <Ionicons name="sparkles" size={16} color="#10B981" />
                 <Text style={tw`text-emerald-500 font-bold ml-1 text-xs`}>AI Risk Report</Text>
               </TouchableOpacity>

               <TouchableOpacity 
                 style={tw`bg-emerald-500 p-3 rounded-xl items-center shadow-lg shadow-emerald-500/30 flex-1 ml-2`}
                 onPress={() => handleInvest(fund)}
               >
                 <Text style={tw`text-white font-bold`}>
                   {fund.type === 'SIP' ? 'Start SIP' : 'Invest'}
                 </Text>
               </TouchableOpacity>
            </View>
          </View>
        ))}
        <View style={tw`h-10`} />
      </ScrollView>

      {/* AI Risk Modal */}
      <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={tw`flex-1 justify-end bg-black/50`}>
           <View style={tw`${tc.backgroundCard} p-6 rounded-t-3xl border-t ${tc.borderMain}`}>
              <View style={tw`flex-row justify-between items-center mb-4`}>
                 <View style={tw`flex-row items-center`}>
                    <View style={tw`bg-emerald-500/20 p-2 rounded-full mr-2`}>
                      <Ionicons name="hardware-chip" size={20} color="#10B981" />
                    </View>
                    <Text style={tw`text-lg font-bold ${tc.textMain} flex-shrink-1`}>AI Risk Analysis</Text>
                 </View>
                 <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <Ionicons name="close-circle" size={28} color={theme === 'dark' ? '#4B5563' : '#9CA3AF'} />
                 </TouchableOpacity>
              </View>

              <Text style={tw`${tc.textSecondary} mb-4 text-xs font-medium`}>Analyzing: {selectedFundTitle} (Profile: {user.riskProfile})</Text>

              {isAnalyzing ? (
                 <View style={tw`py-10 items-center justify-center`}>
                    <ActivityIndicator size="large" color="#10B981" />
                    <Text style={tw`mt-4 font-medium text-emerald-500`}>GroWin AI is calculating risk factors...</Text>
                 </View>
              ) : (
                 <View style={tw`bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl mb-4`}>
                    <Text style={tw`${tc.textMain} leading-relaxed font-medium`}>{aiAnalysis}</Text>
                 </View>
              )}

              <TouchableOpacity style={tw`bg-gray-800 p-3 rounded-xl items-center mt-2`} onPress={() => setModalVisible(false)}>
                 <Text style={tw`text-white font-bold`}>Close Analysis</Text>
              </TouchableOpacity>
           </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
};

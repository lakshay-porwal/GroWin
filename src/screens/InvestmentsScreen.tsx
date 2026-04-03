import React, { useState, useContext } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Alert,
  Modal, ActivityIndicator, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import tw from 'twrnc';
import { AppContext } from '../context/AppContext';
import { Ionicons } from '@expo/vector-icons';
import { Investment } from '../types';
import { getThemeClasses } from '../utils/theme';
import { analyzeSIPRisk } from '../services/geminiService';
import { Header } from '../components/Header';

const BASE_FUNDS: Omit<Investment, 'id' | 'currentValue'>[] = [
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
  { title: "Healthcare Sector MF", type: "MF", amount: 2000, riskLevel: "MEDIUM", expectedReturn: "11% p.a." },
];

const RISK_CFG = {
  LOW:    { icon: '🛡️', color: '#3B82F6', bg: 'bg-blue-500/15',   border: 'border-blue-500/30',   text: 'text-blue-400' },
  MEDIUM: { icon: '⚖️', color: '#F59E0B', bg: 'bg-amber-500/15',  border: 'border-amber-500/30',  text: 'text-amber-400' },
  HIGH:   { icon: '🚀', color: '#EF4444', bg: 'bg-red-500/15',    border: 'border-red-500/30',    text: 'text-red-400' },
} as const;

const TypeIcon: Record<string, any> = { MF: 'briefcase', SIP: 'calendar', ETF: 'bar-chart' };

export const InvestmentsScreen = () => {
  const { addInvestment, walletBalance, currentUser, funds, theme, investments } = useContext(AppContext);
  const tc = getThemeClasses(theme);
  const isDark = theme === 'dark';

  const [activeTab, setActiveTab] = useState<'ALL' | 'MF' | 'SIP' | 'ETF'>('ALL');
  const [selectedRisk, setSelectedRisk] = useState<'ALL' | 'LOW' | 'MEDIUM' | 'HIGH'>('ALL');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [selectedFund, setSelectedFund] = useState<Omit<Investment, 'id' | 'currentValue'> | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [detailFund, setDetailFund] = useState<Omit<Investment, 'id' | 'currentValue'> | null>(null);

  const approvedFunds: Omit<Investment, 'id' | 'currentValue'>[] = funds
    .filter(f => f.status === 'APPROVED')
    .map(f => ({ title: f.title, type: f.type, amount: f.amount, riskLevel: f.riskLevel, expectedReturn: f.expectedReturn }));

  const allFunds = [...approvedFunds, ...BASE_FUNDS];
  const userRisk = currentUser?.riskProfile;

  const filteredFunds = (activeTab === 'ALL' ? allFunds : allFunds.filter(f => f.type === activeTab))
    .filter(f => selectedRisk === 'ALL' || f.riskLevel === selectedRisk);
  const suggestedFunds = userRisk ? allFunds.filter(f => f.riskLevel === userRisk).slice(0, 3) : [];
  const isAuthorityFund = (t: string) => approvedFunds.some(f => f.title === t);

  const handleInvest = (fund: Omit<Investment, 'id' | 'currentValue'>) => {
    if (walletBalance >= fund.amount) {
      addInvestment(fund);
      if (Platform.OS === 'web') window.alert(`✅ Invested! ₹${fund.amount.toLocaleString()} invested in ${fund.title}`);
      else Alert.alert("✅ Invested!", `₹${fund.amount.toLocaleString()} invested in ${fund.title}`);
    } else {
      if (Platform.OS === 'web') window.alert("Insufficient Balance. Add money to your wallet first.");
      else Alert.alert("Insufficient Balance", "Add money to your wallet first.");
    }
  };

  const openAI = async (fund: Omit<Investment, 'id' | 'currentValue'>) => {
    setSelectedFund(fund);
    setAiAnalysis('');
    setIsAnalyzing(true);
    setModalVisible(true);
    const result = await analyzeSIPRisk(fund, currentUser);
    setAiAnalysis(result);
    setIsAnalyzing(false);
  };

  const FundCard = ({ fund, highlight }: { fund: Omit<Investment, 'id' | 'currentValue'>; highlight?: boolean }) => {
    const rc = RISK_CFG[fund.riskLevel];
    const authority = isAuthorityFund(fund.title);
    return (
      <TouchableOpacity 
        style={tw`${tc.backgroundCard} border ${highlight ? 'border-emerald-500/60' : tc.borderMain} rounded-2xl p-4 mb-3`}
        activeOpacity={0.8}
        onPress={() => { setDetailFund(fund); setDetailModalVisible(true); }}
      >
        {/* Tags */}
        <View style={tw`flex-row mb-3 flex-wrap`}>
          {highlight && (
            <View style={tw`bg-emerald-500/15 border border-emerald-500/30 rounded-full px-2.5 py-0.5 flex-row items-center mr-2 mb-1`}>
              <Ionicons name="sparkles" size={10} color="#10B981" />
              <Text style={tw`text-emerald-500 text-[10px] font-bold ml-1`}>For You</Text>
            </View>
          )}
          {authority && (
            <View style={tw`bg-purple-500/15 border border-purple-500/30 rounded-full px-2.5 py-0.5 mb-1`}>
              <Text style={tw`text-purple-400 text-[10px] font-bold`}>🏛️ Verified</Text>
            </View>
          )}
        </View>

        <View style={tw`flex-row items-start mb-3`}>
          <View style={tw`bg-emerald-500/15 w-10 h-10 rounded-xl items-center justify-center mr-3`}>
            <Ionicons name={TypeIcon[fund.type]} size={18} color="#10B981" />
          </View>
          <View style={tw`flex-1`}>
            <Text style={tw`${tc.textMain} font-bold text-base leading-5`} numberOfLines={1}>{fund.title}</Text>
            <View style={tw`flex-row items-center mt-1 flex-wrap`}>
              <View style={tw`${rc.bg} border ${rc.border} rounded-md px-2 py-0.5 mr-2`}>
                <Text style={tw`${rc.text} text-[10px] font-bold`}>{rc.icon} {fund.riskLevel}</Text>
              </View>
              <Text style={tw`text-emerald-500 text-xs font-semibold`}>↑ {fund.expectedReturn}</Text>
            </View>
          </View>
          <View style={tw`items-end`}>
            <Text style={tw`${tc.textMuted} text-[10px]`}>{fund.type === 'SIP' ? 'Monthly' : 'Min.'}</Text>
            <Text style={tw`${tc.textMain} font-extrabold text-base`}>₹{fund.amount.toLocaleString()}</Text>
          </View>
        </View>

        <View style={tw`flex-row`}>
          <TouchableOpacity
            style={tw`flex-1 border border-emerald-500/40 py-2.5 rounded-xl items-center flex-row justify-center mr-2`}
            onPress={() => openAI(fund)}
          >
            <Ionicons name="hardware-chip-outline" size={14} color="#10B981" />
            <Text style={tw`text-emerald-500 font-bold text-xs ml-1`}>AI Report</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={tw`flex-1 bg-emerald-500 py-2.5 rounded-xl items-center shadow-lg shadow-emerald-500/30`}
            onPress={() => handleInvest(fund)}
          >
            <Text style={tw`text-white font-bold text-xs`}>
              {fund.type === 'SIP' ? '▶ Start SIP' : '+ Invest'}
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={tw`flex-1 ${tc.backgroundMain}`}>
      <Header title="Invest" subtitle="Curated for your risk profile" showBack={false} />

      {/* Risk profile chip */}
      {userRisk && (
        <View style={tw`mx-5 mb-2 flex-row items-center`}>
          <View style={tw`${RISK_CFG[userRisk].bg} border ${RISK_CFG[userRisk].border} flex-row items-center px-3 py-1.5 rounded-full`}>
            <Text style={tw`text-sm mr-1`}>{RISK_CFG[userRisk].icon}</Text>
            <Text style={tw`${RISK_CFG[userRisk].text} text-xs font-bold`}>{userRisk} RISK PROFILE</Text>
          </View>
        </View>
      )}

      {/* Tab bar + last updated */}
      <View style={tw`flex-row px-5 mb-3 items-center`}>
        <View style={tw`flex-row flex-1`}>
          {(['ALL', 'MF', 'SIP', 'ETF'] as const).map(tab => (
            <TouchableOpacity
              key={tab}
              style={tw`mr-2 px-4 py-2 rounded-full border ${activeTab === tab ? 'border-emerald-500 bg-emerald-500/15' : `border-transparent ${tc.backgroundSecondary}`}`}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={tw`font-bold text-xs ${activeTab === tab ? 'text-emerald-500' : tc.textMuted}`}>
                {tab === 'ALL' ? 'All' : tab === 'MF' ? 'Mutual Funds' : tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Risk Dropdown */}
      <View style={tw`px-5 mb-3`}>
        <TouchableOpacity
          style={tw`flex-row justify-between items-center ${tc.backgroundCard} border ${tc.borderMain} px-4 py-2.5 rounded-xl`}
          onPress={() => setDropdownOpen(!dropdownOpen)}
          activeOpacity={0.7}
        >
          <Text style={tw`${tc.textMain} font-semibold text-xs`}>
            Risk Level: <Text style={tw`${selectedRisk !== 'ALL' ? 'text-emerald-500 font-bold' : ''}`}>{selectedRisk === 'ALL' ? 'Any' : selectedRisk}</Text>
          </Text>
          <Ionicons name={dropdownOpen ? 'chevron-up' : 'chevron-down'} size={14} color={isDark ? '#9CA3AF' : '#6B7280'} />
        </TouchableOpacity>

        {dropdownOpen && (
          <View style={tw`mt-1 ${tc.backgroundCard} border ${tc.borderMain} rounded-xl overflow-hidden`}>
            {['ALL', 'LOW', 'MEDIUM', 'HIGH'].map((risk, i) => (
              <TouchableOpacity
                key={risk}
                style={tw`px-4 py-3 ${i > 0 ? `border-t ${tc.borderMain}` : ''}`}
                onPress={() => { setSelectedRisk(risk as any); setDropdownOpen(false); }}
              >
                <Text style={tw`${tc.textMain} text-xs font-medium ${selectedRisk === risk ? 'text-emerald-500 font-bold' : ''}`}>
                  {risk === 'ALL' ? 'Any Risk' : `${risk} Risk`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <ScrollView style={tw`flex-1 px-5`} showsVerticalScrollIndicator={false}>
        {/* My Portfolio live P&L card */}
        {investments.length > 0 && activeTab === 'ALL' && (() => {
          const totalInvested = investments.reduce((s, i) => s + i.amount, 0);
          const totalCurrent = investments.reduce((s, i) => s + i.currentValue, 0);
          const totalGain = totalCurrent - totalInvested;
          const gainPct = totalInvested > 0 ? ((totalGain / totalInvested) * 100).toFixed(2) : '0.00';
          const isProfit = totalGain >= 0;
          return (
            <View style={tw`${isProfit ? 'bg-emerald-500/10 border-emerald-500/25' : 'bg-red-500/10 border-red-500/25'} border rounded-2xl p-4 mb-4 flex-row items-center`}>
              <View style={tw`flex-1`}>
                <Text style={tw`${tc.textMuted} text-[10px] uppercase tracking-widest mb-0.5`}>My Portfolio</Text>
                <Text style={tw`${tc.textMain} font-extrabold text-xl`}>₹{totalCurrent.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</Text>
                <View style={tw`flex-row items-center mt-1`}>
                  <Ionicons name={isProfit ? 'trending-up' : 'trending-down'} size={12} color={isProfit ? '#10B981' : '#EF4444'} />
                  <Text style={tw`${isProfit ? 'text-emerald-500' : 'text-red-500'} text-xs font-bold ml-1`}>
                    {isProfit ? '+' : ''}₹{Math.abs(totalGain).toLocaleString('en-IN', { maximumFractionDigits: 0 })} ({isProfit ? '+' : ''}{gainPct}%)
                  </Text>
                </View>
              </View>
              <View style={tw`items-end`}>
                <Text style={tw`${tc.textMuted} text-[10px]`}>{investments.length} holding{investments.length !== 1 ? 's' : ''}</Text>
                <Text style={tw`${tc.textMuted} text-[10px] mt-0.5`}>Invested ₹{totalInvested.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</Text>
              </View>
            </View>
          );
        })()}
        {/* Suggested Section */}
        {suggestedFunds.length > 0 && activeTab === 'ALL' && (
          <View style={tw`mb-2`}>
            <View style={tw`flex-row items-center mb-2`}>
              <Ionicons name="sparkles" size={14} color="#10B981" />
              <Text style={tw`${tc.textMain} font-bold text-sm ml-1`}>Suggested for You</Text>
            </View>
            {suggestedFunds.map((f, i) => <FundCard key={`sug-${i}`} fund={f} highlight />)}
            <View style={tw`h-px ${tc.backgroundSecondary} my-3`} />
          </View>
        )}

        <Text style={tw`${tc.textMain} font-bold text-sm mb-3`}>
          {activeTab === 'ALL' ? 'All Funds' : activeTab === 'MF' ? 'Mutual Funds' : activeTab}{' '}
          <Text style={tw`${tc.textMuted} font-normal`}>({filteredFunds.length})</Text>
        </Text>

        {filteredFunds.map((fund, i) => (
          <FundCard key={`${activeTab}-${i}`} fund={fund} highlight={fund.riskLevel === userRisk && activeTab !== 'ALL'} />
        ))}
        <View style={tw`h-10`} />
      </ScrollView>

      {/* AI Modal */}
      <Modal animationType="slide" transparent visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={tw`flex-1 justify-end bg-black/60`}>
          <View style={tw`${tc.backgroundCard} rounded-t-3xl border-t ${tc.borderMain} max-h-[85%]`}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={tw`p-6`}>
              <View style={tw`flex-row justify-between items-center mb-4`}>
              <View style={tw`flex-row items-center`}>
                <View style={tw`bg-emerald-500 w-8 h-8 rounded-full items-center justify-center mr-2`}>
                  <Ionicons name="hardware-chip" size={16} color="#fff" />
                </View>
                <Text style={tw`${tc.textMain} font-bold text-base`}>AI Risk Analysis</Text>
              </View>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close-circle" size={26} color={isDark ? '#4B5563' : '#9CA3AF'} />
              </TouchableOpacity>
            </View>

            <Text style={tw`${tc.textMuted} text-xs mb-4`}>{selectedFund?.title} · {currentUser?.riskProfile} Risk Profile</Text>

            {isAnalyzing ? (
              <View style={tw`py-10 items-center`}>
                <ActivityIndicator size="large" color="#10B981" />
                <Text style={tw`text-emerald-500 font-medium mt-3 text-sm`}>Analyzing risk factors...</Text>
              </View>
            ) : (
              <View style={tw`bg-emerald-500/10 border border-emerald-500/25 p-4 rounded-xl mb-4`}>
                <Text style={tw`${tc.textMain} text-sm leading-6`}>{aiAnalysis}</Text>
              </View>
            )}

            <TouchableOpacity
              style={tw`${tc.backgroundSecondary} py-3 rounded-xl items-center mt-4`}
              onPress={() => setModalVisible(false)}
            >
              <Text style={tw`${tc.textMain} font-bold`}>Close</Text>
            </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Fund Detail Modal */}
      <Modal animationType="slide" transparent visible={detailModalVisible} onRequestClose={() => setDetailModalVisible(false)}>
        {detailFund && (
          <View style={tw`flex-1 justify-end bg-black/60`}>
            <View style={tw`${tc.backgroundCard} rounded-t-3xl border-t ${tc.borderMain} p-6 pb-8`}>
              <View style={tw`flex-row justify-between items-start mb-4`}>
                <View style={tw`flex-1 mr-3`}>
                  <Text style={tw`${tc.textMain} text-xl font-bold`}>{detailFund.title}</Text>
                  <Text style={tw`${tc.textSecondary} text-xs mt-1`}>{detailFund.type} · {detailFund.riskLevel} Risk</Text>
                </View>
                <TouchableOpacity onPress={() => setDetailModalVisible(false)}>
                  <Ionicons name="close-circle" size={28} color={isDark ? '#4B5563' : '#9CA3AF'} />
                </TouchableOpacity>
              </View>

              <View style={tw`flex-row flex-wrap mb-5 bg-${isDark ? 'gray-800' : 'gray-100'} p-4 rounded-2xl`}>
                {[
                  { label: 'Minimum', value: `₹${detailFund.amount.toLocaleString()}` },
                  { label: 'Returns', value: detailFund.expectedReturn },
                  { label: 'Risk', value: detailFund.riskLevel },
                  { label: 'Category', value: detailFund.type },
                ].map((item, i) => (
                  <View key={i} style={tw`w-1/2 mb-${i < 2 ? '4' : '0'}`}>
                    <Text style={tw`${tc.textMuted} text-[10px] uppercase tracking-wider mb-1`}>{item.label}</Text>
                    <Text style={tw`${tc.textMain} font-bold text-sm`}>{item.value}</Text>
                  </View>
                ))}
              </View>

              <View style={tw`flex-row mb-2 mt-2`}>
                <TouchableOpacity
                  style={tw`flex-1 border border-emerald-500/40 py-3.5 rounded-xl items-center flex-row justify-center mr-2`}
                  onPress={() => { setDetailModalVisible(false); setTimeout(() => openAI(detailFund), 300); }}
                >
                  <Ionicons name="hardware-chip-outline" size={16} color="#10B981" />
                  <Text style={tw`text-emerald-500 font-bold ml-1 text-sm`}>AI Report</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={tw`flex-1 bg-emerald-500 py-3.5 rounded-xl items-center shadow-lg shadow-emerald-500/30`}
                  onPress={() => { setDetailModalVisible(false); handleInvest(detailFund); }}
                >
                  <Text style={tw`text-white font-bold text-sm`}>
                    {detailFund.type === 'SIP' ? '▶ Start SIP' : '+ Invest Now'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </Modal>
    </SafeAreaView>
  );
};

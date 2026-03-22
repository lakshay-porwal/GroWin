import React, { useContext } from 'react';
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import tw from 'twrnc';
import { AppContext } from '../context/AppContext';
import { Ionicons } from '@expo/vector-icons';
import { RiskProfile } from '../types';
import { getThemeClasses } from '../utils/theme';
import { Header } from '../components/Header';

export const DashboardScreen = ({ navigation }: any) => {
  const { user, walletBalance, investments, expenses, transactions, theme, toggleTheme } = useContext(AppContext);
  const tc = getThemeClasses(theme);

  const totalInvestments = investments.reduce((sum, inv) => sum + inv.currentValue, 0);
  const thisMonthExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  const getAIInsight = (profile: RiskProfile) => {
    if (profile === 'LOW') {
      return "You prefer safety. Consider starting a ₹500/month SIP in a low-risk Debt Fund. It provides stable returns with minimal risk.";
    } else if (profile === 'MEDIUM') {
      return "You are a balanced investor. A ₹1000/month SIP in an Index Fund would give you steady growth with moderate risk.";
    } else {
      return "You have high risk tolerance! Directing 20% of your wallet balance to a Small-Cap Mutual Fund could maximize your long-term growth.";
    }
  };

  return (
    <SafeAreaView style={tw`flex-1 ${tc.backgroundMain}`}>
      <Header title="GroWin" />

      <ScrollView showsVerticalScrollIndicator={false} style={tw`flex-1`}>
        {/* Welcome */}
        <View style={tw`p-6 pt-6 flex-row justify-between items-center`}>
          <View>
            <Text style={tw`${tc.textSecondary} font-medium`}>Welcome back,</Text>
            <Text style={tw`text-2xl font-bold ${tc.textMain} mt-1`}>{user.name}</Text>
          </View>
          <TouchableOpacity style={tw`bg-emerald-500/20 p-2 rounded-full`} onPress={() => navigation.navigate('Wallet')}>
             <Ionicons name="wallet" size={24} color="#10B981" />
          </TouchableOpacity>
        </View>

        {/* Dynamic Image Banner */}
        <View style={tw`px-6 mb-6`}>
           <View style={tw`w-full h-32 rounded-3xl overflow-hidden shadow-lg border ${tc.borderEmeraldTint}`}>
             <Image 
               source={require('../../assets/finance_banner.png')} 
               style={tw`w-full h-full opacity-80 bg-emerald-900`}
               resizeMode="cover"
             />
             <View style={tw`absolute inset-0 p-5 justify-center`}>
               <Text style={tw`text-white font-bold text-lg`}>Automate Your Wealth</Text>
               <Text style={tw`text-emerald-100 text-xs mt-1 max-w-[70%]`}>Let AI find the perfect SIP strategies for your specific risk profile.</Text>
             </View>
           </View>
        </View>

        {/* Balances */}
        <View style={tw`px-6 mb-8`}>
          <View style={tw`bg-emerald-900 border border-emerald-500 p-6 rounded-3xl shadow-lg relative overflow-hidden`}>
            <View style={tw`absolute -right-4 -top-4 opacity-20`}>
               <Ionicons name="trending-up" size={100} color="#10B981" />
            </View>
            <Text style={tw`text-emerald-300 font-medium mb-1`}>Total Balance</Text>
            <Text style={tw`text-4xl font-extrabold text-white`}>₹{walletBalance.toLocaleString()}</Text>
            
            <View style={tw`flex-row mt-6 pt-4 border-t border-emerald-500/30`}>
              <View style={tw`flex-1`}>
                <Text style={tw`text-emerald-300 font-medium text-xs`}>Invested</Text>
                <Text style={tw`text-white font-bold text-lg`}>₹{totalInvestments.toLocaleString()}</Text>
              </View>
              <View style={tw`flex-1 border-l border-emerald-500/30 pl-4`}>
                <Text style={tw`text-emerald-300 font-medium text-xs`}>Spent (This Month)</Text>
                <Text style={tw`text-white font-bold text-lg`}>₹{thisMonthExpenses.toLocaleString()}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Floating AI Call to action */}
        <View style={tw`px-6 mb-8`}>
          <TouchableOpacity 
            onPress={() => navigation.navigate('ChatBot')}
            style={tw`${tc.backgroundCard} border ${tc.borderEmeraldTint} p-4 rounded-2xl flex-row items-center justify-between shadow-sm shadow-emerald-500/10`}
          >
            <View style={tw`flex-row items-center flex-1`}>
              <View style={tw`bg-emerald-500/20 p-2 rounded-full mr-3 border border-emerald-500/30`}>
                <Ionicons name="hardware-chip" size={24} color="#10B981" />
              </View>
              <View style={tw`flex-1`}>
                <Text style={tw`font-bold ${tc.textMain} text-base`}>Ask GroWin AI Advisor</Text>
                <Text style={tw`${tc.textSecondary} text-xs mt-0.5`}>Get personalized SIP suggestions based on your profile.</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#10B981" />
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={tw`px-6 mb-8 flex-row justify-between`}>
          <TouchableOpacity 
            style={tw`${tc.backgroundCard} border ${tc.borderMain} flex-1 p-4 rounded-2xl items-center mr-2 shadow-sm shadow-black/5`}
            onPress={() => navigation.navigate('Investments')}
          >
            <Ionicons name="trending-up" size={28} color="#10B981" style={tw`mb-2`} />
            <Text style={tw`${tc.textMain} font-medium`}>Invest</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={tw`${tc.backgroundCard} border ${tc.borderMain} flex-1 p-4 rounded-2xl items-center mx-2 shadow-sm shadow-black/5`}
            onPress={() => navigation.navigate('Expenses')}
          >
            <Ionicons name="pie-chart" size={28} color="#F59E0B" style={tw`mb-2`} />
            <Text style={tw`${tc.textMain} font-medium`}>Track</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={tw`${tc.backgroundCard} border ${tc.borderMain} flex-1 p-4 rounded-2xl items-center ml-2 shadow-sm shadow-black/5`}
            onPress={() => navigation.navigate('Goals')}
          >
            <Ionicons name="flag" size={28} color="#3B82F6" style={tw`mb-2`} />
            <Text style={tw`${tc.textMain} font-medium`}>Goals</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Transactions Preview */}
        <View style={tw`px-6 mb-8`}>
          <View style={tw`flex-row justify-between items-center mb-4`}>
            <Text style={tw`${tc.textMain} font-bold text-lg`}>Recent Activity</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Wallet')}>
              <Text style={tw`text-emerald-500 font-medium`}>View All</Text>
            </TouchableOpacity>
          </View>
          
          {transactions.length === 0 ? (
            <View style={tw`${tc.backgroundCard} border ${tc.borderMain} p-6 rounded-2xl items-center`}>
              <Text style={tw`${tc.textSecondary}`}>No recent activity yet</Text>
            </View>
          ) : (
            transactions.slice(0, 3).map((tx) => (
              <View key={tx.id} style={tw`${tc.backgroundCard} border ${tc.borderMain} p-4 rounded-2xl mb-3 flex-row justify-between items-center shadow-sm shadow-black/5`}>
                <View style={tw`flex-row items-center`}>
                  <View style={tw`${tx.type === 'CREDIT' ? 'bg-emerald-500/20' : 'bg-red-500/20'} p-3 rounded-xl mr-4`}>
                    <Ionicons name={tx.type === 'CREDIT' ? 'arrow-down' : 'arrow-up'} size={20} color={tx.type === 'CREDIT' ? '#10B981' : '#EF4444'} />
                  </View>
                  <View>
                    <Text style={tw`${tc.textMain} font-medium mb-1`}>{tx.title}</Text>
                    <Text style={tw`${tc.textMuted} text-xs`}>{new Date(tx.date).toLocaleDateString()}</Text>
                  </View>
                </View>
                <Text style={tw`${tx.type === 'CREDIT' ? 'text-emerald-500' : tc.textMain} font-bold`}>
                  {tx.type === 'CREDIT' ? '+' : '-'}₹{tx.amount.toLocaleString()}
                </Text>
              </View>
            ))
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

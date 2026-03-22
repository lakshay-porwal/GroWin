import React, { useState, useContext } from 'react';
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity, TextInput, Modal, Dimensions } from 'react-native';
import tw from 'twrnc';
import { AppContext } from '../context/AppContext';
import { Ionicons } from '@expo/vector-icons';
import { PieChart } from 'react-native-chart-kit';
import { getThemeClasses } from '../utils/theme';
import { Header } from '../components/Header';

const CATEGORIES = ['Food', 'Travel', 'Shopping', 'Subscriptions', 'Others'];
const CATEGORY_COLORS: { [key: string]: string } = {
  'Food': '#F59E0B',        // Amber
  'Travel': '#3B82F6',      // Blue
  'Shopping': '#EC4899',    // Pink
  'Subscriptions': '#8B5CF6', // Purple
  'Others': '#9CA3AF'       // Gray
};

export const ExpenseScreen = () => {
  const { expenses, addExpense, walletBalance, theme } = useContext(AppContext);
  const tc = getThemeClasses(theme);
  
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);

  const thisMonthExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  const handleAddExpense = () => {
    const num = parseFloat(amount);
    if (!isNaN(num) && num > 0 && title.trim()) {
      addExpense({
        title,
        amount: num,
        category,
        date: new Date().toISOString()
      });
      setTitle('');
      setAmount('');
      setCategory(CATEGORIES[0]);
      setModalVisible(false);
    }
  };

  const chartData = CATEGORIES.map(cat => {
    const totalCat = expenses.filter(e => e.category === cat).reduce((sum, e) => sum + e.amount, 0);
    return {
      name: cat,
      population: totalCat,
      color: CATEGORY_COLORS[cat],
      legendFontColor: theme === 'dark' ? '#9CA3AF' : '#6B7280',
      legendFontSize: 12
    };
  }).filter(d => d.population > 0);

  return (
    <SafeAreaView style={tw`flex-1 ${tc.backgroundMain}`}>
      <Header title="Expenses" subtitle="Track your monthly spending" />
      <View style={tw`px-6 pb-2 flex-row justify-end items-center -mt-8 mb-4 z-10`} pointerEvents="box-none">
        <TouchableOpacity 
          style={tw`bg-emerald-500 p-3 rounded-xl shadow-lg shadow-emerald-500/30 ml-auto`}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={tw`flex-1 px-6`} showsVerticalScrollIndicator={false}>
        <View style={tw`${tc.backgroundCard} border ${tc.borderMain} p-6 rounded-3xl mb-6 shadow-sm shadow-black/5`}>
          <Text style={tw`${tc.textSecondary} font-medium mb-1`}>This Month</Text>
          <Text style={tw`text-4xl font-extrabold ${tc.textMain}`}>₹{thisMonthExpenses.toLocaleString()}</Text>
          
          {thisMonthExpenses > 0 && chartData.length > 0 ? (
            <View style={tw`mt-6 items-center`}>
              <PieChart
                data={chartData}
                width={Dimensions.get('window').width - 80}
                height={180}
                chartConfig={{
                  color: (opacity = 1) => theme === 'dark' ? `rgba(255, 255, 255, ${opacity})` : `rgba(0, 0, 0, ${opacity})`,
                }}
                accessor={"population"}
                backgroundColor={"transparent"}
                paddingLeft={"0"}
                center={[10, 0]}
                absolute
              />
            </View>
          ) : (
            <View style={tw`mt-6 items-center ${tc.backgroundSecondary} p-6 rounded-2xl border ${tc.borderSecondary}`}>
              <Ionicons name="pie-chart-outline" size={48} color={theme === 'dark' ? '#4B5563' : '#9CA3AF'} />
              <Text style={tw`${tc.textMuted} mt-2`}>No expenses recorded yet</Text>
            </View>
          )}

          {walletBalance > 0 && thisMonthExpenses < walletBalance * 0.2 && (
            <View style={tw`mt-6 bg-emerald-500/20 p-3 rounded-xl flex-row items-center border border-emerald-500/30`}>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" style={tw`mr-2`} />
              <Text style={tw`text-emerald-500 flex-1`}>Great! You are spending within limits.</Text>
            </View>
          )}
        </View>

        <Text style={tw`${tc.textMain} font-bold text-lg mb-4`}>Recent Expenses</Text>
        {expenses.length === 0 ? (
          <View style={tw`${tc.backgroundCard} border ${tc.borderMain} p-8 rounded-2xl items-center`}>
            <Text style={tw`${tc.textSecondary}`}>Your transactions will appear here.</Text>
          </View>
        ) : (
          expenses.slice().reverse().map(exp => (
            <View key={exp.id} style={tw`${tc.backgroundCard} border ${tc.borderMain} p-4 rounded-2xl mb-3 flex-row justify-between items-center shadow-sm shadow-black/5`}>
              <View style={tw`flex-row items-center flex-1`}>
                <View style={[tw`w-12 h-12 rounded-xl items-center justify-center mr-4`, {backgroundColor: CATEGORY_COLORS[exp.category] + '20'}]}>
                  <Ionicons 
                    name={
                      exp.category === 'Food' ? 'restaurant' : 
                      exp.category === 'Travel' ? 'airplane' : 
                      exp.category === 'Shopping' ? 'cart' : 
                      exp.category === 'Subscriptions' ? 'play-circle' : 'receipt'
                    } 
                    size={20} 
                    color={CATEGORY_COLORS[exp.category]} 
                  />
                </View>
                <View style={tw`flex-1 mr-2`}>
                  <Text style={tw`${tc.textMain} font-medium text-base mb-0.5`} numberOfLines={1}>{exp.title}</Text>
                  <Text style={tw`${tc.textMuted} text-xs`}>{exp.category} • {new Date(exp.date).toLocaleDateString()}</Text>
                </View>
              </View>
              <Text style={tw`text-red-500 font-bold text-lg`}>-₹{exp.amount.toLocaleString()}</Text>
            </View>
          ))
        )}
        <View style={tw`h-10`} />
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={tw`flex-1 justify-end bg-black/60`}>
          <View style={tw`${tc.backgroundCard} rounded-t-3xl p-6 border-t ${tc.borderMain} h-[80%]`}>
            <View style={tw`flex-row justify-between items-center mb-6`}>
              <Text style={tw`text-2xl font-bold ${tc.textMain}`}>Add Expense</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={tw`${tc.backgroundSecondary} p-2 rounded-full`}>
                <Ionicons name="close" size={24} color={theme === 'dark' ? '#9CA3AF' : '#6B7280'} />
              </TouchableOpacity>
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={tw`${tc.textSecondary} mb-2 font-medium ml-1`}>Amount</Text>
              <View style={tw`${tc.inputBackground} rounded-2xl flex-row items-center px-4 py-2 border ${tc.borderSecondary} mb-6`}>
                <Text style={tw`text-2xl ${tc.textMain} font-bold mr-2`}>₹</Text>
                <TextInput
                  style={tw`flex-1 ${tc.inputText} text-2xl font-bold py-3`}
                  placeholder="0"
                  placeholderTextColor={theme === 'dark' ? '#4B5563' : '#9CA3AF'}
                  keyboardType="numeric"
                  value={amount}
                  onChangeText={setAmount}
                  autoFocus
                />
              </View>

              <Text style={tw`${tc.textSecondary} mb-2 font-medium ml-1`}>What was this for?</Text>
              <View style={tw`${tc.inputBackground} rounded-2xl flex-row items-center px-4 mb-6 border ${tc.borderSecondary}`}>
                <Ionicons name="pencil" size={20} color={theme === 'dark' ? '#9CA3AF' : '#6B7280'} style={tw`mr-3`} />
                <TextInput
                  style={tw`flex-1 ${tc.inputText} text-base py-4`}
                  placeholder="e.g. Netflix, Pizza..."
                  placeholderTextColor={theme === 'dark' ? '#4B5563' : '#9CA3AF'}
                  value={title}
                  onChangeText={setTitle}
                />
              </View>
              
              <Text style={tw`${tc.textSecondary} mb-3 font-medium ml-1`}>Category</Text>
              <View style={tw`flex-row flex-wrap justify-between gap-2 mb-8`}>
                {CATEGORIES.map(cat => (
                  <TouchableOpacity 
                    key={cat}
                    style={[
                      tw`px-4 py-3 rounded-xl border mb-2`, 
                      category === cat ? tw`bg-emerald-500 border-emerald-500` : tw`${tc.backgroundSecondary} ${tc.borderSecondary}`
                    ]}
                    onPress={() => setCategory(cat)}
                  >
                    <Text style={[tw`font-medium`, category === cat ? tw`text-white` : tw`${tc.textSecondary}`]}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity 
                style={tw`${!amount || !title ? tc.backgroundSecondary : 'bg-emerald-500'} py-4 items-center rounded-xl shadow-md ${!amount || !title ? '' : 'shadow-emerald-500/30'}`}
                onPress={handleAddExpense}
                disabled={!amount || !title}
              >
                <Text style={tw`${!amount || !title ? tc.textMuted : 'text-white'} font-bold text-lg`}>Save Expense</Text>
              </TouchableOpacity>
              <View style={tw`h-10`} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

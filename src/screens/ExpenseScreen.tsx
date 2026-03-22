import React, { useState, useContext } from 'react';
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity, TextInput, Modal, Dimensions } from 'react-native';
import tw from 'twrnc';
import { AppContext } from '../context/AppContext';
import { Ionicons } from '@expo/vector-icons';
import { PieChart } from 'react-native-chart-kit';

const CATEGORIES = ['Food', 'Travel', 'Shopping', 'Subscriptions', 'Others'];
const CATEGORY_COLORS: { [key: string]: string } = {
  'Food': '#F59E0B',        // Amber
  'Travel': '#3B82F6',      // Blue
  'Shopping': '#EC4899',    // Pink
  'Subscriptions': '#8B5CF6', // Purple
  'Others': '#9CA3AF'       // Gray
};

export const ExpenseScreen = () => {
  const { expenses, addExpense, walletBalance } = useContext(AppContext);
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

  // Prepare chart data
  const chartData = CATEGORIES.map(cat => {
    const totalCat = expenses.filter(e => e.category === cat).reduce((sum, e) => sum + e.amount, 0);
    return {
      name: cat,
      population: totalCat,
      color: CATEGORY_COLORS[cat],
      legendFontColor: '#9CA3AF',
      legendFontSize: 12
    };
  }).filter(d => d.population > 0);

  return (
    <SafeAreaView style={tw`flex-1 bg-gray-950`}>
      <View style={tw`p-6 pt-8 pb-2 flex-row justify-between items-center`}>
        <View>
          <Text style={tw`text-3xl font-bold text-white mb-1`}>Expenses</Text>
          <Text style={tw`text-gray-400`}>Track your monthly spending</Text>
        </View>
        <TouchableOpacity 
          style={tw`bg-emerald-500 p-3 rounded-xl shadow-lg shadow-emerald-500/30`}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={tw`flex-1 px-6`} showsVerticalScrollIndicator={false}>
        {/* Total Expenses Card */}
        <View style={tw`bg-gray-900 border border-gray-800 p-6 rounded-3xl mb-6 shadow-md`}>
          <Text style={tw`text-gray-400 font-medium mb-1`}>This Month</Text>
          <Text style={tw`text-4xl font-extrabold text-white`}>₹{thisMonthExpenses.toLocaleString()}</Text>
          
          {thisMonthExpenses > 0 && chartData.length > 0 ? (
            <View style={tw`mt-6 items-center`}>
              <PieChart
                data={chartData}
                width={Dimensions.get('window').width - 80}
                height={180}
                chartConfig={{
                  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                }}
                accessor={"population"}
                backgroundColor={"transparent"}
                paddingLeft={"0"}
                center={[10, 0]}
                absolute
              />
            </View>
          ) : (
            <View style={tw`mt-6 items-center bg-gray-800/50 p-6 rounded-2xl`}>
              <Ionicons name="pie-chart-outline" size={48} color="#4B5563" />
              <Text style={tw`text-gray-500 mt-2`}>No expenses recorded yet</Text>
            </View>
          )}

          {walletBalance > 0 && thisMonthExpenses < walletBalance * 0.2 && (
            <View style={tw`mt-6 bg-emerald-500/20 p-3 rounded-xl flex-row items-center border border-emerald-500/30`}>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" style={tw`mr-2`} />
              <Text style={tw`text-emerald-400 flex-1`}>Great! You are spending within limits.</Text>
            </View>
          )}
        </View>

        {/* Recent Expenses List */}
        <Text style={tw`text-white font-bold text-lg mb-4`}>Recent Expenses</Text>
        {expenses.length === 0 ? (
          <View style={tw`bg-gray-900 border border-gray-800 p-8 rounded-2xl items-center`}>
            <Text style={tw`text-gray-400`}>Your transactions will appear here.</Text>
          </View>
        ) : (
          expenses.slice().reverse().map(exp => (
            <View key={exp.id} style={tw`bg-gray-900 border border-gray-800 p-4 rounded-2xl mb-3 flex-row justify-between items-center`}>
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
                  <Text style={tw`text-white font-medium text-base mb-0.5`} numberOfLines={1}>{exp.title}</Text>
                  <Text style={tw`text-gray-500 text-xs`}>{exp.category} • {new Date(exp.date).toLocaleDateString()}</Text>
                </View>
              </View>
              <Text style={tw`text-red-400 font-bold text-lg`}>-₹{exp.amount.toLocaleString()}</Text>
            </View>
          ))
        )}
        <View style={tw`h-10`} />
      </ScrollView>

      {/* Add Expense Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={tw`flex-1 justify-end bg-black/80`}>
          <View style={tw`bg-gray-900 rounded-t-3xl p-6 border-t border-gray-800 h-[80%]`}>
            <View style={tw`flex-row justify-between items-center mb-6`}>
              <Text style={tw`text-2xl font-bold text-white`}>Add Expense</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={tw`bg-gray-800 p-2 rounded-full`}>
                <Ionicons name="close" size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={tw`text-gray-400 mb-2 font-medium ml-1`}>Amount</Text>
              <View style={tw`bg-gray-800 rounded-2xl flex-row items-center px-4 py-2 border border-gray-700 mb-6`}>
                <Text style={tw`text-2xl text-white font-bold mr-2`}>₹</Text>
                <TextInput
                  style={tw`flex-1 text-white text-2xl font-bold py-3`}
                  placeholder="0"
                  placeholderTextColor="#4B5563"
                  keyboardType="numeric"
                  value={amount}
                  onChangeText={setAmount}
                  autoFocus
                />
              </View>

              <Text style={tw`text-gray-400 mb-2 font-medium ml-1`}>What was this for?</Text>
              <View style={tw`bg-gray-800 rounded-2xl flex-row items-center px-4 mb-6 border border-gray-700`}>
                <Ionicons name="pencil" size={20} color="#9CA3AF" style={tw`mr-3`} />
                <TextInput
                  style={tw`flex-1 text-white text-base py-4`}
                  placeholder="e.g. Netflix, Pizza..."
                  placeholderTextColor="#4B5563"
                  value={title}
                  onChangeText={setTitle}
                />
              </View>
              
              <Text style={tw`text-gray-400 mb-3 font-medium ml-1`}>Category</Text>
              <View style={tw`flex-row flex-wrap justify-between gap-2 mb-8`}>
                {CATEGORIES.map(cat => (
                  <TouchableOpacity 
                    key={cat}
                    style={[
                      tw`px-4 py-3 rounded-xl border mb-2`, 
                      category === cat ? tw`bg-emerald-500 border-emerald-500` : tw`bg-gray-800 border-gray-700`
                    ]}
                    onPress={() => setCategory(cat)}
                  >
                    <Text style={[tw`font-medium`, category === cat ? tw`text-white` : tw`text-gray-400`]}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity 
                style={tw`${!amount || !title ? 'bg-gray-800' : 'bg-emerald-500'} py-4 items-center rounded-xl shadow-md ${!amount || !title ? '' : 'shadow-emerald-500/30'}`}
                onPress={handleAddExpense}
                disabled={!amount || !title}
              >
                <Text style={tw`${!amount || !title ? 'text-gray-500' : 'text-white'} font-bold text-lg`}>Save Expense</Text>
              </TouchableOpacity>
              <View style={tw`h-10`} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

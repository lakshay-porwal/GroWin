import React, { useState } from 'react';
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity, LayoutAnimation, UIManager, Platform } from 'react-native';
import tw from 'twrnc';
import { Ionicons } from '@expo/vector-icons';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const MODULES = [
  {
    id: 1,
    title: "What is a Mutual Fund?",
    icon: "briefcase",
    content: "A Mutual Fund is like a pool of money collected from many investors to invest in stocks, bonds, or other assets. Instead of you picking individual stocks, professional fund managers do all the hard work for you. It's safe, regulated, and perfect for beginners to start growing their wealth."
  },
  {
    id: 2,
    title: "What is an SIP?",
    icon: "calendar",
    content: "SIP stands for Systematic Investment Plan. It allows you to invest a small, fixed amount (like ₹500) every month into a Mutual Fund. It helps build a discipline of saving and benefits from 'rupee cost averaging', meaning you buy more units when the market is down and fewer when it's up."
  },
  {
    id: 3,
    title: "Why long-term investing works?",
    icon: "infinite",
    content: "The magic is in 'Compound Interest'. When you invest long-term, you earn returns not just on your original money, but also on the returns you've already made. Over 5 to 10 years, even small amounts like ₹1000/month can grow into massive savings. Patience is your biggest superpower!"
  },
  {
    id: 4,
    title: "Understanding Risk",
    icon: "warning",
    content: "Every investment carries some risk. Low risk means your money is safe but grows slowly (like debt funds or gold). High risk means your money can fluctuate perfectly fine but can give much higher returns over a long period (like small-cap equity funds). GroWin's AI helps you find the right balance."
  }
];

export const LearningScreen = () => {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const toggleExpand = (id: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-gray-950`}>
      <View style={tw`p-6 pt-8 pb-4`}>
        <Text style={tw`text-3xl font-bold text-white mb-1`}>Learn</Text>
        <Text style={tw`text-gray-400`}>Mini-lessons to level up your financial IQ 🧠</Text>
      </View>

      <ScrollView style={tw`flex-1 px-6`} showsVerticalScrollIndicator={false}>
        {MODULES.map((module) => {
          const isExpanded = expandedId === module.id;
          return (
            <TouchableOpacity 
              key={module.id} 
              style={tw`bg-gray-900 border ${isExpanded ? 'border-emerald-500/50' : 'border-gray-800'} p-5 rounded-3xl mb-4 shadow-sm`}
              onPress={() => toggleExpand(module.id)}
              activeOpacity={0.8}
            >
              <View style={tw`flex-row justify-between items-center`}>
                <View style={tw`flex-row items-center flex-1 pr-4`}>
                  <View style={tw`bg-emerald-500/10 p-3 rounded-xl mr-4 border border-emerald-500/20`}>
                    <Ionicons name={module.icon as any} size={24} color="#10B981" />
                  </View>
                  <Text style={tw`text-lg font-bold text-white flex-1`} numberOfLines={isExpanded ? undefined : 1}>
                    {module.title}
                  </Text>
                </View>
                <Ionicons 
                  name={isExpanded ? 'chevron-up' : 'chevron-down'} 
                  size={20} 
                  color="#9CA3AF" 
                />
              </View>

              {isExpanded && (
                <View style={tw`mt-4 pt-4 border-t border-gray-800`}>
                  <Text style={tw`text-gray-300 leading-relaxed text-base`}>
                    {module.content}
                  </Text>
                  <View style={tw`mt-4 flex-row justify-end`}>
                    <Text style={tw`text-emerald-500 font-bold text-sm`}>+10 IQ Points</Text>
                  </View>
                </View>
              )}
            </TouchableOpacity>
          );
        })}

        <View style={tw`bg-emerald-900/40 border border-emerald-500/30 p-6 rounded-3xl mt-4 flex-row items-center mb-10`}>
          <View style={tw`bg-emerald-500 p-3 rounded-full mr-4 shadow-lg shadow-emerald-500/40`}>
            <Ionicons name="school" size={28} color="#FFF" />
          </View>
          <View style={tw`flex-1`}>
            <Text style={tw`text-white font-bold text-lg mb-1`}>Keep Learning!</Text>
            <Text style={tw`text-emerald-200 text-sm leading-tight`}>
              "An investment in knowledge pays the best interest." - Benjamin Franklin
            </Text>
          </View>
        </View>
        <View style={tw`h-10`} />
      </ScrollView>
    </SafeAreaView>
  );
};

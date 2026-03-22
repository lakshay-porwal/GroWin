import React, { useState, useContext } from 'react';
import {
  View, Text, ScrollView, SafeAreaView, TouchableOpacity,
  LayoutAnimation, UIManager, Platform,
} from 'react-native';
import tw from 'twrnc';
import { Ionicons } from '@expo/vector-icons';
import { AppContext } from '../context/AppContext';
import { getThemeClasses } from '../utils/theme';
import { Header } from '../components/Header';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const MODULES = [
  {
    id: 1,
    title: 'What is a Mutual Fund?',
    icon: 'briefcase' as const,
    tag: 'Basics',
    readTime: '3 min',
    color: '#10B981',
    content: 'A Mutual Fund is a pool of money from thousands of investors managed by professional fund managers. They invest in diversified stocks, bonds, and securities so you don\'t need to pick individual stocks. It\'s SEBI-regulated, systematic, and perfect for students starting their wealth journey.',
  },
  {
    id: 2,
    title: 'What is an SIP?',
    icon: 'calendar' as const,
    tag: 'Strategy',
    readTime: '4 min',
    color: '#3B82F6',
    content: 'SIP (Systematic Investment Plan) lets you invest a fixed amount monthly — even ₹100 — into a Mutual Fund. You benefit from Rupee Cost Averaging (buying more units when markets are low) and compound interest. Small amounts over time = massive wealth.',
  },
  {
    id: 3,
    title: 'Power of Compounding',
    icon: 'infinite' as const,
    tag: 'Growth',
    readTime: '5 min',
    color: '#F59E0B',
    content: 'Einstein called compound interest the "8th wonder of the world." ₹1,000/month at 12% p.a. for 10 years = ₹2.3 Lakhs invested → becomes ₹4.2 Lakhs. For 20 years? ₹9.9 Lakhs invested → becomes ₹39 Lakhs. Time is your biggest advantage — start NOW.',
  },
  {
    id: 4,
    title: 'Understanding Risk Levels',
    icon: 'shield-checkmark' as const,
    tag: 'Risk',
    readTime: '4 min',
    color: '#EF4444',
    content: '🛡️ LOW RISK (Debt Funds, Gold ETFs) — capital protected, 5-8% returns.\n⚖️ MEDIUM RISK (Index Funds, Balanced Funds) — 10-13% returns with moderate volatility.\n🚀 HIGH RISK (Small-Cap, Sectoral MFs) — 15-20%+ potential but high short-term swings. GroWin AI helps you choose the right one.',
  },
];

export const LearningScreen = () => {
  const { theme } = useContext(AppContext);
  const tc = getThemeClasses(theme);
  const isDark = theme === 'dark';
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const toggle = (id: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <SafeAreaView style={tw`flex-1 ${tc.backgroundMain}`}>
      <Header title="Learn" subtitle="Level up your financial IQ" />

      <ScrollView style={tw`flex-1 px-5 pt-2`} showsVerticalScrollIndicator={false}>
        {/* XP Banner */}
        <View style={tw`bg-emerald-600 rounded-3xl p-5 mb-5 overflow-hidden`}>
          <View style={tw`absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/10`} />
          <Text style={tw`text-white font-extrabold text-lg`}>📚 Finance Academy</Text>
          <Text style={tw`text-emerald-100 text-xs mt-1`}>Read lessons, earn IQ points, invest smarter</Text>
          <View style={tw`flex-row mt-3 items-center`}>
            <View style={tw`bg-white/20 rounded-full px-3 py-1 mr-2`}>
              <Text style={tw`text-white text-xs font-bold`}>🧠 {expandedId !== null ? 10 * MODULES.length : 0} IQ Points</Text>
            </View>
            <Text style={tw`text-emerald-200 text-xs`}>{MODULES.length} lessons available</Text>
          </View>
        </View>

        {MODULES.map(mod => {
          const expanded = expandedId === mod.id;
          return (
            <TouchableOpacity
              key={mod.id}
              style={tw`${tc.backgroundCard} border ${expanded ? 'border-emerald-500/60' : tc.borderMain} rounded-2xl p-4 mb-3`}
              onPress={() => toggle(mod.id)}
              activeOpacity={0.8}
            >
              <View style={tw`flex-row items-center`}>
                <View style={[tw`w-11 h-11 rounded-xl items-center justify-center mr-3`, { backgroundColor: mod.color + '22' }]}>
                  <Ionicons name={mod.icon} size={21} color={mod.color} />
                </View>
                <View style={tw`flex-1`}>
                  <Text style={tw`${tc.textMain} font-bold text-sm`} numberOfLines={expanded ? undefined : 1}>{mod.title}</Text>
                  <View style={tw`flex-row items-center mt-1`}>
                    <View style={[tw`px-2 py-0.5 rounded-full mr-2`, { backgroundColor: mod.color + '22' }]}>
                      <Text style={[tw`text-[10px] font-bold`, { color: mod.color }]}>{mod.tag}</Text>
                    </View>
                    <Text style={tw`${tc.textMuted} text-[10px]`}>⏱ {mod.readTime} read</Text>
                  </View>
                </View>
                <Ionicons
                  name={expanded ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color={isDark ? '#4B5563' : '#9CA3AF'}
                />
              </View>

              {expanded && (
                <View style={tw`mt-4 pt-4 border-t ${tc.borderMain}`}>
                  <Text style={tw`${tc.textSecondary} text-sm leading-6`}>{mod.content}</Text>
                  <View style={tw`flex-row items-center mt-3`}>
                    <Ionicons name="star" size={14} color="#F59E0B" />
                    <Text style={tw`text-amber-500 font-bold text-xs ml-1`}>+10 IQ Points earned!</Text>
                  </View>
                </View>
              )}
            </TouchableOpacity>
          );
        })}

        {/* Quote banner */}
        <View style={tw`bg-${isDark ? 'gray-800' : 'gray-100'} border ${tc.borderMain} rounded-2xl p-5 mt-2 mb-10`}>
          <Text style={tw`text-2xl mb-2`}>💬</Text>
          <Text style={tw`${tc.textMain} font-bold text-sm leading-5`}>"An investment in knowledge pays the best interest."</Text>
          <Text style={tw`${tc.textSecondary} text-xs mt-1`}>— Benjamin Franklin</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

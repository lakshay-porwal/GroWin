import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import tw from 'twrnc';
import { AppContext } from '../context/AppContext';
import { RiskProfile, RiskProfileValue } from '../types';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const QUESTIONS = [
  {
    question: "What's your primary investment goal?",
    options: [
      { text: '🛡️ Keep my money safe above all', score: 1 },
      { text: '⚖️ Grow steadily with some risk', score: 2 },
      { text: '🚀 Maximum returns, I can handle swings', score: 3 },
    ],
  },
  {
    question: 'Your investment drops 15% in a month. You…',
    options: [
      { text: '😰 Sell everything — too stressful', score: 1 },
      { text: '😐 Hold, wait for recovery', score: 2 },
      { text: '😀 Buy more — great opportunity!', score: 3 },
    ],
  },
  {
    question: 'How long do you plan to stay invested?',
    options: [
      { text: '⏱️ Less than 1 year', score: 1 },
      { text: '📅 1–3 years', score: 2 },
      { text: '📈 3+ years', score: 3 },
    ],
  },
];

const PROFILE_RESULT: Record<RiskProfileValue, { icon: string; label: string; color: string; bg: string; border: string; desc: string }> = {
  LOW:    { icon: '🛡️', label: 'Conservative Investor', color: '#3B82F6', bg: 'bg-blue-500/20', border: 'border-blue-500/40', desc: 'You value safety. We\'ll suggest stable debt funds & gold ETFs.' },
  MEDIUM: { icon: '⚖️', label: 'Balanced Investor',     color: '#F59E0B', bg: 'bg-amber-500/20', border: 'border-amber-500/40', desc: 'Smart and measured. Index funds and balanced SIPs fit you well.' },
  HIGH:   { icon: '🚀', label: 'Aggressive Investor',   color: '#EF4444', bg: 'bg-red-500/20',   border: 'border-red-500/40',   desc: 'You\'re bold! Small-caps and sectoral funds are your arena.' },
};

export const OnboardingScreen = () => {
  const { setRiskProfile, currentUser } = useContext(AppContext);
  const navigation = useNavigation<any>();
  const [currentStep, setCurrentStep] = React.useState(0);
  const [scores, setScores] = React.useState<number[]>([]);
  const [result, setResult] = React.useState<RiskProfileValue | null>(null);
  const [saving, setSaving] = React.useState(false);

  const handleOption = (score: number) => {
    const newScores = [...scores, score];
    setScores(newScores);
    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep(s => s + 1);
    } else {
      const total = newScores.reduce((a, b) => a + b, 0);
      const profile: RiskProfileValue = total >= 7 ? 'HIGH' : total >= 5 ? 'MEDIUM' : 'LOW';
      setResult(profile);
    }
  };

  const confirmProfile = async () => {
    if (!result) return;
    setSaving(true);
    await setRiskProfile(result);
    setSaving(false);
  };

  const pct = ((currentStep + 1) / QUESTIONS.length) * 100;

  // — Result screen
  if (result) {
    const cfg = PROFILE_RESULT[result];
    return (
      <SafeAreaView style={tw`flex-1 bg-gray-950`}>
        <ScrollView contentContainerStyle={tw`flex-grow px-6 items-center justify-center py-6`} showsVerticalScrollIndicator={false}>
          <View style={tw`${cfg.bg} border ${cfg.border} w-24 h-24 rounded-full items-center justify-center mb-6`}>
            <Text style={tw`text-5xl`}>{cfg.icon}</Text>
          </View>
          <Text style={tw`text-white text-3xl font-extrabold text-center mb-2`}>{cfg.label}</Text>
          <Text style={tw`text-gray-400 text-base text-center mb-8 px-4`}>{cfg.desc}</Text>

          <View style={tw`w-full bg-gray-900 border border-gray-800 rounded-2xl p-4 mb-8`}>
            {(['LOW', 'MEDIUM', 'HIGH'] as RiskProfileValue[]).map(p => {
              const c = PROFILE_RESULT[p];
              return (
                <View key={p} style={tw`flex-row items-center py-2.5 border-b border-gray-800 last:border-0`}>
                  <Text style={tw`text-xl mr-3`}>{c.icon}</Text>
                  <Text style={[tw`font-bold text-sm`, { color: result === p ? c.color : '#6B7280' }]}>{c.label}</Text>
                  {result === p && <View style={tw`ml-auto bg-emerald-500 w-2 h-2 rounded-full`} />}
                </View>
              );
            })}
          </View>

          <TouchableOpacity
            style={tw`bg-emerald-500 w-full py-4 rounded-2xl items-center shadow-lg shadow-emerald-500/30 ${saving ? 'opacity-70' : ''}`}
            onPress={confirmProfile}
            disabled={saving}
          >
            {saving
              ? <ActivityIndicator color="#fff" />
              : <Text style={tw`text-white font-extrabold text-base`}>Start Investing 🎯</Text>
            }
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // — Quiz screen
  return (
    <SafeAreaView style={tw`flex-1 bg-gray-950`}>
      <ScrollView contentContainerStyle={tw`flex-grow px-6 pt-4 pb-8`} showsVerticalScrollIndicator={false}>
        {/* Progress */}
        <View style={tw`mb-6`}>
          <View style={tw`flex-row justify-between items-center mb-2`}>
            <Text style={tw`text-gray-500 text-sm font-medium`}>Question {currentStep + 1} of {QUESTIONS.length}</Text>
            <Text style={tw`text-emerald-500 font-bold text-sm`}>{Math.round(pct)}%</Text>
          </View>
          <View style={tw`h-1.5 bg-gray-800 rounded-full overflow-hidden`}>
            <View style={[tw`h-full bg-emerald-500 rounded-full`, { width: `${pct}%` }]} />
          </View>
        </View>

        {/* Welcome */}
        <View style={tw`flex-row items-center mb-1`}>
          {navigation.canGoBack() && (
            <TouchableOpacity onPress={() => navigation.goBack()} style={tw`mr-3`}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
          )}
          <Text style={tw`text-white text-3xl font-extrabold`}>
            Hey {currentUser?.name?.split(' ')[0]}! 👋
          </Text>
        </View>
        <Text style={tw`text-gray-500 text-base mb-8 ${navigation.canGoBack() ? 'ml-9' : ''}`}>
          Let's discover your investor type.
        </Text>

        {/* Question card */}
        <View style={tw`bg-gray-900 border border-gray-800 rounded-3xl p-6 mb-6`}>
          <View style={tw`bg-emerald-500/20 w-11 h-11 rounded-xl items-center justify-center mb-4`}>
            <Ionicons name="help-circle" size={24} color="#10B981" />
          </View>
          <Text style={tw`text-white text-xl font-bold mb-6 leading-7`}>
            {QUESTIONS[currentStep].question}
          </Text>

          {QUESTIONS[currentStep].options.map((opt, i) => (
            <TouchableOpacity
              key={i}
              style={tw`bg-gray-800 border border-gray-700 rounded-2xl p-4 mb-3 flex-row items-center active:bg-gray-700`}
              onPress={() => handleOption(opt.score)}
              activeOpacity={0.75}
            >
              <Text style={tw`text-white text-base flex-1 leading-5`}>{opt.text}</Text>
              <Ionicons name="chevron-forward" size={18} color="#4B5563" />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

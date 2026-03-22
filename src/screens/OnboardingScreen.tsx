import React, { useState, useContext } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import tw from 'twrnc';
import { AppContext } from '../context/AppContext';
import { RiskProfile } from '../types';
import { Ionicons } from '@expo/vector-icons';

const QUESTIONS = [
  {
    question: "What's your primary goal?",
    options: [
      { text: "Keep my money safe", score: 1 },
      { text: "Grow it steadily", score: 2 },
      { text: "Maximum returns", score: 3 }
    ]
  },
  {
    question: "How would you react if your investment dropped 10% in a month?",
    options: [
      { text: "Sell everything, it's too risky", score: 1 },
      { text: "Wait it out, do nothing", score: 2 },
      { text: "Buy more at a lower price", score: 3 }
    ]
  },
  {
    question: "How long do you plan to invest for?",
    options: [
      { text: "Less than 1 year (Short term)", score: 1 },
      { text: "1 to 3 years (Medium term)", score: 2 },
      { text: "More than 3 years (Long term)", score: 3 }
    ]
  }
];

export const OnboardingScreen = () => {
  const { setRiskProfile, user } = useContext(AppContext);
  const [currentStep, setCurrentStep] = useState(0);
  const [scores, setScores] = useState<number[]>([]);

  const handleSelectOption = (score: number) => {
    const newScores = [...scores, score];
    setScores(newScores);

    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Calculate final profile
      const totalScore = newScores.reduce((a, b) => a + b, 0);
      let profile: RiskProfile = 'LOW';
      if (totalScore >= 7) profile = 'HIGH';
      else if (totalScore >= 5) profile = 'MEDIUM';
      
      setRiskProfile(profile);
    }
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-gray-950`}>
      <View style={tw`p-6 flex-1`}>
        <View style={tw`flex-row justify-between items-center mb-8`}>
          <Text style={tw`text-gray-400 font-medium`}>Setup Profile</Text>
          <Text style={tw`text-emerald-500 font-bold`}>{currentStep + 1} / {QUESTIONS.length}</Text>
        </View>

        <View style={tw`mb-10`}>
          <Text style={tw`text-3xl font-extrabold text-white leading-tight`}>
            Hi {user.name.split(' ')[0]}! 👋
          </Text>
          <Text style={tw`text-gray-400 text-lg mt-2`}>
            Let's find out your investor type.
          </Text>
        </View>

        <View style={tw`bg-gray-900 p-6 rounded-3xl border border-gray-800 shadow-lg mb-8`}>
          <View style={tw`bg-emerald-500/20 w-12 h-12 rounded-full items-center justify-center mb-4`}>
             <Ionicons name="chatbubbles" size={24} color="#10B981" />
          </View>
          <Text style={tw`text-xl text-white font-bold mb-6`}>
            {QUESTIONS[currentStep].question}
          </Text>

          <View style={tw`flex-col gap-4 mt-2`}>
            {QUESTIONS[currentStep].options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={tw`bg-gray-800 border border-gray-700 p-4 rounded-xl flex-row items-center justify-between active:bg-gray-700`}
                onPress={() => handleSelectOption(option.score)}
                activeOpacity={0.7}
              >
                <Text style={tw`text-white text-base flex-1`}>{option.text}</Text>
                <Ionicons name="chevron-forward" size={20} color="#6B7280" />
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        {/* Progress Bar indicator */}
        <View style={tw`mt-auto`}>
          <View style={tw`h-2 bg-gray-800 rounded-full overflow-hidden`}>
            <View style={[tw`h-full bg-emerald-500`, { width: `${((currentStep + 1) / QUESTIONS.length) * 100}%` }]} />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

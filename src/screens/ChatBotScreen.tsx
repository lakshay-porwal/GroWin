import React, { useContext, useRef, useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import tw from 'twrnc';
import { Ionicons } from '@expo/vector-icons';
import { AppContext } from '../context/AppContext';
import { getThemeClasses } from '../utils/theme';
import { generateChatResponse } from '../services/geminiService';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

const SUGGESTED_QUESTIONS = [
  'Best SIP for ₹500/month?',
  'How to reduce spending?',
  'What is my risk profile?',
  'Explain compound interest',
];

export const ChatBotScreen = ({ navigation }: any) => {
  const { theme, ...appContext } = useContext(AppContext);
  const tc = getThemeClasses(theme);
  const isDark = theme === 'dark';

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: `Hey ${appContext.currentUser?.name?.split(' ')[0] ?? 'there'}! 👋 I'm Aria, your GroWin AI advisor. Ask me anything about investing, SIPs, or your financial goals!`,
      sender: 'ai',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const sendMessage = async (text?: string) => {
    const msg = (text ?? inputText).trim();
    if (!msg) return;

    const userMsg: Message = { id: Date.now().toString(), text: msg, sender: 'user', timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    const response = await generateChatResponse(msg, appContext as any);
    const aiMsg: Message = { id: (Date.now() + 1).toString(), text: response, sender: 'ai', timestamp: new Date() };
    setMessages(prev => [...prev, aiMsg]);
    setIsLoading(false);
  };

  useEffect(() => {
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages]);

  return (
    <SafeAreaView style={tw`flex-1 ${tc.backgroundMain}`}>
      {/* Header */}
      <View style={tw`flex-row items-center px-5 py-3.5 border-b ${tc.borderMain}`}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={tw`w-9 h-9 items-center justify-center rounded-full ${tc.backgroundCard} border ${tc.borderMain} mr-3`}
        >
          <Ionicons name="arrow-back" size={18} color={isDark ? '#fff' : '#111'} />
        </TouchableOpacity>
        <View style={tw`bg-emerald-500 w-10 h-10 rounded-full items-center justify-center mr-3`}>
          <Ionicons name="hardware-chip" size={20} color="#fff" />
        </View>
        <View style={tw`flex-1`}>
          <Text style={tw`${tc.textMain} font-bold text-base`}>Aria · AI Advisor</Text>
          <View style={tw`flex-row items-center`}>
            <View style={tw`w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1`} />
            <Text style={tw`text-emerald-500 text-xs font-medium`}>Online</Text>
            <Text style={tw`${tc.textMuted} text-xs`}> · GroWin AI</Text>
          </View>
        </View>
        <View style={tw`bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 rounded-full`}>
          <Text style={tw`text-emerald-500 text-xs font-bold`}>{appContext.currentUser?.riskProfile ?? '?'} RISK</Text>
        </View>
      </View>

      <KeyboardAvoidingView style={tw`flex-1`} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Chat */}
        <ScrollView
          ref={scrollViewRef}
          style={tw`flex-1 px-4 pt-3`}
          showsVerticalScrollIndicator={false}
        >
          {messages.map(msg => (
            <View key={msg.id} style={tw`mb-4 flex-row ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} items-end`}>
              {msg.sender === 'ai' && (
                <View style={tw`bg-emerald-500 w-8 h-8 rounded-full items-center justify-center mr-2 mb-1 flex-shrink-0`}>
                  <Ionicons name="sparkles" size={14} color="#fff" />
                </View>
              )}
              <View
                style={tw`max-w-[80%] rounded-2xl px-4 py-3 ${
                  msg.sender === 'user'
                    ? 'bg-emerald-500 rounded-br-sm'
                    : `${tc.backgroundCard} border ${tc.borderMain} rounded-bl-sm`
                }`}
              >
                <Text style={tw`text-sm leading-5 ${msg.sender === 'user' ? 'text-white' : tc.textMain}`}>
                  {msg.text}
                </Text>
                <Text style={tw`text-[10px] mt-1 ${msg.sender === 'user' ? 'text-white/60' : tc.textMuted}`}>
                  {msg.timestamp.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            </View>
          ))}

          {isLoading && (
            <View style={tw`flex-row items-end mb-4`}>
              <View style={tw`bg-emerald-500 w-8 h-8 rounded-full items-center justify-center mr-2`}>
                <Ionicons name="sparkles" size={14} color="#fff" />
              </View>
              <View style={tw`${tc.backgroundCard} border ${tc.borderMain} rounded-2xl rounded-bl-sm px-4 py-3`}>
                <View style={tw`flex-row items-center`}>
                  <View style={tw`w-2 h-2 rounded-full bg-emerald-500 mr-1`} />
                  <View style={tw`w-2 h-2 rounded-full bg-emerald-500/60 mr-1`} />
                  <View style={tw`w-2 h-2 rounded-full bg-emerald-500/30`} />
                </View>
              </View>
            </View>
          )}

          {/* Suggestions (shown only when no conversation yet) */}
          {messages.length === 1 && (
            <View style={tw`mb-4`}>
              <Text style={tw`${tc.textMuted} text-xs mb-3 text-center`}>Try asking:</Text>
              <View style={tw`flex-row flex-wrap justify-center`}>
                {SUGGESTED_QUESTIONS.map(q => (
                  <TouchableOpacity
                    key={q}
                    style={tw`${tc.backgroundCard} border ${tc.borderMain} rounded-full px-3 py-2 mb-2 mr-2`}
                    onPress={() => sendMessage(q)}
                  >
                    <Text style={tw`${tc.textSecondary} text-xs font-medium`}>{q}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          <View style={tw`h-4`} />
        </ScrollView>

        {/* Input bar */}
        <View style={tw`px-4 pb-4 pt-2 flex-row items-center border-t ${tc.borderMain}`}>
          <TextInput
            style={tw`flex-1 ${tc.inputBackground} ${tc.inputText} rounded-full px-5 py-3 mr-3 text-sm border ${tc.borderMain}`}
            placeholder="Ask Aria anything..."
            placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={() => sendMessage()}
            multiline={false}
          />
          <TouchableOpacity
            style={tw`bg-emerald-500 w-11 h-11 rounded-full items-center justify-center shadow-lg shadow-emerald-500/30 ${!inputText.trim() || isLoading ? 'opacity-50' : ''}`}
            onPress={() => sendMessage()}
            disabled={!inputText.trim() || isLoading}
          >
            <Ionicons name="send" size={18} color="#fff" style={tw`ml-0.5`} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

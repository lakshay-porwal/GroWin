import React, { useState, useContext, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView, KeyboardAvoidingView, Platform, Image } from 'react-native';
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

export const ChatBotScreen = ({ navigation }: any) => {
  const { theme, ...appContext } = useContext(AppContext);
  const tc = getThemeClasses(theme);
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: `Hi ${appContext.user.name.split(' ')[0]}! 👋 I'm your GroWin AI Advisor. How can I help you grow your wealth today?`,
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    const aiResponseText = await generateChatResponse(userMessage.text, appContext);

    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: aiResponseText,
      sender: 'ai',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, aiMessage]);
    setIsLoading(false);
  };

  useEffect(() => {
    // Scroll to bottom when messages change
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  return (
    <SafeAreaView style={tw`flex-1 ${tc.backgroundMain}`}>
      <KeyboardAvoidingView 
        style={tw`flex-1`} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={tw`flex-row items-center px-4 py-3 ${tc.backgroundHeader}`}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={tw`p-2`}>
            <Ionicons name="arrow-back" size={24} color={theme === 'dark' ? '#fff' : '#111'} />
          </TouchableOpacity>
          <View style={tw`flex-row items-center ml-2`}>
            <Image 
              source={require('../../assets/ai_avatar.png')} 
              style={tw`w-10 h-10 rounded-full border border-emerald-500`}
              resizeMode="cover"
            />
            <View style={tw`ml-3`}>
              <Text style={tw`text-lg font-bold ${tc.textMain}`}>GroWin AI</Text>
              <Text style={tw`text-emerald-500 text-xs font-medium`}>Online • Smart Advisor</Text>
            </View>
          </View>
        </View>

        {/* Chat Area */}
        <ScrollView 
          ref={scrollViewRef}
          style={tw`flex-1 px-4 pt-4`}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((msg) => (
            <View key={msg.id} style={tw`mb-4 flex-row ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.sender === 'ai' && (
                <View style={tw`w-8 h-8 rounded-full bg-emerald-500/20 mr-2 items-center justify-center`}>
                  <Ionicons name="sparkles" size={16} color="#10B981" />
                </View>
              )}
              <View style={tw`max-w-[75%] rounded-2xl px-4 py-3 ${
                msg.sender === 'user' 
                  ? 'bg-emerald-600 rounded-tr-sm' 
                  : `${tc.backgroundCard} ${tc.borderMain} border rounded-tl-sm`
              }`}>
                <Text style={tw`text-base ${msg.sender === 'user' ? 'text-white' : tc.textMain}`}>
                  {msg.text}
                </Text>
              </View>
            </View>
          ))}
          {isLoading && (
            <View style={tw`mb-4 flex-row justify-start items-center`}>
               <View style={tw`w-8 h-8 rounded-full bg-emerald-500/20 mr-2 items-center justify-center`}>
                  <Ionicons name="sparkles" size={16} color="#10B981" />
                </View>
                <Text style={tw`${tc.textSecondary} italic flex-1`}>AI is thinking...</Text>
            </View>
          )}
          <View style={tw`h-10`} />
        </ScrollView>

        {/* Input Area */}
        <View style={tw`p-4 ${tc.backgroundHeader} flex-row items-center border-t-0`}>
          <TextInput
            style={tw`flex-1 ${tc.inputBackground} ${tc.inputText} rounded-full px-5 py-3 mr-3 text-base border ${tc.borderMain}`}
            placeholder="Ask about SIPs, risks, or balance..."
            placeholderTextColor={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={sendMessage}
          />
          <TouchableOpacity 
            style={tw`bg-emerald-500 w-12 h-12 rounded-full items-center justify-center shadow-lg shadow-emerald-500/30 ${!inputText.trim() ? 'opacity-50' : ''}`}
            onPress={sendMessage}
            disabled={!inputText.trim() || isLoading}
          >
            <Ionicons name="send" size={20} color="#fff" style={tw`ml-1`} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

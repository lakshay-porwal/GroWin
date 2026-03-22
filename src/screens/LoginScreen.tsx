import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Image } from 'react-native';
import tw from 'twrnc';
import { AppContext } from '../context/AppContext';
import { Ionicons } from '@expo/vector-icons';

export const LoginScreen = () => {
  const { login } = useContext(AppContext);
  const [name, setName] = useState('');

  const handleLogin = () => {
    if (name.trim()) {
      login(name);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={tw`flex-1 bg-gray-950 justify-center p-6`}
    >
      <View style={tw`items-center mb-12`}>
        <View style={tw`bg-emerald-500/20 p-4 rounded-full mb-6`}>
          <Ionicons name="leaf" size={48} color="#10B981" />
        </View>
        <Text style={tw`text-5xl font-extrabold text-white tracking-tight`}>
          Gro<Text style={tw`text-emerald-500`}>Win</Text>
        </Text>
        <Text style={tw`text-gray-400 mt-2 text-base`}>Built by Students, for Students</Text>
      </View>

      <View style={tw`bg-gray-900 p-6 rounded-3xl border border-gray-800 shadow-lg`}>
        <Text style={tw`text-xl text-white font-bold mb-6`}>Welcome back</Text>
        
        <View style={tw`mb-5`}>
          <Text style={tw`text-gray-400 text-sm mb-2 ml-1`}>Your Name</Text>
          <View style={tw`flex-row items-center bg-gray-800 rounded-xl px-4 py-3 border border-gray-700`}>
            <Ionicons name="person-outline" size={20} color="#9CA3AF" style={tw`mr-3`} />
            <TextInput
              style={tw`flex-1 text-white text-base`}
              placeholder="e.g. Rahul Sharma"
              placeholderTextColor="#6B7280"
              value={name}
              onChangeText={setName}
            />
          </View>
        </View>

        <TouchableOpacity 
          style={tw`bg-emerald-500 py-4 items-center rounded-xl mt-4 shadow-md shadow-emerald-500/30 w-full`}
          onPress={handleLogin}
          activeOpacity={0.8}
        >
          <Text style={tw`text-white font-bold text-lg`}>Get Started</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

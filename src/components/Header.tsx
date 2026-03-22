import React, { useContext } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import tw from 'twrnc';
import { AppContext } from '../context/AppContext';
import { getThemeClasses } from '../utils/theme';
import { useNavigation } from '@react-navigation/native';

interface HeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle, showBack = false }) => {
  const { theme, toggleTheme } = useContext(AppContext);
  const tc = getThemeClasses(theme);
  const navigation = useNavigation<any>();

  return (
    <View style={tw`flex-row justify-between items-center px-6 py-4 ${tc.backgroundMain}`}>
      <View style={tw`flex-row items-center flex-1`}>
        {showBack && (
          <TouchableOpacity onPress={() => navigation.goBack()} style={tw`mr-3`}>
            <Ionicons name="arrow-back" size={24} color={theme === 'dark' ? '#fff' : '#111'} />
          </TouchableOpacity>
        )}
        <View>
          <Text style={tw`text-2xl font-bold ${tc.textMain}`}>{title}</Text>
          {subtitle && <Text style={tw`${tc.textSecondary} text-sm`}>{subtitle}</Text>}
        </View>
      </View>

      <View style={tw`flex-row items-center`}>
        <TouchableOpacity 
          onPress={() => navigation.navigate('ChatBot')}
          style={tw`p-2 bg-emerald-500/20 rounded-full mr-3 border border-emerald-500/30`}
        >
          <Ionicons name="hardware-chip" size={20} color="#10B981" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={toggleTheme} 
          style={tw`p-2 bg-gray-500/20 rounded-full`}
        >
          <Ionicons name={theme === 'dark' ? "sunny" : "moon"} size={20} color={theme === 'dark' ? '#FBBF24' : '#4B5563'} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

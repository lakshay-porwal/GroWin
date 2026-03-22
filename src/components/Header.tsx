import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import tw from 'twrnc';
import { AppContext } from '../context/AppContext';
import { getThemeClasses } from '../utils/theme';
import { useNavigation } from '@react-navigation/native';

interface HeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  showAI?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle, showBack = false, showAI = true }) => {
  const { theme, toggleTheme, currentUser, logout } = useContext(AppContext);
  const tc = getThemeClasses(theme);
  const navigation = useNavigation<any>();
  const isDark = theme === 'dark';

  return (
    <View style={tw`flex-row justify-between items-center px-5 py-3.5 ${tc.backgroundMain}`}>
      <View style={tw`flex-row items-center flex-1`}>
        {showBack && (
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={tw`w-9 h-9 items-center justify-center rounded-full ${tc.backgroundCard} border ${tc.borderMain} mr-3`}
          >
            <Ionicons name="arrow-back" size={20} color={isDark ? '#fff' : '#111'} />
          </TouchableOpacity>
        )}
        <View>
          <Text style={tw`text-xl font-extrabold ${tc.textMain} tracking-tight`}>{title}</Text>
          {subtitle && <Text style={tw`${tc.textSecondary} text-xs mt-0.5`}>{subtitle}</Text>}
        </View>
      </View>

      <View style={tw`flex-row items-center gap-2`}>
        {showAI && currentUser?.role === 'student' && (
          <TouchableOpacity
            onPress={() => navigation.navigate('Learning')}
            style={tw`w-9 h-9 items-center justify-center rounded-full ${tc.backgroundCard} border ${tc.borderMain}`}
          >
            <Ionicons name="book-outline" size={17} color={isDark ? '#9CA3AF' : '#6B7280'} />
          </TouchableOpacity>
        )}
        {showAI && currentUser?.role === 'student' && (
          <TouchableOpacity
            onPress={() => navigation.navigate('ChatBot')}
            style={tw`w-9 h-9 items-center justify-center rounded-full bg-emerald-500/15 border border-emerald-500/30`}
          >
            <Ionicons name="hardware-chip" size={17} color="#10B981" />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={toggleTheme}
          style={tw`w-9 h-9 items-center justify-center rounded-full ${tc.backgroundCard} border ${tc.borderMain}`}
        >
          <Ionicons
            name={isDark ? 'sunny' : 'moon'}
            size={17}
            color={isDark ? '#FBBF24' : '#6366F1'}
          />
        </TouchableOpacity>

        {/* Logout button — visible on all student tab screens */}
        {currentUser?.role === 'student' && (
          <TouchableOpacity
            onPress={() => {
              Alert.alert(
                'Log Out',
                'Are you sure you want to log out?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Log Out', style: 'destructive', onPress: () => logout() },
                ],
              );
            }}
            style={tw`w-9 h-9 items-center justify-center rounded-full bg-red-500/15 border border-red-500/30`}
          >
            <Ionicons name="log-out-outline" size={17} color="#EF4444" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

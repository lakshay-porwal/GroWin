import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import tw from 'twrnc';

// Screens
import { LoginScreen } from '../screens/LoginScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { WalletScreen } from '../screens/WalletScreen';
import { InvestmentsScreen } from '../screens/InvestmentsScreen';
import { ExpenseScreen } from '../screens/ExpenseScreen';
import { GoalsScreen } from '../screens/GoalsScreen';
import { LearningScreen } from '../screens/LearningScreen';

// Context
import { AppContext } from '../context/AppContext';

export type RootStackParamList = {
  Login: undefined;
  Onboarding: undefined;
  MainTabs: undefined;
  Wallet: undefined;
};

export type TabParamList = {
  Dashboard: undefined;
  Investments: undefined;
  Expenses: undefined;
  Goals: undefined;
  Learning: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: tw`bg-gray-900 border-t-0`,
        tabBarActiveTintColor: '#10B981', // Emerald 500
        tabBarInactiveTintColor: '#6B7280', // Gray 500
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'help';

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Investments') {
            iconName = focused ? 'trending-up' : 'trending-up-outline';
          } else if (route.name === 'Expenses') {
            iconName = focused ? 'pie-chart' : 'pie-chart-outline';
          } else if (route.name === 'Goals') {
            iconName = focused ? 'flag' : 'flag-outline';
          } else if (route.name === 'Learning') {
            iconName = focused ? 'book' : 'book-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Investments" component={InvestmentsScreen} />
      <Tab.Screen name="Expenses" component={ExpenseScreen} />
      <Tab.Screen name="Goals" component={GoalsScreen} />
      <Tab.Screen name="Learning" component={LearningScreen} />
    </Tab.Navigator>
  );
};

export const AppNavigator = () => {
  const { user } = useContext(AppContext);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user.isLoggedIn ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : !user.riskProfile ? (
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        ) : (
          <>
            <Stack.Screen name="MainTabs" component={TabNavigator} />
            <Stack.Screen 
              name="Wallet" 
              component={WalletScreen} 
              options={{ 
                headerShown: true, 
                headerStyle: tw`bg-gray-900`,
                headerTintColor: '#fff',
                title: 'My Wallet'
              }} 
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

import React, { useContext } from 'react';
import { View, Text, ActivityIndicator, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import tw from 'twrnc';

// Screens
import { LoginScreen }      from '../screens/LoginScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { DashboardScreen }  from '../screens/DashboardScreen';
import { WalletScreen }     from '../screens/WalletScreen';
import { InvestmentsScreen }from '../screens/InvestmentsScreen';
import { ExpenseScreen }    from '../screens/ExpenseScreen';
import { GoalsScreen }      from '../screens/GoalsScreen';
import { LearningScreen }   from '../screens/LearningScreen';
import { ChatBotScreen }    from '../screens/ChatBotScreen';
import { AdminScreen }      from '../screens/AdminScreen';
import { AuthorityScreen }  from '../screens/AuthorityScreen';
import { ProfileScreen }    from '../screens/ProfileScreen';

// Context
import { AppContext } from '../context/AppContext';

const Stack = createNativeStackNavigator();
const Tab   = createBottomTabNavigator();

// ─── Student Tab Navigator ─────────────────────────────────────────────────────
const StudentTabs = () => {
  const { theme } = useContext(AppContext);
  const isDark = theme === 'dark';

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
          borderTopColor: isDark ? '#1E293B' : '#E2E8F0',
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 6,
          height: 68,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarActiveTintColor: '#10B981',
        tabBarInactiveTintColor: isDark ? '#475569' : '#94A3B8',
        tabBarLabelStyle: { fontSize: 10, fontWeight: '700', marginTop: 2 },
        tabBarIcon: ({ focused, color }) => {
          const icons: Record<string, [any, any]> = {
            Home:        ['home', 'home-outline'],
            Invest:      ['trending-up', 'trending-up-outline'],
            Wallet:      ['wallet', 'wallet-outline'],
            Expenses:    ['pie-chart', 'pie-chart-outline'],
            Goals:       ['flag', 'flag-outline'],
            Profile:     ['person-circle', 'person-circle-outline'],
          };
          const [active, inactive] = icons[route.name] ?? ['help', 'help-outline'];
          return (
            <View style={focused ? tw`bg-emerald-500/20 rounded-full w-8 h-8 items-center justify-center` : undefined}>
              <Ionicons name={focused ? active : inactive} size={focused ? 20 : 22} color={color} />
            </View>
          );
        },
      })}
    >
      <Tab.Screen name="Home"     component={DashboardScreen}   />
      <Tab.Screen name="Invest"   component={InvestmentsScreen} />
      <Tab.Screen name="Wallet"   component={WalletScreen}      />
      <Tab.Screen name="Expenses" component={ExpenseScreen}     />
      <Tab.Screen name="Goals"    component={GoalsScreen}       />
      <Tab.Screen name="Profile"  component={ProfileScreen}     />
    </Tab.Navigator>
  );
};

// ─── Loading Splash ────────────────────────────────────────────────────────────
const LoadingSplash = () => (
  <View style={tw`flex-1 bg-gray-950 items-center justify-center`}>
    <View style={tw`bg-emerald-500/20 border border-emerald-500/40 w-20 h-20 rounded-2xl items-center justify-center mb-6`}>
      <Ionicons name="leaf" size={38} color="#10B981" />
    </View>
    <Text style={tw`text-white text-3xl font-extrabold mb-2`}>
      Gro<Text style={tw`text-emerald-500`}>Win</Text>
    </Text>
    <Text style={tw`text-gray-500 text-sm mb-8`}>Loading your portfolio...</Text>
    <ActivityIndicator color="#10B981" size="large" />
  </View>
);

// ─── Main Navigator ────────────────────────────────────────────────────────────
export const AppNavigator = () => {
  const { currentUser, isLoaded, theme } = useContext(AppContext);
  const isDark = theme === 'dark';

  // Show branded splash while AsyncStorage loads
  if (!isLoaded) return <LoadingSplash />;

  const role = currentUser?.role;
  const needsOnboarding = role === 'student' && !currentUser?.riskProfile;

  const slideAnim = Platform.OS === 'web' ? 'none' : 'slide_from_right';
  const bottomAnim = Platform.OS === 'web' ? 'none' : 'slide_from_bottom';

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: Platform.OS === 'web' ? 'none' : 'fade' }}>
        {!currentUser ? (
          // ── Not logged in
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : role === 'admin' ? (
          // ── Admin
          <Stack.Screen name="AdminPanel" component={AdminScreen} />
        ) : role === 'authority' ? (
          // ── Authority
          <Stack.Screen name="AuthorityPanel" component={AuthorityScreen} />
        ) : needsOnboarding ? (
          // ── Student — no risk profile yet
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        ) : (
          // ── Student — main app
          <>
            <Stack.Screen name="MainTabs"  component={StudentTabs} />
            <Stack.Screen
              name="ChatBot"
              component={ChatBotScreen}
              options={{ animation: bottomAnim }}
            />
            <Stack.Screen
              name="Onboarding"
              component={OnboardingScreen}
              options={{ animation: bottomAnim }}
            />
            <Stack.Screen
              name="Learning"
              component={LearningScreen}
              options={{ animation: slideAnim }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

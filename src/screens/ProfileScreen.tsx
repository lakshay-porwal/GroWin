import React, { useState, useContext } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  TextInput, Modal, Alert, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import tw from 'twrnc';
import { Ionicons } from '@expo/vector-icons';
import { AppContext } from '../context/AppContext';
import { getThemeClasses } from '../utils/theme';

// Avatar from initials
const getInitials = (name: string) =>
  name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

const AVATAR_COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899'];
const getAvatarColor = (id: string) => AVATAR_COLORS[id.charCodeAt(0) % AVATAR_COLORS.length];

const RISK_CONFIG = {
  LOW:    { label: 'Low Risk', icon: '🛡️', color: '#3B82F6', bg: 'bg-blue-500/15', border: 'border-blue-500/30', text: 'text-blue-400', desc: 'Conservative investor. Prefers capital safety.' },
  MEDIUM: { label: 'Moderate Risk', icon: '⚖️', color: '#F59E0B', bg: 'bg-amber-500/15', border: 'border-amber-500/30', text: 'text-amber-400', desc: 'Balanced investor. Seeks steady growth.' },
  HIGH:   { label: 'High Risk', icon: '🚀', color: '#EF4444', bg: 'bg-red-500/15', border: 'border-red-500/30', text: 'text-red-400', desc: 'Aggressive investor. Chases maximum returns.' },
} as const;

const ROLE_CONFIG = {
  student:   { label: 'Student', icon: '🎓', color: 'text-emerald-500', bg: 'bg-emerald-500/15' },
  authority: { label: 'Fund Authority', icon: '🏛️', color: 'text-purple-400', bg: 'bg-purple-500/15' },
  admin:     { label: 'Administrator', icon: '🛡️', color: 'text-orange-400', bg: 'bg-orange-500/15' },
};

export const ProfileScreen = ({ navigation }: any) => {
  const { currentUser, walletBalance, investments, goals, expenses, funds, updateProfile, logout, theme } = useContext(AppContext);
  const tc = getThemeClasses(theme);
  const isDark = theme === 'dark';

  const [editModal, setEditModal] = useState(false);
  const [newName, setNewName] = useState(currentUser?.name ?? '');
  const [saving, setSaving] = useState(false);

  if (!currentUser) return null;

  const riskCfg = currentUser.riskProfile ? RISK_CONFIG[currentUser.riskProfile] : null;
  const roleCfg = ROLE_CONFIG[currentUser.role];
  const avatarColor = getAvatarColor(currentUser.id);

  const totalInvested = investments.reduce((s, i) => s + i.amount, 0);
  const totalCurrentVal = investments.reduce((s, i) => s + i.currentValue, 0);
  const totalGain = totalCurrentVal - totalInvested;
  const isProfit = totalGain >= 0;
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const goalsCompleted = goals.filter(g => g.savedAmount >= g.targetAmount).length;
  const myFunds = funds.filter(f => f.submittedBy === currentUser.id);

  const handleSaveName = async () => {
    if (!newName.trim() || newName.trim() === currentUser.name) { setEditModal(false); return; }
    setSaving(true);
    await updateProfile(newName.trim());
    setSaving(false);
    setEditModal(false);
  };

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to log out?')) logout();
    } else {
      Alert.alert('Logout', 'Are you sure you want to log out?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: () => logout() },
      ]);
    }
  };

  const StatBox = ({ label, value, sub, color = tc.textMain }: { label: string; value: string; sub?: string; color?: string }) => (
    <View style={tw`flex-1 ${tc.backgroundCard} border ${tc.borderMain} rounded-2xl p-4 mx-1 items-center`}>
      <Text style={[tw`font-extrabold text-lg`, { color: color as any }]}>{value}</Text>
      {sub && <Text style={tw`${isProfit ? 'text-emerald-500' : 'text-red-500'} text-[10px] font-semibold`}>{sub}</Text>}
      <Text style={tw`${tc.textMuted} text-[10px] mt-0.5 text-center`}>{label}</Text>
    </View>
  );

  return (
    <SafeAreaView style={tw`flex-1 ${tc.backgroundMain}`}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={tw`px-5 pt-4 pb-2 flex-row items-center justify-between`}>
          <Text style={tw`${tc.textMain} text-xl font-extrabold`}>My Profile</Text>
          <TouchableOpacity
            style={tw`bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-xl flex-row items-center`}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={15} color="#EF4444" />
            <Text style={tw`text-red-400 text-xs font-bold ml-1`}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Avatar + Info */}
        <View style={tw`items-center px-5 py-6`}>
          <View style={[tw`w-24 h-24 rounded-full items-center justify-center mb-4 shadow-lg`, { backgroundColor: avatarColor }]}>
            <Text style={tw`text-white text-3xl font-extrabold`}>{getInitials(currentUser.name)}</Text>
          </View>

          <View style={tw`flex-row items-center mb-1.5`}>
            <Text style={tw`${tc.textMain} text-2xl font-extrabold mr-2`}>{currentUser.name}</Text>
            <TouchableOpacity onPress={() => { setNewName(currentUser.name); setEditModal(true); }}>
              <Ionicons name="pencil-outline" size={16} color="#10B981" />
            </TouchableOpacity>
          </View>

          <Text style={tw`${tc.textSecondary} text-sm mb-3`}>{currentUser.email}</Text>

          {/* Role badge */}
          <View style={tw`flex-row items-center ${roleCfg.bg} border border-white/10 px-4 py-1.5 rounded-full mb-3`}>
            <Text style={tw`mr-1.5`}>{roleCfg.icon}</Text>
            <Text style={tw`${roleCfg.color} font-bold text-xs`}>{roleCfg.label}</Text>
          </View>

          {/* Member since */}
          <Text style={tw`${tc.textMuted} text-xs`}>
            Member since {new Date(currentUser.joinedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
          </Text>
        </View>

        {/* Risk Profile card */}
        {currentUser.role === 'student' && (
          <View style={tw`mx-5 mb-5`}>
            {riskCfg ? (
              <View style={tw`${riskCfg.bg} border ${riskCfg.border} rounded-2xl p-4 flex-row items-center`}>
                <Text style={tw`text-3xl mr-3`}>{riskCfg.icon}</Text>
                <View style={tw`flex-1`}>
                  <Text style={tw`${riskCfg.text} font-extrabold text-base`}>{riskCfg.label}</Text>
                  <Text style={tw`${tc.textSecondary} text-xs mt-0.5`}>{riskCfg.desc}</Text>
                </View>
                <TouchableOpacity
                  style={tw`bg-white/10 px-3 py-1.5 rounded-xl`}
                  onPress={() => navigation.navigate('Onboarding')}
                >
                  <Text style={tw`${riskCfg.text} text-xs font-bold`}>Retake</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={tw`bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 flex-row items-center`}
                onPress={() => navigation.navigate('Onboarding')}
              >
                <View style={tw`bg-emerald-500/20 w-12 h-12 rounded-xl items-center justify-center mr-3`}>
                  <Ionicons name="analytics-outline" size={22} color="#10B981" />
                </View>
                <View style={tw`flex-1`}>
                  <Text style={tw`text-emerald-500 font-bold text-base`}>Set Your Risk Profile</Text>
                  <Text style={tw`${tc.textSecondary} text-xs mt-0.5`}>Take the quiz to get personalized fund suggestions</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#10B981" />
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Stats (Student) */}
        {currentUser.role === 'student' && (
          <View style={tw`px-5 mb-5`}>
            <Text style={tw`${tc.textSecondary} text-xs font-semibold uppercase tracking-wider mb-3`}>Overview</Text>
            <View style={tw`flex-row mb-3`}>
              <StatBox label="Wallet" value={`₹${walletBalance.toLocaleString()}`} />
              <StatBox
                label="Portfolio"
                value={`₹${totalCurrentVal.toLocaleString()}`}
                sub={totalInvested > 0 ? `${isProfit ? '+' : ''}₹${Math.abs(totalGain).toLocaleString()}` : undefined}
              />
              <StatBox label="Spent" value={`₹${totalExpenses.toLocaleString()}`} />
            </View>
            <View style={tw`flex-row`}>
              <StatBox label="Investments" value={investments.length.toString()} />
              <StatBox label="Goals" value={goals.length.toString()} />
              <StatBox label="Goals Done" value={goalsCompleted.toString()} color="#10B981" />
            </View>
          </View>
        )}

        {/* Stats (Authority) */}
        {currentUser.role === 'authority' && (
          <View style={tw`px-5 mb-5`}>
            <Text style={tw`${tc.textSecondary} text-xs font-semibold uppercase tracking-wider mb-3`}>Fund Activity</Text>
            <View style={tw`flex-row`}>
              <StatBox label="Submitted" value={myFunds.length.toString()} />
              <StatBox label="Approved" value={myFunds.filter(f => f.status === 'APPROVED').length.toString()} color="#10B981" />
              <StatBox label="Pending" value={myFunds.filter(f => f.status === 'PENDING').length.toString()} color="#F59E0B" />
            </View>
          </View>
        )}

        {/* Account Settings */}
        <View style={tw`px-5 mb-8`}>
          <Text style={tw`${tc.textSecondary} text-xs font-semibold uppercase tracking-wider mb-3`}>Account</Text>

          {[
            { icon: 'person-outline', label: 'Edit Name', onPress: () => { setNewName(currentUser.name); setEditModal(true); } },
            ...(currentUser.role === 'student' ? [{ icon: 'analytics-outline', label: 'Retake Risk Quiz', onPress: () => navigation.navigate('Onboarding') }] : []),
            { icon: 'shield-checkmark-outline', label: 'App Version', right: 'v1.0.0', onPress: () => {} },
          ].map((item, i) => (
            <TouchableOpacity
              key={i}
              style={tw`${tc.backgroundCard} border ${tc.borderMain} rounded-2xl p-4 flex-row items-center mb-3`}
              onPress={item.onPress}
              activeOpacity={0.7}
            >
              <View style={tw`bg-emerald-500/15 w-9 h-9 rounded-xl items-center justify-center mr-3`}>
                <Ionicons name={item.icon as any} size={18} color="#10B981" />
              </View>
              <Text style={tw`${tc.textMain} font-semibold flex-1`}>{item.label}</Text>
              {item.right
                ? <Text style={tw`${tc.textMuted} text-sm`}>{item.right}</Text>
                : <Ionicons name="chevron-forward" size={16} color={isDark ? '#4B5563' : '#9CA3AF'} />
              }
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Edit Name Modal */}
      <Modal animationType="slide" transparent visible={editModal} onRequestClose={() => setEditModal(false)}>
        <View style={tw`flex-1 justify-end bg-black/60`}>
          <View style={tw`${tc.backgroundCard} rounded-t-3xl border-t ${tc.borderMain} p-6`}>
            <View style={tw`flex-row justify-between items-center mb-5`}>
              <Text style={tw`${tc.textMain} text-lg font-bold`}>Edit Name</Text>
              <TouchableOpacity onPress={() => setEditModal(false)}>
                <Ionicons name="close-circle" size={26} color={isDark ? '#4B5563' : '#9CA3AF'} />
              </TouchableOpacity>
            </View>

            <View style={tw`${tc.inputBackground} border ${tc.borderMain} rounded-xl flex-row items-center px-4 mb-5`}>
              <Ionicons name="person-outline" size={18} color={isDark ? '#6B7280' : '#9CA3AF'} style={tw`mr-3`} />
              <TextInput
                style={tw`flex-1 ${tc.inputText} text-base py-4`}
                placeholder="Your name"
                placeholderTextColor={isDark ? '#4B5563' : '#9CA3AF'}
                value={newName}
                onChangeText={setNewName}
                autoFocus
              />
            </View>

            <TouchableOpacity
              style={tw`bg-emerald-500 py-4 items-center rounded-2xl ${saving ? 'opacity-60' : ''}`}
              onPress={handleSaveName}
              disabled={saving}
            >
              <Text style={tw`text-white font-bold text-base`}>{saving ? 'Saving...' : 'Save Changes'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

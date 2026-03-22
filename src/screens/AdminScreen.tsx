import React, { useState, useContext } from 'react';
import {
  View, Text, ScrollView, SafeAreaView, TouchableOpacity, Alert, Modal, Platform
} from 'react-native';
import tw from 'twrnc';
import { Ionicons } from '@expo/vector-icons';
import { AppContext } from '../context/AppContext';
import { getThemeClasses } from '../utils/theme';
import { Fund } from '../types';

type AdminTab = 'requests' | 'users';

const StatusBadge = ({ status }: { status: string }) => {
  const cfg: Record<string, { bg: string; text: string; dot: string }> = {
    PENDING:  { bg: 'bg-yellow-500/15', text: 'text-yellow-400', dot: 'bg-yellow-400' },
    APPROVED: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', dot: 'bg-emerald-400' },
    REJECTED: { bg: 'bg-red-500/15', text: 'text-red-400', dot: 'bg-red-400' },
  };
  const c = cfg[status] ?? cfg.PENDING;
  return (
    <View style={tw`${c.bg} px-3 py-1 rounded-full flex-row items-center`}>
      <View style={tw`w-1.5 h-1.5 rounded-full ${c.dot} mr-1.5`} />
      <Text style={tw`${c.text} text-xs font-bold`}>{status}</Text>
    </View>
  );
};

const RoleBadge = ({ role }: { role: string }) => {
  const cfg: Record<string, { bg: string; text: string; icon: string }> = {
    student:   { bg: 'bg-blue-500/15',    text: 'text-blue-400',    icon: '🎓' },
    authority: { bg: 'bg-purple-500/15',  text: 'text-purple-400',  icon: '🏛️' },
    admin:     { bg: 'bg-orange-500/15',  text: 'text-orange-400',  icon: '🛡️' },
  };
  const c = cfg[role] ?? cfg.student;
  return (
    <View style={tw`${c.bg} px-3 py-1 rounded-full flex-row items-center`}>
      <Text style={tw`mr-1 text-xs`}>{c.icon}</Text>
      <Text style={tw`${c.text} text-xs font-bold capitalize`}>{role}</Text>
    </View>
  );
};

export const AdminScreen = ({ navigation }: any) => {
  const { funds, users, currentUser, approveFund, rejectFund, logout, theme } = useContext(AppContext);
  const tc = getThemeClasses(theme);
  const [activeTab, setActiveTab] = useState<AdminTab>('requests');
  const [selectedFund, setSelectedFund] = useState<Fund | null>(null);

  const pendingFunds = funds.filter(f => f.status === 'PENDING');
  const allFunds = funds;

  const handleApprove = (fund: Fund) => {
    if (Platform.OS === 'web') {
      if (window.confirm(`Approve "${fund.title}"?`)) { approveFund(fund.id); setSelectedFund(null); }
    } else {
      Alert.alert('Approve Fund', `Approve "${fund.title}"?`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Approve ✅', onPress: () => { approveFund(fund.id); setSelectedFund(null); } },
      ]);
    }
  };

  const handleReject = (fund: Fund) => {
    if (Platform.OS === 'web') {
      if (window.confirm(`Reject "${fund.title}"?`)) { rejectFund(fund.id); setSelectedFund(null); }
    } else {
      Alert.alert('Reject Fund', `Reject "${fund.title}"?`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reject ❌', style: 'destructive', onPress: () => { rejectFund(fund.id); setSelectedFund(null); } },
      ]);
    }
  };

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to log out?')) logout();
    } else {
      Alert.alert('Log Out', 'Are you sure?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log Out', style: 'destructive', onPress: () => logout() }
      ]);
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'LOW': return { badge: 'bg-blue-500/15 border-blue-500/30', text: 'text-blue-400' };
      case 'MEDIUM': return { badge: 'bg-yellow-500/15 border-yellow-500/30', text: 'text-yellow-400' };
      case 'HIGH': return { badge: 'bg-red-500/15 border-red-500/30', text: 'text-red-400' };
      default: return { badge: 'bg-gray-500/15 border-gray-500/30', text: 'text-gray-400' };
    }
  };

  return (
    <SafeAreaView style={tw`flex-1 ${tc.backgroundMain}`}>
      {/* Header */}
      <View style={tw`px-6 py-4 flex-row justify-between items-center border-b ${tc.borderMain}`}>
        <View>
          <Text style={tw`text-2xl font-extrabold ${tc.textMain}`}>🛡️ Admin Panel</Text>
          <Text style={tw`${tc.textSecondary} text-xs mt-0.5`}>Welcome, {currentUser?.name}</Text>
        </View>
        <View style={tw`flex-row items-center`}>
          {pendingFunds.length > 0 && (
            <View style={tw`bg-red-500 rounded-full w-5 h-5 items-center justify-center mr-3`}>
              <Text style={tw`text-white text-xs font-bold`}>{pendingFunds.length}</Text>
            </View>
          )}
          <TouchableOpacity
            style={tw`bg-red-500/15 border border-red-500/30 px-3 py-2 rounded-xl`}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats Row */}
      <View style={tw`px-6 py-4 flex-row`}>
        {[
          { label: 'Total Users', value: users.length, color: 'text-blue-400', bg: 'bg-blue-500/10', icon: 'people' },
          { label: 'Pending', value: pendingFunds.length, color: 'text-yellow-400', bg: 'bg-yellow-500/10', icon: 'time' },
          { label: 'Approved', value: funds.filter(f => f.status === 'APPROVED').length, color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: 'checkmark-circle' },
        ].map((stat, i) => (
          <View key={i} style={tw`flex-1 ${tc.backgroundCard} border ${tc.borderMain} rounded-2xl p-3 items-center mx-1`}>
            <View style={tw`${stat.bg} p-2 rounded-full mb-1`}>
              <Ionicons name={stat.icon as any} size={16} color={stat.color.replace('text-', '')} />
            </View>
            <Text style={tw`text-xl font-extrabold ${stat.color}`}>{stat.value}</Text>
            <Text style={tw`${tc.textMuted} text-xs`}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Tabs */}
      <View style={tw`flex-row px-6 mb-4`}>
        {[
          { key: 'requests', label: '📋 Fund Requests' },
          { key: 'users', label: '👥 All Users' },
        ].map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={tw`flex-1 py-2.5 items-center border-b-2 ${activeTab === tab.key ? 'border-emerald-500' : 'border-transparent'}`}
            onPress={() => setActiveTab(tab.key as AdminTab)}
          >
            <Text style={tw`font-bold text-sm ${activeTab === tab.key ? 'text-emerald-500' : tc.textMuted}`}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <ScrollView style={tw`flex-1 px-6`} showsVerticalScrollIndicator={false}>
        {activeTab === 'requests' ? (
          <>
            {allFunds.length === 0 ? (
              <View style={tw`${tc.backgroundCard} border ${tc.borderMain} p-10 rounded-3xl items-center mt-4`}>
                <Text style={tw`text-4xl mb-3`}>📭</Text>
                <Text style={tw`${tc.textMain} font-bold text-lg`}>No Submissions Yet</Text>
                <Text style={tw`${tc.textSecondary} text-sm text-center mt-1`}>Authorities haven't submitted any funds yet.</Text>
              </View>
            ) : (
              allFunds.map(fund => {
                const risk = getRiskColor(fund.riskLevel);
                return (
                  <TouchableOpacity
                    key={fund.id}
                    style={tw`${tc.backgroundCard} border ${tc.borderMain} p-5 rounded-3xl mb-4`}
                    onPress={() => setSelectedFund(fund)}
                    activeOpacity={0.8}
                  >
                    <View style={tw`flex-row justify-between items-start mb-3`}>
                      <View style={tw`flex-1 mr-3`}>
                        <Text style={tw`${tc.textMain} font-bold text-base`}>{fund.title}</Text>
                        <Text style={tw`${tc.textSecondary} text-xs mt-0.5`}>By {fund.submittedByName}</Text>
                      </View>
                      <StatusBadge status={fund.status} />
                    </View>

                    <View style={tw`flex-row items-center mb-3`}>
                      <View style={tw`${risk.badge} border px-2 py-0.5 rounded-md mr-2`}>
                        <Text style={tw`${risk.text} text-xs font-bold`}>{fund.riskLevel} RISK</Text>
                      </View>
                      <Text style={tw`${tc.backgroundSecondary} rounded-md px-2 py-0.5 text-xs ${tc.textSecondary} mr-2 border ${tc.borderSecondary}`}>{fund.type}</Text>
                      <Text style={tw`text-emerald-500 text-xs font-semibold`}>{fund.expectedReturn}</Text>
                    </View>

                    <View style={tw`flex-row justify-between items-center`}>
                      <Text style={tw`${tc.textMuted} text-xs`}>₹{fund.amount.toLocaleString()} min. </Text>
                      {fund.status === 'PENDING' && (
                        <View style={tw`flex-row`}>
                          <TouchableOpacity
                            style={tw`bg-emerald-500/15 border border-emerald-500/30 px-4 py-1.5 rounded-xl mr-2`}
                            onPress={() => handleApprove(fund)}
                          >
                            <Text style={tw`text-emerald-400 font-bold text-xs`}>✅ Approve</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={tw`bg-red-500/15 border border-red-500/30 px-4 py-1.5 rounded-xl`}
                            onPress={() => handleReject(fund)}
                          >
                            <Text style={tw`text-red-400 font-bold text-xs`}>❌ Reject</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </>
        ) : (
          /* Users Tab */
          <>
            {users.map(u => (
              <View key={u.id} style={tw`${tc.backgroundCard} border ${tc.borderMain} p-4 rounded-2xl mb-3 flex-row justify-between items-center`}>
                <View style={tw`flex-row items-center flex-1`}>
                  <View style={tw`bg-emerald-500/20 w-11 h-11 rounded-full items-center justify-center mr-3`}>
                    <Text style={tw`text-emerald-400 font-bold text-base`}>{u.name[0].toUpperCase()}</Text>
                  </View>
                  <View style={tw`flex-1`}>
                    <Text style={tw`${tc.textMain} font-bold`}>{u.name}</Text>
                    <Text style={tw`${tc.textMuted} text-xs`}>{u.email}</Text>
                  </View>
                </View>
                <RoleBadge role={u.role} />
              </View>
            ))}
          </>
        )}
        <View style={tw`h-10`} />
      </ScrollView>

      {/* Fund Detail Modal */}
      <Modal visible={!!selectedFund} transparent animationType="slide" onRequestClose={() => setSelectedFund(null)}>
        {selectedFund && (
          <View style={tw`flex-1 justify-end bg-black/60`}>
            <View style={tw`${tc.backgroundCard} rounded-t-3xl p-6 border-t ${tc.borderMain}`}>
              <View style={tw`flex-row justify-between items-start mb-4`}>
                <View style={tw`flex-1 mr-3`}>
                  <Text style={tw`${tc.textMain} text-xl font-bold`}>{selectedFund.title}</Text>
                  <Text style={tw`${tc.textSecondary} text-xs mt-1`}>Submitted by {selectedFund.submittedByName}</Text>
                </View>
                <TouchableOpacity onPress={() => setSelectedFund(null)}>
                  <Ionicons name="close-circle" size={28} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <View style={tw`bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl mb-4`}>
                <Text style={tw`${tc.textMain} text-sm leading-relaxed`}>{selectedFund.description}</Text>
              </View>

              <View style={tw`flex-row mb-4`}>
                {[
                  { label: 'Type', value: selectedFund.type },
                  { label: 'Risk', value: selectedFund.riskLevel },
                  { label: 'Min Amt', value: `₹${selectedFund.amount}` },
                  { label: 'Return', value: selectedFund.expectedReturn },
                ].map((item, i) => (
                  <View key={i} style={tw`flex-1 items-center ${tc.backgroundSecondary} rounded-xl p-2 mx-1`}>
                    <Text style={tw`${tc.textMuted} text-[10px]`}>{item.label}</Text>
                    <Text style={tw`${tc.textMain} font-bold text-xs mt-0.5`}>{item.value}</Text>
                  </View>
                ))}
              </View>

              <View style={tw`flex-row mb-2 items-center`}>
                <Text style={tw`${tc.textSecondary} text-xs mr-2`}>Status:</Text>
                <StatusBadge status={selectedFund.status} />
              </View>

              {selectedFund.status === 'PENDING' && (
                <View style={tw`flex-row mt-4`}>
                  <TouchableOpacity
                    style={tw`flex-1 bg-emerald-500 py-3.5 rounded-2xl items-center mr-2`}
                    onPress={() => handleApprove(selectedFund)}
                  >
                    <Text style={tw`text-white font-bold`}>✅ Approve Fund</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={tw`flex-1 bg-red-500/20 border border-red-500/30 py-3.5 rounded-2xl items-center ml-2`}
                    onPress={() => handleReject(selectedFund)}
                  >
                    <Text style={tw`text-red-400 font-bold`}>❌ Reject Fund</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        )}
      </Modal>
    </SafeAreaView>
  );
};

import React, { useState, useContext } from 'react';
import {
  View, Text, ScrollView, SafeAreaView, TouchableOpacity,
  TextInput, Alert, Modal, KeyboardAvoidingView, Platform,
} from 'react-native';
import tw from 'twrnc';
import { Ionicons } from '@expo/vector-icons';
import { AppContext } from '../context/AppContext';
import { getThemeClasses } from '../utils/theme';
import { Fund } from '../types';

const RISK_LEVELS = ['LOW', 'MEDIUM', 'HIGH'] as const;
const FUND_TYPES = ['MF', 'SIP', 'ETF'] as const;

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

export const AuthorityScreen = ({ navigation }: any) => {
  const { funds, currentUser, submitFund, logout, theme } = useContext(AppContext);
  const tc = getThemeClasses(theme);

  const [showForm, setShowForm] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formType, setFormType] = useState<'MF' | 'SIP' | 'ETF'>('MF');
  const [formRisk, setFormRisk] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('LOW');
  const [formAmount, setFormAmount] = useState('');
  const [formReturn, setFormReturn] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const myFunds = funds.filter(f => f.submittedBy === currentUser?.id);
  const pendingCount = myFunds.filter(f => f.status === 'PENDING').length;
  const approvedCount = myFunds.filter(f => f.status === 'APPROVED').length;

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to log out?')) logout();
    } else {
      Alert.alert('Log Out', 'Are you sure?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log Out', style: 'destructive', onPress: () => logout() },
      ]);
    }
  };

  const resetForm = () => {
    setFormTitle(''); setFormType('MF'); setFormRisk('LOW');
    setFormAmount(''); setFormReturn(''); setFormDesc('');
  };

  const handleSubmit = async () => {
    if (!formTitle.trim() || !formAmount.trim() || !formReturn.trim() || !formDesc.trim()) {
      Alert.alert('Incomplete', 'Please fill in all fields.');
      return;
    }
    const amt = parseFloat(formAmount);
    if (isNaN(amt) || amt <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid minimum investment amount.');
      return;
    }
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 500));
    submitFund({
      title: formTitle.trim(),
      type: formType,
      amount: amt,
      riskLevel: formRisk,
      expectedReturn: formReturn.trim(),
      description: formDesc.trim(),
    });
    setSubmitting(false);
    setShowForm(false);
    resetForm();
    if (Platform.OS === 'web') window.alert('Submitted! 🎉 Your fund has been submitted for admin approval.');
    else Alert.alert('Submitted! 🎉', 'Your fund has been submitted for admin approval.');
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
          <Text style={tw`text-2xl font-extrabold ${tc.textMain}`}>🏛️ Authority Panel</Text>
          <Text style={tw`${tc.textSecondary} text-xs mt-0.5`}>{currentUser?.name}</Text>
        </View>
        <View style={tw`flex-row items-center`}>
          <TouchableOpacity
            style={tw`bg-emerald-500 px-4 py-2 rounded-xl mr-3 flex-row items-center`}
            onPress={() => setShowForm(true)}
          >
            <Ionicons name="add" size={16} color="#fff" />
            <Text style={tw`text-white font-bold text-xs ml-1`}>Submit Fund</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={tw`bg-red-500/15 border border-red-500/30 p-2 rounded-xl`}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={18} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats Row */}
      <View style={tw`px-6 py-4 flex-row`}>
        {[
          { label: 'Submitted', value: myFunds.length, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: 'Pending', value: pendingCount, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
          { label: 'Approved', value: approvedCount, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
        ].map((s, i) => (
          <View key={i} style={tw`flex-1 ${tc.backgroundCard} border ${tc.borderMain} rounded-2xl p-3 items-center mx-1`}>
            <Text style={tw`text-2xl font-extrabold ${s.color}`}>{s.value}</Text>
            <Text style={tw`${tc.textMuted} text-xs`}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Submissions List */}
      <ScrollView style={tw`flex-1 px-6`} showsVerticalScrollIndicator={false}>
        <Text style={tw`${tc.textMain} font-bold text-lg mb-3`}>
          My Submissions <Text style={tw`${tc.textMuted} text-sm font-normal`}>({myFunds.length})</Text>
        </Text>

        {myFunds.length === 0 ? (
          <View style={tw`${tc.backgroundCard} border ${tc.borderMain} p-10 rounded-3xl items-center`}>
            <Text style={tw`text-5xl mb-3`}>📤</Text>
            <Text style={tw`${tc.textMain} font-bold text-lg`}>No Submissions Yet</Text>
            <Text style={tw`${tc.textSecondary} text-sm text-center mt-1 mb-4`}>Tap "Submit Fund" to propose a new investment fund.</Text>
            <TouchableOpacity
              style={tw`bg-emerald-500 px-6 py-3 rounded-2xl`}
              onPress={() => setShowForm(true)}
            >
              <Text style={tw`text-white font-bold`}>+ Submit Fund</Text>
            </TouchableOpacity>
          </View>
        ) : (
          myFunds.map(fund => {
            const risk = getRiskColor(fund.riskLevel);
            const statusIcons: Record<string, string> = { PENDING: '⏳', APPROVED: '✅', REJECTED: '❌' };
            return (
              <View key={fund.id} style={tw`${tc.backgroundCard} border ${tc.borderMain} rounded-3xl p-5 mb-4`}>
                <View style={tw`flex-row justify-between items-start mb-3`}>
                  <View style={tw`flex-1 mr-3`}>
                    <Text style={tw`${tc.textMain} font-bold text-base`}>
                      {statusIcons[fund.status]} {fund.title}
                    </Text>
                    <Text style={tw`${tc.textMuted} text-xs mt-0.5`}>
                      {new Date(fund.submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </Text>
                  </View>
                  <StatusBadge status={fund.status} />
                </View>

                <Text style={tw`${tc.textSecondary} text-xs mb-3 leading-5`} numberOfLines={2}>{fund.description}</Text>

                <View style={tw`flex-row flex-wrap`}>
                  <View style={tw`${risk.badge} border px-2 py-0.5 rounded-md mr-2 mb-1`}>
                    <Text style={tw`${risk.text} text-xs font-bold`}>{fund.riskLevel} RISK</Text>
                  </View>
                  <View style={tw`${tc.backgroundSecondary} border ${tc.borderSecondary} px-2 py-0.5 rounded-md mr-2 mb-1`}>
                    <Text style={tw`${tc.textSecondary} text-xs`}>{fund.type}</Text>
                  </View>
                  <View style={tw`bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md mr-2 mb-1`}>
                    <Text style={tw`text-emerald-400 text-xs font-semibold`}>{fund.expectedReturn}</Text>
                  </View>
                  <View style={tw`${tc.backgroundSecondary} border ${tc.borderSecondary} px-2 py-0.5 rounded-md mb-1`}>
                    <Text style={tw`${tc.textSecondary} text-xs`}>₹{fund.amount.toLocaleString()}</Text>
                  </View>
                </View>

                {fund.status === 'APPROVED' && (
                  <View style={tw`flex-row items-center mt-3 pt-3 border-t border-emerald-500/20`}>
                    <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                    <Text style={tw`text-emerald-400 text-xs ml-1 font-medium`}>
                      Approved · Now visible to students in InvestmentsScreen
                    </Text>
                  </View>
                )}
                {fund.status === 'REJECTED' && (
                  <View style={tw`flex-row items-center mt-3 pt-3 border-t border-red-500/20`}>
                    <Ionicons name="close-circle" size={14} color="#EF4444" />
                    <Text style={tw`text-red-400 text-xs ml-1 font-medium`}>
                      Rejected by admin · Please revise and resubmit
                    </Text>
                  </View>
                )}
              </View>
            );
          })
        )}
        <View style={tw`h-10`} />
      </ScrollView>

      {/* Submit Fund Modal */}
      <Modal visible={showForm} transparent animationType="slide" onRequestClose={() => setShowForm(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={tw`flex-1 justify-end bg-black/60`}>
          <View style={tw`${tc.backgroundCard} rounded-t-3xl border-t ${tc.borderMain} max-h-[90%]`}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={tw`p-6`} keyboardShouldPersistTaps="handled">
              {/* Modal Header */}
              <View style={tw`flex-row justify-between items-center mb-6`}>
                <Text style={tw`${tc.textMain} text-xl font-bold`}>📋 Submit New Fund</Text>
                <TouchableOpacity onPress={() => { setShowForm(false); resetForm(); }}>
                  <Ionicons name="close-circle" size={28} color="#6B7280" />
                </TouchableOpacity>
              </View>

              {/* Fund Name */}
              <View style={tw`mb-4`}>
                <Text style={tw`${tc.textSecondary} text-xs font-semibold mb-2 uppercase tracking-wider`}>Fund Name *</Text>
                <View style={tw`${tc.inputBackground} rounded-xl px-4 py-3 border ${tc.borderMain}`}>
                  <TextInput
                    style={tw`${tc.inputText} text-base`}
                    placeholder="e.g. Sustainable Future Fund"
                    placeholderTextColor="#6B7280"
                    value={formTitle}
                    onChangeText={setFormTitle}
                  />
                </View>
              </View>

              {/* Fund Type */}
              <View style={tw`mb-4`}>
                <Text style={tw`${tc.textSecondary} text-xs font-semibold mb-2 uppercase tracking-wider`}>Fund Type *</Text>
                <View style={tw`flex-row`}>
                  {FUND_TYPES.map(t => (
                    <TouchableOpacity
                      key={t}
                      style={tw`flex-1 py-3 items-center rounded-xl border mx-1 ${formType === t ? 'border-emerald-500 bg-emerald-500/10' : `border ${tc.borderMain} ${tc.backgroundSecondary}`}`}
                      onPress={() => setFormType(t)}
                    >
                      <Text style={tw`font-bold text-sm ${formType === t ? 'text-emerald-400' : tc.textSecondary}`}>{t === 'MF' ? 'Mutual Fund' : t}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Risk Level */}
              <View style={tw`mb-4`}>
                <Text style={tw`${tc.textSecondary} text-xs font-semibold mb-2 uppercase tracking-wider`}>Risk Level *</Text>
                <View style={tw`flex-row`}>
                  {RISK_LEVELS.map(r => {
                    const colors = { LOW: 'border-blue-500 bg-blue-500/10 text-blue-400', MEDIUM: 'border-yellow-500 bg-yellow-500/10 text-yellow-400', HIGH: 'border-red-500 bg-red-500/10 text-red-400' };
                    return (
                      <TouchableOpacity
                        key={r}
                        style={tw`flex-1 py-3 items-center rounded-xl border mx-1 ${formRisk === r ? colors[r] : `border ${tc.borderMain} ${tc.backgroundSecondary}`}`}
                        onPress={() => setFormRisk(r)}
                      >
                        <Text style={tw`font-bold text-sm ${formRisk === r ? colors[r].split(' ')[2] : tc.textSecondary}`}>{r}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Amount & Return */}
              <View style={tw`flex-row mb-4`}>
                <View style={tw`flex-1 mr-2`}>
                  <Text style={tw`${tc.textSecondary} text-xs font-semibold mb-2 uppercase tracking-wider`}>Min. Amount (₹) *</Text>
                  <View style={tw`${tc.inputBackground} rounded-xl px-4 py-3 border ${tc.borderMain}`}>
                    <TextInput
                      style={tw`${tc.inputText} text-base`}
                      placeholder="500"
                      placeholderTextColor="#6B7280"
                      value={formAmount}
                      onChangeText={setFormAmount}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
                <View style={tw`flex-1 ml-2`}>
                  <Text style={tw`${tc.textSecondary} text-xs font-semibold mb-2 uppercase tracking-wider`}>Expected Return *</Text>
                  <View style={tw`${tc.inputBackground} rounded-xl px-4 py-3 border ${tc.borderMain}`}>
                    <TextInput
                      style={tw`${tc.inputText} text-base`}
                      placeholder="10-12% p.a."
                      placeholderTextColor="#6B7280"
                      value={formReturn}
                      onChangeText={setFormReturn}
                    />
                  </View>
                </View>
              </View>

              {/* Description */}
              <View style={tw`mb-6`}>
                <Text style={tw`${tc.textSecondary} text-xs font-semibold mb-2 uppercase tracking-wider`}>Description *</Text>
                <View style={tw`${tc.inputBackground} rounded-xl px-4 py-3 border ${tc.borderMain}`}>
                  <TextInput
                    style={tw`${tc.inputText} text-base`}
                    placeholder="Brief description of this fund..."
                    placeholderTextColor="#6B7280"
                    value={formDesc}
                    onChangeText={setFormDesc}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                  />
                </View>
              </View>

              {/* Submit */}
              <TouchableOpacity
                style={tw`bg-emerald-500 py-4 items-center rounded-2xl shadow-lg shadow-emerald-500/30 ${submitting ? 'opacity-70' : ''}`}
                onPress={handleSubmit}
                disabled={submitting}
              >
                <Text style={tw`text-white font-bold text-base`}>
                  {submitting ? '⏳ Submitting...' : '🚀 Submit for Admin Approval'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

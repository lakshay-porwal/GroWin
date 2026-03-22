import React, { useState, useContext } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView,
  Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import tw from 'twrnc';
import { AppContext } from '../context/AppContext';
import { Ionicons } from '@expo/vector-icons';
import { UserRole } from '../types';

type Mode = 'login' | 'register';

const ROLES: { label: string; value: UserRole; icon: string; desc: string; activeStyle: string; activeText: string }[] = [
  { label: 'Student', value: 'student', icon: '🎓', desc: 'Invest & track finances', activeStyle: 'border-emerald-500 bg-emerald-500/15', activeText: 'text-emerald-400' },
  { label: 'Authority', value: 'authority', icon: '🏛️', desc: 'Submit investment funds', activeStyle: 'border-purple-500 bg-purple-500/15', activeText: 'text-purple-400' },
  { label: 'Admin', value: 'admin', icon: '🛡️', desc: 'Manage & approve', activeStyle: 'border-orange-500 bg-orange-500/15', activeText: 'text-orange-400' },
];

interface FieldError {
  name?: string;
  email?: string;
  password?: string;
  general?: string;
}

const ErrorText = ({ msg }: { msg?: string }) =>
  msg ? (
    <View style={tw`flex-row items-center mt-1.5 mb-1`}>
      <Ionicons name="alert-circle" size={13} color="#EF4444" />
      <Text style={tw`text-red-400 text-xs ml-1`}>{msg}</Text>
    </View>
  ) : null;

const InputBox = ({
  icon, placeholder, value, onChangeText, secure, showToggle, onToggle,
  keyboardType, errorMsg, autoCapitalize, clearErrors
}: any) => (
  <View style={tw`mb-1`}>
    <View style={[tw`bg-gray-800 border rounded-xl flex-row items-center px-4`, { borderColor: errorMsg ? '#EF4444' : '#374151' }]}>
      <Ionicons name={icon} size={17} color={errorMsg ? '#EF4444' : '#6B7280'} style={tw`mr-3`} />
      <TextInput
        style={tw`flex-1 text-white text-base py-3.5`}
        placeholder={placeholder}
        placeholderTextColor="#4B5563"
        value={value}
        onChangeText={(t: string) => { onChangeText(t); if (errorMsg && clearErrors) clearErrors(); }}
        secureTextEntry={secure && !showToggle}
        keyboardType={keyboardType ?? 'default'}
        autoCapitalize={autoCapitalize ?? 'sentences'}
      />
      {onToggle && (
        <TouchableOpacity onPress={onToggle}>
          <Ionicons name={showToggle ? 'eye-off-outline' : 'eye-outline'} size={18} color="#6B7280" />
        </TouchableOpacity>
      )}
    </View>
    <ErrorText msg={errorMsg} />
  </View>
);

export const LoginScreen = () => {
  const { loginUser, register } = useContext(AppContext);
  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [role, setRole] = useState<UserRole>('student');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FieldError>({});
  const [successMsg, setSuccessMsg] = useState('');

  const clearErrors = () => setErrors({});

  const validate = (): boolean => {
    const newErrors: FieldError = {};
    if (mode === 'register' && !name.trim()) newErrors.name = 'Full name is required.';
    if (!email.trim()) {
      newErrors.email = 'Email is required.';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Enter a valid email address.';
    }
    if (!password) {
      newErrors.password = 'Password is required.';
    } else if (mode === 'register' && password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    setLoading(true);
    setSuccessMsg('');
    clearErrors();

    let result: { success: boolean; message: string };
    if (mode === 'login') {
      result = await loginUser(email.trim(), password);
    } else {
      result = await register(name.trim(), email.trim(), password, role);
    }

    if (!result.success) {
      setErrors({ general: result.message });
    } else {
      setSuccessMsg(result.message);
    }
    setLoading(false);
  };

  const switchMode = (m: Mode) => {
    setMode(m);
    clearErrors();
    setSuccessMsg('');
    setName(''); setEmail(''); setPassword('');
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={tw`flex-1 bg-gray-950`}>
      <ScrollView
        contentContainerStyle={tw`flex-grow justify-center px-6 py-10`}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <View style={tw`items-center mb-8`}>
          <View style={tw`w-20 h-20 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl items-center justify-center mb-4`}>
            <Ionicons name="leaf" size={38} color="#10B981" />
          </View>
          <Text style={tw`text-white text-4xl font-extrabold tracking-tight`}>
            Gro<Text style={tw`text-emerald-500`}>Win</Text>
          </Text>
          <Text style={tw`text-gray-500 text-sm mt-1`}>India's Student Investment App</Text>
        </View>

        {/* Card */}
        <View style={tw`bg-gray-900 rounded-3xl border border-gray-800 p-6`}>
          {/* Tab Toggle */}
          <View style={tw`flex-row bg-gray-800/80 rounded-2xl p-1 mb-5`}>
            {(['login', 'register'] as Mode[]).map(m => (
              <TouchableOpacity
                key={m}
                style={tw`flex-1 py-2.5 items-center rounded-xl ${mode === m ? 'bg-emerald-500' : ''}`}
                onPress={() => switchMode(m)}
              >
                <Text style={tw`font-bold text-sm capitalize ${mode === m ? 'text-white' : 'text-gray-500'}`}>{m}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Global error banner */}
          {errors.general && (
            <View style={tw`bg-red-500/15 border border-red-500/40 rounded-xl px-4 py-3 mb-4 flex-row items-center`}>
              <Ionicons name="close-circle" size={18} color="#EF4444" />
              <Text style={tw`text-red-400 text-sm font-medium ml-2 flex-1`}>{errors.general}</Text>
            </View>
          )}

          {/* Success banner */}
          {successMsg ? (
            <View style={tw`bg-emerald-500/15 border border-emerald-500/40 rounded-xl px-4 py-3 mb-4 flex-row items-center`}>
              <Ionicons name="checkmark-circle" size={18} color="#10B981" />
              <Text style={tw`text-emerald-400 text-sm font-medium ml-2 flex-1`}>{successMsg}</Text>
            </View>
          ) : null}

          {/* Name (register only) */}
          {mode === 'register' && (
            <InputBox
              icon="person-outline"
              placeholder="Full Name"
              value={name}
              onChangeText={setName}
              errorMsg={errors.name}
              autoCapitalize="words"
              clearErrors={clearErrors}
            />
          )}

          {/* Email */}
          <InputBox
            icon="mail-outline"
            placeholder="Email address"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            errorMsg={errors.email}
            clearErrors={clearErrors}
          />

          {/* Password */}
          <InputBox
            icon="lock-closed-outline"
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secure
            showToggle={showPw}
            onToggle={() => setShowPw(v => !v)}
            errorMsg={errors.password}
            clearErrors={clearErrors}
          />

          {/* Role selector */}
          {mode === 'register' && (
            <View style={tw`mb-5`}>
              <Text style={tw`text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2.5 mt-1`}>I am a...</Text>
              <View style={tw`flex-row`}>
                {ROLES.map(r => (
                  <TouchableOpacity
                    key={r.value}
                    style={tw`flex-1 mx-0.5 p-3 rounded-2xl border ${role === r.value ? r.activeStyle : 'border-gray-700 bg-gray-800'} items-center`}
                    onPress={() => setRole(r.value)}
                  >
                    <Text style={tw`text-2xl mb-1`}>{r.icon}</Text>
                    <Text style={tw`font-bold text-xs ${role === r.value ? r.activeText : 'text-gray-500'}`}>{r.label}</Text>
                    <Text style={tw`text-gray-600 text-[9px] text-center mt-0.5 leading-3`}>{r.desc}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Submit */}
          <TouchableOpacity
            style={tw`bg-emerald-500 py-4 rounded-2xl items-center mt-2 ${loading ? 'opacity-70' : ''}`}
            onPress={submit}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={tw`text-white font-extrabold text-base`}>
                {mode === 'login' ? '🚀 Sign In' : '✨ Create Account'}
              </Text>
            )}
          </TouchableOpacity>

          {/* Admin demo hint */}
          {mode === 'login' && (
            <View style={tw`mt-4 bg-gray-800 rounded-xl px-4 py-3 border border-gray-700/60`}>
              <Text style={tw`text-gray-600 text-[11px] text-center`}>
                Admin demo: <Text style={tw`text-emerald-400 font-semibold`}>admin@growin.app</Text>
                {' · '}
                <Text style={tw`text-emerald-400 font-semibold`}>admin123</Text>
              </Text>
            </View>
          )}
        </View>

        {/* Switch mode */}
        <TouchableOpacity style={tw`mt-5 items-center py-2`} onPress={() => switchMode(mode === 'login' ? 'register' : 'login')}>
          <Text style={tw`text-gray-500 text-sm`}>
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <Text style={tw`text-emerald-500 font-bold`}>{mode === 'login' ? 'Sign Up' : 'Log In'}</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

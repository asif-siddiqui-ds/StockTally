import { account } from '@/appwrite';
import ScreenWrapper from '@/components/ScreenWrapper';
import { router, useSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Button,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

const ResetPasswordScreen: React.FC = () => {
  const searchParams = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const userId = searchParams.get('userId');
  const secret = searchParams.get('secret');

  const handleReset = async () => {
    if (!password || !confirmPassword) {
      Alert.alert('Error', 'Please enter and confirm your password.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

    try {
      await account.updateRecovery(userId as string, secret as string, password, confirmPassword);
      Alert.alert('Success', 'Password has been reset. Please login.');
      router.replace('/(auth)/LoginScreen');
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <Text style={styles.title}>Reset Password</Text>

        <TextInput
          style={styles.input}
          placeholder="New Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        <Button title="Reset Password" onPress={handleReset} />
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 30 },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
});

export default ResetPasswordScreen;

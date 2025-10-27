// // app/screens/Register.tsx
// import ScreenWrapper from '@/components/ScreenWrapper';
// import { router } from 'expo-router';
// import React, { useState } from 'react';
// import { Alert, Button, StyleSheet, Text, TextInput, View } from 'react-native';
// import { ID, account } from '../../appwrite';

// const RegisterScreen: React.FC = () => {
//   const [email, setEmail] = useState<string>('');
//   const [password, setPassword] = useState<string>('');

//   const handleRegister = async () => {
//     try {
//       await account.create(ID.unique(), email.trim(), password);
//       Alert.alert("Account Created Successfully");
//       router.push('./screens/LoginScreen');
//     } catch (error: any) {
//       Alert.alert("Registration Failed", error.message);
//     }
//   };

//   return (
//     <ScreenWrapper>
//     <View style={styles.container}>
//       <Text style={styles.label}>Email:</Text>
//       <TextInput
//         style={styles.input}
//         value={email}
//         onChangeText={setEmail}
//         placeholder="Enter your email"
//         keyboardType="email-address"
//         autoCapitalize="none"
//       />
//       <Text style={styles.label}>Password:</Text>
//       <TextInput
//         style={styles.input}
//         value={password}
//         onChangeText={setPassword}
//         placeholder="Enter your password"
//         secureTextEntry
//         autoCapitalize="none"
//       />
//       <Button title="Register" onPress={handleRegister} />
//     </View>
//     </ScreenWrapper>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     padding: 20,
//   },
//   label: {
//     marginBottom: 5,
//   },
//   input: {
//     height: 40,
//     borderColor: '#ccc',
//     borderWidth: 1,
//     marginBottom: 15,
//     paddingHorizontal: 10,
//     borderRadius: 5,
//   },
// });

// export default RegisterScreen;

// app/screens/SignUp.tsx
import ScreenWrapper from '@/components/ScreenWrapper';
import { useAuth } from '@/context/AuthContext';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Button, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const SignUpScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const { signup } = useAuth();

  const handleSignUp = async () => {
    try {
      await signup(email, password, name);
      Alert.alert('Account created successfully');
      router.replace('/(tabs)'); // ✅ take them straight into the app
    } catch {
      Alert.alert('Sign Up Failed', 'Please try again');
    }
  };

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <TouchableOpacity
                style={styles.closeButton}
                onPress={() => router.push("/(tabs)")}
              >
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
        <Text style={styles.label}>Name:</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Enter your name"
        />

        <Text style={styles.label}>Email:</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Enter your email"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Password:</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="Enter your password"
          secureTextEntry
          autoCapitalize="none"
        />

        <Button title="Sign Up" onPress={handleSignUp} />
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  label: {
    marginBottom: 5,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
   closeButton: { position: "absolute", top: 20, right: 20 },
  closeText: { fontSize: 26, fontWeight: "bold", color: "#0c0c0cff" },
});

export default SignUpScreen;

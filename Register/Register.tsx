import React, { useState } from 'react';
import { View, TextInput, StyleSheet, SafeAreaView, Pressable, Text, Alert, Keyboard } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, doc, setDoc } from 'firebase/firestore';
import { auth, firestore } from '../firebaseConfig'; // Assuming firebaseConfig.ts is correctly set up
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RegisterProps = {
  navigation: NativeStackNavigationProp<any>;
};

export const RegisterScreen: React.FC<RegisterProps> = ({ navigation }) => {
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [phone, setPhone] = useState<string>('');

  const registerAndGoToMainFlow = async () => {
    try {
      const response = await createUserWithEmailAndPassword(auth, email, password);
      if (response.user) {
        const userDoc = {
          uid: response.user.uid,
          email: email,
          name: name,
          phone: phone,
        };
        const userRef = doc(collection(firestore, 'users'), response.user.uid);
        await setDoc(userRef, userDoc);
        navigation.replace('Login'); // Replace 'Login' with your login screen name
      }
    } catch (error: any) {
      let errorMessage = 'Registration failed';
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'Email already in use';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password should be at least 6 characters';
          break;
        default:
          errorMessage = 'Registration failed. Please try again later';
      }
      Alert.alert('Error', errorMessage);
    }
  };

  return (
    <Pressable style={styles.contentView} onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.contentView}>
        <View style={styles.container}>
          <View style={styles.titleContainer}>
            <Text style={styles.titleText}>Register</Text>
          </View>
          <View style={styles.mainContent}>
            <TextInput
              style={styles.loginTextField}
              placeholder="Name"
              value={name}
              onChangeText={setName}
            />
            <TextInput
              style={styles.loginTextField}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              inputMode="email"
              autoCapitalize="none"
            />
            <TextInput
              style={styles.loginTextField}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <TextInput
              style={styles.loginTextField}
              placeholder="Phone"
              value={phone}
              onChangeText={setPhone}
              inputMode="tel"
            />
          </View>
          <Pressable
            style={({ pressed }) => [
              {
                backgroundColor: pressed ? '#ddd' : '#007AFF',
              },
              styles.button,
            ]}
            onPress={registerAndGoToMainFlow}>
            <Text style={styles.buttonText}>Sign Up</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              {
                backgroundColor: pressed ? '#ddd' : '#007AFF',
              },
              styles.button,
            ]}
            onPress={() => navigation.replace('Login')}>
            <Text style={styles.buttonText}>Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  contentView: {
    flex: 1,
    backgroundColor: 'white',
  },
  container: {
    flex: 1,
    marginHorizontal: 50,
    backgroundColor: 'white',
    paddingTop: 20,
  },
  titleContainer: {
    flex: 1.2,
    justifyContent: 'center',
  },
  titleText: {
    fontSize: 45,
    textAlign: 'center',
    fontWeight: '200',
  },
  loginTextField: {
    borderBottomWidth: 1,
    height: 60,
    fontSize: 30,
    marginVertical: 10,
    fontWeight: '300',
  },
  mainContent: {
    flex: 6,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 8,
    height: 50,
    marginVertical: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: '500',
  },
});

export default RegisterScreen;
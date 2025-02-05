import React, { useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, SafeAreaView, Pressable, Text, Alert, Keyboard, Image, ActivityIndicator } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, doc, setDoc } from 'firebase/firestore';
import { auth, firestore } from '../firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RegisterProps = {
  navigation: NativeStackNavigationProp<any>;
};

export const RegisterScreen: React.FC<RegisterProps> = ({ navigation }) => {
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    checkAsyncStorage();
  }, []);

  //check if it stored in the AsyncStorage
  const checkAsyncStorage = async () => {
    try {
      const storedValue = await AsyncStorage.getItem('userLoggedIn');
      console.log('Value in AsyncStorage:', storedValue);
    } catch (error) {
      console.error('Error checking AsyncStorage:', error);
    }
  };

  //provide all the info that in being saved in the AsyncStorage
  const dumpAsyncStorage = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const result = await AsyncStorage.multiGet(keys);
      console.log('AsyncStorage dump:');
      result.forEach(([key, value]) => console.log(key, ':', value));
    } catch (error) {
      console.error('Error dumping AsyncStorage:', error);
    }
  };

  //check if all the fields are filled
  const registerAndGoToMainFlow = async () => {
    if (!name || !email || !password || !phone) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
//store the user info in the firebase
    setIsLoading(true);
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

        // AsyncStorage
        await AsyncStorage.setItem('userLoggedIn', 'true');

        // Check if the value was stored successfully
        const storedValue = await AsyncStorage.getItem('userLoggedIn');
        if (storedValue === 'true') {
          console.log('Value successfully stored in AsyncStorage');
        } else {
          console.warn('Failed to store value in AsyncStorage');
        }

        // Dump all AsyncStorage contents
        await dumpAsyncStorage();

        navigation.replace('Login');
      }
    } //user validation 
    catch (error: any) {
      let errorMessage = 'Registration failed';
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'Email already in use';
          break;
        case 'auth/invalid-phone-number':
            errorMessage = 'Invalid phone number';
            break;
        case 'auth/missing-phone-number':
            errorMessage = 'Phone number is missing';
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
    } finally {
      setIsLoading(false);
    }
  };
//view register screen 
  return (
    <Pressable style={styles.contentView} onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.contentView}>
        <View style={styles.container}>
          <Image
            source={require('./../assets/images/Logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.titleText}>Create Account</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              value={name}
              onChangeText={setName}
              placeholderTextColor="#888"
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              inputMode="email"
              autoCapitalize="none"
              placeholderTextColor="#888"
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholderTextColor="#888"
            />
            <TextInput
              style={styles.input}
              placeholder="Phone"
              value={phone}
              onChangeText={setPhone}
              inputMode="tel"
              placeholderTextColor="#888"
            />
          </View>
          <Pressable
            style={({ pressed }) => [
              styles.button,
              { backgroundColor: pressed ? '#0056b3' : '#007AFF' },
            ]}
            onPress={registerAndGoToMainFlow}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>Sign Up</Text>
            )}
          </Pressable>
          <Pressable
            style={styles.textButton}
            onPress={() => navigation.replace('Login')}
          >
            <Text style={styles.textButtonText}>Already have an account? Log In</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </Pressable>
  );
};
//style definitions
const styles = StyleSheet.create({
  contentView: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E0F7FA',
  },
  logo: {
    width: 250,
    height: 250,
    marginBottom: 20,
  },
  titleText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 30,
  },
  inputContainer: {
    width: '85%',
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    textAlign: 'left',
  },
  button: {
    width: '85%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 15,
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  textButton: {
    marginTop: 20,
  },
  textButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
});

export default RegisterScreen;
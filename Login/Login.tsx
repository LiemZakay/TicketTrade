import React, { useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text, Image, Alert, Switch, Pressable, ActivityIndicator, Keyboard } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './../firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type LoginProps = {
  navigation: NativeStackNavigationProp<any>;
};

export const LoginScreen: React.FC<LoginProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadSavedCredentials();
  }, []);
//using the AsyncStorage to import the saved user 
  const loadSavedCredentials = async () => {
    try {
      const savedEmail = await AsyncStorage.getItem('savedEmail');
      const savedPassword = await AsyncStorage.getItem('savedPassword');
      if (savedEmail && savedPassword) {
        setEmail(savedEmail);
        setPassword(savedPassword);
        setRememberMe(true);
      }
    } catch (error) {
      console.error('Error loading saved credentials:', error);
    }
  };
//Save the user details to the AsyncStorage 
  const saveCredentials = async () => {
    try {
      if (rememberMe) {
        await AsyncStorage.setItem('savedEmail', email);
        await AsyncStorage.setItem('savedPassword', password);
      } else {
        await AsyncStorage.removeItem('savedEmail');
        await AsyncStorage.removeItem('savedPassword');
      }
    } catch (error) {
      console.error('Error saving credentials:', error);
    }
  };
//check if all the fileds are filled
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('User logged in:', userCredential.user.email);
      await saveCredentials();
      navigation.replace('HomeScreen');
      // Navigate to home screen when the user is logged in
    } catch (error) {
      //handeling error 
      console.error('Login failed:', error);
      Alert.alert('Login Failed', 'Please check your email and password.');
    } finally {
      setIsLoading(false);
    }
  };

  const goToRegister = () => {
    navigation.replace('Register');
  };
//view register screen 
  return (
    <Pressable style={styles.contentView} onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <View style={styles.logoContainer}>
          <Image 
            source={require('./../assets/images/Logo.png')} 
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.logoText}>Sign in</Text>
        </View>
        <View style={styles.mainContent}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
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
          <View style={styles.rememberMeContainer}>
            <Switch
              value={rememberMe}
              onValueChange={value => {
                setRememberMe(value);
                saveCredentials(); // Save credentials whenever 'Remember Me' switch changes
              }}
            />
            <Text style={styles.rememberMeText}>Remember Me</Text>
          </View>
          <Pressable
            style={({ pressed }) => [
              styles.button,
              { backgroundColor: pressed ? '#0056b3' : '#007AFF' },
            ]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>Login</Text>
            )}
          </Pressable>
          <TouchableOpacity onPress={goToRegister}>
            <Text style={styles.registerText}>Don't have an account? Register here.</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Pressable>
  );
};
//style info
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
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoText: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#00796B',
  },
  logoImage: {
    width: 300, 
    height: 300, 
    borderRadius: 100, 
    marginTop: 10,
  },
  mainContent: {
    marginBottom: 30,
    width: '85%',
  },
  input: {
    width: '100%',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    textAlign: 'left',
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  rememberMeText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#00796B',
  },
  button: {
    width: '100%',
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
  registerText: {
    marginTop: 20,
    color: '#007AFF',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default LoginScreen;

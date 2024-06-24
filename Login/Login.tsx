import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, StyleSheet, TouchableOpacity, Text, Image, Alert, Switch } from 'react-native';
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

  useEffect(() => {
    loadSavedCredentials();
  }, []);

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

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('User logged in:', userCredential.user.email);
      await saveCredentials();
      navigation.replace('HomeScreen');
    } catch (error) {
      console.error('Login failed:', error);
      Alert.alert('Login Failed', 'Please check your email and password.');
    }
  };

  const goToRegister = () => {
    navigation.replace('Register');
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image 
          source={require('./../assets/images/Logo.png')} 
          style={styles.logoImage}
          resizeMode="cover"
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
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <View style={styles.rememberMeContainer}>
          <Switch
            value={rememberMe}
            onValueChange={setRememberMe}
          />
          <Text style={styles.rememberMeText}>Remember Me</Text>
        </View>
    
      </View>
      <Button title="Login" onPress={handleLogin} />
      <TouchableOpacity onPress={goToRegister}>
        <Text style={styles.registerText}>Don't have an account? Register here.</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
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
    fontSize: 35,
    fontWeight: 'bold',
    color: '#00796B',
  },
  logoImage: {
    width: 200, 
    height: 200, 
    borderRadius: 100, 
    marginTop: 10,
  },
  mainContent: {
    marginBottom: 30,
    width: '80%',
  },
  input: {
    width: '100%',
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  rememberMeText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#00796B',
  },
  registerText: {
    marginTop: 10,
    color: 'blue',
  },
});

export default LoginScreen;
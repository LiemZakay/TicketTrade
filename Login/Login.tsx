import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, TouchableOpacity, Text, Image, Alert } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './../firebaseConfig'; // Assuming firebaseConfig.js contains Firebase initialization
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';


type LoginProps = {
  navigation: NativeStackNavigationProp<any>;
};

export const LoginScreen: React.FC<LoginProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // User successfully logged in
      console.log('User logged in:', userCredential.user.email);
      navigation.replace('HomeScreen');
      // Navigate to next screen or handle success
    //  navigation.navigate('Home'); // Replace 'Home' with your desired screen name
    } catch (error) {
      console.error('Login failed:', error);
      // Handle login failure (show error message, etc.)
    }
  };

  const goToRegister = () => {
    navigation.replace('Register'); // Replace 'Register' with your registration screen name
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
        <TouchableOpacity onPress={() => Alert.alert('Forgot Password')}>
          <Text style={styles.forgotPasswordText}>Forgot password</Text>
        </TouchableOpacity>
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
  forgotPasswordText: {
    fontSize: 14,
    color: '#00796B',
    textAlign: 'right',
    marginVertical: 10,
  },
  registerText: {
    marginTop: 10,
    color: 'blue',
  },
});

export default LoginScreen;

import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Keyboard,
  Alert,
  Image,
  TouchableOpacity,
} from "react-native";
import { CTAButton } from "../Components/CTAButton/CTAButton";

import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import auth from '@react-native-firebase/auth';


export const Login = () => {
  const [email, setEmail] = useState<string | undefined>();
  const [password, setPassword] = useState<string | undefined>();

  const nav = useNavigation<NativeStackNavigationProp<any>>();

  const goToRegistration = () => {
    nav.push("Register");
  };

  const goToMainFlow = async () => {
    try {
      if (email && password) {
        const userCredential = await auth().signInWithEmailAndPassword(email, password);
        console.log('User signed in:', userCredential.user.email);
        nav.push('HomePage');
      } else {
        console.error('Email and password are required');
      }
    } catch (error) {
      console.error('Error during sign-in:', error);
    }
  };
  
  return (
    <Pressable style={styles.contentView} onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.contentView}>
        <View style={styles.container}>
          <View style={styles.logoContainer}>
          <Image 
              source={require("./../assets/images/Logo.png")} 
              style={styles.logoImage}
              resizeMode="cover"
            />
            <Text style={styles.logoText}>Sign up</Text>
          </View>
          <View style={styles.mainContent}>
            <TextInput
              style={styles.loginTextField}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              inputMode="email"
            />
            <TextInput
              style={styles.loginTextField}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <TouchableOpacity onPress={() => Alert.alert('Forgot Password')}>
              <Text style={styles.forgotPasswordText}>Forgot password</Text>
            </TouchableOpacity>
          </View>
          <CTAButton title="Login" onPress={goToMainFlow} variant="primary" />
          <TouchableOpacity onPress={goToRegistration}>
            <Text style={styles.signUpText}>Sign up</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  contentView: {
    flex: 1,
    backgroundColor: "#E0F7FA",
  },
  container: {
    flex: 1,
    marginHorizontal: 50,
    backgroundColor: "#E0F7FA",
    paddingTop: 20,
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  logoText: {
    fontSize: 35,
    fontWeight: "bold",
    color: "#00796B",
  },
  logoImage: {
    resizeMode: "contain",
    width: 200, 
    height: 200, 
    borderRadius: 100, 
    marginTop: 10,  
  },
  mainContent: {
    marginBottom: 30,
  },
  loginTextField: {
    borderBottomWidth: 1,
    height: 50,
    fontSize: 18,
    marginVertical: 10,
    fontWeight: "300",
    borderBottomColor: "#00796B",
    color: "#00796B",
  },
  forgotPasswordText: {
    fontSize: 14,
    color: "#00796B",
    textAlign: "right",
    marginVertical: 10,
  },
  signUpText: {
    fontSize: 16,
    color: "#00796B",
    textAlign: "center",
    marginTop: 20,
  },
});

export default Login;

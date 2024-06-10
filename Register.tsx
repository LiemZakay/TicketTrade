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
  ActivityIndicator,
} from "react-native";
import { CTAButton } from "../Components/CTAButton/CTAButton";

import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";

import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

export const Register = () => {
  const [name, setName] = useState<string | undefined>();
  const [email, setEmail] = useState<string | undefined>();
  const [password, setPassword] = useState<string | undefined>();
  const [phone, setPhone] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  const nav = useNavigation<NativeStackNavigationProp<any>>();

  const registerAndGoToMainFlow = async () => {
    if (email && password && name && phone) {
      setIsLoading(true);
      try {
        const response = await auth().createUserWithEmailAndPassword(
          email,
          password
        );
        if (response.user) {
          await firestore().collection('users').doc(response.user.uid).set({
            uid: response.user.uid,
            email: email,
            name: name,
            phone: phone,
          });
          setIsLoading(false);
          nav.replace("Login");
        }
      } catch (error: any) {
        setIsLoading(false);
        let errorMessage = "Registration failed";
        switch (error.code) {
          case "auth/email-already-in-use":
            errorMessage = "Email already in use";
            break;
          case "auth/invalid-email":
            errorMessage = "Invalid email address";
            break;
          case "auth/weak-password":
            errorMessage = "Password should be at least 6 characters";
            break;
          default:
            errorMessage = "Registration failed. Please try again later";
        }
        Alert.alert("Error", errorMessage);
      }
    } else {
      Alert.alert("Error", "Please provide valid name, email, password, and phone");
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
          {isLoading ? (
            <ActivityIndicator size="large" color="#0000ff" />
          ) : (
            <>
              <CTAButton
                title="Sign Up"
                onPress={registerAndGoToMainFlow}
                variant="primary"
              />
              <CTAButton title="Go Back" onPress={nav.goBack} variant="secondary" />
            </>
          )}
        </View>
      </SafeAreaView>
    </Pressable>
  );
};
const styles = StyleSheet.create({
  contentView: {
    flex: 1,
    backgroundColor: "white",
  },
  container: {
    flex: 1,
    marginHorizontal: 50,
    backgroundColor: "white",
    paddingTop: 20,
  },
  titleContainer: {
    flex: 1.2,
    justifyContent: "center",
  },
  titleText: {
    fontSize: 45,
    textAlign: "center",
    fontWeight: "200",
  },
  loginTextField: {
    borderBottomWidth: 1,
    height: 60,
    fontSize: 30,
    marginVertical: 10,
    fontWeight: "300",
  },
  mainContent: {
    flex: 6,
  },
});

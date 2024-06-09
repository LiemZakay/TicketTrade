import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import firestore from '@react-native-firebase/firestore';

type ProfileRouteParams = {
  user: {
    uid: string;
    email: string;
    name: string;
    phone: string;
  };
};

export const Profile = () => {
  const nav = useNavigation();
  const route = useRoute<RouteProp<{ params: ProfileRouteParams }, 'params'>>();
  const { user } = route.params;
  const [email, setEmail] = useState(user.email);
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone);

  const saveProfile = async () => {
    try {
      const userDoc = firestore().collection('users').doc(user.uid);
      await userDoc.update({
        email: email,
        name: name,
        phone: phone,
      });
      nav.goBack();
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  return (
    <SafeAreaView style={styles.contentView}>
      <View style={styles.container}>
        <Text style={styles.header}>Profile</Text>
        <TextInput
          style={styles.inputField}
          placeholder="Name"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.inputField}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          inputMode="email"
        />
        <TextInput
          style={styles.inputField}
          placeholder="Phone"
          value={phone}
          onChangeText={setPhone}
          inputMode="tel"
        />
        <TouchableOpacity onPress={saveProfile} style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
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
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#00796B",
    marginBottom: 20,
    textAlign: "center",
  },
  inputField: {
    borderBottomWidth: 1,
    height: 50,
    fontSize: 18,
    marginVertical: 10,
    borderBottomColor: "#00796B",
    color: "#00796B",
  },
  saveButton: {
    backgroundColor: "#00796B",
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    textAlign: "center",
  },
});

export default Profile;

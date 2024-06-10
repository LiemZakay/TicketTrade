import { NavigationProp, useNavigation } from "@react-navigation/native";
import React, { useState, useEffect } from "react";
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { Ionicons } from '@expo/vector-icons';

type RootStackParamList = {
  Profile: { user: any };
  BuyerScreen: undefined;
  SellerScreen: undefined;
  AdsScreen: undefined;
  AdsScreenSeller: undefined;
  picUpload: undefined;
};

type ProfileScreenNavigationProp = NavigationProp<RootStackParamList, 'Profile'>;

export const HomePage = () => {
  const [user, setUser] = useState<any>(null);
  const nav = useNavigation<ProfileScreenNavigationProp>();

  useEffect(() => {
    const currentUser = auth().currentUser;
    if (currentUser) {
      const userDoc = firestore().collection('users').doc(currentUser.uid);
      userDoc.get().then((doc) => {
        if (doc.exists) {
          setUser(doc.data());
        }
      });
    }
  }, []);

  const goToProfile = () => {
    if (user) {
      nav.navigate("Profile", { user });
    } else {
      console.error("User data is missing or undefined");
    }
  };

  const AlertBuyerorSeller = () => {
    Alert.alert(
      "Ticket Trade",
      "Choose Buyer or Seller",
      [
        {
          text: "Buyer",
          onPress: () => nav.navigate("BuyerScreen"),
          style: "cancel"
        },
        {
          text: "Seller",
          onPress: () => nav.navigate("SellerScreen"),
        }
      ],
      { cancelable: false }
    );
  }

  const goToAds = () => {
    nav.navigate("AdsScreen");
  }

  const goToAdsSeller = () => {
    nav.navigate("AdsScreenSeller");
  }

  const gotoImagePage = () => {
    nav.navigate("picUpload");
  }

  return (
    <SafeAreaView style={styles.contentView}>
      <View style={styles.container}>
        {user && (
          <>
            <Text style={styles.welcomeText}>Welcome, {user.name}</Text>
            <View style={styles.infoContainer}>
              <Ionicons name="mail-outline" size={24} color="#4A90E2" style={styles.infoIcon} />
              <Text style={styles.infoText}>{user.email}</Text>
            </View>
            <View style={styles.infoContainer}>
              <Ionicons name="call-outline" size={24} color="#4A90E2" style={styles.infoIcon} />
              <Text style={styles.infoText}>{user.phone}</Text>
            </View>
            <TouchableOpacity onPress={goToProfile} style={styles.button}>
              <Text style={styles.buttonText}>Go to Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={AlertBuyerorSeller} style={styles.addButton}>
              <Ionicons name="add-circle-outline" size={32} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity onPress={gotoImagePage} style={styles.button}>
              <Text style={styles.buttonText}>Image Upload</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={goToAds} style={styles.button}>
              <Text style={styles.buttonText}>View Ads Buyers</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={goToAdsSeller} style={styles.button}>
              <Text style={styles.buttonText}>View Ads Sellers</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  contentView: {
    flex: 1,
    backgroundColor: "#F0F8FF",
  },
  container: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 20,
    textAlign: 'center',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoIcon: {
    marginRight: 10,
  },
  infoText: {
    fontSize: 18,
    color: "#333333",
  },
  button: {
    backgroundColor: "#4A90E2",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginBottom: 10,
    width: '100%',
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: '#4A90E2',
    padding: 10,
    borderRadius: 50,
    marginBottom: 20,
  },
});

export default HomePage;
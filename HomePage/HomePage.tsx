import { NavigationProp, useNavigation } from "@react-navigation/native";
import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert
} from "react-native";
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

type RootStackParamList = {
  Profile: { user: any };
  BuyerScreen: undefined;
  SellerScreen: undefined;
  AdsScreen: undefined;
  AdsScreenSeller: undefined;
  
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

  return (
    <SafeAreaView style={styles.contentView}>
      <View style={styles.container}>
        {user && (
          <>
            <Text style={styles.welcomeText}>Welcome, {user.name}</Text>
            <Text style={styles.infoText}>Email: {user.email}</Text>
            <Text style={styles.infoText}>Phone: {user.phone}</Text>
            <TouchableOpacity onPress={goToProfile} style={styles.profileButton}>
              <Text style={styles.profileButtonText}>Go to Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={AlertBuyerorSeller} style={styles.profileButton}>
              <Text style={styles.profileButtonText}>+</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={goToAds} style={styles.profileButton}>
              <Text style={styles.profileButtonText}>View Ads Buyers</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={goToAdsSeller} style={styles.profileButton}>
              <Text style={styles.profileButtonText}>View Ads Sellers</Text>
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
    backgroundColor: "#E0F7FA",
  },
  container: {
    flex: 1,
    marginHorizontal: 50,
    backgroundColor: "#E0F7FA",
    paddingTop: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#00796B",
    marginBottom: 20,
  },
  infoText: {
    fontSize: 18,
    color: "#00796B",
    marginBottom: 20,
  },
  profileButton: {
    backgroundColor: "#00796B",
    padding: 10,
    borderRadius: 5,
  },
  profileButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
  },
});

export default HomePage;

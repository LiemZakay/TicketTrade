import { NavigationProp, useNavigation } from "@react-navigation/native";
import React, { useState, useEffect } from "react";
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { auth, firestore } from '../firebaseConfig';
import { collection, doc, getDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';

type RootStackParamList = {
  Profile: { user: any };
  BuyerScreen: undefined;
  SellerScreen: undefined;
  AdsScreen: undefined;
  AdsScreenSeller: undefined;
  picUpload: undefined;
  Login: undefined;
  PopularArtistsScreen: undefined;
};

type ProfileScreenNavigationProp = NavigationProp<RootStackParamList, 'Profile'>;

export const HomePageScreen = () => {
  const [user, setUser] = useState<any>(null);
  const nav = useNavigation<ProfileScreenNavigationProp>();

  useEffect(() => {
    const fetchUserData = async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const userDocRef = doc(collection(firestore, 'users'), currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          setUser(userDocSnap.data());
        }
      }
    };

    fetchUserData();
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

  const handleLogout = async () => {
    try {
      await signOut(auth);
      nav.navigate('Login');
    } catch (error) {
      console.error('Error signing out: ', error);
      Alert.alert('Logout Failed', 'An error occurred while logging out. Please try again.');
    }
  };

  const spotifyfunc= async()=>  {
    nav.navigate('PopularArtistsScreen');
  }

  return (
    <SafeAreaView style={styles.contentView}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Home</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color="#4A90E2" />
        </TouchableOpacity>
      </View>
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
            <TouchableOpacity onPress={goToAds} style={styles.button}>
              <Text style={styles.buttonText}>View Ads Buyers</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={goToAdsSeller} style={styles.button}>
              <Text style={styles.buttonText}>View Ads Sellers</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={spotifyfunc} style={styles.button}>
              <Text style={styles.buttonText}>Spotify</Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
  },
  logoutButton: {
    padding: 5,
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

export default HomePageScreen;
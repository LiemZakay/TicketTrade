import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
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
  const [buyerAds, setBuyerAds] = useState<any[]>([]);
  const [sellerAds, setSellerAds] = useState<any[]>([]);

  useEffect(() => {
    const fetchAds = async () => {
      const buyerAdsSnapshot = await firestore().collection('buyerAds').where('userId', '==', user.uid).get();
      const sellerAdsSnapshot = await firestore().collection('sellerAds').where('userId', '==', user.uid).get();
      setBuyerAds(buyerAdsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setSellerAds(sellerAdsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };

    fetchAds();
  }, [user.uid]);

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

  const renderAd = ({ item }: { item: any }) => (
    <View style={styles.adContainer}>
      <Text style={styles.adText}>Concert: {item.concertName}</Text>
      <Text style={styles.adText}>Ticket Type: {item.ticketType}</Text>
      <Text style={styles.adText}>Number of Tickets: {item.numTickets}</Text>
      <Text style={styles.adText}>Price Range: ${item.priceRange[0]} - ${item.priceRange[1]}</Text>
      <Text style={styles.adText}>Location: {item.location}</Text>
      <Text style={styles.adText}>Phone Number: {item.phoneNumber}</Text>
    </View>
  );

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
        <Text style={styles.sectionHeader}>Buyer Ads</Text>
        <FlatList
          data={buyerAds}
          renderItem={renderAd}
          keyExtractor={item => item.id}
        />
        <Text style={styles.sectionHeader}>Seller Ads</Text>
        <FlatList
          data={sellerAds}
          renderItem={renderAd}
          keyExtractor={item => item.id}
        />
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
  sectionHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00796B',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  adContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 16,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#CCCCCC',
  },
  adText: {
    fontSize: 16,
    color: '#333333',
    marginBottom: 8,
  },
});

export default Profile;

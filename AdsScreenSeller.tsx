import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';

type RootStackParamList = {
  Profile: { user: any };
  AdsScreenSeller: undefined;
};

type AdsScreenSellerNavigationProp = NavigationProp<RootStackParamList, 'AdsScreenSeller'>;

export const AdsScreenSeller = () => {
  const [ads, setAds] = useState<any[]>([]);
  const nav = useNavigation<AdsScreenSellerNavigationProp>();

  useEffect(() => {
    const fetchAds = async () => {
      const snapshot = await firestore().collection('sellerAds').get();
      const adsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAds(adsList);
    };

    fetchAds();
  }, []);

  const goToProfile = (userId: string) => {
    firestore().collection('users').doc(userId).get().then((doc) => {
      if (doc.exists) {
        nav.navigate("Profile", { user: doc.data() });
      }
    });
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.adContainer}>
      <TouchableOpacity onPress={() => goToProfile(item.userId)}>
        <Text style={styles.adText}>Posted by: {item.userName}</Text>
      </TouchableOpacity>
      <Text style={styles.adText}>Concert: {item.concertName}</Text>
      <Text style={styles.adText}>Ticket Type: {item.ticketType}</Text>
      <Text style={styles.adText}>Number of Tickets: {item.numTickets}</Text>
      <Text style={styles.adText}>Price Range: {item.priceRange}</Text>
      <Text style={styles.adText}>Date: {item.date}</Text>
      <Text style={styles.adText}>Location: {item.location}</Text>
      <Text style={styles.adText}>Phone Number: {item.phoneNumber}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={ads}
        renderItem={renderItem}
        keyExtractor={item => item.id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 16,
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

export default AdsScreenSeller;

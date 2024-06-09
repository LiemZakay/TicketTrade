import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';

type RootStackParamList = {
  Profile: { user: any };
  AdsScreen: undefined;
};

type AdsScreenNavigationProp = NavigationProp<RootStackParamList, 'AdsScreen'>;

export const AdsScreen = () => {
  const [ads, setAds] = useState<any[]>([]);
  const [filteredAds, setFilteredAds] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const nav = useNavigation<AdsScreenNavigationProp>();

  useEffect(() => {
    const fetchAds = async () => {
      const snapshot = await firestore().collection('buyerAds').get();
      const adsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAds(adsList);
      setFilteredAds(adsList);
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

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const filtered = ads.filter(ad => {
      const concertName = ad.concertName ? ad.concertName.toLowerCase() : ''; // Check if concertName is defined
      const userName = ad.userName ? ad.userName.toLowerCase() : ''; // Check if userName is defined
      const priceRange = ad.priceRange ? ad.priceRange.toString().toLowerCase() : ''; // Check if priceRange is defined
      return concertName.includes(query.toLowerCase()) || userName.includes(query.toLowerCase()) || priceRange.includes(query.toLowerCase());
    });
    setFilteredAds(filtered);
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
      <Text style={styles.adText}>Location: {item.location}</Text>
      <Text style={styles.adText}>Phone Number: {item.phoneNumber}</Text>
    </View>
  );

  const goBack = () => {
    nav.goBack();
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search by concert, profile, or price..."
        value={searchQuery}
        onChangeText={handleSearch}
      />
      <FlatList
        data={filteredAds}
        renderItem={renderItem}
        keyExtractor={item => item.id}
      />
      <TouchableOpacity onPress={goBack} style={styles.goBackButton}>
        <Text style={styles.goBackButtonText}>Go Back</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 16,
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 4,
    padding: 8,
    marginBottom: 16,
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
  goBackButton: {
    backgroundColor: "#00796B",
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
    alignSelf: "center",
  },
  goBackButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
  },
});

export default AdsScreen;

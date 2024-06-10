import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { Ionicons } from '@expo/vector-icons';

type RootStackParamList = {
  Profile: { user: any };
  AdsScreen: undefined;
};

type AdsScreenNavigationProp = NavigationProp<RootStackParamList, 'AdsScreen'>;

export const AdsScreen = () => {
  const [ads, setAds] = useState<any[]>([]);
  const [filteredAds, setFilteredAds] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredAds, setFilteredAds] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const nav = useNavigation<AdsScreenNavigationProp>();
  const currentUser = auth().currentUser;
  const currentUser = auth().currentUser;

  useEffect(() => {
    const fetchAds = async () => {
      const snapshot = await firestore().collection('buyerAds').get();
      const adsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAds(adsList);
      setFilteredAds(adsList);
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
      const concertName = ad.concertName?.toLowerCase() || '';
      const userName = ad.userName?.toLowerCase() || '';
      const priceRange = ad.priceRange?.toString().toLowerCase() || '';
      return concertName.includes(query.toLowerCase()) || userName.includes(query.toLowerCase()) || priceRange.includes(query.toLowerCase());
    });
    setFilteredAds(filtered);
  };

  const deleteAd = (adId: string) => {
    Alert.alert(
      "Delete Ad",
      "Are you sure you want to delete this ad? This action can't be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            try {
              await firestore().collection('buyerAds').doc(adId).delete();
              setAds(ads.filter(ad => ad.id !== adId));
              setFilteredAds(filteredAds.filter(ad => ad.id !== adId));
              Alert.alert("Success", "Your ad has been deleted.");
            } catch (error) {
              console.error("Error deleting ad:", error);
              Alert.alert("Error", "Failed to delete ad. Please try again.");
            }
          }
        }
      ]
    );
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const filtered = ads.filter(ad => {
      const concertName = ad.concertName?.toLowerCase() || '';
      const userName = ad.userName?.toLowerCase() || '';
      const priceRange = ad.priceRange?.toString().toLowerCase() || '';
      return concertName.includes(query.toLowerCase()) || userName.includes(query.toLowerCase()) || priceRange.includes(query.toLowerCase());
    });
    setFilteredAds(filtered);
  };

  const deleteAd = (adId: string) => {
    Alert.alert(
      "Delete Ad",
      "Are you sure you want to delete this ad? This action can't be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            try {
              await firestore().collection('buyerAds').doc(adId).delete();
              setAds(ads.filter(ad => ad.id !== adId));
              setFilteredAds(filteredAds.filter(ad => ad.id !== adId));
              Alert.alert("Success", "Your ad has been deleted.");
            } catch (error) {
              console.error("Error deleting ad:", error);
              Alert.alert("Error", "Failed to delete ad. Please try again.");
            }
          }
        }
      ]
    );
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.adContainer}>
      <TouchableOpacity style={styles.adContent} onPress={() => goToProfile(item.userId)}>
        <View style={styles.adHeader}>
          <Text style={styles.concertName}>{item.concertName}</Text>
          <Text style={styles.userName}>by {item.userName}</Text>
        </View>
        <View style={styles.adDetails}>
          <View style={styles.detailItem}>
            <Ionicons name="ticket-outline" size={20} color="#4A90E2" />
            <Text style={styles.detailText}>{item.ticketType} × {item.numTickets}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="cash-outline" size={20} color="#4A90E2" />
            <Text style={styles.detailText}>{item.priceRange}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="location-outline" size={20} color="#4A90E2" />
            <Text style={styles.detailText}>{item.location}</Text>
          </View>
        </View>
      <TouchableOpacity style={styles.adContent} onPress={() => goToProfile(item.userId)}>
        <View style={styles.adHeader}>
          <Text style={styles.concertName}>{item.concertName}</Text>
          <Text style={styles.userName}>by {item.userName}</Text>
        </View>
        <View style={styles.adDetails}>
          <View style={styles.detailItem}>
            <Ionicons name="ticket-outline" size={20} color="#4A90E2" />
            <Text style={styles.detailText}>{item.ticketType} × {item.numTickets}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="cash-outline" size={20} color="#4A90E2" />
            <Text style={styles.detailText}>{item.priceRange}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="location-outline" size={20} color="#4A90E2" />
            <Text style={styles.detailText}>{item.location}</Text>
          </View>
        </View>
      </TouchableOpacity>
      {currentUser && item.userId === currentUser.uid && (
        <TouchableOpacity style={styles.deleteButton} onPress={() => deleteAd(item.id)}>
          <Ionicons name="trash-outline" size={24} color="#FF6B6B" />
        </TouchableOpacity>
      )}
      {currentUser && item.userId === currentUser.uid && (
        <TouchableOpacity style={styles.deleteButton} onPress={() => deleteAd(item.id)}>
          <Ionicons name="trash-outline" size={24} color="#FF6B6B" />
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => nav.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Find Tickets</Text>
      </View>
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={24} color="#4A90E2" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search concerts, profiles, or prices..."
          value={searchQuery}
          onChangeText={handleSearch}
          placeholderTextColor="#A0A0A0"
        />
      </View>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => nav.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Find Tickets</Text>
      </View>
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={24} color="#4A90E2" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search concerts, profiles, or prices..."
          value={searchQuery}
          onChangeText={handleSearch}
          placeholderTextColor="#A0A0A0"
        />
      </View>
      <FlatList
        data={filteredAds}
        data={filteredAds}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F8FF', 
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4A90E2', 
    paddingTop: 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    paddingHorizontal: 15,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#333333',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  adContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 5,
    borderLeftColor: '#4A90E2',
    overflow: 'hidden', // This ensures the delete button doesn't break the border radius
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 5,
    borderLeftColor: '#4A90E2',
    overflow: 'hidden', // This ensures the delete button doesn't break the border radius
  },
  adContent: {
    padding: 20,
  },
  adHeader: {
    marginBottom: 15,
  },
  concertName: {
    fontSize: 22,
    fontWeight: 'bold',
  adContent: {
    padding: 20,
  },
  adHeader: {
    marginBottom: 15,
  },
  concertName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 5,
  },
  userName: {
    fontSize: 16,
    color: '#4A90E2',
  },
  adDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    marginLeft: 5,
    fontSize: 16,
    color: '#555555',
  },
  deleteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 10,
    marginBottom: 5,
  },
  userName: {
    fontSize: 16,
    color: '#4A90E2',
  },
  adDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    marginLeft: 5,
    fontSize: 16,
    color: '#555555',
  },
  deleteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 10,
  },
});

export default AdsScreen;
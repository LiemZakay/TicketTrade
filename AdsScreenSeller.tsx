import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, Image } from 'react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { auth, firestore } from './firebaseConfig';
import { collection, getDocs, doc, getDoc, deleteDoc, query } from 'firebase/firestore';

type RootStackParamList = {
  Profile: { user: any };
  AdsScreenSeller: undefined;
};

type AdsScreenSellerNavigationProp = NavigationProp<RootStackParamList, 'AdsScreenSeller'>;

export const AdsScreenSeller = () => {
  const [ads, setAds] = useState<any[]>([]);
  const nav = useNavigation<AdsScreenSellerNavigationProp>();
  const currentUser = auth.currentUser;

  useEffect(() => {
    const fetchAds = async () => {
      const adsCollection = collection(firestore, 'sellerAds');
      const adsSnapshot = await getDocs(query(adsCollection));
      const adsList = adsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAds(adsList);
    };

    fetchAds();
  }, []);

  const goToProfile = async (userId: string) => {
    const userDocRef = doc(collection(firestore, 'users'), userId);
    const userDocSnap = await getDoc(userDocRef);
    if (userDocSnap.exists()) {
      nav.navigate("Profile", { user: userDocSnap.data() });
    }
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
              const adDocRef = doc(collection(firestore, 'sellerAds'), adId);
              await deleteDoc(adDocRef);
              setAds(ads.filter(ad => ad.id !== adId));
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
        {item.imageUrl && (
          <Image source={{ uri: item.imageUrl }} style={styles.adImage} />
        )}
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
            <Ionicons name="calendar-outline" size={20} color="#4A90E2" />
            <Text style={styles.detailText}>{item.Date}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="location-outline" size={20} color="#4A90E2" />
            <Text style={styles.detailText}>{item.location}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="call-outline" size={20} color="#4A90E2" />
            <Text style={styles.detailText}>{item.phoneNumber}</Text>
          </View>
        </View>
      </TouchableOpacity>
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
        <Text style={styles.headerTitle}>Seller Ads</Text>
      </View>
      <FlatList
        data={ads}
        renderItem={renderItem}
        keyExtractor={item => item.id}
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
    overflow: 'hidden',
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
    color: '#333333',
    marginBottom: 5,
  },
  userName: {
    fontSize: 16,
    color: '#4A90E2',
  },
  adDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
    marginBottom: 10,
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
  adImage: {
    width: '100%',
    height: 200,
    marginBottom: 15,
    borderRadius: 10,
  },
});

export default AdsScreenSeller;
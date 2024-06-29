import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, TextInput, Alert, Modal } from 'react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { auth, firestore } from '../firebaseConfig';
import { collection, getDocs, doc, getDoc, deleteDoc, query, updateDoc } from 'firebase/firestore';

type RootStackParamList = {
  Profile: { user: any };
  AdsScreen: undefined;
};

type AdsScreenNavigationProp = NavigationProp<RootStackParamList, 'AdsScreen'>;

export const AdsScreen = () => {
  const [ads, setAds] = useState<any[]>([]);
  const [filteredAds, setFilteredAds] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingAd, setEditingAd] = useState<any>(null);
  const nav = useNavigation<AdsScreenNavigationProp>();
  const currentUser = auth.currentUser;

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    const adsCollection = collection(firestore, 'buyerAds');
    const adsSnapshot = await getDocs(query(adsCollection));
    const adsList = adsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setAds(adsList);
    setFilteredAds(adsList);
  };

  const goToProfile = async (userId: string) => {
    const userDocRef = doc(collection(firestore, 'users'), userId);
    const userDocSnap = await getDoc(userDocRef);
    if (userDocSnap.exists()) {
      nav.navigate("Profile", { user: userDocSnap.data() });
    }
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
              const adDocRef = doc(collection(firestore, 'buyerAds'), adId);
              await deleteDoc(adDocRef);
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

  const editAd = (ad: any) => {
    setEditingAd(ad);
    setEditModalVisible(true);
  };

  const updateAd = async () => {
    if (!editingAd) return;

    try {
      const adDocRef = doc(collection(firestore, 'buyerAds'), editingAd.id);
      await updateDoc(adDocRef, editingAd);
      setEditModalVisible(false);
      fetchAds(); // Refresh the ads list
      Alert.alert("Success", "Your ad has been updated.");
    } catch (error) {
      console.error("Error updating ad:", error);
      Alert.alert("Error", "Failed to update ad. Please try again.");
    }
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
      </TouchableOpacity>
      {currentUser && item.userId === currentUser.uid && (
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.editButton} onPress={() => editAd(item)}>
            <Ionicons name="create-outline" size={24} color="#4A90E2" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteButton} onPress={() => deleteAd(item.id)}>
            <Ionicons name="trash-outline" size={24} color="#FF6B6B" />
          </TouchableOpacity>
        </View>
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
      <FlatList
        data={filteredAds}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Edit Ad</Text>
            <TextInput
              style={styles.input}
              value={editingAd?.concertName}
              onChangeText={(text) => setEditingAd({...editingAd, concertName: text})}
              placeholder="Concert Name"
            />
            <TextInput
              style={styles.input}
              value={editingAd?.ticketType}
              onChangeText={(text) => setEditingAd({...editingAd, ticketType: text})}
              placeholder="Ticket Type"
            />
            <TextInput
              style={styles.input}
              value={editingAd?.numTickets?.toString()}
              onChangeText={(text) => setEditingAd({...editingAd, numTickets: parseInt(text) || 0})}
              placeholder="Number of Tickets"
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              value={editingAd?.priceRange}
              onChangeText={(text) => setEditingAd({...editingAd, priceRange: text})}
              placeholder="Price Range"
            />
            <TextInput
              style={styles.input}
              value={editingAd?.location}
              onChangeText={(text) => setEditingAd({...editingAd, location: text})}
              placeholder="Location"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.button, styles.buttonClose]} onPress={() => setEditModalVisible(false)}>
                <Text style={styles.textStyle}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.buttonSubmit]} onPress={updateAd}>
                <Text style={styles.textStyle}>Update</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3A86FF',
    paddingTop: 50,
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
    shadowColor: '#000',
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 5,
    borderLeftColor: '#3A86FF',
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
    color: '#3A86FF',
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
  actionButtons: {
    flexDirection: 'row',
    position: 'absolute',
    top: 10,
    right: 10,
  },
  editButton: {
    padding: 10,
    marginRight: 10,
  },
  deleteButton: {
    padding: 10,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333333',
  },
  input: {
    height: 50,
    width: '100%',
    borderColor: '#E0E0E0',
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 15,
    borderRadius: 10,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
  button: {
    borderRadius: 10,
    padding: 12,
    elevation: 2,
    width: '45%',
  },
  buttonClose: {
    backgroundColor: '#FF6B6B',
  },
  buttonSubmit: {
    backgroundColor: '#3A86FF',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
});

export default AdsScreen;
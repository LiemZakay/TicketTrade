import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, TextInput, Alert, Modal, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { auth, firestore } from '../firebaseConfig';
import { collection, getDocs, doc, getDoc, deleteDoc, query, updateDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

type RootStackParamList = {
  Profile: { user: any };
  AdsScreen: undefined;
};

type AdsScreenNavigationProp = NavigationProp<RootStackParamList, 'AdsScreen'>;

interface Ad {
  id: string;
  concertName: string;
  userName: string;
  ticketType: string;
  numTickets: number;
  priceRange: string;
  location: string;
  phoneNumber: string;
  userId: string;
}

interface Errors {
  [key: string]: string;
}

export const AdsScreen: React.FC = () => {
  const [ads, setAds] = useState<Ad[]>([]);
  const [filteredAds, setFilteredAds] = useState<Ad[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [editModalVisible, setEditModalVisible] = useState<boolean>(false);
  const [editingAd, setEditingAd] = useState<Ad | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const nav = useNavigation<AdsScreenNavigationProp>();
  const currentUser = auth.currentUser;

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    console.log('Fetching ads...');
    setIsLoading(true);
    try {
      const cachedAds = await AsyncStorage.getItem('buyerAds');
      if (cachedAds) {
        console.log('Found cached ads in AsyncStorage');
        const parsedAds: Ad[] = JSON.parse(cachedAds);
        setAds(parsedAds);
        setFilteredAds(parsedAds);
        setIsLoading(false);
      }

      const adsCollection = collection(firestore, 'buyerAds');
      const adsSnapshot = await getDocs(query(adsCollection));
      const adsList: Ad[] = adsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Ad));
      
      console.log(`Fetched ${adsList.length} ads from Firestore`);
      setAds(adsList);
      setFilteredAds(adsList);
      
      await AsyncStorage.setItem('buyerAds', JSON.stringify(adsList));
      console.log('Cached fresh ads data in AsyncStorage');
    } catch (error) {
      console.error('Error fetching ads:', error);
      Alert.alert('Error', 'Failed to fetch ads. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const goToProfile = async (userId: string) => {
    console.log(`Navigating to profile of user: ${userId}`);
    const userDocRef = doc(collection(firestore, 'users'), userId);
    const userDocSnap = await getDoc(userDocRef);
    if (userDocSnap.exists()) {
      nav.navigate("Profile", { user: userDocSnap.data() });
    } else {
      console.log(`User profile not found for ID: ${userId}`);
    }
  };

  const handleSearch = (query: string) => {
    console.log(`Searching for: "${query}"`);
    setSearchQuery(query);
    const filtered = ads.filter(ad => {
      const concertName = ad.concertName?.toLowerCase() || '';
      const userName = ad.userName?.toLowerCase() || '';
      const priceRange = ad.priceRange?.toString().toLowerCase() || '';
      return concertName.includes(query.toLowerCase()) || userName.includes(query.toLowerCase()) || priceRange.includes(query.toLowerCase());
    });
    console.log(`Found ${filtered.length} matching ads`);
    setFilteredAds(filtered);
  };

  const deleteAd = (adId: string) => {
    console.log(`Attempting to delete ad: ${adId}`);
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
              console.log(`Ad ${adId} deleted from Firestore`);
              
              const updatedAds = ads.filter(ad => ad.id !== adId);
              setAds(updatedAds);
              setFilteredAds(updatedAds);
              
              await AsyncStorage.setItem('buyerAds', JSON.stringify(updatedAds));
              console.log('Updated AsyncStorage after ad deletion');
              
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

  const editAd = (ad: Ad) => {
    console.log(`Editing ad: ${ad.id}`);
    setEditingAd(ad);
    setEditModalVisible(true);
    setErrors({});
  };

  const validateFields = (): boolean => {
    console.log('Validating ad fields...');
    const newErrors: Errors = {};
  
    if (!editingAd?.concertName) newErrors.concertName = "Concert name is required";
    if (!editingAd?.ticketType) newErrors.ticketType = "Ticket type is required";
    if (!editingAd?.numTickets || editingAd.numTickets <= 0) newErrors.numTickets = "Number of tickets must be greater than 0";
    if (!editingAd?.priceRange) newErrors.priceRange = "Price range is required";
    if (!editingAd?.location) newErrors.location = "Location is required";
  
    const phoneRegex = /^\+?[1-9]\d{9}$/;
    if (!editingAd?.phoneNumber) {
      newErrors.phoneNumber = "Phone number is required";
    } else if (!phoneRegex.test(editingAd.phoneNumber)) {
      newErrors.phoneNumber = "Please enter a valid phone number (10 digits)";
    }
  
    setErrors(newErrors);
    console.log(`Validation complete. Errors found: ${Object.keys(newErrors).length}`);
    return Object.keys(newErrors).length === 0;
  };

  const updateAd = async () => {
    if (!editingAd) return;
  
    console.log(`Attempting to update ad: ${editingAd.id}`);
    if (!validateFields()) {
      console.log('Validation failed. Update cancelled.');
      return;
    }
  
    try {
      const adDocRef = doc(collection(firestore, 'buyerAds'), editingAd.id);
      
      // Create a new object with only the fields you want to update
      const updateData = {
        concertName: editingAd.concertName,
        ticketType: editingAd.ticketType,
        numTickets: editingAd.numTickets,
        priceRange: editingAd.priceRange,
        location: editingAd.location,
        phoneNumber: editingAd.phoneNumber,
      };

      await updateDoc(adDocRef, updateData);
      console.log(`Ad ${editingAd.id} updated in Firestore`);
      
      setEditModalVisible(false);
      
      const updatedAds = ads.map(ad => ad.id === editingAd.id ? {...ad, ...updateData} : ad);
      setAds(updatedAds);
      setFilteredAds(updatedAds);
      await AsyncStorage.setItem('buyerAds', JSON.stringify(updatedAds));
      console.log('Updated AsyncStorage after ad update');
      
      Alert.alert("Success", "Your ad has been updated.");
    } catch (error) {
      console.error("Error updating ad:", error);
      Alert.alert("Error", "Failed to update ad. Please try again.");
    }
  };

  const renderItem = ({ item }: { item: Ad }) => (
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
      {isLoading ? (
        <ActivityIndicator size="large" color="#3A86FF" style={styles.loader} />
      ) : (
        <FlatList
          data={filteredAds}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      )}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.centeredView}
        >
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Edit Ad</Text>
            <TextInput
              style={[styles.input, errors.concertName ? styles.inputError : null]}
              value={editingAd?.concertName}
              onChangeText={(text) => setEditingAd(editingAd ? {...editingAd, concertName: text} : null)}
              placeholder="Concert Name"
            />
            {errors.concertName && <Text style={styles.errorText}>{errors.concertName}</Text>}
            <TextInput
              style={[styles.input, errors.ticketType ? styles.inputError : null]}
              value={editingAd?.ticketType}
              onChangeText={(text) => setEditingAd(editingAd ? {...editingAd, ticketType: text} : null)}
              placeholder="Ticket Type"
            />
            {errors.ticketType && <Text style={styles.errorText}>{errors.ticketType}</Text>}
            <TextInput
              style={[styles.input, errors.numTickets ? styles.inputError : null]}
              value={editingAd?.numTickets?.toString()}
              onChangeText={(text) => setEditingAd(editingAd ? {...editingAd, numTickets: parseInt(text) || 0} : null)}
              placeholder="Number of Tickets"
              keyboardType="numeric"
            />
            {errors.numTickets && <Text style={styles.errorText}>{errors.numTickets}</Text>}
            <TextInput
              style={[styles.input, errors.priceRange ? styles.inputError : null]}
              value={editingAd?.priceRange}
              onChangeText={(text) => setEditingAd(editingAd ? {...editingAd, priceRange: text} : null)}
              placeholder="Price Range"
            />
            {errors.priceRange && <Text style={styles.errorText}>{errors.priceRange}</Text>}
            <TextInput
              style={[styles.input, errors.location ? styles.inputError : null]}
              value={editingAd?.location}
              onChangeText={(text) => setEditingAd(editingAd ? {...editingAd, location: text} : null)}
              placeholder="Location"
            />
            {errors.location && <Text style={styles.errorText}>{errors.location}</Text>}
            <TextInput
              style={[styles.input, errors.phoneNumber ? styles.inputError : null]}
              value={editingAd?.phoneNumber}
              onChangeText={(text) => setEditingAd(editingAd ? {...editingAd, phoneNumber: text} : null)}
              placeholder="Phone Number"
              keyboardType="phone-pad"
            />
            {errors.phoneNumber && <Text style={styles.errorText}>{errors.phoneNumber}</Text>}
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.button, styles.buttonClose]} onPress={() => setEditModalVisible(false)}>
                <Text style={styles.textStyle}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.buttonSubmit]} onPress={updateAd}>
                <Text style={styles.textStyle}>Update</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
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
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    width: '90%',
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
    fontSize: 24,
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
    backgroundColor: '#F8F9FA',
  },
  inputError: {
    borderColor: '#FF6B6B',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 14,
    marginBottom: 10,
    alignSelf: 'flex-start',
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
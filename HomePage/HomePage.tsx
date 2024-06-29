import { NavigationProp, useNavigation } from "@react-navigation/native";
import React, { useState, useEffect } from "react";
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity, Switch, StatusBar, FlatList, Image, TextInput, Alert, Modal } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { auth, firestore } from '../firebaseConfig';
import { collection, doc, getDoc, getDocs, query, deleteDoc, updateDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import FontAwesome from 'react-native-vector-icons/FontAwesome'

//screen navigation info
type RootStackParamList = {
  Profile: { user: any };
  BuyerScreen: undefined;
  SellerScreen: undefined;
  Login: undefined;
  PopularArtistsScreen: undefined;
};

type ProfileScreenNavigationProp = NavigationProp<RootStackParamList, 'Profile'>;

export const HomePageScreen = () => {
  const [user, setUser] = useState<any>(null);
  const [isSellerMode, setIsSellerMode] = useState(false);
  const [ads, setAds] = useState<any[]>([]);
  const [filteredAds, setFilteredAds] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingAd, setEditingAd] = useState<any>(null);
  const nav = useNavigation<ProfileScreenNavigationProp>();

  useEffect(() => {
    fetchUserData();
    fetchAds();
  }, [isSellerMode]);

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
//there is one screen for users and one screen for seller 
  const fetchAds = async () => {
    const adsCollection = collection(firestore, isSellerMode ? 'sellerAds' : 'buyerAds');
    const adsSnapshot = await getDocs(query(adsCollection));
    const adsList = adsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setAds(adsList);
    setFilteredAds(adsList);
  };
//navigate to profile, with the current user
  const goToProfile = async (userId: string) => {
    const userDocRef = doc(collection(firestore, 'users'), userId);
    const userDocSnap = await getDoc(userDocRef);
    if (userDocSnap.exists()) {
      nav.navigate("Profile", { user: userDocSnap.data() });
    }
  };
  //logout feature 
  const handleLogout = async () => {
    try {
      await signOut(auth);
      nav.navigate('Login');
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  };
//navigate to the Ad posts screens 
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
              const adDocRef = doc(collection(firestore, isSellerMode ? 'sellerAds' : 'buyerAds'), adId);
              await deleteDoc(adDocRef);
              fetchAds(); // Refresh the ads list
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
      const adDocRef = doc(collection(firestore, isSellerMode ? 'sellerAds' : 'buyerAds'), editingAd.id);
      await updateDoc(adDocRef, editingAd);
      setEditModalVisible(false);
      fetchAds(); // Refresh the ads list
      Alert.alert("Success", "Your ad has been updated.");
    } catch (error) {
      console.error("Error updating ad:", error);
      Alert.alert("Error", "Failed to update ad. Please try again.");
    }
  };

  const isDatePassed = (date: string) => {
    const concertDate = new Date(date);
    const currentDate = new Date();
    return concertDate < currentDate;
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.adContainer}>
      {isDatePassed(item.date) && (
        <View style={styles.datePassedBadge}>
          <Text style={styles.datePassedText}>Past Event</Text>
        </View>
      )}
      {item.imageUrl && (
        <Image source={{ uri: item.imageUrl }} style={styles.adImage} />
      )}
      <View style={styles.adContent}>
        <TouchableOpacity onPress={() => goToProfile(item.userId)}>
          <Text style={styles.userName}>by {item.userName}</Text>
        </TouchableOpacity>
        <Text style={styles.concertName}>{item.concertName}</Text>
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
            <Text style={styles.detailText}>{item.date}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="location-outline" size={20} color="#4A90E2" />
            <Text style={styles.detailText}>{item.location}</Text>
          </View>
        </View>
      </View>
      {auth.currentUser && item.userId === auth.currentUser.uid && (
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

  const gotospotify=()=> {
    nav.navigate('PopularArtistsScreen');
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.headerText}>Home</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity onPress={() => goToProfile(auth.currentUser?.uid || '')} style={styles.iconButton}>
            <Ionicons name="person-circle-outline" size={32} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout} style={styles.iconButton}>
            <Ionicons name="log-out-outline" size={32} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity onPress={gotospotify} style={styles.iconButton}>
            <FontAwesome name="spotify" size={32} color="#FFFFFF" />
          </TouchableOpacity>

        </View>
      </View>
      <View style={styles.content}>
        {user && (
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeText}>Welcome, {user.name}</Text>
            <View style={styles.switchContainer}>
              <Text style={styles.switchText}>Buyer</Text>
              <Switch
                trackColor={{ false: "#81b0ff", true: "#81b0ff" }}
                thumbColor={isSellerMode ? "#f5dd4b" : "#f4f3f4"}
                ios_backgroundColor="#3e3e3e"
                onValueChange={() => setIsSellerMode(previousState => !previousState)}
                value={isSellerMode}
              />
              <Text style={styles.switchText}>Seller</Text>
            </View>
          </View>
        )}
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
      </View>
      <TouchableOpacity onPress={AlertBuyerorSeller} style={styles.addButton}>
        <Ionicons name="add-circle-outline" size={32} color="#FFFFFF" />
      </TouchableOpacity>
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
              value={editingAd?.date}
              onChangeText={(text) => setEditingAd({...editingAd, date: text})}
              placeholder="Date (YYYY-MM-DD)"
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
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F8FF",
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 5,
    backgroundColor: '#4A90E2',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerIcons: {
    flexDirection: 'row',
  },
  iconButton: {
    padding: 5,
    marginLeft: 10,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  welcomeContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 10,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  switchText: {
    marginHorizontal: 10,
    fontSize: 16,
    color: '#333333',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    paddingHorizontal: 15,
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
    overflow: 'hidden',
  },
  adImage: {
    width: '100%',
    height: 200,
  },
  adContent: {
    padding: 15,
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
    marginBottom: 10,
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
    fontSize: 14,
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
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#4A90E2',
    borderRadius: 30,
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
    backgroundColor: '#4A90E2',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
  datePassedBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(255, 0, 0, 0.7)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    zIndex: 1,
  },
  datePassedText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

export default HomePageScreen;
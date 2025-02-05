import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, Image, Modal, TextInput, ActivityIndicator } from 'react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { auth, firestore, storage } from '../firebaseConfig';
import { collection, getDocs, doc, getDoc, deleteDoc, query, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';

type RootStackParamList = {
  Profile: { user: any };
  AdsScreenSeller: undefined;
};

type AdsScreenSellerNavigationProp = NavigationProp<RootStackParamList, 'AdsScreenSeller'>;

export const AdsScreenSeller = () => {
  const [completedAds, setCompletedAds] = useState<Set<string>>(new Set());
  const [ads, setAds] = useState<any[]>([]);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingAd, setEditingAd] = useState<any>(null);
  const [newImage, setNewImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const nav = useNavigation<AdsScreenSellerNavigationProp>();
  const currentUser = auth.currentUser;

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    setIsLoading(true);
    console.log('Fetching ads...');
    try {
      const storedAds = await AsyncStorage.getItem('sellerAds');
      if (storedAds) {
        console.log('Ads found in AsyncStorage');
        setAds(JSON.parse(storedAds));
      } else {
        console.log('Fetching ads from Firestore');
        const adsCollection = collection(firestore, 'sellerAds');
        const adsSnapshot = await getDocs(query(adsCollection));
        const adsList = adsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAds(adsList);
        await AsyncStorage.setItem('sellerAds', JSON.stringify(adsList));
      }
    } catch (error) {
      console.error('Error fetching ads:', error);
      Alert.alert('Error', 'Failed to fetch ads. Please try again.');
    }
    setIsLoading(false);
  };

  const goToProfile = async (userId: string) => {
    setIsLoading(true);
    console.log('Navigating to profile:', userId);
    try {
      const userDocRef = doc(collection(firestore, 'users'), userId);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        nav.navigate("Profile", { user: userDocSnap.data() });
      }
    } catch (error) {
      console.error('Error navigating to profile:', error);
    }
    setIsLoading(false);
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
            setIsLoading(true);
            console.log('Deleting ad:', adId);
            try {
              const adDocRef = doc(collection(firestore, 'sellerAds'), adId);
              await deleteDoc(adDocRef);
              const updatedAds = ads.filter(ad => ad.id !== adId);
              setAds(updatedAds);
              await AsyncStorage.setItem('sellerAds', JSON.stringify(updatedAds));
              Alert.alert("Success", "Your ad has been deleted.");
            } catch (error) {
              console.error("Error deleting ad:", error);
              Alert.alert("Error", "Failed to delete ad. Please try again.");
            }
            setIsLoading(false);
          }
        }
      ]
    );
  };

  const editAd = (ad: any) => {
    console.log('Editing ad:', ad.id);
    setEditingAd(ad);
    setNewImage(ad.imageUrl);
    setEditModalVisible(true);
  };

  const pickImage = async () => {
    console.log('Picking image...');
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      console.log('Image picked:', result.assets[0].uri);
      setNewImage(result.assets[0].uri);
    }
  };

  const saveImageLocally = async (uri: string) => {
    const filename = uri.split('/').pop();
    const newPath = `${FileSystem.documentDirectory}${filename}`;
    try {
      await FileSystem.copyAsync({
        from: uri,
        to: newPath
      });
      console.log('Image saved locally:', newPath);
      return newPath;
    } catch (error) {
      console.error('Error saving image locally:', error);
      return uri;
    }
  };

  const uploadImage = async (uri: string) => {
    console.log('Uploading image:', uri);
    const response = await fetch(uri);
    const blob = await response.blob();
    const filename = uri.substring(uri.lastIndexOf('/') + 1);
    const storageRef = ref(storage, `adImages/${filename}`);
    await uploadBytes(storageRef, blob);
    const downloadUrl = await getDownloadURL(storageRef);
    console.log('Image uploaded, URL:', downloadUrl);
    return downloadUrl;
  };

  const updateAd = async () => {
    if (!editingAd) return;
  
    console.log('Updating ad:', editingAd.id);
    setIsLoading(true);

    if (!editingAd.concertName || !editingAd.ticketType || !editingAd.numTickets || !editingAd.priceRange || !editingAd.Date || !editingAd.location || !editingAd.phoneNumber) {
      Alert.alert("Validation Error", "Please fill out all fields.");
      setIsLoading(false);
      return;
    }
  
    try {
      let updatedAd = { ...editingAd };
      if (newImage && newImage !== editingAd.imageUrl) {
        const imageUrl = await uploadImage(newImage);
        updatedAd.imageUrl = imageUrl;
      }
  
      const adDocRef = doc(collection(firestore, 'sellerAds'), editingAd.id);
      await updateDoc(adDocRef, updatedAd);
      
      const updatedAds = ads.map(ad => ad.id === editingAd.id ? updatedAd : ad);
      setAds(updatedAds);
      await AsyncStorage.setItem('sellerAds', JSON.stringify(updatedAds));

      setEditModalVisible(false);
      Alert.alert("Success", "Your ad has been updated.");
    } catch (error) {
      console.error("Error updating ad:", error);
      Alert.alert("Error", "Failed to update ad. Please try again.");
    }
    setIsLoading(false);
  };
  
  const renderItem = ({ item }: { item: any }) => {
    const concertDate = new Date(item.Date);
    const currentDate = new Date();
    const datePassed = concertDate < currentDate;
  
    const toggleCompleted = () => {
      setCompletedAds(prevState => {
        const newState = new Set(prevState);
        if (newState.has(item.id)) {
          newState.delete(item.id);
        } else {
          newState.add(item.id);
        }
        return newState;
      });
    };
  
    return (
      <View style={styles.adContainer}>
        {datePassed && (
          <TouchableOpacity 
            style={[
              styles.toggleButton, 
              completedAds.has(item.id) ? styles.toggleButtonCompleted : styles.toggleButtonIncomplete
            ]}
            onPress={toggleCompleted}
          >
            <Text style={styles.toggleButtonText}>
              {completedAds.has(item.id) ? 'Completed' : 'Mark as Completed'}
            </Text>
          </TouchableOpacity>
        )}
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
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => nav.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Seller Ads</Text>
      </View>
      {isLoading ? (
        <ActivityIndicator size="large" color="#4A90E2" style={styles.spinner} />
      ) : (
        <FlatList
          data={ads}
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
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Edit Ad</Text>
            <TouchableOpacity style={styles.imagePickerButton} onPress={pickImage}>
              <Text style={styles.imagePickerText}>Change Image</Text>
            </TouchableOpacity>
            {newImage && (
              <Image 
                source={{ uri: newImage }} 
                style={styles.previewImage} 
              />
            )}
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
              value={editingAd?.Date}
              onChangeText={(text) => setEditingAd({...editingAd, Date: text})}
              placeholder="Date"
            />
            <TextInput
              style={styles.input}
              value={editingAd?.location}
              onChangeText={(text) => setEditingAd({...editingAd, location: text})}
              placeholder="Location"
            />
            <TextInput
              style={styles.input}
              value={editingAd?.phoneNumber}
              onChangeText={(text) => setEditingAd({...editingAd, phoneNumber: text})}
              placeholder="Phone Number"
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
  imagePickerButton: {
    backgroundColor: '#4A90E2',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  imagePickerText: {
    color: 'white',
    fontWeight: 'bold',
  },
previewImage: {
    width: 200,
    height: 200,
    marginBottom: 15,
    borderRadius: 10,
  },
  spinner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 10,
  },
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
  toggleButton: {
    position: 'absolute',
    top: 10,
    left: 10,
    zIndex: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  toggleButtonIncomplete: {
    backgroundColor: '#FFD700',
  },
  toggleButtonCompleted: {
    backgroundColor: '#32CD32',
  },
  toggleButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
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
  actionButtons: {
    flexDirection: 'row',
    position: 'absolute',
    top: 10,
    right: 10,
  },
  editButton: {
    padding: 10,
    marginRight: 40,
    top: 10,
  },
  adImage: {
    width: '100%',
    height: 200,
    marginBottom: 15,
    borderRadius: 10,
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
});

export default AdsScreenSeller;
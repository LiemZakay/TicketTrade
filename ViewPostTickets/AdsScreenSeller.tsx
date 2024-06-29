import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, Image, Modal, TextInput, Platform } from 'react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { auth, firestore, storage } from '../firebaseConfig';
import { collection, getDocs, doc, getDoc, deleteDoc, query, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';

type RootStackParamList = {
  Profile: { user: any };
  AdsScreenSeller: undefined;
};

type AdsScreenSellerNavigationProp = NavigationProp<RootStackParamList, 'AdsScreenSeller'>;

export const AdsScreenSeller = () => {
  const [ads, setAds] = useState<any[]>([]);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingAd, setEditingAd] = useState<any>(null);
  const [newImage, setNewImage] = useState<string | null>(null);
  const nav = useNavigation<AdsScreenSellerNavigationProp>();
  const currentUser = auth.currentUser;

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    const adsCollection = collection(firestore, 'sellerAds');
    const adsSnapshot = await getDocs(query(adsCollection));
    const adsList = adsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setAds(adsList);
  };

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

  const editAd = (ad: any) => {
    setEditingAd(ad);
    setNewImage(null);
    setEditModalVisible(true);
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setNewImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri: string) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    const filename = uri.substring(uri.lastIndexOf('/') + 1);
    const storageRef = ref(storage, `adImages/${filename}`);
    await uploadBytes(storageRef, blob);
    return await getDownloadURL(storageRef);
  };

  const updateAd = async () => {
    if (!editingAd) return;

    try {
      let updatedAd = { ...editingAd };
      if (newImage) {
        const imageUrl = await uploadImage(newImage);
        updatedAd.imageUrl = imageUrl;
      }

      const adDocRef = doc(collection(firestore, 'sellerAds'), editingAd.id);
      await updateDoc(adDocRef, updatedAd);
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
            {(newImage || editingAd?.imageUrl) && (
              <Image 
                source={{ uri: newImage || editingAd?.imageUrl }} 
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
});

export default AdsScreenSeller;
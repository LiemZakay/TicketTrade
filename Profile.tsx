import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Image,
  Alert,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { collection, query, where, getDocs, doc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { AirbnbRating } from 'react-native-ratings';
import { Ionicons } from '@expo/vector-icons';
import { LogBox } from 'react-native';
import { firestore, storage } from './firebaseConfig';
import * as ImagePicker from 'expo-image-picker';

LogBox.ignoreLogs(['Warning: TapRating: Support for defaultProps']);

type ProfileRouteParams = {
  user: {
    uid: string;
    email: string;
    name: string;
    phone: string;
    profilePicture?: string;
  };
};

export const Profile: React.FC = () => {
  const nav = useNavigation();
  const route = useRoute<RouteProp<{ params: ProfileRouteParams }, 'params'>>();
  const { user } = route.params;
  const [email, setEmail] = useState(user.email);
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone);
  const [profilePicture, setProfilePicture] = useState(user.profilePicture || null);
  const [buyerAds, setBuyerAds] = useState<any[]>([]);
  const [sellerAds, setSellerAds] = useState<any[]>([]);
  const [rating, setRating] = useState(0);
  const [averageRating, setAverageRating] = useState(0);

  useEffect(() => {
    const fetchAds = async () => {
      const buyerAdsQuery = query(collection(firestore, 'buyerAds'), where('userId', '==', user.uid));
      const sellerAdsQuery = query(collection(firestore, 'sellerAds'), where('userId', '==', user.uid));
      
      const buyerAdsSnapshot = await getDocs(buyerAdsQuery);
      const sellerAdsSnapshot = await getDocs(sellerAdsQuery);
      
      setBuyerAds(buyerAdsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setSellerAds(sellerAdsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };

    fetchAds();

    const fetchRatings = async () => {
      const ratingsQuery = query(collection(firestore, 'ratings'), where('userId', '==', user.uid));
      const ratingsSnapshot = await getDocs(ratingsQuery);
      const ratingsData = ratingsSnapshot.docs.map(doc => doc.data().rating);
      const average = ratingsData.reduce((acc, rating) => acc + rating, 0) / ratingsData.length || 0;
      setAverageRating(average);
    };

    fetchRatings();
  }, [user.uid]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      uploadImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri: string) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    const filename = `profilePictures/${user.uid}/${Date.now()}.jpg`;
    const storageRef = ref(storage, filename);

    try {
      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);
      setProfilePicture(downloadURL);
    } catch (error) {
      console.error("Error uploading image: ", error);
      Alert.alert("Error", "Failed to upload image. Please try again.");
    }
  };

  const saveProfile = async () => {
    try {
      const userDocRef = doc(firestore, 'users', user.uid);
      await updateDoc(userDocRef, {
        email: email,
        name: name,
        phone: phone,
        profilePicture: profilePicture,
      });
      nav.goBack();
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert("Error", "Failed to save profile. Please try again.");
    }
  };

  const renderAd = ({ item }: { item: any }) => (
    <View style={styles.adContainer}>
      <View style={styles.adContent}>
        <View style={styles.adHeader}>
          <Text style={styles.concertName}>{item.concertName}</Text>
        </View>
        <View style={styles.adDetails}>
          <View style={styles.detailItem}>
            <Ionicons name="ticket-outline" size={20} color="#4A90E2" />
            <Text style={styles.detailText}>{item.ticketType} × {item.numTickets}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="cash-outline" size={20} color="#4A90E2" />
            <Text style={styles.detailText}>${item.priceRange[0]} - ${item.priceRange[1]}</Text>
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
      </View>
    </View>
  );

  const submitRating = async (newRating: number) => {
    setRating(newRating);
    try {
      await addDoc(collection(firestore, 'ratings'), {
        userId: user.uid,
        rating: newRating,
        timestamp: serverTimestamp(),
      });
      const ratingsQuery = query(collection(firestore, 'ratings'), where('userId', '==', user.uid));
      const ratingsSnapshot = await getDocs(ratingsQuery);
      const ratingsData = ratingsSnapshot.docs.map(doc => doc.data().rating);
      const average = ratingsData.reduce((acc, rating) => acc + rating, 0) / ratingsData.length || 0;
      setAverageRating(average);
    } catch (error) {
      console.error('Error submitting rating:', error);
      Alert.alert("Error", "Failed to submit rating. Please try again.");
    }
  };

  return (
    <SafeAreaView style={styles.contentView}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => nav.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={28} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>
        <TouchableOpacity onPress={pickImage} style={styles.profilePictureContainer}>
          {profilePicture ? (
            <Image source={{ uri: profilePicture }} style={styles.profilePicture} />
          ) : (
            <View style={styles.profilePicturePlaceholder}>
              <Ionicons name="person" size={60} color="#CCCCCC" />
            </View>
          )}
          <Text style={styles.changePhotoText}>Change Photo</Text>
        </TouchableOpacity>
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
          keyboardType="email-address"
        />
        <TextInput
          style={styles.inputField}
          placeholder="Phone"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />
        <TouchableOpacity onPress={saveProfile} style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
        <Text style={styles.sectionHeader}>Buyer Ads</Text>
        <FlatList
          data={buyerAds}
          renderItem={renderAd}
          keyExtractor={item => item.id}
          scrollEnabled={false}
        />
        <Text style={styles.sectionHeader}>Seller Ads</Text>
        <FlatList
          data={sellerAds}
          renderItem={renderAd}
          keyExtractor={item => item.id}
          scrollEnabled={false}
        />
        <Text style={styles.sectionHeader}>Rate this user</Text>
        <AirbnbRating
          count={5}
          reviews={["Terrible", "Bad", "OK", "Good", "Amazing"]}
          defaultRating={rating}
          size={20}
          onFinishRating={submitRating}
          showRating={false}
          starContainerStyle={styles.ratingContainer}
        />
        <Text style={styles.averageRatingText}>Average Rating: {averageRating.toFixed(1)}</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  contentView: {
    flex: 1,
    backgroundColor: "#F0F8FF",
  },
  container: {
    flex: 1,
    backgroundColor: "#F0F8FF",
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4A90E2',
    paddingTop: 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  profilePictureContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profilePicture: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  profilePicturePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#EEEEEE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  changePhotoText: {
    marginTop: 10,
    color: '#4A90E2',
    fontSize: 16,
  },
  inputField: {
    borderWidth: 1,
    borderColor: '#4A90E2',
    borderRadius: 5,
    height: 50,
    fontSize: 18,
    marginVertical: 10,
    marginHorizontal: 20,
    paddingHorizontal: 10,
    color: '#333333',
  },
  saveButton: {
    backgroundColor: '#4A90E2',
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
    marginBottom: 30,
    marginHorizontal: 20,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    textAlign: 'center',
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 10,
    marginHorizontal: 20,
  },
  adContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    marginBottom: 20,
    marginHorizontal: 20,
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
  ratingContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  averageRatingText: {
    fontSize: 18,
    color: '#333333',
    marginBottom: 20,
    textAlign: 'center',
  },
});

export default Profile;
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
  ActivityIndicator,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { collection, query, where, getDocs, doc, updateDoc, addDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { AirbnbRating } from 'react-native-ratings';
import { Ionicons } from '@expo/vector-icons';
import { LogBox } from 'react-native';
import { firestore, storage, auth } from '../firebaseConfig';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const saveUserDataToStorage = async (userData:any) => {
    try {
      await AsyncStorage.setItem(`@user_${user.uid}`, JSON.stringify(userData));
      console.log('User data saved to AsyncStorage:', userData);
    } catch (error) {
      console.error('Error saving user data to AsyncStorage:', error);
    }
  };

  const saveAverageRatingToStorage = async (rating:any) => {
    try {
      await AsyncStorage.setItem(`@rating_${user.uid}`, rating.toString());
      console.log('Average rating saved to AsyncStorage:', rating);
    } catch (error) {
      console.error('Error saving average rating to AsyncStorage:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const currentUser = auth.currentUser;
      setIsCurrentUser(currentUser?.uid === user.uid);

      try {
        const storedData = await AsyncStorage.getItem(`@user_${user.uid}`);
        if (storedData) {
          const userData = JSON.parse(storedData);
          console.log('Loaded user data from AsyncStorage:', userData);
          setEmail(userData.email);
          setName(userData.name);
          setPhone(userData.phone);
          setProfilePicture(userData.profilePicture);
        } else {
          console.log('No user data found in AsyncStorage');
        }

        // Fetch fresh data from Firestore
        const userDoc = await getDoc(doc(firestore, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          console.log('Fetched user data from Firestore:', userData);
          setEmail(userData.email);
          setName(userData.name);
          setPhone(userData.phone);
          setProfilePicture(userData.profilePicture);
          saveUserDataToStorage(userData);
        } else {
          console.log('No user document found in Firestore');
        }

        // Fetch ads
        const buyerAdsQuery = query(collection(firestore, 'buyerAds'), where('userId', '==', user.uid));
        const sellerAdsQuery = query(collection(firestore, 'sellerAds'), where('userId', '==', user.uid));
        
        const [buyerAdsSnapshot, sellerAdsSnapshot] = await Promise.all([
          getDocs(buyerAdsQuery),
          getDocs(sellerAdsQuery)
        ]);
        
        setBuyerAds(buyerAdsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setSellerAds(sellerAdsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        // Fetch ratings
        const ratingsQuery = query(collection(firestore, 'ratings'), where('userId', '==', user.uid));
        const ratingsSnapshot = await getDocs(ratingsQuery);
        const ratingsData = ratingsSnapshot.docs.map(doc => doc.data().rating);
        const average = ratingsData.reduce((acc, rating) => acc + rating, 0) / ratingsData.length || 0;
        setAverageRating(average);
        saveAverageRatingToStorage(average);

      } catch (error) {
        console.error('Error loading data:', error);
        Alert.alert("Error", "Failed to load user data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user.uid]);

  const pickImage = async () => {
    if (!isCurrentUser) {
      Alert.alert("Permission Denied", "You can only edit your own profile.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      console.log('Image picked:', result.assets[0].uri);
      uploadImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri: string) => {
    if (!isCurrentUser) return;
    setIsUploading(true);

    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const filename = `profilePictures/${user.uid}/${Date.now()}.jpg`;
      const storageRef = ref(storage, filename);

      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);
      console.log('Image uploaded, download URL:', downloadURL);
      setProfilePicture(downloadURL);
      
      const userDocRef = doc(firestore, 'users', user.uid);
      await updateDoc(userDocRef, { profilePicture: downloadURL });
      saveUserDataToStorage({ ...user, profilePicture: downloadURL });
      console.log('Profile picture URL saved to Firestore and AsyncStorage');
    } catch (error) {
      console.error("Error uploading image: ", error);
      Alert.alert("Error", "Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const saveProfile = async () => {
    if (!isCurrentUser) {
      Alert.alert("Permission Denied", "You can only edit your own profile.");
      return;
    }

    setIsUpdating(true);
    try {
      const userDocRef = doc(firestore, 'users', user.uid);
      const updatedData = {
        email: email,
        name: name,
        phone: phone,
        profilePicture: profilePicture,
      };
      await updateDoc(userDocRef, updatedData);
      await saveUserDataToStorage(updatedData);
      console.log('Profile updated in Firestore and AsyncStorage:', updatedData);
      
      Alert.alert("Success", "Profile updated successfully");
      nav.goBack();
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert("Error", "Failed to save profile. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const submitRating = async (newRating: number) => {
    setRating(newRating);
    setIsUpdating(true);
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
      saveAverageRatingToStorage(average);
    } catch (error) {
      console.error('Error submitting rating:', error);
      Alert.alert("Error", "Failed to submit rating. Please try again.");
    } finally {
      setIsUpdating(false);
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

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.contentView}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => nav.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={28} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>
        <TouchableOpacity onPress={pickImage} style={styles.profilePictureContainer} disabled={!isCurrentUser || isUploading}>
          {isUploading ? (
            <ActivityIndicator size="large" color="#4A90E2" />
          ) : profilePicture ? (
            <Image source={{ uri: profilePicture }} style={styles.profilePicture} />
          ) : (
            <View style={styles.profilePicturePlaceholder}>
              <Ionicons name="person" size={60} color="#CCCCCC" />
            </View>
          )}
          {isCurrentUser && !isUploading && <Text style={styles.changePhotoText}>Change Photo</Text>}
        </TouchableOpacity>
        <TextInput
          style={[styles.inputField, !isCurrentUser && styles.disabledInput]}
          placeholder="Name"
          value={name}
          onChangeText={setName}
          editable={isCurrentUser && !isUpdating}
        />
        <TextInput
          style={[styles.inputField, !isCurrentUser && styles.disabledInput]}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          editable={isCurrentUser && !isUpdating}
        />
        <TextInput
          style={[styles.inputField, !isCurrentUser && styles.disabledInput]}
          placeholder="Phone"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          editable={isCurrentUser && !isUpdating}
        />
        {isCurrentUser && (
          <TouchableOpacity onPress={saveProfile} style={styles.saveButton} disabled={isUpdating}>
            {isUpdating ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.saveButtonText}>Save</Text>
            )}
          </TouchableOpacity>
        )}
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
          isDisabled={isUpdating}
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
      loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: "#F0F8FF",
      },
      loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: "#4A90E2",
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
      disabledInput: {
        backgroundColor: '#F0F0F0',
        color: '#888888',
      },
      saveButton: {
        backgroundColor: '#4A90E2',
        padding: 10,
        borderRadius: 5,
        marginTop: 20,
        marginBottom: 30,
        marginHorizontal: 20,
        alignItems: 'center',
        justifyContent: 'center',
        height: 50,
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
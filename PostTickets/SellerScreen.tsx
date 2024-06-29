import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, Image, ScrollView } from 'react-native';
import { collection, addDoc, doc, getDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { firestore, auth, storage } from '../firebaseConfig'; 
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export const SellerScreen = () => {
  const [concertName, setConcertName] = useState('');
  const [ticketType, setTicketType] = useState('');
  const [numTickets, setNumTickets] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [Date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [image, setImage] = useState<string | null>(null);

  const nav = useNavigation();

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImage(result.assets[0].uri);
    }
  };

  const uploadImage = async () => {
    if (image) {
      const response = await fetch(image);
      const blob = await response.blob();
      const filename = image.substring(image.lastIndexOf('/') + 1);
      const storageRef = ref(storage, `images/${filename}`);
      
      try {
        await uploadBytes(storageRef, blob);
        return await getDownloadURL(storageRef);
      } catch (error) {
        console.error("Error uploading image: ", error);
        return null;
      }
    }
    return null;
  };

  const postAd = async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        const userDocRef = doc(firestore, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        const userData = userDocSnap.data();
        const userName = userData?.name;
        const profileImageUrl = userData?.profileImageUrl || '';

        const imageUrl = await uploadImage();

        await addDoc(collection(firestore, 'sellerAds'), {
          concertName,
          ticketType,
          numTickets: parseInt(numTickets),
          priceRange,
          Date,
          location,
          phoneNumber,
          userId: user.uid,
          userName: userName,
          profileImageUrl: profileImageUrl,
          imageUrl: imageUrl,
          createdAt: serverTimestamp(),
        });

        Alert.alert('Success', 'Your ad has been posted!');
        // Reset form
        setConcertName('');
        setTicketType('');
        setNumTickets('');
        setPriceRange('');
        setDate('');
        setLocation('');
        setPhoneNumber('');
        setImage(null);
      } catch (error) {
        Alert.alert('Error', 'There was an error posting your ad.');
      }
    }
  };

  const gobackHome = () => {
    nav.goBack();
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}> Seller Ad</Text>
      </View>
      <ScrollView style={styles.formContainer}>
        <Text style={styles.label}>Name of the concert:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter concert name"
          value={concertName}
          onChangeText={setConcertName}
        />
        <Text style={styles.label}>Ticket Type:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter ticket type"
          value={ticketType}
          onChangeText={setTicketType}
        />
        <Text style={styles.label}>Number of tickets:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter number of tickets"
          keyboardType="numeric"
          value={numTickets}
          onChangeText={setNumTickets}
        />
        <Text style={styles.label}>Price range:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter price"
          value={priceRange}
          onChangeText={setPriceRange}
        />
        <Text style={styles.label}>Date:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter the Date of the concert:"
          value={Date}
          onChangeText={setDate}
        />
        <Text style={styles.label}>Location:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter location of concert"
          value={location}
          onChangeText={setLocation}
        />
        <Text style={styles.label}>Phone number:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter phone number"
          keyboardType="phone-pad"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
        />
        <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
          <Text style={styles.imageButtonText}>Choose Image</Text>
        </TouchableOpacity>
        {image && <Image source={{ uri: image }} style={styles.previewImage} />}
      </ScrollView>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.postButton} onPress={postAd}>
          <Text style={styles.postButtonText}>Post Ad</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.postButton} onPress={gobackHome}>
          <Text style={styles.postButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#2196F3',
    padding: 16,
    alignItems: 'center',
  },
  headerText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  formContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333333',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 4,
    padding: 8,
    marginBottom: 16,
  },
  buttonContainer: {
    padding: 16,
    backgroundColor: '#F5F5F5',
  },
  postButton: {
    backgroundColor: '#2196F3',
    padding: 16,
    borderRadius: 4,
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  postButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  imageButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
    marginBottom: 16,
  },
  imageButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  previewImage: {
    width: 200,
    height: 200,
    alignSelf: 'center',
    marginBottom: 16,
  },
});

export default SellerScreen;
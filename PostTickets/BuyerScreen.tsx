import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Icon from 'react-native-vector-icons/Ionicons';
import { auth, firestore } from '../firebaseConfig';
import { collection, addDoc, doc, getDoc, serverTimestamp } from 'firebase/firestore';

export const BuyerScreen = () => {
  const [concertName, setConcertName] = useState('');
  const [ticketType, setTicketType] = useState('');
  const [numTickets, setNumTickets] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [location, setLocation] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  const validateInputs = () => {
    if (!concertName.trim()) {
      Alert.alert('Error', 'Please enter the concert name.');
      return false;
    }
    if (!ticketType.trim()) {
      Alert.alert('Error', 'Please enter the ticket type.');
      return false;
    }
    if (!numTickets.trim() || isNaN(parseInt(numTickets)) || parseInt(numTickets) <= 0) {
      Alert.alert('Error', 'Please enter a valid number of tickets.');
      return false;
    }
    if (!priceRange.trim()) {
      Alert.alert('Error', 'Please enter the price .');
      return false;
    }
    if (!location.trim()) {
      Alert.alert('Error', 'Please enter the location.');
      return false;
    }
    if (!phoneNumber.trim() || phoneNumber.length < 10) {
      Alert.alert('Error', 'Please enter a valid phone number.');
      return false;
    }
    return true;
  };

  const postAd = async () => {
    if (!validateInputs()) return;

    const user = auth.currentUser;
    if (user) {
      setIsLoading(true);
      try {
        const userDocRef = doc(collection(firestore, 'users'), user.uid);
        const userDocSnap = await getDoc(userDocRef);
        const userName = userDocSnap.data()?.name;
        
        await addDoc(collection(firestore, 'buyerAds'), {
          concertName,
          ticketType,
          numTickets: parseInt(numTickets),
          priceRange,
          location,
          phoneNumber,
          userId: user.uid,
          userName: userName,
          createdAt: serverTimestamp(),
        });
        
        setIsLoading(false);
        Alert.alert('Success', 'Your ad has been posted!');
        // Reset form
        setConcertName('');
        setTicketType('');
        setNumTickets('');
        setPriceRange('');
        setLocation('');
        setPhoneNumber('');
      } catch (error) {
        setIsLoading(false);
        Alert.alert('Error', 'There was an error posting your ad.');
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backIcon} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Buyer Ad</Text>
      </View>
      <View style={styles.formContainer}>
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
        <Text style={styles.label}>Price :</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter price in dollars "
          value={priceRange}
          onChangeText={setPriceRange}
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
      </View>
      {isLoading ? (
        <ActivityIndicator size="large" color="#2196F3" style={styles.spinner} />
      ) : (
        <TouchableOpacity style={styles.postButton} onPress={postAd}>
          <Text style={styles.postButtonText}>Post Ad</Text>
        </TouchableOpacity>
      )}
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
    flexDirection: 'row',
  },
  headerText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  backIcon: {
    position: 'absolute',
    left: 16,
    top: 16,
    zIndex: 1,
  },
  formContainer: {
    padding: 16,
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
  spinner: {
    marginVertical: 20,
  },
});

export default BuyerScreen;
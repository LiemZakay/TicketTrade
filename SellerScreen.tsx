import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

export const SellerScreen = () => {
  const [concertName, setConcertName] = useState('');
  const [ticketType, setTicketType] = useState('');
  const [numTickets, setNumTickets] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [Date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const postAd = async () => {
    const user = auth().currentUser;
    if (user) {
      try {
        const userDoc = await firestore().collection('users').doc(user.uid).get();
        const userName = userDoc.data()?.name;
        await firestore().collection('sellerAds').add({
          concertName,
          ticketType,
          numTickets: parseInt(numTickets),
          priceRange,
          Date,
          location,
          phoneNumber,
          userId: user.uid,
          userName: userName,
          createdAt: firestore.FieldValue.serverTimestamp(),
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
      } catch (error) {
        Alert.alert('Error', 'There was an error posting your ad.');
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}> Seller Ad</Text>
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
        <Text style={styles.label}>Price range:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter price range"
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
      </View>
      <TouchableOpacity style={styles.postButton} onPress={postAd}>
        <Text style={styles.postButtonText}>Post Ad</Text>
      </TouchableOpacity>
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
});


import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, Image, ScrollView, ActivityIndicator, Platform } from 'react-native';
import { collection, addDoc, doc, getDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { firestore, auth, storage } from '../firebaseConfig'; 
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import DateTimePicker from '@react-native-community/datetimepicker';

export const SellerScreen = () => {
  const [concertName, setConcertName] = useState('');
  const [ticketType, setTicketType] = useState('');
  const [numTickets, setNumTickets] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [date, setDate] = useState<Date | null>(null);
  const [location, setLocation] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showDatePicker, setShowDatePicker] = useState(false);

  const nav = useNavigation();

  const validateForm = () => {
    let newErrors: { [key: string]: string } = {};

    if (!concertName.trim()) newErrors.concertName = "Concert name is required";
    if (!ticketType.trim()) newErrors.ticketType = "Ticket type is required";
    if (!numTickets.trim()) newErrors.numTickets = "Number of tickets is required";
    else if (isNaN(Number(numTickets)) || Number(numTickets) <= 0) newErrors.numTickets = "Invalid number of tickets";
    if (!priceRange.trim()) newErrors.priceRange = "Price is required";
    if (!date) newErrors.date = "Date is required";
    if (!location.trim()) newErrors.location = "Location is required";
    if (!phoneNumber.trim()) newErrors.phoneNumber = "Phone number is required";
    else if (!/^\d{10}$/.test(phoneNumber)) newErrors.phoneNumber = "Invalid phone number format";
    if (!image) newErrors.image = "Image is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImage(result.assets[0].uri);
      setErrors({ ...errors, image: '' });
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
    if (!validateForm()) return;

    setIsLoading(true);
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
          date: date?.toISOString() || '',
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
        setDate(null);
        setLocation('');
        setPhoneNumber('');
        setImage(null);
      } catch (error) {
        Alert.alert('Error', 'There was an error posting your ad.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const gobackHome = () => {
    nav.goBack();
  }

  const onDateChange = (event: any, selectedDate: Date | undefined) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios');
    setDate(currentDate);
  };

  const showDatepicker = () => {
    setShowDatePicker(true);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Seller Ad</Text>
      </View>
      <ScrollView style={styles.formContainer}>
        <Text style={styles.label}>Concert Name:</Text>
        <TextInput
          style={[styles.input, errors.concertName ? styles.inputError : null]}
          placeholder="Enter concert name"
          value={concertName}
          onChangeText={(text) => {
            setConcertName(text);
            setErrors({ ...errors, concertName: '' });
          }}
        />
        {errors.concertName && <Text style={styles.errorText}>{errors.concertName}</Text>}

        <Text style={styles.label}>Ticket Type:</Text>
        <TextInput
          style={[styles.input, errors.ticketType ? styles.inputError : null]}
          placeholder="Enter ticket type"
          value={ticketType}
          onChangeText={(text) => {
            setTicketType(text);
            setErrors({ ...errors, ticketType: '' });
          }}
        />
        {errors.ticketType && <Text style={styles.errorText}>{errors.ticketType}</Text>}

        <Text style={styles.label}>Number of Tickets:</Text>
        <TextInput
          style={[styles.input, errors.numTickets ? styles.inputError : null]}
          placeholder="Enter number of tickets"
          keyboardType="numeric"
          value={numTickets}
          onChangeText={(text) => {
            setNumTickets(text);
            setErrors({ ...errors, numTickets: '' });
          }}
        />
        {errors.numTickets && <Text style={styles.errorText}>{errors.numTickets}</Text>}

        <Text style={styles.label}>Price :</Text>
        <TextInput
          style={[styles.input, errors.priceRange ? styles.inputError : null]}
          placeholder="Enter price "
          value={priceRange}
          onChangeText={(text) => {
            setPriceRange(text);
            setErrors({ ...errors, priceRange: '' });
          }}
        />
        {errors.priceRange && <Text style={styles.errorText}>{errors.priceRange}</Text>}

        <TouchableOpacity onPress={showDatepicker} style={[styles.input, styles.datePickerInput, errors.date ? styles.inputError : null]}>
          <Text style={styles.datePickerText}>{date ? date.toDateString() : 'Select Date'}</Text>
        </TouchableOpacity>
        {errors.date && <Text style={styles.errorText}>{errors.date}</Text>}

        <Text style={styles.label}>Location:</Text>
        <TextInput
          style={[styles.input, errors.location ? styles.inputError : null]}
          placeholder="Enter location of concert"
          value={location}
          onChangeText={(text) => {
            setLocation(text);
            setErrors({ ...errors, location: '' });
          }}
        />
        {errors.location && <Text style={styles.errorText}>{errors.location}</Text>}

        <Text style={styles.label}>Phone Number:</Text>
        <TextInput
          style={[styles.input, errors.phoneNumber ? styles.inputError : null]}
          placeholder="Enter phone number"
          keyboardType="phone-pad"
          value={phoneNumber}
          onChangeText={(text) => {
            setPhoneNumber(text);
            setErrors({ ...errors, phoneNumber: '' });
          }}
        />
        {errors.phoneNumber && <Text style={styles.errorText}>{errors.phoneNumber}</Text>}

        <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
          <Text style={styles.imageButtonText}>Choose Image</Text>
        </TouchableOpacity>
        {image && <Image source={{ uri: image }} style={styles.previewImage} />}
        {errors.image && <Text style={styles.errorText}>{errors.image}</Text>}
      </ScrollView>
      {showDatePicker && (
        <DateTimePicker
          testID="dateTimePicker"
          value={date || new Date()}
          mode="date"
          display="default"
          onChange={onDateChange}
        />
      )}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.postButton} onPress={postAd} disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.postButtonText}>Post Ad</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity style={styles.postButton} onPress={gobackHome} disabled={isLoading}>
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
  inputError: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginBottom: 8,
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
  datePickerInput: {
    justifyContent: 'center',
  },
  datePickerText: {
    fontSize: 16,
    color: '#333333',
  },
});

export default SellerScreen;

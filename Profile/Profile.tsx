import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import firestore from '@react-native-firebase/firestore';
import { AirbnbRating } from 'react-native-ratings';
import { Ionicons } from '@expo/vector-icons';
import { LogBox } from 'react-native';

LogBox.ignoreLogs(['Warning: TapRating: Support for defaultProps']);

type ProfileRouteParams = {
  user: {
    uid: string;
    email: string;
    name: string;
    phone: string;
  };
};

const Profile: React.FC = () => {
  const nav = useNavigation();
  const route = useRoute<RouteProp<{ params: ProfileRouteParams }, 'params'>>();
  const { user } = route.params;
  const [email, setEmail] = useState(user.email);
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone);
  const [buyerAds, setBuyerAds] = useState<any[]>([]);
  const [sellerAds, setSellerAds] = useState<any[]>([]);
  const [rating, setRating] = useState(0);
  const [averageRating, setAverageRating] = useState(0);

  useEffect(() => {
    const fetchAds = async () => {
      const buyerAdsSnapshot = await firestore().collection('buyerAds').where('userId', '==', user.uid).get();
      const sellerAdsSnapshot = await firestore().collection('sellerAds').where('userId', '==', user.uid).get();
      setBuyerAds(buyerAdsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setSellerAds(sellerAdsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };

    fetchAds();

    const fetchRatings = async () => {
      const ratingsSnapshot = await firestore().collection('ratings').where('userId', '==', user.uid).get();
      const ratingsData = ratingsSnapshot.docs.map(doc => doc.data().rating);
      const average = ratingsData.reduce((acc, rating) => acc + rating, 0) / ratingsData.length || 0;
      setAverageRating(average);
    };

    fetchRatings();
  }, [user.uid]);

  const saveProfile = async () => {
    try {
      const userDoc = firestore().collection('users').doc(user.uid);
      await userDoc.update({
        email: email,
        name: name,
        phone: phone,
      });
      nav.goBack();
    } catch (error) {
      console.error('Error updating profile:', error);
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
      await firestore().collection('ratings').add({
        userId: user.uid,
        rating: newRating,
        timestamp: firestore.FieldValue.serverTimestamp(),
      });
      const ratingsSnapshot = await firestore().collection('ratings').where('userId', '==', user.uid).get();
      const ratingsData = ratingsSnapshot.docs.map(doc => doc.data().rating);
      const average = ratingsData.reduce((acc, rating) => acc + rating, 0) / ratingsData.length || 0;
      setAverageRating(average);
    } catch (error) {
      console.error('Error submitting rating:', error);
    }
  };

  return (
    <SafeAreaView style={styles.contentView}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => nav.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={28} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>
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
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
        <Text style={styles.sectionHeader}>Seller Ads</Text>
        <FlatList
          data={sellerAds}
          renderItem={renderAd}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
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
      </View>
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
    paddingHorizontal: 20,
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
  inputField: {
    borderWidth: 1,
    borderColor: '#4A90E2',
    borderRadius: 5,
    height: 50,
    fontSize: 18,
    marginVertical: 10,
    paddingHorizontal: 10,
    color: '#333333',
  },
  saveButton: {
    backgroundColor: '#4A90E2',
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
    marginBottom: 30,
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
  },
  listContent: {
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
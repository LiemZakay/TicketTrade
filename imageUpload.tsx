// imageUpload.tsx
import React, { useState, useEffect } from 'react';
import { Button, Image, View, Platform, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { firestore, storage } from './firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export const ImageUpload: React.FC = () => {
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);

  useEffect(() => {
    requestPermission();
  }, []);

  const requestPermission = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert('We need camera roll permissions to make this work!');
      }
    }
  };

  const openGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImageUri(result.assets[0].uri);
    }
  };

  const uploadImage = async () => {
    if (selectedImageUri) {
      const response = await fetch(selectedImageUri);
      const blob = await response.blob();
      const fileName = selectedImageUri.split('/').pop() || 'photo.jpg';
      const storageRef = ref(storage, `images/${fileName}`);

      try {
        await uploadBytes(storageRef, blob);
        const url = await getDownloadURL(storageRef);

        await addDoc(collection(firestore, 'images'), {
          url,
          createdAt: serverTimestamp()
        });

        alert('Upload successful!');
      } catch (error) {
        console.error(error);
        alert('Upload failed!');
      }
    }
  };

  return (
    <View style={styles.container}>
      <Button title="Choose Image from Gallery" onPress={openGallery} />
      {selectedImageUri && (
        <>
          <Image source={{ uri: selectedImageUri }} style={styles.image} />
          <Button title="Upload Image" onPress={uploadImage} />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 300,
    height: 300,
    marginTop: 20,
  },
});

export default ImageUpload;

import React, { useState } from 'react';
import { Button, Image, View } from 'react-native';
import { launchImageLibrary, ImagePickerResponse } from 'react-native-image-picker';
import storage from '@react-native-firebase/storage';

export const ImagePickerComp = () => {
  const [imageSource, setImageSource] = useState<{ uri: string } | null>(null);

  const selectImage = () => {
    launchImageLibrary({ mediaType: 'photo' }, (response: ImagePickerResponse) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage);
      } else {
        const source = { uri: response.assets?.[0].uri ?? '' };
        setImageSource(source);

        // Upload image to Firebase Storage
        const uploadUri = response.assets?.[0].uri ?? '';
        const fileName = uploadUri.substring(uploadUri.lastIndexOf('/') + 1);
        const task = storage().ref(`images/${fileName}`).putFile(uploadUri);

        task
          .then(() => {
            console.log('Image uploaded successfully');
          })
          .catch((error) => {
            console.error('Error uploading image:', error);
          });
      }
    });
  };

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      {imageSource && <Image source={imageSource} style={{ width: 200, height: 200 }} />}
      <Button title="Select Image" onPress={selectImage} />
    </View>
  );
};

export default ImagePickerComp;
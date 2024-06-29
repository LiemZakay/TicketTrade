import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, StyleSheet, Button, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { getAccessToken } from './SpotifyAuth';

interface Artist {
  id: string;
  name: string;
  images: { url: string }[];
}

interface Album {
  artists: Artist[];
  images: { url: string }[];
}

const PopularArtistsScreen: React.FC = () => {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPopularArtists();
  }, []);

  const fetchPopularArtists = async () => {
    setLoading(true);
    setError(null);
    try {
      const accessToken = await getAccessToken();
      const response = await axios.get('https://api.spotify.com/v1/browse/new-releases', {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: { country: 'US', limit: 20 }
      });

      if (response.data && response.data.albums && response.data.albums.items) {
        const newArtists = response.data.albums.items
          .filter((album: Album) => album.artists && album.artists.length > 0)
          .map((album: Album) => ({
            ...album.artists[0],
            images: album.images 
          }));
        console.log('Fetched artists:', newArtists);
        setArtists(newArtists);
      } else {
        setError('Invalid data structure received from API');
      }
    } catch (error) {
      console.error('Error fetching artists:', error);
      setError('Failed to fetch artists. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderArtist = ({ item }: { item: Artist }) => {
    console.log('Rendering artist:', item.name, 'Image URL:', item.images && item.images.length > 0 ? item.images[0].url : 'No image');
    return (
      <View style={styles.artistItem}>
        {item.images && item.images.length > 0 ? (
          <Image 
            source={{ uri: item.images[0].url }} 
            style={styles.artistImage} 
            onError={(e) => console.log('Image loading error for', item.name, ':', e.nativeEvent.error)}
          />
        ) : (
          <View style={[styles.artistImage, styles.placeholderImage]} />
        )}
        <Text style={styles.artistName}>{item.name}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Button title="Refresh Artists" onPress={fetchPopularArtists} disabled={loading} />
      {loading && <ActivityIndicator size="large" color="#0000ff" />}
      {error && <Text style={styles.errorText}>{error}</Text>}
      <FlatList
        data={artists}
        renderItem={renderArtist}
        keyExtractor={(item) => item.id}
        numColumns={2}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#fff',
  },
  artistItem: {
    flex: 1,
    margin: 5,
    alignItems: 'center',
  },
  artistImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  placeholderImage: {
    backgroundColor: '#ccc',
  },
  artistName: {
    marginTop: 5,
    textAlign: 'center',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 10,
  },
});

export default PopularArtistsScreen;
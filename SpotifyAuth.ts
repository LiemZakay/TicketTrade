import axios from 'axios';
import base64 from 'base64-js';

const CLIENT_ID = 'e31b2745d5f64f07b401cbea1506e1c9';
const CLIENT_SECRET = '28519dccb57840d69f315b52a75ee32b';

export const getAccessToken = async (): Promise<string> => {
  try {
    const credentials = `${CLIENT_ID}:${CLIENT_SECRET}`;
    const utf8Bytes = new TextEncoder().encode(credentials);
    const base64Encoded = base64.fromByteArray(utf8Bytes);

    const response = await axios.post('https://accounts.spotify.com/api/token', 
      'grant_type=client_credentials', 
      {
        headers: {
          'Authorization': `Basic ${base64Encoded}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    return response.data.access_token;
  } catch (error) {
    console.error('Error getting access token:', error);
    throw error;
  }
};
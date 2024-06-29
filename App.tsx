import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './Login/Login'; 
import RegisterScreen from './Register/Register';
import {HomePageScreen} from './HomePage/HomePage';
import BuyerScreen from './PostTickets/BuyerScreen'
import AdsScreen from './ViewPostTickets/AdsScreen';
import AdsScreenSeller from './ViewPostTickets/AdsScreenSeller';
import {SellerScreen} from './PostTickets/SellerScreen';
import Profile from './Profile/Profile';
import PopularArtistsScreen from './SpotifyApi/PopularArtistsScreen';


const Stack = createNativeStackNavigator();

const App: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Login' }} />
        <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Register' }} />
        <Stack.Screen name="HomeScreen" component={ HomePageScreen } options={{ title: 'Home Screen' }} />
        <Stack.Screen name="BuyerScreen" component={ BuyerScreen } options={{ title: 'Buyer Screen' }} />
        <Stack.Screen name="AdsScreen" component={ AdsScreen } options={{ title: 'Ads Screen' }} />
        <Stack.Screen name="AdsScreenSeller" component={ AdsScreenSeller } options={{ title: 'Ads Screen Seller' }} />
        <Stack.Screen name="SellerScreen" component={ SellerScreen } options={{ title: 'SellerScreen' }} />
        <Stack.Screen name="Profile" component={ Profile } options={{ title: 'Profile' }} />
        <Stack.Screen name="PopularArtistsScreen" component={ PopularArtistsScreen } options={{ title: 'Popular Artists Screen' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;

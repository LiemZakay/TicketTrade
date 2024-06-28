import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './Login/Login'; 
import RegisterScreen from './Register/Register';
import HomePageScreen from './HomePage/HomePage';
import BuyerScreen from './BuyerScreen'
import AdsScreen from './AdsScreen';
import AdsScreenSeller from './AdsScreenSeller';
import {SellerScreen} from './SellerScreen';
import Profile from './Profile/Profile';
import PopularArtistsScreen from './PopularArtistsScreen';


const Stack = createNativeStackNavigator();

const App: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Login' }} />
        <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Register' }} />
        <Stack.Screen name="HomeScreen" component={ HomePageScreen } options={{ title: 'HomeScreen' }} />
        <Stack.Screen name="BuyerScreen" component={ BuyerScreen } options={{ title: 'BuyerScreen' }} />
        <Stack.Screen name="AdsScreen" component={ AdsScreen } options={{ title: 'AdsScreen' }} />
        <Stack.Screen name="AdsScreenSeller" component={ AdsScreenSeller } options={{ title: 'AdsScreenSeller' }} />
        <Stack.Screen name="SellerScreen" component={ SellerScreen } options={{ title: 'SellerScreen' }} />
        <Stack.Screen name="Profile" component={ Profile } options={{ title: 'Profile' }} />
        <Stack.Screen name="PopularArtistsScreen" component={ PopularArtistsScreen } options={{ title: 'PopularArtistsScreen' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;

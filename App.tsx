import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Register } from "./Register/Register";
import { HomePage } from "./HomePage/HomePage";
import { Login } from "./Login/Login";
import Profile from "./Profile/Profile";
import  { BuyerScreen }  from "./BuyerScreen";
import { SellerScreen } from "./SellerScreen";
import {AdsScreen} from "./AdsScreen";
import {AdsScreenSeller} from "./AdsScreenSeller";
import {ImagePickerComp} from "./PicUpload";



const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Login"
          component={Login}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Register"
          component={Register}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="HomePage"
          component={HomePage}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Profile"
          component={Profile}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="BuyerScreen"
          component={BuyerScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="SellerScreen"
          component={SellerScreen}
          options={{
            headerShown: false,
          }}
        />
          <Stack.Screen
          name="AdsScreen"
          component={AdsScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="AdsScreenSeller"
          component={AdsScreenSeller}
          options={{
            headerShown: false,
          }}
        />
         <Stack.Screen
          name="picUpload"
          component={ImagePickerComp}
          options={{
            headerShown: false,
          }}
        />
        
        
      </Stack.Navigator>
    </NavigationContainer>
  );
}

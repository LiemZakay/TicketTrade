// firebaseConfig.ts
import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';


const firebaseConfig = {
  apiKey: "AIzaSyD4qFVRrnYeXQMYiq-ZxyI3eb6Yze-YcEM",
  authDomain: "tickettrade-e0325.firebaseapp.com",
  projectId: "tickettrade-e0325",
  storageBucket: "tickettrade-e0325.appspot.com",
  messagingSenderId: "946944958286",
  appId: "1:946944958286:android:69d1c01b3dd05bc86c481f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore and Storage
const firestore = getFirestore(app);
const storage = getStorage(app);

// Initialize Auth with AsyncStorage for persistence
const auth= getAuth(app);

export { firestore, storage, auth };
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBaHFcoe_3PppGcHXgEeZpu83xW28vOacQ",
    authDomain: "ivault-9fc40.firebaseapp.com",
    projectId: "ivault-9fc40",
    storageBucket: "ivault-9fc40.firebasestorage.app",
    messagingSenderId: "993764408430",
    appId: "1:993764408430:web:09be06f8deea0f56273a7f",
    measurementId: "G-LPN6B2BNKV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database and get a reference to the service
export const database = getDatabase(app);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

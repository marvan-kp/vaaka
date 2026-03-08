import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBJSqqmw9PFzWxb1ULgOFT4sqW5EfJdzlE",
    authDomain: "vaaka-clothing.firebaseapp.com",
    projectId: "vaaka-clothing",
    storageBucket: "vaaka-clothing.firebasestorage.app",
    messagingSenderId: "690120656912",
    appId: "1:690120656912:web:108b5b6dd2876e9bdb2295",
    measurementId: "G-LNWP4M4DKQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database and get a reference to the service
export const database = getDatabase(app);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

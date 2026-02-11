import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyB7HQXRGYXNxvuC8vuMe3xHBzdjXsTnAdI",
    authDomain: "taskflow-13401.firebaseapp.com",
    projectId: "taskflow-13401",
    storageBucket: "taskflow-13401.firebasestorage.app",
    messagingSenderId: "667845880176",
    appId: "1:667845880176:web:f92eacf13f5b6aaa8387b5",
    measurementId: "G-M4S15108ZM"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

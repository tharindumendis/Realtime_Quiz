// Import the functions you need from the SDKs you need
import { initializeApp, FirebaseApp } from "firebase/app"; // Added FirebaseApp type
// 🚨 CORRECTED IMPORT: Replace 'FirebaseDatabase' with 'Database'
import { getDatabase, Database } from "firebase/database"; 
import { getAuth, Auth } from "firebase/auth"; 

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app: FirebaseApp = initializeApp(firebaseConfig);
// 🚨 FIX APPLIED HERE
const database: Database = getDatabase(app);
const auth: Auth = getAuth(app); 

export default app;
export { database, auth,app };
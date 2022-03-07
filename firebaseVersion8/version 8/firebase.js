
import firebase from "firebase/app";
import 'firebase/auth'
import 'firebase/database'
import 'firebase/storage'
import 'firebase/firestore'

const firebaseConfig = {
   apiKey: process.env.REACT_APP_API_KEY,
   authDomain: process.env.REACT_APP_FIREBASE_DOMAIN,
   databaseURL: process.env.REACT_APP_DATABASE_URL,
   storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
   projectId: process.env.REACT_APP_PROJECTID,
};
firebase.initializeApp(firebaseConfig);
export const FireAuth = firebase.auth();
export const Firedb = firebase.database();
export const FireStorage = firebase.storage();
export const FireStore = firebase.firestore();

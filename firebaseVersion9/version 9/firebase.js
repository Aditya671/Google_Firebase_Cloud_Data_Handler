const { initializeApp }  = require("firebase/app");
const firestoreMethods  = require("firebase/firestore");
const auth = require("firebase/auth");
const storage = require('firebase/storage');
const realtimeDb = require('firebase/database');

const app = initializeApp({
   apiKey: process.env.REACT_APP_API_KEY,
   authDomain: process.env.REACT_APP_FIREBASE_DOMAIN,
   databaseURL: process.env.REACT_APP_DATABASE_URL,
   storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
   projectId: process.env.REACT_APP_PROJECTID,
   messagingSenderId: process.env.REACT_APP_MESSAGE_SENDER,
   appId: process.env.REACT_APP_APPID,
   measurementId: process.env.REACT_APP_MEASUREMENTID
});

const firestoreDb = firestoreMethods.getFirestore(app);

module.exports = {auth,storage,realtimeDb,firestoreDb,firestoreMethods};
const { initializeApp } = require('firebase/app');
const { getAuth } = require('firebase/auth');
const { getFirestore, collection, addDoc, getDocs, doc, getDoc, updateDoc, deleteDoc} = require('firebase/firestore');



// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBrajs_b3rqdh9KnnCr3D5ESltjRxZ122o",
    authDomain: "auth-7f0a8.firebaseapp.com",
    projectId: "auth-7f0a8",
    storageBucket: "auth-7f0a8.appspot.com",
    messagingSenderId: "950113743344",
    appId: "1:950113743344:web:75b59f2d4e72f2bfa72d35"
  };
  // Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const banco = getFirestore(app);

module.exports = { auth, banco, collection, addDoc, getDocs, doc, getDoc, updateDoc, deleteDoc };

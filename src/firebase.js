import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCU7quhSfSkCZjTvfLhEW8dpG-u6qRE26w",
  authDomain: "hs-todolist.firebaseapp.com",
  projectId: "hs-todolist",
  storageBucket: "hs-todolist.firebasestorage.app",
  messagingSenderId: "95698559885",
  appId: "1:95698559885:web:a03797ffc77cbb70a013c4"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider, signInWithPopup, signOut, onAuthStateChanged };

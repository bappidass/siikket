import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
const firebaseConfig = {
  apiKey: "AIzaSyDRmG1aSqrDP3C1FMi7IF-8tTh3LJS2mfE",
  authDomain: "siiket.firebaseapp.com",
  projectId: "siiket",
  storageBucket: "siiket.firebasestorage.app",
  messagingSenderId: "516455793841",
  appId: "1:516455793841:web:78e4474fdc9a1c6ebd4e90",
  measurementId: "G-97EVHSGK18"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth, onAuthStateChanged };
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCIw9iypfuHmqGz1CE-RwG9ZmJz7PauEqY",
  authDomain: "flowstate-uk.firebaseapp.com",
  projectId: "flowstate-uk",
  storageBucket: "flowstate-uk.firebasestorage.app",
  messagingSenderId: "296867354772",
  appId: "1:296867354772:web:0b8b0b0435518b74493c81",
  measurementId: "G-E74CRMP2D1",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
export default app;

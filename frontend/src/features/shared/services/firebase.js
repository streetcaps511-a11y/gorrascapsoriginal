import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, sendPasswordResetEmail, createUserWithEmailAndPassword, confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";

// Configuración oficial de tu consola
const firebaseConfig = {
  apiKey: "AIzaSyDIPRpEDP16xJfApqHo8u4nDZxPuN9XikA",
  authDomain: "streenn-7805b.firebaseapp.com",
  projectId: "streenn-7805b",
  storageBucket: "streenn-7805b.firebasestorage.app",
  messagingSenderId: "149729514045",
  appId: "1:149729514045:web:5ae45c40cc3b6f0b781054",
  measurementId: "G-H1N6BE2JZS"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export { sendPasswordResetEmail, createUserWithEmailAndPassword, confirmPasswordReset, verifyPasswordResetCode };

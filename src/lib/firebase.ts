import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBCY-6nH8HGOCq4CtaAy7gJ982R_ecJ_gM",
  authDomain: "gen-lang-client-0363887291.firebaseapp.com",
  projectId: "gen-lang-client-0363887291",
  storageBucket: "gen-lang-client-0363887291.firebasestorage.app",
  messagingSenderId: "1096614686219",
  appId: "1:1096614686219:web:87ff617094dd96e281610e"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, "ai-studio-hthngqunldncvnng-9b703b80-8e27-40fd-b3a8-684392ef2c49");

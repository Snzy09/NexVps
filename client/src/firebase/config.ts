import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, type Auth } from 'firebase/auth';
import { getAnalytics, isSupported, type Analytics } from 'firebase/analytics';

export interface FirebaseClientConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
  measurementId?: string;
}

// User live Firebase configuration
const DEFAULT_FIREBASE_CONFIG: FirebaseClientConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCWOGMzQfQ5WaO4dIAwSOAsOQSk-eYUU5M",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "nexvps.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "nexvps",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "nexvps.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "830149473611",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:830149473611:web:845d355ef8c393f7ff64ce",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-5VWYFK0GG6"
};

export const getStoredFirebaseConfig = (): FirebaseClientConfig => {
  try {
    const raw = localStorage.getItem('nexvps_firebase_config');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.apiKey && parsed.projectId) {
        return parsed;
      }
    }
  } catch (e) {
    // ignore
  }
  return DEFAULT_FIREBASE_CONFIG;
};

export const saveFirebaseConfig = (config: FirebaseClientConfig) => {
  localStorage.setItem('nexvps_firebase_config', JSON.stringify(config));
};

let app: FirebaseApp;
let auth: Auth;
let analytics: Analytics | undefined;
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

const currentConfig = getStoredFirebaseConfig();

try {
  app = getApps().length === 0 ? initializeApp(currentConfig) : getApp();
  auth = getAuth(app);
  
  if (typeof window !== 'undefined') {
    isSupported().then(supported => {
      if (supported) {
        analytics = getAnalytics(app);
      }
    }).catch(() => {
      // quiet analytics error
    });
  }
} catch (error) {
  console.warn('Firebase initialization with stored config failed, using fallback:', error);
  app = getApps().length === 0 ? initializeApp(DEFAULT_FIREBASE_CONFIG) : getApp();
  auth = getAuth(app);
}

export { app, auth, googleProvider, analytics };

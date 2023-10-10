import {
    PUBLIC_FIREBASE_API_KEY, PUBLIC_FIREBASE_APP_ID,
    PUBLIC_FIREBASE_AUTH_DOMAIN,
    PUBLIC_FIREBASE_DATABASE_URL, PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    PUBLIC_FIREBASE_PROJECT_ID, PUBLIC_FIREBASE_STORAGE_BUCKET
} from "$env/static/public";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { initializeApp } from "firebase/app";

const throwIfUnset = (name: string, value: any) => {
    if (value == null) throw new Error(`${name} environment variable missing`);
};

throwIfUnset(PUBLIC_FIREBASE_API_KEY, 'PUBLIC_FIREBASE_API_KEY');
throwIfUnset(PUBLIC_FIREBASE_AUTH_DOMAIN, 'PUBLIC_FIREBASE_AUTH_DOMAIN');
throwIfUnset(PUBLIC_FIREBASE_PROJECT_ID, 'PUBLIC_FIREBASE_PROJECT_ID');
throwIfUnset(PUBLIC_FIREBASE_DATABASE_URL, 'PUBLIC_FIREBASE_DATABASE_URL');
throwIfUnset(PUBLIC_FIREBASE_STORAGE_BUCKET, 'PUBLIC_FIREBASE_STORAGE_BUCKET');
throwIfUnset(PUBLIC_FIREBASE_MESSAGING_SENDER_ID, 'PUBLIC_FIREBASE_MESSAGING_SENDER_ID');
throwIfUnset(PUBLIC_FIREBASE_APP_ID, 'PUBLIC_FIREBASE_APP_ID');

const firebaseConfig = {
    apiKey: PUBLIC_FIREBASE_API_KEY,
    authDomain: PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: PUBLIC_FIREBASE_PROJECT_ID,
    firebaseUrl: PUBLIC_FIREBASE_DATABASE_URL,
    storageBucket: PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: PUBLIC_FIREBASE_APP_ID,
};

export const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const googleAuthProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

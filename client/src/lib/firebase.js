import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Check if Firebase config is complete
const missingVars = [];
if (!firebaseConfig.apiKey || firebaseConfig.apiKey === "your_api_key") missingVars.push("VITE_FIREBASE_API_KEY");
if (!firebaseConfig.authDomain || firebaseConfig.authDomain.includes("your_project")) missingVars.push("VITE_FIREBASE_AUTH_DOMAIN");
if (!firebaseConfig.projectId || firebaseConfig.projectId === "your_project_id") missingVars.push("VITE_FIREBASE_PROJECT_ID");

if (missingVars.length > 0) {
  console.error("Missing or incomplete Firebase config variables:", missingVars);
  console.error("Please check your .env file in the client directory");
}

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);


import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

let dbInstance: Firestore | null = null;
let isInitialized = false;

export function initializeFirebase(): Firestore | null {
  if (isInitialized) return dbInstance;
  isInitialized = true;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    console.warn("⚠️ Firebase configuration missing in environment. Fallback backup datastore will operate in mock/disabled mode unless credentials are provided.");
    return null;
  }

  // Handle escaped newline characters in private key string if present
  if (privateKey && privateKey.includes("\\n")) {
    privateKey = privateKey.replace(/\\n/g, "\n");
  }

  try {
    if (!getApps().length) {
      const appOptions: Record<string, any> = {
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      };
      if (process.env.FIREBASE_DATABASE_URL) {
        appOptions.databaseURL = process.env.FIREBASE_DATABASE_URL;
      }
      initializeApp(appOptions);
    }

    const databaseId = process.env.FIREBASE_DATABASE_ID;
    if (databaseId && databaseId !== "(default)") {
      dbInstance = getFirestore(databaseId);
    } else {
      dbInstance = getFirestore();
    }

    try {
      dbInstance.settings({ ignoreUndefinedProperties: true });
    } catch (e) {
      // Ignore setting if already initialized
    }

    console.log("🔥 Firebase Admin SDK initialized successfully");
    return dbInstance;
  } catch (error) {
    console.error("❌ Firebase Admin SDK initialization error:", error instanceof Error ? error.message : error);
    dbInstance = null;
    return null;
  }
}

export function getFirestoreDb(): Firestore | null {
  if (!isInitialized) {
    return initializeFirebase();
  }
  return dbInstance;
}

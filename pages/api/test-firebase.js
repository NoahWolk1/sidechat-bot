// Next.js API route handler for testing Firebase connection
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export default async function handler(req, res) {
  // Basic debugging information
  const diagnosticInfo = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'unknown',
    firebase: {
      config: {
        hasApiKey: !!firebaseConfig.apiKey,
        hasAuthDomain: !!firebaseConfig.authDomain,
        hasProjectId: !!firebaseConfig.projectId,
        hasStorageBucket: !!firebaseConfig.storageBucket,
        hasMessagingSenderId: !!firebaseConfig.messagingSenderId,
        hasAppId: !!firebaseConfig.appId,
        projectId: firebaseConfig.projectId || 'not_set',
      }
    }
  };
  
  try {
    console.log('Initializing Firebase for test...');
    
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    diagnosticInfo.firebase.initialized = true;
    
    console.log('Firebase initialized, testing document access...');
    
    // Try to read a test document
    const testDocRef = doc(db, "test", "firebase-test");
    const testDocSnap = await getDoc(testDocRef);
    
    if (testDocSnap.exists()) {
      console.log('Test document exists:', testDocSnap.data());
      diagnosticInfo.firebase.documentExists = true;
      diagnosticInfo.firebase.documentData = testDocSnap.data();
    } else {
      console.log('Test document does not exist, creating it...');
      
      // Create test document
      const testData = {
        created: new Date().toISOString(),
        message: 'Firebase connection test',
        environment: process.env.NODE_ENV || 'unknown'
      };
      
      await setDoc(testDocRef, testData);
      diagnosticInfo.firebase.documentCreated = true;
      diagnosticInfo.firebase.documentData = testData;
    }
    
    return res.status(200).json({
      success: true,
      message: 'Firebase connection successful',
      diagnosticInfo
    });
    
  } catch (error) {
    console.error('Firebase test error:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Firebase connection failed',
      error: {
        message: error.message,
        code: error.code,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      diagnosticInfo
    });
  }
}

// Combined Firebase test endpoint that tries both client SDK and Admin SDK approaches
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import admin from 'firebase-admin';

// Firebase client configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'sidechat-bot-host',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Function to initialize Firebase Admin SDK
function initFirebaseAdmin() {
  if (!admin.apps.length) {
    try {
      // Check if using direct JSON or environment variables
      let credential;
      
      if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
        // Use JSON string from environment variable
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
        credential = admin.credential.cert(serviceAccount);
      } else {
        // Use individual environment variables
        credential = admin.credential.cert({
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'sidechat-bot-host',
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
        });
      }
      
      admin.initializeApp({
        credential,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'sidechat-bot-host'
      });
      console.log('Firebase Admin initialized successfully');
      return true;
    } catch (error) {
      console.error('Firebase Admin initialization error:', error);
      return false;
    }
  }
  return true;
}

export default async function handler(req, res) {
  // Basic diagnostic information
  const diagnosticInfo = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'unknown',
    runtime: process.env.VERCEL ? 'vercel' : 'local',
    firebase: {
      clientConfig: {
        hasApiKey: !!firebaseConfig.apiKey,
        hasAuthDomain: !!firebaseConfig.authDomain,
        hasProjectId: !!firebaseConfig.projectId,
        hasStorageBucket: !!firebaseConfig.storageBucket,
        hasMessagingSenderId: !!firebaseConfig.messagingSenderId,
        hasAppId: !!firebaseConfig.appId,
        projectId: firebaseConfig.projectId
      },
      adminConfig: {
        hasProjectId: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        hasClientEmail: !!process.env.FIREBASE_CLIENT_EMAIL,
        hasPrivateKey: !!process.env.FIREBASE_PRIVATE_KEY,
        hasServiceAccountJson: !!process.env.FIREBASE_SERVICE_ACCOUNT_JSON
      }
    },
    tests: {
      client: { attempted: false, success: false },
      admin: { attempted: false, success: false }
    }
  };
  
  // Test results
  const results = {
    client: null,
    admin: null
  };
  
  // Test Firebase Client SDK
  try {
    console.log('Testing Firebase Client SDK connection...');
    diagnosticInfo.tests.client.attempted = true;
    
    // Initialize Firebase client
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    diagnosticInfo.firebase.clientInitialized = true;
    
    // Try to read a test document
    const testDocRef = doc(db, "test", "client-test");
    const testDocSnap = await getDoc(testDocRef);
    
    if (testDocSnap.exists()) {
      console.log('Client test document exists:', testDocSnap.data());
      diagnosticInfo.tests.client.documentExists = true;
      diagnosticInfo.tests.client.documentData = testDocSnap.data();
    } else {
      console.log('Client test document does not exist, creating it...');
      
      // Create test document
      const testData = {
        created: new Date().toISOString(),
        message: 'Firebase client connection test',
        environment: process.env.NODE_ENV || 'unknown'
      };
      
      await setDoc(testDocRef, testData);
      diagnosticInfo.tests.client.documentCreated = true;
      diagnosticInfo.tests.client.documentData = testData;
    }
    
    diagnosticInfo.tests.client.success = true;
    results.client = { success: true, message: 'Firebase client connection successful' };
    
  } catch (clientError) {
    console.error('Firebase Client SDK test error:', clientError);
    results.client = { 
      success: false, 
      message: 'Firebase client connection failed',
      error: clientError.message,
      code: clientError.code || 'unknown'
    };
  }
  
  // Test Firebase Admin SDK
  try {
    console.log('Testing Firebase Admin SDK connection...');
    diagnosticInfo.tests.admin.attempted = true;
    
    const adminInitialized = initFirebaseAdmin();
    diagnosticInfo.firebase.adminInitialized = adminInitialized;
    
    if (!adminInitialized) {
      results.admin = {
        success: false,
        message: 'Firebase Admin initialization failed'
      };
    } else {
      // Try to read a test document
      const db = admin.firestore();
      const testDoc = await db.collection('test').doc('admin-test').get();
      
      if (testDoc.exists) {
        diagnosticInfo.tests.admin.documentExists = true;
        diagnosticInfo.tests.admin.documentData = testDoc.data();
      } else {
        // Create test document
        const testData = {
          created: new Date().toISOString(),
          message: 'Firebase Admin connection test',
          environment: process.env.NODE_ENV || 'unknown'
        };
        
        await db.collection('test').doc('admin-test').set(testData);
        diagnosticInfo.tests.admin.documentCreated = true;
        diagnosticInfo.tests.admin.documentData = testData;
      }
      
      diagnosticInfo.tests.admin.success = true;
      results.admin = { success: true, message: 'Firebase Admin connection successful' };
    }
    
  } catch (adminError) {
    console.error('Firebase Admin test error:', adminError);
    results.admin = { 
      success: false, 
      message: 'Firebase Admin connection failed',
      error: adminError.message,
      code: adminError.code || 'unknown'
    };
  }
  
  // Determine overall status
  const overallSuccess = results.client?.success || results.admin?.success;
  
  return res.status(overallSuccess ? 200 : 500).json({
    success: overallSuccess,
    message: overallSuccess 
      ? 'At least one Firebase connection method succeeded' 
      : 'All Firebase connection methods failed',
    results,
    diagnosticInfo
  });
}

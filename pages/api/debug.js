// Debug API endpoint to help troubleshoot Firebase and other issues
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, collection, getDocs } from 'firebase/firestore';
import firebaseConfig from '../../lib/firebaseConfig';

export default async function handler(req, res) {
  // Basic security - only available in development or with a debug token
  const isDevMode = process.env.NODE_ENV === 'development';
  const hasValidToken = req.headers['x-debug-token'] === process.env.DEBUG_TOKEN;
  
  if (!isDevMode && !hasValidToken) {
    return res.status(403).json({ 
      error: 'Forbidden',
      message: 'Debug endpoint is only available in development mode or with a valid debug token'
    });
  }
  
  // Collect debug information
  const debugInfo = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    nodeVersion: process.version,
    environmentVariables: {
      // Check presence of critical environment variables
      hasPhoneNumber: !!process.env.PHONE_NUMBER,
      hasGroupId: !!process.env.GROUP_ID,
      hasGeminiApiKey: !!process.env.GEMINI_API_KEY,
      hasSidechatToken: !!process.env.SIDECHAT_TOKEN,
      hasWebhookToken: !!process.env.WEBHOOK_TOKEN,
      // Firebase config presence
      hasFirebaseApiKey: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      hasFirebaseAuthDomain: !!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      hasFirebaseProjectId: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      hasFirebaseStorageBucket: !!process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      hasFirebaseMessagingSenderId: !!process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      hasFirebaseAppId: !!process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    },
    firebase: {
      config: {
        // Safe version of config (no secrets)
        projectId: firebaseConfig.projectId || 'not_set',
        authDomain: firebaseConfig.authDomain || 'not_set',
        storageBucket: firebaseConfig.storageBucket || 'not_set',
        hasApiKey: !!firebaseConfig.apiKey,
        hasAppId: !!firebaseConfig.appId,
      }
    },
    vercel: {
      // Vercel-specific environment info
      isVercel: !!process.env.VERCEL,
      environment: process.env.VERCEL_ENV,
      region: process.env.VERCEL_REGION,
      url: process.env.VERCEL_URL,
    }
  };
  
  // Try to connect to Firebase and get data
  try {
    console.log('Testing Firebase connection...');
    
    const app = initializeApp(firebaseConfig, 'debugApp');
    const db = getFirestore(app);
    
    // Check if bot state exists
    const stateDocRef = doc(db, "bot", "state");
    const stateDocSnap = await getDoc(stateDocRef);
    
    debugInfo.firebase.connection = 'success';
    debugInfo.firebase.stateDocExists = stateDocSnap.exists();
    
    if (stateDocSnap.exists()) {
      const data = stateDocSnap.data();
      // Include non-sensitive parts of the state
      debugInfo.firebase.botState = {
        running: data.running,
        postType: data.postType,
        hasDelayRange: !!data.delayRange,
        lastUpdated: data.updatedAt,
        lastRun: data.lastRun
      };
    }
    
    // Try to list collections
    const collections = await getDocs(collection(db, "bot"));
    debugInfo.firebase.collectionsCount = collections.docs.length;
    
  } catch (error) {
    console.error('Firebase test failed:', error);
    debugInfo.firebase.connection = 'failed';
    debugInfo.firebase.error = {
      message: error.message,
      code: error.code,
      stack: isDevMode ? error.stack : undefined
    };
  }
  
  return res.status(200).json(debugInfo);
}

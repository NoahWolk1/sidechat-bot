// Test Firebase connection using Firebase Admin SDK
import admin from 'firebase-admin';

// Function to initialize Firebase Admin if not already initialized
function initFirebaseAdmin() {
  if (!admin.apps.length) {
    // Initialize using environment variables
    try {
      console.log('Initializing Firebase Admin SDK...');
      
      // Check if using direct JSON or environment variables
      let credential;
      
      if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
        // Use JSON string from environment variable
        console.log('Using FIREBASE_SERVICE_ACCOUNT_JSON for authentication');
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
        credential = admin.credential.cert(serviceAccount);
      } else {
        // Use individual environment variables
        console.log('Using individual environment variables for authentication');
        const certConfig = {
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'sidechat-bot-host',
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
        };
        
        console.log('Cert config:', {
          projectId: certConfig.projectId,
          hasClientEmail: !!certConfig.clientEmail,
          hasPrivateKey: !!certConfig.privateKey,
          privateKeyLength: certConfig.privateKey ? certConfig.privateKey.length : 0
        });
        
        credential = admin.credential.cert(certConfig);
      }
      
      admin.initializeApp({
        credential,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'sidechat-bot-host'
      });
      console.log('Firebase Admin initialized successfully');
      return true;
    } catch (error) {
      console.error('Firebase Admin initialization error:', error);
      console.error('Error stack:', error.stack);
      return false;
    }
  }
  return true;
}

export default async function handler(req, res) {
  const diagnosticInfo = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'unknown',
    firebase: {
      config: {
        hasProjectId: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        hasClientEmail: !!process.env.FIREBASE_CLIENT_EMAIL,
        hasPrivateKey: !!process.env.FIREBASE_PRIVATE_KEY,
        hasServiceAccountJson: !!process.env.FIREBASE_SERVICE_ACCOUNT_JSON,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'sidechat-bot-host'
      }
    }
  };
  
  try {
    const initialized = initFirebaseAdmin();
    diagnosticInfo.firebase.adminInitialized = initialized;
    
    if (!initialized) {
      return res.status(500).json({
        success: false,
        message: 'Firebase Admin initialization failed',
        diagnosticInfo
      });
    }
    
    // Try to read a test document
    const db = admin.firestore();
    const testDoc = await db.collection('test').doc('admin-test').get();
    
    if (testDoc.exists) {
      diagnosticInfo.firebase.documentExists = true;
      diagnosticInfo.firebase.documentData = testDoc.data();
    } else {
      // Create test document
      const testData = {
        created: new Date().toISOString(),
        message: 'Firebase Admin connection test',
        environment: process.env.NODE_ENV || 'unknown'
      };
      
      await db.collection('test').doc('admin-test').set(testData);
      diagnosticInfo.firebase.documentCreated = true;
      diagnosticInfo.firebase.documentData = testData;
    }
    
    return res.status(200).json({
      success: true,
      message: 'Firebase Admin connection successful',
      diagnosticInfo
    });
    
  } catch (error) {
    console.error('Firebase Admin test error:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Firebase Admin connection failed',
      error: {
        message: error.message,
        code: error.code || 'unknown',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      diagnosticInfo
    });
  }
}

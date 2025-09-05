// A simplified API for Firebase operations using Admin SDK
import admin from 'firebase-admin';

// Initialize Firebase Admin if not already initialized
function initFirebaseAdmin() {
  if (admin.apps.length) {
    return admin.firestore();
  }
  
  try {
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
    
    return admin.firestore();
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
    throw new Error(`Firebase Admin initialization failed: ${error.message}`);
  }
}

// API Handler
export default async function handler(req, res) {
  try {
    const { action, data } = req.body;
    
    // Initialize Firebase Admin
    const db = initFirebaseAdmin();
    
    // Handle different actions
    switch (action) {
      case 'get':
        const { collection, document } = data;
        const docRef = await db.collection(collection).doc(document).get();
        
        if (docRef.exists) {
          return res.status(200).json({
            success: true,
            data: docRef.data()
          });
        } else {
          return res.status(404).json({
            success: false,
            message: 'Document not found'
          });
        }
        
      case 'set':
        const { collection: setCollection, document: setDocument, value } = data;
        await db.collection(setCollection).doc(setDocument).set(value);
        return res.status(200).json({
          success: true,
          message: 'Document successfully written'
        });
        
      case 'update':
        const { collection: updateCollection, document: updateDocument, value: updateValue } = data;
        await db.collection(updateCollection).doc(updateDocument).update(updateValue);
        return res.status(200).json({
          success: true,
          message: 'Document successfully updated'
        });
        
      case 'delete':
        const { collection: deleteCollection, document: deleteDocument } = data;
        await db.collection(deleteCollection).doc(deleteDocument).delete();
        return res.status(200).json({
          success: true,
          message: 'Document successfully deleted'
        });
        
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid action'
        });
    }
  } catch (error) {
    console.error('Firebase operation error:', error);
    return res.status(500).json({
      success: false,
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

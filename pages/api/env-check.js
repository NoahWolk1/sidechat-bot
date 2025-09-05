// Simple API endpoint for environment variable checking
export default async function handler(req, res) {
  // Get Firebase-related environment variables
  const envVars = {
    // Firebase Client SDK
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? "✓" : "✗",
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? "✓" : "✗",
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? "✓" : "✗",
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ? "✓" : "✗",
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ? "✓" : "✗",
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? "✓" : "✗",
    
    // Firebase Admin SDK
    FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL ? "✓" : "✗",
    FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY ? "✓" : "✗",
    FIREBASE_SERVICE_ACCOUNT_JSON: process.env.FIREBASE_SERVICE_ACCOUNT_JSON ? "✓" : "✗",
  };
  
  // Get runtime environment
  const runtimeInfo = {
    NODE_ENV: process.env.NODE_ENV || 'unknown',
    isVercel: !!process.env.VERCEL,
    timestamp: new Date().toISOString(),
    platform: process.platform,
    versions: {
      node: process.version,
      nextJs: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ? 'Vercel build' : 'Unknown'
    }
  };
  
  // Return environment status
  res.status(200).json({
    status: "ok",
    environmentVariables: envVars,
    runtime: runtimeInfo
  });
}

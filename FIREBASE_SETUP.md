# Firebase Setup Instructions

To properly set up Firebase integration for this project, follow these steps:

## 1. Creating a Firebase Service Account Key

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Select the "sidechat-bot-host" project
3. Click on the ⚙️ icon (Settings) in the top left, then select "Project settings"
4. Go to the "Service accounts" tab
5. Click "Generate new private key"
6. Save the downloaded JSON file as `firebase-service-account.json` in the root of this project
   (Note: This file contains sensitive credentials and should NEVER be committed to version control)

## 2. Setting Up Local Environment Variables

Create a `.env.local` file in the root of the project with the following variables:

```
# Firebase Client SDK Variables
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=sidechat-bot-host
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin SDK Variables
# These will be automatically set if you use the deploy.sh script
FIREBASE_CLIENT_EMAIL=from_your_service_account_json
FIREBASE_PRIVATE_KEY=from_your_service_account_json
```

## 3. Deploying to Vercel

For deploying to Vercel with all required environment variables:

1. Make sure you have the service account key file in the root directory
2. Run the deployment script:

```
./deploy.sh
```

This script will:
- Extract the necessary credentials from your service account key file
- Set up the required environment variables in Vercel
- Deploy the project to production

If you prefer to set up the environment variables manually in the Vercel dashboard:

1. Go to your project in the [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on "Settings" > "Environment Variables"
3. Add all the environment variables listed above

## 4. Testing the Firebase Connection

After deployment, you can test the Firebase connection by visiting:

```
https://your-vercel-domain.vercel.app/api/firebase-dual-test
```

This will test both the Firebase Client SDK and Admin SDK connections and return detailed diagnostic information.

# Sidechat Bot Controller

A web-based control panel for automating posts to Sidechat. Built with Next.js and Firebase for persistent state management across multiple users.

## Features

- 🤖 Automated posting to Sidechat with customizable content
- 🌐 Web-based control panel with real-time status updates
- 🔄 Schedule posts with customizable delay intervals
- ⏱️ Set start/stop times for automated operation
- 🔥 Firebase integration for persistent state across users
- ⚙️ Serverless architecture with Vercel deployment and scheduled execution

## Local Development

```bash
# Install dependencies
npm install

# Create a .env.local file with your environment variables
cp .env.local.example .env.local
# Edit .env.local with your actual values

# Run the development server
npm run dev
```

## Firebase Setup

1. Create a new Firebase project at [firebase.google.com](https://firebase.google.com/) or use the existing "sidechat-bot-host" project
2. Generate a service account key:
   - Go to Project Settings > Service Accounts
   - Click "Generate New Private Key"
   - Save the JSON file as `firebase-service-account.json` in the project root
3. Enable Firestore database if not already enabled
4. Firestore will automatically create this structure when the app runs:
   - Collection: `bot`
     - Document: `state` (will be created automatically)
     - Document: `config` (will be created automatically)

## Deployment to Vercel

This project is designed to be deployed on Vercel. There are two methods:

### Automated Deployment (Recommended)

1. Make sure you have the `firebase-service-account.json` file in your project root
2. Install Vercel CLI if you haven't already:
   ```bash
   npm install -g vercel
   ```
3. Link your project to Vercel:
   ```bash
   vercel link
   ```
4. Run the deployment script:
   ```bash
   ./deploy.sh
   ```

The deployment script will automatically:
- Extract credentials from your service account key file
- Set up all required environment variables in Vercel
- Deploy the project to production

### Manual Deployment

1. Push your code to a GitHub repository
2. Connect the repository to Vercel
3. Configure the following environment variables in Vercel:

```
# Sidechat Credentials
PHONE_NUMBER=your_phone_number
GROUP_ID=target_group_id
GEMINI_API_KEY=your_gemini_api_key
SIDECHAT_TOKEN=your_sidechat_token
WEBHOOK_TOKEN=random_secure_token_for_webhook_access

# Firebase Client SDK Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id

# Firebase Admin SDK Configuration
FIREBASE_CLIENT_EMAIL=from_your_service_account_json
FIREBASE_PRIVATE_KEY=from_your_service_account_json
# Alternatively, you can set the entire service account JSON:
FIREBASE_SERVICE_ACCOUNT_JSON=your_entire_service_account_json
```

## State Management with Firebase

Instead of relying on local file system for state (which doesn't work well in serverless environments), this app uses Firebase Firestore for:

1. Bot state management (running status, configuration)
2. Real-time updates across multiple users
3. Persistent logs and history

This ensures that:
- Any user can see the current bot status
- State persists across serverless function executions
- Multiple users can control the bot from different devices

## Automatic Execution with Vercel Cron

This project leverages Vercel's built-in Cron Jobs to automatically execute the bot:

1. The `vercel.json` file includes a cron configuration that runs once daily:
```json
{
  "crons": [
    {
      "path": "/api/webhook",
      "schedule": "0 0 * * *"
    }
  ]
}
```

2. The webhook endpoint `/api/webhook` is called automatically by Vercel
3. The webhook checks Firestore to determine if the bot should be active
4. The webhook will handle all posting and state management

### Note on Cron Frequency

The current configuration runs once per day (at midnight UTC) due to Vercel Hobby plan limitations. If you need more frequent executions:

1. Upgrade to Vercel Pro plan, then you can modify the cron schedule to run more frequently:
   ```json
   "schedule": "*/5 * * * *"  // Every 5 minutes
   ```

2. Alternatively, use an external service like UptimeRobot or Cron-job.org to ping your webhook endpoint more frequently.

## Testing Firebase Connection

After deployment, you can verify the Firebase connection using these test endpoints:

1. `/api/env-check` - Shows all environment variables (securely masked)
2. `/api/firebase-dual-test` - Tests both Firebase Client SDK and Admin SDK connections
3. `/api/firebase-admin-test` - Tests just the Admin SDK connection

If you encounter issues, check the error messages and verify your environment variables are set correctly.

## Security Considerations

- The webhook endpoint is protected by a token
- Use environment variables for all sensitive information
- Set appropriate Firebase security rules for your Firestore database

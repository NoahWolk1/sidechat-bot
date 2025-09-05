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

# Run the development server
npm run dev
```

## Firebase Setup

1. Create a new Firebase project at [firebase.google.com](https://firebase.google.com/)
2. Add a new Web app to your Firebase project
3. Enable Firestore database
4. Create a Firestore database with the following structure:
   - Collection: `bot`
     - Document: `state` (will be created automatically)
     - Document: `config` (will be created automatically)

## Deployment to Vercel

This project is designed to be deployed on Vercel. Follow these steps:

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

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
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

1. The `vercel.json` file includes a cron configuration that runs every 5 minutes:
```json
{
  "crons": [
    {
      "path": "/api/webhook",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

2. The webhook endpoint `/api/webhook` is called automatically by Vercel
3. The webhook checks Firestore to determine if the bot should be active

No need to set up an external cron service anymore!

## Security Considerations

- The webhook endpoint is protected by a token
- Use environment variables for all sensitive information
- Set appropriate Firebase security rules for your Firestore database

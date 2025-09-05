#!/bin/bash

# Script to deploy Firestore security rules
echo "Deploying Firestore security rules..."

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null
then
  echo "Firebase CLI is not installed. Installing it now..."
  npm install -g firebase-tools
fi

# Login to Firebase if not already logged in
firebase use --add sidechat-bot-host

# Deploy the security rules
firebase deploy --only firestore:rules

echo "Firestore rules deployed successfully!"

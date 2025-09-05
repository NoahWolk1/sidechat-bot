#!/bin/bash

# Script to deploy to Vercel with Firebase service account
echo "Preparing to deploy to Vercel with Firebase configuration..."

# Since the project is already linked to Vercel, we'll skip the project ID check
echo "Vercel project is already configured."

# Set Firebase environment variables
echo "Setting up Firebase environment variables..."

# Check for service account key file
if [ -f "./firebase-service-account.json" ]; then
  echo "Found service account key file."
  
  # Extract values from the service account JSON
  PROJECT_ID=$(cat ./firebase-service-account.json | jq -r '.project_id')
  CLIENT_EMAIL=$(cat ./firebase-service-account.json | jq -r '.client_email')
  PRIVATE_KEY=$(cat ./firebase-service-account.json | jq -r '.private_key')
  
  # Set these values in Vercel
  echo "Setting Firebase service account credentials in Vercel..."
  vercel env add NEXT_PUBLIC_FIREBASE_PROJECT_ID production "$PROJECT_ID"
  vercel env add FIREBASE_CLIENT_EMAIL production "$CLIENT_EMAIL"
  vercel env add FIREBASE_PRIVATE_KEY production "$PRIVATE_KEY"
  
  # Set entire JSON as an environment variable (alternative approach)
  SERVICE_ACCOUNT_JSON=$(cat ./firebase-service-account.json)
  vercel env add FIREBASE_SERVICE_ACCOUNT_JSON production "$SERVICE_ACCOUNT_JSON"
  
  echo "Firebase service account credentials set successfully."
else
  echo "Warning: firebase-service-account.json not found."
  echo "You will need to manually set the following environment variables:"
  echo "- NEXT_PUBLIC_FIREBASE_PROJECT_ID"
  echo "- FIREBASE_CLIENT_EMAIL"
  echo "- FIREBASE_PRIVATE_KEY"
  echo "- FIREBASE_SERVICE_ACCOUNT_JSON (optional)"
fi

# Deploy to production
echo "Deploying to production..."
vercel deploy --prod

echo "Deployment completed!"

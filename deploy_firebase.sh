#!/bin/bash
# Firebase Deployment Script

echo "Starting Firebase deployment..."

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "Installing Firebase CLI..."
    npm install -g firebase-tools
fi

# Login to Firebase
echo "Logging into Firebase..."
firebase login

# Initialize project if needed
if [ ! -f "firebase.json" ]; then
    echo "Initializing Firebase project..."
    firebase init
fi

# Deploy hosting
echo "Deploying to Firebase Hosting..."
firebase deploy --only hosting

# Deploy functions (if they exist)
if [ -d "functions" ]; then
    echo "Deploying Firebase Functions..."
    firebase deploy --only functions
fi

echo "Deployment complete!"

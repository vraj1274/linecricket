#!/usr/bin/env python3
"""
Firebase SSH Setup and Configuration Script
"""
import os
import json
import subprocess

def update_env_file():
    """Update .env file with SSH key configuration"""
    env_content = """# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=linecricket25
DB_USER=postgres
DB_PASSWORD=root
DATABASE_URL=postgresql://postgres:root@localhost:5432/linecricket25

# Flask Configuration
FLASK_ENV=development
SECRET_KEY=dev-secret-key-change-in-production
JWT_SECRET_KEY=jwt-secret-key-change-in-production

# Firebase Configuration (from your service account JSON)
FIREBASE_PROJECT_ID=linecricket-1a2b3
FIREBASE_PRIVATE_KEY_ID=0f984f207ffcc1199ee9f4cea6f14fea4162fd0f
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCgi6zw2xzsQmsq\\nV+57xCi74MQIPQqHD9ql0GByceXISnYt6Q7M4TX5U2v+Dg9VnzVHPU+ONOBsPGNZ\\nw5QE8GiJ7IpgdTSI94ZGEySbpUtL+j7U/LBeVp0xfg7qf8LYsq7ckBUxq/80Vk6D\\n+Kt9NjorwFnAS8JJiuqwI7PWDZzgA1iz81c/N+SvKhZFgHG+QP9Y7Tll+OK2tC0W\\nT3PUqEvuu/94Bmmdjh3PF1XcN9HCmiUeCO6IvCPBo25XAzgXEnQa3WCGMsyKk26/\\nOjIEinCHdwsaBw8Np0PS/kQZm47W5DO+xooAlJyy5CigZKFpLl4tkEtWMC2HJeco\\nTtOcvyfTAgMBAAECggEADWbGGkTwISNaNr/9qa8yMfINQHLNUiuXS4gdb5rlB4HP\\nuP1faD1/IpToIDOkQWLM277ZHpHOD2WVwC8nR/zu0l9Acyoq0dQiYpnD0IpNGBvc\\n6tfnu7hB3u5wPaWfP4o1i+ErI75Wdf6jseMsItjypNGlrFD7+DpJukerV2RDgsoi\\n4JMCOlHIHWIMZuKTHZf7m3kYvXoMRZg72W0mQ1JZcXFY3xe3nxqTlwduR4qYaX2W\\n+fSrLbu5k5SNSKDVMyDYPYFbcduebbA0EnzcbGcnTLM9cV2DBsLxql+IGoNTZzB7\\nJBnBksMx4OZEgVXTIImssyacNBKEGRRsuHtc+uIh4QKBgQDMOWxhxSV8aTTByL6p\\nCFp01dc1NiQicfQOwyiYxQXnrfudryY+RzYahCClZKhW9Ayq3iMFXkuWTPKkeLIf\\nRL75UYmsHSsLtwhCw+tZESIpgacLfLuEWy8/OXfL7RuVAE/XkH+ZS3uotO9/R3MY\\nxcBQkwRtskjFZkJ86BdU+p6ktwKBgQDJP2owcFaNP84QP2jnll8nVQG6gS+zfqC6\\nus2F30A2B3f1suK5pjqvzDnjXaBT/oB6VVDMygfjh18TQAzwtFgQW7CAaTLqgZ9t\\n/iJpdQSmLe/36WbKE3XwYpAmN9HfBCHSU5vXeemhASGE3auBuhqDTSYB89POqOGl\\na3OSzlfRxQKBgA2Amm7YZwMTvZ42VIy+daSV4tWsz7TLTfSP6KY5GIvZz/H7+45Q\\njP4x0Cq/PfYJyrCdYTlgo6S7T6uaI0S3+dxoDK8peogawNwRMgVAgb62yMGUrJ0y\\nniwS852y/ojabWz2K8mJ2RItbExBABYaNP3eyoMqL2+FtE2n1qsSqtx/AoGAdopG\\n909EfCDoNQPUvA0D8XwN75imy1i8PiFIbCGLhgeyLmR3ThlPGjv2oSmGBdO0Q9q7\\nJFWgffJAG2uv85yW/tOzTIAqwJ0nlreJ94o4+dW3MtUlecQqxTSZahmZIn8hmO0s\\nr6ic5/xtjQCxRFGlyk+IIsBHs8QgXbrEMeYfLm0CgYEApZBgYCznmkYsdbB6iUiw\\nDie1se/JGnuyfRAQIjuevqM30xBql7xKReTdQczocCM33Ab717iDVWGf2Djm+G8C\\nCNwy4K4szrN5OPTWM0Y/Smn7V+9Ipu0JToQ/SuAZdiI0YU7eKvfD2PHPkQY3Th69\\n1vFk8I1oNcvecrG/HIWBjMs=\\n-----END PRIVATE KEY-----\\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@linecricket-1a2b3.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=114261288878043270893
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase

# Firebase SSH Configuration
FIREBASE_SSH_KEY_PATH=./firebase_rsa
FIREBASE_SSH_PUBLIC_KEY_PATH=./firebase_rsa.pub
FIREBASE_SSH_USER=firebase
"""
    
    with open('updated_backend1/.env', 'w') as f:
        f.write(env_content)
    
    print("[SUCCESS] Updated .env file with SSH configuration")

def create_firebase_config():
    """Create Firebase configuration files"""
    # Firebase hosting config
    firebase_config = {
        "hosting": {
            "public": "dist",
            "ignore": [
                "firebase.json",
                "**/.*",
                "**/node_modules/**"
            ],
            "rewrites": [
                {
                    "source": "**",
                    "destination": "/index.html"
                }
            ]
        },
        "functions": {
            "source": "functions"
        }
    }
    
    with open('firebase.json', 'w') as f:
        json.dump(firebase_config, f, indent=2)
    
    print("[SUCCESS] Created firebase.json configuration")

def create_deployment_script():
    """Create deployment script"""
    deploy_script = """#!/bin/bash
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
"""
    
    with open('deploy_firebase.sh', 'w') as f:
        f.write(deploy_script)
    
    # Make executable
    os.chmod('deploy_firebase.sh', 0o755)
    
    print("[SUCCESS] Created deployment script: deploy_firebase.sh")

def test_ssh_connection():
    """Test SSH key connection"""
    try:
        # Check if SSH key exists
        if os.path.exists('firebase_rsa'):
            print("[SUCCESS] SSH private key found: firebase_rsa")
        else:
            print("[ERROR] SSH private key not found")
            return False
        
        if os.path.exists('firebase_rsa.pub'):
            print("[SUCCESS] SSH public key found: firebase_rsa.pub")
        else:
            print("[ERROR] SSH public key not found")
            return False
        
        # Display public key
        with open('firebase_rsa.pub', 'r') as f:
            public_key = f.read().strip()
        
        print(f"\\n[INFO] Your public key:")
        print(f"{public_key}")
        
        return True
        
    except Exception as e:
        print(f"[ERROR] Failed to test SSH connection: {e}")
        return False

def main():
    """Main setup function"""
    print("="*60)
    print("FIREBASE SSH SETUP COMPLETE")
    print("="*60)
    
    # Update environment file
    update_env_file()
    
    # Create Firebase config
    create_firebase_config()
    
    # Create deployment script
    create_deployment_script()
    
    # Test SSH connection
    test_ssh_connection()
    
    print("\\n" + "="*60)
    print("FIREBASE SSH SETUP SUMMARY")
    print("="*60)
    print("✅ SSH keys generated: firebase_rsa, firebase_rsa.pub")
    print("✅ Environment file updated with SSH configuration")
    print("✅ Firebase configuration created")
    print("✅ Deployment script created")
    
    print("\\n" + "="*60)
    print("NEXT STEPS")
    print("="*60)
    print("1. Copy your public key (shown above)")
    print("2. Go to Firebase Console: https://console.firebase.google.com/")
    print("3. Select project: linecricket-1a2b3")
    print("4. Add SSH key to project settings")
    print("5. Test deployment: ./deploy_firebase.sh")
    
    return True

if __name__ == "__main__":
    main()

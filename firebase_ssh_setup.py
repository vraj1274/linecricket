#!/usr/bin/env python3
"""
Firebase SSH Key Setup Guide and Configuration
"""
import os
import subprocess
import json
from pathlib import Path

def check_firebase_cli():
    """Check if Firebase CLI is installed"""
    try:
        result = subprocess.run(['firebase', '--version'], capture_output=True, text=True)
        if result.returncode == 0:
            print(f"[SUCCESS] Firebase CLI installed: {result.stdout.strip()}")
            return True
        else:
            print("[ERROR] Firebase CLI not found")
            return False
    except FileNotFoundError:
        print("[ERROR] Firebase CLI not installed")
        return False

def install_firebase_cli():
    """Install Firebase CLI"""
    print("Installing Firebase CLI...")
    try:
        # Install via npm
        subprocess.run(['npm', 'install', '-g', 'firebase-tools'], check=True)
        print("[SUCCESS] Firebase CLI installed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"[ERROR] Failed to install Firebase CLI: {e}")
        return False

def generate_ssh_key():
    """Generate SSH key for Firebase"""
    ssh_dir = Path.home() / '.ssh'
    ssh_dir.mkdir(exist_ok=True)
    
    key_path = ssh_dir / 'firebase_rsa'
    
    if key_path.exists():
        print(f"[INFO] SSH key already exists at {key_path}")
        return str(key_path)
    
    try:
        # Generate SSH key
        subprocess.run([
            'ssh-keygen', '-t', 'rsa', '-b', '4096', '-f', str(key_path), '-N', ''
        ], check=True)
        print(f"[SUCCESS] SSH key generated at {key_path}")
        return str(key_path)
    except subprocess.CalledProcessError as e:
        print(f"[ERROR] Failed to generate SSH key: {e}")
        return None

def get_public_key(key_path):
    """Get the public key content"""
    try:
        with open(f"{key_path}.pub", 'r') as f:
            return f.read().strip()
    except FileNotFoundError:
        print(f"[ERROR] Public key not found at {key_path}.pub")
        return None

def setup_firebase_project():
    """Setup Firebase project configuration"""
    print("\n" + "="*60)
    print("FIREBASE PROJECT SETUP")
    print("="*60)
    
    # Check if firebase.json exists
    if os.path.exists('firebase.json'):
        print("[INFO] Firebase project already initialized")
        return True
    
    try:
        # Initialize Firebase project
        subprocess.run(['firebase', 'init'], check=True)
        print("[SUCCESS] Firebase project initialized")
        return True
    except subprocess.CalledProcessError as e:
        print(f"[ERROR] Failed to initialize Firebase project: {e}")
        return False

def create_firebase_config():
    """Create Firebase configuration files"""
    config = {
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
        json.dump(config, f, indent=2)
    
    print("[SUCCESS] Firebase configuration created")

def create_ssh_setup_guide():
    """Create SSH setup guide"""
    guide_content = """
# Firebase SSH Key Setup Guide

## 1. Generate SSH Key (if not already done)
```bash
ssh-keygen -t rsa -b 4096 -f ~/.ssh/firebase_rsa -N ""
```

## 2. Add SSH Key to Firebase
1. Go to Firebase Console: https://console.firebase.google.com/
2. Select your project: linecricket-1a2b3
3. Go to Project Settings > Service Accounts
4. Click "Generate new private key" if needed
5. Or go to Authentication > Sign-in method > SSH keys

## 3. For Firebase Hosting SSH Access
```bash
# Add your SSH key to Firebase
firebase login
firebase use --add

# Deploy with SSH
firebase deploy --only hosting
```

## 4. For Firebase Functions SSH Access
```bash
# Initialize functions
firebase init functions

# Deploy functions
firebase deploy --only functions
```

## 5. SSH Key Management
```bash
# List SSH keys
ssh-add -l

# Add SSH key to agent
ssh-add ~/.ssh/firebase_rsa

# Test SSH connection
ssh -T git@github.com  # If using GitHub integration
```

## 6. Environment Variables for SSH
Add to your .env file:
```
FIREBASE_SSH_KEY_PATH=~/.ssh/firebase_rsa
FIREBASE_PROJECT_ID=linecricket-1a2b3
FIREBASE_SSH_USER=firebase
```

## 7. Python Firebase Admin with SSH
```python
import firebase_admin
from firebase_admin import credentials
import os

# Initialize with service account
cred = credentials.Certificate('path/to/service-account.json')
firebase_admin.initialize_app(cred)
```

## 8. Troubleshooting
- Ensure SSH key has proper permissions (600)
- Check Firebase project permissions
- Verify SSH agent is running
- Test SSH connection manually
"""
    
    with open('FIREBASE_SSH_SETUP_GUIDE.md', 'w') as f:
        f.write(guide_content)
    
    print("[SUCCESS] SSH setup guide created: FIREBASE_SSH_SETUP_GUIDE.md")

def main():
    """Main setup function"""
    print("="*60)
    print("FIREBASE SSH KEY SETUP")
    print("="*60)
    
    # Check Firebase CLI
    if not check_firebase_cli():
        print("\nInstalling Firebase CLI...")
        if not install_firebase_cli():
            print("[ERROR] Cannot proceed without Firebase CLI")
            return False
    
    # Generate SSH key
    print("\nGenerating SSH key...")
    key_path = generate_ssh_key()
    if not key_path:
        print("[ERROR] Failed to generate SSH key")
        return False
    
    # Get public key
    public_key = get_public_key(key_path)
    if public_key:
        print(f"\n[SUCCESS] Public key generated:")
        print(f"{public_key}")
        print(f"\n[INFO] Add this key to your Firebase project settings")
    
    # Create configuration files
    print("\nCreating Firebase configuration...")
    create_firebase_config()
    create_ssh_setup_guide()
    
    print("\n" + "="*60)
    print("NEXT STEPS")
    print("="*60)
    print("1. Copy the public key above")
    print("2. Go to Firebase Console: https://console.firebase.google.com/")
    print("3. Select your project: linecricket-1a2b3")
    print("4. Add the SSH key to your project settings")
    print("5. Run: firebase login")
    print("6. Run: firebase use --add")
    print("7. Test deployment: firebase deploy --only hosting")
    
    return True

if __name__ == "__main__":
    main()

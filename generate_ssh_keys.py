#!/usr/bin/env python3
"""
Generate SSH keys for Firebase authentication
"""
import os
import subprocess
import base64
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.backends import default_backend

def generate_ssh_key_pair():
    """Generate SSH key pair using cryptography library"""
    try:
        # Generate private key
        private_key = rsa.generate_private_key(
            public_exponent=65537,
            key_size=4096,
            backend=default_backend()
        )
        
        # Get public key
        public_key = private_key.public_key()
        
        # Serialize private key
        private_pem = private_key.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.PKCS8,
            encryption_algorithm=serialization.NoEncryption()
        )
        
        # Serialize public key in OpenSSH format
        public_ssh = public_key.public_bytes(
            encoding=serialization.Encoding.OpenSSH,
            format=serialization.PublicFormat.OpenSSH
        )
        
        # Write private key
        with open('firebase_rsa', 'wb') as f:
            f.write(private_pem)
        
        # Write public key
        with open('firebase_rsa.pub', 'wb') as f:
            f.write(public_ssh)
        
        # Set proper permissions (600 for private key)
        os.chmod('firebase_rsa', 0o600)
        os.chmod('firebase_rsa.pub', 0o644)
        
        print("[SUCCESS] SSH key pair generated successfully!")
        print("Private key: firebase_rsa")
        print("Public key: firebase_rsa.pub")
        
        return True
        
    except ImportError:
        print("[ERROR] cryptography library not installed")
        print("Installing cryptography...")
        try:
            subprocess.run(['pip', 'install', 'cryptography'], check=True)
            print("[SUCCESS] cryptography installed")
            return generate_ssh_key_pair()  # Retry
        except subprocess.CalledProcessError:
            print("[ERROR] Failed to install cryptography")
            return False
    except Exception as e:
        print(f"[ERROR] Failed to generate SSH keys: {e}")
        return False

def display_public_key():
    """Display the public key for copying"""
    try:
        with open('firebase_rsa.pub', 'r') as f:
            public_key = f.read().strip()
        
        print("\n" + "="*60)
        print("YOUR FIREBASE SSH PUBLIC KEY")
        print("="*60)
        print(public_key)
        print("="*60)
        print("\nCopy this key and add it to your Firebase project settings")
        
        return public_key
    except FileNotFoundError:
        print("[ERROR] Public key file not found")
        return None

def create_firebase_ssh_instructions():
    """Create instructions for Firebase SSH setup"""
    instructions = """
# Firebase SSH Key Setup Instructions

## 1. Your SSH Keys Have Been Generated
- Private key: firebase_rsa (keep this secure!)
- Public key: firebase_rsa.pub (add this to Firebase)

## 2. Add SSH Key to Firebase Console
1. Go to: https://console.firebase.google.com/
2. Select your project: linecricket-1a2b3
3. Go to Project Settings (gear icon)
4. Click on "Service accounts" tab
5. Look for SSH keys section or Authentication settings
6. Add your public key (firebase_rsa.pub content)

## 3. Alternative: Firebase CLI Setup
```bash
# Install Firebase CLI (if not installed)
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize project
firebase init

# Add SSH key to Firebase
firebase use --add
```

## 4. For Firebase Hosting
```bash
# Deploy with SSH authentication
firebase deploy --only hosting
```

## 5. For Firebase Functions
```bash
# Initialize functions
firebase init functions

# Deploy functions
firebase deploy --only functions
```

## 6. Environment Variables
Add to your .env file:
```
FIREBASE_SSH_KEY_PATH=./firebase_rsa
FIREBASE_PROJECT_ID=linecricket-1a2b3
FIREBASE_SSH_USER=firebase
```

## 7. Python Integration
```python
import os
import firebase_admin
from firebase_admin import credentials

# Initialize Firebase with service account
cred = credentials.Certificate('path/to/service-account.json')
firebase_admin.initialize_app(cred)
```

## 8. Security Notes
- Keep your private key (firebase_rsa) secure
- Never commit private keys to version control
- Use environment variables for sensitive data
- Regularly rotate SSH keys

## 9. Troubleshooting
- Ensure SSH key has proper permissions (600)
- Check Firebase project permissions
- Verify SSH agent is running
- Test SSH connection manually
"""
    
    with open('FIREBASE_SSH_INSTRUCTIONS.md', 'w') as f:
        f.write(instructions)
    
    print("[SUCCESS] Instructions saved to FIREBASE_SSH_INSTRUCTIONS.md")

def main():
    """Main function"""
    print("="*60)
    print("FIREBASE SSH KEY GENERATOR")
    print("="*60)
    
    # Generate SSH keys
    if generate_ssh_key_pair():
        # Display public key
        public_key = display_public_key()
        
        # Create instructions
        create_firebase_ssh_instructions()
        
        print("\n" + "="*60)
        print("NEXT STEPS")
        print("="*60)
        print("1. Copy the public key above")
        print("2. Go to Firebase Console: https://console.firebase.google.com/")
        print("3. Select your project: linecricket-1a2b3")
        print("4. Add the SSH key to your project settings")
        print("5. Test the connection")
        
        return True
    else:
        print("[ERROR] Failed to generate SSH keys")
        return False

if __name__ == "__main__":
    main()

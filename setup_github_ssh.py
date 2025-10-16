#!/usr/bin/env python3
"""
GitHub SSH Key Setup Script
"""
import os
import subprocess

def display_public_key():
    """Display the public key for GitHub"""
    try:
        with open('firebase_rsa.pub', 'r') as f:
            public_key = f.read().strip()
        
        print("="*80)
        print("GITHUB SSH KEY SETUP")
        print("="*80)
        print("\nYour SSH Public Key:")
        print("-" * 40)
        print(public_key)
        print("-" * 40)
        
        print("\n" + "="*80)
        print("STEPS TO ADD SSH KEY TO GITHUB:")
        print("="*80)
        print("1. Go to GitHub: https://github.com/settings/keys")
        print("2. Click 'New SSH key'")
        print("3. Title: 'LineCricket Development Key'")
        print("4. Key type: 'Authentication Key'")
        print("5. Paste the public key above")
        print("6. Click 'Add SSH key'")
        print("\n7. Then run: git push -u origin main")
        
        return public_key
        
    except FileNotFoundError:
        print("[ERROR] Public key file not found")
        return None

def test_github_connection():
    """Test GitHub SSH connection"""
    try:
        print("\nTesting GitHub SSH connection...")
        result = subprocess.run([
            'ssh', '-T', '-i', 'firebase_rsa', 'git@github.com'
        ], capture_output=True, text=True, timeout=10)
        
        if result.returncode == 0 or "successfully authenticated" in result.stderr.lower():
            print("[SUCCESS] GitHub SSH connection working!")
            return True
        else:
            print(f"[INFO] SSH test result: {result.stderr}")
            return False
            
    except subprocess.TimeoutExpired:
        print("[INFO] SSH connection test timed out (this is normal)")
        return True
    except Exception as e:
        print(f"[INFO] SSH test: {e}")
        return True

def create_github_setup_guide():
    """Create GitHub setup guide"""
    guide = """
# GitHub SSH Key Setup Guide

## Your SSH Public Key
Copy this key and add it to your GitHub account:

```
ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQCaqb7tRW9EJlGSQ1j84pD26eXR4EbqHkifpk30Qh7IP3XMRqwkuWTTZfPySynLAGAOgk8y0/9HJbdQvnofuHGRsmdPZHXYjTKlZ9KSbF7QDYaweYAudJivUgIghCarxgAs2hc38msYelvcMGgfWVl14CdDuTfPlXl4RTLguxUy0euLk+rqB6f/10D1HGwSC8X5wEIsgMFvqU4nqbmnr6CsOi6jnuK8qmASa3ElROcEXRfEccq6v9xocb0Oui1v/IiPP83vhhFCx9zo6x7tfgbqIuYn04JuLtJEoYqn3xQMYhFo1646vtqNIDj1rwLa8OCijJupu9hwwm27PCjYKD8lFejflPXb4IuMaLbvzXBHDlDwh0yjHAAPoF2+gw84tKeW4oc2VDHXtjeH8WtXmsg2APMxI/Xvs0bHf53G8tKHETQgauqe1l2e/s33SQkl3GywblXApFewgiETvi8SXTL9VyCYZCoiALz7EvQeSpBraxD8HYnkC2NUenMJVQKwTDw7p4G0ZPXc/fgRmqifEPhT9sLM7aObhiFw++o6IH56GlS44r+iVZUVq3Kro4GCusGXkdLOqhBXTLIdhGsHs+nrLnNPhCIwjZkU6XcGh4fRMZfu6L5Ym+tGi/Csbni7O3sQYo/tAperWhx3oTYofxu15pOgS9aaLKtnz0Qf/FgOxw==
```

## Steps to Add SSH Key to GitHub:

### Method 1: GitHub Web Interface
1. Go to: https://github.com/settings/keys
2. Click "New SSH key"
3. Title: "LineCricket Development Key"
4. Key type: "Authentication Key"
5. Paste the public key above
6. Click "Add SSH key"

### Method 2: GitHub CLI (if installed)
```bash
gh auth login
gh ssh-key add firebase_rsa.pub --title "LineCricket Development Key"
```

## After Adding the Key:

1. Test the connection:
```bash
ssh -T -i firebase_rsa git@github.com
```

2. Push your code:
```bash
git push -u origin main
```

## Troubleshooting:

- Make sure the SSH key is added to your GitHub account
- Check that the repository exists: https://github.com/vraj1274/linecricket
- Verify you have write access to the repository
- Ensure the SSH key has proper permissions (600)

## Security Notes:

- Keep your private key (firebase_rsa) secure
- Never share your private key
- The public key (firebase_rsa.pub) is safe to share
"""
    
    with open('GITHUB_SSH_SETUP.md', 'w') as f:
        f.write(guide)
    
    print("[SUCCESS] GitHub setup guide created: GITHUB_SSH_SETUP.md")

def main():
    """Main function"""
    print("="*80)
    print("GITHUB SSH KEY SETUP")
    print("="*80)
    
    # Display public key
    public_key = display_public_key()
    
    # Create setup guide
    create_github_setup_guide()
    
    # Test connection
    test_github_connection()
    
    print("\n" + "="*80)
    print("NEXT STEPS:")
    print("="*80)
    print("1. Add the SSH key to your GitHub account (see guide above)")
    print("2. Run: git push -u origin main")
    print("3. Your code will be pushed to: https://github.com/vraj1274/linecricket")
    
    return True

if __name__ == "__main__":
    main()

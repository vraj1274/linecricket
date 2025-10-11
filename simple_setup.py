#!/usr/bin/env python3
"""
Simple Setup Script for TheLineCricket
"""

import os
import sys
import subprocess
from pathlib import Path

def run_command(command, cwd=None):
    """Run a command and return success status"""
    try:
        result = subprocess.run(
            command, 
            cwd=cwd, 
            shell=True, 
            capture_output=True, 
            text=True
        )
        if result.returncode == 0:
            print(f"[OK] {command}")
            return True
        else:
            print(f"[ERROR] {command} - {result.stderr}")
            return False
    except Exception as e:
        print(f"[ERROR] {e}")
        return False

def main():
    """Main setup function"""
    print("=" * 60)
    print("TheLineCricket Project Setup")
    print("=" * 60)
    
    # Check if we're in the right directory
    if not Path("back12").exists() or not Path("webfront2").exists():
        print("[ERROR] Please run this script from the thelinecricket root directory")
        return False
    
    print("\n[STEP 1] Setting up Backend...")
    backend_path = Path("back12/back1/back")
    
    # Install Python dependencies
    print("Installing Python dependencies...")
    if not run_command("pip install -r requirements.txt", cwd=backend_path):
        print("[WARNING] Failed to install some dependencies, but continuing...")
    
    # Set up database
    print("Setting up database...")
    if not run_command("python setup_database.py", cwd=backend_path):
        print("[WARNING] Database setup failed, but continuing...")
    
    print("\n[STEP 2] Setting up Frontend...")
    frontend_path = Path("webfront2")
    
    # Install Node.js dependencies
    print("Installing Node.js dependencies...")
    if not run_command("npm install", cwd=frontend_path):
        print("[ERROR] Failed to install frontend dependencies")
        return False
    
    print("\n[STEP 3] Creating startup scripts...")
    
    # Create startup scripts
    backend_script = """@echo off
echo Starting TheLineCricket Backend...
cd back12\\back1\\back
python run_backend.py
pause
"""
    
    frontend_script = """@echo off
echo Starting TheLineCricket Frontend...
cd webfront2
npm run dev
pause
"""
    
    with open("start_backend.bat", "w") as f:
        f.write(backend_script)
    
    with open("start_frontend.bat", "w") as f:
        f.write(frontend_script)
    
    print("\n" + "=" * 60)
    print("Setup Complete!")
    print("=" * 60)
    print("\nTo start the application:")
    print("1. Run start_backend.bat to start the backend")
    print("2. Run start_frontend.bat to start the frontend")
    print("3. Open http://localhost:3000 in your browser")
    print("\nBackend API: http://localhost:5000")
    print("Database: PostgreSQL on localhost:5432/linecricket")
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)






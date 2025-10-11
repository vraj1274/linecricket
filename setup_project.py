#!/usr/bin/env python3
"""
TheLineCricket Project Setup Script
This script sets up the entire project including database, backend, and frontend
"""

import os
import sys
import subprocess
import time
import threading
from pathlib import Path

def print_header(title):
    """Print a formatted header"""
    print("\n" + "=" * 60)
    print(f"[SETUP] {title}")
    print("=" * 60)

def print_step(step, description):
    """Print a step with status"""
    print(f"\n[STEP {step}] {description}")

def run_command(command, cwd=None, shell=True):
    """Run a command and return success status"""
    try:
        result = subprocess.run(
            command, 
            cwd=cwd, 
            shell=shell, 
            capture_output=True, 
            text=True,
            timeout=300  # 5 minute timeout
        )
        if result.returncode == 0:
            print(f"[OK] Command successful: {command}")
            return True
        else:
            print(f"[ERROR] Command failed: {command}")
            print(f"   Error: {result.stderr}")
            return False
    except subprocess.TimeoutExpired:
        print(f"[TIMEOUT] Command timed out: {command}")
        return False
    except Exception as e:
        print(f"[ERROR] Command error: {e}")
        return False

def check_prerequisites():
    """Check if required software is installed"""
    print_step(1, "Checking Prerequisites")
    
    # Check Python
    if not run_command("python --version"):
        print("[ERROR] Python is not installed or not in PATH")
        return False
    
    # Check Node.js
    if not run_command("node --version"):
        print("[ERROR] Node.js is not installed or not in PATH")
        return False
    
    # Check npm
    if not run_command("npm --version"):
        print("[ERROR] npm is not installed or not in PATH")
        return False
    
    # Check PostgreSQL (try to connect)
    if not run_command("psql --version"):
        print("[WARNING] PostgreSQL client not found, but continuing...")
    
    print("[OK] Prerequisites check completed")
    return True

def setup_backend():
    """Set up the backend"""
    print_step(2, "Setting up Backend")
    
    backend_path = Path("back12/back1/back")
    
    if not backend_path.exists():
        print("❌ Backend directory not found")
        return False
    
    # Install Python dependencies
    print("📦 Installing Python dependencies...")
    if not run_command("pip install -r requirements.txt", cwd=backend_path):
        return False
    
    # Set up database
    print("🗄️  Setting up database...")
    if not run_command("python setup_database.py", cwd=backend_path):
        print("⚠️  Database setup failed, but continuing...")
    
    print("✅ Backend setup completed")
    return True

def setup_frontend():
    """Set up the frontend"""
    print_step(3, "Setting up Frontend")
    
    frontend_path = Path("webfront2")
    
    if not frontend_path.exists():
        print("❌ Frontend directory not found")
        return False
    
    # Install Node.js dependencies
    print("📦 Installing Node.js dependencies...")
    if not run_command("npm install", cwd=frontend_path):
        return False
    
    print("✅ Frontend setup completed")
    return True

def create_startup_scripts():
    """Create startup scripts for easy development"""
    print_step(4, "Creating Startup Scripts")
    
    # Backend startup script
    backend_script = """@echo off
echo 🚀 Starting TheLineCricket Backend...
cd back12\\back1\\back
python run_backend.py
pause
"""
    
    with open("start_backend.bat", "w") as f:
        f.write(backend_script)
    
    # Frontend startup script
    frontend_script = """@echo off
echo 🚀 Starting TheLineCricket Frontend...
cd webfront2
npm run dev
pause
"""
    
    with open("start_frontend.bat", "w") as f:
        f.write(frontend_script)
    
    # Combined startup script
    combined_script = """@echo off
echo 🚀 Starting TheLineCricket Full Stack Application...
echo.
echo Starting Backend Server...
start "Backend" cmd /k "cd back12\\back1\\back && python run_backend.py"
echo.
echo Waiting 5 seconds for backend to start...
timeout /t 5 /nobreak > nul
echo.
echo Starting Frontend Server...
start "Frontend" cmd /k "cd webfront2 && npm run dev"
echo.
echo ✅ Both servers are starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
pause
"""
    
    with open("start_all.bat", "w") as f:
        f.write(combined_script)
    
    print("✅ Startup scripts created")
    return True

def test_connections():
    """Test the connections between components"""
    print_step(5, "Testing Connections")
    
    print("🔍 Testing database connection...")
    backend_path = Path("back12/back1/back")
    if run_command("python -c \"from app import app; print('Database connection OK')\"", cwd=backend_path):
        print("✅ Database connection successful")
    else:
        print("⚠️  Database connection test failed")
    
    print("🔍 Testing frontend build...")
    frontend_path = Path("webfront2")
    if run_command("npm run build", cwd=frontend_path):
        print("✅ Frontend build successful")
    else:
        print("⚠️  Frontend build test failed")
    
    return True

def main():
    """Main setup function"""
    print_header("TheLineCricket Project Setup")
    
    print("""
This script will set up your TheLineCricket project with:
- PostgreSQL database (linecricket on port 5432)
- Flask backend with migrations
- React frontend with Vite
- All necessary dependencies and configurations
""")
    
    input("Press Enter to continue...")
    
    # Check prerequisites
    if not check_prerequisites():
        print("\n❌ Prerequisites check failed. Please install required software.")
        return False
    
    # Setup backend
    if not setup_backend():
        print("\n❌ Backend setup failed.")
        return False
    
    # Setup frontend
    if not setup_frontend():
        print("\n❌ Frontend setup failed.")
        return False
    
    # Create startup scripts
    if not create_startup_scripts():
        print("\n❌ Failed to create startup scripts.")
        return False
    
    # Test connections
    test_connections()
    
    print_header("Setup Complete!")
    print("""
🎉 TheLineCricket project setup is complete!

📁 Project Structure:
   ├── back12/back1/back/     (Flask Backend)
   ├── webfront2/             (React Frontend)
   └── Database: linecricket  (PostgreSQL)

🚀 Quick Start:
   1. Double-click 'start_all.bat' to start both servers
   2. Or run individually:
      - Backend: start_backend.bat
      - Frontend: start_frontend.bat

🌐 Access Points:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Database: localhost:5432/linecricket

📚 Next Steps:
   1. Open http://localhost:3000 in your browser
   2. Create your first user account
   3. Start building your cricket community!

🔧 Troubleshooting:
   - Check PostgreSQL is running
   - Verify database credentials in back12/back1/back/config.env
   - Check firewall settings for ports 3000 and 5000
""")
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)

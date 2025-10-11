#!/usr/bin/env python3
"""
Start the Flask server with proper error handling
"""

import sys
import os
import traceback

def start_server():
    """Start the Flask server with error handling"""
    try:
        print("🚀 Starting TheLineCricket Backend Server...")
        print("=" * 50)
        
        # Add current directory to Python path
        sys.path.insert(0, os.getcwd())
        
        # Import and start the app
        from app import app
        
        print("✅ App imported successfully")
        print("🌐 Starting server on http://localhost:5000")
        print("📡 API endpoints available at:")
        print("   - GET  /api/matches - Get all matches")
        print("   - POST /api/matches - Create new match")
        print("   - GET  /api/matches/live - Get live matches")
        print("   - GET  /api/health - Health check")
        print("=" * 50)
        
        # Start the server
        app.run(
            host='0.0.0.0',
            port=5000,
            debug=True,
            use_reloader=False  # Disable reloader to avoid issues
        )
        
    except ImportError as e:
        print(f"❌ Import Error: {e}")
        print("🔧 Make sure you're in the correct directory")
        print("📁 Current directory:", os.getcwd())
        return False
        
    except Exception as e:
        print(f"❌ Server Error: {e}")
        print("🔍 Full traceback:")
        traceback.print_exc()
        return False

if __name__ == "__main__":
    start_server()

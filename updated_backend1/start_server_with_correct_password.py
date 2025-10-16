#!/usr/bin/env python3
"""
Start Flask server with correct database password
"""
import os
import sys

# Set the correct environment variables
os.environ['DB_PASSWORD'] = 'root'
os.environ['DATABASE_URL'] = 'postgresql://postgres:root@localhost:5432/linecricket25'
os.environ['FLASK_ENV'] = 'development'
os.environ['SECRET_KEY'] = 'dev-secret-key-change-in-production'
os.environ['JWT_SECRET_KEY'] = 'jwt-secret-key-change-in-production'

# Import and run the Flask app
from app import app

if __name__ == '__main__':
    print("Starting Flask server with correct database password...")
    print(f"Database URL: {os.environ.get('DATABASE_URL')}")
    app.run(debug=True, host='0.0.0.0', port=5000)

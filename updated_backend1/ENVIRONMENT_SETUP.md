# TheLineCricket Environment Setup Guide

## 🚀 Quick Start

### Option 1: Automated Setup
```bash
# Run the setup script
python setup_environment.py
```

### Option 2: Manual Setup
```bash
# Copy the environment template
cp environment_config.env .env

# Edit the .env file with your actual values
nano .env
```

## 📋 Environment Variables Explained

### 🔐 Authentication & Security

#### JWT Configuration
- `SECRET_KEY`: Flask application secret key (auto-generated)
- `JWT_SECRET_KEY`: JWT token signing key (auto-generated)
- `JWT_ACCESS_TOKEN_EXPIRES`: Access token expiration (3600 seconds)
- `JWT_REFRESH_TOKEN_EXPIRES`: Refresh token expiration (2592000 seconds)

#### Password Security
- `PASSWORD_MIN_LENGTH`: Minimum password length (8)
- `PASSWORD_REQUIRE_UPPERCASE`: Require uppercase letters (True)
- `PASSWORD_REQUIRE_LOWERCASE`: Require lowercase letters (True)
- `PASSWORD_REQUIRE_NUMBERS`: Require numbers (True)
- `PASSWORD_REQUIRE_SYMBOLS`: Require symbols (True)

### 🗄️ Database Configuration

#### PostgreSQL Settings
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=linecricket25
DB_USER=postgres
DB_PASSWORD=your_actual_password
DATABASE_URL=postgresql://postgres:password@localhost:5432/linecricket25
```

#### Test Database (Optional)
```env
TEST_DB_NAME=linecricket25_test
TEST_DB_URL=postgresql://postgres:password@localhost:5432/linecricket25_test
```

### 🔥 Firebase Configuration

#### Backend Admin SDK
```env
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY_HERE\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id
```

#### Frontend Configuration
```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

### 📧 Email Configuration

#### SMTP Settings
```env
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USE_TLS=true
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
FROM_EMAIL=noreply@thelinecricket.com
```

#### Gmail App Password Setup
1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password: Google Account → Security → App passwords
3. Use the generated password in `MAIL_PASSWORD`

### 🚀 Redis Configuration (Optional)

#### Local Redis
```env
REDIS_URL=redis://localhost:6379/0
```

#### Production Redis
```env
REDIS_URL=redis://username:password@host:port/database
```

### 🌐 CORS Configuration

#### Development
```env
CORS_ORIGINS=http://localhost:3000,http://localhost:5173,http://localhost:4173
```

#### Production
```env
CORS_ORIGINS=https://thelinecricket.com,https://www.thelinecricket.com
```

### 📁 File Upload Configuration

#### Local Storage
```env
UPLOAD_FOLDER=uploads
MAX_CONTENT_LENGTH=16777216
ALLOWED_EXTENSIONS=jpg,jpeg,png,gif,mp4,webm,pdf,doc,docx
```

#### AWS S3 (Optional)
```env
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET=thelinecricket-uploads
AWS_S3_REGION=us-east-1
```

### 📊 Monitoring & Logging

#### Logging
```env
LOG_LEVEL=INFO
LOG_FILE=logs/thelinecricket.log
LOG_MAX_SIZE=10485760
LOG_BACKUP_COUNT=5
```

#### Error Tracking (Optional)
```env
SENTRY_DSN=your-sentry-dsn
```

## 🔧 Setup Instructions

### 1. Database Setup
```bash
# Install PostgreSQL
# Create database
createdb linecricket25

# Run migrations
python init_database.py
```

### 2. Redis Setup (Optional)
```bash
# Install Redis
# Start Redis server
redis-server
```

### 3. Firebase Setup
1. Create Firebase project
2. Enable Authentication
3. Enable Firestore
4. Download service account key
5. Update Firebase variables in .env

### 4. Email Setup
1. Configure Gmail App Password
2. Update email variables in .env

### 5. Frontend Setup
1. Copy frontend environment variables to `webfront2/.env`
2. Update Firebase configuration
3. Update API base URL

## 🚨 Security Checklist

- [ ] Change all default passwords
- [ ] Generate new secret keys
- [ ] Configure proper CORS origins
- [ ] Set up HTTPS in production
- [ ] Configure rate limiting
- [ ] Set up monitoring
- [ ] Backup database regularly

## 🔍 Troubleshooting

### Common Issues

#### Database Connection
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Test connection
psql -h localhost -U postgres -d linecricket25
```

#### Redis Connection
```bash
# Check Redis status
redis-cli ping
```

#### Firebase Authentication
- Verify service account key format
- Check Firebase project configuration
- Ensure proper permissions

#### Email Sending
- Verify Gmail App Password
- Check SMTP settings
- Test with simple email

## 📚 Additional Resources

- [Flask Configuration](https://flask.palletsprojects.com/en/2.0.x/config/)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Redis Documentation](https://redis.io/documentation)

## 🆘 Support

If you encounter issues:
1. Check the logs: `tail -f logs/thelinecricket.log`
2. Verify all environment variables
3. Test database connectivity
4. Check Firebase configuration
5. Review CORS settings

# LineCricket Backend 🏏

A comprehensive Flask backend for the LineCricket social media platform with cricket-focused features.

## 🚀 Quick Start

### Windows Users:
```bash
# Double-click or run:
start_backend.bat
```

### Linux/Mac Users:
```bash
# Make executable and run:
chmod +x start_backend.sh
./start_backend.sh
```

### Manual Start:
```bash
# Install dependencies
pip install -r requirements.txt

# Start the server
python run_backend.py
```

## 📋 Features

### 🔐 Authentication & Users
- ✅ User registration and login
- ✅ JWT token authentication
- ✅ Password reset with OTP
- ✅ User profiles with cricket stats
- ✅ Experience and achievement tracking

### 📱 Social Media
- ✅ **Posts**: Text, image, video, poll posts
- ✅ **Engagement**: Like, bookmark, share, comment
- ✅ **Discovery**: Trending posts, hashtag filtering
- ✅ **Analytics**: Engagement scoring, view tracking
- ✅ **Content**: Hashtags, mentions, location tagging

### 💬 Messaging & Notifications
- ✅ **Real-time Messaging**: User-to-user conversations
- ✅ **Notifications**: Match, job, academic, connection alerts
- ✅ **Connections**: Friend requests and management
- ✅ **WebSocket Support**: Real-time communication

### 🏏 Cricket Features
- ✅ **Matches**: Create and join cricket matches
- ✅ **Tournaments**: Organize cricket tournaments
- ✅ **Player Stats**: Track performance metrics
- ✅ **Search**: Find players, matches, and content

## 🛠️ API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Password reset confirmation

### Social Media
- `POST /api/social/posts` - Create post
- `GET /api/social/posts` - Get posts with filtering
- `POST /api/social/posts/{id}/like` - Like/unlike post
- `POST /api/social/posts/{id}/bookmark` - Bookmark post
- `POST /api/social/posts/{id}/share` - Share post
- `POST /api/social/posts/{id}/comments` - Add comment
- `GET /api/social/posts/trending` - Get trending posts
- `GET /api/social/posts/hashtags/{hashtag}` - Get posts by hashtag

### Messaging
- `POST /api/messages/send` - Send message
- `GET /api/messages/{user_id}` - Get user messages
- `GET /api/messages/conversation/{other_user_id}` - Get conversation

### Notifications
- `POST /api/notifications/create` - Create notification
- `GET /api/notifications/{user_id}` - Get user notifications
- `PATCH /api/notifications/{id}/read` - Mark as read

### Connections
- `POST /api/connections/add` - Add connection
- `GET /api/connections/{user_id}` - Get user connections
- `DELETE /api/connections/{id}` - Remove connection

## 🗄️ Database

### Models
- **User**: User accounts and authentication
- **UserProfile**: Extended user information
- **Post**: Social media posts with engagement
- **Message**: User-to-user messaging
- **Notification**: System notifications
- **Connection**: User connections/friends
- **Match**: Cricket matches and tournaments

### Database Setup
The application uses PostgreSQL with the following configuration:
- **Host**: localhost
- **Port**: 5432
- **Database**: thelinecricket
- **User**: postgres
- **Password**: root

## 🔧 Configuration

### Environment Variables
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=thelinecricket
DB_USER=postgres
DB_PASSWORD=root

# Flask
FLASK_ENV=development
SECRET_KEY=your-secret-key
JWT_SECRET_KEY=your-jwt-secret

# Optional
DATABASE_URL=postgresql://postgres:root@localhost:5432/thelinecricket
```

## 🧪 Testing

### Run Tests
```bash
# Test backend startup
python test_backend_startup.py

# Test social media features
python test_social_media.py

# Test messaging system
python test_messaging_blueprints.py
```

### Test Coverage
- ✅ User authentication
- ✅ Social media posts and engagement
- ✅ Messaging and notifications
- ✅ Database connections
- ✅ API endpoints

## 📊 Database Migrations

### Create Migration
```bash
flask db migrate -m "Description of changes"
```

### Apply Migration
```bash
flask db upgrade
```

## 🚨 Troubleshooting

### Common Issues

1. **Import Errors**
   - Ensure all dependencies are installed: `pip install -r requirements.txt`
   - Check Python path and virtual environment

2. **Database Connection**
   - Verify PostgreSQL is running
   - Check database credentials in config.py
   - Ensure database exists

3. **Port Already in Use**
   - Change port in run_backend.py
   - Kill existing processes on port 5000

4. **Missing Dependencies**
   - Run `pip install -r requirements.txt`
   - Check Python version (3.8+ required)

### Logs
Check the console output for detailed error messages and stack traces.

## 🔄 Development

### Project Structure
```
back/
├── app.py                 # Main Flask application
├── run_backend.py         # Startup script
├── config.py             # Configuration settings
├── requirements.txt      # Python dependencies
├── models/               # Database models
│   ├── user.py          # User models
│   ├── post.py          # Post models
│   └── messaging_models.py # Messaging models
├── routes/               # API routes
│   ├── auth.py          # Authentication routes
│   ├── social_posts.py  # Social media routes
│   └── messaging_routes.py # Messaging routes
└── tests/               # Test files
```

### Adding New Features
1. Create model in `models/`
2. Add routes in `routes/`
3. Register blueprint in `app.py`
4. Add tests in `tests/`
5. Update API documentation

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review error logs
3. Test individual components
4. Verify database connectivity

---

**🎉 Your LineCricket backend is ready to power the cricket social media platform!**"# TheLineCricket_Web_Backend" 
"# TheLineCricket_Web_Backend" 

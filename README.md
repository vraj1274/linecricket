# TheLineCricket - Full Stack Cricket Community Platform

A comprehensive cricket community platform built with React frontend and Flask backend, connected to PostgreSQL database.

## 🏏 Project Overview

TheLineCricket is a social platform for cricket enthusiasts featuring:
- **User Profiles**: Player, Academy, Venue, and Community profiles
- **Match Management**: Create, join, and manage cricket matches
- **Social Features**: Posts, comments, likes, and messaging
- **Search & Discovery**: Advanced search with filters and trends
- **Real-time Features**: Live messaging and notifications
- **Admin Panel**: Comprehensive admin dashboard

## 🏗️ Architecture

```
Frontend (React + Vite)     Backend (Flask + SQLAlchemy)     Database (PostgreSQL)
┌─────────────────────┐    ┌─────────────────────────────┐    ┌─────────────────────┐
│  Port: 3000         │◄──►│  Port: 5000                 │◄──►│  Port: 5432         │
│  - React 18         │    │  - Flask 2.3.3              │    │  - linecricket DB   │
│  - TypeScript       │    │  - SQLAlchemy 2.0.21        │    │  - Migrations       │
│  - Tailwind CSS     │    │  - Flask-Migrate            │    │  - Real-time data   │
│  - Radix UI         │    │  - Socket.IO                │    │                     │
│  - Firebase Auth    │    │  - JWT Authentication       │    │                     │
└─────────────────────┘    └─────────────────────────────┘    └─────────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- **Python 3.8+** with pip
- **Node.js 16+** with npm
- **PostgreSQL 12+** running on localhost:5432
- **Git** for version control

### Automated Setup

1. **Clone and navigate to the project:**
   ```bash
   git clone <repository-url>
   cd thelinecricket
   ```

2. **Run the automated setup:**
   ```bash
   python setup_project.py
   ```

3. **Start the application:**
   ```bash
   # Option 1: Start both servers
   start_all.bat
   
   # Option 2: Start individually
   start_backend.bat    # Backend on port 5000
   start_frontend.bat   # Frontend on port 3000
   ```

4. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - API Documentation: http://localhost:5000

### Manual Setup

If you prefer manual setup:

#### Backend Setup

```bash
cd back12/back1/back

# Install dependencies
pip install -r requirements.txt

# Configure database
# Edit config.env with your PostgreSQL credentials

# Set up database
python setup_database.py

# Start backend
python run_backend.py
```

#### Frontend Setup

```bash
cd webfront2

# Install dependencies
npm install

# Start development server
npm run dev
```

## 📁 Project Structure

```
thelinecricket/
├── back12/back1/back/          # Flask Backend
│   ├── models/                 # Database models
│   ├── routes/                 # API routes
│   ├── services/               # Business logic
│   ├── migrations/             # Database migrations
│   ├── config.py              # Configuration
│   ├── app.py                 # Flask application
│   ├── setup_database.py      # Database setup script
│   └── run_backend.py         # Backend startup script
├── webfront2/                  # React Frontend
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── contexts/          # React contexts
│   │   ├── services/          # API services
│   │   ├── config/            # Configuration
│   │   └── types/             # TypeScript types
│   ├── package.json
│   └── vite.config.ts
├── setup_project.py           # Automated setup script
├── start_all.bat             # Start both servers
├── start_backend.bat         # Start backend only
├── start_frontend.bat        # Start frontend only
└── README.md                 # This file
```

## 🗄️ Database Schema

The application uses PostgreSQL with the following main entities:

- **Users**: Core user accounts with authentication
- **Player Profiles**: Detailed cricket player information
- **Profile Pages**: Academy, Venue, and Community profiles
- **Matches**: Cricket match management and participation
- **Posts**: Social media style posts and interactions
- **Messages**: Real-time messaging system
- **Notifications**: User notifications and preferences
- **Relationships**: Follow, block, and connection management

## 🔧 Configuration

### Backend Configuration

Edit `back12/back1/back/config.env`:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=linecricket
DB_USER=postgres
DB_PASSWORD=your_password

# Flask Configuration
FLASK_ENV=development
SECRET_KEY=your-secret-key
JWT_SECRET_KEY=your-jwt-secret
```

### Frontend Configuration

Edit `webfront2/src/config/environment.ts`:

```typescript
export const ENV = {
  API_BASE_URL: 'http://localhost:5000',
  // ... other configurations
};
```

## 🚀 Development

### Backend Development

```bash
cd back12/back1/back

# Run migrations
flask db upgrade

# Create new migration
flask db migrate -m "Description of changes"

# Run tests
python -m pytest

# Start development server
python run_backend.py
```

### Frontend Development

```bash
cd webfront2

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/firebase/login` - Firebase authentication

### User Management
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/search` - Search users

### Matches
- `GET /api/matches` - List matches
- `POST /api/matches` - Create match
- `GET /api/matches/{id}` - Get match details
- `POST /api/matches/{id}/join` - Join match

### Social Features
- `GET /api/posts` - List posts
- `POST /api/posts` - Create post
- `POST /api/posts/{id}/like` - Like post
- `POST /api/posts/{id}/comment` - Comment on post

### Messaging
- `GET /api/messaging/conversations` - List conversations
- `POST /api/messaging/conversations` - Create conversation
- `GET /api/messaging/messages/{conversation_id}` - Get messages
- `POST /api/messaging/messages` - Send message

## 🔒 Authentication

The application supports multiple authentication methods:

1. **JWT Authentication**: Traditional username/password
2. **Firebase Authentication**: Google, email/password
3. **AWS Cognito**: Enterprise authentication (optional)

## 🎨 Frontend Features

- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Component Library**: Radix UI components for consistency
- **State Management**: React Context for global state
- **Real-time Updates**: Socket.IO integration
- **Type Safety**: Full TypeScript support

## 🗄️ Database Migrations

The application uses Flask-Migrate (Alembic) for database migrations:

```bash
cd back12/back1/back

# Create migration
flask db migrate -m "Description"

# Apply migrations
flask db upgrade

# Rollback migration
flask db downgrade
```

## 🧪 Testing

### Backend Tests
```bash
cd back12/back1/back
python -m pytest tests/
```

### Frontend Tests
```bash
cd webfront2
npm test
```

## 🚀 Deployment

### Backend Deployment
1. Set production environment variables
2. Use a production WSGI server (Gunicorn)
3. Set up reverse proxy (Nginx)
4. Configure SSL certificates

### Frontend Deployment
1. Build production bundle: `npm run build`
2. Serve static files with a web server
3. Configure API endpoints for production

## 🔧 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check PostgreSQL is running
   - Verify credentials in config.env
   - Ensure database exists

2. **Frontend Can't Connect to Backend**
   - Check backend is running on port 5000
   - Verify CORS settings
   - Check firewall settings

3. **Migration Errors**
   - Check database permissions
   - Verify migration files are valid
   - Try rolling back and re-applying

### Logs

- Backend logs: Check console output
- Frontend logs: Browser developer tools
- Database logs: PostgreSQL log files

## 📚 Documentation

- [API Documentation](http://localhost:5000) - Interactive API docs
- [Database Schema](back12/back1/back/database_schema.sql) - Complete schema
- [Frontend Components](webfront2/src/components/) - Component documentation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review the API documentation

---

**Happy Cricket! 🏏**






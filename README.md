# LineCricket - Full Stack Cricket Application

A comprehensive cricket application with frontend, backend, and database integration.

## 🏏 Project Overview

LineCricket is a full-stack cricket application built with:
- **Frontend**: React with TypeScript, Vite
- **Backend**: Flask (Python) with PostgreSQL
- **Authentication**: Firebase Authentication
- **Database**: PostgreSQL 17.2
- **Deployment**: Firebase Hosting

## 🚀 Features

- User authentication and profiles
- Match management and tracking
- Social media integration
- Real-time messaging
- Advanced search functionality
- Community features
- Job postings and applications

## 📁 Project Structure

```
WebApplicationTesting/
├── updated_backend1/          # Flask Backend
│   ├── models/                # Database models
│   ├── routes/               # API routes
│   ├── services/             # Business logic
│   └── utils/                # Utility functions
├── webfront2/                # React Frontend
│   ├── src/                  # Source code
│   ├── components/           # React components
│   └── services/            # API services
└── docs/                     # Documentation
```

## 🛠️ Setup Instructions

### Prerequisites
- Python 3.13+
- Node.js 18+
- PostgreSQL 17.2
- Git

### Backend Setup
```bash
cd updated_backend1
pip install -r requirements.txt
python app.py
```

### Frontend Setup
```bash
cd webfront2
npm install
npm run dev
```

### Database Setup
```bash
# PostgreSQL connection
DB_HOST=localhost
DB_PORT=5432
DB_NAME=linecricket25
DB_USER=postgres
DB_PASSWORD=root
```

## 🔐 Authentication

- **Firebase Authentication**: Configured with service account
- **SSH Keys**: Generated for secure deployment
- **Environment Variables**: Secure configuration management

## 📊 Database Schema

The application includes 50+ tables covering:
- User management
- Match tracking
- Social features
- Messaging system
- Job postings
- Community features

## 🚀 Deployment

### Firebase Hosting
```bash
firebase login
firebase deploy --only hosting
```

### Backend Deployment
```bash
# Using SSH key authentication
./deploy_firebase.sh
```

## 🔧 Environment Configuration

Create a `.env` file with:
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=linecricket25
DB_USER=postgres
DB_PASSWORD=root

# Firebase
FIREBASE_PROJECT_ID=linecricket-1a2b3
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_client_email

# Flask
SECRET_KEY=your_secret_key
JWT_SECRET_KEY=your_jwt_secret
```

## 📱 API Endpoints

- `/api/health` - Health check
- `/api/posts` - Social posts
- `/api/matches` - Match management
- `/api/users` - User management
- `/api/messages` - Messaging
- `/api/search` - Search functionality

## 🛡️ Security

- SSH key authentication
- Environment variable protection
- Secure database connections
- Firebase security rules

## 📈 Development Status

- ✅ Backend API complete
- ✅ Database schema implemented
- ✅ Frontend React application
- ✅ Firebase authentication
- ✅ SSH deployment setup
- ✅ Full-stack integration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🔗 Links

- **Repository**: [https://github.com/vraj1274/linecricket](https://github.com/vraj1274/linecricket)
- **Live Demo**: Coming soon
- **Documentation**: See `/docs` folder

## 📞 Support

For support and questions, please open an issue in the repository.

---

**Built with ❤️ for the cricket community**
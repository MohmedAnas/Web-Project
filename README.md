# 🎓 RB Computer - Student Management System

A modern, full-stack student management system built with **Express.js** backend and **React** frontend, powered by **Google Sheets** as the database.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node.js](https://img.shields.io/badge/node.js-18+-green.svg)
![React](https://img.shields.io/badge/react-18+-blue.svg)
![Google Sheets](https://img.shields.io/badge/database-Google%20Sheets-green.svg)

## 🌟 Features

### 👨‍🎓 Student Management
- ✅ Student registration and profile management
- ✅ Course enrollment tracking
- ✅ Academic progress monitoring
- ✅ Bulk import/export functionality

### 📚 Course Management
- ✅ Course creation and scheduling
- ✅ Instructor assignment
- ✅ Fee structure management
- ✅ Course analytics and reporting

### 💰 Fee Management
- ✅ Fee calculation and tracking
- ✅ Payment processing and receipts
- ✅ Due date reminders
- ✅ Financial reporting

### 📊 Additional Features
- ✅ Attendance tracking
- ✅ Notice board system
- ✅ Certificate generation
- ✅ Real-time dashboard
- ✅ Role-based access control

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend │    │  Express.js API │    │  Google Sheets  │
│                 │◄──►│                 │◄──►│    Database     │
│   (Port 3000)   │    │   (Port 8000)   │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Google account
- Git

### 1. Clone Repository
```bash
git clone https://github.com/MohmedAnas/Web-Project.git
cd Web-Project
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.sheets.example .env
# Configure your Google Sheets credentials in .env
npm run setup-sheets --sample-data
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm start
```

### 4. Access Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Health Check**: http://localhost:8000/health

## 📁 Project Structure

```
RB-Computer/
├── 📁 backend/                 # Express.js API Server
│   ├── 📁 src/
│   │   ├── 📁 controllers/     # Business logic controllers
│   │   ├── 📁 services/        # Google Sheets services
│   │   ├── 📁 routes/          # API route definitions
│   │   ├── 📁 middleware/      # Custom middleware
│   │   └── 📁 utils/           # Utility functions
│   ├── 📄 server-sheets.js     # Main server file
│   └── 📄 package.json         # Dependencies
├── 📁 frontend/                # React Application
│   ├── 📁 src/
│   │   ├── 📁 components/      # Reusable components
│   │   ├── 📁 pages/           # Page components
│   │   ├── 📁 services/        # API services
│   │   └── 📁 utils/           # Utility functions
│   └── 📄 package.json         # Dependencies
├── 📁 docs/                    # Documentation
│   ├── 📁 setup/               # Setup guides
│   ├── 📁 guides/              # User guides
│   └── 📁 api/                 # API documentation
├── 📄 README.md                # This file
└── 📄 SECURITY.md              # Security guidelines
```

## 🔧 Configuration

### Environment Variables
Create `.env` file in backend directory:

```env
# Google Sheets Configuration
GOOGLE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----...
GOOGLE_PROJECT_ID=your-project-id
GOOGLE_SPREADSHEET_ID=your-spreadsheet-id

# Application Configuration
NODE_ENV=development
PORT=8000
JWT_SECRET=your-jwt-secret
FRONTEND_URL=http://localhost:3000
```

## 📊 Database Schema (Google Sheets)

| Worksheet | Purpose | Key Fields |
|-----------|---------|------------|
| **Students** | Student information | ID, Name, Email, Phone, Course |
| **Courses** | Course catalog | ID, Name, Duration, Fee, Instructor |
| **Fees** | Payment tracking | ID, Student ID, Amount, Status |
| **Attendance** | Daily attendance | ID, Student ID, Date, Status |
| **Notices** | Announcements | ID, Title, Content, Date |
| **Certificates** | Certificate records | ID, Student ID, Type, Issue Date |
| **Admins** | System administrators | ID, Name, Email, Role |

## 🛠️ Development

### Available Scripts

**Backend:**
```bash
npm run dev          # Start development server
npm run setup-sheets # Initialize Google Sheets
npm test            # Run tests
```

**Frontend:**
```bash
npm start           # Start development server
npm run build       # Build for production
npm test           # Run tests
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/students` | List all students |
| POST | `/api/students` | Create new student |
| GET | `/api/courses` | List all courses |
| POST | `/api/courses` | Create new course |
| GET | `/api/dashboard/stats` | Get dashboard statistics |

[📖 Full API Documentation](docs/api/README.md)

## 🚀 Deployment

### Backend (Render.com)
1. Connect GitHub repository
2. Set environment variables
3. Deploy automatically

### Frontend (Netlify)
1. Connect GitHub repository
2. Set build command: `npm run build`
3. Deploy automatically

[📖 Detailed Deployment Guide](docs/setup/DEPLOYMENT.md)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📖 [Setup Guide](docs/setup/GOOGLE_SHEETS_SETUP_GUIDE.md)
- 📋 [User Manual](docs/guides/MANUAL_TESTING_GUIDE.md)
- 🐛 [Report Issues](https://github.com/MohmedAnas/Web-Project/issues)

## 🎉 Acknowledgments

- Built with ❤️ for educational institutions
- Powered by Google Sheets for free, collaborative data management
- Modern React and Express.js architecture

---

**⭐ Star this repository if you find it helpful!**

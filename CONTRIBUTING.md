# 🤝 Contributing to RB Computer

Thank you for your interest in contributing to the RB Computer Student Management System! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Git
- Google account for Sheets API
- Basic knowledge of React and Express.js

### Development Setup
1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/Web-Project.git
   cd Web-Project
   ```
3. Install dependencies:
   ```bash
   # Backend
   cd backend && npm install
   
   # Frontend
   cd ../frontend && npm install
   ```
4. Set up environment variables (see setup guide)
5. Start development servers

## 📋 How to Contribute

### 1. Choose an Issue
- Check [existing issues](https://github.com/MohmedAnas/Web-Project/issues)
- Look for issues labeled `good first issue` or `help wanted`
- Comment on the issue to let others know you're working on it

### 2. Create a Branch
```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

### 3. Make Changes
- Write clean, readable code
- Follow existing code style
- Add comments for complex logic
- Update documentation if needed

### 4. Test Your Changes
```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test

# Manual testing
npm run dev
```

### 5. Commit Your Changes
```bash
git add .
git commit -m "feat: add new student search functionality"
```

**Commit Message Format:**
- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Maintenance tasks

### 6. Push and Create PR
```bash
git push origin feature/your-feature-name
```
Then create a Pull Request on GitHub.

## 🎯 Contribution Areas

### 🐛 Bug Fixes
- Fix existing issues
- Improve error handling
- Performance optimizations

### ✨ New Features
- Student management enhancements
- Course management features
- Dashboard improvements
- API endpoints

### 📖 Documentation
- Setup guides
- API documentation
- User manuals
- Code comments

### 🧪 Testing
- Unit tests
- Integration tests
- End-to-end tests
- Manual testing

## 📝 Code Style Guidelines

### JavaScript/React
- Use ES6+ features
- Prefer functional components with hooks
- Use meaningful variable names
- Add PropTypes for React components

### File Structure
```
src/
├── components/     # Reusable components
├── pages/         # Page components
├── services/      # API services
├── utils/         # Utility functions
└── styles/        # CSS files
```

### Naming Conventions
- **Files**: `camelCase.js` or `PascalCase.jsx`
- **Components**: `PascalCase`
- **Functions**: `camelCase`
- **Constants**: `UPPER_SNAKE_CASE`

## 🔍 Code Review Process

### What We Look For
- ✅ Code functionality and correctness
- ✅ Code style and consistency
- ✅ Performance implications
- ✅ Security considerations
- ✅ Documentation updates

### Review Timeline
- Initial review within 2-3 days
- Follow-up reviews within 1-2 days
- Merge after approval from maintainers

## 🚫 What Not to Contribute

- Breaking changes without discussion
- Code that doesn't follow style guidelines
- Features without proper testing
- Commits with sensitive data (API keys, passwords)

## 📞 Getting Help

### Communication Channels
- **Issues**: For bug reports and feature requests
- **Discussions**: For general questions and ideas
- **Email**: For sensitive matters

### Resources
- [Setup Guide](docs/setup/GOOGLE_SHEETS_SETUP_GUIDE.md)
- [API Documentation](docs/api/README.md)
- [Deployment Guide](docs/setup/DEPLOYMENT.md)

## 🏆 Recognition

Contributors will be:
- Listed in the README
- Mentioned in release notes
- Invited to join the maintainers team (for significant contributions)

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## 🙏 Thank You

Every contribution, no matter how small, helps make this project better. Thank you for taking the time to contribute!

---

**Happy Coding! 🚀**

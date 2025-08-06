# Security Policy

## 🔒 MongoDB Credentials Security

### ⚠️ IMPORTANT: Never commit MongoDB credentials to the repository

This repository has been configured to protect MongoDB connection strings and database credentials. JWT secrets and other configuration can be public since they're regenerated per deployment.

### 🛡️ Secure Configuration

#### **For Local Development:**
1. Copy `backend/.env.example` to `backend/.env`
2. Update `MONGODB_URI` with your local MongoDB connection
3. Update `MONGO_PASSWORD` for Docker development
4. The `.env` file is automatically ignored by git

#### **For Production Deployment:**
1. Set `MONGODB_URI` in your deployment platform (Render, Heroku, etc.)
2. Never commit actual MongoDB connection strings
3. Use your platform's environment variable system

### 🔑 Critical Environment Variables to Secure

#### **Database (NEVER COMMIT THESE)**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
MONGO_USERNAME=your-db-username
MONGO_PASSWORD=your-db-password
```

#### **Email Service (SECURE THESE)**
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

#### **Admin Account (SECURE IN PRODUCTION)**
```env
ADMIN_PASSWORD=your-secure-admin-password
```

#### **Public Configuration (OK to be in code)**
```env
JWT_SECRET=rbcomputer-jwt-secret-2024
JWT_REFRESH_SECRET=rbcomputer-refresh-secret-2024
PORT=8000
NODE_ENV=production
```

### 🚀 Deployment Platform Setup

#### **Render.com - Environment Variables**
Set these in your Render service dashboard:
```env
MONGODB_URI=your-mongodb-atlas-connection-string
ADMIN_PASSWORD=your-secure-admin-password
EMAIL_USER=your-production-email@gmail.com
EMAIL_PASS=your-gmail-app-password
```

#### **What's Safe to Keep Public:**
- JWT secrets (regenerated per deployment)
- Port numbers
- Feature flags
- API timeouts
- CORS domains
- File upload limits

### 🔍 MongoDB Atlas Security

#### **Connection String Format:**
```
mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
```

#### **Security Checklist:**
- [ ] Strong database user password (12+ characters)
- [ ] Network access configured (whitelist IPs)
- [ ] Database user has minimal required permissions
- [ ] Connection string never committed to git
- [ ] Regular password rotation

### 🚨 If MongoDB Credentials Are Exposed

If you accidentally commit MongoDB credentials:

1. **Immediately change the database password**
2. **Update connection string in deployment platform**
3. **Remove from git history if needed:**
   ```bash
   git filter-branch --force --index-filter \
   'git rm --cached --ignore-unmatch backend/.env' \
   --prune-empty --tag-name-filter cat -- --all
   ```

### ✅ Security Checklist

Before deploying:
- [ ] MongoDB URI set in deployment platform (not in code)
- [ ] Database password is strong and secure
- [ ] Email credentials configured securely
- [ ] Admin password is strong (production)
- [ ] No actual database credentials in repository

### 📞 MongoDB Atlas Support

For database security issues:
- MongoDB Atlas Support: [support.mongodb.com](https://support.mongodb.com)
- Atlas Security Best Practices: [docs.atlas.mongodb.com/security](https://docs.atlas.mongodb.com/security)

---

## 🛡️ Focus: Protect Database Credentials

The main security concern is MongoDB connection strings with embedded credentials. Everything else can be reasonably public for this educational project.

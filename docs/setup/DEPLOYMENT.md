# 🚀 Deployment Guide

## Overview
This guide covers deploying the RB Computer Student Management System to production.

## 🌐 Backend Deployment (Render.com)

### 1. Prepare Repository
- Ensure your code is pushed to GitHub
- Verify `package.json` has correct start script
- Check environment variables are properly configured

### 2. Create Render Service
1. Go to [render.com](https://render.com)
2. Connect your GitHub account
3. Select "New Web Service"
4. Choose your repository
5. Configure settings:
   - **Name**: `rbcomputer-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

### 3. Environment Variables
Add these in Render dashboard:
```env
NODE_ENV=production
PORT=8000
GOOGLE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----...
GOOGLE_PROJECT_ID=your-project-id
GOOGLE_SPREADSHEET_ID=your-spreadsheet-id
JWT_SECRET=your-production-jwt-secret
FRONTEND_URL=https://your-frontend-domain.netlify.app
```

### 4. Deploy
- Click "Create Web Service"
- Wait for deployment to complete
- Note your backend URL: `https://rbcomputer-backend.onrender.com`

## 🎨 Frontend Deployment (Netlify)

### 1. Prepare Frontend
Update `frontend/src/config/api.js`:
```javascript
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://rbcomputer-backend.onrender.com/api'
  : 'http://localhost:8000/api';
```

### 2. Create Netlify Site
1. Go to [netlify.com](https://netlify.com)
2. Connect GitHub account
3. Select "New site from Git"
4. Choose your repository
5. Configure build settings:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/build`

### 3. Environment Variables
Add in Netlify dashboard:
```env
REACT_APP_API_URL=https://rbcomputer-backend.onrender.com/api
```

### 4. Deploy
- Click "Deploy site"
- Wait for build to complete
- Your site will be available at: `https://your-site-name.netlify.app`

## 🔧 Custom Domain (Optional)

### Backend (Render)
1. Go to Settings → Custom Domains
2. Add your domain: `api.rbcomputer.com`
3. Update DNS records as instructed

### Frontend (Netlify)
1. Go to Domain settings
2. Add custom domain: `rbcomputer.com`
3. Configure DNS records

## 📊 Google Sheets Setup for Production

### 1. Service Account Permissions
Ensure your Google Sheets is shared with the service account email with "Editor" permissions.

### 2. API Quotas
- Google Sheets API: 100 requests per 100 seconds per user
- Monitor usage in Google Cloud Console

### 3. Backup Strategy
- Google Sheets automatically saves version history
- Consider periodic exports for additional backup

## 🔒 Security Checklist

- [ ] All environment variables are set correctly
- [ ] JWT secrets are strong and unique
- [ ] Google Sheets is shared only with service account
- [ ] CORS is configured for your frontend domain
- [ ] HTTPS is enabled on both frontend and backend

## 📈 Monitoring

### Backend Monitoring
- Render provides built-in logs and metrics
- Monitor API response times and error rates

### Frontend Monitoring
- Netlify provides analytics and performance metrics
- Monitor user interactions and page load times

## 🔄 CI/CD Pipeline

### Automatic Deployments
Both Render and Netlify support automatic deployments:
- Push to `main` branch triggers deployment
- Failed builds prevent deployment
- Rollback to previous versions available

### Branch Deployments
- Create preview deployments for feature branches
- Test changes before merging to main

## 🆘 Troubleshooting

### Common Issues

**Backend not starting:**
- Check environment variables are set
- Verify Google Sheets credentials
- Check build logs in Render

**Frontend API errors:**
- Verify API URL is correct
- Check CORS configuration
- Ensure backend is running

**Google Sheets connection failed:**
- Verify service account credentials
- Check spreadsheet sharing permissions
- Confirm spreadsheet ID is correct

### Support Resources
- [Render Documentation](https://render.com/docs)
- [Netlify Documentation](https://docs.netlify.com)
- [Google Sheets API Documentation](https://developers.google.com/sheets/api)

## 🎉 Post-Deployment

After successful deployment:
1. Test all functionality
2. Update documentation with production URLs
3. Share access with stakeholders
4. Set up monitoring and alerts
5. Plan regular backups and updates

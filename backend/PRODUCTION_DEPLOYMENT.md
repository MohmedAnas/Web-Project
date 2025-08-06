# RB Computer Backend - Production Deployment Guide

## 🚀 Quick Deployment Steps

### 1. **MongoDB Atlas Setup**
- [ ] Create MongoDB Atlas account
- [ ] Create new cluster
- [ ] Create database user
- [ ] Get connection string
- [ ] Whitelist IP addresses (0.0.0.0/0 for Render)

### 2. **Render.com Deployment**
- [ ] Create Render account
- [ ] Connect GitHub repository
- [ ] Create new Web Service
- [ ] Use `render.yaml` configuration
- [ ] Set environment variables

### 3. **Environment Variables (Set in Render Dashboard)**
```
NODE_ENV=production
PORT=8000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/rbcomputer_prod
JWT_SECRET=your-super-secure-jwt-secret-min-32-chars
JWT_REFRESH_SECRET=your-super-secure-refresh-secret-min-32-chars
ADMIN_EMAIL=admin@rbcomputer.com
ADMIN_PASSWORD=SecureAdminPassword123!
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
FRONTEND_URL=https://your-app.netlify.app
```

### 4. **Frontend Integration**
- [ ] Update frontend API base URL to your Render URL
- [ ] Update CORS settings with your Netlify URL
- [ ] Test API endpoints from frontend

## 📋 Pre-Deployment Checklist

### **Security**
- [ ] Change default admin password
- [ ] Generate strong JWT secrets (min 32 characters)
- [ ] Set up production email service
- [ ] Configure CORS for your frontend domain only
- [ ] Enable HTTPS (automatic on Render)

### **Database**
- [ ] MongoDB Atlas cluster created
- [ ] Database user with appropriate permissions
- [ ] Network access configured
- [ ] Connection string tested

### **Environment**
- [ ] All environment variables set
- [ ] No sensitive data in code
- [ ] Production logging configured
- [ ] File upload limits set

### **Testing**
- [ ] All API endpoints tested
- [ ] Authentication working
- [ ] Database operations working
- [ ] File uploads working
- [ ] Email notifications working

## 🔧 Render.com Specific Setup

### **1. Repository Setup**
```bash
# Push your code to GitHub
git add .
git commit -m "Production ready deployment"
git push origin main
```

### **2. Render Service Creation**
1. Go to [render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Select `rbcomputer/backend` folder
5. Use these settings:
   - **Name**: `rbcomputer-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: `Starter` (Free tier)

### **3. Environment Variables**
Set these in Render Dashboard → Environment:
```
NODE_ENV=production
MONGODB_URI=your-mongodb-atlas-connection-string
JWT_SECRET=generate-32-char-random-string
JWT_REFRESH_SECRET=generate-32-char-random-string
ADMIN_EMAIL=admin@rbcomputer.com
ADMIN_PASSWORD=your-secure-password
FRONTEND_URL=https://your-netlify-app.netlify.app
```

### **4. Custom Domain (Optional)**
- Add your custom domain in Render dashboard
- Update DNS records as instructed
- SSL certificate will be automatically provisioned

## 🌐 MongoDB Atlas Setup

### **1. Create Cluster**
1. Go to [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create free account
3. Create new cluster (M0 Free tier)
4. Choose cloud provider and region

### **2. Database Access**
1. Go to "Database Access"
2. Add new database user
3. Set username/password
4. Grant "Read and write to any database" role

### **3. Network Access**
1. Go to "Network Access"
2. Add IP Address: `0.0.0.0/0` (Allow access from anywhere)
3. Or add Render's IP ranges for better security

### **4. Get Connection String**
1. Go to "Clusters" → "Connect"
2. Choose "Connect your application"
3. Copy connection string
4. Replace `<password>` with your database user password

## 📊 Post-Deployment Verification

### **1. Health Check**
```bash
curl https://your-app.onrender.com/health
```

### **2. API Test**
```bash
# Test login
curl -X POST https://your-app.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@rbcomputer.com","password":"your-password","userType":"admin"}'
```

### **3. Frontend Integration**
- Update frontend API_BASE_URL
- Test all major features
- Verify CORS is working

## 🔍 Monitoring & Maintenance

### **Render Dashboard**
- Monitor application logs
- Check resource usage
- Set up alerts for downtime

### **MongoDB Atlas**
- Monitor database performance
- Set up backup schedules
- Monitor connection limits

### **Regular Tasks**
- [ ] Monitor application logs weekly
- [ ] Update dependencies monthly
- [ ] Backup database regularly
- [ ] Review security settings quarterly

## 🚨 Troubleshooting

### **Common Issues**

**1. Application won't start**
- Check environment variables
- Verify MongoDB connection string
- Check Render logs

**2. Database connection failed**
- Verify MongoDB Atlas network access
- Check connection string format
- Ensure database user has correct permissions

**3. CORS errors**
- Update FRONTEND_URL environment variable
- Check Render logs for blocked requests
- Verify frontend is using correct API URL

**4. Authentication not working**
- Check JWT secrets are set
- Verify admin user is created
- Check password complexity

## 📞 Support

If you encounter issues:
1. Check Render application logs
2. Check MongoDB Atlas logs
3. Verify all environment variables
4. Test API endpoints individually

## 🎉 Success!

Once deployed successfully, your backend will be available at:
- **API Base URL**: `https://your-app.onrender.com/api`
- **Health Check**: `https://your-app.onrender.com/health`
- **Admin Login**: Use your configured admin credentials

Your RB Computer backend is now running in production! 🚀

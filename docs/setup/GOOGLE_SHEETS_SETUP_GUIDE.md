# Google Sheets Integration Setup Guide

This guide will help you set up your MERN application to use Google Sheets as the database instead of MongoDB.

## 🚀 Quick Start

### Prerequisites
- Google account (free)
- Google Sheets access
- Node.js installed
- Your existing MERN project

### Step 1: Create Google Sheets Database

1. **Go to Google Sheets**
   - Visit: https://sheets.google.com
   - Sign in with your Google account

2. **Create New Spreadsheet**
   - Click "Blank" to create a new spreadsheet
   - Rename it to: `RB Computer Database`
   - Note the Spreadsheet ID from the URL:
     ```
     https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit
     ```

3. **Create Worksheets**
   - Create 7 worksheets with these exact names:
     - `Students`
     - `Courses`
     - `Fees`
     - `Attendance`
     - `Notices`
     - `Certificates`
     - `Admins`

4. **Set Up Headers**
   - Each worksheet will have predefined headers (auto-created by setup script)

### Step 2: Enable Google Sheets API (Simple Method)

1. **Create API Key (No Google Cloud Console needed)**
   - Go to: https://console.developers.google.com/apis/credentials
   - Click "Create Credentials" > "API Key"
   - Copy the API Key
   - Click "Restrict Key" and select "Google Sheets API"

2. **Make Spreadsheet Public (Read Access)**
   - Open your Google Sheet
   - Click "Share" button
   - Change "Restricted" to "Anyone with the link"
   - Set permission to "Viewer"
   - Copy the sharing link

### Step 3: Install Dependencies

```bash
cd backend
npm install googleapis google-auth-library axios
```

### Step 4: Environment Configuration

1. **Copy the Google Sheets environment file**:
   ```bash
   cp .env.sheets.example .env
   ```

2. **Update your `.env` file**:
   ```env
   # Google Sheets Configuration
   GOOGLE_SHEETS_API_KEY=your_api_key_from_step2
   GOOGLE_SPREADSHEET_ID=your_spreadsheet_id_from_step1
   
   # Worksheet Names (optional - defaults provided)
   STUDENTS_SHEET_NAME=Students
   COURSES_SHEET_NAME=Courses
   FEES_SHEET_NAME=Fees
   ATTENDANCE_SHEET_NAME=Attendance
   NOTICES_SHEET_NAME=Notices
   CERTIFICATES_SHEET_NAME=Certificates
   ADMINS_SHEET_NAME=Admins
   
   # Other configurations...
   NODE_ENV=development
   PORT=8000
   JWT_SECRET=your_super_secret_jwt_key_here
   ```

### Step 5: Update Package.json

Replace your current `package.json` with the Google Sheets version:
```bash
cp package-sheets.json package.json
npm install
```

### Step 6: Initialize Google Sheets Database

Run the setup script to create all necessary headers and sample data:
```bash
npm run setup-sheets
```

To create sample data for testing:
```bash
npm run setup-sheets -- --sample-data
```

### Step 7: Start Your Application

Use the Google Sheets-enabled server:
```bash
# For development
cp server-sheets.js server.js
npm run dev

# Or directly
node server-sheets.js
```

## 🔧 Configuration Details

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GOOGLE_SHEETS_API_KEY` | Google Sheets API Key | Yes |
| `GOOGLE_SPREADSHEET_ID` | Your Spreadsheet ID | Yes |
| `STUDENTS_SHEET_NAME` | Students worksheet name | Optional (default: "Students") |
| `COURSES_SHEET_NAME` | Courses worksheet name | Optional (default: "Courses") |
| `FEES_SHEET_NAME` | Fees worksheet name | Optional (default: "Fees") |
| `ATTENDANCE_SHEET_NAME` | Attendance worksheet name | Optional (default: "Attendance") |
| `NOTICES_SHEET_NAME` | Notices worksheet name | Optional (default: "Notices") |
| `CERTIFICATES_SHEET_NAME` | Certificates worksheet name | Optional (default: "Certificates") |
| `ADMINS_SHEET_NAME` | Admins worksheet name | Optional (default: "Admins") |

### Worksheet Structure

The system will automatically create these worksheets with headers:

1. **Students** - Student information and enrollment data
   - ID, First Name, Last Name, Email, Phone, Date of Birth, Address, Course, Enrollment Date, Status

2. **Courses** - Course catalog and details
   - ID, Course Name, Description, Duration, Fee, Instructor, Start Date, End Date, Status

3. **Fees** - Fee records and payment tracking
   - ID, Student ID, Course ID, Amount, Due Date, Paid Date, Payment Method, Status

4. **Attendance** - Student attendance records
   - ID, Student ID, Course ID, Date, Status, Remarks

5. **Notices** - Announcements and notices
   - ID, Title, Content, Target Audience, Created Date, Expiry Date, Status

6. **Certificates** - Certificate generation data
   - ID, Student ID, Course ID, Certificate Type, Issue Date, Certificate Number, Status

7. **Admins** - Administrator accounts
   - ID, Name, Email, Role, Created Date, Last Login, Status

## 🧪 Testing Your Setup

### 1. Health Check
Visit: `http://localhost:8000/health`

Expected response:
```json
{
  "status": "OK",
  "database": {
    "type": "Google Sheets",
    "status": "connected"
  }
}
```

### 2. Google Sheets Status Check
Visit: `http://localhost:8000/api/sheets/status`

Expected response:
```json
{
  "connected": true,
  "spreadsheetId": "your-spreadsheet-id",
  "spreadsheetTitle": "RB Computer Database",
  "sheets": {
    "students": "Students",
    "courses": "Courses",
    "fees": "Fees",
    "attendance": "Attendance",
    "notices": "Notices",
    "certificates": "Certificates",
    "admins": "Admins"
  }
}
```

### 3. Test API Endpoints

Create a student:
```bash
curl -X POST http://localhost:8000/api/students \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phone": "1234567890"
  }'
```

## 🔍 Troubleshooting

### Common Issues

1. **API Key Invalid**
   - Verify your Google Sheets API key is correct
   - Ensure the API key has Google Sheets API enabled
   - Check if the key restrictions are properly set

2. **Spreadsheet Not Found**
   - Verify the spreadsheet ID is correct
   - Ensure the spreadsheet is shared publicly (Anyone with link - Viewer)
   - Check if the spreadsheet exists and is accessible

3. **Permission Denied**
   - Make sure the spreadsheet is shared with "Anyone with the link"
   - Verify the sharing permission is set to "Viewer" or higher
   - Check if the API key has proper restrictions

4. **Rate Limiting**
   - Google Sheets API has rate limits (100 requests per 100 seconds per user)
   - Implement retry logic for production use
   - Consider caching for frequently accessed data

### Debug Mode

Enable debug logging:
```env
LOG_LEVEL=debug
```

### Manual Testing

Test your Google Sheets API access:
1. Open your browser
2. Visit: `https://sheets.googleapis.com/v4/spreadsheets/YOUR_SPREADSHEET_ID?key=YOUR_API_KEY`
3. You should see spreadsheet metadata in JSON format

## 🚀 Production Deployment

### Security Considerations

1. **API Key Security**
   - Never commit API keys to version control
   - Use environment variables for all secrets
   - Rotate API keys regularly
   - Set proper API key restrictions

2. **Spreadsheet Access**
   - Use minimum required sharing permissions
   - Consider using service accounts for production
   - Monitor access logs regularly

3. **Rate Limiting**
   - Implement proper rate limiting in your app
   - Add retry logic with exponential backoff
   - Monitor API usage and quotas

### Performance Optimization

1. **Caching**
   - Implement Redis caching for frequently accessed data
   - Cache worksheet structure and headers
   - Use conditional requests when possible

2. **Batch Operations**
   - Use batch requests for multiple operations
   - Implement bulk insert/update operations
   - Optimize range operations

3. **Data Structure**
   - Keep worksheets organized and indexed
   - Use consistent data formats
   - Implement data validation

## 📚 Additional Resources

- [Google Sheets API Documentation](https://developers.google.com/sheets/api)
- [Google Sheets API Quickstart](https://developers.google.com/sheets/api/quickstart/nodejs)
- [Google API Console](https://console.developers.google.com/)
- [Google Sheets API Limits](https://developers.google.com/sheets/api/limits)

## 🆘 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review the logs in `./logs/app.log`
3. Test your setup using the health check endpoints
4. Verify your Google Sheets API configuration

## 🎉 Success!

Once everything is set up correctly, you'll have:

- ✅ Google Sheets as your database
- ✅ Real-time data synchronization
- ✅ Collaborative editing capabilities
- ✅ Familiar spreadsheet interface for data management
- ✅ Free hosting for your data
- ✅ Automatic backups and version history
- ✅ Easy ownership transfer capabilities
- ✅ No Google Cloud Console complexity

Your MERN application is now powered by Google Sheets! 🚀

## 🔄 Ownership Transfer Guide

### How to Transfer Ownership

1. **Open your Google Sheet**
2. **Click the "Share" button** (top right)
3. **Add the new owner's email** in the "Add people and groups" field
4. **Click the dropdown** next to their name
5. **Select "Owner"** from the permissions
6. **Click "Send"** - they'll receive an email invitation
7. **New owner accepts** the invitation
8. **You can now remove yourself** or stay as an editor

### Benefits of Ownership Transfer
- ✅ **Full control** - New owner can manage all permissions
- ✅ **Billing responsibility** - If using paid features
- ✅ **Data ownership** - Legal ownership of the data
- ✅ **Admin rights** - Can add/remove other users
- ✅ **API access** - Can create their own API keys if needed

### What Happens After Transfer
- 🔄 **Your app continues working** - No code changes needed
- 🔄 **Same spreadsheet ID** - All configurations remain valid
- 🔄 **Same API access** - Public sharing settings preserved
- 🔄 **You keep access** - Unless the new owner removes you

This makes Google Sheets perfect for client projects where you need to transfer ownership! 🎊

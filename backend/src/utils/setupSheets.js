// Load environment variables at the very top
require('dotenv').config();

const googleSheetsService = require('../services/googleSheetsService');
const bcrypt = require('bcryptjs');

class SheetsSetup {
    constructor() {
        this.worksheets = [
            'Students',
            'Courses', 
            'Fees',
            'Attendance',
            'Notices',
            'Certificates',
            'Admins'
        ];
    }

    async setupAllWorksheets() {
        console.log('🚀 Starting Google Sheets setup...\n');

        try {
            // Test connection first
            console.log('📡 Testing Google Sheets connection...');
            const connectionTest = await googleSheetsService.testConnection();
            
            if (!connectionTest.connected) {
                throw new Error(`Connection failed: ${connectionTest.error}`);
            }
            
            console.log('✅ Connected to Google Sheets successfully!');
            console.log(`📊 Spreadsheet: ${connectionTest.spreadsheetTitle}`);
            console.log(`🆔 ID: ${connectionTest.spreadsheetId}\n`);

            // Initialize all worksheets
            for (const worksheet of this.worksheets) {
                console.log(`📝 Setting up ${worksheet} worksheet...`);
                try {
                    await googleSheetsService.initializeWorksheet(worksheet);
                    console.log(`✅ ${worksheet} worksheet ready!`);
                } catch (error) {
                    console.log(`❌ Error setting up ${worksheet}: ${error.message}`);
                }
            }

            console.log('\n🎉 All worksheets setup completed!');
            return { success: true };

        } catch (error) {
            console.error('❌ Setup failed:', error.message);
            throw error;
        }
    }

    async createSampleData() {
        console.log('\n📊 Creating sample data...\n');

        try {
            // Sample Admin
            console.log('👤 Creating sample admin...');
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await googleSheetsService.addRow('Admins', {
                Name: 'System Administrator',
                Email: 'admin@rbcomputer.com',
                Password: hashedPassword,
                Role: 'super_admin',
                'Created Date': new Date().toISOString().split('T')[0],
                'Last Login': '',
                Status: 'active'
            });
            console.log('✅ Sample admin created!');

            // Sample Courses
            console.log('📚 Creating sample courses...');
            const sampleCourses = [
                {
                    'Course Name': 'Basic Computer Course',
                    Description: 'Introduction to computers and basic operations',
                    Duration: '3 months',
                    Fee: '5000',
                    Instructor: 'John Smith',
                    'Start Date': '2024-09-01',
                    'End Date': '2024-12-01',
                    Status: 'active'
                },
                {
                    'Course Name': 'Advanced Excel',
                    Description: 'Advanced Excel formulas and data analysis',
                    Duration: '2 months',
                    Fee: '3000',
                    Instructor: 'Jane Doe',
                    'Start Date': '2024-09-15',
                    'End Date': '2024-11-15',
                    Status: 'active'
                },
                {
                    'Course Name': 'Web Development',
                    Description: 'HTML, CSS, JavaScript fundamentals',
                    Duration: '6 months',
                    Fee: '15000',
                    Instructor: 'Mike Johnson',
                    'Start Date': '2024-10-01',
                    'End Date': '2025-04-01',
                    Status: 'active'
                }
            ];

            for (const course of sampleCourses) {
                await googleSheetsService.addRow('Courses', course);
            }
            console.log('✅ Sample courses created!');

            // Sample Students
            console.log('👨‍🎓 Creating sample students...');
            const sampleStudents = [
                {
                    'First Name': 'Alice',
                    'Last Name': 'Johnson',
                    Email: 'alice.johnson@example.com',
                    Phone: '9876543210',
                    'Date of Birth': '1995-05-15',
                    Address: '123 Main St, City',
                    Course: 'Basic Computer Course',
                    'Enrollment Date': '2024-08-15',
                    Status: 'active'
                },
                {
                    'First Name': 'Bob',
                    'Last Name': 'Smith',
                    Email: 'bob.smith@example.com',
                    Phone: '9876543211',
                    'Date of Birth': '1992-08-22',
                    Address: '456 Oak Ave, City',
                    Course: 'Advanced Excel',
                    'Enrollment Date': '2024-08-20',
                    Status: 'active'
                },
                {
                    'First Name': 'Carol',
                    'Last Name': 'Davis',
                    Email: 'carol.davis@example.com',
                    Phone: '9876543212',
                    'Date of Birth': '1998-12-10',
                    Address: '789 Pine Rd, City',
                    Course: 'Web Development',
                    'Enrollment Date': '2024-08-25',
                    Status: 'active'
                }
            ];

            for (const student of sampleStudents) {
                await googleSheetsService.addRow('Students', student);
            }
            console.log('✅ Sample students created!');

            // Sample Notices
            console.log('📢 Creating sample notices...');
            const sampleNotices = [
                {
                    Title: 'Welcome to RB Computer',
                    Content: 'Welcome to our computer training institute. We are excited to have you!',
                    'Target Audience': 'all',
                    'Created Date': new Date().toISOString().split('T')[0],
                    'Expiry Date': '2024-12-31',
                    Status: 'active'
                },
                {
                    Title: 'Holiday Notice',
                    Content: 'The institute will be closed on national holidays. Please check the calendar.',
                    'Target Audience': 'students',
                    'Created Date': new Date().toISOString().split('T')[0],
                    'Expiry Date': '2024-12-31',
                    Status: 'active'
                }
            ];

            for (const notice of sampleNotices) {
                await googleSheetsService.addRow('Notices', notice);
            }
            console.log('✅ Sample notices created!');

            console.log('\n🎊 Sample data creation completed!');
            return { success: true };

        } catch (error) {
            console.error('❌ Sample data creation failed:', error.message);
            throw error;
        }
    }

    async displaySetupInfo() {
        console.log('\n📋 Setup Information:');
        console.log('='.repeat(50));
        console.log(`📊 Spreadsheet ID: ${process.env.GOOGLE_SPREADSHEET_ID}`);
        console.log(`🔑 Client Email: ${process.env.GOOGLE_CLIENT_EMAIL ? '✅ Configured' : '❌ Missing'}`);
        console.log(`🔐 Private Key: ${process.env.GOOGLE_PRIVATE_KEY ? '✅ Configured' : '❌ Missing'}`);
        console.log(`📁 Project ID: ${process.env.GOOGLE_PROJECT_ID ? '✅ Configured' : '❌ Missing'}`);
        console.log('\n📝 Worksheets:');
        
        for (const worksheet of this.worksheets) {
            console.log(`   • ${worksheet}`);
        }

        console.log('\n🔗 Access your spreadsheet at:');
        console.log(`https://docs.google.com/spreadsheets/d/${process.env.GOOGLE_SPREADSHEET_ID}/edit`);
        
        console.log('\n🚀 To start your application:');
        console.log('   npm run dev');
        
        console.log('\n📡 Test endpoints:');
        console.log('   Health Check: http://localhost:8000/health');
        console.log('   Sheets Status: http://localhost:8000/api/sheets/status');
        console.log('='.repeat(50));
    }

    async getWorksheetStats() {
        console.log('\n📊 Worksheet Statistics:');
        console.log('='.repeat(50));

        for (const worksheet of this.worksheets) {
            try {
                const stats = await googleSheetsService.getStats(worksheet);
                console.log(`${worksheet}: ${stats.active} active, ${stats.deleted} deleted, ${stats.total} total`);
            } catch (error) {
                console.log(`${worksheet}: Error getting stats - ${error.message}`);
            }
        }
        console.log('='.repeat(50));
    }
}

// Main execution
async function main() {
    const setup = new SheetsSetup();
    const args = process.argv.slice(2);
    const includeSampleData = args.includes('--sample-data');
    const showStats = args.includes('--stats');

    try {
        // Debug environment variables
        console.log('🔍 Environment Check:');
        console.log(`   GOOGLE_CLIENT_EMAIL: ${process.env.GOOGLE_CLIENT_EMAIL ? '✅ Set' : '❌ Missing'}`);
        console.log(`   GOOGLE_PRIVATE_KEY: ${process.env.GOOGLE_PRIVATE_KEY ? '✅ Set' : '❌ Missing'}`);
        console.log(`   GOOGLE_PROJECT_ID: ${process.env.GOOGLE_PROJECT_ID ? '✅ Set' : '❌ Missing'}`);
        console.log(`   GOOGLE_SPREADSHEET_ID: ${process.env.GOOGLE_SPREADSHEET_ID ? '✅ Set' : '❌ Missing'}`);
        console.log('');

        // Validate environment variables
        if (!process.env.GOOGLE_CLIENT_EMAIL) {
            throw new Error('GOOGLE_CLIENT_EMAIL is required in .env file');
        }

        if (!process.env.GOOGLE_PRIVATE_KEY) {
            throw new Error('GOOGLE_PRIVATE_KEY is required in .env file');
        }

        if (!process.env.GOOGLE_PROJECT_ID) {
            throw new Error('GOOGLE_PROJECT_ID is required in .env file');
        }

        if (!process.env.GOOGLE_SPREADSHEET_ID) {
            throw new Error('GOOGLE_SPREADSHEET_ID is required in .env file');
        }

        // Setup worksheets
        await setup.setupAllWorksheets();

        // Create sample data if requested
        if (includeSampleData) {
            await setup.createSampleData();
        }

        // Show stats if requested
        if (showStats) {
            await setup.getWorksheetStats();
        }

        // Display setup information
        await setup.displaySetupInfo();

        console.log('\n🎉 Google Sheets setup completed successfully!');
        process.exit(0);

    } catch (error) {
        console.error('\n❌ Setup failed:', error.message);
        console.log('\n🔧 Troubleshooting:');
        console.log('1. Check your .env file has all Google credentials');
        console.log('2. Verify your service account credentials are correct');
        console.log('3. Ensure your spreadsheet is shared with the service account email');
        console.log('4. Check the spreadsheet ID in the URL');
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = SheetsSetup;

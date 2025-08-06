const axios = require('axios');

async function createSimpleCourse() {
    console.log('🚀 Creating Simple Course...\n');
    
    const BASE_URL = 'http://localhost:8000/api';
    
    // Login
    const loginData = {
        email: 'admin@rbcomputer.com',
        password: 'admin123',
        userType: 'admin'
    };
    
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, loginData);
    const authToken = loginResponse.data.data.tokens.accessToken;
    const authHeaders = { Authorization: `Bearer ${authToken}` };
    
    // Create course with valid data
    const courseData = {
        name: 'Basic Programming',
        code: 'PROG01',
        description: 'Introduction to programming concepts and basics',
        category: 'programming', // Valid: programming, web_development, mobile_development, data_science, cybersecurity, networking, database, other
        level: 'beginner',
        duration: 90,
        fee: {
            amount: 5000
        },
        modules: [{
            name: 'Introduction',
            description: 'Basic concepts',
            duration: 30,
            order: 1
        }]
    };
    
    try {
        const response = await axios.post(`${BASE_URL}/courses`, courseData, {
            headers: authHeaders
        });
        
        const courseId = response.data.data._id;
        console.log('✅ Course created!');
        console.log('Course ID:', courseId);
        
        // Test attendance dashboard
        const dashboardResponse = await axios.get(`${BASE_URL}/attendance/dashboard?course=${courseId}`, {
            headers: authHeaders
        });
        
        console.log('✅ Attendance Dashboard working!');
        console.log('Success! 🎉');
        
    } catch (error) {
        console.log('❌ Error:', error.response?.data);
    }
}

createSimpleCourse();

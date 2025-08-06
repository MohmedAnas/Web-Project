const axios = require('axios');

async function fixAttendanceDashboard() {
    console.log('🔧 Fixing Attendance Dashboard Test...\n');
    
    const BASE_URL = 'http://localhost:8000/api';
    
    // Login first
    console.log('1. Logging in...');
    const loginData = {
        email: 'admin@rbcomputer.com',
        password: 'admin123',
        userType: 'admin'
    };
    
    try {
        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, loginData);
        const authToken = loginResponse.data.data.tokens.accessToken;
        const authHeaders = { Authorization: `Bearer ${authToken}` };
        console.log('✅ Login successful');
        
        // Step 1: Create a test course first
        console.log('\n2. Creating a test course...');
        const courseData = {
            name: 'Test Course for Attendance',
            description: 'Test course for attendance dashboard',
            duration: '3 months',
            fee: 5000,
            status: 'active'
        };
        
        let courseId = null;
        
        try {
            const courseResponse = await axios.post(`${BASE_URL}/courses`, courseData, {
                headers: authHeaders
            });
            courseId = courseResponse.data.data._id;
            console.log('✅ Test course created:', courseId);
        } catch (error) {
            console.log('⚠️ Course creation failed, trying to get existing courses...');
            
            // Try to get existing courses
            try {
                const coursesResponse = await axios.get(`${BASE_URL}/courses`, {
                    headers: authHeaders
                });
                
                if (coursesResponse.data.data && coursesResponse.data.data.length > 0) {
                    courseId = coursesResponse.data.data[0]._id;
                    console.log('✅ Using existing course:', courseId);
                } else {
                    console.log('❌ No courses available, creating a simple one...');
                    // Create minimal course
                    const minimalCourse = {
                        name: 'Basic Course',
                        description: 'Basic course for testing',
                        duration: '1 month',
                        fee: 1000
                    };
                    
                    const newCourseResponse = await axios.post(`${BASE_URL}/courses`, minimalCourse, {
                        headers: authHeaders
                    });
                    courseId = newCourseResponse.data.data._id;
                    console.log('✅ Minimal course created:', courseId);
                }
            } catch (getError) {
                console.log('❌ Could not get or create courses:', getError.response?.data);
                return;
            }
        }
        
        // Step 2: Test attendance dashboard with course ID
        console.log('\n3. Testing attendance dashboard with course ID...');
        
        try {
            const dashboardResponse = await axios.get(`${BASE_URL}/attendance/dashboard?course=${courseId}`, {
                headers: authHeaders
            });
            console.log('✅ Attendance Dashboard working with course ID!');
            console.log('Response:', JSON.stringify(dashboardResponse.data, null, 2));
        } catch (error) {
            console.log('❌ Still failing with course ID');
            console.log('Error:', JSON.stringify(error.response?.data, null, 2));
            
            // Try different parameter formats
            console.log('\n4. Trying different parameter formats...');
            
            const testFormats = [
                { url: `/attendance/dashboard?courseId=${courseId}`, name: 'courseId parameter' },
                { url: `/attendance/dashboard`, data: { course: courseId }, name: 'POST with course in body' },
                { url: `/attendance/dashboard`, data: { courseId: courseId }, name: 'POST with courseId in body' }
            ];
            
            for (const format of testFormats) {
                try {
                    let response;
                    if (format.data) {
                        response = await axios.post(`${BASE_URL}${format.url}`, format.data, {
                            headers: authHeaders
                        });
                    } else {
                        response = await axios.get(`${BASE_URL}${format.url}`, {
                            headers: authHeaders
                        });
                    }
                    console.log(`✅ ${format.name} worked!`);
                    console.log('Response:', JSON.stringify(response.data, null, 2));
                    break;
                } catch (formatError) {
                    console.log(`❌ ${format.name} failed:`, formatError.response?.data?.error);
                }
            }
        }
        
    } catch (loginError) {
        console.log('❌ Login failed:', loginError.message);
    }
}

fixAttendanceDashboard();

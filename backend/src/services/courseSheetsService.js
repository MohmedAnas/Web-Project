const googleSheetsService = require('./googleSheetsService');

class CourseSheetsService {
    constructor() {
        this.worksheetName = googleSheetsService.worksheetNames.courses;
    }

    // Get all courses
    async getAllCourses(page = 1, limit = 10, filters = {}) {
        try {
            return await googleSheetsService.getPaginated(this.worksheetName, page, limit, filters);
        } catch (error) {
            console.error('Error getting all courses:', error.message);
            throw error;
        }
    }

    // Get course by ID
    async getCourseById(id) {
        try {
            const course = await googleSheetsService.getById(this.worksheetName, id);
            if (!course || course.Status === 'deleted') {
                return null;
            }
            return course;
        } catch (error) {
            console.error('Error getting course by ID:', error.message);
            throw error;
        }
    }

    // Create new course
    async createCourse(courseData) {
        try {
            // Validate required fields
            const requiredFields = ['Course Name', 'Duration', 'Fee'];
            for (const field of requiredFields) {
                if (!courseData[field]) {
                    throw new Error(`${field} is required`);
                }
            }

            // Check if course name already exists
            const existingCourse = await this.getCourseByName(courseData['Course Name']);
            if (existingCourse) {
                throw new Error('Course with this name already exists');
            }

            // Set default values
            const course = {
                ...courseData,
                'Start Date': courseData['Start Date'] || new Date().toISOString().split('T')[0],
                Status: courseData.Status || 'active'
            };

            return await googleSheetsService.addRow(this.worksheetName, course);
        } catch (error) {
            console.error('Error creating course:', error.message);
            throw error;
        }
    }

    // Update course
    async updateCourse(id, updateData) {
        try {
            // Check if course exists
            const existingCourse = await this.getCourseById(id);
            if (!existingCourse) {
                throw new Error('Course not found');
            }

            // If course name is being updated, check for duplicates
            if (updateData['Course Name'] && updateData['Course Name'] !== existingCourse['Course Name']) {
                const nameExists = await this.getCourseByName(updateData['Course Name']);
                if (nameExists && nameExists.ID !== id) {
                    throw new Error('Course with this name already exists');
                }
            }

            return await googleSheetsService.updateById(this.worksheetName, id, updateData);
        } catch (error) {
            console.error('Error updating course:', error.message);
            throw error;
        }
    }

    // Delete course (soft delete)
    async deleteCourse(id) {
        try {
            const existingCourse = await this.getCourseById(id);
            if (!existingCourse) {
                throw new Error('Course not found');
            }

            return await googleSheetsService.deleteById(this.worksheetName, id);
        } catch (error) {
            console.error('Error deleting course:', error.message);
            throw error;
        }
    }

    // Get course by name
    async getCourseByName(courseName) {
        try {
            const courses = await googleSheetsService.search(this.worksheetName, { 'Course Name': courseName });
            const activeCourses = courses.filter(course => course.Status !== 'deleted');
            return activeCourses.length > 0 ? activeCourses[0] : null;
        } catch (error) {
            console.error('Error getting course by name:', error.message);
            throw error;
        }
    }

    // Search courses
    async searchCourses(searchTerm, page = 1, limit = 10) {
        try {
            if (searchTerm) {
                // Search in multiple fields
                const allCourses = await googleSheetsService.getAllData(this.worksheetName);
                const filteredCourses = allCourses.filter(course => {
                    if (course.Status === 'deleted') return false;
                    
                    const searchFields = ['Course Name', 'Description', 'Instructor'];
                    return searchFields.some(field => {
                        const value = course[field] || '';
                        return value.toLowerCase().includes(searchTerm.toLowerCase());
                    });
                });

                // Manual pagination for search results
                const total = filteredCourses.length;
                const startIndex = (page - 1) * limit;
                const endIndex = startIndex + limit;
                const paginatedData = filteredCourses.slice(startIndex, endIndex);

                return {
                    data: paginatedData,
                    pagination: {
                        current: page,
                        pages: Math.ceil(total / limit),
                        total: total,
                        limit: limit
                    }
                };
            }

            return await this.getAllCourses(page, limit);
        } catch (error) {
            console.error('Error searching courses:', error.message);
            throw error;
        }
    }

    // Get courses by instructor
    async getCoursesByInstructor(instructor, page = 1, limit = 10) {
        try {
            return await googleSheetsService.getPaginated(
                this.worksheetName, 
                page, 
                limit, 
                { Instructor: instructor }
            );
        } catch (error) {
            console.error('Error getting courses by instructor:', error.message);
            throw error;
        }
    }

    // Get active courses only
    async getActiveCourses(page = 1, limit = 10) {
        try {
            return await googleSheetsService.getPaginated(
                this.worksheetName, 
                page, 
                limit, 
                { Status: 'active' }
            );
        } catch (error) {
            console.error('Error getting active courses:', error.message);
            throw error;
        }
    }

    // Get course statistics
    async getCourseStats() {
        try {
            const stats = await googleSheetsService.getStats(this.worksheetName);
            const allCourses = await googleSheetsService.getAllData(this.worksheetName);
            const activeCourses = allCourses.filter(course => course.Status !== 'deleted');

            // Count by status
            const statusCounts = {};
            activeCourses.forEach(course => {
                const status = course.Status || 'active';
                statusCounts[status] = (statusCounts[status] || 0) + 1;
            });

            // Count by instructor
            const instructorCounts = {};
            activeCourses.forEach(course => {
                const instructor = course.Instructor || 'Not Assigned';
                instructorCounts[instructor] = (instructorCounts[instructor] || 0) + 1;
            });

            // Calculate average fee
            const fees = activeCourses
                .map(course => parseFloat(course.Fee || 0))
                .filter(fee => !isNaN(fee));
            const averageFee = fees.length > 0 ? fees.reduce((a, b) => a + b, 0) / fees.length : 0;

            return {
                ...stats,
                byStatus: statusCounts,
                byInstructor: instructorCounts,
                averageFee: Math.round(averageFee * 100) / 100
            };
        } catch (error) {
            console.error('Error getting course statistics:', error.message);
            throw error;
        }
    }

    // Get courses for dropdown/select options
    async getCoursesForSelect() {
        try {
            const allCourses = await googleSheetsService.getAllData(this.worksheetName);
            const activeCourses = allCourses.filter(course => course.Status === 'active');
            
            return activeCourses.map(course => ({
                id: course.ID,
                name: course['Course Name'],
                fee: course.Fee,
                duration: course.Duration
            }));
        } catch (error) {
            console.error('Error getting courses for select:', error.message);
            throw error;
        }
    }

    // Get upcoming courses (based on start date)
    async getUpcomingCourses(limit = 5) {
        try {
            const allCourses = await googleSheetsService.getAllData(this.worksheetName);
            const activeCourses = allCourses.filter(course => course.Status === 'active');
            
            const today = new Date();
            const upcomingCourses = activeCourses.filter(course => {
                const startDate = new Date(course['Start Date']);
                return startDate >= today;
            });

            // Sort by start date (earliest first)
            const sortedCourses = upcomingCourses.sort((a, b) => {
                const dateA = new Date(a['Start Date']);
                const dateB = new Date(b['Start Date']);
                return dateA - dateB;
            });

            return sortedCourses.slice(0, limit);
        } catch (error) {
            console.error('Error getting upcoming courses:', error.message);
            throw error;
        }
    }

    // Get courses by fee range
    async getCoursesByFeeRange(minFee, maxFee, page = 1, limit = 10) {
        try {
            const allCourses = await googleSheetsService.getAllData(this.worksheetName);
            const filteredCourses = allCourses.filter(course => {
                if (course.Status === 'deleted') return false;
                
                const fee = parseFloat(course.Fee || 0);
                return fee >= minFee && fee <= maxFee;
            });

            // Manual pagination
            const total = filteredCourses.length;
            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + limit;
            const paginatedData = filteredCourses.slice(startIndex, endIndex);

            return {
                data: paginatedData,
                pagination: {
                    current: page,
                    pages: Math.ceil(total / limit),
                    total: total,
                    limit: limit
                }
            };
        } catch (error) {
            console.error('Error getting courses by fee range:', error.message);
            throw error;
        }
    }

    // Bulk import courses
    async bulkImportCourses(coursesData) {
        try {
            const results = [];
            const errors = [];

            for (let i = 0; i < coursesData.length; i++) {
                try {
                    const result = await this.createCourse(coursesData[i]);
                    results.push(result);
                } catch (error) {
                    errors.push({
                        row: i + 1,
                        data: coursesData[i],
                        error: error.message
                    });
                }
            }

            return {
                success: true,
                imported: results.length,
                errors: errors.length,
                results: results,
                errorDetails: errors
            };
        } catch (error) {
            console.error('Error in bulk import:', error.message);
            throw error;
        }
    }
}

module.exports = new CourseSheetsService();

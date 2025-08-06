const googleSheetsService = require('./googleSheetsService');

class StudentSheetsService {
    constructor() {
        this.worksheetName = googleSheetsService.worksheetNames.students;
    }

    // Get all students
    async getAllStudents(page = 1, limit = 10, filters = {}) {
        try {
            return await googleSheetsService.getPaginated(this.worksheetName, page, limit, filters);
        } catch (error) {
            console.error('Error getting all students:', error.message);
            throw error;
        }
    }

    // Get student by ID
    async getStudentById(id) {
        try {
            const student = await googleSheetsService.getById(this.worksheetName, id);
            if (!student || student.Status === 'deleted') {
                return null;
            }
            return student;
        } catch (error) {
            console.error('Error getting student by ID:', error.message);
            throw error;
        }
    }

    // Create new student
    async createStudent(studentData) {
        try {
            // Validate required fields
            const requiredFields = ['First Name', 'Last Name', 'Email'];
            for (const field of requiredFields) {
                if (!studentData[field]) {
                    throw new Error(`${field} is required`);
                }
            }

            // Check if email already exists
            const existingStudent = await this.getStudentByEmail(studentData.Email);
            if (existingStudent) {
                throw new Error('Student with this email already exists');
            }

            // Set default values
            const student = {
                ...studentData,
                'Enrollment Date': studentData['Enrollment Date'] || new Date().toISOString().split('T')[0],
                Status: studentData.Status || 'active'
            };

            return await googleSheetsService.addRow(this.worksheetName, student);
        } catch (error) {
            console.error('Error creating student:', error.message);
            throw error;
        }
    }

    // Update student
    async updateStudent(id, updateData) {
        try {
            // Check if student exists
            const existingStudent = await this.getStudentById(id);
            if (!existingStudent) {
                throw new Error('Student not found');
            }

            // If email is being updated, check for duplicates
            if (updateData.Email && updateData.Email !== existingStudent.Email) {
                const emailExists = await this.getStudentByEmail(updateData.Email);
                if (emailExists && emailExists.ID !== id) {
                    throw new Error('Student with this email already exists');
                }
            }

            return await googleSheetsService.updateById(this.worksheetName, id, updateData);
        } catch (error) {
            console.error('Error updating student:', error.message);
            throw error;
        }
    }

    // Delete student (soft delete)
    async deleteStudent(id) {
        try {
            const existingStudent = await this.getStudentById(id);
            if (!existingStudent) {
                throw new Error('Student not found');
            }

            return await googleSheetsService.deleteById(this.worksheetName, id);
        } catch (error) {
            console.error('Error deleting student:', error.message);
            throw error;
        }
    }

    // Get student by email
    async getStudentByEmail(email) {
        try {
            const students = await googleSheetsService.search(this.worksheetName, { Email: email });
            const activeStudents = students.filter(student => student.Status !== 'deleted');
            return activeStudents.length > 0 ? activeStudents[0] : null;
        } catch (error) {
            console.error('Error getting student by email:', error.message);
            throw error;
        }
    }

    // Search students
    async searchStudents(searchTerm, page = 1, limit = 10) {
        try {
            const filters = {};
            if (searchTerm) {
                // Search in multiple fields
                const allStudents = await googleSheetsService.getAllData(this.worksheetName);
                const filteredStudents = allStudents.filter(student => {
                    if (student.Status === 'deleted') return false;
                    
                    const searchFields = ['First Name', 'Last Name', 'Email', 'Phone', 'Course'];
                    return searchFields.some(field => {
                        const value = student[field] || '';
                        return value.toLowerCase().includes(searchTerm.toLowerCase());
                    });
                });

                // Manual pagination for search results
                const total = filteredStudents.length;
                const startIndex = (page - 1) * limit;
                const endIndex = startIndex + limit;
                const paginatedData = filteredStudents.slice(startIndex, endIndex);

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

            return await this.getAllStudents(page, limit);
        } catch (error) {
            console.error('Error searching students:', error.message);
            throw error;
        }
    }

    // Get students by course
    async getStudentsByCourse(courseName, page = 1, limit = 10) {
        try {
            return await googleSheetsService.getPaginated(
                this.worksheetName, 
                page, 
                limit, 
                { Course: courseName }
            );
        } catch (error) {
            console.error('Error getting students by course:', error.message);
            throw error;
        }
    }

    // Get student statistics
    async getStudentStats() {
        try {
            const stats = await googleSheetsService.getStats(this.worksheetName);
            const allStudents = await googleSheetsService.getAllData(this.worksheetName);
            const activeStudents = allStudents.filter(student => student.Status !== 'deleted');

            // Count by status
            const statusCounts = {};
            activeStudents.forEach(student => {
                const status = student.Status || 'active';
                statusCounts[status] = (statusCounts[status] || 0) + 1;
            });

            // Count by course
            const courseCounts = {};
            activeStudents.forEach(student => {
                const course = student.Course || 'Not Assigned';
                courseCounts[course] = (courseCounts[course] || 0) + 1;
            });

            return {
                ...stats,
                byStatus: statusCounts,
                byCourse: courseCounts
            };
        } catch (error) {
            console.error('Error getting student statistics:', error.message);
            throw error;
        }
    }

    // Bulk import students
    async bulkImportStudents(studentsData) {
        try {
            const results = [];
            const errors = [];

            for (let i = 0; i < studentsData.length; i++) {
                try {
                    const result = await this.createStudent(studentsData[i]);
                    results.push(result);
                } catch (error) {
                    errors.push({
                        row: i + 1,
                        data: studentsData[i],
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

    // Get recent students
    async getRecentStudents(limit = 5) {
        try {
            const allStudents = await googleSheetsService.getAllData(this.worksheetName);
            const activeStudents = allStudents.filter(student => student.Status !== 'deleted');
            
            // Sort by enrollment date (most recent first)
            const sortedStudents = activeStudents.sort((a, b) => {
                const dateA = new Date(a['Enrollment Date'] || a['Created At']);
                const dateB = new Date(b['Enrollment Date'] || b['Created At']);
                return dateB - dateA;
            });

            return sortedStudents.slice(0, limit);
        } catch (error) {
            console.error('Error getting recent students:', error.message);
            throw error;
        }
    }
}

module.exports = new StudentSheetsService();

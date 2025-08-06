const { google } = require('googleapis');

class GoogleSheetsService {
    constructor() {
        this.spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
        
        // Initialize Google Auth with individual credentials
        this.auth = new google.auth.GoogleAuth({
            credentials: {
                type: 'service_account',
                project_id: process.env.GOOGLE_PROJECT_ID,
                private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
                client_email: process.env.GOOGLE_CLIENT_EMAIL,
            },
            scopes: ['https://www.googleapis.com/auth/spreadsheets']
        });
        
        this.sheets = google.sheets({ version: 'v4', auth: this.auth });
        
        // Worksheet names
        this.worksheetNames = {
            students: process.env.STUDENTS_SHEET_NAME || 'Students',
            courses: process.env.COURSES_SHEET_NAME || 'Courses',
            fees: process.env.FEES_SHEET_NAME || 'Fees',
            attendance: process.env.ATTENDANCE_SHEET_NAME || 'Attendance',
            notices: process.env.NOTICES_SHEET_NAME || 'Notices',
            certificates: process.env.CERTIFICATES_SHEET_NAME || 'Certificates',
            admins: process.env.ADMINS_SHEET_NAME || 'Admins'
        };

        // Headers for each worksheet
        this.headers = {
            students: ['ID', 'First Name', 'Last Name', 'Email', 'Phone', 'Date of Birth', 'Address', 'Course', 'Enrollment Date', 'Status', 'Created At', 'Updated At'],
            courses: ['ID', 'Course Name', 'Description', 'Duration', 'Fee', 'Instructor', 'Start Date', 'End Date', 'Status', 'Created At', 'Updated At'],
            fees: ['ID', 'Student ID', 'Course ID', 'Amount', 'Due Date', 'Paid Date', 'Payment Method', 'Status', 'Created At', 'Updated At'],
            attendance: ['ID', 'Student ID', 'Course ID', 'Date', 'Status', 'Remarks', 'Created At', 'Updated At'],
            notices: ['ID', 'Title', 'Content', 'Target Audience', 'Created Date', 'Expiry Date', 'Status', 'Created At', 'Updated At'],
            certificates: ['ID', 'Student ID', 'Course ID', 'Certificate Type', 'Issue Date', 'Certificate Number', 'Status', 'Created At', 'Updated At'],
            admins: ['ID', 'Name', 'Email', 'Password', 'Role', 'Created Date', 'Last Login', 'Status', 'Created At', 'Updated At']
        };
    }

    // Test connection to Google Sheets
    async testConnection() {
        try {
            // Check if required environment variables are set
            if (!process.env.GOOGLE_CLIENT_EMAIL) {
                throw new Error('GOOGLE_CLIENT_EMAIL not configured in .env file');
            }
            if (!process.env.GOOGLE_PRIVATE_KEY) {
                throw new Error('GOOGLE_PRIVATE_KEY not configured in .env file');
            }
            if (!process.env.GOOGLE_PROJECT_ID) {
                throw new Error('GOOGLE_PROJECT_ID not configured in .env file');
            }
            if (!this.spreadsheetId) {
                throw new Error('GOOGLE_SPREADSHEET_ID not configured in .env file');
            }

            // Test authentication
            const authClient = await this.auth.getClient();
            
            // Test spreadsheet access
            const response = await this.sheets.spreadsheets.get({
                spreadsheetId: this.spreadsheetId,
                auth: authClient
            });
            
            return {
                connected: true,
                spreadsheetTitle: response.data.properties.title,
                spreadsheetId: this.spreadsheetId
            };
        } catch (error) {
            console.error('Google Sheets connection error:', error.message);
            return {
                connected: false,
                error: error.message
            };
        }
    }

    // Get all data from a worksheet
    async getAllData(worksheetName) {
        try {
            const authClient = await this.auth.getClient();
            const range = `${worksheetName}!A:Z`;
            
            const response = await this.sheets.spreadsheets.values.get({
                spreadsheetId: this.spreadsheetId,
                range: range,
                auth: authClient
            });

            const rows = response.data.values || [];
            if (rows.length === 0) return [];

            const headers = rows[0];
            const data = rows.slice(1).map(row => {
                const obj = {};
                headers.forEach((header, index) => {
                    obj[header] = row[index] || '';
                });
                return obj;
            });

            return data;
        } catch (error) {
            console.error(`Error getting data from ${worksheetName}:`, error.message);
            throw error;
        }
    }

    // Get data by ID
    async getById(worksheetName, id) {
        try {
            const allData = await this.getAllData(worksheetName);
            return allData.find(item => item.ID === id.toString());
        } catch (error) {
            console.error(`Error getting data by ID from ${worksheetName}:`, error.message);
            throw error;
        }
    }

    // Add new row to worksheet
    async addRow(worksheetName, data) {
        try {
            const authClient = await this.auth.getClient();
            
            // Generate ID if not provided
            if (!data.ID) {
                data.ID = this.generateId();
            }

            // Add timestamps
            data['Created At'] = new Date().toISOString();
            data['Updated At'] = new Date().toISOString();

            // Get headers for this worksheet
            const headers = this.headers[worksheetName.toLowerCase()] || [];
            
            // Create row data in correct order
            const rowData = headers.map(header => data[header] || '');

            const range = `${worksheetName}!A:A`;
            const response = await this.sheets.spreadsheets.values.append({
                spreadsheetId: this.spreadsheetId,
                range: range,
                valueInputOption: 'RAW',
                auth: authClient,
                resource: {
                    values: [rowData]
                }
            });

            return { success: true, id: data.ID, data: data };
        } catch (error) {
            console.error(`Error adding row to ${worksheetName}:`, error.message);
            throw error;
        }
    }

    // Update row by ID
    async updateById(worksheetName, id, updateData) {
        try {
            const authClient = await this.auth.getClient();
            
            // Find the row index
            const allData = await this.getAllData(worksheetName);
            const rowIndex = allData.findIndex(item => item.ID === id.toString());
            
            if (rowIndex === -1) {
                throw new Error(`Record with ID ${id} not found`);
            }

            // Update timestamp
            updateData['Updated At'] = new Date().toISOString();

            // Get current data and merge with updates
            const currentData = allData[rowIndex];
            const updatedData = { ...currentData, ...updateData };

            // Get headers for this worksheet
            const headers = this.headers[worksheetName.toLowerCase()] || [];
            
            // Create row data in correct order
            const rowData = headers.map(header => updatedData[header] || '');

            // Update the specific row (add 2 because: 1 for 0-based index, 1 for header row)
            const range = `${worksheetName}!A${rowIndex + 2}:Z${rowIndex + 2}`;
            
            await this.sheets.spreadsheets.values.update({
                spreadsheetId: this.spreadsheetId,
                range: range,
                valueInputOption: 'RAW',
                auth: authClient,
                resource: {
                    values: [rowData]
                }
            });

            return { success: true, id: id, data: updatedData };
        } catch (error) {
            console.error(`Error updating row in ${worksheetName}:`, error.message);
            throw error;
        }
    }

    // Delete row by ID (soft delete - mark as deleted)
    async deleteById(worksheetName, id) {
        try {
            return await this.updateById(worksheetName, id, { 
                Status: 'deleted',
                'Updated At': new Date().toISOString()
            });
        } catch (error) {
            console.error(`Error deleting row in ${worksheetName}:`, error.message);
            throw error;
        }
    }

    // Search data with filters
    async search(worksheetName, filters = {}) {
        try {
            let data = await this.getAllData(worksheetName);
            
            // Apply filters
            Object.keys(filters).forEach(key => {
                if (filters[key] !== undefined && filters[key] !== '') {
                    data = data.filter(item => {
                        const value = item[key] || '';
                        return value.toLowerCase().includes(filters[key].toLowerCase());
                    });
                }
            });

            return data;
        } catch (error) {
            console.error(`Error searching in ${worksheetName}:`, error.message);
            throw error;
        }
    }

    // Get paginated data
    async getPaginated(worksheetName, page = 1, limit = 10, filters = {}) {
        try {
            let data = await this.search(worksheetName, filters);
            
            // Filter out deleted records
            data = data.filter(item => item.Status !== 'deleted');
            
            const total = data.length;
            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + limit;
            
            const paginatedData = data.slice(startIndex, endIndex);
            
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
            console.error(`Error getting paginated data from ${worksheetName}:`, error.message);
            throw error;
        }
    }

    // Initialize worksheet with headers
    async initializeWorksheet(worksheetName) {
        try {
            const authClient = await this.auth.getClient();
            const headers = this.headers[worksheetName.toLowerCase()];
            
            if (!headers) {
                throw new Error(`No headers defined for worksheet: ${worksheetName}`);
            }

            // Check if worksheet exists
            const spreadsheet = await this.sheets.spreadsheets.get({
                spreadsheetId: this.spreadsheetId,
                auth: authClient
            });

            const existingSheet = spreadsheet.data.sheets.find(
                sheet => sheet.properties.title === worksheetName
            );

            if (!existingSheet) {
                // Create the worksheet
                await this.sheets.spreadsheets.batchUpdate({
                    spreadsheetId: this.spreadsheetId,
                    auth: authClient,
                    resource: {
                        requests: [{
                            addSheet: {
                                properties: {
                                    title: worksheetName
                                }
                            }
                        }]
                    }
                });
            }

            // Add headers
            const range = `${worksheetName}!A1:Z1`;
            await this.sheets.spreadsheets.values.update({
                spreadsheetId: this.spreadsheetId,
                range: range,
                valueInputOption: 'RAW',
                auth: authClient,
                resource: {
                    values: [headers]
                }
            });

            return { success: true, worksheet: worksheetName, headers: headers };
        } catch (error) {
            console.error(`Error initializing worksheet ${worksheetName}:`, error.message);
            throw error;
        }
    }

    // Generate unique ID
    generateId() {
        return Date.now().toString() + Math.random().toString(36).substr(2, 5);
    }

    // Get worksheet statistics
    async getStats(worksheetName) {
        try {
            const data = await this.getAllData(worksheetName);
            const activeData = data.filter(item => item.Status !== 'deleted');
            
            return {
                total: data.length,
                active: activeData.length,
                deleted: data.length - activeData.length
            };
        } catch (error) {
            console.error(`Error getting stats for ${worksheetName}:`, error.message);
            throw error;
        }
    }

    // Batch operations
    async batchAdd(worksheetName, dataArray) {
        try {
            const results = [];
            for (const data of dataArray) {
                const result = await this.addRow(worksheetName, data);
                results.push(result);
            }
            return { success: true, results: results };
        } catch (error) {
            console.error(`Error in batch add to ${worksheetName}:`, error.message);
            throw error;
        }
    }

    // Clear all data from worksheet (keep headers)
    async clearWorksheet(worksheetName) {
        try {
            const authClient = await this.auth.getClient();
            const range = `${worksheetName}!A2:Z`;
            
            await this.sheets.spreadsheets.values.clear({
                spreadsheetId: this.spreadsheetId,
                range: range,
                auth: authClient
            });
            
            return { success: true, worksheet: worksheetName };
        } catch (error) {
            console.error(`Error clearing worksheet ${worksheetName}:`, error.message);
            throw error;
        }
    }
}

module.exports = new GoogleSheetsService();

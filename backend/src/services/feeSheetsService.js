const googleSheetsService = require('./googleSheetsService');

class FeeSheetsService {
    constructor() {
        this.worksheetName = googleSheetsService.worksheetNames.fees;
    }

    // Get all fees
    async getAllFees(page = 1, limit = 10, filters = {}) {
        try {
            return await googleSheetsService.getPaginated(this.worksheetName, page, limit, filters);
        } catch (error) {
            console.error('Error getting all fees:', error.message);
            throw error;
        }
    }

    // Get fee by ID
    async getFeeById(id) {
        try {
            const fee = await googleSheetsService.getById(this.worksheetName, id);
            if (!fee || fee.Status === 'deleted') {
                return null;
            }
            return fee;
        } catch (error) {
            console.error('Error getting fee by ID:', error.message);
            throw error;
        }
    }

    // Create new fee record
    async createFee(feeData) {
        try {
            // Validate required fields
            const requiredFields = ['Student ID', 'Course ID', 'Amount', 'Due Date'];
            for (const field of requiredFields) {
                if (!feeData[field]) {
                    throw new Error(`${field} is required`);
                }
            }

            // Set default values
            const fee = {
                ...feeData,
                Status: feeData.Status || 'pending',
                'Payment Method': feeData['Payment Method'] || ''
            };

            return await googleSheetsService.addRow(this.worksheetName, fee);
        } catch (error) {
            console.error('Error creating fee:', error.message);
            throw error;
        }
    }

    // Update fee
    async updateFee(id, updateData) {
        try {
            const existingFee = await this.getFeeById(id);
            if (!existingFee) {
                throw new Error('Fee record not found');
            }

            return await googleSheetsService.updateById(this.worksheetName, id, updateData);
        } catch (error) {
            console.error('Error updating fee:', error.message);
            throw error;
        }
    }

    // Delete fee (soft delete)
    async deleteFee(id) {
        try {
            const existingFee = await this.getFeeById(id);
            if (!existingFee) {
                throw new Error('Fee record not found');
            }

            return await googleSheetsService.deleteById(this.worksheetName, id);
        } catch (error) {
            console.error('Error deleting fee:', error.message);
            throw error;
        }
    }

    // Get fees by student ID
    async getFeesByStudentId(studentId, page = 1, limit = 10) {
        try {
            return await googleSheetsService.getPaginated(
                this.worksheetName, 
                page, 
                limit, 
                { 'Student ID': studentId }
            );
        } catch (error) {
            console.error('Error getting fees by student ID:', error.message);
            throw error;
        }
    }

    // Get pending fees
    async getPendingFees(page = 1, limit = 10) {
        try {
            return await googleSheetsService.getPaginated(
                this.worksheetName, 
                page, 
                limit, 
                { Status: 'pending' }
            );
        } catch (error) {
            console.error('Error getting pending fees:', error.message);
            throw error;
        }
    }

    // Mark fee as paid
    async markAsPaid(id, paymentData = {}) {
        try {
            const updateData = {
                Status: 'paid',
                'Paid Date': paymentData['Paid Date'] || new Date().toISOString().split('T')[0],
                'Payment Method': paymentData['Payment Method'] || 'cash'
            };

            return await this.updateFee(id, updateData);
        } catch (error) {
            console.error('Error marking fee as paid:', error.message);
            throw error;
        }
    }

    // Get fee statistics
    async getFeeStats() {
        try {
            const stats = await googleSheetsService.getStats(this.worksheetName);
            const allFees = await googleSheetsService.getAllData(this.worksheetName);
            const activeFees = allFees.filter(fee => fee.Status !== 'deleted');

            // Count by status
            const statusCounts = {};
            activeFees.forEach(fee => {
                const status = fee.Status || 'pending';
                statusCounts[status] = (statusCounts[status] || 0) + 1;
            });

            // Calculate total amounts
            const totalAmount = activeFees.reduce((sum, fee) => {
                return sum + (parseFloat(fee.Amount) || 0);
            }, 0);

            const paidAmount = activeFees
                .filter(fee => fee.Status === 'paid')
                .reduce((sum, fee) => {
                    return sum + (parseFloat(fee.Amount) || 0);
                }, 0);

            const pendingAmount = totalAmount - paidAmount;

            return {
                ...stats,
                byStatus: statusCounts,
                amounts: {
                    total: Math.round(totalAmount * 100) / 100,
                    paid: Math.round(paidAmount * 100) / 100,
                    pending: Math.round(pendingAmount * 100) / 100
                }
            };
        } catch (error) {
            console.error('Error getting fee statistics:', error.message);
            throw error;
        }
    }
}

module.exports = new FeeSheetsService();

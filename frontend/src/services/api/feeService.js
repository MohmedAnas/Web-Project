import apiClient from './apiClient';

/**
 * Fee service for handling fee-related API calls
 */
const feeService = {
  /**
   * Get all fee records
   * @param {Object} params - Query parameters for filtering
   * @returns {Promise} Promise with fee records
   */
  getAllFees: async (params = {}) => {
    try {
      const response = await apiClient.get('/fees', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Get fee records for a specific student
   * @param {string} studentId - Student ID
   * @returns {Promise} Promise with student's fee records
   */
  getStudentFees: async (studentId) => {
    try {
      const response = await apiClient.get(`/students/${studentId}/fees`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Get a specific fee record
   * @param {string} feeId - Fee record ID
   * @returns {Promise} Promise with fee record details
   */
  getFeeById: async (feeId) => {
    try {
      const response = await apiClient.get(`/fees/${feeId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Create a new fee record
   * @param {Object} feeData - Fee record data
   * @returns {Promise} Promise with created fee record
   */
  createFee: async (feeData) => {
    try {
      const response = await apiClient.post('/fees', feeData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Update a fee record
   * @param {string} feeId - Fee record ID
   * @param {Object} feeData - Updated fee data
   * @returns {Promise} Promise with updated fee record
   */
  updateFee: async (feeId, feeData) => {
    try {
      const response = await apiClient.put(`/fees/${feeId}`, feeData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Delete a fee record
   * @param {string} feeId - Fee record ID
   * @returns {Promise} Promise with deletion result
   */
  deleteFee: async (feeId) => {
    try {
      const response = await apiClient.delete(`/fees/${feeId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Record a payment for a fee
   * @param {string} feeId - Fee record ID
   * @param {Object} paymentData - Payment details
   * @returns {Promise} Promise with payment result
   */
  recordPayment: async (feeId, paymentData) => {
    try {
      const response = await apiClient.post(`/fees/${feeId}/payments`, paymentData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Get payment history for a fee
   * @param {string} feeId - Fee record ID
   * @returns {Promise} Promise with payment history
   */
  getPaymentHistory: async (feeId) => {
    try {
      const response = await apiClient.get(`/fees/${feeId}/payments`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Generate a receipt for a payment
   * @param {string} paymentId - Payment ID
   * @returns {Promise} Promise with receipt data
   */
  generateReceipt: async (paymentId) => {
    try {
      const response = await apiClient.get(`/payments/${paymentId}/receipt`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Get fee statistics
   * @returns {Promise} Promise with fee statistics
   */
  getFeeStatistics: async () => {
    try {
      const response = await apiClient.get('/fees/statistics');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default feeService;

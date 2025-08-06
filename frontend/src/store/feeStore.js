import { create } from 'zustand';
import { feeService } from '../services/api';
import { logError } from '../utils/errorHandler';

const useFeeStore = create((set, get) => ({
  // Fee data
  feeRecords: [],
  pendingFees: [],
  paidFees: [],
  loading: false,
  error: null,
  
  // Actions
  setLoading: (status) => set({ loading: status }),
  setError: (error) => set({ error }),
  
  // Fee record actions
  setFeeRecords: (feeRecords) => set({ 
    feeRecords,
    pendingFees: feeRecords.filter(fee => fee.status !== 'PAID'),
    paidFees: feeRecords.filter(fee => fee.status === 'PAID')
  }),
  
  addFeeRecord: async (newFeeData) => {
    set({ loading: true, error: null });
    try {
      // Call API to create new fee record
      const newRecord = await feeService.createFee(newFeeData);
      
      // Update state with new record
      set((state) => ({ 
        feeRecords: [...state.feeRecords, newRecord],
        pendingFees: newRecord.status !== 'PAID' 
          ? [...state.pendingFees, newRecord] 
          : state.pendingFees,
        paidFees: newRecord.status === 'PAID' 
          ? [...state.paidFees, newRecord] 
          : state.paidFees,
        loading: false
      }));
      
      return newRecord;
    } catch (error) {
      logError(error, { action: 'addFeeRecord', data: newFeeData });
      set({ error: error.message, loading: false });
      throw error;
    }
  },
  
  updateFeeRecord: async (feeId, updatedData) => {
    set({ loading: true, error: null });
    try {
      // Call API to update fee record
      const updatedRecord = await feeService.updateFee(feeId, updatedData);
      
      // Update state with updated record
      set((state) => {
        // Update in main records
        const updatedRecords = state.feeRecords.map(record => 
          record.id === feeId ? updatedRecord : record
        );
        
        // Update in pending/paid collections based on status change
        const updatedPending = updatedRecord.status !== 'PAID'
          ? state.pendingFees.some(fee => fee.id === feeId)
            ? state.pendingFees.map(fee => fee.id === feeId ? updatedRecord : fee)
            : [...state.pendingFees, updatedRecord]
          : state.pendingFees.filter(fee => fee.id !== feeId);
            
        const updatedPaid = updatedRecord.status === 'PAID'
          ? state.paidFees.some(fee => fee.id === feeId)
            ? state.paidFees.map(fee => fee.id === feeId ? updatedRecord : fee)
            : [...state.paidFees, updatedRecord]
          : state.paidFees.filter(fee => fee.id !== feeId);
        
        return { 
          feeRecords: updatedRecords,
          pendingFees: updatedPending,
          paidFees: updatedPaid,
          loading: false
        };
      });
      
      return updatedRecord;
    } catch (error) {
      logError(error, { action: 'updateFeeRecord', feeId, data: updatedData });
      set({ error: error.message, loading: false });
      throw error;
    }
  },
  
  deleteFeeRecord: async (feeId) => {
    set({ loading: true, error: null });
    try {
      // Call API to delete fee record
      await feeService.deleteFee(feeId);
      
      // Update state by removing the deleted record
      set((state) => ({
        feeRecords: state.feeRecords.filter(record => record.id !== feeId),
        pendingFees: state.pendingFees.filter(fee => fee.id !== feeId),
        paidFees: state.paidFees.filter(fee => fee.id !== feeId),
        loading: false
      }));
      
      return true;
    } catch (error) {
      logError(error, { action: 'deleteFeeRecord', feeId });
      set({ error: error.message, loading: false });
      throw error;
    }
  },
  
  // Fetch operations with real API
  fetchFeeRecords: async (studentId = null) => {
    set({ loading: true, error: null });
    try {
      let data;
      
      if (studentId) {
        // Fetch fees for specific student
        data = await feeService.getStudentFees(studentId);
      } else {
        // Fetch all fees
        data = await feeService.getAllFees();
      }
      
      // Update state with fetched data
      set({ 
        feeRecords: data,
        pendingFees: data.filter(fee => fee.status !== 'PAID'),
        paidFees: data.filter(fee => fee.status === 'PAID'),
        loading: false
      });
      
      return data;
    } catch (error) {
      logError(error, { action: 'fetchFeeRecords', studentId });
      set({ error: error.message, loading: false });
      throw error;
    }
  },
  
  fetchFeeById: async (feeId) => {
    set({ loading: true, error: null });
    try {
      // Call API to get fee by ID
      const feeRecord = await feeService.getFeeById(feeId);
      
      // Update the fee in the state if it exists
      set((state) => {
        const exists = state.feeRecords.some(fee => fee.id === feeId);
        
        if (exists) {
          return get().updateFeeRecord(feeId, feeRecord);
        }
        
        // If the fee doesn't exist in state, add it
        return {
          feeRecords: [...state.feeRecords, feeRecord],
          pendingFees: feeRecord.status !== 'PAID' 
            ? [...state.pendingFees, feeRecord] 
            : state.pendingFees,
          paidFees: feeRecord.status === 'PAID' 
            ? [...state.paidFees, feeRecord] 
            : state.paidFees,
          loading: false
        };
      });
      
      return feeRecord;
    } catch (error) {
      logError(error, { action: 'fetchFeeById', feeId });
      set({ error: error.message, loading: false });
      throw error;
    }
  },
  
  // Payment processing with real API
  recordPayment: async (paymentDetails) => {
    set({ loading: true, error: null });
    try {
      const { feeId, ...paymentData } = paymentDetails;
      
      // Call API to record payment
      const result = await feeService.recordPayment(feeId, paymentData);
      
      // Fetch updated fee record to ensure state is in sync with backend
      await get().fetchFeeById(feeId);
      
      set({ loading: false });
      return result;
    } catch (error) {
      logError(error, { action: 'recordPayment', data: paymentDetails });
      set({ error: error.message, loading: false });
      throw error;
    }
  },
  
  getPaymentHistory: async (feeId) => {
    set({ loading: true, error: null });
    try {
      // Call API to get payment history
      const paymentHistory = await feeService.getPaymentHistory(feeId);
      set({ loading: false });
      return paymentHistory;
    } catch (error) {
      logError(error, { action: 'getPaymentHistory', feeId });
      set({ error: error.message, loading: false });
      throw error;
    }
  },
  
  generateReceipt: async (paymentId) => {
    set({ loading: true, error: null });
    try {
      // Call API to generate receipt
      const receiptData = await feeService.generateReceipt(paymentId);
      set({ loading: false });
      return receiptData;
    } catch (error) {
      logError(error, { action: 'generateReceipt', paymentId });
      set({ error: error.message, loading: false });
      throw error;
    }
  },
  
  getFeeStatistics: async () => {
    set({ loading: true, error: null });
    try {
      // Call API to get fee statistics
      const statistics = await feeService.getFeeStatistics();
      set({ loading: false });
      return statistics;
    } catch (error) {
      logError(error, { action: 'getFeeStatistics' });
      set({ error: error.message, loading: false });
      throw error;
    }
  }
}));

export default useFeeStore;

import { act, renderHook } from '@testing-library/react';
import useFeeStore from '../feeStore';
import { feeService } from '../../services/api';

// Mock the fee service
jest.mock('../../services/api', () => ({
  feeService: {
    getAllFees: jest.fn(),
    getStudentFees: jest.fn(),
    getFeeById: jest.fn(),
    createFee: jest.fn(),
    updateFee: jest.fn(),
    deleteFee: jest.fn(),
    recordPayment: jest.fn(),
    getPaymentHistory: jest.fn(),
    generateReceipt: jest.fn(),
    getFeeStatistics: jest.fn()
  }
}));

// Sample fee data for testing
const mockFeeData = [
  {
    id: 'fee-1',
    studentId: 'student-1',
    studentName: 'John Doe',
    courseName: 'Web Development',
    totalAmount: 15000,
    amountPaid: 10000,
    status: 'PARTIAL'
  },
  {
    id: 'fee-2',
    studentId: 'student-2',
    studentName: 'Jane Smith',
    courseName: 'Graphic Design',
    totalAmount: 12000,
    amountPaid: 12000,
    status: 'PAID'
  },
  {
    id: 'fee-3',
    studentId: 'student-3',
    studentName: 'Robert Johnson',
    courseName: 'Mobile App Development',
    totalAmount: 18000,
    amountPaid: 0,
    status: 'PENDING'
  }
];

describe('Fee Store', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Reset the store state
    const { result } = renderHook(() => useFeeStore());
    act(() => {
      result.current.setFeeRecords([]);
      result.current.setError(null);
      result.current.setLoading(false);
    });
  });
  
  test('initializes with default state', () => {
    const { result } = renderHook(() => useFeeStore());
    
    expect(result.current.feeRecords).toEqual([]);
    expect(result.current.pendingFees).toEqual([]);
    expect(result.current.paidFees).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });
  
  test('setFeeRecords updates state and categorizes fees', () => {
    const { result } = renderHook(() => useFeeStore());
    
    act(() => {
      result.current.setFeeRecords(mockFeeData);
    });
    
    expect(result.current.feeRecords).toEqual(mockFeeData);
    expect(result.current.pendingFees).toHaveLength(2); // PARTIAL and PENDING
    expect(result.current.paidFees).toHaveLength(1); // PAID
    expect(result.current.pendingFees[0].id).toBe('fee-1');
    expect(result.current.pendingFees[1].id).toBe('fee-3');
    expect(result.current.paidFees[0].id).toBe('fee-2');
  });
  
  test('fetchFeeRecords calls API and updates state', async () => {
    // Mock API response
    feeService.getAllFees.mockResolvedValue(mockFeeData);
    
    const { result } = renderHook(() => useFeeStore());
    
    await act(async () => {
      await result.current.fetchFeeRecords();
    });
    
    // Check if API was called
    expect(feeService.getAllFees).toHaveBeenCalledTimes(1);
    
    // Check if state was updated
    expect(result.current.feeRecords).toEqual(mockFeeData);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });
  
  test('fetchFeeRecords with studentId calls getStudentFees', async () => {
    // Mock API response
    const studentFees = mockFeeData.filter(fee => fee.studentId === 'student-1');
    feeService.getStudentFees.mockResolvedValue(studentFees);
    
    const { result } = renderHook(() => useFeeStore());
    
    await act(async () => {
      await result.current.fetchFeeRecords('student-1');
    });
    
    // Check if API was called with correct parameter
    expect(feeService.getStudentFees).toHaveBeenCalledWith('student-1');
    
    // Check if state was updated
    expect(result.current.feeRecords).toEqual(studentFees);
  });
  
  test('fetchFeeRecords handles API error', async () => {
    // Mock API error
    const errorMessage = 'Failed to fetch fees';
    feeService.getAllFees.mockRejectedValue(new Error(errorMessage));
    
    const { result } = renderHook(() => useFeeStore());
    
    await act(async () => {
      try {
        await result.current.fetchFeeRecords();
      } catch (error) {
        // Error is expected
      }
    });
    
    // Check if state reflects error
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(errorMessage);
  });
  
  test('recordPayment calls API with correct data', async () => {
    // Mock API response
    const paymentResult = {
      id: 'payment-new',
      fee_id: 'fee-1',
      amount_paid: 5000,
      payment_method: 'cash',
      receipt_number: 'REC-1005',
      payment_date: '2023-07-15',
      created_at: '2023-07-15T10:30:00Z'
    };
    feeService.recordPayment.mockResolvedValue(paymentResult);
    
    // Mock fetchFeeById to update state after payment
    const updatedFee = {
      ...mockFeeData[0],
      amountPaid: 15000,
      status: 'PAID'
    };
    feeService.getFeeById.mockResolvedValue(updatedFee);
    
    const { result } = renderHook(() => useFeeStore());
    
    // Set initial state
    act(() => {
      result.current.setFeeRecords(mockFeeData);
    });
    
    // Payment details
    const paymentDetails = {
      feeId: 'fee-1',
      amount_paid: 5000,
      payment_method: 'cash',
      receipt_number: 'REC-1005',
      payment_date: '2023-07-15'
    };
    
    await act(async () => {
      await result.current.recordPayment(paymentDetails);
    });
    
    // Check if API was called with correct parameters
    expect(feeService.recordPayment).toHaveBeenCalledWith('fee-1', {
      amount_paid: 5000,
      payment_method: 'cash',
      receipt_number: 'REC-1005',
      payment_date: '2023-07-15'
    });
    
    // Check if fetchFeeById was called to update state
    expect(feeService.getFeeById).toHaveBeenCalledWith('fee-1');
  });
  
  test('addFeeRecord calls API and updates state', async () => {
    // Mock API response
    const newFee = {
      id: 'fee-new',
      studentId: 'student-4',
      studentName: 'Emily Wilson',
      courseName: 'Data Science',
      totalAmount: 20000,
      amountPaid: 0,
      status: 'PENDING'
    };
    feeService.createFee.mockResolvedValue(newFee);
    
    const { result } = renderHook(() => useFeeStore());
    
    // Set initial state
    act(() => {
      result.current.setFeeRecords(mockFeeData);
    });
    
    await act(async () => {
      await result.current.addFeeRecord({
        studentId: 'student-4',
        studentName: 'Emily Wilson',
        courseName: 'Data Science',
        totalAmount: 20000
      });
    });
    
    // Check if API was called
    expect(feeService.createFee).toHaveBeenCalledTimes(1);
    
    // Check if state was updated
    expect(result.current.feeRecords).toHaveLength(4);
    expect(result.current.feeRecords[3]).toEqual(newFee);
    expect(result.current.pendingFees).toContainEqual(newFee);
  });
  
  test('updateFeeRecord calls API and updates state', async () => {
    // Mock API response
    const updatedFee = {
      ...mockFeeData[0],
      totalAmount: 18000,
      amountPaid: 15000,
      status: 'PARTIAL'
    };
    feeService.updateFee.mockResolvedValue(updatedFee);
    
    const { result } = renderHook(() => useFeeStore());
    
    // Set initial state
    act(() => {
      result.current.setFeeRecords(mockFeeData);
    });
    
    await act(async () => {
      await result.current.updateFeeRecord('fee-1', {
        totalAmount: 18000,
        amountPaid: 15000
      });
    });
    
    // Check if API was called with correct parameters
    expect(feeService.updateFee).toHaveBeenCalledWith('fee-1', {
      totalAmount: 18000,
      amountPaid: 15000
    });
    
    // Check if state was updated
    expect(result.current.feeRecords[0]).toEqual(updatedFee);
    expect(result.current.pendingFees).toContainEqual(updatedFee);
  });
  
  test('deleteFeeRecord calls API and updates state', async () => {
    // Mock API response
    feeService.deleteFee.mockResolvedValue({});
    
    const { result } = renderHook(() => useFeeStore());
    
    // Set initial state
    act(() => {
      result.current.setFeeRecords(mockFeeData);
    });
    
    await act(async () => {
      await result.current.deleteFeeRecord('fee-1');
    });
    
    // Check if API was called with correct parameter
    expect(feeService.deleteFee).toHaveBeenCalledWith('fee-1');
    
    // Check if state was updated
    expect(result.current.feeRecords).toHaveLength(2);
    expect(result.current.feeRecords.find(fee => fee.id === 'fee-1')).toBeUndefined();
    expect(result.current.pendingFees.find(fee => fee.id === 'fee-1')).toBeUndefined();
  });
});

import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FeeManagement from '../FeeManagement';
import { ToastProvider } from '../../../components/common';
import { mockFees } from '../../../mocks/mockData/fees';
import { mockStudents } from '../../../mocks/mockData/students';

// Mock the stores
jest.mock('../../../store', () => ({
  useFeeStore: () => ({
    feeRecords: mockFees,
    pendingFees: mockFees.filter(fee => fee.status !== 'PAID'),
    paidFees: mockFees.filter(fee => fee.status === 'PAID'),
    loading: false,
    error: null,
    fetchFeeRecords: jest.fn().mockResolvedValue(mockFees),
    recordPayment: jest.fn().mockImplementation((paymentData) => {
      return Promise.resolve({
        id: 'payment-new',
        ...paymentData
      });
    }),
    fetchFeeById: jest.fn().mockImplementation((feeId) => {
      const fee = mockFees.find(f => f.id === feeId);
      return Promise.resolve(fee);
    })
  }),
  useStudentStore: () => ({
    students: mockStudents,
    loading: false,
    fetchStudents: jest.fn().mockResolvedValue(mockStudents)
  })
}));

// Mock the components
jest.mock('../../../components/fees/FeePaymentForm', () => {
  return function MockFeePaymentForm({ feeRecord, onSuccess, onCancel }) {
    return (
      <div data-testid="fee-payment-form">
        <h2>Record Fee Payment</h2>
        <p>Student: {feeRecord.studentName}</p>
        <p>Course: {feeRecord.courseName}</p>
        <button onClick={onSuccess}>Submit Payment</button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    );
  };
});

jest.mock('../../../components/fees/FeePaymentHistory', () => {
  return function MockFeePaymentHistory({ paymentHistory }) {
    return (
      <div data-testid="fee-payment-history">
        <h3>Payment History</h3>
        <p>Total Payments: {paymentHistory?.length || 0}</p>
      </div>
    );
  };
});

jest.mock('../../../components/fees/FeeReceipt', () => {
  return function MockFeeReceipt({ payment, student, course }) {
    return (
      <div data-testid="fee-receipt">
        <h3>Fee Receipt</h3>
        <p>Student: {student.name}</p>
        <p>Course: {course.name}</p>
        <p>Amount: {payment.amount}</p>
      </div>
    );
  };
});

// Test wrapper with toast provider
const renderWithToast = (ui) => {
  return render(
    <ToastProvider>
      {ui}
    </ToastProvider>
  );
};

describe('FeeManagement Page Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('renders fee management page with fee records', async () => {
    renderWithToast(<FeeManagement />);
    
    // Check if page title is rendered
    expect(screen.getByText('Fee Management')).toBeInTheDocument();
    
    // Check if fee records are rendered
    await waitFor(() => {
      expect(screen.getByText('Fee Records')).toBeInTheDocument();
      
      // Check if at least one fee record is displayed
      mockFees.forEach(fee => {
        expect(screen.getByText(fee.studentName)).toBeInTheDocument();
        expect(screen.getByText(fee.courseName)).toBeInTheDocument();
      });
    });
  });
  
  test('filters fee records by status', async () => {
    const user = userEvent.setup();
    renderWithToast(<FeeManagement />);
    
    // Wait for page to load
    await waitFor(() => {
      expect(screen.getByText('Fee Records')).toBeInTheDocument();
    });
    
    // Select "Paid" filter
    await user.selectOptions(screen.getByRole('combobox'), 'paid');
    
    // Check if only paid fees are displayed
    await waitFor(() => {
      // Count the number of rows in the table (excluding header)
      const paidFees = mockFees.filter(fee => fee.status === 'PAID');
      
      // Check if each paid fee is displayed
      paidFees.forEach(fee => {
        expect(screen.getByText(fee.studentName)).toBeInTheDocument();
      });
      
      // Check if pending fees are not displayed
      const pendingFee = mockFees.find(fee => fee.status === 'PENDING');
      expect(screen.queryByText(pendingFee.studentName)).not.toBeInTheDocument();
    });
  });
  
  test('searches fee records by student name', async () => {
    const user = userEvent.setup();
    renderWithToast(<FeeManagement />);
    
    // Wait for page to load
    await waitFor(() => {
      expect(screen.getByText('Fee Records')).toBeInTheDocument();
    });
    
    // Search for a specific student
    const searchTerm = 'John';
    await user.type(screen.getByPlaceholderText(/Search by name, ID or course/i), searchTerm);
    
    // Check if only matching fees are displayed
    await waitFor(() => {
      const matchingFees = mockFees.filter(fee => 
        fee.studentName.includes(searchTerm) || 
        fee.studentId.includes(searchTerm) || 
        fee.courseName.includes(searchTerm)
      );
      
      // Check if each matching fee is displayed
      matchingFees.forEach(fee => {
        expect(screen.getByText(fee.studentName)).toBeInTheDocument();
      });
      
      // Check if non-matching fees are not displayed
      const nonMatchingFee = mockFees.find(fee => !fee.studentName.includes(searchTerm));
      if (nonMatchingFee) {
        expect(screen.queryByText(nonMatchingFee.studentName)).not.toBeInTheDocument();
      }
    });
  });
  
  test('views fee details when clicking View button', async () => {
    const user = userEvent.setup();
    renderWithToast(<FeeManagement />);
    
    // Wait for page to load
    await waitFor(() => {
      expect(screen.getByText('Fee Records')).toBeInTheDocument();
    });
    
    // Click View button for the first fee
    const viewButtons = screen.getAllByText('View');
    await user.click(viewButtons[0]);
    
    // Check if fee details are displayed
    await waitFor(() => {
      expect(screen.getByText('Fee Details')).toBeInTheDocument();
      expect(screen.getByText('Payment History')).toBeInTheDocument();
      
      // Check if back button is displayed
      expect(screen.getByText('← Back to Fee List')).toBeInTheDocument();
    });
  });
  
  test('opens payment form when clicking Pay button', async () => {
    const user = userEvent.setup();
    renderWithToast(<FeeManagement />);
    
    // Wait for page to load
    await waitFor(() => {
      expect(screen.getByText('Fee Records')).toBeInTheDocument();
    });
    
    // Find a fee with pending status
    const pendingFee = mockFees.find(fee => fee.status !== 'PAID');
    
    // Find the row containing this fee
    const rows = screen.getAllByRole('row');
    let payButton;
    
    for (const row of rows) {
      if (within(row).queryByText(pendingFee.studentName)) {
        payButton = within(row).getByText('Pay');
        break;
      }
    }
    
    // Click Pay button
    await user.click(payButton);
    
    // Check if payment form is displayed
    await waitFor(() => {
      expect(screen.getByTestId('fee-payment-form')).toBeInTheDocument();
      expect(screen.getByText('← Back to Fee Management')).toBeInTheDocument();
    });
  });
  
  test('completes payment flow and shows receipt', async () => {
    const user = userEvent.setup();
    renderWithToast(<FeeManagement />);
    
    // Wait for page to load
    await waitFor(() => {
      expect(screen.getByText('Fee Records')).toBeInTheDocument();
    });
    
    // Find a fee with pending status
    const pendingFee = mockFees.find(fee => fee.status !== 'PAID');
    
    // Find the row containing this fee
    const rows = screen.getAllByRole('row');
    let payButton;
    
    for (const row of rows) {
      if (within(row).queryByText(pendingFee.studentName)) {
        payButton = within(row).getByText('Pay');
        break;
      }
    }
    
    // Click Pay button
    await user.click(payButton);
    
    // Wait for payment form to be displayed
    await waitFor(() => {
      expect(screen.getByTestId('fee-payment-form')).toBeInTheDocument();
    });
    
    // Submit the payment form
    await user.click(screen.getByText('Submit Payment'));
    
    // Check if receipt is displayed
    await waitFor(() => {
      expect(screen.getByTestId('fee-receipt')).toBeInTheDocument();
    });
  });
  
  test('returns to fee list when clicking back button', async () => {
    const user = userEvent.setup();
    renderWithToast(<FeeManagement />);
    
    // Wait for page to load
    await waitFor(() => {
      expect(screen.getByText('Fee Records')).toBeInTheDocument();
    });
    
    // Click View button for the first fee
    const viewButtons = screen.getAllByText('View');
    await user.click(viewButtons[0]);
    
    // Wait for fee details to be displayed
    await waitFor(() => {
      expect(screen.getByText('Fee Details')).toBeInTheDocument();
    });
    
    // Click back button
    await user.click(screen.getByText('← Back to Fee List'));
    
    // Check if fee list is displayed again
    await waitFor(() => {
      expect(screen.getByText('Fee Records')).toBeInTheDocument();
    });
  });
});

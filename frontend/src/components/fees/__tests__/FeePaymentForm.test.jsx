import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FeePaymentForm from '../FeePaymentForm';
import { ToastProvider } from '../../common/Toast';
import { mockFees } from '../../../mocks/mockData/fees';

// Mock the fee store
jest.mock('../../../store', () => ({
  useFeeStore: () => ({
    recordPayment: jest.fn().mockImplementation((paymentData) => {
      return Promise.resolve({
        id: 'payment-new',
        ...paymentData
      });
    })
  })
}));

// Sample fee record for testing
const feeRecord = mockFees[0];

// Test wrapper with toast provider
const renderWithToast = (ui) => {
  return render(
    <ToastProvider>
      {ui}
    </ToastProvider>
  );
};

describe('FeePaymentForm Component', () => {
  test('renders the form with fee details', () => {
    renderWithToast(<FeePaymentForm feeRecord={feeRecord} onSuccess={jest.fn()} onCancel={jest.fn()} />);
    
    // Check if fee details are displayed
    expect(screen.getByText('Record Fee Payment')).toBeInTheDocument();
    expect(screen.getByText('Student Name')).toBeInTheDocument();
    expect(screen.getByText(feeRecord.studentName)).toBeInTheDocument();
    expect(screen.getByText('Course')).toBeInTheDocument();
    expect(screen.getByText(feeRecord.courseName)).toBeInTheDocument();
    expect(screen.getByText('Total Fee')).toBeInTheDocument();
    expect(screen.getByText(`₹${feeRecord.totalAmount}`)).toBeInTheDocument();
    expect(screen.getByText('Amount Paid')).toBeInTheDocument();
    expect(screen.getByText(`₹${feeRecord.amountPaid}`)).toBeInTheDocument();
    expect(screen.getByText('Remaining Amount')).toBeInTheDocument();
    
    // Check if form fields are present
    expect(screen.getByLabelText(/Amount to Pay/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Payment Method/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Receipt Number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Payment Date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Remarks/i)).toBeInTheDocument();
    
    // Check if buttons are present
    expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Record Payment/i })).toBeInTheDocument();
  });
  
  test('initializes form with correct values', () => {
    renderWithToast(<FeePaymentForm feeRecord={feeRecord} onSuccess={jest.fn()} onCancel={jest.fn()} />);
    
    // Calculate remaining amount
    const remainingAmount = feeRecord.totalAmount - feeRecord.amountPaid;
    
    // Check initial form values
    expect(screen.getByLabelText(/Amount to Pay/i)).toHaveValue(remainingAmount);
    expect(screen.getByLabelText(/Payment Method/i)).toHaveValue('cash');
    expect(screen.getByLabelText(/Receipt Number/i)).toHaveValue('');
    expect(screen.getByLabelText(/Remarks/i)).toHaveValue('');
  });
  
  test('validates required fields', async () => {
    const user = userEvent.setup();
    renderWithToast(<FeePaymentForm feeRecord={feeRecord} onSuccess={jest.fn()} onCancel={jest.fn()} />);
    
    // Clear required fields
    await user.clear(screen.getByLabelText(/Amount to Pay/i));
    await user.clear(screen.getByLabelText(/Receipt Number/i));
    
    // Submit the form
    await user.click(screen.getByRole('button', { name: /Record Payment/i }));
    
    // Check for validation errors
    await waitFor(() => {
      expect(screen.getByText(/Amount is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Receipt number is required/i)).toBeInTheDocument();
    });
  });
  
  test('validates amount does not exceed remaining balance', async () => {
    const user = userEvent.setup();
    renderWithToast(<FeePaymentForm feeRecord={feeRecord} onSuccess={jest.fn()} onCancel={jest.fn()} />);
    
    // Enter an amount that exceeds remaining balance
    const remainingAmount = feeRecord.totalAmount - feeRecord.amountPaid;
    await user.clear(screen.getByLabelText(/Amount to Pay/i));
    await user.type(screen.getByLabelText(/Amount to Pay/i), (remainingAmount + 1000).toString());
    
    // Move focus to trigger validation
    await user.tab();
    
    // Check for validation error
    await waitFor(() => {
      expect(screen.getByText(new RegExp(`Amount cannot exceed remaining balance of ₹${remainingAmount}`))).toBeInTheDocument();
    });
  });
  
  test('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();
    const onCancel = jest.fn();
    renderWithToast(<FeePaymentForm feeRecord={feeRecord} onSuccess={jest.fn()} onCancel={onCancel} />);
    
    // Click cancel button
    await user.click(screen.getByRole('button', { name: /Cancel/i }));
    
    // Check if onCancel was called
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
  
  test('submits form with correct data and calls onSuccess', async () => {
    const user = userEvent.setup();
    const onSuccess = jest.fn();
    const { useFeeStore } = require('../../../store');
    const recordPayment = useFeeStore().recordPayment;
    
    renderWithToast(<FeePaymentForm feeRecord={feeRecord} onSuccess={onSuccess} onCancel={jest.fn()} />);
    
    // Fill in the form
    await user.clear(screen.getByLabelText(/Receipt Number/i));
    await user.type(screen.getByLabelText(/Receipt Number/i), 'REC-1005');
    await user.selectOptions(screen.getByLabelText(/Payment Method/i), 'upi');
    await user.type(screen.getByLabelText(/Remarks/i), 'Test payment');
    
    // Submit the form
    await user.click(screen.getByRole('button', { name: /Record Payment/i }));
    
    // Check if recordPayment was called with correct data
    await waitFor(() => {
      expect(recordPayment).toHaveBeenCalledWith(expect.objectContaining({
        feeId: feeRecord.id,
        amount_paid: feeRecord.totalAmount - feeRecord.amountPaid,
        payment_method: 'upi',
        receipt_number: 'REC-1005',
        remarks: 'Test payment'
      }));
      
      // Check if onSuccess was called
      expect(onSuccess).toHaveBeenCalledTimes(1);
    });
  });
  
  test('shows error message when payment fails', async () => {
    const user = userEvent.setup();
    const { useFeeStore } = require('../../../store');
    
    // Mock the recordPayment function to reject
    useFeeStore().recordPayment.mockImplementationOnce(() => {
      return Promise.reject(new Error('Payment failed'));
    });
    
    renderWithToast(<FeePaymentForm feeRecord={feeRecord} onSuccess={jest.fn()} onCancel={jest.fn()} />);
    
    // Fill in the form
    await user.clear(screen.getByLabelText(/Receipt Number/i));
    await user.type(screen.getByLabelText(/Receipt Number/i), 'REC-1005');
    
    // Submit the form
    await user.click(screen.getByRole('button', { name: /Record Payment/i }));
    
    // Check if error message is displayed
    await waitFor(() => {
      expect(screen.getByText(/Error/i)).toBeInTheDocument();
      expect(screen.getByText(/Payment failed/i)).toBeInTheDocument();
    });
  });
});

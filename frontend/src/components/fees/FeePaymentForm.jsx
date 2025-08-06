import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useFeeStore } from '../../store';
import { useToast } from '../common/Toast';
import LoadingIndicator from '../common/LoadingIndicator';
import { parseApiError, logError } from '../../utils/errorHandler';

const paymentMethods = [
  { id: 'cash', label: 'Cash' },
  { id: 'cheque', label: 'Cheque' },
  { id: 'bank_transfer', label: 'Bank Transfer' },
  { id: 'upi', label: 'UPI' },
];

const FeePaymentForm = ({ feeRecord, onSuccess, onCancel }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const recordPayment = useFeeStore(state => state.recordPayment);
  const toast = useToast();
  
  const remainingAmount = feeRecord.totalAmount - (feeRecord.amountPaid || 0);
  
  const formik = useFormik({
    initialValues: {
      amountPaid: remainingAmount,
      paymentMethod: 'cash',
      receiptNumber: '',
      paymentDate: new Date().toISOString().split('T')[0],
      remarks: '',
    },
    validationSchema: Yup.object({
      amountPaid: Yup.number()
        .required('Amount is required')
        .positive('Amount must be positive')
        .max(remainingAmount, `Amount cannot exceed remaining balance of ₹${remainingAmount}`),
      paymentMethod: Yup.string().required('Payment method is required'),
      receiptNumber: Yup.string().required('Receipt number is required'),
      paymentDate: Yup.date().required('Payment date is required'),
      remarks: Yup.string(),
    }),
    onSubmit: async (values) => {
      setIsSubmitting(true);
      setFormError(null);
      
      try {
        // Format payment data for API
        const paymentData = {
          feeId: feeRecord.id,
          amount_paid: values.amountPaid,
          payment_method: values.paymentMethod,
          receipt_number: values.receiptNumber,
          payment_date: values.paymentDate,
          remarks: values.remarks || undefined,
        };
        
        // Process the payment through API
        await recordPayment(paymentData);
        
        // Show success message
        toast.success('Payment recorded successfully');
        
        // Call the success callback
        if (onSuccess) onSuccess();
      } catch (error) {
        // Log the error
        logError(error, { 
          component: 'FeePaymentForm', 
          action: 'recordPayment',
          studentId: feeRecord.studentId,
          feeId: feeRecord.id
        });
        
        // Set form error
        const errorMessage = parseApiError(error);
        setFormError(errorMessage);
        
        // Show error toast
        toast.error('Failed to record payment. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Record Fee Payment</h2>
      
      {/* Student and fee details */}
      <div className="mb-4 sm:mb-6 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div>
          <p className="text-sm text-gray-600">Student Name</p>
          <p className="font-medium">{feeRecord.studentName}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Course</p>
          <p className="font-medium">{feeRecord.courseName}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Total Fee</p>
          <p className="font-medium">₹{feeRecord.totalAmount}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Amount Paid</p>
          <p className="font-medium">₹{feeRecord.amountPaid || 0}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Remaining Amount</p>
          <p className="font-medium text-red-600">₹{remainingAmount}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Due Date</p>
          <p className="font-medium">{feeRecord.dueDate || 'N/A'}</p>
        </div>
      </div>
      
      {/* Form error message */}
      {formError && (
        <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700">
          <p className="font-medium">Error</p>
          <p className="text-sm">{formError}</p>
        </div>
      )}
      
      {/* Payment form */}
      <form onSubmit={formik.handleSubmit}>
        <div className="space-y-4">
          <div>
            <label htmlFor="amountPaid" className="block text-sm font-medium text-gray-700">
              Amount to Pay
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">₹</span>
              </div>
              <input
                type="number"
                id="amountPaid"
                name="amountPaid"
                className={`block w-full pl-7 pr-12 py-2 rounded-md ${
                  formik.touched.amountPaid && formik.errors.amountPaid
                    ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                }`}
                placeholder="0.00"
                aria-describedby="amount-error"
                value={formik.values.amountPaid}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            </div>
            {formik.touched.amountPaid && formik.errors.amountPaid ? (
              <p className="mt-2 text-sm text-red-600" id="amount-error">
                {formik.errors.amountPaid}
              </p>
            ) : null}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700">
                Payment Method
              </label>
              <select
                id="paymentMethod"
                name="paymentMethod"
                className={`mt-1 block w-full py-2 px-3 border rounded-md shadow-sm ${
                  formik.touched.paymentMethod && formik.errors.paymentMethod
                    ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                }`}
                value={formik.values.paymentMethod}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              >
                {paymentMethods.map((method) => (
                  <option key={method.id} value={method.id}>
                    {method.label}
                  </option>
                ))}
              </select>
              {formik.touched.paymentMethod && formik.errors.paymentMethod ? (
                <p className="mt-2 text-sm text-red-600">{formik.errors.paymentMethod}</p>
              ) : null}
            </div>

            <div>
              <label htmlFor="receiptNumber" className="block text-sm font-medium text-gray-700">
                Receipt Number
              </label>
              <input
                type="text"
                id="receiptNumber"
                name="receiptNumber"
                className={`mt-1 block w-full py-2 px-3 border rounded-md shadow-sm ${
                  formik.touched.receiptNumber && formik.errors.receiptNumber
                    ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                }`}
                value={formik.values.receiptNumber}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.receiptNumber && formik.errors.receiptNumber ? (
                <p className="mt-2 text-sm text-red-600">{formik.errors.receiptNumber}</p>
              ) : null}
            </div>
          </div>

          <div>
            <label htmlFor="paymentDate" className="block text-sm font-medium text-gray-700">
              Payment Date
            </label>
            <input
              type="date"
              id="paymentDate"
              name="paymentDate"
              className={`mt-1 block w-full py-2 px-3 border rounded-md shadow-sm ${
                formik.touched.paymentDate && formik.errors.paymentDate
                  ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500'
                  : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
              }`}
              value={formik.values.paymentDate}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.paymentDate && formik.errors.paymentDate ? (
              <p className="mt-2 text-sm text-red-600">{formik.errors.paymentDate}</p>
            ) : null}
          </div>

          <div>
            <label htmlFor="remarks" className="block text-sm font-medium text-gray-700">
              Remarks
            </label>
            <textarea
              id="remarks"
              name="remarks"
              rows={3}
              className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              value={formik.values.remarks}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
          </div>

          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
            <button
              type="button"
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 w-full sm:w-auto"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 w-full sm:w-auto"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                'Record Payment'
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default FeePaymentForm;

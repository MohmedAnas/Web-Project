import React, { useState, useEffect } from 'react';
import { useFeeStore } from '../../store';
import FeePaymentHistory from '../../components/fees/FeePaymentHistory';
import { ErrorBoundary, LoadingIndicator, SkeletonLoader, useToast } from '../../components/common';
import { parseApiError, logError } from '../../utils/errorHandler';

const StudentFees = () => {
  const [selectedFee, setSelectedFee] = useState(null);
  const { feeRecords, loading, error, fetchFeeRecords } = useFeeStore();
  const toast = useToast();
  
  // In a real app, we would get the student ID from authentication context
  const currentStudentId = "STUDENT123"; // This would come from auth context
  
  useEffect(() => {
    const loadFees = async () => {
      try {
        // Fetch fees for the current student
        await fetchFeeRecords(currentStudentId);
      } catch (error) {
        logError(error, { component: 'StudentFees', action: 'loadFees', studentId: currentStudentId });
        toast.error('Failed to load fee data. Please refresh the page.');
      }
    };
    
    loadFees();
  }, [fetchFeeRecords, currentStudentId, toast]);
  
  const handleViewDetails = (fee) => {
    setSelectedFee(fee);
  };
  
  // Calculate total stats
  const totalFeeAmount = feeRecords.reduce((sum, fee) => sum + fee.totalAmount, 0);
  const totalPaidAmount = feeRecords.reduce((sum, fee) => sum + (fee.amountPaid || 0), 0);
  const totalRemainingAmount = totalFeeAmount - totalPaidAmount;
  
  // Render loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6">My Fees</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8">
          <SkeletonLoader type="card" />
          <SkeletonLoader type="card" />
          <SkeletonLoader type="card" />
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
          <SkeletonLoader type="table" lines={3} />
        </div>
      </div>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6">My Fees</h1>
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                {parseApiError(error)}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <ErrorBoundary>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">My Fees</h1>
        
        {/* Fee summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">Total Fee</h3>
            <p className="text-2xl sm:text-3xl font-bold text-blue-600">₹{totalFeeAmount}</p>
          </div>
          
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">Paid Amount</h3>
            <p className="text-2xl sm:text-3xl font-bold text-green-600">₹{totalPaidAmount}</p>
          </div>
          
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">Remaining</h3>
            <p className="text-2xl sm:text-3xl font-bold text-red-600">₹{totalRemainingAmount}</p>
          </div>
        </div>
        
        {selectedFee ? (
          <div>
            <button 
              onClick={() => setSelectedFee(null)}
              className="mb-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
              aria-label="Back to fee list"
            >
              ← Back to Fee List
            </button>
            
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md mb-6">
              <h2 className="text-xl sm:text-2xl font-bold mb-4">Fee Details</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-600">Course</p>
                  <p className="font-medium">{selectedFee.courseName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Batch</p>
                  <p className="font-medium">{selectedFee.batch || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Fee</p>
                  <p className="font-medium">₹{selectedFee.totalAmount}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Amount Paid</p>
                  <p className="font-medium">₹{selectedFee.amountPaid || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Remaining Amount</p>
                  <p className="font-medium text-red-600">
                    ₹{selectedFee.totalAmount - (selectedFee.amountPaid || 0)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p className={`font-medium ${
                    selectedFee.status === 'PAID' ? 'text-green-600' : 
                    selectedFee.status === 'PARTIAL' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {selectedFee.status === 'PAID' ? 'Paid' : 
                     selectedFee.status === 'PARTIAL' ? 'Partially Paid' : 'Pending'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Due Date</p>
                  <p className="font-medium">{selectedFee.dueDate || 'N/A'}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
              <h2 className="text-xl sm:text-2xl font-bold mb-4">Payment History</h2>
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <div className="inline-block min-w-full py-2 align-middle px-4 sm:px-0">
                  <FeePaymentHistory paymentHistory={selectedFee.paymentHistory || []} />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
            <h2 className="text-xl sm:text-2xl font-bold mb-4">Fee Records</h2>
            
            {/* Desktop view */}
            <div className="hidden sm:block overflow-x-auto -mx-4 sm:mx-0">
              <div className="inline-block min-w-full py-2 align-middle px-4 sm:px-0">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Course
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Fee
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Paid
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Remaining
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Due Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {feeRecords.length > 0 ? (
                      feeRecords.map((fee) => (
                        <tr key={fee.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {fee.courseName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ₹{fee.totalAmount}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ₹{fee.amountPaid || 0}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                            ₹{fee.totalAmount - (fee.amountPaid || 0)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {fee.dueDate || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              fee.status === 'PAID' ? 'bg-green-100 text-green-800' : 
                              fee.status === 'PARTIAL' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {fee.status === 'PAID' ? 'Paid' : 
                               fee.status === 'PARTIAL' ? 'Partial' : 'Pending'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => handleViewDetails(fee)}
                              className="text-blue-600 hover:text-blue-900"
                              aria-label={`View details for ${fee.courseName}`}
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                          No fee records found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Mobile view */}
            <div className="sm:hidden">
              <h3 className="sr-only">Fee Records (Mobile View)</h3>
              {feeRecords.length > 0 ? (
                <div className="space-y-4">
                  {feeRecords.map((fee) => (
                    <div key={fee.id} className="bg-white border rounded-lg overflow-hidden">
                      <div className="px-4 py-5 sm:px-6 bg-gray-50">
                        <h3 className="text-lg font-medium text-gray-900">{fee.courseName}</h3>
                        <p className="mt-1 max-w-2xl text-sm text-gray-500">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            fee.status === 'PAID' ? 'bg-green-100 text-green-800' : 
                            fee.status === 'PARTIAL' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {fee.status === 'PAID' ? 'Paid' : 
                             fee.status === 'PARTIAL' ? 'Partial' : 'Pending'}
                          </span>
                        </p>
                      </div>
                      <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
                        <dl className="sm:divide-y sm:divide-gray-200">
                          <div className="py-3 grid grid-cols-2 gap-4 px-4">
                            <dt className="text-sm font-medium text-gray-500">Total Fee</dt>
                            <dd className="text-sm text-gray-900">₹{fee.totalAmount}</dd>
                          </div>
                          <div className="py-3 grid grid-cols-2 gap-4 px-4">
                            <dt className="text-sm font-medium text-gray-500">Paid</dt>
                            <dd className="text-sm text-gray-900">₹{fee.amountPaid || 0}</dd>
                          </div>
                          <div className="py-3 grid grid-cols-2 gap-4 px-4">
                            <dt className="text-sm font-medium text-gray-500">Remaining</dt>
                            <dd className="text-sm text-red-600">₹{fee.totalAmount - (fee.amountPaid || 0)}</dd>
                          </div>
                          <div className="py-3 grid grid-cols-2 gap-4 px-4">
                            <dt className="text-sm font-medium text-gray-500">Due Date</dt>
                            <dd className="text-sm text-gray-900">{fee.dueDate || 'N/A'}</dd>
                          </div>
                        </dl>
                      </div>
                      <div className="border-t border-gray-200 px-4 py-4 flex justify-end">
                        <button
                          onClick={() => handleViewDetails(fee)}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  No fee records found.
                </div>
              )}
            </div>
            
            <div className="mt-6 bg-blue-50 border-l-4 border-blue-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    For any fee-related queries or to make a payment, please visit the institute office during working hours.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default StudentFees;

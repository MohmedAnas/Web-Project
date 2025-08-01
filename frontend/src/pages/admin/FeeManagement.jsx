import React, { useState, useEffect } from 'react';
import { useFeeStore, useStudentStore } from '../../store';
import FeePaymentForm from '../../components/fees/FeePaymentForm';
import FeePaymentHistory from '../../components/fees/FeePaymentHistory';
import FeeReceipt from '../../components/fees/FeeReceipt';
import { ErrorBoundary, LoadingIndicator, SkeletonLoader, useToast } from '../common';
import { parseApiError, logError } from '../../utils/errorHandler';

const FeeManagement = () => {
  const [selectedFee, setSelectedFee] = useState(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const toast = useToast();

  // Get data from stores
  const { 
    feeRecords, 
    pendingFees, 
    paidFees, 
    loading: feeLoading, 
    error: feeError,
    fetchFeeRecords 
  } = useFeeStore();
  
  const { 
    students, 
    loading: studentLoading, 
    fetchStudents 
  } = useStudentStore();

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchFeeRecords();
        await fetchStudents();
      } catch (error) {
        logError(error, { component: 'FeeManagement', action: 'loadData' });
        toast.error('Failed to load fee data. Please refresh the page.');
      }
    };
    
    loadData();
  }, [fetchFeeRecords, fetchStudents, toast]);

  // Filter fees based on status and search query
  const getFilteredFees = () => {
    let filteredFees = [];
    
    switch (filterStatus) {
      case 'pending':
        filteredFees = pendingFees;
        break;
      case 'paid':
        filteredFees = paidFees;
        break;
      default:
        filteredFees = feeRecords;
    }
    
    if (searchQuery.trim() === '') {
      return filteredFees;
    }
    
    const query = searchQuery.toLowerCase();
    return filteredFees.filter(fee => 
      fee.studentName?.toLowerCase().includes(query) ||
      fee.studentId?.toLowerCase().includes(query) ||
      fee.courseName?.toLowerCase().includes(query)
    );
  };

  const handleRecordPayment = (fee) => {
    setSelectedFee(fee);
    setShowPaymentForm(true);
    setShowReceipt(false);
  };

  const handleViewHistory = (fee) => {
    setSelectedFee(fee);
    setShowPaymentForm(false);
    setShowReceipt(false);
  };

  const handlePaymentSuccess = () => {
    setShowPaymentForm(false);
    // Optionally show receipt after payment
    setShowReceipt(true);
    
    try {
      // Get the updated fee record
      const updatedFee = feeRecords.find(fee => fee.id === selectedFee.id);
      
      if (!updatedFee || !updatedFee.paymentHistory || updatedFee.paymentHistory.length === 0) {
        throw new Error('Payment data not found');
      }
      
      // Get the latest payment from history
      const latestPayment = updatedFee.paymentHistory[updatedFee.paymentHistory.length - 1];
      
      // Find student data
      const student = students.find(s => s.id === updatedFee.studentId);
      
      // Set receipt data
      setReceiptData({
        payment: latestPayment,
        student: student || { id: updatedFee.studentId, name: updatedFee.studentName },
        course: { name: updatedFee.courseName },
        feeType: 'Course Fee'
      });
    } catch (error) {
      logError(error, { component: 'FeeManagement', action: 'handlePaymentSuccess' });
      toast.error('Failed to generate receipt. The payment was recorded successfully.');
      setShowReceipt(false);
    }
  };

  const handleCloseReceipt = () => {
    setShowReceipt(false);
    setReceiptData(null);
  };

  // Render loading state
  if (feeLoading || studentLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Fee Management</h1>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <SkeletonLoader type="table" lines={5} />
        </div>
      </div>
    );
  }

  // Render error state
  if (feeError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Fee Management</h1>
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                {parseApiError(feeError)}
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
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Fee Management</h1>
        
        {showReceipt && receiptData ? (
          <div>
            <button 
              onClick={handleCloseReceipt}
              className="mb-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              ← Back to Fee Management
            </button>
            <FeeReceipt 
              payment={receiptData.payment}
              student={receiptData.student}
              course={receiptData.course}
              receiptData={receiptData}
            />
          </div>
        ) : showPaymentForm && selectedFee ? (
          <div>
            <button 
              onClick={() => setShowPaymentForm(false)}
              className="mb-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              ← Back to Fee Management
            </button>
            <FeePaymentForm 
              feeRecord={selectedFee} 
              onSuccess={handlePaymentSuccess}
              onCancel={() => setShowPaymentForm(false)}
            />
          </div>
        ) : selectedFee ? (
          <div>
            <button 
              onClick={() => setSelectedFee(null)}
              className="mb-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              ← Back to Fee List
            </button>
            
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md mb-6">
              <h2 className="text-xl sm:text-2xl font-bold mb-4">Fee Details</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-gray-600">Student Name</p>
                  <p className="font-medium">{selectedFee.studentName}</p>
                </div>
                <div>
                  <p className="text-gray-600">Student ID</p>
                  <p className="font-medium">{selectedFee.studentId}</p>
                </div>
                <div>
                  <p className="text-gray-600">Course</p>
                  <p className="font-medium">{selectedFee.courseName}</p>
                </div>
                <div>
                  <p className="text-gray-600">Batch</p>
                  <p className="font-medium">{selectedFee.batch || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-600">Total Fee</p>
                  <p className="font-medium">₹{selectedFee.totalAmount}</p>
                </div>
                <div>
                  <p className="text-gray-600">Amount Paid</p>
                  <p className="font-medium">₹{selectedFee.amountPaid || 0}</p>
                </div>
                <div>
                  <p className="text-gray-600">Remaining Amount</p>
                  <p className="font-medium text-red-600">
                    ₹{selectedFee.totalAmount - (selectedFee.amountPaid || 0)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Status</p>
                  <p className={`font-medium ${
                    selectedFee.status === 'PAID' ? 'text-green-600' : 
                    selectedFee.status === 'PARTIAL' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {selectedFee.status === 'PAID' ? 'Paid' : 
                     selectedFee.status === 'PARTIAL' ? 'Partially Paid' : 'Pending'}
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end">
                <button
                  onClick={() => handleRecordPayment(selectedFee)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  disabled={selectedFee.status === 'PAID'}
                >
                  Record Payment
                </button>
              </div>
            </div>
            
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
              <h2 className="text-xl sm:text-2xl font-bold mb-4">Payment History</h2>
              <FeePaymentHistory paymentHistory={selectedFee.paymentHistory || []} />
            </div>
          </div>
        ) : (
          <div>
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md mb-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                <h2 className="text-xl sm:text-2xl font-bold mb-2 md:mb-0">Fee Records</h2>
                
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search by name, ID or course..."
                      className="w-full md:w-64 px-4 py-2 border rounded-md"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  
                  <select
                    className="px-4 py-2 border rounded-md"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="all">All Fees</option>
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                  </select>
                </div>
              </div>
              
              <div className="overflow-x-auto -mx-4 sm:-mx-6">
                <div className="inline-block min-w-full py-2 align-middle px-4 sm:px-6">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Student
                        </th>
                        <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Course
                        </th>
                        <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total Fee
                        </th>
                        <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Paid
                        </th>
                        <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Remaining
                        </th>
                        <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {getFilteredFees().length > 0 ? (
                        getFilteredFees().map((fee) => (
                          <tr key={fee.id} className="hover:bg-gray-50">
                            <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{fee.studentName}</div>
                              <div className="text-xs text-gray-500">{fee.studentId}</div>
                            </td>
                            <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {fee.courseName}
                            </td>
                            <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              ₹{fee.totalAmount}
                            </td>
                            <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              ₹{fee.amountPaid || 0}
                            </td>
                            <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-red-600">
                              ₹{fee.totalAmount - (fee.amountPaid || 0)}
                            </td>
                            <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                fee.status === 'PAID' ? 'bg-green-100 text-green-800' : 
                                fee.status === 'PARTIAL' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {fee.status === 'PAID' ? 'Paid' : 
                                 fee.status === 'PARTIAL' ? 'Partial' : 'Pending'}
                              </span>
                            </td>
                            <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={() => handleViewHistory(fee)}
                                className="text-blue-600 hover:text-blue-900 mr-3"
                                aria-label={`View details for ${fee.studentName}`}
                              >
                                View
                              </button>
                              {fee.status !== 'PAID' && (
                                <button
                                  onClick={() => handleRecordPayment(fee)}
                                  className="text-green-600 hover:text-green-900"
                                  aria-label={`Record payment for ${fee.studentName}`}
                                >
                                  Pay
                                </button>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="7" className="px-3 sm:px-6 py-4 text-center text-gray-500">
                            {searchQuery ? 'No matching fee records found.' : 'No fee records found.'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              
              {/* Mobile view for small screens - card layout */}
              <div className="sm:hidden mt-4">
                <h3 className="sr-only">Fee Records (Mobile View)</h3>
                {getFilteredFees().length > 0 ? (
                  <div className="space-y-4">
                    {getFilteredFees().map((fee) => (
                      <div key={fee.id} className="bg-white border rounded-lg overflow-hidden">
                        <div className="px-4 py-5 sm:px-6 bg-gray-50">
                          <h3 className="text-lg font-medium text-gray-900">{fee.studentName}</h3>
                          <p className="mt-1 max-w-2xl text-sm text-gray-500">{fee.studentId}</p>
                        </div>
                        <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
                          <dl className="sm:divide-y sm:divide-gray-200">
                            <div className="py-3 grid grid-cols-2 gap-4 px-4">
                              <dt className="text-sm font-medium text-gray-500">Course</dt>
                              <dd className="text-sm text-gray-900">{fee.courseName}</dd>
                            </div>
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
                              <dt className="text-sm font-medium text-gray-500">Status</dt>
                              <dd className="text-sm">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  fee.status === 'PAID' ? 'bg-green-100 text-green-800' : 
                                  fee.status === 'PARTIAL' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                                }`}>
                                  {fee.status === 'PAID' ? 'Paid' : 
                                   fee.status === 'PARTIAL' ? 'Partial' : 'Pending'}
                                </span>
                              </dd>
                            </div>
                          </dl>
                        </div>
                        <div className="border-t border-gray-200 px-4 py-4 flex justify-end space-x-3">
                          <button
                            onClick={() => handleViewHistory(fee)}
                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm"
                          >
                            View
                          </button>
                          {fee.status !== 'PAID' && (
                            <button
                              onClick={() => handleRecordPayment(fee)}
                              className="px-3 py-1 bg-green-100 text-green-700 rounded-md text-sm"
                            >
                              Pay
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    {searchQuery ? 'No matching fee records found.' : 'No fee records found.'}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default FeeManagement;

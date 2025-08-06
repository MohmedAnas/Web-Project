import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CreditCard, 
  Calendar, 
  AlertCircle,
  Download,
  CheckCircle,
  Clock
} from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

// Mock data - in a real app, this would come from API
const mockFeesData = {
  student_id: "STU001",
  name: "Rahul Sharma",
  course: "Web Development",
  total_fee: 25000,
  paid_amount: 15000,
  due_amount: 10000,
  payment_schedule: [
    { 
      id: 1, 
      amount: 5000, 
      due_date: "2023-08-15", 
      payment_date: "2023-08-14", 
      status: "paid", 
      receipt_no: "REC001",
      payment_method: "Online Transfer"
    },
    { 
      id: 2, 
      amount: 5000, 
      due_date: "2023-09-15", 
      payment_date: "2023-09-16", 
      status: "paid", 
      receipt_no: "REC002",
      payment_method: "Cash"
    },
    { 
      id: 3, 
      amount: 5000, 
      due_date: "2023-10-15", 
      payment_date: "2023-10-12", 
      status: "paid", 
      receipt_no: "REC003",
      payment_method: "Online Transfer"
    },
    { 
      id: 4, 
      amount: 5000, 
      due_date: "2023-11-15", 
      payment_date: null, 
      status: "pending", 
      receipt_no: null,
      payment_method: null
    },
    { 
      id: 5, 
      amount: 5000, 
      due_date: "2023-12-15", 
      payment_date: null, 
      status: "pending", 
      receipt_no: null,
      payment_method: null
    }
  ]
};

const StudentFees = () => {
  const [feesData, setFeesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    // Simulate API call
    const fetchFeesData = async () => {
      try {
        // In a real app, you would fetch data from your API
        // const response = await studentAPI.getFees();
        // setFeesData(response.data);
        
        // Simulate API delay
        setTimeout(() => {
          setFeesData(mockFeesData);
          setLoading(false);
        }, 800);
      } catch (error) {
        console.error('Error fetching fees data:', error);
        setLoading(false);
        toast.error('Failed to load fees data');
      }
    };

    fetchFeesData();
  }, []);

  const handlePayNow = () => {
    // In a real app, this would open a payment gateway or redirect to payment page
    setShowPaymentModal(true);
  };

  const downloadReceipt = (receiptNo) => {
    // In a real app, this would trigger a file download
    toast.success(`Downloading receipt ${receiptNo}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-student-primary"></div>
      </div>
    );
  }

  // Find next payment due
  const nextPayment = feesData.payment_schedule.find(payment => payment.status === 'pending');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Fee Status</h1>
      </div>

      {/* Fee Summary */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Total Fee */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-50 p-3 rounded-lg">
                <CreditCard className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">Total Fee</p>
                <p className="text-2xl font-semibold text-gray-900">₹{feesData.total_fee.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Paid Amount */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-50 p-3 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">Paid Amount</p>
                <p className="text-2xl font-semibold text-gray-900">₹{feesData.paid_amount.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Due Amount */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-red-50 p-3 rounded-lg">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">Due Amount</p>
                <p className="text-2xl font-semibold text-gray-900">₹{feesData.due_amount.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Payment Progress */}
      <motion.div 
        className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Payment Progress</h2>
          
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Payment Completion</span>
              <span className="text-sm font-medium text-gray-700">
                {Math.round((feesData.paid_amount / feesData.total_fee) * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-green-500 h-2.5 rounded-full" 
                style={{ width: `${(feesData.paid_amount / feesData.total_fee) * 100}%` }}
              ></div>
            </div>
          </div>
          
          {nextPayment && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <Clock className="h-5 w-5 text-yellow-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">Next Payment Due</h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>Amount: ₹{nextPayment.amount.toLocaleString()}</p>
                    <p>Due Date: {format(new Date(nextPayment.due_date), 'MMMM d, yyyy')}</p>
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={handlePayNow}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-student-primary hover:bg-student-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-student-primary"
                    >
                      Pay Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Payment History */}
      <motion.div 
        className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="text-lg font-medium text-gray-900">Payment History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Method
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Receipt
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {feesData.payment_schedule.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {format(new Date(payment.due_date), 'MMM d, yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₹{payment.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {payment.payment_date 
                      ? format(new Date(payment.payment_date), 'MMM d, yyyy')
                      : '-'
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {payment.payment_method || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {payment.status === 'paid' ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Paid
                      </span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {payment.receipt_no ? (
                      <button
                        onClick={() => downloadReceipt(payment.receipt_no)}
                        className="text-student-primary hover:text-student-secondary flex items-center"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        {payment.receipt_no}
                      </button>
                    ) : (
                      '-'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Payment Modal - In a real app, this would be a more sophisticated payment form */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div 
            className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4">Make Payment</h2>
            <p className="text-gray-600 mb-6">
              This is a placeholder for a payment gateway integration. In a real application, 
              this would connect to a payment processor.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Amount:</span>
                <span className="font-medium">₹{nextPayment?.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Due Date:</span>
                <span className="font-medium">
                  {nextPayment ? format(new Date(nextPayment.due_date), 'MMMM d, yyyy') : ''}
                </span>
              </div>
            </div>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  toast.success('Payment simulation successful!');
                  setShowPaymentModal(false);
                }}
                className="px-4 py-2 bg-student-primary text-white rounded-md hover:bg-student-secondary"
              >
                Simulate Payment
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default StudentFees;

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

const PaymentRecordModal = ({ student, onClose, onSubmit }) => {
  const [amount, setAmount] = useState(student.due_amount);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [paymentDate, setPaymentDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [receiptNumber, setReceiptNumber] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      amount: parseInt(amount, 10),
      paymentMethod,
      paymentDate,
      receiptNumber,
      notes
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div 
        className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="text-xl font-bold text-gray-900 mb-4">Record Payment</h2>
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Student:</span>
            <span className="font-medium">{student.name}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Student ID:</span>
            <span className="font-medium">{student.student_id}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Course:</span>
            <span className="font-medium">{student.course}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Total Fee:</span>
            <span className="font-medium">₹{student.total_fee.toLocaleString()}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Paid Amount:</span>
            <span className="font-medium">₹{student.paid_amount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Due Amount:</span>
            <span className="font-medium">₹{student.due_amount.toLocaleString()}</span>
          </div>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
              Payment Amount (₹)
            </label>
            <input
              type="number"
              id="amount"
              min="1"
              max={student.due_amount}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary focus:border-admin-primary"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-1">
              Payment Method
            </label>
            <select
              id="paymentMethod"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary focus:border-admin-primary"
              required
            >
              <option value="cash">Cash</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="check">Check</option>
              <option value="upi">UPI</option>
            </select>
          </div>
          <div className="mb-4">
            <label htmlFor="paymentDate" className="block text-sm font-medium text-gray-700 mb-1">
              Payment Date
            </label>
            <input
              type="date"
              id="paymentDate"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary focus:border-admin-primary"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="receiptNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Receipt Number (Optional)
            </label>
            <input
              type="text"
              id="receiptNumber"
              value={receiptNumber}
              onChange={(e) => setReceiptNumber(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary focus:border-admin-primary"
            />
          </div>
          <div className="mb-6">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              Notes (Optional)
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows="2"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary focus:border-admin-primary"
            ></textarea>
          </div>
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-admin-primary text-white rounded-md hover:bg-admin-secondary"
            >
              Record Payment
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default PaymentRecordModal;

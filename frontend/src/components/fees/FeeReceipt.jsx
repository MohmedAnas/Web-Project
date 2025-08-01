import React, { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';

const FeeReceipt = ({ payment, student, course, receiptData }) => {
  const receiptRef = useRef();
  
  const handlePrint = useReactToPrint({
    content: () => receiptRef.current,
    documentTitle: `Receipt-${payment.receiptNumber}`,
  });

  // Format date to DD/MM/YYYY
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex justify-end mb-4">
        <button
          onClick={handlePrint}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Print Receipt
        </button>
      </div>

      {/* Receipt Template */}
      <div 
        ref={receiptRef} 
        className="bg-white border border-gray-200 p-8 shadow-md"
        style={{ minHeight: '29.7cm', width: '21cm', margin: '0 auto' }}
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">R.B Computer</h1>
          <p className="text-gray-600">123 Education Street, Tech City</p>
          <p className="text-gray-600">Phone: 123-456-7890 | Email: info@rbcomputer.com</p>
        </div>

        <div className="border-b-2 border-gray-300 pb-4 mb-6">
          <h2 className="text-2xl font-bold text-center">RECEIPT</h2>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div>
            <p><span className="font-semibold">Receipt No:</span> {payment.receiptNumber}</p>
            <p><span className="font-semibold">Student ID:</span> {student.id}</p>
            <p><span className="font-semibold">Student Name:</span> {student.name}</p>
            <p><span className="font-semibold">Course:</span> {course.name}</p>
          </div>
          <div className="text-right">
            <p><span className="font-semibold">Date:</span> {formatDate(payment.date)}</p>
            <p><span className="font-semibold">Batch:</span> {student.batch}</p>
            <p><span className="font-semibold">Payment Mode:</span> {
              payment.method === 'cash' ? 'Cash' :
              payment.method === 'cheque' ? 'Cheque' :
              payment.method === 'bank_transfer' ? 'Bank Transfer' :
              payment.method === 'upi' ? 'UPI' : payment.method
            }</p>
          </div>
        </div>

        <table className="min-w-full border border-gray-200 mb-8">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border-b border-r text-left">Description</th>
              <th className="py-2 px-4 border-b border-r text-right">Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="py-2 px-4 border-b border-r">
                {course.name} - {receiptData.feeType || 'Course Fee'}
              </td>
              <td className="py-2 px-4 border-b text-right">{payment.amount.toFixed(2)}</td>
            </tr>
            {/* Add more rows if needed */}
            <tr className="bg-gray-50">
              <td className="py-2 px-4 border-b border-r font-semibold">Total</td>
              <td className="py-2 px-4 border-b text-right font-semibold">{payment.amount.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>

        <div className="mb-8">
          <p className="font-semibold">Amount in words:</p>
          <p>{receiptData.amountInWords || `${payment.amount} Rupees Only`}</p>
        </div>

        {payment.remarks && (
          <div className="mb-8">
            <p className="font-semibold">Remarks:</p>
            <p>{payment.remarks}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 mt-16">
          <div>
            <p className="font-semibold">Student Signature</p>
          </div>
          <div className="text-right">
            <p className="font-semibold">Authorized Signature</p>
          </div>
        </div>

        <div className="mt-16 pt-4 border-t border-gray-200 text-center text-sm text-gray-500">
          <p>This is a computer-generated receipt and does not require a physical signature.</p>
          <p>Thank you for choosing R.B Computer for your education needs!</p>
        </div>
      </div>
    </div>
  );
};

export default FeeReceipt;

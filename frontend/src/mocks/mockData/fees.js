export const mockFees = [
  {
    id: 'fee-1',
    studentId: 'student-1',
    studentName: 'John Doe',
    courseName: 'Web Development',
    courseId: 'course-1',
    batch: 'Morning',
    totalAmount: 15000,
    amountPaid: 10000,
    dueDate: '2023-12-31',
    status: 'PARTIAL',
    createdAt: '2023-01-15T10:30:00Z',
    updatedAt: '2023-06-10T14:45:00Z',
    lastPaymentDate: '2023-06-10',
    lastPaymentMethod: 'cash',
    lastReceiptNumber: 'REC-1001',
    paymentHistory: [
      {
        id: 'payment-1',
        amount: 5000,
        date: '2023-03-15',
        method: 'cash',
        receiptNumber: 'REC-1000',
        remarks: 'Initial payment'
      },
      {
        id: 'payment-2',
        amount: 5000,
        date: '2023-06-10',
        method: 'cash',
        receiptNumber: 'REC-1001',
        remarks: 'Second installment'
      }
    ]
  },
  {
    id: 'fee-2',
    studentId: 'student-2',
    studentName: 'Jane Smith',
    courseName: 'Graphic Design',
    courseId: 'course-2',
    batch: 'Evening',
    totalAmount: 12000,
    amountPaid: 12000,
    dueDate: '2023-11-30',
    status: 'PAID',
    createdAt: '2023-02-20T09:15:00Z',
    updatedAt: '2023-05-05T11:30:00Z',
    lastPaymentDate: '2023-05-05',
    lastPaymentMethod: 'bank_transfer',
    lastReceiptNumber: 'REC-1002',
    paymentHistory: [
      {
        id: 'payment-3',
        amount: 12000,
        date: '2023-05-05',
        method: 'bank_transfer',
        receiptNumber: 'REC-1002',
        remarks: 'Full payment'
      }
    ]
  },
  {
    id: 'fee-3',
    studentId: 'student-3',
    studentName: 'Robert Johnson',
    courseName: 'Mobile App Development',
    courseId: 'course-3',
    batch: 'Afternoon',
    totalAmount: 18000,
    amountPaid: 0,
    dueDate: '2023-10-15',
    status: 'PENDING',
    createdAt: '2023-03-10T14:20:00Z',
    updatedAt: '2023-03-10T14:20:00Z',
    paymentHistory: []
  },
  {
    id: 'fee-4',
    studentId: 'student-1',
    studentName: 'John Doe',
    courseName: 'Advanced JavaScript',
    courseId: 'course-4',
    batch: 'Weekend',
    totalAmount: 8000,
    amountPaid: 4000,
    dueDate: '2023-09-30',
    status: 'PARTIAL',
    createdAt: '2023-04-05T10:00:00Z',
    updatedAt: '2023-06-15T16:30:00Z',
    lastPaymentDate: '2023-06-15',
    lastPaymentMethod: 'cheque',
    lastReceiptNumber: 'REC-1003',
    paymentHistory: [
      {
        id: 'payment-4',
        amount: 4000,
        date: '2023-06-15',
        method: 'cheque',
        receiptNumber: 'REC-1003',
        remarks: 'First installment'
      }
    ]
  },
  {
    id: 'fee-5',
    studentId: 'student-4',
    studentName: 'Emily Wilson',
    courseName: 'Data Science',
    courseId: 'course-5',
    batch: 'Morning',
    totalAmount: 25000,
    amountPaid: 25000,
    dueDate: '2023-08-31',
    status: 'PAID',
    createdAt: '2023-01-25T11:45:00Z',
    updatedAt: '2023-02-10T09:30:00Z',
    lastPaymentDate: '2023-02-10',
    lastPaymentMethod: 'upi',
    lastReceiptNumber: 'REC-1004',
    paymentHistory: [
      {
        id: 'payment-5',
        amount: 25000,
        date: '2023-02-10',
        method: 'upi',
        receiptNumber: 'REC-1004',
        remarks: 'Full payment'
      }
    ]
  }
];

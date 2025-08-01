import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

// Import custom components
import FeeStatistics from '../../components/admin/fees/FeeStatistics';
import SearchAndFilters from '../../components/admin/fees/SearchAndFilters';
import FeeStatusTable from '../../components/admin/fees/FeeStatusTable';
import PaymentRecordModal from '../../components/admin/fees/PaymentRecordModal';

// Mock data - in a real app, this would come from API
const mockFeesData = {
  summary: {
    totalFees: 250000,
    collectedFees: 175000,
    pendingFees: 75000,
    overdueAmount: 25000,
    thisMonthCollection: 45000,
    lastMonthCollection: 40000
  },
  students: [
    {
      id: 1,
      student_id: "STU001",
      name: "Rahul Sharma",
      course: "Web Development",
      total_fee: 25000,
      paid_amount: 15000,
      due_amount: 10000,
      next_due_date: "2023-11-15",
      status: "current"
    },
    {
      id: 2,
      student_id: "STU002",
      name: "Priya Patel",
      course: "Digital Marketing",
      total_fee: 20000,
      paid_amount: 15000,
      due_amount: 5000,
      next_due_date: "2023-11-20",
      status: "current"
    },
    {
      id: 3,
      student_id: "STU003",
      name: "Amit Kumar",
      course: "Python Programming",
      total_fee: 22000,
      paid_amount: 11000,
      due_amount: 11000,
      next_due_date: "2023-10-15",
      status: "overdue"
    },
    {
      id: 4,
      student_id: "STU004",
      name: "Neha Singh",
      course: "Graphic Design",
      total_fee: 18000,
      paid_amount: 18000,
      due_amount: 0,
      next_due_date: null,
      status: "paid"
    },
    {
      id: 5,
      student_id: "STU005",
      name: "Rajesh Verma",
      course: "Web Development",
      total_fee: 25000,
      paid_amount: 20000,
      due_amount: 5000,
      next_due_date: "2023-12-01",
      status: "current"
    }
  ],
  total: 5,
  page: 1,
  limit: 10
};

const FeesManagement = () => {
  const [feesData, setFeesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    status: 'all',
    course: 'all',
  });
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    // Simulate API call
    const fetchFeesData = async () => {
      try {
        // In a real app, you would fetch data from your API
        // const response = await adminAPI.getFeesData({ page: currentPage, limit: 10, ...filters });
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
  }, [currentPage, filters]);

  const handleSearch = (searchTerm) => {
    // In a real app, this would trigger a new API call with the search term
    toast.success(`Searching for: ${searchTerm}`);
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleRecordPayment = (student) => {
    setSelectedStudent(student);
    setShowPaymentModal(true);
  };

  const handlePaymentSubmit = async (paymentData) => {
    try {
      // In a real app, this would call the API to record the payment
      // await adminAPI.recordPayment(selectedStudent.id, paymentData);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Update local state to reflect the payment
      const { amount } = paymentData;
      setFeesData(prev => ({
        ...prev,
        students: prev.students.map(s => {
          if (s.id === selectedStudent.id) {
            const newPaidAmount = s.paid_amount + amount;
            const newDueAmount = s.total_fee - newPaidAmount;
            return {
              ...s,
              paid_amount: newPaidAmount,
              due_amount: newDueAmount,
              status: newDueAmount <= 0 ? 'paid' : s.status
            };
          }
          return s;
        }),
        summary: {
          ...prev.summary,
          collectedFees: prev.summary.collectedFees + amount,
          pendingFees: prev.summary.pendingFees - amount,
          thisMonthCollection: prev.summary.thisMonthCollection + amount
        }
      }));
      
      toast.success(`Payment recorded successfully for ${selectedStudent.name}`);
      setShowPaymentModal(false);
      setSelectedStudent(null);
    } catch (error) {
      console.error('Error recording payment:', error);
      toast.error('Failed to record payment');
    }
  };

  const handleExport = () => {
    // In a real app, this would trigger a CSV/Excel export
    toast.success('Exporting fees data');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-admin-primary"></div>
      </div>
    );
  }

  // Get unique courses for filters
  const courses = ['all', ...new Set(feesData.students.map(student => student.course))];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Fee Management</h1>
      </div>

      {/* Fee Statistics */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <FeeStatistics statistics={feesData.summary} />
      </motion.div>

      {/* Search and Filters */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <SearchAndFilters 
          onSearch={handleSearch}
          onFilterChange={handleFilterChange}
          onExport={handleExport}
          filters={filters}
          courses={courses}
        />
      </motion.div>

      {/* Fees Table */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <FeeStatusTable 
          students={feesData.students}
          currentPage={currentPage}
          totalStudents={feesData.total}
          limit={feesData.limit}
          onPageChange={setCurrentPage}
          onRecordPayment={handleRecordPayment}
        />
      </motion.div>

      {/* Payment Modal */}
      {showPaymentModal && selectedStudent && (
        <PaymentRecordModal 
          student={selectedStudent}
          onClose={() => setShowPaymentModal(false)}
          onSubmit={handlePaymentSubmit}
        />
      )}
    </div>
  );
};

export default FeesManagement;

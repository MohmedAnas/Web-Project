import React from 'react';
import { motion } from 'framer-motion';
import { 
  CreditCard, 
  CheckCircle, 
  AlertCircle,
  Clock,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

const FeeStatistics = ({ statistics }) => {
  const {
    totalFees,
    collectedFees,
    pendingFees,
    overdueAmount,
    thisMonthCollection,
    lastMonthCollection
  } = statistics;

  // Calculate month-over-month change
  const monthlyChange = thisMonthCollection - lastMonthCollection;
  const monthlyChangePercent = lastMonthCollection > 0 
    ? Math.round((monthlyChange / lastMonthCollection) * 100) 
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Total Fees */}
      <motion.div 
        className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-blue-50 p-3 rounded-lg">
              <CreditCard className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">Total Fees</p>
              <p className="text-2xl font-semibold text-gray-900">₹{totalFees.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Collected Fees */}
      <motion.div 
        className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-50 p-3 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">Collected Fees</p>
              <p className="text-2xl font-semibold text-gray-900">₹{collectedFees.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">
                {Math.round((collectedFees / totalFees) * 100)}% of total
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Pending Fees */}
      <motion.div 
        className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-red-50 p-3 rounded-lg">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">Pending Fees</p>
              <p className="text-2xl font-semibold text-gray-900">₹{pendingFees.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">
                {Math.round((pendingFees / totalFees) * 100)}% of total
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Overdue Amount */}
      <motion.div 
        className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-orange-50 p-3 rounded-lg">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">Overdue Amount</p>
              <p className="text-2xl font-semibold text-gray-900">₹{overdueAmount.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">
                {Math.round((overdueAmount / pendingFees) * 100)}% of pending
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* This Month Collection */}
      <motion.div 
        className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-purple-50 p-3 rounded-lg">
              <CreditCard className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">This Month</p>
              <div className="flex items-baseline">
                <p className="text-2xl font-semibold text-gray-900">₹{thisMonthCollection.toLocaleString()}</p>
                {monthlyChange > 0 ? (
                  <p className="ml-2 flex items-center text-sm text-green-600">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    {monthlyChangePercent}%
                  </p>
                ) : (
                  <p className="ml-2 flex items-center text-sm text-red-600">
                    <TrendingDown className="h-4 w-4 mr-1" />
                    {Math.abs(monthlyChangePercent)}%
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Last Month Collection */}
      <motion.div 
        className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.5 }}
      >
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-gray-50 p-3 rounded-lg">
              <CreditCard className="h-6 w-6 text-gray-600" />
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">Last Month</p>
              <p className="text-2xl font-semibold text-gray-900">₹{lastMonthCollection.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default FeeStatistics;

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Search,
  Filter,
  Eye,
  UserCheck,
  UserX,
  AlertCircle,
  Calendar,
  Mail,
  Phone,
  Building,
  Shield
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { adminAPI } from '../../services/api';

const AdminApprovals = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const queryClient = useQueryClient();

  // Fetch pending approvals
  const { data: approvalsData, isLoading, error } = useQuery({
    queryKey: ['admin-pending-approvals', currentPage, searchTerm],
    queryFn: () => adminAPI.getPendingApprovals({ 
      page: currentPage, 
      limit: 10, 
      search: searchTerm 
    }),
  });

  // Fetch admin stats
  const { data: statsData } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => adminAPI.getAdminStats(),
  });

  // Approve admin mutation
  const approveAdminMutation = useMutation({
    mutationFn: (adminId) => adminAPI.approveAdmin(adminId),
    onSuccess: () => {
      toast.success('Admin approved successfully!');
      queryClient.invalidateQueries(['admin-pending-approvals']);
      queryClient.invalidateQueries(['admin-stats']);
      setShowApprovalModal(false);
      setSelectedAdmin(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to approve admin');
    },
  });

  // Reject admin mutation
  const rejectAdminMutation = useMutation({
    mutationFn: ({ adminId, reason }) => adminAPI.rejectAdmin(adminId, reason),
    onSuccess: () => {
      toast.success('Admin rejected successfully!');
      queryClient.invalidateQueries(['admin-pending-approvals']);
      queryClient.invalidateQueries(['admin-stats']);
      setShowRejectionModal(false);
      setSelectedAdmin(null);
      setRejectionReason('');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to reject admin');
    },
  });

  const handleApprove = (admin) => {
    setSelectedAdmin(admin);
    setShowApprovalModal(true);
  };

  const handleReject = (admin) => {
    setSelectedAdmin(admin);
    setShowRejectionModal(true);
  };

  const confirmApproval = () => {
    if (selectedAdmin) {
      approveAdminMutation.mutate(selectedAdmin._id);
    }
  };

  const confirmRejection = () => {
    if (selectedAdmin && rejectionReason.trim()) {
      rejectAdminMutation.mutate({
        adminId: selectedAdmin._id,
        reason: rejectionReason.trim()
      });
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-admin-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Data</h3>
        <p className="text-gray-600">{error.message}</p>
      </div>
    );
  }

  const pendingAdmins = approvalsData?.data?.admins || [];
  const pagination = approvalsData?.data?.pagination || {};
  const stats = statsData?.data || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Approvals</h1>
          <p className="text-gray-600">Review and approve admin registration requests</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-card p-6"
        >
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pending || 0}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-card p-6"
        >
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-gray-900">{stats.approved || 0}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-card p-6"
        >
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-gray-900">{stats.rejected || 0}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg shadow-card p-6"
        >
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total || 0}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-card p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search by name, email, employee ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-admin-primary focus:border-admin-primary"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Pending Approvals List */}
      <div className="bg-white rounded-lg shadow-card overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Pending Approvals</h2>
        </div>

        {pendingAdmins.length === 0 ? (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Approvals</h3>
            <p className="text-gray-600">All admin registrations have been processed.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {pendingAdmins.map((admin) => (
              <motion.div
                key={admin._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 rounded-full bg-admin-primary text-white flex items-center justify-center">
                        <span className="text-lg font-semibold">
                          {admin.user.firstName[0]}{admin.user.lastName[0]}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {admin.user.firstName} {admin.user.lastName}
                        </h3>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Pending
                        </span>
                      </div>
                      <div className="mt-1 flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-1" />
                          {admin.user.email}
                        </div>
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-1" />
                          {admin.user.phone}
                        </div>
                      </div>
                      <div className="mt-1 flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Building className="h-4 w-4 mr-1" />
                          {admin.department}
                        </div>
                        <div className="flex items-center">
                          <Shield className="h-4 w-4 mr-1" />
                          {admin.designation}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {formatDate(admin.createdAt)}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleApprove(admin)}
                      disabled={approveAdminMutation.isLoading}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                    >
                      <UserCheck className="h-4 w-4 mr-1" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(admin)}
                      disabled={rejectAdminMutation.isLoading}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                    >
                      <UserX className="h-4 w-4 mr-1" />
                      Reject
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {((pagination.current - 1) * pagination.limit) + 1} to{' '}
                {Math.min(pagination.current * pagination.limit, pagination.total)} of{' '}
                {pagination.total} results
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={pagination.current === 1}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.pages))}
                  disabled={pagination.current === pagination.pages}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Approval Confirmation Modal */}
      {showApprovalModal && selectedAdmin && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <UserCheck className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg leading-6 font-medium text-gray-900 mt-4">
                Approve Admin Registration
              </h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Are you sure you want to approve the admin registration for{' '}
                  <strong>{selectedAdmin.user.firstName} {selectedAdmin.user.lastName}</strong>?
                  This will activate their account and grant them admin access.
                </p>
              </div>
              <div className="items-center px-4 py-3">
                <button
                  onClick={confirmApproval}
                  disabled={approveAdminMutation.isLoading}
                  className="px-4 py-2 bg-green-600 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-300 disabled:opacity-50"
                >
                  {approveAdminMutation.isLoading ? 'Approving...' : 'Yes, Approve'}
                </button>
                <button
                  onClick={() => setShowApprovalModal(false)}
                  className="mt-3 px-4 py-2 bg-white text-gray-500 text-base font-medium rounded-md w-full shadow-sm border border-gray-300 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectionModal && selectedAdmin && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <UserX className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg leading-6 font-medium text-gray-900 mt-4 text-center">
                Reject Admin Registration
              </h3>
              <div className="mt-4">
                <p className="text-sm text-gray-500 mb-4">
                  Please provide a reason for rejecting{' '}
                  <strong>{selectedAdmin.user.firstName} {selectedAdmin.user.lastName}</strong>'s 
                  admin registration:
                </p>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Enter rejection reason..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
              <div className="items-center px-4 py-3">
                <button
                  onClick={confirmRejection}
                  disabled={rejectAdminMutation.isLoading || !rejectionReason.trim()}
                  className="px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300 disabled:opacity-50"
                >
                  {rejectAdminMutation.isLoading ? 'Rejecting...' : 'Reject Registration'}
                </button>
                <button
                  onClick={() => {
                    setShowRejectionModal(false);
                    setRejectionReason('');
                  }}
                  className="mt-3 px-4 py-2 bg-white text-gray-500 text-base font-medium rounded-md w-full shadow-sm border border-gray-300 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminApprovals;

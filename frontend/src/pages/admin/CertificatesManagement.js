import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Download, 
  Award,
  ChevronLeft, 
  ChevronRight,
  Eye,
  FileText,
  Send,
  Plus
} from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

// Import custom components
import ViewCertificateModal from '../../components/admin/certificates/ViewCertificateModal';
import IssueCertificateModal from '../../components/admin/certificates/IssueCertificateModal';
import PreviewCertificateModal from '../../components/admin/certificates/PreviewCertificateModal';
import CertificateStatistics from '../../components/admin/certificates/CertificateStatistics';

// Mock data - in a real app, this would come from API
const mockCertificatesData = {
  certificates: [
    {
      id: 1,
      certificate_number: "CERT-2023-001",
      student_id: "STU001",
      student_name: "Rahul Sharma",
      course: "Web Development",
      issue_date: "2023-09-15",
      completion_date: "2023-09-10",
      status: "issued",
      email_sent: true,
      created_by: "Admin",
      created_at: "2023-09-15T10:30:00"
    },
    {
      id: 2,
      certificate_number: "CERT-2023-002",
      student_id: "STU002",
      student_name: "Priya Patel",
      course: "Digital Marketing",
      issue_date: "2023-09-20",
      completion_date: "2023-09-18",
      status: "issued",
      email_sent: true,
      created_by: "Admin",
      created_at: "2023-09-20T14:15:00"
    },
    {
      id: 3,
      certificate_number: "CERT-2023-003",
      student_id: "STU005",
      student_name: "Rajesh Verma",
      course: "Web Development",
      issue_date: "2023-10-05",
      completion_date: "2023-10-01",
      status: "issued",
      email_sent: false,
      created_by: "Admin",
      created_at: "2023-10-05T09:45:00"
    },
    {
      id: 4,
      certificate_number: null,
      student_id: "STU003",
      student_name: "Amit Kumar",
      course: "Python Programming",
      issue_date: null,
      completion_date: "2023-10-10",
      status: "pending",
      email_sent: false,
      created_by: null,
      created_at: null
    },
    {
      id: 5,
      certificate_number: null,
      student_id: "STU004",
      student_name: "Neha Singh",
      course: "Graphic Design",
      issue_date: null,
      completion_date: "2023-10-15",
      status: "pending",
      email_sent: false,
      created_by: null,
      created_at: null
    }
  ],
  total: 5,
  page: 1,
  limit: 10
};

const CertificatesManagement = () => {
  const [certificatesData, setCertificatesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    course: 'all',
  });
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [showIssueCertificateModal, setShowIssueCertificateModal] = useState(false);
  const [certificateToIssue, setCertificateToIssue] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [certificateToPreview, setCertificateToPreview] = useState(null);

  useEffect(() => {
    // Simulate API call
    const fetchCertificates = async () => {
      try {
        // In a real app, you would fetch data from your API
        // const response = await adminAPI.getCertificates({ page: currentPage, limit: 10, ...filters });
        // setCertificatesData(response.data);
        
        // Simulate API delay
        setTimeout(() => {
          setCertificatesData(mockCertificatesData);
          setLoading(false);
        }, 800);
      } catch (error) {
        console.error('Error fetching certificates:', error);
        setLoading(false);
        toast.error('Failed to load certificates');
      }
    };

    fetchCertificates();
  }, [currentPage, filters]);

  const handleSearch = (e) => {
    e.preventDefault();
    // In a real app, this would trigger a new API call with the search term
    toast.success(`Searching for: ${searchTerm}`);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleViewCertificate = (certificate) => {
    setSelectedCertificate(certificate);
    setShowCertificateModal(true);
  };

  const handleIssueCertificate = (certificate) => {
    setCertificateToIssue(certificate);
    setShowIssueCertificateModal(true);
  };

  const handlePreviewCertificate = (certificate) => {
    setCertificateToPreview(certificate);
    setShowPreviewModal(true);
  };

  const handleSendEmail = async (certificate) => {
    try {
      // In a real app, this would call the API to send the email
      // await adminAPI.sendCertificateEmail(certificate.id);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Update local state
      setCertificatesData(prev => ({
        ...prev,
        certificates: prev.certificates.map(c => 
          c.id === certificate.id ? { ...c, email_sent: true } : c
        )
      }));
      
      toast.success(`Certificate email sent to ${certificate.student_name}`);
    } catch (error) {
      console.error('Error sending certificate email:', error);
      toast.error('Failed to send certificate email');
    }
  };

  const handleDownloadCertificate = (certificate) => {
    // In a real app, this would trigger a file download
    toast.success(`Downloading certificate for ${certificate.student_name}`);
  };

  const confirmIssueCertificate = async (certificateData) => {
    try {
      // In a real app, this would call the API to issue the certificate
      // await adminAPI.issueCertificate(certificateToIssue.id, certificateData);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Generate a certificate number
      const certificateNumber = `CERT-${new Date().getFullYear()}-${String(certificateToIssue.id).padStart(3, '0')}`;
      
      // Update local state
      setCertificatesData(prev => ({
        ...prev,
        certificates: prev.certificates.map(c => 
          c.id === certificateToIssue.id ? { 
            ...c, 
            certificate_number: certificateNumber,
            issue_date: format(new Date(), 'yyyy-MM-dd'),
            status: 'issued',
            created_by: 'Admin',
            created_at: new Date().toISOString()
          } : c
        )
      }));
      
      toast.success(`Certificate issued successfully for ${certificateToIssue.student_name}`);
      setShowIssueCertificateModal(false);
      setCertificateToIssue(null);
    } catch (error) {
      console.error('Error issuing certificate:', error);
      toast.error('Failed to issue certificate');
    }
  };

  const handleCreateNewCertificate = () => {
    // This would open a modal to select a student and create a new certificate
    toast.success('Feature to create new certificate will be implemented soon');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-admin-primary"></div>
      </div>
    );
  }

  // Get unique courses for filters
  const courses = ['all', ...new Set(certificatesData.certificates.map(cert => cert.course))];

  // Calculate statistics
  const statistics = {
    totalCertificates: certificatesData.certificates.length,
    issuedCertificates: certificatesData.certificates.filter(c => c.status === 'issued').length,
    pendingCertificates: certificatesData.certificates.filter(c => c.status === 'pending').length,
    emailsSent: certificatesData.certificates.filter(c => c.email_sent).length
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Certificates</h1>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={handleCreateNewCertificate}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-admin-primary hover:bg-admin-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-admin-primary"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Certificate
          </button>
        </div>
      </div>

      {/* Certificate Statistics */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <CertificateStatistics statistics={statistics} />
      </motion.div>

      {/* Search and Filters */}
      <motion.div 
        className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="p-4">
          <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0">
            <div className="flex-1">
              <form onSubmit={handleSearch} className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search by student name, ID, or certificate number..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary focus:border-admin-primary"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </form>
            </div>
            <div className="flex items-center space-x-2 md:ml-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </button>
            </div>
          </div>

          {showFilters && (
            <motion.div 
              className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3 }}
            >
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary focus:border-admin-primary"
                  value={filters.status}
                  onChange={handleFilterChange}
                >
                  <option value="all">All</option>
                  <option value="issued">Issued</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
              <div>
                <label htmlFor="course" className="block text-sm font-medium text-gray-700 mb-1">
                  Course
                </label>
                <select
                  id="course"
                  name="course"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-admin-primary focus:border-admin-primary"
                  value={filters.course}
                  onChange={handleFilterChange}
                >
                  {courses.map((course) => (
                    <option key={course} value={course}>
                      {course === 'all' ? 'All Courses' : course}
                    </option>
                  ))}
                </select>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Certificates Table */}
      <motion.div 
        className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Certificate Number
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Course
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Completion Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Issue Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {certificatesData.certificates.map((certificate) => (
                <tr key={certificate.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {certificate.certificate_number || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{certificate.student_name}</div>
                        <div className="text-sm text-gray-500">{certificate.student_id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {certificate.course}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(certificate.completion_date), 'MMM d, yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {certificate.issue_date 
                      ? format(new Date(certificate.issue_date), 'MMM d, yyyy')
                      : '-'
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {certificate.status === 'issued' ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Issued
                      </span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      {certificate.status === 'issued' ? (
                        <>
                          <button
                            onClick={() => handleViewCertificate(certificate)}
                            className="text-blue-600 hover:text-blue-900"
                            title="View Certificate"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDownloadCertificate(certificate)}
                            className="text-green-600 hover:text-green-900"
                            title="Download Certificate"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                          {!certificate.email_sent && (
                            <button
                              onClick={() => handleSendEmail(certificate)}
                              className="text-purple-600 hover:text-purple-900"
                              title="Send Email"
                            >
                              <Send className="h-4 w-4" />
                            </button>
                          )}
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handlePreviewCertificate(certificate)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Preview Certificate"
                          >
                            <FileText className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleIssueCertificate(certificate)}
                            className="text-green-600 hover:text-green-900"
                            title="Issue Certificate"
                          >
                            <Award className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(prev => prev + 1)}
              disabled={certificatesData.certificates.length < certificatesData.limit}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">1</span> to <span className="font-medium">{certificatesData.certificates.length}</span> of{' '}
                <span className="font-medium">{certificatesData.total}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Previous</span>
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  disabled={certificatesData.certificates.length < certificatesData.limit}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Next</span>
                  <ChevronRight className="h-5 w-5" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      </motion.div>

      {/* View Certificate Modal */}
      {showCertificateModal && selectedCertificate && (
        <ViewCertificateModal 
          certificate={selectedCertificate}
          onClose={() => setShowCertificateModal(false)}
          onDownload={handleDownloadCertificate}
          onSendEmail={handleSendEmail}
        />
      )}

      {/* Issue Certificate Modal */}
      {showIssueCertificateModal && certificateToIssue && (
        <IssueCertificateModal 
          certificate={certificateToIssue}
          onClose={() => setShowIssueCertificateModal(false)}
          onIssue={confirmIssueCertificate}
        />
      )}

      {/* Preview Certificate Modal */}
      {showPreviewModal && certificateToPreview && (
        <PreviewCertificateModal 
          certificate={certificateToPreview}
          onClose={() => setShowPreviewModal(false)}
          onIssue={handleIssueCertificate}
        />
      )}
    </div>
  );
};

export default CertificatesManagement;

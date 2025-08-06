import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Award, 
  Download,
  Eye,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

// Mock data - in a real app, this would come from API
const mockCertificatesData = {
  student_id: "STU001",
  name: "Rahul Sharma",
  certificates: [
    {
      id: 1,
      course_name: "Web Development",
      certificate_no: "CERT-WD-2023-001",
      issue_date: "2023-10-15",
      status: "issued",
      grade: "A",
      completion_date: "2023-10-10"
    },
    {
      id: 2,
      course_name: "Digital Marketing",
      certificate_no: null,
      issue_date: null,
      status: "pending",
      grade: null,
      completion_date: "2023-12-10" // Future date
    }
  ]
};

const StudentCertificates = () => {
  const [certificatesData, setCertificatesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [previewCertificate, setPreviewCertificate] = useState(null);

  useEffect(() => {
    // Simulate API call
    const fetchCertificatesData = async () => {
      try {
        // In a real app, you would fetch data from your API
        // const response = await studentAPI.getCertificates();
        // setCertificatesData(response.data);
        
        // Simulate API delay
        setTimeout(() => {
          setCertificatesData(mockCertificatesData);
          setLoading(false);
        }, 800);
      } catch (error) {
        console.error('Error fetching certificates data:', error);
        setLoading(false);
        toast.error('Failed to load certificates data');
      }
    };

    fetchCertificatesData();
  }, []);

  const downloadCertificate = (certificateNo) => {
    // In a real app, this would trigger a file download
    toast.success(`Downloading certificate ${certificateNo}`);
  };

  const previewCertificateHandler = (certificate) => {
    // In a real app, this would show a preview of the certificate
    setPreviewCertificate(certificate);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-student-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Certificates</h1>
      </div>

      {certificatesData.certificates.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-6 text-center">
          <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-medium text-gray-900 mb-2">No Certificates Found</h2>
          <p className="text-gray-500">You haven't received any certificates yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certificatesData.certificates.map((certificate) => (
            <motion.div 
              key={certificate.id}
              className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="p-6">
                <div className="flex items-start">
                  <div className={`flex-shrink-0 p-3 rounded-lg ${
                    certificate.status === 'issued' ? 'bg-green-50' : 'bg-yellow-50'
                  }`}>
                    {certificate.status === 'issued' ? (
                      <Award className="h-6 w-6 text-green-600" />
                    ) : (
                      <Clock className="h-6 w-6 text-yellow-600" />
                    )}
                  </div>
                  <div className="ml-4">
                    <h2 className="text-lg font-medium text-gray-900">{certificate.course_name}</h2>
                    <div className="mt-1 flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>Completed: {format(new Date(certificate.completion_date), 'MMMM d, yyyy')}</span>
                    </div>
                    {certificate.status === 'issued' && certificate.grade && (
                      <div className="mt-1 flex items-center">
                        <span className="text-sm text-gray-500 mr-2">Grade:</span>
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {certificate.grade}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="mt-4 flex items-center">
                  <span className="text-sm font-medium mr-2">Status:</span>
                  {certificate.status === 'issued' ? (
                    <span className="flex items-center text-green-600 text-sm">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Issued on {format(new Date(certificate.issue_date), 'MMMM d, yyyy')}
                    </span>
                  ) : (
                    <span className="flex items-center text-yellow-600 text-sm">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      Pending
                    </span>
                  )}
                </div>
                
                {certificate.status === 'issued' && (
                  <div className="mt-6 flex space-x-4">
                    <button
                      onClick={() => downloadCertificate(certificate.certificate_no)}
                      className="flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-student-primary hover:bg-student-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-student-primary"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </button>
                    <button
                      onClick={() => previewCertificateHandler(certificate)}
                      className="flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-student-primary"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </button>
                  </div>
                )}
                
                {certificate.status === 'pending' && (
                  <div className="mt-6">
                    <p className="text-sm text-gray-500">
                      Your certificate will be issued after course completion and final assessment.
                    </p>
                  </div>
                )}
                
                {certificate.certificate_no && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-500">
                      Certificate No: {certificate.certificate_no}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Certificate Preview Modal - In a real app, this would show an actual certificate */}
      {previewCertificate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div 
            className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Certificate Preview</h2>
              <button
                onClick={() => setPreviewCertificate(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="border border-gray-300 rounded-lg p-8 bg-gray-50 text-center">
              <div className="border-4 border-double border-gray-300 p-8">
                <div className="flex justify-center mb-6">
                  <Award className="h-16 w-16 text-student-primary" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Certificate of Completion</h1>
                <p className="text-gray-600 mb-6">This certifies that</p>
                <p className="text-xl font-bold text-gray-900 mb-2">{certificatesData.name}</p>
                <p className="text-gray-600 mb-6">has successfully completed the course</p>
                <p className="text-xl font-bold text-gray-900 mb-6">{previewCertificate.course_name}</p>
                <p className="text-gray-600 mb-2">with grade</p>
                <p className="text-xl font-bold text-gray-900 mb-6">{previewCertificate.grade}</p>
                <p className="text-gray-600 mb-6">on {format(new Date(previewCertificate.issue_date), 'MMMM d, yyyy')}</p>
                <div className="flex justify-between items-center mt-8">
                  <div>
                    <div className="w-20 border-t-2 border-gray-400 mb-2"></div>
                    <p className="text-gray-600">Director</p>
                  </div>
                  <div>
                    <div className="w-20 border-t-2 border-gray-400 mb-2"></div>
                    <p className="text-gray-600">Instructor</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-8">Certificate No: {previewCertificate.certificate_no}</p>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => downloadCertificate(previewCertificate.certificate_no)}
                className="flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-student-primary hover:bg-student-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-student-primary"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Certificate
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default StudentCertificates;

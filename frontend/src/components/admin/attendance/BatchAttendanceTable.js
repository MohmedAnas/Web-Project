import React from 'react';

const BatchAttendanceTable = ({ batches, onMarkAttendance, onViewDetails }) => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
      <div className="px-6 py-5 border-b border-gray-100">
        <h2 className="text-lg font-medium text-gray-900">Batch Attendance</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Batch
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Time
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Students
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Present
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Absent
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Attendance %
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {batches.map((batch) => (
              <tr key={batch.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {batch.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {batch.time}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {batch.students}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                  {batch.present}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                  {batch.absent}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2 max-w-[100px]">
                      <div 
                        className="bg-green-500 h-2.5 rounded-full" 
                        style={{ width: `${Math.round((batch.present / batch.students) * 100)}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-700">
                      {Math.round((batch.present / batch.students) * 100)}%
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => onMarkAttendance(batch)}
                      className="text-admin-primary hover:text-admin-secondary"
                    >
                      Mark Attendance
                    </button>
                    <button
                      onClick={() => onViewDetails(batch)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      View Details
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BatchAttendanceTable;

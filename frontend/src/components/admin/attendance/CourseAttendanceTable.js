import React from 'react';

const CourseAttendanceTable = ({ courses }) => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
      <div className="px-6 py-5 border-b border-gray-100">
        <h2 className="text-lg font-medium text-gray-900">Course Attendance</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Course
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
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {courses.map((course) => (
              <tr key={course.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {course.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {course.students}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                  {course.present}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                  {course.absent}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2 max-w-[100px]">
                      <div 
                        className={`h-2.5 rounded-full ${
                          Math.round((course.present / course.students) * 100) >= 90 ? 'bg-green-500' : 
                          Math.round((course.present / course.students) * 100) >= 75 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.round((course.present / course.students) * 100)}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-700">
                      {Math.round((course.present / course.students) * 100)}%
                    </span>
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

export default CourseAttendanceTable;

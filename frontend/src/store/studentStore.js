import { create } from 'zustand';
import { studentService } from '../services/api';
import { logError } from '../utils/errorHandler';

const useStudentStore = create((set, get) => ({
  // Student data
  students: [],
  currentStudent: null,
  loading: false,
  error: null,
  
  // Pagination and filtering
  pagination: {
    page: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0
  },
  filters: {
    search: '',
    course: '',
    batch: '',
    status: ''
  },
  
  // Actions
  setLoading: (status) => set({ loading: status }),
  setError: (error) => set({ error }),
  
  setStudents: (students) => set({ students }),
  setCurrentStudent: (student) => set({ currentStudent: student }),
  
  setPagination: (pagination) => set({ pagination: { ...get().pagination, ...pagination } }),
  setFilters: (filters) => set({ filters: { ...get().filters, ...filters } }),
  
  // Student CRUD operations with real API
  addStudent: async (studentData) => {
    set({ loading: true, error: null });
    try {
      // Call API to create new student
      const newStudent = await studentService.createStudent(studentData);
      
      // Update state with new student
      set((state) => ({ 
        students: [...state.students, newStudent],
        loading: false
      }));
      
      return newStudent;
    } catch (error) {
      logError(error, { action: 'addStudent', data: studentData });
      set({ error: error.message, loading: false });
      throw error;
    }
  },
  
  updateStudent: async (studentId, studentData) => {
    set({ loading: true, error: null });
    try {
      // Call API to update student
      const updatedStudent = await studentService.updateStudent(studentId, studentData);
      
      // Update state with updated student
      set((state) => ({
        students: state.students.map(student => 
          student.id === studentId ? updatedStudent : student
        ),
        // Also update currentStudent if it's the same student
        currentStudent: state.currentStudent?.id === studentId 
          ? updatedStudent 
          : state.currentStudent,
        loading: false
      }));
      
      return updatedStudent;
    } catch (error) {
      logError(error, { action: 'updateStudent', studentId, data: studentData });
      set({ error: error.message, loading: false });
      throw error;
    }
  },
  
  deleteStudent: async (studentId) => {
    set({ loading: true, error: null });
    try {
      // Call API to delete student
      await studentService.deleteStudent(studentId);
      
      // Update state by removing the deleted student
      set((state) => ({
        students: state.students.filter(student => student.id !== studentId),
        // Clear currentStudent if it's the deleted student
        currentStudent: state.currentStudent?.id === studentId 
          ? null 
          : state.currentStudent,
        loading: false
      }));
      
      return true;
    } catch (error) {
      logError(error, { action: 'deleteStudent', studentId });
      set({ error: error.message, loading: false });
      throw error;
    }
  },
  
  // Fetch operations with real API
  fetchStudents: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      // Combine store filters with provided params
      const queryParams = {
        ...get().filters,
        page: get().pagination.page,
        page_size: get().pagination.pageSize,
        ...params
      };
      
      // Call API to get students
      const response = await studentService.getAllStudents(queryParams);
      
      // Update state with fetched data and pagination info
      set({ 
        students: response.results || response,
        pagination: {
          page: response.page || 1,
          pageSize: response.page_size || 10,
          totalItems: response.total_items || response.results?.length || 0,
          totalPages: response.total_pages || 1
        },
        loading: false
      });
      
      return response.results || response;
    } catch (error) {
      logError(error, { action: 'fetchStudents', params });
      set({ error: error.message, loading: false });
      throw error;
    }
  },
  
  fetchStudentById: async (studentId) => {
    set({ loading: true, error: null });
    try {
      // Call API to get student by ID
      const student = await studentService.getStudentById(studentId);
      
      // Update state with fetched student
      set((state) => {
        // Check if student already exists in the list
        const exists = state.students.some(s => s.id === studentId);
        
        return {
          // If student exists in list, update it; otherwise add it
          students: exists 
            ? state.students.map(s => s.id === studentId ? student : s)
            : [...state.students, student],
          currentStudent: student,
          loading: false
        };
      });
      
      return student;
    } catch (error) {
      logError(error, { action: 'fetchStudentById', studentId });
      set({ error: error.message, loading: false });
      throw error;
    }
  },
  
  // Additional student operations with real API
  fetchStudentCourses: async (studentId) => {
    set({ loading: true, error: null });
    try {
      // Call API to get student courses
      const courses = await studentService.getStudentCourses(studentId);
      set({ loading: false });
      return courses;
    } catch (error) {
      logError(error, { action: 'fetchStudentCourses', studentId });
      set({ error: error.message, loading: false });
      throw error;
    }
  },
  
  enrollStudentInCourse: async (studentId, enrollmentData) => {
    set({ loading: true, error: null });
    try {
      // Call API to enroll student in course
      const result = await studentService.enrollStudentInCourse(studentId, enrollmentData);
      
      // Refresh student data to get updated course list
      await get().fetchStudentById(studentId);
      
      set({ loading: false });
      return result;
    } catch (error) {
      logError(error, { action: 'enrollStudentInCourse', studentId, data: enrollmentData });
      set({ error: error.message, loading: false });
      throw error;
    }
  },
  
  fetchStudentAttendance: async (studentId, params = {}) => {
    set({ loading: true, error: null });
    try {
      // Call API to get student attendance
      const attendance = await studentService.getStudentAttendance(studentId, params);
      set({ loading: false });
      return attendance;
    } catch (error) {
      logError(error, { action: 'fetchStudentAttendance', studentId, params });
      set({ error: error.message, loading: false });
      throw error;
    }
  },
  
  fetchStudentCertificates: async (studentId) => {
    set({ loading: true, error: null });
    try {
      // Call API to get student certificates
      const certificates = await studentService.getStudentCertificates(studentId);
      set({ loading: false });
      return certificates;
    } catch (error) {
      logError(error, { action: 'fetchStudentCertificates', studentId });
      set({ error: error.message, loading: false });
      throw error;
    }
  },
  
  fetchStudentNotices: async (studentId) => {
    set({ loading: true, error: null });
    try {
      // Call API to get student notices
      const notices = await studentService.getStudentNotices(studentId);
      set({ loading: false });
      return notices;
    } catch (error) {
      logError(error, { action: 'fetchStudentNotices', studentId });
      set({ error: error.message, loading: false });
      throw error;
    }
  },
  
  updateStudentProfile: async (studentId, profileData) => {
    set({ loading: true, error: null });
    try {
      // Call API to update student profile
      const updatedProfile = await studentService.updateStudentProfile(studentId, profileData);
      
      // Update student in state
      set((state) => {
        const updatedStudent = {
          ...state.currentStudent,
          ...updatedProfile
        };
        
        return {
          students: state.students.map(student => 
            student.id === studentId ? updatedStudent : student
          ),
          currentStudent: updatedStudent,
          loading: false
        };
      });
      
      return updatedProfile;
    } catch (error) {
      logError(error, { action: 'updateStudentProfile', studentId, data: profileData });
      set({ error: error.message, loading: false });
      throw error;
    }
  },
  
  uploadStudentPhoto: async (studentId, photoFile) => {
    set({ loading: true, error: null });
    try {
      // Call API to upload student photo
      const result = await studentService.uploadStudentPhoto(studentId, photoFile);
      
      // Update student in state with new photo URL
      if (result.photo_url) {
        set((state) => {
          const updatedStudent = {
            ...state.currentStudent,
            photo_url: result.photo_url
          };
          
          return {
            students: state.students.map(student => 
              student.id === studentId ? updatedStudent : student
            ),
            currentStudent: updatedStudent,
            loading: false
          };
        });
      } else {
        set({ loading: false });
      }
      
      return result;
    } catch (error) {
      logError(error, { action: 'uploadStudentPhoto', studentId });
      set({ error: error.message, loading: false });
      throw error;
    }
  }
}));

export default useStudentStore;

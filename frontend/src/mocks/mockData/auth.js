export const mockAuth = {
  adminLoginResponse: {
    token: 'mock-admin-token',
    refresh_token: 'mock-admin-refresh-token',
    user: {
      id: 'admin-1',
      username: 'admin',
      email: 'admin@rbcomputer.com',
      first_name: 'Admin',
      last_name: 'User',
      role: 'ADMIN',
      is_active: true,
      last_login: '2023-07-01T10:30:00Z',
      created_at: '2023-01-01T00:00:00Z'
    }
  },
  
  studentLoginResponse: {
    token: 'mock-student-token',
    refresh_token: 'mock-student-refresh-token',
    user: {
      id: 'student-1',
      username: 'student',
      email: 'john.doe@example.com',
      first_name: 'John',
      last_name: 'Doe',
      role: 'STUDENT',
      is_active: true,
      last_login: '2023-07-01T09:15:00Z',
      created_at: '2023-01-15T00:00:00Z',
      student_id: 'student-1'
    }
  }
};

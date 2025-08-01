import { rest } from 'msw';
import { mockFees } from './mockData/fees';
import { mockStudents } from './mockData/students';
import { mockAuth } from './mockData/auth';

// Base API URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

export const handlers = [
  // Auth endpoints
  rest.post(`${API_URL}/auth/login`, (req, res, ctx) => {
    const { username, password } = req.body;
    
    // Check credentials
    if (username === 'admin' && password === 'password') {
      return res(
        ctx.status(200),
        ctx.json(mockAuth.adminLoginResponse)
      );
    } else if (username === 'student' && password === 'password') {
      return res(
        ctx.status(200),
        ctx.json(mockAuth.studentLoginResponse)
      );
    }
    
    // Invalid credentials
    return res(
      ctx.status(401),
      ctx.json({ detail: 'Invalid credentials' })
    );
  }),
  
  rest.post(`${API_URL}/auth/logout`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({ detail: 'Successfully logged out' })
    );
  }),
  
  rest.post(`${API_URL}/auth/refresh`, (req, res, ctx) => {
    const { refresh_token } = req.body;
    
    if (refresh_token) {
      return res(
        ctx.status(200),
        ctx.json({
          token: 'new-mock-token',
          refresh_token: 'new-mock-refresh-token',
          user: mockAuth.adminLoginResponse.user
        })
      );
    }
    
    return res(
      ctx.status(401),
      ctx.json({ detail: 'Invalid refresh token' })
    );
  }),
  
  // Fee endpoints
  rest.get(`${API_URL}/fees`, (req, res, ctx) => {
    // Support pagination and filtering
    const page = parseInt(req.url.searchParams.get('page')) || 1;
    const pageSize = parseInt(req.url.searchParams.get('page_size')) || 10;
    const status = req.url.searchParams.get('status');
    
    let filteredFees = [...mockFees];
    
    // Apply status filter if provided
    if (status) {
      filteredFees = filteredFees.filter(fee => fee.status === status.toUpperCase());
    }
    
    // Calculate pagination
    const totalItems = filteredFees.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedFees = filteredFees.slice(startIndex, endIndex);
    
    return res(
      ctx.status(200),
      ctx.json({
        results: paginatedFees,
        page,
        page_size: pageSize,
        total_items: totalItems,
        total_pages: totalPages
      })
    );
  }),
  
  rest.get(`${API_URL}/fees/:feeId`, (req, res, ctx) => {
    const { feeId } = req.params;
    const fee = mockFees.find(f => f.id === feeId);
    
    if (fee) {
      return res(
        ctx.status(200),
        ctx.json(fee)
      );
    }
    
    return res(
      ctx.status(404),
      ctx.json({ detail: 'Fee not found' })
    );
  }),
  
  rest.post(`${API_URL}/fees`, (req, res, ctx) => {
    const newFee = {
      id: `fee-${Date.now()}`,
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    return res(
      ctx.status(201),
      ctx.json(newFee)
    );
  }),
  
  rest.put(`${API_URL}/fees/:feeId`, (req, res, ctx) => {
    const { feeId } = req.params;
    const feeIndex = mockFees.findIndex(f => f.id === feeId);
    
    if (feeIndex !== -1) {
      const updatedFee = {
        ...mockFees[feeIndex],
        ...req.body,
        updatedAt: new Date().toISOString()
      };
      
      return res(
        ctx.status(200),
        ctx.json(updatedFee)
      );
    }
    
    return res(
      ctx.status(404),
      ctx.json({ detail: 'Fee not found' })
    );
  }),
  
  rest.delete(`${API_URL}/fees/:feeId`, (req, res, ctx) => {
    const { feeId } = req.params;
    const feeIndex = mockFees.findIndex(f => f.id === feeId);
    
    if (feeIndex !== -1) {
      return res(
        ctx.status(204)
      );
    }
    
    return res(
      ctx.status(404),
      ctx.json({ detail: 'Fee not found' })
    );
  }),
  
  rest.post(`${API_URL}/fees/:feeId/payments`, (req, res, ctx) => {
    const { feeId } = req.params;
    const fee = mockFees.find(f => f.id === feeId);
    
    if (fee) {
      const paymentId = `payment-${Date.now()}`;
      const payment = {
        id: paymentId,
        fee_id: feeId,
        ...req.body,
        created_at: new Date().toISOString()
      };
      
      return res(
        ctx.status(201),
        ctx.json(payment)
      );
    }
    
    return res(
      ctx.status(404),
      ctx.json({ detail: 'Fee not found' })
    );
  }),
  
  rest.get(`${API_URL}/fees/:feeId/payments`, (req, res, ctx) => {
    const { feeId } = req.params;
    const fee = mockFees.find(f => f.id === feeId);
    
    if (fee) {
      return res(
        ctx.status(200),
        ctx.json(fee.paymentHistory || [])
      );
    }
    
    return res(
      ctx.status(404),
      ctx.json({ detail: 'Fee not found' })
    );
  }),
  
  // Student endpoints
  rest.get(`${API_URL}/students`, (req, res, ctx) => {
    // Support pagination and filtering
    const page = parseInt(req.url.searchParams.get('page')) || 1;
    const pageSize = parseInt(req.url.searchParams.get('page_size')) || 10;
    const search = req.url.searchParams.get('search') || '';
    
    let filteredStudents = [...mockStudents];
    
    // Apply search filter if provided
    if (search) {
      const searchLower = search.toLowerCase();
      filteredStudents = filteredStudents.filter(student => 
        student.name.toLowerCase().includes(searchLower) || 
        student.id.toLowerCase().includes(searchLower)
      );
    }
    
    // Calculate pagination
    const totalItems = filteredStudents.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedStudents = filteredStudents.slice(startIndex, endIndex);
    
    return res(
      ctx.status(200),
      ctx.json({
        results: paginatedStudents,
        page,
        page_size: pageSize,
        total_items: totalItems,
        total_pages: totalPages
      })
    );
  }),
  
  rest.get(`${API_URL}/students/:studentId`, (req, res, ctx) => {
    const { studentId } = req.params;
    const student = mockStudents.find(s => s.id === studentId);
    
    if (student) {
      return res(
        ctx.status(200),
        ctx.json(student)
      );
    }
    
    return res(
      ctx.status(404),
      ctx.json({ detail: 'Student not found' })
    );
  }),
  
  rest.get(`${API_URL}/students/:studentId/fees`, (req, res, ctx) => {
    const { studentId } = req.params;
    const studentFees = mockFees.filter(fee => fee.studentId === studentId);
    
    return res(
      ctx.status(200),
      ctx.json(studentFees)
    );
  }),
  
  // Add more handlers as needed
];

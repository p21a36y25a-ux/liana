import apiClient from './api';
import { AuthResponse } from '../types';

export const authService = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', { email, password });
    return response.data;
  },

  getMe: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    const response = await apiClient.post('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  },
};

export const employeesService = {
  getAll: async (params?: {
    search?: string;
    departmentId?: number;
    page?: number;
    limit?: number;
  }) => {
    const response = await apiClient.get('/employees', { params });
    return response.data;
  },

  getActive: async () => {
    const response = await apiClient.get('/employees/active');
    return response.data;
  },

  getById: async (id: number) => {
    const response = await apiClient.get(`/employees/${id}`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await apiClient.post('/employees', data);
    return response.data;
  },

  update: async (id: number, data: any) => {
    const response = await apiClient.patch(`/employees/${id}`, data);
    return response.data;
  },

  uploadPhoto: async (id: number, photoFile: File) => {
    const formData = new FormData();
    formData.append('photo', photoFile);
    const response = await apiClient.post(`/employees/${id}/photo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};

export const punchesService = {
  create: async (data: {
    employeeId: number;
    type: string;
    photoData?: string;
    latitude?: number;
    longitude?: number;
    notes?: string;
  }) => {
    const response = await apiClient.post('/punches', data);
    return response.data;
  },

  getByEmployee: async (
    employeeId: number,
    params?: { startDate?: string; endDate?: string; page?: number },
  ) => {
    const response = await apiClient.get(`/punches/employee/${employeeId}`, { params });
    return response.data;
  },

  getTodayPunches: async (employeeId: number) => {
    const response = await apiClient.get(`/punches/employee/${employeeId}/today`);
    return response.data;
  },

  getLastPunch: async (employeeId: number) => {
    const response = await apiClient.get(`/punches/employee/${employeeId}/last`);
    return response.data;
  },
};

export const attendanceService = {
  getAll: async (params?: any) => {
    const response = await apiClient.get('/attendance', { params });
    return response.data;
  },

  getToday: async () => {
    const response = await apiClient.get('/attendance/today');
    return response.data;
  },

  getByEmployee: async (employeeId: number, params?: any) => {
    const response = await apiClient.get(`/attendance/employee/${employeeId}`, { params });
    return response.data;
  },

  getMonthlyStats: async (employeeId: number, year: number, month: number) => {
    const response = await apiClient.get(`/attendance/employee/${employeeId}/stats`, {
      params: { year, month },
    });
    return response.data;
  },
};

export const leaveService = {
  createRequest: async (data: any) => {
    const response = await apiClient.post('/leave/requests', data);
    return response.data;
  },

  getRequests: async (params?: any) => {
    const response = await apiClient.get('/leave/requests', { params });
    return response.data;
  },

  reviewRequest: async (id: number, data: { status: string; comment?: string }) => {
    const response = await apiClient.patch(`/leave/requests/${id}/review`, data);
    return response.data;
  },

  cancelRequest: async (id: number) => {
    const response = await apiClient.patch(`/leave/requests/${id}/cancel`);
    return response.data;
  },

  getBalances: async (employeeId: number, year?: number) => {
    const response = await apiClient.get(`/leave/balance/${employeeId}`, {
      params: { year },
    });
    return response.data;
  },
};

export const payrollService = {
  createPeriod: async (data: any) => {
    const response = await apiClient.post('/payroll/periods', data);
    return response.data;
  },

  getPeriods: async (params?: any) => {
    const response = await apiClient.get('/payroll/periods', { params });
    return response.data;
  },

  calculateForPeriod: async (periodId: number) => {
    const response = await apiClient.post(`/payroll/periods/${periodId}/calculate`);
    return response.data;
  },

  approvePeriod: async (periodId: number) => {
    const response = await apiClient.patch(`/payroll/periods/${periodId}/approve`);
    return response.data;
  },

  markAsPaid: async (periodId: number) => {
    const response = await apiClient.patch(`/payroll/periods/${periodId}/pay`);
    return response.data;
  },

  getCalculations: async (periodId: number, page?: number) => {
    const response = await apiClient.get(`/payroll/periods/${periodId}/calculations`, {
      params: { page },
    });
    return response.data;
  },

  getEmployeeHistory: async (employeeId: number, page?: number) => {
    const response = await apiClient.get(`/payroll/employees/${employeeId}/history`, {
      params: { page },
    });
    return response.data;
  },
};

export const notificationsService = {
  getAll: async (page?: number) => {
    const response = await apiClient.get('/notifications', { params: { page } });
    return response.data;
  },

  getUnreadCount: async () => {
    const response = await apiClient.get('/notifications/unread-count');
    return response.data;
  },

  markAsRead: async (id: number) => {
    const response = await apiClient.patch(`/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await apiClient.patch('/notifications/read-all');
    return response.data;
  },
};

export const departmentsService = {
  getAll: async () => {
    const response = await apiClient.get('/departments');
    return response.data;
  },

  create: async (data: any) => {
    const response = await apiClient.post('/departments', data);
    return response.data;
  },

  update: async (id: number, data: any) => {
    const response = await apiClient.patch(`/departments/${id}`, data);
    return response.data;
  },
};

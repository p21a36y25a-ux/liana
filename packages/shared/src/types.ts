import { UserRole, PunchType, AttendanceStatus, LeaveStatus, LeaveType, PayrollStatus, EmploymentStatus } from './enums';

export interface User {
  id: number;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Employee {
  id: number;
  userId: number;
  employeeCode: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone?: string;
  departmentId: number;
  department?: Department;
  position: string;
  hourlyRate: number;
  employmentStatus: EmploymentStatus;
  hireDate: Date;
  photoUrl?: string;
  managerId?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Department {
  id: number;
  name: string;
  code: string;
  managerId?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Punch {
  id: number;
  employeeId: number;
  employee?: Employee;
  type: PunchType;
  punchTime: Date;
  photoUrl?: string;
  latitude?: number;
  longitude?: number;
  ipAddress?: string;
  deviceInfo?: string;
  isManual: boolean;
  notes?: string;
  createdAt: Date;
}

export interface Attendance {
  id: number;
  employeeId: number;
  employee?: Employee;
  date: Date;
  checkInTime?: Date;
  checkOutTime?: Date;
  totalHours: number;
  overtimeHours: number;
  status: AttendanceStatus;
  isLate: boolean;
  lateMinutes: number;
  isEarlyDeparture: boolean;
  earlyDepartureMinutes: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LeaveRequest {
  id: number;
  employeeId: number;
  employee?: Employee;
  leaveType: LeaveType;
  startDate: Date;
  endDate: Date;
  totalDays: number;
  reason: string;
  status: LeaveStatus;
  managerComment?: string;
  hrComment?: string;
  approvedById?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface LeaveBalance {
  id: number;
  employeeId: number;
  year: number;
  leaveType: LeaveType;
  totalDays: number;
  usedDays: number;
  remainingDays: number;
}

export interface PayrollPeriod {
  id: number;
  name: string;
  startDate: Date;
  endDate: Date;
  workingDays: number;
  standardHours: number;
  overtimeThreshold1: number;
  overtimeThreshold2: number;
  overtimeRate1: number;
  overtimeRate2: number;
  status: PayrollStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface PayrollCalculation {
  id: number;
  payrollPeriodId: number;
  employeeId: number;
  employee?: Employee;
  totalHours: number;
  regularHours: number;
  overtime1Hours: number;
  overtime2Hours: number;
  hourlyRate: number;
  regularAmount: number;
  overtime1Amount: number;
  overtime2Amount: number;
  grossAmount: number;
  taxDeductions: number;
  pensionDeductions: number;
  healthInsurance: number;
  netAmount: number;
  currency: string;
  status: PayrollStatus;
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: User;
  employee?: Employee;
}

export interface PunchRequest {
  type: PunchType;
  photo?: string; // base64 encoded
  latitude?: number;
  longitude?: number;
}

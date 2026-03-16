export enum UserRole {
  EMPLOYEE = 'employee',
  MANAGER = 'manager',
  HR_ADMIN = 'hr_admin',
  SYSTEM_ADMIN = 'system_admin',
}

export enum PunchType {
  CHECK_IN = 'check_in',
  CHECK_OUT = 'check_out',
}

export enum AttendanceStatus {
  PRESENT = 'present',
  ABSENT = 'absent',
  LATE = 'late',
  ON_LEAVE = 'on_leave',
  HALF_DAY = 'half_day',
}

export enum LeaveStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
}

export enum LeaveType {
  VACATION = 'vacation',
  SICK = 'sick',
  PERSONAL = 'personal',
  UNPAID = 'unpaid',
  MATERNITY = 'maternity',
  PATERNITY = 'paternity',
  BEREAVEMENT = 'bereavement',
}

export enum PayrollStatus {
  DRAFT = 'draft',
  CALCULATED = 'calculated',
  APPROVED = 'approved',
  PAID = 'paid',
}

export interface User {
  id: number;
  email: string;
  role: UserRole;
  isActive: boolean;
}

export interface Department {
  id: number;
  name: string;
  description?: string;
  managerId?: number;
}

export interface Employee {
  id: number;
  userId?: number;
  firstName: string;
  lastName: string;
  employeeCode: string;
  email: string;
  phone?: string;
  departmentId?: number;
  department?: Department;
  position: string;
  hourlyRate: number;
  startDate: string;
  photoUrl?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Punch {
  id: number;
  employeeId: number;
  employee?: Employee;
  type: PunchType;
  timestamp: string;
  photoUrl?: string;
  latitude?: number;
  longitude?: number;
  notes?: string;
  isManual: boolean;
  createdAt: string;
}

export interface Attendance {
  id: number;
  employeeId: number;
  employee?: Employee;
  date: string;
  checkIn?: string;
  checkOut?: string;
  totalHours: number;
  regularHours: number;
  overtimeHours: number;
  premiumHours: number;
  status: AttendanceStatus;
  lateMinutes: number;
  earlyDepartureMinutes: number;
}

export interface LeaveRequest {
  id: number;
  employeeId: number;
  employee?: Employee;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: LeaveStatus;
  managerId?: number;
  managerComment?: string;
  hrAdminId?: number;
  hrAdminComment?: string;
  approvedAt?: string;
  rejectedAt?: string;
  createdAt: string;
}

export interface LeaveBalance {
  id: number;
  employeeId: number;
  leaveType: LeaveType;
  year: number;
  totalDays: number;
  usedDays: number;
  remainingDays: number;
}

export interface PayrollPeriod {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  workingDays: number;
  standardHours: number;
  overtimeThreshold: number;
  overtimeRate: number;
  premiumThreshold: number;
  premiumRate: number;
  status: PayrollStatus;
  createdAt: string;
}

export interface PayrollCalculation {
  id: number;
  payrollPeriodId: number;
  payrollPeriod?: PayrollPeriod;
  employeeId: number;
  employee?: Employee;
  regularHours: number;
  overtimeHours: number;
  premiumHours: number;
  totalHours: number;
  regularPay: number;
  overtimePay: number;
  premiumPay: number;
  grossPay: number;
  currency: string;
  status: PayrollStatus;
  createdAt: string;
}

export interface Notification {
  id: number;
  userId: number;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

import { UserRole, AttendanceStatus, LeaveStatus, LeaveType, PunchType, PayrollStatus, NotificationType } from './enums';

export interface User {
  id: number;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Department {
  id: number;
  name: string;
  description?: string;
  managerId?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Employee {
  id: number;
  userId: number;
  firstName: string;
  lastName: string;
  employeeCode: string;
  email: string;
  phone?: string;
  departmentId?: number;
  department?: Department;
  position: string;
  hourlyRate: number;
  startDate: Date;
  photoUrl?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Punch {
  id: number;
  employeeId: number;
  employee?: Employee;
  type: PunchType;
  timestamp: Date;
  photoUrl?: string;
  latitude?: number;
  longitude?: number;
  notes?: string;
  isManual: boolean;
  createdBy?: number;
  createdAt: Date;
}

export interface Attendance {
  id: number;
  employeeId: number;
  employee?: Employee;
  date: string;
  checkIn?: Date;
  checkOut?: Date;
  totalHours: number;
  regularHours: number;
  overtimeHours: number;
  premiumHours: number;
  status: AttendanceStatus;
  lateMinutes: number;
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
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: LeaveStatus;
  managerId?: number;
  managerComment?: string;
  hrAdminId?: number;
  hrAdminComment?: string;
  approvedAt?: Date;
  rejectedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
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
  createdAt: Date;
  updatedAt: Date;
}

export interface PayrollCalculation {
  id: number;
  payrollPeriodId: number;
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
  notes?: string;
  calculatedAt?: Date;
  approvedAt?: Date;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  id: number;
  userId: number;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  emailSent: boolean;
  createdAt: Date;
}

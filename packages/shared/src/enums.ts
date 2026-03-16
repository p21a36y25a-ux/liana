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
  HALF_DAY = 'half_day',
  ON_LEAVE = 'on_leave',
  HOLIDAY = 'holiday',
}

export enum LeaveStatus {
  PENDING = 'pending',
  APPROVED_BY_MANAGER = 'approved_by_manager',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
}

export enum LeaveType {
  VACATION = 'vacation',
  SICK_LEAVE = 'sick_leave',
  PERSONAL = 'personal',
  MATERNITY = 'maternity',
  PATERNITY = 'paternity',
  UNPAID = 'unpaid',
  OTHER = 'other',
}

export enum PayrollStatus {
  DRAFT = 'draft',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  PAID = 'paid',
}

export enum NotificationType {
  PUNCH = 'punch',
  LEAVE_REQUEST = 'leave_request',
  LEAVE_APPROVED = 'leave_approved',
  LEAVE_REJECTED = 'leave_rejected',
  PAYROLL_COMPLETED = 'payroll_completed',
  ATTENDANCE_ALERT = 'attendance_alert',
}

export enum EmploymentStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ON_LEAVE = 'on_leave',
  TERMINATED = 'terminated',
}

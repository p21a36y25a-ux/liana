// Payroll constants - Kosovo Law compliant
export const PAYROLL_CONSTANTS = {
  STANDARD_WORKING_DAYS: 20,
  HOURS_PER_DAY: 8,
  STANDARD_MONTHLY_HOURS: 160, // 20 days * 8 hours
  OVERTIME_THRESHOLD: 160,     // Hours above this get overtime rate
  OVERTIME_HOURS_MAX: 40,      // Max overtime hours (160-200)
  PREMIUM_THRESHOLD: 200,      // Hours above this get premium rate
  OVERTIME_RATE: 1.3,          // 130% of base rate
  PREMIUM_RATE: 1.5,           // 150% of base rate
  CURRENCY: 'EUR',
  CURRENCY_SYMBOL: '€',
} as const;

// Working schedule
export const WORK_SCHEDULE = {
  START_HOUR: 8,
  END_HOUR: 17,
  LUNCH_BREAK_MINUTES: 60,
  LATE_THRESHOLD_MINUTES: 15,
  EARLY_DEPARTURE_THRESHOLD_MINUTES: 15,
} as const;

// Leave allocation defaults (days per year)
export const LEAVE_DEFAULTS = {
  VACATION: 20,
  SICK: 14,
  PERSONAL: 3,
  UNPAID: 0,
  MATERNITY: 270,
  PATERNITY: 5,
  BEREAVEMENT: 3,
} as const;

// JWT configuration
export const JWT_CONSTANTS = {
  EXPIRES_IN: '7d',
} as const;

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

// File upload
export const UPLOAD_CONSTANTS = {
  MAX_FILE_SIZE_BYTES: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  PHOTO_QUALITY: 0.8,
} as const;

// Socket.io events
export const SOCKET_EVENTS = {
  PUNCH_CREATED: 'punch:created',
  ATTENDANCE_UPDATED: 'attendance:updated',
  LEAVE_STATUS_CHANGED: 'leave:statusChanged',
  PAYROLL_PROCESSED: 'payroll:processed',
  EMPLOYEE_STATUS_CHANGED: 'employee:statusChanged',
  NOTIFICATION_NEW: 'notification:new',
} as const;

// HTTP Status codes used in API
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const;

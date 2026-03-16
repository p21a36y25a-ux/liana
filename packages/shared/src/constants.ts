// Payroll constants (Kosovo Law)
export const PAYROLL_CONSTANTS = {
  STANDARD_WORKING_DAYS_PER_MONTH: 20,
  STANDARD_HOURS_PER_DAY: 8,
  STANDARD_HOURS_PER_MONTH: 160, // 20 * 8
  
  // Overtime thresholds
  OVERTIME_THRESHOLD_1: 160, // After 160 hours: 130% rate
  OVERTIME_THRESHOLD_2: 200, // After 200 hours: 150% rate
  
  // Rate multipliers
  REGULAR_RATE: 1.0,    // 100%
  OVERTIME_RATE_1: 1.3, // 130% (161-200 hours)
  OVERTIME_RATE_2: 1.5, // 150% (201+ hours)
  
  // Kosovo tax rates
  PENSION_EMPLOYEE_RATE: 0.05, // 5% employee contribution
  PENSION_EMPLOYER_RATE: 0.05, // 5% employer contribution
  INCOME_TAX_BRACKETS: [
    { min: 0, max: 960, rate: 0 },        // 0% up to €960/year
    { min: 960, max: 3000, rate: 0.04 },   // 4%
    { min: 3000, max: 5400, rate: 0.08 },  // 8%
    { min: 5400, max: Infinity, rate: 0.10 }, // 10%
  ],
  
  CURRENCY: 'EUR',
  CURRENCY_SYMBOL: '€',
};

// Leave balance defaults (days per year)
export const LEAVE_DEFAULTS = {
  VACATION_DAYS: 20,
  SICK_LEAVE_DAYS: 15,
  PERSONAL_DAYS: 5,
  MATERNITY_DAYS: 180,
  PATERNITY_DAYS: 5,
};

// Working hours
export const WORK_SCHEDULE = {
  START_TIME: '08:00',
  END_TIME: '16:00',
  LATE_THRESHOLD_MINUTES: 15, // >15 minutes late marks as late
  EARLY_DEPARTURE_THRESHOLD_MINUTES: 15,
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
};

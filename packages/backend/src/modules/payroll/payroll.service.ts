import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PayrollPeriod } from './payroll-period.entity';
import { PayrollCalculation } from './payroll-calculation.entity';
import { AttendanceService } from '../attendance/attendance.service';
import { EmployeesService } from '../employees/employees.service';
import * as dayjs from 'dayjs';

// Kosovo tax brackets (annual income in EUR)
const INCOME_TAX_BRACKETS = [
  { min: 0, max: 960, rate: 0 },
  { min: 960, max: 3000, rate: 0.04 },
  { min: 3000, max: 5400, rate: 0.08 },
  { min: 5400, max: Infinity, rate: 0.10 },
];

@Injectable()
export class PayrollService {
  constructor(
    @InjectRepository(PayrollPeriod)
    private periodRepository: Repository<PayrollPeriod>,
    @InjectRepository(PayrollCalculation)
    private calculationRepository: Repository<PayrollCalculation>,
    private attendanceService: AttendanceService,
    private employeesService: EmployeesService,
  ) {}

  async createPeriod(data: any): Promise<PayrollPeriod> {
    const period = this.periodRepository.create(data);
    return this.periodRepository.save(period) as Promise<PayrollPeriod>;
  }

  async findAllPeriods(): Promise<PayrollPeriod[]> {
    return this.periodRepository.find({ order: { startDate: 'DESC' } });
  }

  async findPeriodById(id: number): Promise<PayrollPeriod> {
    const period = await this.periodRepository.findOne({ where: { id } });
    if (!period) throw new NotFoundException('Payroll period not found');
    return period;
  }

  async processPayroll(periodId: number): Promise<PayrollCalculation[]> {
    const period = await this.findPeriodById(periodId);
    const employees = await this.employeesService.getActiveEmployees();
    const calculations: PayrollCalculation[] = [];

    const startDate = dayjs(period.startDate);
    const endDate = dayjs(period.endDate);
    const year = startDate.year();
    const month = startDate.month() + 1;

    for (const employee of employees) {
      const calc = await this.calculateEmployeePayroll(employee, period, year, month);
      calculations.push(calc);
    }

    // Mark period as completed
    period.status = 'completed';
    await this.periodRepository.save(period);

    return calculations;
  }

  private async calculateEmployeePayroll(
    employee: any,
    period: PayrollPeriod,
    year: number,
    month: number,
  ): Promise<PayrollCalculation> {
    // Get attendance data for the period
    const attendance = await this.attendanceService.getMonthlyAttendance(employee.id, year, month);
    
    // Calculate total hours worked
    const totalHours = attendance.reduce((sum, a) => sum + Number(a.totalHours), 0);
    
    const hourlyRate = Number(employee.hourlyRate);
    const threshold1 = Number(period.standardHours); // 160 hours
    const threshold2 = Number(period.overtimeThreshold1); // 200 hours
    const rate1 = Number(period.overtimeRate1); // 1.3
    const rate2 = Number(period.overtimeRate2); // 1.5

    // Kosovo payroll calculation:
    // 0 - 160h: 100% rate
    // 161 - 200h: 130% rate
    // 201+h: 150% rate
    let regularHours = 0;
    let overtime1Hours = 0;
    let overtime2Hours = 0;

    if (totalHours <= threshold1) {
      regularHours = totalHours;
    } else if (totalHours <= threshold2) {
      regularHours = threshold1;
      overtime1Hours = totalHours - threshold1;
    } else {
      regularHours = threshold1;
      overtime1Hours = threshold2 - threshold1;
      overtime2Hours = totalHours - threshold2;
    }

    const regularAmount = regularHours * hourlyRate;
    const overtime1Amount = overtime1Hours * hourlyRate * rate1;
    const overtime2Amount = overtime2Hours * hourlyRate * rate2;
    const grossAmount = regularAmount + overtime1Amount + overtime2Amount;

    // Kosovo tax calculations
    const pensionDeduction = grossAmount * 0.05; // 5% employee pension
    const annualGross = grossAmount * 12;
    const annualTax = this.calculateKosovoIncomeTax(annualGross);
    const monthlyTax = annualTax / 12;
    const netAmount = grossAmount - pensionDeduction - monthlyTax;

    // Check if calculation exists
    let calc = await this.calculationRepository.findOne({
      where: { payrollPeriodId: period.id, employeeId: employee.id },
    });

    if (!calc) {
      calc = this.calculationRepository.create({
        payrollPeriodId: period.id,
        employeeId: employee.id,
      });
    }

    Object.assign(calc, {
      totalHours: Math.round(totalHours * 100) / 100,
      regularHours: Math.round(regularHours * 100) / 100,
      overtime1Hours: Math.round(overtime1Hours * 100) / 100,
      overtime2Hours: Math.round(overtime2Hours * 100) / 100,
      hourlyRate,
      regularAmount: Math.round(regularAmount * 100) / 100,
      overtime1Amount: Math.round(overtime1Amount * 100) / 100,
      overtime2Amount: Math.round(overtime2Amount * 100) / 100,
      grossAmount: Math.round(grossAmount * 100) / 100,
      taxDeductions: Math.round(monthlyTax * 100) / 100,
      pensionDeductions: Math.round(pensionDeduction * 100) / 100,
      healthInsurance: 0,
      netAmount: Math.round(netAmount * 100) / 100,
      currency: 'EUR',
      status: 'completed',
      processedAt: new Date(),
    });

    return this.calculationRepository.save(calc);
  }

  private calculateKosovoIncomeTax(annualIncome: number): number {
    let tax = 0;
    for (const bracket of INCOME_TAX_BRACKETS) {
      if (annualIncome <= bracket.min) break;
      const taxableInThisBracket = Math.min(annualIncome, bracket.max) - bracket.min;
      tax += taxableInThisBracket * bracket.rate;
    }
    return tax;
  }

  async getPayrollByPeriod(periodId: number): Promise<PayrollCalculation[]> {
    return this.calculationRepository.find({
      where: { payrollPeriodId: periodId },
      relations: ['employee', 'employee.department'],
    });
  }

  async getEmployeePayroll(employeeId: number): Promise<PayrollCalculation[]> {
    return this.calculationRepository.find({
      where: { employeeId },
      relations: ['payrollPeriod'],
      order: { createdAt: 'DESC' },
    });
  }

  async calculatePreview(data: { employeeId: number; totalHours: number; hourlyRate?: number }) {
    const employee = await this.employeesService.findById(data.employeeId);
    const hourlyRate = data.hourlyRate || Number(employee.hourlyRate);
    const totalHours = data.totalHours;

    const regularHours = Math.min(totalHours, 160);
    const overtime1Hours = Math.max(0, Math.min(totalHours - 160, 40));
    const overtime2Hours = Math.max(0, totalHours - 200);

    const regularAmount = regularHours * hourlyRate;
    const overtime1Amount = overtime1Hours * hourlyRate * 1.3;
    const overtime2Amount = overtime2Hours * hourlyRate * 1.5;
    const grossAmount = regularAmount + overtime1Amount + overtime2Amount;
    const pensionDeduction = grossAmount * 0.05;
    const annualTax = this.calculateKosovoIncomeTax(grossAmount * 12);
    const monthlyTax = annualTax / 12;
    const netAmount = grossAmount - pensionDeduction - monthlyTax;

    return {
      totalHours,
      regularHours,
      overtime1Hours,
      overtime2Hours,
      hourlyRate,
      regularAmount: Math.round(regularAmount * 100) / 100,
      overtime1Amount: Math.round(overtime1Amount * 100) / 100,
      overtime2Amount: Math.round(overtime2Amount * 100) / 100,
      grossAmount: Math.round(grossAmount * 100) / 100,
      pensionDeductions: Math.round(pensionDeduction * 100) / 100,
      taxDeductions: Math.round(monthlyTax * 100) / 100,
      netAmount: Math.round(netAmount * 100) / 100,
      currency: 'EUR',
    };
  }
}

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  PayrollPeriod,
  PayrollCalculation,
  PayrollStatus,
} from './entities/payroll.entity';
import { CreatePayrollPeriodDto } from './dto/payroll.dto';
import { AttendanceService } from '../attendance/attendance.service';
import { EmployeesService } from '../employees/employees.service';

interface PayrollTierResult {
  regularHours: number;
  overtimeHours: number;
  premiumHours: number;
  totalHours: number;
  regularPay: number;
  overtimePay: number;
  premiumPay: number;
  grossPay: number;
}

@Injectable()
export class PayrollService {
  constructor(
    @InjectRepository(PayrollPeriod)
    private payrollPeriodRepository: Repository<PayrollPeriod>,
    @InjectRepository(PayrollCalculation)
    private payrollCalcRepository: Repository<PayrollCalculation>,
    private attendanceService: AttendanceService,
    private employeesService: EmployeesService,
  ) {}

  /**
   * Kosovo Law compliant payroll calculation:
   * - Hours 0-160: 100% base rate (regular)
   * - Hours 161-200: 130% base rate (overtime)
   * - Hours 201+: 150% base rate (premium)
   *
   * Example: 230 hours with hourly rate of €7.50
   *   160 hrs × 100% × €7.50 = €1,200.00
   *    40 hrs × 130% × €7.50 =   €390.00
   *    30 hrs × 150% × €7.50 =   €337.50
   *   Total Gross Pay = €1,927.50
   */
  calculatePayrollTiers(
    totalHours: number,
    hourlyRate: number,
    overtimeThreshold: number,
    overtimeRate: number,
    premiumThreshold: number,
    premiumRate: number,
  ): PayrollTierResult {
    let regularHours = 0;
    let overtimeHours = 0;
    let premiumHours = 0;

    if (totalHours <= overtimeThreshold) {
      regularHours = totalHours;
    } else if (totalHours <= premiumThreshold) {
      regularHours = overtimeThreshold;
      overtimeHours = totalHours - overtimeThreshold;
    } else {
      regularHours = overtimeThreshold;
      overtimeHours = premiumThreshold - overtimeThreshold;
      premiumHours = totalHours - premiumThreshold;
    }

    const regularPay = regularHours * hourlyRate;
    const overtimePay = overtimeHours * hourlyRate * overtimeRate;
    const premiumPay = premiumHours * hourlyRate * premiumRate;
    const grossPay = regularPay + overtimePay + premiumPay;

    return {
      regularHours: Math.round(regularHours * 100) / 100,
      overtimeHours: Math.round(overtimeHours * 100) / 100,
      premiumHours: Math.round(premiumHours * 100) / 100,
      totalHours: Math.round(totalHours * 100) / 100,
      regularPay: Math.round(regularPay * 100) / 100,
      overtimePay: Math.round(overtimePay * 100) / 100,
      premiumPay: Math.round(premiumPay * 100) / 100,
      grossPay: Math.round(grossPay * 100) / 100,
    };
  }

  async createPeriod(dto: CreatePayrollPeriodDto): Promise<PayrollPeriod> {
    const period = this.payrollPeriodRepository.create({
      name: dto.name,
      startDate: dto.startDate,
      endDate: dto.endDate,
      workingDays: dto.workingDays ?? 20,
      standardHours: dto.standardHours ?? 160,
      overtimeThreshold: dto.overtimeThreshold ?? 160,
      overtimeRate: dto.overtimeRate ?? 1.3,
      premiumThreshold: dto.premiumThreshold ?? 200,
      premiumRate: dto.premiumRate ?? 1.5,
      status: PayrollStatus.DRAFT,
    });

    return this.payrollPeriodRepository.save(period);
  }

  async findAllPeriods(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await this.payrollPeriodRepository.findAndCount({
      order: { startDate: 'DESC' },
      skip,
      take: limit,
    });
    return { data, total, page, limit };
  }

  async calculateForPeriod(periodId: number): Promise<PayrollCalculation[]> {
    const period = await this.payrollPeriodRepository.findOne({
      where: { id: periodId },
    });
    if (!period) throw new NotFoundException(`Payroll period #${periodId} not found`);

    if (period.status === PayrollStatus.PAID) {
      throw new BadRequestException('Payroll period has already been paid');
    }

    const { data: employees } = await this.employeesService.findAll({ isActive: true });
    const calculations: PayrollCalculation[] = [];

    for (const employee of employees) {
      const stats = await this.attendanceService.getMonthlyStats(
        employee.id,
        new Date(period.startDate).getFullYear(),
        new Date(period.startDate).getMonth() + 1,
      );

      const totalHours = stats.totalHours;
      const hourlyRate = Number(employee.hourlyRate);

      const tiers = this.calculatePayrollTiers(
        totalHours,
        hourlyRate,
        Number(period.overtimeThreshold),
        Number(period.overtimeRate),
        Number(period.premiumThreshold),
        Number(period.premiumRate),
      );

      let calc = await this.payrollCalcRepository.findOne({
        where: { payrollPeriodId: periodId, employeeId: employee.id },
      });

      if (!calc) {
        calc = this.payrollCalcRepository.create({
          payrollPeriodId: periodId,
          employeeId: employee.id,
          currency: 'EUR',
        });
      }

      Object.assign(calc, {
        ...tiers,
        status: PayrollStatus.CALCULATED,
        calculatedAt: new Date(),
      });

      calculations.push(await this.payrollCalcRepository.save(calc));
    }

    period.status = PayrollStatus.CALCULATED;
    await this.payrollPeriodRepository.save(period);

    return calculations;
  }

  async approvePeriod(periodId: number): Promise<PayrollPeriod> {
    const period = await this.payrollPeriodRepository.findOne({
      where: { id: periodId },
    });
    if (!period) throw new NotFoundException(`Payroll period #${periodId} not found`);
    if (period.status !== PayrollStatus.CALCULATED) {
      throw new BadRequestException('Payroll must be calculated before approval');
    }

    period.status = PayrollStatus.APPROVED;
    await this.payrollCalcRepository.update(
      { payrollPeriodId: periodId },
      { status: PayrollStatus.APPROVED, approvedAt: new Date() },
    );

    return this.payrollPeriodRepository.save(period);
  }

  async markAsPaid(periodId: number): Promise<PayrollPeriod> {
    const period = await this.payrollPeriodRepository.findOne({
      where: { id: periodId },
    });
    if (!period) throw new NotFoundException(`Payroll period #${periodId} not found`);
    if (period.status !== PayrollStatus.APPROVED) {
      throw new BadRequestException('Payroll must be approved before marking as paid');
    }

    period.status = PayrollStatus.PAID;
    await this.payrollCalcRepository.update(
      { payrollPeriodId: periodId },
      { status: PayrollStatus.PAID, paidAt: new Date() },
    );

    return this.payrollPeriodRepository.save(period);
  }

  async getCalculationsForPeriod(periodId: number, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await this.payrollCalcRepository.findAndCount({
      where: { payrollPeriodId: periodId },
      relations: ['employee', 'employee.department'],
      order: { grossPay: 'DESC' },
      skip,
      take: limit,
    });
    return { data, total, page, limit };
  }

  async getEmployeePayHistory(employeeId: number, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await this.payrollCalcRepository.findAndCount({
      where: { employeeId },
      relations: ['payrollPeriod'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });
    return { data, total, page, limit };
  }
}

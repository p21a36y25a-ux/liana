import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Employee } from '../employees/employee.entity';
import { PayrollPeriod } from './payroll-period.entity';

@Entity('payroll_calculations')
export class PayrollCalculation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  payrollPeriodId: number;

  @ManyToOne(() => PayrollPeriod)
  @JoinColumn({ name: 'payrollPeriodId' })
  payrollPeriod: PayrollPeriod;

  @Column()
  employeeId: number;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'employeeId' })
  employee: Employee;

  @Column({ type: 'decimal', precision: 8, scale: 2, default: 0 })
  totalHours: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, default: 0 })
  regularHours: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, default: 0 })
  overtime1Hours: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, default: 0 })
  overtime2Hours: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  hourlyRate: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  regularAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  overtime1Amount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  overtime2Amount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  grossAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  taxDeductions: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  pensionDeductions: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  healthInsurance: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  netAmount: number;

  @Column({ default: 'EUR' })
  currency: string;

  @Column({ default: 'draft' })
  status: string;

  @Column({ nullable: true, type: 'datetime' })
  processedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

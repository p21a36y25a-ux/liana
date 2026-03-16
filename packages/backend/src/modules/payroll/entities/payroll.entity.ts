import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Employee } from '../../employees/entities/employee.entity';

export enum PayrollStatus {
  DRAFT = 'draft',
  CALCULATED = 'calculated',
  APPROVED = 'approved',
  PAID = 'paid',
}

@Entity('payroll_periods')
export class PayrollPeriod {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'date' })
  startDate: string;

  @Column({ type: 'date' })
  endDate: string;

  @Column({ default: 20 })
  workingDays: number;

  @Column({ default: 160 })
  standardHours: number;

  @Column({ default: 160 })
  overtimeThreshold: number;

  @Column({ type: 'decimal', precision: 4, scale: 2, default: 1.3 })
  overtimeRate: number;

  @Column({ default: 200 })
  premiumThreshold: number;

  @Column({ type: 'decimal', precision: 4, scale: 2, default: 1.5 })
  premiumRate: number;

  @Column({
    type: 'enum',
    enum: PayrollStatus,
    default: PayrollStatus.DRAFT,
  })
  status: PayrollStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('payroll_calculations')
export class PayrollCalculation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  payrollPeriodId: number;

  @ManyToOne(() => PayrollPeriod, { eager: false })
  @JoinColumn({ name: 'payrollPeriodId' })
  payrollPeriod: PayrollPeriod;

  @Column()
  employeeId: number;

  @ManyToOne(() => Employee, { eager: false })
  @JoinColumn({ name: 'employeeId' })
  employee: Employee;

  @Column({ type: 'decimal', precision: 7, scale: 2, default: 0 })
  regularHours: number;

  @Column({ type: 'decimal', precision: 7, scale: 2, default: 0 })
  overtimeHours: number;

  @Column({ type: 'decimal', precision: 7, scale: 2, default: 0 })
  premiumHours: number;

  @Column({ type: 'decimal', precision: 7, scale: 2, default: 0 })
  totalHours: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  regularPay: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  overtimePay: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  premiumPay: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  grossPay: number;

  @Column({ default: 'EUR' })
  currency: string;

  @Column({
    type: 'enum',
    enum: PayrollStatus,
    default: PayrollStatus.DRAFT,
  })
  status: PayrollStatus;

  @Column({ nullable: true, type: 'text' })
  notes: string;

  @Column({ nullable: true, type: 'datetime' })
  calculatedAt: Date;

  @Column({ nullable: true, type: 'datetime' })
  approvedAt: Date;

  @Column({ nullable: true, type: 'datetime' })
  paidAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

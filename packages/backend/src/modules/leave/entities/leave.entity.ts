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

@Entity('leave_requests')
export class LeaveRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  employeeId: number;

  @ManyToOne(() => Employee, { eager: false })
  @JoinColumn({ name: 'employeeId' })
  employee: Employee;

  @Column({
    type: 'enum',
    enum: LeaveType,
  })
  leaveType: LeaveType;

  @Column({ type: 'date' })
  startDate: string;

  @Column({ type: 'date' })
  endDate: string;

  @Column({ type: 'decimal', precision: 5, scale: 1 })
  totalDays: number;

  @Column({ type: 'text' })
  reason: string;

  @Column({
    type: 'enum',
    enum: LeaveStatus,
    default: LeaveStatus.PENDING,
  })
  status: LeaveStatus;

  @Column({ nullable: true })
  managerId: number;

  @Column({ nullable: true, type: 'text' })
  managerComment: string;

  @Column({ nullable: true })
  hrAdminId: number;

  @Column({ nullable: true, type: 'text' })
  hrAdminComment: string;

  @Column({ nullable: true, type: 'datetime' })
  approvedAt: Date;

  @Column({ nullable: true, type: 'datetime' })
  rejectedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('leave_balances')
export class LeaveBalance {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  employeeId: number;

  @Column({
    type: 'enum',
    enum: LeaveType,
  })
  leaveType: LeaveType;

  @Column()
  year: number;

  @Column({ type: 'decimal', precision: 5, scale: 1, default: 0 })
  totalDays: number;

  @Column({ type: 'decimal', precision: 5, scale: 1, default: 0 })
  usedDays: number;

  @Column({ type: 'decimal', precision: 5, scale: 1, default: 0 })
  remainingDays: number;
}

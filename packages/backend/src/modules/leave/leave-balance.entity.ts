import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('leave_balances')
export class LeaveBalance {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  employeeId: number;

  @Column()
  year: number;

  @Column({ type: 'enum', enum: ['vacation', 'sick_leave', 'personal', 'maternity', 'paternity', 'unpaid', 'other'] })
  leaveType: string;

  @Column({ type: 'decimal', precision: 5, scale: 1, default: 0 })
  totalDays: number;

  @Column({ type: 'decimal', precision: 5, scale: 1, default: 0 })
  usedDays: number;

  @Column({ type: 'decimal', precision: 5, scale: 1, default: 0 })
  remainingDays: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

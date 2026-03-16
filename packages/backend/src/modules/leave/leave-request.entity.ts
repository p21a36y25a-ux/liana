import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Employee } from '../employees/employee.entity';

@Entity('leave_requests')
export class LeaveRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  employeeId: number;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'employeeId' })
  employee: Employee;

  @Column({ type: 'enum', enum: ['vacation', 'sick_leave', 'personal', 'maternity', 'paternity', 'unpaid', 'other'] })
  leaveType: string;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date' })
  endDate: Date;

  @Column({ type: 'decimal', precision: 5, scale: 1 })
  totalDays: number;

  @Column({ type: 'text' })
  reason: string;

  @Column({ default: 'pending' })
  status: string;

  @Column({ nullable: true, type: 'text' })
  managerComment: string;

  @Column({ nullable: true, type: 'text' })
  hrComment: string;

  @Column({ nullable: true })
  approvedById: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Employee } from '../employees/employee.entity';

@Entity('attendance')
export class Attendance {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  employeeId: number;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'employeeId' })
  employee: Employee;

  @Column({ type: 'date' })
  date: Date;

  @Column({ nullable: true, type: 'datetime' })
  checkInTime: Date;

  @Column({ nullable: true, type: 'datetime' })
  checkOutTime: Date;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  totalHours: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  overtimeHours: number;

  @Column({ default: 'present' })
  status: string;

  @Column({ default: false })
  isLate: boolean;

  @Column({ default: 0 })
  lateMinutes: number;

  @Column({ default: false })
  isEarlyDeparture: boolean;

  @Column({ default: 0 })
  earlyDepartureMinutes: number;

  @Column({ nullable: true, type: 'text' })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

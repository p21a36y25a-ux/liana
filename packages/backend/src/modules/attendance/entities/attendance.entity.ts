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

export enum AttendanceStatus {
  PRESENT = 'present',
  ABSENT = 'absent',
  LATE = 'late',
  ON_LEAVE = 'on_leave',
  HALF_DAY = 'half_day',
}

@Entity('attendance')
export class Attendance {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  employeeId: number;

  @ManyToOne(() => Employee, { eager: false })
  @JoinColumn({ name: 'employeeId' })
  employee: Employee;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'datetime', nullable: true })
  checkIn: Date;

  @Column({ type: 'datetime', nullable: true })
  checkOut: Date;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  totalHours: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  regularHours: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  overtimeHours: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  premiumHours: number;

  @Column({
    type: 'enum',
    enum: AttendanceStatus,
    default: AttendanceStatus.ABSENT,
  })
  status: AttendanceStatus;

  @Column({ default: 0 })
  lateMinutes: number;

  @Column({ default: 0 })
  earlyDepartureMinutes: number;

  @Column({ nullable: true, type: 'text' })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

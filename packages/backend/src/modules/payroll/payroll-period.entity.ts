import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('payroll_periods')
export class PayrollPeriod {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date' })
  endDate: Date;

  @Column({ default: 20 })
  workingDays: number;

  @Column({ default: 160 })
  standardHours: number;

  @Column({ default: 200 })
  overtimeThreshold1: number;

  @Column({ default: 200 })
  overtimeThreshold2: number;

  @Column({ type: 'decimal', precision: 4, scale: 2, default: 1.3 })
  overtimeRate1: number;

  @Column({ type: 'decimal', precision: 4, scale: 2, default: 1.5 })
  overtimeRate2: number;

  @Column({ default: 'draft' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

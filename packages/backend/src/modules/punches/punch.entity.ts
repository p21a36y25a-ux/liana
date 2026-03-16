import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Employee } from '../employees/employee.entity';

@Entity('punches')
export class Punch {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  employeeId: number;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'employeeId' })
  employee: Employee;

  @Column({ type: 'enum', enum: ['check_in', 'check_out'] })
  type: string;

  @Column({ type: 'datetime' })
  punchTime: Date;

  @Column({ nullable: true, type: 'text' })
  photoUrl: string;

  @Column({ nullable: true, type: 'decimal', precision: 10, scale: 7 })
  latitude: number;

  @Column({ nullable: true, type: 'decimal', precision: 10, scale: 7 })
  longitude: number;

  @Column({ nullable: true })
  ipAddress: string;

  @Column({ nullable: true })
  deviceInfo: string;

  @Column({ default: false })
  isManual: boolean;

  @Column({ nullable: true, type: 'text' })
  notes: string;

  @Column({ nullable: true })
  createdByUserId: number;

  @CreateDateColumn()
  createdAt: Date;
}

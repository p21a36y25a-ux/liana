import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Employee } from '../../employees/entities/employee.entity';

export enum PunchType {
  CHECK_IN = 'check_in',
  CHECK_OUT = 'check_out',
}

@Entity('punches')
export class Punch {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  employeeId: number;

  @ManyToOne(() => Employee, { eager: false })
  @JoinColumn({ name: 'employeeId' })
  employee: Employee;

  @Column({
    type: 'enum',
    enum: PunchType,
  })
  type: PunchType;

  @Column({ type: 'datetime' })
  timestamp: Date;

  @Column({ nullable: true, type: 'text' })
  photoUrl: string;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude: number;

  @Column({ nullable: true, type: 'text' })
  notes: string;

  @Column({ default: false })
  isManual: boolean;

  @Column({ nullable: true })
  createdBy: number;

  @CreateDateColumn()
  createdAt: Date;
}

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { User } from '../users/user.entity';

@Entity('employees')
export class Employee {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  employeeCode: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ default: 'active' })
  employmentStatus: string;

  @Column()
  position: string;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  hourlyRate: number;

  @Column({ type: 'date' })
  hireDate: Date;

  @Column({ nullable: true })
  photoUrl: string;

  @Column({ nullable: true })
  departmentId: number;

  @ManyToOne('Department', 'employees')
  @JoinColumn({ name: 'departmentId' })
  department: any;

  @Column({ nullable: true })
  managerId: number;

  @OneToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ nullable: true })
  userId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}

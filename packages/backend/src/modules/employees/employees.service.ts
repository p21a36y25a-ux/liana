import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindManyOptions } from 'typeorm';
import { Employee } from './employee.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class EmployeesService {
  constructor(
    @InjectRepository(Employee)
    private employeesRepository: Repository<Employee>,
    private usersService: UsersService,
  ) {}

  async findAll(query?: { search?: string; departmentId?: number; status?: string }): Promise<Employee[]> {
    const options: FindManyOptions<Employee> = {
      relations: ['department', 'user'],
      where: {},
    };
    if (query?.departmentId) {
      (options.where as any).departmentId = query.departmentId;
    }
    if (query?.status) {
      (options.where as any).employmentStatus = query.status;
    }
    const employees = await this.employeesRepository.find(options);
    if (query?.search) {
      const s = query.search.toLowerCase();
      return employees.filter(e =>
        e.firstName.toLowerCase().includes(s) ||
        e.lastName.toLowerCase().includes(s) ||
        e.employeeCode.toLowerCase().includes(s),
      );
    }
    return employees;
  }

  async findById(id: number): Promise<Employee> {
    const emp = await this.employeesRepository.findOne({
      where: { id },
      relations: ['department', 'user'],
    });
    if (!emp) throw new NotFoundException('Employee not found');
    return emp;
  }

  async findByUserId(userId: number): Promise<Employee | null> {
    return this.employeesRepository.findOne({
      where: { userId },
      relations: ['department'],
    });
  }

  async create(data: any): Promise<Employee> {
    // Create user account for employee
    if (data.email && data.password) {
      const user = await this.usersService.create({
        email: data.email,
        password: data.password,
        role: data.role || 'employee',
      });
      data.userId = user.id;
    }
    delete data.password;
    delete data.role;

    // Generate employee code
    const count = await this.employeesRepository.count();
    data.employeeCode = data.employeeCode || `EMP${String(count + 1).padStart(4, '0')}`;

    const employee = this.employeesRepository.create(data);
    return this.employeesRepository.save(employee) as Promise<Employee>;
  }

  async update(id: number, data: any): Promise<Employee> {
    const employee = await this.findById(id);
    Object.assign(employee, data);
    return this.employeesRepository.save(employee);
  }

  async delete(id: number): Promise<void> {
    const employee = await this.findById(id);
    await this.employeesRepository.remove(employee);
  }

  async getActiveEmployees(): Promise<Employee[]> {
    return this.employeesRepository.find({
      where: { employmentStatus: 'active' },
      relations: ['department'],
      order: { firstName: 'ASC' },
    });
  }
}

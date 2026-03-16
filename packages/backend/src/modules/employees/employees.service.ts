import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Employee } from './entities/employee.entity';
import { CreateEmployeeDto, UpdateEmployeeDto } from './dto/employee.dto';

@Injectable()
export class EmployeesService {
  constructor(
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
  ) {}

  async create(createEmployeeDto: CreateEmployeeDto): Promise<Employee> {
    const existing = await this.employeeRepository.findOne({
      where: [
        { email: createEmployeeDto.email },
        { employeeCode: createEmployeeDto.employeeCode },
      ],
    });
    if (existing) {
      throw new ConflictException('Employee with this email or code already exists');
    }

    const employee = this.employeeRepository.create(createEmployeeDto);
    return this.employeeRepository.save(employee);
  }

  async findAll(query?: {
    search?: string;
    departmentId?: number;
    isActive?: boolean;
    page?: number;
    limit?: number;
  }) {
    const page = query?.page || 1;
    const limit = Math.min(query?.limit || 20, 100);
    const skip = (page - 1) * limit;

    const qb = this.employeeRepository
      .createQueryBuilder('employee')
      .leftJoinAndSelect('employee.department', 'department')
      .skip(skip)
      .take(limit);

    if (query?.search) {
      qb.andWhere(
        '(employee.firstName LIKE :search OR employee.lastName LIKE :search OR employee.employeeCode LIKE :search OR employee.email LIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    if (query?.departmentId) {
      qb.andWhere('employee.departmentId = :departmentId', {
        departmentId: query.departmentId,
      });
    }

    if (query?.isActive !== undefined) {
      qb.andWhere('employee.isActive = :isActive', {
        isActive: query.isActive,
      });
    }

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit };
  }

  async findOne(id: number): Promise<Employee> {
    const employee = await this.employeeRepository.findOne({
      where: { id },
      relations: ['department'],
    });
    if (!employee) {
      throw new NotFoundException(`Employee #${id} not found`);
    }
    return employee;
  }

  async findByUserId(userId: number): Promise<Employee | null> {
    return this.employeeRepository.findOne({
      where: { userId },
      relations: ['department'],
    });
  }

  async update(id: number, updateEmployeeDto: UpdateEmployeeDto): Promise<Employee> {
    const employee = await this.findOne(id);
    Object.assign(employee, updateEmployeeDto);
    return this.employeeRepository.save(employee);
  }

  async updatePhoto(id: number, photoUrl: string): Promise<Employee> {
    const employee = await this.findOne(id);
    employee.photoUrl = photoUrl;
    return this.employeeRepository.save(employee);
  }

  async deactivate(id: number): Promise<Employee> {
    const employee = await this.findOne(id);
    employee.isActive = false;
    return this.employeeRepository.save(employee);
  }

  async getActiveEmployees(): Promise<Employee[]> {
    return this.employeeRepository.find({
      where: { isActive: true },
      relations: ['department'],
      order: { firstName: 'ASC', lastName: 'ASC' },
    });
  }
}

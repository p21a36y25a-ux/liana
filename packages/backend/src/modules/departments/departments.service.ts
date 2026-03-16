import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from './entities/department.entity';

export class CreateDepartmentDto {
  name: string;
  description?: string;
  managerId?: number;
}

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectRepository(Department)
    private departmentRepository: Repository<Department>,
  ) {}

  async create(dto: CreateDepartmentDto): Promise<Department> {
    const department = this.departmentRepository.create(dto);
    return this.departmentRepository.save(department);
  }

  async findAll(): Promise<Department[]> {
    return this.departmentRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Department> {
    const dept = await this.departmentRepository.findOne({ where: { id } });
    if (!dept) throw new NotFoundException(`Department #${id} not found`);
    return dept;
  }

  async update(id: number, dto: Partial<CreateDepartmentDto>): Promise<Department> {
    const dept = await this.findOne(id);
    Object.assign(dept, dto);
    return this.departmentRepository.save(dept);
  }

  async remove(id: number): Promise<void> {
    const dept = await this.findOne(id);
    dept.isActive = false;
    await this.departmentRepository.save(dept);
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from './department.entity';

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectRepository(Department)
    private departmentsRepository: Repository<Department>,
  ) {}

  async findAll(): Promise<Department[]> {
    return this.departmentsRepository.find({ relations: ['employees'] });
  }

  async findById(id: number): Promise<Department> {
    const dept = await this.departmentsRepository.findOne({ where: { id }, relations: ['employees'] });
    if (!dept) throw new NotFoundException('Department not found');
    return dept;
  }

  async create(data: any): Promise<Department> {
    const dept = this.departmentsRepository.create(data);
    return this.departmentsRepository.save(dept) as Promise<Department>;
  }

  async update(id: number, data: any): Promise<Department> {
    const dept = await this.findById(id);
    Object.assign(dept, data);
    return this.departmentsRepository.save(dept) as Promise<Department>;
  }

  async delete(id: number): Promise<void> {
    const dept = await this.findById(id);
    await this.departmentsRepository.remove(dept);
  }
}

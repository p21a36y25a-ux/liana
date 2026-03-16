import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email },
      relations: ['employee'],
    });
  }

  async findById(id: number): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { id },
      relations: ['employee', 'employee.department'],
    });
  }

  async create(data: { email: string; password: string; role?: string }): Promise<User> {
    const existing = await this.findByEmail(data.email);
    if (existing) throw new ConflictException('Email already in use');
    const hashed = await bcrypt.hash(data.password, 10);
    const user = this.usersRepository.create({
      email: data.email,
      password: hashed,
      role: data.role || 'employee',
    });
    return this.usersRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({ relations: ['employee'] });
  }

  async update(id: number, data: Partial<User>): Promise<User> {
    const user = await this.findById(id);
    if (!user) throw new NotFoundException('User not found');
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    Object.assign(user, data);
    return this.usersRepository.save(user);
  }
}

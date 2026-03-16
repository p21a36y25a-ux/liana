import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Punch } from './punch.entity';
import { EmployeesService } from '../employees/employees.service';
import { AttendanceService } from '../attendance/attendance.service';
import { EventsGateway } from '../events/events.gateway';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import * as dayjs from 'dayjs';

@Injectable()
export class PunchesService {
  constructor(
    @InjectRepository(Punch)
    private punchesRepository: Repository<Punch>,
    private employeesService: EmployeesService,
    private attendanceService: AttendanceService,
    private eventsGateway: EventsGateway,
  ) {}

  async punch(employeeId: number, data: {
    type: string;
    photo?: string;
    latitude?: number;
    longitude?: number;
    ipAddress?: string;
    deviceInfo?: string;
    isManual?: boolean;
    notes?: string;
    createdByUserId?: number;
  }): Promise<Punch> {
    const employee = await this.employeesService.findById(employeeId);

    // Save photo if provided (base64)
    let photoUrl: string | null = null;
    if (data.photo) {
      photoUrl = await this.savePhoto(data.photo, employeeId);
    }

    const punchTime = new Date();
    const punch = this.punchesRepository.create({
      employeeId,
      type: data.type,
      punchTime,
      photoUrl,
      latitude: data.latitude,
      longitude: data.longitude,
      ipAddress: data.ipAddress,
      deviceInfo: data.deviceInfo,
      isManual: data.isManual || false,
      notes: data.notes,
      createdByUserId: data.createdByUserId,
    });

    const saved = await this.punchesRepository.save(punch);

    // Update attendance record
    await this.attendanceService.updateFromPunch(saved, employee);

    // Emit real-time event
    this.eventsGateway.emitPunchEvent({
      type: 'punch',
      employeeId,
      employeeName: `${employee.firstName} ${employee.lastName}`,
      punchType: data.type,
      punchTime: punchTime.toISOString(),
    });

    return saved;
  }

  private async savePhoto(base64Data: string, employeeId: number): Promise<string> {
    const uploadsDir = path.join(process.cwd(), 'uploads', 'punches');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    const base64 = base64Data.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64, 'base64');
    const filename = `${employeeId}_${uuidv4()}.jpg`;
    const filepath = path.join(uploadsDir, filename);
    fs.writeFileSync(filepath, buffer);
    return `/uploads/punches/${filename}`;
  }

  async getEmployeePunches(employeeId: number, startDate?: Date, endDate?: Date): Promise<Punch[]> {
    const where: any = { employeeId };
    if (startDate && endDate) {
      where.punchTime = Between(startDate, endDate);
    }
    return this.punchesRepository.find({
      where,
      relations: ['employee'],
      order: { punchTime: 'DESC' },
    });
  }

  async getTodayPunches(): Promise<Punch[]> {
    const today = dayjs().startOf('day').toDate();
    const tomorrow = dayjs().endOf('day').toDate();
    return this.punchesRepository.find({
      where: { punchTime: Between(today, tomorrow) },
      relations: ['employee', 'employee.department'],
      order: { punchTime: 'DESC' },
    });
  }

  async getLastPunch(employeeId: number): Promise<Punch | null> {
    return this.punchesRepository.findOne({
      where: { employeeId },
      order: { punchTime: 'DESC' },
    });
  }

  async getPunchHistory(query: {
    employeeId?: number;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const qb = this.punchesRepository.createQueryBuilder('punch')
      .leftJoinAndSelect('punch.employee', 'employee')
      .leftJoinAndSelect('employee.department', 'department')
      .orderBy('punch.punchTime', 'DESC')
      .skip(skip)
      .take(limit);

    if (query.employeeId) {
      qb.andWhere('punch.employeeId = :employeeId', { employeeId: query.employeeId });
    }
    if (query.startDate) {
      qb.andWhere('punch.punchTime >= :startDate', { startDate: query.startDate });
    }
    if (query.endDate) {
      qb.andWhere('punch.punchTime <= :endDate', { endDate: query.endDate });
    }

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }
}

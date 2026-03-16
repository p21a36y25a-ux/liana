import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Punch, PunchType } from './entities/punch.entity';
import { CreatePunchDto, ManualPunchDto } from './dto/punch.dto';
import { AttendanceService } from '../attendance/attendance.service';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PunchesService {
  constructor(
    @InjectRepository(Punch)
    private punchRepository: Repository<Punch>,
    private readonly attendanceService: AttendanceService,
  ) {}

  async create(
    createPunchDto: CreatePunchDto,
    createdBy?: number,
    isManual = false,
  ): Promise<Punch> {
    let photoUrl: string | undefined;

    if (createPunchDto.photoData && createPunchDto.photoData.startsWith('data:image')) {
      photoUrl = this.saveBase64Photo(createPunchDto.photoData);
    } else if (createPunchDto.photoData) {
      photoUrl = createPunchDto.photoData;
    }

    const punch = this.punchRepository.create({
      employeeId: createPunchDto.employeeId,
      type: createPunchDto.type,
      timestamp: createPunchDto.timestamp
        ? new Date(createPunchDto.timestamp)
        : new Date(),
      photoUrl,
      latitude: createPunchDto.latitude,
      longitude: createPunchDto.longitude,
      notes: createPunchDto.notes,
      isManual,
      createdBy,
    });

    const savedPunch = await this.punchRepository.save(punch);

    // Automatically update attendance record after each punch
    const date = savedPunch.timestamp.toISOString().split('T')[0];
    const todayPunches = await this.getTodayPunches(createPunchDto.employeeId);
    const checkIn = todayPunches.find(p => p.type === PunchType.CHECK_IN)?.timestamp;
    const checkOut = todayPunches.find(p => p.type === PunchType.CHECK_OUT)?.timestamp;
    await this.attendanceService.updateAttendance(
      createPunchDto.employeeId,
      date,
      checkIn,
      checkOut,
    );

    return savedPunch;
  }

  private saveBase64Photo(base64Data: string): string {
    const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return base64Data;
    }

    const extension = matches[1].split('/')[1];
    const filename = `${uuidv4()}.${extension}`;
    const uploadDir = join(process.cwd(), 'uploads', 'punches');

    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true });
    }

    writeFileSync(join(uploadDir, filename), Buffer.from(matches[2], 'base64'));
    return `/uploads/punches/${filename}`;
  }

  async findByEmployee(
    employeeId: number,
    options?: { startDate?: string; endDate?: string; page?: number; limit?: number },
  ) {
    const page = options?.page || 1;
    const limit = Math.min(options?.limit || 20, 100);
    const skip = (page - 1) * limit;

    const qb = this.punchRepository
      .createQueryBuilder('punch')
      .where('punch.employeeId = :employeeId', { employeeId })
      .orderBy('punch.timestamp', 'DESC')
      .skip(skip)
      .take(limit);

    if (options?.startDate && options?.endDate) {
      qb.andWhere('punch.timestamp BETWEEN :startDate AND :endDate', {
        startDate: new Date(options.startDate),
        endDate: new Date(options.endDate),
      });
    }

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit };
  }

  async getTodayPunches(employeeId: number): Promise<Punch[]> {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

    return this.punchRepository.find({
      where: {
        employeeId,
        timestamp: Between(startOfDay, endOfDay),
      },
      order: { timestamp: 'ASC' },
    });
  }

  async getLastPunch(employeeId: number): Promise<Punch | null> {
    return this.punchRepository.findOne({
      where: { employeeId },
      order: { timestamp: 'DESC' },
    });
  }

  async findAll(options?: {
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) {
    const page = options?.page || 1;
    const limit = Math.min(options?.limit || 20, 100);
    const skip = (page - 1) * limit;

    const qb = this.punchRepository
      .createQueryBuilder('punch')
      .leftJoinAndSelect('punch.employee', 'employee')
      .orderBy('punch.timestamp', 'DESC')
      .skip(skip)
      .take(limit);

    if (options?.startDate && options?.endDate) {
      qb.andWhere('punch.timestamp BETWEEN :startDate AND :endDate', {
        startDate: new Date(options.startDate),
        endDate: new Date(options.endDate),
      });
    }

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit };
  }

  async delete(id: number): Promise<void> {
    const punch = await this.punchRepository.findOne({ where: { id } });
    if (!punch) throw new NotFoundException(`Punch #${id} not found`);
    await this.punchRepository.remove(punch);
  }
}

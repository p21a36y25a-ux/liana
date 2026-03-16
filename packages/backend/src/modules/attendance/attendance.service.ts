import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Attendance, AttendanceStatus } from './entities/attendance.entity';

@Injectable()
export class AttendanceService {
  private readonly STANDARD_START_HOUR = 8;
  private readonly LATE_THRESHOLD_MINUTES = 15;

  constructor(
    @InjectRepository(Attendance)
    private attendanceRepository: Repository<Attendance>,
  ) {}

  async generateFromPunches(employeeId: number, date: string): Promise<Attendance> {
    let attendance = await this.attendanceRepository.findOne({
      where: { employeeId, date },
    });

    if (!attendance) {
      attendance = this.attendanceRepository.create({
        employeeId,
        date,
        status: AttendanceStatus.ABSENT,
      });
    }

    return this.attendanceRepository.save(attendance);
  }

  async updateAttendance(
    employeeId: number,
    date: string,
    checkIn?: Date,
    checkOut?: Date,
  ): Promise<Attendance> {
    let attendance = await this.attendanceRepository.findOne({
      where: { employeeId, date },
    });

    if (!attendance) {
      attendance = this.attendanceRepository.create({
        employeeId,
        date,
        status: AttendanceStatus.ABSENT,
      });
    }

    if (checkIn) attendance.checkIn = checkIn;
    if (checkOut) attendance.checkOut = checkOut;

    if (attendance.checkIn) {
      const expectedStart = new Date(attendance.checkIn);
      expectedStart.setHours(this.STANDARD_START_HOUR, 0, 0, 0);
      const lateMs = attendance.checkIn.getTime() - expectedStart.getTime();
      attendance.lateMinutes = Math.max(0, Math.floor(lateMs / 60000));

      attendance.status =
        attendance.lateMinutes > this.LATE_THRESHOLD_MINUTES
          ? AttendanceStatus.LATE
          : AttendanceStatus.PRESENT;
    }

    if (attendance.checkIn && attendance.checkOut) {
      const diffMs = attendance.checkOut.getTime() - attendance.checkIn.getTime();
      const totalHours = diffMs / 3600000;
      attendance.totalHours = Math.round(totalHours * 100) / 100;
      attendance.regularHours = Math.min(attendance.totalHours, 8);
    }

    return this.attendanceRepository.save(attendance);
  }

  async findByEmployee(
    employeeId: number,
    options?: { startDate?: string; endDate?: string; page?: number; limit?: number },
  ) {
    const page = options?.page || 1;
    const limit = Math.min(options?.limit || 31, 100);
    const skip = (page - 1) * limit;

    const qb = this.attendanceRepository
      .createQueryBuilder('attendance')
      .leftJoinAndSelect('attendance.employee', 'employee')
      .where('attendance.employeeId = :employeeId', { employeeId })
      .orderBy('attendance.date', 'DESC')
      .skip(skip)
      .take(limit);

    if (options?.startDate) {
      qb.andWhere('attendance.date >= :startDate', { startDate: options.startDate });
    }
    if (options?.endDate) {
      qb.andWhere('attendance.date <= :endDate', { endDate: options.endDate });
    }

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit };
  }

  async findAll(options?: {
    startDate?: string;
    endDate?: string;
    departmentId?: number;
    status?: AttendanceStatus;
    page?: number;
    limit?: number;
  }) {
    const page = options?.page || 1;
    const limit = Math.min(options?.limit || 20, 100);
    const skip = (page - 1) * limit;

    const qb = this.attendanceRepository
      .createQueryBuilder('attendance')
      .leftJoinAndSelect('attendance.employee', 'employee')
      .leftJoinAndSelect('employee.department', 'department')
      .orderBy('attendance.date', 'DESC')
      .skip(skip)
      .take(limit);

    if (options?.startDate) {
      qb.andWhere('attendance.date >= :startDate', { startDate: options.startDate });
    }
    if (options?.endDate) {
      qb.andWhere('attendance.date <= :endDate', { endDate: options.endDate });
    }
    if (options?.departmentId) {
      qb.andWhere('employee.departmentId = :departmentId', {
        departmentId: options.departmentId,
      });
    }
    if (options?.status) {
      qb.andWhere('attendance.status = :status', { status: options.status });
    }

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit };
  }

  async getTodayStatus() {
    const today = new Date().toISOString().split('T')[0];
    return this.attendanceRepository
      .createQueryBuilder('attendance')
      .leftJoinAndSelect('attendance.employee', 'employee')
      .where('attendance.date = :today', { today })
      .getMany();
  }

  async markOnLeave(employeeId: number, date: string): Promise<Attendance> {
    let attendance = await this.attendanceRepository.findOne({
      where: { employeeId, date },
    });

    if (!attendance) {
      attendance = this.attendanceRepository.create({ employeeId, date });
    }

    attendance.status = AttendanceStatus.ON_LEAVE;
    return this.attendanceRepository.save(attendance);
  }

  async getMonthlyStats(employeeId: number, year: number, month: number) {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;

    const records = await this.attendanceRepository.find({
      where: { employeeId },
      order: { date: 'ASC' },
    });

    const filtered = records.filter(r => r.date >= startDate && r.date <= endDate);

    const stats = {
      presentDays: filtered.filter(r => r.status === AttendanceStatus.PRESENT).length,
      absentDays: filtered.filter(r => r.status === AttendanceStatus.ABSENT).length,
      lateDays: filtered.filter(r => r.status === AttendanceStatus.LATE).length,
      onLeaveDays: filtered.filter(r => r.status === AttendanceStatus.ON_LEAVE).length,
      totalHours: filtered.reduce((sum, r) => sum + Number(r.totalHours), 0),
    };

    return stats;
  }
}

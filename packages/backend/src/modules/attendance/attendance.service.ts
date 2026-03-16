import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Attendance } from './attendance.entity';
import * as dayjs from 'dayjs';

const WORK_START = 8; // 8:00 AM
const WORK_END = 16; // 4:00 PM
const LATE_THRESHOLD = 15; // minutes

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private attendanceRepository: Repository<Attendance>,
  ) {}

  async updateFromPunch(punch: any, employee: any): Promise<Attendance> {
    const punchDate = dayjs(punch.punchTime).format('YYYY-MM-DD');

    let attendance = await this.attendanceRepository.findOne({
      where: { employeeId: punch.employeeId, date: punchDate as any },
    });

    if (!attendance) {
      attendance = this.attendanceRepository.create({
        employeeId: punch.employeeId,
        date: punchDate as any,
        status: 'present',
      });
    }

    if (punch.type === 'check_in') {
      attendance.checkInTime = punch.punchTime;
      // Check if late
      const punchHour = dayjs(punch.punchTime).hour();
      const punchMinute = dayjs(punch.punchTime).minute();
      const minutesAfterStart = (punchHour - WORK_START) * 60 + punchMinute;
      if (minutesAfterStart > LATE_THRESHOLD) {
        attendance.isLate = true;
        attendance.lateMinutes = minutesAfterStart;
        attendance.status = 'late';
      }
    } else if (punch.type === 'check_out') {
      attendance.checkOutTime = punch.punchTime;
      // Calculate total hours
      if (attendance.checkInTime) {
        const diffMs = dayjs(punch.punchTime).diff(dayjs(attendance.checkInTime));
        const totalHours = diffMs / (1000 * 60 * 60);
        attendance.totalHours = Math.round(totalHours * 100) / 100;
        
        // Calculate overtime (standard 8h per day)
        const standardHours = 8;
        attendance.overtimeHours = Math.max(0, attendance.totalHours - standardHours);
        
        // Check early departure
        const punchHour = dayjs(punch.punchTime).hour();
        const punchMinute = dayjs(punch.punchTime).minute();
        const minutesBeforeEnd = (WORK_END - punchHour) * 60 - punchMinute;
        if (minutesBeforeEnd > LATE_THRESHOLD) {
          attendance.isEarlyDeparture = true;
          attendance.earlyDepartureMinutes = minutesBeforeEnd;
        }
      }
    }

    return this.attendanceRepository.save(attendance);
  }

  async getAttendanceByDate(date: Date): Promise<Attendance[]> {
    return this.attendanceRepository.find({
      where: { date: date as any },
      relations: ['employee', 'employee.department'],
    });
  }

  async getEmployeeAttendance(employeeId: number, startDate: Date, endDate: Date): Promise<Attendance[]> {
    return this.attendanceRepository.find({
      where: {
        employeeId,
        date: Between(startDate, endDate) as any,
      },
      order: { date: 'DESC' },
    });
  }

  async getMonthlyAttendance(employeeId: number, year: number, month: number): Promise<Attendance[]> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    return this.getEmployeeAttendance(employeeId, startDate, endDate);
  }

  async getDailyOverview(): Promise<any> {
    const today = dayjs().format('YYYY-MM-DD');
    const records = await this.attendanceRepository.find({
      where: { date: today as any },
      relations: ['employee'],
    });
    
    const present = records.filter(r => r.status === 'present' || r.status === 'late').length;
    const late = records.filter(r => r.isLate).length;
    const absent = records.filter(r => r.status === 'absent').length;
    const onLeave = records.filter(r => r.status === 'on_leave').length;
    
    return { present, late, absent, onLeave, total: records.length, records };
  }

  async getTimesheetData(employeeId: number, year: number, month: number) {
    const records = await this.getMonthlyAttendance(employeeId, year, month);
    const totalHours = records.reduce((sum, r) => sum + Number(r.totalHours), 0);
    const totalDays = records.filter(r => r.status !== 'absent').length;
    const lateDays = records.filter(r => r.isLate).length;
    return { records, totalHours, totalDays, lateDays };
  }
}

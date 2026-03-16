import { Injectable } from '@nestjs/common';
import { AttendanceService } from '../attendance/attendance.service';
import { EmployeesService } from '../employees/employees.service';
import { LeaveService } from '../leave/leave.service';

@Injectable()
export class ReportsService {
  constructor(
    private attendanceService: AttendanceService,
    private employeesService: EmployeesService,
    private leaveService: LeaveService,
  ) {}

  async getDashboardStats() {
    const [employees, todayAttendance, pendingLeave] = await Promise.all([
      this.employeesService.getActiveEmployees(),
      this.attendanceService.getDailyOverview(),
      this.leaveService.getPendingRequests(),
    ]);

    return {
      totalEmployees: employees.length,
      presentToday: todayAttendance.present,
      absentToday: todayAttendance.absent,
      lateToday: todayAttendance.late,
      onLeaveToday: todayAttendance.onLeave,
      pendingLeaveRequests: pendingLeave.length,
    };
  }

  async getAttendanceReport(startDate: Date, endDate: Date, departmentId?: number) {
    const employees = await this.employeesService.findAll(
      departmentId ? { departmentId } : undefined,
    );
    const report = [];
    for (const emp of employees) {
      const attendance = await this.attendanceService.getEmployeeAttendance(emp.id, startDate, endDate);
      const totalHours = attendance.reduce((sum, a) => sum + Number(a.totalHours), 0);
      const presentDays = attendance.filter(a => a.status !== 'absent').length;
      const lateDays = attendance.filter(a => a.isLate).length;
      report.push({
        employee: { id: emp.id, name: `${emp.firstName} ${emp.lastName}`, department: emp.department },
        totalHours: Math.round(totalHours * 100) / 100,
        presentDays,
        lateDays,
        absentDays: attendance.filter(a => a.status === 'absent').length,
      });
    }
    return report;
  }
}

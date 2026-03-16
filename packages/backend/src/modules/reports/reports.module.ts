import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { AttendanceModule } from '../attendance/attendance.module';
import { EmployeesModule } from '../employees/employees.module';
import { LeaveModule } from '../leave/leave.module';
import { PayrollModule } from '../payroll/payroll.module';

@Module({
  imports: [AttendanceModule, EmployeesModule, LeaveModule, PayrollModule],
  providers: [ReportsService],
  controllers: [ReportsController],
})
export class ReportsModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PayrollPeriod } from './payroll-period.entity';
import { PayrollCalculation } from './payroll-calculation.entity';
import { PayrollService } from './payroll.service';
import { PayrollController } from './payroll.controller';
import { AttendanceModule } from '../attendance/attendance.module';
import { EmployeesModule } from '../employees/employees.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PayrollPeriod, PayrollCalculation]),
    AttendanceModule,
    EmployeesModule,
  ],
  providers: [PayrollService],
  controllers: [PayrollController],
  exports: [PayrollService],
})
export class PayrollModule {}

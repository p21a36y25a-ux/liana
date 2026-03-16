import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeaveRequest } from './leave-request.entity';
import { LeaveBalance } from './leave-balance.entity';
import { LeaveService } from './leave.service';
import { LeaveController } from './leave.controller';
import { EmployeesModule } from '../employees/employees.module';

@Module({
  imports: [TypeOrmModule.forFeature([LeaveRequest, LeaveBalance]), EmployeesModule],
  providers: [LeaveService],
  controllers: [LeaveController],
  exports: [LeaveService],
})
export class LeaveModule {}

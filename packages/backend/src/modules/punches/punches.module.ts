import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Punch } from './punch.entity';
import { PunchesService } from './punches.service';
import { PunchesController } from './punches.controller';
import { EmployeesModule } from '../employees/employees.module';
import { AttendanceModule } from '../attendance/attendance.module';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Punch]),
    EmployeesModule,
    AttendanceModule,
    EventsModule,
  ],
  providers: [PunchesService],
  controllers: [PunchesController],
  exports: [PunchesService],
})
export class PunchesModule {}

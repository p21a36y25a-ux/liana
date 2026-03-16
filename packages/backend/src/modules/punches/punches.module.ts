import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PunchesController } from './punches.controller';
import { PunchesService } from './punches.service';
import { Punch } from './entities/punch.entity';
import { AttendanceModule } from '../attendance/attendance.module';

@Module({
  imports: [TypeOrmModule.forFeature([Punch]), AttendanceModule],
  controllers: [PunchesController],
  providers: [PunchesService],
  exports: [PunchesService],
})
export class PunchesModule {}

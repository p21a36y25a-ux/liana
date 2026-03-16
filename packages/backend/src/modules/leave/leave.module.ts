import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeaveController } from './leave.controller';
import { LeaveService } from './leave.service';
import { LeaveRequest, LeaveBalance } from './entities/leave.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LeaveRequest, LeaveBalance])],
  controllers: [LeaveController],
  providers: [LeaveService],
  exports: [LeaveService],
})
export class LeaveModule {}

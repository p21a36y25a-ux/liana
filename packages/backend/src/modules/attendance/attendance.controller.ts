import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AttendanceService } from './attendance.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Attendance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('attendance')
export class AttendanceController {
  constructor(private attendanceService: AttendanceService) {}

  @Get('today')
  @ApiOperation({ summary: 'Get today attendance overview' })
  getToday() {
    return this.attendanceService.getDailyOverview();
  }

  @Get('employee/:employeeId')
  @ApiOperation({ summary: 'Get employee attendance' })
  getEmployeeAttendance(
    @Param('employeeId') employeeId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.attendanceService.getEmployeeAttendance(
      +employeeId,
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get('employee/:employeeId/timesheet')
  @ApiOperation({ summary: 'Get employee monthly timesheet' })
  getTimesheet(
    @Param('employeeId') employeeId: string,
    @Query('year') year: string,
    @Query('month') month: string,
  ) {
    return this.attendanceService.getTimesheetData(+employeeId, +year, +month);
  }
}

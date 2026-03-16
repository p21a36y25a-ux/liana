import {
  Controller,
  Get,
  Param,
  UseGuards,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AttendanceService } from './attendance.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('attendance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Get()
  @ApiOperation({ summary: 'Get all attendance records' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'departmentId', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  findAll(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('departmentId') departmentId?: number,
    @Query('status') status?: any,
    @Query('page') page?: number,
  ) {
    return this.attendanceService.findAll({
      startDate,
      endDate,
      departmentId,
      status,
      page,
    });
  }

  @Get('today')
  @ApiOperation({ summary: 'Get today\'s attendance status for all employees' })
  getTodayStatus() {
    return this.attendanceService.getTodayStatus();
  }

  @Get('employee/:employeeId')
  @ApiOperation({ summary: 'Get attendance for a specific employee' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  findByEmployee(
    @Param('employeeId', ParseIntPipe) employeeId: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: number,
  ) {
    return this.attendanceService.findByEmployee(employeeId, {
      startDate,
      endDate,
      page,
    });
  }

  @Get('employee/:employeeId/stats')
  @ApiOperation({ summary: 'Get monthly attendance stats for an employee' })
  @ApiQuery({ name: 'year', required: true, type: Number })
  @ApiQuery({ name: 'month', required: true, type: Number })
  getMonthlyStats(
    @Param('employeeId', ParseIntPipe) employeeId: number,
    @Query('year') year: number,
    @Query('month') month: number,
  ) {
    return this.attendanceService.getMonthlyStats(
      employeeId,
      Number(year),
      Number(month),
    );
  }
}

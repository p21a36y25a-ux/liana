import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  UseGuards,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { LeaveService } from './leave.service';
import { CreateLeaveRequestDto, ReviewLeaveRequestDto } from './dto/leave.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { LeaveStatus, LeaveType } from './entities/leave.entity';

@ApiTags('leave')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('leave')
export class LeaveController {
  constructor(private readonly leaveService: LeaveService) {}

  @Post('requests')
  @ApiOperation({ summary: 'Submit a leave request' })
  createRequest(@Body() dto: CreateLeaveRequestDto) {
    return this.leaveService.createRequest(dto);
  }

  @Get('requests')
  @ApiOperation({ summary: 'Get leave requests' })
  @ApiQuery({ name: 'employeeId', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: LeaveStatus })
  @ApiQuery({ name: 'leaveType', required: false, enum: LeaveType })
  @ApiQuery({ name: 'page', required: false, type: Number })
  findAll(
    @Query('employeeId') employeeId?: number,
    @Query('status') status?: LeaveStatus,
    @Query('leaveType') leaveType?: LeaveType,
    @Query('page') page?: number,
  ) {
    return this.leaveService.findAll({ employeeId, status, leaveType, page });
  }

  @Patch('requests/:id/review')
  @UseGuards(RolesGuard)
  @Roles('hr_admin', 'system_admin', 'manager')
  @ApiOperation({ summary: 'Approve or reject a leave request' })
  review(
    @Param('id', ParseIntPipe) id: number,
    @Body() reviewDto: ReviewLeaveRequestDto,
    @CurrentUser('userId') userId: number,
    @CurrentUser('role') role: string,
  ) {
    return this.leaveService.review(id, reviewDto, userId, role);
  }

  @Patch('requests/:id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel a leave request' })
  cancel(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('userId') userId: number,
  ) {
    return this.leaveService.cancel(id, userId);
  }

  @Get('balance/:employeeId')
  @ApiOperation({ summary: 'Get leave balances for an employee' })
  @ApiQuery({ name: 'year', required: false, type: Number })
  getBalances(
    @Param('employeeId', ParseIntPipe) employeeId: number,
    @Query('year') year?: number,
  ) {
    const targetYear = year ? Number(year) : new Date().getFullYear();
    return this.leaveService.getAllBalances(employeeId, targetYear);
  }

  @Post('balance/:employeeId/initialize')
  @UseGuards(RolesGuard)
  @Roles('hr_admin', 'system_admin')
  @ApiOperation({ summary: 'Initialize leave balances for an employee' })
  @ApiQuery({ name: 'year', required: false, type: Number })
  initializeBalances(
    @Param('employeeId', ParseIntPipe) employeeId: number,
    @Query('year') year?: number,
  ) {
    const targetYear = year ? Number(year) : new Date().getFullYear();
    return this.leaveService.initializeBalances(employeeId, targetYear);
  }
}

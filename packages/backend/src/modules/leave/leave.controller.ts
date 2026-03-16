import { Controller, Get, Post, Body, Param, Put, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { LeaveService } from './leave.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Leave')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('leave')
export class LeaveController {
  constructor(private leaveService: LeaveService) {}

  @Post('request')
  @ApiOperation({ summary: 'Submit leave request' })
  createRequest(@Body() body: any, @Request() req: any) {
    const employeeId = req.user.employee?.id || body.employeeId;
    return this.leaveService.createRequest(employeeId, body);
  }

  @Get('requests/pending')
  @UseGuards(RolesGuard)
  @Roles('manager', 'hr_admin', 'system_admin')
  @ApiOperation({ summary: 'Get pending leave requests' })
  getPending() {
    return this.leaveService.getPendingRequests();
  }

  @Get('requests')
  @UseGuards(RolesGuard)
  @Roles('hr_admin', 'system_admin')
  @ApiOperation({ summary: 'Get all leave requests' })
  getAll() {
    return this.leaveService.getAllRequests();
  }

  @Get('requests/my')
  @ApiOperation({ summary: 'Get my leave requests' })
  getMyRequests(@Request() req: any) {
    return this.leaveService.getEmployeeRequests(req.user.employee?.id);
  }

  @Get('requests/employee/:employeeId')
  @ApiOperation({ summary: 'Get employee leave requests' })
  getEmployeeRequests(@Param('employeeId') employeeId: string) {
    return this.leaveService.getEmployeeRequests(+employeeId);
  }

  @Put('requests/:id/approve-manager')
  @UseGuards(RolesGuard)
  @Roles('manager', 'hr_admin', 'system_admin')
  approveByManager(@Param('id') id: string, @Body() body: any, @Request() req: any) {
    return this.leaveService.approveByManager(+id, req.user.id, body.comment);
  }

  @Put('requests/:id/approve-hr')
  @UseGuards(RolesGuard)
  @Roles('hr_admin', 'system_admin')
  approveByHR(@Param('id') id: string, @Body() body: any, @Request() req: any) {
    return this.leaveService.approveByHR(+id, req.user.id, body.comment);
  }

  @Put('requests/:id/reject')
  @UseGuards(RolesGuard)
  @Roles('manager', 'hr_admin', 'system_admin')
  reject(@Param('id') id: string, @Body() body: any, @Request() req: any) {
    return this.leaveService.reject(+id, req.user.id, body.comment);
  }

  @Put('requests/:id/cancel')
  cancel(@Param('id') id: string, @Request() req: any) {
    return this.leaveService.cancel(+id, req.user.employee?.id);
  }

  @Get('balance/employee/:employeeId')
  @ApiOperation({ summary: 'Get employee leave balances' })
  getBalance(@Param('employeeId') employeeId: string) {
    return this.leaveService.getEmployeeBalances(+employeeId);
  }

  @Get('balance/my')
  @ApiOperation({ summary: 'Get my leave balance' })
  getMyBalance(@Request() req: any) {
    return this.leaveService.getEmployeeBalances(req.user.employee?.id);
  }
}

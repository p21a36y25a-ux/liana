import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PayrollService } from './payroll.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Payroll')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('payroll')
export class PayrollController {
  constructor(private payrollService: PayrollService) {}

  @Post('periods')
  @Roles('hr_admin', 'system_admin')
  @ApiOperation({ summary: 'Create payroll period' })
  createPeriod(@Body() body: any) {
    return this.payrollService.createPeriod(body);
  }

  @Get('periods')
  @Roles('hr_admin', 'system_admin')
  @ApiOperation({ summary: 'Get all payroll periods' })
  getPeriods() {
    return this.payrollService.findAllPeriods();
  }

  @Post('periods/:id/process')
  @Roles('hr_admin', 'system_admin')
  @ApiOperation({ summary: 'Process payroll for a period' })
  process(@Param('id') id: string) {
    return this.payrollService.processPayroll(+id);
  }

  @Get('periods/:id/calculations')
  @Roles('hr_admin', 'system_admin')
  @ApiOperation({ summary: 'Get payroll calculations for a period' })
  getCalculations(@Param('id') id: string) {
    return this.payrollService.getPayrollByPeriod(+id);
  }

  @Get('employee/:employeeId')
  @ApiOperation({ summary: 'Get employee payroll history' })
  getEmployeePayroll(@Param('employeeId') employeeId: string) {
    return this.payrollService.getEmployeePayroll(+employeeId);
  }

  @Post('preview')
  @Roles('hr_admin', 'system_admin')
  @ApiOperation({ summary: 'Preview payroll calculation' })
  preview(@Body() body: any) {
    return this.payrollService.calculatePreview(body);
  }
}

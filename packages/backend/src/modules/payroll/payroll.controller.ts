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
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { PayrollService } from './payroll.service';
import { CreatePayrollPeriodDto } from './dto/payroll.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('payroll')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('hr_admin', 'system_admin')
@Controller('payroll')
export class PayrollController {
  constructor(private readonly payrollService: PayrollService) {}

  @Post('periods')
  @ApiOperation({ summary: 'Create a new payroll period' })
  createPeriod(@Body() dto: CreatePayrollPeriodDto) {
    return this.payrollService.createPeriod(dto);
  }

  @Get('periods')
  @ApiOperation({ summary: 'Get all payroll periods' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAllPeriods(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.payrollService.findAllPeriods(Number(page) || 1, Number(limit) || 20);
  }

  @Post('periods/:id/calculate')
  @ApiOperation({ summary: 'Calculate payroll for all employees in a period' })
  calculateForPeriod(@Param('id', ParseIntPipe) id: number) {
    return this.payrollService.calculateForPeriod(id);
  }

  @Patch('periods/:id/approve')
  @ApiOperation({ summary: 'Approve a payroll period' })
  approvePeriod(@Param('id', ParseIntPipe) id: number) {
    return this.payrollService.approvePeriod(id);
  }

  @Patch('periods/:id/pay')
  @ApiOperation({ summary: 'Mark payroll period as paid' })
  markAsPaid(@Param('id', ParseIntPipe) id: number) {
    return this.payrollService.markAsPaid(id);
  }

  @Get('periods/:id/calculations')
  @ApiOperation({ summary: 'Get calculations for a payroll period' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  getCalculations(
    @Param('id', ParseIntPipe) id: number,
    @Query('page') page?: number,
  ) {
    return this.payrollService.getCalculationsForPeriod(id, Number(page) || 1);
  }

  @Get('employees/:employeeId/history')
  @ApiOperation({ summary: 'Get payroll history for an employee' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  getEmployeePayHistory(
    @Param('employeeId', ParseIntPipe) employeeId: number,
    @Query('page') page?: number,
  ) {
    return this.payrollService.getEmployeePayHistory(employeeId, Number(page) || 1);
  }
}

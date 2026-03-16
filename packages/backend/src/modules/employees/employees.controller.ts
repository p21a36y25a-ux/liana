import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Query, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { EmployeesService } from './employees.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Employees')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('employees')
export class EmployeesController {
  constructor(private employeesService: EmployeesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all employees' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'departmentId', required: false })
  @ApiQuery({ name: 'status', required: false })
  findAll(@Query() query: any) {
    return this.employeesService.findAll(query);
  }

  @Get('active')
  @ApiOperation({ summary: 'Get active employees for punch' })
  getActive() {
    return this.employeesService.getActiveEmployees();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get employee by ID' })
  findOne(@Param('id') id: string) {
    return this.employeesService.findById(+id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('hr_admin', 'system_admin')
  @ApiOperation({ summary: 'Create employee' })
  create(@Body() body: any) {
    return this.employeesService.create(body);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles('hr_admin', 'system_admin')
  @ApiOperation({ summary: 'Update employee' })
  update(@Param('id') id: string, @Body() body: any) {
    return this.employeesService.update(+id, body);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('hr_admin', 'system_admin')
  @ApiOperation({ summary: 'Delete employee' })
  delete(@Param('id') id: string) {
    return this.employeesService.delete(+id);
  }
}

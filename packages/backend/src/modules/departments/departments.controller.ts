import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { DepartmentsService } from './departments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Departments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('departments')
export class DepartmentsController {
  constructor(private departmentsService: DepartmentsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all departments' })
  findAll() {
    return this.departmentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.departmentsService.findById(+id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('hr_admin', 'system_admin')
  create(@Body() body: any) {
    return this.departmentsService.create(body);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles('hr_admin', 'system_admin')
  update(@Param('id') id: string, @Body() body: any) {
    return this.departmentsService.update(+id, body);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('hr_admin', 'system_admin')
  delete(@Param('id') id: string) {
    return this.departmentsService.delete(+id);
  }
}

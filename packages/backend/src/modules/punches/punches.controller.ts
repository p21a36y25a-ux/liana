import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { PunchesService } from './punches.service';
import { CreatePunchDto, ManualPunchDto } from './dto/punch.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('punches')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('punches')
export class PunchesController {
  constructor(private readonly punchesService: PunchesService) {}

  @Post()
  @ApiOperation({ summary: 'Record a punch (check-in or check-out)' })
  create(
    @Body() createPunchDto: CreatePunchDto,
    @CurrentUser('userId') userId: number,
  ) {
    return this.punchesService.create(createPunchDto, userId, false);
  }

  @Post('manual')
  @UseGuards(RolesGuard)
  @Roles('hr_admin', 'system_admin', 'manager')
  @ApiOperation({ summary: 'Manual punch entry by authorized users' })
  createManual(
    @Body() manualPunchDto: ManualPunchDto,
    @CurrentUser('userId') userId: number,
  ) {
    return this.punchesService.create(manualPunchDto, userId, true);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('hr_admin', 'system_admin', 'manager')
  @ApiOperation({ summary: 'Get all punches' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.punchesService.findAll({ startDate, endDate, page, limit });
  }

  @Get('employee/:employeeId')
  @ApiOperation({ summary: 'Get punches for a specific employee' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  findByEmployee(
    @Param('employeeId', ParseIntPipe) employeeId: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: number,
  ) {
    return this.punchesService.findByEmployee(employeeId, {
      startDate,
      endDate,
      page,
    });
  }

  @Get('employee/:employeeId/today')
  @ApiOperation({ summary: 'Get today\'s punches for an employee' })
  getTodayPunches(@Param('employeeId', ParseIntPipe) employeeId: number) {
    return this.punchesService.getTodayPunches(employeeId);
  }

  @Get('employee/:employeeId/last')
  @ApiOperation({ summary: 'Get last punch for an employee' })
  getLastPunch(@Param('employeeId', ParseIntPipe) employeeId: number) {
    return this.punchesService.getLastPunch(employeeId);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('hr_admin', 'system_admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a punch record' })
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.punchesService.delete(id);
  }
}

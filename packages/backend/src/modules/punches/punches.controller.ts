import { Controller, Get, Post, Body, Param, Query, UseGuards, Request, Ip } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PunchesService } from './punches.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Punches')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('punches')
export class PunchesController {
  constructor(private punchesService: PunchesService) {}

  @Post(':employeeId')
  @ApiOperation({ summary: 'Record punch (check-in or check-out)' })
  async punch(
    @Param('employeeId') employeeId: string,
    @Body() body: any,
    @Ip() ip: string,
    @Request() req: any,
  ) {
    return this.punchesService.punch(+employeeId, {
      ...body,
      ipAddress: ip,
      deviceInfo: req.headers['user-agent'],
      createdByUserId: req.user?.id,
    });
  }

  @Get('today')
  @ApiOperation({ summary: 'Get today punch activity' })
  getToday() {
    return this.punchesService.getTodayPunches();
  }

  @Get('history')
  @ApiOperation({ summary: 'Get punch history with pagination' })
  getHistory(@Query() query: any) {
    return this.punchesService.getPunchHistory(query);
  }

  @Get('employee/:employeeId')
  @ApiOperation({ summary: 'Get punches for an employee' })
  getByEmployee(@Param('employeeId') employeeId: string, @Query() query: any) {
    return this.punchesService.getEmployeePunches(
      +employeeId,
      query.startDate ? new Date(query.startDate) : undefined,
      query.endDate ? new Date(query.endDate) : undefined,
    );
  }

  @Get('employee/:employeeId/last')
  @ApiOperation({ summary: 'Get last punch for employee' })
  getLastPunch(@Param('employeeId') employeeId: string) {
    return this.punchesService.getLastPunch(+employeeId);
  }
}

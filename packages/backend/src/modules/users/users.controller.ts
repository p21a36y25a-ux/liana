import { Controller, Get, Post, Body, Param, Put, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @Roles('system_admin', 'hr_admin')
  @ApiOperation({ summary: 'Get all users' })
  findAll() {
    return this.usersService.findAll();
  }

  @Post()
  @Roles('system_admin', 'hr_admin')
  @ApiOperation({ summary: 'Create user' })
  create(@Body() body: { email: string; password: string; role?: string }) {
    return this.usersService.create(body);
  }

  @Put(':id')
  @Roles('system_admin', 'hr_admin')
  @ApiOperation({ summary: 'Update user' })
  update(@Param('id') id: string, @Body() body: any) {
    return this.usersService.update(+id, body);
  }
}

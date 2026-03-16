import {
  IsEnum,
  IsString,
  IsDateString,
  IsOptional,
  IsNumber,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { LeaveType, LeaveStatus } from '../entities/leave.entity';

export class CreateLeaveRequestDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  employeeId: number;

  @ApiProperty({ enum: LeaveType })
  @IsEnum(LeaveType)
  leaveType: LeaveType;

  @ApiProperty({ example: '2024-02-01' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2024-02-05' })
  @IsDateString()
  endDate: string;

  @ApiProperty({ example: 'Family vacation' })
  @IsString()
  reason: string;
}

export class ReviewLeaveRequestDto {
  @ApiProperty({ enum: [LeaveStatus.APPROVED, LeaveStatus.REJECTED] })
  @IsEnum([LeaveStatus.APPROVED, LeaveStatus.REJECTED])
  status: LeaveStatus.APPROVED | LeaveStatus.REJECTED;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  comment?: string;
}

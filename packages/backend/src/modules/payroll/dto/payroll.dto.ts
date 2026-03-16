import {
  IsString,
  IsDateString,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePayrollPeriodDto {
  @ApiProperty({ example: 'January 2024' })
  @IsString()
  name: string;

  @ApiProperty({ example: '2024-01-01' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2024-01-31' })
  @IsDateString()
  endDate: string;

  @ApiProperty({ example: 20 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  workingDays?: number;

  @ApiProperty({ example: 160 })
  @IsOptional()
  @IsNumber()
  standardHours?: number;

  @ApiProperty({ example: 160, description: 'Hours threshold for overtime (default 160)' })
  @IsOptional()
  @IsNumber()
  overtimeThreshold?: number;

  @ApiProperty({ example: 1.3, description: 'Overtime rate multiplier (default 1.3 = 130%)' })
  @IsOptional()
  @IsNumber()
  overtimeRate?: number;

  @ApiProperty({ example: 200, description: 'Hours threshold for premium rate (default 200)' })
  @IsOptional()
  @IsNumber()
  premiumThreshold?: number;

  @ApiProperty({ example: 1.5, description: 'Premium rate multiplier (default 1.5 = 150%)' })
  @IsOptional()
  @IsNumber()
  premiumRate?: number;
}

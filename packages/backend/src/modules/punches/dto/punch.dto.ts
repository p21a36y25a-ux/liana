import {
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsString,
  IsNumber,
  IsDateString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PunchType } from '../entities/punch.entity';

export class CreatePunchDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  employeeId: number;

  @ApiProperty({ enum: PunchType })
  @IsEnum(PunchType)
  type: PunchType;

  @ApiProperty({ example: '2024-01-15T08:00:00Z', required: false })
  @IsOptional()
  @IsDateString()
  timestamp?: string;

  @ApiProperty({ description: 'Base64 encoded photo or URL', required: false })
  @IsOptional()
  @IsString()
  photoData?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class ManualPunchDto extends CreatePunchDto {
  @ApiProperty()
  @IsDateString()
  timestamp: string;
}

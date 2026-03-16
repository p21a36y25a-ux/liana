import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsDateString,
  Min,
} from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export class CreateEmployeeDto {
  @ApiProperty({ example: 1 })
  @IsOptional()
  @IsNumber()
  userId?: number;

  @ApiProperty({ example: 'John' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ example: 'EMP001' })
  @IsString()
  @IsNotEmpty()
  employeeCode: string;

  @ApiProperty({ example: 'john.doe@company.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '+383 44 123 456', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsNumber()
  departmentId?: number;

  @ApiProperty({ example: 'Software Engineer' })
  @IsString()
  @IsNotEmpty()
  position: string;

  @ApiProperty({ example: 7.5 })
  @IsNumber()
  @Min(0)
  hourlyRate: number;

  @ApiProperty({ example: '2024-01-15' })
  @IsDateString()
  startDate: string;
}

export class UpdateEmployeeDto extends PartialType(CreateEmployeeDto) {}

import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsDateString,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { DayOfWeek } from '@prisma/client';

export class CreateScheduleDto {
  @ApiProperty()
  @IsString()
  resourceId: string;

  @ApiProperty({ enum: DayOfWeek })
  @IsEnum(DayOfWeek)
  dayOfWeek: DayOfWeek;

  @ApiProperty({ example: '08:00', description: 'Start time in HH:mm format' })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, { message: 'startTime must be in HH:mm format' })
  startTime: string;

  @ApiProperty({ example: '22:00', description: 'End time in HH:mm format' })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, { message: 'endTime must be in HH:mm format' })
  endTime: string;
}

export class UpdateScheduleDto extends PartialType(CreateScheduleDto) {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class CreateScheduleExceptionDto {
  @ApiProperty()
  @IsString()
  resourceId: string;

  @ApiProperty({ description: 'Date to block (ISO format)' })
  @IsDateString()
  date: string;

  @ApiPropertyOptional({ example: 'National holiday' })
  @IsOptional()
  @IsString()
  reason?: string;
}

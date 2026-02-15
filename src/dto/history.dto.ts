import {
  IsOptional,
  IsString,
  IsDateString,
  IsNumber,
  IsIn,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class HistoryQueryDto {
  @ApiPropertyOptional({ example: 'user-123' })
  @IsOptional()
  @IsString()
  user_id?: string;

  @ApiProperty({
    example: 'ADDITION',
    enum: [
      'ADDITION',
      'SUBTRACTION',
      'MULTIPLICATION',
      'DIVISION',
      'SQUARE_ROOT',
    ],
  })
  @IsOptional()
  @IsString()
  @IsIn(
    ['ADDITION', 'SUBTRACTION', 'MULTIPLICATION', 'DIVISION', 'SQUARE_ROOT'],
    {
      message:
        'Operation must be one of: ADDITION, SUBTRACTION, MULTIPLICATION, DIVISION, SQUARE_ROOT',
    },
  )
  operation?: string;

  @ApiPropertyOptional({ example: '2026-02-16' })
  @IsOptional()
  @IsDateString({}, { message: 'Start date must be a valid date' })
  start_date?: string;

  @ApiPropertyOptional({ example: '2026-02-16' })
  @IsOptional()
  @IsDateString({}, { message: 'End date must be a valid date' })
  end_date?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Page must be a number' })
  page?: number;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Limit must be a number' })
  limit?: number;

  @ApiPropertyOptional({ example: 'ASC', enum: ['ASC', 'DESC'] })
  @IsOptional()
  @IsString()
  @IsIn(['ASC', 'DESC'], { message: 'Order must be ASC or DESC' })
  order?: string;
}

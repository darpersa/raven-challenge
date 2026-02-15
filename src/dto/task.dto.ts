import { IsNotEmpty, IsNumber, IsString, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class TaskRequestDto {
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
  @IsString()
  @IsNotEmpty({ message: 'Operation is required' })
  @IsIn(
    ['ADDITION', 'SUBTRACTION', 'MULTIPLICATION', 'DIVISION', 'SQUARE_ROOT'],
    {
      message:
        'Operation must be one of: ADDITION, SUBTRACTION, MULTIPLICATION, DIVISION, SQUARE_ROOT',
    },
  )
  operation: string;

  @ApiProperty({ example: 10 })
  @Type(() => Number)
  @IsNumber({}, { message: 'OperandA must be a number' })
  @IsNotEmpty({ message: 'OperandA is required' })
  operandA: number;

  @ApiProperty({ example: 5 })
  @Type(() => Number)
  @IsNumber({}, { message: 'OperandB must be a number' })
  @IsNotEmpty({ message: 'OperandB is required' })
  operandB: number;

  @ApiProperty({ example: 'user-123' })
  @IsString()
  @IsNotEmpty({ message: 'User ID is required' })
  user_id: string;
}

import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { TaskRepository } from 'src/repository/task.repository';
import { TaskRequest, TaskResponse } from 'src/models/task.model';
import Decimal from 'decimal.js';

@Injectable()
export class TasksService {
  constructor(private taskRepository: TaskRepository) {}

  public async calculate(request: TaskRequest): Promise<TaskResponse> {
    try {
      // Validar rango de operandos
      if (
        !this.validateOperandRange(request.operandA) ||
        !this.validateOperandRange(request.operandB)
      ) {
        throw new HttpException(
          'Operating outside the permitted range',
          HttpStatus.BAD_REQUEST,
        );
      }

      const result = this.performCalculation(
        request.operation,
        request.operandA,
        request.operandB,
      );

      const savedTask = await this.taskRepository.save(request, result);
      const response: TaskResponse = {
        id: savedTask.id,
        user_id: request.user_id,
        operation: request.operation,
        operandA: request.operandA,
        operandB: request.operandB,
        result: result,
        timestamp: savedTask.created_at,
      };
      return response;
    } catch (error) {
      console.error('Error performing calculation:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to perform calculation',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private validateOperandRange(value: number): boolean {
    const MIN_VALUE = -1000000;
    const MAX_VALUE = 1000000;

    if (value < MIN_VALUE || value > MAX_VALUE) {
      return false;
    }
    return true;
  }

  private performCalculation(
    operation: string,
    operandA: number,
    operandB: number,
  ): number {
    const a = new Decimal(operandA);
    const b = new Decimal(operandB);
    let result;

    switch (operation) {
      case 'ADDITION':
        result = a.plus(b);
        break;
      case 'SUBTRACTION':
        result = a.minus(b);
        break;
      case 'MULTIPLICATION':
        result = a.times(b);
        break;
      case 'DIVISION':
        if (b.isZero()) {
          throw new HttpException(
            'Division by zero is not allowed',
            HttpStatus.BAD_REQUEST,
          );
        }
        result = a.dividedBy(b);
        break;
      case 'SQUARE_ROOT':
        if (a.isNegative()) {
          throw new HttpException(
            'Cannot calculate square root of a negative number',
            HttpStatus.BAD_REQUEST,
          );
        }
        result = a.sqrt();
        break;
      default:
        throw new Error(`Unsupported operation: ${operation}`);
    }

    // Redondear a 2 decimales
    return result.toDecimalPlaces(2).toNumber();
  }
}

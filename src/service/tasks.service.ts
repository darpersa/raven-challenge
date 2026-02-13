import { Injectable } from '@nestjs/common';
import { TaskRepository } from 'src/repository/task.repository';
import { TaskRequest, TaskResponse } from 'src/models/task.model';
import Decimal from 'decimal.js';

@Injectable()
export class TasksService {
  constructor(private taskRepository: TaskRepository) {}

  public async calculate(request: TaskRequest): Promise<TaskResponse> {
    try {
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
      throw new Error('Failed to perform calculation');
    }
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
          throw new Error('Division by zero is not allowed');
        }
        result = a.dividedBy(b);
        break;
      case 'SQUARE_ROOT':
        if (a.isNegative()) {
          throw new Error('Cannot calculate square root of a negative number');
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

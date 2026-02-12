import { Injectable } from '@nestjs/common';
import { TaskRequest, TaskResponse } from 'src/models/task.model';

@Injectable()
export class TasksService {
  private tasks: TaskResponse[] = [];

  public calculate(request: TaskRequest): TaskResponse {
    const response: TaskResponse = {
      id: this.tasks.length + 1,
      operation: request.operation,
      operandA: request.operandA,
      operandB: request.operandB,
      result: this.performCalculation(
        request.operation,
        request.operandA,
        request.operandB,
      ),
      timestampt: new Date(),
      user_id: request.user_id,
    };
    this.tasks.push(response);
    return response;
  }

  private performCalculation(
    operation: string,
    operandA: number,
    operandB: number,
  ): number {
    switch (operation) {
      case 'ADDITION':
        return operandA + operandB;
      case 'SUBTRACTION':
        return operandA - operandB;
      case 'MULTIPLICATION':
        return operandA * operandB;
      case 'DIVISION':
        if (operandB === 0) {
          throw new Error('Division by zero is not allowed');
        }
        return operandA / operandB;
      default:
        throw new Error(`Unsupported operation: ${operation}`);
    }
  }
}

import { Test, TestingModule } from '@nestjs/testing';
import { HttpException } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TaskRepository } from '../repository/task.repository';
import { TaskRequest } from '../models/task.model';

describe('TasksService', () => {
  let service: TasksService;
  let taskRepository: jest.Mocked<TaskRepository>;

  const mockTask = {
    id: 1,
    user_id: 1,
    operation: 'add',
    operanda: 10,
    operandb: 5,
    result: 15,
    created_at: new Date('2024-01-01'),
  };

  beforeEach(async () => {
    const mockTaskRepository = {
      save: jest.fn(),
      findByUserId: jest.fn(),
      findById: jest.fn(),
      deleteById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: TaskRepository,
          useValue: mockTaskRepository,
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    taskRepository = module.get(TaskRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('calculate', () => {
    it('should perform addition correctly', async () => {
      const request: TaskRequest = {
        operation: 'ADDITION',
        operandA: 10,
        operandB: 5,
        user_id: 'user-123',
      };
      taskRepository.save.mockResolvedValue(mockTask);

      const result = await service.calculate(request);

      expect(taskRepository.save).toHaveBeenCalledWith(request, 15);
      expect(result).toEqual({
        id: mockTask.id,
        user_id: request.user_id,
        operation: request.operation,
        operandA: request.operandA,
        operandB: request.operandB,
        result: 15,
        timestamp: mockTask.created_at,
      });
    });

    it('should perform subtraction correctly', async () => {
      const request: TaskRequest = {
        operation: 'SUBTRACTION',
        operandA: 20,
        operandB: 8,
        user_id: 'user-123',
      };
      taskRepository.save.mockResolvedValue(mockTask);

      const result = await service.calculate(request);

      expect(taskRepository.save).toHaveBeenCalledWith(request, 12);
      expect(result.result).toBe(12);
    });

    it('should perform multiplication correctly', async () => {
      const request: TaskRequest = {
        operation: 'MULTIPLICATION',
        operandA: 7,
        operandB: 6,
        user_id: 'user-123',
      };
      taskRepository.save.mockResolvedValue(mockTask);

      const result = await service.calculate(request);

      expect(taskRepository.save).toHaveBeenCalledWith(request, 42);
      expect(result.result).toBe(42);
    });

    it('should perform division correctly', async () => {
      const request: TaskRequest = {
        operation: 'DIVISION',
        operandA: 100,
        operandB: 4,
        user_id: 'user-123',
      };
      taskRepository.save.mockResolvedValue(mockTask);

      const result = await service.calculate(request);

      expect(taskRepository.save).toHaveBeenCalledWith(request, 25);
      expect(result.result).toBe(25);
    });

    it('should handle decimal operations with precision', async () => {
      const request: TaskRequest = {
        operation: 'DIVISION',
        operandA: 10,
        operandB: 3,
        user_id: 'user-123',
      };
      taskRepository.save.mockResolvedValue(mockTask);

      const result = await service.calculate(request);

      expect(result.result).toBeCloseTo(3.33, 2);
    });

    it('should throw error for division by zero', async () => {
      const request: TaskRequest = {
        operation: 'DIVISION',
        operandA: 10,
        operandB: 0,
        user_id: 'user-123',
      };
      await expect(service.calculate(request)).rejects.toThrow(HttpException);
      await expect(service.calculate(request)).rejects.toThrow(
        'Division by zero is not allowed',
      );
    });

    it('should throw error for square root of negative number', async () => {
      const request: TaskRequest = {
        operation: 'SQUARE_ROOT',
        operandA: -25,
        operandB: 0,
        user_id: 'user-123',
      };
      await expect(service.calculate(request)).rejects.toThrow(HttpException);
      await expect(service.calculate(request)).rejects.toThrow(
        'Cannot calculate square root of a negative number',
      );
    });

    it('should throw error if operand is out of range (too high)', async () => {
      const request: TaskRequest = {
        operation: 'ADDITION',
        operandA: 2000000,
        operandB: 5,
        user_id: 'user-123',
      };
      await expect(service.calculate(request)).rejects.toThrow(HttpException);
      await expect(service.calculate(request)).rejects.toThrow(
        'Operating outside the permitted range',
      );
    });

    it('should throw error if operand is out of range (too low)', async () => {
      const request: TaskRequest = {
        operation: 'ADDITION',
        operandA: -2000000,
        operandB: 5,
        user_id: 'user-123',
      };
      await expect(service.calculate(request)).rejects.toThrow(HttpException);
      await expect(service.calculate(request)).rejects.toThrow(
        'Operating outside the permitted range',
      );
    });

    it('should handle operation at maximum allowed range', async () => {
      const request: TaskRequest = {
        operation: 'ADDITION',
        operandA: 1000000,
        operandB: 0,
        user_id: 'user-123',
      };
      taskRepository.save.mockResolvedValue(mockTask);

      const result = await service.calculate(request);

      expect(result.result).toBe(1000000);
      expect(taskRepository.save).toHaveBeenCalled();
    });

    it('should handle operation at minimum allowed range', async () => {
      const request: TaskRequest = {
        operation: 'ADDITION',
        operandA: -1000000,
        operandB: 0,
        user_id: 'user-123',
      };
      taskRepository.save.mockResolvedValue(mockTask);

      const result = await service.calculate(request);

      expect(result.result).toBe(-1000000);
      expect(taskRepository.save).toHaveBeenCalled();
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { TasksController } from './tasks.controller';
import { TasksService } from '../service/tasks.service';
import { TaskRequestDto } from '../dto/task.dto';
import { JwtValidationGuard } from '../guards/auth.guards';

describe('TasksController', () => {
  let controller: TasksController;
  let tasksService: jest.Mocked<TasksService>;

  beforeEach(async () => {
    const mockTasksService = {
      calculate: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [
        {
          provide: TasksService,
          useValue: mockTasksService,
        },
      ],
    })
      .overrideGuard(JwtValidationGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<TasksController>(TasksController);
    tasksService = module.get(TasksService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('calculate', () => {
    it('should perform addition calculation', async () => {
      const requestDto: TaskRequestDto = {
        operation: 'add',
        operandA: 10,
        operandB: 5,
        user_id: 'user-123',
      };
      const expectedResponse = {
        id: 1,
        user_id: 'user-123',
        operation: 'add',
        operandA: 10,
        operandB: 5,
        result: 15,
        timestamp: new Date(),
      };
      tasksService.calculate.mockResolvedValue(expectedResponse);

      const result = await controller.calculate(requestDto);

      expect(tasksService.calculate).toHaveBeenCalledWith(requestDto);
      expect(result).toEqual(expectedResponse);
      expect(result.result).toBe(15);
    });

    it('should perform subtraction calculation', async () => {
      const requestDto: TaskRequestDto = {
        operation: 'subtract',
        operandA: 20,
        operandB: 8,
        user_id: 'user-123',
      };
      const expectedResponse = {
        id: 2,
        user_id: 'user-123',
        operation: 'subtract',
        operandA: 20,
        operandB: 8,
        result: 12,
        timestamp: new Date(),
      };
      tasksService.calculate.mockResolvedValue(expectedResponse);

      const result = await controller.calculate(requestDto);

      expect(result.result).toBe(12);
    });

    it('should perform multiplication calculation', async () => {
      const requestDto: TaskRequestDto = {
        operation: 'multiply',
        operandA: 7,
        operandB: 6,
        user_id: 'user-123',
      };
      const expectedResponse = {
        id: 3,
        user_id: 'user-123',
        operation: 'multiply',
        operandA: 7,
        operandB: 6,
        result: 42,
        timestamp: new Date(),
      };
      tasksService.calculate.mockResolvedValue(expectedResponse);

      const result = await controller.calculate(requestDto);

      expect(result.result).toBe(42);
    });

    it('should perform division calculation', async () => {
      const requestDto: TaskRequestDto = {
        operation: 'divide',
        operandA: 100,
        operandB: 4,
        user_id: 'user-123',
      };
      const expectedResponse = {
        id: 4,
        user_id: 'user-123',
        operation: 'divide',
        operandA: 100,
        operandB: 4,
        result: 25,
        timestamp: new Date(),
      };
      tasksService.calculate.mockResolvedValue(expectedResponse);

      const result = await controller.calculate(requestDto);

      expect(result.result).toBe(25);
    });
  });
});

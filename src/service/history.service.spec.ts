import { Test, TestingModule } from '@nestjs/testing';
import { HistoryService } from './history.service';
import { TaskRepository } from '../repository/task.repository';
import { HistoryRequest } from '../models/history.model';

describe('HistoryService', () => {
  let service: HistoryService;
  let taskRepository: jest.Mocked<TaskRepository>;

  const mockTasks = [
    {
      id: 1,
      user_id: 1,
      operation: 'add',
      operanda: 10,
      operandb: 5,
      result: 15,
      created_at: new Date('2024-01-01'),
    },
    {
      id: 2,
      user_id: 1,
      operation: 'subtract',
      operanda: 20,
      operandb: 8,
      result: 12,
      created_at: new Date('2024-01-02'),
    },
  ];

  const mockHistoryResponse = {
    tasks: mockTasks,
    total: 2,
    page: 1,
    totalPages: 1,
  };

  beforeEach(async () => {
    const mockTaskRepository = {
      findByUserId: jest.fn(),
      findById: jest.fn(),
      deleteById: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HistoryService,
        {
          provide: TaskRepository,
          useValue: mockTaskRepository,
        },
      ],
    }).compile();

    service = module.get<HistoryService>(HistoryService);
    taskRepository = module.get(TaskRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getHistory', () => {
    it('should return history with default pagination', async () => {
      const request = {
        userId: 'user-123',
      } as any;
      taskRepository.findByUserId.mockResolvedValue(mockHistoryResponse);

      const result = await service.getHistory(request);

      expect(taskRepository.findByUserId).toHaveBeenCalledWith(
        'user-123',
        1,
        10,
        'ASC',
        undefined,
        undefined,
        undefined,
      );
      expect(result).toEqual(mockHistoryResponse);
    });

    it('should return history with custom pagination', async () => {
      const request = {
        userId: 'user-123',
        page: 2,
        limit: 20,
        order: 'DESC',
      } as any;
      taskRepository.findByUserId.mockResolvedValue(mockHistoryResponse);

      const result = await service.getHistory(request);

      expect(taskRepository.findByUserId).toHaveBeenCalledWith(
        'user-123',
        2,
        20,
        'DESC',
        undefined,
        undefined,
        undefined,
      );
      expect(result).toEqual(mockHistoryResponse);
    });

    it('should return history filtered by operation', async () => {
      const request = {
        userId: 'user-123',
        operation: 'add',
      } as any;
      taskRepository.findByUserId.mockResolvedValue({
        tasks: [mockTasks[0]],
        total: 1,
        page: 1,
        totalPages: 1,
      });

      const result = await service.getHistory(request);

      expect(taskRepository.findByUserId).toHaveBeenCalledWith(
        'user-123',
        1,
        10,
        'ASC',
        'add',
        undefined,
        undefined,
      );
      expect(result.tasks).toHaveLength(1);
      expect(result.tasks[0].operation).toBe('add');
    });

    it('should return history filtered by date range', async () => {
      const request = {
        userId: 'user-123',
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      } as any;
      taskRepository.findByUserId.mockResolvedValue(mockHistoryResponse);

      const result = await service.getHistory(request);

      expect(taskRepository.findByUserId).toHaveBeenCalledWith(
        'user-123',
        1,
        10,
        'ASC',
        undefined,
        '2024-01-01',
        '2024-01-31',
      );
      expect(result).toEqual(mockHistoryResponse);
    });

    it('should handle string page and limit values', async () => {
      taskRepository.findByUserId.mockResolvedValue(mockHistoryResponse);

      const request: Partial<HistoryRequest> = {
        userId: 'user-123',
        page: '3' as any,
        limit: '15' as any,
      };

      const result = await service.getHistory(request as HistoryRequest);

      expect(taskRepository.findByUserId).toHaveBeenCalledWith(
        'user-123',
        3,
        15,
        'ASC',
        undefined,
        undefined,
        undefined,
      );
      expect(result).toEqual(mockHistoryResponse);
    });

    it('should return empty array when no tasks found', async () => {
      const request = {
        userId: 'user-456',
      } as any;
      taskRepository.findByUserId.mockResolvedValue({
        tasks: [],
        total: 0,
        page: 1,
        totalPages: 0,
      });

      const result = await service.getHistory(request);

      expect(result.tasks).toHaveLength(0);
      expect(result.total).toBe(0);
    });
  });

  describe('getTaskById', () => {
    it('should return a task by id', async () => {
      const taskId = 1;
      taskRepository.findById.mockResolvedValue(mockTasks[0]);

      const result = await service.getTaskById(taskId);

      expect(taskRepository.findById).toHaveBeenCalledWith(taskId);
      expect(result).toEqual(mockTasks[0]);
    });

    it('should return null if task not found', async () => {
      const taskId = 999;
      taskRepository.findById.mockResolvedValue(null);

      const result = await service.getTaskById(taskId);

      expect(taskRepository.findById).toHaveBeenCalledWith(taskId);
      expect(result).toBeNull();
    });
  });

  describe('deleteTaskById', () => {
    it('should delete a task by id', async () => {
      const taskId = 1;
      const deleteResult = { affected: 1, raw: {} };
      taskRepository.deleteById.mockResolvedValue(deleteResult as any);

      const result = await service.deleteTaskById(taskId);

      expect(taskRepository.deleteById).toHaveBeenCalledWith(taskId);
      expect(result).toEqual(deleteResult);
    });

    it('should return result with affected 0 if task not found', async () => {
      const taskId = 999;
      const deleteResult = { affected: 0, raw: {} };
      taskRepository.deleteById.mockResolvedValue(deleteResult as any);

      const result = await service.deleteTaskById(taskId);

      expect(taskRepository.deleteById).toHaveBeenCalledWith(taskId);
      expect((result as any).affected).toBe(0);
    });
  });
});

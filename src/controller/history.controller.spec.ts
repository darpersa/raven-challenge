import { Test, TestingModule } from '@nestjs/testing';
import { HistoryController } from './history.controller';
import { HistoryService } from '../service/history.service';
import { HistoryQueryDto } from '../dto/history.dto';
import { JwtValidationGuard } from '../guards/auth.guards';

describe('HistoryController', () => {
  let controller: HistoryController;
  let historyService: jest.Mocked<HistoryService>;

  const mockHistoryResponse = {
    tasks: [
      {
        id: 1,
        user_id: 1,
        operation: 'add',
        operanda: 10,
        operandb: 5,
        result: 15,
        created_at: new Date('2024-01-01'),
      },
    ],
    total: 1,
    page: 1,
    totalPages: 1,
  };

  beforeEach(async () => {
    const mockHistoryService = {
      getHistory: jest.fn(),
      getTaskById: jest.fn(),
      deleteTaskById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [HistoryController],
      providers: [
        {
          provide: HistoryService,
          useValue: mockHistoryService,
        },
      ],
    })
      .overrideGuard(JwtValidationGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<HistoryController>(HistoryController);
    historyService = module.get(HistoryService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getHistory', () => {
    it('should return history for user', async () => {
      const userId = 'user-123';
      const query: HistoryQueryDto = {};
      historyService.getHistory.mockResolvedValue(mockHistoryResponse);

      const result = await controller.getHistory(userId, query);

      expect(historyService.getHistory).toHaveBeenCalledWith({
        userId,
        operation: undefined,
        startDate: undefined,
        endDate: undefined,
        page: 1,
        limit: 10,
        order: 'ASC',
      });
      expect(result).toEqual(mockHistoryResponse);
    });

    it('should return history with custom filters', async () => {
      const userId = 'user-123';
      const query: HistoryQueryDto = {
        operation: 'add',
        page: 2,
        limit: 20,
        order: 'DESC',
        start_date: '2024-01-01',
        end_date: '2024-12-31',
      };
      historyService.getHistory.mockResolvedValue(mockHistoryResponse);

      const result = await controller.getHistory(userId, query);

      expect(historyService.getHistory).toHaveBeenCalledWith({
        userId,
        operation: 'add',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        page: 2,
        limit: 20,
        order: 'DESC',
      });
      expect(result).toEqual(mockHistoryResponse);
    });

    it('should use default values when query params are missing', async () => {
      const userId = 'user-123';
      historyService.getHistory.mockResolvedValue(mockHistoryResponse);

      expect(historyService.getHistory).toHaveBeenCalledWith({
        userId,
        operation: 'multiply',
        startDate: undefined,
        endDate: undefined,
        page: 1,
        limit: 10,
        order: 'ASC',
      });
    });
  });

  describe('getTaskById', () => {
    it('should return task by id', async () => {
      const taskId = 1;
      const mockTask = mockHistoryResponse.tasks[0];
      historyService.getTaskById.mockResolvedValue(mockTask);

      const result = await controller.getTaskById(taskId);

      expect(historyService.getTaskById).toHaveBeenCalledWith(taskId);
      expect(result).toEqual(mockTask);
    });

    it('should return null if task not found', async () => {
      const taskId = 999;
      historyService.getTaskById.mockResolvedValue(null);

      const result = await controller.getTaskById(taskId);

      expect(historyService.getTaskById).toHaveBeenCalledWith(taskId);
      expect(result).toBeNull();
    });
  });

  describe('deleteTaskById', () => {
    it('should delete task by id', async () => {
      const taskId = 1;
      const deleteResult = { affected: 1, raw: {} };
      historyService.deleteTaskById.mockResolvedValue(deleteResult as any);

      const result = await controller.deleteTaskById(taskId);

      expect(historyService.deleteTaskById).toHaveBeenCalledWith(taskId);
      expect(result).toEqual(deleteResult);
    });

    it('should return affected 0 when task does not exist', async () => {
      const taskId = 999;
      const deleteResult = { affected: 0, raw: {} };
      historyService.deleteTaskById.mockResolvedValue(deleteResult as any);

      const result = await controller.deleteTaskById(taskId);

      expect((result as any).affected).toBe(0);
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaskRepository } from './task.repository';
import { UserRepository } from './user.repository';
import { Task } from './dto/task.dto';
import { TaskRequest } from '../models/task.model';

describe('TaskRepository', () => {
  let taskRepository: TaskRepository;
  let userRepository: jest.Mocked<UserRepository>;
  let mockRepository: jest.Mocked<Repository<Task>>;

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    password: 'hashedPassword',
    username: 'testuser',
    user_id: 'test-user-123',
    created_at: new Date('2024-01-01'),
  };

  const mockTask: Task = {
    id: 1,
    user_id: 1,
    operation: 'add',
    operanda: 10,
    operandb: 5,
    result: 15,
    created_at: new Date('2024-01-01'),
  };

  beforeEach(async () => {
    const mockTaskRepo = {
      save: jest.fn(),
      findOne: jest.fn(),
      delete: jest.fn(),
      findAndCount: jest.fn(),
    };

    const mockUserRepo = {
      findByUserId: jest.fn(),
      findByEmail: jest.fn(),
      save: jest.fn(),
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskRepository,
        {
          provide: getRepositoryToken(Task),
          useValue: mockTaskRepo,
        },
        {
          provide: UserRepository,
          useValue: mockUserRepo,
        },
      ],
    }).compile();

    taskRepository = module.get<TaskRepository>(TaskRepository);
    mockRepository = module.get(getRepositoryToken(Task));
    userRepository = module.get(UserRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('save', () => {
    it('should save a task successfully', async () => {
      const request: TaskRequest = {
        user_id: 'test-user-123',
        operation: 'add',
        operandA: 10,
        operandB: 5,
      };
      const result = 15;

      userRepository.findByUserId.mockResolvedValue(mockUser);
      mockRepository.save.mockResolvedValue(mockTask);

      const savedTask = await taskRepository.save(request, result);

      expect(userRepository.findByUserId).toHaveBeenCalledWith('test-user-123');
      expect(mockRepository.save).toHaveBeenCalledWith({
        user_id: mockUser.id,
        operation: request.operation,
        operanda: request.operandA,
        operandb: request.operandB,
        result: result,
      });
      expect(savedTask).toEqual(mockTask);
    });

    it('should throw error when user not found', async () => {
      const request: TaskRequest = {
        user_id: 'nonexistent-user',
        operation: 'add',
        operandA: 10,
        operandB: 5,
      };
      const result = 15;

      userRepository.findByUserId.mockResolvedValue(null);
      await expect(taskRepository.save(request, result)).rejects.toThrow(
        'User not found',
      );
      expect(mockRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('findByUserId', () => {
    it('should find tasks by user_id with default pagination', async () => {
      const userId = 'test-user-123';
      const tasks = [mockTask];
      const total = 1;

      userRepository.findByUserId.mockResolvedValue(mockUser);
      mockRepository.findAndCount.mockResolvedValue([tasks, total]);

      const result = await taskRepository.findByUserId(userId);

      expect(userRepository.findByUserId).toHaveBeenCalledWith(userId);
      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        where: { user_id: mockUser.id },
        skip: 0,
        take: 10,
        order: { created_at: 'ASC' },
      });
      expect(result).toEqual({
        tasks,
        total,
        page: 1,
        totalPages: 1,
      });
    });

    it('should find tasks with custom pagination', async () => {
      const userId = 'test-user-123';
      const page = 2;
      const limit = 5;
      const order = 'DESC';
      const tasks = [mockTask];
      const total = 10;

      userRepository.findByUserId.mockResolvedValue(mockUser);
      mockRepository.findAndCount.mockResolvedValue([tasks, total]);

      const result = await taskRepository.findByUserId(
        userId,
        page,
        limit,
        order,
      );

      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        where: { user_id: mockUser.id },
        skip: 5,
        take: 5,
        order: { created_at: 'DESC' },
      });
      expect(result.page).toBe(2);
      expect(result.totalPages).toBe(2);
    });

    it('should filter tasks by operation', async () => {
      const userId = 'test-user-123';
      const operation = 'add';

      userRepository.findByUserId.mockResolvedValue(mockUser);
      mockRepository.findAndCount.mockResolvedValue([[mockTask], 1]);

      await taskRepository.findByUserId(userId, 1, 10, 'ASC', operation);

      expect(mockRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            user_id: mockUser.id,
            operation: 'add',
          }),
        }),
      );
    });

    it('should filter tasks by date range', async () => {
      const userId = 'test-user-123';
      const startDate = '2024-01-01';
      const endDate = '2024-01-31';

      userRepository.findByUserId.mockResolvedValue(mockUser);
      mockRepository.findAndCount.mockResolvedValue([[mockTask], 1]);

      await taskRepository.findByUserId(
        userId,
        1,
        10,
        'ASC',
        undefined,
        startDate,
        endDate,
      );

      expect(mockRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            user_id: mockUser.id,
            created_at: expect.any(Object),
          }),
        }),
      );
    });

    it('should filter tasks by start date only', async () => {
      const userId = 'test-user-123';
      const startDate = '2024-01-01';

      userRepository.findByUserId.mockResolvedValue(mockUser);
      mockRepository.findAndCount.mockResolvedValue([[mockTask], 1]);

      await taskRepository.findByUserId(
        userId,
        1,
        10,
        'ASC',
        undefined,
        startDate,
      );

      expect(mockRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            user_id: mockUser.id,
            created_at: expect.any(Object),
          }),
        }),
      );
    });

    it('should throw error when user not found', async () => {
      const userId = 'nonexistent-user';
      userRepository.findByUserId.mockResolvedValue(null);
      await expect(taskRepository.findByUserId(userId)).rejects.toThrow(
        'User not found',
      );
      expect(mockRepository.findAndCount).not.toHaveBeenCalled();
    });

    it('should calculate total pages correctly', async () => {
      const userId = 'test-user-123';
      const limit = 3;
      const total = 10;

      userRepository.findByUserId.mockResolvedValue(mockUser);
      mockRepository.findAndCount.mockResolvedValue([[], total]);

      const result = await taskRepository.findByUserId(userId, 1, limit);

      expect(result.totalPages).toBe(4); // Math.ceil(10/3) = 4
    });

    it('should handle order case insensitively', async () => {
      const userId = 'test-user-123';

      userRepository.findByUserId.mockResolvedValue(mockUser);
      mockRepository.findAndCount.mockResolvedValue([[mockTask], 1]);

      await taskRepository.findByUserId(userId, 1, 10, 'desc');

      expect(mockRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          order: { created_at: 'DESC' },
        }),
      );
    });
  });

  describe('findById', () => {
    it('should find task by id', async () => {
      const id = 1;
      mockRepository.findOne.mockResolvedValue(mockTask);

      const result = await taskRepository.findById(id);

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id } });
      expect(result).toEqual(mockTask);
    });

    it('should return null when task not found', async () => {
      const id = 999;
      mockRepository.findOne.mockResolvedValue(null);

      const result = await taskRepository.findById(id);

      expect(result).toBeNull();
    });
  });

  describe('deleteById', () => {
    it('should delete task by id', async () => {
      const id = 1;
      mockRepository.delete.mockResolvedValue({ affected: 1, raw: {} } as any);

      await taskRepository.deleteById(id);

      expect(mockRepository.delete).toHaveBeenCalledWith(id);
    });

    it('should handle deletion of non-existent task', async () => {
      const id = 999;
      mockRepository.delete.mockResolvedValue({ affected: 0, raw: {} } as any);

      await taskRepository.deleteById(id);

      expect(mockRepository.delete).toHaveBeenCalledWith(id);
    });
  });
});

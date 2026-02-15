import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRepository } from './user.repository';
import { User } from './dto/user.dto';

describe('UserRepository', () => {
  let userRepository: UserRepository;
  let mockRepository: jest.Mocked<Repository<User>>;

  const mockUser: User = {
    id: 1,
    email: 'test@example.com',
    password: 'hashedPassword',
    username: 'testuser',
    user_id: 'test-user-123',
    created_at: new Date('2024-01-01'),
  };

  beforeEach(async () => {
    const mockRepo = {
      findOne: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserRepository,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepo,
        },
      ],
    }).compile();

    userRepository = module.get<UserRepository>(UserRepository);
    mockRepository = module.get(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findByEmail', () => {
    it('should find user by email', async () => {
      const email = 'test@example.com';
      mockRepository.findOne.mockResolvedValue(mockUser);

      const result = await userRepository.findByEmail(email);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { email },
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found by email', async () => {
      const email = 'notfound@example.com';
      mockRepository.findOne.mockResolvedValue(null);

      const result = await userRepository.findByEmail(email);

      expect(result).toBeNull();
    });
  });

  describe('save', () => {
    it('should save a new user', async () => {
      const newUser: Partial<User> = {
        email: 'new@example.com',
        password: 'hashedPassword',
        username: 'newuser',
        user_id: 'new-user-456',
      };
      mockRepository.save.mockResolvedValue(mockUser);

      const result = await userRepository.save(newUser);

      expect(mockRepository.save).toHaveBeenCalledWith(newUser);
      expect(result).toEqual(mockUser);
    });

    it('should update existing user', async () => {
      const updateUser: Partial<User> = {
        id: 1,
        email: 'updated@example.com',
      };
      const updatedUser = { ...mockUser, email: 'updated@example.com' };
      mockRepository.save.mockResolvedValue(updatedUser);

      const result = await userRepository.save(updateUser);

      expect(mockRepository.save).toHaveBeenCalledWith(updateUser);
      expect(result.email).toBe('updated@example.com');
    });
  });

  describe('findById', () => {
    it('should find user by id', async () => {
      const id = '1';
      mockRepository.findOne.mockResolvedValue(mockUser);

      const result = await userRepository.findById(id);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id },
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found by id', async () => {
      const id = '999';
      mockRepository.findOne.mockResolvedValue(null);

      const result = await userRepository.findById(id);

      expect(result).toBeNull();
    });
  });

  describe('findByUserId', () => {
    it('should find user by user_id', async () => {
      const userId = 'test-user-123';
      mockRepository.findOne.mockResolvedValue(mockUser);

      const result = await userRepository.findByUserId(userId);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { user_id: userId },
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found by user_id', async () => {
      const userId = 'nonexistent-user';
      mockRepository.findOne.mockResolvedValue(null);

      const result = await userRepository.findByUserId(userId);

      expect(result).toBeNull();
    });
  });
});

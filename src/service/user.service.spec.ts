import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { UserService } from './user.service';
import { UserRepository } from '../repository/user.repository';
import { MailboxService } from '../external/mailbox.service';
import * as passwordUtils from '../../utils/password';
import * as jwtUtils from '../../utils/jwt';

jest.mock('../../utils/password');
jest.mock('../../utils/jwt');
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'test-uuid-1234'),
}));

describe('UserService', () => {
  let service: UserService;
  let userRepository: jest.Mocked<UserRepository>;
  let mailboxService: jest.Mocked<MailboxService>;

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    password: 'hashedPassword123',
    username: 'testuser',
    user_id: 'testuser-test-uuid-1234',
    created_at: new Date(),
  };

  beforeEach(async () => {
    const mockUserRepository = {
      findByEmail: jest.fn(),
      save: jest.fn(),
      findById: jest.fn(),
      findByUserId: jest.fn(),
    };

    const mockMailboxService = {
      validateEmail: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
        {
          provide: MailboxService,
          useValue: mockMailboxService,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get(UserRepository);
    mailboxService = module.get(MailboxService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    const registerDto = {
      email: 'newuser@example.com',
      password: 'password123',
      username: 'newuser',
    };

    it('should successfully register a new user', async () => {
      mailboxService.validateEmail.mockResolvedValue({
        email: registerDto.email,
        format_valid: true,
        mx_found: true,
        disposable: false,
      } as any);
      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.save.mockResolvedValue(mockUser);
      (passwordUtils.hashPassword as jest.Mock).mockResolvedValue(
        'hashedPassword123',
      );
      (jwtUtils.generateToken as jest.Mock).mockReturnValue('test-token-123');

      const result = await service.register(registerDto);

      expect(mailboxService.validateEmail).toHaveBeenCalledWith(
        registerDto.email,
      );
      expect(userRepository.findByEmail).toHaveBeenCalledWith(
        registerDto.email,
      );
      expect(passwordUtils.hashPassword).toHaveBeenCalledWith(
        registerDto.password,
      );
      expect(userRepository.save).toHaveBeenCalledWith({
        email: registerDto.email,
        password: 'hashedPassword123',
        username: registerDto.username,
        user_id: 'newuser-test-uuid-1234',
      });
      expect(result).toEqual({
        message: 'User registered successfully',
        token: 'test-token-123',
        user_id: 'newuser-test-uuid-1234',
      });
    });

    it('should throw error if email validation fails', async () => {
      mailboxService.validateEmail.mockResolvedValue({
        email: registerDto.email,
        format_valid: false,
        mx_found: false,
        disposable: false,
      } as any);
      await expect(service.register(registerDto)).rejects.toThrow(
        HttpException,
      );
      await expect(service.register(registerDto)).rejects.toThrow(
        'Email validation failed',
      );
    });

    it('should throw error if user already exists', async () => {
      mailboxService.validateEmail.mockResolvedValue({
        email: registerDto.email,
        format_valid: true,
        mx_found: true,
        disposable: false,
      } as any);
      userRepository.findByEmail.mockResolvedValue(mockUser);
      await expect(service.register(registerDto)).rejects.toThrow(
        HttpException,
      );
      await expect(service.register(registerDto)).rejects.toThrow(
        'User already registered',
      );
    });
  });

  describe('login', () => {
    const loginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should successfully login with valid credentials', async () => {
      userRepository.findByEmail.mockResolvedValue(mockUser);
      (passwordUtils.comparePasswords as jest.Mock).mockResolvedValue(true);
      (jwtUtils.generateToken as jest.Mock).mockReturnValue('login-token-123');

      const result = await service.login(loginDto);

      expect(userRepository.findByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(passwordUtils.comparePasswords).toHaveBeenCalledWith(
        loginDto.password,
        mockUser.password,
      );
      expect(result).toEqual({
        message: 'Login successful',
        token: 'login-token-123',
        user_id: mockUser.user_id,
      });
    });

    it('should throw error if user not found', async () => {
      userRepository.findByEmail.mockResolvedValue(null);
      await expect(service.login(loginDto)).rejects.toThrow(HttpException);
      await expect(service.login(loginDto)).rejects.toThrow('Email not found');
      const error = await service.login(loginDto).catch((e) => e);
      expect(error.getStatus()).toBe(HttpStatus.NOT_FOUND);
    });

    it('should throw error if password is incorrect', async () => {
      userRepository.findByEmail.mockResolvedValue(mockUser);
      (passwordUtils.comparePasswords as jest.Mock).mockResolvedValue(false);
      await expect(service.login(loginDto)).rejects.toThrow(HttpException);
      await expect(service.login(loginDto)).rejects.toThrow(
        'Incorrect password',
      );
      const error = await service.login(loginDto).catch((e) => e);
      expect(error.getStatus()).toBe(HttpStatus.UNAUTHORIZED);
    });
  });
});

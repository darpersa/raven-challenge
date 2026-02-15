import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UserService } from '../service/user.service';
import { LoginRequestDto, RegisterRequestDto } from '../dto/user.dto';
import { HttpException } from '@nestjs/common';

describe('UsersController', () => {
  let controller: UsersController;
  let userService: jest.Mocked<UserService>;

  beforeEach(async () => {
    const mockUserService = {
      login: jest.fn(),
      register: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    userService = module.get(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should successfully login user', async () => {
      const loginDto: LoginRequestDto = {
        email: 'test@example.com',
        password: 'password123',
      };
      const expectedResponse = {
        message: 'Login successful',
        token: 'jwt-token-123',
        user_id: 'user-123',
      };
      userService.login.mockResolvedValue(expectedResponse);

      const result = await controller.login(loginDto);

      expect(userService.login).toHaveBeenCalledWith(loginDto);
      expect(result).toEqual(expectedResponse);
    });

    it('should throw error for invalid credentials', async () => {
      const loginDto: LoginRequestDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };
      userService.login.mockRejectedValue(
        new HttpException('Incorrect password', 401),
      );
      await expect(controller.login(loginDto)).rejects.toThrow(HttpException);
    });
  });

  describe('register', () => {
    it('should successfully register user', async () => {
      const registerDto: RegisterRequestDto = {
        email: 'newuser@example.com',
        password: 'password123',
        username: 'newuser',
      };
      const expectedResponse = {
        message: 'User registered successfully',
        token: 'jwt-token-123',
        user_id: 'newuser-uuid',
      };
      userService.register.mockResolvedValue(expectedResponse);

      const result = await controller.register(registerDto);

      expect(userService.register).toHaveBeenCalledWith(registerDto);
      expect(result).toEqual(expectedResponse);
    });

    it('should throw error for duplicate user', async () => {
      const registerDto: RegisterRequestDto = {
        email: 'existing@example.com',
        password: 'password123',
        username: 'existing',
      };
      userService.register.mockRejectedValue(
        new HttpException('User already registered', 400),
      );
      await expect(controller.register(registerDto)).rejects.toThrow(
        HttpException,
      );
    });
  });
});

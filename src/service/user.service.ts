import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { LoginRequest, UserRequest } from 'src/models/user.model';
import { v4 as uuidv4 } from 'uuid';
import { generateToken } from 'utils/jwt';
import { comparePasswords, hashPassword } from 'utils/password';
import { User } from 'dto/user.dto';
import { UserRepository } from 'src/repository/user.repository';
import { MailboxService } from 'src/external/mailbox.service';

@Injectable()
export class UserService {
  constructor(
    private userRepository: UserRepository,
    private mailBoxService: MailboxService,
  ) {}

  async register(user: UserRequest) {
    try {
      const isValidEmail = await this.validateEmail(user.email);
      if (!isValidEmail.isValid) {
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'Email validation failed',
            errors: isValidEmail.errors,
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      const foundUser = await this.userRepository.findByEmail(user.email);
      if (foundUser) {
        throw new HttpException(
          'User already registered',
          HttpStatus.BAD_REQUEST,
        );
      }
      const id = uuidv4();
      const hashedPassword = await hashPassword(user.password);
      const newUser: User = {
        email: user.email,
        password: hashedPassword,
        username: user.name,
        user_id: user.name + '-' + id,
      };

      await this.userRepository.save(newUser);

      const token = generateToken(newUser.user_id, newUser.email);
      return { message: 'User registered successfully', token };
    } catch (error) {
      console.error('Error registering user:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to register user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async login(req: LoginRequest) {
    const foundUser = await this.userRepository.findByEmail(req.email);
    if (!foundUser) {
      throw new HttpException('Email not found', HttpStatus.NOT_FOUND);
    }

    const passwordMatch = await comparePasswords(
      req.password,
      foundUser.password,
    );
    if (!passwordMatch) {
      throw new HttpException('Incorrect password', HttpStatus.UNAUTHORIZED);
    }

    return {
      message: 'Login successful',
      token: generateToken(foundUser.user_id, foundUser.email),
    };
  }

  async validateEmail(email: string) {
    const errorArray = [];
    const validate = await this.mailBoxService.validateEmail(email);

    if (!validate.format_valid) {
      errorArray.push('Invalid email format');
    }
    if (!validate.mx_found) {
      errorArray.push('No MX record found for the domain');
    }
    if (validate.disposable) {
      errorArray.push('Disposable email address');
    }

    return {
      isValid: errorArray.length === 0,
      errors: errorArray,
    };
  }
}

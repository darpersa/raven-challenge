import { Injectable } from '@nestjs/common';
import { LoginRequest, UserRequest } from 'src/models/user.model';
import { v4 as uuidv4 } from 'uuid';
import { generateToken } from 'utils/jwt';
import { comparePasswords, hashPassword } from 'utils/password';
import { User } from 'dto/user.dto';
import { UserRepository } from 'src/repository/user.repository';

@Injectable()
export class UserService {
  constructor(private userRepository: UserRepository) {}

  async register(user: UserRequest) {
    try {
      const foundUser = await this.userRepository.findByEmail(user.email);
      if (foundUser) {
        return {
          message: 'Usuario se encuentra registrado con este correo.',
          token: null,
        };
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
      throw new Error('Failed to register user');
    }
  }

  async login(req: LoginRequest) {
    const foundUser = await this.userRepository.findByEmail(req.email);
    if (!foundUser) {
      return {
        message: 'Correo no se encuentra registrado.',
        token: null,
      };
    }

    const passwordMatch = await comparePasswords(
      req.password,
      foundUser.password,
    );
    if (!passwordMatch) {
      return {
        message: 'Contraseña incorrecta.',
        token: null,
      };
    }

    return {
      message: 'Login successful',
      token: generateToken(foundUser.user_id, foundUser.email),
    };
  }
}

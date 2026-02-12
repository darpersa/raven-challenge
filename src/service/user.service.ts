import { Injectable } from '@nestjs/common';
import { UserRequest, UserResponse } from 'src/models/user.model';
import { v4 as uuidv4 } from 'uuid';
import { generateToken } from 'utils/jwt';
import { hashPassword } from 'utils/password';
import { User } from 'dto/user.dto';
import { UserRepository } from 'repository/user.repository';

@Injectable()
export class UserService {
  private users: UserResponse[] = [];
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
      //   const newUser: UserResponse = {
      //     id,
      //     email: user.email,
      //     name: user.name,
      //     password: hashedPassword,
      //     user_id: user.name + '-' + id,
      //     created_at: new Date(),
      //   };
      const newUser: User = {
        email: user.email,
        password: hashedPassword,
        username: user.name,
        user_id: user.name + '-' + id,
      };

      await this.userRepository.save(newUser);
      console.log(newUser);

      const token = generateToken(newUser.user_id, newUser.email);
      return { message: 'User registered successfully', token };
    } catch (error) {
      console.error('Error registering user:', error);
      throw new Error('Failed to register user');
    }
  }
}

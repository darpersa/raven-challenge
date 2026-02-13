import { Body, Controller, Post } from '@nestjs/common';
import { LoginRequest, UserRequest } from 'src/models/user.model';
import { UserService } from 'src/service/user.service';

@Controller('auth')
export class UsersController {
  constructor(private userService: UserService) {}

  @Post('login')
  async login(@Body() request: LoginRequest) {
    return await this.userService.login(request);
  }

  @Post('register')
  async register(@Body() request: UserRequest) {
    return await this.userService.register(request);
  }
}

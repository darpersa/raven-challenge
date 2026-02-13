import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { LoginRequest, UserRequest } from 'src/models/user.model';
import { UserService } from 'src/service/user.service';

@Controller('auth')
export class UsersController {
  constructor(private userService: UserService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() request: LoginRequest) {
    return await this.userService.login(request);
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() request: UserRequest) {
    return await this.userService.register(request);
  }
}

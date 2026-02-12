import { Body, Controller, Get, Post } from '@nestjs/common';
import { UserRequest } from 'src/models/user.model';
import { UserService } from 'src/service/user.service';

@Controller('auth')
export class UsersController {
  constructor(private userService: UserService) {}
  @Get('login')
  login() {
    return 'Login endpoint';
  }

  @Post('register')
  async register(@Body() request: UserRequest) {
    return await this.userService.register(request);
  }
}

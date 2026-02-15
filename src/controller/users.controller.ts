import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { LoginRequestDto, RegisterRequestDto } from 'src/dto/user.dto';
import { UserService } from 'src/service/user.service';

@ApiTags('Raven')
@Controller('auth')
export class UsersController {
  constructor(private userService: UserService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login de usuario' })
  async login(@Body() request: LoginRequestDto) {
    return await this.userService.login(request);
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registro de usuario' })
  async register(@Body() request: RegisterRequestDto) {
    return await this.userService.register(request);
  }
}
